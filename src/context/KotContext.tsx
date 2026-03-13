import { BASE_URL } from "../utils/api";
import React, { createContext, useContext, useState } from "react";



type KotContextType = {
  createKotWithOrder: (payload: any) => Promise<any>;
  loading: boolean;
  error: string | null;
};

const KotContext = createContext<KotContextType | null>(null);

export const KotProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createKotWithOrder = async (payload: any) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) throw new Error("Auth token missing");

      const res = await fetch(`${BASE_URL}/KotWithOrder`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.status) {
        throw new Error(data.message || "KOT creation failed");
      }

      return data;
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <KotContext.Provider value={{ createKotWithOrder, loading, error }}>
      {children}
    </KotContext.Provider>
  );
};

export const useKot = () => {
  const ctx = useContext(KotContext);
  if (!ctx) throw new Error("useKot must be used inside KotProvider");
  return ctx;
};
