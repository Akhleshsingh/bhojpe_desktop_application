import React from "react";
import { Box, Typography } from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

type Category = {
  id: number;
  category_name: { en: string };
};

type Props = {
  categories: Category[];
  selectedCategoryId: number | null;
  onSelect: (cat: Category) => void;
};

export default function Sidebar({ categories, selectedCategoryId, onSelect }: Props) {
  return (
    <Box
      sx={{
        width: 120,
        flexShrink: 0,
        backgroundColor: "#3D3636",
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
        height: "100%",
        fontFamily: "Poppins, sans-serif",
      }}
    >
      {/* Filter by menu header */}
      <Box
        sx={{
          px: 1.5,
          py: 1.2,
          backgroundColor: "#2C2828",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #555",
          flexShrink: 0,
          cursor: "pointer",
        }}
      >
        <Typography sx={{ fontSize: 11, color: "#FFF", fontWeight: 600, fontFamily: "Poppins, sans-serif" }}>
          Filter by menu
        </Typography>
        <KeyboardArrowDownIcon sx={{ fontSize: 16, color: "#FFF" }} />
      </Box>

      {/* Category list */}
      {categories.map((cat) => {
        const isSelected = selectedCategoryId === cat.id;
        return (
          <Box
            key={cat.id}
            onClick={() => onSelect(cat)}
            sx={{
              px: 1.5,
              py: 1.2,
              cursor: "pointer",
              backgroundColor: isSelected ? "#E8883A" : "transparent",
              borderBottom: "1px solid #4A4444",
              transition: "background 0.15s",
              "&:hover": {
                backgroundColor: isSelected ? "#E8883A" : "#4A4444",
              },
            }}
          >
            <Typography
              sx={{
                fontSize: 12,
                color: "#FFFFFF",
                fontWeight: isSelected ? 600 : 400,
                fontFamily: "Poppins, sans-serif",
                lineHeight: 1.3,
              }}
            >
              {cat.category_name.en}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}
