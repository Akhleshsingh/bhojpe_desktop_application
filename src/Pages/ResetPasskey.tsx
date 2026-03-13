import React, { useState } from "react";
import { Box, Typography, Button, TextField } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function ResetPasskey() {
  const [oldKey, setOldKey] = useState("");
  const [newKey, setNewKey] = useState("");
  const navigate = useNavigate();

  const handleReset = () => {
    const saved = localStorage.getItem("pos_passkey");

    if (oldKey !== saved) {
      alert("Wrong old passkey ❌");
      return;
    }

    if (newKey.length !== 4) {
      alert("New passkey must be 4 digits");
      return;
    }

    localStorage.setItem("pos_passkey", newKey);

    alert("Passkey reset successfully ✅");
    navigate(-1);
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h6" mb={2}>
        Reset Passkey
      </Typography>

      <TextField
        label="Old Passkey"
        type="password"
        value={oldKey}
        onChange={(e) => setOldKey(e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
      />

      <TextField
        label="New Passkey"
        type="password"
        value={newKey}
        onChange={(e) => setNewKey(e.target.value)}
        fullWidth
        sx={{ mb: 3 }}
      />

      <Button
        variant="contained"
        onClick={handleReset}
        sx={{ bgcolor: "#BA3131" }}
      >
        Reset Passkey
      </Button>
    </Box>
  );
}
