"""
Products Router

Endpoints for searching products and retrieving product details.
"""

import re
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import text, func, or_
from decimal import Decimal

from app.database import get_db
from app.models import Product, Price, Store
from app.schemas import (
    SearchResponse, SearchResult, ProductResponse,
    PriceWithStore, StoreResponse
)
from app.services.nutrition_helper import generate_product_details, generate_fast_product_details
from app.services.price_intelligence import calculate_price_intelligence

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
    postal_code: str = Query("H4G2Y5", description="Canadian postal code for location-aware results"),
    db: Session = Depends(get_db),
):
    """
    Search for products across all stores.

    Uses PostgreSQL full-text search with trigram fallback for fuzzy matching.
    Returns products grouped with their prices across stores, classified by flyer status
    (active, expiring_today, upcoming, recent_sale).
    """
    # Translate bilingual query tokens
    # Translate bilingual query tokens
    q_translated = translate_query_to_english(q)

    # Build bilingual query patterns & grocery concept expansions
    q_raw = q.lower().strip()
    q_trans = q_translated.lower().strip()
    equiv_terms = [q_raw, q_trans]

    CONCEPT_EQUIVALENTS = {
        "corn": ["corn", "maïs", "mais", "épis", "epis"],
        "maïs": ["maïs", "mais", "corn", "épis", "epis"],
        "mais": ["maïs", "mais", "corn", "épis", "epis"],
        "spaghetti": ["spaghetti", "spaghettini", "pâtes", "pates", "pasta", "macaroni", "penne"],
        "spaghettini": ["spaghetti", "spaghettini", "pâtes", "pates", "pasta"],
        "pasta": ["pasta", "pâtes", "pates", "spaghetti", "spaghettini", "macaroni", "penne"],
        "pâtes": ["pâtes", "pates", "pasta", "spaghetti", "spaghettini", "macaroni"],
        "pates": ["pâtes", "pates", "pasta", "spaghetti", "spaghettini", "macaroni"],
        "butter": ["butter", "beurre", "margarine", "ghee", "lactantia"],
        "beurre": ["beurre", "butter", "margarine", "ghee", "lactantia"],
        "chicken": ["chicken", "poulet", "cuisses", "volaille", "ailes", "hauts"],
        "poulet": ["poulet", "chicken", "cuisses", "volaille", "ailes", "hauts"],
        "milk": ["milk", "lait", "natrel", "lactantia"],
        "lait": ["lait", "milk", "natrel", "lactantia"],
        "beef": ["beef", "boeuf", "haché", "hache", "steak"],
        "boeuf": ["boeuf", "beef", "haché", "hache", "steak"],
        "cheese": ["cheese", "fromage", "cheddar", "mozzarella"],
        "fromage": ["fromage", "cheese", "cheddar", "mozzarella"],
        "apple": ["apple", "pomme", "apples", "pommes"],
        "pomme": ["pomme", "apple", "pommes", "apples"],
        "strawberry": ["strawberry", "fraise", "strawberries", "fraises"],
        "fraise": ["fraise", "strawberry", "fraises", "strawberries"],
        "banana": ["banana", "banane", "bananas", "bananes"],
        "banane": ["banane", "banana", "bananes", "bananas"],
        "grape": ["grape", "raisin", "grapes", "raisins"],
        "raisin": ["raisin", "grape", "raisins", "grapes"],
        "potato": ["potato", "patate", "pomme de terre", "potatoes", "patates"],
        "patate": ["patate", "potato", "pomme de terre", "potatoes", "patates"],
        "onion": ["onion", "oignon", "onions", "oignons"],
        "oignon": ["oignon", "onion", "oignons", "onions"],
        "garlic": ["garlic", "ail"],
        "ail": ["ail", "garlic"],
        "carrot": ["carrot", "carotte", "carrots", "carottes"],
        "carotte": ["carotte", "carrot", "carottes", "carrots"],
        "cucumber": ["cucumber", "concombre", "cucumbers", "concombres"],
        "concombre": ["concombre", "cucumber", "concombres", "cucumbers"],
        "lettuce": ["lettuce", "laitue", "salade"],
        "laitue": ["laitue", "lettuce", "salade"],
        "spinach": ["spinach", "épinard", "épinards", "epinard", "epinards"],
        "épinard": ["épinard", "spinach", "épinards", "epinard", "epinards"],
        "celery": ["celery", "céleri", "celeri"],
        "céleri": ["céleri", "celery", "celeri"],
        "pork": ["pork", "porc", "bacon", "jambon", "ham"],
        "porc": ["porc", "pork", "bacon", "jambon", "ham"],
        "salmon": ["salmon", "saumon"],
        "saumon": ["saumon", "salmon"],
        "shrimp": ["shrimp", "crevette", "shrimps", "crevettes"],
        "crevette": ["crevette", "shrimp", "crevettes", "shrimps"],
        "egg": ["egg", "oeuf", "eggs", "oeufs", "œuf"],
        "oeuf": ["oeuf", "egg", "oeufs", "eggs", "œuf"],
        "rice": ["rice", "riz"],
        "riz": ["riz", "rice"],
        "flour": ["flour", "farine"],
        "farine": ["farine", "flour"],
        "sugar": ["sugar", "sucre"],
        "sucre": ["sucre", "sugar"],
        "oil": ["oil", "huile"],
        "huile": ["huile", "oil"],
        "juice": ["juice", "jus"],
        "jus": ["jus", "juice"],
        "water": ["water", "eau", "eska", "perrier"],
        "eau": ["eau", "water", "eska", "perrier"],
        "coffee": ["coffee", "café", "cafe"],
        "café": ["café", "coffee", "cafe"],
        "tea": ["tea", "thé"],
        "thé": ["thé", "tea", "the"],
        "chips": ["chips", "croustilles"],
        "croustilles": ["croustilles", "chips"],
        "tissue": ["tissue", "mouchoir", "tissues", "mouchoirs"],
        "mouchoir": ["mouchoir", "tissue", "mouchoirs", "tissues"],
        "towel": ["towel", "essuie-tout", "towels", "serviettes"],
        "essuie-tout": ["essuie-tout", "towel", "serviettes"],
    }

    for term in [q_raw, q_trans]:
        if term in CONCEPT_EQUIVALENTS:
            equiv_terms.extend(CONCEPT_EQUIVALENTS[term])

    # Step 1: Query products JOINED with prices valid in current/upcoming flyer period
    today = date.today()
    cutoff_past = today - timedelta(days=14)

    title_conditions = [
        Product.raw_name.ilike(f"%{term}%") | Product.normalized_name.ilike(f"%{term}%")
        for term in set(equiv_terms)
    ]

    fts_query = func.plainto_tsquery("english", q_translated)
    name_match = func.to_tsvector("english", Product.normalized_name).op("@@")(fts_query)
    tags_match = func.to_tsvector(
        "english", func.coalesce(Product.search_tags, "")
    ).op("@@")(fts_query)

    active_title_filter = or_(*title_conditions) | name_match | tags_match

    # Priority query: Products with active or upcoming flyer prices
    active_fts_results = (
        db.query(Product)
        .join(Price, Price.product_id == Product.id)
        .filter(
            active_title_filter,
            (Price.valid_until >= cutoff_past) | (Price.valid_until.is_(None))
        )
        .order_by(Price.valid_from.desc().nulls_last(), Price.current_price.asc())
        .limit(100)
        .all()
    )

    # Deduplicate while preserving order
    seen_ids = set()
    fts_results = []
    for p in active_fts_results:
        if p.id not in seen_ids:
            seen_ids.add(p.id)
            fts_results.append(p)

    # Fallback query if active items < 20
    if len(fts_results) < 20:
        fallback_results = (
            db.query(Product)
            .filter(active_title_filter)
            .limit(100)
            .all()
        )
        for p in fallback_results:
            if p.id not in seen_ids:
                seen_ids.add(p.id)
                fts_results.append(p)

    # Step 2: If no FTS results, fall back to trigram similarity on name
    if not fts_results:
        fts_results = (
            db.query(Product)
            .filter(Product.normalized_name.op("%")(q_translated))  # pg_trgm similarity
            .order_by(func.similarity(Product.normalized_name, q_translated).desc())
            .limit(100)
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

        # Deduplicate identical store price listings (e.g. repeated flyer entries for same store/price)
        seen_keys = set()
        unique_price_entries = []
        for p_entry in price_entries:
            dedup_key = (
                p_entry.store.id,
                float(p_entry.current_price),
                p_entry.unit or "",
                p_entry.flyer_status,
            )
            if dedup_key not in seen_keys:
                seen_keys.add(dedup_key)
                unique_price_entries.append(p_entry)

        price_entries = unique_price_entries

        # Mark lowest price among active/expiring/upcoming prices
        active_entries = [p for p in price_entries if not p.is_historical]
        lowest_ref = active_entries if active_entries else price_entries
        lowest_val = min(p.current_price for p in lowest_ref)
        highest_val = max(p.current_price for p in lowest_ref)

        for p_entry in price_entries:
            if p_entry.current_price == lowest_val and not p_entry.is_historical:
                p_entry.is_lowest = True

        details = generate_fast_product_details(product.raw_name, product.category, product.brand)
        intel = calculate_price_intelligence(db, product.id)
        results.append(
            SearchResult(
                product=ProductResponse(
                    id=product.id,
                    raw_name=product.raw_name,
                    normalized_name=product.normalized_name,
                    category=product.category,
                    brand=product.brand,
                    image_url=product.image_url,
                    description=details.get("description"),
                    ingredients=details.get("ingredients"),
                    nutrition_facts=details.get("nutrition_facts"),
                    source_info=details.get("source_info"),
                    created_at=product.created_at,
                ),
                prices=price_entries,
                lowest_price=lowest_val,
                highest_price=highest_val,
                savings_potential=highest_val - lowest_val if len(price_entries) > 1 else Decimal("0"),
                store_count=len(set(p.store.id for p in price_entries)),
                intelligence=intel,
            )
        )

    # Sort results:
    # 1. Exact/partial title matches (products containing search query word in raw_name) come FIRST!
    # 2. Then by store count descending
    # 3. Then by lowest price ascending
    def rank_key(r: SearchResult):
        raw_l = r.product.raw_name.lower()
        norm_l = r.product.normalized_name.lower()
        is_title_match = any(term in raw_l or term in norm_l for term in equiv_terms)
        return (not is_title_match, -r.store_count, r.lowest_price or Decimal("999"))

    results.sort(key=rank_key)

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


@router.get("/{product_id}/history")
def get_product_price_history(product_id: int, db: Session = Depends(get_db)):
    """
    Get chronological price history and ML price trend analytics for a product.
    Queries cross-store historical flyer prices by normalized_name and valid_from dates.
    """
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Product not found")

    # Extract product search phrase (e.g., 'cuisses de poulet', 'chicken thighs', 'lactantia milk', 'persil')
    raw_title = (product.normalized_name or product.raw_name or "").strip().lower()
    
    # Strip generic noise words
    words = [w for w in re.sub(r'[^a-zA-Z0-9]', ' ', raw_title).split() if w not in ["fresh", "format", "club", "super", "size", "pack", "caisse", "avec", "frais", "boneless", "sans"]]
    
    # Build 2-word phrase or fallback to raw title
    search_phrase = " ".join(words[:2]) if len(words) >= 2 else raw_title

    matching_product_ids = [product.id]
    if len(search_phrase) >= 3:
        related_prods = (
            db.query(Product.id)
            .filter(
                (func.lower(Product.normalized_name).contains(search_phrase)) |
                (func.lower(Product.raw_name).contains(search_phrase))
            )
            .all()
        )
        matching_product_ids = list(set([r[0] for r in related_prods] + [product.id]))

    # Query chronological price observations across all historical flyers
    prices = (
        db.query(Price)
        .filter(Price.product_id.in_(matching_product_ids))
        .all()
    )

    if not prices:
        prices = db.query(Price).filter(Price.product_id == product_id).all()

    # Sort prices chronologically by valid_from or scraped_at
    def get_price_date(p):
        d = p.valid_from or (p.scraped_at.date() if p.scraped_at else datetime.utcnow().date())
        return d

    prices_sorted = sorted(prices, key=get_price_date)

    history_points = []
    seen_keys = set()

    for p in prices_sorted:
        st = db.query(Store).filter(Store.id == p.store_id).first()
        store_name = st.name if st else "Store"
        price_val = float(p.current_price) if p.current_price else 0.0
        p_date = get_price_date(p)
        date_str = p_date.strftime("%b %d") if hasattr(p_date, "strftime") else str(p_date)
        raw_date_iso = p_date.isoformat() if hasattr(p_date, "isoformat") else str(p_date)
        
        # Deduplicate same date + store points
        key = (raw_date_iso, store_name, price_val)
        if key not in seen_keys:
            seen_keys.add(key)
            history_points.append({
                "date": date_str,
                "raw_date": raw_date_iso,
                "price": price_val,
                "store_name": store_name,
                "store_color": st.color if st and hasattr(st, "color") else "#10B981",
                "is_lowest": False
            })

    # Find min/max and mark lowest point
    valid_prices = [p["price"] for p in history_points if p["price"] > 0]
    lowest_price = min(valid_prices) if valid_prices else float(product.current_price or 0.0)
    highest_price = max(valid_prices) if valid_prices else float(product.current_price or 0.0)
    current_price = history_points[-1]["price"] if history_points else float(product.current_price or 0.0)

    for pt in history_points:
        if pt["price"] == lowest_price:
            pt["is_lowest"] = True

    # Calculate savings % from peak
    discount_pct = 0
    if highest_price > 0 and current_price < highest_price:
        discount_pct = round(((highest_price - current_price) / highest_price) * 100)

    # ML Recommendation logic
    if current_price == lowest_price and discount_pct >= 20:
        badge_text = f"🔥 Lowest Price in 30 Days ({discount_pct}% OFF!)"
        badge_type = "BEST_DEAL"
        action = "BUY_NOW"
    elif current_price <= lowest_price * 1.05:
        badge_text = "✨ Great Time to Buy — Near 30-Day Low"
        badge_type = "GOOD_DEAL"
        action = "BUY_NOW"
    else:
        badge_text = "⚖️ Standard Price — Consider Waiting for Sale"
        badge_type = "NEUTRAL"
        action = "WAIT"

    return {
        "product_id": product_id,
        "product_name": product.normalized_name or product.raw_name,
        "category": product.category or "General",
        "lowest_price": lowest_price,
        "highest_price": highest_price,
        "current_price": current_price,
        "discount_pct": discount_pct,
        "ai_recommendation": {
            "badge_text": badge_text,
            "badge_type": badge_type,
            "action": action
        },
        "history": history_points
    }

