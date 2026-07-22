"""
Prices Router

Endpoints for price comparison and deals.
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from decimal import Decimal

from app.database import get_db
from app.models import Price, Product, Store
from app.schemas import (
    PriceResponse, PriceWithStore, StoreResponse,
    DealResponse, ProductResponse
)

router = APIRouter(prefix="/prices", tags=["prices"])


@router.get("/compare/{product_id}", response_model=list[PriceWithStore])
def compare_prices(product_id: int, db: Session = Depends(get_db)):
    """
    Get all current store prices for a specific product.
    Returns prices sorted by current_price ascending, with the lowest flagged.
    """
    prices = (
        db.query(Price)
        .join(Store, Price.store_id == Store.id)
        .filter(
            Price.product_id == product_id,
            Price.valid_until >= func.current_date(),
        )
        .order_by(Price.current_price.asc())
        .all()
    )

    if not prices:
        return []

    lowest = prices[0].current_price

    seen_keys = set()
    result = []
    for price in prices:
        dedup_key = (price.store_id, float(price.current_price), price.unit or "")
        if dedup_key in seen_keys:
            continue
        seen_keys.add(dedup_key)

        store = db.query(Store).filter(Store.id == price.store_id).first()
        result.append(
            PriceWithStore(
                id=price.id,
                product_id=price.product_id,
                current_price=price.current_price,
                original_price=price.original_price,
                savings=price.savings,
                unit=price.unit,
                quantity=price.quantity,
                price_text=price.price_text,
                description=price.description,
                image_url=price.image_url,
                valid_from=price.valid_from,
                valid_until=price.valid_until,
                store=StoreResponse(
                    id=store.id,
                    name=store.name,
                    slug=store.slug,
                    logo_url=store.logo_url,
                    website_url=store.website_url,
                    flyer_url=store.flyer_url,
                    color=store.color,
                    created_at=store.created_at,
                ),
                is_lowest=(price.current_price == lowest),
            )
        )

    return result


@router.get("/deals", response_model=list[DealResponse])
def get_top_deals(
    limit: int = Query(default=20, le=100),
    db: Session = Depends(get_db),
):
    """
    Get top deals across all stores.
    Returns items with the biggest savings (original_price - current_price).
    """
    prices = (
        db.query(Price)
        .filter(
            Price.valid_until >= func.current_date(),
            Price.original_price.isnot(None),
            Price.original_price > Price.current_price,
        )
        .order_by((Price.original_price - Price.current_price).desc())
        .limit(limit)
        .all()
    )

    deals = []
    for price in prices:
        product = db.query(Product).filter(Product.id == price.product_id).first()
        store = db.query(Store).filter(Store.id == price.store_id).first()

        discount_pct = None
        if price.original_price and price.original_price > 0:
            discount_pct = float(
                ((price.original_price - price.current_price) / price.original_price) * 100
            )

        deals.append(
            DealResponse(
                product=ProductResponse(
                    id=product.id,
                    raw_name=product.raw_name,
                    normalized_name=product.normalized_name,
                    category=product.category,
                    brand=product.brand,
                    image_url=product.image_url,
                    created_at=product.created_at,
                ),
                price=PriceWithStore(
                    id=price.id,
                    product_id=price.product_id,
                    current_price=price.current_price,
                    original_price=price.original_price,
                    savings=price.savings,
                    unit=price.unit,
                    quantity=price.quantity,
                    price_text=price.price_text,
                    description=price.description,
                    image_url=price.image_url,
                    valid_from=price.valid_from,
                    valid_until=price.valid_until,
                    store=StoreResponse(
                        id=store.id,
                        name=store.name,
                        slug=store.slug,
                        logo_url=store.logo_url,
                        website_url=store.website_url,
                        flyer_url=store.flyer_url,
                        color=store.color,
                        created_at=store.created_at,
                    ),
                    is_lowest=False,
                ),
                discount_percentage=discount_pct,
            )
        )

    return deals


@router.get("/history/{product_id}", response_model=list[PriceResponse])
def get_price_history(
    product_id: int,
    store_id: int | None = None,
    db: Session = Depends(get_db),
):
    """
    Get price history for a product (optionally filtered by store).
    Useful for showing price trends over time.
    """
    query = db.query(Price).filter(Price.product_id == product_id)

    if store_id:
        query = query.filter(Price.store_id == store_id)

    prices = query.order_by(Price.valid_from.asc()).all()
    return prices
