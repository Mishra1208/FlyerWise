import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { LocationProvider } from "./contexts/LocationContext";
import { BasketProvider } from "./contexts/BasketContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import SearchResults from "./pages/SearchResults";

import FloatingBasketButton from "./components/FloatingBasketButton";

export default function App() {
  return (
    <LocationProvider>
      <BasketProvider>
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

          {/* Floating Basket Action Button */}
          <FloatingBasketButton />

          {/* Unified Footer */}
          <Footer />
        </div>
      </Router>
    </BasketProvider>
  </LocationProvider>
  );
}
