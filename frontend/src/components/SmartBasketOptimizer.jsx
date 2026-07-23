import React, { useState, useEffect } from "react";
import { 
  IoCartOutline, 
  IoFlashOutline, 
  IoAddCircleOutline, 
  IoTrashOutline,
  IoSparklesOutline,
  IoReceiptOutline,
  IoInformationCircleOutline,
  IoAddOutline,
  IoRemoveOutline,
  IoCalculatorOutline,
  IoStorefrontOutline
} from "react-icons/io5";
import { useBasket } from "../contexts/BasketContext";
import { useLocation } from "../contexts/LocationContext";

export default function SmartBasketOptimizer() {
  const { 
    basketItems, 
    addItem, 
    updateQuantity,
    removeItem, 
    clearBasket, 
    optimizationResult: result, 
    isOptimizing: loading, 
    optimize 
  } = useBasket();
  
  const { postalCode, cityName } = useLocation();
  const [inputVal, setInputVal] = useState("");
  const [activeTab, setActiveTab] = useState("items"); // "items" | "optimizer" | "comparison"

  // Tax settings
  const [includeTax, setIncludeTax] = useState(false);
  const [taxMode, setTaxMode] = useState("groceries"); // "groceries" (0%) | "quebec" (14.975%) | "ontario" (13%)

  useEffect(() => {
    if (basketItems.length > 0 && !result) {
      optimize(basketItems.map((i) => (typeof i === "object" ? i.title : i)), postalCode);
    }
  }, [basketItems, postalCode]);

  const handleAddItem = (itemToAdd) => {
    const val = (itemToAdd || inputVal).trim();
    if (val) {
      addItem(val);
      setInputVal("");
    }
  };

  const handleRemoveItem = (itemId) => {
    removeItem(itemId);
  };

  const popularChips = ["milk", "spinach", "eggs", "butter", "bread", "chicken", "cheese", "yogurt"];

  // Calculate Subtotal and Tax
  const taxRate = taxMode === "quebec" ? 0.14975 : taxMode === "ontario" ? 0.13 : 0.0;
  
  const rawSubtotal = basketItems.reduce((acc, item) => {
    const p = typeof item === "object" ? (item.price || 3.49) : 3.49;
    const q = typeof item === "object" ? (item.quantity || 1) : 1;
    return acc + p * q;
  }, 0);

  const taxAmount = rawSubtotal * taxRate;
  const grandTotal = rawSubtotal + taxAmount;

  const bestSingleCost = result?.best_single_store?.total_cost || 0;
  const bestTwoCost = result?.best_two_store_combination?.total_cost || bestSingleCost;
  const extraSavings = result?.potential_extra_savings || 0;
  const savingsPct = bestSingleCost > 0 ? ((extraSavings / bestSingleCost) * 100).toFixed(0) : 0;

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
      {/* Background radial ambient glow */}
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
              <IoSparklesOutline size={13} /> AI Price Intelligence • {cityName || "Montreal"}
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
            <span>My Smart Grocery Basket ({basketItems.length} {basketItems.length === 1 ? "Item" : "Items"})</span>
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
            onClick={() => {
              setActiveTab("optimizer");
              optimize(basketItems.map((i) => (typeof i === "object" ? i.title : i)), postalCode);
            }}
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
            {loading ? "Calculating..." : "Run AI Trip Split Optimizer"}
          </button>
        </div>
      </div>

      {/* Item Quick Add Bar */}
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
            const isAdded = basketItems.some((i) => {
              const title = typeof i === "object" ? i.title : i;
              return title.toLowerCase() === chip.toLowerCase();
            });
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

      {/* Main Feature Navigation Tabs */}
      <div style={{ display: "flex", gap: "16px", borderBottom: "1px solid #E2E8F0", paddingBottom: "12px" }}>
        <button
          onClick={() => setActiveTab("items")}
          style={{
            fontSize: "15px",
            fontWeight: 800,
            color: activeTab === "items" ? "#059669" : "#64748B",
            borderBottom: activeTab === "items" ? "3px solid #059669" : "3px solid transparent",
            paddingBottom: "10px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "all 0.2s",
            fontFamily: "var(--font-headings)"
          }}
        >
          <IoReceiptOutline size={18} />
          Itemized Basket & Tax Calculator ({basketItems.length})
        </button>

        <button
          onClick={() => setActiveTab("optimizer")}
          style={{
            fontSize: "15px",
            fontWeight: 800,
            color: activeTab === "optimizer" ? "#059669" : "#64748B",
            borderBottom: activeTab === "optimizer" ? "3px solid #059669" : "3px solid transparent",
            paddingBottom: "10px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "all 0.2s",
            fontFamily: "var(--font-headings)"
          }}
        >
          <IoFlashOutline size={18} />
          AI Multi-Store Split Optimizer
        </button>

        <button
          onClick={() => setActiveTab("comparison")}
          style={{
            fontSize: "15px",
            fontWeight: 800,
            color: activeTab === "comparison" ? "#059669" : "#64748B",
            borderBottom: activeTab === "comparison" ? "3px solid #059669" : "3px solid transparent",
            paddingBottom: "10px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "all 0.2s",
            fontFamily: "var(--font-headings)"
          }}
        >
          <IoStorefrontOutline size={18} />
          Retailer Price Chart
        </button>
      </div>

      {/* TAB 1: Itemized Basket & Sales Tax Calculator */}
      {activeTab === "items" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {basketItems.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#64748B" }}>
              Your basket is empty. Click "+ Basket" on any product card or type items above to calculate totals!
            </div>
          ) : (
            <>
              {/* Itemized Table */}
              <div style={{
                borderRadius: "18px",
                border: "1px solid #E2E8F0",
                overflow: "hidden",
                boxShadow: "0 4px 15px rgba(0,0,0,0.02)"
              }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlignment: "left", fontSize: "14px" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#F8FAFC", borderBottom: "1px solid #E2E8F0", color: "#64748B", fontWeight: 700, fontSize: "12px", textTransform: "uppercase" }}>
                      <th style={{ padding: "14px 20px", textAlign: "left" }}>Item Name</th>
                      <th style={{ padding: "14px 20px", textAlign: "left" }}>Selected Store</th>
                      <th style={{ padding: "14px 20px", textAlign: "right" }}>Unit Price</th>
                      <th style={{ padding: "14px 20px", textAlign: "center" }}>Qty</th>
                      <th style={{ padding: "14px 20px", textAlign: "right" }}>Subtotal</th>
                      <th style={{ padding: "14px 20px", textAlign: "center" }}>Remove</th>
                    </tr>
                  </thead>
                  <tbody>
                    {basketItems.map((item, idx) => {
                      const id = typeof item === "object" ? item.id : String(idx);
                      const title = typeof item === "object" ? item.title : item;
                      const price = typeof item === "object" ? (item.price || 3.49) : 3.49;
                      const store = typeof item === "object" ? (item.store_name || "Local Store") : "Local Store";
                      const qty = typeof item === "object" ? (item.quantity || 1) : 1;
                      const itemTotal = price * qty;
                      const displayPrice = includeTax ? itemTotal * (1 + taxRate) : itemTotal;

                      return (
                        <tr key={id} style={{ borderBottom: "1px solid #F1F5F9", transition: "all 0.2s ease" }}>
                          <td style={{ padding: "16px 20px", fontWeight: 700, color: "#0F172A" }}>
                            {title}
                          </td>
                          <td style={{ padding: "16px 20px", color: "#475569", fontWeight: 600 }}>
                            <span style={{
                              backgroundColor: "rgba(27, 54, 93, 0.06)",
                              padding: "4px 10px",
                              borderRadius: "12px",
                              fontSize: "12px",
                              fontWeight: 700,
                              color: "#1B365D"
                            }}>
                              {store}
                            </span>
                          </td>
                          <td style={{ padding: "16px 20px", textAlign: "right", color: "#64748B" }}>
                            ${price.toFixed(2)}
                          </td>
                          <td style={{ padding: "16px 20px", textAlign: "center" }}>
                            <div style={{ display: "inline-flex", alignItems: "center", border: "1px solid #CBD5E1", borderRadius: "10px", backgroundColor: "#FFFFFF" }}>
                              <button
                                onClick={() => updateQuantity(id, -1)}
                                style={{ padding: "4px 8px", cursor: "pointer", border: "none", color: "#475569" }}
                              >
                                <IoRemoveOutline size={14} />
                              </button>
                              <span style={{ padding: "0 10px", fontWeight: 700, fontSize: "13px", color: "#0F172A" }}>
                                {qty}
                              </span>
                              <button
                                onClick={() => updateQuantity(id, 1)}
                                style={{ padding: "4px 8px", cursor: "pointer", border: "none", color: "#475569" }}
                              >
                                <IoAddOutline size={14} />
                              </button>
                            </div>
                          </td>
                          <td style={{ padding: "16px 20px", textAlign: "right", fontWeight: 800, color: "#0F172A" }}>
                            ${displayPrice.toFixed(2)}
                          </td>
                          <td style={{ padding: "16px 20px", textAlign: "center" }}>
                            <button
                              onClick={() => handleRemoveItem(id)}
                              style={{ padding: "6px", borderRadius: "8px", border: "none", backgroundColor: "#FEE2E2", color: "#EF4444", cursor: "pointer" }}
                            >
                              <IoTrashOutline size={16} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Subtotal & Sales Tax Calculation Panel */}
              <div style={{
                backgroundColor: "#F8FAFC",
                border: "1px solid #E2E8F0",
                borderRadius: "20px",
                padding: "24px",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "24px",
                alignItems: "center"
              }}>
                {/* Left: Tax Rate & Price Display Toggle Controls */}
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <IoCalculatorOutline size={20} color="#059669" />
                    <strong style={{ fontSize: "15px", color: "#0F172A", fontFamily: "var(--font-headings)" }}>
                      Canadian Sales Tax Options
                    </strong>
                  </div>

                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    <button
                      onClick={() => setTaxMode("groceries")}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "10px",
                        fontSize: "12px",
                        fontWeight: 700,
                        backgroundColor: taxMode === "groceries" ? "#D1FAE5" : "#FFFFFF",
                        border: taxMode === "groceries" ? "1px solid #10B981" : "1px solid #E2E8F0",
                        color: taxMode === "groceries" ? "#047857" : "#64748B",
                        cursor: "pointer"
                      }}
                    >
                      🇨🇦 Basic Groceries (0% Zero-Rated)
                    </button>
                    <button
                      onClick={() => setTaxMode("quebec")}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "10px",
                        fontSize: "12px",
                        fontWeight: 700,
                        backgroundColor: taxMode === "quebec" ? "#D1FAE5" : "#FFFFFF",
                        border: taxMode === "quebec" ? "1px solid #10B981" : "1px solid #E2E8F0",
                        color: taxMode === "quebec" ? "#047857" : "#64748B",
                        cursor: "pointer"
                      }}
                    >
                      ⚜️ Quebec Sales Tax (14.975%)
                    </button>
                    <button
                      onClick={() => setTaxMode("ontario")}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "10px",
                        fontSize: "12px",
                        fontWeight: 700,
                        backgroundColor: taxMode === "ontario" ? "#D1FAE5" : "#FFFFFF",
                        border: taxMode === "ontario" ? "1px solid #10B981" : "1px solid #E2E8F0",
                        color: taxMode === "ontario" ? "#047857" : "#64748B",
                        cursor: "pointer"
                      }}
                    >
                      🍁 Ontario HST (13%)
                    </button>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "4px" }}>
                    <label style={{ fontSize: "13px", fontWeight: 700, color: "#334155", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
                      <input
                        type="checkbox"
                        checked={includeTax}
                        onChange={(e) => setIncludeTax(e.target.checked)}
                        style={{ width: "16px", height: "16px", accentColor: "#10B981" }}
                      />
                      <span>Calculate & display total with estimated sales tax</span>
                    </label>
                  </div>
                </div>

                {/* Right: Price Breakdown Card */}
                <div style={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E2E8F0",
                  borderRadius: "16px",
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.03)"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", color: "#64748B" }}>
                    <span>Subtotal ({basketItems.length} items):</span>
                    <strong>${rawSubtotal.toFixed(2)}</strong>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", color: "#64748B" }}>
                    <span>Estimated Tax ({taxMode === "quebec" ? "14.975%" : taxMode === "ontario" ? "13%" : "0%"}):</span>
                    <strong>${taxAmount.toFixed(2)}</strong>
                  </div>

                  <div style={{ borderTop: "1px solid #E2E8F0", paddingTop: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "16px", fontWeight: 800, color: "#0F172A" }}>
                      {includeTax ? "Grand Total (incl. tax):" : "Subtotal (pre-tax):"}
                    </span>
                    <span style={{ fontSize: "24px", fontWeight: 800, color: "#059669" }}>
                      ${(includeTax ? grandTotal : rawSubtotal).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* TAB 2: AI Multi-Store Split Optimizer */}
      {activeTab === "optimizer" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Key Metrics Widgets */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "16px",
          }}>
            <div className="metric-widget">
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.5px" }}>BEST 1-STORE TOTAL</span>
              <div style={{ fontSize: "24px", fontWeight: 800, color: "#0F172A" }}>
                ${bestSingleCost.toFixed(2)}
              </div>
              <span style={{ fontSize: "12px", color: "#64748B" }}>
                {result?.best_single_store?.store_name || "N/A"}
              </span>
            </div>

            <div className="metric-widget" style={{ borderColor: "rgba(16, 185, 129, 0.4)", backgroundColor: "rgba(16, 185, 129, 0.03)" }}>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "#059669", textTransform: "uppercase", letterSpacing: "0.5px" }}>OPTIMAL 2-STORE TOTAL</span>
              <div style={{ fontSize: "24px", fontWeight: 800, color: "#059669" }}>
                ${bestTwoCost.toFixed(2)}
              </div>
              <span style={{ fontSize: "12px", color: "#047857", fontWeight: 600 }}>
                2-Store Combination
              </span>
            </div>

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

          {/* Store Match Explanation Callout Box (Answering User Question) */}
          <div style={{
            backgroundColor: "#EFF6FF",
            border: "1px solid #93C5FD",
            borderRadius: "16px",
            padding: "18px 22px",
            color: "#1E40AF",
            fontSize: "14px",
            display: "flex",
            gap: "12px",
            alignItems: "flex-start"
          }}>
            <IoInformationCircleOutline size={24} style={{ flexShrink: 0, marginTop: "2px" }} />
            <div>
              <strong style={{ display: "block", fontSize: "15px", marginBottom: "4px" }}>
                Why do some single stores match 1 or 2 of your 3 items?
              </strong>
              <span>
                Grocery stores run weekly flyer discounts on specific products. If Super C has chicken legs on flyer deal ($1.95) but doesn't have Becel Margarine on flyer deal this week, the AI Optimizer splits your basket across 2 stores (e.g. buying Chicken at Super C and Margarine at Metro) to maximize your total savings!
              </span>
            </div>
          </div>

          {/* Option Breakdown Cards */}
          {result && (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "24px"
            }}>
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
        </div>
      )}

      {/* TAB 3: Store Price Comparison Bar Chart */}
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
              const isCheapest = store.store_id === result?.best_single_store?.store_id;

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
  );
}
