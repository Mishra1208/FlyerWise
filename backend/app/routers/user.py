"""
FlyerWise API — User & Email Router

Endpoints for sending welcome emails and managing user preferences via Resend.
"""

from fastapi import APIRouter
from app.schemas import WelcomeEmailRequest
from app.services.email_service import send_welcome_email

router = APIRouter(prefix="/user", tags=["user"])


@router.post("/welcome-email")
def trigger_welcome_email(payload: WelcomeEmailRequest):
    """Trigger Resend welcome email upon user registration."""
    res = send_welcome_email(to_email=payload.email, user_name=payload.user_name)
    return res
