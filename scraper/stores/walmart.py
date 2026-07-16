"""
FlyerWise — Walmart Canada Scraper

Scrapes weekly flyer data from walmart.ca.
Walmart uses a Flipp-powered iframe for their flyer display.

Target URL: https://www.walmart.ca/flyer
Location: Hardcoded to postal code H4G 2Y5 (Montreal area)
"""

import logging

from scraper.base_scraper import BaseScraper, ScrapedProduct
from scraper.config import ScraperConfig

logger = logging.getLogger(__name__)


class WalmartScraper(BaseScraper):
    """Scraper for Walmart Canada weekly flyers."""

    def __init__(self):
        config = ScraperConfig.STORES["walmart"]
        super().__init__(
            store_name=config["name"],
            store_slug=config["slug"],
            flyer_url=config["flyer_url"],
        )

    def setup_driver(self):
        """Initialize Chrome driver for Walmart."""
        self.driver = self.make_driver()
        logger.info(f"Driver initialized for {self.store_name}")

    def navigate_to_flyer(self):
        """
        Navigate to Walmart flyer page.

        TODO (Phase 2): Implement full navigation logic:
        1. Navigate to walmart.ca/flyer
        2. Handle location/postal code prompt (set to H4G 2Y5)
        3. Wait for Flipp iframe to fully load
        4. Switch into the iframe context
        """
        logger.info(f"Navigating to {self.flyer_url}")
        self.driver.get(self.flyer_url)
        self.random_delay(3, 5)

        # TODO: Handle postal code popup
        # TODO: Wait for Flipp iframe
        # TODO: Switch to iframe

        logger.info("Navigation complete — ready to extract")

    def extract_products(self) -> list[ScrapedProduct]:
        """
        Extract all products from the Walmart flyer.

        TODO (Phase 2): Implement full extraction logic:
        1. Find all product items in the Flipp iframe
        2. Click each item to load its detail panel
        3. Extract: name, price, description, image, dates
        4. Parse price text into structured data
        5. Return list of ScrapedProduct objects
        """
        logger.info("Extracting products from Walmart flyer...")

        products: list[ScrapedProduct] = []

        # TODO: Implement extraction in Phase 2
        # This stub will be replaced with actual Selenium logic

        logger.info(f"Extracted {len(products)} products from {self.store_name}")
        return products
