import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { BASE_URL } from "../utils/api";
import { useAuth } from "./AuthContext";

type OrdersFilters = {
  order_type: string;
  delivery_platform: string;
};

export type FetchOrdersParams = {
  page?: number;
  per_page?: number;
  order_status?: string;
  order_type?: string;
  delivery_platform?: string;
  waiter_id?: string | number;
  from_date?: string;
  to_date?: string;
  search?: string;
};

const OrdersContext = createContext<any>(null);

export const OrdersProvider = ({ children }: { children: React.ReactNode }) => {
  const { token } = useAuth();

  const [orders, setOrders] = useState<any[]>([]);
  const [ordersTotal, setOrdersTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<OrdersFilters>({
    order_type: "",
    delivery_platform: "",
  });

  const abortRef = useRef<AbortController | null>(null);

  const fetchOrders = useCallback(
    async (params: FetchOrdersParams = {}) => {
      if (!token) return [];

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);

      try {
        const query = new URLSearchParams();
        query.set("page", String(params.page || 1));
        query.set("per_page", String(params.per_page || 20));
        query.set("order_status", params.order_status || "");
        query.set("order_type", params.order_type ?? filters.order_type ?? "");
        query.set("delivery_platform", params.delivery_platform ?? filters.delivery_platform ?? "");
        query.set("waiter_id", String(params.waiter_id || ""));
        query.set("from_date", params.from_date || "");
        query.set("to_date", params.to_date || "");
        query.set("search", params.search || "");

        const res = await fetch(`${BASE_URL}/orders?${query.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json = await res.json();

        if (json.status) {
          setOrders(json.data.data);
          setOrdersTotal(json.data.total);
          return json.data.data;
        }

        return [];
      } catch (e: any) {
        if (e.name !== "AbortError") console.error("Orders fetch failed", e);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [token, filters],
  );

  useEffect(() => {
    fetchOrders({ page: 1, per_page: 20 });
  }, [fetchOrders]);

  return (
    <OrdersContext.Provider
      value={{ orders, ordersTotal, loading, fetchOrders, filters, setFilters }}
    >
      {children}
    </OrdersContext.Provider>
  );
};

export const useOrders = () => useContext(OrdersContext);
