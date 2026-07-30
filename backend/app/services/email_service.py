"""
FlyerWise Email Service — Gmail SMTP & Resend Support

Sends automated welcome emails and weekly deal alerts via 100% free Gmail SMTP or Resend API.
"""

import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

load_dotenv()

def send_welcome_email(to_email: str, user_name: str | None = None) -> dict:
    """Send a FlyerWise welcome email to newly registered users using Gmail SMTP or Resend."""
    smtp_email = os.getenv("SMTP_EMAIL", "").strip()
    smtp_password = os.getenv("SMTP_PASSWORD", "").strip()
    resend_api_key = os.getenv("RESEND_API_KEY", "").strip()

    name_display = user_name if user_name else "Smart Saver"

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Welcome to FlyerWise</title>
    </head>
    <body style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #FAFAFA; margin: 0; padding: 40px 20px; color: #222222;">
      <div style="max-width: 600px; margin: 0 auto; background: #FFFFFF; border-radius: 24px; border: 1px solid #EFEFEF; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.05);">
        
        <!-- Header Banner -->
        <div style="background: linear-gradient(135deg, #5B8C51 0%, #48703F 100%); padding: 36px 32px; text-align: center; color: #FFFFFF;">
          <h1 style="margin: 0; font-size: 28px; font-weight: 900; letter-spacing: -0.5px;">🛒 FlyerWise</h1>
          <p style="margin: 8px 0 0 0; font-size: 15px; opacity: 0.95;">AI-Powered Canadian Grocery Price Comparison</p>
        </div>

        <!-- Body Content -->
        <div style="padding: 36px 32px;">
          <h2 style="font-size: 22px; color: #222222; margin-top: 0;">Welcome, {name_display}! 🎉</h2>
          
          <p style="font-size: 15px; color: #555555; line-height: 1.6;">
            Your FlyerWise account is ready. You now have instant access to real-time flyer price comparisons across <strong>84+ Canadian grocery retailers</strong> including Walmart, Maxi, Metro, IGA, Super C, Costco, and Provigo.
          </p>

          <!-- Feature Highlights Box -->
          <div style="background-color: #EEF5E4; border: 1.5px solid #5B8C51; border-radius: 16px; padding: 20px; margin: 24px 0;">
            <h3 style="margin: 0 0 12px 0; font-size: 16px; color: #48703F;">🚀 Your Smart Savings Benefits:</h3>
            <ul style="margin: 0; padding-left: 20px; color: #48703F; font-size: 14px; line-height: 1.8;">
              <li><strong>Cross-Device Basket Sync:</strong> Items saved on your phone appear instantly on your laptop.</li>
              <li><strong>AI Split-Trip Optimizer:</strong> Calculate exact 2-store combinations for max weekly savings.</li>
              <li><strong>Live Price Drop Alerts:</strong> Receive weekly notifications when your staple items go on sale.</li>
            </ul>
          </div>

          <p style="font-size: 15px; color: #727272; text-align: center; margin-top: 30px;">
            Happy Grocery Shopping! 🛒<br>
            <strong>The FlyerWise Team</strong>
          </p>
        </div>

        <!-- Footer -->
        <div style="background-color: #F8F9FA; padding: 20px 32px; text-align: center; font-size: 12px; color: #888888; border-top: 1px solid #EFEFEF;">
          <p style="margin: 0;">FlyerWise Inc. — Montreal, QC & Toronto, ON</p>
        </div>

      </div>
    </body>
    </html>
    """

    # 1. Try Gmail SMTP if credentials provided (Works 100% Free to ANY email address)
    if smtp_email and smtp_password:
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = "Welcome to FlyerWise — Your AI Grocery Savings Hub 🛒"
            msg["From"] = f"FlyerWise <{smtp_email}>"
            msg["To"] = to_email
            msg.attach(MIMEText(html_content, "html"))

            with smtplib.SMTP("smtp.gmail.com", 587) as server:
                server.starttls()
                server.login(smtp_email, smtp_password.replace(" ", ""))
                server.sendmail(smtp_email, [to_email], msg.as_string())

            print(f"✅ Welcome email sent via Gmail SMTP to {to_email}")
            return {"status": "sent", "provider": "gmail_smtp"}
        except Exception as err:
            print(f"⚠️ Gmail SMTP send failed: {err}")

    # 2. Try Resend API if API key provided
    if resend_api_key:
        try:
            import resend
            resend.api_key = resend_api_key
            r = resend.Emails.send({
                "from": f"FlyerWise <onboarding@resend.dev>",
                "to": [to_email],
                "subject": "Welcome to FlyerWise — Your AI Grocery Savings Hub 🌿",
                "html": html_content
            })
            print(f"✅ Welcome email sent via Resend API to {to_email}: {r}")
            return {"status": "sent", "provider": "resend", "response": r}
        except Exception as err:
            print(f"⚠️ Resend email send failed: {err}")

    print(f"⚠️ No SMTP credentials configured. Simulated email send to {to_email}")
    return {"status": "simulated", "message": f"Welcome email simulated for {to_email}"}
