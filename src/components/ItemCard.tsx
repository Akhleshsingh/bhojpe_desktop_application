import React from "react";
import { Box, Typography } from "@mui/material";
import vegicon from "../assets/14bd00ea-7be2-451d-9051-62d34474f227 2.png";
import nonvegicon from "../assets/pngegg 1.png";
import eggicon from "../assets/Group 68.png";
import { useTheme } from "@mui/material/styles";

interface Item {
  id: number;
  name: string;
  price: number;
  category?: string;
  veg?: boolean;
  image?: string;
  variations?: any[]; 
}


interface ItemCardProps {
  item: Item;
  onAdd: () => void;
}

export default function ItemCard({ item, onAdd }: ItemCardProps) {
  const theme = useTheme();

  const getFoodTypeIcon = () => {
    if (
      item.category?.toLowerCase().includes("egg") ||
      item.name?.toLowerCase().includes("omlet")
    ) {
      return eggicon;
    }

    if (item.veg === true) return vegicon;
    if (item.veg === false) return nonvegicon;

    return vegicon;
  };

 return (
  <Box
    sx={{
      height: 180,
      background: "#FFFFFF",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      overflow: "hidden",
      cursor: "pointer",
      border: "none",
      transition: "0.2s",
      dropshadow: "0px 1px 3px #00000040",  
      "&:hover": {
        boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
        transform: "translateY(-2px)",
      },
    }}
    onClick={onAdd}
  >
    {/* IMAGE CONTAINER */}
    <Box
      sx={{
        position: "relative",   // ⭐ REQUIRED for absolute icon
        height: 120,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* 🔥 FOOD TYPE ICON → TOP RIGHT */}
      <Box
        component="img"
        src={getFoodTypeIcon()}
        alt="food type"
        sx={{
          position: "absolute",
          top: 8,
          right: 8,
          width: 14,
          height: 14,
        }}
      />
    {item.image && (
  <img
    src={item.image}
    alt={item.name}
    style={{
      maxHeight: 80,
      width: "auto",        // ⭐ keeps rectangle
      objectFit: "contain",
    }}
    onError={(e) => {
      e.currentTarget.style.display = "none";
    }}
  />
)}

    </Box>

    {/* NAME */}
    <Typography sx={{ fontWeight: 600, fontSize: "15px",textAlign :'center', mt: 0.3 }}>
      {item.name}
    </Typography>

    {/* PRICE */}
    <Typography sx={{ fontSize: "15px",fontWeight: 500, textAlign :'center',color: "#555" }}>
      ₹{item.price}
    </Typography>
  </Box>
);

}
