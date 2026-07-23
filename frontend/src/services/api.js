import axios from "axios";

// Base API configuration
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

export const StoreService = {
  list: async () => {
    const response = await API.get("/stores/");
    return response.data;
  },
};

export const ProductService = {
  search: async (query, flyerFilter = "all", postalCode = null) => {
    const params = { q: query, flyer_filter: flyerFilter };
    if (postalCode) {
      params.postal_code = postalCode.replace(/\s/g, "");
    }
    const response = await API.get("/products/search", { params });
    return response.data;
  },
  getByBarcode: async (barcode, flyerFilter = "all") => {
    const response = await API.get(`/products/barcode/${barcode}`, {
      params: { flyer_filter: flyerFilter },
    });
    return response.data;
  },
  getById: async (id) => {
    const response = await API.get(`/products/${id}`);
    return response.data;
  },
};

export const PriceService = {
  compare: async (productId) => {
    const response = await API.get(`/prices/compare/${productId}`);
    return response.data;
  },
  getDeals: async (limit = 20) => {
    const response = await API.get("/prices/deals", {
      params: { limit },
    });
    return response.data;
  },
  getHistory: async (productId, storeId = null) => {
    const params = storeId ? { store_id: storeId } : {};
    const response = await API.get(`/prices/history/${productId}`, { params });
    return response.data;
  },
};

export const BasketService = {
  optimize: async (items) => {
    const response = await API.post("/basket/optimize", { items });
    return response.data;
  },
};

export const IntelligenceService = {
  getIntelligence: async (productId) => {
    const response = await API.get(`/products/${productId}/intelligence`);
    return response.data;
  },
};

export default API;
