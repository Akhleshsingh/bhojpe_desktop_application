import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { BASE_URL } from "../utils/api";
import { useAuth } from "./AuthContext";


interface DeliveryExecutive {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  is_active?: number;
  [key: string]: any; // flexible for API extras
}

interface DeliveryExecutivesContextType {
  deliveryExecutives: DeliveryExecutive[];
  loading: boolean;
  fetchDeliveryExecutives: () => Promise<void>;
}
const DeliveryExecutivesContext =
  createContext<DeliveryExecutivesContextType | null>(null);


export const DeliveryExecutivesProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { token } = useAuth();

  const [deliveryExecutives, setDeliveryExecutives] =
    useState<DeliveryExecutive[]>([]);

  const [loading, setLoading] = useState(false);
  const fetchDeliveryExecutives = async () => {
    if (!token) return;

    setLoading(true);

    try {
      const res = await fetch(
        `${BASE_URL}/delivery-executives`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const json = await res.json();

      if (json.status) {
        setDeliveryExecutives(json.data); // API array
      }
    } catch (error) {
      console.error(
        "Delivery Executives fetch failed",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchDeliveryExecutives();
    }
  }, [token]);

  return (
    <DeliveryExecutivesContext.Provider
      value={{
        deliveryExecutives,
        loading,
        fetchDeliveryExecutives,
      }}
    >
      {children}
    </DeliveryExecutivesContext.Provider>
  );
};
export const useDeliveryExecutives = () => {
  const context = useContext(
    DeliveryExecutivesContext
  );

  if (!context) {
    throw new Error(
      "useDeliveryExecutives must be used within DeliveryExecutivesProvider"
    );
  }

  return context;
};
