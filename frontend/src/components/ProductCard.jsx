import React from "react";
import { IoChevronForwardOutline } from "react-icons/io5";

export default function ProductCard({ result, onClick }) {
  const { product, prices, lowest_price, savings_potential } = result;

  return (
    <div 
      className="card animate-fade" 
      onClick={() => onClick(product)}
      style={{
        padding: "24px",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        gap: "18px",
        height: "100%",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Product Image, Title, & Savings Badge Header */}
      <div style={{ display: "flex", gap: "14px", alignItems: "flex-start", justifyContent: "space-between" }}>
        {/* Product Image */}
        <div style={{
          width: "72px",
          height: "72px",
          borderRadius: "var(--radius-sm)",
          backgroundColor: "#F8FAFC",
          padding: "6px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          border: "1px solid rgba(0, 0, 0, 0.04)",
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
              fontSize: "11px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.8px",
              color: "var(--text-muted)",
              display: "block",
            }}>{product.brand}</span>
          )}
          <h3 style={{
            fontSize: "15px",
            fontWeight: 700,
            color: "var(--text-primary)",
            margin: "2px 0 6px 0",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            paddingRight: "4px",
          }} title={product.raw_name}>
            {product.raw_name}
          </h3>
          <span style={{
            fontSize: "11px",
            color: "var(--accent)",
            fontWeight: 600,
            backgroundColor: "rgba(91, 140, 81, 0.08)",
            padding: "3px 8px",
            borderRadius: "4px",
          }}>{product.category || "Grocery"}</span>
        </div>

        {/* Discount/Savings Badge */}
        {savings_potential > 0 && (
          <div 
            className="badge badge-deal"
            style={{
              fontSize: "11px",
              letterSpacing: "0.5px",
              whiteSpace: "nowrap",
              flexShrink: 0,
              alignSelf: "flex-start",
              boxShadow: "0 2px 6px rgba(229, 62, 62, 0.15)",
              padding: "4px 8px",
            }}
          >
            SAVE ${parseFloat(savings_potential).toFixed(2)}
          </div>
        )}
      </div>

      {/* Stores and Prices list */}
      <div style={{
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        backgroundColor: "#F8FAFC",
        padding: "14px",
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--border-color)",
      }}>
        {prices.map((price) => {
          // Status badge config
          let statusBadge = null;
          if (price.flyer_status === "expiring_today") {
            statusBadge = (
              <span style={{
                fontSize: "10px",
                fontWeight: 700,
                color: "#D97706",
                backgroundColor: "#FEF3C7",
                padding: "2px 6px",
                borderRadius: "4px",
              }}>
                ⏳ Ends Today
              </span>
            );
          } else if (price.flyer_status === "upcoming") {
            statusBadge = (
              <span style={{
                fontSize: "10px",
                fontWeight: 700,
                color: "#2563EB",
                backgroundColor: "#EFF6FF",
                padding: "2px 6px",
                borderRadius: "4px",
              }}>
                📅 Preview
              </span>
            );
          } else if (price.flyer_status === "recent_sale" || price.is_historical) {
            statusBadge = (
              <span style={{
                fontSize: "10px",
                fontWeight: 600,
                color: "#64748B",
                backgroundColor: "#F1F5F9",
                padding: "2px 6px",
                borderRadius: "4px",
              }}>
                📜 Last Sale
              </span>
            );
          }

          return (
            <div key={price.id} style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "14px",
              opacity: price.is_historical ? 0.75 : 1,
            }}>
              {/* Store Name & Indicator */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: price.store.color || "#ccc",
                  display: "inline-block",
                }}></span>
                <span style={{
                  fontWeight: 600,
                  color: "var(--text-secondary)",
                }}>{price.store.name}</span>
                {statusBadge}
              </div>

              {/* Price Tag with unit */}
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                {price.unit && (
                  <span style={{
                    fontSize: "11px",
                    color: "var(--text-muted)",
                  }}>{price.unit}</span>
                )}
                <span style={{
                  fontWeight: 700,
                  fontSize: price.is_lowest ? "15px" : "14px",
                  color: price.is_lowest ? "var(--accent-hover)" : "var(--text-primary)",
                  backgroundColor: price.is_lowest ? "rgba(91, 140, 81, 0.12)" : "transparent",
                  padding: price.is_lowest ? "2px 8px" : 0,
                  borderRadius: "4px",
                  border: price.is_lowest ? "1px solid rgba(91, 140, 81, 0.2)" : "none",
                }}>
                  ${parseFloat(price.current_price).toFixed(2)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Card Footer Compare action */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderTop: "1px solid var(--border-color)",
        paddingTop: "14px",
        fontSize: "13px",
      }}>
        <span style={{ color: "var(--text-muted)", fontWeight: 500 }}>
          Available in {prices.length} stores
        </span>
        
        <span style={{
          display: "flex",
          alignItems: "center",
          gap: "4px",
          color: "var(--accent)",
          fontWeight: 700,
          transition: "var(--transition)",
        }}
        className="compare-link"
        >
          Compare Prices <IoChevronForwardOutline size={14} />
        </span>
      </div>

      <style>{`
        .card:hover .compare-link {
          color: var(--accent-hover);
          transform: translateX(3px);
        }
      `}</style>
    </div>
  );
}
