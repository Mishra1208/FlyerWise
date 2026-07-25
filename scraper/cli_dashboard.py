"""
FlyerWise — Terminal Live CLI Dashboard

Run this script in your terminal to view real-time ingestion progress,
PostgreSQL product/price totals, and live extracted items!
"""

import sys
import os
import time
import logging
from datetime import datetime

# Add root directory to sys.path
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from app.database import SessionLocal, engine
engine.echo = False
logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)

from app.database import SessionLocal
from app.models import Product, Price, Flyer, Store


def print_cli_dashboard():
    os.system("clear" if os.name != "nt" else "cls")
    db = SessionLocal()

    try:
        total_products = db.query(Product).count()
        total_prices = db.query(Price).count()
        total_flyers = db.query(Flyer).count()
        total_stores = db.query(Store).count()

        print("================================================================================")
        print("                 🌿 FLYERWISE — LIVE TERMINAL CLI DASHBOARD 🌿                  ")
        print("================================================================================")
        print(f" ⏰ Current Time : {datetime.now().strftime('%Y-%m-%d %H:%M:%S EST')}")
        print("--------------------------------------------------------------------------------")
        print(f" 🛒 Total Unique Products cataloged in DB  : {total_products:,}")
        print(f" 🏷️ Total Price Data Points in DB          : {total_prices:,}")
        print(f" 📰 Total Weekly Flyers Cataloged in DB     : {total_flyers:,}")
        print(f" 🏬 Total Canadian Stores Covered          : {total_stores}")
        print("--------------------------------------------------------------------------------")
        print(" 📋 RECENTLY EXTRACTED ITEM PRICES IN POSTGRESQL (LIVE FEED):")
        print("--------------------------------------------------------------------------------")

        recent_prices = (
            db.query(Price, Product, Store)
            .join(Product, Price.product_id == Product.id)
            .join(Store, Price.store_id == Store.id)
            .order_by(Price.id.desc())
            .limit(10)
            .all()
        )

        for price, prod, store in recent_prices:
            name = (prod.normalized_name or prod.raw_name)[:38]
            price_str = f"${price.current_price:.2f}"
            valid_range = f"{price.valid_from} -> {price.valid_until}"
            print(f"  • [{store.name:<9}] {name:<38} | {price_str:<7} | Valid: {valid_range}")

        print("================================================================================")
        print(" 💡 TIP: Press Ctrl+C in your terminal to exit this live view anytime.")
        print("================================================================================")

    finally:
        db.close()


def monitor_live():
    while True:
        try:
            print_cli_dashboard()
            time.sleep(3)
        except KeyboardInterrupt:
            print("\n👋 Exiting CLI Dashboard.")
            sys.exit(0)
        except Exception as e:
            time.sleep(3)


if __name__ == "__main__":
    monitor_live()
