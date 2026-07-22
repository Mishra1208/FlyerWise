"""
Products Router

Endpoints for searching products and retrieving product details.
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import text, func
from decimal import Decimal

from app.database import get_db
from app.models import Product, Price, Store
from app.schemas import (
    SearchResponse, SearchResult, ProductResponse,
    PriceWithStore, StoreResponse
)

from unidecode import unidecode

FR_EN_QUERY_TRANSLATIONS = {
    "tomate": "tomato",
    "tomates": "tomato",
    "pomme": "apple",
    "pommes": "apple",
    "lait": "milk",
    "pain": "bread",
    "beurre": "butter",
    "fromage": "cheese",
    "poulet": "chicken",
    "boeuf": "beef",
    "porc": "pork",
    "oeuf": "egg",
    "oeufs": "egg",
    "riz": "rice",
    "sucre": "sugar",
    "sel": "salt",
    "oignon": "onion",
    "oignons": "onion",
    "patate": "potato",
    "patates": "potato",
    "pomme de terre": "potato",
    "pommes de terre": "potato",
    "fraises": "strawberry",
    "fraise": "strawberry",
    "banane": "banana",
    "bananes": "banana",
    "grappe": "vine",
    "vigne": "vine",
}

def translate_query_to_english(q: str) -> str:
    """Translate common French grocery terms to English for bilingual search support."""
    # Lowercase & remove accents
    name = unidecode(q.lower().strip())
    
    # Simple token phrase translations
    words = name.split()
    translated_words = []
    i = 0
    while i < len(words):
        matched = False
        # check 3-word phrase (pomme de terre)
        for phrase_len in range(3, 0, -1):
            if i + phrase_len <= len(words):
                phrase = " ".join(words[i : i + phrase_len])
                if phrase in FR_EN_QUERY_TRANSLATIONS:
                    translated_words.append(FR_EN_QUERY_TRANSLATIONS[phrase])
                    i += phrase_len
                    matched = True
                    break
        if not matched:
            word = words[i]
            translated_words.append(FR_EN_QUERY_TRANSLATIONS.get(word, word))
            i += 1
            
    return " ".join(translated_words)


from datetime import date, timedelta

router = APIRouter(prefix="/products", tags=["products"])


@router.get("/search", response_model=SearchResponse)
def search_products(
    q: str = Query(..., min_length=1, max_length=200, description="Search query"),
    flyer_filter: str = Query("all", description="Flyer status filter: all, active, upcoming, recent"),
    db: Session = Depends(get_db),
):
    """
    Search for products across all stores.

    Uses PostgreSQL full-text search with trigram fallback for fuzzy matching.
    Returns products grouped with their prices across stores, classified by flyer status
    (active, expiring_today, upcoming, recent_sale).
    """
    # Translate bilingual query tokens
    q_translated = translate_query_to_english(q)

    # Step 1: Full-text search on BOTH normalized_name AND search_tags
    fts_query = func.plainto_tsquery("english", q_translated)
    
    name_match = func.to_tsvector("english", Product.normalized_name).op("@@")(fts_query)
    tags_match = func.to_tsvector(
        "english", func.coalesce(Product.search_tags, "")
    ).op("@@")(fts_query)
    
    fts_results = (
        db.query(Product)
        .filter(name_match | tags_match)
        .limit(50)
        .all()
    )

    # Step 2: If no FTS results, fall back to trigram similarity on name
    if not fts_results:
        fts_results = (
            db.query(Product)
            .filter(Product.normalized_name.op("%")(q_translated))  # pg_trgm similarity
            .order_by(func.similarity(Product.normalized_name, q_translated).desc())
            .limit(50)
            .all()
        )

    # Step 3: Build search results with prices from all stores
    results: list[SearchResult] = []
    today = date.today()
    cutoff_past = today - timedelta(days=14)
    cutoff_future = today + timedelta(days=7)

    product_ids = [p.id for p in fts_results]
    if not product_ids:
        return SearchResponse(query=q, total_results=0, results=[])

    # Batch query ALL prices for matched products in 1 fast query with joined stores
    all_matched_prices = (
        db.query(Price)
        .options(joinedload(Price.store))
        .filter(
            Price.product_id.in_(product_ids),
            (Price.valid_until >= cutoff_past) | (Price.valid_until.is_(None)),
            (Price.valid_from <= cutoff_future) | (Price.valid_from.is_(None)),
        )
        .order_by(Price.current_price.asc())
        .all()
    )

    # Group prices by product_id
    prices_by_product = {}
    for p in all_matched_prices:
        prices_by_product.setdefault(p.product_id, []).append(p)

    for product in fts_results:
        product_prices = prices_by_product.get(product.id, [])
        if not product_prices:
            continue

        # Build price entries with flyer status classification
        price_entries = []
        for price in product_prices:
            # Classify flyer status
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

            # Apply user flyer_filter if set
            if flyer_filter == "active" and status not in ("active", "expiring_today"):
                continue
            elif flyer_filter == "upcoming" and status != "upcoming":
                continue
            elif flyer_filter == "recent" and status != "recent_sale":
                continue

            store = price.store
            price_entries.append(
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
                    is_lowest=False,
                    flyer_status=status,
                    is_historical=is_hist,
                )
            )

        if not price_entries:
            continue

        # Mark lowest price among active/expiring/upcoming prices
        active_entries = [p for p in price_entries if not p.is_historical]
        lowest_ref = active_entries if active_entries else price_entries
        lowest_val = min(p.current_price for p in lowest_ref)
        highest_val = max(p.current_price for p in lowest_ref)

        for p_entry in price_entries:
            if p_entry.current_price == lowest_val and not p_entry.is_historical:
                p_entry.is_lowest = True

        results.append(
            SearchResult(
                product=ProductResponse(
                    id=product.id,
                    raw_name=product.raw_name,
                    normalized_name=product.normalized_name,
                    category=product.category,
                    brand=product.brand,
                    image_url=product.image_url,
                    created_at=product.created_at,
                ),
                prices=price_entries,
                lowest_price=lowest_val,
                highest_price=highest_val,
                savings_potential=highest_val - lowest_val if len(price_entries) > 1 else Decimal("0"),
                store_count=len(set(p.store.id for p in price_entries)),
            )
        )

    # Sort results: items with more store coverage first, then by lowest price
    results.sort(key=lambda r: (-r.store_count, r.lowest_price or Decimal("999")))

    # Log the search (fire-and-forget, don't block response)
    from app.models import SearchHistory
    log = SearchHistory(query=q, results_count=len(results))
    db.add(log)
    db.commit()

    return SearchResponse(
        query=q,
        total_results=len(results),
        results=results,
    )


from app.services.barcode import BarcodeResolver


@router.get("/barcode/{barcode_number}")
def search_by_barcode(
    barcode_number: str,
    flyer_filter: str = Query("all"),
    db: Session = Depends(get_db),
):
    """
    Lookup a universal UPC/EAN barcode via Open Food Facts API,
    resolve canonical brand & product title, and return cross-store flyer deals.
    """
    barcode_info = BarcodeResolver.resolve(barcode_number)

    if not barcode_info or not barcode_info.get("canonical_query"):
        # Fallback: search raw barcode string directly
        return search_products(q=barcode_number, flyer_filter=flyer_filter, db=db)

    # Search FlyerWise database using the resolved canonical query terms (brand + name)
    search_query = barcode_info["canonical_query"]
    search_res = search_products(q=search_query, flyer_filter=flyer_filter, db=db)

    return {
        "barcode": barcode_info["barcode"],
        "resolved_brand": barcode_info.get("brand"),
        "resolved_name": barcode_info.get("product_name"),
        "resolved_quantity": barcode_info.get("quantity"),
        "canonical_query": search_query,
        "query": search_res.query,
        "total_results": search_res.total_results,
        "results": search_res.results,
    }


@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db)):
    """Get a specific product by ID."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Product not found")
    return product
