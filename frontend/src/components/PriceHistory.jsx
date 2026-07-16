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

export default function PriceHistory({ productId }) {
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
      fetchHistory();
    }
  }, [productId]);

  if (loading) {
    return <div style={{ color: "var(--text-muted)", textAlign: "center", padding: "20px" }}>Loading price trends...</div>;
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
    <div style={{ height: "260px", position: "relative", width: "100%" }}>
      <Line data={historyData} options={options} />
    </div>
  );
}
