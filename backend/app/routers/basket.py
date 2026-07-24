"""
FlyerWise API — Basket Router

Provides cross-device PostgreSQL synchronization endpoints for saved user basket items.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select, delete

from app.database import get_db
from app.models import UserBasketItem
from app.schemas import (
    UserBasketItemCreate,
    UserBasketItemResponse,
    UserBasketSyncRequest
)

router = APIRouter(prefix="/basket", tags=["basket"])


@router.get("/{user_id}", response_model=list[UserBasketItemResponse])
def get_user_basket(user_id: str, db: Session = Depends(get_db)):
    """Fetch all saved basket items for a specific Clerk user from PostgreSQL."""
    items = db.scalars(
        select(UserBasketItem).where(UserBasketItem.user_id == user_id).order_by(UserBasketItem.created_at.desc())
    ).all()
    return items


@router.post("/sync", response_model=list[UserBasketItemResponse])
def sync_user_basket(payload: UserBasketSyncRequest, db: Session = Depends(get_db)):
    """
    Bulk synchronize guest/local basket items into PostgreSQL upon login.
    Deduplicates product items for the user.
    """
    user_id = payload.user_id
    
    for item in payload.items:
        # Check if item already exists for user
        existing = db.scalars(
            select(UserBasketItem).where(
                UserBasketItem.user_id == user_id,
                UserBasketItem.product_name == item.product_name
            )
        ).first()
        
        if existing:
            existing.quantity = max(existing.quantity, item.quantity)
            if item.notes:
                existing.notes = item.notes
        else:
            new_item = UserBasketItem(
                user_id=user_id,
                product_name=item.product_name,
                product_id=item.product_id,
                quantity=item.quantity,
                notes=item.notes
            )
            db.add(new_item)
            
    db.commit()
    
    # Return updated list
    items = db.scalars(
        select(UserBasketItem).where(UserBasketItem.user_id == user_id).order_by(UserBasketItem.created_at.desc())
    ).all()
    return items


@router.post("/item", response_model=UserBasketItemResponse)
def add_basket_item(item: UserBasketItemCreate, db: Session = Depends(get_db)):
    """Add or update a single basket item in PostgreSQL."""
    existing = db.scalars(
        select(UserBasketItem).where(
            UserBasketItem.user_id == item.user_id,
            UserBasketItem.product_name == item.product_name
        )
    ).first()
    
    if existing:
        existing.quantity += item.quantity
        if item.notes:
            existing.notes = item.notes
        db.commit()
        db.refresh(existing)
        return existing
    
    new_item = UserBasketItem(
        user_id=item.user_id,
        product_name=item.product_name,
        product_id=item.product_id,
        quantity=item.quantity,
        notes=item.notes
    )
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item


@router.delete("/item/{item_id}")
def delete_basket_item(item_id: int, user_id: str, db: Session = Depends(get_db)):
    """Delete a single basket item from PostgreSQL."""
    item = db.scalars(
        select(UserBasketItem).where(
            UserBasketItem.id == item_id,
            UserBasketItem.user_id == user_id
        )
    ).first()
    
    if not item:
        raise HTTPException(status_code=404, detail="Basket item not found")
        
    db.delete(item)
    db.commit()
    return {"status": "deleted", "id": item_id}


@router.delete("/user/{user_id}")
def clear_user_basket(user_id: str, db: Session = Depends(get_db)):
    """Clear all saved basket items for a user in PostgreSQL."""
    db.execute(delete(UserBasketItem).where(UserBasketItem.user_id == user_id))
    db.commit()
    return {"status": "cleared", "user_id": user_id}
