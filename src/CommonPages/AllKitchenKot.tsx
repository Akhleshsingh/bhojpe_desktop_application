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
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import PrintIcon from "@mui/icons-material/Print";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";

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
  type: "Dine In" | "Delivery";
  time: string;
  items: Item[];
};

const initialKots: Kot[] = [
  {
    id: 400,
    order: 417,
    type: "Dine In",
    time: "28/02/2026 10:05 AM",
    items: [
      { id: 1, name: "Paneer Paratha", qty: 1, status: "ready" },
      { id: 2, name: "Fresh lime soda", qty: 1, status: "pending" },
      { id: 3, name: "Chur Chur Naan", qty: 1, status: "pending" },
      { id: 4, name: "KitKat shake", qty: 1, status: "pending" },
    ],
  },
  {
    id: 399,
    order: 423,
    type: "Dine In",
    time: "27/02/2026 05:49 PM",
    items: [
      { id: 1, name: "Pineapple Shake", qty: 1, status: "pending" },
      { id: 2, name: "Strawberry Shake", qty: 1, status: "pending" },
      { id: 3, name: "Vanilla Strawberry Shake", qty: 1, status: "pending" },
    ],
  },
];

export default function AllKitchenKot() {
  const [kots, setKots] = useState<Kot[]>(initialKots);
  const [activeTab, setActiveTab] = useState("pending");
const [kitchenFilter, setKitchenFilter] = useState("All Kitchens");
const [rangeFilter, setRangeFilter] = useState("Last 7 Days");

const [fromDate, setFromDate] = useState<string>("");
const [toDate, setToDate] = useState<string>("");

const handleFromDate = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value;
  setFromDate(value);

  if (toDate && value > toDate) {
    setToDate(value);
  }
};

const handleToDate = (e: React.ChangeEvent<HTMLInputElement>) => {
  setToDate(e.target.value);
};
  const [selectedItem, setSelectedItem] = useState<{
    kotId: number;
    itemId: number;
  } | null>(null);

  const openModal = (kotId: number, itemId: number) => {
    setSelectedItem({ kotId, itemId });
  };

  const closeModal = () => setSelectedItem(null);

  const updateStatus = (status: ItemStatus) => {
    if (!selectedItem) return;

    setKots((prev) =>
      prev.map((k) =>
        k.id === selectedItem.kotId
          ? {
              ...k,
              items: k.items.map((i) =>
                i.id === selectedItem.itemId ? { ...i, status } : i
              ),
            }
          : k
      )
    );

    closeModal();
  };

  return (
    <Box p={3} bgcolor="#F9FAFB" minHeight="100vh">

      {/* HEADER */}
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Typography fontSize={24} fontWeight={700}>
          All Kitchen KOT
        </Typography>

        <Chip
          label="Real Time Update"
          size="small"
          sx={{
            background: "#D1FAE5",
            color: "#047857",
            fontWeight: 600,
          }}
        />
      </Box>

    {/* FILTERS */}
<Box display="flex" gap={2} mb={3} alignItems="center">

<TextField
  select
  size="small"
  value={kitchenFilter}
  onChange={(e) => setKitchenFilter(e.target.value)}
>
  <MenuItem value="All Kitchens">All Kitchens</MenuItem>
  <MenuItem value="Veg Kitchen">Veg Kitchen</MenuItem>
  <MenuItem value="Non Veg Kitchen">Non Veg Kitchen</MenuItem>
</TextField>

<TextField
  select
  size="small"
  value={rangeFilter}
  onChange={(e) => setRangeFilter(e.target.value)}
>
  <MenuItem value="Today">Today</MenuItem>
  <MenuItem value="Yesterday">Yesterday</MenuItem>
  <MenuItem value="Last 7 Days">Last 7 Days</MenuItem>
  <MenuItem value="Last 30 Days">Last 30 Days</MenuItem>
</TextField>

<TextField
  type="date"
  size="small"
  value={fromDate}
  onChange={handleFromDate}
  InputLabelProps={{ shrink: true }}
  inputProps={{ max: toDate || undefined }}
  sx={{ width: 170 }}
/>

<TextField
  type="date"
  size="small"
  value={toDate}
  onChange={handleToDate}
  InputLabelProps={{ shrink: true }}
  inputProps={{ min: fromDate || undefined }}
  sx={{ width: 170 }}
/>

</Box>

      {/* STATUS TABS */}
      <Box display="flex" gap={1} mb={3}>
        {["Pending", "In Kitchen", "Food Ready", "Cancelled"].map((t) => (
          <Button
            key={t}
            variant={activeTab === t ? "contained" : "outlined"}
            onClick={() => setActiveTab(t)}
            sx={{
              textTransform: "none",
              borderRadius: "20px",
            }}
          >
            {t}
          </Button>
        ))}
      </Box>

      {/* KOT GRID */}
      <Box
        display="grid"
        gridTemplateColumns="repeat(auto-fill,minmax(380px,1fr))"
        gap={2}
      >
        {kots.map((kot) => (
         <Box
  key={kot.id}
  sx={{
    background: "#fff",
    borderRadius: "12px",
    border: "1px solid #E5E7EB",
    p: 2,
    height: 360, // fixed card height
    display: "flex",
    flexDirection: "column",
  }}
>

  {/* FIXED HEADER */}
  <Box>
    <Box display="flex" justifyContent="space-between">
      <Box>
        <Typography fontWeight={700} color="#FF6A00">
          KOT #{kot.id}
        </Typography>

        <Typography fontSize={12}>
          {kot.items.length} Item(s)
        </Typography>

        <Typography fontSize={11} color="#777">
          Default Kitchen
        </Typography>
      </Box>

      <Box textAlign="right">
        <Chip label={kot.type} size="small" />

        <Typography fontSize={12}>
          Order #{kot.order}
        </Typography>

        <Typography fontSize={11} color="#777">
          {kot.time}
        </Typography>
      </Box>
    </Box>

    {/* STATUS BADGE */}
    <Box
      sx={{
        border: "1px solid #FCA5A5",
        color: "#DC2626",
        fontSize: 12,
        p: "3px 10px",
        borderRadius: "6px",
        mt: 1,
        mb: 1,
        width: "fit-content",
      }}
    >
      PENDING CONFIRMATION
    </Box>
  </Box>


  {/* SCROLLABLE ITEMS */}
  <Box
    sx={{
      flex: 1,
      overflowY: "auto",
      borderTop: "1px solid #F1F5F9",
      borderBottom: "1px solid #F1F5F9",
      mb: 1,
    }}
  >
    {kot.items.map((item) => (
      <Box
        key={item.id}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        py={1}
        px={0.5}
        borderBottom="1px solid #F1F5F9"
      >
        <Typography fontSize={13}>
          {item.qty} × {item.name}
        </Typography>

        <Box display="flex" gap={1} alignItems="center">

          {item.status === "ready" ? (
            <Chip
              label="Ready"
              size="small"
              sx={{ background: "#D1FAE5", color: "#065F46" }}
            />
          ) : (
            <Button
              size="small"
              variant="outlined"
              onClick={() => openModal(kot.id, item.id)}
            >
              Start Cooking
            </Button>
          )}

          <IconButton
            size="small"
            onClick={() => openModal(kot.id, item.id)}
          >
            <EditIcon fontSize="small" />
          </IconButton>

          <IconButton size="small" color="error">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
    ))}
  </Box>


  {/* FIXED FOOTER */}
  <Box
    sx={{
      display: "flex",
      gap: 1,
      mt: "auto",
    }}
  >
    <IconButton
      sx={{
        border: "1px solid #FF6A00",
        color: "#FF6A00",
      }}
    >
      <PrintIcon />
    </IconButton>

    <Button variant="outlined" fullWidth>
      Start Cooking
    </Button>

    <Button variant="outlined" color="error">
      Cancel
    </Button>
  </Box>

</Box>
        ))}
      </Box>

      {/* CHANGE STATUS MODAL */}
      <Dialog open={!!selectedItem} onClose={closeModal}>
        <DialogContent sx={{ width: 420 }}>
          <Typography fontWeight={700} fontSize={18}>
            Change Status
          </Typography>

          <Typography fontSize={13} color="#777" mb={2}>
            Select a new status for this item
          </Typography>

          <Box
            onClick={() => updateStatus("pending")}
            sx={{
              border: "1px solid #FACC15",
              background: "#FEF9C3",
              p: 2,
              borderRadius: "10px",
              mb: 1,
              cursor: "pointer",
            }}
          >
            <Typography fontWeight={600}>Pending Confirmation</Typography>
          </Box>

          <Box
            onClick={() => updateStatus("cooking")}
            sx={{
              border: "1px solid #E5E7EB",
              p: 2,
              borderRadius: "10px",
              mb: 1,
              cursor: "pointer",
            }}
          >
            <Typography fontWeight={600}>Start Cooking</Typography>
          </Box>

          <Box
            onClick={() => updateStatus("ready")}
            sx={{
              border: "1px solid #E5E7EB",
              p: 2,
              borderRadius: "10px",
              cursor: "pointer",
            }}
          >
            <Typography fontWeight={600}>Mark Ready</Typography>
          </Box>

          <Box textAlign="right" mt={3}>
            <Button onClick={closeModal}>Cancel</Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}