"""
OpenBeautyFacts 数据导入服务
从 OpenBeautyFacts JSONL dump 下载并解析产品数据，
提取成分列表并写入本地数据库。

数据来源：
  - API: https://world.openbeautyfacts.org/api/v2/product/{barcode}.json
  - Dump: https://static.openbeautyfacts.org/data/openbeautyfacts-products.jsonl.gz
"""

import gzip
import json
import logging
import os
import sqlite3
import urllib.request
from pathlib import Path
from typing import Any, Generator, Optional

# 配置日志
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

# =============================================================================
# 常量
# =============================================================================
DUMP_URL = "https://static.openbeautyfacts.org/data/openbeautyfacts-products.jsonl.gz"
API_BASE_URL = "https://world.openbeautyfacts.org/api/v2/product"

# 默认数据文件存放路径（相对于脚本所在项目根目录）
DEFAULT_DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")

# SQLite 数据库路径（与 data_service.py 共享）
DB_PATH = os.path.join(DEFAULT_DATA_DIR, "openbeautyfacts.db")


# =============================================================================
# 数据库初始化
# =============================================================================
def init_db(db_path: Optional[str] = None) -> sqlite3.Connection:
    """
    初始化本地 SQLite 数据库，创建必要的表。

    Args:
        db_path: 数据库文件路径，默认为 data/openbeautyfacts.db

    Returns:
        sqlite3.Connection 对象
    """
    conn = sqlite3.connect(db_path or DB_PATH)
    conn.execute("PRAGMA journal_mode=WAL")
    cursor = conn.cursor()

    # 产品缓存表
    cursor.execute("""
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
        )
    """)

    # 成分表
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS ingredients (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            inci_name TEXT UNIQUE NOT NULL,
            chinese_name TEXT,
            function_category TEXT,
            safety_score INTEGER,
            description TEXT,
            source TEXT DEFAULT 'openbeautyfacts',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # 产品-成分关联表
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS product_ingredients (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            barcode TEXT NOT NULL,
            inci_name TEXT NOT NULL,
            position INTEGER,
            FOREIGN KEY (barcode) REFERENCES product_cache(barcode),
            FOREIGN KEY (inci_name) REFERENCES ingredients(inci_name),
            UNIQUE(barcode, inci_name, position)
        )
    """)

    # 索引
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_product_ingredients_barcode ON product_ingredients(barcode)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_product_ingredients_inci ON product_ingredients(inci_name)")

    conn.commit()
    logger.info("数据库初始化完成: %s", db_path or DB_PATH)
    return conn


# =============================================================================
# 下载功能
# =============================================================================
def download_dump(target_path: Optional[str] = None) -> str:
    """
    从 OpenBeautyFacts 下载 JSONL 压缩包到本地。

    Args:
        target_path: 保存路径，默认为 data/openbeautyfacts-products.jsonl.gz

    Returns:
        保存的文件路径
    """
    if target_path is None:
        os.makedirs(DEFAULT_DATA_DIR, exist_ok=True)
        target_path = os.path.join(DEFAULT_DATA_DIR, "openbeautyfacts-products.jsonl.gz")

    logger.info("开始下载: %s", DUMP_URL)
    logger.info("保存到: %s", target_path)

    # 使用 urllib 下载（支持进度显示）
    def _reporthook(block_num: int, block_size: int, total_size: int) -> None:
        downloaded = block_num * block_size / 1024 / 1024
        if total_size > 0:
            total_mb = total_size / 1024 / 1024
            percent = min(100, downloaded / total_mb * 100)
            logger.info("下载进度: %.1f / %.1f MB (%.1f%%)", downloaded, total_mb, percent)
        else:
            logger.info("已下载: %.1f MB", downloaded)

    urllib.request.urlretrieve(DUMP_URL, target_path, reporthook=_reporthook)  # type: ignore

    file_size = os.path.getsize(target_path) / 1024 / 1024
    logger.info("下载完成: %.1f MB", file_size)
    return target_path


def download_sample(sample_path: Optional[str] = None, lines: int = 100) -> str:
    """
    下载一个小的样本文件用于测试（仅下载前 N 行解压后的数据）。

    注意：由于 gzip 格式的特性，我们下载完整文件再提取前 N 行可能较慢。
    这里直接尝试从 HTTP 流式读取前 N 行。

    Args:
        sample_path: 保存路径
        lines: 提取的行数，默认 100

    Returns:
        样本文件路径
    """
    import io

    if sample_path is None:
        os.makedirs(DEFAULT_DATA_DIR, exist_ok=True)
        sample_path = os.path.join(DEFAULT_DATA_DIR, "openbeautyfacts-sample.jsonl")

    logger.info("从 %s 流式读取前 %d 行作为样本...", DUMP_URL, lines)

    response = urllib.request.urlopen(DUMP_URL)
    gz_file = gzip.GzipFile(fileobj=io.BytesIO(response.read()))

    count = 0
    with open(sample_path, "w", encoding="utf-8") as f:
        for line in gz_file:
            if count >= lines:
                break
            f.write(line.decode("utf-8", errors="replace"))
            count += 1

    logger.info("样本文件已保存: %s (%d 行)", sample_path, count)
    return sample_path


# =============================================================================
# 解析功能
# =============================================================================
def parse_products(file_path: str) -> Generator[dict[str, Any], None, None]:
    """
    逐行解析 JSONL 文件，yield 每个产品数据。

    Args:
        file_path: JSONL 文件路径（可以是 .jsonl 或 .jsonl.gz）

    Yields:
        每个产品的 dict（已过滤无效行）
    """
    path = Path(file_path)

    # 判断是否需要解压
    open_func = gzip.open if path.suffix == ".gz" else open

    with open_func(file_path, "rt", encoding="utf-8", errors="replace") as f:
        for line_num, line in enumerate(f, 1):
            line = line.strip()
            if not line:
                continue
            try:
                product = json.loads(line)
                if product and isinstance(product, dict):
                    yield product
            except json.JSONDecodeError:
                logger.warning("第 %d 行 JSON 解析失败，已跳过", line_num)
                continue


def extract_ingredients(product: dict[str, Any]) -> list[str]:
    """
    从产品数据中提取成分列表。

    从产品 dict 中查找以下字段（按优先级）：
      1. ingredients_tags: 标准化标签（如 "en:glycerin"）
      2. ingredients_text: 原始成分文本（用逗号分割）
      3. ingredients 数组中的每个成分名

    Args:
        product: 单条产品数据

    Returns:
        成分名称列表
    """
    ingredients: list[str] = []

    # 优先级 1: ingredients_tags（最标准化）
    tags = product.get("ingredients_tags", []) or product.get("ingredients_tags", [])
    if tags:
        for tag in tags:
            # 格式如 "en:glycerin"，提取冒号后的部分
            if ":" in tag:
                name = tag.split(":", 1)[1]
            else:
                name = tag
            if name:
                ingredients.append(name.replace("-", " ").title().strip())
        return ingredients

    # 优先级 2: ingredients_text（原始文本）
    text = product.get("ingredients_text", "") or product.get("ingredients_text_en", "")
    if text:
        # 按逗号分割，简单清理
        raw = text.replace("%", "").strip()
        parts = [p.strip() for p in raw.split(",") if p.strip()]
        if len(parts) > 1:
            return parts

    # 优先级 3: ingredients 数组
    raw_ingredients = product.get("ingredients", [])
    if raw_ingredients and isinstance(raw_ingredients, list):
        for ing in raw_ingredients:
            name = ing.get("text", "") or ing.get("id", "")
            if name:
                ingredients.append(name.strip())

    return ingredients


# =============================================================================
# 导入功能
# =============================================================================
def import_to_db(products: list[dict[str, Any]], db_path: Optional[str] = None) -> int:
    """
    将产品列表写入数据库。

    写入两个表：
      - product_cache: 产品基本信息
      - ingredients: 提取的成分
      - product_ingredients: 产品-成分关联

    Args:
        products: 产品数据列表
        db_path: 数据库路径

    Returns:
        导入的产品数量
    """
    conn = init_db(db_path)
    cursor = conn.cursor()

    imported_count = 0
    skipped_count = 0

    for product in products:
        barcode = str(product.get("code", ""))
        if not barcode:
            skipped_count += 1
            continue

        product_name = product.get("product_name", "")
        brand = product.get("brands", "")
        category = product.get("categories", "")

        # 优先取英文成分文本
        ingredients_text = (product.get("ingredients_text", "")
                            or product.get("ingredients_text_en", "")
                            or "")
        image_url = product.get("image_url", "") or product.get("image_small_url", "")

        # 插入 product_cache（UPSERT）
        cursor.execute("""
            INSERT INTO product_cache (barcode, product_name, brand, category, ingredients_text, image_url, raw_json)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(barcode) DO UPDATE SET
                product_name=excluded.product_name,
                brand=excluded.brand,
                category=excluded.category,
                ingredients_text=excluded.ingredients_text,
                image_url=excluded.image_url,
                raw_json=excluded.raw_json,
                updated_at=CURRENT_TIMESTAMP
        """, (
            barcode,
            product_name[:500] if product_name else None,
            brand[:200] if brand else None,
            category[:500] if category else None,
            ingredients_text,
            image_url,
            json.dumps(product, ensure_ascii=False)
        ))

        # 提取成分
        ingredient_list = extract_ingredients(product)
        for pos, ing_name in enumerate(ingredient_list):
            if not ing_name or not ing_name.strip():
                continue
            clean_name = ing_name.strip()[:200]

            # 插入 ingredients（UPSERT on inci_name）
            cursor.execute("""
                INSERT INTO ingredients (inci_name, source)
                VALUES (?, 'openbeautyfacts')
                ON CONFLICT(inci_name) DO NOTHING
            """, (clean_name,))

            # 插入 product_ingredients
            cursor.execute("""
                INSERT INTO product_ingredients (barcode, inci_name, position)
                VALUES (?, ?, ?)
                ON CONFLICT(barcode, inci_name, position) DO NOTHING
            """, (barcode, clean_name, pos))

        imported_count += 1

        if imported_count % 100 == 0:
            conn.commit()
            logger.info("已导入 %d 个产品...", imported_count)

    conn.commit()
    conn.close()
    logger.info("导入完成: 成功 %d 个, 跳过 %d 个", imported_count, skipped_count)
    return imported_count


# =============================================================================
# API 查询
# =============================================================================
def fetch_product_from_api(barcode: str) -> Optional[dict[str, Any]]:
    """
    通过 OpenBeautyFacts API 查询单个产品。

    Args:
        barcode: 产品的条形码

    Returns:
        产品数据 dict，未找到返回 None
    """
    url = f"{API_BASE_URL}/{barcode}.json"
    try:
        with urllib.request.urlopen(url, timeout=10) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            if data.get("status") == 1:
                return data.get("product")
            return None
    except (urllib.error.HTTPError, urllib.error.URLError, json.JSONDecodeError) as e:
        logger.warning("API 查询失败 (barcode=%s): %s", barcode, e)
        return None


# =============================================================================
# 工具函数
# =============================================================================
def get_stats(db_path: Optional[str] = None) -> dict[str, int]:
    """
    获取数据库统计信息。

    Args:
        db_path: 数据库路径

    Returns:
        包含产品数、成分数、关联数的 dict
    """
    conn = init_db(db_path)
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
