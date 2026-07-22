"""
FlyerWise — Check Stores & Recorded Prices in PostgreSQL

Usage:
    python check_stores.py                    # List summary of all stores
    python check_stores.py --store maxi       # Inspect all products & prices for Maxi
    python check_stores.py --store iga        # Inspect all products & prices for IGA
    python check_stores.py --store walmart    # Inspect all products & prices for Walmart
"""

import sys
import os
import argparse

# Add backend directory to sys.path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "backend"))

from scraper.config import ScraperConfig
from scraper.utils.db_writer import DatabaseWriter
from app.models import Store, Flyer, Product, Price


from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

def get_db_session():
    urls = [
        ScraperConfig.DATABASE_URL,
        "postgresql://flyerwise_user:flyerwise_pass@localhost:5432/flyerwise_db",
        "postgresql+psycopg://flyerwise_user:flyerwise_pass@localhost:5432/flyerwise_db"
    ]
    for url in urls:
        if url.startswith("postgresql://"):
            url = url.replace("postgresql://", "postgresql+psycopg://", 1)
        try:
            engine = create_engine(url, echo=False)
            Session = sessionmaker(bind=engine)
            session = Session()
            session.query(Store).first()
            return session
        except Exception:
            continue
    writer = DatabaseWriter()
    return writer.get_session()


def inspect_store(store_slug: str):
    db = get_db_session()
    try:
        store = db.query(Store).filter(Store.slug == store_slug.lower()).first()
        if not store:
            print(f"❌ Store with slug '{store_slug}' not found in database.")
            return

        prices = (
            db.query(Price, Product)
            .join(Product, Price.product_id == Product.id)
            .filter(Price.store_id == store.id)
            .order_by(Product.raw_name)
            .all()
        )

        print("\n" + "=" * 80)
        print(f"🛒 STORE PRICE REPORT: {store.name.upper()} ({len(prices)} items recorded)")
        print("=" * 80)
        print(f"{'PRODUCT NAME':<45} {'PRICE':<10} {'SAVINGS':<15}")
        print("-" * 80)

        for price_row, product_row in prices:
            price_str = f"${price_row.current_price:.2f}"
            savings_str = price_row.savings or "-"
            print(f" • {product_row.raw_name[:43]:<45} {price_str:<10} {savings_str:<15}")

        print("=" * 80)
        print(f"✅ Total Recorded Items for {store.name}: {len(prices)}\n")
    finally:
        db.close()


def list_summary():
    db = get_db_session()
    try:
        stores = db.query(Store).order_by(Store.name).all()
        total_flyers = db.query(Flyer).count()
        total_products = db.query(Product).count()
        total_prices = db.query(Price).count()

        print("\n" + "=" * 65)
        print("📊 FLYERWISE POSTGRESQL DATABASE SUMMARY")
        print("=" * 65)
        print(f" 🏬 Total Stores:    {len(stores)}")
        print(f" 📰 Total Flyers:    {total_flyers}")
        print(f" 📦 Total Products:  {total_products}")
        print(f" 🏷️  Total Prices:    {total_prices}")
        print("=" * 65)
        print(f"{'STORE NAME':<32} {'SLUG':<25} {'ITEMS RECORDED':<10}")
        print("-" * 65)

        for s in stores:
            price_count = db.query(Price).filter(Price.store_id == s.id).count()
            print(f" • {s.name[:30]:<30} {s.slug[:23]:<25} {price_count:<10}")

        print("=" * 65 + "\n")
    finally:
        db.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Inspect FlyerWise PostgreSQL Store Database")
    parser.add_argument("--store", type=str, help="Slug of store to inspect (e.g. maxi, iga, walmart)")
    args = parser.parse_args()

    if args.store:
        inspect_store(args.store)
    else:
        list_summary()
