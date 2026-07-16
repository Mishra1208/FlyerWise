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


settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    # Startup: verify database connection
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print("✅ Database connection verified")
    except Exception as e:
        print(f"❌ Database connection failed: {e}")

    yield

    # Shutdown: cleanup
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
