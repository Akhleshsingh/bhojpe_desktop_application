import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PrintReceipt() {
  const {branchData , token } = useAuth();
  const [data, setData] = useState<any>(null);
useEffect(() => {
  window.onafterprint = () => {
    window.close();
  };
}, []);
const location = useLocation();
useEffect(() => {
  const params = new URLSearchParams(location.search);
  const tokenFromUrl = params.get("token");

  if (tokenFromUrl) {
    localStorage.setItem("token", tokenFromUrl);
  }
}, [location.search]);

useEffect(() => {
  const handler = (event: MessageEvent) => {
    if (!event.data) return;

    console.log("🖨 PRINT PAGE RECEIVED:", event.data);

    if (event.data?.type === "PRINT_ORDER") {
      console.log("🧾 ORDER DATA:", event.data.payload);

      setData(event.data.payload);

      setTimeout(() => {
        window.print();
      }, 300);
    }

    if (event.data?.type === "PRINT_KOT") {
      console.log("🍳 KOT DATA:", event.data.payload);

      setData(event.data.payload);

      setTimeout(() => {
        window.print();
      }, 300);
    }
  };

  window.addEventListener("message", handler);
  return () => window.removeEventListener("message", handler);
}, []);


if (!data) return null;

const { order, items, kot, cart } = data;

const sourceItems =
  items ||
  cart ||
  kot?.items ||
  [];

const printItems = sourceItems.map((i: any) => ({
  id: i.id,
  name:
    i.name ||
    i.menu_item?.item_name ||
    i.menu_item?.translations?.[0]?.item_name ||
    "Item",
  qty: i.qty ?? i.quantity ?? 0,
  price: i.price ?? 0,
  note: i.note ?? "",
}));


const restaurant =
  branchData?.data?.restaurant ?? null;

return (
  <div
    style={{
      width: 280,
      fontFamily: "monospace",
      padding: "12px 10px",
      color: "#000",
    }}
  >
    {/* 🔰 RESTAURANT HEADER */}
    <div style={{ textAlign: "center", marginBottom: 6 }}>
      <div
        style={{
          fontSize: 18,
          fontWeight: 700,
          textTransform: "uppercase",
        }}
      >
        {restaurant?.name || "Restaurant"}
      </div>

      <div style={{ fontSize: 12 }}>
        {restaurant?.address || "—"}
      </div>

      {restaurant?.phone_number && (
        <div style={{ fontSize: 12 }}>
          Ph: +{restaurant.phone_code}{" "}
          {restaurant.phone_number}
        </div>
      )}
    </div>

    <hr style={{ borderTop: "1px dashed #000" }} />
    <div style={{ fontSize: 12, marginBottom: 6 }}>
      <div>
        <strong>Order:</strong>{" "}
        {order?.show_formatted_order_number || "—"}
      </div>

      <div>
        <strong>Date:</strong>{" "}
        {order?.created_at
          ? dayjs(order.created_at).format(
              "DD MMM YYYY, hh:mm A"
            )
          : "—"}
      </div>

      <div>
        <strong>Type:</strong>{" "}
        {order?.order_type?.toUpperCase?.() ||
          order?.order_type ||
          "—"}
      </div>
    </div>

    <hr style={{ borderTop: "1px dashed #000" }} />

    {/* 🔹 ITEMS HEADER */}
    <div
      style={{
        display: "flex",
        fontSize: 12,
        fontWeight: 700,
        marginBottom: 4,
      }}
    >
      <div style={{ width: "60%" }}>Item</div>
      <div style={{ width: "15%", textAlign: "center" }}>
        Qty
      </div>
      <div style={{ width: "25%", textAlign: "right" }}>
        Amt
      </div>
    </div>

  {printItems.length === 0 ? (
  <div style={{ fontSize: 12, textAlign: "center" }}>
    No items
  </div>
) : (
  printItems.map((i: any) => (
    <div key={i.id} style={{ marginBottom: 4 }}>
      <div
        style={{
          display: "flex",
          fontSize: 12,
        }}
      >
        <div style={{ width: "60%" }}>
          {i.name || "Item"}
        </div>

        <div
          style={{
            width: "15%",
            textAlign: "center",
          }}
        >
          {i.qty ?? 0}
        </div>

        <div
          style={{
            width: "25%",
            textAlign: "right",
          }}
        >
          ₹{(i.qty ?? 0) * (i.price ?? 0)}
        </div>
      </div>

      {/* 🔹 NOTE ROW (only if exists) */}
      {i.note && (
        <div
          style={{
            fontSize: 11,
            paddingLeft: 4,
            marginTop: 1,
            fontStyle: "italic",
          }}
        >
          • {i.note}
        </div>
      )}
    </div>
  ))
)}
    <hr style={{ borderTop: "1px dashed #000" }} />
    <div style={{ fontSize: 12 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <span>Subtotal</span>
        <span>
          ₹{order?.sub_total ?? 0}
        </span>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <span>Tax</span>
        <span>
          ₹{order?.total_tax_amount ?? 0}
        </span>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontWeight: 700,
          fontSize: 14,
          marginTop: 4,
        }}
      >
        <span>Total</span>
        <span>
          ₹{order?.total ?? 0}
        </span>
      </div>
    </div>

    <hr style={{ borderTop: "1px dashed #000" }} />

    {/* 🔹 FOOTER */}
    <div
      style={{
        textAlign: "center",
        fontSize: 12,
        marginTop: 6,
      }}
    >
      Thank you for visiting 🙏
      <br />
      Visit Again!
    </div>
  </div>
);


}
