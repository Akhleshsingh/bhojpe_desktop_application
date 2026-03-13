import React, { createContext, useContext, useEffect, useState } from "react";
import { store } from "../store/index";
import { enqueue, removeById, incrementRetry, setSyncing } from "../store/slices/offlineSlice";
import client from "../api/client";

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
      const state = store.getState().offline;
      if (!state.queue.length) return;

      store.dispatch(setSyncing(true));

      for (const order of [...state.queue]) {
        try {
          const res = await client.post("/saveOrder", order.apiPayload);
          if (res.data?.status !== false) {
            store.dispatch(removeById(order.id));
          } else {
            store.dispatch(incrementRetry(order.id));
          }
        } catch {
          store.dispatch(incrementRetry(order.id));
        }
      }

      store.dispatch(setSyncing(false));
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

export { enqueue };
