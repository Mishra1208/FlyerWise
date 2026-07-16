"""
Stores Router

Endpoints for listing and retrieving store information.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Store
from app.schemas import StoreResponse

router = APIRouter(prefix="/stores", tags=["stores"])


@router.get("/", response_model=list[StoreResponse])
def list_stores(db: Session = Depends(get_db)):
    """Get all tracked grocery stores."""
    stores = db.query(Store).order_by(Store.name).all()
    return stores


@router.get("/{store_slug}", response_model=StoreResponse)
def get_store(store_slug: str, db: Session = Depends(get_db)):
    """Get a specific store by its slug."""
    store = db.query(Store).filter(Store.slug == store_slug).first()
    if not store:
        raise HTTPException(status_code=404, detail=f"Store '{store_slug}' not found")
    return store
