"""
PostgreSQL Product Normalization & Fuzzy Catalog Matcher

Uses rapidfuzz token_sort_ratio to match raw OCR titles against
the official 556 Maxi product catalog and cleans up garbled product names.
"""

import sys
import os
import json
from rapidfuzz import process, fuzz

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from app.database import SessionLocal, engine
from app.models import Product

engine.echo = False

CATALOG_FILE = os.path.join(os.path.dirname(__file__), "maxi_official_catalog.json")


def load_master_catalog() -> list[str]:
    if os.path.exists(CATALOG_FILE):
        with open(CATALOG_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return []


def normalize_all_products():
    catalog = load_master_catalog()
    if not catalog:
        print("❌ Master catalog is empty.")
        return

    db = SessionLocal()
    try:
        products = db.query(Product).all()
        updated_count = 0
        deleted_count = 0

        print(f"🚀 Processing {len(products):,} products in PostgreSQL for official Maxi catalog fuzzy matching...")

        for prod in products:
            raw_title = prod.raw_name or ""
            
            # Perform fuzzy match against official catalog
            best_match, score, _ = process.extractOne(
                raw_title,
                catalog,
                scorer=fuzz.token_set_ratio
            )

            # If score is > 65%, normalize product to the official clean title
            if score >= 65:
                if prod.normalized_name != best_match:
                    prod.normalized_name = best_match
                    updated_count += 1
            else:
                # If score is too low and raw name contains garbled noise (like '07 2hstea', 'il ks', 'eo it')
                if len(raw_title) < 5 or any(b in raw_title.lower() for b in ["07 2h", "il ks", "eo it", "coe arr"]):
                    db.delete(prod)
                    deleted_count += 1

        db.commit()
        print(f"✨ Product Normalization Finished!")
        print(f"   └─ 🏷️ Updated {updated_count:,} products with official Maxi catalog titles!")
        print(f"   └─ 🧹 Deleted {deleted_count:,} unrecognizable noise items.")

    finally:
        db.close()


if __name__ == "__main__":
    normalize_all_products()
