import React from "react";
import { Link } from "react-router-dom";
import { IoCartOutline, IoLocationOutline, IoMoonOutline } from "react-icons/io5";

export default function Navbar() {
  return (
    <nav className="glass" style={{
      position: "sticky",
      top: 0,
      zIndex: 100,
      padding: "16px 0",
      borderTop: "none",
      borderLeft: "none",
      borderRight: "none",
      borderRadius: 0,
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
          gap: "10px",
          fontWeight: 800,
          fontSize: "24px",
          letterSpacing: "-0.5px",
        }}>
          <div style={{
            background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)",
            color: "white",
            padding: "8px",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "var(--shadow-glow)",
          }}>
            <IoCartOutline size={24} />
          </div>
          <span className="gradient-text">FlyerWise</span>
        </Link>

        {/* User context & Actions */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "20px",
        }}>
          {/* Location details */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            background: "var(--bg-card-border)",
            padding: "6px 14px",
            borderRadius: "var(--radius-full)",
            fontSize: "14px",
            color: "var(--text-secondary)",
            border: "1px solid var(--bg-card-border)",
          }}>
            <IoLocationOutline size={16} style={{ color: "var(--primary-light)" }} />
            <span>Montreal, <strong>H4G 2Y5</strong></span>
          </div>

          {/* Theme switcher */}
          <button style={{
            padding: "8px",
            borderRadius: "50%",
            background: "var(--bg-card-border)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--text-secondary)",
            transition: "var(--transition)",
            border: "1px solid var(--bg-card-border)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--text-primary)";
            e.currentTarget.style.transform = "scale(1.05)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--text-secondary)";
            e.currentTarget.style.transform = "scale(1)";
          }}
          >
            <IoMoonOutline size={18} />
          </button>
        </div>
      </div>
    </nav>
  );
}
