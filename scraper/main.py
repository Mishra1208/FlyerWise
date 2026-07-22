"""
FlyerWise Scraper — Main Entry Point

Run all scrapers or a specific store scraper from the command line.

Usage:
    python main.py                  # Scrape all stores
    python main.py --store walmart  # Scrape only Walmart
    python main.py --store maxi     # Scrape only Maxi
    python main.py --store metro    # Scrape only Metro
"""

import argparse
import logging
import sys
from datetime import date, timedelta

from scraper.config import ScraperConfig
from scraper.stores import (
    WalmartScraper, MaxiScraper, MetroScraper,
    IGAScraper, SuperCScraper, ProvigoScraper
)
from scraper.utils.db_writer import DatabaseWriter

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("flyerwise.scraper")

# Map store slugs to scraper classes
SCRAPERS = {
    "walmart": WalmartScraper,
    "maxi": MaxiScraper,
    "metro": MetroScraper,
    "iga": IGAScraper,
    "superc": SuperCScraper,
    "provigo": ProvigoScraper,
}


def run_scraper(store_slug: str):
    """Run a single store scraper and save results to the database."""
    if store_slug not in SCRAPERS:
        logger.error(f"Unknown store: {store_slug}. Available: {list(SCRAPERS.keys())}")
        return

    logger.info(f"{'='*60}")
    logger.info(f"🕷️  Starting scraper for: {store_slug.upper()}")
    logger.info(f"{'='*60}")

    # Initialize scraper
    scraper_class = SCRAPERS[store_slug]
    scraper = scraper_class()

    # Run the scraper
    products = scraper.scrape()

    if not products:
        logger.warning(f"No products scraped from {store_slug}")
        return

    # Save to database
    db_writer = DatabaseWriter()

    # For now, use approximate weekly flyer dates
    # In Phase 2, these will be extracted from the actual flyer page
    today = date.today()
    flyer_start = today - timedelta(days=today.weekday())  # Last Monday
    flyer_end = flyer_start + timedelta(days=6)  # Following Sunday

    saved = db_writer.save_scraped_data(
        store_slug=store_slug,
        products=products,
        flyer_start=flyer_start,
        flyer_end=flyer_end,
    )

    logger.info(f"✅ {store_slug}: Scraped {len(products)} products, saved {saved} to DB")


def main():
    """CLI entry point."""
    parser = argparse.ArgumentParser(
        description="FlyerWise Scraper — Extract grocery prices from Canadian store flyers"
    )
    parser.add_argument(
        "--store",
        type=str,
        choices=list(SCRAPERS.keys()),
        help="Specific store to scrape (default: all stores)",
    )
    parser.add_argument(
        "--list-stores",
        action="store_true",
        help="List all available store scrapers",
    )
    args = parser.parse_args()

    if args.list_stores:
        print("\nAvailable store scrapers:")
        for slug, cls in SCRAPERS.items():
            print(f"  • {slug}: {cls.__doc__.strip().split(chr(10))[0] if cls.__doc__ else slug}")
        return

    # Ensure data directories exist
    ScraperConfig.ensure_dirs()

    if args.store:
        # Scrape a single store
        run_scraper(args.store)
    else:
        # Scrape all stores
        logger.info("🚀 Running all scrapers...")
        for slug in SCRAPERS:
            try:
                run_scraper(slug)
            except Exception as e:
                logger.error(f"Failed to scrape {slug}: {e}", exc_info=True)
                continue

    logger.info("🏁 All scraping complete!")


if __name__ == "__main__":
    main()
