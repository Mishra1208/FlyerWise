"""
FlyerWise — Canonical Product Matching Engine

Clusters store-specific raw flyer product names (e.g. 'Coca-Cola Zero 6 x 710 mL')
to unified CanonicalProduct entities ('Coca-Cola Zero 6x710mL') with confidence scoring.
"""

import re
import logging
from difflib import SequenceMatcher
from typing import Optional, Tuple
from sqlalchemy.orm import Session
from app.models import CanonicalProduct, StoreProduct, Product, Store

logger = logging.getLogger("flyerwise.matching_engine")


def clean_matching_token(text: str) -> str:
    """Normalize string for fuzzy similarity comparison."""
    if not text:
        return ""
    text = text.lower()
    text = re.sub(r"[^\w\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def calculate_similarity(s1: str, s2: str) -> float:
    """Calculate token-sort ratio between two product names."""
    t1 = clean_matching_token(s1)
    t2 = clean_matching_token(s2)

    if not t1 or not t2:
        return 0.0

    if t1 == t2:
        return 1.0

    # Token sort comparison
    tokens1 = sorted(t1.split())
    tokens2 = sorted(t2.split())

    sorted_s1 = " ".join(tokens1)
    sorted_s2 = " ".join(tokens2)

    return SequenceMatcher(None, sorted_s1, sorted_s2).ratio()


def resolve_canonical_product(
    db: Session,
    store_id: int,
    raw_product_name: str,
    brand: Optional[str] = None,
    category: Optional[str] = None,
    default_unit: Optional[str] = None,
) -> Tuple[CanonicalProduct, float]:
    """
    Find or create a CanonicalProduct for a store-specific product name.

    Returns:
        Tuple[CanonicalProduct, float]: (matched_canonical_product, confidence_score)
    """
    clean_name = clean_matching_token(raw_product_name)

    # 1. Check existing StoreProduct mappings for this store
    existing_store_prod = (
        db.query(StoreProduct)
        .filter(
            StoreProduct.store_id == store_id,
            StoreProduct.store_product_name == raw_product_name,
        )
        .first()
    )
    if existing_store_prod and existing_store_prod.canonical_product:
        return (
            existing_store_prod.canonical_product,
            float(existing_store_prod.matching_confidence),
        )

    # 2. Match against existing CanonicalProduct candidates
    all_canonicals = db.query(CanonicalProduct).all()
    best_match: Optional[CanonicalProduct] = None
    best_score: float = 0.0

    for cp in all_canonicals:
        score = calculate_similarity(raw_product_name, cp.canonical_name)
        if score > best_score:
            best_score = score
            best_match = cp

    # Threshold: >= 0.82 is considered a high-confidence canonical match
    if best_match and best_score >= 0.82:
        # Create StoreProduct mapping
        store_prod = StoreProduct(
            store_id=store_id,
            canonical_product_id=best_match.id,
            store_product_name=raw_product_name,
            matching_confidence=round(best_score, 2),
        )
        db.add(store_prod)
        db.commit()
        return (best_match, best_score)

    # 3. Create a NEW CanonicalProduct if no high-confidence match exists
    new_canonical = CanonicalProduct(
        canonical_name=raw_product_name.strip(),
        brand=brand,
        category=category,
        default_unit=default_unit,
    )
    db.add(new_canonical)
    db.flush()

    store_prod = StoreProduct(
        store_id=store_id,
        canonical_product_id=new_canonical.id,
        store_product_name=raw_product_name,
        matching_confidence=1.00,
    )
    db.add(store_prod)
    db.commit()

    return (new_canonical, 1.00)


def auto_cluster_all_products(db: Session) -> int:
    """
    Batch process all unlinked products into CanonicalProducts.
    """
    raw_products = db.query(Product).all()
    clustered_count = 0

    for p in raw_products:
        # Check if already clustered
        canonical, conf = resolve_canonical_product(
            db=db,
            store_id=1,  # Default system cluster store_id
            raw_product_name=p.raw_name,
            brand=p.brand,
            category=p.category,
        )
        clustered_count += 1

    return clustered_count
