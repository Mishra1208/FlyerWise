import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { IoCloseOutline, IoCheckmarkCircleOutline, IoFlashOutline, IoRibbonOutline } from "react-icons/io5";
import { PriceService } from "../services/api";
import PriceHistory from "./PriceHistory";

export default function PriceComparison({ product, prices: initialPrices, onClose }) {
  const [prices, setPrices] = useState(Array.isArray(initialPrices) ? initialPrices : []);
  const [loading, setLoading] = useState(!initialPrices || !Array.isArray(initialPrices) || initialPrices.length === 0);

  useEffect(() => {
    async function loadPrices() {
      if (!product || !product.id) return;
      try {
        const data = await PriceService.compare(product.id);
        if (Array.isArray(data) && data.length > 0) {
          setPrices(data);
        }
      } catch (err) {
        console.error("Failed to load compare prices:", err);
      } finally {
        setLoading(false);
      }
    }

    loadPrices();
  }, [product]);

  if (!product) return null;

  function floatVal(val) {
    if (val === null || val === undefined) return 0;
    const parsed = typeof val === "number" ? val : parseFloat(val);
    return isNaN(parsed) ? 0 : parsed;
  }

  // Safely sort prices ascending by current_price
  const safePricesList = Array.isArray(prices) ? prices : [];
  const sortedPrices = [...safePricesList].sort((a, b) => floatVal(a.current_price) - floatVal(b.current_price));
  const lowestVal = sortedPrices.length > 0 ? floatVal(sortedPrices[0].current_price) : 0;

  return createPortal(
    <div 
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "20px",
        animation: "fadeIn 0.2s ease-out",
      }}
      onClick={onClose}
    >
      <div 
        style={{
          width: "100%",
          maxWidth: "800px",
          backgroundColor: "#FFFFFF",
          borderRadius: "24px",
          overflow: "hidden",
          maxHeight: "92vh",
          display: "flex",
          flexDirection: "column",
          animation: "scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
          border: "1px solid rgba(226, 232, 240, 0.8)",
          boxShadow: "0 25px 50px -12px rgba(15, 23, 42, 0.35)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header section */}
        <div style={{
          padding: "24px 32px",
          borderBottom: "1px solid #E2E8F0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "#F8FAFC",
        }}>
          <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
            <div style={{
              width: "74px",
              height: "74px",
              borderRadius: "16px",
              backgroundColor: "#FFFFFF",
              padding: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid #E2E8F0",
              boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
            }}>
              <img 
                src={product.image_url || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=200"} 
                alt={product.raw_name || "Product"}
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
                  color: "#059669",
                  letterSpacing: "1px",
                  display: "block",
                }}>{product.brand}</span>
              )}
              <h2 style={{ fontSize: "20px", color: "#0F172A", fontWeight: 800, margin: "2px 0 4px 0", fontFamily: "var(--font-headings)" }}>
                {product.raw_name || "Product Details"}
              </h2>
              <span style={{
                fontSize: "12px",
                color: "#475569",
                backgroundColor: "rgba(16, 185, 129, 0.08)",
                border: "1px solid rgba(16, 185, 129, 0.2)",
                padding: "3px 12px",
                borderRadius: "20px",
                fontWeight: 700,
              }}>
                Comparing {sortedPrices.length} Store {sortedPrices.length === 1 ? "Offer" : "Offers"}
              </span>
            </div>
          </div>

          <button 
            onClick={onClose} 
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E2E8F0",
              color: "#64748B",
              padding: "10px",
              borderRadius: "50%",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#0F172A"; e.currentTarget.style.transform = "rotate(90deg)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "#64748B"; e.currentTarget.style.transform = "rotate(0)"; }}
          >
            <IoCloseOutline size={22} />
          </button>
        </div>

        {/* Scrollable contents */}
        <div style={{
          padding: "32px",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "32px",
        }}>
          {/* Store Price Rankings */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#0F172A", fontFamily: "var(--font-headings)" }}>
                Store Price Rankings ({sortedPrices.length} Stores)
              </h3>
              <span style={{ fontSize: "12px", color: "#059669", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px" }}>
                <IoFlashOutline /> Sorted Lowest to Highest
              </span>
            </div>

            {loading ? (
              <div style={{ textAlign: "center", padding: "36px", color: "#64748B", fontSize: "15px" }}>Comparing store prices...</div>
            ) : sortedPrices.length === 0 ? (
              <div style={{ textAlign: "center", padding: "36px", color: "#64748B", fontSize: "15px" }}>No store price comparisons found.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {sortedPrices.map((price, idx) => {
                  if (!price) return null;
                  const pVal = floatVal(price.current_price);
                  const isLowest = idx === 0 || pVal === lowestVal;
                  const storeName = price.store?.name || price.store_name || "Grocery Store";
                  const storeColor = price.store?.color || price.store_color || "#10B981";

                  let statusBadge = null;
                  if (price.flyer_status === "expiring_today") {
                    statusBadge = (
                      <span style={{ fontSize: "11px", fontWeight: 800, color: "#D97706", backgroundColor: "#FEF3C7", padding: "3px 10px", borderRadius: "12px" }}>
                        ⏳ Ends Today
                      </span>
                    );
                  } else if (price.flyer_status === "upcoming") {
                    statusBadge = (
                      <span style={{ fontSize: "11px", fontWeight: 800, color: "#2563EB", backgroundColor: "#EFF6FF", padding: "3px 10px", borderRadius: "12px" }}>
                        📅 Preview
                      </span>
                    );
                  } else if (price.flyer_status === "recent_sale" || price.is_historical) {
                    statusBadge = (
                      <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748B", backgroundColor: "#F1F5F9", padding: "3px 10px", borderRadius: "12px" }}>
                        📜 Last Sale
                      </span>
                    );
                  } else {
                    statusBadge = (
                      <span style={{ fontSize: "11px", fontWeight: 800, color: "#047857", backgroundColor: "#D1FAE5", padding: "3px 10px", borderRadius: "12px" }}>
                        ⚡ Active Flyer
                      </span>
                    );
                  }

                  const dateStr = price.valid_from && price.valid_until
                    ? `${new Date(price.valid_from).toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${new Date(price.valid_until).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
                    : price.valid_until
                    ? `Valid until ${new Date(price.valid_until).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
                    : "Active Flyer";

                  return (
                    <div 
                      key={price.id || idx} 
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: isLowest ? "20px 24px" : "16px 20px",
                        borderRadius: "18px",
                        backgroundColor: isLowest ? "rgba(16, 185, 129, 0.04)" : "#FFFFFF",
                        border: isLowest ? "2px solid #10B981" : "1px solid #E2E8F0",
                        boxShadow: isLowest ? "0 10px 25px rgba(16, 185, 129, 0.2)" : "0 2px 6px rgba(0,0,0,0.02)",
                        position: "relative",
                        overflow: "hidden",
                        transition: "all 0.25s ease",
                      }}
                    >
                      {/* Glow Accent Stripe for Lowest Price */}
                      {isLowest && (
                        <div style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "6px",
                          height: "100%",
                          background: "linear-gradient(180deg, #10B981 0%, #059669 100%)",
                        }} />
                      )}

                      {/* Store Details & Badge */}
                      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        <span style={{
                          fontSize: "13px",
                          fontWeight: 800,
                          color: isLowest ? "#047857" : "#64748B",
                          backgroundColor: isLowest ? "#D1FAE5" : "#F1F5F9",
                          width: "28px",
                          height: "28px",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0
                        }}>
                          #{idx + 1}
                        </span>

                        <span style={{
                          width: "12px",
                          height: "12px",
                          borderRadius: "50%",
                          backgroundColor: storeColor,
                          flexShrink: 0,
                          boxShadow: "0 0 8px rgba(0,0,0,0.15)"
                        }} />

                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <strong style={{ fontSize: "16px", color: "#0F172A", fontWeight: 800 }}>
                              {storeName}
                            </strong>

                            {isLowest && (
                              <span style={{
                                fontSize: "11px",
                                fontWeight: 800,
                                background: "linear-gradient(135deg, #059669 0%, #10B981 100%)",
                                color: "#FFFFFF",
                                padding: "3px 10px",
                                borderRadius: "12px",
                                boxShadow: "0 2px 8px rgba(16, 185, 129, 0.3)",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px"
                              }}>
                                <IoRibbonOutline size={13} /> CHEAPEST OFFER
                              </span>
                            )}

                            {statusBadge}
                          </div>

                          <div style={{ fontSize: "12px", color: "#64748B", marginTop: "3px" }}>
                            {dateStr}
                          </div>
                        </div>
                      </div>

                      {/* Price Tag & Checkmark */}
                      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                        <div style={{ textAlign: "right" }}>
                          <span style={{
                            fontSize: isLowest ? "22px" : "18px",
                            fontWeight: 800,
                            color: isLowest ? "#047857" : "#0F172A",
                            backgroundColor: isLowest ? "#D1FAE5" : "transparent",
                            padding: isLowest ? "4px 14px" : "0",
                            borderRadius: "12px",
                            display: "inline-block"
                          }}>
                            ${pVal.toFixed(2)}
                          </span>
                          {price.unit && (
                            <span style={{ fontSize: "11px", color: "#64748B", display: "block", marginTop: "2px" }}>
                              {price.unit}
                            </span>
                          )}
                        </div>

                        {isLowest && (
                          <IoCheckmarkCircleOutline size={26} color="#10B981" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Historical price trends */}
          {product.id && (
            <div>
              <h3 style={{ fontSize: "18px", fontWeight: 800, marginBottom: "16px", color: "#0F172A", fontFamily: "var(--font-headings)" }}>
                Price History & 90-Day Trend
              </h3>
              <div style={{
                padding: "24px",
                borderRadius: "20px",
                backgroundColor: "#F8FAFC",
                border: "1px solid #E2E8F0",
              }}>
                <PriceHistory productId={product.id} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
