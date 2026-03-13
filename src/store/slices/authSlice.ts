import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

type AuthState = {
  token: string | null;
  user: any | null;
  role: string | null;
  isAuthenticated: boolean;
};

const initialState: AuthState = {
  token: localStorage.getItem("token"),
  user: (() => { try { return JSON.parse(localStorage.getItem("user") || "null"); } catch { return null; } })(),
  role: null,
  isAuthenticated: Boolean(localStorage.getItem("token")),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<{ token: string; user: any; role?: string }>) {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.role = action.payload.role ?? null;
      state.isAuthenticated = true;
      localStorage.setItem("token", action.payload.token);
      localStorage.setItem("user", JSON.stringify(action.payload.user));
    },
    clearCredentials(state) {
      state.token = null;
      state.user = null;
      state.role = null;
      state.isAuthenticated = false;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("branchData");
    },
  },
});

export const { setCredentials, clearCredentials } = authSlice.actions;
export default authSlice.reducer;
