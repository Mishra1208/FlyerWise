"""
FlyerWise Base Scraper

Abstract base class that all store scrapers inherit from.
Provides common setup, navigation, and data extraction patterns.
"""

import time
import random
import logging
from abc import ABC, abstractmethod
from datetime import date
from typing import Optional

import undetected_chromedriver as uc
from selenium.webdriver.common.by import By
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import (
    TimeoutException,
    NoSuchElementException,
    WebDriverException,
)

from scraper.config import ScraperConfig

logger = logging.getLogger(__name__)


class ScrapedProduct:
    """
    Data class representing a single product extracted from a flyer.
    This is the standard format all scrapers must produce.
    """

    def __init__(
        self,
        raw_name: str,
        current_price: float,
        original_price: Optional[float] = None,
        savings: Optional[str] = None,
        unit: Optional[str] = None,
        quantity: Optional[str] = None,
        price_text: Optional[str] = None,
        description: Optional[str] = None,
        image_url: Optional[str] = None,
        category: Optional[str] = None,
        brand: Optional[str] = None,
        valid_from: Optional[date] = None,
        valid_until: Optional[date] = None,
    ):
        self.raw_name = raw_name
        self.current_price = current_price
        self.original_price = original_price
        self.savings = savings
        self.unit = unit
        self.quantity = quantity
        self.price_text = price_text
        self.description = description
        self.image_url = image_url
        self.category = category
        self.brand = brand
        self.valid_from = valid_from
        self.valid_until = valid_until

    def to_dict(self) -> dict:
        return {
            "raw_name": self.raw_name,
            "current_price": self.current_price,
            "original_price": self.original_price,
            "savings": self.savings,
            "unit": self.unit,
            "quantity": self.quantity,
            "price_text": self.price_text,
            "description": self.description,
            "image_url": self.image_url,
            "category": self.category,
            "brand": self.brand,
            "valid_from": self.valid_from,
            "valid_until": self.valid_until,
        }

    def __repr__(self) -> str:
        return f"<ScrapedProduct(name='{self.raw_name[:30]}', price=${self.current_price})>"


class BaseScraper(ABC):
    """
    Abstract base class for all store scrapers.

    Each store scraper must implement:
    - setup_driver(): Configure the browser with store-specific settings
    - navigate_to_flyer(): Navigate to the flyer page and handle popups
    - extract_products(): Parse the page and return a list of ScrapedProduct objects

    Usage:
        scraper = WalmartScraper()
        products = scraper.scrape()
    """

    def __init__(self, store_name: str, store_slug: str, flyer_url: str):
        self.store_name = store_name
        self.store_slug = store_slug
        self.flyer_url = flyer_url
        self.driver: Optional[uc.Chrome] = None
        self.config = ScraperConfig

    def make_driver(self) -> uc.Chrome:
        """Create an undetected Chrome driver instance."""
        options = uc.ChromeOptions()

        if self.config.HEADLESS_BROWSER:
            options.add_argument("--headless=new")

        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        options.add_argument("--disable-gpu")
        options.add_argument("--window-size=1920,1080")
        options.add_argument(
            "--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
            "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )

        driver = uc.Chrome(options=options, use_subprocess=False)
        driver.set_page_load_timeout(self.config.PAGE_LOAD_TIMEOUT)
        return driver

    def random_delay(self, min_sec: float = None, max_sec: float = None):
        """Add a random delay to mimic human behavior."""
        min_s = min_sec or self.config.BETWEEN_ITEMS_DELAY[0]
        max_s = max_sec or self.config.BETWEEN_ITEMS_DELAY[1]
        delay = random.uniform(min_s, max_s)
        time.sleep(delay)

    def wait_for_element(
        self, by: By, value: str, timeout: int = None
    ):
        """Wait for an element to be present on the page."""
        timeout = timeout or self.config.ELEMENT_WAIT_TIMEOUT
        return WebDriverWait(self.driver, timeout).until(
            EC.presence_of_element_located((by, value))
        )

    def wait_for_clickable(
        self, by: By, value: str, timeout: int = None
    ):
        """Wait for an element to be clickable."""
        timeout = timeout or self.config.ELEMENT_WAIT_TIMEOUT
        return WebDriverWait(self.driver, timeout).until(
            EC.element_to_be_clickable((by, value))
        )

    def switch_to_iframe(self, iframe_class: str = "flippiframe.mainframe"):
        """Switch the driver context into a Flipp iframe."""
        self.driver.switch_to.default_content()
        try:
            iframe = self.driver.find_element(By.CLASS_NAME, iframe_class)
            self.driver.switch_to.frame(iframe)
            logger.info(f"Switched to iframe: {iframe_class}")
        except NoSuchElementException:
            logger.warning(f"iframe not found: {iframe_class}")
            raise

    def take_screenshot(self, name: str):
        """Save a screenshot for debugging."""
        self.config.ensure_dirs()
        path = f"{self.config.SCREENSHOTS_DIR}/{self.store_slug}_{name}.png"
        self.driver.save_screenshot(path)
        logger.info(f"Screenshot saved: {path}")

    @abstractmethod
    def setup_driver(self):
        """Initialize and configure the Selenium driver for this store."""
        pass

    @abstractmethod
    def navigate_to_flyer(self):
        """Navigate to the store's flyer page and handle any popups/location prompts."""
        pass

    @abstractmethod
    def extract_products(self) -> list[ScrapedProduct]:
        """Extract all products from the current flyer page."""
        pass

    def scrape(self) -> list[ScrapedProduct]:
        """
        Main scrape workflow. Called externally.

        Returns:
            list[ScrapedProduct]: All products found in the current flyer.
        """
        logger.info(f"🕷️  Starting scrape for {self.store_name}...")
        products = []

        try:
            self.setup_driver()
            self.navigate_to_flyer()
            products = self.extract_products()
            logger.info(
                f"✅ Scraped {len(products)} products from {self.store_name}"
            )
        except TimeoutException as e:
            logger.error(f"⏰ Timeout scraping {self.store_name}: {e}")
        except WebDriverException as e:
            logger.error(f"🌐 WebDriver error scraping {self.store_name}: {e}")
        except Exception as e:
            logger.error(f"❌ Error scraping {self.store_name}: {e}", exc_info=True)
        finally:
            self.cleanup()

        return products

    def cleanup(self):
        """Close the browser and free resources."""
        if self.driver:
            try:
                self.driver.quit()
                logger.info(f"Browser closed for {self.store_name}")
            except Exception:
                pass
            self.driver = None
