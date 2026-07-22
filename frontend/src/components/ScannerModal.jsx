import React, { useState, useEffect, useRef } from "react";
import { Html5QrcodeScanner, Html5Qrcode } from "html5-qrcode";
import { createWorker } from "tesseract.js";
import {
  IoCloseOutline,
  IoCameraOutline,
  IoBarcodeOutline,
  IoCloudUploadOutline,
  IoSparklesOutline,
  IoCheckmarkCircleOutline,
} from "react-icons/io5";

export default function ScannerModal({ isOpen, onClose, onDetected }) {
  const [activeTab, setActiveTab] = useState("barcode"); // "barcode" | "ocr" | "upload"
  const [scanning, setScanning] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [detectedText, setDetectedText] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [imagePreview, setImagePreview] = useState(null);

  const scannerRef = useRef(null);
  const fileInputRef = useRef(null);

  // Stop barcode scanner when tab changes or modal closes
  useEffect(() => {
    if (!isOpen || activeTab !== "barcode") {
      stopBarcodeScanner();
    } else if (isOpen && activeTab === "barcode") {
      startBarcodeScanner();
    }

    return () => {
      stopBarcodeScanner();
    };
  }, [isOpen, activeTab]);

  const stopBarcodeScanner = () => {
    if (scannerRef.current) {
      try {
        scannerRef.current.clear();
      } catch (e) {
        // ignore clear error if not running
      }
      scannerRef.current = null;
    }
  };

  const startBarcodeScanner = () => {
    stopBarcodeScanner();
    setTimeout(() => {
      const element = document.getElementById("barcode-reader");
      if (!element) return;

      try {
        const scanner = new Html5QrcodeScanner(
          "barcode-reader",
          {
            fps: 10,
            qrbox: { width: 250, height: 150 },
            aspectRatio: 1.0,
          },
          /* verbose= */ false
        );

        scanner.render(onBarcodeSuccess, onBarcodeError);
        scannerRef.current = scanner;
        setStatusMessage("Point camera at product barcode");
      } catch (err) {
        console.error("Barcode scanner init failed:", err);
        setStatusMessage("Camera access error. Try image upload tab.");
      }
    }, 200);
  };

  const onBarcodeSuccess = async (decodedText) => {
    setStatusMessage(`Barcode found: ${decodedText}. Fetching product info...`);
    stopBarcodeScanner();
    setProcessing(true);

    try {
      // Lookup Open Food Facts free API
      const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${decodedText}.json`);
      const data = await res.json();
      if (data && data.product && data.product.product_name) {
        const productName = data.product.product_name;
        setDetectedText(productName);
        setStatusMessage(`Found: ${productName}`);
      } else {
        // Fallback to barcode number
        setDetectedText(decodedText);
        setStatusMessage(`Barcode: ${decodedText}`);
      }
    } catch (e) {
      setDetectedText(decodedText);
    } finally {
      setProcessing(false);
    }
  };

  const onBarcodeError = (err) => {
    // Ignore frame scan errors
  };

  // Helper to create a rotated canvas from an image file
  const createRotatedCanvas = (imageFile, degrees) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = URL.createObjectURL(imageFile);
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (degrees === 90 || degrees === 270) {
          canvas.width = img.height;
          canvas.height = img.width;
        } else {
          canvas.width = img.width;
          canvas.height = img.height;
        }

        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((degrees * Math.PI) / 180);
        ctx.drawImage(img, -img.width / 2, -img.height / 2);

        canvas.toBlob((blob) => resolve(blob), "image/jpeg");
      };
    });
  };

  // Perform Tesseract OCR text extraction with auto-rotation for sideways photos
  const handleImageOCR = async (file) => {
    if (!file) return;

    setImagePreview(URL.createObjectURL(file));
    setProcessing(true);
    setStatusMessage("AI analyzing product photo (0° & 90° rotations)...");

    try {
      const worker = await createWorker("eng+fra");

      // Pass 1: 0 degrees (original image)
      let ret = await worker.recognize(file);
      let rawText = ret.data.text || "";
      let cleaned = cleanOCRText(rawText);

      // Pass 2: If no terms found, try 90 degrees rotation (for vertical sideways packaging)
      if (!cleaned) {
        setStatusMessage("Rotated scan (90°)...");
        const rotated90Blob = await createRotatedCanvas(file, 90);
        ret = await worker.recognize(rotated90Blob);
        rawText = ret.data.text || "";
        cleaned = cleanOCRText(rawText);
      }

      // Pass 3: If still no terms found, try 270 degrees rotation
      if (!cleaned) {
        setStatusMessage("Rotated scan (270°)...");
        const rotated270Blob = await createRotatedCanvas(file, 270);
        ret = await worker.recognize(rotated270Blob);
        rawText = ret.data.text || "";
        cleaned = cleanOCRText(rawText);
      }

      await worker.terminate();

      if (cleaned) {
        setDetectedText(cleaned);
        setStatusMessage(`Recognized: "${cleaned}"`);
      } else {
        setDetectedText("");
        setStatusMessage("No grocery item recognized in photo. Please scan barcode or enter product name.");
      }
    } catch (err) {
      console.error("OCR error:", err);
      setStatusMessage("Failed to process image. Try another photo or barcode.");
    } finally {
      setProcessing(false);
    }
  };

  // Smart Grocery Dictionary (Brands + Produce + Dairy + Meat + Pantry)
  const GROCERY_BRANDS = [
    "lactantia", "agropur", "attitude", "popeye", "dole", "kraft", "heinz",
    "natrel", "beatrice", "selection", "great value", "compliments", "irresistibles",
    "oasis", "tropicana", "danone", "kellogg", "general mills", "quaker",
    "black diamond", "saputo", "parmalat", "iogo", "astro", "cheerios",
    "campbell", "bick", "tostitos", "lay", "doritos", "pringles"
  ];

  const GROCERY_ITEMS = [
    "beurre", "butter", "lait", "milk", "fromage", "cheese", "yogourt", "yogurt",
    "creme", "cream", "oeuf", "eggs", "pain", "bread", "tomate", "tomates", "tomato",
    "tomatoes", "epinard", "épinard", "epinards", "épinards", "spinach", "salade",
    "salad", "lettuce", "laitue", "arugula", "roquette", "poulet", "chicken",
    "boeuf", "beef", "porc", "pork", "crevette", "shrimp", "saumon", "salmon",
    "jus", "juice", "pomme", "apples", "apple", "banane", "bananas", "banana",
    "fraise", "strawberries", "strawberry", "bleuet", "blueberries", "blueberry",
    "raisin", "grapes", "grape", "orange", "oranges", "citron", "lemon", "lemons",
    "avocat", "avocado", "avocados", "patate", "potatoes", "potato", "carotte",
    "carrots", "carrot", "oignon", "onions", "onion", "riz", "rice", "pates",
    "pasta", "cereales", "cereal", "huile", "oil", "sucre", "sugar", "cafe",
    "coffee", "the", "tea", "chips", "croustilles", "biscuit", "cookies"
  ];

  // Clean raw OCR output to pick out brand & item keywords cleanly
  const cleanOCRText = (text) => {
    if (!text) return "";

    // 1. Check if any barcode digit sequence (12 or 13 digits) is in the OCR text
    const digitMatch = text.match(/\b\d{12,13}\b/);
    if (digitMatch) {
      const barcode = digitMatch[0];
      onBarcodeSuccess(barcode);
      return "";
    }

    // 2. Normalize text: convert to lowercase and strip special symbols
    const cleanRaw = text
      .toLowerCase()
      .replace(/[^\w\s\u00C0-\u00FF]/gi, " ");

    const words = cleanRaw.split(/\s+/).filter((w) => w.length > 1);

    const foundBrands = [];
    const foundItems = [];

    for (const w of words) {
      if (GROCERY_BRANDS.includes(w) && !foundBrands.includes(w)) {
        foundBrands.push(w);
      }
      if (GROCERY_ITEMS.includes(w) && !foundItems.includes(w)) {
        foundItems.push(w);
      }
    }

    // Combine matched brand + item keywords (e.g. "lactantia beurre" or "lait")
    const matchedTerms = [...foundBrands, ...foundItems];
    if (matchedTerms.length > 0) {
      return matchedTerms.join(" ");
    }

    return "";
  };

  const handleConfirmSearch = () => {
    if (detectedText) {
      onDetected(detectedText);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(15, 23, 42, 0.75)",
        backdropFilter: "blur(6px)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
      onClick={onClose}
    >
      <div
        className="card animate-scale"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "500px",
          backgroundColor: "#FFFFFF",
          borderRadius: "var(--radius-lg)",
          overflow: "hidden",
          boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid var(--border-color)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "#F8FAFC",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                backgroundColor: "rgba(91, 140, 81, 0.12)",
                padding: "8px",
                borderRadius: "var(--radius-sm)",
                color: "var(--accent)",
                display: "flex",
              }}
            >
              <IoSparklesOutline size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: "17px", fontWeight: 700, color: "var(--text-primary)" }}>
                Smart Product Scanner
              </h3>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: 0 }}>
                Scan barcode or snap photo to compare prices
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              backgroundColor: "transparent",
              border: "none",
              cursor: "pointer",
              color: "var(--text-muted)",
              padding: "4px",
              display: "flex",
            }}
          >
            <IoCloseOutline size={24} />
          </button>
        </div>

        {/* Tab Selection Bar */}
        <div
          style={{
            display: "flex",
            borderBottom: "1px solid var(--border-color)",
            backgroundColor: "#F1F5F9",
          }}
        >
          {[
            { id: "barcode", label: "Barcode", icon: IoBarcodeOutline },
            { id: "ocr", label: "Photo Text AI", icon: IoCameraOutline },
            { id: "upload", label: "Upload Image", icon: IoCloudUploadOutline },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setDetectedText("");
                  setStatusMessage("");
                }}
                style={{
                  flex: 1,
                  padding: "12px 10px",
                  fontSize: "13px",
                  fontWeight: 600,
                  border: "none",
                  borderBottom: active ? "2px solid var(--accent)" : "2px solid transparent",
                  backgroundColor: active ? "#FFFFFF" : "transparent",
                  color: active ? "var(--accent-hover)" : "var(--text-secondary)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  transition: "var(--transition)",
                }}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Viewport Area */}
        <div style={{ padding: "24px", minHeight: "260px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          {/* BARCODE TAB */}
          {activeTab === "barcode" && (
            <div>
              <div id="barcode-reader" style={{ width: "100%", borderRadius: "var(--radius-md)", overflow: "hidden" }}></div>
            </div>
          )}

          {/* OCR & UPLOAD TABS */}
          {(activeTab === "ocr" || activeTab === "upload") && (
            <div style={{ textAlign: "center" }}>
              <input
                type="file"
                accept="image/*"
                capture={activeTab === "ocr" ? "environment" : undefined}
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleImageOCR(e.target.files[0]);
                  }
                }}
              />

              {imagePreview ? (
                <div style={{ marginBottom: "16px" }}>
                  <img
                    src={imagePreview}
                    alt="Scan preview"
                    style={{
                      maxHeight: "180px",
                      maxWidth: "100%",
                      borderRadius: "var(--radius-md)",
                      objectFit: "contain",
                      border: "1px solid var(--border-color)",
                    }}
                  />
                </div>
              ) : null}

              <button
                onClick={() => fileInputRef.current?.click()}
                className="btn btn-primary"
                style={{
                  width: "100%",
                  padding: "14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  fontWeight: 700,
                }}
              >
                {activeTab === "ocr" ? <IoCameraOutline size={20} /> : <IoCloudUploadOutline size={20} />}
                <span>{activeTab === "ocr" ? "Snap Product Photo" : "Select Image File"}</span>
              </button>
            </div>
          )}

          {/* Status Message */}
          {(statusMessage || processing) && (
            <div
              style={{
                marginTop: "16px",
                padding: "10px 14px",
                borderRadius: "var(--radius-sm)",
                backgroundColor: "#F8FAFC",
                border: "1px solid var(--border-color)",
                fontSize: "13px",
                color: "var(--text-secondary)",
                textAlign: "center",
              }}
            >
              {processing ? "⏳ AI Processing..." : statusMessage}
            </div>
          )}

          {/* Result Confirmation Box */}
          {detectedText && (
            <div
              style={{
                marginTop: "20px",
                padding: "16px",
                backgroundColor: "rgba(91, 140, 81, 0.08)",
                borderRadius: "var(--radius-md)",
                border: "1px solid rgba(91, 140, 81, 0.25)",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <IoCheckmarkCircleOutline style={{ color: "var(--accent)", fontSize: "20px" }} />
                <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--accent-hover)", textTransform: "uppercase" }}>
                  Product Recognized
                </span>
              </div>

              <input
                type="text"
                value={detectedText}
                onChange={(e) => setDetectedText(e.target.value)}
                style={{
                  padding: "10px 14px",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border-color)",
                  fontSize: "15px",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  width: "100%",
                }}
              />

              <button
                onClick={handleConfirmSearch}
                className="btn btn-primary"
                style={{
                  width: "100%",
                  padding: "12px",
                  fontWeight: 700,
                  fontSize: "14px",
                  backgroundColor: "var(--accent)",
                }}
              >
                Search across 6 stores →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
