"""
FlyerWise — Metro (Quebec/Ontario) Scraper

Scrapes weekly flyer data from metro.ca.
Metro may use a different flyer system than Flipp — needs investigation.

Target URL: https://www.metro.ca/en/flyer
Location: Hardcoded to postal code H4G 2Y5 (Montreal area)

Note: Metro's flyer system may differ from Walmart/Maxi.
      Phase 2 research will determine the exact approach.
"""

import logging

from scraper.base_scraper import BaseScraper, ScrapedProduct
from scraper.config import ScraperConfig

logger = logging.getLogger(__name__)


class MetroScraper(BaseScraper):
    """Scraper for Metro weekly flyers."""

    def __init__(self):
        config = ScraperConfig.STORES["metro"]
        super().__init__(
            store_name=config["name"],
            store_slug=config["slug"],
            flyer_url=config["flyer_url"],
        )

    def setup_driver(self):
        """Initialize Chrome driver for Metro."""
        self.driver = self.make_driver()
        logger.info(f"Driver initialized for {self.store_name}")

    def navigate_to_flyer(self):
        """
        Navigate to Metro flyer page.

        TODO (Phase 2): Implement full navigation logic:
        1. Navigate to metro.ca/en/flyer
        2. Handle store selection / postal code prompt (H4G 2Y5)
        3. Determine flyer rendering method (Flipp iframe vs custom)
        4. Wait for flyer content to load
        """
        logger.info(f"Navigating to {self.flyer_url}")
        self.driver.get(self.flyer_url)
        self.random_delay(3, 5)

        # TODO: Handle store selection
        # TODO: Determine flyer type and wait for content

        logger.info("Navigation complete — ready to extract")

    def extract_products(self) -> list[ScrapedProduct]:
        """
        Extract all products from the Metro flyer.

        TODO (Phase 2): Implement extraction logic.
        Metro's flyer structure may differ from Walmart/Maxi.
        """
        logger.info("Extracting products from Metro flyer...")

        products: list[ScrapedProduct] = []

        # TODO: Implement extraction in Phase 2

        logger.info(f"Extracted {len(products)} products from {self.store_name}")
        return products
