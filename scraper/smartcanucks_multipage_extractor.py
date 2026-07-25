"""
FlyerWise — SmartCanucks Multi-Page Historical Flyer OCR & Price Ingestor

Scrapes EVERY page (1 to N) of cataloged historical flyers from SmartCanucks,
performs OCR & regex price extraction, and writes products/prices into PostgreSQL.
"""

import sys
import os
import re
import time
import logging
import requests
from io import BytesIO
from bs4 import BeautifulSoup
from PIL import Image
import pytesseract
from datetime import datetime

# Add root directory to sys.path
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from app.database import SessionLocal
from app.models import Store, Flyer, Product, Price
from scraper.base_scraper import ScrapedProduct
from scraper.utils.db_writer import DatabaseWriter
from scraper.utils.parser import parse_price, parse_unit, parse_quantity

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("flyerwise.multipage_ocr")

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}


from PIL import ImageEnhance

GROCERY_DICTIONARY_WHITELIST = [
    # English & French Grocery & Personal Care Terms
    "chicken", "poulet", "beef", "boeuf", "pork", "porc", "turkey", "dindon", "fish", "poisson", "salmon", "saumon", "tuna", "thon", "shrimp", "crevette",
    "milk", "lait", "butter", "beurre", "margarine", "cheese", "fromage", "yogurt", "yogourt", "yoghurt", "cream", "creme", "egg", "oeuf", "oeufs",
    "apple", "pomme", "banana", "banane", "orange", "berry", "fraise", "bleuet", "grape", "raisin", "tomato", "tomate", "potato", "patate", "onion", "oignon", "garlic", "ail", "carrot", "carotte",
    "spinach", "epinard", "lettuce", "laitue", "rice", "riz", "pasta", "pate", "spaghetti", "macaroni", "noodle", "nouille", "sauce", "oil", "huile",
    "sugar", "sucre", "salt", "sel", "pepper", "poivre", "soup", "soupe", "cereal", "cereale", "oat", "avoine", "juice", "jus", "coffee", "cafe",
    "tea", "the", "water", "eau", "soda", "cola", "pop", "chip", "snack", "nut", "noix", "almond", "amande", "chocolate", "chocolat", "biscuit", "cookie",
    "detergent", "lessive", "softener", "assouplissant", "dish", "vaisselle", "finish", "cleaner", "nettoyant", "paper", "papier", "towel", "essuie", "tissue", "mouchoir",
    "shampoo", "shampooing", "soap", "savon", "lotion", "deodorant", "deodorant", "toothpaste", "dentifrice", "diaper", "couche", "wipes", "lingettes",
    "coors", "bud", "budweiser", "miller", "beer", "biere", "seltzer", "wine", "vin", "breyers", "st-hubert", "st hubert", "lactantia", "natrel", "quaker", "kraft"
]


from rapidfuzz import process, fuzz
from scraper.maxi_master_catalog import load_master_catalog, harvest_maxi_catalog

MASTER_CATALOG = load_master_catalog()
if not MASTER_CATALOG:
    MASTER_CATALOG = harvest_maxi_catalog()


def extract_items_from_text(text: str) -> list[dict]:
    """
    Extract product titles and prices from OCR text output using French & Canadian regex patterns.
    Fuzzy matches raw titles against the official 556 Maxi product catalog for clean names.
    """
    items = []
    lines = [line.strip() for line in text.split("\n") if len(line.strip()) > 2]

    # Stopwords/Boilerplate to ignore
    ignore_words = ["limite", "apres", "aprè", "jusqu", "economisez", "économisez", "rabais", "page", "valide", "du jeudi", "mercredi", "prix reg"]

    # Pattern matches 4,17$ or 4.17$ or $4.17 or 4,17
    price_pattern = re.compile(r'\b(\d{1,3})[,\.](\d{2})\s*\$?', re.IGNORECASE)

    for i, line in enumerate(lines):
        line_lower = line.lower()
        if any(bad in line_lower for bad in ignore_words):
            continue

        match = price_pattern.search(line)
        if match:
            dollars = match.group(1)
            cents = match.group(2)
            try:
                price_val = float(f"{dollars}.{cents}")
            except ValueError:
                continue

            if 0.25 <= price_val <= 150.0:
                clean_title = price_pattern.sub("", line).strip()
                clean_title = re.sub(r'[^a-zA-ZàâäéèêëîïôöùûüçÀÂÄÉÈÊËÎÏÔÖÙÛÜÇ0-9\s-]', '', clean_title).strip()

                # Pick preceding line if current line has no product text
                if len(clean_title) < 4 and i > 0:
                    prev_line = lines[i - 1].strip()
                    if not any(bad in prev_line.lower() for bad in ignore_words):
                        clean_title = re.sub(r'[^a-zA-ZàâäéèêëîïôöùûüçÀÂÄÉÈÊËÎÏÔÖÙÛÜÇ0-9\s-]', '', prev_line).strip()

                clean_lower = clean_title.lower()
                if len(clean_title) >= 5 and not clean_lower.startswith("http"):
                    # Fuzzy match raw OCR against official Maxi catalog
                    if MASTER_CATALOG:
                        best_match, score, _ = process.extractOne(clean_title, MASTER_CATALOG, scorer=fuzz.token_set_ratio)
                        if score >= 55:
                            items.append({
                                "raw_name": best_match,
                                "price": price_val,
                            })
                        elif any(kw in clean_lower for kw in GROCERY_DICTIONARY_WHITELIST):
                            items.append({
                                "raw_name": clean_title,
                                "price": price_val,
                            })

    return items


def process_multipage_flyer(flyer_id: int, flyer_url: str, store_slug: str = "maxi"):
    """
    Fetch all pages (1 to N) of a historical flyer and run OCR price extraction.
    """
    session = requests.Session()
    session.headers.update(HEADERS)
    db_writer = DatabaseWriter()

    all_url = flyer_url.rstrip("/") + "/all"
    logger.info(f"📰 Processing Multi-Page Flyer #{flyer_id} ({all_url})...")

    try:
        r = session.get(all_url, timeout=12)
        if r.status_code != 200:
            logger.warning(f"Failed to load flyer all-pages view: HTTP {r.status_code}")
            return 0

        soup = BeautifulSoup(r.text, "html.parser")
        page_imgs = [img.get("src") for img in soup.find_all("img") if "uploads/pages/" in img.get("src", "")]

        if not page_imgs:
            logger.warning(f"No flyer page images found for Flyer #{flyer_id}")
            return 0

        logger.info(f"  └─ Found {len(page_imgs)} total page images for Flyer #{flyer_id}!")

        extracted_products = []
        for page_num, img_url in enumerate(page_imgs, 1):
            full_img_url = img_url if img_url.startswith("http") else f"https://flyers.smartcanucks.ca{img_url}"
            logger.info(f"     📷 Processing Page {page_num}/{len(page_imgs)}: {full_img_url}...")

            try:
                img_res = session.get(full_img_url, timeout=10)
                if img_res.status_code == 200:
                    raw_img = Image.open(BytesIO(img_res.content)).convert("L")
                    enhancer = ImageEnhance.Contrast(raw_img)
                    enhanced_img = enhancer.enhance(2.0)
                    ocr_text = pytesseract.image_to_string(enhanced_img, config="--psm 6")
                    page_items = extract_items_from_text(ocr_text)

                    for item in page_items:
                        sp = ScrapedProduct(
                            raw_name=item["raw_name"],
                            current_price=item["price"],
                            original_price=None,
                            savings=None,
                            unit="ea",
                            quantity=1,
                            price_text=f"${item['price']:.2f}",
                            description=f"Extracted from {store_slug.title()} Flyer #{flyer_id} Page {page_num}",
                            image_url=full_img_url,
                            valid_from=datetime.now().date(),
                            valid_until=datetime.now().date(),
                        )
                        extracted_products.append(sp)

            except Exception as img_err:
                logger.warning(f"OCR Error on Page {page_num}: {img_err}")

        if extracted_products:
            db = SessionLocal()
            flyer_obj = db.query(Flyer).filter(Flyer.id == flyer_id).first()
            start_date = flyer_obj.start_date if flyer_obj else datetime.now().date()
            end_date = flyer_obj.end_date if flyer_obj else datetime.now().date()
            db.close()

            db_writer.save_scraped_data(
                store_slug=store_slug,
                store_name=store_slug.title(),
                flyer_start=start_date,
                flyer_end=end_date,
                products=extracted_products,
            )
            logger.info(f"✅ Ingested {len(extracted_products)} items across all {len(page_imgs)} pages for Flyer #{flyer_id}!")

        return len(extracted_products)

    except Exception as e:
        logger.error(f"Error processing Flyer #{flyer_id}: {e}")
        return 0


def run_all_multipage_ingestion(max_flyers: int = 10):
    """
    Iterate over cataloged historical flyers in PostgreSQL and process all pages.
    """
    db = SessionLocal()
    maxi = db.query(Store).filter(Store.slug == "maxi").first()
    historical_flyers = (
        db.query(Flyer)
        .filter(Flyer.store_id == maxi.id, Flyer.flyer_url.isnot(None))
        .order_by(Flyer.id.desc())
        .limit(max_flyers)
        .all()
    )
    db.close()

    logger.info(f"🚀 Starting Multi-Page Flyer Ingestion for {len(historical_flyers)} historical Maxi flyer editions...")

    total_items = 0
    for f in historical_flyers:
        count = process_multipage_flyer(flyer_id=f.id, flyer_url=f.flyer_url, store_slug="maxi")
        total_items += count

    logger.info(f"🎉 Multi-Page Ingestion Complete! Extracted {total_items} items across all flyer pages into PostgreSQL.")


if __name__ == "__main__":
    run_all_multipage_ingestion(max_flyers=30)
