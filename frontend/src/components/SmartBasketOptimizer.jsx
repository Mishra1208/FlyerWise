import React, { useState, useEffect } from "react";
import { 
  IoCartOutline, 
  IoFlashOutline, 
  IoStorefrontOutline, 
  IoTrendingDownOutline, 
  IoAddCircleOutline, 
  IoTrashOutline,
  IoAlertCircleOutline
} from "react-icons/io5";
import { useBasket } from "../contexts/BasketContext";
import { useLocation } from "../contexts/LocationContext";

export default function SmartBasketOptimizer() {
  const { 
    basketItems, 
    addItem, 
    removeItem, 
    clearBasket, 
    optimizationResult: result, 
    isOptimizing: loading, 
    optimize 
  } = useBasket();
  
  const { postalCode, cityName } = useLocation();
  const [inputVal, setInputVal] = useState("");

  useEffect(() => {
    if (basketItems.length > 0 && !result) {
      optimize(basketItems, postalCode);
    }
  }, [basketItems, postalCode]);

  const handleAddItem = (itemToAdd) => {
    const val = (itemToAdd || inputVal).trim();
    if (val) {
      addItem(val);
      setInputVal("");
    }
  };

  const handleRemoveItem = (item) => {
    removeItem(item);
  };

  const popularChips = ["milk", "spinach", "eggs", "butter", "bread", "chicken", "cheese", "yogurt"];

  return (
    <div style={{
      backgroundColor: "#FFFFFF",
      borderRadius: "var(--radius-lg)",
      border: "1px solid var(--border-color)",
      padding: "32px",
      boxShadow: "var(--shadow-md)",
      display: "flex",
      flexDirection: "column",
      gap: "24px"
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <span style={{
            color: "var(--accent)",
            fontSize: "12px",
            fontWeight: 800,
            letterSpacing: "1px",
            textTransform: "uppercase"
          }}>AI-POWERED SAVINGS ({cityName || "Canada"})</span>
          <h2 style={{ fontSize: "24px", color: "var(--primary)", fontWeight: 800, display: "flex", alignItems: "center", gap: "10px", marginTop: "4px" }}>
            <IoCartOutline style={{ color: "var(--accent)" }} />
            <span>Smart Basket Optimizer</span>
          </h2>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          {basketItems.length > 0 && (
            <button
              onClick={clearBasket}
              style={{
                padding: "8px 14px",
                fontSize: "13px",
                borderRadius: "var(--radius-sm)",
                backgroundColor: "#F1F5F9",
                border: "1px solid #CBD5E1",
                color: "#64748B",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Clear Basket
            </button>
          )}

          <button
            onClick={() => optimize(basketItems, postalCode)}
            disabled={loading || basketItems.length === 0}
            className="btn btn-primary"
            style={{ padding: "10px 20px", fontSize: "14px" }}
          >
            {loading ? "Calculating..." : "Optimize My Shopping List"}
          </button>
        </div>
      </div>

      {/* Input section */}
      <div>
        <form 
          onSubmit={(e) => { e.preventDefault(); handleAddItem(); }}
          style={{ display: "flex", gap: "12px" }}
        >
          <input
            type="text"
            placeholder="Add grocery item (e.g., 'milk', 'spinach', 'eggs')..."
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            className="search-input"
            style={{ flex: 1, padding: "12px 16px" }}
          />
          <button type="submit" className="btn btn-accent" style={{ padding: "0 20px" }}>
            <IoAddCircleOutline size={20} /> Add
          </button>
        </form>

        {/* Quick Suggestion Chips */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "12px", alignItems: "center" }}>
          <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>Quick Add:</span>
          {popularChips.map((chip) => {
            const isAdded = basketItems.some((i) => i.toLowerCase() === chip.toLowerCase());
            return (
              <button
                key={chip}
                onClick={() => handleAddItem(chip)}
                disabled={isAdded}
                style={{
                  fontSize: "12px",
                  padding: "4px 12px",
                  borderRadius: "var(--radius-full)",
                  backgroundColor: isAdded ? "rgba(0,0,0,0.05)" : "var(--bg-card)",
                  border: "1px solid var(--border-color)",
                  color: isAdded ? "var(--text-muted)" : "var(--primary)",
                  cursor: isAdded ? "default" : "pointer",
                  transition: "all 0.2s ease"
                }}
              >
                {isAdded ? "✓ " : "+ "}{chip}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Items Chips List */}
      {basketItems.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
          {basketItems.map((item, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                backgroundColor: "rgba(27, 54, 93, 0.06)",
                padding: "6px 14px",
                borderRadius: "var(--radius-full)",
                fontSize: "14px",
                color: "var(--primary)",
                fontWeight: 600
              }}
            >
              <span>{item}</span>
              <IoTrashOutline
                size={16}
                onClick={() => handleRemoveItem(item)}
                style={{ cursor: "pointer", color: "var(--accent-red)" }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Sticky Advice Banner */}
      {result && result.advice_banner && (
        <div style={{
          backgroundColor: result.potential_extra_savings > 1.0 ? "rgba(91, 140, 81, 0.12)" : "rgba(27, 54, 93, 0.08)",
          border: `1px solid ${result.potential_extra_savings > 1.0 ? "rgba(91, 140, 81, 0.3)" : "rgba(27, 54, 93, 0.2)"}`,
          padding: "16px 20px",
          borderRadius: "var(--radius-md)",
          display: "flex",
          alignItems: "center",
          gap: "12px"
        }}>
          <IoFlashOutline size={24} style={{ color: result.potential_extra_savings > 1.0 ? "var(--accent)" : "var(--primary)", flexShrink: 0 }} />
          <div>
            <h4 style={{ fontSize: "15px", fontWeight: 700, color: "var(--primary)" }}>Smart Recommendation</h4>
            <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "2px" }}>{result.advice_banner}</p>
          </div>
        </div>
      )}

      {/* Results Breakdown Cards */}
      {result && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "24px",
          marginTop: "8px"
        }}>
          {/* Card 1: Best Single Store */}
          {result.best_single_store && (
            <div style={{
              border: "1px solid var(--border-color)",
              borderRadius: "var(--radius-md)",
              padding: "24px",
              backgroundColor: "var(--bg-card)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between"
            }}>
              <div>
                <span style={{ fontSize: "11px", fontWeight: 800, textTransform: "uppercase", color: "var(--accent)", letterSpacing: "1px" }}>BEST ONE-STORE OPTION</span>
                <h3 style={{ fontSize: "20px", fontWeight: 800, color: "var(--primary)", marginTop: "4px" }}>
                  {result.best_single_store.store_name}
                </h3>
                <div style={{ fontSize: "28px", fontWeight: 800, color: "var(--accent)", margin: "12px 0" }}>
                  ${result.best_single_store.total_cost.toFixed(2)}
                </div>

                <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "12px" }}>
                  Matched <strong>{result.best_single_store.matched_count}</strong> of {result.best_single_store.total_items} items in your list
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {result.best_single_store.items.map((it, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "var(--text-primary)" }}>
                      <span>• {it.matched_name}</span>
                      <strong>${it.price.toFixed(2)}</strong>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "12px", marginTop: "16px", fontSize: "12px", color: "var(--text-muted)" }}>
                Fastest 1-stop trip option
              </div>
            </div>
          )}

          {/* Card 2: Best 2-Store Split Combination */}
          {result.best_two_store_combination && (
            <div style={{
              border: "1px solid rgba(91, 140, 81, 0.4)",
              borderRadius: "var(--radius-md)",
              padding: "24px",
              backgroundColor: "rgba(91, 140, 81, 0.03)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between"
            }}>
              <div>
                <span style={{ fontSize: "11px", fontWeight: 800, textTransform: "uppercase", color: "var(--accent-hover)", letterSpacing: "1px" }}>MAXIMUM SAVINGS (2 STORES)</span>
                <h3 style={{ fontSize: "20px", fontWeight: 800, color: "var(--primary)", marginTop: "4px" }}>
                  {result.best_two_store_combination.store_1.name} + {result.best_two_store_combination.store_2.name}
                </h3>
                <div style={{ fontSize: "28px", fontWeight: 800, color: "var(--accent-hover)", margin: "12px 0" }}>
                  ${result.best_two_store_combination.total_cost.toFixed(2)}
                </div>

                {result.potential_extra_savings > 0 && (
                  <div style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "var(--accent)",
                    backgroundColor: "rgba(91, 140, 81, 0.15)",
                    padding: "6px 12px",
                    borderRadius: "4px",
                    width: "fit-content",
                    marginBottom: "16px"
                  }}>
                    Save extra ${result.potential_extra_savings.toFixed(2)} vs single store!
                  </div>
                )}

                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div>
                    <strong style={{ fontSize: "13px", color: "var(--primary)" }}>Buy at {result.best_two_store_combination.store_1.name}:</strong>
                    {result.best_two_store_combination.store_1.items.map((it, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--text-secondary)" }}>
                        <span>• {it.item}</span>
                        <span>${it.price.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div>
                    <strong style={{ fontSize: "13px", color: "var(--primary)" }}>Buy at {result.best_two_store_combination.store_2.name}:</strong>
                    {result.best_two_store_combination.store_2.items.map((it, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--text-secondary)" }}>
                        <span>• {it.item}</span>
                        <span>${it.price.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "12px", marginTop: "16px", fontSize: "12px", color: "var(--text-muted)" }}>
                Splits your list for maximum total savings
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
