"""
FlyerWise API — Main Application

FastAPI entry point with CORS, routers, and health check.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.config import get_settings
from app.database import get_db, engine
from app.models import Store, Product, Price
from app.schemas import HealthResponse
from app.routers import stores, products, prices


from app.services.scheduler import start_scheduler, shutdown_scheduler, run_weekly_grocery_scrape, last_scrape_status, is_scraping_in_progress
from fastapi import BackgroundTasks


settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    # Startup: verify database connection & start scheduler
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print("✅ Database connection verified")
    except Exception as e:
        print(f"❌ Database connection failed: {e}")

    start_scheduler()
    yield

    # Shutdown: cleanup
    shutdown_scheduler()
    print("👋 FlyerWise API shutting down")


app = FastAPI(
    title="FlyerWise API",
    description=(
        "Grocery price comparison API for Canadian stores. "
        "Search for any product and compare prices across Walmart, Maxi, Metro, and more."
    ),
    version="0.1.0",
    lifespan=lifespan,
)

# CORS — allow the React frontend to call the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.frontend_url,
        "http://localhost:5173",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(stores.router, prefix="/api")
app.include_router(products.router, prefix="/api")
app.include_router(prices.router, prefix="/api")


@app.get("/", tags=["root"])
def root():
    """Root endpoint — API info."""
    return {
        "name": "FlyerWise API",
        "version": "0.1.0",
        "docs": "/docs",
        "description": "Grocery price comparison for Canadian stores",
    }


@app.post("/api/scraper/trigger", tags=["scraper"])
def trigger_universal_scrape(background_tasks: BackgroundTasks):
    """Manually trigger the Universal Grocery Scraper for all retailers on Flipp."""
    if is_scraping_in_progress:
        return {"status": "in_progress", "message": "A scrape run is already in progress."}

    background_tasks.add_task(run_weekly_grocery_scrape)
    return {"status": "started", "message": "Universal Grocery Scraper launched in background."}


@app.get("/api/scraper/status", tags=["scraper"])
def get_scraper_status():
    """Check current status and results of the Universal Scraper."""
    return {
        "in_progress": is_scraping_in_progress,
        "last_status": last_scrape_status
    }


from typing import List
from pydantic import BaseModel

class BasketOptimizeRequest(BaseModel):
    items: list[str]

from app.services.basket_optimizer import optimize_basket
from app.services.price_intelligence import calculate_price_intelligence
from app.services.matching_engine import auto_cluster_all_products

@app.post("/api/basket/optimize", tags=["basket"])
def optimize_shopping_basket(req: BasketOptimizeRequest, db: Session = Depends(get_db)):
    """Calculate best single-store and two-store combination basket for a list of items."""
    return optimize_basket(db, req.items)


@app.get("/api/products/{product_id}/intelligence", tags=["intelligence"])
def get_product_intelligence(product_id: int, db: Session = Depends(get_db)):
    """Fetch 90-day price statistics, deal quality score, and buy/wait recommendations."""
    return calculate_price_intelligence(db, product_id)


@app.post("/api/matching/cluster", tags=["matching"])
def cluster_canonical_products(db: Session = Depends(get_db)):
    """Trigger canonical product clustering engine across raw store products."""
    count = auto_cluster_all_products(db)
    return {"status": "success", "clustered_count": count}


@app.get("/api/health", response_model=HealthResponse, tags=["health"])
def health_check(db: Session = Depends(get_db)):
    """Health check with database stats."""
    try:
        db.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception:
        db_status = "disconnected"

    stores_count = db.query(Store).count()
    products_count = db.query(Product).count()
    active_prices = (
        db.query(Price)
        .filter(Price.valid_until >= text("CURRENT_DATE"))
        .count()
    )

    return HealthResponse(
        status="healthy",
        version="0.1.0",
        database=db_status,
        stores_count=stores_count,
        products_count=products_count,
        active_prices=active_prices,
    )
