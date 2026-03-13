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
      background: "#FFFFFF",
      overflow: "hidden",
      cursor: "pointer",
      transition: "0.2s",
      "&:hover": {
        boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
        transform: "translateY(-2px)",
      },
    }}
    onClick={onAdd}
  >
    {/* IMAGE CONTAINER — flush left, right, top */}
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: 110,
        overflow: "hidden",
        backgroundColor: "#F9F9F9",
      }}
    >
      {/* Food type icon — top right */}
      <Box
        component="img"
        src={getFoodTypeIcon()}
        alt="food type"
        sx={{
          position: "absolute",
          top: 6,
          right: 6,
          width: 13,
          height: 13,
          zIndex: 1,
        }}
      />
      {item.image ? (
        <img
          src={item.image}
          alt={item.name}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      ) : (
        <Box sx={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Box component="img" src={getFoodTypeIcon()} alt="" sx={{ width: 40, height: 40, opacity: 0.3 }} />
        </Box>
      )}
    </Box>

    {/* NAME */}
    <Typography sx={{ fontWeight: 600, fontSize: "13px", textAlign: "center", mt: 0.5, px: 0.5, lineHeight: 1.3, fontFamily: "Poppins, sans-serif" }}>
      {item.name}
    </Typography>

    {/* PRICE */}
    <Typography sx={{ fontSize: "13px", fontWeight: 500, textAlign: "center", color: "#555", mb: 0.5, fontFamily: "Poppins, sans-serif" }}>
      ₹{item.price}
    </Typography>
  </Box>
);

}
