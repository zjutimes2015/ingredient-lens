"""
INCI 名称标准化服务
将 OCR 结果中的原始成分文本转换为标准化的 INCI 名称列表。
支持多语言别名映射、括号内容去除、百分比过滤、重复去除等。
"""

import re
from typing import List, Tuple

# =============================================================================
# INCI 别名映射表（至少 30 组常见成分的别名）
# =============================================================================
INCI_ALIASES: dict[str, list[str]] = {
    # 保湿剂 / Humectants
    "Water": ["Aqua", "Eau", "水", "纯净水", "去离子水", "蒸馏水", "H2O", "Purified Water", "Deionized Water"],
    "Glycerin": ["甘油", "Glycerol", "丙三醇", "Glycerine", "Glycerinum"],
    "Sodium Hyaluronate": ["透明质酸钠", "Sodium Hyaluronate Crosspolymer"],
    "Hyaluronic Acid": ["透明质酸", "玻尿酸", "Hyaluronan", "HA"],
    "Butylene Glycol": ["丁二醇", "BG", "1,3-Butylene Glycol"],
    "Propylene Glycol": ["丙二醇", "PG", "1,2-Propylene Glycol"],
    "Panthenol": ["泛醇", "维生素B5", "Vitamin B5", "Pro-Vitamin B5", "D-Panthenol"],
    "Snail Secretion Filtrate": ["蜗牛分泌滤液", "蜗牛黏液", "Snail Mucin", "Snail Extract"],
    "Betaine": ["甜菜碱", "三甲基甘氨酸", "Trimethylglycine"],

    # 活性成分 / Active Ingredients
    "Niacinamide": ["烟酰胺", "Nicotinamide", "Vitamin B3", "维生素B3", "Nicotinic Acid Amide"],
    "Ascorbic Acid": ["抗坏血酸", "维生素C", "Vitamin C", "L-Ascorbic Acid"],
    "Ascorbyl Glucoside": ["抗坏血酸葡萄糖苷", "AA-2G"],
    "Tocopherol": ["生育酚", "维生素E", "Vitamin E", "Alpha-Tocopherol"],
    "Tocopheryl Acetate": ["生育酚乙酸酯", "维生素E乙酸酯", "Tocopherol Acetate"],
    "Retinol": ["视黄醇", "维生素A", "Vitamin A", "Retinoid", "Retinyl Alcohol"],
    "Retinyl Palmitate": ["视黄醇棕榈酸酯", "维生素A棕榈酸酯", "Vitamin A Palmitate"],
    "Coenzyme Q10": ["辅酶Q10", "Ubiquinone", "泛醌"],

    # 舒缓成分 / Soothing
    "Allantoin": ["尿囊素", "Allantoine"],
    "Aloe Barbadensis Leaf Juice": ["库拉索芦荟叶汁", "芦荟", "Aloe Vera", "Aloe Vera Gel"],
    "Centella Asiatica Extract": ["积雪草提取物", "雷公根", "Gotu Kola", "CICA"],
    "Madecassoside": ["积雪草苷", "羟基积雪草苷"],
    "Bisabolol": ["红没药醇", "α-Bisabolol", "Alpha-Bisabolol", "Chamomillol"],

    # 防腐剂 / Preservatives
    "Phenoxyethanol": ["苯氧乙醇", "Phenoxyethanolum"],
    "Ethylhexylglycerin": ["乙基己基甘油", "Ethylhexyl Glycerin"],
    "Sodium Benzoate": ["苯甲酸钠", "Benzoic Acid Sodium Salt"],
    "Potassium Sorbate": ["山梨酸钾", "Sorbic Acid Potassium Salt"],

    # 乳化剂 / Emulsifiers & 表面活性剂 / Surfactants
    "Cetearyl Alcohol": ["鲸蜡硬脂醇", "Cetearyl Alcoholum"],
    "Ceteareth-20": ["鲸蜡硬脂醇聚醚-20"],
    "Sodium Lauryl Sulfate": ["月桂醇硫酸酯钠", "SLS"],
    "Sodium Laureth Sulfate": ["月桂醇聚醚硫酸酯钠", "SLES"],
    "Cocamidopropyl Betaine": ["椰油酰胺丙基甜菜碱", "CAPB"],

    # 油脂 / Oils & Butters
    "Shea Butter": ["乳木果油", "牛油果树果脂", "Butyrospermum Parkii Butter"],
    "Coconut Oil": ["椰子油", "Cocos Nucifera Oil"],
    "Jojoba Oil": ["荷荷巴油", "Simmondsia Chinensis Oil"],
    "Argan Oil": ["摩洛哥坚果油", "Argania Spinosa Kernel Oil", "刺阿干树仁油"],
    "Squalane": ["角鲨烷", "Squalene（氢化产物）", "Phytosqualane"],

    # 增稠剂 / Thickeners
    "Carbomer": ["卡波姆", "卡波姆940", "Carbopol"],
    "Xanthan Gum": ["黄原胶", "Xanthan", "Xanthan Gum Powder"],

    # 防晒剂 / Sunscreens
    "Zinc Oxide": ["氧化锌", "ZnO"],
    "Titanium Dioxide": ["二氧化钛", "TiO2"],
    "Avobenzone": ["阿伏苯宗", "Butyl Methoxydibenzoylmethane"],
    "Octinoxate": ["甲氧基肉桂酸辛酯", "Ethylhexyl Methoxycinnamate"],
    "Oxybenzone": ["氧苯酮", "Benzophenone-3", "BP-3"],

    # 香精 / Fragrance
    "Fragrance": ["香精", "Parfum", "Aroma", "香味", "Essence", "Flavor"],

    # 其他
    "Dimethicone": ["聚二甲基硅氧烷", "硅灵", "二甲基硅油"],
    "Cyclopentasiloxane": ["环五聚二甲基硅氧烷", "环硅氧烷"],
    "Silica": ["二氧化硅", "硅石", "Silicium Dioxide"],
    "Talc": ["滑石", "滑石粉"],
    "Citric Acid": ["柠檬酸", "Citrate"],
    "Ethanol": ["乙醇", "酒精", "Alcohol Denat.", "变性乙醇", "Alcohol Denatured"],
    "Benzyl Alcohol": ["苯甲醇", "苄醇"],
    "Salicylic Acid": ["水杨酸", "BHA", "Beta Hydroxy Acid"],
    "Glycolic Acid": ["甘醇酸", "AHA", "Alpha Hydroxy Acid", "羟基乙酸"],
    "Lactic Acid": ["乳酸", "Lactate"],
}

# 构建反向映射：别名 -> 标准名称
_ALIAS_TO_STANDARD: dict[str, str] = {}
for standard_name, aliases in INCI_ALIASES.items():
    for alias in aliases:
        _ALIAS_TO_STANDARD[alias.lower()] = standard_name
    # 标准名称自身也要映射
    _ALIAS_TO_STANDARD[standard_name.lower()] = standard_name


def normalize_inci(raw_text: str) -> Tuple[List[str], str]:
    """
    对 OCR 结果进行 INCI 标准化。

    步骤：
    1. 按逗号 / 分号 / 换行分割
    2. 去除空白、数字序号、百分比（如 "5%"）
    3. 去除括号内容（如 "(CI 77491)"）
    4. 统一大小写（首字母大写）
    5. 别名映射为标准名称
    6. 去除重复，保持顺序

    Args:
        raw_text: 从 OCR 得到的原始成分文本

    Returns:
        (标准化后的 INCI 名称列表, 原始文本)
    """
    import copy

    if not raw_text or not raw_text.strip():
        return [], raw_text

    original_text = copy.copy(raw_text)

    # 步骤 1：按逗号、分号、换行分割
    segments = re.split(r'[,;，；\n\r]+', raw_text)

    normalized: list[str] = []
    seen: set[str] = set()

    for segment in segments:
        ingredient = segment.strip()
        if not ingredient:
            continue

        # 步骤 2：先去除百分比（如 "5%", "5 %", "1.5%"），再去除数字序号
        # 注意顺序：如果先去除序号会把 "5%" 中的 "5" 吃掉，留下孤立的 "%"
        ingredient = re.sub(r'\b\d+(?:\.\d+)?\s*%', '', ingredient).strip()
        if ingredient in ('%',):
            continue

        ingredient = re.sub(r'^[\d]+[\.\、\s\)\]]*\s*', '', ingredient).strip()

        if not ingredient:
            continue

        # 步骤 3：去除括号内容（如 "(CI 77491)", "(INCI)"）
        ingredient = re.sub(r'\([^)]*\)', '', ingredient).strip()
        ingredient = re.sub(r'\[[^\]]*\]', '', ingredient).strip()

        if not ingredient:
            continue

        # 步骤 4：统一大小写
        ingredient_lower = ingredient.lower().strip()

        # 步骤 5：别名映射
        standard = _ALIAS_TO_STANDARD.get(ingredient_lower)
        if standard:
            final_name = standard
        else:
            # 对多词名称进行首字母大写
            final_name = ingredient.title().strip()

        # 步骤 6：去除重复
        final_key = final_name.lower()
        if final_key not in seen:
            seen.add(final_key)
            normalized.append(final_name)

    return normalized, original_text


def lookup_alias(name: str) -> str | None:
    """
    查询某个名称（可能是别名）对应的标准 INCI 名称。

    Args:
        name: 待查询的名称

    Returns:
        标准 INCI 名称，未找到返回 None
    """
    return _ALIAS_TO_STANDARD.get(name.lower().strip())


def get_all_aliases(standard_name: str) -> list[str]:
    """
    获取某个标准 INCI 名称的所有别名（包括中文）。

    Args:
        standard_name: 标准 INCI 名称

    Returns:
        别名列表，未找到返回空列表
    """
    return INCI_ALIASES.get(standard_name, [])


def fuzzy_match(name: str, threshold: float = 0.8) -> list[tuple[str, float]]:
    """
    模糊匹配：对未在别名映射中找到的名称，尝试与标准名称进行相似度匹配。
    使用简单的字符集重叠 + 长度比方法。

    Args:
        name: 待匹配的名称
        threshold: 相似度阈值（0-1）

    Returns:
        [(标准名称, 相似度), ...] 按相似度降序排列
    """
    name_lower = name.lower().strip()
    if not name_lower:
        return []

    def _similarity(a: str, b: str) -> float:
        """计算两个字符串的相似度"""
        a_lower = a.lower()
        b_lower = b.lower()
        if a_lower == b_lower:
            return 1.0

        # 字符集交集比
        set_a = set(a_lower.replace(' ', ''))
        set_b = set(b_lower.replace(' ', ''))
        if not set_a or not set_b:
            return 0.0
        intersection = set_a & set_b
        union = set_a | set_b
        jaccard = len(intersection) / len(union)

        # 长度比
        max_len = max(len(a_lower), len(b_lower))
        min_len = min(len(a_lower), len(b_lower))
        length_ratio = min_len / max_len if max_len > 0 else 0

        return 0.6 * jaccard + 0.4 * length_ratio

    candidates: list[tuple[str, float]] = []
    for standard_name in INCI_ALIASES.keys():
        score = _similarity(name_lower, standard_name.lower())
        if score >= threshold:
            candidates.append((standard_name, score))

    # 也匹配别名
    for alias, standard_name in _ALIAS_TO_STANDARD.items():
        if alias == standard_name.lower():
            continue
        score = _similarity(name_lower, alias)
        if score >= threshold:
            # 去重
            if not any(s == standard_name for s, _ in candidates):
                candidates.append((standard_name, score))

    candidates.sort(key=lambda x: x[1], reverse=True)
    return candidates
