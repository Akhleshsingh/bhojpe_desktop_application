import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import { useAuth } from "../context/AuthContext"

type KotItem = {
  id: number;
  name: string;
  qty: number;
  price: number;
  note?: string;
};

type KotGroup = {
  kotNumber: number;
  items: KotItem[];
};

type OrderPayload = {
  order_number: number;
};

type PrintAllKotMessage = {
  type: "PRINT_ALL_KOTS";
  payload: {
    order: OrderPayload;
    kots: KotGroup[];
  };
};

const PrintAllKot: React.FC = () => {
  const [order, setOrder] = useState<OrderPayload | null>(null);
  const [kots, setKots] = useState<KotGroup[]>([]);
  const { branchData } = useAuth();

  const restaurant = branchData?.data?.restaurant ?? null;

  /* -------- MESSAGE LISTENER -------- */

  useEffect(() => {
    const handleMessage = (
      event: MessageEvent<PrintAllKotMessage>
    ) => {
      if (!event.data) return;

      if (event.data.type === "PRINT_ALL_KOTS") {
        const { order, kots } = event.data.payload;

        setOrder(order);
        setKots(kots);

        setTimeout(() => {
          window.print();
        }, 500);
      }
    };

    window.addEventListener("message", handleMessage);

    window.onafterprint = () => {
      window.close();
    };

    return () =>
      window.removeEventListener("message", handleMessage);
  }, []);

  if (!order) return null;

  /* ---------------- RENDER ---------------- */

  return (
    <div style={styles.page}>
          {/* 🔰 RESTAURANT HEADER */}
          <div style={styles.header}>
            <div style={styles.restaurantName}>
              {restaurant?.name || "Restaurant"}
            </div>

            <div style={styles.restaurantText}>
              {restaurant?.address || "—"}
            </div>

            {restaurant?.phone_number && (
              <div style={styles.restaurantText}>
                Ph: +{restaurant.phone_code}{" "}
                {restaurant.phone_number}
              </div>
            )}
          </div>

          <div style={styles.kotHeader}>
            <div>KITCHEN ORDER TICKET</div>
            <div>Order #{order.order_number}</div>

            <div>
              {dayjs().format("DD MMM YYYY, hh:mm A")}
            </div>
          </div>
      {kots.map((kot, index) => (
        <div key={index} style={styles.kotBlock}>  
            <div>KOT #{kot.kotNumber}</div>
          <hr style={styles.hr} />
          <div style={styles.itemsContainer}>
            {kot.items.map((item) => (
              <div key={item.id} style={styles.itemBlock}>
                
                <div style={styles.itemRow}>
                  <div style={{ width: "60%" }}>
                    {item.name}
                  </div>

                  <div
                    style={{
                      width: "15%",
                      textAlign: "center",
                    }}
                  >
                    {item.qty}
                  </div>

                  <div
                    style={{
                      width: "25%",
                      textAlign: "right",
                    }}
                  >
                    ₹{item.qty * item.price}
                  </div>
                </div>

                {item.note && (
                  <div style={styles.note}>
                    • {item.note}
                  </div>
                )}
              </div>
            ))}
          </div>
          {index !== kots.length - 1 && (
            <div style={styles.pageBreak} />
          )}
                    <hr style={styles.hr} />

          <div style={styles.footer}>
            *** KITCHEN COPY ***
          </div>

        </div>
      ))}
    </div>
  );
};

export default PrintAllKot;

/* ---------------- STYLES ---------------- */

const styles: Record<string, React.CSSProperties> = {
  page: {
    width: 280,
    fontFamily: "monospace",
    padding: 10,
  },

  kotBlock: {
    marginBottom: 20,
  },

  header: {
    textAlign: "center",
    marginBottom: 6,
  },

  restaurantName: {
    fontSize: 18,
    fontWeight: 700,
    textTransform: "uppercase",
  },

  restaurantText: {
    fontSize: 12,
  },

  kotHeader: {
    textAlign: "center",
    fontSize: 12,
    marginBottom: 6,
  },

  hr: {
    borderTop: "1px dashed #000",
  },

  /* 🔥 SCROLLABLE ON SCREEN */
  itemsContainer: {
    maxHeight: 220,
    overflowY: "auto",
  },

  itemBlock: {
    marginBottom: 4,
  },

  itemRow: {
    display: "flex",
    fontSize: 12,
  },

  note: {
    fontSize: 11,
    paddingLeft: 4,
    fontStyle: "italic",
  },

  footer: {
    textAlign: "center",
    fontSize: 12,
    marginTop: 6,
  },

  pageBreak: {
    pageBreakAfter: "always",
  },
};
