"""
FlyerWise — SmartCanucks Maxi Historical Flyer Archiver (2012 - 2026)

Harvester script to extract historical Maxi flyer editions, date ranges, and image pages
from SmartCanucks (79 pages of archives going back to 2012) into PostgreSQL.
"""

import sys
import os
import time
import logging
import requests
from bs4 import BeautifulSoup
from datetime import datetime

# Add root directory to sys.path
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from app.database import SessionLocal
from app.models import Store, Flyer

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("flyerwise.smartcanucks")

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8"
}


import re

def parse_dates_from_slug(slug_str: str) -> tuple[datetime.date, datetime.date]:
    """Parse start and end dates from flyer slug e.g. maxi-flyer-july-16-to-221 or maxi-flyer-march-15-to-21-2012."""
    now = datetime.now()
    year = now.year
    
    # Check if year is explicitly in slug e.g. 2012
    yr_match = re.search(r'(20\d\d)', slug_str)
    if yr_match:
        year = int(yr_match.group(1))

    # Match month and day numbers
    months = {
        "january": 1, "february": 2, "march": 3, "april": 4, "may": 5, "june": 6,
        "july": 7, "august": 8, "september": 9, "october": 10, "november": 11, "december": 12,
        "jan": 1, "feb": 2, "mar": 3, "apr": 4, "jun": 6, "jul": 7, "aug": 8, "sep": 9, "oct": 10, "nov": 11, "dec": 12
    }
    
    found_month = 1
    for m_name, m_num in months.items():
        if m_name in slug_str.lower():
            found_month = m_num
            break

    days = re.findall(r'\b(\d{1,2})\b', slug_str)
    start_d = int(days[0]) if len(days) > 0 and 1 <= int(days[0]) <= 31 else 1
    end_d = int(days[1]) if len(days) > 1 and 1 <= int(days[1]) <= 31 else min(31, start_d + 6)

    try:
        start_date = datetime(year, found_month, start_d).date()
        end_date = datetime(year, found_month, end_d).date()
    except Exception:
        start_date = now.date()
        end_date = now.date()

    return start_date, end_date


def harvest_maxi_flyer_urls(max_pages: int = 79):
    """
    Harvest all historical Maxi flyer URLs and image pages across 79 pages of archives (2012-2026).
    """
    session = requests.Session()
    session.headers.update(HEADERS)

    db = SessionLocal()

    maxi = db.query(Store).filter(Store.slug == "maxi").first()
    if not maxi:
        maxi = Store(name="Maxi", slug="maxi", color="#ED1C24")
        db.add(maxi)
        db.commit()
        db.refresh(maxi)

    logger.info(f"🚀 Starting SmartCanucks Maxi Historical Flyer Harvester (Target: {max_pages} pages)...")

    total_flyers_found = 0

    for page in range(1, max_pages + 1):
        url = f"https://flyers.smartcanucks.ca/maxi-canada?page={page}"
        logger.info(f"📄 Fetching Archive Index Page {page}/{max_pages} ({url})...")

        try:
            r = session.get(url, timeout=10)
            if r.status_code != 200:
                continue

            soup = BeautifulSoup(r.text, "html.parser")
            flyer_links = soup.find_all("a", href=True)
            page_flyers = []
            
            for link in flyer_links:
                href = link["href"]
                if "/canada/maxi-flyer-" in href and href not in page_flyers:
                    page_flyers.append(href)

            for flyer_url in page_flyers:
                full_url = flyer_url if flyer_url.startswith("http") else f"https://flyers.smartcanucks.ca{flyer_url}"
                
                # Check if already in DB
                existing = db.query(Flyer).filter(Flyer.flyer_url == full_url).first()
                if existing:
                    continue

                start_date, end_date = parse_dates_from_slug(flyer_url)

                # Check if flyer for store and dates exists
                existing_dates = (
                    db.query(Flyer)
                    .filter(
                        Flyer.store_id == maxi.id,
                        Flyer.start_date == start_date,
                        Flyer.end_date == end_date
                    )
                    .first()
                )
                if existing_dates:
                    continue

                new_flyer = Flyer(
                    store_id=maxi.id,
                    start_date=start_date,
                    end_date=end_date,
                    flyer_url=full_url,
                    status="expired",
                    items_count=0
                )
                db.add(new_flyer)
                total_flyers_found += 1

            db.commit()
            time.sleep(0.2)

        except Exception as e:
            logger.error(f"Error harvesting page {page}: {e}")
            db.rollback()

    logger.info(f"🎉 Maxi Archive Harvest Complete! Cataloged {total_flyers_found} historical flyers into PostgreSQL.")
    db.close()
    return total_flyers_found


if __name__ == "__main__":
    harvest_maxi_flyer_urls(max_pages=79)
