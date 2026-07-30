import React, { useState, useEffect } from "react";
import { IoSearchOutline, IoCameraOutline, IoCloseCircleOutline } from "react-icons/io5";
import ScannerModal from "./ScannerModal";

export default function SearchBar({ initialValue = "", onSearch, placeholder = "Search tomatoes, milk, chicken..." }) {
  const [query, setQuery] = useState(initialValue);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  useEffect(() => {
    setQuery(initialValue || "");
  }, [initialValue]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(query.trim());
    }
  };

  const handleClear = () => {
    setQuery("");
    if (onSearch) {
      onSearch("");
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
        borderRadius: "var(--radius-lg)",
        border: "2px solid #EFEFEF",
        padding: "6px 8px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
        transition: "var(--transition)",
      }}
      onFocusCapture={(e) => {
        e.currentTarget.style.borderColor = "var(--accent-amber)";
        e.currentTarget.style.boxShadow = "0 4px 25px rgba(255, 196, 63, 0.25)";
      }}
      onBlurCapture={(e) => {
        e.currentTarget.style.borderColor = "#EFEFEF";
        e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.04)";
      }}
      >
        <div style={{
          display: "flex",
          alignItems: "center",
          flex: 1,
          paddingLeft: "12px",
          gap: "10px",
        }}>
          <IoSearchOutline size={22} style={{ color: "#222222", flexShrink: 0 }} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            style={{
              width: "100%",
              padding: "12px 6px",
              fontSize: "15px",
              color: "#222222",
              fontWeight: 600,
            }}
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              title="Clear search"
              style={{
                border: "none",
                background: "transparent",
                color: "#888888",
                cursor: "pointer",
                padding: "4px",
                display: "flex",
                alignItems: "center",
                marginRight: "6px",
              }}
            >
              <IoCloseCircleOutline size={18} />
            </button>
          )}
        </div>
        
        {/* Camera / Barcode Scanner Button */}
        <button
          type="button"
          onClick={() => setIsScannerOpen(true)}
          title="Scan barcode or photo"
          style={{
            padding: "10px 14px",
            borderRadius: "var(--radius-md)",
            fontSize: "13px",
            fontWeight: 700,
            color: "#222222",
            backgroundColor: "#F8F9FA",
            border: "1px solid #EFEFEF",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            marginRight: "6px",
            flexShrink: 0,
            transition: "var(--transition)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#EEF5E4";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#F8F9FA";
          }}
        >
          <IoCameraOutline size={18} color="#5B8C51" />
          <span style={{ fontSize: "12px", fontWeight: 800 }}>Scan</span>
        </button>

        <button 
          type="submit" 
          style={{
            padding: "10px 26px",
            borderRadius: "var(--radius-md)",
            fontSize: "14px",
            fontWeight: 800,
            backgroundColor: "#FFC43F",
            color: "#222222",
            border: "none",
            cursor: "pointer",
            boxShadow: "0 4px 14px rgba(255, 196, 63, 0.4)",
            transition: "all 0.2s ease",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#F7A422";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#FFC43F";
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

