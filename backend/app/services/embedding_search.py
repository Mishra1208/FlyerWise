"""
FlyerWise — AI Semantic Embedding Search Engine

Uses SentenceTransformers (all-MiniLM-L6-v2) to generate 384-dimensional
vector embeddings for product titles and compute instant semantic cosine similarity.

Provides zero-normalization, language-agnostic search across 19,000+ grocery products.
"""

import logging
import time
import numpy as np
from typing import List, Dict, Any, Tuple, Optional
from datetime import date, timedelta
from sqlalchemy.orm import Session

logger = logging.getLogger("flyerwise.embedding_search")

_model = None
_product_embeddings_cache: Optional[np.ndarray] = None
_product_ids_cache: List[int] = []
_last_build_time: float = 0


def get_embedding_model():
    """Lazy load the sentence-transformers model."""
    global _model
    if _model is None:
        logger.info("🧠 Loading SentenceTransformer model (all-MiniLM-L6-v2)...")
        from sentence_transformers import SentenceTransformer
        _model = SentenceTransformer("all-MiniLM-L6-v2")
        logger.info("✅ SentenceTransformer model loaded!")
    return _model


def build_or_refresh_product_index(db: Session, force: bool = False):
    """
    Build or refresh in-memory product vector index for instant cosine similarity.
    Rebuilds only if cache is empty or force=True.
    """
    global _product_embeddings_cache, _product_ids_cache, _last_build_time
    
    now = time.time()
    if _product_embeddings_cache is not None and not force and (now - _last_build_time < 3600):
        return

    from app.models import Product, Price
    today = date.today()
    cutoff_past = today - timedelta(days=14)

    # Fetch products that have prices in current or upcoming flyer period
    active_products = (
        db.query(Product.id, Product.raw_name, Product.normalized_name)
        .join(Price, Price.product_id == Product.id)
        .filter((Price.valid_until >= cutoff_past) | (Price.valid_until.is_(None)))
        .distinct()
        .all()
    )

    if not active_products:
        return

    logger.info(f"⚡ Building vector index for {len(active_products)} active/upcoming flyer products...")
    model = get_embedding_model()

    texts = [f"{p.raw_name} {p.normalized_name}" for p in active_products]
    product_ids = [p.id for p in active_products]

    embeddings = model.encode(texts, batch_size=128, show_progress_bar=False, normalize_embeddings=True)

    _product_embeddings_cache = np.array(embeddings, dtype=np.float32)
    _product_ids_cache = product_ids
    _last_build_time = time.time()
    logger.info(f"🎉 Vector index built successfully! Cached {_product_embeddings_cache.shape[0]} embeddings.")


def search_semantic_products(db: Session, query: str, top_k: int = 100, min_similarity: float = 0.35) -> List[int]:
    """
    Perform AI semantic vector search for query string.
    Returns list of matched product IDs ordered by vector cosine similarity.
    """
    try:
        build_or_refresh_product_index(db)
        if _product_embeddings_cache is None or len(_product_ids_cache) == 0:
            return []

        model = get_embedding_model()
        query_vec = model.encode([query], normalize_embeddings=True)[0]

        # Dot product of normalized vectors = Cosine Similarity
        scores = np.dot(_product_embeddings_cache, query_vec)

        # Filter by threshold and sort
        valid_indices = np.where(scores >= min_similarity)[0]
        if len(valid_indices) == 0:
            return []

        # Sort indices by score descending
        sorted_indices = valid_indices[np.argsort(-scores[valid_indices])[:top_k]]
        matched_ids = [_product_ids_cache[idx] for idx in sorted_indices]
        
        logger.info(f"🧠 AI Vector Search for '{query}': Matched {len(matched_ids)} products (top similarity: {scores[sorted_indices[0]]:.2f})")
        return matched_ids

    except Exception as e:
        logger.error(f"Failed semantic vector search for '{query}': {e}", exc_info=True)
        return []
