import { Box, Typography } from "@mui/material";
import orders from "../assets/image 247.png"; 
import onlineOrders from "../assets/image 248.png";
import kots from "../assets/image 249.png";
import expenses from "../assets/image 250.png";
import staff from "../assets/image 251.png";
import reservations from "../assets/image 252.png";
import payments from "../assets/image 253.png";
import tables from "../assets/image 254.png";
import delivery from "../assets/image 255.png";
import currency from "../assets/image 257.png";
import printer from "../assets/image 261.png";
import taxes from "../assets/image 282.png";
import Header from "../CommonPages/header";
import SecondHeader from "../CommonPages/secondheader";
import { useState } from "react";
const items = [
  { title: "Orders", icon: orders },
  { title: "Online Orders", icon: onlineOrders },
  { title: "KOT’s", icon: kots },
  { title: "Expenses", icon: expenses },
  { title: "Staff", icon: staff },
  { title: "Reservations", icon: reservations },
  { title: "Payments", icon: payments },
  { title: "Tables", icon: tables },
  { title: "Delivery Executive", icon: delivery },
  { title: "Currency", icon: currency },
  { title: "Printer Setting", icon: printer },
  { title: "Taxes", icon: taxes },
];

export default function NewOrdersPage() {
   const [orderType, setOrderType] = useState("dinein");

  return (
    <Box sx={{   
    backgroundColor: "var(--bg)", width: "100%",
    minHeight: "100vh",
color: "var(--text)" }}>
      <Header/>
     <SecondHeader setOrderType={setOrderType} ordersCount={0} />
      {/* HEADING */}
      <Typography
        sx={{
          fontSize: "20px",
          fontWeight: 600,
          marginBottom: "25px",
          color: "#000",
        }}
      >
        Configuration
      </Typography>

      {/* BOX CONTAINER */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: "25px",
          justifyContent: "center",
          maxWidth: "1200px",
        }}
      >
        {items.map((item) => (
          <Box
            key={item.title}
            sx={{
              width: "180px",
              height: "120px",
              background: "#F3F3F3",
              borderRadius: "8px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "0.2s",
              "&:hover": {
                background: "#e6e6e6",
              },
            }}
          >
            <img src={item.icon} alt={item.title} width="35" />
            <Typography sx={{ fontSize: "14px", marginTop: "10px" }}>
              {item.title}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
