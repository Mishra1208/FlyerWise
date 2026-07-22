"""
FlyerWise — Automated Weekly Scraper Scheduler

Uses APScheduler to execute the Universal Grocery Scraper every Thursday at 6:00 AM.
Also provides manual trigger capabilities via API.
"""

import logging
import asyncio
from datetime import datetime
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger

import sys
import os

# Ensure root directory is in sys.path so scraper module is importable from backend
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from scraper.universal_scraper import UniversalGroceryScraper

logger = logging.getLogger("flyerwise.scheduler")

scheduler = AsyncIOScheduler()
is_scraping_in_progress = False
last_scrape_status = {"status": "idle", "last_run": None, "details": None}


def run_weekly_grocery_scrape():
    """Background task to run universal scraper across all Canadian grocery retailers."""
    global is_scraping_in_progress, last_scrape_status
    if is_scraping_in_progress:
        logger.warning("Scrape job skipped: a scrape run is already in progress.")
        return

    is_scraping_in_progress = True
    last_scrape_status["status"] = "running"
    last_scrape_status["last_run"] = datetime.now().isoformat()
    
    logger.info("⏰ APScheduler Cron Triggered: Starting Thursday Grocery Flyer Scrape...")
    try:
        scraper = UniversalGroceryScraper(postal_codes=["H3B2Y5", "H2X1Y4", "K1P5W3"])
        summary = scraper.run_universal_scrape()
        last_scrape_status["status"] = "success"
        last_scrape_status["details"] = summary
        logger.info(f"✅ Thursday Grocery Flyer Scrape Completed! Details: {summary}")
    except Exception as e:
        logger.error(f"❌ Scraper Cron Failed: {e}", exc_info=True)
        last_scrape_status["status"] = "failed"
        last_scrape_status["error"] = str(e)
    finally:
        is_scraping_in_progress = False


def start_scheduler():
    """Start the background scheduler for Thursday morning flyer scraping."""
    # Schedule every Thursday at 6:00 AM EST
    trigger = CronTrigger(day_of_week="thu", hour=6, minute=0)
    scheduler.add_job(
        run_weekly_grocery_scrape,
        trigger=trigger,
        id="weekly_thursday_grocery_scrape",
        replace_existing=True,
    )
    scheduler.start()
    logger.info("📅 Weekly FlyerScraper APScheduler started (Cron: Thursday at 6:00 AM EST).")


def shutdown_scheduler():
    """Gracefully shutdown scheduler."""
    if scheduler.running:
        scheduler.shutdown(wait=False)
        logger.info("📅 APScheduler stopped.")
