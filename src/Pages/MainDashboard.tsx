import { Box, Typography, Divider } from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState, useMemo } from "react";
import { useOrders } from "../context/OrdersContext";
import dayjs from "dayjs";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../utils/api";

// ─── Static data (outside component — never recreated) ────────────────────────
type TodayOverview = {
  total_sales: number;
  total_orders: number;
  total_customers: number;
};

const STATS_COLORS = [
  "#C5D89D", // Today's Order
  "#C3C3C385", // Today's Earnings
  "#4582F440", // Today's Customer
  "#C850F224", // Average Daily Earnings
];

const MONTHLY_SALES_DATA = [
  { date: "24 Jan", value: 1506.5 },
  { date: "25 Jan", value: 1507.0 },
  { date: "26 Jan", value: 1507.5 },
  { date: "27 Jan", value: 1508.0 },
  { date: "28 Jan", value: 1508.5 },
];

const getStatusMeta = (order: any) => {
  const kotStatus = order.kot?.[0]?.status;

  if (kotStatus === "in_kitchen")
    return { label: "Order Preparing", color: "#8E44AD" };
  if (kotStatus === "confirmed")
    return { label: "Order Confirmed", color: "#2F80ED" };
  if (order.order_status === "delivered")
    return { label: "Delivered", color: "#27AE60" };
  if (order.status === "paid") return { label: "Billed", color: "#EB5757" };

  return { label: order.order_status ?? "-", color: "#555" };
};

const getItemName = (item: any) =>
  item.menu_item?.item_name ||
  item.menu_item?.translations?.[0]?.item_name ||
  "Item";
// ─────────────────────────────────────────────────────────────────────────────

export default function MainDashboard() {
  const { branchData } = useAuth();
  const [overview, setOverview] = useState<TodayOverview | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { orders } = useOrders();

  // ─── Derived values (memoized) ────────────────────────────────────────────
  const totalTables = useMemo(
    () =>
      branchData?.area?.reduce(
        (sum: number, area: any) => sum + (area.tables?.length || 0),
        0,
      ) ?? 0,
    [branchData],
  );

  const totalAreas = useMemo(() => branchData?.area?.length ?? 0, [branchData]);

  const stats = useMemo(
    () => [
      { label: "Today's Order", value: branchData?.name || "-" },
      { label: "Today's Earnings", value: branchData?.restaurant?.name || "-" },
      { label: "Today's Customer", value: totalAreas || "-" },
      { label: "Average Daily Earnings (January)", value: totalTables || "-" },
    ],
    [branchData, totalAreas, totalTables],
  );
  // ─────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    const fetchDashboard = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        setLoading(true);
        const res = await fetch(`${BASE_URL}/home-dashboard`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const data = await res.json();
        if (data.status) {
          setOverview(data.data.today_overview);
        }
      } catch (err) {
        console.error("Dashboard fetch failed", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#F6F6F6" }}>
      <Box
        sx={{
          height: 80,
          backgroundColor: "#00000005",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 3,
          borderBottom: "1px solid #E6E6E6",
        }}
      >
        <Typography sx={{ fontSize: 20, fontWeight: 700 }}>
          Dashboard
        </Typography>
        <Box>
          <Typography sx={{ fontSize: 14, color: "#777" }}>
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </Typography>
          <Typography sx={{ fontSize: 13, color: "#999" }}>
            {new Date().toLocaleTimeString("en-IN")}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: "flex", px: 2, pt: 2, gap: 3 }}>
        {/* LEFT */}
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontWeight: 600, mb: 2, fontSize: "20px" }}>
            Statistics
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(360px, 1fr))",
              gap: 3,
              mb: 3,
            }}
          >
            {stats.map((card, index) => (
              <Box
                key={card.label}
                sx={{
                  height: 161,
                  borderRadius: "0px",
                  backgroundColor: STATS_COLORS[index],
                  p: 2.5,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <Typography sx={{ fontSize: 14, color: "#000000" }}>
                  {card.label}
                </Typography>
                <Typography sx={{ fontSize: 22, fontWeight: 700 }}>
                  {card.value ?? "-"}
                </Typography>
              </Box>
            ))}
          </Box>

          <Typography sx={{ fontWeight: 600, mb: 2 }}>
            Today Overview
          </Typography>
          <Box
            sx={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E6E6E6",
              p: 2,
              height: 280,
              mt: 3,
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 1,
              }}
            >
              <Typography sx={{ fontWeight: 600 }}>Sales This Month</Typography>
              <Typography
                sx={{ fontSize: 13, fontWeight: 600, color: "#27AE60" }}
              >
                ↑ 190600%{" "}
                <span style={{ color: "#777" }}>Since Previous Month</span>
              </Typography>
            </Box>

            <Divider sx={{ mb: 2 }} />

            <Box sx={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={MONTHLY_SALES_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EFEFEF" />
                  <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#777" }} />
                  <YAxis
                    tick={{ fontSize: 12, fill: "#777" }}
                    tickFormatter={(v) => `₹${v}`}
                  />
                  <Tooltip formatter={(v) => [`₹${v ?? 0}`, "Sales"]} />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#000000"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Box>
        </Box>

        {/* RIGHT */}
        <Box sx={{ width: 517 }}>
          <Typography sx={{ fontWeight: 600, mb: 2 }}>
            Today's Orders
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {(orders ?? []).slice(0, 3).map((order: any) => {
              const status = getStatusMeta(order);

              return (
                <Box
                  key={order.id}
                  sx={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: "6px",
                    border: "1px solid #E6E6E6",
                    p: 2,
                    transition: "0.2s",
                    cursor: "pointer",
                    "&:hover": {
                      boxShadow: "0px 4px 14px rgba(0,0,0,0.08)",
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Box>
                      <Typography fontWeight={700} fontSize={15}>
                        {order.show_formatted_order_number}
                      </Typography>
                      <Typography fontSize={12} color="#8A8A8A">
                        {order.order_type?.order_type_name}
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", gap: 1 }}>
                      {order.kot_count > 0 && (
                        <Box
                          sx={{
                            fontSize: 11,
                            fontWeight: 700,
                            px: 1.2,
                            py: "3px",
                            borderRadius: "4px",
                            backgroundColor: "#FFF4D6",
                            color: "#C2A429",
                          }}
                        >
                          KOT
                        </Box>
                      )}
                      <Box
                        sx={{
                          fontSize: 11,
                          fontWeight: 700,
                          px: 1.2,
                          py: "3px",
                          borderRadius: "4px",
                          backgroundColor: "#E8F1FF",
                          color: "#1E6BD6",
                        }}
                      >
                        {order.placed_via?.toUpperCase()}
                      </Box>
                    </Box>
                  </Box>

                  <Typography fontSize={12} color="#7A7A7A" sx={{ mt: 0.8 }}>
                    Order Date:{" "}
                    {dayjs(order.created_at).format("DD MMM, hh:mm A")}
                  </Typography>

                  <Divider sx={{ my: 1.2 }} />

                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 0.3 }}
                  >
                    {order.kot?.[0]?.items?.slice(0, 2).map((item: any) => (
                      <Typography key={item.id} fontSize={13}>
                        {getItemName(item)} × {item.quantity}
                      </Typography>
                    ))}
                  </Box>

                  <Divider sx={{ my: 1.2 }} />

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-end",
                    }}
                  >
                    <Box>
                      <Typography fontWeight={700} fontSize={16}>
                        ₹{order.total}
                      </Typography>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Box
                          sx={{
                            width: 7,
                            height: 7,
                            borderRadius: "50%",
                            backgroundColor: status.color,
                          }}
                        />
                        <Typography
                          fontSize={12}
                          fontWeight={600}
                          color={status.color}
                        >
                          {status.label}
                        </Typography>
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-end",
                        gap: 0.6,
                      }}
                    >
                      <Box
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate("/menudashboard", {
                            state: {
                              activeOrder: order,
                              mode: "kot",
                              tableId: order.table_id,
                            },
                          });
                        }}
                        sx={{
                          fontSize: 12,
                          fontWeight: 700,
                          px: 1.5,
                          py: "4px",
                          borderRadius: "4px",
                          border: "1px solid #E0E0E0",
                          backgroundColor: "#F5F5F5",
                          cursor: "pointer",
                          "&:hover": {
                            backgroundColor: "#EBF4DD",
                            borderColor: "#5A7863",
                          },
                        }}
                      >
                        New KOT
                      </Box>

                      <Typography fontSize={12} color="#555">
                        {order.waiter?.name
                          ? `Waiter: ${order.waiter.name}`
                          : order.delivery_executive?.name
                            ? `Delivery: ${order.delivery_executive.name}`
                            : order.customer?.name
                              ? `Customer: ${order.customer.name}`
                              : "—"}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              );
            })}

            {(!orders || orders.length === 0) && (
              <Box
                sx={{ textAlign: "center", color: "#999", fontSize: 14, py: 3 }}
              >
                No orders today
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
