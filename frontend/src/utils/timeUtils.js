/**
 * FlyerWise Time & Countdown Utilities
 *
 * Computes humanized countdown badges for flyer deal expiration dates.
 */

export function getFlyerCountdown(validUntilStr, validFromStr, flyerStatus) {
  if (flyerStatus === "recent_sale") {
    return {
      text: "📜 Past Sale",
      color: "#64748B",
      bg: "#F1F5F9",
      isUrgent: false,
    };
  }

  if (flyerStatus === "upcoming") {
    let dateLabel = "Soon";
    if (validFromStr) {
      const fromDate = new Date(validFromStr);
      dateLabel = fromDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
    }
    return {
      text: `📅 Starts ${dateLabel}`,
      color: "#2563EB",
      bg: "#EFF6FF",
      isUrgent: false,
    };
  }

  if (!validUntilStr) {
    return {
      text: "✨ Active Deal",
      color: "#059669",
      bg: "#ECFDF5",
      isUrgent: false,
    };
  }

  const now = new Date();
  const untilDate = new Date(validUntilStr);
  // Set untilDate to 23:59:59 of that day
  untilDate.setHours(23, 59, 59, 999);

  const diffMs = untilDate.getTime() - now.getTime();

  if (diffMs <= 0) {
    return {
      text: "⚡ Ends Today",
      color: "#D97706",
      bg: "#FEF3C7",
      isUrgent: true,
    };
  }

  const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(totalHours / 24);
  const remainingHours = totalHours % 24;

  if (days === 0) {
    return {
      text: `⏰ Ends in ${remainingHours}h`,
      color: "#DC2626",
      bg: "#FEE2E2",
      isUrgent: true,
    };
  } else if (days === 1) {
    return {
      text: `⏰ Ends in 1d ${remainingHours}h`,
      color: "#D97706",
      bg: "#FEF3C7",
      isUrgent: true,
    };
  } else {
    return {
      text: `⏳ Ends in ${days}d`,
      color: "#059669",
      bg: "#ECFDF5",
      isUrgent: false,
    };
  }
}
