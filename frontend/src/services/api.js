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
  search: async (query, flyerFilter = "all") => {
    const response = await API.get("/products/search", {
      params: { q: query, flyer_filter: flyerFilter },
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

export default API;
