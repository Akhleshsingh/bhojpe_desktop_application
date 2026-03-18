import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Modal,
  Button,
  TextField,
  IconButton,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import type { Customer } from "../types/customer";
import { useCustomers } from "../context/CustomerContext";

const FONT = "'Montserrat', sans-serif";

const FieldRow = ({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) => (
  <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
    <Box sx={{ mt: 1.2, color: "#9CA3AF", flexShrink: 0 }}>{icon}</Box>
    <Box sx={{ flex: 1 }}>{children}</Box>
  </Box>
);

type Props = {
  open: boolean;
  customer: Customer | null;
  onClose: () => void;
  onSaved: () => void;
};

export default function EditCustomerModal({ open, customer, onClose, onSaved }: Props) {
  const { updateCustomer } = useCustomers();

  const [name, setName]       = useState("");
  const [phone, setPhone]     = useState("");
  const [email, setEmail]     = useState("");
  const [address, setAddress] = useState("");
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);
  const [error, setError]     = useState("");

  useEffect(() => {
    if (!open || !customer) return;
    setName(customer.name ?? "");
    setPhone(customer.phone != null ? String(customer.phone) : "");
    setEmail(customer.email ?? "");
    setAddress(customer.delivery_address ?? "");
    setSaved(false);
    setError("");
  }, [open, customer]);

  const canSave = name.trim() && phone.trim() && !saving;

  const handleSave = async () => {
    if (!customer || !canSave) return;
    setSaving(true);
    setError("");
    const ok = await updateCustomer(customer.id, {
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      delivery_address: address.trim() || undefined,
    });
    setSaving(false);
    if (!ok) { setError("Failed to update customer. Please try again."); return; }
    setSaved(true);
    setTimeout(() => { onSaved(); onClose(); }, 900);
  };

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
        {/* Header */}
        <Box sx={{
          background: "linear-gradient(135deg,#1F2937 0%,#374151 100%)",
          px: 3, py: 2.5,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box sx={{
              width: 40, height: 40, borderRadius: "10px",
              background: "rgba(14,165,233,.2)",
              border: "1px solid rgba(14,165,233,.35)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <EditOutlinedIcon sx={{ fontSize: 20, color: "#7DD3FC" }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: 16, fontWeight: 700, color: "#FFFFFF", fontFamily: FONT }}>
                Edit Customer
              </Typography>
              <Typography sx={{ fontSize: 12, color: "#9CA3AF", fontFamily: FONT }}>
                {customer?.name ?? ""}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose} size="small" sx={{ color: "#9CA3AF", "&:hover": { backgroundColor: "rgba(255,255,255,0.08)" } }}>
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>

        <Box sx={{ px: 3, pt: 2.5, pb: 3, display: "flex", flexDirection: "column", gap: 2 }}>
          {saved ? (
            <Box sx={{ py: 3, display: "flex", flexDirection: "column", alignItems: "center", gap: 1.2 }}>
              <Box sx={{ width: 48, height: 48, borderRadius: "50%", backgroundColor: "#DCFCE7", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <CheckCircleOutlineIcon sx={{ fontSize: 26, color: "#16A34A" }} />
              </Box>
              <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#111827", fontFamily: FONT }}>Customer updated!</Typography>
            </Box>
          ) : (
            <>
              {error && (
                <Box sx={{ px: 2, py: 1.2, borderRadius: "8px", backgroundColor: "#FEF2F2", border: "1px solid #FECACA" }}>
                  <Typography sx={{ fontSize: 12, color: "#DC2626", fontFamily: FONT }}>{error}</Typography>
                </Box>
              )}

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
                    background: canSave ? "linear-gradient(135deg,#0891B2,#0E7490)" : "#F3F4F6",
                    color: canSave ? "#FFF" : "#D1D5DB",
                    boxShadow: canSave ? "0 4px 12px rgba(14,165,233,.3)" : "none",
                    "&:hover": { background: canSave ? "linear-gradient(135deg,#0E7490,#155E75)" : "#F3F4F6" },
                    "&.Mui-disabled": { background: "#F3F4F6", color: "#D1D5DB" },
                  }}
                >
                  {saving ? <CircularProgress size={16} sx={{ color: "#fff" }} /> : "✓ Save Changes"}
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Box>
    </Modal>
  );
}
