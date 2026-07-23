import React, { useState } from "react";
import { IoCartOutline } from "react-icons/io5";
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
          bottom: "28px",
          right: "28px",
          zIndex: 900,
          display: "flex",
          alignItems: "center",
          gap: "10px",
          backgroundColor: "#1B365D",
          color: "#FFFFFF",
          padding: "12px 20px",
          borderRadius: "40px",
          boxShadow: "0 10px 25px rgba(27, 54, 93, 0.35)",
          border: "2px solid rgba(255, 255, 255, 0.2)",
          cursor: "pointer",
          transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
          animation: "floatUp 0.3s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.05) translateY(-2px)";
          e.currentTarget.style.boxShadow = "0 14px 30px rgba(27, 54, 93, 0.45)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1) translateY(0)";
          e.currentTarget.style.boxShadow = "0 10px 25px rgba(27, 54, 93, 0.35)";
        }}
      >
        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
          <IoCartOutline size={22} color="#5B8C51" />
          <span style={{
            position: "absolute",
            top: "-8px",
            right: "-10px",
            backgroundColor: "#E53E3E",
            color: "#FFFFFF",
            fontSize: "11px",
            fontWeight: 800,
            borderRadius: "10px",
            padding: "1px 6px",
            lineHeight: "1.2",
          }}>
            {basketItems.length}
          </span>
        </div>

        <span style={{ fontSize: "14px", fontWeight: 700, fontFamily: "var(--font-headings)" }}>
          My Basket ({basketItems.length})
        </span>

        {extraSavings > 0 && (
          <span style={{
            fontSize: "11px",
            fontWeight: 700,
            backgroundColor: "rgba(91, 140, 81, 0.25)",
            color: "#6EE7B7",
            padding: "3px 8px",
            borderRadius: "12px",
            marginLeft: "4px",
          }}>
            Save ${extraSavings.toFixed(2)}
          </span>
        )}
      </button>

      <BasketModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />

      <style>{`
        @keyframes floatUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
