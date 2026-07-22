"""
FlyerWise Database Writer

Handles inserting scraped product data into PostgreSQL.
Manages product deduplication and price updates.
"""

import logging
from datetime import datetime, date
from typing import Optional

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.dialects.postgresql import insert as pg_insert

# Import from the backend models (shared schema)
import sys
import os

# Add backend to path so we can import models
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "backend"))

from app.models import Store, Flyer, Product, Price, ScrapeLog
from app.database import Base

from scraper.config import ScraperConfig
from scraper.base_scraper import ScrapedProduct
from scraper.utils.normalizer import normalize_product_name, extract_brand, guess_category, generate_search_tags

logger = logging.getLogger(__name__)


class DatabaseWriter:
    """
    Writes scraped product data to PostgreSQL.

    Handles:
    - Finding or creating the store record
    - Creating flyer records
    - Deduplicating products by normalized name
    - Inserting/updating price records
    - Logging scrape runs
    """

    def __init__(self, database_url: str = None):
        url = database_url or ScraperConfig.DATABASE_URL
        if url.startswith("postgresql://"):
            url = url.replace("postgresql://", "postgresql+psycopg://", 1)
        self.engine = create_engine(url, echo=False)
        self.SessionLocal = sessionmaker(bind=self.engine)

    def get_session(self) -> Session:
        return self.SessionLocal()

    def get_or_create_store(
        self,
        session: Session,
        store_slug: str,
        store_name: Optional[str] = None,
        logo_url: Optional[str] = None,
    ) -> Store:
        """Get a store by slug, or dynamically create if it doesn't exist."""
        store = session.query(Store).filter(Store.slug == store_slug).first()
        if not store:
            name = store_name or store_slug.replace("-", " ").title()
            logger.info(f"➕ Auto-creating missing store: {name} ({store_slug})")
            store = Store(
                name=name,
                slug=store_slug,
                logo_url=logo_url,
            )
            session.add(store)
            session.flush()
        return store

    def create_flyer(
        self,
        session: Session,
        store: Store,
        start_date: date,
        end_date: date,
        flyer_url: Optional[str] = None,
    ) -> Flyer:
        """Create a new flyer record, or return existing one if dates match."""
        existing = (
            session.query(Flyer)
            .filter(
                Flyer.store_id == store.id,
                Flyer.start_date == start_date,
                Flyer.end_date == end_date,
            )
            .first()
        )

        if existing:
            logger.info(f"Flyer already exists for {store.name}: {start_date} - {end_date}")
            return existing

        flyer = Flyer(
            store_id=store.id,
            start_date=start_date,
            end_date=end_date,
            flyer_url=flyer_url,
            status="active",
        )
        session.add(flyer)
        session.flush()  # Get the ID without committing
        logger.info(f"Created flyer for {store.name}: {start_date} - {end_date}")
        return flyer

    def find_or_create_product(
        self, session: Session, scraped: ScrapedProduct
    ) -> Product:
        """
        Find an existing product by normalized name, or create a new one.

        Uses normalized name matching to deduplicate products across stores.
        """
        normalized = normalize_product_name(scraped.raw_name)
        brand = scraped.brand or extract_brand(scraped.raw_name)
        category = scraped.category or guess_category(normalized)
        tags = generate_search_tags(scraped.raw_name, brand)

        # Try to find by exact normalized name
        product = (
            session.query(Product)
            .filter(Product.normalized_name == normalized)
            .first()
        )

        if product:
            # Update image if we have one and they don't
            if scraped.image_url and not product.image_url:
                product.image_url = scraped.image_url
            if category and not product.category:
                product.category = category
            # Always refresh tags (picks up rule improvements)
            if tags:
                product.search_tags = tags
            return product

        # Create new product
        product = Product(
            raw_name=scraped.raw_name,
            normalized_name=normalized,
            category=category,
            brand=brand,
            search_tags=tags,
            image_url=scraped.image_url,
        )
        session.add(product)
        session.flush()
        logger.debug(f"Created product: {scraped.raw_name} → {normalized}")
        return product

    def insert_price(
        self,
        session: Session,
        product: Product,
        store: Store,
        flyer: Flyer,
        scraped: ScrapedProduct,
    ) -> Price:
        """Insert a price record, updating if one already exists for this product+store+flyer."""
        existing = (
            session.query(Price)
            .filter(
                Price.product_id == product.id,
                Price.store_id == store.id,
                Price.flyer_id == flyer.id,
            )
            .first()
        )

        if existing:
            # Update existing price
            existing.current_price = scraped.current_price
            existing.original_price = scraped.original_price
            existing.savings = scraped.savings
            existing.unit = scraped.unit
            existing.quantity = scraped.quantity
            existing.price_text = scraped.price_text
            existing.description = scraped.description
            existing.image_url = scraped.image_url or existing.image_url
            existing.valid_from = scraped.valid_from
            existing.valid_until = scraped.valid_until
            return existing

        price = Price(
            product_id=product.id,
            store_id=store.id,
            flyer_id=flyer.id,
            current_price=scraped.current_price,
            original_price=scraped.original_price,
            savings=scraped.savings,
            unit=scraped.unit,
            quantity=scraped.quantity,
            price_text=scraped.price_text,
            description=scraped.description,
            image_url=scraped.image_url,
            valid_from=scraped.valid_from,
            valid_until=scraped.valid_until,
        )
        session.add(price)
        return price

    def save_scraped_data(
        self,
        store_slug: str,
        products: list[ScrapedProduct],
        flyer_start: date,
        flyer_end: date,
        flyer_url: Optional[str] = None,
        store_name: Optional[str] = None,
        logo_url: Optional[str] = None,
    ) -> int:
        """
        Save a batch of scraped products to the database.

        This is the main entry point called after scraping completes.

        Returns:
            int: Number of price records saved.
        """
        session = self.get_session()
        saved_count = 0

        try:
            store = self.get_or_create_store(
                session, store_slug=store_slug, store_name=store_name, logo_url=logo_url
            )
            flyer = self.create_flyer(session, store, flyer_start, flyer_end, flyer_url)

            # Start scrape log
            scrape_log = ScrapeLog(store_id=store.id, status="running")
            session.add(scrape_log)
            session.flush()

            for scraped in products:
                try:
                    product = self.find_or_create_product(session, scraped)
                    self.insert_price(session, product, store, flyer, scraped)
                    saved_count += 1
                except Exception as e:
                    logger.warning(
                        f"Failed to save product '{scraped.raw_name}': {e}"
                    )
                    continue

            # Update flyer item count
            flyer.items_count = saved_count

            # Complete scrape log
            scrape_log.status = "success"
            scrape_log.items_scraped = saved_count
            scrape_log.finished_at = datetime.utcnow()

            session.commit()
            logger.info(
                f"💾 Saved {saved_count}/{len(products)} products for {store.name}"
            )

        except Exception as e:
            session.rollback()
            logger.error(f"Failed to save data for {store_slug}: {e}", exc_info=True)

            # Log the failure
            try:
                fail_log = ScrapeLog(
                    store_id=store.id if "store" in dir() else None,
                    status="failed",
                    error_message=str(e),
                    finished_at=datetime.utcnow(),
                )
                session.add(fail_log)
                session.commit()
            except Exception:
                pass

        finally:
            session.close()

        return saved_count
