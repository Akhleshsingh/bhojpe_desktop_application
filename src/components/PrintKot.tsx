import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import { useAuth } from "../context/AuthContext";

export default function PrintKot() {
  const [data, setData] = useState<any>(null);
const kotItems = data?.kot?.items ?? [];
  const {branchData , token } = useAuth();

  useEffect(() => {
    window.onafterprint = () => {
      window.close();
    };
  }, []);

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (!event.data) return;

      if (event.data?.type === "PRINT_KOT") {
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

  const { kot, order, items } = data;
const restaurant =
  branchData?.data?.restaurant ?? null;
  return (
    <div
      style={{
        width: 280,
        fontFamily: "monospace",
        padding: "10px",
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
      <div style={{ textAlign: "center", marginBottom: 6 }}>
        <div style={{ fontWeight: 400, fontSize: 14 }}>
          KITCHEN ORDER TICKET
        </div>

        <div style={{ fontSize: 12 }}>
          KOT #{kot?.kot_number || kot?.kotNumber}
        </div>

        <div style={{ fontSize: 12 }}>
          Order #{order?.order_number}
        </div>

        <div style={{ fontSize: 12 }}>
          {dayjs().format("DD MMM YYYY, hh:mm A")}
        </div>
      </div>

      <hr style={{ borderTop: "1px dashed #000" }} />

    {kotItems.length === 0 ? (
  <div style={{ fontSize: 12, textAlign: "center" }}>
    No items
  </div>
) : (
  kotItems.map((item: any) => {
    const name =
      item.menu_item?.item_name ||
      item.menu_item?.translations?.[0]?.item_name ||
      "Item";

    const qty = item.quantity ?? 0;

    const price =
      item.price ??
      item.amount ??
      item.menu_item?.price ??
      0;

    const note = item.note ?? "";

    return (
      <div key={item.id} style={{ marginBottom: 4 }}>
        
        {/* ITEM ROW */}
        <div style={{ display: "flex", fontSize: 12 }}>
          <div style={{ width: "60%" }}>{name}</div>

          <div style={{ width: "15%", textAlign: "center" }}>
            {qty}
          </div>

          <div style={{ width: "25%", textAlign: "right" }}>
            ₹{qty * price}
          </div>
        </div>

        {/* NOTE ROW */}
        {note && (
          <div
            style={{
              fontSize: 11,
              paddingLeft: 4,
              marginTop: 1,
              fontStyle: "italic",
            }}
          >
            • {note}
          </div>
        )}
      </div>
    );
  })
)}


      <hr style={{ borderTop: "1px dashed #000" }} />

      <div
        style={{
          textAlign: "center",
          fontSize: 12,
          marginTop: 6,
        }}
      >
        *** KITCHEN COPY ***
      </div>
    </div>
  );
}
