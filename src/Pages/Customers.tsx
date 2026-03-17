import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Button,
  IconButton,
  CircularProgress,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import AddIcon from "@mui/icons-material/Add";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import { useCustomers } from "../context/CustomerContext";
import AddCustomerModal from "../components/AddCustomerModal";

const PER_PAGE = 10;

const COL_HEADER = {
  fontSize: 11,
  fontWeight: 700,
  color: "#6B7280",
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  letterSpacing: 0.6,
  textTransform: "uppercase" as const,
};

const CELL = {
  fontSize: 13,
  color: "#111827",
  fontFamily: "'Plus Jakarta Sans', sans-serif",
};

export default function Customers() {
  const { customers, loading, searchCustomers } = useCustomers();
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<any[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [page, setPage] = useState(1);
  const [addOpen, setAddOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!search.trim()) {
      setSearchResults(null);
      setPage(1);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      const results = await searchCustomers(search.trim());
      setSearchResults(results || []);
      setPage(1);
      setSearching(false);
    }, 350);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search, searchCustomers]);

  const displayList = searchResults !== null ? searchResults : customers;
  const totalPages = Math.max(1, Math.ceil(displayList.length / PER_PAGE));
  const paginated = displayList.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleAddSave = useCallback(() => {
    setAddOpen(false);
  }, []);

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f5f0ea", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <Box sx={{ p: 3 }}>

        {/* ── TITLE ── */}
        <Typography sx={{ fontSize: 22, fontWeight: 700, color: "#111827", fontFamily: "'Plus Jakarta Sans', sans-serif", mb: 2.5 }}>
          Customers
        </Typography>

        {/* ── TOOLBAR ── */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2.5 }}>
          {/* Search */}
          <TextField
            size="small"
            placeholder="Search by name, email or phone number"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  {searching
                    ? <CircularProgress size={14} sx={{ color: "#9CA3AF" }} />
                    : <SearchIcon sx={{ fontSize: 16, color: "#9CA3AF" }} />}
                </InputAdornment>
              ),
            }}
            sx={{
              width: 300,
              "& .MuiOutlinedInput-root": {
                height: 38, fontSize: 13, fontFamily: "'Plus Jakarta Sans', sans-serif",
                borderRadius: "8px", backgroundColor: "#fff",
                "& fieldset": { borderColor: "#D1D5DB" },
                "&:hover fieldset": { borderColor: "#9CA3AF" },
              },
            }}
          />

          {/* Action buttons */}
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<FileUploadOutlinedIcon sx={{ fontSize: 16 }} />}
              sx={{
                textTransform: "none", fontSize: 13, fontWeight: 600,
                fontFamily: "'Plus Jakarta Sans', sans-serif", height: 38, px: 2,
                borderColor: "#D1D5DB", color: "#374151", borderRadius: "8px",
                "&:hover": { borderColor: "#9CA3AF", backgroundColor: "#F9FAFB" },
              }}
            >
              Import
            </Button>
            <Button
              variant="outlined"
              startIcon={<FileDownloadOutlinedIcon sx={{ fontSize: 16 }} />}
              sx={{
                textTransform: "none", fontSize: 13, fontWeight: 600,
                fontFamily: "'Plus Jakarta Sans', sans-serif", height: 38, px: 2,
                borderColor: "#D1D5DB", color: "#374151", borderRadius: "8px",
                "&:hover": { borderColor: "#9CA3AF", backgroundColor: "#F9FAFB" },
              }}
            >
              Export
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon sx={{ fontSize: 16 }} />}
              onClick={() => setAddOpen(true)}
              sx={{
                textTransform: "none", fontSize: 13, fontWeight: 600,
                fontFamily: "'Plus Jakarta Sans', sans-serif", height: 38, px: 2,
                background: "linear-gradient(135deg,#FF3D01,#c62a2f)",
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(232,53,58,.3)",
                "&:hover": { background: "linear-gradient(135deg,#c62a2f,#a02020)" },
              }}
            >
              Add Customer
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
              gridTemplateColumns: "1.8fr 2.2fr 1.5fr 1.2fr 1fr",
              px: 2.5, py: 1.4,
              backgroundColor: "#F9FAFB",
              borderBottom: "1px solid #E5E7EB",
            }}
          >
            <Typography sx={COL_HEADER}>Customer Name</Typography>
            <Typography sx={COL_HEADER}>Email Address</Typography>
            <Typography sx={COL_HEADER}>Phone</Typography>
            <Typography sx={COL_HEADER}>Total Orders</Typography>
            <Typography sx={{ ...COL_HEADER, textAlign: "right" }}>Action</Typography>
          </Box>

          {/* Loading */}
          {(loading && !searching && displayList.length === 0) && (
            <Box sx={{ px: 2.5, py: 5, display: "flex", alignItems: "center", justifyContent: "center", gap: 1.5 }}>
              <CircularProgress size={20} sx={{ color: "#FF3D01" }} />
              <Typography sx={{ fontSize: 13, color: "#9CA3AF", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Loading customers…
              </Typography>
            </Box>
          )}

          {/* Empty state */}
          {!loading && !searching && displayList.length === 0 && (
            <Box sx={{ px: 2.5, py: 7, display: "flex", flexDirection: "column", alignItems: "center", gap: 1.5 }}>
              <Box sx={{ width: 56, height: 56, borderRadius: "50%", backgroundColor: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <PeopleOutlineIcon sx={{ fontSize: 28, color: "#FF3D01" }} />
              </Box>
              <Typography sx={{ fontSize: 15, fontWeight: 600, color: "#374151", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                No customers found
              </Typography>
              <Typography sx={{ fontSize: 13, color: "#9CA3AF", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {search ? "Try a different search term" : "No customers have been added yet"}
              </Typography>
            </Box>
          )}

          {/* Rows */}
          {paginated.map((customer, idx) => {
            const orders = customer.orders_count ?? 0;
            const isEven = idx % 2 === 0;

            return (
              <Box
                key={customer.id}
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1.8fr 2.2fr 1.5fr 1.2fr 1fr",
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
                <Typography sx={{ ...CELL, fontWeight: 500 }}>{customer.name || "—"}</Typography>

                {/* Email */}
                <Typography sx={{ ...CELL, color: "#4B5563" }}>
                  {customer.email || "--"}
                </Typography>

                {/* Phone */}
                <Typography sx={{ ...CELL, color: "#374151" }}>
                  {customer.phone ? String(customer.phone) : "—"}
                </Typography>

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
                    <Typography sx={{ fontSize: 11, fontWeight: 600, color: "#374151", fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: 0.3 }}>
                      {orders} ORDERS
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
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      color: "#0891B2", px: 1, py: 0.4, minWidth: 0,
                      "&:hover": { backgroundColor: "#E0F7FA" },
                    }}
                  >
                    Update
                  </Button>
                  <IconButton
                    size="small"
                    sx={{
                      color: "#FF3D01", p: 0.5,
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
        {displayList.length > 0 && (
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 2 }}>
            <Typography sx={{ fontSize: 13, color: "#6B7280", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Showing {(page - 1) * PER_PAGE + 1} To {Math.min(page * PER_PAGE, displayList.length)} of {displayList.length} results
            </Typography>

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
                    border: `1px solid ${p === page ? "#FF3D01" : "#D1D5DB"}`,
                    backgroundColor: p === page ? "#FF3D01" : "#FFFFFF",
                    transition: "all .15s",
                    "&:hover": { backgroundColor: p === page ? "#c62a2f" : "#F3F4F6" },
                  }}
                >
                  <Typography sx={{ fontSize: 13, fontWeight: 600, color: p === page ? "#FFF" : "#374151", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
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

      {/* ── ADD CUSTOMER MODAL ── */}
      <AddCustomerModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSave={handleAddSave}
      />
    </Box>
  );
}
