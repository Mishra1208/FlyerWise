import React, { createContext, useContext, useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { BasketService, UserBasketService, UserService } from "../services/api";

const BasketContext = createContext(null);

const DEFAULT_ITEMS = [
  { id: "1", title: "Fresh Milk 2L", price: 4.49, store_name: "Walmart", quantity: 1, image_url: "" },
  { id: "2", title: "Organic Spinach", price: 2.99, store_name: "Super C", quantity: 1, image_url: "" },
  { id: "3", title: "Lactantia Butter", price: 4.97, store_name: "Walmart", quantity: 1, image_url: "" },
];

export function BasketProvider({ children }) {
  const { isSignedIn, user } = useUser();
  const userId = user?.id;

  const [basketItems, setBasketItems] = useState(() => {
    const saved = localStorage.getItem("flyerwise_basket_v2");
    if (!saved) return DEFAULT_ITEMS;
    try {
      const parsed = JSON.parse(saved);
      return parsed.map((item, idx) => {
        if (typeof item === "string") {
          return {
            id: String(idx + 1),
            title: item.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.substring(1).toLowerCase()),
            price: 3.99,
            store_name: "Local Retailer",
            quantity: 1,
            image_url: "",
          };
        }
        return item;
      });
    } catch {
      return DEFAULT_ITEMS;
    }
  });

  const [optimizationResult, setOptimizationResult] = useState(null);
  const [isOptimizing, setIsOptimizing] = useState(false);

  // Sync to PostgreSQL when user logs in
  useEffect(() => {
    if (isSignedIn && userId) {
      // Send Welcome email once
      const sentWelcome = localStorage.getItem(`flyerwise_welcome_sent_${userId}`);
      if (!sentWelcome && user?.primaryEmailAddress?.emailAddress) {
        UserService.sendWelcomeEmail(
          user.primaryEmailAddress.emailAddress,
          user.fullName || user.firstName
        );
        localStorage.setItem(`flyerwise_welcome_sent_${userId}`, "true");
      }

      // Sync local basket with database
      UserBasketService.syncBasket(userId, basketItems).then((syncedItems) => {
        if (syncedItems && syncedItems.length > 0) {
          const formatted = syncedItems.map((dbItem) => ({
            id: String(dbItem.id),
            title: dbItem.product_name,
            price: 3.99,
            store_name: "Local Retailer",
            quantity: dbItem.quantity || 1,
            image_url: "",
          }));
          setBasketItems(formatted);
          optimize(formatted.map((i) => i.title));
        }
      });
    }
  }, [isSignedIn, userId]);

  useEffect(() => {
    localStorage.setItem("flyerwise_basket_v2", JSON.stringify(basketItems));
  }, [basketItems]);

  const addItem = (itemInput) => {
    setBasketItems((prev) => {
      let updated;
      if (typeof itemInput === "object" && itemInput !== null) {
        const title = itemInput.title || itemInput.raw_name || "Grocery Item";
        const existingIdx = prev.findIndex((i) => i.title.toLowerCase() === title.toLowerCase());
        if (existingIdx >= 0) {
          updated = [...prev];
          updated[existingIdx] = {
            ...updated[existingIdx],
            quantity: (updated[existingIdx].quantity || 1) + 1,
          };
        } else {
          updated = [
            ...prev,
            {
              id: itemInput.id ? String(itemInput.id) : Date.now().toString(),
              title: title,
              price: itemInput.price ? parseFloat(itemInput.price) : 3.99,
              store_name: itemInput.store_name || "Local Retailer",
              quantity: itemInput.quantity || 1,
              image_url: itemInput.image_url || "",
            },
          ];
        }
      } else {
        const cleanTitle = String(itemInput)
          .trim()
          .replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.substring(1).toLowerCase());
        if (!cleanTitle) return prev;
        const existingIdx = prev.findIndex((i) => i.title.toLowerCase() === cleanTitle.toLowerCase());
        if (existingIdx >= 0) {
          updated = [...prev];
          updated[existingIdx] = {
            ...updated[existingIdx],
            quantity: (updated[existingIdx].quantity || 1) + 1,
          };
        } else {
          updated = [
            ...prev,
            {
              id: Date.now().toString(),
              title: cleanTitle,
              price: 3.49,
              store_name: "Local Retailer",
              quantity: 1,
              image_url: "",
            },
          ];
        }
      }

      if (isSignedIn && userId) {
        UserBasketService.syncBasket(userId, updated);
      }

      optimize(updated.map((i) => i.title));
      return updated;
    });
  };

  const updateQuantity = (itemId, delta) => {
    setBasketItems((prev) => {
      const updated = prev
        .map((item) => {
          if (String(item.id) === String(itemId) || item.title.toLowerCase() === String(itemId).toLowerCase()) {
            const newQty = (item.quantity || 1) + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean);

      if (isSignedIn && userId) {
        UserBasketService.syncBasket(userId, updated);
      }

      optimize(updated.map((i) => i.title));
      return updated;
    });
  };

  const removeItem = (itemIdOrTitle) => {
    setBasketItems((prev) => {
      const updated = prev.filter(
        (i) =>
          String(i.id) !== String(itemIdOrTitle) &&
          i.title.toLowerCase() !== String(itemIdOrTitle).toLowerCase()
      );

      if (isSignedIn && userId) {
        UserBasketService.syncBasket(userId, updated);
      }

      if (updated.length > 0) {
        optimize(updated.map((i) => i.title));
      } else {
        setOptimizationResult(null);
      }
      return updated;
    });
  };

  const clearBasket = () => {
    setBasketItems([]);
    setOptimizationResult(null);
    if (isSignedIn && userId) {
      UserBasketService.clearBasket(userId);
    }
  };

  const optimize = async (listToOptimize = basketItems, postalCode = null) => {
    const stringList = listToOptimize.map((i) => (typeof i === "object" ? i.title : i));
    if (!stringList || stringList.length === 0) return;
    setIsOptimizing(true);
    try {
      const pCode = postalCode || localStorage.getItem("flyerwise_postal_code") || "H4G2Y5";
      const data = await BasketService.optimize(stringList, pCode);
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
        updateQuantity,
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
