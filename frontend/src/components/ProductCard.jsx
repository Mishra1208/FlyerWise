import React from "react";
import { IoChevronForwardOutline, IoCartOutline, IoCheckmarkCircleOutline } from "react-icons/io5";
import { getFlyerCountdown } from "../utils/timeUtils";
import { useBasket } from "../contexts/BasketContext";

function getCleanItemName(rawName, brand) {
  if (!rawName) return "";
  let name = rawName.trim();
  if (/^margarine\s+/i.test(name) && brand) {
    name = `${brand} Margarine`;
  }
  // Strip size/weight descriptors
  name = name.replace(/,?\s*\d+(\.\d+)?\s*(g|kg|ml|l|mg|oz|lb|lbs|pk|pack)\b/gi, "");
  // Title Case
  return name.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.substring(1).toLowerCase()).trim();
}

export default function ProductCard({ result, onClick, onCompare }) {
  const { product, prices, lowest_price, savings_potential, intelligence } = result;
  const { basketItems, addItem, removeItem } = useBasket();

  const cleanTitle = getCleanItemName(product.raw_name, product.brand);

  const isItemInBasket = basketItems.some((i) => {
    const itemTitle = typeof i === "object" ? i.title : i;
    return itemTitle.toLowerCase() === cleanTitle.toLowerCase() ||
           product.raw_name.toLowerCase().includes(itemTitle.toLowerCase()) || 
           itemTitle.toLowerCase().includes(product.raw_name.toLowerCase());
  });

  const handleToggleBasket = (e) => {
    e.stopPropagation();
    if (isItemInBasket) {
      removeItem(cleanTitle);
    } else {
      const topStore = prices && prices.length > 0 ? (prices[0].store?.name || prices[0].store_name) : "Grocery Store";
      const itemPrice = lowest_price || (prices && prices.length > 0 ? prices[0].current_price : 3.49);

      addItem({
        id: product.id,
        title: cleanTitle,
        price: itemPrice,
        store_name: topStore,
        image_url: product.image_url,
        quantity: 1,
      });
    }
  };

  return (
    <div 
      className="card animate-fade" 
      onClick={() => onClick(result)}
      style={{
        padding: "22px",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        gap: "16px",
        height: "100%",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Product Image, Title, & Savings/Intelligence Badges Header */}
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
          
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center" }}>
            <span style={{
              fontSize: "11px",
              color: "var(--accent)",
              fontWeight: 600,
              backgroundColor: "rgba(91, 140, 81, 0.08)",
              padding: "2px 8px",
              borderRadius: "4px",
            }}>{product.category || "Grocery"}</span>

            {/* Deal Score / Price Advisor Badge */}
            {intelligence && intelligence.badge_text && (
              <span style={{
                fontSize: "11px",
                fontWeight: 700,
                color: intelligence.deal_score >= 80 ? "#065F46" : intelligence.deal_score >= 60 ? "#1E40AF" : "#92400E",
                backgroundColor: intelligence.deal_score >= 80 ? "#D1FAE5" : intelligence.deal_score >= 60 ? "#DBEAFE" : "#FEF3C7",
                padding: "2px 8px",
                borderRadius: "4px",
                display: "inline-flex",
                alignItems: "center",
                gap: "3px",
              }}>
                {intelligence.badge_text}
              </span>
            )}
          </div>
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

      {/* Stores and Prices list with Live Countdowns */}
      <div style={{
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        backgroundColor: "#F8FAFC",
        padding: "14px",
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--border-color)",
        {/* Active flyer deals first, then past sales */}
        {[...prices].sort((a, b) => {
          const aIsPast = a.flyer_status === "recent_sale" || a.is_historical ? 1 : 0;
          const bIsPast = b.flyer_status === "recent_sale" || b.is_historical ? 1 : 0;
          if (aIsPast !== bIsPast) return aIsPast - bIsPast;
          return parseFloat(a.current_price || 0) - parseFloat(b.current_price || 0);
        }).map((price) => {
          const countdown = getFlyerCountdown(price.valid_until, price.valid_from, price.flyer_status);

          return (
            <div key={price.id} style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "14px",
              opacity: price.is_historical ? 0.75 : 1,
            }}>
              {/* Store Name & Countdown Badge */}
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
                
                {/* Live Countdown Badge */}
                <span style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  color: countdown.color,
                  backgroundColor: countdown.bg,
                  padding: "2px 6px",
                  borderRadius: "4px",
                  animation: countdown.isUrgent ? "pulse 2s infinite" : "none",
                }}>
                  {countdown.text}
                </span>
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

      {/* Card Footer Actions (Details, Basket, Compare) */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderTop: "1px solid var(--border-color)",
        paddingTop: "12px",
        fontSize: "13px",
      }}>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClick(result);
            }}
            style={{
              backgroundColor: "rgba(91, 140, 81, 0.08)",
              border: "1px solid rgba(91, 140, 81, 0.2)",
              color: "var(--accent-hover)",
              padding: "5px 10px",
              borderRadius: "6px",
              fontSize: "12px",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            📖 Details
          </button>

          {/* + Add to Basket Button */}
          <button
            type="button"
            onClick={handleToggleBasket}
            style={{
              backgroundColor: isItemInBasket ? "#ECFDF5" : "rgba(27, 54, 93, 0.06)",
              border: isItemInBasket ? "1px solid #10B981" : "1px solid rgba(27, 54, 93, 0.15)",
              color: isItemInBasket ? "#047857" : "var(--primary)",
              padding: "5px 10px",
              borderRadius: "6px",
              fontSize: "12px",
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              transition: "all 0.2s",
            }}
          >
            {isItemInBasket ? (
              <>
                <IoCheckmarkCircleOutline size={14} color="#10B981" /> Added
              </>
            ) : (
              <>
                <IoCartOutline size={14} /> + Basket
              </>
            )}
          </button>
        </div>
        
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (onCompare) {
              onCompare(result);
            }
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            color: "var(--accent)",
            fontWeight: 700,
            cursor: "pointer",
            background: "none",
            border: "none",
            padding: "4px 8px",
            borderRadius: "6px",
            transition: "all 0.2s ease",
          }}
          className="compare-link"
        >
          Compare <IoChevronForwardOutline size={14} />
        </button>
      </div>

      <style>{`
        .card:hover .compare-link {
          color: var(--accent-hover);
          transform: translateX(3px);
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}
