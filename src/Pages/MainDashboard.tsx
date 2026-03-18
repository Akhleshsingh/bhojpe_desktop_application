import { Box, Typography, Divider, Skeleton } from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState, useMemo, useCallback } from "react";
import { useOrders } from "../context/OrdersContext";
import dayjs from "dayjs";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../utils/api";

const FONT  = "'Montserrat', sans-serif";
const SERIF = "'Playfair Display', serif";
const ACCENT      = "#FF3D01";
const ACCENT_DIM  = "rgba(255,61,1,0.08)";
const ACCENT_BDR  = "rgba(255,61,1,0.28)";
const BORDER      = "#e2d9d0";

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
type MonthlySale   = { date: string; value: number };
type PaymentMethod = { method: string; total: number };
type TopDish       = { item_name: string; qty: number; total: number };
type TopTable      = { table_name: string; total: number };

const STAT_CARDS = [
  { color: "#1e8c45", dimBg: "rgba(30,140,69,0.1)",    icon: "🛒", label: "Today's Orders"    },
  { color: ACCENT,    dimBg: ACCENT_DIM,                icon: "💰", label: "Today's Earnings"  },
  { color: "#2563eb", dimBg: "rgba(37,99,235,0.09)",   icon: "👥", label: "Today's Customers" },
  { color: "#7c3aed", dimBg: "rgba(124,58,237,0.09)", icon: "📈", label: "Avg Daily Earnings" },
];

const RANK_STYLES = [
  { bg: "linear-gradient(135deg,#F59E0B,#D97706)", shadow: "rgba(245,158,11,.35)" },
  { bg: "linear-gradient(135deg,#94A3B8,#64748B)", shadow: "rgba(100,116,139,.30)" },
  { bg: "linear-gradient(135deg,#CD7F32,#92400E)", shadow: "rgba(180,83,9,.28)"   },
];

const PAYMENT_ICONS: Record<string, string> = {
  cash: "💵", card: "💳", upi: "📱", online: "🌐", wallet: "👛", credit: "💳", debit: "💳",
};
const getPaymentIcon = (m: string) => PAYMENT_ICONS[m.toLowerCase()] ?? "💰";

const getStatusMeta = (order: any) => {
  const kotStatus = order.kot?.[0]?.status;
  if (kotStatus === "in_kitchen")            return { label: "Preparing",  dot: "#8E44AD" };
  if (kotStatus === "confirmed")             return { label: "Confirmed",  dot: "#2F80ED" };
  if (order.order_status === "delivered")    return { label: "Delivered",  dot: "#27AE60" };
  if (order.status === "paid")               return { label: "Billed",     dot: "#EB5757" };
  return { label: order.order_status ?? "-", dot: "#a8978a" };
};

const TrendBadge = ({ value, label }: { value?: number | null; label: string }) => {
  if (value === undefined || value === null) return null;
  const up = value >= 0;
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
      <Typography sx={{ fontSize: 12, fontWeight: 500, fontFamily: FONT, color: up ? "#1e8c45" : ACCENT }}>
        {up ? "↑" : "↓"} {Math.abs(value).toFixed(2)}%{" "}
        <span style={{ color: "#a8978a" }}>{label}</span>
      </Typography>
    </Box>
  );
};

const EmptyState = ({ text }: { text: string }) => (
  <Box sx={{ py: 3, textAlign: "center" }}>
    <Typography sx={{ fontSize: 13, color: "#a8978a", fontFamily: FONT }}>{text}</Typography>
  </Box>
);

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

export default function MainDashboard() {
  const { branchData } = useAuth();
  const [overview,       setOverview]       = useState<TodayOverview | null>(null);
  const [monthlySales,   setMonthlySales]   = useState<MonthlySale[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [topDishes,      setTopDishes]      = useState<TopDish[]>([]);
  const [topTables,      setTopTables]      = useState<TopTable[]>([]);
  const [loading,        setLoading]        = useState(false);
  const navigate = useNavigate();
  const { orders }  = useOrders();
  const currentMonth = dayjs().format("MMMM");

  const fetchDashboard = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      setLoading(true);
      const res  = await fetch(`${BASE_URL}/home-dashboard`, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        signal: AbortSignal.timeout(15000),
      });
      const data = await res.json();
      if (data.status) {
        setOverview(data.data.today_overview);
        if (data.data.monthly_sales) {
          setMonthlySales(
            Object.entries(data.data.monthly_sales).map(([date, value]) => ({ date, value: Number(value) }))
          );
        }
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
    { value: overview ? String(overview.total_orders) : "-",                                      trend: overview?.orders_change,     trendLabel: "Since yesterday"        },
    { value: overview ? `₹${Number(overview.total_sales).toFixed(2)}` : "-",                     trend: overview?.earnings_change,   trendLabel: "Since yesterday"        },
    { value: overview ? String(overview.total_customers) : "-",                                    trend: overview?.customers_change,  trendLabel: "Since yesterday"        },
    { value: overview?.avg_daily_earnings ? `₹${Number(overview.avg_daily_earnings).toFixed(2)}` : "-", trend: overview?.avg_earnings_change, trendLabel: "Since Previous Month" },
  ], [overview]);

  const salesData  = monthlySales.length > 0
    ? monthlySales
    : [{ date: "W1", value: 0 }, { date: "W2", value: 0 }, { date: "W3", value: 0 }, { date: "W4", value: 0 }];

  const maxDishTotal   = topDishes.length  > 0 ? Math.max(...topDishes.map(d => d.total))   : 1;
  const maxTableTotal  = topTables.length  > 0 ? Math.max(...topTables.map(t => t.total))   : 1;
  const totalPayment   = paymentMethods.reduce((s, p) => s + p.total, 0) || 1;

  const branchName = (branchData as any)?.data?.name ?? "";

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f5f0ea", fontFamily: FONT, overflow: "auto" }}>

      {/* ── Page Header ── */}
      <Box sx={{
        px: "22px", py: "20px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        mb: 0,
      }}>
        <Typography sx={{ fontFamily: SERIF, fontSize: 24, fontWeight: 700, color: "#1a1208" }}>
          Dashboard
        </Typography>
        <Typography sx={{
          fontSize: 13, color: "#6b5c4a", fontWeight: 500, fontFamily: FONT,
          background: "#fff", px: "14px", py: "7px", borderRadius: "9px", border: `1px solid ${BORDER}`,
        }}>
          {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short", year: "numeric" })}
          {" · "}
          {new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
        </Typography>
      </Box>

      <Box sx={{ display: "flex", px: "22px", pb: "22px", gap: "16px" }}>

        {/* ── LEFT COLUMN ── */}
        <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* Stat cards */}
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "14px" }}>
            {STAT_CARDS.map((card, i) => (
              <Box key={card.label} sx={{
                background: "#fff", border: `1.5px solid ${BORDER}`,
                borderRadius: "16px", px: "20px", pt: "18px", pb: "14px",
                boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
                position: "relative", overflow: "hidden",
                transition: "transform .15s, box-shadow .15s",
                "&:hover": { transform: "translateY(-2px)", boxShadow: "0 4px 16px rgba(0,0,0,0.10)" },
                "&::before": {
                  content: '""', position: "absolute",
                  top: 0, left: 0, right: 0, height: "3px",
                  borderRadius: "16px 16px 0 0",
                  background: card.color,
                },
              }}>
                <Box sx={{
                  width: 40, height: 40, borderRadius: "10px",
                  background: card.dimBg,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 18, mb: "12px",
                }}>
                  {card.icon}
                </Box>
                <Typography sx={{
                  fontSize: 11, fontWeight: 600, color: "#a8978a", fontFamily: FONT,
                  textTransform: "uppercase", letterSpacing: ".5px", mb: "6px",
                }}>
                  {card.label}{i === 3 ? ` (${currentMonth})` : ""}
                </Typography>
                <Typography sx={{ fontFamily: SERIF, fontSize: 26, fontWeight: 700, color: "#1a1208", mb: "4px" }}>
                  {loading ? "…" : stats[i].value}
                </Typography>
                <TrendBadge value={stats[i].trend} label={stats[i].trendLabel} />
              </Box>
            ))}
          </Box>

          {/* Sales Chart */}
          <Box sx={{
            background: "#fff", border: `1.5px solid ${BORDER}`,
            borderRadius: "16px", p: "20px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
          }}>
            <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: "20px" }}>
              <Box>
                <Typography sx={{ fontFamily: SERIF, fontSize: 17, fontWeight: 700, color: "#1a1208" }}>
                  Sales This Month
                </Typography>
                <Typography sx={{ fontSize: 12, color: "#a8978a", mt: "2px", fontFamily: FONT }}>
                  Daily revenue trend
                </Typography>
              </Box>
              <Box sx={{ textAlign: "right" }}>
                <Typography sx={{ fontFamily: SERIF, fontSize: 22, fontWeight: 700, color: "#1a1208" }}>
                  {overview ? `₹${Number(overview.total_sales).toFixed(0)}` : "—"}
                </Typography>
                {overview?.avg_earnings_change != null && (
                  <Typography sx={{
                    fontSize: 12, fontWeight: 500, mt: "2px", fontFamily: FONT,
                    color: overview.avg_earnings_change >= 0 ? "#1e8c45" : ACCENT,
                  }}>
                    {overview.avg_earnings_change >= 0 ? "↑" : "↓"}{" "}
                    {Math.abs(overview.avg_earnings_change).toFixed(2)}% vs prev month
                  </Typography>
                )}
              </Box>
            </Box>
            <Box sx={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0ebe3" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#a8978a", fontFamily: FONT }} />
                  <YAxis tick={{ fontSize: 11, fill: "#a8978a", fontFamily: FONT }} tickFormatter={v => `₹${v}`} />
                  <Tooltip
                    formatter={v => [`₹${v ?? 0}`, "Sales"]}
                    contentStyle={{ fontFamily: FONT, fontSize: 12, borderRadius: 8, border: `1px solid ${BORDER}` }}
                  />
                  <Line type="monotone" dataKey="value" stroke={ACCENT} strokeWidth={2.5}
                    dot={{ r: 4, fill: ACCENT, strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: ACCENT }} />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Box>

          {/* 3 insight panels */}
          <Box sx={{ display: "flex", gap: "14px" }}>

            {/* Payment Methods */}
            <Box sx={{
              flex: 1, minWidth: 0, background: "#fff",
              border: `1.5px solid ${BORDER}`, borderRadius: "16px",
              overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
            }}>
              <Box sx={{ px: "20px", py: "16px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: "10px" }}>
                <Box sx={{ width: 36, height: 36, borderRadius: "9px", background: "rgba(37,99,235,0.09)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>💳</Box>
                <Box>
                  <Typography sx={{ fontFamily: SERIF, fontSize: 15, fontWeight: 700, color: "#1a1208" }}>Payment Methods</Typography>
                  <Typography sx={{ fontSize: 11, color: "#a8978a", fontFamily: FONT }}>Today's collections</Typography>
                </Box>
              </Box>
              <Box sx={{ p: "16px" }}>
                {loading ? <PanelSkeleton /> : paymentMethods.length === 0 ? <EmptyState text="No payments yet" /> : (
                  <Box sx={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    {paymentMethods.map((pm, i) => {
                      const pct = Math.round((pm.total / totalPayment) * 100);
                      return (
                        <Box key={i}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: "10px", py: "6px" }}>
                            <Box sx={{ width: 32, height: 32, borderRadius: "8px", background: ACCENT_DIM, border: `1px solid ${ACCENT_BDR}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>
                              {getPaymentIcon(pm.method)}
                            </Box>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Box sx={{ display: "flex", justifyContent: "space-between", mb: "3px" }}>
                                <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#1a1208", fontFamily: FONT, textTransform: "capitalize" }}>{pm.method}</Typography>
                                <Typography sx={{ fontSize: 12, fontWeight: 700, color: ACCENT, fontFamily: FONT }}>₹{Number(pm.total).toFixed(2)}</Typography>
                              </Box>
                              <Box sx={{ height: 3, borderRadius: 4, backgroundColor: "#f0ebe3", overflow: "hidden" }}>
                                <Box sx={{ height: "100%", borderRadius: 4, width: `${pct}%`, background: `linear-gradient(90deg,${ACCENT},#e63500)`, transition: "width .6s ease" }} />
                              </Box>
                            </Box>
                          </Box>
                          {i < paymentMethods.length - 1 && <Divider sx={{ borderColor: "#f0ebe3" }} />}
                        </Box>
                      );
                    })}
                    <Box sx={{ mt: "6px", pt: "10px", borderTop: "2px dashed #e6dfd6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#6b5c4a", fontFamily: FONT }}>Total</Typography>
                      <Box sx={{ px: "12px", py: "3px", borderRadius: "20px", background: `linear-gradient(135deg,${ACCENT},#e63500)`, boxShadow: `0 3px 8px rgba(255,61,1,.3)` }}>
                        <Typography sx={{ fontSize: 12, fontWeight: 800, color: "#fff", fontFamily: FONT }}>
                          ₹{totalPayment === 1 ? "0.00" : totalPayment.toFixed(2)}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                )}
              </Box>
            </Box>

            {/* Top Dishes */}
            <Box sx={{
              flex: 1, minWidth: 0, background: "#fff",
              border: `1.5px solid ${BORDER}`, borderRadius: "16px",
              overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
            }}>
              <Box sx={{ px: "20px", py: "16px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: "10px" }}>
                <Box sx={{ width: 36, height: 36, borderRadius: "9px", background: "rgba(124,58,237,0.09)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🍽️</Box>
                <Box>
                  <Typography sx={{ fontFamily: SERIF, fontSize: 15, fontWeight: 700, color: "#1a1208" }}>Top Dishes</Typography>
                  <Typography sx={{ fontSize: 11, color: "#a8978a", fontFamily: FONT }}>Today's bestsellers</Typography>
                </Box>
              </Box>
              <Box sx={{ p: "16px" }}>
                {loading ? <PanelSkeleton /> : topDishes.length === 0 ? <EmptyState text="No dish data yet" /> : (
                  <Box sx={{ display: "flex", flexDirection: "column" }}>
                    {topDishes.map((dish, i) => {
                      const rs  = RANK_STYLES[i];
                      const pct = Math.round((dish.total / maxDishTotal) * 100);
                      return (
                        <Box key={i}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: "10px", py: "8px" }}>
                            <Box sx={{ width: 26, height: 26, borderRadius: "7px", flexShrink: 0, background: rs?.bg ?? "#f0ebe3", boxShadow: rs ? `0 2px 5px ${rs.shadow}` : "none", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <Typography sx={{ fontSize: 10, fontWeight: 800, color: rs ? "#fff" : "#a8978a", fontFamily: FONT }}>#{i + 1}</Typography>
                            </Box>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                                <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#1a1208", fontFamily: FONT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "60%" }}>{dish.item_name}</Typography>
                                <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#7c3aed", fontFamily: FONT, flexShrink: 0 }}>₹{Number(dish.total).toFixed(0)}</Typography>
                              </Box>
                              <Box sx={{ display: "flex", alignItems: "center", gap: "6px", mt: "3px" }}>
                                <Box sx={{ flex: 1, height: 3, borderRadius: 4, backgroundColor: "#f0ebe3", overflow: "hidden" }}>
                                  <Box sx={{ height: "100%", borderRadius: 4, width: `${pct}%`, background: "linear-gradient(90deg,#7c3aed,#5b21b6)", transition: "width .6s ease" }} />
                                </Box>
                                <Typography sx={{ fontSize: 9, fontWeight: 600, color: "#a8978a", fontFamily: FONT, flexShrink: 0 }}>{dish.qty} qty</Typography>
                              </Box>
                            </Box>
                          </Box>
                          {i < topDishes.length - 1 && <Divider sx={{ borderColor: "#f0ebe3" }} />}
                        </Box>
                      );
                    })}
                  </Box>
                )}
              </Box>
            </Box>

            {/* Top Tables */}
            <Box sx={{
              flex: 1, minWidth: 0, background: "#fff",
              border: `1.5px solid ${BORDER}`, borderRadius: "16px",
              overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
            }}>
              <Box sx={{ px: "20px", py: "16px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: "10px" }}>
                <Box sx={{ width: 36, height: 36, borderRadius: "9px", background: "rgba(5,150,105,0.09)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🪑</Box>
                <Box>
                  <Typography sx={{ fontFamily: SERIF, fontSize: 15, fontWeight: 700, color: "#1a1208" }}>Top Tables</Typography>
                  <Typography sx={{ fontSize: 11, color: "#a8978a", fontFamily: FONT }}>Today's revenue</Typography>
                </Box>
              </Box>
              <Box sx={{ p: "16px" }}>
                {loading ? <PanelSkeleton /> : topTables.length === 0 ? <EmptyState text="No table data yet" /> : (
                  <Box sx={{ display: "flex", flexDirection: "column" }}>
                    {topTables.map((table, i) => {
                      const rs  = RANK_STYLES[i];
                      const pct = Math.round((table.total / maxTableTotal) * 100);
                      return (
                        <Box key={i}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: "10px", py: "8px" }}>
                            <Box sx={{ width: 26, height: 26, borderRadius: "7px", flexShrink: 0, background: rs?.bg ?? "#f0ebe3", boxShadow: rs ? `0 2px 5px ${rs.shadow}` : "none", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <Typography sx={{ fontSize: 10, fontWeight: 800, color: rs ? "#fff" : "#a8978a", fontFamily: FONT }}>#{i + 1}</Typography>
                            </Box>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                                <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#1a1208", fontFamily: FONT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "65%" }}>{table.table_name}</Typography>
                                <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#059669", fontFamily: FONT, flexShrink: 0 }}>₹{Number(table.total).toFixed(0)}</Typography>
                              </Box>
                              <Box sx={{ flex: 1, height: 3, borderRadius: 4, backgroundColor: "#f0ebe3", overflow: "hidden", mt: "4px" }}>
                                <Box sx={{ height: "100%", borderRadius: 4, width: `${pct}%`, background: "linear-gradient(90deg,#059669,#047857)", transition: "width .6s ease" }} />
                              </Box>
                            </Box>
                          </Box>
                          {i < topTables.length - 1 && <Divider sx={{ borderColor: "#f0ebe3" }} />}
                        </Box>
                      );
                    })}
                  </Box>
                )}
              </Box>
            </Box>

          </Box>
        </Box>

        {/* ── RIGHT COLUMN — Today's Orders ── */}
        <Box sx={{
          width: 380, flexShrink: 0,
          background: "#fff", border: `1.5px solid ${BORDER}`,
          borderRadius: "16px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
          display: "flex", flexDirection: "column", overflow: "hidden",
          maxHeight: "calc(100vh - 140px)",
        }}>
          <Box sx={{
            px: "18px", py: "16px",
            borderBottom: `1px solid ${BORDER}`,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            flexShrink: 0,
          }}>
            <Typography sx={{ fontFamily: SERIF, fontSize: 17, fontWeight: 700, color: "#1a1208" }}>
              Today's Orders
            </Typography>
            <Box sx={{
              fontSize: 11, fontWeight: 700, px: "10px", py: "3px",
              borderRadius: "20px", background: ACCENT_DIM, color: ACCENT,
              border: `1px solid ${ACCENT_BDR}`, fontFamily: FONT,
            }}>
              {(orders ?? []).length}
            </Box>
          </Box>

          <Box sx={{
            flex: 1, overflowY: "auto", px: "12px", py: "8px",
            "&::-webkit-scrollbar": { width: 3 },
            "&::-webkit-scrollbar-thumb": { background: BORDER, borderRadius: 4 },
          }}>
            {(orders ?? []).slice(0, 10).map((order: any, idx: number) => {
              const status     = getStatusMeta(order);
              const kotCount   = order.kot_count ?? order.kot?.length ?? 0;
              const waiterName = order.waiter?.name ?? order.delivery_executive?.name ?? order.customer?.name ?? null;
              const orderType  = order.order_type?.order_type_name ?? "";
              return (
                <Box
                  key={order.id}
                  onClick={() => navigate("/poss", { state: { activeOrder: order, mode: "kot", tableId: order.table_id } })}
                  sx={{
                    p: "12px", border: `1.5px solid ${BORDER}`,
                    borderRadius: "12px", mb: "8px",
                    background: "#faf7f3", cursor: "pointer",
                    transition: "border-color .15s",
                    "&:hover": { borderColor: "#cfc5ba" },
                  }}
                >
                  {/* Top row */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: "10px", mb: "10px" }}>
                    <Box sx={{
                      width: 36, height: 36, borderRadius: "9px", flexShrink: 0,
                      background: idx === 0 ? "#e8f5e9" : idx === 1 ? "#fff3e0" : ACCENT_DIM,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontFamily: SERIF, fontSize: 16, fontWeight: 700,
                      color: idx === 0 ? "#1e8c45" : idx === 1 ? "#b45309" : ACCENT,
                    }}>
                      {idx + 1}
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#1a1208", fontFamily: FONT, lineHeight: 1.4 }}>
                        {order.show_formatted_order_number ?? `Order #${order.order_number}`}
                      </Typography>
                      <Typography sx={{ fontSize: 11, color: "#a8978a", fontFamily: FONT }}>
                        {orderType}{order.table ? ` · ${order.table?.table_code}` : ""}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                      <Box sx={{ px: "8px", py: "3px", borderRadius: "6px", fontSize: 11, fontWeight: 700, fontFamily: FONT, background: "rgba(37,99,235,0.09)", color: "#2563eb", border: "1px solid rgba(37,99,235,.2)" }}>
                        POS
                      </Box>
                      <Box sx={{ px: "8px", py: "3px", borderRadius: "6px", fontSize: 11, fontWeight: 700, fontFamily: FONT, background: "rgba(180,83,9,0.09)", color: "#b45309", border: "1px solid rgba(180,83,9,.2)" }}>
                        KOT
                      </Box>
                    </Box>
                  </Box>

                  {/* Mid row */}
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: "8px" }}>
                    <Typography sx={{ fontSize: 11, color: "#a8978a", fontFamily: FONT }}>
                      {order.created_at ? new Date(order.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : ""}
                    </Typography>
                    <Typography sx={{ fontSize: 11, fontWeight: 600, color: "#6b5c4a", fontFamily: FONT }}>
                      {kotCount} KOT{waiterName ? ` · ${waiterName}` : ""}
                    </Typography>
                  </Box>

                  {/* Bottom row */}
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Typography sx={{ fontFamily: SERIF, fontSize: 16, fontWeight: 700, color: "#1a1208" }}>
                      ₹{Number(order.total ?? 0).toFixed(2)}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: "5px" }}>
                        <Box sx={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: status.dot }} />
                        <Typography sx={{ fontSize: 11, fontWeight: 600, color: "#6b5c4a", fontFamily: FONT }}>{status.label}</Typography>
                      </Box>
                      <Box sx={{
                        px: "8px", py: "3px", background: "#f0ebe3",
                        border: `1px solid ${BORDER}`, borderRadius: "6px",
                        fontSize: 11, fontWeight: 600, color: "#6b5c4a", fontFamily: FONT,
                        cursor: "pointer",
                        "&:hover": { background: "#e6dfd6", color: "#1a1208" },
                      }}
                        onClick={e => { e.stopPropagation(); navigate("/poss", { state: { activeOrder: order, mode: "kot", tableId: order.table_id } }); }}
                      >
                        New KOT
                      </Box>
                    </Box>
                  </Box>
                </Box>
              );
            })}
            {(orders ?? []).length === 0 && (
              <Box sx={{ py: 6, textAlign: "center" }}>
                <Typography sx={{ fontSize: 14, color: "#a8978a", fontFamily: FONT }}>No orders today</Typography>
              </Box>
            )}
          </Box>
        </Box>

      </Box>

      {/* suppress unused var warning */}
      <span style={{ display: "none" }}>{branchName}</span>
    </Box>
  );
}
