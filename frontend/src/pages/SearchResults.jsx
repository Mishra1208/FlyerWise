import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { IoArrowBackOutline, IoFunnelOutline, IoSearchOutline, IoCheckmarkDoneOutline, IoCloseOutline } from "react-icons/io5";
import SearchBar from "../components/SearchBar";
import ProductCard from "../components/ProductCard";
import PriceComparison from "../components/PriceComparison";
import ProductDetailModal from "../components/ProductDetailModal";
import SmartBasketOptimizer from "../components/SmartBasketOptimizer";
import { ProductService, StoreService } from "../services/api";
import { useLocation } from "../contexts/LocationContext";

const DEFAULT_MAJOR_STORES = [
  { slug: "walmart", name: "Walmart" },
  { slug: "maxi", name: "Maxi" },
  { slug: "metro", name: "Metro" },
  { slug: "iga", name: "IGA" },
  { slug: "superc", name: "Super C" },
  { slug: "provigo", name: "Provigo" },
  { slug: "costco", name: "Costco Canada" },
  { slug: "pharmaprix", name: "Pharmaprix" },
  { slug: "shoppers-drug-mart", name: "Shoppers Drug Mart" },
  { slug: "jean-coutu", name: "Jean Coutu" },
  { slug: "adonis", name: "Adonis" },
  { slug: "pasquier", name: "Pasquier" },
  { slug: "les-marches-tradition", name: "Les Marchés Tradition" },
  { slug: "supermarche-pa", name: "Supermarché PA" },
  { slug: "tt-supermarket", name: "T&T Supermarket" },
  { slug: "food-basics", name: "Food Basics" },
  { slug: "sobeys", name: "Sobeys" },
  { slug: "loblaws", name: "Loblaws" },
  { slug: "kim-phat", name: "Kim Phat" },
];

export default function SearchResults() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const { postalCode } = useLocation();

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompareResult, setSelectedCompareResult] = useState(null);
  const [selectedDetailResult, setSelectedDetailResult] = useState(null);

  const [flyerFilter, setFlyerFilter] = useState("all");
  const [allStores, setAllStores] = useState(DEFAULT_MAJOR_STORES);
  const [storeSearchTerm, setStoreSearchTerm] = useState("");
  const [activeStores, setActiveStores] = useState({});

  const handleSearch = (newQuery) => {
    if (!newQuery || !newQuery.trim()) {
      navigate("/");
    } else {
      navigate(`/search?q=${encodeURIComponent(newQuery.trim())}`);
    }
  };

  // Fetch all tracked stores from backend API on mount
  useEffect(() => {
    async function fetchStores() {
      try {
        const data = await StoreService.list();
        if (Array.isArray(data) && data.length > 0) {
          setAllStores(data);
        }
      } catch (err) {
        console.error("Failed to fetch stores list:", err);
      }
    }
    fetchStores();
  }, []);

  useEffect(() => {
    async function performSearch() {
      if (!query || !query.trim()) {
        setResults([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const data = await ProductService.search(query, flyerFilter, postalCode);
        setResults(data.results || []);
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setLoading(false);
      }
    }
    performSearch();
  }, [query, flyerFilter, postalCode]);

  // Extract all unique stores present in current search results to merge into allStores
  const displayStores = useMemo(() => {
    const storeMap = new Map();
    // Add default / API stores
    allStores.forEach((st) => {
      if (st.slug && st.name) storeMap.set(st.slug, st.name);
    });
    // Add any stores present in search results
    results.forEach((r) => {
      (r.prices || []).forEach((p) => {
        if (p.store && p.store.slug && p.store.name) {
          storeMap.set(p.store.slug, p.store.name);
        }
      });
    });

    const storeArray = Array.from(storeMap.entries()).map(([slug, name]) => ({ slug, name }));

    // Priority sorting: Put top Quebec retailers at the top
    const priority = ["superc", "maxi", "metro", "iga", "provigo", "walmart", "costco", "pharmaprix", "shoppers-drug-mart", "jean-coutu", "adonis", "pasquier"];
    storeArray.sort((a, b) => {
      const idxA = priority.indexOf(a.slug);
      const idxB = priority.indexOf(b.slug);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.name.localeCompare(b.name);
    });

    return storeArray;
  }, [allStores, results]);

  // Filter stores list based on storeSearchTerm input
  const filteredStoresList = useMemo(() => {
    if (!storeSearchTerm.trim()) return displayStores;
    const term = storeSearchTerm.toLowerCase().trim();
    return displayStores.filter((st) =>
      st.name.toLowerCase().includes(term) || st.slug.toLowerCase().includes(term)
    );
  }, [displayStores, storeSearchTerm]);

  // Store checkbox toggle helper
  const toggleStore = (slug) => {
    setActiveStores((prev) => {
      const isCurrentlyActive = prev[slug] !== false; // Default is active/true
      return { ...prev, [slug]: !isCurrentlyActive };
    });
  };

  const handleSelectAllStores = () => {
    const updated = {};
    displayStores.forEach((st) => { updated[st.slug] = true; });
    setActiveStores(updated);
  };

  const handleClearAllStores = () => {
    const updated = {};
    displayStores.forEach((st) => { updated[st.slug] = false; });
    setActiveStores(updated);
  };

  // Check if any checkbox is turned off
  const isAnyStoreUnchecked = Object.values(activeStores).some((v) => v === false);

  const filteredResults = results.map((result) => {
    const filteredPrices = result.prices.filter((p) => {
      if (!isAnyStoreUnchecked) return true;
      const storeSlug = (p.store.slug || "").toLowerCase();
      // If store is explicitly set to false, filter it out
      if (activeStores[storeSlug] === false) return false;
      return true;
    });

    if (filteredPrices.length === 0) return null;

    const lowest = Math.min(...filteredPrices.map((p) => parseFloat(p.current_price)));
    const highest = Math.max(...filteredPrices.map((p) => parseFloat(p.current_price)));

    const updatedPrices = filteredPrices.map((p) => ({
      ...p,
      is_lowest: parseFloat(p.current_price) === lowest,
    }));

    return {
      ...result,
      prices: updatedPrices,
      lowest_price: lowest,
      highest_price: highest,
      savings_potential: highest - lowest,
    };
  }).filter(Boolean);

  return (
    <div style={{ padding: "50px 0", backgroundColor: "var(--bg-body)", minHeight: "80vh" }}>
      <div className="container">
        {/* Back and search navigation row */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          marginBottom: "30px",
        }}>
          <button 
            onClick={() => navigate("/")}
            style={{
              padding: "10px",
              borderRadius: "50%",
              backgroundColor: "#FFFFFF",
              border: "1px solid var(--border-color)",
              color: "var(--text-primary)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "var(--transition)",
              boxShadow: "var(--shadow-sm)",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "var(--accent)"; e.currentTarget.style.transform = "translateX(-2px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-primary)"; e.currentTarget.style.transform = "translateX(0)"; }}
          >
            <IoArrowBackOutline size={20} />
          </button>
          
          <div style={{ flex: 1, maxWidth: "600px" }}>
            <SearchBar initialValue={query} onSearch={handleSearch} />
          </div>
        </div>

        {/* Flyer Status Filter Tabs */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginBottom: "30px",
          flexWrap: "wrap",
          backgroundColor: "#FFFFFF",
          padding: "8px 14px",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--border-color)",
          boxShadow: "var(--shadow-sm)",
        }}>
          <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-secondary)", marginRight: "6px" }}>
            Flyer Period:
          </span>
          {[
            { id: "all", label: "🌟 All Deals (Current + Preview + Recent)" },
            { id: "active", label: "🟢 Active Flyers Only" },
            { id: "upcoming", label: "📅 Next Week Preview" },
            { id: "recent", label: "📜 Recent Sales" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFlyerFilter(tab.id)}
              style={{
                padding: "6px 14px",
                borderRadius: "var(--radius-sm)",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                border: flyerFilter === tab.id ? "1px solid var(--accent)" : "1px solid transparent",
                backgroundColor: flyerFilter === tab.id ? "rgba(91, 140, 81, 0.12)" : "transparent",
                color: flyerFilter === tab.id ? "var(--accent-hover)" : "var(--text-secondary)",
                transition: "var(--transition)",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filters and Grid Layout */}
        <div className="search-layout" style={{
          display: "grid",
          gridTemplateColumns: "260px 1fr",
          gap: "40px",
          alignItems: "start",
        }}>
          {/* Filters Sidebar */}
          <aside style={{
            backgroundColor: "#FFFFFF",
            padding: "24px",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border-color)",
            position: "sticky",
            top: "100px",
            boxShadow: "var(--shadow-sm)",
          }}>
            <h3 style={{
              fontSize: "16px",
              fontWeight: 700,
              color: "var(--text-primary)",
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              borderBottom: "1px solid var(--border-color)",
              paddingBottom: "12px",
            }}>
              <IoFunnelOutline style={{ color: "var(--accent)" }} />
              <span>Filters</span>
            </h3>

            <div>
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "10px",
              }}>
                <span style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  color: "var(--text-muted)",
                  letterSpacing: "0.8px",
                }}>Stores ({displayStores.length})</span>
                
                <div style={{ display: "flex", gap: "6px" }}>
                  <button
                    onClick={handleSelectAllStores}
                    title="Select all stores"
                    style={{
                      border: "none",
                      background: "none",
                      color: "var(--accent-hover)",
                      fontSize: "11px",
                      fontWeight: 700,
                      cursor: "pointer",
                      padding: "2px 4px",
                    }}
                  >
                    Select All
                  </button>
                  <span style={{ color: "#ccc", fontSize: "11px" }}>|</span>
                  <button
                    onClick={handleClearAllStores}
                    title="Clear all store selections"
                    style={{
                      border: "none",
                      background: "none",
                      color: "#ef4444",
                      fontSize: "11px",
                      fontWeight: 700,
                      cursor: "pointer",
                      padding: "2px 4px",
                    }}
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {/* Store Filter Input with Live Matching Suggestions */}
              <div style={{
                position: "relative",
                marginBottom: "14px",
                display: "flex",
                alignItems: "center",
              }}>
                <IoSearchOutline size={14} style={{ position: "absolute", left: "10px", color: "var(--text-muted)" }} />
                <input
                  type="text"
                  value={storeSearchTerm}
                  onChange={(e) => setStoreSearchTerm(e.target.value)}
                  placeholder="Filter store name..."
                  style={{
                    width: "100%",
                    padding: "7px 26px 7px 30px",
                    fontSize: "12px",
                    borderRadius: "6px",
                    border: "1px solid var(--border-color)",
                    backgroundColor: "#F9FAFB",
                    color: "var(--text-primary)",
                    outline: "none",
                  }}
                />
                {storeSearchTerm && (
                  <button
                    onClick={() => setStoreSearchTerm("")}
                    style={{
                      position: "absolute",
                      right: "8px",
                      border: "none",
                      background: "none",
                      color: "var(--text-muted)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <IoCloseOutline size={14} />
                  </button>
                )}
              </div>

              {/* Stores toggles scrollable list */}
              <div style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                maxHeight: "360px",
                overflowY: "auto",
                paddingRight: "4px",
              }}>
                {filteredStoresList.length === 0 ? (
                  <span style={{ fontSize: "12px", color: "var(--text-muted)", fontStyle: "italic", padding: "8px 0" }}>
                    No store matches "{storeSearchTerm}"
                  </span>
                ) : (
                  filteredStoresList.map((st) => {
                    const isChecked = activeStores[st.slug] !== false;
                    return (
                      <label key={st.slug} style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        cursor: "pointer",
                        fontSize: "13px",
                        fontWeight: 500,
                        color: isChecked ? "var(--text-primary)" : "var(--text-muted)",
                      }}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleStore(st.slug)}
                          style={{
                            accentColor: "var(--accent)",
                            width: "15px",
                            height: "15px",
                            cursor: "pointer",
                          }}
                        />
                        <span>{st.name}</span>
                      </label>
                    );
                  })
                )}
              </div>
            </div>
          </aside>

          {/* Results grid */}
          <main>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
            }}>
              <span style={{ color: "var(--text-secondary)", fontSize: "14px", fontWeight: 500 }}>
                Showing <strong>{filteredResults.length}</strong> matching item(s) for "{query}"
              </span>
            </div>

            {loading ? (
              <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)", fontSize: "15px" }}>Searching grocery flyers...</div>
            ) : filteredResults.length === 0 ? (
              <div style={{
                backgroundColor: "#FFFFFF",
                padding: "60px",
                textAlign: "center",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-color)",
                boxShadow: "var(--shadow-sm)",
              }}>
                <h3 style={{ fontSize: "18px", color: "var(--text-primary)", fontWeight: 700, marginBottom: "8px" }}>No results found</h3>
                <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Try checking spelling or using a simpler search keyword like 'tomato' or 'apple'.</p>
              </div>
            ) : (
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: "24px",
              }}>
                {filteredResults.map((result) => (
                  <ProductCard
                    key={result.product.id}
                    result={result}
                    onClick={(res) => setSelectedDetailResult(res)}
                    onCompare={(res) => setSelectedCompareResult(res)}
                  />
                ))}
              </div>
            )}

            {/* Smart Basket Optimizer Section */}
            <div style={{ marginTop: "40px" }}>
              <SmartBasketOptimizer />
            </div>
          </main>
        </div>
      </div>

      {/* Product Detail & Nutrition Facts Animated Modal */}
      {selectedDetailResult && (
        <ProductDetailModal
          result={selectedDetailResult}
          onClose={() => setSelectedDetailResult(null)}
        />
      )}

      {/* Comparison Detail Modal */}
      {selectedCompareResult && (
        <PriceComparison
          product={selectedCompareResult.product}
          prices={selectedCompareResult.prices}
          onClose={() => setSelectedCompareResult(null)}
        />
      )}

      {/* Responsive layout styles via inline CSS injection */}
      <style>{`
        @media (max-width: 768px) {
          .search-layout {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
          .search-layout aside {
            position: static !important;
          }
        }
      `}</style>
    </div>
  );
}
