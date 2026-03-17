import {
  Box,
  Typography,
  Divider,
  Select,
  MenuItem,
  FormControl,
  Button as MuiButton,
} from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { useOrders } from "../context/OrdersContext";
import delivery from "../assets/image 358 (1).png";
import orderIcon from "../assets/image 358.png";
import { useWaiters } from "../context/WaitersContext";
import { useNavigate } from "react-router-dom";
import React from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import BillDrawer from "../components/BillDrawer";
import CheckoutModal from "../components/CheckoutModal";
import AddIcon from "@mui/icons-material/Add";
import MergeIcon from "@mui/icons-material/CallMerge";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";

// ── Theme tokens ─────────────────────────────────────────────────────────────
const ACCENT   = "#FF3D01";
const ACCENT_H = "#e63500";
const FONT     = "'Plus Jakarta Sans', sans-serif";
const SERIF    = "'Playfair Display', serif";
const BG       = "#f5f0ea";
const BDR      = "#e2d9d0";
const TX       = "#1a1208";
const TX2      = "#6b5c4a";
const TX3      = "#a08c7c";

type OrderGroup = "all" | "dine_in" | "delivery" | "pickup" | "draft" | "billed" | "kot";

const PAYMENT_OPTIONS = [
  { value: "cash", label: "Cash" },
  { value: "card", label: "Card" },
  { value: "upi", label: "UPI" },
];

const ORDER_STATUS_UI = [
  { key: "placed", label: "Placed" },
  { key: "confirmed", label: "Confirmed" },
  { key: "preparing", label: "Preparing" },
  { key: "food_ready", label: "Ready" },
  { key: "served", label: "Served" },
  { key: "delivered", label: "Delivered" },
];

const ORDER_GROUPS = [
  { key: "all" as OrderGroup, label: "Show All Orders" },
  { key: "dine_in" as OrderGroup, label: "Dine-In Orders" },
  { key: "delivery" as OrderGroup, label: "Delivery Orders" },
  { key: "pickup" as OrderGroup, label: "Pickup Orders" },
  { key: "kot" as OrderGroup, label: "KOT Orders" },
  { key: "billed" as OrderGroup, label: "Billed Orders" },
  { key: "draft" as OrderGroup, label: "Draft Orders" },
];

const DATE_PRESETS = ["Today", "Yesterday", "This Week", "This Month", "Last 3 Months", "Last 6 Months", "This Year"];

const selectSx = {
  height: 36,
  fontSize: 13,
  fontFamily: FONT,
  backgroundColor: "#ffffff",
  borderRadius: "8px",
  "& .MuiOutlinedInput-notchedOutline": { borderColor: BDR },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: TX3 },
  "& .MuiSelect-icon": { fontSize: 18, color: TX3 },
};

const getDraftDisplayNumber = (draft: any, index: number) =>
  `D-${draft._draftId?.toString().slice(-4) || index + 1}`;

const getDraftTotal = (draft: any) =>
  draft.cart?.reduce((sum: number, i: any) => sum + i.price * i.qty, 0) || 0;

function getDateRangeFromLabel(label: string): { from: string | null; to: string | null } {
  const today = dayjs();
  switch (label) {
    case "Today": return { from: today.format("YYYY-MM-DD"), to: today.format("YYYY-MM-DD") };
    case "Yesterday": { const y = today.subtract(1, "day"); return { from: y.format("YYYY-MM-DD"), to: y.format("YYYY-MM-DD") }; }
    case "This Week": return { from: today.startOf("week").format("YYYY-MM-DD"), to: today.endOf("week").format("YYYY-MM-DD") };
    case "This Month": return { from: today.startOf("month").format("YYYY-MM-DD"), to: today.endOf("month").format("YYYY-MM-DD") };
    case "Last 3 Months": return { from: today.subtract(3, "month").startOf("month").format("YYYY-MM-DD"), to: today.format("YYYY-MM-DD") };
    case "Last 6 Months": return { from: today.subtract(6, "month").startOf("month").format("YYYY-MM-DD"), to: today.format("YYYY-MM-DD") };
    case "This Year": return { from: today.startOf("year").format("YYYY-MM-DD"), to: today.endOf("year").format("YYYY-MM-DD") };
    default: return { from: null, to: null };
  }
}

function normalizeOrderType(v?: string) {
  return v?.toLowerCase().replace(/\s+/g, "_") ?? "";
}

function getStatusMeta(order: any): { label: string; color: string } {
  if (order.status === "paid") return { label: "PAID", color: "#16A34A" };
  if (order.status === "billed") return { label: "BILLED", color: "#2563EB" };
  if (order.mode === "draft") return { label: "DRAFT", color: "#F59E0B" };
  const map: Record<string, { label: string; color: string }> = {
    placed: { label: "PLACED", color: "#F59E0B" },
    confirmed: { label: "CONFIRMED", color: "#2563EB" },
    preparing: { label: "PREPARING", color: "#8B5CF6" },
    ready: { label: "READY", color: "#0EA5E9" },
    delivered: { label: "DELIVERED", color: "#16A34A" },
    cancelled: { label: "CANCELLED", color: "#DC2626" },
  };
  return map[(order.order_status || "").toLowerCase()] ?? { label: (order.order_status || "").toUpperCase(), color: TX3 };
}

function getItemName(item: any): string {
  return item.menu_item?.item_name ?? item.menu_item?.translations?.[0]?.item_name ?? `Item #${item.menu_item_id}`;
}

export default function OrdersHistory() {
  const navigate = useNavigate();
  const { orders, loading, fetchOrders, ordersTotal } = useOrders();
  const token = localStorage.getItem("token");
  const { waiters } = useWaiters();

  // ── Filter state ──────────────────────────────────────────────
  const [dateLabel, setDateLabel] = useState("Today");
  const [fromDate, setFromDate] = useState<string | null>(() => dayjs().format("YYYY-MM-DD"));
  const [toDate, setToDate] = useState<string | null>(() => dayjs().format("YYYY-MM-DD"));
  const [selectedOrderGroup, setSelectedOrderGroup] = useState<OrderGroup>("all");
  const [selectedWaiter, setSelectedWaiter] = useState<number | null>(null);
  const [deliveryPlatform, setDeliveryPlatform] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 20;

  // ── Calendar pickers ─────────────────────────────────────────
  const [showFromCal, setShowFromCal] = useState(false);
  const [showToCal, setShowToCal] = useState(false);

  // ── Bill drawer / checkout ───────────────────────────────────
  const [billDrawerOpen, setBillDrawerOpen] = useState(false);
  const [billedOrderData, setBilledOrderData] = useState<any>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutOrder, setCheckoutOrder] = useState<any>(null);

  // ── Draft orders (localStorage) ──────────────────────────────
  const draftOrders = useMemo(() => {
    const drafts = JSON.parse(localStorage.getItem("pos_draft_orders") || "[]");
    const offline = JSON.parse(localStorage.getItem("offlineOrders") || "[]");
    return [
      ...drafts,
      ...offline.map((o: any) => ({
        ...o,
        mode: "offline",
        order_number: o.orderNumber,
        created_at: o._createdAt || o.createdAt,
        order_type: { order_type_name: o.orderType?.type || "offline" },
        cart: o.cart || [],
        kot: [],
        kot_count: 0,
        total: o.cart?.reduce((s: number, i: any) => s + i.price * i.qty, 0) || 0,
      })),
    ];
  }, []);

  // ── Map group → API order_type ────────────────────────────────
  const apiOrderType = useMemo(() => {
    if (selectedOrderGroup === "dine_in" || selectedOrderGroup === "delivery" || selectedOrderGroup === "pickup")
      return selectedOrderGroup;
    return "";
  }, [selectedOrderGroup]);

  // ── Single authoritative fetch effect ────────────────────────
  useEffect(() => {
    fetchOrders({
      page,
      per_page: perPage,
      from_date: fromDate || "",
      to_date: toDate || "",
      waiter_id: selectedWaiter || "",
      order_type: apiOrderType,
      delivery_platform: deliveryPlatform,
    });
  }, [page, fromDate, toDate, selectedWaiter, apiOrderType, deliveryPlatform]);

  // ── All orders = drafts + API orders ─────────────────────────
  const allOrders = useMemo(() => {
    if (selectedOrderGroup === "draft") return draftOrders;
    if (selectedOrderGroup === "all") return [...draftOrders, ...orders];
    return orders;
  }, [draftOrders, orders, selectedOrderGroup]);

  // ── Client-side filter (draft/billed/kot are local-only) ─────
  const filteredOrders = useMemo(() => {
    return allOrders.filter((order: any) => {
      switch (selectedOrderGroup) {
        case "draft": return order.mode === "draft" || order.mode === "offline";
        case "billed": return order.status === "billed" || order.status === "paid";
        case "kot": return (order.kot_count || order.kot?.length || 0) > 0;
        default: return true;
      }
    });
  }, [allOrders, selectedOrderGroup]);

  // ── Order counts for dropdown labels ─────────────────────────
  const orderCounts = useMemo(() => {
    const counts = { all: allOrders.length, dine_in: 0, delivery: 0, pickup: 0, kot: 0, billed: 0, draft: 0 };
    allOrders.forEach((o: any) => {
      if (o.mode === "draft") { counts.draft++; return; }
      const t = normalizeOrderType(o.order_type?.order_type_name);
      if (t === "dine_in") counts.dine_in++;
      if (t === "delivery") counts.delivery++;
      if (t === "pickup") counts.pickup++;
      if ((o.kot_count || o.kot?.length || 0) > 0) counts.kot++;
      if (o.status === "paid" || o.status === "billed") counts.billed++;
    });
    return counts;
  }, [allOrders]);

  // ── Drawer helpers ────────────────────────────────────────────
  const drawerNextStatus = useMemo(() => {
    if (!billedOrderData?.order_status) return null;
    const statuses = ORDER_STATUS_UI.map((s) => s.key);
    const idx = statuses.indexOf(billedOrderData.order_status);
    return idx === -1 || idx === statuses.length - 1 ? null : statuses[idx + 1];
  }, [billedOrderData]);

  const drawerItems = useMemo(() => {
    if (!billedOrderData?.kot?.length) return [];
    return billedOrderData.kot.flatMap((k: any) =>
      (k.items || []).map((i: any) => ({
        id: i.id,
        name: i.menu_item?.item_name ?? i.menu_item?.translations?.[0]?.item_name ?? "Item",
        qty: i.quantity,
        price: Number(i.price) || Number(i.amount) || Number(i.menu_item?.price) || 0,
      }))
    );
  }, [billedOrderData]);

  // ── Handlers ──────────────────────────────────────────────────
  const handleDatePreset = useCallback((label: string) => {
    setDateLabel(label);
    const { from, to } = getDateRangeFromLabel(label);
    setFromDate(from);
    setToDate(to);
    setPage(1);
  }, []);

  const handleOrderGroupChange = useCallback((group: OrderGroup) => {
    setSelectedOrderGroup(group);
    setPage(1);
  }, []);

  const handleWaiterChange = useCallback((waiterId: number | null) => {
    setSelectedWaiter(waiterId);
    setPage(1);
  }, []);

  const handleDeliveryPlatformChange = useCallback((platform: string) => {
    setDeliveryPlatform(platform === "all_delivery" ? "" : platform);
    setPage(1);
  }, []);

  const handleOrderClick = useCallback((order: any) => {
    if (order.mode === "draft") { navigate("/poss", { state: { draftOrder: order } }); return; }
    const isBilled = order.status === "billed" || order.status === "paid";
    navigate("/poss", { state: { mode: isBilled ? "view" : "kot", tableId: order.table_id, activeOrder: order, orderId: order.id, orderNumber: order.order_number } });
  }, [navigate]);

  const handleNewKot = useCallback((e: React.MouseEvent, order: any) => {
    e.stopPropagation();
    navigate("/poss", { state: { mode: "new_kot", tableId: order.table_id, activeOrder: order, orderId: order.id, orderNumber: order.order_number } });
  }, [navigate]);

  const moveDrawerToNextStep = useCallback(async () => {
    if (!billedOrderData) return;
    const statuses = ORDER_STATUS_UI.map((s) => s.key);
    const idx = statuses.indexOf(billedOrderData.order_status);
    if (idx === -1 || idx === statuses.length - 1) return;
    setBilledOrderData((prev: any) => ({ ...prev, order_status: statuses[idx + 1] }));
  }, [billedOrderData]);

  const handleDeleteDrawerItem = useCallback((item: any) => {
    setBilledOrderData((prev: any) => ({
      ...prev,
      kot: prev.kot.map((k: any) => ({ ...k, items: (k.items || []).filter((i: any) => i.id !== item.id) })),
    }));
  }, []);

  const getItemCountText = useCallback((order: any) => {
    if (order.mode === "draft") return `${order.cart?.length ?? 0} Item(s)`;
    return `${order.kot?.reduce((s: number, k: any) => s + (k.items?.length || 0), 0) || 0} Item(s)`;
  }, []);

  const getOrderTypeIcon = useCallback((type?: string) => {
    if (!type) return null;
    const t = type.toLowerCase();
    if (t.includes("delivery")) return delivery;
    if (t.includes("pickup")) return orderIcon;
    return null;
  }, []);

  const toYMD = (d: Date) => dayjs(d).format("YYYY-MM-DD");

  // ── Render ────────────────────────────────────────────────────
  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", backgroundColor: BG, fontFamily: FONT }}>

      {/* ── FILTER BAR ── */}
      <Box sx={{ backgroundColor: "#fff", borderBottom: `1px solid ${BDR}`, px: 3, py: 1.2, display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>

        {/* Date preset */}
        <FormControl size="small">
          <Select value={dateLabel} onChange={(e) => handleDatePreset(e.target.value)} sx={{ ...selectSx, minWidth: 130 }} IconComponent={KeyboardArrowDownIcon}>
            {DATE_PRESETS.map((d) => <MenuItem key={d} value={d}>{d}</MenuItem>)}
          </Select>
        </FormControl>

        {/* From date */}
        <Box sx={{ position: "relative" }}>
          <Box
            onClick={() => { setShowFromCal((v) => !v); setShowToCal(false); }}
            sx={{ display: "flex", alignItems: "center", gap: 1, border: `1px solid ${BDR}`, borderRadius: "8px", px: 1.5, height: 36, background: "#fff", cursor: "pointer", minWidth: 140, "&:hover": { borderColor: TX3 } }}
          >
            <CalendarTodayIcon sx={{ fontSize: 14, color: TX3 }} />
            <Typography sx={{ fontSize: 13, color: fromDate ? TX : TX3, fontFamily: FONT }}>
              {fromDate ? dayjs(fromDate).format("DD/MM/YYYY") : "From date"}
            </Typography>
          </Box>
          {showFromCal && (
            <Box sx={{ position: "absolute", top: 42, left: 0, zIndex: 2000, boxShadow: "0 8px 24px rgba(0,0,0,.15)", borderRadius: "10px", overflow: "hidden" }}>
              <Calendar onChange={(d) => { setFromDate(toYMD(d as Date)); setShowFromCal(false); setPage(1); }} value={fromDate ? new Date(fromDate) : null} />
            </Box>
          )}
        </Box>

        <Typography sx={{ fontSize: 13, color: TX2, fontFamily: FONT }}>To</Typography>

        {/* To date */}
        <Box sx={{ position: "relative" }}>
          <Box
            onClick={() => { setShowToCal((v) => !v); setShowFromCal(false); }}
            sx={{ display: "flex", alignItems: "center", gap: 1, border: `1px solid ${BDR}`, borderRadius: "8px", px: 1.5, height: 36, background: "#fff", cursor: "pointer", minWidth: 140, "&:hover": { borderColor: TX3 } }}
          >
            <CalendarTodayIcon sx={{ fontSize: 14, color: TX3 }} />
            <Typography sx={{ fontSize: 13, color: toDate ? TX : TX3, fontFamily: FONT }}>
              {toDate ? dayjs(toDate).format("DD/MM/YYYY") : "To date"}
            </Typography>
          </Box>
          {showToCal && (
            <Box sx={{ position: "absolute", top: 42, left: 0, zIndex: 2000, boxShadow: "0 8px 24px rgba(0,0,0,.15)", borderRadius: "10px", overflow: "hidden" }}>
              <Calendar minDate={fromDate ? new Date(fromDate) : undefined} onChange={(d) => { setToDate(toYMD(d as Date)); setShowToCal(false); setPage(1); }} value={toDate ? new Date(toDate) : null} />
            </Box>
          )}
        </Box>

        {/* Order group */}
        <FormControl size="small">
          <Select value={selectedOrderGroup} onChange={(e) => handleOrderGroupChange(e.target.value as OrderGroup)} sx={{ ...selectSx, minWidth: 190 }} IconComponent={KeyboardArrowDownIcon}>
            {ORDER_GROUPS.map((g) => (
              <MenuItem key={g.key} value={g.key}>{g.label} ({orderCounts[g.key]})</MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Waiter */}
        <FormControl size="small">
          <Select
            value={selectedWaiter ?? "all"}
            onChange={(e) => handleWaiterChange(e.target.value === "all" ? null : Number(e.target.value))}
            sx={{ ...selectSx, minWidth: 160 }}
            IconComponent={KeyboardArrowDownIcon}
          >
            <MenuItem value="all">Show All Waiter</MenuItem>
            {waiters.map((w: any) => <MenuItem key={w.id} value={w.id}>{w.name}</MenuItem>)}
          </Select>
        </FormControl>
      </Box>

      {/* ── CARD GRID ── */}
      <Box sx={{ p: 2.5, flex: 1 }}>
        {loading && (
          <Typography sx={{ fontSize: 13, color: TX2, fontFamily: FONT, mb: 2 }}>Loading orders…</Typography>
        )}

        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 2 }}>
          {filteredOrders.map((order: any, index: number) => {
            const status = getStatusMeta(order);
            const icon = getOrderTypeIcon(order.order_type?.order_type_name);
            const kotCount = order.kot_count || order.kot?.length || 0;
            const latestKot = [...(order.kot || [])].sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()).at(-1);
            const orderNum = order.mode === "draft" || order.mode === "offline"
              ? getDraftDisplayNumber(order, index)
              : order.show_formatted_order_number || `#${order.order_number}`;
            const orderTypeName = order.mode === "draft"
              ? order.orderType?.type?.replace("_", " ") || "Draft"
              : order.order_type?.order_type_name || "";
            const totalAmount = order.mode === "draft" ? getDraftTotal(order) : order.total;

            return (
              <Box
                key={order.id || index}
                onClick={() => handleOrderClick(order)}
                sx={{
                  backgroundColor: "#fff", borderRadius: "12px",
                  border: `1px solid ${BDR}`, boxShadow: "0 2px 8px rgba(100,60,10,.06)",
                  display: "flex", flexDirection: "column", overflow: "hidden",
                  cursor: "pointer", transition: "box-shadow .2s,transform .2s",
                  "&:hover": { boxShadow: "0 8px 24px rgba(100,60,10,.13)", transform: "translateY(-2px)" },
                }}
              >
                {/* Top row: icon + info + chips */}
                <Box sx={{ p: 1.5, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
                    <Box sx={{ width: 40, height: 40, borderRadius: "10px", flexShrink: 0, background: icon ? "#FEF2F2" : "linear-gradient(135deg,#FF3D0120,#FF6B6B30)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {icon
                        ? <img src={icon} width={22} alt="type" />
                        : <Typography sx={{ fontSize: 10, fontWeight: 700, color: "#FF3D01", textAlign: "center", lineHeight: 1.2 }}>
                            {order.customer?.name?.split(" ")[0]?.slice(0, 2)?.toUpperCase() || "--"}
                          </Typography>
                      }
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: 13, fontWeight: 700, color: TX, fontFamily: FONT, lineHeight: 1.3 }}>
                        {order.customer?.name || "--"}
                      </Typography>
                      <Typography sx={{ fontSize: 12, fontWeight: 600, color: TX2, fontFamily: FONT }}>
                        Order {orderNum}
                      </Typography>
                      <Typography sx={{ fontSize: 11, color: TX3, fontFamily: FONT, textTransform: "capitalize" }}>
                        {orderTypeName}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, alignItems: "flex-end" }}>
                    {order.status === "paid" && (
                      <Box sx={{ px: 1, py: 0.2, borderRadius: "5px", backgroundColor: "#DCFCE7" }}>
                        <Typography sx={{ fontSize: 10, fontWeight: 700, color: "#15803D", fontFamily: FONT }}>PAID</Typography>
                      </Box>
                    )}
                    {order.status === "billed" && (
                      <Box sx={{ px: 1, py: 0.2, borderRadius: "5px", backgroundColor: "#DBEAFE" }}>
                        <Typography sx={{ fontSize: 10, fontWeight: 700, color: "#1D4ED8", fontFamily: FONT }}>BILLED</Typography>
                      </Box>
                    )}
                    {order.status !== "paid" && order.status !== "billed" && kotCount > 0 && (
                      <Box sx={{ px: 1, py: 0.2, borderRadius: "5px", backgroundColor: "#FEF3C7" }}>
                        <Typography sx={{ fontSize: 10, fontWeight: 700, color: "#B45309", fontFamily: FONT }}>KOT × {kotCount}</Typography>
                      </Box>
                    )}
                    {order.placed_via && (
                      <Box sx={{ px: 1, py: 0.2, borderRadius: "5px", backgroundColor: "#DBEAFE" }}>
                        <Typography sx={{ fontSize: 10, fontWeight: 600, color: "#1E40AF", fontFamily: FONT }}>{order.placed_via.toUpperCase()}</Typography>
                      </Box>
                    )}
                  </Box>
                </Box>

                {/* Dates + item count */}
                <Box sx={{ px: 1.5, pb: 0.8, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                  <Box>
                    {order.mode !== "draft" && order.mode !== "offline" &&
                      normalizeOrderType(order.order_type?.order_type_name) === "pickup" && (
                      <Typography sx={{ fontSize: 10.5, color: TX3, fontFamily: FONT }}>
                        Pickup Date: {dayjs(order.created_at).format("DD/MM/YYYY hh:mm A")}
                      </Typography>
                    )}
                    <Typography sx={{ fontSize: 10.5, color: TX3, fontFamily: FONT }}>
                      Order Date: {dayjs(order.mode === "draft" ? order.createdAt : order.created_at).format("DD/MM/YYYY hh:mm A")}
                    </Typography>
                  </Box>
                  <Typography sx={{ fontSize: 11, fontWeight: 600, color: TX2, fontFamily: FONT, whiteSpace: "nowrap" }}>
                    {getItemCountText(order)}
                  </Typography>
                </Box>

                <Divider sx={{ borderColor: BDR }} />

                {/* Items preview */}
                <Box sx={{ px: 1.5, py: 0.8, minHeight: 44 }}>
                  {order.mode === "draft" || order.mode === "offline"
                    ? order.cart?.slice(0, 2).map((item: any, idx: number) => (
                        <Typography key={idx} sx={{ fontSize: 12, color: TX2, fontFamily: FONT }}>
                          {item.name} × {item.qty}
                        </Typography>
                      ))
                    : latestKot?.items?.slice(0, 2).map((item: any) => (
                        <Typography key={item.id} sx={{ fontSize: 12, color: TX2, fontFamily: FONT }}>
                          {getItemName(item)} × {item.quantity}
                        </Typography>
                      ))
                  }
                </Box>

                <Divider sx={{ borderColor: BDR }} />

                {/* Footer: amount + status + New KOT */}
                <Box sx={{ px: 1.5, py: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Box>
                    <Typography sx={{ fontSize: 16, fontWeight: 700, color: TX, fontFamily: FONT }}>
                      ₹{Number(totalAmount || 0).toFixed(2)}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.3 }}>
                      <Box sx={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: status.color }} />
                      <Typography sx={{ fontSize: 11, fontWeight: 600, color: status.color, fontFamily: FONT, letterSpacing: 0.3 }}>
                        {status.label}
                      </Typography>
                    </Box>
                    {order.waiter?.name && (
                      <Typography sx={{ fontSize: 11, color: TX3, fontFamily: FONT }}>
                        Waiter: {order.waiter.name}
                      </Typography>
                    )}
                  </Box>

                  <MuiButton
                    size="small"
                    variant="outlined"
                    onClick={(e) => handleNewKot(e, order)}
                    sx={{
                      fontSize: 11, fontWeight: 600, textTransform: "none",
                      borderColor: BDR, color: TX2, borderRadius: "8px",
                      fontFamily: FONT, px: 1.2,
                      "&:hover": { borderColor: ACCENT, color: ACCENT, backgroundColor: "rgba(255,61,1,0.06)" },
                    }}
                  >
                    New KOT
                  </MuiButton>
                </Box>
              </Box>
            );
          })}
        </Box>

        {/* ── Pagination ── */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 1.5, mt: 3 }}>
          <MuiButton
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            variant="outlined"
            sx={{ textTransform: "none", fontSize: 13, fontFamily: FONT, borderColor: BDR, color: TX2, borderRadius: "8px", "&:hover": { borderColor: ACCENT, color: ACCENT } }}
          >
            Previous
          </MuiButton>
          <Box sx={{ px: 2, py: 0.5, borderRadius: "8px", backgroundColor: "rgba(255,61,1,0.07)" }}>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: ACCENT, fontFamily: FONT }}>Page {page}</Typography>
          </Box>
          <MuiButton
            disabled={page * perPage >= ordersTotal}
            onClick={() => setPage((p) => p + 1)}
            variant="outlined"
            sx={{ textTransform: "none", fontSize: 13, fontFamily: FONT, borderColor: BDR, color: TX2, borderRadius: "8px", "&:hover": { borderColor: ACCENT, color: ACCENT } }}
          >
            Next
          </MuiButton>
        </Box>
      </Box>

      {/* ── BillDrawer ── */}
      <BillDrawer
        billDrawerOpen={billDrawerOpen}
        setBillDrawerOpen={setBillDrawerOpen}
        setBilledOrderData={setBilledOrderData}
        billedOrderData={billedOrderData}
        drawerItems={drawerItems}
        drawerCustomer={billedOrderData?.customer}
        orderStatusUI={ORDER_STATUS_UI}
        drawerNextStatus={drawerNextStatus}
        moveDrawerToNextStep={moveDrawerToNextStep}
        handleDrawerPrint={() => window.print()}
        handleDeleteDrawerItem={handleDeleteDrawerItem}
        PAYMENT_OPTIONS={PAYMENT_OPTIONS}
        token={token}
        setCustomerModalOpen={() => {}}
        setCheckoutOpen={setCheckoutOpen}
        setCheckoutOrder={setCheckoutOrder}
        showError={(msg: string) => alert(msg)}
        saveNewOrder={async () => {}}
      />

      {/* ── CheckoutModal ── */}
      <CheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        orderNumber={checkoutOrder?.order_number}
        totalAmount={Number(checkoutOrder?.total || 0)}
        cart={checkoutOrder?.kot?.flatMap((k: any) => k.items) || []}
        orderId={checkoutOrder?.id}
        onPaymentSuccess={(paymentData: { received_amount: any; payment_method: any }) => {
          const paidAmount = Number(paymentData?.received_amount) || Number(checkoutOrder?.total);
          setCheckoutOpen(false);
          setBilledOrderData({
            ...checkoutOrder,
            status: "paid",
            payment_status: "paid",
            amount_paid: paidAmount,
            payments: [{ id: Date.now(), payment_method: paymentData?.payment_method || "cash", amount: paidAmount }],
          });
        }}
      />
    </Box>
  );
}
