import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoShieldCheckmarkOutline, IoTrendingUpOutline, IoPieChartOutline } from "react-icons/io5";
import SearchBar from "../components/SearchBar";
import { PriceService } from "../services/api";

export default function Home() {
  const navigate = useNavigate();
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleSearch = (query) => {
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  useEffect(() => {
    async function loadDeals() {
      try {
        const data = await PriceService.getDeals(4);
        setDeals(data);
      } catch (err) {
        console.error("Failed to load featured deals:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDeals();
  }, []);

  return (
    <div style={{ padding: "60px 0" }}>
      {/* Hero Header Section */}
      <div style={{
        textAlign: "center",
        maxWidth: "800px",
        margin: "0 auto 60px auto",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
      }}>
        <h1 style={{
          fontSize: "48px",
          fontWeight: 800,
          letterSpacing: "-1px",
          lineHeight: 1.15,
        }}>
          Stop Overpaying on Groceries.<br />Compare Prices with <span className="gradient-text">FlyerWise</span>
        </h1>
        <p style={{
          fontSize: "18px",
          color: "var(--text-secondary)",
          maxWidth: "600px",
          margin: "0 auto",
        }}>
          Search for any product and compare real-time flyer deals across Walmart, Maxi, and Metro instantly.
        </p>

        {/* Search Bar Container */}
        <div className="glass" style={{
          padding: "8px",
          borderRadius: "var(--radius-md)",
          boxShadow: "var(--shadow-lg)",
          maxWidth: "640px",
          width: "100%",
          margin: "12px auto 0 auto",
        }}>
          <SearchBar onSearch={handleSearch} />
        </div>
      </div>

      {/* Featured Deals Section */}
      <div className="container" style={{ marginBottom: "80px" }}>
        <h2 style={{
          fontSize: "24px",
          marginBottom: "24px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}>
          <IoTrendingUpOutline style={{ color: "var(--accent)" }} />
          <span>Top Flyer Discounts This Week</span>
        </h2>

        {loading ? (
          <div style={{ textAlign: "center", color: "var(--text-secondary)", padding: "40px 0" }}>Loading current top deals...</div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: "24px",
          }}>
            {deals.map((deal) => (
              <div 
                key={deal.price.id} 
                className="glass"
                style={{
                  borderRadius: "var(--radius-md)",
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  height: "100%",
                  border: "1px solid var(--bg-card-border)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Discount Percentage Badge */}
                {deal.discount_percentage && (
                  <div style={{
                    position: "absolute",
                    top: "12px",
                    right: "12px",
                    background: "var(--accent)",
                    color: "white",
                    padding: "4px 10px",
                    borderRadius: "var(--radius-full)",
                    fontSize: "12px",
                    fontWeight: 700,
                    boxShadow: "var(--shadow-sm)",
                  }}>
                    -{Math.round(deal.discount_percentage)}% OFF
                  </div>
                )}

                {/* Product Detail info */}
                <div>
                  <div style={{
                    width: "70px",
                    height: "70px",
                    background: "white",
                    borderRadius: "var(--radius-sm)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "6px",
                    marginBottom: "16px",
                    border: "1px solid rgba(0,0,0,0.05)",
                  }}>
                    <img 
                      src={deal.product.image_url || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=100"} 
                      alt={deal.product.raw_name}
                      style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                    />
                  </div>
                  {deal.product.brand && (
                    <span style={{ fontSize: "11px", color: "var(--primary-light)", fontWeight: 600 }}>{deal.product.brand}</span>
                  )}
                  <h3 style={{
                    fontSize: "15px",
                    fontWeight: 600,
                    margin: "2px 0 12px 0",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }} title={deal.product.raw_name}>{deal.product.raw_name}</h3>
                </div>

                {/* Price block */}
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "end",
                  borderTop: "1px solid var(--bg-card-border)",
                  paddingTop: "12px",
                }}>
                  <div>
                    <span style={{
                      fontSize: "11px",
                      color: "var(--text-muted)",
                      textDecoration: "line-through",
                      display: "block",
                    }}>${parseFloat(deal.price.original_price).toFixed(2)}</span>
                    <span style={{
                      fontSize: "18px",
                      fontWeight: 800,
                      color: "var(--primary-light)",
                    }}>${parseFloat(deal.price.current_price).toFixed(2)}</span>
                  </div>

                  <span style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "var(--text-secondary)",
                    background: "var(--bg-card-border)",
                    padding: "4px 10px",
                    borderRadius: "var(--radius-sm)",
                  }}>{deal.price.store.name}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Informational Core Pitch Section */}
      <div className="container">
        <h2 style={{ fontSize: "24px", textAlign: "center", marginBottom: "40px" }}>Why Shop With FlyerWise?</h2>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "30px",
        }}>
          {/* Card 1 */}
          <div className="glass" style={{
            padding: "30px",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--bg-card-border)",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}>
            <div style={{
              background: "rgba(16, 185, 129, 0.1)",
              color: "var(--primary-light)",
              padding: "12px",
              borderRadius: "14px",
              width: "fit-content",
            }}>
              <IoShieldCheckmarkOutline size={28} />
            </div>
            <h3 style={{ fontSize: "18px" }}>Save up to 40% Weekly</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
              By comparing prices across nearby stores, you'll easily find where your grocery list items are at their absolute lowest cost.
            </p>
          </div>

          {/* Card 2 */}
          <div className="glass" style={{
            padding: "30px",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--bg-card-border)",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}>
            <div style={{
              background: "rgba(16, 185, 129, 0.1)",
              color: "var(--primary-light)",
              padding: "12px",
              borderRadius: "14px",
              width: "fit-content",
            }}>
              <IoPieChartOutline size={28} />
            </div>
            <h3 style={{ fontSize: "18px" }}>Track Historical Trends</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
              Our charts capture price changes over time, helping you identify if a deal is actually a steal or just a minor discount.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
