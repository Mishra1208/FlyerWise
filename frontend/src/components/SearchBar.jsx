import React, { useState } from "react";
import { IoSearchOutline, IoCameraOutline } from "react-icons/io5";
import ScannerModal from "./ScannerModal";

export default function SearchBar({ initialValue = "", onSearch, placeholder = "Search tomatoes, milk, chicken..." }) {
  const [query, setQuery] = useState(initialValue);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const handleScannerDetected = (detectedQuery) => {
    setQuery(detectedQuery);
    if (onSearch) {
      onSearch(detectedQuery);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} style={{
        width: "100%",
        position: "relative",
        display: "flex",
        alignItems: "center",
        background: "#FFFFFF",
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--border-color)",
        padding: "6px",
        boxShadow: "var(--shadow-sm)",
        transition: "var(--transition)",
      }}
      onFocusCapture={(e) => {
        e.currentTarget.style.borderColor = "var(--accent)";
        e.currentTarget.style.boxShadow = "0 0 0 4px var(--accent-glow)";
      }}
      onBlurCapture={(e) => {
        e.currentTarget.style.borderColor = "var(--border-color)";
        e.currentTarget.style.boxShadow = "var(--shadow-sm)";
      }}
      >
        <div style={{
          display: "flex",
          alignItems: "center",
          flex: 1,
          paddingLeft: "12px",
          gap: "10px",
        }}>
          <IoSearchOutline size={20} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            style={{
              width: "100%",
              padding: "12px 6px",
              fontSize: "15px",
              color: "var(--text-primary)",
              fontWeight: 500,
            }}
          />
        </div>
        
        {/* Camera / Barcode Scanner Button */}
        <button
          type="button"
          onClick={() => setIsScannerOpen(true)}
          title="Scan barcode or photo"
          style={{
            padding: "10px 14px",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: 600,
            color: "var(--accent-hover)",
            backgroundColor: "rgba(91, 140, 81, 0.08)",
            border: "1px solid rgba(91, 140, 81, 0.2)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            marginRight: "6px",
            flexShrink: 0,
            transition: "var(--transition)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(91, 140, 81, 0.16)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(91, 140, 81, 0.08)";
          }}
        >
          <IoCameraOutline size={18} />
          <span style={{ fontSize: "12px", fontWeight: 700 }}>Scan</span>
        </button>

        <button 
          type="submit" 
          className="btn btn-primary"
          style={{
            padding: "10px 24px",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: 700,
            letterSpacing: "0.2px",
            flexShrink: 0,
          }}
        >
          Search
        </button>
      </form>

      {/* Scanner Modal */}
      <ScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onDetected={handleScannerDetected}
      />
    </>
  );
}

