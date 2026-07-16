"""
Products Router

Endpoints for searching products and retrieving product details.
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
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


router = APIRouter(prefix="/products", tags=["products"])


@router.get("/search", response_model=SearchResponse)
def search_products(
    q: str = Query(..., min_length=1, max_length=200, description="Search query"),
    db: Session = Depends(get_db),
):
    """
    Search for products across all stores.

    Uses PostgreSQL full-text search with trigram fallback for fuzzy matching.
    Returns products grouped with their prices across stores, lowest price highlighted.
    """
    # Translate bilingual query tokens
    q_translated = translate_query_to_english(q)

    # Step 1: Full-text search on normalized product names
    fts_query = func.plainto_tsquery("english", q_translated)
    fts_results = (
        db.query(Product)
        .filter(
            func.to_tsvector("english", Product.normalized_name).op("@@")(fts_query)
        )
        .limit(50)
        .all()
    )

    # Step 2: If no FTS results, fall back to trigram similarity
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
    for product in fts_results:
        # Get all active prices for this product
        prices = (
            db.query(Price)
            .join(Store, Price.store_id == Store.id)
            .filter(
                Price.product_id == product.id,
                Price.valid_until >= func.current_date(),
            )
            .order_by(Price.current_price.asc())
            .all()
        )

        if not prices:
            continue

        # Find lowest price
        lowest = min(p.current_price for p in prices)
        highest = max(p.current_price for p in prices)

        # Build price entries with store info and "is_lowest" flag
        price_entries = []
        for price in prices:
            store = db.query(Store).filter(Store.id == price.store_id).first()
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
                    is_lowest=(price.current_price == lowest),
                )
            )

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
                lowest_price=lowest,
                highest_price=highest,
                savings_potential=highest - lowest if len(price_entries) > 1 else Decimal("0"),
                store_count=len(price_entries),
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


@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db)):
    """Get a specific product by ID."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Product not found")
    return product
