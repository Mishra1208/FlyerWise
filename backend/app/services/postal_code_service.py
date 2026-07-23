"""
FlyerWise — Canadian Postal Code Service

Validates Canadian postal codes, resolves FSA to city names,
and triggers on-demand scraping for new regions.
"""

import re
import logging
import threading
from typing import Optional, Dict, Any

from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)

# Canadian postal code regex: A1A 1A1 or A1A1A1
POSTAL_CODE_RE = re.compile(r"^([A-Za-z]\d[A-Za-z])\s?(\d[A-Za-z]\d)$")

# FSA (first 3 chars) → city/region mapping for major Canadian cities
FSA_CITY_MAP: Dict[str, tuple[str, str]] = {
    # Quebec
    "G1K": ("Quebec City", "QC"), "G1R": ("Quebec City", "QC"), "G1V": ("Quebec City", "QC"),
    "G1W": ("Quebec City", "QC"), "G1X": ("Quebec City", "QC"), "G1E": ("Quebec City", "QC"),
    "H1A": ("Montreal", "QC"), "H1B": ("Montreal", "QC"), "H1C": ("Montreal", "QC"),
    "H1E": ("Montreal", "QC"), "H1G": ("Montreal", "QC"), "H1H": ("Montreal", "QC"),
    "H1J": ("Montreal", "QC"), "H1K": ("Montreal", "QC"), "H1L": ("Montreal", "QC"),
    "H1M": ("Montreal", "QC"), "H1N": ("Montreal", "QC"), "H1P": ("Montreal", "QC"),
    "H1R": ("Montreal", "QC"), "H1S": ("Montreal", "QC"), "H1T": ("Montreal", "QC"),
    "H1V": ("Montreal", "QC"), "H1W": ("Montreal", "QC"), "H1X": ("Montreal", "QC"),
    "H1Y": ("Montreal", "QC"), "H1Z": ("Montreal", "QC"),
    "H2A": ("Montreal", "QC"), "H2B": ("Montreal", "QC"), "H2C": ("Montreal", "QC"),
    "H2E": ("Montreal", "QC"), "H2G": ("Montreal", "QC"), "H2H": ("Montreal", "QC"),
    "H2J": ("Montreal", "QC"), "H2K": ("Montreal", "QC"), "H2L": ("Montreal", "QC"),
    "H2M": ("Montreal", "QC"), "H2N": ("Montreal", "QC"), "H2P": ("Montreal", "QC"),
    "H2R": ("Montreal", "QC"), "H2S": ("Montreal", "QC"), "H2T": ("Montreal", "QC"),
    "H2V": ("Montreal", "QC"), "H2W": ("Montreal", "QC"), "H2X": ("Montreal", "QC"),
    "H2Y": ("Montreal", "QC"), "H2Z": ("Montreal", "QC"),
    "H3A": ("Montreal", "QC"), "H3B": ("Montreal", "QC"), "H3C": ("Montreal", "QC"),
    "H3E": ("Montreal", "QC"), "H3G": ("Montreal", "QC"), "H3H": ("Montreal", "QC"),
    "H3J": ("Montreal", "QC"), "H3K": ("Montreal", "QC"), "H3L": ("Montreal", "QC"),
    "H3M": ("Montreal", "QC"), "H3N": ("Montreal", "QC"), "H3P": ("Montreal", "QC"),
    "H3R": ("Montreal", "QC"), "H3S": ("Montreal", "QC"), "H3T": ("Montreal", "QC"),
    "H3V": ("Montreal", "QC"), "H3W": ("Montreal", "QC"), "H3X": ("Montreal", "QC"),
    "H3Y": ("Montreal", "QC"), "H3Z": ("Montreal", "QC"),
    "H4A": ("Montreal", "QC"), "H4B": ("Montreal", "QC"), "H4C": ("Montreal", "QC"),
    "H4E": ("Montreal", "QC"), "H4G": ("Montreal", "QC"), "H4H": ("Montreal", "QC"),
    "H4J": ("Montreal", "QC"), "H4K": ("Montreal", "QC"), "H4L": ("Montreal", "QC"),
    "H4M": ("Montreal", "QC"), "H4N": ("Montreal", "QC"), "H4P": ("Montreal", "QC"),
    "H4R": ("Montreal", "QC"), "H4S": ("Montreal", "QC"), "H4T": ("Montreal", "QC"),
    "H4V": ("Montreal", "QC"), "H4W": ("Montreal", "QC"), "H4X": ("Montreal", "QC"),
    "H4Y": ("Montreal", "QC"), "H4Z": ("Montreal", "QC"),
    "H7A": ("Laval", "QC"), "H7B": ("Laval", "QC"), "H7C": ("Laval", "QC"),
    "H7E": ("Laval", "QC"), "H7G": ("Laval", "QC"), "H7H": ("Laval", "QC"),
    "H7K": ("Laval", "QC"), "H7L": ("Laval", "QC"), "H7M": ("Laval", "QC"),
    "H7N": ("Laval", "QC"), "H7P": ("Laval", "QC"), "H7R": ("Laval", "QC"),
    "H7S": ("Laval", "QC"), "H7T": ("Laval", "QC"), "H7V": ("Laval", "QC"),
    "H7W": ("Laval", "QC"), "H7X": ("Laval", "QC"), "H7Y": ("Laval", "QC"),
    "H8N": ("Montreal", "QC"), "H8P": ("Montreal", "QC"), "H8R": ("Montreal", "QC"),
    "H8S": ("Montreal", "QC"), "H8T": ("Montreal", "QC"), "H8Y": ("Montreal", "QC"),
    "H8Z": ("Montreal", "QC"), "H9A": ("Montreal", "QC"), "H9B": ("Montreal", "QC"),
    "H9C": ("Montreal", "QC"), "H9E": ("Montreal", "QC"), "H9G": ("Montreal", "QC"),
    "H9H": ("Montreal", "QC"), "H9J": ("Montreal", "QC"), "H9K": ("Montreal", "QC"),
    "H9R": ("Montreal", "QC"), "H9S": ("Montreal", "QC"), "H9W": ("Montreal", "QC"),
    "H9X": ("Montreal", "QC"),
    "J4B": ("Longueuil", "QC"), "J4G": ("Longueuil", "QC"), "J4H": ("Longueuil", "QC"),
    "J4J": ("Longueuil", "QC"), "J4K": ("Longueuil", "QC"), "J4L": ("Longueuil", "QC"),
    "J4M": ("Longueuil", "QC"), "J4N": ("Longueuil", "QC"), "J4P": ("Longueuil", "QC"),
    "J4R": ("Longueuil", "QC"), "J4S": ("Longueuil", "QC"), "J4T": ("Longueuil", "QC"),
    "J4V": ("Longueuil", "QC"), "J4W": ("Longueuil", "QC"), "J4X": ("Longueuil", "QC"),
    "J4Y": ("Longueuil", "QC"), "J4Z": ("Longueuil", "QC"),
    # Ontario
    "K1A": ("Ottawa", "ON"), "K1B": ("Ottawa", "ON"), "K1C": ("Ottawa", "ON"),
    "K1E": ("Ottawa", "ON"), "K1G": ("Ottawa", "ON"), "K1H": ("Ottawa", "ON"),
    "K1J": ("Ottawa", "ON"), "K1K": ("Ottawa", "ON"), "K1L": ("Ottawa", "ON"),
    "K1M": ("Ottawa", "ON"), "K1N": ("Ottawa", "ON"), "K1P": ("Ottawa", "ON"),
    "K1R": ("Ottawa", "ON"), "K1S": ("Ottawa", "ON"), "K1T": ("Ottawa", "ON"),
    "K1V": ("Ottawa", "ON"), "K1W": ("Ottawa", "ON"), "K1X": ("Ottawa", "ON"),
    "K1Y": ("Ottawa", "ON"), "K1Z": ("Ottawa", "ON"), "K2A": ("Ottawa", "ON"),
    "K2B": ("Ottawa", "ON"), "K2C": ("Ottawa", "ON"), "K2E": ("Ottawa", "ON"),
    "K2G": ("Ottawa", "ON"), "K2H": ("Ottawa", "ON"), "K2J": ("Ottawa", "ON"),
    "K2K": ("Ottawa", "ON"), "K2L": ("Ottawa", "ON"), "K2M": ("Ottawa", "ON"),
    "K2P": ("Ottawa", "ON"), "K2R": ("Ottawa", "ON"), "K2S": ("Ottawa", "ON"),
    "K2T": ("Ottawa", "ON"), "K2V": ("Ottawa", "ON"), "K2W": ("Ottawa", "ON"),
    "M1B": ("Toronto", "ON"), "M1C": ("Toronto", "ON"), "M1E": ("Toronto", "ON"),
    "M1G": ("Toronto", "ON"), "M1H": ("Toronto", "ON"), "M1J": ("Toronto", "ON"),
    "M1K": ("Toronto", "ON"), "M1L": ("Toronto", "ON"), "M1M": ("Toronto", "ON"),
    "M1N": ("Toronto", "ON"), "M1P": ("Toronto", "ON"), "M1R": ("Toronto", "ON"),
    "M1S": ("Toronto", "ON"), "M1T": ("Toronto", "ON"), "M1V": ("Toronto", "ON"),
    "M1W": ("Toronto", "ON"), "M1X": ("Toronto", "ON"),
    "M2H": ("Toronto", "ON"), "M2J": ("Toronto", "ON"), "M2K": ("Toronto", "ON"),
    "M2L": ("Toronto", "ON"), "M2M": ("Toronto", "ON"), "M2N": ("Toronto", "ON"),
    "M2P": ("Toronto", "ON"), "M2R": ("Toronto", "ON"),
    "M3A": ("Toronto", "ON"), "M3B": ("Toronto", "ON"), "M3C": ("Toronto", "ON"),
    "M3H": ("Toronto", "ON"), "M3J": ("Toronto", "ON"), "M3K": ("Toronto", "ON"),
    "M3L": ("Toronto", "ON"), "M3M": ("Toronto", "ON"), "M3N": ("Toronto", "ON"),
    "M4A": ("Toronto", "ON"), "M4B": ("Toronto", "ON"), "M4C": ("Toronto", "ON"),
    "M4E": ("Toronto", "ON"), "M4G": ("Toronto", "ON"), "M4H": ("Toronto", "ON"),
    "M4J": ("Toronto", "ON"), "M4K": ("Toronto", "ON"), "M4L": ("Toronto", "ON"),
    "M4M": ("Toronto", "ON"), "M4N": ("Toronto", "ON"), "M4P": ("Toronto", "ON"),
    "M4R": ("Toronto", "ON"), "M4S": ("Toronto", "ON"), "M4T": ("Toronto", "ON"),
    "M4V": ("Toronto", "ON"), "M4W": ("Toronto", "ON"), "M4X": ("Toronto", "ON"),
    "M4Y": ("Toronto", "ON"),
    "M5A": ("Toronto", "ON"), "M5B": ("Toronto", "ON"), "M5C": ("Toronto", "ON"),
    "M5E": ("Toronto", "ON"), "M5G": ("Toronto", "ON"), "M5H": ("Toronto", "ON"),
    "M5J": ("Toronto", "ON"), "M5K": ("Toronto", "ON"), "M5L": ("Toronto", "ON"),
    "M5M": ("Toronto", "ON"), "M5N": ("Toronto", "ON"), "M5P": ("Toronto", "ON"),
    "M5R": ("Toronto", "ON"), "M5S": ("Toronto", "ON"), "M5T": ("Toronto", "ON"),
    "M5V": ("Toronto", "ON"), "M5W": ("Toronto", "ON"), "M5X": ("Toronto", "ON"),
    "M6A": ("Toronto", "ON"), "M6B": ("Toronto", "ON"), "M6C": ("Toronto", "ON"),
    "M6E": ("Toronto", "ON"), "M6G": ("Toronto", "ON"), "M6H": ("Toronto", "ON"),
    "M6J": ("Toronto", "ON"), "M6K": ("Toronto", "ON"), "M6L": ("Toronto", "ON"),
    "M6M": ("Toronto", "ON"), "M6N": ("Toronto", "ON"), "M6P": ("Toronto", "ON"),
    "M6R": ("Toronto", "ON"), "M6S": ("Toronto", "ON"),
    "L5A": ("Mississauga", "ON"), "L5B": ("Mississauga", "ON"), "L5C": ("Mississauga", "ON"),
    "L5E": ("Mississauga", "ON"), "L5G": ("Mississauga", "ON"), "L5H": ("Mississauga", "ON"),
    "L5J": ("Mississauga", "ON"), "L5K": ("Mississauga", "ON"), "L5L": ("Mississauga", "ON"),
    "L5M": ("Mississauga", "ON"), "L5N": ("Mississauga", "ON"), "L5P": ("Mississauga", "ON"),
    "L5R": ("Mississauga", "ON"), "L5S": ("Mississauga", "ON"), "L5T": ("Mississauga", "ON"),
    "L5V": ("Mississauga", "ON"), "L5W": ("Mississauga", "ON"),
    # British Columbia
    "V5A": ("Vancouver", "BC"), "V5B": ("Vancouver", "BC"), "V5C": ("Vancouver", "BC"),
    "V5E": ("Vancouver", "BC"), "V5G": ("Vancouver", "BC"), "V5H": ("Vancouver", "BC"),
    "V5J": ("Vancouver", "BC"), "V5K": ("Vancouver", "BC"), "V5L": ("Vancouver", "BC"),
    "V5M": ("Vancouver", "BC"), "V5N": ("Vancouver", "BC"), "V5P": ("Vancouver", "BC"),
    "V5R": ("Vancouver", "BC"), "V5S": ("Vancouver", "BC"), "V5T": ("Vancouver", "BC"),
    "V5V": ("Vancouver", "BC"), "V5W": ("Vancouver", "BC"), "V5X": ("Vancouver", "BC"),
    "V5Y": ("Vancouver", "BC"), "V5Z": ("Vancouver", "BC"),
    "V6A": ("Vancouver", "BC"), "V6B": ("Vancouver", "BC"), "V6C": ("Vancouver", "BC"),
    "V6E": ("Vancouver", "BC"), "V6G": ("Vancouver", "BC"), "V6H": ("Vancouver", "BC"),
    "V6J": ("Vancouver", "BC"), "V6K": ("Vancouver", "BC"), "V6L": ("Vancouver", "BC"),
    "V6M": ("Vancouver", "BC"), "V6N": ("Vancouver", "BC"), "V6P": ("Vancouver", "BC"),
    "V6R": ("Vancouver", "BC"), "V6S": ("Vancouver", "BC"), "V6T": ("Vancouver", "BC"),
    "V6V": ("Vancouver", "BC"), "V6W": ("Vancouver", "BC"), "V6X": ("Vancouver", "BC"),
    "V6Y": ("Vancouver", "BC"), "V6Z": ("Vancouver", "BC"),
    # Alberta
    "T2A": ("Calgary", "AB"), "T2B": ("Calgary", "AB"), "T2C": ("Calgary", "AB"),
    "T2E": ("Calgary", "AB"), "T2G": ("Calgary", "AB"), "T2H": ("Calgary", "AB"),
    "T2J": ("Calgary", "AB"), "T2K": ("Calgary", "AB"), "T2L": ("Calgary", "AB"),
    "T2M": ("Calgary", "AB"), "T2N": ("Calgary", "AB"), "T2P": ("Calgary", "AB"),
    "T2R": ("Calgary", "AB"), "T2S": ("Calgary", "AB"), "T2T": ("Calgary", "AB"),
    "T2V": ("Calgary", "AB"), "T2W": ("Calgary", "AB"), "T2X": ("Calgary", "AB"),
    "T2Y": ("Calgary", "AB"), "T2Z": ("Calgary", "AB"),
    "T5A": ("Edmonton", "AB"), "T5B": ("Edmonton", "AB"), "T5C": ("Edmonton", "AB"),
    "T5E": ("Edmonton", "AB"), "T5G": ("Edmonton", "AB"), "T5H": ("Edmonton", "AB"),
    "T5J": ("Edmonton", "AB"), "T5K": ("Edmonton", "AB"), "T5L": ("Edmonton", "AB"),
    "T5M": ("Edmonton", "AB"), "T5N": ("Edmonton", "AB"), "T5P": ("Edmonton", "AB"),
    "T5R": ("Edmonton", "AB"), "T5S": ("Edmonton", "AB"), "T5T": ("Edmonton", "AB"),
    "T5V": ("Edmonton", "AB"), "T5W": ("Edmonton", "AB"), "T5X": ("Edmonton", "AB"),
    "T5Y": ("Edmonton", "AB"), "T5Z": ("Edmonton", "AB"),
}

# Province prefix mapping for FSAs not in the detailed map
FSA_PROVINCE_PREFIX: Dict[str, tuple[str, str]] = {
    "A": ("Newfoundland", "NL"),
    "B": ("Nova Scotia", "NS"),
    "C": ("Prince Edward Island", "PE"),
    "E": ("New Brunswick", "NB"),
    "G": ("Quebec", "QC"),
    "H": ("Montreal", "QC"),
    "J": ("Quebec", "QC"),
    "K": ("Ontario", "ON"),
    "L": ("Ontario", "ON"),
    "M": ("Toronto", "ON"),
    "N": ("Ontario", "ON"),
    "P": ("Ontario", "ON"),
    "R": ("Manitoba", "MB"),
    "S": ("Saskatchewan", "SK"),
    "T": ("Alberta", "AB"),
    "V": ("British Columbia", "BC"),
    "X": ("Northwest Territories", "NT"),
    "Y": ("Yukon", "YT"),
}


def validate_postal_code(postal_code: str) -> Optional[Dict[str, Any]]:
    """
    Validate a Canadian postal code and return formatted info.
    Returns None if invalid.
    """
    if not postal_code:
        return None

    clean = postal_code.strip().upper().replace(" ", "")
    match = POSTAL_CODE_RE.match(postal_code.strip())
    if not match:
        # Try without space
        if len(clean) == 6:
            match = POSTAL_CODE_RE.match(clean[:3] + " " + clean[3:])

    if not match:
        return None

    fsa = clean[:3].upper()
    formatted = f"{fsa} {clean[3:6].upper()}"

    city, province = resolve_fsa_to_city(fsa)

    return {
        "valid": True,
        "formatted": formatted,
        "fsa": fsa,
        "city": city,
        "province": province,
    }


def resolve_fsa_to_city(fsa: str) -> tuple[str, str]:
    """Resolve an FSA (e.g. H4G) to a city name and province code."""
    fsa = fsa.upper()

    # Check detailed map first
    if fsa in FSA_CITY_MAP:
        return FSA_CITY_MAP[fsa]

    # Fallback to province prefix
    first_letter = fsa[0]
    if first_letter in FSA_PROVINCE_PREFIX:
        return FSA_PROVINCE_PREFIX[first_letter]

    return ("Canada", "CA")


def has_data_for_fsa(db: Session, fsa: str) -> bool:
    """Check if the database has any active flyers tagged with this FSA."""
    from app.models import Flyer
    from datetime import date

    count = (
        db.query(Flyer)
        .filter(Flyer.postal_code_fsa == fsa.upper())
        .filter(Flyer.end_date >= date.today())
        .count()
    )
    return count > 0


def trigger_on_demand_scrape(postal_code: str) -> None:
    """
    Spawn a background thread to run the UniversalGroceryScraper for this postal code.
    This is non-blocking so the API can return immediately.
    """
    import sys
    import os

    clean = postal_code.replace(" ", "").upper()

    def _background_scrape():
        try:
            # Add scraper directory to sys.path
            scraper_dir = os.path.join(
                os.path.dirname(__file__), "..", "..", "..", "scraper"
            )
            scraper_dir = os.path.abspath(scraper_dir)
            if scraper_dir not in sys.path:
                sys.path.insert(0, scraper_dir)

            from universal_scraper import UniversalGroceryScraper

            logger.info(f"🚀 On-demand scrape starting for postal code: {clean}")
            scraper = UniversalGroceryScraper(postal_codes=[clean])
            result = scraper.run_universal_scrape()
            logger.info(f"✅ On-demand scrape complete for {clean}: {result}")
        except Exception as e:
            logger.error(f"❌ On-demand scrape failed for {clean}: {e}", exc_info=True)

    thread = threading.Thread(target=_background_scrape, daemon=True)
    thread.start()
    logger.info(f"🔄 Background scrape thread launched for {clean}")
