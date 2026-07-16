import React from "react";
import { IoChevronForward } from "react-icons/io5";

export default function ProductCard({ result, onClick }) {
  const { product, prices, lowest_price, savings_potential } = result;

  return (
    <div 
      className="glass" 
      onClick={() => onClick(product)}
      style={{
        borderRadius: "var(--radius-md)",
        padding: "20px",
        cursor: "pointer",
        transition: "var(--transition)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        gap: "16px",
        height: "100%",
        border: "1px solid var(--bg-card-border)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.borderColor = "var(--primary-glow)";
        e.currentTarget.style.boxShadow = "var(--shadow-md), var(--shadow-glow)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.borderColor = "var(--bg-card-border)";
        e.currentTarget.style.boxShadow = "var(--shadow-sm)";
      }}
    >
      {/* Product Information header */}
      <div style={{ display: "flex", gap: "16px" }}>
        {/* Product Image */}
        <div style={{
          width: "80px",
          height: "80px",
          borderRadius: "var(--radius-sm)",
          background: "white",
          padding: "6px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          border: "1px solid rgba(0,0,0,0.05)",
        }}>
          <img 
            src={product.image_url || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=120"} 
            alt={product.raw_name}
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "contain",
            }}
            onError={(e) => {
              e.target.src = "https://images.unsplash.com/photo-1542838132-92c53300491e?w=120";
            }}
          />
        </div>

        {/* Product Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {product.brand && (
            <span style={{
              fontSize: "12px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              color: "var(--primary-light)",
            }}>{product.brand}</span>
          )}
          <h3 style={{
            fontSize: "16px",
            fontWeight: 600,
            color: "var(--text-primary)",
            margin: "2px 0 6px 0",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }} title={product.raw_name}>
            {product.raw_name}
          </h3>
          <span style={{
            fontSize: "12px",
            color: "var(--text-muted)",
            background: "rgba(255,255,255,0.04)",
            padding: "2px 8px",
            borderRadius: "4px",
          }}>{product.category || "Grocery"}</span>
        </div>
      </div>

      {/* Stores and Prices list */}
      <div style={{
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        background: "rgba(0, 0, 0, 0.15)",
        padding: "12px",
        borderRadius: "var(--radius-sm)",
      }}>
        {prices.map((price) => (
          <div key={price.id} style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "14px",
          }}>
            {/* Store Name Badge */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: price.store.color || "#ccc",
              }}></span>
              <span style={{
                fontWeight: 500,
                color: "var(--text-secondary)",
              }}>{price.store.name}</span>
            </div>

            {/* Price tag */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}>
              {price.unit && (
                <span style={{
                  fontSize: "11px",
                  color: "var(--text-muted)",
                }}>{price.unit}</span>
              )}
              <span style={{
                fontWeight: 700,
                fontSize: price.is_lowest ? "16px" : "14px",
                color: price.is_lowest ? "var(--primary-light)" : "var(--text-primary)",
                background: price.is_lowest ? "rgba(16, 185, 129, 0.1)" : "transparent",
                padding: price.is_lowest ? "2px 8px" : 0,
                borderRadius: "4px",
                border: price.is_lowest ? "1px solid hsla(150, 84%, 40%, 0.3)" : "none",
              }}>
                ${parseFloat(price.current_price).toFixed(2)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Card Footer detail trigger */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderTop: "1px solid var(--bg-card-border)",
        paddingTop: "12px",
        fontSize: "13px",
      }}>
        {savings_potential > 0 ? (
          <span style={{
            color: "var(--accent)",
            fontWeight: 600,
          }}>
            Save up to ${parseFloat(savings_potential).toFixed(2)}!
          </span>
        ) : (
          <span style={{ color: "var(--text-muted)" }}>Available in {prices.length} stores</span>
        )}
        
        <span style={{
          display: "flex",
          alignItems: "center",
          gap: "4px",
          color: "var(--primary-light)",
          fontWeight: 600,
        }}>
          Compare <IoChevronForward size={14} />
        </span>
      </div>
    </div>
  );
}
