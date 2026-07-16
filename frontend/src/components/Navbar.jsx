import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { IoLocationOutline, IoMenuOutline, IoCloseOutline } from "react-icons/io5";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  // Scroll listener for border shadow effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  return (
    <nav style={{
      position: "sticky",
      top: 0,
      zIndex: 100,
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      backdropFilter: "blur(12px)",
      borderBottom: scrolled ? "1px solid rgba(0, 0, 0, 0.05)" : "1px solid transparent",
      boxShadow: scrolled ? "0 4px 20px rgba(0, 0, 0, 0.03)" : "none",
      transition: "var(--transition)",
      padding: scrolled ? "12px 0" : "18px 0",
    }}>
      <div className="container" style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        {/* Logo */}
        <Link to="/" style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}>
          <span style={{
            fontFamily: "var(--font-headings)",
            fontWeight: 800,
            fontSize: "24px",
            color: "var(--primary)",
            letterSpacing: "-0.5px",
          }}>
            Flyer<span style={{ color: "var(--accent)" }}>Wise</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="desktop-nav" style={{
          display: "flex",
          alignItems: "center",
          gap: "32px",
        }}>
          <Link to="/" style={{
            fontSize: "15px",
            fontWeight: 500,
            color: location.pathname === "/" ? "var(--accent)" : "var(--text-primary)",
          }}>
            Home
          </Link>
          <a href="#how-it-works" style={{
            fontSize: "15px",
            fontWeight: 500,
            color: "var(--text-primary)",
          }}>
            How It Works
          </a>
          <a href="#featured-deals" style={{
            fontSize: "15px",
            fontWeight: 500,
            color: "var(--text-primary)",
          }}>
            Deals
          </a>
          <a href="#faq" style={{
            fontSize: "15px",
            fontWeight: 500,
            color: "var(--text-primary)",
          }}>
            FAQ
          </a>
        </div>

        {/* Location & Mobile Action */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
        }}>
          {/* Location details */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            backgroundColor: "rgba(91, 140, 81, 0.06)",
            border: "1px solid rgba(91, 140, 81, 0.15)",
            padding: "6px 14px",
            borderRadius: "var(--radius-full)",
            fontSize: "13px",
            color: "var(--accent)",
            fontWeight: 600,
          }}>
            <IoLocationOutline size={16} />
            <span>Montreal, <strong>H4G 2Y5</strong></span>
          </div>

          {/* Hamburger Icon */}
          <button 
            className="mobile-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              padding: "6px",
              cursor: "pointer",
              color: "var(--text-primary)",
              display: "none", // Will be shown via CSS media query
            }}
          >
            {menuOpen ? <IoCloseOutline size={26} /> : <IoMenuOutline size={26} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div className="mobile-drawer animate-fade" style={{
          position: "absolute",
          top: "100%",
          left: 0,
          right: 0,
          backgroundColor: "#FFFFFF",
          borderBottom: "1px solid var(--border-color)",
          padding: "20px 24px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          boxShadow: "0 10px 20px rgba(0,0,0,0.05)",
        }}>
          <Link to="/" style={{
            fontSize: "16px",
            fontWeight: 600,
            color: location.pathname === "/" ? "var(--accent)" : "var(--text-primary)",
          }}>
            Home
          </Link>
          <a href="#how-it-works" onClick={() => setMenuOpen(false)} style={{
            fontSize: "16px",
            fontWeight: 600,
            color: "var(--text-primary)",
          }}>
            How It Works
          </a>
          <a href="#featured-deals" onClick={() => setMenuOpen(false)} style={{
            fontSize: "16px",
            fontWeight: 600,
            color: "var(--text-primary)",
          }}>
            Deals
          </a>
          <a href="#faq" onClick={() => setMenuOpen(false)} style={{
            fontSize: "16px",
            fontWeight: 600,
            color: "var(--text-primary)",
          }}>
            FAQ
          </a>
        </div>
      )}

      {/* Quick injection of responsive styles for navbar & mobile toggle */}
      <style>{`
        @media (max-width: 768px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-toggle {
            display: flex !important;
          }
        }
      `}</style>
    </nav>
  );
}
