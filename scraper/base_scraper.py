"""
FlyerWise Base Scraper

Abstract base class that all store scrapers inherit from.
Provides common HTTP request headers, pagination, and retry logic.
"""

import time
import random
import logging
import requests
from abc import ABC, abstractmethod
from datetime import date
from typing import Optional

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
    Abstract base class for all store scrapers using the Flipp JSON API.

    Each store scraper must implement:
    - extract_products(): Parse the list of products from the JSON payload.
    """

    def __init__(self, store_name: str, store_slug: str, flyer_url: str):
        self.store_name = store_name
        self.store_slug = store_slug
        self.flyer_url = flyer_url
        self.config = ScraperConfig
        self.session = requests.Session()
        self.session.headers.update({
            "User-Agent": (
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            ),
            "Accept": "application/json",
            "Referer": "https://flipp.com/",
        })

    def random_delay(self, min_sec: float = 1.0, max_sec: float = 3.0):
        """Add a random delay to mimic human behavior and respect rate limits."""
        delay = random.uniform(min_sec, max_sec)
        time.sleep(delay)

    def fetch_json(self, url: str, params: Optional[dict] = None) -> Optional[dict]:
        """Fetch JSON data from a URL with retries."""
        max_retries = 3
        for attempt in range(max_retries):
            try:
                response = self.session.get(url, params=params, timeout=15)
                if response.status_code == 200:
                    return response.json()
                logger.warning(
                    f"Attempt {attempt + 1}: Received status code {response.status_code} for {url}"
                )
            except requests.RequestException as e:
                logger.warning(f"Attempt {attempt + 1}: Connection error for {url}: {e}")
            
            self.random_delay(2.0, 4.0)
            
        logger.error(f"Failed to fetch JSON from {url} after {max_retries} attempts")
        return None

    @abstractmethod
    def extract_products(self) -> list[ScrapedProduct]:
        """Extract products from the store flyer using Flipp API."""
        pass

    def scrape(self) -> list[ScrapedProduct]:
        """
        Main scrape workflow. Called externally.

        Returns:
            list[ScrapedProduct]: All products found in the current flyer.
        """
        logger.info(f"🕷️  Starting API-based scrape for {self.store_name}...")
        products = []

        try:
            products = self.extract_products()
            logger.info(
                f"✅ Scraped {len(products)} products from {self.store_name}"
            )
        except Exception as e:
            logger.error(f"❌ Error scraping {self.store_name}: {e}", exc_info=True)

        return products
