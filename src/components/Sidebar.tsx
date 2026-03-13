import React, { useState } from "react";
import { Box, Typography, Popover } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
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
  onSelect: (cat: Category | null) => void;
  menus: Menu[];
  selectedMenuId: number | null;
  onMenuSelect: (menuId: number | null) => void;
};

const ROW_PY = 1.1;
const ROW_PX = 1.5;
const ACTIVE_BG = "#E8353A";
const HOVER_BG = "#4A4444";
const BASE_BG = "#3D3636";
const HEADER_BG = "#2C2828";

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

  const allItems: Array<{ id: number | null; label: string }> = [
    { id: null, label: "All" },
    ...categories.map((c) => ({ id: c.id, label: c.category_name.en })),
  ];

  return (
    <Box
      sx={{
        width: 120,
        flexShrink: 0,
        backgroundColor: BASE_BG,
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
        height: "100%",
        fontFamily: "Poppins, sans-serif",
        "&::-webkit-scrollbar": { width: 3 },
        "&::-webkit-scrollbar-thumb": { backgroundColor: "#555", borderRadius: 2 },
      }}
    >
      {/* ── Filter by menu header ── */}
      <Box
        onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={{
          px: ROW_PX,
          py: ROW_PY,
          backgroundColor: HEADER_BG,
          display: "flex",
          alignItems: "center",
          gap: 0.8,
          borderBottom: "1px solid #555",
          flexShrink: 0,
          cursor: "pointer",
          userSelect: "none",
          "&:hover": { backgroundColor: "#222" },
        }}
      >
        <MenuIcon sx={{ fontSize: 14, color: "#FFF", flexShrink: 0 }} />
        <Typography
          sx={{
            fontSize: 11,
            color: "#FFF",
            fontWeight: 600,
            fontFamily: "Poppins, sans-serif",
            flex: 1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {selectedMenuName}
        </Typography>
        <KeyboardArrowDownIcon
          sx={{
            fontSize: 15,
            color: "#FFF",
            flexShrink: 0,
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s",
          }}
        />
      </Box>

      {/* ── Menu dropdown popover ── */}
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        PaperProps={{
          sx: {
            minWidth: 170,
            borderRadius: "6px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
            py: 0.5,
          },
        }}
      >
        {[{ id: null, label: "All Menus" }, ...menus.map((m) => ({ id: m.id, label: m.menu_name.en }))].map((item) => {
          const isActive = selectedMenuId === item.id;
          return (
            <Box
              key={item.id ?? "all"}
              onClick={() => { onMenuSelect(item.id); setAnchorEl(null); }}
              sx={{
                px: 2, py: 0.9,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: isActive ? "#FEF2F2" : "transparent",
                "&:hover": { backgroundColor: "#F5F5F5" },
              }}
            >
              <Typography sx={{ fontSize: 13, fontFamily: "Poppins, sans-serif", fontWeight: isActive ? 600 : 400, color: isActive ? ACTIVE_BG : "#333" }}>
                {item.label}
              </Typography>
              {isActive && <CheckIcon sx={{ fontSize: 14, color: ACTIVE_BG }} />}
            </Box>
          );
        })}
      </Popover>

      {/* ── Category list with "All" at top ── */}
      {allItems.map((item) => {
        const isSelected = selectedCategoryId === item.id;
        return (
          <Box
            key={item.id ?? "all"}
            onClick={() => onSelect(item.id === null ? null : categories.find((c) => c.id === item.id)!)}
            sx={{
              px: ROW_PX,
              py: ROW_PY,
              cursor: "pointer",
              backgroundColor: isSelected ? ACTIVE_BG : "transparent",
              borderBottom: "1px solid #4A4444",
              transition: "background 0.15s",
              "&:hover": {
                backgroundColor: isSelected ? ACTIVE_BG : HOVER_BG,
              },
            }}
          >
            <Typography
              sx={{
                fontSize: 12,
                color: "#FFFFFF",
                fontWeight: isSelected ? 600 : 400,
                fontFamily: "Poppins, sans-serif",
                lineHeight: 1.35,
              }}
            >
              {item.label}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}
