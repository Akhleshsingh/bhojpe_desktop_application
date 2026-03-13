import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import { useAuth } from "../context/AuthContext";

export default function PrintReceiptPage() {
  const { branchData } = useAuth();
  const [data, setData] = useState<any>(null);

  /* -----------------------------
     🔹 Receive Data From Drawer
  ------------------------------ */
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (!event.data) return;

      if (event.data.type === "print-receipt") {
        console.log("🧾 RECEIVED RECEIPT DATA:", event.data.payload);
        setData(event.data.payload);
      }
    };

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  /* -----------------------------
     🔹 Auto Print After Render
  ------------------------------ */
  useEffect(() => {
    if (!data) return;

    const timer = setTimeout(() => {
      window.print();
    }, 500);

    return () => clearTimeout(timer);
  }, [data]);

  /* -----------------------------
     🔹 Close Window After Print
  ------------------------------ */
  useEffect(() => {
    window.onafterprint = () => {
      window.close();
    };
  }, []);

  if (!data) return null;

  const { order, items, kot, cart } = data;

  /* -----------------------------
     🔹 Resolve Items Properly
  ------------------------------ */
  const sourceItems =
    items ||
    cart ||
    kot?.flatMap((k: any) => k.items) ||
    [];

  const printItems = sourceItems.map((i: any, index: number) => ({
    id: i.id ?? index,
    name:
      i.name ||
      i.menu_item?.item_name ||
      i.menu_item?.translations?.[0]?.item_name ||
      "Item",
    qty: Number(i.qty ?? i.quantity ?? 0),
    price: Number(i.price ?? 0),
    note: i.note ?? "",
  }));

  const restaurant =
    data?.branch?.restaurant ||
    branchData?.data?.restaurant ||
    null;

  return (
    <div
      style={{
        width: 280,
        fontFamily: "monospace",
        padding: "12px 10px",
        color: "#000",
      }}
    >
      {/* 🔰 HEADER */}
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
          {restaurant?.address || ""}
        </div>

        {restaurant?.phone_number && (
          <div style={{ fontSize: 12 }}>
            Ph: +{restaurant.phone_code} {restaurant.phone_number}
          </div>
        )}
      </div>

      <hr style={{ borderTop: "1px dashed #000" }} />

      {/* 🔹 ORDER INFO */}
      <div style={{ fontSize: 12, marginBottom: 6 }}>
        <div>
          <strong>Order:</strong>{" "}
          {order?.show_formatted_order_number || `#${order?.order_number}`}
        </div>

        <div>
          <strong>Date:</strong>{" "}
          {order?.created_at
            ? dayjs(order.created_at).format("DD MMM YYYY, hh:mm A")
            : "—"}
        </div>

        <div>
          <strong>Type:</strong>{" "}
          {order?.order_type?.order_type_name || "—"}
        </div>

        {order?.table?.table_code && (
          <div>
            <strong>Table:</strong> {order.table.table_code}
          </div>
        )}
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
        <div style={{ width: "15%", textAlign: "center" }}>Qty</div>
        <div style={{ width: "25%", textAlign: "right" }}>Amt</div>
      </div>

      {/* 🔹 ITEMS LIST */}
      {printItems.length === 0 ? (
        <div style={{ fontSize: 12, textAlign: "center" }}>
          No items
        </div>
      ) : (
        printItems.map((i: any) => (
          <div key={i.id} style={{ marginBottom: 4 }}>
            <div style={{ display: "flex", fontSize: 12 }}>
              <div style={{ width: "60%" }}>{i.name}</div>

              <div style={{ width: "15%", textAlign: "center" }}>
                {i.qty}
              </div>

              <div style={{ width: "25%", textAlign: "right" }}>
                ₹{i.qty * i.price}
              </div>
            </div>

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

      {/* 🔹 TOTALS */}
      <div style={{ fontSize: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Subtotal</span>
          <span>₹{Number(order?.sub_total || 0)}</span>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Tax</span>
          <span>₹{Number(order?.total_tax_amount || 0)}</span>
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
          <span>₹{Number(order?.total || 0)}</span>
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