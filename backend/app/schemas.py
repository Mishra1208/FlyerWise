"""
FlyerWise Pydantic Schemas

Request/Response schemas for the API endpoints.
"""

from datetime import datetime, date
from decimal import Decimal
from pydantic import BaseModel, ConfigDict


# ============================================
# Store Schemas
# ============================================

class StoreBase(BaseModel):
    name: str
    slug: str
    logo_url: str | None = None
    website_url: str | None = None
    flyer_url: str | None = None
    color: str | None = None


class StoreResponse(StoreBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ============================================
# Product Schemas
# ============================================

class ProductBase(BaseModel):
    raw_name: str
    normalized_name: str
    category: str | None = None
    brand: str | None = None
    image_url: str | None = None
    description: str | None = None
    ingredients: str | None = None
    nutrition_facts: dict | None = None


class ProductResponse(ProductBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ============================================
# Price Schemas
# ============================================

class PriceBase(BaseModel):
    current_price: Decimal
    original_price: Decimal | None = None
    savings: str | None = None
    unit: str | None = None
    quantity: str | None = None
    price_text: str | None = None
    description: str | None = None
    image_url: str | None = None
    valid_from: date | None = None
    valid_until: date | None = None


class PriceResponse(PriceBase):
    id: int
    product_id: int
    store_id: int
    flyer_id: int | None = None
    scraped_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PriceWithStore(PriceBase):
    """Price entry enriched with store information — used in comparison views."""
    id: int
    product_id: int
    store: StoreResponse
    is_lowest: bool = False
    flyer_status: str = "active"  # "active" | "expiring_today" | "upcoming" | "recent_sale"
    is_historical: bool = False

    model_config = ConfigDict(from_attributes=True)


# ============================================
# Search & Comparison Schemas
# ============================================

class SearchResult(BaseModel):
    """A product with all its current prices across stores."""
    product: ProductResponse
    prices: list[PriceWithStore]
    lowest_price: Decimal | None = None
    highest_price: Decimal | None = None
    savings_potential: Decimal | None = None  # highest - lowest
    store_count: int = 0


class SearchResponse(BaseModel):
    """Response for the /api/search endpoint."""
    query: str
    total_results: int
    results: list[SearchResult]


class DealResponse(BaseModel):
    """A deal entry for the deals/featured endpoint."""
    product: ProductResponse
    price: PriceWithStore
    discount_percentage: float | None = None


# ============================================
# Flyer Schemas
# ============================================

class FlyerResponse(BaseModel):
    id: int
    store_id: int
    start_date: date
    end_date: date
    status: str
    items_count: int
    scraped_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ============================================
# Health Check
# ============================================

class HealthResponse(BaseModel):
    status: str
    version: str
    database: str
    stores_count: int
    products_count: int
    active_prices: int
