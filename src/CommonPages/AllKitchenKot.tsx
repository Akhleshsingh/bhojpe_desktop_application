import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Chip,
  TextField,
  Dialog,
  DialogContent,
  MenuItem,
  Select,
  FormControl,
} from "@mui/material";
import PrintIcon from "@mui/icons-material/Print";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

type ItemStatus = "pending" | "cooking" | "ready";

type Item = {
  id: number;
  name: string;
  qty: number;
  status: ItemStatus;
};

type Kot = {
  id: number;
  order: number;
  type: "Dine" | "Delivery";
  date: string;
  time: string;
  table: number;
  waiter: string;
  items: Item[];
};

const initialKots: Kot[] = [
  {
    id: 12, order: 165, type: "Dine", date: "31-02-2025", time: "11:00 AM",
    table: 4, waiter: "Rinku Sharma",
    items: [
      { id: 1, name: "Paneer Masala", qty: 2, status: "ready" },
      { id: 2, name: "Garlic Pizza", qty: 4, status: "cooking" },
      { id: 3, name: "Paw Bhaji", qty: 3, status: "pending" },
    ],
  },
  {
    id: 13, order: 165, type: "Dine", date: "31-02-2025", time: "11:00 AM",
    table: 4, waiter: "Rinku Sharma",
    items: [
      { id: 1, name: "Paneer Masala", qty: 2, status: "pending" },
      { id: 2, name: "Garlic Pizza", qty: 4, status: "pending" },
      { id: 3, name: "Paw Bhaji", qty: 3, status: "pending" },
    ],
  },
  {
    id: 14, order: 165, type: "Dine", date: "31-02-2025", time: "11:00 AM",
    table: 4, waiter: "Rinku Sharma",
    items: [
      { id: 1, name: "Paneer Masala", qty: 2, status: "pending" },
      { id: 2, name: "Garlic Pizza", qty: 4, status: "cooking" },
      { id: 3, name: "Paw Bhaji", qty: 3, status: "pending" },
    ],
  },
  {
    id: 15, order: 165, type: "Dine", date: "31-02-2025", time: "11:00 AM",
    table: 4, waiter: "Rinku Sharma",
    items: [
      { id: 1, name: "Paneer Masala", qty: 2, status: "ready" },
      { id: 2, name: "Garlic Pizza", qty: 4, status: "pending" },
      { id: 3, name: "Paw Bhaji", qty: 3, status: "pending" },
    ],
  },
  {
    id: 16, order: 166, type: "Dine", date: "31-02-2025", time: "11:00 AM",
    table: 5, waiter: "Rinku Sharma",
    items: [
      { id: 1, name: "Paneer Masala", qty: 2, status: "pending" },
      { id: 2, name: "Garlic Pizza", qty: 4, status: "pending" },
      { id: 3, name: "Paw Bhaji", qty: 3, status: "pending" },
    ],
  },
  {
    id: 17, order: 167, type: "Delivery", date: "31-02-2025", time: "12:30 PM",
    table: 6, waiter: "Suresh",
    items: [
      { id: 1, name: "Butter Chicken", qty: 2, status: "cooking" },
      { id: 2, name: "Naan", qty: 4, status: "ready" },
    ],
  },
  {
    id: 18, order: 168, type: "Dine", date: "31-02-2025", time: "01:00 PM",
    table: 2, waiter: "Priya",
    items: [
      { id: 1, name: "Veg Biryani", qty: 1, status: "pending" },
      { id: 2, name: "Raita", qty: 2, status: "pending" },
      { id: 3, name: "Gulab Jamun", qty: 4, status: "ready" },
    ],
  },
  {
    id: 19, order: 169, type: "Dine", date: "31-02-2025", time: "01:30 PM",
    table: 7, waiter: "Rinku Sharma",
    items: [
      { id: 1, name: "Dal Makhani", qty: 1, status: "cooking" },
      { id: 2, name: "Jeera Rice", qty: 2, status: "pending" },
    ],
  },
];

const selectSx = {
  height: 36,
  fontSize: 13,
  fontFamily: "Poppins, sans-serif",
  background: "#fff",
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "#D1D5DB" },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#9CA3AF" },
  "& .MuiSelect-icon": { fontSize: 18, color: "#6B7280" },
};

export default function AllKitchenKot() {
  const [kots, setKots] = useState<Kot[]>(initialKots);
  const [activeTab, setActiveTab] = useState("All");
  const [kitchenFilter, setKitchenFilter] = useState("all");
  const [rangeFilter, setRangeFilter] = useState("today");
  const [deliveryFilter, setDeliveryFilter] = useState("all_delivery");
  const [waiterFilter, setWaiterFilter] = useState("all_waiter");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [selectedItem, setSelectedItem] = useState<{ kotId: number; itemId: number } | null>(null);

  const openModal = (kotId: number, itemId: number) => setSelectedItem({ kotId, itemId });
  const closeModal = () => setSelectedItem(null);

  const updateStatus = (status: ItemStatus) => {
    if (!selectedItem) return;
    setKots((prev) =>
      prev.map((k) =>
        k.id === selectedItem.kotId
          ? { ...k, items: k.items.map((i) => (i.id === selectedItem.itemId ? { ...i, status } : i)) }
          : k
      )
    );
    closeModal();
  };

  const statusColor = (s: ItemStatus) => {
    if (s === "ready") return { bg: "#DCFCE7", color: "#15803D", label: "Ready" };
    if (s === "cooking") return { bg: "#FEF3C7", color: "#B45309", label: "Cooking" };
    return { bg: "#FEE2E2", color: "#DC2626", label: "Pending" };
  };

  const tabs = ["All", "Pending", "In Kitchen", "Food Ready", "Cancelled"];

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#F8FAFC", fontFamily: "Poppins, sans-serif" }}>

      {/* ── TOP HEADER BAR ── */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 3,
          py: 1.5,
          backgroundColor: "#fff",
          borderBottom: "1px solid #E5E7EB",
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        }}
      >
        {/* Left: KOT count */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Typography sx={{ fontSize: 18, fontWeight: 700, color: "#111827", fontFamily: "Poppins, sans-serif" }}>
            KOT
          </Typography>
          <Box
            sx={{
              px: 1.5,
              py: 0.2,
              borderRadius: "20px",
              background: "linear-gradient(135deg, #FF3D01 0%, #FF6B6B 100%)",
              boxShadow: "0 2px 8px rgba(232,53,58,0.35)",
            }}
          >
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#FFF", fontFamily: "Poppins, sans-serif" }}>
              {kots.length}
            </Typography>
          </Box>
        </Box>

        {/* Right: filters + New Order */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <FormControl size="small">
            <Select
              value={kitchenFilter}
              onChange={(e) => setKitchenFilter(e.target.value)}
              sx={selectSx}
              IconComponent={KeyboardArrowDownIcon}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="veg">Veg Kitchen</MenuItem>
              <MenuItem value="nonveg">Non Veg Kitchen</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small">
            <Select
              value={deliveryFilter}
              onChange={(e) => setDeliveryFilter(e.target.value)}
              sx={selectSx}
              IconComponent={KeyboardArrowDownIcon}
            >
              <MenuItem value="all_delivery">All Delivery App</MenuItem>
              <MenuItem value="swiggy">Swiggy</MenuItem>
              <MenuItem value="zomato">Zomato</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{
              background: "linear-gradient(135deg, #22C55E 0%, #16A34A 100%)",
              textTransform: "none",
              fontWeight: 600,
              fontSize: 13,
              height: 36,
              px: 2,
              borderRadius: "8px",
              fontFamily: "Poppins, sans-serif",
              boxShadow: "0 2px 8px rgba(34,197,94,0.35)",
              "&:hover": { background: "linear-gradient(135deg, #16A34A 0%, #15803D 100%)" },
            }}
          >
            New Order
          </Button>
        </Box>
      </Box>

      {/* ── FILTER BAR ── */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          px: 3,
          py: 1.5,
          backgroundColor: "#fff",
          borderBottom: "1px solid #F1F5F9",
        }}
      >
        <FormControl size="small">
          <Select
            value={rangeFilter}
            onChange={(e) => setRangeFilter(e.target.value)}
            sx={selectSx}
            IconComponent={KeyboardArrowDownIcon}
          >
            <MenuItem value="today">Today</MenuItem>
            <MenuItem value="yesterday">Yesterday</MenuItem>
            <MenuItem value="last7">Last 7 Days</MenuItem>
            <MenuItem value="last30">Last 30 Days</MenuItem>
          </Select>
        </FormControl>

        {/* From date */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            border: "1px solid #D1D5DB",
            borderRadius: "8px",
            px: 1.5,
            height: 36,
            background: "#fff",
          }}
        >
          <CalendarTodayIcon sx={{ fontSize: 14, color: "#9CA3AF" }} />
          <input
            type="date"
            value={fromDate}
            onChange={(e) => { setFromDate(e.target.value); if (toDate && e.target.value > toDate) setToDate(e.target.value); }}
            max={toDate || undefined}
            style={{ border: "none", outline: "none", fontSize: 13, fontFamily: "Poppins, sans-serif", color: "#374151", background: "transparent", cursor: "pointer" }}
          />
        </Box>

        <Typography sx={{ fontSize: 13, color: "#6B7280", fontFamily: "Poppins, sans-serif" }}>To</Typography>

        {/* To date */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            border: "1px solid #D1D5DB",
            borderRadius: "8px",
            px: 1.5,
            height: 36,
            background: "#fff",
          }}
        >
          <CalendarTodayIcon sx={{ fontSize: 14, color: "#9CA3AF" }} />
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            min={fromDate || undefined}
            style={{ border: "none", outline: "none", fontSize: 13, fontFamily: "Poppins, sans-serif", color: "#374151", background: "transparent", cursor: "pointer" }}
          />
        </Box>

        <FormControl size="small">
          <Select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
            sx={selectSx}
            IconComponent={KeyboardArrowDownIcon}
          >
            {tabs.map((t) => (
              <MenuItem key={t} value={t}>{t === "All" ? "Show All KOT" : t}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small">
          <Select
            value={waiterFilter}
            onChange={(e) => setWaiterFilter(e.target.value)}
            sx={selectSx}
            IconComponent={KeyboardArrowDownIcon}
          >
            <MenuItem value="all_waiter">Show All Waiter</MenuItem>
            <MenuItem value="rinku">Rinku Sharma</MenuItem>
            <MenuItem value="suresh">Suresh</MenuItem>
            <MenuItem value="priya">Priya</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* ── KOT CARD GRID ── */}
      <Box
        sx={{
          p: 2.5,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))",
          gap: 2,
        }}
      >
        {kots.map((kot) => (
          <Box
            key={kot.id}
            sx={{
              background: "#FFFFFF",
              borderRadius: "12px",
              border: "1px solid #E5E7EB",
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              transition: "box-shadow 0.2s ease, transform 0.2s ease",
              "&:hover": {
                boxShadow: "0 6px 24px rgba(0,0,0,0.12)",
                transform: "translateY(-2px)",
              },
            }}
          >
            {/* Card header */}
            <Box
              sx={{
                background: "linear-gradient(135deg, #1F2937 0%, #374151 100%)",
                px: 2,
                py: 1.5,
                textAlign: "center",
              }}
            >
              <Typography sx={{ fontSize: 15, fontWeight: 700, color: "#FFFFFF", fontFamily: "Poppins, sans-serif" }}>
                KOT #{kot.id}
              </Typography>
              <Typography sx={{ fontSize: 12, color: "#D1D5DB", fontFamily: "Poppins, sans-serif" }}>
                Order Type: <span style={{ fontWeight: 600, color: "#FCD34D" }}>{kot.type}</span>
              </Typography>
            </Box>

            {/* Order info */}
            <Box sx={{ px: 2, pt: 1.2, pb: 0.5 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.4 }}>
                <Typography sx={{ fontSize: 11, color: "#6B7280", fontFamily: "Poppins, sans-serif" }}>
                  Order <span style={{ fontWeight: 600, color: "#111827" }}>#{kot.order}</span>
                </Typography>
                <Typography sx={{ fontSize: 11, color: "#6B7280", fontFamily: "Poppins, sans-serif" }}>
                  Date: <span style={{ fontWeight: 500, color: "#374151" }}>{kot.date}</span>
                </Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.4 }}>
                <Typography sx={{ fontSize: 11, color: "#6B7280", fontFamily: "Poppins, sans-serif" }}>
                  Time: <span style={{ fontWeight: 500, color: "#374151" }}>{kot.time}</span>
                </Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography sx={{ fontSize: 11, color: "#6B7280", fontFamily: "Poppins, sans-serif" }}>
                  Table: <span style={{ fontWeight: 600, color: "#111827" }}>{kot.table}</span>
                </Typography>
                <Typography sx={{ fontSize: 11, color: "#6B7280", fontFamily: "Poppins, sans-serif", textAlign: "right", maxWidth: 110, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  Waiter: <span style={{ fontWeight: 500, color: "#374151" }}>{kot.waiter}</span>
                </Typography>
              </Box>
            </Box>

            {/* Dashed separator */}
            <Box
              sx={{
                mx: 2,
                my: 1,
                borderTop: "1.5px dashed #D1D5DB",
              }}
            />

            {/* Items header */}
            <Box sx={{ px: 2, mb: 0.5, display: "flex", justifyContent: "space-between" }}>
              <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#374151", fontFamily: "Poppins, sans-serif", letterSpacing: 0.3 }}>
                Items
              </Typography>
              <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#374151", fontFamily: "Poppins, sans-serif", letterSpacing: 0.3 }}>
                QTY
              </Typography>
            </Box>

            {/* Item rows — scrollable if many */}
            <Box sx={{ px: 2, flex: 1, maxHeight: 90, overflowY: "auto", "&::-webkit-scrollbar": { width: 3 }, "&::-webkit-scrollbar-thumb": { background: "#D1D5DB", borderRadius: 2 } }}>
              {kot.items.map((item) => {
                const s = statusColor(item.status);
                return (
                  <Box
                    key={item.id}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      py: 0.4,
                      borderBottom: "1px solid #F9FAFB",
                    }}
                  >
                    <Typography sx={{ fontSize: 12, color: "#374151", fontFamily: "Poppins, sans-serif" }}>
                      {item.name}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                      <Box sx={{ px: 0.8, py: 0.1, borderRadius: "10px", background: s.bg }}>
                        <Typography sx={{ fontSize: 10, fontWeight: 600, color: s.color, fontFamily: "Poppins, sans-serif" }}>
                          {item.qty}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                );
              })}
            </Box>

            {/* Dashed separator */}
            <Box sx={{ mx: 2, my: 1, borderTop: "1.5px dashed #D1D5DB" }} />

            {/* Footer actions */}
            <Box
              sx={{
                px: 2,
                pb: 1.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <IconButton
                size="small"
                onClick={() => openModal(kot.id, kot.items[0]?.id)}
                sx={{
                  color: "#9CA3AF",
                  "&:hover": { color: "#4B5563", background: "#F3F4F6" },
                }}
              >
                <VisibilityIcon sx={{ fontSize: 18 }} />
              </IconButton>

              <IconButton
                size="small"
                sx={{
                  background: "linear-gradient(135deg, #FF3D01 0%, #FF6B6B 100%)",
                  color: "#FFF",
                  width: 34,
                  height: 34,
                  boxShadow: "0 2px 6px rgba(232,53,58,0.35)",
                  "&:hover": { background: "linear-gradient(135deg, #c62a2f 0%, #FF3D01 100%)" },
                }}
              >
                <PrintIcon sx={{ fontSize: 17 }} />
              </IconButton>
            </Box>
          </Box>
        ))}
      </Box>

      {/* ── CHANGE STATUS MODAL ── */}
      <Dialog
        open={!!selectedItem}
        onClose={closeModal}
        PaperProps={{
          sx: {
            borderRadius: "16px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
            overflow: "hidden",
          },
        }}
      >
        <DialogContent sx={{ width: 380, p: 0 }}>
          {/* Modal header */}
          <Box
            sx={{
              background: "linear-gradient(135deg, #1F2937 0%, #374151 100%)",
              px: 3,
              py: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography sx={{ fontWeight: 700, fontSize: 16, color: "#FFF", fontFamily: "Poppins, sans-serif" }}>
              Change Item Status
            </Typography>
            <IconButton size="small" onClick={closeModal} sx={{ color: "#FFF" }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          <Box sx={{ p: 3 }}>
            <Typography sx={{ fontSize: 13, color: "#6B7280", mb: 2.5, fontFamily: "Poppins, sans-serif" }}>
              Select the new status for this item:
            </Typography>

            {[
              { status: "pending" as ItemStatus, label: "Pending Confirmation", icon: "🕐", border: "#FCA5A5", bg: "#FEF2F2", color: "#DC2626" },
              { status: "cooking" as ItemStatus, label: "Start Cooking", icon: "🔥", border: "#FCD34D", bg: "#FFFBEB", color: "#B45309" },
              { status: "ready" as ItemStatus, label: "Mark as Ready", icon: "✅", border: "#6EE7B7", bg: "#ECFDF5", color: "#065F46" },
            ].map(({ status, label, icon, border, bg, color }) => (
              <Box
                key={status}
                onClick={() => updateStatus(status)}
                sx={{
                  border: `1.5px solid ${border}`,
                  background: bg,
                  p: 1.8,
                  borderRadius: "10px",
                  mb: 1.2,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  transition: "transform 0.1s, box-shadow 0.1s",
                  "&:hover": { transform: "scale(1.01)", boxShadow: `0 4px 12px ${border}55` },
                }}
              >
                <Typography sx={{ fontSize: 20 }}>{icon}</Typography>
                <Typography sx={{ fontWeight: 600, fontSize: 14, color, fontFamily: "Poppins, sans-serif" }}>
                  {label}
                </Typography>
              </Box>
            ))}

            <Button
              fullWidth
              variant="outlined"
              onClick={closeModal}
              sx={{
                mt: 1,
                textTransform: "none",
                fontSize: 13,
                fontFamily: "Poppins, sans-serif",
                color: "#6B7280",
                borderColor: "#D1D5DB",
                borderRadius: "8px",
                "&:hover": { borderColor: "#9CA3AF", background: "#F9FAFB" },
              }}
            >
              Cancel
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
