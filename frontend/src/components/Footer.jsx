import React, { useState } from "react";
import { Link } from "react-router-dom";
import { 
  IoLogoGithub, 
  IoLogoTwitter, 
  IoLogoFacebook, 
  IoLogoInstagram, 
  IoMailOutline, 
  IoCheckmarkCircleOutline, 
  IoShieldCheckmarkOutline,
  IoPulseOutline
} from "react-icons/io5";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <footer style={{
      backgroundColor: "#0F172A",
      color: "#FFFFFF",
      padding: "70px 0 30px 0",
      marginTop: "auto",
      borderTop: "1px solid rgba(255, 255, 255, 0.1)",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Background ambient lighting */}
      <div style={{
        position: "absolute",
        top: 0,
        right: "10%",
        width: "300px",
        height: "300px",
        background: "radial-gradient(circle, rgba(16, 185, 129, 0.06) 0%, rgba(15, 23, 42, 0) 70%)",
        pointerEvents: "none",
      }} />

      <div className="container" style={{ position: "relative", zIndex: 2 }}>
        
        {/* TOP NEWSLETTER BANNER */}
        <div style={{
          backgroundColor: "rgba(30, 41, 59, 0.8)",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          borderRadius: "20px",
          padding: "32px",
          marginBottom: "60px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "24px",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
          backdropFilter: "blur(10px)"
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{
                fontSize: "11px",
                fontWeight: 800,
                color: "#10B981",
                backgroundColor: "rgba(16, 185, 129, 0.15)",
                padding: "3px 10px",
                borderRadius: "12px",
                textTransform: "uppercase",
                letterSpacing: "0.5px"
              }}>
                WEEKLY PRICE ALERTS
              </span>
            </div>
            <h3 style={{ fontSize: "22px", fontWeight: 800, color: "#FFFFFF", marginTop: "6px", fontFamily: "var(--font-headings)" }}>
              Never Miss a Grocery Price Drop
            </h3>
            <p style={{ fontSize: "14px", color: "#94A3B8", marginTop: "4px" }}>
              Get automated weekly alerts when butter, chicken, milk, or coffee hit record low flyer prices.
            </p>
          </div>

          <form onSubmit={handleSubscribe} style={{ display: "flex", gap: "10px", flexWrap: "wrap", width: "100%", maxWidth: "420px" }}>
            {subscribed ? (
              <div style={{
                fontSize: "14px",
                fontWeight: 700,
                color: "#10B981",
                backgroundColor: "rgba(16, 185, 129, 0.15)",
                padding: "12px 20px",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                width: "100%"
              }}>
                <IoCheckmarkCircleOutline size={20} /> You are subscribed to weekly price alerts!
              </div>
            ) : (
              <>
                <input
                  type="email"
                  placeholder="Enter your email for price alerts..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{
                    flex: 1,
                    minWidth: "220px",
                    padding: "12px 18px",
                    borderRadius: "12px",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    backgroundColor: "rgba(15, 23, 42, 0.6)",
                    color: "#FFFFFF",
                    fontSize: "14px",
                    outline: "none"
                  }}
                />
                <button
                  type="submit"
                  style={{
                    padding: "12px 22px",
                    borderRadius: "12px",
                    backgroundColor: "#10B981",
                    color: "#FFFFFF",
                    fontWeight: 700,
                    fontSize: "14px",
                    border: "none",
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
                    transition: "all 0.2s ease"
                  }}
                >
                  Subscribe
                </button>
              </>
            )}
          </form>
        </div>

        {/* Footer Top Links & Details Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "40px",
          marginBottom: "50px",
        }}>
          {/* Logo & Pitch */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <span style={{
              fontWeight: 900,
              fontSize: "26px",
              letterSpacing: "-0.5px",
              color: "#FFFFFF"
            }}>
              Flyer<span style={{ color: "#10B981" }}>Wise</span>
            </span>

            <p style={{
              color: "#94A3B8",
              fontSize: "14px",
              lineHeight: "1.7",
              maxWidth: "280px",
            }}>
              Canada's smartest AI grocery price comparison engine. We scrape and compile real-time flyer deals across 60+ retailers so you save up to $2,300/year.
            </p>

            <div style={{
              fontSize: "12px",
              fontWeight: 700,
              color: "#10B981",
              backgroundColor: "rgba(16, 185, 129, 0.1)",
              border: "1px solid rgba(16, 185, 129, 0.2)",
              padding: "6px 12px",
              borderRadius: "20px",
              width: "fit-content",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}>
              <IoPulseOutline size={15} /> 🟢 Live Flyer Engine Active • Canadian Coverage
            </div>
          </div>

          {/* Quick links */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <h4 style={{ fontSize: "14px", fontWeight: 800, color: "#FFFFFF", textTransform: "uppercase", letterSpacing: "1px" }}>Platform</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "14px" }}>
              <Link to="/" style={{ color: "#94A3B8" }} className="footer-link">Home & Search</Link>
              <a href="#how-it-works" style={{ color: "#94A3B8" }} className="footer-link">How It Works</a>
              <a href="#featured-deals" style={{ color: "#94A3B8" }} className="footer-link">Weekly Featured Discounts</a>
              <a href="#faq" style={{ color: "#94A3B8" }} className="footer-link">Frequently Asked Questions</a>
            </div>
          </div>

          {/* Supported Stores */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <h4 style={{ fontSize: "14px", fontWeight: 800, color: "#FFFFFF", textTransform: "uppercase", letterSpacing: "1px" }}>Supported Retailers (60+)</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "14px", color: "#94A3B8" }}>
              <span>Walmart Canada</span>
              <span>Maxi & Provigo</span>
              <span>Metro & Super C</span>
              <span>IGA & Marché Tradition</span>
              <span>Costco Canada</span>
              <span>Adonis & PA Nature</span>
            </div>
          </div>

          {/* Contact & Location Info */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <h4 style={{ fontSize: "14px", fontWeight: 800, color: "#FFFFFF", textTransform: "uppercase", letterSpacing: "1px" }}>Location & Support</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "14px", color: "#94A3B8" }}>
              <span>Montreal, Quebec, Canada</span>
              <span>Postal FSA: H4G 2Y5 (All Postal Codes Supported)</span>
              <span>Email: support@flyerwise.ca</span>
            </div>
          </div>
        </div>

        {/* Footer Divider */}
        <div style={{
          borderTop: "1px solid rgba(255, 255, 255, 0.1)",
          paddingTop: "30px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "20px",
        }}>
          {/* Copyright text */}
          <span style={{
            color: "#64748B",
            fontSize: "13px",
          }}>
            &copy; {new Date().getFullYear()} FlyerWise. All rights reserved. Built for smart grocery savings.
          </span>

          {/* Social Icons */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "18px",
            color: "#94A3B8",
          }}>
            <a href="https://github.com/Mishra1208/FlyerWise" style={{ color: "inherit" }} className="social-link"><IoLogoGithub size={20} /></a>
            <a href="#" style={{ color: "inherit" }} className="social-link"><IoLogoTwitter size={20} /></a>
            <a href="#" style={{ color: "inherit" }} className="social-link"><IoLogoFacebook size={20} /></a>
            <a href="#" style={{ color: "inherit" }} className="social-link"><IoLogoInstagram size={20} /></a>
          </div>
        </div>
      </div>

      <style>{`
        .footer-link:hover {
          color: #10B981 !important;
          padding-left: 4px;
        }
        .social-link:hover {
          color: #10B981 !important;
          transform: translateY(-2px);
        }
      `}</style>
    </footer>
  );
}
