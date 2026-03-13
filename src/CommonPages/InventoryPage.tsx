import React, { useState } from "react";
import { useInventory } from "../context/InventoryContext";

interface InventoryItem {
  name: string;
  category: string;
  unit: string;
  unit_purchase_price: number;
  description: string;
  threshold_quantity: number;
  supplier: string;
  reorder_quantity: number;
}

const InventoryPage = () => {
  const { downloadInventorySample, importInventory, loading, error } =
    useInventory();

  const [file, setFile] = useState<File | null>(null);

  // TEMP: sample rows (until you get GET inventory API)
  const inventoryData: InventoryItem[] = [
    {
      name: "Rice",
      category: "Grains",
      unit: "Kg",
      unit_purchase_price: 55,
      description: "Basmati rice 1kg pack",
      threshold_quantity: 10,
      supplier: "Supplier A",
      reorder_quantity: 50,
    },
    {
      name: "Sugar",
      category: "Groceries",
      unit: "Kg",
      unit_purchase_price: 40,
      description: "White refined sugar",
      threshold_quantity: 20,
      supplier: "Supplier B",
      reorder_quantity: 100,
    },
  ];

  const handleImport = async () => {
    if (!file) {
      alert("Please select a CSV file");
      return;
    }

    try {
      await importInventory(file);
      alert("Inventory imported successfully");
      setFile(null);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div style={{ padding: "24px" }}>
      {/* Header like Orders page */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2>Inventory</h2>

        <div>
          <button onClick={downloadInventorySample} disabled={loading}>
            Download Template
          </button>
        </div>
      </div>

      {/* Import Section */}
      <div style={{ margin: "16px 0" }}>
        <input
          type="file"
          accept=".csv"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        <button onClick={handleImport} disabled={loading}>
          Import Inventory
        </button>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Inventory Table */}
      <table width="100%" border={1} cellPadding={8}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Category</th>
            <th>Unit</th>
            <th>Purchase Price</th>
            <th>Description</th>
            <th>Threshold Qty</th>
            <th>Supplier</th>
            <th>Reorder Qty</th>
          </tr>
        </thead>
        <tbody>
          {inventoryData.map((item, index) => (
            <tr key={index}>
              <td>{item.name}</td>
              <td>{item.category}</td>
              <td>{item.unit}</td>
              <td>{item.unit_purchase_price}</td>
              <td>{item.description}</td>
              <td>{item.threshold_quantity}</td>
              <td>{item.supplier}</td>
              <td>{item.reorder_quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {loading && <p>Processing...</p>}
    </div>
  );
};

export default InventoryPage;
