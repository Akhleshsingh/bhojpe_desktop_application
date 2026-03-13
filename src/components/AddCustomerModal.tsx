import React from "react";
import {
  Box,
  Typography,
  Modal,
  Button,
  TextField,
  Divider,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PersonIcon from "@mui/icons-material/Person";
import { useCustomers } from "../context/CustomerContext";

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

export default function AddCustomerModal({ open, onClose, onSave }: Props) {
  const {
    searchCustomers,
    saveCustomer,
    setSelectedCustomer,
  } = useCustomers();

  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [address, setAddress] = React.useState("");

  const [search, setSearch] = React.useState("");
  const [filteredCustomers, setFilteredCustomers] = React.useState<any[]>([]);

  /* 🔍 API SEARCH */
  React.useEffect(() => {
    let active = true;

    const runSearch = async () => {
      if (!search.trim()) {
        setFilteredCustomers([]);
        return;
      }

      const results = await searchCustomers(search);
      if (active) setFilteredCustomers(results || []);
    };

    runSearch();
    return () => {
      active = false;
    };
  }, [search, searchCustomers]);

  /* ✅ SELECT EXISTING CUSTOMER */
  const handleSelectCustomer = (customer: any) => {
    const normalized = {
      id: customer.id,
      name: customer.name ?? "",
      phone: String(customer.phone ?? ""),
      email: customer.email ?? "",
      address: customer.delivery_address ?? "",
    };

    setSelectedCustomer(normalized); // 🔥 global
    onSave(normalized);              // 🔥 parent (OrderPanel)

    // fill form (optional UX)
    setName(normalized.name);
    setPhone(normalized.phone);
    setEmail(normalized.email);
    setAddress(normalized.address);

    setSearch("");
    setFilteredCustomers([]);
    onClose();
  };

  /* ✅ SAVE NEW CUSTOMER */
  const handleSave = async () => {
    if (!name || !phone) return;

    const savedCustomer = await saveCustomer({
      name,
      phone,
      email,
      delivery_address: address,
    });

    if (!savedCustomer) return;

    const normalized = {
      id: savedCustomer.id,
      name: savedCustomer.name ?? "",
      phone: String(savedCustomer.phone ?? ""),
      email: savedCustomer.email ?? "",
      address: savedCustomer.delivery_address ?? "",
    };

    setSelectedCustomer(normalized); // 🔥 global
    onSave(normalized);              // 🔥 parent

    // reset local form
    setName("");
    setPhone("");
    setEmail("");
    setAddress("");
    setSearch("");
    setFilteredCustomers([]);

    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          width: 520,
          background: "#fff",
          borderRadius: 3,
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          boxShadow: 24,
        }}
      >
        {/* HEADER */}
        <Box sx={{ p: 3, display: "flex", gap: 2 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              backgroundColor: "#BA3131",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <PersonIcon sx={{ color: "#fff" }} />
          </Box>

          <Box>
            <Typography fontWeight={700} fontSize={18}>
              Add Customer
            </Typography>
            <Typography fontSize={13} color="text.secondary">
              Search or create customer
            </Typography>
          </Box>
        </Box>

        <Divider />

        {/* SEARCH */}
        <Box sx={{ p: 3 }}>
          <Typography fontWeight={600} mb={1}>
            Search Customer
          </Typography>

          <TextField
            fullWidth
            placeholder="Search by name / phone / email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "#9E9E9E" }} />
                </InputAdornment>
              ),
            }}
          />

          {filteredCustomers.length > 0 && (
            <Box
              sx={{
                border: "1px solid #E0E0E0",
                borderRadius: 2,
                mt: 1,
                maxHeight: 180,
                overflowY: "auto",
              }}
            >
              {filteredCustomers.map((c) => (
                <Box
                  key={c.id}
                  onClick={() => handleSelectCustomer(c)}
                  sx={{
                    px: 2,
                    py: 1,
                    cursor: "pointer",
                    "&:hover": { backgroundColor: "#F5F5F5" },
                  }}
                >
                  <Typography fontWeight={600}>{c.name}</Typography>
                  <Typography fontSize={12} color="text.secondary">
                    {c.phone} {c.email && `• ${c.email}`}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </Box>

        <Divider />

        {/* DETAILS */}
        <Box sx={{ p: 3 }}>
          <Typography fontWeight={600} mb={2}>
            Customer Details
          </Typography>

          <TextField
            label="Customer Name"
            fullWidth
            size="small"
            value={name}
            onChange={(e) => setName(e.target.value)}
            sx={{ mb: 2 }}
          />

          <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
            <TextField size="small" value="+91" disabled sx={{ width: 80 }} />
            <TextField
              label="Phone Number"
              size="small"
              fullWidth
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </Box>

          <TextField
            label="Email"
            fullWidth
            size="small"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ mb: 2 }}
          />

          <TextField
            label="Address"
            fullWidth
            size="small"
            multiline
            rows={2}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </Box>

        <Divider />

        {/* FOOTER */}
        <Box sx={{ p: 2, display: "flex", justifyContent: "flex-end", gap: 1 }}>
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="contained"
            sx={{ bgcolor: "#BA3131" }}
            onClick={handleSave}
          >
            ✓ Save
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}
