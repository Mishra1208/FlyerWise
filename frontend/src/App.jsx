import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import SearchResults from "./pages/SearchResults";

export default function App() {
  return (
    <Router>
      <div style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
      }}>
        {/* Main Header Navigation */}
        <Navbar />

        {/* Dynamic page routes */}
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<SearchResults />} />
          </Routes>
        </main>

        {/* Unified Footer */}
        <Footer />
      </div>
    </Router>
  );
}
