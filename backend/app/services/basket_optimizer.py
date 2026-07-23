"""
FlyerWise — Smart Basket Optimizer Service

Calculates:
1. Best Single Store Basket (e.g. Maxi: $35.76)
2. Best Two-Store Combination Basket (e.g. Maxi + Adonis: $31.10)
3. Total Savings & Distance Tradeoff Insights
"""

import logging
from datetime import date
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models import Store, Product, Price, Flyer

logger = logging.getLogger("flyerwise.basket_optimizer")


def search_item_prices(db: Session, item_query: str, postal_code: Optional[str] = None) -> List[Dict[str, Any]]:
    """Find current prices across all stores for a single search item, optionally filtered by location FSA."""
    clean_query = item_query.strip()
    if not clean_query:
        return []

    query = (
        db.query(Price, Product, Store)
        .join(Product, Price.product_id == Product.id)
        .join(Store, Price.store_id == Store.id)
        .outerjoin(Flyer, Price.flyer_id == Flyer.id)
        .filter(Product.raw_name.ilike(f"%{clean_query}%"))
    )

    if postal_code:
        clean_pcode = postal_code.strip().replace(" ", "").upper()
        fsa = clean_pcode[:3]
        query = query.filter(
            (Flyer.postal_code_fsa == fsa) | (Flyer.postal_code_fsa.is_(None)) | (Store.postal_codes_served.ilike(f"%{fsa}%"))
        )

    results = query.all()

    item_offers = []
    for price_row, prod_row, store_row in results:
        item_offers.append({
            "product_id": prod_row.id,
            "product_name": prod_row.raw_name,
            "store_id": store_row.id,
            "store_name": store_row.name,
            "store_slug": store_row.slug,
            "price": float(price_row.current_price),
            "unit": price_row.unit,
            "quantity": price_row.quantity,
            "image_url": price_row.image_url,
            "valid_until": str(price_row.valid_until) if price_row.valid_until else None
        })

    return item_offers


def optimize_basket(db: Session, item_queries: List[str], postal_code: Optional[str] = None) -> Dict[str, Any]:
    """
    Calculate best 1-store and 2-store shopping list baskets.

    Args:
        db (Session): SQLAlchemy database session
        item_queries (List[str]): List of search item queries (e.g. ['milk', 'spinach', 'butter'])

    Returns:
        Dict[str, Any]: Optimization breakdown with single store, 2-store, and savings
    """
    if not item_queries:
        return {
            "item_count": 0,
            "single_store_options": [],
            "two_store_combination": None,
            "potential_savings": 0.0
        }

    # 1. Fetch offers per query
    query_offers: Dict[str, List[Dict[str, Any]]] = {}
    all_stores: Dict[int, str] = {}

    for q in item_queries:
        offers = search_item_prices(db, q, postal_code=postal_code)
        query_offers[q] = offers
        for o in offers:
            all_stores[o["store_id"]] = o["store_name"]

    # 2. Calculate single-store totals
    store_totals: Dict[int, Dict[str, Any]] = {}

    for store_id, store_name in all_stores.items():
        total_cost = 0.0
        matched_items = []
        missing_items = []

        for q in item_queries:
            # Find cheapest match for item q at store_id
            store_matches = [o for o in query_offers[q] if o["store_id"] == store_id]
            if store_matches:
                cheapest = min(store_matches, key=lambda x: x["price"])
                total_cost += cheapest["price"]
                matched_items.append({
                    "query": q,
                    "matched_name": cheapest["product_name"],
                    "price": cheapest["price"],
                    "unit": cheapest["unit"]
                })
            else:
                missing_items.append(q)

        store_totals[store_id] = {
            "store_id": store_id,
            "store_name": store_name,
            "total_cost": round(total_cost, 2),
            "matched_count": len(matched_items),
            "total_items": len(item_queries),
            "items": matched_items,
            "missing_items": missing_items
        }

    # Sort single stores by highest match count first, then lowest total cost
    sorted_single_stores = sorted(
        store_totals.values(),
        key=lambda x: (-x["matched_count"], x["total_cost"])
    )

    best_single = sorted_single_stores[0] if sorted_single_stores else None

    # 3. Calculate best 2-store combination
    best_two_combination = None
    min_two_store_cost = float("inf")

    store_ids = list(all_stores.keys())
    for i in range(len(store_ids)):
        for j in range(i + 1, len(store_ids)):
            s1_id = store_ids[i]
            s2_id = store_ids[j]

            combo_cost = 0.0
            combo_matched = 0
            combo_items = {s1_id: [], s2_id: []}

            for q in item_queries:
                o1 = [o for o in query_offers[q] if o["store_id"] == s1_id]
                o2 = [o for o in query_offers[q] if o["store_id"] == s2_id]

                p1 = min(o1, key=lambda x: x["price"]) if o1 else None
                p2 = min(o2, key=lambda x: x["price"]) if o2 else None

                if p1 and p2:
                    if p1["price"] <= p2["price"]:
                        combo_cost += p1["price"]
                        combo_items[s1_id].append({"query": q, "item": p1["product_name"], "price": p1["price"]})
                    else:
                        combo_cost += p2["price"]
                        combo_items[s2_id].append({"query": q, "item": p2["product_name"], "price": p2["price"]})
                    combo_matched += 1
                elif p1:
                    combo_cost += p1["price"]
                    combo_items[s1_id].append({"query": q, "item": p1["product_name"], "price": p1["price"]})
                    combo_matched += 1
                elif p2:
                    combo_cost += p2["price"]
                    combo_items[s2_id].append({"query": q, "item": p2["product_name"], "price": p2["price"]})
                    combo_matched += 1

            if combo_matched == len(item_queries) and combo_cost < min_two_store_cost:
                min_two_store_cost = combo_cost
                best_two_combination = {
                    "store_1": {"id": s1_id, "name": all_stores[s1_id], "items": combo_items[s1_id]},
                    "store_2": {"id": s2_id, "name": all_stores[s2_id], "items": combo_items[s2_id]},
                    "total_cost": round(combo_cost, 2)
                }

    # Calculate potential savings
    best_single_cost = best_single["total_cost"] if best_single else 0.0
    two_store_cost = best_two_combination["total_cost"] if best_two_combination else best_single_cost
    potential_savings = round(max(0.0, best_single_cost - two_store_cost), 2)

    return {
        "item_count": len(item_queries),
        "best_single_store": best_single,
        "all_single_stores": sorted_single_stores[:5],
        "best_two_store_combination": best_two_combination,
        "potential_extra_savings": potential_savings,
        "advice_banner": f"You can save up to ${potential_savings:.2f} by splitting your basket between 2 stores!" if potential_savings > 1.0 else "Shopping at a single store gives you the best value today!"
    }
