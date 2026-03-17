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
  Dialog,
  DialogContent,
  CircularProgress,
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
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import { useTables } from "../context/TablesContext";

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

/* ─────────────────────────────────────────────────────
   Assign Table Modal
───────────────────────────────────────────────────── */
interface AssignTableModalProps {
  open: boolean;
  reservation: Reservation | null;
  allReservations: Reservation[];
  tableMap: Record<number, string>;
  onClose: () => void;
  onAssign: (reservationId: number, tableLabel: string) => void;
}

function AssignTableModal({
  open,
  reservation,
  allReservations,
  tableMap,
  onClose,
  onAssign,
}: AssignTableModalProps) {
  const { tables, loading } = useTables();
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null);
  const [selectedTableLabel, setSelectedTableLabel] = useState("");

  const handleClose = () => {
    setSelectedTableId(null);
    setSelectedTableLabel("");
    onClose();
  };

  const handleAssign = () => {
    if (!reservation || !selectedTableId) return;
    onAssign(reservation.id, selectedTableLabel);
    setSelectedTableId(null);
    setSelectedTableLabel("");
    onClose();
  };

  /* Normalize tables: API may return flat list or area-grouped list */
  const areas: { id: number; name: string; tables: any[] }[] = useMemo(() => {
    if (!Array.isArray(tables) || tables.length === 0) return [];

    /* If each item has a "tables" sub-array → already grouped by area */
    if (tables[0]?.tables) {
      return tables.map((a: any) => ({
        id: a.id,
        name: a.area_name ?? a.name ?? "Area",
        tables: a.tables ?? [],
      }));
    }

    /* If each item has an area_name field → group manually */
    if (tables[0]?.area_name) {
      const grouped: Record<string, { id: number; name: string; tables: any[] }> = {};
      tables.forEach((t: any) => {
        const k = t.area_name ?? "Area";
        if (!grouped[k]) grouped[k] = { id: t.area_id ?? 0, name: k, tables: [] };
        grouped[k].tables.push(t);
      });
      return Object.values(grouped);
    }

    /* Fallback: all tables in one "All Tables" group */
    return [{ id: 0, name: "All Tables", tables }];
  }, [tables]);

  /* Reservations for the same date (to show on the right panel) */
  const sameDay = reservation
    ? allReservations.filter((r) => r.id !== reservation.id && r.date === reservation.date)
    : [];

  const dateLabel = reservation?.date ?? "";

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "16px",
          overflow: "hidden",
          fontFamily: "Poppins, sans-serif",
          maxHeight: "80vh",
        },
      }}
    >
      <DialogContent sx={{ p: 0, display: "flex", flexDirection: "column" }}>
        {/* ── Modal Header ── */}
        <Box
          sx={{
            px: 3,
            py: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid #F1F5F9",
            background: "linear-gradient(135deg,#1F2937 0%,#374151 100%)",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <TableBarOutlinedIcon sx={{ color: "#FCA5A5", fontSize: 20 }} />
            <Typography
              sx={{ fontSize: 17, fontWeight: 700, color: "#F9FAFB", fontFamily: "Poppins, sans-serif" }}
            >
              Available Tables
            </Typography>
            {reservation && (
              <Box
                sx={{
                  px: 1.4, py: 0.3, borderRadius: "20px",
                  backgroundColor: "rgba(232,53,58,0.25)",
                  border: "1px solid rgba(232,53,58,0.4)",
                }}
              >
                <Typography sx={{ fontSize: 11, fontWeight: 600, color: "#FCA5A5", fontFamily: "Poppins, sans-serif" }}>
                  {reservation.name} · {reservation.guests} Guests
                </Typography>
              </Box>
            )}
          </Box>
          <IconButton onClick={handleClose} size="small" sx={{ color: "#9CA3AF", "&:hover": { color: "#F9FAFB" } }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* ── Main Body: Left tables + Right reservations ── */}
        <Box sx={{ display: "flex", flex: 1, overflow: "hidden", minHeight: 0 }}>

          {/* Left: Table Grid */}
          <Box
            sx={{
              flex: 1,
              overflowY: "auto",
              p: 2.5,
              borderRight: "1px solid #F1F5F9",
              background: "#FAFAFA",
            }}
          >
            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 200 }}>
                <CircularProgress size={28} sx={{ color: "#FF3D01" }} />
              </Box>
            ) : areas.length === 0 ? (
              /* ── Demo fallback so the UI is never empty ── */
              <DemoAreas
                selectedTableId={selectedTableId}
                onSelectTable={(id, label) => {
                  setSelectedTableId(id);
                  setSelectedTableLabel(label);
                }}
                tableMap={tableMap}
                allReservations={allReservations}
              />
            ) : (
              areas.map((area) => (
                <AreaSection
                  key={area.id}
                  area={area}
                  selectedTableId={selectedTableId}
                  onSelectTable={(id, label) => {
                    setSelectedTableId(id);
                    setSelectedTableLabel(label);
                  }}
                  tableMap={tableMap}
                  allReservations={allReservations}
                />
              ))
            )}
          </Box>

          {/* Right: Reservations panel */}
          <Box sx={{ width: 240, overflowY: "auto", p: 2.5, background: "#fff", flexShrink: 0 }}>
            <Box
              sx={{
                mb: 2, px: 1.5, py: 1,
                background: "#F8FAFC",
                borderRadius: "10px",
                border: "1px solid #E5E7EB",
              }}
            >
              <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#374151", fontFamily: "Poppins, sans-serif" }}>
                Reservations: {dateLabel}
              </Typography>
            </Box>

            {sameDay.length === 0 ? (
              <Box
                sx={{
                  display: "flex", flexDirection: "column",
                  alignItems: "center", gap: 1, pt: 3,
                  color: "#9CA3AF",
                }}
              >
                <TableBarOutlinedIcon sx={{ fontSize: 30, opacity: 0.4 }} />
                <Typography sx={{ fontSize: 12, fontFamily: "Poppins, sans-serif", textAlign: "center" }}>
                  No table is reserved.
                </Typography>
              </Box>
            ) : (
              sameDay.map((r) => {
                const assignedTable = tableMap[r.id] ?? r.table;
                return (
                  <Box
                    key={r.id}
                    sx={{
                      mb: 1.5, p: 1.2,
                      borderRadius: "10px",
                      border: "1px solid #E5E7EB",
                      background: "#F9FAFB",
                    }}
                  >
                    <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#111827", fontFamily: "Poppins, sans-serif" }}>
                      {r.name}
                    </Typography>
                    <Typography sx={{ fontSize: 11, color: "#6B7280", fontFamily: "Poppins, sans-serif" }}>
                      {r.time} · {r.guests} guests
                    </Typography>
                    {assignedTable && (
                      <Box
                        sx={{
                          mt: 0.8, px: 1, py: 0.3,
                          borderRadius: "6px",
                          backgroundColor: "rgba(232,53,58,0.08)",
                          display: "inline-block",
                        }}
                      >
                        <Typography sx={{ fontSize: 11, fontWeight: 600, color: "#FF3D01", fontFamily: "Poppins, sans-serif" }}>
                          {assignedTable}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                );
              })
            )}
          </Box>
        </Box>

        {/* ── Footer ── */}
        <Box
          sx={{
            px: 3, py: 1.5,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            borderTop: "1px solid #F1F5F9",
            background: "#FFFFFF",
          }}
        >
          {selectedTableId ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CheckCircleOutlineIcon sx={{ fontSize: 16, color: "#15803D" }} />
              <Typography sx={{ fontSize: 13, color: "#374151", fontFamily: "Poppins, sans-serif" }}>
                Selected: <strong>{selectedTableLabel}</strong>
              </Typography>
            </Box>
          ) : (
            <Typography sx={{ fontSize: 12, color: "#9CA3AF", fontFamily: "Poppins, sans-serif" }}>
              Tap a table to select it
            </Typography>
          )}

          <Box sx={{ display: "flex", gap: 1.5 }}>
            <Button
              onClick={handleClose}
              variant="outlined"
              sx={{
                textTransform: "none", fontWeight: 500, fontSize: 13,
                borderColor: "#D1D5DB", color: "#6B7280",
                borderRadius: "8px", px: 2.5, height: 36,
                fontFamily: "Poppins, sans-serif",
                "&:hover": { borderColor: "#9CA3AF", backgroundColor: "#F9FAFB" },
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAssign}
              disabled={!selectedTableId}
              variant="contained"
              sx={{
                textTransform: "none", fontWeight: 600, fontSize: 13,
                background: selectedTableId
                  ? "linear-gradient(135deg,#FF3D01,#c62a2f)"
                  : "#E5E7EB",
                color: selectedTableId ? "#fff" : "#9CA3AF",
                borderRadius: "8px", px: 2.5, height: 36,
                fontFamily: "Poppins, sans-serif",
                boxShadow: selectedTableId ? "0 2px 8px rgba(232,53,58,.35)" : "none",
                "&:hover": {
                  background: selectedTableId
                    ? "linear-gradient(135deg,#c62a2f,#a02020)"
                    : "#E5E7EB",
                },
              }}
            >
              Assign Table
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

/* ─────────────────────────────────────────────────────
   Area Section (live data)
───────────────────────────────────────────────────── */
interface AreaSectionProps {
  area: { id: number; name: string; tables: any[] };
  selectedTableId: number | null;
  onSelectTable: (id: number, label: string) => void;
  tableMap: Record<number, string>;
  allReservations: Reservation[];
}

function AreaSection({ area, selectedTableId, onSelectTable, tableMap, allReservations }: AreaSectionProps) {
  const assignedLabels = new Set([
    ...allReservations.map((r) => tableMap[r.id] ?? r.table).filter(Boolean),
  ]);

  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
        <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#374151", fontFamily: "Poppins, sans-serif" }}>
          {area.name}
        </Typography>
        <Box
          sx={{
            px: 1.2, py: 0.2, borderRadius: "20px",
            border: "1px solid #E5E7EB", backgroundColor: "#fff",
          }}
        >
          <Typography sx={{ fontSize: 11, fontWeight: 600, color: "#6B7280", fontFamily: "Poppins, sans-serif" }}>
            {area.tables.length} Table{area.tables.length !== 1 ? "s" : ""}
          </Typography>
        </Box>
      </Box>

      {area.tables.length === 0 ? (
        <Typography sx={{ fontSize: 12, color: "#9CA3AF", fontFamily: "Poppins, sans-serif", pl: 0.5 }}>
          No tables in this area.
        </Typography>
      ) : (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
          {area.tables.map((t: any) => {
            const label = t.table_number ?? t.table_name ?? t.name ?? String(t.id);
            const seats = t.capacity ?? t.seats ?? t.seat_count ?? "?";
            const isSelected = selectedTableId === t.id;
            const isOccupied = assignedLabels.has(label);

            return (
              <TableCard
                key={t.id}
                id={t.id}
                label={label}
                seats={seats}
                isSelected={isSelected}
                isOccupied={isOccupied}
                onClick={() => {
                  if (!isOccupied) onSelectTable(t.id, label);
                }}
              />
            );
          })}
        </Box>
      )}
    </Box>
  );
}

/* ─────────────────────────────────────────────────────
   Demo Areas (shown when API has no data yet)
───────────────────────────────────────────────────── */
const DEMO_AREAS = [
  {
    id: 1,
    name: "Ground Floor",
    tables: [
      { id: 101, label: "1", seats: 4, occupied: false },
      { id: 102, label: "4", seats: 4, occupied: false },
      { id: 103, label: "10", seats: 8, occupied: true },
    ],
  },
  {
    id: 2,
    name: "First Floor",
    tables: [
      { id: 201, label: "T-2", seats: 4, occupied: false },
      { id: 202, label: "T-3", seats: 4, occupied: false },
    ],
  },
  {
    id: 3,
    name: "Roof Top",
    tables: [],
  },
];

interface DemoAreasProps {
  selectedTableId: number | null;
  onSelectTable: (id: number, label: string) => void;
  tableMap: Record<number, string>;
  allReservations: Reservation[];
}

function DemoAreas({ selectedTableId, onSelectTable, tableMap, allReservations }: DemoAreasProps) {
  const assignedLabels = new Set([
    ...allReservations.map((r) => tableMap[r.id] ?? r.table).filter(Boolean),
  ]);

  return (
    <>
      {DEMO_AREAS.map((area) => (
        <Box key={area.id} sx={{ mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
            <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#374151", fontFamily: "Poppins, sans-serif" }}>
              {area.name}
            </Typography>
            <Box
              sx={{
                px: 1.2, py: 0.2, borderRadius: "20px",
                border: "1px solid #E5E7EB", backgroundColor: "#fff",
              }}
            >
              <Typography sx={{ fontSize: 11, fontWeight: 600, color: "#6B7280", fontFamily: "Poppins, sans-serif" }}>
                {area.tables.length} Table{area.tables.length !== 1 ? "s" : ""}
              </Typography>
            </Box>
          </Box>

          {area.tables.length === 0 ? (
            <Typography sx={{ fontSize: 12, color: "#9CA3AF", fontFamily: "Poppins, sans-serif", pl: 0.5 }}>
              No tables in this area.
            </Typography>
          ) : (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
              {area.tables.map((t) => {
                const isSelected = selectedTableId === t.id;
                const isOccupied = t.occupied || assignedLabels.has(t.label);
                return (
                  <TableCard
                    key={t.id}
                    id={t.id}
                    label={t.label}
                    seats={t.seats}
                    isSelected={isSelected}
                    isOccupied={isOccupied}
                    onClick={() => {
                      if (!isOccupied) onSelectTable(t.id, t.label);
                    }}
                  />
                );
              })}
            </Box>
          )}
        </Box>
      ))}
    </>
  );
}

/* ─────────────────────────────────────────────────────
   Individual Table Card
───────────────────────────────────────────────────── */
interface TableCardProps {
  id: number;
  label: string;
  seats: number | string;
  isSelected: boolean;
  isOccupied: boolean;
  onClick: () => void;
}

function TableCard({ label, seats, isSelected, isOccupied, onClick }: TableCardProps) {
  const badgeBg = isOccupied
    ? "rgba(134,239,172,0.3)"
    : isSelected
      ? "rgba(232,53,58,0.12)"
      : "rgba(147,197,253,0.3)";

  const badgeColor = isOccupied
    ? "#15803D"
    : isSelected
      ? "#FF3D01"
      : "#1D4ED8";

  const borderColor = isOccupied
    ? "#6EE7B7"
    : isSelected
      ? "#FF3D01"
      : "#BFDBFE";

  const cardBorder = isSelected
    ? "2px solid #FF3D01"
    : isOccupied
      ? "1.5px solid #6EE7B7"
      : "1.5px solid #E5E7EB";

  return (
    <Box
      onClick={onClick}
      sx={{
        width: 100,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 0.8,
        p: 1.5,
        borderRadius: "12px",
        border: cardBorder,
        background: isSelected ? "rgba(232,53,58,0.04)" : "#fff",
        cursor: isOccupied ? "not-allowed" : "pointer",
        opacity: isOccupied ? 0.7 : 1,
        transition: "all .18s ease",
        "&:hover": isOccupied
          ? {}
          : {
              boxShadow: "0 4px 14px rgba(0,0,0,0.1)",
              transform: "translateY(-2px)",
              border: `2px solid ${isSelected ? "#FF3D01" : "#93C5FD"}`,
            },
      }}
    >
      {/* Badge */}
      <Box
        sx={{
          width: 44, height: 44,
          borderRadius: "10px",
          display: "flex", alignItems: "center", justifyContent: "center",
          backgroundColor: badgeBg,
          border: `1.5px solid ${borderColor}`,
        }}
      >
        <Typography sx={{ fontSize: 14, fontWeight: 700, color: badgeColor, fontFamily: "Poppins, sans-serif" }}>
          {label}
        </Typography>
      </Box>

      {/* Seat count */}
      <Typography sx={{ fontSize: 11, color: "#6B7280", fontFamily: "Poppins, sans-serif", textAlign: "center" }}>
        {seats} Seat{Number(seats) !== 1 ? "(s)" : ""}
      </Typography>

      {/* Status label */}
      {isOccupied && (
        <Box
          sx={{
            px: 0.8, py: 0.1, borderRadius: "20px",
            backgroundColor: "rgba(134,239,172,0.3)",
            border: "1px solid #6EE7B7",
          }}
        >
          <Typography sx={{ fontSize: 9, fontWeight: 600, color: "#15803D", fontFamily: "Poppins, sans-serif" }}>
            OCCUPIED
          </Typography>
        </Box>
      )}
      {isSelected && !isOccupied && (
        <Box
          sx={{
            px: 0.8, py: 0.1, borderRadius: "20px",
            backgroundColor: "rgba(232,53,58,0.1)",
            border: "1px solid #FCA5A5",
          }}
        >
          <Typography sx={{ fontSize: 9, fontWeight: 700, color: "#FF3D01", fontFamily: "Poppins, sans-serif" }}>
            SELECTED
          </Typography>
        </Box>
      )}
    </Box>
  );
}

/* ─────────────────────────────────────────────────────
   Time slots per meal type
───────────────────────────────────────────────────── */
const MEAL_SLOTS: Record<string, string[]> = {
  Breakfast: ["07:00 AM", "07:30 AM", "08:00 AM", "08:30 AM", "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM"],
  Lunch:     ["12:00 PM", "12:30 PM", "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM", "03:00 PM"],
  Dinner:    ["06:00 PM", "06:30 PM", "07:00 PM", "07:30 PM", "08:00 PM", "08:30 PM", "09:00 PM", "09:30 PM", "10:00 PM"],
};

const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner"];
const GUEST_OPTIONS = Array.from({ length: 20 }, (_, i) => i + 1);
const COUNTRY_CODES = ["+91", "+1", "+44", "+61", "+971", "+65"];

/* ─────────────────────────────────────────────────────
   New Reservation Modal
───────────────────────────────────────────────────── */
interface NewReservationModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (res: Omit<Reservation, "id">) => void;
}

function NewReservationModal({ open, onClose, onSubmit }: NewReservationModalProps) {
  const today = new Date().toISOString().split("T")[0];

  const [date, setDate]             = useState(today);
  const [guests, setGuests]         = useState(1);
  const [mealType, setMealType]     = useState("Lunch");
  const [timeSlot, setTimeSlot]     = useState("");
  const [notes, setNotes]           = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [name, setName]             = useState("");
  const [email, setEmail]           = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [phone, setPhone]           = useState("");
  const [errors, setErrors]         = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess]       = useState(false);

  const slots = MEAL_SLOTS[mealType] ?? [];

  /* auto-select first slot when meal type changes */
  React.useEffect(() => {
    setTimeSlot(MEAL_SLOTS[mealType]?.[0] ?? "");
  }, [mealType]);

  const handleClose = () => {
    setDate(today);
    setGuests(1);
    setMealType("Lunch");
    setTimeSlot(MEAL_SLOTS["Lunch"][0]);
    setNotes("");
    setCustomerSearch("");
    setName("");
    setEmail("");
    setCountryCode("+91");
    setPhone("");
    setErrors({});
    setSuccess(false);
    onClose();
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim())  e.name  = "Customer name is required";
    if (!phone.trim()) e.phone = "Phone number is required";
    else if (!/^\d{7,15}$/.test(phone.replace(/\s/g, ""))) e.phone = "Enter a valid phone number";
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Enter a valid email";
    if (!timeSlot) e.timeSlot = "Please select a time slot";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    /* Simulate API call delay */
    await new Promise((r) => setTimeout(r, 600));
    setSubmitting(false);
    setSuccess(true);

    /* Format date for display */
    const d = new Date(date);
    const dateStr = d.toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "short" });

    onSubmit({
      table: undefined,
      guests,
      date: dateStr,
      time: timeSlot,
      name: name.trim(),
      email: email.trim(),
      phone: `${countryCode}${phone.trim()}`,
      notes: notes.trim() || undefined,
      status: "Pending",
    });

    setTimeout(handleClose, 900);
  };

  const fieldSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "10px",
      fontSize: 13,
      fontFamily: "Poppins, sans-serif",
      backgroundColor: "#FAFAFA",
      "& fieldset": { borderColor: "#E5E7EB" },
      "&:hover fieldset": { borderColor: "#9CA3AF" },
      "&.Mui-focused fieldset": { borderColor: "#FF3D01", borderWidth: 1.5 },
    },
    "& .MuiInputLabel-root": { fontSize: 13, fontFamily: "Poppins, sans-serif" },
    "& .MuiInputLabel-root.Mui-focused": { color: "#FF3D01" },
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "18px",
          fontFamily: "Poppins, sans-serif",
          maxHeight: "92vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      {/* ── Header ── */}
      <Box
        sx={{
          background: "linear-gradient(135deg,#1F2937 0%,#374151 100%)",
          px: 3, py: 2,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 34, height: 34, borderRadius: "10px",
              background: "rgba(232,53,58,0.2)", border: "1px solid rgba(232,53,58,0.4)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <CalendarTodayOutlinedIcon sx={{ fontSize: 17, color: "#FCA5A5" }} />
          </Box>
          <Typography sx={{ fontSize: 17, fontWeight: 700, color: "#F9FAFB", fontFamily: "Poppins, sans-serif" }}>
            New Reservation
          </Typography>
        </Box>
        <IconButton onClick={handleClose} size="small" sx={{ color: "#9CA3AF", "&:hover": { color: "#F9FAFB" } }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* ── Body ── */}
      <DialogContent sx={{ p: 0, overflowY: "auto", flex: 1 }}>

        {/* Success overlay */}
        {success && (
          <Box
            sx={{
              position: "absolute", inset: 0, zIndex: 10,
              background: "rgba(255,255,255,0.92)",
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: 1.5,
            }}
          >
            <Box
              sx={{
                width: 60, height: 60, borderRadius: "50%",
                background: "linear-gradient(135deg,#DCFCE7,#BBF7D0)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <CheckCircleOutlineIcon sx={{ fontSize: 32, color: "#15803D" }} />
            </Box>
            <Typography sx={{ fontSize: 15, fontWeight: 700, color: "#15803D", fontFamily: "Poppins, sans-serif" }}>
              Reservation Created!
            </Typography>
          </Box>
        )}

        <Box sx={{ px: 3, pt: 2.5, pb: 1 }}>

          {/* ── Row 1: Date / Guests / Meal type ── */}
          <Box sx={{ display: "flex", gap: 1.5, mb: 2.5, flexWrap: "wrap" }}>

            {/* Date */}
            <Box
              sx={{
                display: "flex", alignItems: "center", gap: 1,
                border: "1.5px solid #E5E7EB", borderRadius: "10px",
                px: 1.5, height: 46, background: "#FAFAFA",
                flex: "1 1 140px", minWidth: 130,
                "&:focus-within": { borderColor: "#FF3D01" },
                transition: "border-color .15s",
              }}
            >
              <CalendarTodayOutlinedIcon sx={{ fontSize: 16, color: "#6B7280", flexShrink: 0 }} />
              <input
                type="date"
                value={date}
                min={today}
                onChange={(e) => setDate(e.target.value)}
                style={{
                  border: "none", outline: "none", fontSize: 13,
                  fontFamily: "Poppins, sans-serif", color: "#374151",
                  background: "transparent", cursor: "pointer", width: "100%",
                }}
              />
            </Box>

            {/* Guests */}
            <FormControl size="small" sx={{ flex: "1 1 120px", minWidth: 110 }}>
              <Select
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
                IconComponent={KeyboardArrowDownIcon}
                renderValue={(v) => (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <GroupsOutlinedIcon sx={{ fontSize: 16, color: "#6B7280" }} />
                    <Typography sx={{ fontSize: 13, fontFamily: "Poppins, sans-serif", color: "#374151" }}>
                      {v} Guest{Number(v) !== 1 ? "s" : ""}
                    </Typography>
                  </Box>
                )}
                sx={{
                  height: 46, borderRadius: "10px",
                  backgroundColor: "#FAFAFA",
                  "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E5E7EB" },
                  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#9CA3AF" },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#FF3D01", borderWidth: 1.5 },
                  "& .MuiSelect-icon": { fontSize: 18, color: "#6B7280" },
                }}
              >
                {GUEST_OPTIONS.map((n) => (
                  <MenuItem key={n} value={n} sx={{ fontSize: 13, fontFamily: "Poppins, sans-serif" }}>
                    {n} Guest{n !== 1 ? "s" : ""}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Meal type */}
            <FormControl size="small" sx={{ flex: "1 1 120px", minWidth: 110 }}>
              <Select
                value={mealType}
                onChange={(e) => setMealType(e.target.value)}
                IconComponent={KeyboardArrowDownIcon}
                renderValue={(v) => (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <AccessTimeIcon sx={{ fontSize: 16, color: "#6B7280" }} />
                    <Typography sx={{ fontSize: 13, fontFamily: "Poppins, sans-serif", color: "#374151" }}>{v}</Typography>
                  </Box>
                )}
                sx={{
                  height: 46, borderRadius: "10px",
                  backgroundColor: "#FAFAFA",
                  "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E5E7EB" },
                  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#9CA3AF" },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#FF3D01", borderWidth: 1.5 },
                  "& .MuiSelect-icon": { fontSize: 18, color: "#6B7280" },
                }}
              >
                {MEAL_TYPES.map((m) => (
                  <MenuItem key={m} value={m} sx={{ fontSize: 13, fontFamily: "Poppins, sans-serif" }}>{m}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* ── Time Slot ── */}
          <Box sx={{ mb: 2.5 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#374151", mb: 1.2, fontFamily: "Poppins, sans-serif" }}>
              Select Time Slot
            </Typography>
            <Box
              sx={{
                display: "flex", flexWrap: "wrap", gap: 1,
                pb: 0.5,
              }}
            >
              {slots.map((slot) => {
                const isActive = slot === timeSlot;
                return (
                  <Box
                    key={slot}
                    onClick={() => setTimeSlot(slot)}
                    sx={{
                      px: 1.8, py: 0.7,
                      borderRadius: "8px",
                      border: isActive ? "1.5px solid #FF3D01" : "1.5px solid #E5E7EB",
                      backgroundColor: isActive ? "rgba(232,53,58,0.07)" : "#FAFAFA",
                      cursor: "pointer",
                      transition: "all .15s",
                      "&:hover": {
                        borderColor: isActive ? "#FF3D01" : "#9CA3AF",
                        backgroundColor: isActive ? "rgba(232,53,58,0.1)" : "#F3F4F6",
                      },
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: 12, fontWeight: isActive ? 700 : 500,
                        color: isActive ? "#FF3D01" : "#4B5563",
                        fontFamily: "Poppins, sans-serif",
                      }}
                    >
                      {slot}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
            {errors.timeSlot && (
              <Typography sx={{ fontSize: 11, color: "#DC2626", mt: 0.5, fontFamily: "Poppins, sans-serif" }}>
                {errors.timeSlot}
              </Typography>
            )}
          </Box>

          {/* ── Special Request ── */}
          <Box sx={{ mb: 2.5 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 500, color: "#374151", mb: 0.8, fontFamily: "Poppins, sans-serif" }}>
              Any special request?
            </Typography>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="E.g. anniversary cake, high chair, allergies..."
              style={{
                width: "100%", boxSizing: "border-box",
                border: "1.5px solid #E5E7EB", borderRadius: "10px",
                padding: "10px 12px",
                fontSize: 13, fontFamily: "Poppins, sans-serif", color: "#374151",
                backgroundColor: "#FAFAFA", resize: "vertical",
                outline: "none", transition: "border-color .15s",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#FF3D01")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#E5E7EB")}
            />
          </Box>

          <Divider sx={{ borderColor: "#F1F5F9", mb: 2.5 }} />

          {/* ── Search Customer ── */}
          <Box
            sx={{
              mb: 2,
              borderRadius: "12px",
              border: "1.5px solid #E5E7EB",
              background: "#F8FAFC",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                px: 2, py: 1.2,
                display: "flex", alignItems: "center", gap: 1,
                borderBottom: "1px solid #F1F5F9",
              }}
            >
              <SearchIcon sx={{ fontSize: 16, color: "#6B7280" }} />
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#374151", fontFamily: "Poppins, sans-serif" }}>
                Search Customer
              </Typography>
            </Box>
            <Box sx={{ px: 1.5, py: 1 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search by name, phone or email..."
                value={customerSearch}
                onChange={(e) => {
                  setCustomerSearch(e.target.value);
                  /* Auto-fill demo: if user types a known name */
                  const val = e.target.value.toLowerCase();
                  const match = dummyReservations.find(
                    (r) =>
                      r.name.toLowerCase().includes(val) ||
                      r.phone.includes(val) ||
                      r.email.toLowerCase().includes(val)
                  );
                  if (match && val.length > 2) {
                    setName(match.name);
                    setEmail(match.email);
                    const ph = match.phone.replace(/^\+91/, "").replace(/^\+1/, "").replace(/^\+/, "");
                    setPhone(ph);
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ fontSize: 16, color: "#9CA3AF" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px", fontSize: 13,
                    fontFamily: "Poppins, sans-serif",
                    backgroundColor: "#FFFFFF",
                    "& fieldset": { borderColor: "#E5E7EB" },
                    "&:hover fieldset": { borderColor: "#9CA3AF" },
                    "&.Mui-focused fieldset": { borderColor: "#FF3D01", borderWidth: 1.5 },
                  },
                }}
              />
            </Box>
          </Box>

          {/* ── Customer Name + Email ── */}
          <Box sx={{ display: "flex", gap: 1.5, mb: 1.5, flexWrap: "wrap" }}>
            <Box sx={{ flex: "1 1 200px", minWidth: 160 }}>
              <Typography sx={{ fontSize: 12, fontWeight: 500, color: "#374151", mb: 0.6, fontFamily: "Poppins, sans-serif" }}>
                Customer Name <span style={{ color: "#FF3D01" }}>*</span>
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="Full name"
                value={name}
                onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: "" })); }}
                error={!!errors.name}
                helperText={errors.name}
                sx={fieldSx}
              />
            </Box>
            <Box sx={{ flex: "1 1 200px", minWidth: 160 }}>
              <Typography sx={{ fontSize: 12, fontWeight: 500, color: "#374151", mb: 0.6, fontFamily: "Poppins, sans-serif" }}>
                Email Address
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: "" })); }}
                error={!!errors.email}
                helperText={errors.email}
                sx={fieldSx}
              />
            </Box>
          </Box>

          {/* ── Phone ── */}
          <Box sx={{ mb: 3 }}>
            <Typography sx={{ fontSize: 12, fontWeight: 500, color: "#374151", mb: 0.6, fontFamily: "Poppins, sans-serif" }}>
              Phone <span style={{ color: "#FF3D01" }}>*</span>
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <FormControl size="small" sx={{ flexShrink: 0 }}>
                <Select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  IconComponent={KeyboardArrowDownIcon}
                  sx={{
                    height: 40, minWidth: 88, borderRadius: "10px",
                    fontSize: 13, fontFamily: "Poppins, sans-serif",
                    backgroundColor: "#FAFAFA",
                    "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E5E7EB" },
                    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#9CA3AF" },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#FF3D01", borderWidth: 1.5 },
                    "& .MuiSelect-icon": { fontSize: 16, color: "#6B7280" },
                  }}
                >
                  {COUNTRY_CODES.map((c) => (
                    <MenuItem key={c} value={c} sx={{ fontSize: 13, fontFamily: "Poppins, sans-serif" }}>{c}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                size="small"
                placeholder="1234567890"
                value={phone}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, "");
                  setPhone(v);
                  setErrors((p) => ({ ...p, phone: "" }));
                }}
                error={!!errors.phone}
                helperText={errors.phone}
                inputProps={{ inputMode: "numeric" }}
                sx={{
                  ...fieldSx,
                  "& .MuiOutlinedInput-root": {
                    ...fieldSx["& .MuiOutlinedInput-root"],
                    height: 40,
                  },
                }}
              />
            </Box>
          </Box>
        </Box>
      </DialogContent>

      {/* ── Footer ── */}
      <Box
        sx={{
          px: 3, py: 2,
          borderTop: "1px solid #F1F5F9",
          display: "flex", justifyContent: "flex-end", gap: 1.5,
          background: "#FFFFFF", flexShrink: 0,
        }}
      >
        <Button
          onClick={handleClose}
          variant="outlined"
          sx={{
            textTransform: "none", fontWeight: 500, fontSize: 13,
            borderColor: "#D1D5DB", color: "#6B7280",
            borderRadius: "10px", px: 3, height: 42,
            fontFamily: "Poppins, sans-serif",
            "&:hover": { borderColor: "#9CA3AF", backgroundColor: "#F9FAFB" },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={submitting}
          sx={{
            textTransform: "none", fontWeight: 700, fontSize: 13,
            background: "linear-gradient(135deg,#FF3D01,#c62a2f)",
            borderRadius: "10px", px: 3.5, height: 42,
            fontFamily: "Poppins, sans-serif",
            boxShadow: "0 3px 10px rgba(232,53,58,.4)",
            "&:hover": { background: "linear-gradient(135deg,#c62a2f,#a02020)" },
            "&:disabled": { background: "#E5E7EB", color: "#9CA3AF", boxShadow: "none" },
          }}
        >
          {submitting ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CircularProgress size={14} sx={{ color: "#fff" }} />
              Saving...
            </Box>
          ) : (
            "Reserve Now"
          )}
        </Button>
      </Box>
    </Dialog>
  );
}

/* ─────────────────────────────────────────────────────
   Main Reservations Page
───────────────────────────────────────────────────── */
export default function Reservations() {
  const [statusMap, setStatusMap] = useState<Record<number, ReservationStatus>>({});
  const [tableMap, setTableMap]   = useState<Record<number, string>>({});
  const [dateRange, setDateRange] = useState("Current Week");
  const [fromDate, setFromDate]   = useState("");
  const [toDate, setToDate]       = useState("");
  const [search, setSearch]       = useState("");

  /* New-reservation modal */
  const [newResOpen, setNewResOpen] = useState(false);
  const [localReservations, setLocalReservations] = useState<Reservation[]>([]);

  /* Assign-table modal */
  const [assignOpen, setAssignOpen]           = useState(false);
  const [assigningReservation, setAssigningReservation] = useState<Reservation | null>(null);

  const handleStatusChange = useCallback((id: number, status: ReservationStatus) => {
    setStatusMap((prev) => ({ ...prev, [id]: status }));
  }, []);

  const handleNewReservationSubmit = useCallback((data: Omit<Reservation, "id">) => {
    setLocalReservations((prev) => [
      ...prev,
      { ...data, id: Date.now() },
    ]);
  }, []);

  const handleOpenAssign = useCallback((res: Reservation) => {
    setAssigningReservation(res);
    setAssignOpen(true);
  }, []);

  const handleAssign = useCallback((reservationId: number, tableLabel: string) => {
    setTableMap((prev) => ({ ...prev, [reservationId]: tableLabel }));
  }, []);

  const allReservations = useMemo(
    () => [...dummyReservations, ...localReservations],
    [localReservations]
  );

  const filteredReservations = useMemo(() => {
    if (!search.trim()) return allReservations;
    const q = search.toLowerCase();
    return allReservations.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.phone.includes(q)
    );
  }, [search, allReservations]);

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
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Typography sx={{ fontSize: 18, fontWeight: 700, color: "#111827", fontFamily: "Poppins, sans-serif" }}>
            Reservations
          </Typography>
          <Box
            sx={{
              px: 1.5, py: 0.2, borderRadius: "20px",
              background: "linear-gradient(135deg,#FF3D01,#FF6B6B)",
              boxShadow: "0 2px 8px rgba(232,53,58,.3)",
            }}
          >
            <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#FFF", fontFamily: "Poppins, sans-serif" }}>
              {filteredReservations.length}
            </Typography>
          </Box>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setNewResOpen(true)}
          sx={{
            background: "linear-gradient(135deg,#FF3D01,#c62a2f)",
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
          const assignedTable = tableMap[res.id] ?? res.table;

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
                {assignedTable ? (
                  <Box
                    onClick={() => handleOpenAssign(res)}
                    sx={{
                      display: "flex", alignItems: "center", gap: 0.8,
                      px: 1.4, py: 0.5, borderRadius: "8px",
                      backgroundColor: "rgba(232,53,58,0.2)",
                      border: "1px solid rgba(232,53,58,0.4)",
                      cursor: "pointer",
                      "&:hover": { backgroundColor: "rgba(232,53,58,0.3)" },
                    }}
                  >
                    <TableBarOutlinedIcon sx={{ fontSize: 15, color: "#FCA5A5" }} />
                    <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#FCA5A5", fontFamily: "Poppins, sans-serif" }}>
                      {assignedTable}
                    </Typography>
                  </Box>
                ) : (
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<TableBarOutlinedIcon sx={{ fontSize: 14 }} />}
                    onClick={() => handleOpenAssign(res)}
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

                {/* Guests count */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <PeopleAltOutlinedIcon sx={{ fontSize: 15, color: "#9CA3AF" }} />
                  <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#E5E7EB", fontFamily: "Poppins, sans-serif" }}>
                    {res.guests} Guests
                  </Typography>
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
                  <CalendarTodayOutlinedIcon sx={{ fontSize: 15, color: "#FF3D01" }} />
                  <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#FF3D01", fontFamily: "Poppins, sans-serif" }}>
                    {res.date}, {res.time}
                  </Typography>
                </Box>

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

      {/* ── NEW RESERVATION MODAL ── */}
      <NewReservationModal
        open={newResOpen}
        onClose={() => setNewResOpen(false)}
        onSubmit={handleNewReservationSubmit}
      />

      {/* ── ASSIGN TABLE MODAL ── */}
      <AssignTableModal
        open={assignOpen}
        reservation={assigningReservation}
        allReservations={allReservations}
        tableMap={tableMap}
        onClose={() => setAssignOpen(false)}
        onAssign={handleAssign}
      />
    </Box>
  );
}
