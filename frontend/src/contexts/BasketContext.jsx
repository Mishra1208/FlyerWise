import React, { createContext, useContext, useState, useEffect } from "react";
import { BasketService } from "../services/api";

const BasketContext = createContext(null);

export function BasketProvider({ children }) {
  const [basketItems, setBasketItems] = useState(() => {
    const saved = localStorage.getItem("flyerwise_basket");
    return saved ? JSON.parse(saved) : ["milk", "spinach", "butter"];
  });

  const [optimizationResult, setOptimizationResult] = useState(null);
  const [isOptimizing, setIsOptimizing] = useState(false);

  useEffect(() => {
    localStorage.setItem("flyerwise_basket", JSON.stringify(basketItems));
  }, [basketItems]);

  const addItem = (itemQuery) => {
    const clean = itemQuery.trim().toLowerCase();
    if (clean && !basketItems.includes(clean)) {
      const updated = [...basketItems, clean];
      setBasketItems(updated);
      optimize(updated);
    }
  };

  const removeItem = (itemQuery) => {
    const updated = basketItems.filter((i) => i.toLowerCase() !== itemQuery.toLowerCase());
    setBasketItems(updated);
    if (updated.length > 0) {
      optimize(updated);
    } else {
      setOptimizationResult(null);
    }
  };

  const clearBasket = () => {
    setBasketItems([]);
    setOptimizationResult(null);
  };

  const optimize = async (listToOptimize = basketItems, postalCode = null) => {
    if (!listToOptimize || listToOptimize.length === 0) return;
    setIsOptimizing(true);
    try {
      const pCode = postalCode || localStorage.getItem("flyerwise_postal_code") || "H4G2Y5";
      const data = await BasketService.optimize(listToOptimize, pCode);
      setOptimizationResult(data);
    } catch (err) {
      console.error("Basket optimization error:", err);
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <BasketContext.Provider
      value={{
        basketItems,
        addItem,
        removeItem,
        clearBasket,
        optimizationResult,
        isOptimizing,
        optimize,
      }}
    >
      {children}
    </BasketContext.Provider>
  );
}

export function useBasket() {
  const ctx = useContext(BasketContext);
  if (!ctx) {
    throw new Error("useBasket must be used within a BasketProvider");
  }
  return ctx;
}

export default BasketContext;
