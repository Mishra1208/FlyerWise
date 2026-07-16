"""
FlyerWise — Maxi (Quebec) Scraper

Scrapes weekly flyer data from maxi.ca.
Maxi uses a Flipp-powered iframe for their flyer display.
Maxi is a Loblaw-owned discount grocery chain, popular in Quebec.

Target URL: https://www.maxi.ca/en/flyer
Location: Hardcoded to postal code H4G 2Y5 (Montreal area)

Note: Maxi flyers may contain French product names that need translation.
"""

import logging

from scraper.base_scraper import BaseScraper, ScrapedProduct
from scraper.config import ScraperConfig

logger = logging.getLogger(__name__)


class MaxiScraper(BaseScraper):
    """Scraper for Maxi Quebec weekly flyers."""

    def __init__(self):
        config = ScraperConfig.STORES["maxi"]
        super().__init__(
            store_name=config["name"],
            store_slug=config["slug"],
            flyer_url=config["flyer_url"],
        )

    def setup_driver(self):
        """Initialize Chrome driver for Maxi."""
        self.driver = self.make_driver()
        logger.info(f"Driver initialized for {self.store_name}")

    def navigate_to_flyer(self):
        """
        Navigate to Maxi flyer page.

        TODO (Phase 2): Implement full navigation logic:
        1. Navigate to maxi.ca/en/flyer
        2. Handle store selection / postal code prompt (H4G 2Y5)
        3. Wait for Flipp iframe to fully load
        4. Switch into the iframe context
        """
        logger.info(f"Navigating to {self.flyer_url}")
        self.driver.get(self.flyer_url)
        self.random_delay(3, 5)

        # TODO: Handle store selection
        # TODO: Wait for Flipp iframe
        # TODO: Switch to iframe

        logger.info("Navigation complete — ready to extract")

    def extract_products(self) -> list[ScrapedProduct]:
        """
        Extract all products from the Maxi flyer.

        TODO (Phase 2): Implement full extraction logic.
        Special consideration: French product names need translation
        via the normalizer module.
        """
        logger.info("Extracting products from Maxi flyer...")

        products: list[ScrapedProduct] = []

        # TODO: Implement extraction in Phase 2

        logger.info(f"Extracted {len(products)} products from {self.store_name}")
        return products
