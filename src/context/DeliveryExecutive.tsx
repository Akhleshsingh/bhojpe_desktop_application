import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { BASE_URL } from "../utils/api";
import { useAuth } from "./AuthContext";

export interface DeliveryExecutive {
  id: number;
  name: string;
  phone?: string | number;
  email?: string;
  is_active?: number;
  status?: string;
  [key: string]: any;
}

type UpdatePayload = {
  name: string;
  phone: string;
  email?: string;
};

interface DeliveryExecutivesContextType {
  deliveryExecutives: DeliveryExecutive[];
  loading: boolean;
  fetchDeliveryExecutives: () => Promise<void>;
  updateExecutive: (id: number, payload: UpdatePayload) => Promise<boolean>;
  deleteExecutive: (id: number) => Promise<boolean>;
}

const DeliveryExecutivesContext =
  createContext<DeliveryExecutivesContextType | null>(null);

export const DeliveryExecutivesProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { token, branchData } = useAuth();
  const branch_id     = branchData?.data?.id;
  const restaurant_id = branchData?.data?.restaurant_id;

  const [deliveryExecutives, setDeliveryExecutives] = useState<DeliveryExecutive[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDeliveryExecutives = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res  = await fetch(`${BASE_URL}/delivery-executives`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.status) setDeliveryExecutives(json.data);
    } catch (error) {
      console.error("Delivery Executives fetch failed", error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) fetchDeliveryExecutives();
  }, [token, fetchDeliveryExecutives]);

  const updateExecutive = useCallback(
    async (id: number, payload: UpdatePayload): Promise<boolean> => {
      try {
        const res = await fetch(`${BASE_URL}/update-delivery-executive`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id, branch_id, restaurant_id, ...payload }),
        });
        const json = await res.json();
        if (!json?.status) return false;

        setDeliveryExecutives((prev) =>
          prev.map((e) =>
            e.id === id
              ? { ...e, name: payload.name, phone: payload.phone, email: payload.email ?? e.email }
              : e
          )
        );
        return true;
      } catch (err) {
        console.error("Update delivery executive failed", err);
        return false;
      }
    },
    [token, branch_id, restaurant_id]
  );

  const deleteExecutive = useCallback(
    async (id: number): Promise<boolean> => {
      try {
        const res = await fetch(`${BASE_URL}/delete-delivery-executive`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id, branch_id, restaurant_id }),
        });
        const json = await res.json();
        if (!json?.status) return false;

        setDeliveryExecutives((prev) => prev.filter((e) => e.id !== id));
        return true;
      } catch (err) {
        console.error("Delete delivery executive failed", err);
        return false;
      }
    },
    [token, branch_id, restaurant_id]
  );

  return (
    <DeliveryExecutivesContext.Provider
      value={{
        deliveryExecutives,
        loading,
        fetchDeliveryExecutives,
        updateExecutive,
        deleteExecutive,
      }}
    >
      {children}
    </DeliveryExecutivesContext.Provider>
  );
};

export const useDeliveryExecutives = () => {
  const context = useContext(DeliveryExecutivesContext);
  if (!context) {
    throw new Error(
      "useDeliveryExecutives must be used within DeliveryExecutivesProvider"
    );
  }
  return context;
};
