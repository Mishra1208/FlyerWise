import React, { useState, useRef, useEffect } from "react";
import { IoCloseOutline, IoLocationOutline, IoCheckmarkCircleOutline } from "react-icons/io5";
import { useLocation } from "../contexts/LocationContext";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

// Canadian postal code regex
const POSTAL_RE = /^[A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d$/;

// Popular city quick-select options
const QUICK_CITIES = [
  { label: "Montreal", code: "H4G 2Y5" },
  { label: "Toronto", code: "M5V 2T6" },
  { label: "Ottawa", code: "K1P 5W3" },
  { label: "Quebec City", code: "G1R 2B5" },
  { label: "Vancouver", code: "V6B 1A1" },
  { label: "Calgary", code: "T2P 1J9" },
  { label: "Laval", code: "H7N 1A1" },
  { label: "Longueuil", code: "J4K 1A1" },
];

export default function PostalCodeModal({ isOpen, onClose }) {
  const { postalCode, setPostalCode, setIsLoading } = useLocation();
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState("");
  const [validationResult, setValidationResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scrapeMessage, setScrapeMessage] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
    if (isOpen) {
      setInputValue("");
      setError("");
      setValidationResult(null);
      setScrapeMessage("");
    }
  }, [isOpen]);

  // Auto-format as user types
  const handleInputChange = (e) => {
    let val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (val.length > 6) val = val.slice(0, 6);
    // Auto-insert space after 3rd char
    if (val.length > 3) {
      val = val.slice(0, 3) + " " + val.slice(3);
    }
    setInputValue(val);
    setError("");
    setValidationResult(null);
    setScrapeMessage("");
  };

  const handleSubmit = async (codeOverride) => {
    const code = codeOverride || inputValue.trim();
    if (!POSTAL_RE.test(code)) {
      setError("Invalid format. Canadian postal codes look like: H4G 2Y5");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setScrapeMessage("");

    try {
      // Step 1: Validate
      const valRes = await fetch(
        `${API_BASE}/location/validate?postal_code=${encodeURIComponent(code)}`
      );
      if (!valRes.ok) {
        setError("Invalid Canadian postal code.");
        setIsSubmitting(false);
        return;
      }
      const valData = await valRes.json();
      setValidationResult(valData);

      // Step 2: Activate (triggers scrape if needed)
      const actRes = await fetch(
        `${API_BASE}/location/activate?postal_code=${encodeURIComponent(code)}`,
        { method: "POST" }
      );
      const actData = await actRes.json();

      if (actData.scrape_triggered) {
        setScrapeMessage(actData.message);
        // Wait 3 seconds for initial data to come in, then proceed
        await new Promise((r) => setTimeout(r, 3000));
      }

      // Step 3: Update global context
      setPostalCode(valData.formatted, valData.city, valData.province);
      setIsSubmitting(false);
      onClose();
    } catch (err) {
      console.error("Postal code activation error:", err);
      setError("Network error. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(15, 23, 42, 0.6)",
          backdropFilter: "blur(4px)",
          zIndex: 1000,
          animation: "fadeIn 0.2s ease",
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "min(480px, 92vw)",
          backgroundColor: "#FFFFFF",
          borderRadius: "20px",
          boxShadow: "0 25px 50px rgba(0, 0, 0, 0.2)",
          zIndex: 1001,
          animation: "slideUp 0.3s ease",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "24px 28px 16px",
            borderBottom: "1px solid #E2E8F0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h2
              style={{
                fontSize: "20px",
                fontWeight: 800,
                color: "#0F172A",
                margin: 0,
                fontFamily: "var(--font-headings)",
              }}
            >
              📍 Change Your Location
            </h2>
            <p style={{ fontSize: "13px", color: "#64748B", margin: "4px 0 0" }}>
              Enter any Canadian postal code to see local deals
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: "6px",
              borderRadius: "10px",
              border: "none",
              backgroundColor: "#F1F5F9",
              cursor: "pointer",
              display: "flex",
            }}
          >
            <IoCloseOutline size={22} color="#64748B" />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "20px 28px 28px" }}>
          {/* Current location */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 14px",
              backgroundColor: "rgba(91, 140, 81, 0.08)",
              borderRadius: "10px",
              marginBottom: "20px",
              border: "1px solid rgba(91, 140, 81, 0.15)",
            }}
          >
            <IoLocationOutline size={18} color="var(--accent)" />
            <span style={{ fontSize: "13px", color: "var(--accent)", fontWeight: 600 }}>
              Current: <strong>{postalCode}</strong>
            </span>
          </div>

          {/* Input field */}
          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: 700,
                color: "#334155",
                marginBottom: "6px",
              }}
            >
              New Postal Code
            </label>
            <div style={{ display: "flex", gap: "10px" }}>
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="e.g. M5V 2T6"
                maxLength={7}
                style={{
                  flex: 1,
                  padding: "12px 16px",
                  fontSize: "16px",
                  fontWeight: 700,
                  letterSpacing: "2px",
                  border: error
                    ? "2px solid #EF4444"
                    : validationResult
                    ? "2px solid #22C55E"
                    : "2px solid #E2E8F0",
                  borderRadius: "12px",
                  outline: "none",
                  transition: "all 0.2s ease",
                  textTransform: "uppercase",
                  fontFamily: "var(--font-headings)",
                }}
              />
              <button
                onClick={() => handleSubmit()}
                disabled={isSubmitting || !inputValue.trim()}
                style={{
                  padding: "12px 24px",
                  borderRadius: "12px",
                  border: "none",
                  backgroundColor:
                    isSubmitting || !inputValue.trim()
                      ? "#CBD5E1"
                      : "var(--accent)",
                  color: "#FFFFFF",
                  fontWeight: 700,
                  fontSize: "14px",
                  cursor:
                    isSubmitting || !inputValue.trim()
                      ? "not-allowed"
                      : "pointer",
                  transition: "all 0.2s ease",
                  whiteSpace: "nowrap",
                }}
              >
                {isSubmitting ? "Setting up..." : "Apply"}
              </button>
            </div>

            {/* Error message */}
            {error && (
              <p
                style={{
                  fontSize: "12px",
                  color: "#EF4444",
                  margin: "6px 0 0",
                  fontWeight: 600,
                }}
              >
                ⚠️ {error}
              </p>
            )}

            {/* Validation success */}
            {validationResult && !error && (
              <p
                style={{
                  fontSize: "12px",
                  color: "#22C55E",
                  margin: "6px 0 0",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <IoCheckmarkCircleOutline size={14} />
                {validationResult.city}, {validationResult.province}
              </p>
            )}

            {/* Scrape loading message */}
            {scrapeMessage && (
              <p
                style={{
                  fontSize: "12px",
                  color: "#0284C7",
                  margin: "8px 0 0",
                  fontWeight: 600,
                  padding: "8px 12px",
                  backgroundColor: "#E0F2FE",
                  borderRadius: "8px",
                }}
              >
                🔄 {scrapeMessage}
              </p>
            )}
          </div>

          {/* Quick-select cities */}
          <div>
            <p
              style={{
                fontSize: "12px",
                fontWeight: 700,
                color: "#94A3B8",
                textTransform: "uppercase",
                letterSpacing: "1px",
                marginBottom: "10px",
              }}
            >
              Quick Select
            </p>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "8px",
              }}
            >
              {QUICK_CITIES.map((city) => (
                <button
                  key={city.code}
                  onClick={() => handleSubmit(city.code)}
                  disabled={isSubmitting}
                  style={{
                    padding: "8px 14px",
                    borderRadius: "10px",
                    border:
                      postalCode === city.code
                        ? "2px solid var(--accent)"
                        : "1px solid #E2E8F0",
                    backgroundColor:
                      postalCode === city.code
                        ? "rgba(91, 140, 81, 0.08)"
                        : "#F8FAFC",
                    color:
                      postalCode === city.code
                        ? "var(--accent)"
                        : "#475569",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  {city.label}
                  <span
                    style={{
                      fontSize: "11px",
                      color: "#94A3B8",
                      marginLeft: "6px",
                      fontWeight: 500,
                    }}
                  >
                    {city.code}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translate(-50%, -45%); }
          to { opacity: 1; transform: translate(-50%, -50%); }
        }
      `}</style>
    </>
  );
}
