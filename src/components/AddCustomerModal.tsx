import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Typography,
  Modal,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  CircularProgress,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined";
import CloseIcon from "@mui/icons-material/Close";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { useCustomers } from "../context/CustomerContext";

const FONT = "Poppins, sans-serif";

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (customer: {
    id?: number;
    name: string;
    phone: string;
    email: string;
    address: string;
  }) => void;
};

const FieldRow = ({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) => (
  <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
    <Box sx={{ mt: 1.2, color: "#9CA3AF", flexShrink: 0 }}>{icon}</Box>
    <Box sx={{ flex: 1 }}>{children}</Box>
  </Box>
);

export default function AddCustomerModal({ open, onClose, onSave }: Props) {
  const { searchCustomers, saveCustomer, setSelectedCustomer } = useCustomers();

  const [name, setName]       = useState("");
  const [phone, setPhone]     = useState("");
  const [email, setEmail]     = useState("");
  const [address, setAddress] = useState("");
  const [search, setSearch]   = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!open) return;
    setName(""); setPhone(""); setEmail(""); setAddress(""); setSearch(""); setResults([]); setSaved(false);
  }, [open]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!search.trim()) { setResults([]); return; }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      const r = await searchCustomers(search);
      setResults(r || []);
      setSearching(false);
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [search, searchCustomers]);

  const handleSelectCustomer = (c: any) => {
    const normalized = {
      id: c.id,
      name: c.name ?? "",
      phone: String(c.phone ?? ""),
      email: c.email ?? "",
      address: c.delivery_address ?? "",
    };
    setSelectedCustomer(normalized);
    onSave(normalized);
    setSearch(""); setResults([]);
    onClose();
  };

  const handleSave = async () => {
    if (!name.trim() || !phone.trim()) return;
    setSaving(true);
    const savedCustomer = await saveCustomer({ name, phone, email, delivery_address: address });
    setSaving(false);
    if (!savedCustomer) return;
    const normalized = {
      id: savedCustomer.id,
      name: savedCustomer.name ?? "",
      phone: String(savedCustomer.phone ?? ""),
      email: savedCustomer.email ?? "",
      address: savedCustomer.delivery_address ?? "",
    };
    setSelectedCustomer(normalized);
    setSaved(true);
    setTimeout(() => { onSave(normalized); onClose(); }, 900);
  };

  const canSave = name.trim() && phone.trim() && !saving;

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{
        width: 500,
        backgroundColor: "#FFFFFF",
        borderRadius: "16px",
        boxShadow: "0 24px 80px rgba(0,0,0,0.22)",
        mx: "auto", mt: "7vh",
        overflow: "hidden",
        fontFamily: FONT,
        outline: "none",
      }}>
        {/* ── HEADER ── */}
        <Box sx={{
          background: "linear-gradient(135deg,#1F2937 0%,#374151 100%)",
          px: 3, py: 2.5,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box sx={{
              width: 40, height: 40, borderRadius: "10px",
              background: "rgba(232,53,58,.2)",
              border: "1px solid rgba(232,53,58,.35)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <PersonAddOutlinedIcon sx={{ fontSize: 20, color: "#FCA5A5" }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: 16, fontWeight: 700, color: "#FFFFFF", fontFamily: FONT }}>
                Add Customer
              </Typography>
              <Typography sx={{ fontSize: 12, color: "#9CA3AF", fontFamily: FONT }}>
                Search existing or create new
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose} size="small" sx={{ color: "#9CA3AF", "&:hover": { backgroundColor: "rgba(255,255,255,0.08)" } }}>
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>

        <Box sx={{ px: 3, pt: 2.5, pb: 3, display: "flex", flexDirection: "column", gap: 2.5 }}>

          {/* ── SEARCH ── */}
          <Box>
            <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#6B7280", fontFamily: FONT, mb: 0.8, textTransform: "uppercase", letterSpacing: 0.5 }}>
              Search Customer
            </Typography>
            <Box sx={{ position: "relative" }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search by name, phone or email…"
                value={search}
                onChange={e => setSearch(e.target.value)}
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
                  "& .MuiOutlinedInput-root": {
                    height: 40, fontSize: 13, fontFamily: FONT, borderRadius: "10px",
                    backgroundColor: "#F9FAFB",
                    "& fieldset": { borderColor: "#E5E7EB" },
                    "&:hover fieldset": { borderColor: "#9CA3AF" },
                    "&.Mui-focused fieldset": { borderColor: "#E8353A" },
                  },
                }}
              />

              {results.length > 0 && (
                <Box sx={{
                  position: "absolute", top: "100%", left: 0, right: 0, zIndex: 10,
                  backgroundColor: "#FFFFFF",
                  border: "1.5px solid #E5E7EB",
                  borderRadius: "10px",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                  mt: 0.5,
                  maxHeight: 200, overflowY: "auto",
                }}>
                  {results.map(c => (
                    <Box key={c.id} onClick={() => handleSelectCustomer(c)}
                      sx={{
                        px: 2, py: 1.2, cursor: "pointer",
                        borderBottom: "1px solid #F3F4F6",
                        "&:last-child": { borderBottom: "none" },
                        "&:hover": { backgroundColor: "#F9FAFB" },
                        transition: "background .12s",
                      }}>
                      <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#111827", fontFamily: FONT }}>{c.name}</Typography>
                      <Typography sx={{ fontSize: 11, color: "#9CA3AF", fontFamily: FONT, mt: 0.2 }}>
                        {c.phone}{c.email ? ` · ${c.email}` : ""}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          </Box>

          {/* ── DIVIDER ── */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box sx={{ flex: 1, height: 1, backgroundColor: "#F3F4F6" }} />
            <Typography sx={{ fontSize: 11, color: "#D1D5DB", fontFamily: FONT, letterSpacing: 0.5 }}>OR CREATE NEW</Typography>
            <Box sx={{ flex: 1, height: 1, backgroundColor: "#F3F4F6" }} />
          </Box>

          {/* ── FORM ── */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.8 }}>

            {saved ? (
              <Box sx={{ py: 2, display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                <Box sx={{ width: 48, height: 48, borderRadius: "50%", backgroundColor: "#DCFCE7", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <CheckCircleOutlineIcon sx={{ fontSize: 26, color: "#16A34A" }} />
                </Box>
                <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#111827", fontFamily: FONT }}>Customer saved!</Typography>
              </Box>
            ) : (<>
              <FieldRow icon={<PersonOutlineIcon sx={{ fontSize: 18 }} />}>
                <TextField
                  fullWidth size="small" label="Customer Name *" value={name}
                  onChange={e => setName(e.target.value)}
                  sx={{
                    "& .MuiOutlinedInput-root": { borderRadius: "10px", fontSize: 13, fontFamily: FONT, backgroundColor: "#F9FAFB" },
                    "& label": { fontFamily: FONT, fontSize: 13 },
                  }}
                />
              </FieldRow>

              <FieldRow icon={<PhoneOutlinedIcon sx={{ fontSize: 18 }} />}>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <TextField
                    size="small" value="+91" disabled
                    sx={{ width: 72, "& .MuiOutlinedInput-root": { borderRadius: "10px", fontSize: 13, fontFamily: FONT, backgroundColor: "#F9FAFB" } }}
                  />
                  <TextField
                    fullWidth size="small" label="Phone Number *" value={phone}
                    onChange={e => setPhone(e.target.value)}
                    sx={{
                      "& .MuiOutlinedInput-root": { borderRadius: "10px", fontSize: 13, fontFamily: FONT, backgroundColor: "#F9FAFB" },
                      "& label": { fontFamily: FONT, fontSize: 13 },
                    }}
                  />
                </Box>
              </FieldRow>

              <FieldRow icon={<EmailOutlinedIcon sx={{ fontSize: 18 }} />}>
                <TextField
                  fullWidth size="small" label="Email" value={email}
                  onChange={e => setEmail(e.target.value)}
                  sx={{
                    "& .MuiOutlinedInput-root": { borderRadius: "10px", fontSize: 13, fontFamily: FONT, backgroundColor: "#F9FAFB" },
                    "& label": { fontFamily: FONT, fontSize: 13 },
                  }}
                />
              </FieldRow>

              <FieldRow icon={<LocationOnOutlinedIcon sx={{ fontSize: 18 }} />}>
                <TextField
                  fullWidth size="small" label="Delivery Address" value={address}
                  onChange={e => setAddress(e.target.value)}
                  multiline rows={2}
                  sx={{
                    "& .MuiOutlinedInput-root": { borderRadius: "10px", fontSize: 13, fontFamily: FONT, backgroundColor: "#F9FAFB" },
                    "& label": { fontFamily: FONT, fontSize: 13 },
                  }}
                />
              </FieldRow>
            </>)}
          </Box>

          {/* ── FOOTER BUTTONS ── */}
          {!saved && (
            <Box sx={{ display: "flex", gap: 1.5, pt: 0.5, borderTop: "1px solid #F3F4F6" }}>
              <Button
                fullWidth variant="outlined"
                onClick={onClose}
                sx={{
                  textTransform: "none", fontSize: 13, fontWeight: 600, fontFamily: FONT,
                  height: 42, borderRadius: "10px",
                  borderColor: "#D1D5DB", color: "#374151",
                  "&:hover": { borderColor: "#9CA3AF", backgroundColor: "#F9FAFB" },
                }}
              >
                Cancel
              </Button>
              <Button
                fullWidth variant="contained"
                onClick={handleSave}
                disabled={!canSave}
                sx={{
                  textTransform: "none", fontSize: 13, fontWeight: 700, fontFamily: FONT,
                  height: 42, borderRadius: "10px",
                  background: canSave ? "linear-gradient(135deg,#E8353A,#c62a2f)" : "#F3F4F6",
                  color: canSave ? "#FFF" : "#D1D5DB",
                  boxShadow: canSave ? "0 4px 12px rgba(232,53,58,.3)" : "none",
                  "&:hover": { background: canSave ? "linear-gradient(135deg,#c62a2f,#a02020)" : "#F3F4F6" },
                  "&.Mui-disabled": { background: "#F3F4F6", color: "#D1D5DB" },
                }}
              >
                {saving ? <CircularProgress size={16} sx={{ color: "#fff" }} /> : "✓ Save Customer"}
              </Button>
            </Box>
          )}
        </Box>
      </Box>
    </Modal>
  );
}
