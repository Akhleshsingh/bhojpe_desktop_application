// src/Pages/MyOrders.tsx
import React from "react";
import { useState } from "react";
import {
  Box,
  Button,
  Typography,
  TextField,
  IconButton,
  Stack,
  Chip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import MicOffIcon from "@mui/icons-material/MicOff";
import ReportIcon from "@mui/icons-material/Report";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Header from "../CommonPages/header";
import SecondHeader from "../CommonPages/secondheader";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../Theme/ThemeContext"; // your custom hook

// sample data for cards (replace with real data)
const sampleOrders = [
  {
    id: 1,
    restaurant: "Vaishnav Restaurant",
    bill: 450,
    time: "00:10",
    statusLabel: "Paid",
    statusColor: "#3A8E3A",
    customer: "Pankaj Tiwari",
    address: "House No. 123, Some Township, Kanpur",
    note: "Customer Special Note",
    amount: 234,
  },
  {
    id: 2,
    restaurant: "Vaishnav Restaurant",
    bill: 436,
    time: "00:10",
    statusLabel: "COD",
    statusColor: "#BA3131",
    customer: "Ravi Kumar",
    address: "Sector 5, Lucknow",
    note: "Special Note",
    amount: 234,
  },
  {
    id: 3,
    restaurant: "Vaishnav Restaurant",
    bill: 436,
    time: "00:10",
    statusLabel: "Paid",
    statusColor: "#3A8E3A",
    customer: "Sonia Verma",
    address: "MG Road, Kanpur",
    note: "Customer Special Note",
    amount: 234,
  },
];

export default function MyOrders() {
  const navigate = useNavigate();
  const { theme } = useTheme(); // uses your ThemeContext
  const [channel, setChannel] = React.useState("All Channels");
  const [query, setQuery] = React.useState("");
  const [orderType, setOrderType] = useState("dinein");


  const [tab, setTab] = React.useState<"new" | "running" | "ready" | "cancel">(
    "new"
  );

  return (
    <Box
      sx={{
        // Use CSS variables / theme-aware values so ThemeProvider controls appearance
        backgroundColor: "var(--bg)",
        color: "var(--text)",
        minHeight: "100vh",
         width: "100%",
      }}
    >
      <Header />
     <SecondHeader setOrderType={setOrderType} ordersCount={0} />

      <Box sx={{ p: 3 }}>
        {/* TOP ROW: Tabs + Back */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
            mb: 3,
            flexWrap: "wrap",
          }}
        >
          <Stack direction="row" spacing={1}>
            <Button
              variant={tab === "new" ? "contained" : "outlined"}
              sx={{
                background: tab === "new" ? "#BA3131" : undefined,
                color: tab === "new" ? "#fff" : undefined,
                textTransform: "none",
              }}
              onClick={() => setTab("new")}
            >
              New
            </Button>
            <Button
              variant={tab === "running" ? "contained" : "outlined"}
              sx={{
                textTransform: "none",
              }}
              onClick={() => setTab("running")}
            >
              Running
            </Button>
            <Button
              variant={tab === "ready" ? "contained" : "outlined"}
              sx={{ textTransform: "none" }}
              onClick={() => setTab("ready")}
            >
              Food Ready
            </Button>
            <Button
              variant={tab === "cancel" ? "contained" : "outlined"}
              sx={{ textTransform: "none" }}
              onClick={() => {
                setTab("cancel");
                navigate("/"); // Cancel goes to home as you requested
              }}
            >
              Cancel
            </Button>
          </Stack>

          <Box>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              sx={{ textTransform: "none" }}
              onClick={() => navigate("/dashboard")}
            >
              Back
            </Button>
          </Box>
        </Box>

        {/* SEARCH + FILTERS ROW */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            mb: 3,
            flexWrap: "wrap",
          }}
        >
          <TextField
            size="small"
            placeholder="All Channels"
            value={channel}
            onChange={(e: { target: { value: React.SetStateAction<string>; }; }) => setChannel(e.target.value)}
            sx={{ width: 180, background: "var(--card-bg)" }}
          />

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              backgroundColor: "var(--card-bg)",
              padding: "3px 10px",
              borderRadius: "6px",
              minWidth: 260,
              gap: 1,
            }}
          >
            <SearchIcon sx={{ fontSize: 20, color: "#999" }} />
            <input
              style={{
                border: "none",
                width: "100%",
                outline: "none",
                background: "transparent",
                color: "var(--text)",
              }}
              placeholder="Enter bill number or order ID"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </Box>

          <IconButton aria-label="mute" title="Mute">
            <MicOffIcon />
          </IconButton>
          <IconButton aria-label="refresh" title="Refresh">
            <RefreshIcon />
          </IconButton>
          <IconButton aria-label="report" title="Report">
            <ReportIcon />
          </IconButton>

          <Chip
            label="● Online"
            sx={{
              background: "#E9FFE6",
              border: "1px solid #7CD67C",
              color: "#3A8E3A",
              fontWeight: 600,
            }}
          />
        </Box>

        {/* ORDER CARDS */}
        <Box
          sx={{
            display: "flex",
            gap: 3,
            flexWrap: "wrap",
            alignItems: "flex-start",
          }}
        >
          {sampleOrders
            .filter((o) => {
              // basic filter based on query or active tab (replace with real logic)
              if (query && !String(o.bill).includes(query) && !o.customer.toLowerCase().includes(query.toLowerCase())) return false;
              // sample tab logic — in real app filter by order status
              if (tab === "new") return true;
              if (tab === "running") return o.statusLabel === "Paid" || o.statusLabel === "COD";
              if (tab === "ready") return o.amount > 0;
              if (tab === "cancel") return false;
              return true;
            })
            .map((order) => (
              <Box
                key={order.id}
                sx={{
                  width: 350,
                  background: "var(--card-bg)",
                  borderRadius: 1,
                  p: 2,
                  border: "1px solid #DDD",
                  boxShadow: "none",
                }}
              >
                {/* header */}
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                  <Typography sx={{ fontWeight: 700 }}>{order.restaurant}</Typography>
                  <Box sx={{ textAlign: "right" }}>
                    <Typography sx={{ fontSize: 12, color: "#666" }}>
                      Bill No: {order.bill}
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1, mt: 0.5, alignItems: "center" }}>
                      <Box sx={{ px: 1, py: "2px", background: "#FFEEEE", borderRadius: 1, color: "#BA3131", fontSize: 12 }}>
                        {order.time}
                      </Box>
                      <Box sx={{ px: 1, py: "2px", background: "#E9FFE6", borderRadius: 1, color: order.statusColor, fontSize: 12 }}>
                        {order.statusLabel}
                      </Box>
                    </Box>
                  </Box>
                </Box>

                {/* customer and address */}
                <Box sx={{ fontSize: 13, mt: 1 }}>
                  <Typography sx={{ fontWeight: 700 }}>{order.customer}</Typography>
                  <Typography sx={{ color: "text.secondary" }}>{order.address}</Typography>
                </Box>

                {/* note */}
                <Box sx={{ background: "#E8F6E8", p: 1, borderRadius: 1, mt: 1 }}>
                  {order.note}
                </Box>

                {/* bottom row */}
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 2 }}>
                  <Typography>₹ {order.amount}</Typography>
                  <Button
                    size="small"
                    sx={{
                      background: "#C4C452",
                      color: "#fff",
                      textTransform: "none",
                      fontWeight: 600,
                    }}
                  >
                    Food is Ready
                  </Button>
                </Box>
              </Box>
            ))}
        </Box>
      </Box>
    </Box>
  );
}

