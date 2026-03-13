import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { BASE_URL } from "../utils/api";
import { useAuth } from "./AuthContext";

type OrdersFilters = {
  order_type: string; // delivery | pickup | dine_in | ""
  delivery_platform: string; // swiggy | zomato | ""
};

type FetchOrdersParams = {
  page?: number;
  per_page?: number;
  order_status?: string;
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

  const fetchOrders = useCallback(
    async (params: FetchOrdersParams = {}) => {
      if (!token) return [];

      setLoading(true);

      try {
        const query = new URLSearchParams({
          page: String(params.page || 1),
          per_page: String(params.per_page || 10),
          order_type: filters.order_type || "",
          order_status: params.order_status || "",
          waiter_id: String(params.waiter_id || ""),
          from_date: params.from_date || "",
          to_date: params.to_date || "",
          search: params.search || "",
        });

        const res = await fetch(`${BASE_URL}/orders?${query.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const json = await res.json();

        if (json.status) {
          const freshOrders = json.data.data;
          setOrders(freshOrders);
          setOrdersTotal(json.data.total);
          return freshOrders;
        }

        return [];
      } catch (e) {
        console.error("Orders fetch failed", e);
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
