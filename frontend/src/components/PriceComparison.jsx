import React, { useEffect, useState } from "react";
import { IoCloseOutline, IoCheckmarkCircleOutline } from "react-icons/io5";
import { PriceService } from "../services/api";
import PriceHistory from "./PriceHistory";

export default function PriceComparison({ product, onClose }) {
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPrices() {
      try {
        const data = await PriceService.compare(product.id);
        setPrices(data);
      } catch (err) {
        console.error("Failed to load compare prices:", err);
      } finally {
        setLoading(false);
      }
    }
    if (product) {
      loadPrices();
    }
  }, [product]);

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(27, 54, 93, 0.4)",
      backdropFilter: "blur(8px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      padding: "20px",
      animation: "fadeIn 0.2s ease-out",
    }}
    onClick={onClose}
    >
      <div 
        style={{
          width: "100%",
          maxWidth: "760px",
          backgroundColor: "#FFFFFF",
          borderRadius: "var(--radius-lg)",
          overflow: "hidden",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          animation: "scaleIn 0.3s var(--ease-elastic)",
          border: "1px solid var(--border-color)",
          boxShadow: "0 20px 50px rgba(27, 54, 93, 0.15)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header section */}
        <div style={{
          padding: "24px 30px",
          borderBottom: "1px solid var(--border-color)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "#F8FAFC",
        }}>
          <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
            <div style={{
              width: "74px",
              height: "74px",
              borderRadius: "var(--radius-md)",
              backgroundColor: "#FFFFFF",
              padding: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid var(--border-color)",
              boxShadow: "var(--shadow-sm)",
            }}>
              <img 
                src={product.image_url || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=200"} 
                alt={product.raw_name}
                style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                onError={(e) => {
                  e.target.src = "https://images.unsplash.com/photo-1542838132-92c53300491e?w=200";
                }}
              />
            </div>
            <div>
              {product.brand && (
                <span style={{
                  fontSize: "11px",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  color: "var(--accent-hover)",
                  letterSpacing: "1px",
                  display: "block",
                }}>{product.brand}</span>
              )}
              <h2 style={{ fontSize: "20px", color: "var(--text-primary)", fontWeight: 700, margin: "2px 0 4px 0" }}>
                {product.raw_name}
              </h2>
              <span style={{
                fontSize: "12px",
                color: "var(--text-secondary)",
                backgroundColor: "rgba(27, 54, 93, 0.05)",
                padding: "3px 10px",
                borderRadius: "var(--radius-full)",
                fontWeight: 600,
              }}>{product.category || "Grocery"}</span>
            </div>
          </div>

          <button onClick={onClose} style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid var(--border-color)",
            color: "var(--text-primary)",
            padding: "8px",
            borderRadius: "50%",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "var(--shadow-sm)",
            transition: "var(--transition)",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "var(--accent)"; e.currentTarget.style.transform = "rotate(90deg)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-primary)"; e.currentTarget.style.transform = "rotate(0)"; }}
          >
            <IoCloseOutline size={20} />
          </button>
        </div>

        {/* Scrollable contents */}
        <div style={{
          padding: "30px",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "28px",
        }}>
          {/* Price comparison list */}
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "16px", color: "var(--text-primary)" }}>Compare Store Prices</h3>
            {loading ? (
              <div style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)", fontSize: "15px" }}>Comparing store prices...</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {prices.map((price) => (
                  <div key={price.id} style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "16px 20px",
                    borderRadius: "var(--radius-md)",
                    backgroundColor: price.is_lowest ? "rgba(91, 140, 81, 0.05)" : "#FFFFFF",
                    border: price.is_lowest 
                      ? "1px solid rgba(91, 140, 81, 0.25)" 
                      : "1px solid var(--border-color)",
                    boxShadow: price.is_lowest ? "var(--shadow-glow)" : "none",
                  }}>
                    {/* Store details */}
                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                      <span style={{
                        width: "10px",
                        height: "10px",
                        borderRadius: "50%",
                        backgroundColor: price.store.color || "#ccc",
                      }}></span>
                      <div>
                        <strong style={{ fontSize: "16px", color: "var(--text-primary)", fontWeight: 700 }}>{price.store.name}</strong>
                        {price.savings && (
                          <span style={{
                            marginLeft: "10px",
                            fontSize: "11px",
                            backgroundColor: "rgba(229, 62, 62, 0.1)",
                            color: "var(--accent-red)",
                            padding: "2px 8px",
                            borderRadius: "4px",
                            fontWeight: 700,
                          }}>{price.savings}</span>
                        )}
                        <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "3px" }}>
                          Valid until {new Date(price.valid_until).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </div>
                      </div>
                    </div>

                    {/* Price Tag */}
                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                      <div style={{ textAlign: "right" }}>
                        <div style={{
                          fontSize: "20px",
                          fontWeight: 800,
                          color: price.is_lowest ? "var(--accent-hover)" : "var(--text-primary)",
                        }}>
                          ${parseFloat(price.current_price).toFixed(2)}
                        </div>
                        {price.unit && (
                          <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 500 }}>
                            {price.unit} {price.quantity ? `(${price.quantity})` : ""}
                          </div>
                        )}
                      </div>

                      {price.is_lowest && (
                        <div style={{
                          display: "flex",
                          alignItems: "center",
                          color: "var(--accent)",
                        }} title="Lowest Price Guarantee">
                          <IoCheckmarkCircleOutline size={26} />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Historical price trends */}
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "16px", color: "var(--text-primary)" }}>Price Trend (Last Scrapes)</h3>
            <div style={{
              padding: "20px",
              borderRadius: "var(--radius-md)",
              backgroundColor: "#F8FAFC",
              border: "1px solid var(--border-color)",
            }}>
              <PriceHistory productId={product.id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
