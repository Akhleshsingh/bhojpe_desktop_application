import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Button,
  IconButton,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import { useCustomers } from "../context/CustomerContext";
import type { Customer } from "../types/customer";
import AddCustomerModal from "../components/AddCustomerModal";
import EditCustomerModal from "../components/EditCustomerModal";
import ImportCustomerModal from "../components/ImportCustomerModal";

const PER_PAGE = 10;
const FONT = "'Plus Jakarta Sans', sans-serif";

const COL_HEADER = {
  fontSize: 11,
  fontWeight: 700,
  color: "#6B7280",
  fontFamily: FONT,
  letterSpacing: 0.6,
  textTransform: "uppercase" as const,
};

const CELL = {
  fontSize: 13,
  color: "#111827",
  fontFamily: FONT,
};

export default function Customers() {
  const { customers, loading, searchCustomers, deleteCustomer, refreshCustomers } = useCustomers();
  const [search, setSearch]           = useState("");
  const [searchResults, setSearchResults] = useState<Customer[] | null>(null);
  const [searching, setSearching]     = useState(false);
  const [page, setPage]               = useState(1);

  const [addOpen, setAddOpen]         = useState(false);
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
  const [importOpen, setImportOpen]   = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);
  const [deleting, setDeleting]       = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!search.trim()) { setSearchResults(null); setPage(1); return; }

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      const results = await searchCustomers(search.trim());
      setSearchResults(results || []);
      setPage(1);
      setSearching(false);
    }, 350);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [search, searchCustomers]);

  const displayList = searchResults !== null ? searchResults : customers;
  const totalPages  = Math.max(1, Math.ceil(displayList.length / PER_PAGE));
  const paginated   = displayList.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  /* ── CSV Export ── */
  const handleExport = useCallback(() => {
    const esc = (v: string | number | null | undefined) => {
      const s = v == null ? "" : String(v);
      return s.includes(",") || s.includes('"') || s.includes("\n")
        ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const headers = ["Name", "Email", "Phone", "Address", "Total Orders"];
    const rows = displayList.map(c => [
      esc(c.name), esc(c.email), esc(c.phone), esc(c.delivery_address), esc(c.orders_count),
    ].join(","));
    const csv  = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = `customers_${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  }, [displayList]);

  /* ── Delete confirm ── */
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    await deleteCustomer(deleteTarget.id);
    setDeleting(false);
    setDeleteTarget(null);
  };

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f5f0ea", fontFamily: FONT }}>
      <Box sx={{ p: 3 }}>

        {/* ── TITLE ── */}
        <Typography sx={{ fontSize: 22, fontWeight: 700, color: "#111827", fontFamily: FONT, mb: 2.5 }}>
          Customers
        </Typography>

        {/* ── TOOLBAR ── */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2.5 }}>
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
                height: 38, fontSize: 13, fontFamily: FONT,
                borderRadius: "8px", backgroundColor: "#fff",
                "& fieldset": { borderColor: "#D1D5DB" },
                "&:hover fieldset": { borderColor: "#9CA3AF" },
              },
            }}
          />

          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<FileUploadOutlinedIcon sx={{ fontSize: 16 }} />}
              onClick={() => setImportOpen(true)}
              sx={{
                textTransform: "none", fontSize: 13, fontWeight: 600, fontFamily: FONT,
                height: 38, px: 2, borderColor: "#D1D5DB", color: "#374151", borderRadius: "8px",
                "&:hover": { borderColor: "#9CA3AF", backgroundColor: "#F9FAFB" },
              }}
            >
              Import
            </Button>
            <Button
              variant="outlined"
              startIcon={<FileDownloadOutlinedIcon sx={{ fontSize: 16 }} />}
              onClick={handleExport}
              disabled={displayList.length === 0}
              sx={{
                textTransform: "none", fontSize: 13, fontWeight: 600, fontFamily: FONT,
                height: 38, px: 2, borderColor: "#D1D5DB", color: "#374151", borderRadius: "8px",
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
                textTransform: "none", fontSize: 13, fontWeight: 600, fontFamily: FONT,
                height: 38, px: 2,
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
        <Box sx={{
          backgroundColor: "#FFFFFF",
          borderRadius: "12px",
          border: "1px solid #E5E7EB",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          overflow: "hidden",
        }}>
          {/* Header */}
          <Box sx={{
            display: "grid",
            gridTemplateColumns: "1.8fr 2.2fr 1.5fr 1.2fr 1fr",
            px: 2.5, py: 1.4,
            backgroundColor: "#F9FAFB",
            borderBottom: "1px solid #E5E7EB",
          }}>
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
              <Typography sx={{ fontSize: 13, color: "#9CA3AF", fontFamily: FONT }}>Loading customers…</Typography>
            </Box>
          )}

          {/* Empty state */}
          {!loading && !searching && displayList.length === 0 && (
            <Box sx={{ px: 2.5, py: 7, display: "flex", flexDirection: "column", alignItems: "center", gap: 1.5 }}>
              <Box sx={{ width: 56, height: 56, borderRadius: "50%", backgroundColor: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <PeopleOutlineIcon sx={{ fontSize: 28, color: "#FF3D01" }} />
              </Box>
              <Typography sx={{ fontSize: 15, fontWeight: 600, color: "#374151", fontFamily: FONT }}>
                No customers found
              </Typography>
              <Typography sx={{ fontSize: 13, color: "#9CA3AF", fontFamily: FONT }}>
                {search ? "Try a different search term" : "No customers have been added yet"}
              </Typography>
            </Box>
          )}

          {/* Rows */}
          {paginated.map((customer, idx) => {
            const orders = customer.orders_count ?? 0;
            return (
              <Box
                key={customer.id}
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1.8fr 2.2fr 1.5fr 1.2fr 1fr",
                  px: 2.5, py: 1.3,
                  alignItems: "center",
                  backgroundColor: idx % 2 === 0 ? "#FFFFFF" : "#FAFAFA",
                  borderBottom: "1px solid #F3F4F6",
                  transition: "background .15s",
                  "&:hover": { backgroundColor: "#F0F9FF" },
                  "&:last-child": { borderBottom: "none" },
                }}
              >
                <Typography sx={{ ...CELL, fontWeight: 500 }}>{customer.name || "—"}</Typography>
                <Typography sx={{ ...CELL, color: "#4B5563" }}>{customer.email || "--"}</Typography>
                <Typography sx={{ ...CELL, color: "#374151" }}>
                  {customer.phone ? String(customer.phone) : "—"}
                </Typography>

                <Box>
                  <Box sx={{
                    display: "inline-flex", alignItems: "center",
                    px: 1.2, py: 0.3,
                    border: "1px solid #D1D5DB", borderRadius: "6px",
                    backgroundColor: "#F9FAFB",
                  }}>
                    <Typography sx={{ fontSize: 11, fontWeight: 600, color: "#374151", fontFamily: FONT, letterSpacing: 0.3 }}>
                      {orders} ORDERS
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 0.5 }}>
                  <Button
                    size="small"
                    startIcon={<EditOutlinedIcon sx={{ fontSize: 14 }} />}
                    onClick={() => setEditCustomer(customer)}
                    sx={{
                      textTransform: "none", fontSize: 12, fontWeight: 600, fontFamily: FONT,
                      color: "#0891B2", px: 1, py: 0.4, minWidth: 0,
                      "&:hover": { backgroundColor: "#E0F7FA" },
                    }}
                  >
                    Update
                  </Button>
                  <IconButton
                    size="small"
                    onClick={() => setDeleteTarget(customer)}
                    sx={{ color: "#FF3D01", p: 0.5, "&:hover": { backgroundColor: "#FEF2F2" } }}
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
            <Typography sx={{ fontSize: 13, color: "#6B7280", fontFamily: FONT }}>
              Showing {(page - 1) * PER_PAGE + 1} To {Math.min(page * PER_PAGE, displayList.length)} of {displayList.length} results
            </Typography>

            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <IconButton size="small" disabled={page === 1} onClick={() => setPage(p => p - 1)}
                sx={{ width: 32, height: 32, border: "1px solid #D1D5DB", borderRadius: "6px", color: page === 1 ? "#D1D5DB" : "#374151", "&:hover:not(:disabled)": { backgroundColor: "#F3F4F6" } }}>
                <ChevronLeftIcon sx={{ fontSize: 18 }} />
              </IconButton>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <Box key={p} onClick={() => setPage(p)}
                  sx={{
                    width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center",
                    borderRadius: "6px", cursor: "pointer",
                    border: `1px solid ${p === page ? "#FF3D01" : "#D1D5DB"}`,
                    backgroundColor: p === page ? "#FF3D01" : "#FFFFFF",
                    transition: "all .15s",
                    "&:hover": { backgroundColor: p === page ? "#c62a2f" : "#F3F4F6" },
                  }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 600, color: p === page ? "#FFF" : "#374151", fontFamily: FONT }}>
                    {p}
                  </Typography>
                </Box>
              ))}

              <IconButton size="small" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
                sx={{ width: 32, height: 32, border: "1px solid #D1D5DB", borderRadius: "6px", color: page === totalPages ? "#D1D5DB" : "#374151", "&:hover:not(:disabled)": { backgroundColor: "#F3F4F6" } }}>
                <ChevronRightIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Box>
          </Box>
        )}
      </Box>

      {/* ── ADD CUSTOMER ── */}
      <AddCustomerModal open={addOpen} onClose={() => setAddOpen(false)} onSave={() => setAddOpen(false)} />

      {/* ── EDIT CUSTOMER ── */}
      <EditCustomerModal
        open={editCustomer !== null}
        customer={editCustomer}
        onClose={() => setEditCustomer(null)}
        onSaved={() => setEditCustomer(null)}
      />

      {/* ── IMPORT CUSTOMERS ── */}
      <ImportCustomerModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onDone={() => { setImportOpen(false); refreshCustomers(); }}
      />

      {/* ── DELETE CONFIRM ── */}
      <Dialog open={deleteTarget !== null} onClose={() => !deleting && setDeleteTarget(null)} PaperProps={{ sx: { borderRadius: "16px", width: 400 } }}>
        <DialogTitle sx={{ px: 3, pt: 3, pb: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box sx={{ width: 40, height: 40, borderRadius: "10px", backgroundColor: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <WarningAmberRoundedIcon sx={{ fontSize: 22, color: "#FF3D01" }} />
            </Box>
            <Typography sx={{ fontSize: 16, fontWeight: 700, color: "#111827", fontFamily: FONT }}>
              Delete Customer?
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ px: 3, pb: 1 }}>
          <Typography sx={{ fontSize: 13, color: "#6B7280", fontFamily: FONT, lineHeight: 1.6 }}>
            Are you sure you want to delete <strong style={{ color: "#111827" }}>{deleteTarget?.name}</strong>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button fullWidth variant="outlined" onClick={() => setDeleteTarget(null)} disabled={deleting}
            sx={{ textTransform: "none", fontSize: 13, fontWeight: 600, fontFamily: FONT, height: 40, borderRadius: "10px", borderColor: "#D1D5DB", color: "#374151", "&:hover": { borderColor: "#9CA3AF" } }}>
            Cancel
          </Button>
          <Button fullWidth variant="contained" onClick={handleDeleteConfirm} disabled={deleting}
            sx={{
              textTransform: "none", fontSize: 13, fontWeight: 700, fontFamily: FONT, height: 40, borderRadius: "10px",
              background: "linear-gradient(135deg,#FF3D01,#c62a2f)",
              boxShadow: "0 4px 12px rgba(232,53,58,.3)",
              "&:hover": { background: "linear-gradient(135deg,#c62a2f,#a02020)" },
              "&.Mui-disabled": { background: "#F3F4F6", color: "#D1D5DB" },
            }}>
            {deleting ? <CircularProgress size={16} sx={{ color: "#fff" }} /> : "Yes, Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
