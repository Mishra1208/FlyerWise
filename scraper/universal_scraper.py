"""
FlyerWise — Universal Flipp Grocery Scraper

Automatically discovers and scrapes flyer product listings for ALL grocery
and pharmacy retailers on Flipp across specified Canadian postal codes.
"""

import logging
import re
import unicodedata
from datetime import date
from typing import Optional, List, Dict, Any
from dateutil.parser import isoparse

from scraper.base_scraper import BaseScraper, ScrapedProduct
from scraper.config import ScraperConfig
from scraper.utils.parser import parse_price, parse_unit, parse_quantity
from scraper.utils.db_writer import DatabaseWriter

logger = logging.getLogger("flyerwise.scraper.universal")


def slugify(text: str) -> str:
    """Convert string to URL-friendly slug (e.g., 'T&T Supermarket' -> 'tt-supermarket')."""
    text = unicodedata.normalize('NFKD', text).encode('ascii', 'ignore').decode('utf-8')
    text = re.sub(r'[^\w\s-]', '', text.lower()).strip()
    return re.sub(r'[-\s]+', '-', text)


class UniversalGroceryScraper(BaseScraper):
    """
    Universal Scraper for discovering and extracting flyer items from ALL
    grocery and pharmacy retailers listed on Flipp.
    """

    GROCERY_CATEGORIES = {"groceries", "pharmacy", "general merchandise"}

    def __init__(self, postal_codes: Optional[List[str]] = None):
        super().__init__(
            store_name="Universal Grocery Engine",
            store_slug="universal",
            flyer_url="https://flipp.com",
        )
        self.postal_codes = postal_codes or ["H3B2Y5", "H2X1Y4", "K1P5W3"]
        self.db_writer = DatabaseWriter()

    def extract_products(self) -> list[ScrapedProduct]:
        """Not used directly; use run_universal_scrape() instead."""
        return []

    def fetch_flyers_for_postal_code(self, postal_code: str) -> List[Dict[str, Any]]:
        """Fetch list of all active flyers for a postal code."""
        clean_code = postal_code.replace(" ", "").upper()
        url = f"https://backflipp.wishabi.com/flipp/flyers?locale=en&postal_code={clean_code}"
        logger.info(f"🔍 Fetching Flipp flyer registry for postal code {clean_code}...")
        
        data = self.fetch_json(url)
        if not data:
            return []
            
        return data.get("flyers", [])

    def is_grocery_flyer(self, flyer: Dict[str, Any]) -> bool:
        """Determine if a flyer belongs to groceries or pharmacy."""
        cats = {c.lower() for c in flyer.get("categories", [])}
        return bool(self.GROCERY_CATEGORIES.intersection(cats))

    def scrape_single_flyer(self, flyer_data: Dict[str, Any]) -> tuple[str, str, Optional[str], date, date, List[ScrapedProduct]]:
        """Scrape all product items from a single flyer."""
        flyer_id = flyer_data.get("id")
        merchant = flyer_data.get("merchant", "Unknown Store").strip()
        slug = slugify(merchant)
        merchant_logo = flyer_data.get("merchant_logo")
        
        valid_from = isoparse(flyer_data.get("valid_from")).date() if flyer_data.get("valid_from") else date.today()
        valid_to = isoparse(flyer_data.get("valid_to")).date() if flyer_data.get("valid_to") else date.today()

        logger.info(f"🛒 Scraping '{merchant}' (Flyer #{flyer_id}) [{valid_from} -> {valid_to}]...")
        
        flyer_url = f"https://backflipp.wishabi.com/flipp/flyers/{flyer_id}"
        flyer_json = self.fetch_json(flyer_url)
        if not flyer_json:
            return slug, merchant, merchant_logo, valid_from, valid_to, []

        items = flyer_json.get("items", [])
        scraped_products = []

        for item in items:
            raw_name = item.get("name")
            if not raw_name:
                continue

            price_str = item.get("price")
            price_val = parse_price(price_str)
            if price_val is None:
                continue

            discount_val = item.get("discount")
            savings = f"Save {discount_val}%" if discount_val else None

            product = ScrapedProduct(
                raw_name=raw_name,
                current_price=price_val,
                original_price=None,
                savings=savings,
                unit=parse_unit(raw_name, print_id=item.get("print_id")),
                quantity=parse_quantity(raw_name),
                price_text=price_str,
                description=None,
                image_url=item.get("cutout_image_url"),
                brand=item.get("brand"),
                valid_from=valid_from,
                valid_until=valid_to
            )
            scraped_products.append(product)

        return slug, merchant, merchant_logo, valid_from, valid_to, scraped_products

    def run_universal_scrape(self) -> Dict[str, Any]:
        """
        Main execution loop for Universal Scraper.
        Discovers all grocery flyers, scrapes items, and writes to database.
        """
        logger.info("🚀 Starting Universal Grocery Scraper run...")
        
        seen_flyer_ids = set()
        stores_scraped = 0
        total_items_saved = 0

        for pcode in self.postal_codes:
            flyers = self.fetch_flyers_for_postal_code(pcode)
            logger.info(f"Found {len(flyers)} total flyers for {pcode}")

            for f_data in flyers:
                fid = f_data.get("id")
                if fid in seen_flyer_ids:
                    continue
                seen_flyer_ids.add(fid)

                if not self.is_grocery_flyer(f_data):
                    continue

                try:
                    slug, merchant, logo, valid_from, valid_to, products = self.scrape_single_flyer(f_data)
                    if not products:
                        continue

                    fsa = pcode[:3].upper()
                    saved = self.db_writer.save_scraped_data(
                        store_slug=slug,
                        store_name=merchant,
                        logo_url=logo,
                        products=products,
                        flyer_start=valid_from,
                        flyer_end=valid_to,
                        postal_code_fsa=fsa,
                    )
                    
                    stores_scraped += 1
                    total_items_saved += saved
                    logger.info(f"✅ {merchant}: Saved {saved} items to PostgreSQL")
                    self.random_delay(0.5, 1.5)

                except Exception as e:
                    logger.error(f"Failed flyer #{fid} for {f_data.get('merchant')}: {e}", exc_info=True)
                    continue

        summary = {
            "status": "success",
            "flyers_scraped": len(seen_flyer_ids),
            "stores_updated": stores_scraped,
            "total_items_saved": total_items_saved
        }
        logger.info(f"🏁 Universal Scrape Finished! Summary: {summary}")
        return summary
