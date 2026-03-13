import React, { createContext, useContext, useEffect, useState } from "react";
import { BASE_URL } from "../utils/api";
import { useAuth } from "./AuthContext";

const WaitersContext = createContext<any>(null);

export const WaitersProvider = ({ children }: { children: React.ReactNode }) => {
    const { token } = useAuth();
  const [waiters, setWaiters] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchWaiters = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/waiters`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await res.json();
      if (json.status) {
        setWaiters(json.data); // 👈 API returns array
      }
    } catch (e) {
      console.error("Waiters fetch failed", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  if (token) {
 fetchWaiters(); }
  }, [token]);


  return (
    <WaitersContext.Provider value={{ waiters, loading, fetchWaiters }}>
      {children}
    </WaitersContext.Provider>
  );
};

export const useWaiters = () => useContext(WaitersContext);
