import React, { useState, useMemo } from "react";
import "./kot.css";

type KotItem = {
  name: string;
  qty: number;
};

type Kot = {
  kotNumber: string;
  orderNumber: string;
  orderType: string;
  table: string;
  waiter: string;
  time: string;
  status: string;
  items: KotItem[];
};

const KOT_DATA: Kot[] = [
  {
    kotNumber: "KOT #112",
    orderNumber: "#165",
    orderType: "Dine In",
    table: "4",
    waiter: "Rinku Sharma",
    time: "31-12-2026 11:00 AM",
    status: "Pending",
    items: [
      { name: "Paneer Masala", qty: 2 },
      { name: "Garlic Pizza", qty: 4 },
      { name: "Pav Bhaji", qty: 3 },
    ],
  },
  {
    kotNumber: "KOT #113",
    orderNumber: "#166",
    orderType: "Dine In",
    table: "2",
    waiter: "Ashish",
    time: "31-12-2026 11:10 AM",
    status: "Pending",
    items: [
      { name: "Veg Burger", qty: 2 },
      { name: "Cold Coffee", qty: 1 },
    ],
  },
  {
    kotNumber: "KOT #114",
    orderNumber: "#167",
    orderType: "Pickup",
    table: "-",
    waiter: "N/A",
    time: "31-12-2026 11:15 AM",
    status: "Ready",
    items: [
      { name: "Pizza", qty: 1 },
      { name: "Coke", qty: 2 },
    ],
  },
];

export default function KOTPage() {
  const [searchQ, setSearchQ] = useState("");
  const [orderTypeFilter, setOrderTypeFilter] = useState("All");

  const filtered = useMemo(() => {
    const q = searchQ.trim().toLowerCase();
    return KOT_DATA.filter((kot) => {
      const matchesSearch =
        !q ||
        kot.kotNumber.toLowerCase().includes(q) ||
        kot.orderNumber.toLowerCase().includes(q);
      const matchesType =
        orderTypeFilter === "All" ||
        kot.orderType.toLowerCase().replace(/\s/g, "_") ===
          orderTypeFilter.toLowerCase().replace(/\s/g, "_");
      return matchesSearch && matchesType;
    });
  }, [searchQ, orderTypeFilter]);

  return (
    <div className="kot-page">
      {/* HEADER */}
      <div className="kot-header">
        <h2>KOT ( {filtered.length} )</h2>

        <div className="kot-header-actions">
          <select
            className="kot-filter"
            value={orderTypeFilter}
            onChange={(e) => setOrderTypeFilter(e.target.value)}
          >
            <option>All</option>
            <option>Dine In</option>
            <option>Delivery</option>
            <option>Pickup</option>
          </select>

          <button className="kot-new-btn">New Order</button>
        </div>
      </div>

      {/* FILTER ROW */}
      <div className="kot-filters">
        <input type="date" className="kot-filter-input" />
        <input type="date" className="kot-filter-input" />
        <select className="kot-filter-input">
          <option>Show All KOT</option>
        </select>
        <select className="kot-filter-input">
          <option>Show All Waiter</option>
        </select>

        {/* Search box — after Show All Waiter */}
        <div className="kot-search-wrapper">
          <span className="kot-search-icon">🔍</span>
          <input
            type="text"
            className="kot-search-input"
            placeholder="Search by KOT # or Order #…"
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
          />
          {searchQ && (
            <button className="kot-search-clear" onClick={() => setSearchQ("")}>
              ✕
            </button>
          )}
        </div>
      </div>

      {/* EMPTY STATE */}
      {filtered.length === 0 && (
        <div className="kot-empty">
          <span className="kot-empty-icon">🔖</span>
          <p>No KOTs found for <strong>"{searchQ}"</strong></p>
          <button className="kot-empty-clear" onClick={() => setSearchQ("")}>
            Clear search
          </button>
        </div>
      )}

      {/* GRID */}
      <div className="kot-grid">
        {filtered.map((kot, index) => (
          <div className="kot-card" key={index}>
            {/* CARD HEADER */}
            <div className="kot-card-header">
              <span className="kot-title">{kot.kotNumber}</span>
              <span className="kot-status">{kot.status}</span>
            </div>

            {/* META */}
            <div className="kot-meta">
              Order Type: <b>{kot.orderType}</b>
            </div>

            <div className="kot-meta">
              Order {kot.orderNumber} &nbsp; | &nbsp; Date: {kot.time}
            </div>

            <div className="kot-meta">
              Table: {kot.table} &nbsp; | &nbsp; Waiter: {kot.waiter}
            </div>

            <div className="kot-divider" />

            {/* ITEMS */}
            <div className="kot-items">
              <div className="kot-items-header">
                <span>Items</span>
                <span>QTY</span>
              </div>

              {kot.items.map((item, i) => (
                <div className="kot-item-row" key={i}>
                  <span>{item.name}</span>
                  <span>{item.qty}</span>
                </div>
              ))}
            </div>

            {/* PRINT */}
            <div className="kot-print-wrapper">
              <button className="kot-print-btn">🖨</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
