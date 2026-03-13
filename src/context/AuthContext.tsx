import React, { createContext, useContext, useState } from "react";
import { BASE_URL } from "../utils/api";

type AuthContextType = {
  token: string | null;
  user: any;
  branchData: any;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const logoutApi = async (authToken: string) => {
  return fetch(`${BASE_URL}/logout`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json",
    },
  });
};

const safeParse = (value: string | null) => {
  try {
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token"),
  );

  const [user, setUser] = useState<any>(
    safeParse(localStorage.getItem("user")),
  );

  const [branchData, setBranchData] = useState<any>(
    safeParse(localStorage.getItem("branchData")),
  );

  const fetchBranchData = async (authToken: string) => {
    try {
      const res = await fetch(`${BASE_URL}/branch-master-data`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      const data = await res.json();
      localStorage.setItem("branchData", JSON.stringify(data));
      setBranchData(data);
    } catch (err) {
      console.error("Branch fetch failed", err);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch(`${BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        redirect: "follow",
      });

      const data = await res.json();

      if (!res.ok || !data?.data?.token) {
        return false;
      }

      localStorage.setItem("token", data.data.token);
      localStorage.setItem("user", JSON.stringify(data.data.user ?? null));
      setToken(data.data.token);
      setUser(data.data.user ?? null);

      await fetchBranchData(data.data.token);

      return true;
    } catch (err) {
      console.error("Login failed", err);
      return false;
    }
  };

  const logout = async () => {
    const storedToken = localStorage.getItem("token");
    try {
      if (storedToken) {
        await logoutApi(storedToken);
      }
    } catch (err) {
      console.error("Logout API failed", err);
    } finally {
      localStorage.clear();
      setToken(null);
      setUser(null);
      setBranchData(null);
    }
  };

  return (
    <AuthContext.Provider value={{ token, user, branchData, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
