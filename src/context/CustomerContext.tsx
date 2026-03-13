import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import type { Customer } from "../types/customer";
import { useAuth } from "./AuthContext";

type CustomersContextType = {
  customers: Customer[];
  loading: boolean;
  searchCustomers: (keyword: string) => Promise<Customer[]>;
  saveCustomer: (payload: {
    name: string;
    phone: string;
    email?: string;
    delivery_address?: string;
  }) => Promise<Customer | null>;
  selectedCustomer: Customer | null;
  setSelectedCustomer: React.Dispatch<React.SetStateAction<Customer | null>>;
};

const CustomersContext = createContext<CustomersContextType>({
  customers: [],
  loading: false,
  searchCustomers: async () => [],
  saveCustomer: async () => null,
  selectedCustomer: null,
  setSelectedCustomer: (() => {}) as React.Dispatch<
    React.SetStateAction<Customer | null>
  >,
});

export const CustomersProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);

  const { token, branchData } = useAuth();
 const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const restaurant_id = branchData?.data?.restaurant_id;
  const branch_id = branchData?.data?.id;

  const callCustomerAPI = async (body: any) => {
    const res = await fetch("http://bhojpe.in/api/v1/getuser", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const json = await res.json();
    if (!json?.status) throw new Error("Customer API failed");

    return json.data?.data || [];
  };

  useEffect(() => {
    if (!token || !restaurant_id || !branch_id) return;

    const preload = async () => {
      try {
        setLoading(true);
        const data = await callCustomerAPI({
          restaurant_id,
          branch_id,
          keyword: "",
          page: 1,
        });
        setCustomers(data);
      } catch (err) {
        console.error("Failed to preload customers", err);
      } finally {
        setLoading(false);
      }
    };

    preload();
  }, [token, restaurant_id, branch_id]);

  const searchCustomers = useCallback(
    async (keyword: string) => {
      if (!keyword.trim()) return [];

      try {
        setLoading(true);
        const data = await callCustomerAPI({
          restaurant_id,
          branch_id,
          keyword: keyword.trim(),
          page: 1,
        });
        return data;
      } catch (err) {
        console.error("Customer search failed", err);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [token, restaurant_id, branch_id]
  );

  // 💾 SAVE customer (create)
  const saveCustomer = useCallback(
    async (payload: {
      name: string;
      phone: string;
      email?: string;
      delivery_address?: string;
    }) => {
      try {
        setLoading(true);
        const data = await callCustomerAPI({
          restaurant_id,
          branch_id,
          ...payload,
        });

        const saved = data?.[0];
        if (saved) {
          setCustomers((prev) => {
            const exists = prev.some((c) => c.id === saved.id);
            return exists ? prev : [saved, ...prev];
          });
        }

        return saved || null;
      } catch (err) {
        console.error("Save customer failed", err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [token, restaurant_id, branch_id]
  );

  return (
    <CustomersContext.Provider
      value={{
        customers,
        loading,
        searchCustomers,
        saveCustomer,  selectedCustomer,
        setSelectedCustomer, 
      }}
    >
      {children}
    </CustomersContext.Provider>
  );
};

export const useCustomers = () => useContext(CustomersContext);

