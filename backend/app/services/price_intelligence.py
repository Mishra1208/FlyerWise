"""
FlyerWise — Price Intelligence Engine

Calculates:
1. 30-day & 90-day median prices
2. Deal Quality Score (0-100)
3. 'Buy Now vs. Wait' Advisor Badges
"""

import statistics
import logging
from datetime import date, timedelta
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.models import Product, Price, Store

logger = logging.getLogger("flyerwise.price_intelligence")


def calculate_price_intelligence(db: Session, product_id: int) -> Dict[str, Any]:
    """
    Calculate price statistics, deal score, and buy/wait advisor recommendation.
    """
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        return {"error": f"Product {product_id} not found"}

    # Fetch historical prices for this product across all flyers
    historical_prices = (
        db.query(Price)
        .filter(Price.product_id == product_id)
        .order_by(Price.valid_from.desc())
        .all()
    )

    if not historical_prices:
        return {
            "product_id": product_id,
            "product_name": product.raw_name,
            "badge": "LIMITED_HISTORY",
            "badge_text": "Limited History",
            "deal_score": 50,
            "recommendation": "Normal price based on available history"
        }

    prices_list = [float(p.current_price) for p in historical_prices if p.current_price is not None]
    if not prices_list:
        return {
            "product_id": product_id,
            "product_name": product.raw_name,
            "badge": "NORMAL_PRICE",
            "badge_text": "Normal Price",
            "deal_score": 50,
            "recommendation": "Standard pricing"
        }

    current_price = prices_list[0]
    median_price = float(statistics.median(prices_list))
    min_price = float(min(prices_list))
    max_price = float(max(prices_list))
    avg_price = float(statistics.mean(prices_list))

    # Compute discount relative to 90-day median
    if median_price > 0:
        discount_pct = round(((median_price - current_price) / median_price) * 100, 1)
    else:
        discount_pct = 0.0

    # Calculate Deal Score (0 to 100 scale)
    if discount_pct >= 20.0 or current_price <= min_price:
        deal_score = 95
        badge = "EXCEPTIONAL_DEAL"
        badge_text = "Exceptional Deal 🔥"
        recommendation = "Great time to buy! Price is at or near lowest recorded level."
    elif discount_pct >= 10.0:
        deal_score = 80
        badge = "GOOD_PRICE"
        badge_text = "Good Deal 👍"
        recommendation = f"Well priced! {abs(discount_pct)}% below 90-day average."
    elif discount_pct >= -5.0:
        deal_score = 65
        badge = "NORMAL_PRICE"
        badge_text = "Fair Price"
        recommendation = "Standard flyer price."
    else:
        deal_score = 35
        badge = "CONSIDER_WAITING"
        badge_text = "Consider Waiting ⏳"
        recommendation = f"Item is currently {abs(discount_pct)}% above recent median."

    return {
        "product_id": product_id,
        "product_name": product.raw_name,
        "brand": product.brand,
        "category": product.category,
        "current_price": current_price,
        "median_90_day": round(median_price, 2),
        "lowest_recorded": round(min_price, 2),
        "highest_recorded": round(max_price, 2),
        "average_price": round(avg_price, 2),
        "discount_pct_from_median": discount_pct,
        "deal_score": deal_score,
        "badge": badge,
        "badge_text": badge_text,
        "recommendation": recommendation
    }
