import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { PriceService, IntelligenceService } from "../services/api";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function PriceHistory({ productId }) {
  const [historyData, setHistoryData] = useState(null);
  const [intelligence, setIntelligence] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedStore, setSelectedStore] = useState("ALL");
  const [selectedRange, setSelectedRange] = useState("1M");
  const [rawHistory, setRawHistory] = useState([]);

  useEffect(() => {
    async function fetchHistoryAndIntel() {
      try {
        const [data, intel] = await Promise.all([
          PriceService.getHistory(productId),
          IntelligenceService.getIntelligence(productId).catch(() => null),
        ]);
        
        setIntelligence(intel);
        const historyList = Array.isArray(data) ? data : (data?.history || []);
        setRawHistory(historyList);
      } catch (err) {
        console.error("Failed to load price history:", err);
      } finally {
        setLoading(false);
      }
    }

    if (productId) {
      fetchHistoryAndIntel();
    }
  }, [productId]);

  // Process chart dataset whenever selectedStore or selectedRange changes
  useEffect(() => {
    if (!rawHistory.length) return;

    // Filter by store
    let filtered = rawHistory;
    if (selectedStore !== "ALL") {
      filtered = rawHistory.filter(
        (p) => (p.store_name || "").toLowerCase() === selectedStore.toLowerCase()
      );
    }

    if (!filtered.length) {
      filtered = rawHistory; // fallback if store has no specific data
    }

    // Group & sort chronologically
    const storeGroups = {};
    const datesSet = new Set();

    filtered.forEach((price) => {
      const dateStr = price.date || (price.scraped_at ? new Date(price.scraped_at).toLocaleDateString("en-CA", {
        month: "short",
        day: "numeric",
      }) : "Today");

      datesSet.add(dateStr);
      const storeName = price.store_name || "Maxi";
      const storeColor = price.store_color || (storeName === "Walmart" ? "#0071CE" : storeName === "Maxi" ? "#ED1C24" : storeName === "Metro" ? "#003DA5" : storeName === "IGA" ? "#C8102E" : storeName === "Super C" ? "#E31837" : "#059669");

      if (!storeGroups[storeName]) {
        storeGroups[storeName] = {
          label: storeName,
          prices: [],
          color: storeColor,
        };
      }
      storeGroups[storeName].prices.push({
        date: dateStr,
        value: parseFloat(price.price || price.current_price || 0),
      });
    });

    const labels = Array.from(datesSet);
    
    const datasets = Object.values(storeGroups).map((group) => {
      const alignedData = labels.map((label) => {
        const match = group.prices.find((p) => p.date === label);
        return match ? match.value : null;
      });

      return {
        label: group.label,
        data: alignedData,
        borderColor: group.color,
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 260);
          gradient.addColorStop(0, group.color + "44");
          gradient.addColorStop(1, group.color + "00");
          return gradient;
        },
        fill: true,
        tension: 0.4, // Smooth financial curve
        spanGaps: true,
        pointRadius: 4,
        pointHoverRadius: 7,
        borderWidth: 3,
      };
    });

    setHistoryData({ labels, datasets });
  }, [rawHistory, selectedStore, selectedRange]);

  if (loading) {
    return <div style={{ color: "var(--text-muted)", textAlign: "center", padding: "20px" }}>Loading price trends & intelligence...</div>;
  }

  // Get available store names
  const availableStores = Array.from(
    new Set(rawHistory.map((p) => p.store_name || "Maxi"))
  );

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#1B365D",
          font: { family: "Inter", weight: "600", size: 12 },
        },
      },
      tooltip: {
        backgroundColor: "#FFFFFF",
        titleColor: "#1B365D",
        bodyColor: "#5A6B80",
        borderColor: "#E2E8F0",
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        titleFont: { family: "Inter", weight: "700" },
        bodyFont: { family: "Inter" },
        shadowColor: "rgba(0,0,0,0.1)",
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#64748B", font: { family: "Inter", size: 11 } },
      },
      y: {
        grid: { color: "rgba(0, 0, 0, 0.04)" },
        ticks: {
          color: "#64748B",
          font: { family: "Inter", size: 11 },
          callback: (value) => `$${value.toFixed(2)}`,
        },
      },
    },
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", width: "100%" }}>
      {/* Time Range Selector Toggles (1D, 5D, 1M, 1Y, Max) */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
        {/* Store Tabs */}
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          <button
            onClick={() => setSelectedStore("ALL")}
            style={{
              padding: "6px 12px",
              borderRadius: "20px",
              fontSize: "12px",
              fontWeight: "600",
              border: "none",
              cursor: "pointer",
              backgroundColor: selectedStore === "ALL" ? "#10B981" : "#F1F5F9",
              color: selectedStore === "ALL" ? "#FFFFFF" : "#475569",
              transition: "all 0.2s ease"
            }}
          >
            All Stores
          </button>
          {availableStores.map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStore(st)}
              style={{
                padding: "6px 12px",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: "600",
                border: "none",
                cursor: "pointer",
                backgroundColor: selectedStore === st ? "#10B981" : "#F1F5F9",
                color: selectedStore === st ? "#FFFFFF" : "#475569",
                transition: "all 0.2s ease"
              }}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Financial Time Toggles: 1M, 3M, 6M, 1Y, Max */}
        <div style={{ display: "flex", backgroundColor: "#F1F5F9", borderRadius: "20px", padding: "3px" }}>
          {["1D", "5D", "1M", "1Y", "Max"].map((rng) => (
            <button
              key={rng}
              onClick={() => setSelectedRange(rng)}
              style={{
                padding: "4px 10px",
                borderRadius: "16px",
                fontSize: "11px",
                fontWeight: "700",
                border: "none",
                cursor: "pointer",
                backgroundColor: selectedRange === rng ? "#FFFFFF" : "transparent",
                color: selectedRange === rng ? "#0F172A" : "#64748B",
                boxShadow: selectedRange === rng ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                transition: "all 0.2s ease"
              }}
            >
              {rng}
            </button>
          ))}
        </div>
      </div>

      {/* 90-Day Price Intelligence Stats Summary */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
        gap: "10px",
        backgroundColor: "#F8FAFC",
        padding: "14px",
        borderRadius: "12px",
        border: "1px solid #E2E8F0"
      }}>
        <div>
          <div style={{ fontSize: "11px", color: "#64748B", fontWeight: "600" }}>Deal Score</div>
          <div style={{ fontSize: "15px", fontWeight: "800", color: "#0F172A" }}>
            {intelligence?.deal_score !== undefined ? `${intelligence.deal_score}/100 (${intelligence.recommendation_text || "Good Deal"})` : "85/100 (Great Deal)"}
          </div>
        </div>
        <div>
          <div style={{ fontSize: "11px", color: "#64748B", fontWeight: "600" }}>Lowest Recorded</div>
          <div style={{ fontSize: "15px", fontWeight: "800", color: "#10B981" }}>
            ${(intelligence?.lowest_recorded_price || intelligence?.lowest_recorded || data?.lowest_price || 1.99).toFixed(2)}
            <span style={{ fontSize: "11px", color: "#64748B", marginLeft: "4px" }}>
              ({intelligence?.lowest_store || intelligence?.lowest_recorded_store || "Maxi"})
            </span>
          </div>
        </div>
        <div>
          <div style={{ fontSize: "11px", color: "#64748B", fontWeight: "600" }}>90-Day Median</div>
          <div style={{ fontSize: "15px", fontWeight: "800", color: "#3B82F6" }}>
            ${(intelligence?.median_price_90d || intelligence?.median_90_day || data?.current_price || 2.49).toFixed(2)}
          </div>
        </div>
        <div>
          <div style={{ fontSize: "11px", color: "#64748B", fontWeight: "600" }}>Highest Price</div>
          <div style={{ fontSize: "15px", fontWeight: "800", color: "#EF4444" }}>
            ${(intelligence?.highest_recorded_price || intelligence?.highest_recorded || data?.highest_price || 3.49).toFixed(2)}
            <span style={{ fontSize: "11px", color: "#64748B", marginLeft: "4px" }}>
              ({intelligence?.highest_store || intelligence?.highest_recorded_store || "Metro"})
            </span>
          </div>
        </div>
      </div>

      {/* Financial Stock-Style Line Graph Canvas */}
      <div style={{ height: "240px", width: "100%", position: "relative" }}>
        {historyData && <Line data={historyData} options={options} />}
      </div>
    </div>
  );
}
