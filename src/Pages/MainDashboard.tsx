import { Box, Typography, Divider, Skeleton } from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState, useMemo, useCallback } from "react";
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

const FONT = "Poppins, sans-serif";

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
type PaymentMethod = { method: string; total: number };
type TopDish = { item_name: string; qty: number; total: number };
type TopTable = { table_name: string; total: number };

const STATS_COLORS = ["#C5D89D", "#C3C3C385", "#4582F440", "#C850F224"];

const RANK_STYLES = [
  { bg: "linear-gradient(135deg,#F59E0B,#D97706)", shadow: "rgba(245,158,11,.35)" },
  { bg: "linear-gradient(135deg,#94A3B8,#64748B)", shadow: "rgba(100,116,139,.3)" },
  { bg: "linear-gradient(135deg,#CD7F32,#92400E)", shadow: "rgba(180,83,9,.28)" },
];

const PAYMENT_ICONS: Record<string, string> = {
  cash: "💵",
  card: "💳",
  upi: "📱",
  online: "🌐",
  wallet: "👛",
  credit: "💳",
  debit: "💳",
};

const getPaymentIcon = (method: string) =>
  PAYMENT_ICONS[method.toLowerCase()] ?? "💰";

const getStatusMeta = (order: any) => {
  const kotStatus = order.kot?.[0]?.status;
  if (kotStatus === "in_kitchen") return { label: "Order Preparing", color: "#8E44AD" };
  if (kotStatus === "confirmed") return { label: "Order Confirmed", color: "#2F80ED" };
  if (order.order_status === "delivered") return { label: "Delivered", color: "#27AE60" };
  if (order.status === "paid") return { label: "Billed", color: "#EB5757" };
  return { label: order.order_status ?? "-", color: "#555" };
};

const getItemName = (item: any) =>
  item.menu_item?.item_name || item.menu_item?.translations?.[0]?.item_name || "Item";

const TrendBadge = ({ value, label }: { value?: number | null; label: string }) => {
  if (value === undefined || value === null) return null;
  const isPositive = value >= 0;
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
      <Typography sx={{ fontSize: 12, color: isPositive ? "#27AE60" : "#EB5757", fontWeight: 500 }}>
        {isPositive ? "↑" : "↓"} {Math.abs(value).toFixed(2)}%{" "}
        <span style={{ color: "#666" }}>{label}</span>
      </Typography>
    </Box>
  );
};

/* ── Skeleton loaders ── */
const PanelSkeleton = () => (
  <Box sx={{ display: "flex", flexDirection: "column", gap: 1.2 }}>
    {[1, 2, 3].map(i => (
      <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 0.5 }}>
        <Skeleton variant="circular" width={32} height={32} />
        <Box sx={{ flex: 1 }}>
          <Skeleton width="60%" height={14} />
          <Skeleton width="35%" height={12} sx={{ mt: 0.5 }} />
        </Box>
        <Skeleton width={50} height={14} />
      </Box>
    ))}
  </Box>
);

/* ── Premium glass card wrapper ── */
const GlassPanel = ({
  title,
  subtitle,
  gradient,
  icon,
  children,
}: {
  title: string;
  subtitle?: string;
  gradient: string;
  icon: string;
  children: React.ReactNode;
}) => (
  <Box sx={{
    flex: 1, minWidth: 0,
    borderRadius: "16px",
    overflow: "hidden",
    background: "#FFFFFF",
    boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
    border: "1px solid rgba(255,255,255,0.8)",
    backdropFilter: "blur(10px)",
    transition: "box-shadow .2s",
    "&:hover": { boxShadow: "0 8px 32px rgba(0,0,0,0.12)" },
  }}>
    {/* Header */}
    <Box sx={{
      background: gradient,
      px: 2.5, py: 1.8,
      display: "flex", alignItems: "center", gap: 1.4,
    }}>
      <Box sx={{
        width: 38, height: 38, borderRadius: "10px",
        backgroundColor: "rgba(255,255,255,0.2)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 18,
        backdropFilter: "blur(4px)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
      }}>
        {icon}
      </Box>
      <Box>
        <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#FFFFFF", fontFamily: FONT, lineHeight: 1.3 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography sx={{ fontSize: 11, color: "rgba(255,255,255,0.75)", fontFamily: FONT }}>
            {subtitle}
          </Typography>
        )}
      </Box>
    </Box>
    {/* Body */}
    <Box sx={{ p: 2 }}>{children}</Box>
  </Box>
);

export default function MainDashboard() {
  const { branchData } = useAuth();
  const [overview, setOverview] = useState<TodayOverview | null>(null);
  const [monthlySales, setMonthlySales] = useState<MonthlySale[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [topDishes, setTopDishes] = useState<TopDish[]>([]);
  const [topTables, setTopTables] = useState<TopTable[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { orders } = useOrders();

  const currentMonth = dayjs().format("MMMM");

  const fetchDashboard = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/home-dashboard`, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        signal: AbortSignal.timeout(15000),
      });
      const data = await res.json();
      if (data.status) {
        setOverview(data.data.today_overview);
        if (data.data.monthly_sales) {
          const entries = Object.entries(data.data.monthly_sales).map(
            ([date, value]) => ({ date, value: Number(value) })
          );
          setMonthlySales(entries);
        }
        /* ── New sections ── */
        if (data.data.payment_method_today) {
          const pm = Array.isArray(data.data.payment_method_today)
            ? data.data.payment_method_today
            : Object.entries(data.data.payment_method_today).map(([method, total]) => ({ method, total: Number(total) }));
          setPaymentMethods(pm);
        }
        if (data.data.top_selling_dish) {
          const td = Array.isArray(data.data.top_selling_dish)
            ? data.data.top_selling_dish
            : Object.entries(data.data.top_selling_dish).map(([item_name, v]: any) => ({
                item_name, qty: v?.qty ?? v, total: v?.total ?? 0,
              }));
          setTopDishes(td.slice(0, 5));
        }
        if (data.data.top_selling_tables) {
          const tt = Array.isArray(data.data.top_selling_tables)
            ? data.data.top_selling_tables
            : Object.entries(data.data.top_selling_tables).map(([table_name, total]) => ({ table_name, total: Number(total) }));
          setTopTables(tt.slice(0, 5));
        }
      }
    } catch (err: any) {
      if (err?.name !== "AbortError") console.error("Dashboard fetch failed", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  const stats = useMemo(() => [
    { label: "Today's Order", value: overview ? String(overview.total_orders) : "-", trend: overview?.orders_change, trendLabel: "Since yesterday" },
    { label: "Today's Earnings", value: overview ? `₹${Number(overview.total_sales).toFixed(2)}` : "-", trend: overview?.earnings_change, trendLabel: "Since yesterday" },
    { label: "Today's Customer", value: overview ? String(overview.total_customers) : "-", trend: overview?.customers_change, trendLabel: "Since yesterday" },
    { label: `Avg Daily Earnings (${currentMonth})`, value: overview?.avg_daily_earnings ? `₹${Number(overview.avg_daily_earnings).toFixed(2)}` : "-", trend: overview?.avg_earnings_change, trendLabel: "Since Previous Month" },
  ], [overview, currentMonth]);

  const salesData = monthlySales.length > 0
    ? monthlySales
    : [{ date: "Week 1", value: 0 }, { date: "Week 2", value: 0 }, { date: "Week 3", value: 0 }, { date: "Week 4", value: 0 }];

  /* Max for progress bar */
  const maxDishTotal = topDishes.length > 0 ? Math.max(...topDishes.map(d => d.total)) : 1;
  const maxTableTotal = topTables.length > 0 ? Math.max(...topTables.map(t => t.total)) : 1;
  const totalPayment = paymentMethods.reduce((s, p) => s + p.total, 0) || 1;

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#F8FAFC", fontFamily: FONT }}>

      {/* ── Page Header ── */}
      <Box sx={{
        height: 64, backgroundColor: "#FFFFFF",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        px: 3, borderBottom: "1px solid #E6E6E6",
        position: "sticky", top: 0, zIndex: 10,
      }}>
        <Typography sx={{ fontSize: 16, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: FONT }}>
          Dashboard
        </Typography>
        <Typography sx={{ fontSize: 13, color: "#444", fontFamily: FONT }}>
          {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short", year: "numeric" })},{" "}
          {new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
        </Typography>
      </Box>

      {/* ── Two-column area ── */}
      <Box sx={{ display: "flex", px: 2, pt: 2, gap: 2.5 }}>

        {/* LEFT COLUMN */}
        <Box sx={{ flex: 1, minWidth: 0, backgroundColor: "#FFFFFF", p: 2, borderRadius: "4px" }}>
          <Typography sx={{ fontWeight: 600, mb: 1.5, fontSize: 18, fontFamily: FONT }}>Statistics</Typography>

          {/* 4-stat grid */}
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, mb: 2.5 }}>
            {stats.map((card, index) => (
              <Box key={card.label} sx={{
                height: 130, borderRadius: "4px",
                backgroundColor: STATS_COLORS[index],
                p: 2, display: "flex", flexDirection: "column", justifyContent: "space-between",
              }}>
                <Typography sx={{ fontSize: 13, color: "#333", fontFamily: FONT }}>{card.label}</Typography>
                <Typography sx={{ fontSize: 22, fontWeight: 700, fontFamily: FONT, color: "#111" }}>
                  {loading ? "…" : card.value}
                </Typography>
                <TrendBadge value={card.trend} label={card.trendLabel} />
              </Box>
            ))}
          </Box>

          {/* Sales Chart */}
          <Typography sx={{ fontWeight: 600, mb: 1.5, fontSize: 15, fontFamily: FONT }}>Today Overview</Typography>
          <Box sx={{ backgroundColor: "#FFFFFF", border: "1px solid #E6E6E6", borderRadius: "4px", p: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
              <Typography sx={{ fontWeight: 600, fontSize: 14, fontFamily: FONT }}>Sales This Month</Typography>
              {overview?.avg_earnings_change != null && (
                <Typography sx={{ fontSize: 12, fontFamily: FONT }}>
                  <span style={{ color: overview.avg_earnings_change >= 0 ? "#27AE60" : "#EB5757", fontWeight: 600 }}>
                    {overview.avg_earnings_change >= 0 ? "↑" : "↓"} {Math.abs(overview.avg_earnings_change).toFixed(2)}%
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
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#777", fontFamily: FONT }} />
                  <YAxis tick={{ fontSize: 11, fill: "#777", fontFamily: FONT }} tickFormatter={v => `₹${v}`} />
                  <Tooltip formatter={v => [`₹${v ?? 0}`, "Earning"]} contentStyle={{ fontFamily: FONT, fontSize: 12, borderRadius: 6 }} />
                  <Line type="monotone" dataKey="value" stroke="#333333" strokeWidth={2} dot={{ r: 4, fill: "#333" }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Box>
        </Box>

        {/* RIGHT COLUMN — Today's Orders */}
        <Box sx={{ width: 480, flexShrink: 0, backgroundColor: "#FFFFFF", p: 2, borderRadius: "4px" }}>
          <Typography sx={{ fontWeight: 600, mb: 1.5, fontSize: 18, fontFamily: FONT }}>Today's Orders</Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {(orders ?? []).slice(0, 5).map((order: any, idx: number) => {
              const status = getStatusMeta(order);
              const kotCount = order.kot_count ?? order.kot?.length ?? 0;
              const waiterName = order.waiter?.name ?? order.delivery_executive?.name ?? order.customer?.name ?? null;
              const waiterLabel = order.waiter?.name ? "Waiter:" : order.delivery_executive?.name ? "Delivery:" : order.customer?.name ? "Customer:" : null;
              return (
                <Box key={order.id} sx={{
                  backgroundColor: "#FFFFFF", border: "1px solid #EBEBEB",
                  borderRadius: "4px", overflow: "hidden", cursor: "pointer",
                  transition: "box-shadow 0.2s", "&:hover": { boxShadow: "0 2px 10px rgba(0,0,0,0.08)" },
                }} onClick={() => navigate("/menudashboard", { state: { activeOrder: order, mode: "kot", tableId: order.table_id } })}>
                  <Box sx={{ display: "flex", alignItems: "stretch", borderBottom: "1px solid #EBEBEB" }}>
                    <Box sx={{ width: 48, minHeight: 60, backgroundColor: "#C5D89D", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, borderRight: "1px solid #B8CE8A" }}>
                      <Typography sx={{ fontWeight: 700, fontSize: 15, color: "#3A5A10", fontFamily: FONT }}>{idx + 1}</Typography>
                    </Box>
                    <Box sx={{ flex: 1, px: 1.5, py: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                      <Typography sx={{ fontSize: 10, color: "#BBBBBB", fontFamily: FONT, lineHeight: 1.2 }}>--</Typography>
                      <Typography sx={{ fontWeight: 700, fontSize: 13, color: "#111", fontFamily: FONT, lineHeight: 1.5 }}>
                        {order.show_formatted_order_number ?? `Order #${order.order_number}`}
                      </Typography>
                      <Typography sx={{ fontSize: 11, color: "#8A8A8A", fontFamily: FONT, lineHeight: 1.3 }}>
                        {order.order_type?.order_type_name}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", justifyContent: "center", gap: "4px", px: 1.5, py: 1, flexShrink: 0 }}>
                      <Box sx={{ display: "flex", gap: "6px" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: "3px", fontSize: 10, fontWeight: 600, px: "8px", py: "3px", border: "1px solid #4B9DEC", borderRadius: "3px", color: "#4B9DEC", fontFamily: FONT, lineHeight: 1 }}>
                          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#4B9DEC" strokeWidth="2.5">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                            <circle cx="12" cy="9" r="2.5"/>
                          </svg>
                          POS
                        </Box>
                        <Box sx={{ fontSize: 10, fontWeight: 600, px: "8px", py: "3px", border: "1px solid #C2A429", borderRadius: "3px", color: "#C2A429", fontFamily: FONT, lineHeight: 1 }}
                          onClick={e => { e.stopPropagation(); navigate("/kitchens/all-kitchens-kot"); }}>
                          KOT
                        </Box>
                      </Box>
                      {kotCount > 0 && <Typography sx={{ fontSize: 10, color: "#999", fontFamily: FONT }}>{kotCount} KOT</Typography>}
                    </Box>
                  </Box>
                  <Box sx={{ px: 1.5, py: "7px", borderBottom: "1px solid #EBEBEB" }}>
                    <Typography sx={{ fontSize: 11, color: "#999", fontFamily: FONT }}>
                      Order Date: {dayjs(order.created_at).format("DD MMM, YYYY hh:mm A")}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", px: 1.5, py: "10px", gap: "10px" }}>
                    <Typography sx={{ fontWeight: 700, fontSize: 15, fontFamily: FONT, minWidth: 70, flexShrink: 0 }}>₹{order.total}</Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: "5px", flex: 1 }}>
                      <Box sx={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: status.color, flexShrink: 0 }} />
                      <Typography sx={{ fontSize: 11, fontWeight: 600, color: status.color, fontFamily: FONT }}>{status.label}</Typography>
                    </Box>
                    <Box onClick={e => { e.stopPropagation(); navigate("/menudashboard", { state: { activeOrder: order, mode: "kot", tableId: order.table_id } }); }}
                      sx={{ fontSize: 11, fontWeight: 500, px: "12px", py: "5px", border: "1px solid #CCCCCC", borderRadius: "4px", backgroundColor: "#FFFFFF", cursor: "pointer", fontFamily: FONT, whiteSpace: "nowrap", flexShrink: 0, "&:hover": { backgroundColor: "#F5F5F5" } }}>
                      New KOT
                    </Box>
                    {waiterName ? (
                      <Box sx={{ textAlign: "right", flexShrink: 0 }}>
                        <Typography sx={{ fontSize: 10, color: "#999", fontFamily: FONT, lineHeight: 1.3 }}>{waiterLabel}</Typography>
                        <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#333", fontFamily: FONT, lineHeight: 1.4 }}>{waiterName}</Typography>
                      </Box>
                    ) : (
                      <Typography sx={{ fontSize: 12, color: "#CCC", fontFamily: FONT, flexShrink: 0 }}>—</Typography>
                    )}
                  </Box>
                </Box>
              );
            })}
            {(!orders || orders.length === 0) && (
              <Box sx={{ textAlign: "center", color: "#999", fontSize: 14, py: 4, fontFamily: FONT }}>No orders today</Box>
            )}
          </Box>
        </Box>
      </Box>

      {/* ══════════════════════════════════════════
          NEW PREMIUM SECTION — after the graph
      ══════════════════════════════════════════ */}
      <Box sx={{ px: 2, pt: 2.5, pb: 3, display: "flex", gap: 2.5 }}>

        {/* ── 1. Payment Methods Today ── */}
        <GlassPanel
          title="Payment Methods"
          subtitle="Today's collections"
          gradient="linear-gradient(135deg,#1F2937 0%,#374151 100%)"
          icon="💳"
        >
          {loading ? <PanelSkeleton /> : paymentMethods.length === 0 ? (
            <EmptyState text="No payments recorded yet" />
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {paymentMethods.map((pm, i) => {
                const pct = Math.round((pm.total / totalPayment) * 100);
                return (
                  <Box key={i}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 0.8 }}>
                      {/* Icon circle */}
                      <Box sx={{
                        width: 36, height: 36, borderRadius: "10px", flexShrink: 0,
                        background: "linear-gradient(135deg,#E8353A20,#E8353A10)",
                        border: "1px solid #E8353A30",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 16,
                      }}>
                        {getPaymentIcon(pm.method)}
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.4 }}>
                          <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#1F2937", fontFamily: FONT, textTransform: "capitalize" }}>
                            {pm.method}
                          </Typography>
                          <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#E8353A", fontFamily: FONT }}>
                            ₹{Number(pm.total).toFixed(2)}
                          </Typography>
                        </Box>
                        {/* Progress bar */}
                        <Box sx={{ height: 4, borderRadius: 4, backgroundColor: "#F3F4F6", overflow: "hidden" }}>
                          <Box sx={{
                            height: "100%", borderRadius: 4,
                            width: `${pct}%`,
                            background: "linear-gradient(90deg,#E8353A,#c62a2f)",
                            transition: "width .6s ease",
                          }} />
                        </Box>
                        <Typography sx={{ fontSize: 10, color: "#9CA3AF", fontFamily: FONT, mt: 0.4 }}>{pct}% of total</Typography>
                      </Box>
                    </Box>
                    {i < paymentMethods.length - 1 && <Divider sx={{ borderColor: "#F3F4F6" }} />}
                  </Box>
                );
              })}
              {/* Total row */}
              <Box sx={{
                mt: 0.5, pt: 1.2, borderTop: "2px dashed #F3F4F6",
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#6B7280", fontFamily: FONT }}>Total Collected</Typography>
                <Box sx={{
                  px: 1.8, py: 0.6, borderRadius: "20px",
                  background: "linear-gradient(135deg,#E8353A,#c62a2f)",
                  boxShadow: "0 3px 10px rgba(232,53,58,.3)",
                }}>
                  <Typography sx={{ fontSize: 14, fontWeight: 800, color: "#FFF", fontFamily: FONT }}>
                    ₹{totalPayment === 1 ? "0.00" : totalPayment.toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
        </GlassPanel>

        {/* ── 2. Top Selling Dishes ── */}
        <GlassPanel
          title="Top Selling Dishes"
          subtitle="Today's bestsellers"
          gradient="linear-gradient(135deg,#7C3AED 0%,#5B21B6 100%)"
          icon="🍽️"
        >
          {loading ? <PanelSkeleton /> : topDishes.length === 0 ? (
            <EmptyState text="No dish data yet" />
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {topDishes.map((dish, i) => {
                const rankStyle = RANK_STYLES[i];
                const barPct = Math.round((dish.total / maxDishTotal) * 100);
                return (
                  <Box key={i}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.4, py: 1 }}>
                      {/* Rank badge */}
                      <Box sx={{
                        width: 30, height: 30, borderRadius: "8px", flexShrink: 0,
                        background: rankStyle ? rankStyle.bg : "#F3F4F6",
                        boxShadow: rankStyle ? `0 2px 6px ${rankStyle.shadow}` : "none",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <Typography sx={{ fontSize: 12, fontWeight: 800, color: rankStyle ? "#FFF" : "#9CA3AF", fontFamily: FONT }}>
                          #{i + 1}
                        </Typography>
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <Typography sx={{
                            fontSize: 13, fontWeight: 600, color: "#1F2937", fontFamily: FONT,
                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "60%",
                          }}>
                            {dish.item_name}
                          </Typography>
                          <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#7C3AED", fontFamily: FONT, flexShrink: 0 }}>
                            ₹{Number(dish.total).toFixed(2)}
                          </Typography>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.4 }}>
                          <Box sx={{ flex: 1, height: 3, borderRadius: 4, backgroundColor: "#F3F4F6", overflow: "hidden" }}>
                            <Box sx={{
                              height: "100%", borderRadius: 4,
                              width: `${barPct}%`,
                              background: "linear-gradient(90deg,#7C3AED,#5B21B6)",
                              transition: "width .6s ease",
                            }} />
                          </Box>
                          <Box sx={{
                            px: 1, py: 0.2, borderRadius: "10px",
                            backgroundColor: "#F3F4F6", flexShrink: 0,
                          }}>
                            <Typography sx={{ fontSize: 10, fontWeight: 600, color: "#6B7280", fontFamily: FONT }}>
                              {dish.qty} qty
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                    {i < topDishes.length - 1 && <Divider sx={{ borderColor: "#F9FAFB" }} />}
                  </Box>
                );
              })}
            </Box>
          )}
        </GlassPanel>

        {/* ── 3. Top Selling Tables ── */}
        <GlassPanel
          title="Top Selling Tables"
          subtitle="Today's revenue by table"
          gradient="linear-gradient(135deg,#059669 0%,#047857 100%)"
          icon="🪑"
        >
          {loading ? <PanelSkeleton /> : topTables.length === 0 ? (
            <EmptyState text="No table revenue data yet" />
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {topTables.map((table, i) => {
                const rankStyle = RANK_STYLES[i];
                const barPct = Math.round((table.total / maxTableTotal) * 100);
                return (
                  <Box key={i}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.4, py: 1 }}>
                      <Box sx={{
                        width: 30, height: 30, borderRadius: "8px", flexShrink: 0,
                        background: rankStyle ? rankStyle.bg : "#F3F4F6",
                        boxShadow: rankStyle ? `0 2px 6px ${rankStyle.shadow}` : "none",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <Typography sx={{ fontSize: 12, fontWeight: 800, color: rankStyle ? "#FFF" : "#9CA3AF", fontFamily: FONT }}>
                          #{i + 1}
                        </Typography>
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <Typography sx={{
                            fontSize: 13, fontWeight: 600, color: "#1F2937", fontFamily: FONT,
                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "60%",
                          }}>
                            {table.table_name}
                          </Typography>
                          <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#059669", fontFamily: FONT, flexShrink: 0 }}>
                            ₹{Number(table.total).toFixed(2)}
                          </Typography>
                        </Box>
                        <Box sx={{ flex: 1, height: 3, borderRadius: 4, backgroundColor: "#F3F4F6", overflow: "hidden", mt: 0.6 }}>
                          <Box sx={{
                            height: "100%", borderRadius: 4,
                            width: `${barPct}%`,
                            background: "linear-gradient(90deg,#059669,#047857)",
                            transition: "width .6s ease",
                          }} />
                        </Box>
                      </Box>
                    </Box>
                    {i < topTables.length - 1 && <Divider sx={{ borderColor: "#F9FAFB" }} />}
                  </Box>
                );
              })}
            </Box>
          )}
        </GlassPanel>

      </Box>
    </Box>
  );
}

/* ── Empty state helper ── */
function EmptyState({ text }: { text: string }) {
  return (
    <Box sx={{ py: 3, display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
      <Box sx={{ fontSize: 32, opacity: 0.35 }}>📭</Box>
      <Typography sx={{ fontSize: 13, color: "#9CA3AF", fontFamily: FONT, fontWeight: 500 }}>{text}</Typography>
    </Box>
  );
}
