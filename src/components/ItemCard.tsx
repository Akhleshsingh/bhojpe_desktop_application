import React from "react";
import { Box, Typography } from "@mui/material";

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
    {/* IMAGE — flush left, right, top */}
    <Box
      sx={{
        width: "100%",
        height: 100,
        overflow: "hidden",
        backgroundColor: "#F5F5F5",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {item.image ? (
        <img
          src={item.image}
          alt={item.name}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={(e) => { e.currentTarget.style.display = "none"; }}
        />
      ) : (
        <Typography sx={{ fontSize: 28, color: "#CCC" }}>🍽️</Typography>
      )}
    </Box>

    {/* NAME */}
    <Typography
      sx={{
        fontWeight: 600,
        fontSize: "12px",
        textAlign: "center",
        mt: 0.5,
        px: 0.5,
        lineHeight: 1.3,
        fontFamily: "Poppins, sans-serif",
        display: "-webkit-box",
        WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical",
        overflow: "hidden",
      }}
    >
      {item.name}
    </Typography>

    {/* PRICE */}
    <Typography
      sx={{
        fontSize: "12px",
        fontWeight: 500,
        textAlign: "center",
        color: "#555",
        mb: 0.5,
        fontFamily: "Poppins, sans-serif",
      }}
    >
      ₹{item.price}
    </Typography>
  </Box>
);

}
