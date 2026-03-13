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

type TodayOverview = {
  total_sales: number;
  total_orders: number;
  total_customers: number;
  avg_daily_earnings?: number;
  orders_change?: number;
  earnings_change?: number;
  customers_change?: number;
  avg_earnings_change?: number;
};

type MonthlySale = { date: string; value: number };

const STATS_COLORS = ["#C5D89D", "#C3C3C385", "#4582F440", "#C850F224"];

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

const TrendBadge = ({
  value,
  label,
}: {
  value?: number | null;
  label: string;
}) => {
  if (value === undefined || value === null) return null;
  const isPositive = value >= 0;
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
      <Typography
        sx={{
          fontSize: 12,
          color: isPositive ? "#27AE60" : "#EB5757",
          fontWeight: 500,
        }}
      >
        {isPositive ? "↑" : "↓"} {Math.abs(value).toFixed(2)}%{" "}
        <span style={{ color: "#666" }}>{label}</span>
      </Typography>
    </Box>
  );
};

export default function MainDashboard() {
  const { branchData } = useAuth();
  const [overview, setOverview] = useState<TodayOverview | null>(null);
  const [monthlySales, setMonthlySales] = useState<MonthlySale[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { orders } = useOrders();

  const currentMonth = dayjs().format("MMMM");

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
          if (data.data.monthly_sales) {
            const entries = Object.entries(data.data.monthly_sales).map(
              ([date, value]) => ({ date, value: Number(value) }),
            );
            setMonthlySales(entries);
          }
        }
      } catch (err) {
        console.error("Dashboard fetch failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const stats = useMemo(
    () => [
      {
        label: "Today's Order",
        value: overview ? String(overview.total_orders) : "-",
        trend: overview?.orders_change,
        trendLabel: "Since yesterday",
        prefix: "",
      },
      {
        label: "Today's Earnings",
        value: overview ? `₹${Number(overview.total_sales).toFixed(2)}` : "-",
        trend: overview?.earnings_change,
        trendLabel: "Since yesterday",
        prefix: "",
      },
      {
        label: "Today's Customer",
        value: overview ? String(overview.total_customers) : "-",
        trend: overview?.customers_change,
        trendLabel: "Since yesterday",
        prefix: "",
      },
      {
        label: `Average Daily Earnings (${currentMonth})`,
        value: overview?.avg_daily_earnings
          ? `₹${Number(overview.avg_daily_earnings).toFixed(2)}`
          : "-",
        trend: overview?.avg_earnings_change,
        trendLabel: "Since Previous Month",
        prefix: "",
      },
    ],
    [overview, currentMonth],
  );

  const salesData =
    monthlySales.length > 0
      ? monthlySales
      : [
          { date: "Week 1", value: 0 },
          { date: "Week 2", value: 0 },
          { date: "Week 3", value: 0 },
          { date: "Week 4", value: 0 },
        ];

  return (
    <Box
      sx={{ minHeight: "100vh", backgroundColor: "#F6F6F6", fontFamily: "Poppins, sans-serif" }}
    >
      {/* Page Header */}
      <Box
        sx={{
          height: 64,
          backgroundColor: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 3,
          borderBottom: "1px solid #E6E6E6",
        }}
      >
        <Typography
          sx={{
            fontSize: 16,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            fontFamily: "Poppins, sans-serif",
          }}
        >
          Dashboard
        </Typography>
        <Box sx={{ textAlign: "right" }}>
          <Typography sx={{ fontSize: 13, color: "#444", fontFamily: "Poppins, sans-serif" }}>
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
            ,{" "}
            {new Date().toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: "flex", px: 2, pt: 2, gap: 2.5 }}>
        {/* LEFT COLUMN */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            sx={{ fontWeight: 600, mb: 1.5, fontSize: 18, fontFamily: "Poppins, sans-serif" }}
          >
            Statistics
          </Typography>

          {/* 4-stat grid */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 2,
              mb: 2.5,
            }}
          >
            {stats.map((card, index) => (
              <Box
                key={card.label}
                sx={{
                  height: 130,
                  borderRadius: "4px",
                  backgroundColor: STATS_COLORS[index],
                  p: 2,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <Typography
                  sx={{
                    fontSize: 13,
                    color: "#333",
                    fontFamily: "Poppins, sans-serif",
                  }}
                >
                  {card.label}
                </Typography>
                <Typography
                  sx={{
                    fontSize: 22,
                    fontWeight: 700,
                    fontFamily: "Poppins, sans-serif",
                    color: "#111",
                  }}
                >
                  {loading ? "…" : card.value}
                </Typography>
                <TrendBadge value={card.trend} label={card.trendLabel} />
              </Box>
            ))}
          </Box>

          {/* Sales Chart */}
          <Typography
            sx={{ fontWeight: 600, mb: 1.5, fontSize: 15, fontFamily: "Poppins, sans-serif" }}
          >
            Today Overview
          </Typography>
          <Box
            sx={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E6E6E6",
              borderRadius: "4px",
              p: 2,
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
              <Typography
                sx={{ fontWeight: 600, fontSize: 14, fontFamily: "Poppins, sans-serif" }}
              >
                Sales This Month
              </Typography>
              {overview?.avg_earnings_change != null && (
                <Typography sx={{ fontSize: 12, fontFamily: "Poppins, sans-serif" }}>
                  <span style={{ color: overview.avg_earnings_change >= 0 ? "#27AE60" : "#EB5757", fontWeight: 600 }}>
                    {overview.avg_earnings_change >= 0 ? "↑" : "↓"}{" "}
                    {Math.abs(overview.avg_earnings_change).toFixed(2)}%
                  </span>{" "}
                  <span style={{ color: "#777" }}>Since Previous Month</span>
                </Typography>
              )}
            </Box>

            <Divider sx={{ mb: 1.5 }} />

            <Box sx={{ height: 210 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: "#777", fontFamily: "Poppins, sans-serif" }}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#777", fontFamily: "Poppins, sans-serif" }}
                    tickFormatter={(v) => `₹${v}`}
                  />
                  <Tooltip
                    formatter={(v) => [`₹${v ?? 0}`, "Earning"]}
                    contentStyle={{
                      fontFamily: "Poppins, sans-serif",
                      fontSize: 12,
                      borderRadius: 6,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#333333"
                    strokeWidth={2}
                    dot={{ r: 4, fill: "#333" }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Box>
        </Box>

        {/* RIGHT COLUMN — Today's Orders */}
        <Box sx={{ width: 480, flexShrink: 0 }}>
          <Typography
            sx={{ fontWeight: 600, mb: 1.5, fontSize: 18, fontFamily: "Poppins, sans-serif" }}
          >
            Today's Orders
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {(orders ?? []).slice(0, 5).map((order: any, idx: number) => {
              const status = getStatusMeta(order);
              const kotCount = order.kot_count ?? order.kot?.length ?? 0;
              const waiterName = order.waiter?.name
                ?? order.delivery_executive?.name
                ?? order.customer?.name
                ?? null;
              const waiterLabel = order.waiter?.name
                ? "Waiter:"
                : order.delivery_executive?.name
                  ? "Delivery:"
                  : order.customer?.name
                    ? "Customer:"
                    : null;

              return (
                <Box
                  key={order.id}
                  sx={{
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #EBEBEB",
                    borderRadius: "4px",
                    overflow: "hidden",
                    cursor: "pointer",
                    transition: "box-shadow 0.2s",
                    "&:hover": { boxShadow: "0 2px 10px rgba(0,0,0,0.08)" },
                  }}
                  onClick={() =>
                    navigate("/menudashboard", {
                      state: { activeOrder: order, mode: "kot", tableId: order.table_id },
                    })
                  }
                >
                  {/* ── Header row ───────────────────────────────────────── */}
                  <Box sx={{ display: "flex", alignItems: "stretch", borderBottom: "1px solid #EBEBEB" }}>
                    {/* Olive-green number box */}
                    <Box
                      sx={{
                        width: 48,
                        minHeight: 60,
                        backgroundColor: "#C5D89D",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        borderRight: "1px solid #B8CE8A",
                      }}
                    >
                      <Typography
                        sx={{ fontWeight: 700, fontSize: 15, color: "#3A5A10", fontFamily: "Poppins, sans-serif" }}
                      >
                        {idx + 1}
                      </Typography>
                    </Box>

                    {/* Order info: -- / Order #xxx / Type */}
                    <Box sx={{ flex: 1, px: 1.5, py: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                      <Typography
                        sx={{ fontSize: 10, color: "#BBBBBB", fontFamily: "Poppins, sans-serif", lineHeight: 1.2 }}
                      >
                        --
                      </Typography>
                      <Typography
                        sx={{ fontWeight: 700, fontSize: 13, color: "#111", fontFamily: "Poppins, sans-serif", lineHeight: 1.5 }}
                      >
                        {order.show_formatted_order_number ?? `Order #${order.order_number}`}
                      </Typography>
                      <Typography
                        sx={{ fontSize: 11, color: "#8A8A8A", fontFamily: "Poppins, sans-serif", lineHeight: 1.3 }}
                      >
                        {order.order_type?.order_type_name}
                      </Typography>
                    </Box>

                    {/* Right: POS + KOT badges (top), then KOT count (below) */}
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-end",
                        justifyContent: "center",
                        gap: "4px",
                        px: 1.5,
                        py: 1,
                        flexShrink: 0,
                      }}
                    >
                      {/* Badges row */}
                      <Box sx={{ display: "flex", gap: "6px" }}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: "3px",
                            fontSize: 10,
                            fontWeight: 600,
                            px: "8px",
                            py: "3px",
                            border: "1px solid #4B9DEC",
                            borderRadius: "3px",
                            color: "#4B9DEC",
                            fontFamily: "Poppins, sans-serif",
                            lineHeight: 1,
                          }}
                        >
                          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#4B9DEC" strokeWidth="2.5">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                            <circle cx="12" cy="9" r="2.5"/>
                          </svg>
                          POS
                        </Box>
                        <Box
                          sx={{
                            fontSize: 10,
                            fontWeight: 600,
                            px: "8px",
                            py: "3px",
                            border: "1px solid #C2A429",
                            borderRadius: "3px",
                            color: "#C2A429",
                            fontFamily: "Poppins, sans-serif",
                            lineHeight: 1,
                          }}
                          onClick={(e) => { e.stopPropagation(); navigate("/kitchens/all-kitchens-kot"); }}
                        >
                          KOT
                        </Box>
                      </Box>
                      {/* KOT count below badges */}
                      {kotCount > 0 && (
                        <Typography sx={{ fontSize: 10, color: "#999", fontFamily: "Poppins, sans-serif" }}>
                          {kotCount} KOT
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  {/* ── Order date row ────────────────────────────────────── */}
                  <Box sx={{ px: 1.5, py: "7px", borderBottom: "1px solid #EBEBEB" }}>
                    <Typography
                      sx={{ fontSize: 11, color: "#999", fontFamily: "Poppins, sans-serif" }}
                    >
                      Order Date: {dayjs(order.created_at).format("DD MMM, YYYY hh:mm A")}
                    </Typography>
                  </Box>

                  {/* ── Footer row ────────────────────────────────────────── */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      px: 1.5,
                      py: "10px",
                      gap: "10px",
                    }}
                  >
                    {/* Price */}
                    <Typography
                      sx={{ fontWeight: 700, fontSize: 15, fontFamily: "Poppins, sans-serif", minWidth: 70, flexShrink: 0 }}
                    >
                      ₹{order.total}
                    </Typography>

                    {/* Status dot + label */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: "5px", flex: 1 }}>
                      <Box
                        sx={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: status.color, flexShrink: 0 }}
                      />
                      <Typography
                        sx={{ fontSize: 11, fontWeight: 600, color: status.color, fontFamily: "Poppins, sans-serif" }}
                      >
                        {status.label}
                      </Typography>
                    </Box>

                    {/* New KOT button */}
                    <Box
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate("/menudashboard", {
                          state: { activeOrder: order, mode: "kot", tableId: order.table_id },
                        });
                      }}
                      sx={{
                        fontSize: 11,
                        fontWeight: 500,
                        px: "12px",
                        py: "5px",
                        border: "1px solid #CCCCCC",
                        borderRadius: "4px",
                        backgroundColor: "#FFFFFF",
                        cursor: "pointer",
                        fontFamily: "Poppins, sans-serif",
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                        "&:hover": { backgroundColor: "#F5F5F5" },
                      }}
                    >
                      New KOT
                    </Box>

                    {/* Waiter info: stacked label + name on far right */}
                    {waiterName ? (
                      <Box sx={{ textAlign: "right", flexShrink: 0 }}>
                        <Typography
                          sx={{ fontSize: 10, color: "#999", fontFamily: "Poppins, sans-serif", lineHeight: 1.3 }}
                        >
                          {waiterLabel}
                        </Typography>
                        <Typography
                          sx={{ fontSize: 12, fontWeight: 600, color: "#333", fontFamily: "Poppins, sans-serif", lineHeight: 1.4 }}
                        >
                          {waiterName}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography sx={{ fontSize: 12, color: "#CCC", fontFamily: "Poppins, sans-serif", flexShrink: 0 }}>
                        —
                      </Typography>
                    )}
                  </Box>
                </Box>
              );
            })}

            {(!orders || orders.length === 0) && (
              <Box
                sx={{
                  textAlign: "center",
                  color: "#999",
                  fontSize: 14,
                  py: 4,
                  fontFamily: "Poppins, sans-serif",
                }}
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
