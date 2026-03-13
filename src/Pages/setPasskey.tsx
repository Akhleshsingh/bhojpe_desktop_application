import React, { useState } from "react";
import { Box, Typography, Button, TextField } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function SetPasskey() {
  const [passkey, setPasskey] = useState("");
  const [confirm, setConfirm] = useState("");
  const navigate = useNavigate();

  const handleSave = () => {
    if (passkey.length !== 4) {
      alert("Passkey must be 4 digits");
      return;
    }

    if (passkey !== confirm) {
      alert("Passkeys do not match");
      return;
    }

    localStorage.setItem("pos_passkey", passkey);

    alert("Passkey set successfully ✅");
    navigate(-1);
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h6" mb={2}>
        Set POS Passkey
      </Typography>

      <TextField
        label="Enter 4-digit passkey"
        type="password"
        value={passkey}
        onChange={(e) => setPasskey(e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
      />

      <TextField
        label="Confirm passkey"
        type="password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        fullWidth
        sx={{ mb: 3 }}
      />

      <Button
        variant="contained"
        onClick={handleSave}
        sx={{ bgcolor: "#5A7863" }}
      >
        Save Passkey
      </Button>
    </Box>
  );
}
