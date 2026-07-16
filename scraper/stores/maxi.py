"""
FlyerWise — Maxi (Quebec) Scraper

Scrapes weekly flyer data from maxi.ca using the Flipp JSON API.
Uses requests to directly fetch and parse structured JSON data.
"""

import logging
from datetime import date
from dateutil.parser import isoparse

from scraper.config import ScraperConfig
from scraper.base_scraper import BaseScraper, ScrapedProduct
from scraper.utils.parser import parse_price, parse_savings, parse_unit, parse_quantity

logger = logging.getLogger(__name__)


class MaxiScraper(BaseScraper):
    """Scraper for Maxi Quebec weekly flyers using the Flipp API."""

    def __init__(self):
        config = ScraperConfig.STORES["maxi"]
        super().__init__(
            store_name=config["name"],
            store_slug=config["slug"],
            flyer_url=config["flyer_url"],
        )

    def setup_driver(self):
        """No browser driver needed for API-based scraper."""
        pass

    def navigate_to_flyer(self):
        """No browser navigation needed for API-based scraper."""
        pass

    def extract_products(self) -> list[ScrapedProduct]:
        """
        Extract all products from the Maxi flyer via Flipp JSON API.
        """
        postal_code = self.config.DEFAULT_POSTAL_CODE.replace(" ", "")
        
        # 1. Fetch flyers list for the postal code
        url = f"https://backflipp.wishabi.com/flipp/flyers?locale=en&postal_code={postal_code}"
        logger.info(f"Fetching flyers for Maxi in {postal_code}...")
        data = self.fetch_json(url)
        if not data:
            return []
            
        flyers = data.get("flyers", [])
        
        # Filter for Maxi flyers
        maxi_flyers = [f for f in flyers if f.get("merchant") == self.store_name]
        if not maxi_flyers:
            logger.warning(f"No active Maxi flyers found for postal code {postal_code}")
            return []
            
        logger.info(f"Found {len(maxi_flyers)} active Maxi flyer(s)")
        
        scraped_products = []
        
        for flyer_data in maxi_flyers:
            flyer_id = flyer_data.get("id")
            valid_from = isoparse(flyer_data.get("valid_from")).date()
            valid_to = isoparse(flyer_data.get("valid_to")).date()
            
            logger.info(f"Fetching items for Maxi flyer {flyer_id} ({valid_from} to {valid_to})...")
            
            flyer_url = f"https://backflipp.wishabi.com/flipp/flyers/{flyer_id}"
            flyer_json = self.fetch_json(flyer_url)
            if not flyer_json:
                continue
                
            items = flyer_json.get("items", [])
            logger.info(f"Retrieved {len(items)} items from Maxi flyer {flyer_id}")
            
            for item in items:
                raw_name = item.get("name")
                price_str = item.get("price")
                
                # Verify price is valid
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
                    unit=parse_unit(raw_name),
                    quantity=parse_quantity(raw_name),
                    price_text=price_str,
                    description=None,
                    image_url=item.get("cutout_image_url"),
                    brand=item.get("brand"),
                    valid_from=valid_from,
                    valid_until=valid_to
                )
                scraped_products.append(product)
                
            self.random_delay(1.0, 2.0)
            
        return scraped_products
