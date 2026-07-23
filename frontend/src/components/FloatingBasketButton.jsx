import React, { useState } from "react";
import { IoCartOutline, IoSparklesOutline } from "react-icons/io5";
import { useBasket } from "../contexts/BasketContext";
import BasketModal from "./BasketModal";

export default function FloatingBasketButton() {
  const { basketItems, optimizationResult } = useBasket();
  const [modalOpen, setModalOpen] = useState(false);

  if (basketItems.length === 0) return null;

  const extraSavings = optimizationResult?.potential_extra_savings || 0;

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        style={{
          position: "fixed",
          bottom: "32px",
          right: "32px",
          zIndex: 900,
          display: "flex",
          alignItems: "center",
          gap: "12px",
          background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
          color: "#FFFFFF",
          padding: "12px 22px",
          borderRadius: "40px",
          boxShadow: "0 20px 40px -10px rgba(15, 23, 42, 0.45), 0 0 20px rgba(16, 185, 129, 0.2)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          cursor: "pointer",
          transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          animation: "floatUp 0.35s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.06) translateY(-3px)";
          e.currentTarget.style.boxShadow = "0 25px 45px -8px rgba(15, 23, 42, 0.55), 0 0 25px rgba(16, 185, 129, 0.35)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1) translateY(0)";
          e.currentTarget.style.boxShadow = "0 20px 40px -10px rgba(15, 23, 42, 0.45), 0 0 20px rgba(16, 185, 129, 0.2)";
        }}
      >
        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
          <IoCartOutline size={24} color="#10B981" />
          <span style={{
            position: "absolute",
            top: "-8px",
            right: "-10px",
            background: "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)",
            color: "#FFFFFF",
            fontSize: "11px",
            fontWeight: 800,
            borderRadius: "10px",
            padding: "2px 7px",
            boxShadow: "0 2px 6px rgba(220, 38, 38, 0.4)",
            lineHeight: "1.2",
          }}>
            {basketItems.length}
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", textAlign: "left" }}>
          <span style={{ fontSize: "14px", fontWeight: 800, fontFamily: "var(--font-headings)", letterSpacing: "-0.2px" }}>
            My Saved Basket
          </span>
          <span style={{ fontSize: "11px", color: "#94A3B8", fontWeight: 600 }}>
            {basketItems.length} {basketItems.length === 1 ? "item" : "items"} selected
          </span>
        </div>

        {extraSavings > 0 && (
          <span style={{
            fontSize: "12px",
            fontWeight: 800,
            background: "linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.3) 100%)",
            border: "1px solid rgba(16, 185, 129, 0.4)",
            color: "#6EE7B7",
            padding: "4px 10px",
            borderRadius: "20px",
            marginLeft: "4px",
            display: "flex",
            alignItems: "center",
            gap: "3px"
          }}>
            <IoSparklesOutline size={12} /> Save ${extraSavings.toFixed(2)}
          </span>
        )}
      </button>

      <BasketModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />

      <style>{`
        @keyframes floatUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
