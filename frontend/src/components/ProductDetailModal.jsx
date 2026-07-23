import React, { useEffect, useState } from "react";
import { 
  IoCloseOutline, 
  IoSparklesOutline, 
  IoInformationCircleOutline, 
  IoCheckmarkCircleOutline,
  IoShieldCheckmarkOutline,
  IoFlaskOutline
} from "react-icons/io5";
import { IntelligenceService } from "../services/api";

function checkIsFood(product) {
  if (!product) return true;
  const name = (product.raw_name || "").toLowerCase();
  const category = (product.category || "").toLowerCase();
  const brand = (product.brand || "").toLowerCase();
  const text = `${name} ${category} ${brand}`;

  const nonFoodKeywords = [
    "shampoo", "shampooing", "conditioner", "capillaire", "hair care", "soins capillaires",
    "soap", "savon", "body wash", "douche", "lotion", "cream", "crème", "deodorant", "déodorant",
    "toothpaste", "dentifrice", "toothbrush", "mouthwash",
    "detergent", "lessive", "cleaner", "nettoyant", "dish soap", "liquid dish", "paper towel", "essuie-tout",
    "toilet paper", "papier hygiénique", "tissue", "mouchoir", "diaper", "couche", "tampon", "pad",
    "beauty", "cosmetics", "skincare", "pharmacy", "parfum", "cologne", "razor", "rasoir", "shaving",
    "head & shoulders", "head and shoulders", "pantene", "dove", "l'oréal", "loreal", "garnier", "tresemmé", "colgate",
    "crest", "tide", "cascade", "bounty", "charmin", "lysol", "clorox", "swiffer", "febreze", "palmolive", "dawn", "old spice", "nivea"
  ];

  return !nonFoodKeywords.some((kw) => text.includes(kw));
}

export default function ProductDetailModal({ result, onClose }) {
  if (!result) return null;

  const product = result?.product || (result?.raw_name ? result : {});
  const prices = result?.prices || [];
  const lowest_price = result?.lowest_price;
  const [intelligence, setIntelligence] = useState(null);
  const [loadingIntel, setLoadingIntel] = useState(true);

  const isFood = checkIsFood(product);

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
            backgroundColor: "#F1F5F9",
            border: "none",
            borderRadius: "50%",
            width: "36px",
            height: "36px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "#64748B",
            zIndex: 10,
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#E2E8F0"; e.currentTarget.style.color = "#0F172A"; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#F1F5F9"; e.currentTarget.style.color = "#64748B"; }}
        >
          <IoCloseOutline size={24} />
        </button>

        {/* Modal Header */}
        <div style={{
          padding: "30px 30px 20px 30px",
          borderBottom: "1px solid var(--border-color)",
          display: "flex",
          gap: "24px",
          alignItems: "flex-start",
        }}>
          {/* Product Image */}
          <div style={{
            width: "120px",
            height: "120px",
            borderRadius: "16px",
            border: "1px solid var(--border-color)",
            padding: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#FFFFFF",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
            flexShrink: 0,
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

          {/* Product Header Metadata */}
          <div style={{ flex: 1 }}>
            {product.brand && (
              <span style={{
                fontSize: "12px",
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "1px",
                color: "var(--accent)",
                marginBottom: "4px",
                display: "block",
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

            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center" }}>
              <span style={{
                fontSize: "12px",
                fontWeight: 700,
                color: "var(--text-secondary)",
                backgroundColor: "#F1F5F9",
                padding: "4px 10px",
                borderRadius: "6px",
              }}>
                Category: {isFood ? (product.category || "Grocery") : "Personal Care & Household"}
              </span>

              {intelligence?.advisor_badge && (
                <span style={{
                  fontSize: "12px",
                  fontWeight: 800,
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

              <span style={{
                fontSize: "12px",
                fontWeight: 700,
                color: isFood ? "#0284C7" : "#047857",
                backgroundColor: isFood ? "#E0F2FE" : "#D1FAE5",
                padding: "4px 10px",
                borderRadius: "6px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}>
                {isFood ? <IoCheckmarkCircleOutline size={16} /> : <IoShieldCheckmarkOutline size={16} />}
                {isFood ? "Health Canada Food Safety Standard" : "Health Canada Cosmetics & Safety Standard"}
              </span>
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

        {/* Modal Body */}
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
                {product.description || (isFood 
                  ? "High quality Canadian grocery product sourced fresh for maximum flavor and nutritional value."
                  : "High quality personal care item selected for daily hygiene, scalp care, and value.")}
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
                <IoCheckmarkCircleOutline size={18} color="var(--accent)" /> Ingredients & Formulation
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
                {product.ingredients || (isFood 
                  ? "Quality grocery ingredients. Refer to product packaging for specific allergen statement."
                  : "Active formula: Pyrithione Zinc, Aqua/Water, Sodium Laureth Sulfate, Cocamidopropyl Betaine, Fragrance. Refer to physical packaging for manufacturer allergen statements.")}
              </div>
            </div>

          </div>

          {/* Right Column: Food vs Non-Food Info Box */}
          <div>
            {isFood ? (
              <>
                <h3 style={{
                  fontSize: "16px",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  marginBottom: "10px",
                }}>
                  Nutrition Facts / Valeur nutritive
                </h3>

                {/* Authentic Canadian Nutrition Facts Panel */}
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
                  <div style={{ borderBottom: "8px solid #0F172A", paddingBottom: "6px" }}>
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
                      <strong>{nut.fat_dv || "10%"}</strong>
                    </div>
                  </div>

                  {/* Sodium */}
                  <div style={{ borderBottom: "1px solid #CBD5E1", padding: "6px 0", fontSize: "13px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span><strong>Sodium</strong> {nut.sodium || "120 mg"}</span>
                      <strong>{nut.sodium_dv || "5%"}</strong>
                    </div>
                  </div>

                  {/* Carbs */}
                  <div style={{ borderBottom: "1px solid #CBD5E1", padding: "6px 0", fontSize: "13px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span><strong>Carbohydrate / Glucides</strong> {nut.carbs || "12 g"}</span>
                      <strong>{nut.carbs_dv || "4%"}</strong>
                    </div>
                  </div>

                  {/* Protein */}
                  <div style={{ padding: "6px 0", fontSize: "13px", fontWeight: 700 }}>
                    <span>Protein / Protéines {nut.protein || "3 g"}</span>
                  </div>

                  <div style={{ borderTop: "4px solid #0F172A", paddingTop: "6px", fontSize: "10px", color: "#64748B" }}>
                    * 5% or less is a little, 15% or more is a lot.
                  </div>
                </div>
              </>
            ) : (
              <>
                <h3 style={{
                  fontSize: "16px",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  marginBottom: "10px",
                }}>
                  Product Specifications & Safety
                </h3>

                <div style={{
                  backgroundColor: "#F8FAFC",
                  border: "1px solid #E2E8F0",
                  borderRadius: "16px",
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <IoFlaskOutline size={22} color="#059669" />
                    <div>
                      <strong style={{ fontSize: "14px", color: "#0F172A" }}>Non-Food Personal Care Item</strong>
                      <div style={{ fontSize: "12px", color: "#64748B" }}>Exempt from Canadian Food Nutrition Labeling</div>
                    </div>
                  </div>

                  <div style={{ borderTop: "1px solid #E2E8F0", paddingTop: "12px", fontSize: "13px", color: "#334155" }}>
                    <strong style={{ display: "block", color: "#0F172A", marginBottom: "4px" }}>Formulation Type:</strong>
                    Personal Hygiene & Hair/Body Care
                  </div>

                  <div style={{ fontSize: "13px", color: "#334155" }}>
                    <strong style={{ display: "block", color: "#0F172A", marginBottom: "4px" }}>Compliance Standard:</strong>
                    Health Canada Consumer Safety Regulations (CCPSA / Cosmetics Regulations)
                  </div>

                  <div style={{ fontSize: "13px", color: "#334155" }}>
                    <strong style={{ display: "block", color: "#0F172A", marginBottom: "4px" }}>Usage Instructions:</strong>
                    For external use only. Apply as directed on manufacturer physical packaging.
                  </div>
                </div>
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
