import React, { useState } from "react";
import { IoSearchOutline } from "react-icons/io5";

export default function SearchBar({ initialValue = "", onSearch, placeholder = "Search tomatoes, milk, chicken..." }) {
  const [query, setQuery] = useState(initialValue);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{
      width: "100%",
      position: "relative",
    }}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%",
          padding: "18px 24px",
          paddingLeft: "58px",
          borderRadius: "var(--radius-md)",
          background: "rgba(255, 255, 255, 0.03)",
          border: "1px solid var(--bg-card-border)",
          fontSize: "16px",
          color: "var(--text-primary)",
          transition: "var(--transition)",
          boxShadow: "inset 0 2px 4px rgba(0,0,0,0.1)",
        }}
        onFocus={(e) => {
          e.target.style.borderColor = "var(--primary-light)";
          e.target.style.background = "rgba(255, 255, 255, 0.05)";
          e.target.style.boxShadow = "var(--shadow-glow)";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "var(--bg-card-border)";
          e.target.style.background = "rgba(255, 255, 255, 0.03)";
          e.target.style.boxShadow = "inset 0 2px 4px rgba(0,0,0,0.1)";
        }}
      />
      <button type="submit" style={{
        position: "absolute",
        left: "20px",
        top: "50%",
        transform: "translateY(-50%)",
        color: "var(--text-muted)",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
      }}>
        <IoSearchOutline size={22} />
      </button>
    </form>
  );
}
