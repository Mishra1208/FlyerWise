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


def parse_unit(text: str) -> Optional[str]:
    """
    Extract unit information from price text.

    Examples:
    - "$4.99/lb"   → "per lb"
    - "$2.99/kg"   → "per kg"
    - "$0.99 each" → "each"
    - "$3.49/100g" → "per 100g"
    """
    if not text:
        return None

    unit_patterns = [
        (r"/\s*lb\b|per\s+lb\b", "per lb"),
        (r"/\s*kg\b|per\s+kg\b", "per kg"),
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
    Extract quantity/multi-buy information.

    Examples:
    - "2 for $5"      → "2 for $5.00"
    - "3/$10"         → "3 for $10.00"
    - "Buy 2 get 1"   → "Buy 2 get 1"
    """
    if not text:
        return None

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
