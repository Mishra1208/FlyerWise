import React, { useEffect, useState } from "react";
import { IoCloseOutline, IoSparklesOutline, IoInformationCircleOutline, IoCheckmarkCircleOutline } from "react-icons/io5";
import { IntelligenceService } from "../services/api";

export default function ProductDetailModal({ result, onClose }) {
  if (!result) return null;

  const product = result?.product || (result?.raw_name ? result : {});
  const prices = result?.prices || [];
  const lowest_price = result?.lowest_price;
  const [intelligence, setIntelligence] = useState(null);
  const [loadingIntel, setLoadingIntel] = useState(true);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Fetch price intelligence deal quality score
  useEffect(() => {
    async function fetchIntel() {
      if (!product?.id) return;
      try {
        const intel = await IntelligenceService.getIntelligence(product.id);
        setIntelligence(intel);
      } catch (err) {
        console.error("Failed to load intelligence:", err);
      } finally {
        setLoadingIntel(false);
      }
    }
    fetchIntel();
  }, [product?.id]);

  const nut = product?.nutrition_facts || {};

  return (
    <div 
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(6px)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        animation: "fadeIn 0.2s ease-out",
      }}
      onClick={onClose}
    >
      <div 
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: "20px",
          maxWidth: "840px",
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          animation: "slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
          border: "1px solid var(--border-color)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Close Button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            backgroundColor: "#F1F5F9",
            border: "none",
            color: "var(--text-secondary)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#E2E8F0"; e.currentTarget.style.color = "#0F172A"; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#F1F5F9"; e.currentTarget.style.color = "var(--text-secondary)"; }}
        >
          <IoCloseOutline size={22} />
        </button>

        {/* Modal Header Section */}
        <div style={{
          padding: "30px 30px 20px 30px",
          borderBottom: "1px solid #F1F5F9",
          display: "flex",
          gap: "24px",
          alignItems: "flex-start",
          flexWrap: "wrap",
        }}>
          {/* Product Image Showcase */}
          <div style={{
            width: "140px",
            height: "140px",
            borderRadius: "16px",
            backgroundColor: "#F8FAFC",
            border: "1px solid #E2E8F0",
            padding: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            position: "relative",
          }}>
            <img 
              src={product.image_url || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=200"} 
              alt={product.raw_name}
              style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
              onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1542838132-92c53300491e?w=200"; }}
            />
          </div>

          {/* Product Title & Badges */}
          <div style={{ flex: 1, minWidth: "260px" }}>
            {product.brand && (
              <span style={{
                fontSize: "12px",
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "1px",
                color: "var(--accent-hover)",
                backgroundColor: "rgba(91, 140, 81, 0.1)",
                padding: "3px 10px",
                borderRadius: "6px",
                display: "inline-block",
                marginBottom: "8px",
              }}>
                {product.brand}
              </span>
            )}
            
            <h2 style={{
              fontSize: "22px",
              fontWeight: 800,
              color: "var(--text-primary)",
              margin: "0 0 10px 0",
              lineHeight: 1.3,
            }}>
              {product.raw_name}
            </h2>

            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <span style={{
                fontSize: "13px",
                color: "var(--text-secondary)",
                fontWeight: 600,
                backgroundColor: "#F1F5F9",
                padding: "4px 10px",
                borderRadius: "6px",
              }}>
                Category: {product.category || "Grocery"}
              </span>

              {/* Price Intelligence Deal Quality Badge */}
              {intelligence?.advisor_badge && (
                <span style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#065F46",
                  backgroundColor: "#D1FAE5",
                  padding: "4px 12px",
                  borderRadius: "6px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}>
                  <IoSparklesOutline size={15} /> {intelligence.advisor_badge.label}
                </span>
              )}
            </div>

            {/* Best Store Price Highlight */}
            {lowest_price && (
              <div style={{
                marginTop: "14px",
                fontSize: "14px",
                color: "var(--text-secondary)",
              }}>
                Best price starting at <strong style={{ fontSize: "18px", color: "var(--accent-hover)" }}>${parseFloat(lowest_price).toFixed(2)}</strong> across {prices.length} store offers
              </div>
            )}
          </div>
        </div>

        {/* Modal Body - Description, Ingredients & Nutrition */}
        <div style={{ padding: "30px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px" }}>
          
          {/* Left Column: Product Description & Ingredients */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            
            {/* Description Card */}
            <div>
              <h3 style={{
                fontSize: "16px",
                fontWeight: 700,
                color: "var(--text-primary)",
                marginBottom: "10px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}>
                <IoInformationCircleOutline size={18} color="var(--accent)" /> Product Description
              </h3>
              <p style={{
                fontSize: "14px",
                lineHeight: "1.6",
                color: "var(--text-secondary)",
                backgroundColor: "#F8FAFC",
                padding: "16px",
                borderRadius: "12px",
                border: "1px solid #E2E8F0",
                margin: 0,
              }}>
                {product.description || "High quality Canadian grocery product sourced fresh for maximum flavor and nutritional value."}
              </p>
            </div>

            {/* Ingredients Card */}
            <div>
              <h3 style={{
                fontSize: "16px",
                fontWeight: 700,
                color: "var(--text-primary)",
                marginBottom: "10px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}>
                <IoCheckmarkCircleOutline size={18} color="var(--accent)" /> Ingredients / Ingrédients
              </h3>
              <div style={{
                fontSize: "13px",
                lineHeight: "1.6",
                color: "var(--text-secondary)",
                backgroundColor: "#F8FAFC",
                padding: "16px",
                borderRadius: "12px",
                border: "1px solid #E2E8F0",
              }}>
                {product.ingredients || "Quality grocery ingredients. Refer to product packaging for specific allergen statement."}
              </div>
            </div>

          </div>

          {/* Right Column: Authentic Canadian Nutrition Facts Panel */}
          <div>
            <h3 style={{
              fontSize: "16px",
              fontWeight: 700,
              color: "var(--text-primary)",
              marginBottom: "10px",
            }}>
              Nutrition Facts / Valeur nutritive
            </h3>

            {/* Canadian Standardized Nutrition Facts Panel Box */}
            <div style={{
              backgroundColor: "#FFFFFF",
              border: "2px solid #0F172A",
              borderRadius: "8px",
              padding: "16px",
              fontFamily: "system-ui, -apple-system, sans-serif",
              color: "#0F172A",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
            }}>
              {/* Header */}
              <div style={{ borderBottom: "8px solid #0F172A", pb: "6px", paddingBottom: "6px" }}>
                <div style={{ fontSize: "20px", fontWeight: 900, lineHeight: 1.1 }}>
                  Nutrition Facts
                </div>
                <div style={{ fontSize: "16px", fontWeight: 700 }}>
                  Valeur nutritive
                </div>
                <div style={{ fontSize: "12px", color: "#475569", marginTop: "4px" }}>
                  {nut.serving_size || "Per 1 serving"}
                </div>
              </div>

              {/* Calories Row */}
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                padding: "8px 0",
                borderBottom: "4px solid #0F172A",
                fontWeight: 900,
                fontSize: "16px",
              }}>
                <span>Calories {nut.calories ?? 70}</span>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#475569" }}>% Daily Value* / % VQ*</span>
              </div>

              {/* Fat */}
              <div style={{ borderBottom: "1px solid #CBD5E1", padding: "6px 0", fontSize: "13px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span><strong>Fat / Lipides</strong> {nut.fat || "8 g"}</span>
                  <strong>{nut.fat_dv || "11%"}</strong>
                </div>
                <div style={{ paddingLeft: "16px", fontSize: "12px", color: "#334155", marginTop: "2px" }}>
                  Saturated / saturés {nut.saturated_fat || "5.0 g"}
                  <span style={{ float: "right", fontWeight: 700 }}>{nut.saturated_fat_dv || "27%"}</span>
                </div>
                <div style={{ paddingLeft: "16px", fontSize: "12px", color: "#334155" }}>
                  + Trans / trans {nut.trans_fat || "0.3 g"}
                </div>
              </div>

              {/* Cholesterol */}
              <div style={{ borderBottom: "1px solid #CBD5E1", padding: "6px 0", fontSize: "13px" }}>
                <span><strong>Cholesterol / Cholestérol</strong> {nut.cholesterol || "25 mg"}</span>
              </div>

              {/* Sodium */}
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                borderBottom: "1px solid #CBD5E1",
                padding: "6px 0",
                fontSize: "13px",
              }}>
                <span><strong>Sodium</strong> {nut.sodium || "105 mg"}</span>
                <strong>{nut.sodium_dv || "5%"}</strong>
              </div>

              {/* Carbohydrate */}
              <div style={{ borderBottom: "1px solid #CBD5E1", padding: "6px 0", fontSize: "13px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span><strong>Carbohydrate / Glucides</strong> {nut.carbohydrate || "0 g"}</span>
                  <strong>{nut.carbohydrate_dv || "0%"}</strong>
                </div>
                <div style={{ paddingLeft: "16px", fontSize: "12px", color: "#334155", marginTop: "2px" }}>
                  Fibre / Fibres {nut.fibre || "0 g"}
                </div>
                <div style={{ paddingLeft: "16px", fontSize: "12px", color: "#334155" }}>
                  Sugars / Sucres {nut.sugars || "0 g"}
                </div>
              </div>

              {/* Protein */}
              <div style={{ borderBottom: "4px solid #0F172A", padding: "6px 0", fontSize: "13px" }}>
                <span><strong>Protein / Protéines</strong> {nut.protein || "0.1 g"}</span>
              </div>

              {/* Micronutrients */}
              <div style={{ fontSize: "11px", color: "#334155", paddingTop: "6px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px" }}>
                <div>Calcium: {nut.calcium_dv || "0%"}</div>
                <div>Iron / Fer: {nut.iron_dv || "0%"}</div>
                <div>Potassium: {nut.potassium_dv || "0%"}</div>
              </div>

              <div style={{ fontSize: "10px", color: "#64748B", marginTop: "8px", borderTop: "1px solid #E2E8F0", paddingTop: "4px" }}>
                *5% or less is a little, 15% or more is a lot / *5% ou moins c'est peu, 15% ou plus c'est beaucoup.
              </div>
            </div>

          </div>

        </div>

      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
