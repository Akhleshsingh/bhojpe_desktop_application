import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  TextField,
  Checkbox,
  Button,
  IconButton
} from "@mui/material";

import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import SearchIcon from "@mui/icons-material/Search";
import { useAuth } from "../context/AuthContext";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function ManageKitchenItemsModal({ open, onClose }: Props) {

  const { branchData } = useAuth();

  /* create items list from categories */
  const allItems =
    branchData?.data?.item_categories?.map((c: any) => ({
      id: c.id,
      name: c.category_name?.en
    })) || [];

  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<number[]>([]);
  const [addedItems, setAddedItems] = useState<number[]>([]);

  const filtered = allItems.filter((i: any) =>
    i.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggleItem = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleAdd = () => {
    setAddedItems((prev) => [...prev, ...selected]);
    setSelected([]);
  };

  const handleRemove = (id: number) => {
    setAddedItems((prev) => prev.filter((i) => i !== id));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>

      <DialogContent>

        <Typography fontSize={20} fontWeight={600} mb={2}>
          Manage Items
        </Typography>

        {/* SEARCH */}
        <Typography fontSize={14} mb={1}>
          Select Items
        </Typography>

        <TextField
          fullWidth
          placeholder="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1 }} />
          }}
          sx={{ mb: 2 }}
        />

        {/* SELECT TABLE */}
        <Box
          sx={{
            border: "1px solid #E5E7EB",
            borderRadius: "6px",
            mb: 2
          }}
        >

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              p: 1,
              background: "#F3F4F6",
              fontSize: 13,
              fontWeight: 600
            }}
          >
            <Typography>ITEM NAME</Typography>
            <Typography>SELECT</Typography>
          </Box>

          {filtered.slice(0, 5).map((item: any) => (
            <Box
              key={item.id}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                p: 1,
                borderTop: "1px solid #E5E7EB"
              }}
            >
              <Typography fontSize={14}>{item.name}</Typography>

              <Checkbox
                checked={selected.includes(item.id)}
                onChange={() => toggleItem(item.id)}
              />
            </Box>
          ))}
        </Box>

        {/* ACTION BUTTONS */}

        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
          <Button
            variant="contained"
            sx={{ background: "#F97316", textTransform: "none" }}
            onClick={handleAdd}
          >
            Add
          </Button>

          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>
        </Box>

        {/* REMOVE ITEMS */}

        <Typography fontWeight={600} mb={1}>
          Remove Items
        </Typography>

        <Box
          sx={{
            border: "1px solid #E5E7EB",
            borderRadius: "6px"
          }}
        >

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              p: 1,
              background: "#F3F4F6",
              fontSize: 13,
              fontWeight: 600
            }}
          >
            <Typography>ITEM NAME</Typography>
            <Typography>SELECT</Typography>
          </Box>

          {addedItems.map((id) => {
            const item = allItems.find((i: any) => i.id === id);

            return (
              <Box
                key={id}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  p: 1,
                  borderTop: "1px solid #E5E7EB"
                }}
              >
                <Typography fontSize={14}>{item?.name}</Typography>

                <IconButton
                  onClick={() => handleRemove(id)}
                  sx={{ color: "#EF4444" }}
                >
                  <DeleteOutlineOutlinedIcon />
                </IconButton>
              </Box>
            );
          })}
        </Box>

      </DialogContent>
    </Dialog>
  );
}