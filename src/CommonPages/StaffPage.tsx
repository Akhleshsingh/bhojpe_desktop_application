import { BASE_URL } from "../utils/api";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Box, Typography, TextField, Button, IconButton, Select, MenuItem,
  Drawer, CircularProgress, InputAdornment, Tooltip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

const FONT = "Poppins, sans-serif";
const RED = "#FF3D01";
const PAGE_SIZE = 10;

interface Staff {
  id: number;
  name: string;
  email: string;
  phone_number: string;
  branch_id: number;
  role_id: number;
  role_name: string;
}

interface Role {
  id: number;
  display_name: string;
}

interface FormState {
  name: string;
  email: string;
  phone_number: string;
  password: string;
  role_id: number | "";
}

const ROLE_COLORS: Record<string, { bg: string; color: string }> = {
  waiter:      { bg: "#EFF6FF", color: "#2563EB" },
  chef:        { bg: "#FFF7ED", color: "#C2410C" },
  delivery:    { bg: "#F0FDF4", color: "#15803D" },
  "branch head": { bg: "#FDF4FF", color: "#7E22CE" },
  manager:     { bg: "#FFF1F2", color: "#BE123C" },
  admin:       { bg: "#FEF9C3", color: "#854D0E" },
};
const roleStyle = (name: string) =>
  ROLE_COLORS[(name ?? "").toLowerCase()] ?? { bg: "#F3F4F6", color: "#374151" };

const StatChip = ({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) => (
  <Box sx={{
    display: "flex", alignItems: "center", gap: 1.2,
    px: 2, py: 1.2, borderRadius: "12px",
    backgroundColor: `${color}12`, border: `1.5px solid ${color}25`,
  }}>
    <Box sx={{ width: 32, height: 32, borderRadius: "8px", backgroundColor: `${color}20`, display: "flex", alignItems: "center", justifyContent: "center", color }}>
      {icon}
    </Box>
    <Box>
      <Typography sx={{ fontSize: 18, fontWeight: 800, color: "#1F2937", fontFamily: FONT, lineHeight: 1 }}>{value}</Typography>
      <Typography sx={{ fontSize: 11, color: "#6B7280", fontFamily: FONT, mt: 0.2 }}>{label}</Typography>
    </Box>
  </Box>
);

const colW = ["28%", "28%", "20%", "15%", "9%"];

export default function StaffPage() {
  const { branchData } = useAuth();

  const [staff, setStaff]         = useState<Staff[]>([]);
  const [roles, setRoles]         = useState<Role[]>([]);
  const [loading, setLoading]     = useState(false);
  const [saving, setSaving]       = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [editData, setEditData]   = useState<Staff | null>(null);
  const [search, setSearch]       = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [page, setPage]           = useState(1);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const [form, setForm] = useState<FormState>({ name: "", email: "", phone_number: "", password: "", role_id: "" });

  const token         = localStorage.getItem("token");
  const branch_id     = branchData?.data?.id;
  const restaurant_id = branchData?.data?.restaurant_id;
  const phone_code    = String(branchData?.data?.restaurant?.phone_code ?? "91");

  /* ── FETCH ROLES (token-only, no branch_id needed) ── */
  const fetchRoles = useCallback(async () => {
    const t = localStorage.getItem("token");
    if (!t) return;
    try {
      const res = await fetch(`${BASE_URL}/restaurant-roles`, {
        headers: { Authorization: `Bearer ${t}`, "Content-Type": "application/json" },
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data.status && Array.isArray(data.roles) && data.roles.length > 0) {
        setRoles(data.roles);
      }
    } catch { /* silent */ }
  }, []);

  /* ── FETCH STAFF ── */
  const fetchStaff = useCallback(async () => {
    const t = localStorage.getItem("token");
    if (!t) return;
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/getstaffs`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      const data = await res.json();
      if (data.status) {
        const list = Array.isArray(data.data) ? data.data
          : Array.isArray(data.data?.data) ? data.data.data
          : Array.isArray(data.data?.staff) ? data.data.staff : [];
        setStaff(list);
      } else {
        toast.error(data.message || "Failed to load staff");
      }
    } catch (err: any) {
      toast.error("Network error loading staff");
    } finally {
      setLoading(false);
    }
  }, []);

  /* Fetch roles immediately on mount; fetch staff once branch_id is available */
  useEffect(() => { fetchRoles(); }, [fetchRoles]);
  useEffect(() => { if (branch_id) fetchStaff(); }, [branch_id, fetchStaff]);

  /* Auto-select first role when roles load and form has no role selected */
  useEffect(() => {
    if (roles.length > 0 && form.role_id === "") {
      setForm(prev => ({ ...prev, role_id: roles[0].id }));
    }
  }, [roles]);

  /* ── STATS ── */
  const roleCounts = useMemo(() => {
    const c: Record<string, number> = {};
    staff.forEach(s => { const k = (s.role_name ?? "Unknown").toLowerCase(); c[k] = (c[k] ?? 0) + 1; });
    return c;
  }, [staff]);

  /* ── FILTER + SEARCH ── */
  const filtered = useMemo(() => {
    let list = staff;
    if (roleFilter !== "all") list = list.filter(s => String(s.role_id) === roleFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(s => s.name?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q));
    }
    return list;
  }, [staff, search, roleFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const safeSetPage = (p: number) => setPage(Math.min(Math.max(1, p), totalPages));
  useEffect(() => { setPage(1); }, [search, roleFilter]);

  /* ── ADD / EDIT handlers ── */
  const handleAdd = () => {
    setEditData(null);
    setForm({ name: "", email: "", phone_number: "", password: "", role_id: roles.length ? roles[0].id : "" });
    if (roles.length === 0) fetchRoles(); /* retry if still empty */
    setOpenDrawer(true);
  };

  const handleEdit = (row: Staff) => {
    setEditData(row);
    setForm({ name: row.name, email: row.email, phone_number: row.phone_number.replace(/\D/g, ""), password: "", role_id: row.role_id });
    setOpenDrawer(true);
  };

  /* ── SAVE ── */
  const handleSave = async () => {
    if (!branch_id || !restaurant_id) return toast.error("Branch information missing");
    const cleanedPhone = form.phone_number.replace(/\D/g, "");
    if (cleanedPhone.length < 8 || cleanedPhone.length > 15) return toast.error("Phone must be 8–15 digits");
    if (!form.name.trim()) return toast.error("Name is required");
    setSaving(true);
    try {
      const url = editData
        ? `${BASE_URL}/update-staff/${editData.id}`
        : `${BASE_URL}/add-staff`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: form.name, email: form.email, phone_number: cleanedPhone, phone_code, branch_id, restaurant_id, role_id: form.role_id, password: form.password }),
      });
      const data = await res.json();
      if (!data.status) {
        if (data.errors) Object.values(data.errors).flat().forEach((m: any) => toast.error(m));
        else toast.error(data.message || "Something went wrong");
        return;
      }
      toast.success(editData ? "Staff updated" : "Staff added");
      setOpenDrawer(false);
      fetchStaff();
    } catch { toast.error("Server error"); }
    finally { setSaving(false); }
  };

  /* ── DELETE ── */
  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      const res = await fetch(`${BASE_URL}/delete-staff/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.status) { toast.success("Staff removed"); fetchStaff(); }
      else toast.error(data.message || "Failed to delete");
    } catch { toast.error("Delete failed"); }
    finally { setDeletingId(null); setConfirmDeleteId(null); }
  };

  /* ── EXPORT ── */
  const handleExport = () => {
    const header = "Name,Email,Phone,Role";
    const rows = filtered.map(s => `"${s.name}","${s.email}","${s.phone_number}","${s.role_name}"`);
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "staff.csv"; a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported staff list");
  };

  /* ── TOP STAT CARDS ── */
  const topRoles = useMemo(() => {
    return Object.entries(roleCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, count]) => ({ name, count }));
  }, [roleCounts]);

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#F8FAFC", fontFamily: FONT }}>

      {/* ── Page Header ── */}
      <Box sx={{
        height: 64, backgroundColor: "#FFFFFF",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        px: 3, borderBottom: "1px solid #E6E6E6",
        position: "sticky", top: 0, zIndex: 10,
      }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={{ width: 36, height: 36, borderRadius: "10px", background: `${RED}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <PeopleOutlineIcon sx={{ fontSize: 20, color: RED }} />
          </Box>
          <Typography sx={{ fontSize: 16, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", fontFamily: FONT }}>
            Staff
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Button variant="outlined" startIcon={<FileDownloadOutlinedIcon />} onClick={handleExport}
            sx={{ textTransform: "none", fontSize: 13, fontWeight: 600, fontFamily: FONT, height: 38, borderRadius: "10px", borderColor: "#D1D5DB", color: "#374151", "&:hover": { borderColor: "#9CA3AF" } }}>
            Export
          </Button>
          <Button variant="contained" startIcon={<PersonAddOutlinedIcon />} onClick={handleAdd}
            sx={{ textTransform: "none", fontSize: 13, fontWeight: 700, fontFamily: FONT, height: 38, borderRadius: "10px", background: `linear-gradient(135deg,${RED},#c62a2f)`, boxShadow: `0 4px 12px ${RED}40`, "&:hover": { background: "linear-gradient(135deg,#c62a2f,#a02020)" } }}>
            Add Member
          </Button>
        </Box>
      </Box>

      <Box sx={{ p: 2.5 }}>

        {/* ── Stat Cards ── */}
        <Box sx={{ display: "flex", gap: 2, mb: 2.5, flexWrap: "wrap" }}>
          <StatChip icon={<PeopleOutlineIcon sx={{ fontSize: 18 }} />} label="Total Staff" value={staff.length} color={RED} />
          {topRoles.map(r => (
            <StatChip key={r.name} icon={<BadgeOutlinedIcon sx={{ fontSize: 18 }} />} label={r.name.charAt(0).toUpperCase() + r.name.slice(1)} value={r.count} color={roleStyle(r.name).color} />
          ))}
        </Box>

        {/* ── Controls ── */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
          <TextField
            size="small" placeholder="Search by name or email…"
            value={search} onChange={e => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 16, color: "#9CA3AF" }} /></InputAdornment> }}
            sx={{ width: 280, "& .MuiOutlinedInput-root": { height: 38, fontSize: 13, fontFamily: FONT, borderRadius: "10px", backgroundColor: "#FFFFFF", "& fieldset": { borderColor: "#E5E7EB" }, "&:hover fieldset": { borderColor: "#9CA3AF" }, "&.Mui-focused fieldset": { borderColor: RED } } }}
          />
          <Select size="small" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
            sx={{ height: 38, fontSize: 13, fontFamily: FONT, borderRadius: "10px", backgroundColor: "#FFFFFF", minWidth: 140, "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E5E7EB" } }}>
            <MenuItem value="all" sx={{ fontFamily: FONT, fontSize: 13 }}>All Roles</MenuItem>
            {roles.map(r => <MenuItem key={r.id} value={String(r.id)} sx={{ fontFamily: FONT, fontSize: 13 }}>{r.display_name}</MenuItem>)}
          </Select>
        </Box>

        {/* ── Table ── */}
        <Box sx={{ backgroundColor: "#FFFFFF", borderRadius: "14px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "1px solid #F3F4F6", overflow: "hidden" }}>

          {/* Header row */}
          <Box sx={{ display: "grid", gridTemplateColumns: colW.join(" "), backgroundColor: "#F9FAFB", px: 2, py: 1.4, borderBottom: "1.5px solid #F0F0F0" }}>
            {["MEMBER NAME", "EMAIL ADDRESS", "ROLE", "ACTION", ""].map((h, i) => (
              <Typography key={i} sx={{ fontSize: 11, fontWeight: 700, color: "#9CA3AF", fontFamily: FONT, letterSpacing: 0.6, textTransform: "uppercase" }}>{h}</Typography>
            ))}
          </Box>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
              <CircularProgress size={32} sx={{ color: RED }} />
            </Box>
          ) : paged.length === 0 ? (
            <Box sx={{ py: 6, textAlign: "center" }}>
              <Typography sx={{ fontSize: 14, color: "#9CA3AF", fontFamily: FONT }}>No staff members found</Typography>
            </Box>
          ) : paged.map((row, idx) => {
            const rs = roleStyle(row.role_name);
            const isDeleting = deletingId === row.id;
            return (
              <Box key={row.id} sx={{
                display: "grid", gridTemplateColumns: colW.join(" "),
                px: 2, py: 1.4, alignItems: "center",
                backgroundColor: idx % 2 === 0 ? "#FFFFFF" : "#FAFAFA",
                borderBottom: "1px solid #F3F4F6",
                transition: "background .12s",
                "&:hover": { backgroundColor: "#F0F9FF" },
              }}>
                {/* Name */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                  <Box sx={{ width: 32, height: 32, borderRadius: "8px", backgroundColor: `${RED}12`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Typography sx={{ fontSize: 12, fontWeight: 700, color: RED, fontFamily: FONT }}>
                      {(row.name ?? "?")[0].toUpperCase()}
                    </Typography>
                  </Box>
                  <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#1F2937", fontFamily: FONT }}>{row.name}</Typography>
                </Box>

                {/* Email */}
                <Typography sx={{ fontSize: 12, color: "#6B7280", fontFamily: FONT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", pr: 1 }}>
                  {row.email}
                </Typography>

                {/* Role chip */}
                <Box>
                  {row.role_name ? (
                    <Box sx={{ display: "inline-flex", px: 1.2, py: 0.4, borderRadius: "20px", backgroundColor: rs.bg }}>
                      <Typography sx={{ fontSize: 11, fontWeight: 700, color: rs.color, fontFamily: FONT }}>{row.role_name}</Typography>
                    </Box>
                  ) : (
                    <Typography sx={{ fontSize: 12, color: "#D1D5DB", fontFamily: FONT }}>—</Typography>
                  )}
                </Box>

                {/* Actions */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Tooltip title="Edit" arrow>
                    <IconButton size="small" onClick={() => handleEdit(row)}
                      sx={{ width: 32, height: 32, borderRadius: "8px", border: "1px solid #E5E7EB", backgroundColor: "#F9FAFB", "&:hover": { borderColor: "#2563EB", backgroundColor: "#EFF6FF" } }}>
                      <EditOutlinedIcon sx={{ fontSize: 14, color: "#2563EB" }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete" arrow>
                    <IconButton size="small"
                      onClick={() => setConfirmDeleteId(row.id)}
                      disabled={isDeleting}
                      sx={{ width: 32, height: 32, borderRadius: "8px", border: "1px solid #E5E7EB", backgroundColor: "#F9FAFB", "&:hover": { borderColor: RED, backgroundColor: "#FEF2F2" } }}>
                      {isDeleting ? <CircularProgress size={12} sx={{ color: RED }} /> : <DeleteOutlineIcon sx={{ fontSize: 14, color: RED }} />}
                    </IconButton>
                  </Tooltip>
                </Box>

                {/* Phone */}
                <Typography sx={{ fontSize: 11, color: "#9CA3AF", fontFamily: FONT }}>{row.phone_number}</Typography>
              </Box>
            );
          })}
        </Box>

        {/* ── Pagination ── */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 2 }}>
          <Typography sx={{ fontSize: 13, color: "#6B7280", fontFamily: FONT }}>
            Showing <b>{filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}</b> To <b>{Math.min(page * PAGE_SIZE, filtered.length)}</b> of <b>{filtered.length}</b> results
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
            <IconButton size="small" onClick={() => safeSetPage(page - 1)} disabled={page === 1}
              sx={{ width: 32, height: 32, borderRadius: "8px", border: "1px solid #E5E7EB", backgroundColor: "#FFFFFF" }}>
              <ChevronLeftIcon sx={{ fontSize: 16 }} />
            </IconButton>
            {Array.from({ length: totalPages }, (_, i) => i + 1).filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1).map((p, idx, arr) => (
              <React.Fragment key={p}>
                {idx > 0 && arr[idx - 1] !== p - 1 && <Typography sx={{ color: "#9CA3AF", fontSize: 12 }}>…</Typography>}
                <Box onClick={() => safeSetPage(p)}
                  sx={{ width: 32, height: 32, borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: p === page ? 700 : 500, fontFamily: FONT, backgroundColor: p === page ? RED : "#FFFFFF", color: p === page ? "#FFFFFF" : "#374151", border: `1px solid ${p === page ? RED : "#E5E7EB"}`, "&:hover": { backgroundColor: p === page ? "#c62a2f" : "#F9FAFB" } }}>
                  {p}
                </Box>
              </React.Fragment>
            ))}
            <IconButton size="small" onClick={() => safeSetPage(page + 1)} disabled={page === totalPages}
              sx={{ width: 32, height: 32, borderRadius: "8px", border: "1px solid #E5E7EB", backgroundColor: "#FFFFFF" }}>
              <ChevronRightIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* ══ DELETE CONFIRM OVERLAY ══ */}
      {confirmDeleteId !== null && (
        <Box sx={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 5000 }}>
          <Box sx={{ width: 360, backgroundColor: "#FFFFFF", borderRadius: "16px", overflow: "hidden", boxShadow: "0 24px 60px rgba(0,0,0,0.2)" }}>
            <Box sx={{ background: "linear-gradient(135deg,#1F2937,#374151)", px: 2.5, py: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Typography sx={{ fontWeight: 700, color: "#FFF", fontFamily: FONT, fontSize: 15 }}>Remove Staff Member</Typography>
              <IconButton size="small" onClick={() => setConfirmDeleteId(null)} sx={{ color: "#9CA3AF" }}>
                <CloseRoundedIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Box>
            <Box sx={{ p: 3 }}>
              <Typography sx={{ fontSize: 14, color: "#374151", fontFamily: FONT, mb: 2.5, lineHeight: 1.6 }}>
                Are you sure you want to remove <b>{staff.find(s => s.id === confirmDeleteId)?.name}</b>? This action cannot be undone.
              </Typography>
              <Box sx={{ display: "flex", gap: 1.5 }}>
                <Button fullWidth variant="outlined" onClick={() => setConfirmDeleteId(null)}
                  sx={{ textTransform: "none", fontFamily: FONT, fontWeight: 600, borderRadius: "10px", borderColor: "#D1D5DB", color: "#374151" }}>
                  Cancel
                </Button>
                <Button fullWidth variant="contained" onClick={() => handleDelete(confirmDeleteId!)}
                  disabled={deletingId !== null}
                  sx={{ textTransform: "none", fontFamily: FONT, fontWeight: 700, borderRadius: "10px", background: `linear-gradient(135deg,${RED},#c62a2f)`, boxShadow: `0 4px 12px ${RED}40` }}>
                  {deletingId ? <CircularProgress size={16} sx={{ color: "#fff" }} /> : "Yes, Remove"}
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
      )}

      {/* ══ ADD / EDIT DRAWER ══ */}
      <Drawer anchor="right" open={openDrawer} onClose={() => setOpenDrawer(false)}
        PaperProps={{ sx: { width: 420, top: 64, height: "calc(100% - 64px)", boxShadow: "-4px 0 24px rgba(0,0,0,0.12)" } }}>

        {/* Drawer Header */}
        <Box sx={{ background: "linear-gradient(135deg,#1F2937 0%,#374151 100%)", px: 3, py: 2.2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.4 }}>
            <Box sx={{ width: 38, height: 38, borderRadius: "10px", background: `${RED}30`, border: `1px solid ${RED}50`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <PersonAddOutlinedIcon sx={{ fontSize: 20, color: "#FCA5A5" }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: 15, fontWeight: 700, color: "#FFFFFF", fontFamily: FONT }}>
                {editData ? "Edit Member" : "Add New Member"}
              </Typography>
              <Typography sx={{ fontSize: 11, color: "#9CA3AF", fontFamily: FONT }}>
                {editData ? "Update staff information" : "Fill in the details below"}
              </Typography>
            </Box>
          </Box>
          <IconButton size="small" onClick={() => setOpenDrawer(false)} sx={{ color: "#9CA3AF", "&:hover": { backgroundColor: "rgba(255,255,255,0.08)" } }}>
            <CloseRoundedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>

        {/* Drawer Form */}
        <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2, overflowY: "auto" }}>

          {[
            { icon: <PersonOutlineIcon sx={{ fontSize: 18, color: "#9CA3AF" }} />, label: "Full Name *", key: "name", type: "text", placeholder: "e.g. Rahul Sharma" },
            { icon: <EmailOutlinedIcon sx={{ fontSize: 18, color: "#9CA3AF" }} />, label: "Email Address", key: "email", type: "email", placeholder: "e.g. rahul@email.com" },
            { icon: <PhoneOutlinedIcon sx={{ fontSize: 18, color: "#9CA3AF" }} />, label: "Phone Number *", key: "phone_number", type: "tel", placeholder: "e.g. 9876543210" },
            { icon: <LockOutlinedIcon sx={{ fontSize: 18, color: "#9CA3AF" }} />, label: editData ? "New Password (leave blank to keep)" : "Password *", key: "password", type: "password", placeholder: "••••••••" },
          ].map(field => (
            <Box key={field.key} sx={{ display: "flex", alignItems: "flex-start", gap: 1.4 }}>
              <Box sx={{ mt: 1.2, flexShrink: 0 }}>{field.icon}</Box>
              <TextField fullWidth size="small" label={field.label} type={field.type} placeholder={field.placeholder}
                value={(form as any)[field.key]} onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px", fontSize: 13, fontFamily: FONT, backgroundColor: "#F9FAFB", "& fieldset": { borderColor: "#E5E7EB" }, "&:hover fieldset": { borderColor: "#9CA3AF" }, "&.Mui-focused fieldset": { borderColor: RED } }, "& label": { fontFamily: FONT, fontSize: 13 } }} />
            </Box>
          ))}

          {/* Role */}
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.4 }}>
            <Box sx={{ mt: 1.2, flexShrink: 0 }}><WorkOutlineIcon sx={{ fontSize: 18, color: "#9CA3AF" }} /></Box>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#6B7280", fontFamily: FONT, mb: 0.6, textTransform: "uppercase", letterSpacing: 0.5 }}>Role *</Typography>
              <Select fullWidth size="small" value={form.role_id} onChange={e => setForm({ ...form, role_id: Number(e.target.value) })}
                displayEmpty
                sx={{ borderRadius: "10px", fontSize: 13, fontFamily: FONT, backgroundColor: "#F9FAFB", "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E5E7EB" } }}>
                <MenuItem value="" disabled sx={{ fontFamily: FONT, fontSize: 13, color: "#9CA3AF" }}>
                  {roles.length === 0 ? "Loading roles…" : "Select a role"}
                </MenuItem>
                {roles.map(r => <MenuItem key={r.id} value={r.id} sx={{ fontFamily: FONT, fontSize: 13 }}>{r.display_name}</MenuItem>)}
              </Select>
            </Box>
          </Box>

          {/* Save / Cancel */}
          <Box sx={{ display: "flex", gap: 1.5, pt: 1, borderTop: "1px solid #F3F4F6", mt: 1 }}>
            <Button fullWidth variant="outlined" onClick={() => setOpenDrawer(false)}
              sx={{ textTransform: "none", fontFamily: FONT, fontWeight: 600, height: 42, borderRadius: "10px", borderColor: "#D1D5DB", color: "#374151" }}>
              Cancel
            </Button>
            <Button fullWidth variant="contained" onClick={handleSave} disabled={saving}
              sx={{ textTransform: "none", fontFamily: FONT, fontWeight: 700, height: 42, borderRadius: "10px", background: `linear-gradient(135deg,${RED},#c62a2f)`, boxShadow: `0 4px 12px ${RED}40`, "&:hover": { background: "linear-gradient(135deg,#c62a2f,#a02020)" }, "&.Mui-disabled": { background: "#F3F4F6", color: "#D1D5DB" } }}>
              {saving ? <CircularProgress size={16} sx={{ color: "#fff" }} /> : (editData ? "✓ Update Member" : "✓ Add Member")}
            </Button>
          </Box>
        </Box>
      </Drawer>
    </Box>
  );
}
