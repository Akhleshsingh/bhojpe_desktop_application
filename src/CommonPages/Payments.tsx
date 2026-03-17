import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Button,
  IconButton,
  Drawer,
  MenuItem,
  Select,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import QrCodeIcon from "@mui/icons-material/QrCode";
import PaymentsIcon from "@mui/icons-material/Payments";
import ReplayOutlinedIcon from "@mui/icons-material/ReplayOutlined";
import CloseIcon from "@mui/icons-material/Close";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";

const PER_PAGE = 10;

const ROWS = [
  { id: 10, amount: 168, method: "Cash", order: "Order #118", time: "01:24 PM", date: "13/03/2026", ago: "7h ago" },
  { id: 9, amount: 199, method: "Cash", order: "Order #117", time: "01:21 PM", date: "13/03/2026", ago: "7h ago" },
  { id: 8, amount: 450, method: "UPI", order: "Order #116", time: "12:10 PM", date: "13/03/2026", ago: "8h ago" },
  { id: 7, amount: 320, method: "Card", order: "Order #115", time: "11:55 AM", date: "13/03/2026", ago: "9h ago" },
  { id: 6, amount: 210, method: "UPI", order: "Order #114", time: "11:30 AM", date: "13/03/2026", ago: "10h ago" },
];

const COL_HEADER = {
  fontSize: 11, fontWeight: 700, color: "#6B7280",
  fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: 0.6,
  textTransform: "uppercase" as const,
};
const CELL = { fontSize: 13, color: "#111827", fontFamily: "'Plus Jakarta Sans', sans-serif" };

function MethodBadge({ method }: { method: string }) {
  const isUPI = method === "UPI";
  const isCard = method === "Card";
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
      <Box sx={{
        width: 26, height: 26, borderRadius: "6px",
        backgroundColor: isUPI ? "#EDE9FE" : isCard ? "#DBEAFE" : "#DCFCE7",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {isUPI
          ? <QrCodeIcon sx={{ fontSize: 15, color: "#7C3AED" }} />
          : isCard
          ? <AccountBalanceWalletOutlinedIcon sx={{ fontSize: 15, color: "#2563EB" }} />
          : <PaymentsIcon sx={{ fontSize: 15, color: "#16A34A" }} />}
      </Box>
      <Typography sx={{ ...CELL, fontWeight: 500 }}>{method}</Typography>
    </Box>
  );
}

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
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        {React.cloneElement(icon, { sx: { fontSize: 22, color } })}
      </Box>
      <Box>
        <Typography sx={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: 0.5, textTransform: "uppercase" }}>
          {label}
        </Typography>
        <Typography sx={{ fontSize: 20, fontWeight: 700, color: "#111827", fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1.3 }}>
          {value}
        </Typography>
        {sub && <Typography sx={{ fontSize: 11, color: "#9CA3AF", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{sub}</Typography>}
      </Box>
    </Box>
  );
}

export default function Payments() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [refundOpen, setRefundOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [refundType, setRefundType] = useState("full");
  const [refundReason, setRefundReason] = useState("");
  const [refundNote, setRefundNote] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return ROWS;
    const q = search.toLowerCase();
    return ROWS.filter(r =>
      r.order.toLowerCase().includes(q) ||
      r.method.toLowerCase().includes(q) ||
      String(r.amount).includes(q) ||
      String(r.id).includes(q)
    );
  }, [search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const totalRevenue = ROWS.reduce((s, r) => s + r.amount, 0);
  const cashCount = ROWS.filter(r => r.method === "Cash").length;
  const upiCount = ROWS.filter(r => r.method === "UPI").length;

  const openRefund = (row: any) => { setSelectedPayment(row); setRefundOpen(true); };

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f5f0ea", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <Box sx={{ p: 3 }}>

        {/* ── TITLE ── */}
        <Typography sx={{ fontSize: 22, fontWeight: 700, color: "#111827", fontFamily: "'Plus Jakarta Sans', sans-serif", mb: 2.5 }}>
          Payments
        </Typography>

        {/* ── STAT CARDS ── */}
        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
          <StatCard label="Total Revenue" value={`₹${totalRevenue.toLocaleString()}`} sub="All transactions" color="#16A34A" icon={<CurrencyRupeeIcon />} />
          <StatCard label="Cash Payments" value={cashCount} sub={`${cashCount} transactions`} color="#2563EB" icon={<PaymentsIcon />} />
          <StatCard label="UPI Payments" value={upiCount} sub={`${upiCount} transactions`} color="#7C3AED" icon={<QrCodeIcon />} />
          <StatCard label="Total Transactions" value={ROWS.length} sub="Today" color="#FF3D01" icon={<ReceiptLongOutlinedIcon />} />
        </Box>

        {/* ── TOOLBAR ── */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2.5 }}>
          <TextField
            size="small"
            placeholder="Search by amount, method, order…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 16, color: "#9CA3AF" }} /></InputAdornment>,
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
          <Button variant="outlined" startIcon={<FileDownloadOutlinedIcon sx={{ fontSize: 16 }} />}
            sx={{
              textTransform: "none", fontSize: 13, fontWeight: 600, fontFamily: "'Plus Jakarta Sans', sans-serif",
              height: 38, px: 2, borderColor: "#D1D5DB", color: "#374151", borderRadius: "8px",
              "&:hover": { borderColor: "#a08c7c", backgroundColor: "#f0ebe4" },
            }}>
            Export
          </Button>
        </Box>

        {/* ── TABLE ── */}
        <Box sx={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid #E5E7EB", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", overflow: "hidden" }}>

          {/* Header */}
          <Box sx={{ display: "grid", gridTemplateColumns: "0.5fr 1fr 1.2fr 1.2fr 1.3fr 1fr", px: 2.5, py: 1.4, backgroundColor: "#f0ebe4", borderBottom: "1px solid #e2d9d0" }}>
            <Typography sx={COL_HEADER}>ID</Typography>
            <Typography sx={COL_HEADER}>Amount</Typography>
            <Typography sx={COL_HEADER}>Payment Method</Typography>
            <Typography sx={COL_HEADER}>Order</Typography>
            <Typography sx={COL_HEADER}>Date & Time</Typography>
            <Typography sx={{ ...COL_HEADER, textAlign: "right" }}>Action</Typography>
          </Box>

          {paginated.length === 0 && (
            <Box sx={{ py: 6, textAlign: "center" }}>
              <Typography sx={{ fontSize: 13, color: "#9CA3AF", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>No payments found</Typography>
            </Box>
          )}

          {paginated.map((row, idx) => (
            <Box key={row.id} sx={{
              display: "grid", gridTemplateColumns: "0.5fr 1fr 1.2fr 1.2fr 1.3fr 1fr",
              px: 2.5, py: 1.3, alignItems: "center",
              backgroundColor: idx % 2 === 0 ? "#FFFFFF" : "#FAFAFA",
              borderBottom: "1px solid #F3F4F6",
              transition: "background .15s",
              "&:hover": { backgroundColor: "#F0FDF4" },
              "&:last-child": { borderBottom: "none" },
            }}>
              <Typography sx={{ ...CELL, color: "#9CA3AF", fontWeight: 500 }}>#{row.id}</Typography>

              {/* Amount chip */}
              <Box sx={{ display: "inline-flex" }}>
                <Box sx={{ px: 1.2, py: 0.3, borderRadius: "6px", backgroundColor: "#DCFCE7", border: "1px solid #BBF7D0" }}>
                  <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#15803D", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    ₹{row.amount.toFixed(2)}
                  </Typography>
                </Box>
              </Box>

              <MethodBadge method={row.method} />

              <Typography sx={{ ...CELL, fontWeight: 500 }}>{row.order}</Typography>

              <Box>
                <Typography sx={{ ...CELL, fontWeight: 600 }}>{row.time}</Typography>
                <Typography sx={{ fontSize: 11, color: "#9CA3AF", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{row.date} · {row.ago}</Typography>
              </Box>

              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Button size="small" variant="outlined" startIcon={<ReplayOutlinedIcon sx={{ fontSize: 14 }} />}
                  onClick={() => openRefund(row)}
                  sx={{
                    textTransform: "none", fontSize: 12, fontWeight: 600, fontFamily: "'Plus Jakarta Sans', sans-serif",
                    borderColor: "#FECACA", color: "#DC2626", borderRadius: "7px", py: 0.4, px: 1.2,
                    "&:hover": { backgroundColor: "#FEF2F2", borderColor: "#DC2626" },
                  }}>
                  Refund
                </Button>
              </Box>
            </Box>
          ))}
        </Box>

        {/* ── PAGINATION ── */}
        {filtered.length > 0 && (
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 2 }}>
            <Typography sx={{ fontSize: 13, color: "#6B7280", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
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
                  <Typography sx={{ fontSize: 13, fontWeight: 600, color: p === page ? "#FFF" : "#374151", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{p}</Typography>
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

      {/* ── REFUND DRAWER ── */}
      <Drawer anchor="right" open={refundOpen} onClose={() => setRefundOpen(false)}
        PaperProps={{ sx: { width: 480, p: 0, fontFamily: "'Plus Jakarta Sans', sans-serif" } }}>

        {/* Drawer header */}
        <Box sx={{ px: 3, py: 2.5, borderBottom: "1px solid #E5E7EB", display: "flex", alignItems: "center", justifyContent: "space-between", background: "linear-gradient(135deg,#1F2937,#374151)" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box sx={{ width: 36, height: 36, borderRadius: "8px", backgroundColor: "rgba(220,38,38,.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ReplayOutlinedIcon sx={{ fontSize: 18, color: "#FCA5A5" }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: 16, fontWeight: 700, color: "#FFFFFF", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Process Refund</Typography>
              <Typography sx={{ fontSize: 12, color: "#9CA3AF", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Review and submit refund request</Typography>
            </Box>
          </Box>
          <IconButton onClick={() => setRefundOpen(false)} sx={{ color: "#9CA3AF", "&:hover": { backgroundColor: "rgba(255,255,255,0.08)" } }}>
            <CloseIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>

        <Box sx={{ p: 3, overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: 2.5 }}>
          {/* Payment info */}
          <Box sx={{ backgroundColor: "#F9FAFB", borderRadius: "10px", border: "1px solid #E5E7EB", p: 2 }}>
            <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#9CA3AF", fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: 0.5, mb: 1.5, textTransform: "uppercase" }}>Payment Summary</Typography>
            {[
              { label: "Order", value: selectedPayment?.order },
              { label: "Amount", value: `₹${selectedPayment?.amount?.toFixed(2)}` },
              { label: "Method", value: selectedPayment?.method },
            ].map(({ label, value }) => (
              <Box key={label} sx={{ display: "flex", justifyContent: "space-between", py: 0.6 }}>
                <Typography sx={{ fontSize: 13, color: "#6B7280", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{label}</Typography>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#111827", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{value}</Typography>
              </Box>
            ))}
          </Box>

          {/* Reason */}
          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#374151", fontFamily: "'Plus Jakarta Sans', sans-serif", mb: 0.8 }}>Refund Reason</Typography>
            <Select fullWidth size="small" value={refundReason} onChange={(e) => setRefundReason(e.target.value as string)} displayEmpty
              sx={{ fontSize: 13, fontFamily: "'Plus Jakarta Sans', sans-serif", borderRadius: "8px", "& .MuiOutlinedInput-notchedOutline": { borderColor: "#D1D5DB" } }}>
              <MenuItem value="" disabled><em style={{ color: "#9CA3AF", fontStyle: "normal" }}>Select a reason</em></MenuItem>
              <MenuItem value="cancelled">Order Cancelled</MenuItem>
              <MenuItem value="mistake">Payment Mistake</MenuItem>
              <MenuItem value="quality">Quality Issue</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </Box>

          {/* Refund type */}
          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#374151", fontFamily: "'Plus Jakarta Sans', sans-serif", mb: 0.8 }}>Refund Type</Typography>
            <RadioGroup value={refundType} onChange={(e) => setRefundType(e.target.value)}>
              {[["full", "Full Refund"], ["partial", "Partial Refund"], ["waste", "Waste / Write-Off Refund"]].map(([v, l]) => (
                <FormControlLabel key={v} value={v} control={<Radio size="small" sx={{ color: "#FF3D01", "&.Mui-checked": { color: "#FF3D01" } }} />}
                  label={<Typography sx={{ fontSize: 13, fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#374151" }}>{l}</Typography>} />
              ))}
            </RadioGroup>
          </Box>

          {/* Amount */}
          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#374151", fontFamily: "'Plus Jakarta Sans', sans-serif", mb: 0.8 }}>Refund Amount</Typography>
            <TextField fullWidth size="small" value={`₹${selectedPayment?.amount?.toFixed(2) ?? ""}`} disabled
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px", fontSize: 13, fontFamily: "'Plus Jakarta Sans', sans-serif", backgroundColor: "#F9FAFB" } }} />
          </Box>

          {/* Notes */}
          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#374151", fontFamily: "'Plus Jakarta Sans', sans-serif", mb: 0.8 }}>Notes</Typography>
            <TextField fullWidth multiline rows={3} placeholder="Add any notes about this refund…" value={refundNote} onChange={(e) => setRefundNote(e.target.value)}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px", fontSize: 13, fontFamily: "'Plus Jakarta Sans', sans-serif" } }} />
          </Box>

          {/* Actions */}
          <Box sx={{ display: "flex", gap: 1.5, mt: 1 }}>
            <Button fullWidth variant="contained"
              sx={{
                textTransform: "none", fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif", height: 42, borderRadius: "8px",
                background: "linear-gradient(135deg,#FF3D01,#c62a2f)",
                boxShadow: "0 2px 8px rgba(232,53,58,.35)",
                "&:hover": { background: "linear-gradient(135deg,#c62a2f,#a02020)" },
              }}>
              Process Refund
            </Button>
            <Button fullWidth variant="outlined" onClick={() => setRefundOpen(false)}
              sx={{
                textTransform: "none", fontWeight: 600, fontFamily: "'Plus Jakarta Sans', sans-serif", height: 42, borderRadius: "8px",
                borderColor: "#D1D5DB", color: "#374151",
                "&:hover": { borderColor: "#a08c7c", backgroundColor: "#f0ebe4" },
              }}>
              Cancel
            </Button>
          </Box>
        </Box>
      </Drawer>
    </Box>
  );
}
