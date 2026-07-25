"""
FlyerWise — Fast Parallelized Historical Flyer Backfill Script

Discovers and backfills historical flyer publications and price points from Flipp CDN into PostgreSQL.
"""

import sys
import os
import logging
import requests
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime
from dateutil.parser import isoparse

# Add root directory to sys.path
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from scraper.universal_scraper import slugify
from scraper.base_scraper import ScrapedProduct
from scraper.utils.parser import parse_price, parse_unit, parse_quantity
from scraper.utils.db_writer import DatabaseWriter

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("flyerwise.historical")


def fetch_flyer_data(flyer_id: int):
    url = f"https://backflipp.wishabi.com/flipp/flyers/{flyer_id}"
    try:
        r = requests.get(url, timeout=4)
        if r.status_code == 200:
            return flyer_id, r.json()
    except Exception:
        pass
    return flyer_id, None


def run_fast_historical_backfill(max_flyers: int = 40):
    db_writer = DatabaseWriter()
    
    # Active seed IDs from Canadian grocery chains
    seed_ids = [8006070, 8034414, 8036447, 8035808, 8041376, 8035456, 8041247]
    candidate_ids = []
    
    for seed in seed_ids:
        for delta in range(0, 12000, 20):
            candidate_ids.append(seed - delta)

    logger.info(f"🚀 Scanning {len(candidate_ids)} potential historical flyer endpoints on Flipp CDN...")

    valid_flyers = []
    with ThreadPoolExecutor(max_workers=20) as executor:
        futures = {executor.submit(fetch_flyer_data, fid): fid for fid in candidate_ids}
        for future in as_completed(futures):
            fid, flyer_json = future.result()
            if flyer_json and flyer_json.get("items") and len(flyer_json.get("items")) > 10:
                merchant = flyer_json.get("merchant", "").strip() or "Canadian Retailer"
                valid_flyers.append((fid, merchant, flyer_json))
                if len(valid_flyers) >= max_flyers:
                    break

    logger.info(f"✅ Found {len(valid_flyers)} historical flyers! Ingesting into PostgreSQL...")

    total_products_ingested = 0
    for idx, (flyer_id, merchant, flyer_json) in enumerate(valid_flyers, 1):
        slug = slugify(merchant)
        merchant_logo = flyer_json.get("merchant_logo")
        
        valid_from = isoparse(flyer_json.get("valid_from")).date() if flyer_json.get("valid_from") else datetime.now().date()
        valid_to = isoparse(flyer_json.get("valid_to")).date() if flyer_json.get("valid_to") else datetime.now().date()

        scraped_products = []
        for item in flyer_json.get("items", []):
            raw_name = item.get("name")
            if not raw_name:
                continue

            price_val = parse_price(item.get("price"))
            if price_val is None:
                continue

            orig_price = parse_price(item.get("original_price"))
            discount_val = item.get("discount")
            savings = f"Save {discount_val}%" if discount_val else None

            unit = parse_unit(item.get("price_text") or item.get("description") or raw_name)
            quantity = parse_quantity(item.get("price_text") or item.get("description") or raw_name)

            sp = ScrapedProduct(
                raw_name=raw_name,
                current_price=price_val,
                original_price=orig_price,
                savings=savings,
                unit=unit,
                quantity=quantity,
                price_text=item.get("price_text"),
                description=item.get("description"),
                image_url=item.get("image_url") or item.get("cutout_image_url"),
                valid_from=valid_from,
                valid_until=valid_to,
            )
            scraped_products.append(sp)

        if scraped_products:
            db_writer.save_scraped_data(
                store_slug=slug,
                store_name=merchant,
                flyer_start=valid_from,
                flyer_end=valid_to,
                products=scraped_products,
                logo_url=merchant_logo,
            )
            total_products_ingested += len(scraped_products)
            logger.info(f"📥 [{idx}/{len(valid_flyers)}] Backfilled Flyer #{flyer_id} '{merchant}': {len(scraped_products)} products [{valid_from} -> {valid_to}]")

    logger.info(f"🎉 Backfill Complete! Ingested {len(valid_flyers)} historical flyers with {total_products_ingested:,} price observation records into PostgreSQL.")


if __name__ == "__main__":
    run_fast_historical_backfill(max_flyers=30)
