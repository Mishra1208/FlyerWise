"""
FlyerWise API — User & Email Router

Endpoints for sending welcome emails and managing user preferences via Resend.
"""

from fastapi import APIRouter, BackgroundTasks
from app.schemas import WelcomeEmailRequest
from app.services.email_service import send_welcome_email

router = APIRouter(prefix="/user", tags=["user"])


@router.post("/welcome-email")
def trigger_welcome_email(payload: WelcomeEmailRequest, background_tasks: BackgroundTasks):
    """Trigger welcome email in non-blocking background thread upon user registration."""
    background_tasks.add_task(send_welcome_email, to_email=payload.email, user_name=payload.user_name)
    return {"status": "queued", "message": f"Welcome email queued for {payload.email}"}
