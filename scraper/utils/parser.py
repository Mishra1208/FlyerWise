"""
FlyerWise Price Parser

Extracts numerical price values from various text formats found in flyers.
"""

import re
from decimal import Decimal, InvalidOperation
from typing import Optional


def parse_price(price_text) -> Optional[float]:
    """
    Parse a price value from flyer text.

    Handles formats like:
    - "$4.99"
    - "4.99$"
    - "$4,99" (French format)
    - "2/$5" or "2 for $5"
    - "4.99 /lb"
    - "SAVE $2.00" (returns None, this is savings not price)
    - "$4.99 - $6.99" (returns lowest)
    - "2 for 5.00"
    - "2.0" or "3.5" (single-digit decimals)
    - "2" or "14" (whole numbers)

    Returns:
        float: The parsed price value, or None if unparsable.
    """
    if price_text is None:
        return None

    # Handle float/int direct inputs
    if isinstance(price_text, (int, float)):
        return float(price_text)

    text = str(price_text).strip()

    # Skip if it's a "SAVE" or "SAVINGS" text
    if re.match(r"^(?:save|savings|rabais|economisez)", text, re.IGNORECASE):
        return None

    # Handle "X for $Y" or "X/$Y" format — return per-item price
    multi_match = re.match(
        r"(\d+)\s*(?:for|/|pour)\s*\$?\s*(\d+[.,]?\d*)",
        text,
        re.IGNORECASE,
    )
    if multi_match:
        qty = int(multi_match.group(1))
        total = float(multi_match.group(2).replace(",", "."))
        return round(total / qty, 2) if qty > 0 else None

    # Handle price range "X - Y" — return the lower price
    range_match = re.match(
        r"\$?\s*(\d+[.,]\d+)\s*[-–]\s*\$?\s*(\d+[.,]\d+)",
        text,
    )
    if range_match:
        low = float(range_match.group(1).replace(",", "."))
        return round(low, 2)

    # Standard price extraction: find first number that looks like a decimal price (1 or 2 decimals)
    price_match = re.search(r"(\d+[.,]\d{1,2})\b", text)
    if price_match:
        price_str = price_match.group(1).replace(",", ".")
        try:
            return round(float(price_str), 2)
        except ValueError:
            pass

    # Whole number price (e.g., "$5" or "5$" or just "5")
    whole_match = re.search(r"\$\s*(\d+)\b|\b(\d+)\s*\$|\b(\d+)\b", text)
    if whole_match:
        value = whole_match.group(1) or whole_match.group(2) or whole_match.group(3)
        try:
            return float(value)
        except ValueError:
            pass

    return None


def parse_savings(text: str) -> Optional[str]:
    """
    Extract savings information from price text.

    Examples:
    - "Save $2.00" → "Save $2.00"
    - "Was $6.99" → "Was $6.99"
    - "ÉCONOMISEZ 3$" → "ÉCONOMISEZ 3$"
    """
    if not text:
        return None

    savings_match = re.search(
        r"((?:save|savings?|was|rabais|economisez|etait)\s*\$?\s*\d+[.,]?\d*\$?)",
        text,
        re.IGNORECASE,
    )
    if savings_match:
        return savings_match.group(1).strip()

    return None


def parse_unit(text: str, print_id: Optional[str] = None) -> Optional[str]:
    """
    Extract unit information from price text, raw_name, or Flipp print_id.

    Examples:
    - print_id="20143381001_KG" → "lb / kg"
    - print_id="20811201_EA"    → "each"
    - "$4.99/lb"                 → "per lb"
    """
    if print_id:
        p_upper = str(print_id).upper()
        if p_upper.endswith("_KG"):
            return "lb / kg"
        elif p_upper.endswith("_EA"):
            return "each"

    if not text:
        return None

    unit_patterns = [
        (r"/\s*lb\b|per\s+lb\b|\blb\b", "per lb"),
        (r"/\s*kg\b|per\s+kg\b|\bkg\b", "per kg"),
        (r"/\s*100\s*g\b|per\s+100\s*g\b", "per 100g"),
        (r"/\s*l\b|per\s+l(?:itre)?\b", "per L"),
        (r"\beach\b|/\s*ea\b|chacun", "each"),
    ]

    for pattern, unit in unit_patterns:
        if re.search(pattern, text, re.IGNORECASE):
            return unit

    return None


def parse_quantity(text: str) -> Optional[str]:
    """
    Extract package weight/volume size or multi-buy quantity.

    Examples:
    - "TOMATES CERISES AXIANY PC, 567 mL" → "567 mL"
    - "MACARONI & CHEESE, 170 g"          → "170 g"
    - "TOMATES SANS NOM®, 2,5 LB"          → "2.5 LB"
    - "2 for $5"                            → "2 for $5.00"
    """
    if not text:
        return None

    # Match weight/volume size embedded in product title (e.g. ", 567 mL", ", 170 g", ", 2.5 LB", ", 4 L")
    size_match = re.search(r",?\s*(\d+(?:[.,]\d+)?\s*(?:g|kg|ml|l|lb|oz|un\.?))\b", text, re.IGNORECASE)
    if size_match:
        return size_match.group(1).strip()

    multi_match = re.search(
        r"(\d+)\s*(?:for|/|pour)\s*\$?\s*(\d+[.,]?\d*)",
        text,
        re.IGNORECASE,
    )
    if multi_match:
        qty = multi_match.group(1)
        price = multi_match.group(2).replace(",", ".")
        return f"{qty} for ${float(price):.2f}"

    return None
