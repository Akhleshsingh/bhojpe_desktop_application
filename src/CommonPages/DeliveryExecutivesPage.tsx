import React, { useMemo, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Button,
  IconButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import DeliveryDiningIcon from "@mui/icons-material/DeliveryDining";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import AddIcon from "@mui/icons-material/Add";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useDeliveryExecutives } from "../context/DeliveryExecutive";

const PER_PAGE = 10;

function getStatusMeta(exec: any): { label: string; bg: string; color: string } {
  const s = (exec.status || "").toLowerCase();
  if (s === "on_delivery" || s === "on delivery") return { label: "ON DELIVERY", bg: "#E0F7FA", color: "#00838F" };
  if (s === "available") return { label: "AVAILABLE", bg: "#E8F5E9", color: "#2E7D32" };
  if (exec.is_active === 0) return { label: "INACTIVE", bg: "#F3F4F6", color: "#6B7280" };
  return { label: "AVAILABLE", bg: "#E8F5E9", color: "#2E7D32" };
}

const COL_HEADER = {
  fontSize: 11,
  fontWeight: 700,
  color: "#6B7280",
  fontFamily: "Poppins, sans-serif",
  letterSpacing: 0.6,
  textTransform: "uppercase" as const,
};

const CELL = {
  fontSize: 13,
  color: "#111827",
  fontFamily: "Poppins, sans-serif",
};

export default function DeliveryExecutivesPage() {
  const { deliveryExecutives, loading } = useDeliveryExecutives();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (!search.trim()) return deliveryExecutives;
    const q = search.toLowerCase();
    return deliveryExecutives.filter(
      (e) =>
        e.name?.toLowerCase().includes(q) ||
        e.phone?.includes(q) ||
        e.email?.toLowerCase().includes(q)
    );
  }, [deliveryExecutives, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleSearch = (v: string) => {
    setSearch(v);
    setPage(1);
  };

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#F8FAFC", fontFamily: "Poppins, sans-serif" }}>

      {/* ── PAGE WRAPPER ── */}
      <Box sx={{ p: 3 }}>

        {/* ── TITLE ── */}
        <Typography sx={{ fontSize: 22, fontWeight: 700, color: "#111827", fontFamily: "Poppins, sans-serif", mb: 2.5 }}>
          Delivery Executive
        </Typography>

        {/* ── TOOLBAR ── */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2.5 }}>
          {/* Search */}
          <TextField
            size="small"
            placeholder="Search by name, email or phone number"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 16, color: "#9CA3AF" }} />
                </InputAdornment>
              ),
            }}
            sx={{
              width: 280,
              "& .MuiOutlinedInput-root": {
                height: 38, fontSize: 13, fontFamily: "Poppins, sans-serif",
                borderRadius: "8px", backgroundColor: "#fff",
                "& fieldset": { borderColor: "#D1D5DB" },
                "&:hover fieldset": { borderColor: "#9CA3AF" },
              },
            }}
          />

          {/* Actions */}
          <Box sx={{ display: "flex", gap: 1.2 }}>
            <Button
              variant="outlined"
              startIcon={<FileDownloadOutlinedIcon sx={{ fontSize: 16 }} />}
              sx={{
                textTransform: "none", fontSize: 13, fontWeight: 600,
                fontFamily: "Poppins, sans-serif", height: 38, px: 2,
                borderColor: "#D1D5DB", color: "#374151", borderRadius: "8px",
                "&:hover": { borderColor: "#9CA3AF", backgroundColor: "#F9FAFB" },
              }}
            >
              Export
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon sx={{ fontSize: 16 }} />}
              sx={{
                textTransform: "none", fontSize: 13, fontWeight: 600,
                fontFamily: "Poppins, sans-serif", height: 38, px: 2,
                background: "linear-gradient(135deg,#E8353A,#c62a2f)",
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(232,53,58,.35)",
                "&:hover": { background: "linear-gradient(135deg,#c62a2f,#a02020)" },
              }}
            >
              Add Executive
            </Button>
          </Box>
        </Box>

        {/* ── TABLE ── */}
        <Box
          sx={{
            backgroundColor: "#FFFFFF",
            borderRadius: "12px",
            border: "1px solid #E5E7EB",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            overflow: "hidden",
          }}
        >
          {/* Table header */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "2fr 1.5fr 1.2fr 1.2fr 1fr",
              px: 2.5, py: 1.4,
              backgroundColor: "#F9FAFB",
              borderBottom: "1px solid #E5E7EB",
            }}
          >
            <Typography sx={COL_HEADER}>Member Name</Typography>
            <Typography sx={COL_HEADER}>Phone</Typography>
            <Typography sx={COL_HEADER}>Total Orders</Typography>
            <Typography sx={COL_HEADER}>Status</Typography>
            <Typography sx={{ ...COL_HEADER, textAlign: "right" }}>Action</Typography>
          </Box>

          {/* Loading */}
          {loading && (
            <Box sx={{ px: 2.5, py: 4, textAlign: "center" }}>
              <Typography sx={{ fontSize: 13, color: "#9CA3AF", fontFamily: "Poppins, sans-serif" }}>
                Loading delivery executives…
              </Typography>
            </Box>
          )}

          {/* Empty state */}
          {!loading && filtered.length === 0 && (
            <Box sx={{ px: 2.5, py: 6, display: "flex", flexDirection: "column", alignItems: "center", gap: 1.5 }}>
              <Box sx={{ width: 56, height: 56, borderRadius: "50%", backgroundColor: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <DeliveryDiningIcon sx={{ fontSize: 28, color: "#E8353A" }} />
              </Box>
              <Typography sx={{ fontSize: 15, fontWeight: 600, color: "#374151", fontFamily: "Poppins, sans-serif" }}>
                No delivery executives found
              </Typography>
              <Typography sx={{ fontSize: 13, color: "#9CA3AF", fontFamily: "Poppins, sans-serif" }}>
                {search ? "Try a different search term" : "No executives have been added yet"}
              </Typography>
            </Box>
          )}

          {/* Rows */}
          {!loading && paginated.map((exec, idx) => {
            const status = getStatusMeta(exec);
            const totalOrders = exec.total_orders ?? exec.order_count ?? 0;
            const isEven = idx % 2 === 0;

            return (
              <Box
                key={exec.id}
                sx={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1.5fr 1.2fr 1.2fr 1fr",
                  px: 2.5, py: 1.3,
                  alignItems: "center",
                  backgroundColor: isEven ? "#FFFFFF" : "#FAFAFA",
                  borderBottom: "1px solid #F3F4F6",
                  transition: "background .15s",
                  "&:hover": { backgroundColor: "#F0F9FF" },
                  "&:last-child": { borderBottom: "none" },
                }}
              >
                {/* Name */}
                <Typography sx={{ ...CELL, fontWeight: 500 }}>{exec.name}</Typography>

                {/* Phone */}
                <Typography sx={{ ...CELL, color: "#374151" }}>{exec.phone || "—"}</Typography>

                {/* Total Orders chip */}
                <Box>
                  <Box
                    sx={{
                      display: "inline-flex", alignItems: "center",
                      px: 1.2, py: 0.3,
                      border: "1px solid #D1D5DB", borderRadius: "6px",
                      backgroundColor: "#F9FAFB",
                    }}
                  >
                    <Typography sx={{ fontSize: 11, fontWeight: 600, color: "#374151", fontFamily: "Poppins, sans-serif", letterSpacing: 0.3 }}>
                      {totalOrders} ORDERS
                    </Typography>
                  </Box>
                </Box>

                {/* Status chip */}
                <Box>
                  <Box
                    sx={{
                      display: "inline-flex", alignItems: "center",
                      px: 1.2, py: 0.3,
                      border: `1px solid ${status.bg}`,
                      borderRadius: "6px",
                      backgroundColor: status.bg,
                    }}
                  >
                    <Typography sx={{ fontSize: 11, fontWeight: 700, color: status.color, fontFamily: "Poppins, sans-serif", letterSpacing: 0.3 }}>
                      {status.label}
                    </Typography>
                  </Box>
                </Box>

                {/* Actions */}
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 0.5 }}>
                  <Button
                    size="small"
                    startIcon={<EditOutlinedIcon sx={{ fontSize: 14 }} />}
                    sx={{
                      textTransform: "none", fontSize: 12, fontWeight: 600,
                      fontFamily: "Poppins, sans-serif",
                      color: "#0891B2", px: 1, py: 0.4, minWidth: 0,
                      "&:hover": { backgroundColor: "#E0F7FA" },
                    }}
                  >
                    Update
                  </Button>
                  <IconButton
                    size="small"
                    sx={{
                      color: "#E8353A", p: 0.5,
                      "&:hover": { backgroundColor: "#FEF2F2" },
                    }}
                  >
                    <DeleteOutlineIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Box>
              </Box>
            );
          })}
        </Box>

        {/* ── PAGINATION ── */}
        {filtered.length > 0 && (
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 2 }}>
            {/* Result count */}
            <Typography sx={{ fontSize: 13, color: "#6B7280", fontFamily: "Poppins, sans-serif" }}>
              Showing {filtered.length === 0 ? 0 : (page - 1) * PER_PAGE + 1} To{" "}
              {Math.min(page * PER_PAGE, filtered.length)} of {filtered.length} results
            </Typography>

            {/* Page buttons */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <IconButton
                size="small"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                sx={{
                  width: 32, height: 32, border: "1px solid #D1D5DB", borderRadius: "6px",
                  color: page === 1 ? "#D1D5DB" : "#374151",
                  "&:hover:not(:disabled)": { backgroundColor: "#F3F4F6" },
                }}
              >
                <ChevronLeftIcon sx={{ fontSize: 18 }} />
              </IconButton>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Box
                  key={p}
                  onClick={() => setPage(p)}
                  sx={{
                    width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center",
                    borderRadius: "6px", cursor: "pointer",
                    border: `1px solid ${p === page ? "#E8353A" : "#D1D5DB"}`,
                    backgroundColor: p === page ? "#E8353A" : "#FFFFFF",
                    transition: "all .15s",
                    "&:hover": { backgroundColor: p === page ? "#c62a2f" : "#F3F4F6" },
                  }}
                >
                  <Typography sx={{ fontSize: 13, fontWeight: 600, color: p === page ? "#FFF" : "#374151", fontFamily: "Poppins, sans-serif" }}>
                    {p}
                  </Typography>
                </Box>
              ))}

              <IconButton
                size="small"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                sx={{
                  width: 32, height: 32, border: "1px solid #D1D5DB", borderRadius: "6px",
                  color: page === totalPages ? "#D1D5DB" : "#374151",
                  "&:hover:not(:disabled)": { backgroundColor: "#F3F4F6" },
                }}
              >
                <ChevronRightIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Box>
          </Box>
        )}

      </Box>
    </Box>
  );
}
