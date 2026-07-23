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
    Get store price rankings across all stores for a specific product.
    Matches products sharing title tokens, sorted ascending by price with #1 lowest flagged.
    """
    from datetime import date
    today = date.today()

    target = db.query(Product).filter(Product.id == product_id).first()
    if not target:
        return []

    # Extract key title search tokens (first 2 words)
    raw_words = [w for w in target.raw_name.split() if len(w) > 2][:2]
    token_pattern = "%".join(raw_words) if raw_words else target.raw_name[:10]

    # Find matching product variations across stores
    matching_prods = db.query(Product).filter(
        (Product.normalized_name == target.normalized_name) | 
        (Product.raw_name.ilike(f"%{token_pattern}%"))
    ).all()

    product_ids = [p.id for p in matching_prods]
    if not product_ids:
        product_ids = [product_id]

    prices = (
        db.query(Price)
        .join(Store, Price.store_id == Store.id)
        .filter(Price.product_id.in_(product_ids))
        .order_by(Price.current_price.asc())
        .all()
    )

    if not prices:
        return []

    # Deduplicate: keep cheapest price per store
    store_map = {}
    for p in prices:
        s_id = p.store_id
        if s_id not in store_map:
            store_map[s_id] = p
        else:
            existing = store_map[s_id]
            if float(p.current_price) < float(existing.current_price):
                store_map[s_id] = p

    sorted_prices = sorted(store_map.values(), key=lambda p: float(p.current_price))
    lowest_val = float(sorted_prices[0].current_price) if sorted_prices else 0.0

    result = []
    for price in sorted_prices:
        v_until = price.valid_until
        v_from = price.valid_from

        if v_until and v_until < today:
            status = "recent_sale"
            is_hist = True
        elif v_from and v_from > today:
            status = "upcoming"
            is_hist = False
        elif v_until and v_until == today:
            status = "expiring_today"
            is_hist = False
        else:
            status = "active"
            is_hist = False

        store = price.store
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
                is_lowest=(float(price.current_price) == lowest_val),
                flyer_status=status,
                is_historical=is_hist,
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
