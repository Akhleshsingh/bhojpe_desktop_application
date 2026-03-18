import React, { useState } from "react";
import { Box, Typography, Popover } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import CheckIcon from "@mui/icons-material/Check";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";

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
  collapsed?: boolean;
  onToggleCollapse?: () => void;
};

const ROW_PY = 1.1;
const ROW_PX = 1.5;
const ACTIVE_BG = "#FF3D01";
const HOVER_BG = "#4A4444";
const BASE_BG = "#3D3636";
const HEADER_BG = "#2C2828";
const COLLAPSED_W = 42;
const EXPANDED_W = "clamp(155px, 11vw, 185px)";

export default function Sidebar({
  categories = [],
  selectedCategoryId,
  onSelect,
  menus = [],
  selectedMenuId,
  onMenuSelect,
  collapsed = false,
  onToggleCollapse,
}: Props) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const selectedMenuName =
    menus.find((m) => m.id === selectedMenuId)?.menu_name.en ?? "Filter by menu";

  const allItems: Array<{ id: number | null; label: string }> = [
    { id: null, label: "All" },
    ...categories.map((c) => ({ id: c.id, label: c.category_name.en })),
  ];

  if (collapsed) {
    return (
      <Box
        sx={{
          width: COLLAPSED_W,
          flexShrink: 0,
          backgroundColor: BASE_BG,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          height: "100%",
          transition: "width 0.2s ease",
        }}
      >
        <Box
          onClick={onToggleCollapse}
          sx={{
            width: "100%",
            py: 1.2,
            backgroundColor: HEADER_BG,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            borderBottom: "1px solid #555",
            "&:hover": { backgroundColor: "#222" },
          }}
        >
          <MenuIcon sx={{ fontSize: 18, color: "#FFF" }} />
        </Box>

        {allItems.map((item) => {
          const isSelected = selectedCategoryId === item.id;
          return (
            <Box
              key={item.id ?? "all"}
              onClick={() =>
                onSelect(
                  item.id === null
                    ? null
                    : categories.find((c) => c.id === item.id)!
                )
              }
              title={item.label}
              sx={{
                width: "100%",
                py: 1,
                display: "flex",
                justifyContent: "center",
                cursor: "pointer",
                backgroundColor: isSelected ? ACTIVE_BG : "transparent",
                borderBottom: "1px solid #4A4444",
                "&:hover": { backgroundColor: isSelected ? ACTIVE_BG : HOVER_BG },
              }}
            >
              <Typography
                sx={{
                  fontSize: 9,
                  color: "#FFF",
                  fontWeight: isSelected ? 700 : 400,
                  fontFamily: "'Montserrat', sans-serif",
                  textAlign: "center",
                  px: 0.5,
                  lineHeight: 1.2,
                  overflow: "hidden",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
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

  return (
    <Box
      sx={{
        width: EXPANDED_W,
        flexShrink: 0,
        backgroundColor: BASE_BG,
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
        height: "100%",
        fontFamily: "'Montserrat', sans-serif",
        transition: "width 0.2s ease",
        "&::-webkit-scrollbar": { width: 3 },
        "&::-webkit-scrollbar-thumb": { backgroundColor: "#555", borderRadius: 2 },
      }}
    >
      {/* ── Filter by menu header ── */}
      <Box
        sx={{
          px: ROW_PX,
          py: ROW_PY,
          backgroundColor: HEADER_BG,
          display: "flex",
          alignItems: "center",
          gap: 0.5,
          borderBottom: "1px solid #555",
          flexShrink: 0,
        }}
      >
        {/* Collapse toggle */}
        <Box
          onClick={onToggleCollapse}
          sx={{
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            color: "#FFF",
            flexShrink: 0,
            "&:hover": { color: "#DDD" },
          }}
        >
          <ChevronLeftIcon sx={{ fontSize: 16 }} />
        </Box>

        {/* Filter by menu trigger */}
        <Box
          onClick={(e) => setAnchorEl(e.currentTarget)}
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            cursor: "pointer",
            userSelect: "none",
            overflow: "hidden",
            "&:hover": { opacity: 0.8 },
          }}
        >
          <MenuIcon sx={{ fontSize: 13, color: "#FFF", flexShrink: 0 }} />
          <Typography
            sx={{
              fontSize: 11,
              color: "#FFF",
              fontWeight: 600,
              fontFamily: "'Montserrat', sans-serif",
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
              fontSize: 14,
              color: "#FFF",
              flexShrink: 0,
              transform: open ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s",
            }}
          />
        </Box>
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
        {[
          { id: null, label: "All Menus" },
          ...menus.map((m) => ({ id: m.id, label: m.menu_name.en })),
        ].map((item) => {
          const isActive = selectedMenuId === item.id;
          return (
            <Box
              key={item.id ?? "all"}
              onClick={() => {
                onMenuSelect(item.id);
                setAnchorEl(null);
              }}
              sx={{
                px: 2,
                py: 0.9,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: isActive ? "#FEF2F2" : "transparent",
                "&:hover": { backgroundColor: "#F5F5F5" },
              }}
            >
              <Typography
                sx={{
                  fontSize: 13,
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? ACTIVE_BG : "#333",
                }}
              >
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
            onClick={() =>
              onSelect(
                item.id === null
                  ? null
                  : categories.find((c) => c.id === item.id)!
              )
            }
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
                fontFamily: "'Montserrat', sans-serif",
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
