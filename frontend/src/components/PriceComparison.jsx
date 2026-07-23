import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { IoCloseOutline, IoCheckmarkCircleOutline, IoFlashOutline, IoRibbonOutline, IoTimeOutline } from "react-icons/io5";
import { PriceService } from "../services/api";
import PriceHistory from "./PriceHistory";

export default function PriceComparison({ product: rawProduct, prices: rawPrices, onClose }) {
  const product = rawProduct?.product ? rawProduct.product : rawProduct;
  const initialPrices = rawPrices || rawProduct?.prices || [];

  const [prices, setPrices] = useState(Array.isArray(initialPrices) ? initialPrices : []);
  const [loading, setLoading] = useState(!initialPrices || !Array.isArray(initialPrices) || initialPrices.length === 0);

  useEffect(() => {
    async function loadPrices() {
      if (!product || !product.id) return;
      try {
        const data = await PriceService.compare(product.id);
        if (Array.isArray(data) && data.length > 0) {
          // Merge initialPrices (from search card) with API data to ensure ALL stores are preserved
          setPrices((prevPrices) => {
            const mergedMap = new Map();
            (prevPrices || []).forEach((p) => {
              const sId = p.store?.id || p.store_id || p.store?.name;
              if (sId) mergedMap.set(sId, p);
            });
            data.forEach((p) => {
              const sId = p.store?.id || p.store_id || p.store?.name;
              if (sId && !mergedMap.has(sId)) {
                mergedMap.set(sId, p);
              }
            });
            return Array.from(mergedMap.values());
          });
        }
      } catch (err) {
        console.error("Failed to load compare prices:", err);
      } finally {
        setLoading(false);
      }
    }

    loadPrices();
  }, [product]);

  if (!product || !product.id) return null;

  function floatVal(val) {
    if (val === null || val === undefined) return 0;
    const parsed = typeof val === "number" ? val : parseFloat(val);
    return isNaN(parsed) ? 0 : parsed;
  }

  const safePricesList = Array.isArray(prices) ? prices : [];
  
  // Partition into Active Deals vs Past Sales
  const activePrices = [];
  const pastPrices = [];

  safePricesList.forEach((p) => {
    if (p.flyer_status === "recent_sale" || p.is_historical) {
      pastPrices.push(p);
    } else {
      activePrices.push(p);
    }
  });

  // Sort both active and past prices ascending by current_price
  activePrices.sort((a, b) => floatVal(a.current_price) - floatVal(b.current_price));
  pastPrices.sort((a, b) => floatVal(a.current_price) - floatVal(b.current_price));

  const lowestActiveVal = activePrices.length > 0 ? floatVal(activePrices[0].current_price) : null;

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
          maxWidth: "820px",
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
                color: "#047857",
                backgroundColor: "#D1FAE5",
                border: "1px solid rgba(16, 185, 129, 0.3)",
                padding: "3px 12px",
                borderRadius: "20px",
                fontWeight: 700,
              }}>
                {activePrices.length} Active {activePrices.length === 1 ? "Deal" : "Deals"} Available Now
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

          {/* SECTION 1: Active Store Price Rankings */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#0F172A", fontFamily: "var(--font-headings)" }}>
                ⚡ Current Active Flyer Deals ({activePrices.length})
              </h3>
              <span style={{ fontSize: "12px", color: "#059669", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px" }}>
                <IoFlashOutline /> Sorted Cheapest to Highest
              </span>
            </div>

            {loading ? (
              <div style={{ textAlign: "center", padding: "28px", color: "#64748B", fontSize: "15px" }}>Comparing store prices...</div>
            ) : activePrices.length === 0 ? (
              <div style={{ 
                backgroundColor: "#FFFBEB", 
                border: "1px solid #FCD34D", 
                borderRadius: "16px", 
                padding: "20px", 
                color: "#92400E",
                fontSize: "14px",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: "10px"
              }}>
                <IoTimeOutline size={22} color="#D97706" />
                <span>No active flyer deals found this week. Check recent flyer sales below for benchmark pricing!</span>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {activePrices.map((price, idx) => {
                  const pVal = floatVal(price.current_price);
                  const isLowest = idx === 0 || pVal === lowestActiveVal;
                  const storeName = price.store?.name || price.store_name || "Grocery Store";
                  const storeColor = price.store?.color || price.store_color || "#10B981";

                  let statusBadge = (
                    <span style={{ fontSize: "11px", fontWeight: 800, color: "#047857", backgroundColor: "#D1FAE5", padding: "3px 10px", borderRadius: "12px" }}>
                      ⚡ Active Flyer
                    </span>
                  );

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
                      {/* Glow Accent Stripe for Lowest Active Price */}
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
                                <IoRibbonOutline size={13} /> CHEAPEST ACTIVE DEAL
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

          {/* SECTION 2: Past Flyer Sales & Benchmark History */}
          {pastPrices.length > 0 && (
            <div style={{
              backgroundColor: "#F8FAFC",
              borderRadius: "20px",
              border: "1px dashed #CBD5E1",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "16px"
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <h4 style={{ fontSize: "15px", fontWeight: 800, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  📜 Recent Flyer History & Past Sales ({pastPrices.length})
                </h4>
                <span style={{ fontSize: "12px", color: "#94A3B8", fontWeight: 600 }}>
                  Historical Reference Only (Not Current)
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {pastPrices.map((price, idx) => {
                  const pVal = floatVal(price.current_price);
                  const storeName = price.store?.name || price.store_name || "Grocery Store";
                  const dateStr = price.valid_from && price.valid_until
                    ? `${new Date(price.valid_from).toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${new Date(price.valid_until).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
                    : "Past Flyer Sale";

                  return (
                    <div 
                      key={price.id || idx}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "12px 18px",
                        borderRadius: "14px",
                        backgroundColor: "#FFFFFF",
                        border: "1px solid #E2E8F0",
                        opacity: 0.75,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <span style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          color: "#64748B",
                          backgroundColor: "#F1F5F9",
                          padding: "2px 8px",
                          borderRadius: "10px",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px"
                        }}>
                          📜 EXPIRED SALE
                        </span>
                        <div>
                          <strong style={{ fontSize: "14px", color: "#475569" }}>{storeName}</strong>
                          <div style={{ fontSize: "11px", color: "#94A3B8" }}>{dateStr}</div>
                        </div>
                      </div>

                      <div style={{ fontSize: "16px", fontWeight: 700, color: "#64748B" }}>
                        ${pVal.toFixed(2)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Historical price trends */}
          {product.id && (
            <div>
              <h3 style={{ fontSize: "18px", fontWeight: 800, marginBottom: "16px", color: "#0F172A", fontFamily: "var(--font-headings)" }}>
                Price History & 90-Day Trend Graph
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
