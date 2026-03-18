import { BASE_URL } from "../utils/api";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import type { Customer } from "../types/customer";
import { useAuth } from "./AuthContext";

type UpdatePayload = {
  name: string;
  phone: string;
  email?: string;
  delivery_address?: string;
};

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
  updateCustomer: (id: number, payload: UpdatePayload) => Promise<boolean>;
  deleteCustomer: (id: number) => Promise<boolean>;
  refreshCustomers: () => Promise<void>;
  selectedCustomer: Customer | null;
  setSelectedCustomer: React.Dispatch<React.SetStateAction<Customer | null>>;
};

const CustomersContext = createContext<CustomersContextType>({
  customers: [],
  loading: false,
  searchCustomers: async () => [],
  saveCustomer: async () => null,
  updateCustomer: async () => false,
  deleteCustomer: async () => false,
  refreshCustomers: async () => {},
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
    const res = await fetch(`${BASE_URL}/getuser`, {
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

  const loadCustomers = useCallback(async () => {
    if (!token || !restaurant_id || !branch_id) return;
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
      console.error("Failed to load customers", err);
    } finally {
      setLoading(false);
    }
  }, [token, restaurant_id, branch_id]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const refreshCustomers = useCallback(() => loadCustomers(), [loadCustomers]);

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

  const updateCustomer = useCallback(
    async (id: number, payload: UpdatePayload): Promise<boolean> => {
      try {
        const res = await fetch(`${BASE_URL}/update-customer`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id, restaurant_id, branch_id, ...payload }),
        });
        const json = await res.json();
        if (!json?.status) return false;

        setCustomers((prev) =>
          prev.map((c) =>
            c.id === id
              ? {
                  ...c,
                  name: payload.name,
                  phone: Number(payload.phone) || (payload.phone as any),
                  email: payload.email ?? c.email,
                  delivery_address: payload.delivery_address ?? c.delivery_address,
                }
              : c
          )
        );
        return true;
      } catch (err) {
        console.error("Update customer failed", err);
        return false;
      }
    },
    [token, restaurant_id, branch_id]
  );

  const deleteCustomer = useCallback(
    async (id: number): Promise<boolean> => {
      try {
        const res = await fetch(`${BASE_URL}/delete-customer`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id, restaurant_id, branch_id }),
        });
        const json = await res.json();
        if (!json?.status) return false;

        setCustomers((prev) => prev.filter((c) => c.id !== id));
        return true;
      } catch (err) {
        console.error("Delete customer failed", err);
        return false;
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
        saveCustomer,
        updateCustomer,
        deleteCustomer,
        refreshCustomers,
        selectedCustomer,
        setSelectedCustomer,
      }}
    >
      {children}
    </CustomersContext.Provider>
  );
};

export const useCustomers = () => useContext(CustomersContext);
