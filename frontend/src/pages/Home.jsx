import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  IoTrendingUpOutline, 
  IoSearchOutline, 
  IoGitCompareOutline, 
  IoWalletOutline,
  IoCheckmarkCircleOutline,
  IoChevronDownOutline,
  IoChevronUpOutline,
  IoFlameOutline
} from "react-icons/io5";
import SearchBar from "../components/SearchBar";
import SmartBasketOptimizer from "../components/SmartBasketOptimizer";
import { PriceService } from "../services/api";
import heroBanner from "../assets/hero_banner.png";
import whyFlyerwise from "../assets/why_flyerwise.png";

export default function Home() {
  const navigate = useNavigate();
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [faqOpen, setFaqOpen] = useState({});

  const handleSearch = (query) => {
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  const toggleFaq = (index) => {
    setFaqOpen((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
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

  const faqData = [
    {
      q: "How does FlyerWise differ from Flipp?",
      a: "While Flipp lists individual flyers and forces you to browse store-by-store to compare, FlyerWise does the heavy lifting for you. Simply search a product (like 'tomato'), and we retrieve prices from all local flyers side-by-side, instantly highlighting the store offering the lowest price."
    },
    {
      q: "How often is the grocery flyer data updated?",
      a: "FlyerWise runs automated scrapers every week to catch the newest flyer cycles. Whenever stores like Walmart, Maxi, or Metro release their latest discounts, FlyerWise updates its database so you're always seeing real-time live prices."
    },
    {
      q: "Can I use FlyerWise in other locations?",
      a: "Currently, FlyerWise is optimized for Quebec (specifically postcode H4G 2Y5 in Montreal) listing Walmart, Maxi, and Metro. We are expanding to support customizable locations and more grocery retailers very soon."
    },
    {
      q: "Is FlyerWise free to use?",
      a: "Yes! FlyerWise is 100% free. It is developed as an open-source tool to help shoppers save money on their weekly grocery checkout."
    }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "90px", paddingBottom: "80px" }}>
      {/* 1. HERO BANNER SECTION */}
      <section style={{
        position: "relative",
        height: "560px",
        backgroundImage: `linear-gradient(rgba(27, 54, 93, 0.75), rgba(27, 54, 93, 0.75)), url(${heroBanner})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        color: "#FFFFFF",
        textAlign: "center",
        padding: "0 24px",
      }}>
        <div style={{ maxWidth: "800px", width: "100%", display: "flex", flexDirection: "column", gap: "20px" }}>
          <span style={{
            textTransform: "uppercase",
            fontSize: "12px",
            fontWeight: 800,
            letterSpacing: "2px",
            color: "var(--accent)",
            backgroundColor: "rgba(91, 140, 81, 0.15)",
            padding: "6px 16px",
            borderRadius: "var(--radius-full)",
            width: "fit-content",
            margin: "0 auto",
            border: "1px solid rgba(91, 140, 81, 0.3)",
          }}>
            Smart Price Comparison
          </span>
          <h1 style={{
            fontSize: "46px",
            fontWeight: 800,
            color: "#FFFFFF",
            lineHeight: "1.15",
            letterSpacing: "-1px",
          }}>
            Compare Grocery Prices Instantly
          </h1>
          <p style={{
            fontSize: "18px",
            color: "rgba(255, 255, 255, 0.85)",
            maxWidth: "600px",
            margin: "0 auto 10px auto",
            fontWeight: 400,
          }}>
            Search any product and compare flyer deals across Walmart, Maxi, and Metro to find the absolute lowest price.
          </p>

          {/* Search bar inside hero banner */}
          <div style={{ maxWidth: "600px", width: "100%", margin: "0 auto" }}>
            <SearchBar onSearch={handleSearch} />
          </div>
        </div>

        {/* Stats Strip */}
        <div style={{
          position: "absolute",
          bottom: "-40px",
          left: "50%",
          transform: "translateX(-50%)",
          backgroundColor: "#FFFFFF",
          border: "1px solid var(--border-color)",
          borderRadius: "var(--radius-md)",
          boxShadow: "var(--shadow-md)",
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          width: "calc(100% - 48px)",
          maxWidth: "900px",
          padding: "24px 10px",
          zIndex: 10,
        }}>
          <div style={{ textAlign: "center", flex: 1, borderRight: "1px solid var(--border-color)" }}>
            <h3 style={{ fontSize: "24px", color: "var(--primary)", fontWeight: 800 }}>3+</h3>
            <span style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: 500 }}>Major Grocery Stores</span>
          </div>
          <div style={{ textAlign: "center", flex: 1, borderRight: "1px solid var(--border-color)" }}>
            <h3 style={{ fontSize: "24px", color: "var(--primary)", fontWeight: 800 }}>1,000+</h3>
            <span style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: 500 }}>Flyer Items Scraped</span>
          </div>
          <div style={{ textAlign: "center", flex: 1 }}>
            <h3 style={{ fontSize: "24px", color: "var(--accent-hover)", fontWeight: 800 }}>Up to 40%</h3>
            <span style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: 500 }}>Weekly Savings Potential</span>
          </div>
        </div>
      </section>

      {/* Spacer to account for overlay stats strip */}
      <div style={{ height: "40px" }}></div>

      {/* SMART BASKET OPTIMIZER SECTION */}
      <section className="container">
        <SmartBasketOptimizer />
      </section>

      {/* 2. HOW IT WORKS SECTION */}
      <section id="how-it-works" className="container" style={{ scrollMarginTop: "100px" }}>
        <div style={{ textAlign: "center", marginBottom: "50px" }}>
          <h2 style={{ fontSize: "30px", color: "var(--primary)", fontWeight: 700 }}>How FlyerWise Works</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "16px", marginTop: "8px" }}>Compare and save on weekly groceries in three simple steps.</p>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "30px",
        }}>
          {/* Step 1 */}
          <div className="card" style={{ padding: "30px", display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{
              backgroundColor: "rgba(27, 54, 93, 0.05)",
              color: "var(--primary)",
              padding: "14px",
              borderRadius: "12px",
              width: "fit-content",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <IoSearchOutline size={26} />
            </div>
            <h3 style={{ fontSize: "18px", color: "var(--primary)" }}>1. Search Grocery Products</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "14px", lineHeight: "1.6" }}>
              Enter any grocery item like 'tomato' or 'milk' in our search engine. We pull fresh data directly from all current flyers.
            </p>
          </div>

          {/* Step 2 */}
          <div className="card" style={{ padding: "30px", display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{
              backgroundColor: "rgba(91, 140, 81, 0.08)",
              color: "var(--accent)",
              padding: "14px",
              borderRadius: "12px",
              width: "fit-content",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <IoGitCompareOutline size={26} />
            </div>
            <h3 style={{ fontSize: "18px", color: "var(--primary)" }}>2. Compare Store Prices</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "14px", lineHeight: "1.6" }}>
              FlyerWise aggregates and lists flyer prices for Maxi, Walmart, and Metro side-by-side, immediately highlighting the lowest deal.
            </p>
          </div>

          {/* Step 3 */}
          <div className="card" style={{ padding: "30px", display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{
              backgroundColor: "rgba(229, 62, 62, 0.05)",
              color: "var(--accent-red)",
              padding: "14px",
              borderRadius: "12px",
              width: "fit-content",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <IoWalletOutline size={26} />
            </div>
            <h3 style={{ fontSize: "18px", color: "var(--primary)" }}>3. Save Money</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "14px", lineHeight: "1.6" }}>
              Plan your shopping list strategically, shop at the store with the best bargains, and keep your hard-earned money in your pocket.
            </p>
          </div>
        </div>
      </section>

      {/* 3. FEATURED DEALS SECTION */}
      <section id="featured-deals" className="container" style={{ scrollMarginTop: "100px" }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginBottom: "36px",
        }}>
          <div>
            <h2 style={{ fontSize: "30px", color: "var(--primary)", fontWeight: 700, display: "flex", alignItems: "center", gap: "10px" }}>
              <IoFlameOutline style={{ color: "var(--accent-red)" }} />
              <span>Weekly Featured Discounts</span>
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "16px", marginTop: "6px" }}>Some of the highest percentage off discounts matching active flyers.</p>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "40px 0" }}>Loading current top deals...</div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: "24px",
          }}>
            {deals.map((deal) => (
              <div 
                key={deal.price.id} 
                className="card"
                style={{
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  height: "100%",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Discount Percentage Badge */}
                {deal.discount_percentage && (
                  <div 
                    className="badge badge-deal"
                    style={{
                      position: "absolute",
                      top: "12px",
                      right: "12px",
                      fontSize: "11px",
                    }}
                  >
                    -{Math.round(deal.discount_percentage)}%
                  </div>
                )}

                {/* Product Detail info */}
                <div>
                  <div style={{
                    width: "70px",
                    height: "70px",
                    backgroundColor: "#F8FAFC",
                    borderRadius: "var(--radius-sm)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "6px",
                    marginBottom: "16px",
                    border: "1px solid rgba(0,0,0,0.03)",
                  }}>
                    <img 
                      src={deal.product.image_url || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=100"} 
                      alt={deal.product.raw_name}
                      style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                      onError={(e) => {
                        e.target.src = "https://images.unsplash.com/photo-1542838132-92c53300491e?w=100";
                      }}
                    />
                  </div>
                  {deal.product.brand && (
                    <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>{deal.product.brand}</span>
                  )}
                  <h3 style={{
                    fontSize: "15px",
                    fontWeight: 700,
                    color: "var(--text-primary)",
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
                  borderTop: "1px solid var(--border-color)",
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
                      color: "var(--accent-hover)",
                    }}>${parseFloat(deal.price.current_price).toFixed(2)}</span>
                  </div>

                  <span style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#FFFFFF",
                    backgroundColor: deal.price.store.color || "var(--primary)",
                    padding: "4px 10px",
                    borderRadius: "4px",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}>{deal.price.store.name}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. WHY FLYERWISE SECTION */}
      <section style={{ backgroundColor: "#FFFFFF", padding: "80px 0", borderTop: "1px solid var(--border-color)", borderBottom: "1px solid var(--border-color)" }}>
        <div className="container" style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "50px",
          alignItems: "center",
        }}>
          {/* Left image column */}
          <div style={{
            borderRadius: "var(--radius-lg)",
            overflow: "hidden",
            boxShadow: "var(--shadow-md)",
            border: "1px solid var(--border-color)",
          }}>
            <img 
              src={whyFlyerwise} 
              alt="Grocery Shopper" 
              style={{ width: "100%", height: "auto", display: "block" }}
            />
          </div>

          {/* Right text column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <span style={{
              color: "var(--accent-hover)",
              fontSize: "12px",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "1.5px",
            }}>Premium Savings Platform</span>
            <h2 style={{ fontSize: "32px", color: "var(--primary)", fontWeight: 700, lineHeight: "1.2" }}>
              Get More Out of Your Weekly Budget
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "16px", lineHeight: "1.7" }}>
              We understand the frustration of switching back and forth between multiple flyer apps. FlyerWise simplifies your grocery runs, ensuring you get the absolute best deals locally.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "10px" }}>
              <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                <IoCheckmarkCircleOutline size={22} style={{ color: "var(--accent)", flexShrink: 0 }} />
                <span style={{ color: "var(--text-primary)", fontSize: "15px", fontWeight: 500 }}>
                  <strong>Side-by-Side Comparison:</strong> Instantly view Walmart, Maxi, and Metro price listings.
                </span>
              </div>
              <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                <IoCheckmarkCircleOutline size={22} style={{ color: "var(--accent)", flexShrink: 0 }} />
                <span style={{ color: "var(--text-primary)", fontSize: "15px", fontWeight: 500 }}>
                  <strong>Automatic Price Highlights:</strong> The absolute lowest price is visually colored.
                </span>
              </div>
              <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                <IoCheckmarkCircleOutline size={22} style={{ color: "var(--accent)", flexShrink: 0 }} />
                <span style={{ color: "var(--text-primary)", fontSize: "15px", fontWeight: 500 }}>
                  <strong>Price Trend Tracking:</strong> Visual line charts to verify historical flyer pricing.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FAQ ACCORDION SECTION */}
      <section id="faq" className="container" style={{ scrollMarginTop: "100px" }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h2 style={{ fontSize: "30px", color: "var(--primary)", fontWeight: 700 }}>Frequently Asked Questions</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "16px", marginTop: "8px" }}>Get quick answers to how FlyerWise handles flyer prices.</p>
        </div>

        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          {faqData.map((item, idx) => (
            <div key={idx} className="faq-item">
              <button 
                onClick={() => toggleFaq(idx)} 
                className="faq-trigger"
              >
                <span>{item.q}</span>
                {faqOpen[idx] ? <IoChevronUpOutline size={18} /> : <IoChevronDownOutline size={18} />}
              </button>
              {faqOpen[idx] && (
                <div className="faq-content animate-fade">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
