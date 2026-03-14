import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog, DialogContent, Box, Typography, TextField,
  Button, IconButton, CircularProgress, Select, MenuItem, FormControl,
  InputAdornment,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { BASE_URL } from "../utils/api";

const FONT = "Poppins, sans-serif";
const RED  = "#E8353A";

const COUNTRY_CODES = ["+91", "+1", "+44", "+61", "+971", "+65", "+81", "+86"];

interface Role { id: number; display_name: string; name?: string; }

export interface AddStaffMemberDialogProps {
  open: boolean;
  onClose: () => void;
  onAdded?: () => void;
  /** Pre-filter: only show roles whose display_name/name matches this keyword (case-insensitive). */
  roleKeyword?: string;
  /** Title shown in the dialog header. Defaults to "Add New Member". */
  title?: string;
  /** Icon colour accent. Defaults to "#E8353A". */
  accentColor?: string;
}

export default function AddStaffMemberDialog({
  open,
  onClose,
  onAdded,
  roleKeyword,
  title = "Add New Member",
  accentColor = RED,
}: AddStaffMemberDialogProps) {
  const { branchData } = useAuth();
  const branch_id     = branchData?.data?.id;
  const restaurant_id = branchData?.data?.restaurant_id;
  const phone_code    = String(branchData?.data?.restaurant?.phone_code ?? "91");

  /* ── State ── */
  const [roles, setRoles]           = useState<Role[]>([]);
  const [roleId, setRoleId]         = useState<number | "">("");
  const [name, setName]             = useState("");
  const [email, setEmail]           = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [phone, setPhone]           = useState("");
  const [password, setPassword]     = useState("");
  const [showPass, setShowPass]     = useState(false);
  const [errors, setErrors]         = useState<Record<string, string>>({});
  const [saving, setSaving]         = useState(false);
  const [success, setSuccess]       = useState(false);

  /* ── Load roles ── */
  const loadRoles = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(`${BASE_URL}/restaurant-roles`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.status && Array.isArray(data.roles)) {
        let list: Role[] = data.roles;
        if (roleKeyword) {
          const kw = roleKeyword.toLowerCase();
          const matched = list.filter(
            (r) =>
              (r.display_name ?? "").toLowerCase().includes(kw) ||
              (r.name ?? "").toLowerCase().includes(kw)
          );
          if (matched.length > 0) list = matched;
        }
        setRoles(list);
        setRoleId(list[0]?.id ?? "");
      }
    } catch { /* silent */ }
  }, [roleKeyword]);

  useEffect(() => {
    if (open) loadRoles();
  }, [open, loadRoles]);

  /* ── Reset on close ── */
  const reset = () => {
    setName(""); setEmail(""); setPhone(""); setPassword("");
    setCountryCode("+91"); setErrors({}); setSuccess(false); setSaving(false);
  };
  const handleClose = () => { reset(); onClose(); };

  /* ── Validate ── */
  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim())     e.name     = "Full name is required";
    if (!phone.trim())    e.phone    = "Phone number is required";
    else if (!/^\d{7,15}$/.test(phone.replace(/\s/g, "")))
                          e.phone    = "Enter 7–15 digits";
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
                          e.email    = "Enter a valid email";
    if (!password.trim()) e.password = "Password is required";
    else if (password.length < 6) e.password = "Minimum 6 characters";
    if (roleId === "")    e.role     = "Please select a role";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* ── Submit ── */
  const handleSubmit = async () => {
    if (!validate()) return;
    if (!branch_id || !restaurant_id) {
      toast.error("Branch information missing — please log in again");
      return;
    }
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const cleanPhone = phone.replace(/\D/g, "");
      const res = await fetch(`${BASE_URL}/add-staff`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone_number: cleanPhone,
          phone_code,
          branch_id,
          restaurant_id,
          role_id: roleId,
          password,
        }),
      });
      const data = await res.json();
      if (!data.status) {
        if (data.errors) {
          Object.values(data.errors).flat().forEach((m: any) => toast.error(m));
        } else {
          toast.error(data.message ?? "Something went wrong");
        }
        return;
      }
      setSuccess(true);
      toast.success(`${name.trim()} added successfully!`);
      onAdded?.();
      setTimeout(handleClose, 1200);
    } catch {
      toast.error("Server error — please try again");
    } finally {
      setSaving(false);
    }
  };

  const fieldSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "10px", fontSize: 13, fontFamily: FONT,
      backgroundColor: "#FAFAFA",
      "& fieldset": { borderColor: "#E5E7EB" },
      "&:hover fieldset": { borderColor: "#9CA3AF" },
      "&.Mui-focused fieldset": { borderColor: accentColor, borderWidth: 1.5 },
    },
    "& .MuiFormHelperText-root": { fontFamily: FONT, fontSize: 11, mt: 0.4 },
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "18px",
          fontFamily: FONT,
          overflow: "hidden",
        },
      }}
    >
      {/* ── Header ── */}
      <Box
        sx={{
          background: "linear-gradient(135deg,#1F2937 0%,#374151 100%)",
          px: 3, py: 2.2,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 38, height: 38, borderRadius: "10px",
              background: `${accentColor}30`,
              border: `1px solid ${accentColor}50`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <PersonAddOutlinedIcon sx={{ fontSize: 20, color: "#FCA5A5" }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: 15, fontWeight: 700, color: "#F9FAFB", fontFamily: FONT }}>
              {title}
            </Typography>
            <Typography sx={{ fontSize: 11, color: "#9CA3AF", fontFamily: FONT }}>
              Fill in the details below
            </Typography>
          </Box>
        </Box>
        <IconButton
          size="small"
          onClick={handleClose}
          sx={{ color: "#9CA3AF", "&:hover": { color: "#F9FAFB", backgroundColor: "rgba(255,255,255,0.08)" } }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* ── Body ── */}
      <DialogContent sx={{ px: 3, py: 2.5, position: "relative" }}>

        {/* Success overlay */}
        {success && (
          <Box
            sx={{
              position: "absolute", inset: 0, zIndex: 10,
              background: "rgba(255,255,255,0.95)",
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: 1.5,
            }}
          >
            <Box
              sx={{
                width: 64, height: 64, borderRadius: "50%",
                background: "linear-gradient(135deg,#DCFCE7,#BBF7D0)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <CheckCircleOutlineIcon sx={{ fontSize: 36, color: "#15803D" }} />
            </Box>
            <Typography sx={{ fontSize: 15, fontWeight: 700, color: "#15803D", fontFamily: FONT }}>
              Member Added!
            </Typography>
            <Typography sx={{ fontSize: 12, color: "#6B7280", fontFamily: FONT }}>
              {name} has been added successfully
            </Typography>
          </Box>
        )}

        {/* ── Full Name ── */}
        <Box sx={{ mb: 2 }}>
          <FieldLabel text="Full Name" required />
          <TextField
            fullWidth size="small"
            placeholder="e.g. Rajesh Kumar"
            value={name}
            onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: "" })); }}
            error={!!errors.name}
            helperText={errors.name}
            InputProps={{
              startAdornment: <InputAdornment position="start"><PersonOutlineIcon sx={{ fontSize: 16, color: "#9CA3AF" }} /></InputAdornment>,
            }}
            sx={fieldSx}
          />
        </Box>

        {/* ── Email ── */}
        <Box sx={{ mb: 2 }}>
          <FieldLabel text="Email Address" />
          <TextField
            fullWidth size="small"
            placeholder="email@example.com"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: "" })); }}
            error={!!errors.email}
            helperText={errors.email}
            InputProps={{
              startAdornment: <InputAdornment position="start"><EmailOutlinedIcon sx={{ fontSize: 16, color: "#9CA3AF" }} /></InputAdornment>,
            }}
            sx={fieldSx}
          />
        </Box>

        {/* ── Phone ── */}
        <Box sx={{ mb: 2 }}>
          <FieldLabel text="Phone Number" required />
          <Box sx={{ display: "flex", gap: 1 }}>
            <FormControl size="small" sx={{ flexShrink: 0 }}>
              <Select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                IconComponent={KeyboardArrowDownIcon}
                sx={{
                  height: 40, minWidth: 84, borderRadius: "10px",
                  fontSize: 13, fontFamily: FONT,
                  backgroundColor: "#FAFAFA",
                  "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E5E7EB" },
                  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#9CA3AF" },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: accentColor, borderWidth: 1.5 },
                  "& .MuiSelect-icon": { fontSize: 16, color: "#6B7280" },
                }}
              >
                {COUNTRY_CODES.map((c) => (
                  <MenuItem key={c} value={c} sx={{ fontSize: 13, fontFamily: FONT }}>{c}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth size="small"
              placeholder="9876543210"
              value={phone}
              inputProps={{ inputMode: "numeric" }}
              onChange={(e) => {
                setPhone(e.target.value.replace(/\D/g, ""));
                setErrors((p) => ({ ...p, phone: "" }));
              }}
              error={!!errors.phone}
              helperText={errors.phone}
              InputProps={{
                startAdornment: <InputAdornment position="start"><PhoneOutlinedIcon sx={{ fontSize: 16, color: "#9CA3AF" }} /></InputAdornment>,
              }}
              sx={{ ...fieldSx, "& .MuiOutlinedInput-root": { ...fieldSx["& .MuiOutlinedInput-root"], height: 40 } }}
            />
          </Box>
        </Box>

        {/* ── Role (hidden if only one matched role) ── */}
        {roles.length > 1 && (
          <Box sx={{ mb: 2 }}>
            <FieldLabel text="Role" required />
            <FormControl fullWidth size="small" error={!!errors.role}>
              <Select
                value={roleId}
                onChange={(e) => { setRoleId(Number(e.target.value)); setErrors((p) => ({ ...p, role: "" })); }}
                IconComponent={KeyboardArrowDownIcon}
                displayEmpty
                renderValue={(v) => {
                  const isEmpty = v === ("" as any);
                  return (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <WorkOutlineIcon sx={{ fontSize: 15, color: "#9CA3AF" }} />
                      <Typography sx={{ fontSize: 13, fontFamily: FONT, color: isEmpty ? "#9CA3AF" : "#374151" }}>
                        {isEmpty ? "Select role" : roles.find((r) => r.id === v)?.display_name ?? ""}
                      </Typography>
                    </Box>
                  );
                }}
                sx={{
                  height: 40, borderRadius: "10px", backgroundColor: "#FAFAFA",
                  "& .MuiOutlinedInput-notchedOutline": { borderColor: errors.role ? RED : "#E5E7EB" },
                  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#9CA3AF" },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: accentColor, borderWidth: 1.5 },
                  "& .MuiSelect-icon": { fontSize: 18, color: "#6B7280" },
                }}
              >
                {roles.map((r) => (
                  <MenuItem key={r.id} value={r.id} sx={{ fontSize: 13, fontFamily: FONT }}>
                    {r.display_name}
                  </MenuItem>
                ))}
              </Select>
              {errors.role && (
                <Typography sx={{ fontSize: 11, color: RED, fontFamily: FONT, mt: 0.4 }}>{errors.role}</Typography>
              )}
            </FormControl>
          </Box>
        )}

        {/* ── Password ── */}
        <Box sx={{ mb: 1 }}>
          <FieldLabel text="Password" required />
          <TextField
            fullWidth size="small"
            placeholder="Minimum 6 characters"
            type={showPass ? "text" : "password"}
            value={password}
            onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: "" })); }}
            error={!!errors.password}
            helperText={errors.password}
            InputProps={{
              startAdornment: <InputAdornment position="start"><LockOutlinedIcon sx={{ fontSize: 16, color: "#9CA3AF" }} /></InputAdornment>,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setShowPass((v) => !v)} edge="end" tabIndex={-1}>
                    {showPass
                      ? <VisibilityOffOutlinedIcon sx={{ fontSize: 16, color: "#9CA3AF" }} />
                      : <VisibilityOutlinedIcon sx={{ fontSize: 16, color: "#9CA3AF" }} />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={fieldSx}
          />
        </Box>
      </DialogContent>

      {/* ── Footer ── */}
      <Box
        sx={{
          px: 3, py: 2,
          borderTop: "1px solid #F1F5F9",
          display: "flex", justifyContent: "flex-end", gap: 1.5,
          background: "#FFFFFF",
        }}
      >
        <Button
          onClick={handleClose}
          variant="outlined"
          sx={{
            textTransform: "none", fontWeight: 500, fontSize: 13,
            borderColor: "#D1D5DB", color: "#6B7280",
            borderRadius: "10px", px: 3, height: 40,
            fontFamily: FONT,
            "&:hover": { borderColor: "#9CA3AF", backgroundColor: "#F9FAFB" },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={saving}
          variant="contained"
          sx={{
            textTransform: "none", fontWeight: 700, fontSize: 13,
            background: `linear-gradient(135deg,${accentColor},#c62a2f)`,
            borderRadius: "10px", px: 3.5, height: 40,
            fontFamily: FONT,
            boxShadow: `0 3px 10px ${accentColor}50`,
            "&:hover": { background: "linear-gradient(135deg,#c62a2f,#a02020)" },
            "&:disabled": { background: "#E5E7EB", color: "#9CA3AF", boxShadow: "none" },
          }}
        >
          {saving ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CircularProgress size={14} sx={{ color: "#fff" }} />
              Saving…
            </Box>
          ) : "Save Member"}
        </Button>
      </Box>
    </Dialog>
  );
}

function FieldLabel({ text, required }: { text: string; required?: boolean }) {
  return (
    <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#374151", mb: 0.6, fontFamily: FONT }}>
      {text}
      {required && <span style={{ color: RED, marginLeft: 2 }}>*</span>}
    </Typography>
  );
}
