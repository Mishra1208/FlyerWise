"""
FlyerWise Configuration

Loads settings from environment variables / .env file.
"""

from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Database
    database_url: str = "postgresql://flyerwise_user:flyerwise_pass@localhost:5432/flyerwise_db"

    # Server
    backend_host: str = "0.0.0.0"
    backend_port: int = 8000
    debug: bool = True

    # Scraper
    default_postal_code: str = "H4G 2Y5"
    headless_browser: bool = True
    scrape_interval_hours: int = 168  # Weekly

    # CORS (for React frontend)
    frontend_url: str = "http://localhost:5173"

    model_config = {
        "env_file": "../.env",
        "env_file_encoding": "utf-8",
        "extra": "ignore",
    }


@lru_cache()
def get_settings() -> Settings:
    """Cached settings singleton."""
    return Settings()
