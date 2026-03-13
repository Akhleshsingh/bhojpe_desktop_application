import React, { createContext, useContext, useEffect, useState } from "react";
import { BASE_URL } from "../utils/api";

const NetworkContext = createContext<{
  isOnline: boolean;
  manualOffline: boolean;
  toggleOffline: () => void;
}>({
  isOnline: true,
  manualOffline: false,
  toggleOffline: () => {},
});

export const NetworkProvider = ({ children }: { children: React.ReactNode }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [manualOffline, setManualOffline] = useState(false);

  const effectiveOnline = isOnline && !manualOffline;
  useEffect(() => {
    const online = () => setIsOnline(true);
    const offline = () => setIsOnline(false);

    window.addEventListener("online", online);
    window.addEventListener("offline", offline);

    return () => {
      window.removeEventListener("online", online);
      window.removeEventListener("offline", offline);
    };
  }, []);

useEffect(() => {
  if (!effectiveOnline) return;

  const syncOfflineOrders = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const orders =
      JSON.parse(localStorage.getItem("offlineOrders") || "[]");

    if (!orders.length) return;

    const failedOrders: any[] = [];

    for (const order of orders) {
      try {
        const res = await fetch(`${BASE_URL}/saveOrder`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        body: JSON.stringify(order.apiPayload),
        });

        const data = await res.json();

        if (!res.ok || data.status === false) {
          console.error("❌ Order failed to sync", data);
          failedOrders.push(order);
        }
      } catch (err) {
        console.error("❌ Network error", err);
        failedOrders.push(order);
      }
    }

    if (failedOrders.length > 0) {
      localStorage.setItem(
        "offlineOrders",
        JSON.stringify(failedOrders)
      );
      console.warn(
        `⚠️ ${failedOrders.length} offline orders failed to sync`
      );
    } else {
      localStorage.removeItem("offlineOrders");
      console.log("✅ All offline orders synced successfully");
    }
  };

  syncOfflineOrders();
}, [effectiveOnline]);


  return (
    <NetworkContext.Provider
      value={{
        isOnline: effectiveOnline,
        manualOffline,
        toggleOffline: () => setManualOffline((p) => !p),
      }}
    >
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetwork = () => useContext(NetworkContext);


