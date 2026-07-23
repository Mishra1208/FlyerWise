import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  IoSearchOutline, 
  IoGitCompareOutline, 
  IoWalletOutline,
  IoCheckmarkCircleOutline,
  IoChevronDownOutline,
  IoChevronUpOutline,
  IoFlameOutline,
  IoSparklesOutline,
  IoCartOutline,
  IoFlashOutline,
  IoStorefrontOutline,
  IoShieldCheckmarkOutline,
  IoArrowForwardOutline
} from "react-icons/io5";
import SearchBar from "../components/SearchBar";
import SmartBasketOptimizer from "../components/SmartBasketOptimizer";
import { PriceService } from "../services/api";

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

  const majorRetailers = [
    { name: "Walmart", color: "#0071CE", tag: "Everyday Low Prices" },
    { name: "Maxi", color: "#ED1C24", tag: "Quebec Discount Leader" },
    { name: "Metro", color: "#003DA5", tag: "Fresh Grocery Specials" },
    { name: "IGA", color: "#E31837", tag: "Weekly Flyer Deals" },
    { name: "Super C", color: "#E30613", tag: "Low Price Guarantee" },
    { name: "Provigo", color: "#D32F2F", tag: "Quality Fresh Produce" },
    { name: "Costco Canada", color: "#0060A9", tag: "Bulk Warehouse Deals" },
  ];

  const quickCategories = [
    { label: "🥩 Chicken & Meat", q: "chicken" },
    { label: "🧈 Butter & Dairy", q: "butter" },
    { label: "🥛 Milk 2L/4L", q: "milk" },
    { label: "🥑 Fresh Produce", q: "avocado" },
    { label: "🍞 Bread & Bakery", q: "bread" },
    { label: "🧴 Shampoos & Care", q: "shampoo" },
  ];

  const faqData = [
    {
      q: "How does FlyerWise differ from Flipp?",
      a: "While Flipp lists static PDFs and requires manual page turning, FlyerWise uses AI automation to index individual product prices side-by-side across 60+ retailers (Walmart, Maxi, Metro, IGA, Super C, Costco, Provigo). We automatically highlight the #1 lowest price and compute smart multi-store split trip savings."
    },
    {
      q: "Are Costco Canada deals included?",
      a: "Yes! FlyerWise indexes live Costco Canada warehouse coupons and prices alongside standard grocery chains, letting you compare unit costs between Costco bulk packaging and weekly supermarket sales."
    },
    {
      q: "How often is the flyer data updated?",
      a: "FlyerWise scrapers run every Wednesday night and Thursday morning as new flyer cycles go live across Quebec and Canadian provinces."
    },
    {
      q: "Is FlyerWise free to use?",
      a: "Yes! FlyerWise is 100% free with no subscription required."
    }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "90px", paddingBottom: "80px", backgroundColor: "#F8FAFC" }}>
      
      {/* 1. ULTRA-PREMIUM HERO BANNER SECTION */}
      <section style={{
        position: "relative",
        minHeight: "600px",
        background: "linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        color: "#FFFFFF",
        textAlign: "center",
        padding: "80px 24px 100px 24px",
        overflow: "hidden",
      }}>
        {/* Animated background ambient glow spots */}
        <div style={{
          position: "absolute",
          top: "-150px",
          left: "20%",
          width: "500px",
          height: "500px",
          background: "radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, rgba(15, 23, 42, 0) 70%)",
          borderRadius: "50%",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute",
          bottom: "-100px",
          right: "15%",
          width: "450px",
          height: "450px",
          background: "radial-gradient(circle, rgba(59, 130, 246, 0.12) 0%, rgba(15, 23, 42, 0) 70%)",
          borderRadius: "50%",
          pointerEvents: "none",
        }} />

        <div style={{ maxWidth: "860px", width: "100%", display: "flex", flexDirection: "column", gap: "24px", zIndex: 2 }}>
          
          {/* Glowing Live Pulse Badge */}
          <span style={{
            fontSize: "12px",
            fontWeight: 800,
            color: "#10B981",
            backgroundColor: "rgba(16, 185, 129, 0.12)",
            border: "1px solid rgba(16, 185, 129, 0.3)",
            padding: "6px 18px",
            borderRadius: "30px",
            width: "fit-content",
            margin: "0 auto",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            boxShadow: "0 0 20px rgba(16, 185, 129, 0.2)",
            letterSpacing: "0.5px",
            textTransform: "uppercase"
          }}>
            <span style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: "#10B981",
              boxShadow: "0 0 10px #10B981",
              animation: "pulse 1.5s infinite"
            }} />
            ⚡ 12,500+ Live Weekly Flyer Deals Indexed
          </span>

          <h1 style={{
            fontSize: "52px",
            fontWeight: 900,
            color: "#FFFFFF",
            lineHeight: "1.12",
            letterSpacing: "-1.5px",
            fontFamily: "var(--font-headings)",
          }}>
            Compare Grocery Prices Instantly Across <span style={{
              background: "linear-gradient(135deg, #10B981 0%, #34D399 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}>60+ Canadian Retailers</span>
          </h1>

          <p style={{
            fontSize: "19px",
            color: "#94A3B8",
            maxWidth: "680px",
            margin: "0 auto",
            lineHeight: "1.6",
            fontWeight: 400,
          }}>
            Never overpay at checkout. Search any product to compare flyer prices across Walmart, Maxi, Metro, IGA, Super C, Costco, and Provigo with AI basket optimization.
          </p>

          {/* Search bar inside hero */}
          <div style={{ maxWidth: "660px", width: "100%", margin: "10px auto 0 auto" }}>
            <SearchBar onSearch={handleSearch} />
          </div>

          {/* Quick Category Chips */}
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "10px", marginTop: "10px" }}>
            {quickCategories.map((cat) => (
              <button
                key={cat.q}
                onClick={() => handleSearch(cat.q)}
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#CBD5E1",
                  backgroundColor: "rgba(255, 255, 255, 0.06)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  padding: "6px 14px",
                  borderRadius: "20px",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  backdropFilter: "blur(4px)"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(16, 185, 129, 0.2)";
                  e.currentTarget.style.borderColor = "#10B981";
                  e.currentTarget.style.color = "#FFFFFF";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.06)";
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.12)";
                  e.currentTarget.style.color = "#CBD5E1";
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* UPDATED STATS STRIP CARD */}
        <div style={{
          position: "absolute",
          bottom: "-50px",
          left: "50%",
          transform: "translateX(-50%)",
          backgroundColor: "#FFFFFF",
          border: "1px solid rgba(226, 232, 240, 0.8)",
          borderRadius: "24px",
          boxShadow: "0 20px 45px -10px rgba(15, 23, 42, 0.12)",
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          width: "calc(100% - 48px)",
          maxWidth: "960px",
          padding: "28px 16px",
          zIndex: 10,
        }}>
          <div style={{ textAlign: "center", flex: 1, borderRight: "1px solid #E2E8F0" }}>
            <h3 style={{ fontSize: "32px", color: "#0F172A", fontWeight: 900, margin: 0, fontFamily: "var(--font-headings)" }}>
              60+
            </h3>
            <span style={{ fontSize: "13px", color: "#64748B", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", marginTop: "4px", display: "block" }}>
              Major Grocery Stores
            </span>
          </div>

          <div style={{ textAlign: "center", flex: 1, borderRight: "1px solid #E2E8F0" }}>
            <h3 style={{ fontSize: "32px", color: "#0F172A", fontWeight: 900, margin: 0, fontFamily: "var(--font-headings)" }}>
              12,500+
            </h3>
            <span style={{ fontSize: "13px", color: "#64748B", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", marginTop: "4px", display: "block" }}>
              Flyer Items Scraped
            </span>
          </div>

          <div style={{ textAlign: "center", flex: 1 }}>
            <h3 style={{ fontSize: "32px", color: "#059669", fontWeight: 900, margin: 0, fontFamily: "var(--font-headings)" }}>
              Up to $45/wk
            </h3>
            <span style={{ fontSize: "13px", color: "#047857", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", marginTop: "4px", display: "block" }}>
              Weekly Savings Potential ($2,300/yr)
            </span>
          </div>
        </div>
      </section>

      {/* Spacer for overlapping stats strip */}
      <div style={{ height: "40px" }}></div>

      {/* 2. RETAILERS BRANDING LOGO STRIP */}
      <section className="container">
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <span style={{ fontSize: "12px", fontWeight: 800, textTransform: "uppercase", color: "#64748B", letterSpacing: "1px" }}>
            INDEXING LIVE FLYERS ACROSS TOP CANADIAN CHAINS
          </span>
        </div>

        <div style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "16px",
        }}>
          {majorRetailers.map((r) => (
            <div
              key={r.name}
              style={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #E2E8F0",
                borderRadius: "16px",
                padding: "14px 22px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.02)",
                transition: "all 0.25s ease",
                cursor: "pointer",
              }}
              onClick={() => handleSearch(r.name.toLowerCase())}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.06)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.02)";
              }}
            >
              <span style={{
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                backgroundColor: r.color,
                boxShadow: `0 0 8px ${r.color}66`
              }} />
              <div>
                <strong style={{ fontSize: "15px", color: "#0F172A", fontWeight: 800 }}>{r.name}</strong>
                <span style={{ fontSize: "11px", color: "#64748B", display: "block" }}>{r.tag}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. SMART BASKET OPTIMIZER SECTION */}
      <section className="container">
        <SmartBasketOptimizer />
      </section>

      {/* 4. 3D HOW IT WORKS SECTION */}
      <section id="how-it-works" className="container" style={{ scrollMarginTop: "100px" }}>
        <div style={{ textAlign: "center", marginBottom: "50px" }}>
          <span style={{
            fontSize: "12px",
            fontWeight: 800,
            textTransform: "uppercase",
            color: "#059669",
            backgroundColor: "#D1FAE5",
            padding: "4px 14px",
            borderRadius: "20px",
            letterSpacing: "1px"
          }}>
            EFFORTLESS 3-STEP PROCESS
          </span>
          <h2 style={{ fontSize: "36px", color: "#0F172A", fontWeight: 900, marginTop: "10px", fontFamily: "var(--font-headings)" }}>
            How FlyerWise Saves You Money
          </h2>
          <p style={{ color: "#64748B", fontSize: "17px", marginTop: "8px", maxWidth: "600px", margin: "8px auto 0 auto" }}>
            Stop browsing endless PDF flyers manually. Let AI find the exact lowest price for every grocery item in seconds.
          </p>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "30px",
        }}>
          {/* Step 1 */}
          <div style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E2E8F0",
            borderRadius: "24px",
            padding: "36px 30px",
            display: "flex",
            flexDirection: "column",
            gap: "18px",
            boxShadow: "0 10px 30px rgba(15, 23, 42, 0.04)",
            position: "relative",
            overflow: "hidden"
          }}>
            <span style={{
              fontSize: "48px",
              fontWeight: 900,
              color: "rgba(16, 185, 129, 0.15)",
              position: "absolute",
              top: "20px",
              right: "24px"
            }}>01</span>
            <div style={{
              backgroundColor: "rgba(16, 185, 129, 0.1)",
              color: "#059669",
              padding: "16px",
              borderRadius: "16px",
              width: "fit-content",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <IoSearchOutline size={28} />
            </div>
            <h3 style={{ fontSize: "20px", color: "#0F172A", fontWeight: 800, fontFamily: "var(--font-headings)" }}>
              1. Search Any Grocery Item
            </h3>
            <p style={{ color: "#64748B", fontSize: "15px", lineHeight: "1.65" }}>
              Type any product (e.g. 'chicken', 'butter', 'shampoo') or scan a barcode. Our engine retrieves active flyer deals from 60+ stores instantly.
            </p>
          </div>

          {/* Step 2 */}
          <div style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E2E8F0",
            borderRadius: "24px",
            padding: "36px 30px",
            display: "flex",
            flexDirection: "column",
            gap: "18px",
            boxShadow: "0 10px 30px rgba(15, 23, 42, 0.04)",
            position: "relative",
            overflow: "hidden"
          }}>
            <span style={{
              fontSize: "48px",
              fontWeight: 900,
              color: "rgba(16, 185, 129, 0.15)",
              position: "absolute",
              top: "20px",
              right: "24px"
            }}>02</span>
            <div style={{
              backgroundColor: "rgba(59, 130, 246, 0.1)",
              color: "#2563EB",
              padding: "16px",
              borderRadius: "16px",
              width: "fit-content",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <IoGitCompareOutline size={28} />
            </div>
            <h3 style={{ fontSize: "20px", color: "#0F172A", fontWeight: 800, fontFamily: "var(--font-headings)" }}>
              2. Compare Store Prices
            </h3>
            <p style={{ color: "#64748B", fontSize: "15px", lineHeight: "1.65" }}>
              View side-by-side store price rankings for Walmart, Maxi, Metro, IGA, Super C, and Costco with glowing #1 cheapest price badges.
            </p>
          </div>

          {/* Step 3 */}
          <div style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E2E8F0",
            borderRadius: "24px",
            padding: "36px 30px",
            display: "flex",
            flexDirection: "column",
            gap: "18px",
            boxShadow: "0 10px 30px rgba(15, 23, 42, 0.04)",
            position: "relative",
            overflow: "hidden"
          }}>
            <span style={{
              fontSize: "48px",
              fontWeight: 900,
              color: "rgba(16, 185, 129, 0.15)",
              position: "absolute",
              top: "20px",
              right: "24px"
            }}>03</span>
            <div style={{
              backgroundColor: "rgba(245, 158, 11, 0.1)",
              color: "#D97706",
              padding: "16px",
              borderRadius: "16px",
              width: "fit-content",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <IoWalletOutline size={28} />
            </div>
            <h3 style={{ fontSize: "20px", color: "#0F172A", fontWeight: 800, fontFamily: "var(--font-headings)" }}>
              3. Smart Basket Optimization
            </h3>
            <p style={{ color: "#64748B", fontSize: "15px", lineHeight: "1.65" }}>
              Our AI calculates single-store vs 2-store split trip combinations and Canadian sales taxes so you keep up to $2,300/year in your pocket.
            </p>
          </div>
        </div>
      </section>

      {/* 5. FEATURED DEALS SECTION */}
      <section id="featured-deals" className="container" style={{ scrollMarginTop: "100px" }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginBottom: "36px",
          flexWrap: "wrap",
          gap: "16px"
        }}>
          <div>
            <span style={{
              fontSize: "12px",
              fontWeight: 800,
              textTransform: "uppercase",
              color: "#DC2626",
              backgroundColor: "#FEE2E2",
              padding: "4px 14px",
              borderRadius: "20px",
              letterSpacing: "1px"
            }}>
              🔥 HOT DEALS THIS WEEK
            </span>
            <h2 style={{ fontSize: "36px", color: "#0F172A", fontWeight: 900, marginTop: "10px", fontFamily: "var(--font-headings)", display: "flex", alignItems: "center", gap: "10px" }}>
              <span>Weekly Top Featured Discounts</span>
            </h2>
            <p style={{ color: "#64748B", fontSize: "16px", marginTop: "6px" }}>Highest percentage discounts verified across active flyers.</p>
          </div>

          <button
            onClick={() => navigate("/search?q=butter")}
            style={{
              padding: "10px 20px",
              borderRadius: "12px",
              backgroundColor: "#FFFFFF",
              border: "1px solid #CBD5E1",
              color: "#0F172A",
              fontWeight: 700,
              fontSize: "14px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              transition: "all 0.2s ease"
            }}
          >
            Explore All Deals <IoArrowForwardOutline />
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", color: "#64748B", padding: "40px 0" }}>Loading current top deals...</div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))",
            gap: "24px",
          }}>
            {deals.map((deal) => (
              <div 
                key={deal.price.id} 
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: "20px",
                  border: "1px solid #E2E8F0",
                  padding: "22px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  height: "100%",
                  position: "relative",
                  boxShadow: "0 4px 15px rgba(0, 0, 0, 0.03)",
                  transition: "all 0.25s ease",
                  cursor: "pointer"
                }}
                onClick={() => navigate(`/search?q=${encodeURIComponent(deal.product.raw_name.split(" ")[0])}`)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 12px 30px rgba(0,0,0,0.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.03)";
                }}
              >
                {/* Discount Percentage Badge */}
                {deal.discount_percentage && (
                  <div 
                    style={{
                      position: "absolute",
                      top: "16px",
                      right: "16px",
                      fontSize: "12px",
                      fontWeight: 800,
                      color: "#FFFFFF",
                      backgroundColor: "#DC2626",
                      padding: "4px 10px",
                      borderRadius: "12px",
                      boxShadow: "0 4px 10px rgba(220, 38, 38, 0.3)"
                    }}
                  >
                    -{Math.round(deal.discount_percentage)}% OFF
                  </div>
                )}

                {/* Product Detail info */}
                <div>
                  <div style={{
                    width: "80px",
                    height: "80px",
                    backgroundColor: "#FFFFFF",
                    borderRadius: "14px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "8px",
                    marginBottom: "16px",
                    border: "1px solid #E2E8F0",
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
                    <span style={{ fontSize: "11px", color: "#059669", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.5px" }}>{deal.product.brand}</span>
                  )}
                  <h3 style={{
                    fontSize: "16px",
                    fontWeight: 800,
                    color: "#0F172A",
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
                  alignItems: "flex-end",
                  borderTop: "1px solid #F1F5F9",
                  paddingTop: "14px",
                }}>
                  <div>
                    <span style={{
                      fontSize: "12px",
                      color: "#94A3B8",
                      textDecoration: "line-through",
                      display: "block",
                    }}>${parseFloat(deal.price.original_price).toFixed(2)}</span>
                    <span style={{
                      fontSize: "20px",
                      fontWeight: 900,
                      color: "#047857",
                    }}>${parseFloat(deal.price.current_price).toFixed(2)}</span>
                  </div>

                  <span style={{
                    fontSize: "11px",
                    fontWeight: 800,
                    color: "#FFFFFF",
                    backgroundColor: deal.price.store.color || "#0F172A",
                    padding: "4px 10px",
                    borderRadius: "8px",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}>{deal.price.store.name}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 6. FAQ ACCORDION SECTION */}
      <section id="faq" className="container" style={{ scrollMarginTop: "100px" }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h2 style={{ fontSize: "32px", color: "#0F172A", fontWeight: 900, fontFamily: "var(--font-headings)" }}>Frequently Asked Questions</h2>
          <p style={{ color: "#64748B", fontSize: "16px", marginTop: "8px" }}>Quick answers to how FlyerWise automates your weekly grocery savings.</p>
        </div>

        <div style={{ maxWidth: "800px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "14px" }}>
          {faqData.map((item, idx) => (
            <div key={idx} style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "16px",
              border: "1px solid #E2E8F0",
              overflow: "hidden",
              boxShadow: "0 2px 6px rgba(0,0,0,0.02)"
            }}>
              <button 
                onClick={() => toggleFaq(idx)} 
                style={{
                  width: "100%",
                  padding: "20px 24px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  backgroundColor: "#FFFFFF",
                  border: "none",
                  fontSize: "16px",
                  fontWeight: 800,
                  color: "#0F172A",
                  cursor: "pointer",
                  textAlign: "left"
                }}
              >
                <span>{item.q}</span>
                {faqOpen[idx] ? <IoChevronUpOutline size={20} color="#059669" /> : <IoChevronDownOutline size={20} color="#64748B" />}
              </button>
              {faqOpen[idx] && (
                <div style={{
                  padding: "0 24px 20px 24px",
                  fontSize: "14px",
                  lineHeight: "1.65",
                  color: "#475569",
                  borderTop: "1px solid #F1F5F9",
                  paddingTop: "16px"
                }}>
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
