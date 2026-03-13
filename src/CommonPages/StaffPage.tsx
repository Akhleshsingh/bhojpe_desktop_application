import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Select,
  MenuItem,
  Drawer,
  CircularProgress,
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

interface Staff {
  id: number;
  name: string;
  email: string;
  phone_number: string;
  branch_id: number;
  role_id: number;
  role_name: string;
}

interface ApiResponse {
  status: boolean;
  data: Staff[];
  errors?: Record<string, string[]>;
}

interface FormState {
  name: string;
  email: string;
  phone_number: string;
  password: string;
  role_id: number | "";
}

export default function StaffPage() {
  const { branchData } = useAuth();

  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(false);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [editData, setEditData] = useState<Staff | null>(null);

  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    phone_number: "",
    password: "",
    role_id: "",
  });

  const token = localStorage.getItem("token");

  const branch_id = branchData?.data?.id;
  const restaurant_id = branchData?.data?.restaurant_id;
  const phone_code: string = String(
    branchData?.data?.restaurant?.phone_code ?? "91"
  );
  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        "http://bhojpe.in/api/v1/getstaffs",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data: ApiResponse = await res.json();

      if (data.status) {
        setStaff(data.data);
      }
    } catch (err) {
      toast.error("Failed to fetch staff");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (branch_id) fetchStaff();
  }, [branch_id]);

  /* ================= UNIQUE ROLES ================= */

  const roles = useMemo(() => {
    const unique = new Map<number, string>();
    staff.forEach((s) => {
      unique.set(s.role_id, s.role_name);
    });

    return Array.from(unique.entries()).map(([id, name]) => ({
      id,
      name,
    }));
  }, [staff]);

  /* ================= ADD ================= */

  const handleAdd = () => {
    setEditData(null);
    setForm({
      name: "",
      email: "",
      phone_number: "",
      password: "",
      role_id: roles.length ? roles[0].id : "",
    });
    setOpenDrawer(true);
  };

  /* ================= EDIT ================= */

  const handleEdit = (row: Staff) => {
    setEditData(row);
    setForm({
      name: row.name,
      email: row.email,
      phone_number: row.phone_number.replace(/\D/g, ""),
      password: "",
      role_id: row.role_id,
    });
    setOpenDrawer(true);
  };

  /* ================= SAVE ================= */

  const handleSave = async () => {
    if (!branch_id || !restaurant_id) {
      toast.error("Branch information missing");
      return;
    }

    const cleanedPhone = form.phone_number.replace(/\D/g, "");

    if (cleanedPhone.length < 8 || cleanedPhone.length > 15) {
      toast.error("Phone must be between 8-15 digits");
      return;
    }

    try {
      const url = editData
        ? `http://bhojpe.in/api/v1/update-staff/${editData.id}`
        : "http://bhojpe.in/api/v1/add-staff";

      const payload = {
        name: form.name,
        email: form.email,
        phone_number: cleanedPhone,
        phone_code,
        branch_id,
        restaurant_id,
        role_id: form.role_id,
        password: form.password,
      };

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      /* 🔴 VALIDATION ERRORS */
      if (!data.status) {
        if (data.errors) {
          Object.keys(data.errors).forEach((field) => {
            data.errors[field].forEach((msg: string) => {
              toast.error(msg);
            });
          });
        } else {
          toast.error("Something went wrong");
        }
        return;
      }

      /* ✅ SUCCESS */
      toast.success(
        editData
          ? "Staff updated successfully"
          : "Staff added successfully"
      );

      fetchStaff();
      setOpenDrawer(false);
    } catch (err) {
      toast.error("Server error occurred");
    }
  };

  /* ================= UI ================= */

  return (
    <Box p={2} bgcolor="#F9FAFB" minHeight="100vh">
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Typography fontSize={22} fontWeight={700}>
          Staff
        </Typography>

        <Button variant="contained" onClick={handleAdd}>
          Add Member
        </Button>
      </Box>

      {loading ? (
        <CircularProgress />
      ) : (
        <Table sx={{ background: "#fff" }}>
          <TableHead sx={{ background: "#F1F3F5" }}>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Role</TableCell>
              <TableCell align="right">Action</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {staff.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.email}</TableCell>
                <TableCell>{row.phone_number}</TableCell>
                <TableCell>{row.role_name}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => handleEdit(row)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Drawer
        anchor="right"
        open={openDrawer}
        onClose={() => setOpenDrawer(false)}
        PaperProps={{
          sx: { width: 380, top: 70, height: "calc(100% - 70px)" },
        }}
      >
        <Box p={3}>
          <Typography fontWeight={700} mb={2}>
            {editData ? "Edit Member" : "Add Member"}
          </Typography>

          <TextField
            fullWidth
            label="Name"
            sx={{ mb: 2 }}
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
          />

          <TextField
            fullWidth
            label="Email"
            sx={{ mb: 2 }}
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
          />

          <TextField
            fullWidth
            label="Phone"
            sx={{ mb: 2 }}
            value={form.phone_number}
            onChange={(e) =>
              setForm({ ...form, phone_number: e.target.value })
            }
          />

          <TextField
            fullWidth
            label="Password"
            type="password"
            sx={{ mb: 2 }}
            value={form.password}
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
          />

          <Select
            fullWidth
            value={form.role_id}
            onChange={(e) =>
              setForm({
                ...form,
                role_id: Number(e.target.value),
              })
            }
            sx={{ mb: 3 }}
          >
            {roles.map((role) => (
              <MenuItem key={role.id} value={role.id}>
                {role.name}
              </MenuItem>
            ))}
          </Select>

          <Box display="flex" gap={1}>
            <Button variant="contained" onClick={handleSave}>
              Save
            </Button>

            <Button
              variant="outlined"
              onClick={() => setOpenDrawer(false)}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Drawer>
    </Box>
  );
}