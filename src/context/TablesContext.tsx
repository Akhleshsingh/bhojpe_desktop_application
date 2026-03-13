import React, { createContext, useContext, useEffect, useState } from "react";
import { BASE_URL } from "../utils/api";

const TablesContext = createContext<any>(null);

export const TablesProvider = ({ children }: { children: React.ReactNode }) => {
  const [tables, setTables] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTables = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/tables/0`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const json = await res.json();

      if (json.status) {
        setTables(json.data); // 👈 API returns array
      }
    } catch (e) {
      console.error("Tables fetch failed", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  return (
    <TablesContext.Provider value={{ tables, loading, fetchTables }}>
      {children}
    </TablesContext.Provider>
  );
};

export const useTables = () => useContext(TablesContext);
