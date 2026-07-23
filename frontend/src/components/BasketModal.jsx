import React from "react";
import { createPortal } from "react-dom";
import { IoCloseOutline, IoCartOutline } from "react-icons/io5";
import SmartBasketOptimizer from "./SmartBasketOptimizer";
import { useBasket } from "../contexts/BasketContext";

export default function BasketModal({ isOpen, onClose }) {
  const { basketItems } = useBasket();

  if (!isOpen) return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(15, 23, 42, 0.6)",
          backdropFilter: "blur(4px)",
          zIndex: 9998,
          animation: "fadeIn 0.2s ease",
        }}
      />

      {/* Modal Card */}
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "min(720px, 94vw)",
          maxHeight: "88vh",
          overflowY: "auto",
          backgroundColor: "#FFFFFF",
          borderRadius: "24px",
          boxShadow: "0 25px 50px rgba(0, 0, 0, 0.25)",
          zIndex: 9999,
          animation: "slideUp 0.3s ease",
          padding: "24px",
        }}
      >
        {/* Header with Close button */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <IoCartOutline size={24} color="var(--accent)" />
            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "var(--primary)", margin: 0, fontFamily: "var(--font-headings)" }}>
              Your Saved Basket ({basketItems.length} items)
            </h2>
          </div>

          <button
            onClick={onClose}
            style={{
              padding: "6px",
              borderRadius: "10px",
              border: "none",
              backgroundColor: "#F1F5F9",
              cursor: "pointer",
              display: "flex",
            }}
          >
            <IoCloseOutline size={22} color="#64748B" />
          </button>
        </div>

        {/* Smart Basket Optimizer Component */}
        <SmartBasketOptimizer />
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translate(-50%, -45%); }
          to { opacity: 1; transform: translate(-50%, -50%); }
        }
      `}</style>
    </>,
    document.body
  );
}
