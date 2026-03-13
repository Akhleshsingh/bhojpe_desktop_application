import {
  Box,
  Typography,
  Divider,
  Select,
  MenuItem,
  FormControl,
  Button as MuiButton,
  Chip,
} from "@mui/material";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { useOrders } from "../context/OrdersContext";
import delivery from "../assets/image 358 (1).png";
import orderIcon from "../assets/image 358.png";
import { useWaiters } from "../context/WaitersContext";
import { useNavigate } from "react-router-dom";
import React from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import calendericon from "../assets/calendar.png";
import BillDrawer from "../components/BillDrawer";
import CheckoutModal from "../components/CheckoutModal";
import AddIcon from "@mui/icons-material/Add";
import MergeIcon from "@mui/icons-material/CallMerge";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";

type OrderGroup = "all" | "dine_in" | "delivery" | "pickup" | "draft" | "billed" | "kot";

const PAYMENT_OPTIONS = [
  { value: "cash", label: "Cash" },
  { value: "card", label: "Card" },
  { value: "upi", label: "UPI" },
];

const orderStatusUI = [
  { key: "placed", label: "Placed" },
  { key: "confirmed", label: "Confirmed" },
  { key: "preparing", label: "Preparing" },
  { key: "food_ready", label: "Ready" },
  { key: "served", label: "Served" },
  { key: "delivered", label: "Delivered" },
];

const getDraftDisplayNumber = (draft: any, index: number) =>
  `D-${draft._draftId?.toString().slice(-4) || index + 1}`;

const getDraftTotal = (draft: any) =>
  draft.cart?.reduce((sum: number, i: any) => sum + i.price * i.qty, 0) || 0;

const selectSx = {
  height: 36,
  fontSize: 13,
  fontFamily: "Poppins, sans-serif",
  backgroundColor: "#FFFFFF",
  borderRadius: "8px",
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "#D1D5DB" },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#9CA3AF" },
  "& .MuiSelect-icon": { fontSize: 18, color: "#6B7280" },
};

export default function OrdersHistory() {
  const navigate = useNavigate();
  const { orders, loading, fetchOrders, ordersTotal } = useOrders();
  const { filters } = useOrders();
  const token = localStorage.getItem("token");
  const { waiters } = useWaiters();
  const [dateLabel, setDateLabel] = useState("Today");
  const [orderLabel, setOrderLabel] = useState("Show All Orders");
  const [waiterLabel, setWaiterLabel] = useState("Show All Waiter");
  const [selectedOrderNo, setSelectedOrderNo] = useState<string | null>(null);
  const [billDrawerOpen, setBillDrawerOpen] = useState(false);
  const [billedOrderData, setBilledOrderData] = useState<any>(null);
  const [selectedWaiter, setSelectedWaiter] = useState<number | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutOrder, setCheckoutOrder] = useState<any>(null);
  const [page, setPage] = useState(1);
  const perPage = 10;
  const [fromDate, setFromDate] = useState<string | null>(null);
  const [toDate, setToDate] = useState<string | null>(null);
  const toDateObj = (d: string | null) => (d ? new Date(d) : null);
  const toYMD = (d: Date | null) => (d ? dayjs(d).format("YYYY-MM-DD") : null);
  const [selectedOrderGroup, setSelectedOrderGroup] = useState<OrderGroup>("all");
  const [showFromCal, setShowFromCal] = useState(false);
  const [showToCal, setShowToCal] = useState(false);

  const draftOrders = React.useMemo(() => {
    const drafts = JSON.parse(localStorage.getItem("pos_draft_orders") || "[]");
    const offline = JSON.parse(localStorage.getItem("offlineOrders") || "[]");
    const normalizedOffline = offline.map((o: any) => ({
      ...o,
      mode: "offline",
      order_number: o.orderNumber,
      created_at: o._createdAt || o.createdAt,
      order_type: { order_type_name: o.orderType?.type || "offline" },
      cart: o.cart || [],
      kot: [],
      kot_count: 0,
      total: o.cart?.reduce((s: number, i: any) => s + i.price * i.qty, 0) || 0,
    }));
    return [...drafts, ...normalizedOffline];
  }, []);

  const allOrders = React.useMemo(() => {
    if (selectedOrderGroup === "draft") return draftOrders;
    if (selectedOrderGroup === "all") return [...draftOrders, ...orders];
    return orders;
  }, [draftOrders, orders, selectedOrderGroup]);

  const getOrderTypeIcon = (type?: string) => {
    if (!type) return null;
    const t = type.toLowerCase();
    if (t.includes("delivery")) return delivery;
    if (t.includes("pickup")) return orderIcon;
    return null;
  };

  const getDateRangeFromLabel = (label: string) => {
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
  };

  const normalizeOrderType = (v?: string) => v?.toLowerCase().replace(/\s+/g, "_");

  useEffect(() => {
    fetchOrders({ page, per_page: perPage, waiter_id: selectedWaiter || "", from_date: fromDate || "", to_date: toDate || "" });
  }, [page, selectedWaiter, fromDate, toDate]);

  const ORDER_GROUPS = [
    { key: "all", label: "Show All Orders" },
    { key: "dine_in", label: "Dine-In Orders" },
    { key: "delivery", label: "Delivery Orders" },
    { key: "pickup", label: "Pickup Orders" },
    { key: "kot", label: "KOT Orders" },
    { key: "billed", label: "Billed Orders" },
    { key: "draft", label: "Draft Orders" },
  ] as const;

  const moveDrawerToNextStep = async () => {
    if (!billedOrderData) return;
    const statuses = orderStatusUI.map((s) => s.key);
    const currentIndex = statuses.indexOf(billedOrderData.order_status);
    if (currentIndex === -1 || currentIndex === statuses.length - 1) return;
    setBilledOrderData((prev: any) => ({ ...prev, order_status: statuses[currentIndex + 1] }));
  };

  const handleDeleteDrawerItem = (item: any) => {
    setBilledOrderData((prev: any) => ({
      ...prev,
      kot: prev.kot.map((k: any) => ({ ...k, items: (k.items || []).filter((i: any) => i.id !== item.id) })),
    }));
  };

  const orderCounts = React.useMemo(() => {
    const counts = { all: allOrders.length, dine_in: 0, delivery: 0, pickup: 0, kot: 0, billed: 0, draft: 0 };
    allOrders.forEach((order: any) => {
      if (order.mode === "draft") { counts.draft++; return; }
      const type = normalizeOrderType(order.order_type?.order_type_name);
      if (type === "dine_in") counts.dine_in++;
      if (type === "delivery") counts.delivery++;
      if (type === "pickup") counts.pickup++;
      if (order.kot_count > 0) counts.kot++;
      if (order.status === "paid") counts.billed++;
    });
    return counts;
  }, [allOrders]);

  const filteredOrders = allOrders.filter((order: any) => {
    const matchWaiter = !selectedWaiter || order.waiter?.id === selectedWaiter;
    let matchGroup = true;
    switch (selectedOrderGroup) {
      case "draft": matchGroup = order.mode === "draft" || order.mode === "offline"; break;
      case "dine_in": case "delivery": case "pickup":
        matchGroup = normalizeOrderType(order.order_type?.order_type_name) === selectedOrderGroup; break;
      case "kot": matchGroup = order.kot_count > 0; break;
      case "billed": matchGroup = order.status === "billed" || order.status === "paid"; break;
      default: matchGroup = true;
    }
    return matchGroup && matchWaiter;
  });

  const drawerNextStatus = React.useMemo(() => {
    if (!billedOrderData?.order_status) return null;
    const statuses = orderStatusUI.map((s) => s.key);
    const index = statuses.indexOf(billedOrderData.order_status);
    if (index === -1 || index === statuses.length - 1) return null;
    return statuses[index + 1];
  }, [billedOrderData]);

  const getStatusMeta = (order: any) => {
    const status = (order.order_status || "").toLowerCase();
    const map: Record<string, { label: string; color: string }> = {
      placed: { label: "PLACED", color: "#F59E0B" },
      confirmed: { label: "CONFIRMED", color: "#2563EB" },
      preparing: { label: "PREPARING", color: "#8B5CF6" },
      ready: { label: "READY", color: "#0EA5E9" },
      delivered: { label: "DELIVERED", color: "#16A34A" },
      cancelled: { label: "CANCELLED", color: "#DC2626" },
    };
    if (order.status === "paid") return { label: "PAID", color: "#16A34A" };
    if (order.status === "billed") return { label: "BILLED", color: "#2563EB" };
    if (order.mode === "draft") return { label: "DRAFT", color: "#F59E0B" };
    return map[status] || { label: status.toUpperCase(), color: "#6B7280" };
  };

  const handleOrderClick = (order: any) => {
    if (order.mode === "draft") { navigate("/menudashboard", { state: { draftOrder: order } }); return; }
    const isBilled = order.status === "billed" || order.status === "paid";
    if (isBilled) { setBilledOrderData(order); setBillDrawerOpen(true); return; }
    navigate("/menudashboard", { state: { mode: "kot", tableId: order.table_id, activeOrder: order, orderId: order.id, orderNumber: order.order_number } });
  };

  const drawerItems = React.useMemo(() => {
    if (!billedOrderData?.kot?.length) return [];
    return billedOrderData.kot.flatMap((k: any) =>
      (k.items || []).map((i: any) => ({
        id: i.id,
        name: i.menu_item?.item_name || i.menu_item?.translations?.[0]?.item_name || "Item",
        qty: i.quantity,
        price: Number(i.price) || Number(i.amount) || Number(i.menu_item?.price) || 0,
      }))
    );
  }, [billedOrderData]);

  const getItemCountText = (order: any) => {
    if (order.mode === "draft") return `${order.cart?.length ?? 0} Item(s)`;
    const totalItems = order.kot?.reduce((sum: number, k: any) => sum + (k.items?.length || 0), 0) || 0;
    return `${totalItems} Item(s)`;
  };

  const getItemName = (item: any) =>
    item.menu_item?.item_name || item.menu_item?.translations?.[0]?.item_name || `Item #${item.menu_item_id}`;

  const handleNewKot = (e: React.MouseEvent, order: any) => {
    e.stopPropagation();
    navigate("/menudashboard", { state: { mode: "kot", tableId: order.table_id, activeOrder: order, orderId: order.id, orderNumber: order.order_number } });
  };

  const DATE_OPTIONS = ["Today", "Yesterday", "This Week", "This Month", "Last 3 Months", "Last 6 Months", "This Year"];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", backgroundColor: "#F8FAFC", fontFamily: "Poppins, sans-serif" }}>

      {/* ── TOP HEADER BAR ── */}
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          backgroundColor: "#FFFFFF",
          borderBottom: "1px solid #E5E7EB",
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          px: 3,
          py: 1.2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Left: title + live badge */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Typography sx={{ fontSize: 18, fontWeight: 700, color: "#111827", fontFamily: "Poppins, sans-serif" }}>
            Orders
          </Typography>
          <Box
            sx={{
              px: 1.5, py: 0.2, borderRadius: "20px",
              background: "linear-gradient(135deg, #E8353A 0%, #FF6B6B 100%)",
              boxShadow: "0 2px 8px rgba(232,53,58,0.35)",
            }}
          >
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#FFF", fontFamily: "Poppins, sans-serif" }}>
              {allOrders.length}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.6, px: 1.2, py: 0.3, borderRadius: "20px", backgroundColor: "#DCFCE7" }}>
            <FiberManualRecordIcon sx={{ fontSize: 8, color: "#16A34A" }} />
            <Typography sx={{ fontSize: 11, fontWeight: 600, color: "#15803D", fontFamily: "Poppins, sans-serif" }}>
              Real Time Update
            </Typography>
          </Box>
        </Box>

        {/* Right: kitchen / delivery filter + action buttons */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <FormControl size="small">
            <Select value="all" sx={{ ...selectSx, minWidth: 90 }} IconComponent={KeyboardArrowDownIcon}>
              <MenuItem value="all">All</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small">
            <Select value="all_delivery" sx={{ ...selectSx, minWidth: 160 }} IconComponent={KeyboardArrowDownIcon}>
              <MenuItem value="all_delivery">All Delivery Apps</MenuItem>
              <MenuItem value="swiggy">Swiggy</MenuItem>
              <MenuItem value="zomato">Zomato</MenuItem>
            </Select>
          </FormControl>
          <MuiButton
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate("/menudashboard")}
            sx={{
              background: "linear-gradient(135deg, #E8353A 0%, #c62a2f 100%)",
              textTransform: "none", fontWeight: 600, fontSize: 13, height: 36, px: 2,
              borderRadius: "8px", fontFamily: "Poppins, sans-serif",
              boxShadow: "0 2px 8px rgba(232,53,58,0.35)",
              "&:hover": { background: "linear-gradient(135deg, #c62a2f 0%, #a02020 100%)" },
            }}
          >
            New Order
          </MuiButton>
          <MuiButton
            variant="outlined"
            startIcon={<MergeIcon />}
            sx={{
              borderColor: "#E8353A", color: "#E8353A", textTransform: "none",
              fontWeight: 600, fontSize: 13, height: 36, px: 2,
              borderRadius: "8px", fontFamily: "Poppins, sans-serif",
              "&:hover": { backgroundColor: "#FEF2F2", borderColor: "#c62a2f" },
            }}
          >
            Merge Order
          </MuiButton>
        </Box>
      </Box>

      {/* ── FILTER BAR ── */}
      <Box
        sx={{
          backgroundColor: "#FFFFFF",
          borderBottom: "1px solid #F1F5F9",
          px: 3, py: 1.2,
          display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap",
        }}
      >
        {/* Date preset */}
        <FormControl size="small">
          <Select
            value={dateLabel}
            onChange={(e) => {
              const label = e.target.value;
              setDateLabel(label);
              const range = getDateRangeFromLabel(label);
              setFromDate(range.from);
              setToDate(range.to);
            }}
            sx={{ ...selectSx, minWidth: 130 }}
            IconComponent={KeyboardArrowDownIcon}
          >
            {DATE_OPTIONS.map((d) => <MenuItem key={d} value={d}>{d}</MenuItem>)}
          </Select>
        </FormControl>

        {/* From date */}
        <Box sx={{ position: "relative" }}>
          <Box
            onClick={() => { setShowFromCal((v) => !v); setShowToCal(false); }}
            sx={{
              display: "flex", alignItems: "center", gap: 1,
              border: "1px solid #D1D5DB", borderRadius: "8px",
              px: 1.5, height: 36, background: "#fff", cursor: "pointer",
              minWidth: 140,
              "&:hover": { borderColor: "#9CA3AF" },
            }}
          >
            <CalendarTodayIcon sx={{ fontSize: 14, color: "#9CA3AF" }} />
            <Typography sx={{ fontSize: 13, color: fromDate ? "#374151" : "#9CA3AF", fontFamily: "Poppins, sans-serif" }}>
              {fromDate ? dayjs(fromDate).format("DD/MM/YYYY") : "From date"}
            </Typography>
          </Box>
          {showFromCal && (
            <Box sx={{ position: "absolute", top: 42, left: 0, zIndex: 2000, boxShadow: "0 8px 24px rgba(0,0,0,0.15)", borderRadius: "10px", overflow: "hidden" }}>
              <Calendar onChange={(d) => { setFromDate(toYMD(d as Date)); setShowFromCal(false); }} value={fromDate ? new Date(fromDate) : null} />
            </Box>
          )}
        </Box>

        <Typography sx={{ fontSize: 13, color: "#6B7280", fontFamily: "Poppins, sans-serif" }}>To</Typography>

        {/* To date */}
        <Box sx={{ position: "relative" }}>
          <Box
            onClick={() => { setShowToCal((v) => !v); setShowFromCal(false); }}
            sx={{
              display: "flex", alignItems: "center", gap: 1,
              border: "1px solid #D1D5DB", borderRadius: "8px",
              px: 1.5, height: 36, background: "#fff", cursor: "pointer",
              minWidth: 140,
              "&:hover": { borderColor: "#9CA3AF" },
            }}
          >
            <CalendarTodayIcon sx={{ fontSize: 14, color: "#9CA3AF" }} />
            <Typography sx={{ fontSize: 13, color: toDate ? "#374151" : "#9CA3AF", fontFamily: "Poppins, sans-serif" }}>
              {toDate ? dayjs(toDate).format("DD/MM/YYYY") : "To date"}
            </Typography>
          </Box>
          {showToCal && (
            <Box sx={{ position: "absolute", top: 42, left: 0, zIndex: 2000, boxShadow: "0 8px 24px rgba(0,0,0,0.15)", borderRadius: "10px", overflow: "hidden" }}>
              <Calendar minDate={fromDate ? new Date(fromDate) : undefined} onChange={(d) => { setToDate(toYMD(d as Date)); setShowToCal(false); }} value={toDate ? new Date(toDate) : null} />
            </Box>
          )}
        </Box>

        {/* Order group filter */}
        <FormControl size="small">
          <Select
            value={selectedOrderGroup}
            onChange={(e) => setSelectedOrderGroup(e.target.value as OrderGroup)}
            sx={{ ...selectSx, minWidth: 170 }}
            IconComponent={KeyboardArrowDownIcon}
          >
            {ORDER_GROUPS.map((g) => (
              <MenuItem key={g.key} value={g.key}>
                {g.label} ({orderCounts[g.key as keyof typeof orderCounts]})
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Waiter filter */}
        <FormControl size="small">
          <Select
            value={selectedWaiter ?? "all"}
            onChange={(e) => {
              const v = e.target.value;
              setSelectedWaiter(v === "all" ? null : Number(v));
              setPage(1);
            }}
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
          <Typography sx={{ fontSize: 14, color: "#6B7280", fontFamily: "Poppins, sans-serif", mb: 2 }}>
            Loading orders...
          </Typography>
        )}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: 2,
          }}
        >
          {filteredOrders.map((order: any, index: number) => {
            const status = getStatusMeta(order);
            const icon = getOrderTypeIcon(order.order_type?.order_type_name);
            const kotCount = order.kot_count || order.kot?.length || 0;
            const latestKot = [...(order.kot || [])].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()).at(-1);
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
                  backgroundColor: "#FFFFFF",
                  borderRadius: "12px",
                  border: "1px solid #E5E7EB",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  p: 0,
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                  cursor: "pointer",
                  transition: "box-shadow 0.2s, transform 0.2s",
                  "&:hover": { boxShadow: "0 8px 24px rgba(0,0,0,0.12)", transform: "translateY(-2px)" },
                }}
              >
                {/* Card top section */}
                <Box sx={{ p: 1.5, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  {/* Left: icon + name + type */}
                  <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
                    <Box
                      sx={{
                        width: 40, height: 40, borderRadius: "10px", flexShrink: 0,
                        background: icon ? "#FEF2F2" : "linear-gradient(135deg, #E8353A20, #FF6B6B30)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}
                    >
                      {icon
                        ? <img src={icon} width={22} alt="type" />
                        : <Typography sx={{ fontSize: 10, fontWeight: 700, color: "#E8353A", textAlign: "center", lineHeight: 1.2 }}>
                            {order.customer?.name?.split(" ")[0]?.slice(0, 2)?.toUpperCase() || "--"}
                          </Typography>
                      }
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#111827", fontFamily: "Poppins, sans-serif", lineHeight: 1.3 }}>
                        {order.customer?.name || "--"}
                      </Typography>
                      <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#374151", fontFamily: "Poppins, sans-serif" }}>
                        Order {orderNum}
                      </Typography>
                      <Typography sx={{ fontSize: 11, color: "#9CA3AF", fontFamily: "Poppins, sans-serif", textTransform: "capitalize" }}>
                        {orderTypeName}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Right: status chips */}
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, alignItems: "flex-end" }}>
                    {order.status === "paid" && (
                      <Box sx={{ px: 1, py: 0.2, borderRadius: "5px", backgroundColor: "#DCFCE7" }}>
                        <Typography sx={{ fontSize: 10, fontWeight: 700, color: "#15803D", fontFamily: "Poppins, sans-serif" }}>PAID</Typography>
                      </Box>
                    )}
                    {order.status === "billed" && (
                      <Box sx={{ px: 1, py: 0.2, borderRadius: "5px", backgroundColor: "#DBEAFE" }}>
                        <Typography sx={{ fontSize: 10, fontWeight: 700, color: "#1D4ED8", fontFamily: "Poppins, sans-serif" }}>BILLED</Typography>
                      </Box>
                    )}
                    {order.status !== "paid" && order.status !== "billed" && kotCount > 0 && (
                      <Box sx={{ px: 1, py: 0.2, borderRadius: "5px", backgroundColor: "#FEF3C7" }}>
                        <Typography sx={{ fontSize: 10, fontWeight: 700, color: "#B45309", fontFamily: "Poppins, sans-serif" }}>KOT</Typography>
                      </Box>
                    )}
                    {order.placed_via && (
                      <Box sx={{ px: 1, py: 0.2, borderRadius: "5px", backgroundColor: "#DBEAFE" }}>
                        <Typography sx={{ fontSize: 10, fontWeight: 600, color: "#1E40AF", fontFamily: "Poppins, sans-serif" }}>
                          {order.placed_via.toUpperCase()}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>

                {/* Dates + item count */}
                <Box sx={{ px: 1.5, pb: 0.8, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                  <Box>
                    {order.mode !== "draft" && order.mode !== "offline" && (
                      <Typography sx={{ fontSize: 10.5, color: "#6B7280", fontFamily: "Poppins, sans-serif" }}>
                        Pickup Date: {dayjs(order.created_at).format("DD/MM/YYYY hh:mm A")}
                      </Typography>
                    )}
                    <Typography sx={{ fontSize: 10.5, color: "#6B7280", fontFamily: "Poppins, sans-serif" }}>
                      Order Date: {dayjs(order.mode === "draft" ? order.createdAt : order.created_at).format("DD/MM/YYYY hh:mm A")}
                    </Typography>
                  </Box>
                  <Typography sx={{ fontSize: 11, fontWeight: 600, color: "#374151", fontFamily: "Poppins, sans-serif", whiteSpace: "nowrap" }}>
                    {getItemCountText(order)}
                  </Typography>
                </Box>

                <Divider sx={{ borderColor: "#F3F4F6" }} />

                {/* Items preview */}
                <Box sx={{ px: 1.5, py: 0.8, minHeight: 44 }}>
                  {order.mode === "draft" || order.mode === "offline"
                    ? order.cart?.slice(0, 2).map((item: any, idx: number) => (
                        <Typography key={idx} sx={{ fontSize: 12, color: "#374151", fontFamily: "Poppins, sans-serif" }}>
                          {item.name} × {item.qty}
                        </Typography>
                      ))
                    : latestKot?.items?.slice(0, 2).map((item: any) => (
                        <Typography key={item.id} sx={{ fontSize: 12, color: "#374151", fontFamily: "Poppins, sans-serif" }}>
                          {getItemName(item)} × {item.quantity}
                        </Typography>
                      ))}
                </Box>

                <Divider sx={{ borderColor: "#F3F4F6" }} />

                {/* Footer: amount + status + KOT button */}
                <Box sx={{ px: 1.5, py: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Box>
                    <Typography sx={{ fontSize: 16, fontWeight: 700, color: "#111827", fontFamily: "Poppins, sans-serif" }}>
                      ₹{Number(totalAmount || 0).toFixed(2)}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.3 }}>
                      <Box sx={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: status.color }} />
                      <Typography sx={{ fontSize: 11, fontWeight: 600, color: status.color, fontFamily: "Poppins, sans-serif", letterSpacing: 0.3 }}>
                        {status.label}
                      </Typography>
                    </Box>
                    {order.waiter?.name && (
                      <Typography sx={{ fontSize: 11, color: "#9CA3AF", fontFamily: "Poppins, sans-serif" }}>
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
                      borderColor: "#D1D5DB", color: "#374151", borderRadius: "8px",
                      fontFamily: "Poppins, sans-serif", px: 1.2, py: 0.4,
                      "&:hover": { borderColor: "#E8353A", color: "#E8353A", backgroundColor: "#FEF2F2" },
                    }}
                  >
                    New KOT
                  </MuiButton>
                </Box>
              </Box>
            );
          })}
        </Box>

        {/* Pagination */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 1.5, mt: 3 }}>
          <MuiButton
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            variant="outlined"
            sx={{ textTransform: "none", fontSize: 13, fontFamily: "Poppins, sans-serif", borderColor: "#D1D5DB", color: "#374151", borderRadius: "8px", "&:hover": { borderColor: "#E8353A", color: "#E8353A" } }}
          >
            Previous
          </MuiButton>
          <Box sx={{ px: 2, py: 0.5, borderRadius: "8px", backgroundColor: "#F3F4F6" }}>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#374151", fontFamily: "Poppins, sans-serif" }}>
              Page {page}
            </Typography>
          </Box>
          <MuiButton
            disabled={page * perPage >= ordersTotal}
            onClick={() => setPage((p) => p + 1)}
            variant="outlined"
            sx={{ textTransform: "none", fontSize: 13, fontFamily: "Poppins, sans-serif", borderColor: "#D1D5DB", color: "#374151", borderRadius: "8px", "&:hover": { borderColor: "#E8353A", color: "#E8353A" } }}
          >
            Next
          </MuiButton>
        </Box>
      </Box>

      {/* BillDrawer + CheckoutModal — functionality preserved */}
      <BillDrawer
        billDrawerOpen={billDrawerOpen}
        setBillDrawerOpen={setBillDrawerOpen}
        setBilledOrderData={setBilledOrderData}
        billedOrderData={billedOrderData}
        drawerItems={drawerItems}
        drawerCustomer={billedOrderData?.customer}
        orderStatusUI={orderStatusUI}
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
