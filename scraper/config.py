"""
FlyerWise Scraper Configuration

Settings for the web scraper service.
"""

import os

try:
    from dotenv import load_dotenv
    load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))
except ImportError:
    pass


class ScraperConfig:
    """Scraper configuration loaded from environment."""

    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql://flyerwise_user:flyerwise_pass@localhost:5433/flyerwise_db",
    )

    # Scraper settings
    DEFAULT_POSTAL_CODE: str = os.getenv("DEFAULT_POSTAL_CODE", "H4G 2Y5")
    HEADLESS_BROWSER: bool = os.getenv("HEADLESS_BROWSER", "true").lower() == "true"
    SCRAPE_INTERVAL_HOURS: int = int(os.getenv("SCRAPE_INTERVAL_HOURS", "168"))

    # Timeouts
    PAGE_LOAD_TIMEOUT: int = 30  # seconds
    ELEMENT_WAIT_TIMEOUT: int = 15  # seconds
    BETWEEN_ITEMS_DELAY: tuple = (1, 3)  # Random delay range in seconds

    # Data directories
    DATA_DIR: str = os.path.join(os.path.dirname(__file__), "data")
    SCREENSHOTS_DIR: str = os.path.join(os.path.dirname(__file__), "screenshots")

    # Store configurations
    STORES = {
        "walmart": {
            "name": "Walmart",
            "flyer_url": "https://www.walmart.ca/flyer",
            "slug": "walmart",
        },
        "maxi": {
            "name": "Maxi",
            "flyer_url": "https://www.maxi.ca/en/flyer",
            "slug": "maxi",
        },
        "metro": {
            "name": "Metro",
            "flyer_url": "https://www.metro.ca/en/flyer",
            "slug": "metro",
        },
        "iga": {
            "name": "IGA",
            "flyer_url": "https://www.iga.net/en/flyer",
            "slug": "iga",
        },
        "superc": {
            "name": "Super C",
            "flyer_url": "https://www.superc.ca/en/flyer",
            "slug": "superc",
        },
        "provigo": {
            "name": "Provigo",
            "flyer_url": "https://www.provigo.ca/en/flyer",
            "slug": "provigo",
        },
    }

    @classmethod
    def ensure_dirs(cls):
        """Create data and screenshots directories if they don't exist."""
        os.makedirs(cls.DATA_DIR, exist_ok=True)
        os.makedirs(cls.SCREENSHOTS_DIR, exist_ok=True)
