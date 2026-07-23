"""
Location Router

Endpoints for postal code validation, city resolution, and on-demand scrape activation.
"""

from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.postal_code_service import (
    validate_postal_code,
    has_data_for_fsa,
    trigger_on_demand_scrape,
)

router = APIRouter(prefix="/location", tags=["location"])


@router.get("/validate")
def validate_code(
    postal_code: str = Query(..., min_length=3, max_length=10, description="Canadian postal code"),
):
    """Validate a Canadian postal code and return city/province info."""
    result = validate_postal_code(postal_code)
    if not result:
        raise HTTPException(status_code=400, detail="Invalid Canadian postal code format. Expected: A1A 1A1")
    return result


@router.get("/info")
def location_info(
    postal_code: str = Query(..., min_length=3, max_length=10),
    db: Session = Depends(get_db),
):
    """Get location info and check if data exists for this postal code."""
    result = validate_postal_code(postal_code)
    if not result:
        raise HTTPException(status_code=400, detail="Invalid Canadian postal code format.")

    fsa = result["fsa"]
    data_exists = has_data_for_fsa(db, fsa)
    result["has_data"] = data_exists
    return result


@router.post("/activate")
def activate_location(
    postal_code: str = Query(..., min_length=3, max_length=10),
    db: Session = Depends(get_db),
):
    """
    Activate a postal code region.
    If no flyer data exists for this FSA, triggers an on-demand background scrape.
    """
    result = validate_postal_code(postal_code)
    if not result:
        raise HTTPException(status_code=400, detail="Invalid Canadian postal code format.")

    fsa = result["fsa"]
    data_exists = has_data_for_fsa(db, fsa)

    if data_exists:
        return {
            **result,
            "has_data": True,
            "scrape_triggered": False,
            "message": f"Data already available for {result['city']}, {result['province']}.",
        }

    # No data — trigger on-demand scrape
    trigger_on_demand_scrape(postal_code)
    return {
        **result,
        "has_data": False,
        "scrape_triggered": True,
        "message": f"Setting up flyer data for {result['city']}. This may take 15-30 seconds for first-time regions.",
    }
