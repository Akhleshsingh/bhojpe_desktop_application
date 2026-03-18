import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Button,
  CircularProgress,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import LocalPhoneOutlinedIcon from "@mui/icons-material/LocalPhoneOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import AddIcon from "@mui/icons-material/Add";
import { useWaiters } from "../context/WaitersContext";
import AddStaffMemberDialog from "../components/AddStaffMemberDialog";

const AVATAR_COLORS: Record<string, string> = {
  A: "#E3F2FD", B: "#FCE4EC", C: "#E8F5E9", D: "#FFF3E0",
  E: "#F3E5F5", F: "#E0F7FA", G: "#FFF9C4", H: "#EFEBE9",
  I: "#E8EAF6", J: "#F9FBE7", K: "#FCE4EC", L: "#E3F2FD",
  M: "#E8F5E9", N: "#FFF3E0", O: "#F3E5F5", P: "#E0F7FA",
  Q: "#FFF9C4", R: "#EFEBE9", S: "#E8EAF6", T: "#F9FBE7",
  U: "#FCE4EC", V: "#E3F2FD", W: "#E8F5E9", X: "#FFF3E0",
  Y: "#F3E5F5", Z: "#E0F7FA",
};

const AVATAR_TEXT_COLORS: Record<string, string> = {
  A: "#1565C0", B: "#AD1457", C: "#2E7D32", D: "#E65100",
  E: "#6A1B9A", F: "#00838F", G: "#F57F17", H: "#4E342E",
  I: "#283593", J: "#558B2F", K: "#AD1457", L: "#1565C0",
  M: "#2E7D32", N: "#E65100", O: "#6A1B9A", P: "#00838F",
  Q: "#F57F17", R: "#4E342E", S: "#283593", T: "#558B2F",
  U: "#AD1457", V: "#1565C0", W: "#2E7D32", X: "#E65100",
  Y: "#6A1B9A", Z: "#00838F",
};

export default function Waiters() {
  const { waiters, loading, fetchWaiters } = useWaiters();
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);

  const filtered = useMemo(() => {
    if (!search.trim()) return waiters;
    const q = search.toLowerCase();
    return waiters.filter(
      (w: any) =>
        w.name?.toLowerCase().includes(q) ||
        w.phone_number?.includes(q) ||
        w.email?.toLowerCase().includes(q)
    );
  }, [waiters, search]);

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f5f0ea", fontFamily: "'Montserrat', sans-serif" }}>
      <Box sx={{ p: 3 }}>

        {/* ── HEADER ── */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
          <Typography sx={{ fontSize: 22, fontWeight: 700, color: "#111827", fontFamily: "'Montserrat', sans-serif" }}>
            Waiters ({waiters.length})
          </Typography>

          <Box sx={{ display: "flex", gap: 1.2, alignItems: "center" }}>
            {/* Search */}
            <TextField
              size="small"
              placeholder="Search waiter…"
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
                width: 230,
                "& .MuiOutlinedInput-root": {
                  height: 36, fontSize: 13, fontFamily: "'Montserrat', sans-serif",
                  borderRadius: "8px", backgroundColor: "#fff",
                  "& fieldset": { borderColor: "#D1D5DB" },
                  "&:hover fieldset": { borderColor: "#9CA3AF" },
                },
              }}
            />

            <Button
              variant="contained"
              startIcon={<AddIcon sx={{ fontSize: 16 }} />}
              onClick={() => setAddOpen(true)}
              sx={{
                textTransform: "none", fontSize: 13, fontWeight: 600,
                fontFamily: "'Montserrat', sans-serif", height: 36, px: 2,
                background: "linear-gradient(135deg,#FF3D01,#c62a2f)",
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(232,53,58,.3)",
                "&:hover": { background: "linear-gradient(135deg,#c62a2f,#a02020)" },
              }}
            >
              Add Waiter
            </Button>
          </Box>
        </Box>

        {/* ── LOADING ── */}
        {loading && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 6, justifyContent: "center" }}>
            <CircularProgress size={22} sx={{ color: "#FF3D01" }} />
            <Typography sx={{ fontSize: 13, color: "#9CA3AF", fontFamily: "'Montserrat', sans-serif" }}>
              Loading waiters…
            </Typography>
          </Box>
        )}

        {/* ── EMPTY ── */}
        {!loading && filtered.length === 0 && (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 10, gap: 1.5 }}>
            <Box sx={{ width: 60, height: 60, borderRadius: "50%", backgroundColor: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <PeopleOutlineIcon sx={{ fontSize: 30, color: "#FF3D01" }} />
            </Box>
            <Typography sx={{ fontSize: 15, fontWeight: 600, color: "#374151", fontFamily: "'Montserrat', sans-serif" }}>
              No waiters found
            </Typography>
            <Typography sx={{ fontSize: 13, color: "#9CA3AF", fontFamily: "'Montserrat', sans-serif" }}>
              {search ? "Try a different search term" : "No waiters have been added yet"}
            </Typography>
          </Box>
        )}

        {/* ── CARD GRID ── */}
        {!loading && filtered.length > 0 && (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 2.5,
            }}
          >
            {filtered.map((waiter: any) => {
              const initial = (waiter.name?.charAt(0) ?? "?").toUpperCase();
              const avatarBg = AVATAR_COLORS[initial] ?? "#F3F4F6";
              const avatarColor = AVATAR_TEXT_COLORS[initial] ?? "#374151";
              const isActive = !!waiter.is_active;

              return (
                <Box
                  key={waiter.id}
                  sx={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: "12px",
                    border: "1px solid #E5E7EB",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                    p: 2,
                    display: "flex",
                    flexDirection: "column",
                    gap: 1.2,
                    minHeight: 190,
                    transition: "box-shadow .2s, transform .2s",
                    "&:hover": { boxShadow: "0 8px 24px rgba(0,0,0,0.09)", transform: "translateY(-2px)" },
                  }}
                >
                  {/* ── Card top: avatar + name + status ── */}
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                      {/* Avatar */}
                      <Box
                        sx={{
                          width: 34, height: 34, borderRadius: "8px",
                          backgroundColor: avatarBg,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <Typography sx={{ fontSize: 14, fontWeight: 700, color: avatarColor, fontFamily: "'Montserrat', sans-serif" }}>
                          {initial}
                        </Typography>
                      </Box>

                      {/* Name */}
                      <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#111827", fontFamily: "'Montserrat', sans-serif", lineHeight: 1.3 }}>
                        {waiter.name}
                      </Typography>
                    </Box>

                    {/* Status badge */}
                    <Box
                      sx={{
                        px: 1, py: 0.3,
                        borderRadius: "5px",
                        backgroundColor: isActive ? "#DCFCE7" : "#FEF2F2",
                        border: `1px solid ${isActive ? "#BBF7D0" : "#FECACA"}`,
                        flexShrink: 0,
                      }}
                    >
                      <Typography sx={{ fontSize: 10, fontWeight: 700, color: isActive ? "#15803D" : "#DC2626", fontFamily: "'Montserrat', sans-serif", letterSpacing: 0.2 }}>
                        {isActive ? "Active" : "Inactive"}
                      </Typography>
                    </Box>
                  </Box>

                  {/* ID row */}
                  <Typography sx={{ fontSize: 12, color: "#9CA3AF", fontFamily: "'Montserrat', sans-serif" }}>
                    ID • {waiter.id}
                  </Typography>

                  {/* Divider line */}
                  <Box sx={{ borderTop: "1px solid #F3F4F6" }} />

                  {/* Contact info */}
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 0.7, flex: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                      <LocalPhoneOutlinedIcon sx={{ fontSize: 14, color: "#FF3D01", flexShrink: 0 }} />
                      <Typography sx={{ fontSize: 13, color: "#374151", fontFamily: "'Montserrat', sans-serif" }}>
                        {waiter.phone_number || "—"}
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                      <EmailOutlinedIcon sx={{ fontSize: 14, color: "#6B7280", flexShrink: 0 }} />
                      <Typography sx={{ fontSize: 12, color: "#6B7280", fontFamily: "'Montserrat', sans-serif", wordBreak: "break-word" }}>
                        {waiter.email || "—"}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Divider + View button */}
                  <Box sx={{ borderTop: "1px solid #F3F4F6", pt: 1, display: "flex", justifyContent: "flex-end" }}>
                    <Button
                      size="small"
                      sx={{
                        textTransform: "none", fontSize: 13, fontWeight: 600,
                        fontFamily: "'Montserrat', sans-serif",
                        color: "#0891B2", px: 1, py: 0,
                        minWidth: 0,
                        "&:hover": { backgroundColor: "#E0F7FA", color: "#0E7490" },
                      }}
                    >
                      View
                    </Button>
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}
      </Box>

      {/* ── Add Waiter Dialog ── */}
      <AddStaffMemberDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onAdded={fetchWaiters}
        roleKeyword="waiter"
        title="Add New Waiter"
      />
    </Box>
  );
}
