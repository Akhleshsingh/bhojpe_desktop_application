import React, { useMemo, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import DeliveryDiningIcon from "@mui/icons-material/DeliveryDining";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import AddIcon from "@mui/icons-material/Add";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import { useDeliveryExecutives } from "../context/DeliveryExecutive";
import type { DeliveryExecutive } from "../context/DeliveryExecutive";
import AddStaffMemberDialog from "../components/AddStaffMemberDialog";
import EditDeliveryExecutiveModal from "../components/EditDeliveryExecutiveModal";

const PER_PAGE = 10;
const FONT = "'Montserrat', sans-serif";

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
  fontFamily: FONT,
  letterSpacing: 0.6,
  textTransform: "uppercase" as const,
};

const CELL = {
  fontSize: 13,
  color: "#111827",
  fontFamily: FONT,
};

export default function DeliveryExecutivesPage() {
  const { deliveryExecutives, loading, fetchDeliveryExecutives, deleteExecutive } = useDeliveryExecutives();
  const [search, setSearch]   = useState("");
  const [page, setPage]       = useState(1);
  const [addOpen, setAddOpen] = useState(false);

  const [editExec, setEditExec]         = useState<DeliveryExecutive | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeliveryExecutive | null>(null);
  const [deleting, setDeleting]         = useState(false);

  const filtered = useMemo(() => {
    if (!search.trim()) return deliveryExecutives;
    const q = search.toLowerCase();
    return deliveryExecutives.filter(
      (e) =>
        e.name?.toLowerCase().includes(q) ||
        String(e.phone ?? "").includes(q) ||
        e.email?.toLowerCase().includes(q)
    );
  }, [deliveryExecutives, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleSearch = (v: string) => { setSearch(v); setPage(1); };

  const handleExport = () => {
    const esc = (v: string | number | null | undefined) => {
      const s = v == null ? "" : String(v);
      return s.includes(",") || s.includes('"') || s.includes("\n")
        ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const headers = ["Name", "Phone", "Total Orders", "Status"];
    const rows = filtered.map(e => [
      esc(e.name),
      esc(e.phone),
      esc(e.total_orders ?? e.order_count ?? 0),
      esc(getStatusMeta(e).label),
    ].join(","));
    const csv  = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url;
    a.download = `delivery_executives_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    await deleteExecutive(deleteTarget.id);
    setDeleting(false);
    setDeleteTarget(null);
  };

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f5f0ea", fontFamily: FONT }}>
      <Box sx={{ p: 3 }}>

        {/* ── TITLE ── */}
        <Typography sx={{ fontSize: 22, fontWeight: 700, color: "#111827", fontFamily: FONT, mb: 2.5 }}>
          Delivery Executive
        </Typography>

        {/* ── TOOLBAR ── */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2.5 }}>
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
                height: 38, fontSize: 13, fontFamily: FONT,
                borderRadius: "8px", backgroundColor: "#fff",
                "& fieldset": { borderColor: "#D1D5DB" },
                "&:hover fieldset": { borderColor: "#9CA3AF" },
              },
            }}
          />

          <Box sx={{ display: "flex", gap: 1.2 }}>
            <Button
              variant="outlined"
              startIcon={<FileDownloadOutlinedIcon sx={{ fontSize: 16 }} />}
              onClick={handleExport}
              disabled={filtered.length === 0}
              sx={{
                textTransform: "none", fontSize: 13, fontWeight: 600, fontFamily: FONT,
                height: 38, px: 2, borderColor: "#D1D5DB", color: "#374151", borderRadius: "8px",
                "&:hover": { borderColor: "#a08c7c", backgroundColor: "#f0ebe4" },
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
                boxShadow: "0 2px 8px rgba(232,53,58,.35)",
                "&:hover": { background: "linear-gradient(135deg,#c62a2f,#a02020)" },
              }}
            >
              Add Executive
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
            gridTemplateColumns: "2fr 1.5fr 1.2fr 1.2fr 1fr",
            px: 2.5, py: 1.4,
            backgroundColor: "#F9FAFB",
            borderBottom: "1px solid #E5E7EB",
          }}>
            <Typography sx={COL_HEADER}>Member Name</Typography>
            <Typography sx={COL_HEADER}>Phone</Typography>
            <Typography sx={COL_HEADER}>Total Orders</Typography>
            <Typography sx={COL_HEADER}>Status</Typography>
            <Typography sx={{ ...COL_HEADER, textAlign: "right" }}>Action</Typography>
          </Box>

          {/* Loading */}
          {loading && (
            <Box sx={{ px: 2.5, py: 4, textAlign: "center" }}>
              <Typography sx={{ fontSize: 13, color: "#9CA3AF", fontFamily: FONT }}>
                Loading delivery executives…
              </Typography>
            </Box>
          )}

          {/* Empty */}
          {!loading && filtered.length === 0 && (
            <Box sx={{ px: 2.5, py: 6, display: "flex", flexDirection: "column", alignItems: "center", gap: 1.5 }}>
              <Box sx={{ width: 56, height: 56, borderRadius: "50%", backgroundColor: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <DeliveryDiningIcon sx={{ fontSize: 28, color: "#FF3D01" }} />
              </Box>
              <Typography sx={{ fontSize: 15, fontWeight: 600, color: "#374151", fontFamily: FONT }}>
                No delivery executives found
              </Typography>
              <Typography sx={{ fontSize: 13, color: "#9CA3AF", fontFamily: FONT }}>
                {search ? "Try a different search term" : "No executives have been added yet"}
              </Typography>
            </Box>
          )}

          {/* Rows */}
          {!loading && paginated.map((exec, idx) => {
            const status      = getStatusMeta(exec);
            const totalOrders = exec.total_orders ?? exec.order_count ?? 0;

            return (
              <Box
                key={exec.id}
                sx={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1.5fr 1.2fr 1.2fr 1fr",
                  px: 2.5, py: 1.3,
                  alignItems: "center",
                  backgroundColor: idx % 2 === 0 ? "#FFFFFF" : "#FAFAFA",
                  borderBottom: "1px solid #F3F4F6",
                  transition: "background .15s",
                  "&:hover": { backgroundColor: "#F0F9FF" },
                  "&:last-child": { borderBottom: "none" },
                }}
              >
                <Typography sx={{ ...CELL, fontWeight: 500 }}>{exec.name}</Typography>
                <Typography sx={{ ...CELL, color: "#374151" }}>{exec.phone ? String(exec.phone) : "—"}</Typography>

                <Box>
                  <Box sx={{
                    display: "inline-flex", alignItems: "center",
                    px: 1.2, py: 0.3,
                    border: "1px solid #D1D5DB", borderRadius: "6px",
                    backgroundColor: "#F9FAFB",
                  }}>
                    <Typography sx={{ fontSize: 11, fontWeight: 600, color: "#374151", fontFamily: FONT, letterSpacing: 0.3 }}>
                      {totalOrders} ORDERS
                    </Typography>
                  </Box>
                </Box>

                <Box>
                  <Box sx={{
                    display: "inline-flex", alignItems: "center",
                    px: 1.2, py: 0.3,
                    border: `1px solid ${status.bg}`, borderRadius: "6px",
                    backgroundColor: status.bg,
                  }}>
                    <Typography sx={{ fontSize: 11, fontWeight: 700, color: status.color, fontFamily: FONT, letterSpacing: 0.3 }}>
                      {status.label}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 0.5 }}>
                  <Button
                    size="small"
                    startIcon={<EditOutlinedIcon sx={{ fontSize: 14 }} />}
                    onClick={() => setEditExec(exec)}
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
                    onClick={() => setDeleteTarget(exec)}
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
        {filtered.length > 0 && (
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 2 }}>
            <Typography sx={{ fontSize: 13, color: "#6B7280", fontFamily: FONT }}>
              Showing {(page - 1) * PER_PAGE + 1} To {Math.min(page * PER_PAGE, filtered.length)} of {filtered.length} results
            </Typography>

            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <IconButton size="small" disabled={page === 1} onClick={() => setPage(p => p - 1)}
                sx={{ width: 32, height: 32, border: "1px solid #D1D5DB", borderRadius: "6px", color: page === 1 ? "#D1D5DB" : "#374151", "&:hover:not(:disabled)": { backgroundColor: "#F3F4F6" } }}>
                <ChevronLeftIcon sx={{ fontSize: 18 }} />
              </IconButton>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
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

      {/* ── Add Executive ── */}
      <AddStaffMemberDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onAdded={fetchDeliveryExecutives}
        roleKeyword="delivery"
        title="Add Delivery Executive"
      />

      {/* ── Edit Executive ── */}
      <EditDeliveryExecutiveModal
        open={editExec !== null}
        executive={editExec}
        onClose={() => setEditExec(null)}
        onSaved={() => setEditExec(null)}
      />

      {/* ── Delete Confirm ── */}
      <Dialog
        open={deleteTarget !== null}
        onClose={() => !deleting && setDeleteTarget(null)}
        PaperProps={{ sx: { borderRadius: "16px", width: 400 } }}
      >
        <DialogTitle sx={{ px: 3, pt: 3, pb: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box sx={{ width: 40, height: 40, borderRadius: "10px", backgroundColor: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <WarningAmberRoundedIcon sx={{ fontSize: 22, color: "#FF3D01" }} />
            </Box>
            <Typography sx={{ fontSize: 16, fontWeight: 700, color: "#111827", fontFamily: FONT }}>
              Remove Executive?
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ px: 3, pb: 1 }}>
          <Typography sx={{ fontSize: 13, color: "#6B7280", fontFamily: FONT, lineHeight: 1.6 }}>
            Are you sure you want to remove <strong style={{ color: "#111827" }}>{deleteTarget?.name}</strong>? This action cannot be undone.
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
            {deleting ? <CircularProgress size={16} sx={{ color: "#fff" }} /> : "Yes, Remove"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
