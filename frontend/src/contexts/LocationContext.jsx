import React, { createContext, useContext, useState, useEffect } from "react";

const LocationContext = createContext(null);

const DEFAULT_POSTAL = "H4G 2Y5";
const DEFAULT_CITY = "Montreal";
const DEFAULT_PROVINCE = "QC";

export function LocationProvider({ children }) {
  const [postalCode, setPostalCodeState] = useState(() => {
    const saved = localStorage.getItem("flyerwise_postal_code");
    return saved || DEFAULT_POSTAL;
  });

  const [cityName, setCityName] = useState(() => {
    const saved = localStorage.getItem("flyerwise_city");
    return saved || DEFAULT_CITY;
  });

  const [province, setProvince] = useState(() => {
    const saved = localStorage.getItem("flyerwise_province");
    return saved || DEFAULT_PROVINCE;
  });

  const [isLoading, setIsLoading] = useState(false);

  const setPostalCode = (code, city, prov) => {
    setPostalCodeState(code);
    setCityName(city || DEFAULT_CITY);
    setProvince(prov || DEFAULT_PROVINCE);
    localStorage.setItem("flyerwise_postal_code", code);
    localStorage.setItem("flyerwise_city", city || DEFAULT_CITY);
    localStorage.setItem("flyerwise_province", prov || DEFAULT_PROVINCE);
  };

  return (
    <LocationContext.Provider
      value={{
        postalCode,
        cityName,
        province,
        setPostalCode,
        isLoading,
        setIsLoading,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const ctx = useContext(LocationContext);
  if (!ctx) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return ctx;
}

export default LocationContext;
