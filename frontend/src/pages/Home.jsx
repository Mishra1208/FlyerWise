import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  IoSearchOutline, 
  IoGitCompareOutline, 
  IoWalletOutline,
  IoChevronDownOutline,
  IoChevronUpOutline,
  IoFlameOutline,
  IoSparklesOutline,
  IoArrowForwardOutline,
  IoShieldCheckmarkOutline
} from "react-icons/io5";
import SearchBar from "../components/SearchBar";
import SmartBasketOptimizer from "../components/SmartBasketOptimizer";
import { PriceService } from "../services/api";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

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
    { name: "Walmart", color: "#0071CE", tag: "Everyday Low Prices", logoUrl: "/logos/walmart.jpg", bg: "#EFF6FF" },
    { name: "Maxi", color: "#ED1C24", tag: "Quebec Discount Leader", logoUrl: "/logos/maxi.webp", bg: "#FEF2F2" },
    { name: "Metro", color: "#003DA5", tag: "Fresh Grocery Specials", logoUrl: "/logos/Metro.png", bg: "#EFF6FF" },
    { name: "IGA", color: "#E31837", tag: "Weekly Flyer Deals", logoUrl: "/logos/iga.png", bg: "#FEF2F2" },
    { name: "Super C", color: "#E30613", tag: "Low Price Guarantee", logoUrl: "/logos/super c.jpg", bg: "#FEF2F2" },
    { name: "Provigo", color: "#D32F2F", tag: "Quality Fresh Produce", logoUrl: "/logos/provigo.svg", bg: "#FEF2F2" },
    { name: "Costco Canada", color: "#0060A9", tag: "Bulk Warehouse Deals", logoUrl: "/logos/costco.png", bg: "#EFF6FF" },
    { name: "Adonis", color: "#16A34A", tag: "Fresh Mediterranean", logoUrl: "/logos/adonis.png", bg: "#F0FDF4" },
  ];

  // 10 Fruits & Veggies Lottie Animations
  const quickCategories = [
    { label: "Fresh Produce", q: "tomatoes", lottie: "https://lottie.host/509d2a12-45cc-465a-9d82-4b81de56c0be/ZDfdiZjsbN.lottie" },
    { label: "Organic Fruits", q: "apple", lottie: "https://lottie.host/f6fa258a-bd79-45f3-8f14-8123528a082d/uzg1C6ki2P.lottie" },
    { label: "Butter & Dairy", q: "butter", lottie: "https://lottie.host/736e3a5f-9eab-4b8b-866b-0301872e4c92/DjbQDgGUSm.lottie" },
    { label: "Fresh Meat", q: "chicken", lottie: "https://lottie.host/92d696d2-b442-4531-af85-bc26da4105be/CZeRANbEKU.lottie" },
    { label: "Milk 2L/4L", q: "milk", lottie: "https://lottie.host/b250f70e-9ec3-4b7b-83a9-22ee0c19952c/Q30ro18tYT.lottie" },
    { label: "Bakery & Bread", q: "bread", lottie: "https://lottie.host/6cc4d42e-70fd-4a7b-914c-22b6227d680b/sRZPkK3QXg.lottie" },
    { label: "Avocado Deals", q: "avocado", lottie: "https://lottie.host/7f4ee346-8e31-4369-9277-de3f2666b452/DKneUmOobC.lottie" },
    { label: "Juices & Drinks", q: "juice", lottie: "https://lottie.host/fdc237a6-71ca-4308-a2eb-eae296ee7bf8/mtUg2aUeyR.lottie" },
    { label: "Cheese & Eggs", q: "cheese", lottie: "https://lottie.host/3649145a-4c15-4e5c-b05b-1c9ae0d4ebe1/8H8WGwkACi.lottie" },
    { label: "Hygiene & Care", q: "shampoo", lottie: "https://lottie.host/171de373-f7e4-43eb-8a58-6d5b0893e396/DRolnYC2cD.lottie" },
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
    <div style={{ display: "flex", flexDirection: "column", gap: "50px", paddingBottom: "80px", backgroundColor: "#F8FAFC" }}>
      
      {/* 1. CLEAN & AESTHETIC WHITE HERO BANNER SECTION */}
      <section style={{
        position: "relative",
        minHeight: "520px",
        background: "linear-gradient(180deg, #FFFFFF 0%, #F0FDF4 60%, #F8FAFC 100%)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        color: "#0F172A",
        textAlign: "center",
        padding: "70px 24px 100px 24px",
        borderBottom: "1px solid #E2E8F0"
      }}>
        {/* Subtle Ambient Radial Glows */}
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
          <div style={{
            position: "absolute",
            top: "-100px",
            left: "25%",
            width: "500px",
            height: "500px",
            background: "radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, rgba(255, 255, 255, 0) 70%)",
            borderRadius: "50%",
          }} />
          <div style={{
            position: "absolute",
            top: "-50px",
            right: "20%",
            width: "450px",
            height: "450px",
            background: "radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, rgba(255, 255, 255, 0) 70%)",
            borderRadius: "50%",
          }} />
        </div>

        {/* Floating Left Lottie Animation */}
        <div style={{
          position: "absolute",
          top: "15px",
          left: "20px",
          width: "240px",
          height: "240px",
          pointerEvents: "none",
          filter: "drop-shadow(0 12px 24px rgba(16,185,129,0.12))"
        }}>
          <DotLottieReact
            src="https://lottie.host/736e3a5f-9eab-4b8b-866b-0301872e4c92/DjbQDgGUSm.lottie"
            loop
            autoplay
          />
        </div>

        {/* Floating Right Lottie Animation */}
        <div style={{
          position: "absolute",
          top: "15px",
          right: "20px",
          width: "240px",
          height: "240px",
          pointerEvents: "none",
          filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.06))"
        }}>
          <DotLottieReact
            src="https://lottie.host/f6fa258a-bd79-45f3-8f14-8123528a082d/uzg1C6ki2P.lottie"
            loop
            autoplay
          />
        </div>

        <div style={{ maxWidth: "880px", width: "100%", display: "flex", flexDirection: "column", gap: "20px", zIndex: 2 }}>

          <h1 style={{
            fontSize: "54px",
            fontWeight: 900,
            color: "#0F172A",
            lineHeight: "1.12",
            letterSpacing: "-1.5px",
            fontFamily: "var(--font-headings)",
          }}>
            Compare Grocery Prices Instantly Across <span style={{
              color: "#059669"
            }}>60+ Canadian Retailers</span>
          </h1>

          <p style={{
            fontSize: "19px",
            color: "#475569",
            maxWidth: "700px",
            margin: "0 auto",
            lineHeight: "1.6",
            fontWeight: 500,
          }}>
            Never overpay at checkout. Search any product to compare flyer prices across Walmart, Maxi, Metro, IGA, Super C, Costco, and Provigo with AI basket optimization.
          </p>

          {/* Search bar */}
          <div style={{ maxWidth: "680px", width: "100%", margin: "8px auto 0 auto" }}>
            <SearchBar onSearch={handleSearch} />
          </div>

          {/* 10 ANIMATED FRUITS & VEGGIES CATEGORY CHIPS IN CLEAN STYLISH CARDS */}
          <div style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "10px",
            marginTop: "16px"
          }}>
            {quickCategories.map((cat) => (
              <button
                key={cat.q}
                onClick={() => handleSearch(cat.q)}
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#0F172A",
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E2E8F0",
                  padding: "7px 16px",
                  borderRadius: "24px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  transition: "all 0.25s ease",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#ECFDF5";
                  e.currentTarget.style.borderColor = "#10B981";
                  e.currentTarget.style.color = "#047857";
                  e.currentTarget.style.transform = "translateY(-3px) scale(1.03)";
                  e.currentTarget.style.boxShadow = "0 8px 20px rgba(16, 185, 129, 0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#FFFFFF";
                  e.currentTarget.style.borderColor = "#E2E8F0";
                  e.currentTarget.style.color = "#0F172A";
                  e.currentTarget.style.transform = "translateY(0) scale(1)";
                  e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.04)";
                }}
              >
                <div style={{ width: "24px", height: "24px", flexShrink: 0 }}>
                  <DotLottieReact src={cat.lottie} loop autoplay />
                </div>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 2. LIVE STATS STRIP CARD */}
      <div className="container" style={{ position: "relative", zIndex: 10, marginTop: "-55px" }}>
        <div style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid rgba(226, 232, 240, 0.9)",
          borderRadius: "24px",
          boxShadow: "0 20px 45px -10px rgba(15, 23, 42, 0.12)",
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          width: "100%",
          maxWidth: "980px",
          margin: "0 auto",
          padding: "24px 20px",
        }}>
          <div style={{ textAlign: "center", flex: 1, borderRight: "1px solid #E2E8F0", display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", padding: "0 10px" }}>
            <div style={{ width: "70px", height: "70px", flexShrink: 0 }}>
              <DotLottieReact
                src="https://lottie.host/7906886d-3553-4489-a88c-b0b1ccfaaafe/bU2n0WjiRD.lottie"
                loop
                autoplay
              />
            </div>
            <div style={{ textAlign: "left" }}>
              <h3 style={{ fontSize: "30px", color: "#0F172A", fontWeight: 900, margin: 0, fontFamily: "var(--font-headings)" }}>
                60+
              </h3>
              <span style={{ fontSize: "12px", color: "#64748B", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", marginTop: "4px", display: "block" }}>
                Major Grocery Stores
              </span>
            </div>
          </div>

          <div style={{ textAlign: "center", flex: 1, borderRight: "1px solid #E2E8F0", display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", padding: "0 10px" }}>
            <div style={{ width: "60px", height: "60px", flexShrink: 0 }}>
              <DotLottieReact
                src="https://lottie.host/161951b7-a350-418e-8406-1065b078174c/4g1Qifp1X3.lottie"
                loop
                autoplay
              />
            </div>
            <div style={{ textAlign: "left" }}>
              <h3 style={{ fontSize: "30px", color: "#0F172A", fontWeight: 900, margin: 0, fontFamily: "var(--font-headings)" }}>
                12,500+
              </h3>
              <span style={{ fontSize: "12px", color: "#64748B", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", marginTop: "4px", display: "block" }}>
                Flyer Items Scraped
              </span>
            </div>
          </div>

          <div style={{ textAlign: "center", flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", padding: "0 10px" }}>
            <div style={{ width: "65px", height: "65px", flexShrink: 0 }}>
              <DotLottieReact
                src="https://lottie.host/0219855b-c4b1-4784-a2ef-db2dbf026132/cSfJGDmo7C.lottie"
                loop
                autoplay
              />
            </div>
            <div style={{ textAlign: "left" }}>
              <h3 style={{ fontSize: "30px", color: "#059669", fontWeight: 900, margin: 0, fontFamily: "var(--font-headings)" }}>
                Up to $45/wk
              </h3>
              <span style={{ fontSize: "12px", color: "#047857", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", marginTop: "4px", display: "block" }}>
                Weekly Savings ($2,300/yr)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. RETAILERS BRANDING STYLISH CARDS WITH REAL STORE LOGOS */}
      <section className="container" style={{ marginTop: "10px" }}>
        <div style={{ textAlign: "center", marginBottom: "18px" }}>
          <span style={{ fontSize: "12px", fontWeight: 800, textTransform: "uppercase", color: "#64748B", letterSpacing: "1px" }}>
            INDEXING LIVE FLYERS ACROSS TOP CANADIAN RETAILERS
          </span>
        </div>

        <div style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "14px",
        }}>
          {majorRetailers.map((r) => (
            <div
              key={r.name}
              style={{
                backgroundColor: "#FFFFFF",
                border: `1.5px solid ${r.color}33`,
                borderRadius: "20px",
                padding: "12px 20px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                boxShadow: "0 4px 15px rgba(0, 0, 0, 0.03)",
                transition: "all 0.25s ease",
                cursor: "pointer",
              }}
              onClick={() => handleSearch(r.name.toLowerCase())}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-5px) scale(1.02)";
                e.currentTarget.style.boxShadow = `0 12px 25px ${r.color}25`;
                e.currentTarget.style.borderColor = r.color;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0) scale(1)";
                e.currentTarget.style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.03)";
                e.currentTarget.style.borderColor = `${r.color}33`;
              }}
            >
              <div style={{
                width: "48px",
                height: "48px",
                borderRadius: "14px",
                backgroundColor: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "6px",
                border: `1px solid ${r.color}30`,
                boxShadow: `0 2px 8px ${r.color}15`,
                overflow: "hidden",
                flexShrink: 0
              }}>
                <img 
                  src={r.logoUrl} 
                  alt={r.name} 
                  style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                />
              </div>

              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <strong style={{ fontSize: "15px", color: "#0F172A", fontWeight: 800 }}>{r.name}</strong>
                  <span style={{ fontSize: "9px", fontWeight: 800, color: r.color, backgroundColor: r.bg, padding: "1px 6px", borderRadius: "8px" }}>
                    ⚡ LIVE
                  </span>
                </div>
                <span style={{ fontSize: "11px", color: "#64748B", display: "block" }}>{r.tag}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. ULTRA-AESTHETIC AI BASKET SAVINGS SHOWCASE CARD */}
      <section className="container">
        <div style={{
          backgroundColor: "#FFFFFF",
          borderRadius: "28px",
          border: "1px solid rgba(16, 185, 129, 0.25)",
          padding: "40px",
          boxShadow: "0 20px 45px -10px rgba(16, 185, 129, 0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "32px",
          position: "relative",
          overflow: "hidden",
          background: "linear-gradient(135deg, #FFFFFF 0%, #F0FDF4 100%)"
        }}>
          {/* Left Column: AI Pitch & Live Example */}
          <div style={{ flex: "1 1 450px", display: "flex", flexDirection: "column", gap: "16px" }}>
            <span style={{
              fontSize: "11px",
              fontWeight: 800,
              color: "#059669",
              backgroundColor: "#D1FAE5",
              padding: "4px 12px",
              borderRadius: "20px",
              width: "fit-content",
              textTransform: "uppercase",
              letterSpacing: "1px",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px"
            }}>
              <IoSparklesOutline size={14} /> AI MULTI-STORE BASKET OPTIMIZER
            </span>

            <h2 style={{ fontSize: "32px", fontWeight: 900, color: "#0F172A", lineHeight: "1.2", fontFamily: "var(--font-headings)" }}>
              Save Up to <span style={{ color: "#059669" }}>$45/Week</span> with Smart Split Trips
            </h2>

            <p style={{ fontSize: "16px", color: "#475569", lineHeight: "1.6" }}>
              Don't buy all groceries at one store. FlyerWise analyzes your saved basket items and calculates the optimal 2-store split trip so you get maximum flyer discounts every week.
            </p>

            {/* Quick Live Preview Box */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "14px",
              marginTop: "8px"
            }}>
              <div style={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #E2E8F0",
                borderRadius: "16px",
                padding: "16px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.03)"
              }}>
                <span style={{ fontSize: "11px", color: "#64748B", fontWeight: 700, textTransform: "uppercase" }}>Single Store Trip</span>
                <h4 style={{ fontSize: "20px", color: "#0F172A", fontWeight: 900, margin: "4px 0 0 0" }}>$48.50 <span style={{ fontSize: "11px", color: "#94A3B8", fontWeight: 500 }}>(Maxi)</span></h4>
              </div>

              <div style={{
                backgroundColor: "#ECFDF5",
                border: "1.5px solid #10B981",
                borderRadius: "16px",
                padding: "16px",
                boxShadow: "0 4px 12px rgba(16,185,129,0.12)"
              }}>
                <span style={{ fontSize: "11px", color: "#047857", fontWeight: 800, textTransform: "uppercase" }}>⚡ AI 2-Store Split Trip</span>
                <h4 style={{ fontSize: "20px", color: "#047857", fontWeight: 900, margin: "4px 0 0 0" }}>$32.70 <span style={{ fontSize: "11px", color: "#059669", fontWeight: 700 }}>(Save $15.80)</span></h4>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", marginTop: "12px" }}>
              <button
                onClick={() => handleSearch("butter")}
                style={{
                  padding: "14px 28px",
                  borderRadius: "16px",
                  backgroundColor: "#059669",
                  color: "#FFFFFF",
                  fontWeight: 800,
                  fontSize: "15px",
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 8px 20px rgba(5, 150, 105, 0.25)",
                  transition: "all 0.25s ease",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#047857";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#059669";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <IoSearchOutline size={18} /> Start Comparing Flyer Prices
              </button>
            </div>
          </div>

          {/* Right Column: Animated Lottie Shopping Cart */}
          <div style={{
            flex: "0 0 240px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto"
          }}>
            <div style={{ width: "220px", height: "220px" }}>
              <DotLottieReact
                src="https://lottie.host/161951b7-a350-418e-8406-1065b078174c/4g1Qifp1X3.lottie"
                loop
                autoplay
              />
            </div>
          </div>
        </div>
      </section>

      {/* 5. 3D HOW IT WORKS SECTION WITH MAIN ANIMATIONS (SALE, SHOPPING CART, SAVING) */}
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
            EFFORTLESS 3-STEP AI PROCESS
          </span>
          <h2 style={{ fontSize: "38px", color: "#0F172A", fontWeight: 900, marginTop: "10px", fontFamily: "var(--font-headings)" }}>
            How FlyerWise Automates Your Savings
          </h2>
          <p style={{ color: "#64748B", fontSize: "17px", marginTop: "8px", maxWidth: "620px", margin: "8px auto 0 auto" }}>
            Experience real-time flyer price intelligence built specifically for Canadian grocery shoppers.
          </p>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "30px",
        }}>
          {/* STEP 1: SALE ANIMATION */}
          <div style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid rgba(220, 38, 38, 0.2)",
            borderRadius: "28px",
            padding: "36px 30px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            gap: "18px",
            boxShadow: "0 10px 30px rgba(220, 38, 38, 0.05)",
            position: "relative",
            overflow: "hidden",
            transition: "all 0.3s ease"
          }}>
            <span style={{
              fontSize: "11px",
              fontWeight: 800,
              color: "#DC2626",
              backgroundColor: "#FEE2E2",
              padding: "4px 12px",
              borderRadius: "12px",
              textTransform: "uppercase"
            }}>STEP 01</span>
            
            {/* LOTTIE ANIMATION (SALE) */}
            <div style={{ width: "160px", height: "160px" }}>
              <DotLottieReact
                src="https://lottie.host/b73f86a6-8461-4b09-a5e3-90ac2c64cc61/Th2SVDZUPv.lottie"
                loop
                autoplay
              />
            </div>

            <h3 style={{ fontSize: "22px", color: "#0F172A", fontWeight: 900, fontFamily: "var(--font-headings)" }}>
              1. Search Live Flyer Sales
            </h3>
            <p style={{ color: "#64748B", fontSize: "15px", lineHeight: "1.65" }}>
              Type any product (e.g. 'chicken', 'butter', 'shampoo') or scan a barcode. Our scrapers index live flyer offers from 60+ stores instantly.
            </p>
          </div>

          {/* STEP 2: SHOPPING CART ANIMATION */}
          <div style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid rgba(37, 99, 235, 0.2)",
            borderRadius: "28px",
            padding: "36px 30px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            gap: "18px",
            boxShadow: "0 10px 30px rgba(37, 99, 235, 0.05)",
            position: "relative",
            overflow: "hidden",
            transition: "all 0.3s ease"
          }}>
            <span style={{
              fontSize: "11px",
              fontWeight: 800,
              color: "#2563EB",
              backgroundColor: "#DBEAFE",
              padding: "4px 12px",
              borderRadius: "12px",
              textTransform: "uppercase"
            }}>STEP 02</span>

            {/* LOTTIE ANIMATION (SHOPPING CART) */}
            <div style={{ width: "160px", height: "160px" }}>
              <DotLottieReact
                src="https://lottie.host/161951b7-a350-418e-8406-1065b078174c/4g1Qifp1X3.lottie"
                loop
                autoplay
              />
            </div>

            <h3 style={{ fontSize: "22px", color: "#0F172A", fontWeight: 900, fontFamily: "var(--font-headings)" }}>
              2. Compare Store Prices
            </h3>
            <p style={{ color: "#64748B", fontSize: "15px", lineHeight: "1.65" }}>
              View side-by-side store price rankings for Walmart, Maxi, Metro, IGA, Super C, and Costco with glowing #1 cheapest price highlights.
            </p>
          </div>

          {/* STEP 3: SAVING ANIMATION */}
          <div style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid rgba(16, 185, 129, 0.2)",
            borderRadius: "28px",
            padding: "36px 30px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            gap: "18px",
            boxShadow: "0 10px 30px rgba(16, 185, 129, 0.05)",
            position: "relative",
            overflow: "hidden",
            transition: "all 0.3s ease"
          }}>
            <span style={{
              fontSize: "11px",
              fontWeight: 800,
              color: "#059669",
              backgroundColor: "#D1FAE5",
              padding: "4px 12px",
              borderRadius: "12px",
              textTransform: "uppercase"
            }}>STEP 03</span>

            {/* LOTTIE ANIMATION (SAVING) */}
            <div style={{ width: "160px", height: "160px" }}>
              <DotLottieReact
                src="https://lottie.host/0219855b-c4b1-4784-a2ef-db2dbf026132/cSfJGDmo7C.lottie"
                loop
                autoplay
              />
            </div>

            <h3 style={{ fontSize: "22px", color: "#0F172A", fontWeight: 900, fontFamily: "var(--font-headings)" }}>
              3. Maximize Annual Savings
            </h3>
            <p style={{ color: "#64748B", fontSize: "15px", lineHeight: "1.65" }}>
              Our AI calculates single-store vs 2-store split trip combinations and Canadian sales taxes so you keep up to $2,300/year in your pocket.
            </p>
          </div>
        </div>
      </section>

      {/* 6. FEATURED DEALS SECTION */}
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

      {/* 7. FAQ ACCORDION SECTION */}
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
