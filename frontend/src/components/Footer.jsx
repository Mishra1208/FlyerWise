import React from "react";
import { Link } from "react-router-dom";
import { IoLogoGithub, IoLogoTwitter, IoLogoFacebook, IoLogoInstagram } from "react-icons/io5";

export default function Footer() {
  return (
    <footer style={{
      backgroundColor: "var(--primary)",
      color: "#FFFFFF",
      padding: "60px 0 30px 0",
      marginTop: "auto",
      borderTop: "1px solid rgba(255, 255, 255, 0.08)",
    }}>
      <div className="container">
        {/* Footer Top Links & Details Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "40px",
          marginBottom: "50px",
        }}>
          {/* Logo & Pitch */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <span style={{
              fontWeight: 800,
              fontSize: "24px",
              letterSpacing: "-0.5px",
            }}>
              Flyer<span style={{ color: "var(--accent)" }}>Wise</span>
            </span>
            <p style={{
              color: "rgba(255, 255, 255, 0.7)",
              fontSize: "14px",
              lineHeight: "1.7",
              maxWidth: "280px",
            }}>
              Stop overpaying on weekly groceries. We scrape and compile real-time flyer deals so you always purchase at the lowest price.
            </p>
          </div>

          {/* Quick links */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <h4 style={{ fontSize: "16px", fontWeight: 700, color: "#FFFFFF", textTransform: "uppercase", letterSpacing: "0.5px" }}>Quick Links</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "14px" }}>
              <Link to="/" style={{ color: "rgba(255, 255, 255, 0.7)" }} className="footer-link">Home</Link>
              <a href="#how-it-works" style={{ color: "rgba(255, 255, 255, 0.7)" }} className="footer-link">How It Works</a>
              <a href="#featured-deals" style={{ color: "rgba(255, 255, 255, 0.7)" }} className="footer-link">Featured Deals</a>
              <a href="#faq" style={{ color: "rgba(255, 255, 255, 0.7)" }} className="footer-link">FAQs</a>
            </div>
          </div>

          {/* Supported Stores */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <h4 style={{ fontSize: "16px", fontWeight: 700, color: "#FFFFFF", textTransform: "uppercase", letterSpacing: "0.5px" }}>Supported Stores</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "14px" }}>
              <span style={{ color: "rgba(255, 255, 255, 0.7)" }}>Walmart Canada</span>
              <span style={{ color: "rgba(255, 255, 255, 0.7)" }}>Maxi (Quebec)</span>
              <span style={{ color: "rgba(255, 255, 255, 0.7)" }}>Metro (Quebec/Ontario)</span>
            </div>
          </div>

          {/* Contact & Location Info */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <h4 style={{ fontSize: "16px", fontWeight: 700, color: "#FFFFFF", textTransform: "uppercase", letterSpacing: "0.5px" }}>Contact</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "14px", color: "rgba(255, 255, 255, 0.7)" }}>
              <span>Montreal, Quebec, Canada</span>
              <span>Email: info@flyerwise.ca</span>
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
            color: "rgba(255, 255, 255, 0.5)",
            fontSize: "13px",
          }}>
            &copy; {new Date().getFullYear()} FlyerWise. All rights reserved. Built for grocery savings.
          </span>

          {/* Social Icons */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "18px",
            color: "rgba(255, 255, 255, 0.6)",
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
          color: #FFFFFF !important;
          padding-left: 4px;
        }
        .social-link:hover {
          color: var(--accent) !important;
          transform: translateY(-2px);
        }
      `}</style>
    </footer>
  );
}
