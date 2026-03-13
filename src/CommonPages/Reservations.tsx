import React, { useState, useCallback, useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  Chip,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  IconButton,
  Divider,
} from "@mui/material";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import TableBarOutlinedIcon from "@mui/icons-material/TableBarOutlined";
import NoteAltOutlinedIcon from "@mui/icons-material/NoteAltOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

type ReservationStatus = "Confirmed" | "Pending" | "Cancelled" | "No Show";

type Reservation = {
  id: number;
  table?: string;
  guests: number;
  date: string;
  time: string;
  name: string;
  email: string;
  phone: string;
  notes?: string;
  status: ReservationStatus;
};

const dummyReservations: Reservation[] = [
  {
    id: 1,
    table: "T-3",
    guests: 2,
    date: "Sunday, 25 Jan",
    time: "01:00 PM",
    name: "datscvjvkvbkbl",
    email: "fy@gmail.com",
    phone: "+919999999999",
    notes: "testing requirements",
    status: "Confirmed",
  },
  {
    id: 2,
    guests: 2,
    date: "Sunday, 25 Jan",
    time: "06:00 PM",
    name: "akhleshsisjdj",
    email: "akhlesh@gmail.com",
    phone: "+916260129453",
    status: "Pending",
  },
  {
    id: 3,
    table: "T-7",
    guests: 4,
    date: "Monday, 26 Jan",
    time: "07:30 PM",
    name: "Rahul Sharma",
    email: "rahul@gmail.com",
    phone: "+918800123456",
    notes: "Anniversary dinner, need cake",
    status: "Confirmed",
  },
  {
    id: 4,
    guests: 6,
    date: "Tuesday, 27 Jan",
    time: "08:00 PM",
    name: "Priya Mehta",
    email: "priya@email.com",
    phone: "+917700987654",
    status: "Pending",
  },
];

const STATUS_META: Record<ReservationStatus, { bg: string; color: string; border: string }> = {
  Confirmed:  { bg: "#DCFCE7", color: "#15803D", border: "#6EE7B7" },
  Pending:    { bg: "#FEF3C7", color: "#B45309", border: "#FCD34D" },
  Cancelled:  { bg: "#FEE2E2", color: "#DC2626", border: "#FCA5A5" },
  "No Show":  { bg: "#F3F4F6", color: "#4B5563", border: "#D1D5DB" },
};

const STATUS_OPTIONS: ReservationStatus[] = ["Confirmed", "Pending", "Cancelled", "No Show"];

const DATE_RANGES = ["Today", "Tomorrow", "Current Week", "Next Week", "This Month"];

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

export default function Reservations() {
  const [statusMap, setStatusMap] = useState<Record<number, ReservationStatus>>({});
  const [dateRange, setDateRange] = useState("Current Week");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [search, setSearch] = useState("");

  const handleStatusChange = useCallback((id: number, status: ReservationStatus) => {
    setStatusMap((prev) => ({ ...prev, [id]: status }));
  }, []);

  const filteredReservations = useMemo(() => {
    if (!search.trim()) return dummyReservations;
    const q = search.toLowerCase();
    return dummyReservations.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.phone.includes(q)
    );
  }, [search]);

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#F8FAFC", fontFamily: "Poppins, sans-serif" }}>

      {/* ── TOP HEADER ── */}
      <Box
        sx={{
          position: "sticky", top: 0, zIndex: 10,
          backgroundColor: "#FFFFFF",
          borderBottom: "1px solid #E5E7EB",
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          px: 3, py: 1.4,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}
      >
        {/* Left: title + badge */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Typography sx={{ fontSize: 18, fontWeight: 700, color: "#111827", fontFamily: "Poppins, sans-serif" }}>
            Reservations
          </Typography>
          <Box
            sx={{
              px: 1.5, py: 0.2, borderRadius: "20px",
              background: "linear-gradient(135deg,#E8353A,#FF6B6B)",
              boxShadow: "0 2px 8px rgba(232,53,58,.3)",
            }}
          >
            <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#FFF", fontFamily: "Poppins, sans-serif" }}>
              {filteredReservations.length}
            </Typography>
          </Box>
        </Box>

        {/* Right: New Reservation */}
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={{
            background: "linear-gradient(135deg,#E8353A,#c62a2f)",
            textTransform: "none", fontWeight: 600, fontSize: 13,
            height: 36, px: 2.5, borderRadius: "8px",
            fontFamily: "Poppins, sans-serif",
            boxShadow: "0 2px 8px rgba(232,53,58,.35)",
            "&:hover": { background: "linear-gradient(135deg,#c62a2f,#a02020)" },
          }}
        >
          New Reservation
        </Button>
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
        <FormControl size="small">
          <Select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            sx={{ ...selectSx, minWidth: 150 }}
            IconComponent={KeyboardArrowDownIcon}
          >
            {DATE_RANGES.map((d) => <MenuItem key={d} value={d}>{d}</MenuItem>)}
          </Select>
        </FormControl>

        <Box
          sx={{
            display: "flex", alignItems: "center", gap: 1,
            border: "1px solid #D1D5DB", borderRadius: "8px",
            px: 1.5, height: 36, background: "#fff",
          }}
        >
          <CalendarTodayOutlinedIcon sx={{ fontSize: 14, color: "#9CA3AF" }} />
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            max={toDate || undefined}
            style={{ border: "none", outline: "none", fontSize: 13, fontFamily: "Poppins, sans-serif", color: "#374151", background: "transparent", cursor: "pointer" }}
          />
        </Box>

        <Typography sx={{ fontSize: 13, color: "#6B7280", fontFamily: "Poppins, sans-serif" }}>To</Typography>

        <Box
          sx={{
            display: "flex", alignItems: "center", gap: 1,
            border: "1px solid #D1D5DB", borderRadius: "8px",
            px: 1.5, height: 36, background: "#fff",
          }}
        >
          <CalendarTodayOutlinedIcon sx={{ fontSize: 14, color: "#9CA3AF" }} />
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            min={fromDate || undefined}
            style={{ border: "none", outline: "none", fontSize: 13, fontFamily: "Poppins, sans-serif", color: "#374151", background: "transparent", cursor: "pointer" }}
          />
        </Box>

        <TextField
          size="small"
          placeholder="Search by name, email or phone number"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 16, color: "#9CA3AF" }} />
              </InputAdornment>
            ),
          }}
          sx={{
            flex: 1, minWidth: 240,
            "& .MuiOutlinedInput-root": {
              height: 36, fontSize: 13, fontFamily: "Poppins, sans-serif",
              borderRadius: "8px", backgroundColor: "#fff",
              "& fieldset": { borderColor: "#D1D5DB" },
              "&:hover fieldset": { borderColor: "#9CA3AF" },
            },
          }}
        />
      </Box>

      {/* ── RESERVATION GRID ── */}
      <Box
        sx={{
          p: 2.5,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: 2,
        }}
      >
        {filteredReservations.map((res) => {
          const currentStatus = statusMap[res.id] || res.status;
          const meta = STATUS_META[currentStatus];

          return (
            <Box
              key={res.id}
              sx={{
                backgroundColor: "#FFFFFF",
                borderRadius: "14px",
                border: "1px solid #E5E7EB",
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                transition: "box-shadow .2s, transform .2s",
                "&:hover": { boxShadow: "0 8px 28px rgba(0,0,0,0.12)", transform: "translateY(-2px)" },
              }}
            >
              {/* ── CARD HEADER ── */}
              <Box
                sx={{
                  background: "linear-gradient(135deg,#1F2937 0%,#374151 100%)",
                  px: 2, py: 1.5,
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                }}
              >
                {/* Table chip or Assign Table button */}
                {res.table ? (
                  <Box
                    sx={{
                      display: "flex", alignItems: "center", gap: 0.8,
                      px: 1.4, py: 0.5, borderRadius: "8px",
                      backgroundColor: "rgba(232,53,58,0.2)",
                      border: "1px solid rgba(232,53,58,0.4)",
                    }}
                  >
                    <TableBarOutlinedIcon sx={{ fontSize: 15, color: "#FCA5A5" }} />
                    <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#FCA5A5", fontFamily: "Poppins, sans-serif" }}>
                      {res.table}
                    </Typography>
                  </Box>
                ) : (
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<TableBarOutlinedIcon sx={{ fontSize: 14 }} />}
                    sx={{
                      fontSize: 11, fontWeight: 600, textTransform: "none",
                      borderColor: "#6B7280", color: "#D1D5DB",
                      borderRadius: "8px", py: 0.4, px: 1.2,
                      fontFamily: "Poppins, sans-serif",
                      "&:hover": { borderColor: "#FCA5A5", color: "#FCA5A5", backgroundColor: "rgba(232,53,58,0.1)" },
                    }}
                  >
                    Assign Table
                  </Button>
                )}

                {/* Guests count + status chip */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <PeopleAltOutlinedIcon sx={{ fontSize: 15, color: "#9CA3AF" }} />
                    <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#E5E7EB", fontFamily: "Poppins, sans-serif" }}>
                      {res.guests} Guests
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* ── DATE / TIME ROW ── */}
              <Box
                sx={{
                  px: 2, py: 1.2,
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  backgroundColor: "#FAFAFA",
                  borderBottom: "1px solid #F3F4F6",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CalendarTodayOutlinedIcon sx={{ fontSize: 15, color: "#E8353A" }} />
                  <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#E8353A", fontFamily: "Poppins, sans-serif" }}>
                    {res.date}, {res.time}
                  </Typography>
                </Box>

                {/* Status badge */}
                <Box
                  sx={{
                    px: 1.2, py: 0.3, borderRadius: "20px",
                    backgroundColor: meta.bg,
                    border: `1px solid ${meta.border}`,
                  }}
                >
                  <Typography sx={{ fontSize: 11, fontWeight: 700, color: meta.color, fontFamily: "Poppins, sans-serif" }}>
                    {currentStatus.toUpperCase()}
                  </Typography>
                </Box>
              </Box>

              {/* ── CUSTOMER INFO ── */}
              <Box sx={{ px: 2, py: 1.5, display: "flex", flexDirection: "column", gap: 0.8 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <PersonOutlineIcon sx={{ fontSize: 16, color: "#9CA3AF" }} />
                  <Typography sx={{ fontSize: 13, color: "#374151", fontWeight: 500, fontFamily: "Poppins, sans-serif" }}>
                    {res.name}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <EmailOutlinedIcon sx={{ fontSize: 16, color: "#9CA3AF" }} />
                  <Typography sx={{ fontSize: 13, color: "#374151", fontFamily: "Poppins, sans-serif" }}>
                    {res.email}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <PhoneOutlinedIcon sx={{ fontSize: 16, color: "#9CA3AF" }} />
                  <Typography sx={{ fontSize: 13, color: "#374151", fontFamily: "Poppins, sans-serif" }}>
                    {res.phone}
                  </Typography>
                </Box>

                {/* Notes */}
                {res.notes && (
                  <Box
                    sx={{
                      display: "flex", alignItems: "flex-start", gap: 1,
                      mt: 0.5, p: 1, borderRadius: "8px",
                      backgroundColor: "#F9FAFB", border: "1px solid #F3F4F6",
                    }}
                  >
                    <NoteAltOutlinedIcon sx={{ fontSize: 15, color: "#9CA3AF", mt: 0.1 }} />
                    <Typography sx={{ fontSize: 12, color: "#6B7280", fontFamily: "Poppins, sans-serif", fontStyle: "italic" }}>
                      {res.notes}
                    </Typography>
                  </Box>
                )}
              </Box>

              <Divider sx={{ borderColor: "#F3F4F6" }} />

              {/* ── STATUS DROPDOWN ── */}
              <Box sx={{ px: 2, py: 1.2 }}>
                <FormControl fullWidth size="small">
                  <Select
                    value={currentStatus}
                    onChange={(e) => handleStatusChange(res.id, e.target.value as ReservationStatus)}
                    IconComponent={KeyboardArrowDownIcon}
                    sx={{
                      height: 38, fontSize: 13, fontFamily: "Poppins, sans-serif",
                      fontWeight: 600, color: meta.color,
                      borderRadius: "8px",
                      backgroundColor: meta.bg,
                      "& .MuiOutlinedInput-notchedOutline": { borderColor: meta.border },
                      "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: meta.color },
                      "& .MuiSelect-icon": { color: meta.color },
                    }}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <MenuItem key={s} value={s} sx={{ fontSize: 13, fontFamily: "Poppins, sans-serif" }}>
                        {s}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
