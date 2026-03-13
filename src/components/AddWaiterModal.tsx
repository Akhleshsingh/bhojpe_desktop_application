import React, { useState } from "react";
import { Box, Button } from "@mui/material";
import { Dropdown } from "react-bootstrap";
import { useWaiters } from "../context/WaitersContext";

export default function AddWaiterModal({ open, onClose, onSave }: any) {
  const { waiters } = useWaiters();
  const [selectedWaiter, setSelectedWaiter] = useState<any>(null);

  if (!open) return null;

  const handleSave = () => {
    if (selectedWaiter) {
      onSave(selectedWaiter);
      onClose();
    }
  };

  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 4000,
      }}
    >
      <Box
        sx={{
          width: 320,
          background: "#fff",
          p: 2,
          borderRadius: "8px",
        }}
      >
        {/* WAITER DROPDOWN */}
        <Dropdown>
          <Dropdown.Toggle
            variant="outline-secondary"
            style={{
              width: "100%",
              height: "36px",
              textAlign: "left",
            }}
          >
            {selectedWaiter ? selectedWaiter.name : "Select Waiter"}
          </Dropdown.Toggle>

          <Dropdown.Menu
            style={{
              width: "100%",
              maxHeight: "200px",
              overflowY: "auto",
            }}
          >
            {waiters.map((w: any) => (
              <Dropdown.Item
                key={w.id}
                onClick={() => setSelectedWaiter(w)}
              >
                {w.name}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>

        {/* ACTIONS */}
        <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
          <Button
            variant="contained"
            fullWidth
            disabled={!selectedWaiter}
            onClick={handleSave}
          >
            Save
          </Button>

          <Button fullWidth onClick={onClose}>
            Cancel
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
