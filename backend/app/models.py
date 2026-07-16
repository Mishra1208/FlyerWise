"""
FlyerWise ORM Models

SQLAlchemy models matching the PostgreSQL schema defined in db/init.sql.
"""

from datetime import datetime, date
from decimal import Decimal
from sqlalchemy import (
    String, Integer, Text, Boolean, Date, DateTime, Numeric,
    ForeignKey, UniqueConstraint, Index, func
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class Store(Base):
    """A grocery retailer (Walmart, Maxi, Metro, etc.)."""

    __tablename__ = "stores"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    slug: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    logo_url: Mapped[str | None] = mapped_column(String(500))
    website_url: Mapped[str | None] = mapped_column(String(500))
    flyer_url: Mapped[str | None] = mapped_column(String(500))
    color: Mapped[str | None] = mapped_column(String(7))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    flyers: Mapped[list["Flyer"]] = relationship(back_populates="store", cascade="all, delete-orphan")
    prices: Mapped[list["Price"]] = relationship(back_populates="store", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Store(id={self.id}, name='{self.name}')>"


class Flyer(Base):
    """A weekly flyer from a specific store."""

    __tablename__ = "flyers"

    id: Mapped[int] = mapped_column(primary_key=True)
    store_id: Mapped[int] = mapped_column(ForeignKey("stores.id", ondelete="CASCADE"), nullable=False)
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date] = mapped_column(Date, nullable=False)
    flyer_url: Mapped[str | None] = mapped_column(String(500))
    scraped_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    status: Mapped[str] = mapped_column(String(20), default="active")
    items_count: Mapped[int] = mapped_column(Integer, default=0)

    # Relationships
    store: Mapped["Store"] = relationship(back_populates="flyers")
    prices: Mapped[list["Price"]] = relationship(back_populates="flyer")

    __table_args__ = (
        UniqueConstraint("store_id", "start_date", "end_date", name="uq_flyer_store_dates"),
    )

    def __repr__(self) -> str:
        return f"<Flyer(id={self.id}, store_id={self.store_id}, {self.start_date} - {self.end_date})>"


class Product(Base):
    """A grocery product with normalized name for cross-store matching."""

    __tablename__ = "products"

    id: Mapped[int] = mapped_column(primary_key=True)
    raw_name: Mapped[str] = mapped_column(String(500), nullable=False)
    normalized_name: Mapped[str] = mapped_column(String(500), nullable=False)
    category: Mapped[str | None] = mapped_column(String(100))
    brand: Mapped[str | None] = mapped_column(String(200))
    image_url: Mapped[str | None] = mapped_column(String(500))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    prices: Mapped[list["Price"]] = relationship(back_populates="product", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Product(id={self.id}, name='{self.raw_name[:40]}')>"


class Price(Base):
    """A price entry linking a product to a store for a specific flyer period."""

    __tablename__ = "prices"

    id: Mapped[int] = mapped_column(primary_key=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    store_id: Mapped[int] = mapped_column(ForeignKey("stores.id", ondelete="CASCADE"), nullable=False)
    flyer_id: Mapped[int | None] = mapped_column(ForeignKey("flyers.id", ondelete="SET NULL"))
    current_price: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    original_price: Mapped[Decimal | None] = mapped_column(Numeric(10, 2))
    savings: Mapped[str | None] = mapped_column(String(100))
    unit: Mapped[str | None] = mapped_column(String(50))
    quantity: Mapped[str | None] = mapped_column(String(100))
    price_text: Mapped[str | None] = mapped_column(String(200))
    description: Mapped[str | None] = mapped_column(Text)
    image_url: Mapped[str | None] = mapped_column(String(500))
    valid_from: Mapped[date | None] = mapped_column(Date)
    valid_until: Mapped[date | None] = mapped_column(Date)
    scraped_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # Relationships
    product: Mapped["Product"] = relationship(back_populates="prices")
    store: Mapped["Store"] = relationship(back_populates="prices")
    flyer: Mapped["Flyer | None"] = relationship(back_populates="prices")

    __table_args__ = (
        UniqueConstraint("product_id", "store_id", "flyer_id", name="uq_price_product_store_flyer"),
    )

    def __repr__(self) -> str:
        return f"<Price(id={self.id}, product_id={self.product_id}, store_id={self.store_id}, ${self.current_price})>"


class SearchHistory(Base):
    """Tracks user searches for autocomplete suggestions."""

    __tablename__ = "search_history"

    id: Mapped[int] = mapped_column(primary_key=True)
    query: Mapped[str] = mapped_column(String(200), nullable=False)
    results_count: Mapped[int] = mapped_column(Integer, default=0)
    searched_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )


class ScrapeLog(Base):
    """Tracks scraper execution history for monitoring."""

    __tablename__ = "scrape_log"

    id: Mapped[int] = mapped_column(primary_key=True)
    store_id: Mapped[int | None] = mapped_column(ForeignKey("stores.id", ondelete="CASCADE"))
    started_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    finished_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    status: Mapped[str] = mapped_column(String(20), default="running")
    items_scraped: Mapped[int] = mapped_column(Integer, default=0)
    error_message: Mapped[str | None] = mapped_column(Text)
