import React, { useState, useEffect } from "react";
import { 
  IoCartOutline, 
  IoFlashOutline, 
  IoStorefrontOutline, 
  IoTrendingDownOutline, 
  IoAddCircleOutline, 
  IoTrashOutline,
  IoSparklesOutline,
  IoCheckmarkCircleOutline,
  IoShieldCheckmarkOutline,
  IoStatsChartOutline
} from "react-icons/io5";
import { useBasket } from "../contexts/BasketContext";
import { useLocation } from "../contexts/LocationContext";

const STORE_COLORS = {
  walmart: "#0071CE",
  maxi: "#ED1C24",
  metro: "#003DA5",
  iga: "#C8102E",
  superc: "#E31837",
  provigo: "#000000",
};

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
  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "comparison"

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

  const bestSingleCost = result?.best_single_store?.total_cost || 0;
  const bestTwoCost = result?.best_two_store_combination?.total_cost || bestSingleCost;
  const extraSavings = result?.potential_extra_savings || 0;
  const savingsPct = bestSingleCost > 0 ? ((extraSavings / bestSingleCost) * 100).toFixed(0) : 0;

  // Max store price for relative progress bars
  const allSingleStores = result?.all_single_stores || [];
  const maxStoreCost = allSingleStores.length > 0 
    ? Math.max(...allSingleStores.map((s) => s.total_cost)) 
    : 1;

  return (
    <div style={{
      backgroundColor: "#FFFFFF",
      borderRadius: "24px",
      border: "1px solid rgba(226, 232, 240, 0.8)",
      padding: "36px",
      boxShadow: "0 20px 45px -10px rgba(15, 23, 42, 0.07)",
      display: "flex",
      flexDirection: "column",
      gap: "28px",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Subtle background glow */}
      <div style={{
        position: "absolute",
        top: "-100px",
        right: "-100px",
        width: "300px",
        height: "300px",
        background: "radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, rgba(255, 255, 255, 0) 70%)",
        pointerEvents: "none",
      }} />

      {/* Header Bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{
              backgroundColor: "rgba(16, 185, 129, 0.1)",
              border: "1px solid rgba(16, 185, 129, 0.25)",
              color: "#047857",
              fontSize: "11px",
              fontWeight: 800,
              padding: "4px 10px",
              borderRadius: "20px",
              letterSpacing: "0.5px",
              textTransform: "uppercase",
              display: "inline-flex",
              alignItems: "center",
              gap: "4px"
            }}>
              <IoSparklesOutline size={13} /> AI Price Intelligence • {cityName || "Canada"}
            </span>
          </div>

          <h2 style={{ 
            fontSize: "26px", 
            color: "#0F172A", 
            fontWeight: 800, 
            display: "flex", 
            alignItems: "center", 
            gap: "10px", 
            marginTop: "8px",
            fontFamily: "var(--font-headings)",
            letterSpacing: "-0.5px"
          }}>
            <IoCartOutline style={{ color: "#10B981" }} />
            <span>Smart Basket Optimizer</span>
          </h2>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {basketItems.length > 0 && (
            <button
              onClick={clearBasket}
              style={{
                padding: "10px 16px",
                fontSize: "13px",
                borderRadius: "12px",
                backgroundColor: "#F1F5F9",
                border: "1px solid #E2E8F0",
                color: "#64748B",
                cursor: "pointer",
                fontWeight: 600,
                transition: "all 0.2s ease"
              }}
            >
              Clear Basket
            </button>
          )}

          <button
            onClick={() => optimize(basketItems, postalCode)}
            disabled={loading || basketItems.length === 0}
            style={{
              padding: "12px 24px",
              fontSize: "14px",
              fontWeight: 700,
              borderRadius: "14px",
              background: "linear-gradient(135deg, #059669 0%, #10B981 100%)",
              color: "#FFFFFF",
              border: "none",
              cursor: loading || basketItems.length === 0 ? "default" : "pointer",
              boxShadow: "0 8px 20px rgba(16, 185, 129, 0.25)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.25s ease",
              opacity: loading || basketItems.length === 0 ? 0.6 : 1,
            }}
          >
            <IoFlashOutline size={18} />
            {loading ? "Calculating..." : "Optimize Shopping List"}
          </button>
        </div>
      </div>

      {/* Item Input & Chips Row */}
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        <form 
          onSubmit={(e) => { e.preventDefault(); handleAddItem(); }}
          style={{ display: "flex", gap: "12px" }}
        >
          <input
            type="text"
            placeholder="Add grocery item (e.g., 'milk', 'spinach', 'butter')..."
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            style={{
              flex: 1,
              padding: "14px 18px",
              borderRadius: "14px",
              border: "1px solid #E2E8F0",
              backgroundColor: "#F8FAFC",
              fontSize: "14px",
              color: "#0F172A",
              outline: "none",
              transition: "all 0.2s ease",
              boxShadow: "inset 0 2px 4px rgba(0,0,0,0.02)",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#10B981";
              e.target.style.backgroundColor = "#FFFFFF";
              e.target.style.boxShadow = "0 0 0 3px rgba(16, 185, 129, 0.15)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#E2E8F0";
              e.target.style.backgroundColor = "#F8FAFC";
              e.target.style.boxShadow = "none";
            }}
          />
          <button 
            type="submit" 
            style={{
              padding: "0 22px",
              borderRadius: "14px",
              backgroundColor: "#0F172A",
              color: "#FFFFFF",
              fontWeight: 700,
              fontSize: "14px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              transition: "all 0.2s ease",
            }}
          >
            <IoAddCircleOutline size={20} /> Add
          </button>
        </form>

        {/* Quick Suggestion Chips */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
          <span style={{ fontSize: "12px", color: "#64748B", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>Quick Add:</span>
          {popularChips.map((chip) => {
            const isAdded = basketItems.some((i) => i.toLowerCase() === chip.toLowerCase());
            return (
              <button
                key={chip}
                onClick={() => handleAddItem(chip)}
                disabled={isAdded}
                style={{
                  fontSize: "12px",
                  padding: "5px 14px",
                  borderRadius: "20px",
                  backgroundColor: isAdded ? "#F1F5F9" : "#FFFFFF",
                  border: isAdded ? "1px solid #CBD5E1" : "1px solid #E2E8F0",
                  color: isAdded ? "#94A3B8" : "#334155",
                  fontWeight: 600,
                  cursor: isAdded ? "default" : "pointer",
                  transition: "all 0.2s ease",
                  boxShadow: isAdded ? "none" : "0 2px 5px rgba(0,0,0,0.03)",
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
                backgroundColor: "rgba(16, 185, 129, 0.08)",
                border: "1px solid rgba(16, 185, 129, 0.25)",
                padding: "7px 16px",
                borderRadius: "24px",
                fontSize: "13px",
                color: "#065F46",
                fontWeight: 700,
                boxShadow: "0 2px 6px rgba(16, 185, 129, 0.06)",
              }}
            >
              <span style={{ textTransform: "capitalize" }}>
                {item.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.substring(1).toLowerCase())}
              </span>
              <IoTrashOutline
                size={16}
                onClick={() => handleRemoveItem(item)}
                style={{ cursor: "pointer", color: "#EF4444", transition: "transform 0.2s" }}
                onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.2)"}
                onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
              />
            </div>
          ))}
        </div>
      )}

      {/* Results Dashboard & Metrics Widgets */}
      {result && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px", marginTop: "8px" }}>
          {/* Key Metrics Widgets */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "16px",
          }}>
            {/* Widget 1: Single Store Total */}
            <div className="metric-widget">
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.5px" }}>BEST 1-STORE TOTAL</span>
              <div style={{ fontSize: "24px", fontWeight: 800, color: "#0F172A" }}>
                ${bestSingleCost.toFixed(2)}
              </div>
              <span style={{ fontSize: "12px", color: "#64748B" }}>
                {result.best_single_store?.store_name || "N/A"}
              </span>
            </div>

            {/* Widget 2: 2-Store Split Total */}
            <div className="metric-widget" style={{ borderColor: "rgba(16, 185, 129, 0.4)", backgroundColor: "rgba(16, 185, 129, 0.03)" }}>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "#059669", textTransform: "uppercase", letterSpacing: "0.5px" }}>OPTIMAL 2-STORE TOTAL</span>
              <div style={{ fontSize: "24px", fontWeight: 800, color: "#059669" }}>
                ${bestTwoCost.toFixed(2)}
              </div>
              <span style={{ fontSize: "12px", color: "#047857", fontWeight: 600 }}>
                2-Store Combination
              </span>
            </div>

            {/* Widget 3: Total Dollar & % Savings */}
            <div className="metric-widget" style={{ borderColor: extraSavings > 0 ? "rgba(16, 185, 129, 0.4)" : "#E2E8F0" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.5px" }}>MAX EXTRA SAVINGS</span>
              <div style={{ fontSize: "24px", fontWeight: 800, color: extraSavings > 0 ? "#10B981" : "#64748B", display: "flex", alignItems: "center", gap: "6px" }}>
                ${extraSavings.toFixed(2)}
                {savingsPct > 0 && (
                  <span style={{ fontSize: "12px", fontWeight: 800, backgroundColor: "#D1FAE5", color: "#047857", padding: "2px 8px", borderRadius: "10px" }}>
                    -{savingsPct}%
                  </span>
                )}
              </div>
              <span style={{ fontSize: "12px", color: "#64748B" }}>
                {extraSavings > 1.0 ? "Trip split recommended" : "1-stop trip is best value"}
              </span>
            </div>
          </div>

          {/* Sticky Advice Banner */}
          {result.advice_banner && (
            <div style={{
              background: extraSavings > 1.0 
                ? "linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.15) 100%)" 
                : "linear-gradient(135deg, rgba(15, 23, 42, 0.05) 0%, rgba(51, 65, 85, 0.08) 100%)",
              border: `1px solid ${extraSavings > 1.0 ? "rgba(16, 185, 129, 0.3)" : "rgba(15, 23, 42, 0.15)"}`,
              padding: "18px 24px",
              borderRadius: "16px",
              display: "flex",
              alignItems: "center",
              gap: "14px",
              boxShadow: "0 4px 15px rgba(0,0,0,0.02)"
            }}>
              <IoFlashOutline size={26} style={{ color: extraSavings > 1.0 ? "#10B981" : "#0F172A", flexShrink: 0 }} />
              <div>
                <h4 style={{ fontSize: "15px", fontWeight: 800, color: "#0F172A", fontFamily: "var(--font-headings)" }}>Smart Recommendation</h4>
                <p style={{ fontSize: "14px", color: "#475569", marginTop: "2px" }}>{result.advice_banner}</p>
              </div>
            </div>
          )}

          {/* View Toggle Tabs */}
          <div style={{ display: "flex", gap: "12px", borderBottom: "1px solid #E2E8F0", paddingBottom: "12px" }}>
            <button
              onClick={() => setActiveTab("overview")}
              style={{
                fontSize: "14px",
                fontWeight: 700,
                color: activeTab === "overview" ? "#059669" : "#64748B",
                borderBottom: activeTab === "overview" ? "2px solid #059669" : "2px solid transparent",
                paddingBottom: "8px",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              Option Breakdown
            </button>
            <button
              onClick={() => setActiveTab("comparison")}
              style={{
                fontSize: "14px",
                fontWeight: 700,
                color: activeTab === "comparison" ? "#059669" : "#64748B",
                borderBottom: activeTab === "comparison" ? "2px solid #059669" : "2px solid transparent",
                paddingBottom: "8px",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              Store Price Comparison Bar Chart
            </button>
          </div>

          {/* TAB 1: Option Breakdown */}
          {activeTab === "overview" && (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "24px"
            }}>
              {/* Card 1: Best Single Store */}
              {result.best_single_store && (
                <div style={{
                  border: "1px solid #E2E8F0",
                  borderRadius: "20px",
                  padding: "26px",
                  backgroundColor: "#FFFFFF",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  boxShadow: "0 8px 24px rgba(15, 23, 42, 0.04)"
                }}>
                  <div>
                    <span style={{ fontSize: "11px", fontWeight: 800, textTransform: "uppercase", color: "#64748B", letterSpacing: "1px" }}>BEST ONE-STORE OPTION</span>
                    <h3 style={{ fontSize: "22px", fontWeight: 800, color: "#0F172A", marginTop: "4px" }}>
                      {result.best_single_store.store_name}
                    </h3>
                    <div style={{ fontSize: "32px", fontWeight: 800, color: "#0F172A", margin: "10px 0" }}>
                      ${result.best_single_store.total_cost.toFixed(2)}
                    </div>

                    <div style={{ fontSize: "13px", color: "#64748B", marginBottom: "16px" }}>
                      Matched <strong>{result.best_single_store.matched_count}</strong> of {result.best_single_store.total_items} items in your list
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {result.best_single_store.items.map((it, i) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#334155" }}>
                          <span>• {it.matched_name}</span>
                          <strong>${it.price.toFixed(2)}</strong>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ borderTop: "1px solid #F1F5F9", paddingTop: "14px", marginTop: "20px", fontSize: "12px", color: "#94A3B8", fontWeight: 600 }}>
                    Fastest 1-stop trip option
                  </div>
                </div>
              )}

              {/* Card 2: Best 2-Store Split Combination */}
              {result.best_two_store_combination && (
                <div style={{
                  border: "1.5px solid rgba(16, 185, 129, 0.4)",
                  borderRadius: "20px",
                  padding: "26px",
                  backgroundColor: "rgba(16, 185, 129, 0.02)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  boxShadow: "0 12px 30px rgba(16, 185, 129, 0.08)",
                  position: "relative",
                  overflow: "hidden"
                }}>
                  <div>
                    <span style={{ fontSize: "11px", fontWeight: 800, textTransform: "uppercase", color: "#059669", letterSpacing: "1px" }}>MAXIMUM SAVINGS (2 STORES)</span>
                    <h3 style={{ fontSize: "22px", fontWeight: 800, color: "#0F172A", marginTop: "4px" }}>
                      {result.best_two_store_combination.store_1.name} + {result.best_two_store_combination.store_2.name}
                    </h3>
                    <div style={{ fontSize: "32px", fontWeight: 800, color: "#059669", margin: "10px 0" }}>
                      ${result.best_two_store_combination.total_cost.toFixed(2)}
                    </div>

                    {extraSavings > 0 && (
                      <div style={{
                        fontSize: "13px",
                        fontWeight: 700,
                        color: "#047857",
                        backgroundColor: "#D1FAE5",
                        padding: "6px 14px",
                        borderRadius: "20px",
                        width: "fit-content",
                        marginBottom: "18px"
                      }}>
                        Save extra ${extraSavings.toFixed(2)} vs single store!
                      </div>
                    )}

                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      <div>
                        <strong style={{ fontSize: "13px", color: "#0F172A", display: "block", marginBottom: "6px" }}>
                          🛒 Buy at {result.best_two_store_combination.store_1.name}:
                        </strong>
                        {result.best_two_store_combination.store_1.items.map((it, i) => (
                          <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#475569", marginLeft: "12px" }}>
                            <span>• {it.item}</span>
                            <strong>${it.price.toFixed(2)}</strong>
                          </div>
                        ))}
                      </div>

                      <div>
                        <strong style={{ fontSize: "13px", color: "#0F172A", display: "block", marginBottom: "6px" }}>
                          🛒 Buy at {result.best_two_store_combination.store_2.name}:
                        </strong>
                        {result.best_two_store_combination.store_2.items.map((it, i) => (
                          <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#475569", marginLeft: "12px" }}>
                            <span>• {it.item}</span>
                            <strong>${it.price.toFixed(2)}</strong>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div style={{ borderTop: "1px solid rgba(16, 185, 129, 0.2)", paddingTop: "14px", marginTop: "20px", fontSize: "12px", color: "#047857", fontWeight: 600 }}>
                    Splits your list for maximum total savings
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Store Price Comparison Bar Chart */}
          {activeTab === "comparison" && (
            <div style={{
              backgroundColor: "#F8FAFC",
              border: "1px solid #E2E8F0",
              borderRadius: "20px",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "16px"
            }}>
              <h4 style={{ fontSize: "16px", fontWeight: 800, color: "#0F172A" }}>
                Total Basket Cost by Retailer
              </h4>

              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {allSingleStores.map((store) => {
                  const pct = maxStoreCost > 0 ? (store.total_cost / maxStoreCost) * 100 : 0;
                  const isCheapest = store.store_id === result.best_single_store?.store_id;

                  return (
                    <div key={store.store_id} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", fontWeight: 700, color: "#0F172A" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          {store.store_name}
                          {isCheapest && (
                            <span style={{ fontSize: "10px", backgroundColor: "#D1FAE5", color: "#047857", padding: "1px 6px", borderRadius: "4px" }}>
                              Cheapest 1-Store
                            </span>
                          )}
                        </span>
                        <span>${store.total_cost.toFixed(2)} ({store.matched_count}/{store.total_items} items)</span>
                      </div>

                      <div style={{ width: "100%", height: "12px", backgroundColor: "#E2E8F0", borderRadius: "9999px", overflow: "hidden" }}>
                        <div
                          style={{
                            width: `${pct}%`,
                            height: "100%",
                            backgroundColor: isCheapest ? "#10B981" : "#64748B",
                            borderRadius: "9999px",
                            transition: "width 0.8s ease"
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
