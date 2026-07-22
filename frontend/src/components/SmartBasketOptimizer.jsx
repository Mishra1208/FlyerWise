import React, { useState } from "react";
import { 
  IoCartOutline, 
  IoFlashOutline, 
  IoStorefrontOutline, 
  IoTrendingDownOutline, 
  IoAddCircleOutline, 
  IoTrashOutline,
  IoAlertCircleOutline
} from "react-icons/io5";
import { BasketService } from "../services/api";

export default function SmartBasketOptimizer() {
  const [items, setItems] = useState(["milk", "spinach", "butter"]);
  const [inputVal, setInputVal] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleAddItem = (itemToAdd) => {
    const val = (itemToAdd || inputVal).trim().toLowerCase();
    if (val && !items.includes(val)) {
      const updated = [...items, val];
      setItems(updated);
      setInputVal("");
      calculateOptimization(updated);
    }
  };

  const handleRemoveItem = (index) => {
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
    if (updated.length > 0) {
      calculateOptimization(updated);
    } else {
      setResult(null);
    }
  };

  const calculateOptimization = async (listToOptimize = items) => {
    if (listToOptimize.length === 0) return;
    setLoading(true);
    try {
      const data = await BasketService.optimize(listToOptimize);
      setResult(data);
    } catch (err) {
      console.error("Basket optimization failed:", err);
    } finally {
      setLoading(false);
    }
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
          }}>AI-POWERED SAVINGS</span>
          <h2 style={{ fontSize: "24px", color: "var(--primary)", fontWeight: 800, display: "flex", alignItems: "center", gap: "10px", marginTop: "4px" }}>
            <IoCartOutline style={{ color: "var(--accent)" }} />
            <span>Smart Basket Optimizer</span>
          </h2>
        </div>

        <button
          onClick={() => calculateOptimization()}
          disabled={loading || items.length === 0}
          className="btn btn-primary"
          style={{ padding: "10px 20px", fontSize: "14px" }}
        >
          {loading ? "Calculating..." : "Optimize My Shopping List"}
        </button>
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
          {popularChips.map((chip) => (
            <button
              key={chip}
              onClick={() => handleAddItem(chip)}
              disabled={items.includes(chip)}
              style={{
                fontSize: "12px",
                padding: "4px 12px",
                borderRadius: "var(--radius-full)",
                backgroundColor: items.includes(chip) ? "rgba(0,0,0,0.05)" : "var(--bg-card)",
                border: "1px solid var(--border-color)",
                color: items.includes(chip) ? "var(--text-muted)" : "var(--primary)",
                cursor: items.includes(chip) ? "default" : "pointer",
                transition: "all 0.2s ease"
              }}
            >
              + {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Active Items Chips List */}
      {items.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
          {items.map((item, idx) => (
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
                onClick={() => handleRemoveItem(idx)}
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
