import React, { useState, useRef } from "react";
import { Box, Typography, Popover } from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import CheckIcon from "@mui/icons-material/Check";

type Category = {
  id: number;
  category_name: { en: string };
};

type Menu = {
  id: number;
  menu_name: { en: string };
};

type Props = {
  categories: Category[];
  selectedCategoryId: number | null;
  onSelect: (cat: Category) => void;
  menus: Menu[];
  selectedMenuId: number | null;
  onMenuSelect: (menuId: number | null) => void;
};

export default function Sidebar({
  categories,
  selectedCategoryId,
  onSelect,
  menus,
  selectedMenuId,
  onMenuSelect,
}: Props) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const selectedMenuName =
    menus.find((m) => m.id === selectedMenuId)?.menu_name.en ?? "Filter by menu";

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
        onClick={(e) => setAnchorEl(e.currentTarget)}
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
          userSelect: "none",
          "&:hover": { backgroundColor: "#222" },
        }}
      >
        <Typography
          sx={{
            fontSize: 11,
            color: "#FFF",
            fontWeight: 600,
            fontFamily: "Poppins, sans-serif",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            flex: 1,
            mr: 0.5,
          }}
        >
          {selectedMenuName}
        </Typography>
        <KeyboardArrowDownIcon
          sx={{
            fontSize: 16,
            color: "#FFF",
            flexShrink: 0,
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s",
          }}
        />
      </Box>

      {/* Menu dropdown popover */}
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        PaperProps={{
          sx: {
            minWidth: 160,
            borderRadius: "6px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
            py: 0.5,
          },
        }}
      >
        {/* All menus option */}
        <Box
          onClick={() => { onMenuSelect(null); setAnchorEl(null); }}
          sx={{
            px: 2, py: 1,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: selectedMenuId === null ? "#F5F5F5" : "transparent",
            "&:hover": { backgroundColor: "#F0F0F0" },
          }}
        >
          <Typography sx={{ fontSize: 13, fontFamily: "Poppins, sans-serif", fontWeight: selectedMenuId === null ? 600 : 400 }}>
            All Menus
          </Typography>
          {selectedMenuId === null && <CheckIcon sx={{ fontSize: 14, color: "#E8353A" }} />}
        </Box>

        {menus.map((menu) => (
          <Box
            key={menu.id}
            onClick={() => { onMenuSelect(menu.id); setAnchorEl(null); }}
            sx={{
              px: 2, py: 1,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: selectedMenuId === menu.id ? "#F5F5F5" : "transparent",
              "&:hover": { backgroundColor: "#F0F0F0" },
            }}
          >
            <Typography sx={{ fontSize: 13, fontFamily: "Poppins, sans-serif", fontWeight: selectedMenuId === menu.id ? 600 : 400 }}>
              {menu.menu_name.en}
            </Typography>
            {selectedMenuId === menu.id && <CheckIcon sx={{ fontSize: 14, color: "#E8353A" }} />}
          </Box>
        ))}
      </Popover>

      {/* Category list */}
      {categories.map((cat) => {
        const isSelected = selectedCategoryId === cat.id;
        return (
          <Box
            key={cat.id}
            onClick={() => onSelect(cat)}
            sx={{
              px: 1.5,
              py: 1.1,
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
