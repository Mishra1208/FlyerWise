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
      backgroundColor: "rgba(6, 9, 18, 0.8)",
      backdropFilter: "blur(8px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      padding: "20px",
    }}
    onClick={onClose}
    >
      <div 
        className="glass" 
        style={{
          width: "100%",
          maxWidth: "800px",
          borderRadius: "var(--radius-lg)",
          overflow: "hidden",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          animation: "scaleIn 0.3s var(--ease-elastic)",
          border: "1px solid var(--bg-card-border)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header section */}
        <div style={{
          padding: "24px",
          borderBottom: "1px solid var(--bg-card-border)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "start",
          gap: "20px",
        }}>
          <div style={{ display: "flex", gap: "20px" }}>
            <div style={{
              width: "100px",
              height: "100px",
              borderRadius: "var(--radius-md)",
              background: "white",
              padding: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid rgba(0,0,0,0.05)",
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
                  fontSize: "12px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  color: "var(--primary-light)",
                  letterSpacing: "1px",
                }}>{product.brand}</span>
              )}
              <h2 style={{ fontSize: "22px", margin: "4px 0 8px 0" }}>{product.raw_name}</h2>
              <span style={{
                fontSize: "13px",
                color: "var(--text-muted)",
                background: "rgba(255,255,255,0.04)",
                padding: "4px 12px",
                borderRadius: "var(--radius-full)",
              }}>{product.category || "Grocery"}</span>
            </div>
          </div>

          <button onClick={onClose} style={{
            background: "var(--bg-card-border)",
            border: "1px solid var(--bg-card-border)",
            color: "var(--text-secondary)",
            padding: "6px",
            borderRadius: "50%",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "var(--transition)",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text-primary)"; e.currentTarget.style.transform = "rotate(90deg)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-secondary)"; e.currentTarget.style.transform = "rotate(0)"; }}
          >
            <IoCloseOutline size={24} />
          </button>
        </div>

        {/* Scrollable contents */}
        <div style={{
          padding: "24px",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
        }}>
          {/* Price comparison list */}
          <div>
            <h3 style={{ fontSize: "16px", marginBottom: "14px", color: "var(--text-secondary)" }}>Compare Store Prices</h3>
            {loading ? (
              <div style={{ textAlign: "center", padding: "20px", color: "var(--text-secondary)" }}>Comparing store prices...</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {prices.map((price) => (
                  <div key={price.id} style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "16px 20px",
                    borderRadius: "var(--radius-md)",
                    background: price.is_lowest ? "hsla(150, 84%, 40%, 0.05)" : "rgba(255, 255, 255, 0.02)",
                    border: price.is_lowest 
                      ? "1px solid hsla(150, 84%, 40%, 0.25)" 
                      : "1px solid var(--bg-card-border)",
                    boxShadow: price.is_lowest ? "var(--shadow-glow)" : "none",
                  }}>
                    {/* Store details */}
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                      <span style={{
                        width: "12px",
                        height: "12px",
                        borderRadius: "50%",
                        background: price.store.color || "#ccc",
                      }}></span>
                      <div>
                        <strong style={{ fontSize: "16px", color: "var(--text-primary)" }}>{price.store.name}</strong>
                        {price.savings && (
                          <span style={{
                            marginLeft: "10px",
                            fontSize: "12px",
                            background: "rgba(244, 63, 94, 0.1)",
                            color: "var(--accent)",
                            padding: "2px 8px",
                            borderRadius: "4px",
                            fontWeight: 600,
                          }}>{price.savings}</span>
                        )}
                        <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                          Valid until {new Date(price.valid_until).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </div>
                      </div>
                    </div>

                    {/* Price Tag */}
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                      <div style={{ textAlign: "right" }}>
                        <div style={{
                          fontSize: "20px",
                          fontWeight: 800,
                          color: price.is_lowest ? "var(--primary-light)" : "var(--text-primary)",
                        }}>
                          ${parseFloat(price.current_price).toFixed(2)}
                        </div>
                        {price.unit && (
                          <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                            {price.unit} {price.quantity ? `(${price.quantity})` : ""}
                          </div>
                        )}
                      </div>

                      {price.is_lowest && (
                        <div style={{
                          display: "flex",
                          alignItems: "center",
                          color: "var(--primary-light)",
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
            <h3 style={{ fontSize: "16px", marginBottom: "14px", color: "var(--text-secondary)" }}>Price Trend (Last Scrapes)</h3>
            <div className="glass" style={{
              padding: "20px",
              borderRadius: "var(--radius-md)",
              background: "rgba(0, 0, 0, 0.15)",
              border: "1px solid var(--bg-card-border)",
            }}>
              <PriceHistory productId={product.id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
