import React, { useState, useRef } from "react";
import {
  Box,
  Button,
  Popover,
  List,
  ListItem,
  ListItemText,
  TextField,
  Typography,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useWaiters } from "../context/WaitersContext";

export default function AddWaiterModal({ open, onClose, onSave, anchorEl }: any) {
  const { waiters } = useWaiters();
  const [selectedWaiter, setSelectedWaiter] = useState<any>(null);
  const [query, setQuery] = useState("");

  const filtered = waiters.filter((w: any) =>
    w.name?.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (w: any) => {
    setSelectedWaiter(w);
  };

  const handleSave = () => {
    if (selectedWaiter) {
      onSave(selectedWaiter);
      setSelectedWaiter(null);
      setQuery("");
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedWaiter(null);
    setQuery("");
    onClose();
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={handleClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      transformOrigin={{ vertical: "top", horizontal: "left" }}
      PaperProps={{
        sx: {
          width: 260,
          borderRadius: "10px",
          boxShadow: "0px 8px 24px rgba(0,0,0,0.15)",
          overflow: "hidden",
        },
      }}
    >
      <Box sx={{ p: 1.5 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search waiter..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 16, color: "#9E9E9E" }} />
              </InputAdornment>
            ),
          }}
          sx={{
            mb: 0.5,
            "& .MuiOutlinedInput-root": { fontSize: 13, borderRadius: "8px" },
          }}
        />

        <List dense disablePadding sx={{ maxHeight: 200, overflowY: "auto" }}>
          {filtered.length === 0 ? (
            <ListItem>
              <ListItemText
                primary={
                  <Typography fontSize={13} color="text.secondary">
                    No waiters found
                  </Typography>
                }
              />
            </ListItem>
          ) : (
            filtered.map((w: any) => (
              <ListItem
                key={w.id}
                onClick={() => handleSelect(w)}
                sx={{
                  borderRadius: "6px",
                  cursor: "pointer",
                  bgcolor:
                    selectedWaiter?.id === w.id ? "#FFF0F0" : "transparent",
                  "&:hover": { bgcolor: "#F5F5F5" },
                  py: 0.7,
                }}
              >
                <ListItemText
                  primary={
                    <Typography
                      fontSize={13}
                      fontWeight={selectedWaiter?.id === w.id ? 600 : 400}
                      color={
                        selectedWaiter?.id === w.id ? "#FF3D01" : "inherit"
                      }
                    >
                      {w.name}
                    </Typography>
                  }
                />
              </ListItem>
            ))
          )}
        </List>

        <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
          <Button
            variant="contained"
            fullWidth
            size="small"
            disabled={!selectedWaiter}
            onClick={handleSave}
            sx={{
              bgcolor: "#FF3D01",
              "&:hover": { bgcolor: "#c62a2f" },
              textTransform: "none",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            Save
          </Button>
          <Button
            fullWidth
            size="small"
            onClick={handleClose}
            sx={{ textTransform: "none", fontSize: 13, color: "#555" }}
          >
            Cancel
          </Button>
        </Box>
      </Box>
    </Popover>
  );
}
