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
} from "chart.js";
import { PriceService, IntelligenceService } from "../services/api";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function PriceHistory({ productId }) {
  const [historyData, setHistoryData] = useState(null);
  const [intelligence, setIntelligence] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistoryAndIntel() {
      try {
        const [data, intel] = await Promise.all([
          PriceService.getHistory(productId),
          IntelligenceService.getIntelligence(productId).catch(() => null),
        ]);
        
        setIntelligence(intel);

        // Group prices by store_id
        const storeGroups = {};
        const datesSet = new Set();
        
        data.forEach((price) => {
          const dateStr = new Date(price.scraped_at).toLocaleDateString("en-CA", {
            month: "short",
            day: "numeric",
          });
          datesSet.add(dateStr);
          
          if (!storeGroups[price.store_id]) {
            storeGroups[price.store_id] = {
              label: price.store_id === 1 ? "Walmart" : price.store_id === 2 ? "Maxi" : price.store_id === 3 ? "Metro" : price.store_id === 4 ? "IGA" : price.store_id === 5 ? "Super C" : "Provigo",
              prices: [],
              color: price.store_id === 1 ? "#0071CE" : price.store_id === 2 ? "#ED1C24" : price.store_id === 3 ? "#003DA5" : price.store_id === 4 ? "#C8102E" : price.store_id === 5 ? "#E31837" : "#000000",
            };
          }
          storeGroups[price.store_id].prices.push({
            date: dateStr,
            value: parseFloat(price.current_price),
          });
        });

        const labels = Array.from(datesSet).sort((a, b) => new Date(a) - new Date(b));
        
        const datasets = Object.values(storeGroups).map((group) => {
          const alignedData = labels.map((label) => {
            const match = group.prices.find((p) => p.date === label);
            return match ? match.value : null;
          });
          
          return {
            label: group.label,
            data: alignedData,
            borderColor: group.color,
            backgroundColor: group.color + "11",
            tension: 0.3,
            spanGaps: true,
            pointRadius: 5,
            pointHoverRadius: 7,
          };
        });

        setHistoryData({ labels, datasets });
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

  if (loading) {
    return <div style={{ color: "var(--text-muted)", textAlign: "center", padding: "20px" }}>Loading price trends & intelligence...</div>;
  }

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
        grid: { color: "rgba(0, 0, 0, 0.04)" },
        ticks: { color: "#5A6B80", font: { family: "Inter" } },
      },
      y: {
        grid: { color: "rgba(0, 0, 0, 0.04)" },
        ticks: { 
          color: "#5A6B80",
          font: { family: "Inter" },
          callback: (value) => `$${value.toFixed(2)}`,
        },
      },
    },
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", width: "100%" }}>
      {/* 90-Day Price Intelligence Stats Summary */}
      {intelligence && intelligence.deal_score !== undefined && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
          gap: "10px",
          backgroundColor: "#F8FAFC",
          padding: "14px",
          borderRadius: "12px",
          border: "1px solid #E2E8F0",
        }}>
          <div>
            <span style={{ fontSize: "11px", color: "#64748B", fontWeight: 600 }}>Deal Score</span>
            <div style={{ fontSize: "18px", fontWeight: 800, color: intelligence.deal_score >= 80 ? "#059669" : "#1B365D" }}>
              {intelligence.deal_score}/100 {intelligence.badge_text ? `(${intelligence.badge_text})` : ""}
            </div>
          </div>

          {intelligence.lowest_recorded && (
            <div>
              <span style={{ fontSize: "11px", color: "#64748B", fontWeight: 600 }}>Lowest Recorded</span>
              <div style={{ fontSize: "18px", fontWeight: 800, color: "#059669" }}>
                ${parseFloat(intelligence.lowest_recorded).toFixed(2)}
              </div>
              {intelligence.lowest_recorded_store && (
                <span style={{ fontSize: "11px", color: "#047857", fontWeight: 600 }}>
                  ({intelligence.lowest_recorded_store})
                </span>
              )}
            </div>
          )}

          {intelligence.median_90_day && (
            <div>
              <span style={{ fontSize: "11px", color: "#64748B", fontWeight: 600 }}>90-Day Median</span>
              <div style={{ fontSize: "18px", fontWeight: 800, color: "#1B365D" }}>
                ${parseFloat(intelligence.median_90_day).toFixed(2)}
              </div>
            </div>
          )}

          {intelligence.highest_recorded && (
            <div>
              <span style={{ fontSize: "11px", color: "#64748B", fontWeight: 600 }}>Highest Price</span>
              <div style={{ fontSize: "18px", fontWeight: 800, color: "#DC2626" }}>
                ${parseFloat(intelligence.highest_recorded).toFixed(2)}
              </div>
              {intelligence.highest_recorded_store && (
                <span style={{ fontSize: "11px", color: "#991B1B", fontWeight: 600 }}>
                  ({intelligence.highest_recorded_store})
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Line Chart */}
      {historyData && historyData.datasets.length > 0 ? (
        <div style={{ height: "240px", position: "relative", width: "100%" }}>
          <Line data={historyData} options={options} />
        </div>
      ) : (
        <div style={{ color: "var(--text-muted)", textAlign: "center", padding: "20px" }}>
          No historical price trends available yet for this item.
        </div>
      )}
    </div>
  );
}
