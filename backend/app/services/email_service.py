"""
Resend Email Service — FlyerWise

Sends brand-tailored welcome emails and grocery deal alerts using Resend API.
"""

import os
import resend

RESEND_API_KEY = os.getenv("RESEND_API_KEY", "")
if RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY


def send_welcome_email(to_email: str, user_name: str | None = None) -> dict:
    """Send a FlyerWise welcome email to newly registered users."""
    if not RESEND_API_KEY:
        print(f"⚠️ RESEND_API_KEY not set. Simulating welcome email send to {to_email}")
        return {"status": "simulated", "message": f"Welcome email simulated for {to_email}"}

    name_display = user_name if user_name else "Smart Saver"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Welcome to FlyerWise</title>
    </head>
    <body style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #F8FAFC; margin: 0; padding: 40px 20px; color: #0F172A;">
      <div style="max-width: 600px; margin: 0 auto; background: #FFFFFF; border-radius: 24px; border: 1px solid #E2E8F0; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.05);">
        
        <!-- Header Banner -->
        <div style="background: linear-gradient(135deg, #059669 0%, #10B981 100%); padding: 36px 32px; text-align: center; color: #FFFFFF;">
          <h1 style="margin: 0; font-size: 28px; font-weight: 900; letter-spacing: -0.5px;">🌿 FlyerWise</h1>
          <p style="margin: 8px 0 0 0; font-size: 16px; opacity: 0.95;">AI-Powered Canadian Grocery Price Comparison</p>
        </div>

        <!-- Body Content -->
        <div style="padding: 36px 32px;">
          <h2 style="font-size: 22px; color: #0F172A; margin-top: 0;">Welcome, {name_display}! 🎉</h2>
          
          <p style="font-size: 16px; color: #475569; line-height: 1.6;">
            Your FlyerWise account is ready. You now have instant access to real-time flyer price comparisons across <strong>60+ Canadian grocery retailers</strong> including Walmart, Maxi, Metro, IGA, Super C, Costco, and Provigo.
          </p>

          <!-- Feature Highlights Box -->
          <div style="background-color: #F0FDF4; border: 1.5px solid #10B981; border-radius: 16px; padding: 20px; margin: 24px 0;">
            <h3 style="margin: 0 0 12px 0; font-size: 16px; color: #047857;">🚀 Your Smart Savings Benefits:</h3>
            <ul style="margin: 0; padding-left: 20px; color: #047857; font-size: 14px; line-height: 1.8;">
              <li><strong>Cross-Device Basket Sync:</strong> Items saved on your phone appear instantly on your laptop.</li>
              <li><strong>AI Split-Trip Optimizer:</strong> Calculate exact 2-store combinations for max weekly savings.</li>
              <li><strong>Live Price Drop Alerts:</strong> Receive weekly notifications when your staple items go on sale.</li>
            </ul>
          </div>

          <p style="font-size: 15px; color: #64748B; text-align: center; margin-top: 30px;">
            Happy Grocery Shopping! 🛒<br>
            <strong>The FlyerWise Team</strong>
          </p>
        </div>

        <!-- Footer -->
        <div style="background-color: #F1F5F9; padding: 20px 32px; text-align: center; font-size: 12px; color: #94A3B8; border-top: 1px solid #E2E8F0;">
          <p style="margin: 0;">FlyerWise Inc. — Montreal, QC & Toronto, ON</p>
        </div>

      </div>
    </body>
    </html>
    """

    try:
        r = resend.Emails.send({
            "from": "FlyerWise <onboarding@resend.dev>",
            "to": [to_email],
            "subject": "Welcome to FlyerWise — Your AI Grocery Savings Hub 🌿",
            "html": html_content
        })
        print(f"✅ Welcome email sent successfully to {to_email}: {r}")
        return {"status": "sent", "response": r}
    except Exception as e:
        print(f"❌ Resend email failed: {e}")
        return {"status": "error", "message": str(e)}
