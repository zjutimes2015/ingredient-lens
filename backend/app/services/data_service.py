"""
数据服务层
提供产品搜索、成分查询等功能，集成 INCI 标准化和 OpenBeautyFacts 数据。

所有方法保持向后兼容。
"""

import json
import logging
import os
import sqlite3
from typing import Any, Optional

from .ingredient_normalizer import normalize_inci, lookup_alias, fuzzy_match
from .openbeautyfacts_importer import (
    DB_PATH as OBF_DB_PATH,
    fetch_product_from_api,
    init_db,
)
from .cosing_service import lookup_ingredient, enhance_analysis_with_cosing, get_cache_stats as cosing_stats

logger = logging.getLogger(__name__)

# 默认数据库路径
DEFAULT_DB_PATH = OBF_DB_PATH


# =============================================================================
# 数据库连接管理
# =============================================================================
def get_connection(db_path: Optional[str] = None) -> sqlite3.Connection:
    """
    获取数据库连接。

    Args:
        db_path: 数据库文件路径，默认为 data/openbeautyfacts.db

    Returns:
        sqlite3.Connection 对象
    """
    path = db_path or DEFAULT_DB_PATH
    os.makedirs(os.path.dirname(path), exist_ok=True)
    conn = sqlite3.connect(path)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    # 确保表存在
    _ensure_tables(conn)
    return conn


def _ensure_tables(conn: sqlite3.Connection) -> None:
    """确保所有必要表存在"""
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS product_cache (
            barcode TEXT PRIMARY KEY,
            product_name TEXT,
            brand TEXT,
            category TEXT,
            ingredients_text TEXT,
            image_url TEXT,
            raw_json TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS ingredients (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            inci_name TEXT UNIQUE NOT NULL,
            chinese_name TEXT,
            function_category TEXT,
            safety_score INTEGER,
            description TEXT,
            source TEXT DEFAULT 'openbeautyfacts',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS product_ingredients (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            barcode TEXT NOT NULL,
            inci_name TEXT NOT NULL,
            position INTEGER,
            FOREIGN KEY (barcode) REFERENCES product_cache(barcode),
            FOREIGN KEY (inci_name) REFERENCES ingredients(inci_name),
            UNIQUE(barcode, inci_name, position)
        );
    """)
    conn.commit()


# =============================================================================
# 产品搜索
# =============================================================================
def search_product_by_name(name: str, db_path: Optional[str] = None) -> Optional[dict[str, Any]]:
    """
    按产品名称搜索缓存的产品。
    先在本地 product_cache 表中搜索（模糊匹配），
    未命中则返回 None（上层可决定是否调用 API 回退）。

    Args:
        name: 产品名称
        db_path: 数据库路径

    Returns:
        产品信息 dict 或 None（未找到）
    """
    conn = get_connection(db_path)
    cursor = conn.cursor()

    # 精确匹配
    cursor.execute(
        "SELECT * FROM product_cache WHERE product_name = ? LIMIT 1",
        (name,)
    )
    row = cursor.fetchone()
    if row:
        result = dict(row)
        conn.close()
        return result

    # 模糊匹配（LIKE）
    cursor.execute(
        "SELECT * FROM product_cache WHERE product_name LIKE ? LIMIT 5",
        (f"%{name}%",)
    )
    rows = cursor.fetchall()
    conn.close()

    if not rows:
        return None

    # 返回最匹配的（Levenshtein 简单实现）
    def _levenshtein(a: str, b: str) -> int:
        """计算编辑距离"""
        if len(a) < len(b):
            a, b = b, a
        if not b:
            return len(a)
        prev = list(range(len(b) + 1))
        for i, ca in enumerate(a):
            curr = [i + 1]
            for j, cb in enumerate(b):
                cost = 0 if ca == cb else 1
                curr.append(min(curr[j] + 1, prev[j + 1] + 1, prev[j] + cost))
            prev = curr
        return prev[-1]

    best = min(rows, key=lambda r: _levenshtein(name.lower(), r["product_name"].lower() if r["product_name"] else ""))
    return dict(best)


def search_product_by_barcode(barcode: str, db_path: Optional[str] = None) -> Optional[dict[str, Any]]:
    """
    按条码搜索产品。先在本地搜，未命中调用 OpenBeautyFacts API 回退。

    Args:
        barcode: 产品条码
        db_path: 数据库路径

    Returns:
        产品信息 dict 或 None
    """
    conn = get_connection(db_path)
    cursor = conn.cursor()

    # 本地搜索
    cursor.execute("SELECT * FROM product_cache WHERE barcode = ?", (barcode,))
    row = cursor.fetchone()
    conn.close()

    if row:
        return dict(row)

    # API 回退
    logger.info("本地未找到条码 %s，调用 OpenBeautyFacts API...", barcode)
    product = fetch_product_from_api(barcode)
    if product:
        # 缓存到本地
        conn = get_connection(db_path)
        conn.execute("""
            INSERT OR REPLACE INTO product_cache
                (barcode, product_name, brand, category, ingredients_text, image_url, raw_json)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            barcode,
            product.get("product_name", "")[:500],
            product.get("brands", "")[:200],
            product.get("categories", "")[:500],
            product.get("ingredients_text", "") or "",
            product.get("image_url", "") or "",
            json.dumps(product, ensure_ascii=False)
        ))
        conn.commit()
        conn.close()

        return {
            "barcode": barcode,
            "product_name": product.get("product_name"),
            "brand": product.get("brands"),
            "category": product.get("categories"),
            "ingredients_text": product.get("ingredients_text", "") or product.get("ingredients_text_en", ""),
            "image_url": product.get("image_url"),
        }

    return None


# =============================================================================
# 成分查询
# =============================================================================
def lookup_ingredient(name: str, db_path: Optional[str] = None) -> Optional[dict[str, Any]]:
    """
    查询成分信息。先在本地 ingredients 表搜索，未命中返回 None。

    搜索策略：
      1. 精确匹配 inci_name
      2. 别名映射（通过 ingredient_normalizer）
      3. 模糊匹配

    Args:
        name: 成分名称（支持别名/中文名）
        db_path: 数据库路径

    Returns:
        成分信息 dict 或 None
    """
    conn = get_connection(db_path)
    cursor = conn.cursor()

    # 1. 精确匹配
    cursor.execute("SELECT * FROM ingredients WHERE inci_name = ?", (name,))
    row = cursor.fetchone()
    if row:
        conn.close()
        return dict(row)

    # 2. 别名映射到标准名
    standard = lookup_alias(name)
    if standard:
        cursor.execute("SELECT * FROM ingredients WHERE inci_name = ?", (standard,))
        row = cursor.fetchone()
        if row:
            conn.close()
            return dict(row)

    # 3. LIKE 模糊匹配
    cursor.execute(
        "SELECT * FROM ingredients WHERE inci_name LIKE ? LIMIT 1",
        (f"%{name}%",)
    )
    row = cursor.fetchone()
    conn.close()
    if row:
        return dict(row)

    return None


# =============================================================================
# 成分标准化（给外部调用的便捷方法）
# =============================================================================
def standardize_ingredient_list(raw_text: str) -> list[str]:
    """
    对原始成分文本进行 INCI 标准化。直接调用 ingredient_normalizer。

    Args:
        raw_text: OCR 或其他来源的原始成分文本

    Returns:
        标准化后的 INCI 名称列表
    """
    normalized, _ = normalize_inci(raw_text)
    return normalized


def search_ingredients_by_category(category: str, db_path: Optional[str] = None) -> list[dict[str, Any]]:
    """
    按功能分类查询成分列表。

    Args:
        category: 功能分类名称（如 "Humectant", "Preservative"）
        db_path: 数据库路径

    Returns:
        成分信息列表
    """
    conn = get_connection(db_path)
    cursor = conn.cursor()

    cursor.execute(
        "SELECT * FROM ingredients WHERE function_category LIKE ? ORDER BY inci_name",
        (f"%{category}%",)
    )
    rows = cursor.fetchall()
    conn.close()

    return [dict(row) for row in rows]


def get_stats(db_path: Optional[str] = None) -> dict[str, int]:
    """
    获取数据统计信息。

    Args:
        db_path: 数据库路径

    Returns:
        各表记录数
    """
    conn = get_connection(db_path)
    cursor = conn.cursor()

    product_count = cursor.execute("SELECT COUNT(*) FROM product_cache").fetchone()[0]
    ingredient_count = cursor.execute("SELECT COUNT(*) FROM ingredients").fetchone()[0]
    relation_count = cursor.execute("SELECT COUNT(*) FROM product_ingredients").fetchone()[0]

    conn.close()
    return {
        "products": product_count,
        "ingredients": ingredient_count,
        "relations": relation_count,
    }
