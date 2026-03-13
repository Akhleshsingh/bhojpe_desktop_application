import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export type OfflineOrder = {
  id: string;
  apiPayload: any;
  createdAt: string;
  retries: number;
};

const load = (): OfflineOrder[] => {
  try { return JSON.parse(localStorage.getItem("offlineOrders") || "[]"); }
  catch { return []; }
};

const save = (orders: OfflineOrder[]) => {
  localStorage.setItem("offlineOrders", JSON.stringify(orders));
};

const offlineSlice = createSlice({
  name: "offline",
  initialState: { queue: load(), syncing: false },
  reducers: {
    enqueue(state, action: PayloadAction<{ apiPayload: any }>) {
      const entry: OfflineOrder = {
        id: Date.now().toString(),
        apiPayload: action.payload.apiPayload,
        createdAt: new Date().toISOString(),
        retries: 0,
      };
      state.queue.push(entry);
      save(state.queue);
    },
    removeById(state, action: PayloadAction<string>) {
      state.queue = state.queue.filter((o) => o.id !== action.payload);
      save(state.queue);
    },
    incrementRetry(state, action: PayloadAction<string>) {
      const item = state.queue.find((o) => o.id === action.payload);
      if (item) item.retries++;
      save(state.queue);
    },
    setSyncing(state, action: PayloadAction<boolean>) {
      state.syncing = action.payload;
    },
    clearQueue(state) {
      state.queue = [];
      localStorage.removeItem("offlineOrders");
    },
  },
});

export const { enqueue, removeById, incrementRetry, setSyncing, clearQueue } = offlineSlice.actions;
export default offlineSlice.reducer;
