import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export type CartItem = {
  id: number;
  name: string;
  price: number;
  qty: number;
  note?: string;
  variation?: string;
};

type CartState = {
  items: CartItem[];
};

const cartSlice = createSlice({
  name: "cart",
  initialState: { items: [] } as CartState,
  reducers: {
    addItem(state, action: PayloadAction<Omit<CartItem, "qty">>) {
      const existing = state.items.find((i) => i.id === action.payload.id);
      if (existing) {
        existing.qty += 1;
      } else {
        state.items.push({ ...action.payload, qty: 1 });
      }
    },
    removeItem(state, action: PayloadAction<number>) {
      state.items = state.items.filter((i) => i.id !== action.payload);
    },
    increaseQty(state, action: PayloadAction<number>) {
      const item = state.items.find((i) => i.id === action.payload);
      if (item) item.qty += 1;
    },
    decreaseQty(state, action: PayloadAction<number>) {
      const item = state.items.find((i) => i.id === action.payload);
      if (item) {
        if (item.qty <= 1) {
          state.items = state.items.filter((i) => i.id !== action.payload);
        } else {
          item.qty -= 1;
        }
      }
    },
    updateNote(state, action: PayloadAction<{ id: number; note: string }>) {
      const item = state.items.find((i) => i.id === action.payload.id);
      if (item) item.note = action.payload.note;
    },
    clearCart(state) {
      state.items = [];
    },
  },
});

export const { addItem, removeItem, increaseQty, decreaseQty, updateNote, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
