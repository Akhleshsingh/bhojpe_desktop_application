import { BASE_URL } from "../utils/api";
import React, {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

interface InventoryContextType {
  loading: boolean;
  error: string | null;
  downloadInventorySample: () => Promise<void>;
  importInventory: (file: File) => Promise<any>;
}

const InventoryContext = createContext<InventoryContextType | undefined>(
  undefined
);

interface ProviderProps {
  children: ReactNode;
}

export const InventoryProvider = ({ children }: ProviderProps) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);



  const getToken = (): string | null => {
    return localStorage.getItem("token");
  };

  // 📥 Download sample inventory CSV
  const downloadInventorySample = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${BASE_URL}/producttemplate`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to download inventory template");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "inventory_template.csv";
      link.click();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 📤 Import inventory CSV
  const importInventory = async (file: File) => {
    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append("csv_file", file); // IMPORTANT: backend expects csv_file

      const response = await fetch(
        `${BASE_URL}/importinventoryproducts`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Import failed");
      }

      return await response.json();
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <InventoryContext.Provider
      value={{
        loading,
        error,
        downloadInventorySample,
        importInventory,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error("useInventory must be used within InventoryProvider");
  }
  return context;
};
