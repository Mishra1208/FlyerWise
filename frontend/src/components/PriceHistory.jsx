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
import { PriceService } from "../services/api";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function PriceHistory({ productId, storeColors = {} }) {
  const [historyData, setHistoryData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const data = await PriceService.getHistory(productId);
        
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
              label: price.store_id === 1 ? "Walmart" : price.store_id === 2 ? "Maxi" : "Metro",
              prices: [],
              color: price.store_id === 1 ? "#0071CE" : price.store_id === 2 ? "#ED1C24" : "#003DA5",
            };
          }
          storeGroups[price.store_id].prices.push({
            date: dateStr,
            value: parseFloat(price.current_price),
          });
        });

        const labels = Array.from(datesSet).sort((a, b) => new Date(a) - new Date(b));
        
        const datasets = Object.values(storeGroups).map((group) => {
          // Align prices with labels
          const alignedData = labels.map((label) => {
            const match = group.prices.find((p) => p.date === label);
            return match ? match.value : null;
          });
          
          return {
            label: group.label,
            data: alignedData,
            borderColor: group.color,
            backgroundColor: group.color + "22",
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
      fetchHistory();
    }
  }, [productId]);

  if (loading) {
    return <div style={{ color: "var(--text-secondary)", textAlign: "center", padding: "20px" }}>Loading price trends...</div>;
  }

  if (!historyData || historyData.datasets.length === 0) {
    return <div style={{ color: "var(--text-muted)", textAlign: "center", padding: "20px" }}>No historical price trends available yet.</div>;
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#e2e8f0",
          font: { family: "Plus Jakarta Sans", weight: "500" },
        },
      },
      tooltip: {
        backgroundColor: "rgba(15, 23, 42, 0.9)",
        titleColor: "#f8fafc",
        bodyColor: "#f1f5f9",
        borderColor: "rgba(255,255,255,0.08)",
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid: { color: "rgba(255, 255, 255, 0.05)" },
        ticks: { color: "#94a3b8" },
      },
      y: {
        grid: { color: "rgba(255, 255, 255, 0.05)" },
        ticks: { 
          color: "#94a3b8",
          callback: (value) => `$${value.toFixed(2)}`,
        },
      },
    },
  };

  return (
    <div style={{ height: "260px", position: "relative", width: "100%" }}>
      <Line data={historyData} options={options} />
    </div>
  );
}
