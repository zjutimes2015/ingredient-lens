#!/usr/bin/env python3
"""
OpenBeautyFacts 数据导入 CLI 脚本

用法:
    # 导入 1000 条样本
    python scripts/import_openbeautyfacts.py --sample 1000

    # 导入完整数据集
    python scripts/import_openbeautyfacts.py --full

    # 查看数据库统计
    python scripts/import_openbeautyfacts.py --stats

    # 指定数据库路径
    python scripts/import_openbeautyfacts.py --sample 500 --db-path /path/to/custom.db
"""

import argparse
import logging
import os
import sys
import time

# 将项目根目录加入 sys.path，使 import 能正确找到 backend 包
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.openbeautyfacts_importer import (
    download_dump,
    download_sample,
    get_stats,
    import_to_db,
    parse_products,
)
from app.services.data_service import get_connection

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger(__name__)


def parse_args() -> argparse.Namespace:
    """解析命令行参数"""
    parser = argparse.ArgumentParser(
        description="OpenBeautyFacts 数据导入工具",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
示例:
  python scripts/import_openbeautyfacts.py --sample 1000
  python scripts/import_openbeautyfacts.py --full
  python scripts/import_openbeautyfacts.py --stats
  python scripts/import_openbeautyfacts.py --sample 500 --db-path ./data/test.db
        """,
    )

    group = parser.add_mutually_exclusive_group()
    group.add_argument(
        "--sample",
        type=int,
        metavar="N",
        help="导入 N 条样本数据（从远程流式读取前 N 行）",
    )
    group.add_argument(
        "--full",
        action="store_true",
        help="导入完整数据集（先下载 ~500MB 压缩包再解析）",
    )
    group.add_argument(
        "--stats",
        action="store_true",
        help="查看数据库统计信息",
    )

    parser.add_argument(
        "--db-path",
        type=str,
        default=None,
        help="SQLite 数据库路径（默认: backend/data/openbeautyfacts.db）",
    )

    return parser.parse_args()


def run_sample(sample_size: int, db_path: str) -> None:
    """导入样本数据"""
    logger.info("=== 开始导入样本数据 (%d 条) ===", sample_size)

    # 下载样本文件
    sample_file = download_sample(lines=sample_size)
    logger.info("样本文件: %s", sample_file)

    # 解析产品
    products = list(parse_products(sample_file))
    logger.info("解析到 %d 个产品", len(products))

    if not products:
        logger.warning("未解析到任何产品，请检查数据源")
        return

    # 导入数据库
    start = time.time()
    count = import_to_db(products, db_path=db_path)
    elapsed = time.time() - start
    logger.info("导入完成: %d 条, 耗时 %.2f 秒", count, elapsed)

    # 统计
    stats = get_stats(db_path=db_path)
    logger.info("数据库统计: %s", stats)


def run_full(db_path: str) -> None:
    """导入完整数据集"""
    logger.info("=== 开始导入完整数据集 ===")
    logger.warning("注意：完整数据集约 500MB+，下载和解析可能需要较长时间")

    # 下载压缩包
    dump_file = download_dump()
    logger.info("压缩包已保存: %s", dump_file)

    # 解析产品（使用 Generator 逐行处理，避免内存溢出）
    logger.info("开始解析产品数据...")
    batch: list[dict] = []
    batch_size = 500
    total = 0
    start = time.time()

    for product in parse_products(dump_file):
        batch.append(product)
        if len(batch) >= batch_size:
            total += import_to_db(batch, db_path=db_path)
            batch = []
            elapsed = time.time() - start
            rate = total / (elapsed / 60) if elapsed > 0 else 0
            logger.info("进度: %d 条, 速率: %.1f 条/分钟", total, rate)

    # 处理剩余的
    if batch:
        total += import_to_db(batch, db_path=db_path)

    elapsed = time.time() - start
    logger.info("完整导入完成: 共 %d 条, 耗时 %.2f 秒", total, elapsed)

    stats = get_stats(db_path=db_path)
    logger.info("数据库统计: %s", stats)


def run_stats(db_path: str) -> None:
    """查看数据库统计"""
    stats = get_stats(db_path=db_path)
    print("=" * 50)
    print("  OpenBeautyFacts 数据库统计")
    print("=" * 50)
    print(f"  产品数量:     {stats['products']}")
    print(f"  成分数量:     {stats['ingredients']}")
    print(f"  产品-成分关联: {stats['relations']}")
    print(f"  数据库路径:   {db_path}")
    print("=" * 50)


def main() -> None:
    """主入口"""
    args = parse_args()
    db_path = args.db_path or os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
        "data", "openbeautyfacts.db"
    )

    # 确保数据库目录存在
    os.makedirs(os.path.dirname(db_path), exist_ok=True)

    if args.stats:
        run_stats(db_path)
    elif args.sample:
        run_sample(args.sample, db_path)
    elif args.full:
        run_full(db_path)
    else:
        print("请指定操作: --sample N, --full, 或 --stats")
        print("使用 --help 查看帮助")


if __name__ == "__main__":
    main()
