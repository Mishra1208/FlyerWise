"""
FlyerWise — Open Food Facts Barcode Resolver Service

Queries Open Food Facts API to resolve barcodes into canonical product metadata
(brand, product title, quantity, category) and builds search terms for cross-store flyer matching.
"""

import json
import logging
import urllib.request
from typing import Dict, Any, Optional
from unidecode import unidecode

logger = logging.getLogger(__name__)


class BarcodeResolver:
    """Resolves universal UPC/EAN barcodes via Open Food Facts API."""

    BASE_URL = "https://world.openfoodfacts.org/api/v2/product"

    @classmethod
    def resolve(cls, barcode: str) -> Optional[Dict[str, Any]]:
        """
        Query Open Food Facts API for a barcode.

        Returns dict with:
            - barcode: str
            - brand: Optional[str]
            - product_name: str
            - product_name_fr: Optional[str]
            - quantity: Optional[str]
            - category: Optional[str]
            - image_url: Optional[str]
            - canonical_query: str (Search query for FlyerWise cross-store search)
        """
        clean_code = barcode.strip()
        if not clean_code.isdigit() or len(clean_code) < 8:
            return None

        url = f"{cls.BASE_URL}/{clean_code}.json"
        req = urllib.request.Request(
            url,
            headers={"User-Agent": "FlyerWise - Canadian Grocery Price Comparator"},
        )

        try:
            with urllib.request.urlopen(req, timeout=5) as response:
                if response.status != 200:
                    return None
                data = json.loads(response.read().decode("utf-8"))

            if not data or data.get("status") != 1:
                logger.info(f"Barcode {clean_code} not found in Open Food Facts DB")
                return None

            product = data.get("product", {})

            # Extract fields
            brand = product.get("brands")
            if brand:
                # Take first brand if comma-separated
                brand = brand.split(",")[0].strip()

            name_en = product.get("product_name_en") or product.get("product_name") or ""
            name_fr = product.get("product_name_fr") or ""

            # Use French or English title depending on availability
            title = name_fr if name_fr else name_en
            quantity = product.get("quantity")
            image_url = product.get("image_front_url") or product.get("image_url")
            categories = product.get("categories")

            # Build canonical search query for FlyerWise engine
            query_parts = []
            if brand:
                query_parts.append(brand)
            if title:
                # Remove filler words from title
                clean_title = unidecode(title.lower())
                query_parts.append(clean_title)

            canonical_query = " ".join(query_parts).strip()

            return {
                "barcode": clean_code,
                "brand": brand,
                "product_name": title or "Unknown Product",
                "product_name_en": name_en,
                "product_name_fr": name_fr,
                "quantity": quantity,
                "category": categories,
                "image_url": image_url,
                "canonical_query": canonical_query,
            }

        except Exception as e:
            logger.warning(f"Failed to resolve barcode {clean_code}: {e}")
            return None
