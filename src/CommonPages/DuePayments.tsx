import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Button,
  IconButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import CheckoutModal from "../components/CheckoutModal";

const PER_PAGE = 10;

const ROWS = [
  { id: 1, amount: 112.85, method: "Due", order: "Order #69", datetime: "03/02/2026 12:50 PM" },
  { id: 2, amount: 250.00, method: "Due", order: "Order #73", datetime: "04/02/2026 01:30 PM" },
  { id: 3, amount: 88.50, method: "Due", order: "Order #81", datetime: "05/02/2026 08:45 AM" },
];

const COL_HEADER = {
  fontSize: 11, fontWeight: 700, color: "#6B7280",
  fontFamily: "Poppins, sans-serif", letterSpacing: 0.6,
  textTransform: "uppercase" as const,
};
const CELL = { fontSize: 13, color: "#111827", fontFamily: "Poppins, sans-serif" };

function StatCard({ label, value, sub, color, icon }: any) {
  return (
    <Box sx={{
      flex: 1, backgroundColor: "#FFFFFF", borderRadius: "12px",
      border: "1px solid #E5E7EB", p: 2.5,
      boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
      display: "flex", alignItems: "center", gap: 2,
    }}>
      <Box sx={{
        width: 44, height: 44, borderRadius: "10px",
        backgroundColor: color + "20",
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        {React.cloneElement(icon, { sx: { fontSize: 22, color } })}
      </Box>
      <Box>
        <Typography sx={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", fontFamily: "Poppins, sans-serif", letterSpacing: 0.5, textTransform: "uppercase" }}>
          {label}
        </Typography>
        <Typography sx={{ fontSize: 20, fontWeight: 700, color: "#111827", fontFamily: "Poppins, sans-serif", lineHeight: 1.3 }}>
          {value}
        </Typography>
        {sub && <Typography sx={{ fontSize: 11, color: "#9CA3AF", fontFamily: "Poppins, sans-serif" }}>{sub}</Typography>}
      </Box>
    </Box>
  );
}

export default function DuePayments() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [paymentRow, setPaymentRow] = useState<typeof ROWS[0] | null>(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return ROWS;
    const q = search.toLowerCase();
    return ROWS.filter(r =>
      r.order.toLowerCase().includes(q) ||
      r.method.toLowerCase().includes(q) ||
      String(r.amount).includes(q)
    );
  }, [search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalDue = ROWS.reduce((s, r) => s + r.amount, 0);

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#F8FAFC", fontFamily: "Poppins, sans-serif" }}>
      <Box sx={{ p: 3 }}>

        {/* ── TITLE ── */}
        <Typography sx={{ fontSize: 22, fontWeight: 700, color: "#111827", fontFamily: "Poppins, sans-serif", mb: 2.5 }}>
          Due Payments
        </Typography>

        {/* ── STAT CARDS ── */}
        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
          <StatCard label="Total Due" value={`₹${totalDue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`} sub="Pending collection" color="#DC2626" icon={<CurrencyRupeeIcon />} />
          <StatCard label="Due Orders" value={ROWS.length} sub={`${ROWS.length} pending`} color="#D97706" icon={<ReceiptLongOutlinedIcon />} />
          <StatCard label="Oldest Due" value="03/02/2026" sub="Order #69" color="#7C3AED" icon={<AccessTimeOutlinedIcon />} />
        </Box>

        {/* ── TOOLBAR ── */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2.5 }}>
          <TextField
            size="small"
            placeholder="Search by amount or order #…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 16, color: "#9CA3AF" }} /></InputAdornment>,
            }}
            sx={{
              width: 300,
              "& .MuiOutlinedInput-root": {
                height: 38, fontSize: 13, fontFamily: "Poppins, sans-serif",
                borderRadius: "8px", backgroundColor: "#fff",
                "& fieldset": { borderColor: "#D1D5DB" },
                "&:hover fieldset": { borderColor: "#9CA3AF" },
              },
            }}
          />

          {/* Due alert pill */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, px: 1.5, py: 0.6, borderRadius: "20px", backgroundColor: "#FEF2F2", border: "1px solid #FECACA" }}>
            <WarningAmberOutlinedIcon sx={{ fontSize: 15, color: "#DC2626" }} />
            <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#DC2626", fontFamily: "Poppins, sans-serif" }}>
              ₹{totalDue.toFixed(2)} outstanding
            </Typography>
          </Box>
        </Box>

        {/* ── TABLE ── */}
        <Box sx={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid #E5E7EB", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", overflow: "hidden" }}>

          {/* Header */}
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1.2fr 1.5fr 1.8fr 1fr", px: 2.5, py: 1.4, backgroundColor: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
            <Typography sx={COL_HEADER}>Amount</Typography>
            <Typography sx={COL_HEADER}>Method</Typography>
            <Typography sx={COL_HEADER}>Order</Typography>
            <Typography sx={COL_HEADER}>Date & Time</Typography>
            <Typography sx={{ ...COL_HEADER, textAlign: "right" }}>Action</Typography>
          </Box>

          {paginated.length === 0 && (
            <Box sx={{ py: 6, display: "flex", flexDirection: "column", alignItems: "center", gap: 1.5 }}>
              <Box sx={{ width: 52, height: 52, borderRadius: "50%", backgroundColor: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ReceiptLongOutlinedIcon sx={{ fontSize: 26, color: "#FF3D01" }} />
              </Box>
              <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#374151", fontFamily: "Poppins, sans-serif" }}>No due payments found</Typography>
              <Typography sx={{ fontSize: 13, color: "#9CA3AF", fontFamily: "Poppins, sans-serif" }}>
                {search ? "Try a different search term" : "All payments are cleared!"}
              </Typography>
            </Box>
          )}

          {paginated.map((row, idx) => (
            <Box key={row.id} sx={{
              display: "grid", gridTemplateColumns: "1fr 1.2fr 1.5fr 1.8fr 1fr",
              px: 2.5, py: 1.4, alignItems: "center",
              backgroundColor: idx % 2 === 0 ? "#FFFFFF" : "#FAFAFA",
              borderBottom: "1px solid #F3F4F6",
              transition: "background .15s",
              "&:hover": { backgroundColor: "#FFF7F7" },
              "&:last-child": { borderBottom: "none" },
            }}>

              {/* Amount chip */}
              <Box sx={{ display: "inline-flex" }}>
                <Box sx={{ px: 1.2, py: 0.3, borderRadius: "6px", backgroundColor: "#FEF2F2", border: "1px solid #FECACA" }}>
                  <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#DC2626", fontFamily: "Poppins, sans-serif" }}>
                    ₹{row.amount.toFixed(2)}
                  </Typography>
                </Box>
              </Box>

              {/* Method badge */}
              <Box>
                <Box sx={{ display: "inline-flex", alignItems: "center", px: 1, py: 0.3, borderRadius: "6px", backgroundColor: "#FFF7ED", border: "1px solid #FED7AA" }}>
                  <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#C2410C", fontFamily: "Poppins, sans-serif", letterSpacing: 0.3 }}>
                    {row.method.toUpperCase()}
                  </Typography>
                </Box>
              </Box>

              {/* Order — clickable */}
              <Typography sx={{ ...CELL, fontWeight: 600, color: "#2563EB", cursor: "pointer", textDecoration: "underline", textDecorationColor: "#BFDBFE" }}>
                {row.order}
              </Typography>

              <Typography sx={{ ...CELL, color: "#6B7280" }}>{row.datetime}</Typography>

              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Button size="small" variant="contained" startIcon={<AddCircleOutlineIcon sx={{ fontSize: 14 }} />}
                  onClick={() => setPaymentRow(row)}
                  sx={{
                    textTransform: "none", fontSize: 12, fontWeight: 600, fontFamily: "Poppins, sans-serif",
                    borderRadius: "7px", py: 0.5, px: 1.4,
                    background: "linear-gradient(135deg,#16A34A,#15803D)",
                    boxShadow: "0 2px 6px rgba(22,163,74,.3)",
                    "&:hover": { background: "linear-gradient(135deg,#15803D,#166534)" },
                  }}>
                  Add Payment
                </Button>
              </Box>
            </Box>
          ))}
        </Box>

        {/* ── PAGINATION ── */}
        {filtered.length > 0 && (
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 2 }}>
            <Typography sx={{ fontSize: 13, color: "#6B7280", fontFamily: "Poppins, sans-serif" }}>
              Showing {(page - 1) * PER_PAGE + 1} To {Math.min(page * PER_PAGE, filtered.length)} of {filtered.length} results
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <IconButton size="small" disabled={page === 1} onClick={() => setPage(p => p - 1)}
                sx={{ width: 32, height: 32, border: "1px solid #D1D5DB", borderRadius: "6px", color: page === 1 ? "#D1D5DB" : "#374151" }}>
                <ChevronLeftIcon sx={{ fontSize: 18 }} />
              </IconButton>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <Box key={p} onClick={() => setPage(p)}
                  sx={{
                    width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center",
                    borderRadius: "6px", cursor: "pointer",
                    border: `1px solid ${p === page ? "#FF3D01" : "#D1D5DB"}`,
                    backgroundColor: p === page ? "#FF3D01" : "#FFFFFF",
                    "&:hover": { backgroundColor: p === page ? "#c62a2f" : "#F3F4F6" },
                  }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 600, color: p === page ? "#FFF" : "#374151", fontFamily: "Poppins, sans-serif" }}>{p}</Typography>
                </Box>
              ))}
              <IconButton size="small" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
                sx={{ width: 32, height: 32, border: "1px solid #D1D5DB", borderRadius: "6px", color: page === totalPages ? "#D1D5DB" : "#374151" }}>
                <ChevronRightIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Box>
          </Box>
        )}
      </Box>

      {/* ── PAYMENT MODAL ── */}
      {paymentRow && (
        <CheckoutModal
          open={!!paymentRow}
          onClose={() => setPaymentRow(null)}
          orderNumber={parseInt(paymentRow.order.replace(/\D/g, ""), 10) || 0}
          totalAmount={paymentRow.amount}
          cart={[]}
          orderId={paymentRow.id}
          onPaymentSuccess={() => setPaymentRow(null)}
        />
      )}
    </Box>
  );
}
