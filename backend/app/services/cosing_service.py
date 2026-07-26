"""
CosIng 欧盟官方化妆品成分数据库查询服务

通过 CosIng 官方 Web 搜索接口查询成分数据。
每次查询按需进行，结果缓存到本地避免重复请求。

CosIng 数据字段：
- INCI 名称
- CAS 编号
- EC 编号
- 功能分类（Function）
- 监管状态（Active/Not active）
- 监管限制（Restriction）
- 最大浓度（Max Concentration）
"""

import logging
import re
import sqlite3
import time
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Tuple
from urllib.parse import quote_plus

import requests

logger = logging.getLogger(__name__)

# CosIng API 端点（基于 Angular 前端的 POST 搜索）
COSING_SEARCH_URL = "https://ec.europa.eu/growth/tools-databases/cosing/api/search"
COSING_DETAIL_URL = "https://ec.europa.eu/growth/tools-databases/cosing/api/substance/"

# 请求间隔（秒），避免被封
REQUEST_INTERVAL = 1.0

# 本地缓存数据库路径
CACHE_DIR = Path(__file__).parent.parent.parent / "data"
CACHE_DB = CACHE_DIR / "cosing_cache.db"


class CosIngClient:
    """CosIng 数据库查询客户端"""

    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            "User-Agent": "IngredientLens/1.0 (cosmetic ingredient analysis; contact@ingredientlens.com)",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
        })
        self._last_request = 0
        self._init_cache()

    def _init_cache(self):
        """初始化本地缓存数据库"""
        CACHE_DIR.mkdir(parents=True, exist_ok=True)
        conn = sqlite3.connect(str(CACHE_DB))
        conn.execute("""
            CREATE TABLE IF NOT EXISTS cosing_cache (
                inci_name TEXT PRIMARY KEY,
                json_data TEXT,
                function_category TEXT,
                regulatory_status TEXT,
                cas_number TEXT,
                ec_number TEXT,
                restriction TEXT,
                max_concentration TEXT,
                cached_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS cosing_functions (
                inci_name TEXT,
                function TEXT,
                PRIMARY KEY (inci_name, function)
            )
        """)
        conn.commit()
        conn.close()

    def _rate_limit(self):
        """速率限制"""
        elapsed = time.time() - self._last_request
        if elapsed < REQUEST_INTERVAL:
            time.sleep(REQUEST_INTERVAL - elapsed)
        self._last_request = time.time()

    def search(self, inci_name: str) -> Optional[Dict]:
        """搜索 CosIng 数据库

        先查本地缓存，未命中则请求 CosIng 官网。
        返回成分的完整信息字典。
        """
        # 先查缓存
        cached = self._get_from_cache(inci_name)
        if cached:
            logger.info(f"CosIng 缓存命中: {inci_name}")
            return cached

        # 请求 CosIng 官网
        logger.info(f"查询 CosIng: {inci_name}")
        try:
            result = self._search_web(inci_name)
            if result:
                self._save_to_cache(inci_name, result)
            return result
        except Exception as e:
            logger.error(f"CosIng 查询失败 {inci_name}: {e}")
            return None

    def batch_search(self, inci_names: List[str]) -> Dict[str, Optional[Dict]]:
        """批量查询多个成分"""
        results = {}
        for name in inci_names:
            results[name] = self.search(name)
        return results

    def _search_web(self, inci_name: str) -> Optional[Dict]:
        """通过 Web 表单搜索 CosIng"""
        self._rate_limit()

        # CosIng 使用 POST 表单搜索
        form_data = {
            "INCI": inci_name,
            "status": "All",
            "type": "Ingredient",
        }

        resp = self.session.post(
            COSING_SEARCH_URL,
            data=form_data,
            timeout=15,
        )

        if resp.status_code != 200:
            logger.warning(f"CosIng 返回状态码 {resp.status_code}")
            return None

        # 解析 HTML 结果
        return self._parse_search_results(resp.text, inci_name)

    def _parse_search_results(self, html: str, query: str) -> Optional[Dict]:
        """从 HTML 中解析搜索结果

        CosIng 返回的 HTML 是 Angular 渲染的表格。
        尝试匹配已知的数据模式。
        """
        result = {
            "inci_name": query,
            "cas_number": None,
            "ec_number": None,
            "function": [],
            "regulatory_status": None,
            "restriction": None,
            "max_concentration": None,
            "source": "CosIng EU",
            "confidence": "official",
        }

        # 尝试从 HTML 中提取 CAS 号
        # 模式: 包含 CAS: 或类似模式的行
        cas_match = re.search(r'(?:CAS|CAS\s+#|CAS Number)[:\s]+(\d+-\d+-\d+)', html, re.IGNORECASE)
        if cas_match:
            result["cas_number"] = cas_match.group(1)

        # 提取 EC 号
        ec_match = re.search(r'(?:EC|EINECS|ELINCS)\s+#?[:\s]+(\d{3}-\d{3}-\d)', html, re.IGNORECASE)
        if ec_match:
            result["ec_number"] = ec_match.group(1)

        # 提取功能分类
        functions = re.findall(r'(?:(?:Function|功能)[:\s]+|>)([A-Z\-\s]{3,50})(?:<|,|;)', html)
        result["function"] = [f.strip() for f in functions if f.strip() and len(f.strip()) > 3][:5]

        # 提取监管状态
        status_match = re.search(r'(?:Status|状态)[:\s]+([A-Za-z\s]+?)(?:<|,|;)', html)
        if status_match:
            result["regulatory_status"] = status_match.group(1).strip()

        # 如果没有找到任何数据（但搜索了），返回 minimal 结果
        if not any([result["cas_number"], result["function"], result["regulatory_status"]]):
            # 页面可能包含 "No results" 提示 —— 搜索到了但没有详细数据
            if "no result" in html.lower() or "0 result" in html.lower():
                logger.info(f"CosIng 未找到: {query}")
                return None

        logger.info(f"CosIng 解析结果: {query} -> {result.get('function', [])}")
        return result

    def _get_from_cache(self, inci_name: str) -> Optional[Dict]:
        """从本地缓存读取"""
        try:
            conn = sqlite3.connect(str(CACHE_DB))
            cursor = conn.execute(
                "SELECT json_data FROM cosing_cache WHERE inci_name = ?",
                (inci_name.lower(),)
            )
            row = cursor.fetchone()
            conn.close()
            if row and row[0]:
                import json
                return json.loads(row[0])
        except Exception as e:
            logger.warning(f"读取缓存失败: {e}")
        return None

    def _save_to_cache(self, inci_name: str, data: Dict):
        """保存到本地缓存"""
        try:
            import json
            conn = sqlite3.connect(str(CACHE_DB))
            conn.execute("""
                INSERT OR REPLACE INTO cosing_cache
                (inci_name, json_data, function_category, regulatory_status,
                 cas_number, ec_number, cached_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                inci_name.lower(),
                json.dumps(data, ensure_ascii=False),
                ",".join(data.get("function", [])),
                data.get("regulatory_status"),
                data.get("cas_number"),
                data.get("ec_number"),
                datetime.now().isoformat(),
            ))
            # 写入功能分类
            for func in data.get("function", []):
                conn.execute(
                    "INSERT OR IGNORE INTO cosing_functions (inci_name, function) VALUES (?, ?)",
                    (inci_name.lower(), func)
                )
            conn.commit()
            conn.close()
        except Exception as e:
            logger.warning(f"写入缓存失败: {e}")


# 单例
_client: Optional[CosIngClient] = None


def get_client() -> CosIngClient:
    """获取 CosIng 客户端单例"""
    global _client
    if _client is None:
        _client = CosIngClient()
    return _client


def lookup_ingredient(inci_name: str) -> Optional[Dict]:
    """查询单个成分的 CosIng 数据（对外接口）"""
    return get_client().search(inci_name)


def enhance_analysis_with_cosing(analysis: Dict) -> Dict:
    """用 CosIng 数据增强分析结果

    在已有的 AI 分析结果上叠加 CosIng 的官方数据。
    """
    client = get_client()

    for ingredient in analysis.get("ingredients", []):
        name = ingredient.get("name", "")
        if not name:
            continue

        cosing_data = client.search(name)
        if cosing_data:
            # 叠加 CosIng 功能分类
            if cosing_data.get("function") and not ingredient.get("function"):
                ingredient["function"] = "; ".join(cosing_data["function"])

            # 标注欧盟监管状态
            ingredient["eu_status"] = cosing_data.get("regulatory_status", "unknown")
            ingredient["cas_number"] = cosing_data.get("cas_number")
            ingredient["data_source"] = "EU CosIng + AI"

    return analysis


def get_cache_stats() -> Dict:
    """获取缓存统计"""
    try:
        conn = sqlite3.connect(str(CACHE_DB))
        count = conn.execute("SELECT COUNT(*) FROM cosing_cache").fetchone()[0]
        conn.close()
        return {"cached_ingredients": count, "cache_db": str(CACHE_DB)}
    except Exception:
        return {"cached_ingredients": 0}
