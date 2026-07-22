import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { IoArrowBackOutline, IoFunnelOutline } from "react-icons/io5";
import SearchBar from "../components/SearchBar";
import ProductCard from "../components/ProductCard";
import PriceComparison from "../components/PriceComparison";
import { ProductService } from "../services/api";

export default function SearchResults() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [flyerFilter, setFlyerFilter] = useState("all");

  // Store filters state for 6 major Quebec retailers
  const [activeStores, setActiveStores] = useState({
    walmart: true,
    maxi: true,
    metro: true,
    iga: true,
    superc: true,
    provigo: true,
  });

  const handleSearch = (newQuery) => {
    navigate(`/search?q=${encodeURIComponent(newQuery)}`);
  };

  useEffect(() => {
    async function performSearch() {
      if (!query) return;
      setLoading(true);
      try {
        const data = await ProductService.search(query, flyerFilter);
        setResults(data.results || []);
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setLoading(false);
      }
    }
    performSearch();
  }, [query, flyerFilter]);

  // Filter results based on selected stores checkbox status
  const filteredResults = results.map((result) => {
    // Filter the prices for this product based on store toggle
    const filteredPrices = result.prices.filter((p) => activeStores[p.store.slug]);
    
    if (filteredPrices.length === 0) return null;

    // Recalculate lowest price and savings potential
    const lowest = Math.min(...filteredPrices.map((p) => parseFloat(p.current_price)));
    const highest = Math.max(...filteredPrices.map((p) => parseFloat(p.current_price)));
    
    // Mark the lowest price item
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

  const toggleStore = (storeSlug) => {
    setActiveStores((prev) => ({
      ...prev,
      [storeSlug]: !prev[storeSlug],
    }));
  };

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
              <span style={{
                fontSize: "11px",
                fontWeight: 700,
                textTransform: "uppercase",
                color: "var(--text-muted)",
                letterSpacing: "0.8px",
                display: "block",
                marginBottom: "14px",
              }}>Stores (6 Quebec Chains)</span>

              {/* Stores toggles */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {[
                  { slug: "walmart", name: "Walmart" },
                  { slug: "maxi", name: "Maxi" },
                  { slug: "metro", name: "Metro" },
                  { slug: "iga", name: "IGA" },
                  { slug: "superc", name: "Super C" },
                  { slug: "provigo", name: "Provigo" },
                ].map((st) => (
                  <label key={st.slug} style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: 500,
                    color: activeStores[st.slug] ? "var(--text-primary)" : "var(--text-muted)",
                  }}>
                    <input
                      type="checkbox"
                      checked={!!activeStores[st.slug]}
                      onChange={() => toggleStore(st.slug)}
                      style={{
                        accentColor: "var(--accent)",
                        width: "16px",
                        height: "16px",
                        cursor: "pointer",
                      }}
                    />
                    <span>{st.name}</span>
                  </label>
                ))}
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
                    onClick={(product) => setSelectedProduct(product)}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Comparison Detail Modal */}
      {selectedProduct && (
        <PriceComparison
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
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
