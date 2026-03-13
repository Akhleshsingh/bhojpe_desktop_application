import React, { useCallback, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Chip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import DeliveryDiningIcon from "@mui/icons-material/DeliveryDining";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import { useDeliveryExecutives } from "../context/DeliveryExecutive";

export default function DeliveryExecutivesPage() {
  const { deliveryExecutives, loading } = useDeliveryExecutives();
  const [search, setSearch] = useState("");

  const filtered = deliveryExecutives.filter((exec) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      exec.name?.toLowerCase().includes(q) ||
      exec.phone?.includes(q) ||
      exec.email?.toLowerCase().includes(q)
    );
  });

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#F8FAFC", fontFamily: "Poppins, sans-serif" }}>

      {/* ── HEADER ── */}
      <Box
        sx={{
          position: "sticky", top: 0, zIndex: 10,
          backgroundColor: "#FFFFFF",
          borderBottom: "1px solid #E5E7EB",
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          px: 3, py: 1.4,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Typography sx={{ fontSize: 18, fontWeight: 700, color: "#111827", fontFamily: "Poppins, sans-serif" }}>
            Delivery Executives
          </Typography>
          <Box
            sx={{
              px: 1.5, py: 0.2, borderRadius: "20px",
              background: "linear-gradient(135deg,#E8353A,#FF6B6B)",
              boxShadow: "0 2px 8px rgba(232,53,58,.3)",
            }}
          >
            <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#FFF", fontFamily: "Poppins, sans-serif" }}>
              {deliveryExecutives.length}
            </Typography>
          </Box>
        </Box>

        <TextField
          size="small"
          placeholder="Search by name, phone or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 16, color: "#9CA3AF" }} />
              </InputAdornment>
            ),
          }}
          sx={{
            width: 280,
            "& .MuiOutlinedInput-root": {
              height: 36, fontSize: 13, fontFamily: "Poppins, sans-serif",
              borderRadius: "8px", backgroundColor: "#fff",
              "& fieldset": { borderColor: "#D1D5DB" },
              "&:hover fieldset": { borderColor: "#9CA3AF" },
            },
          }}
        />
      </Box>

      {/* ── CONTENT ── */}
      <Box sx={{ p: 2.5 }}>
        {loading && (
          <Typography sx={{ fontSize: 13, color: "#6B7280", fontFamily: "Poppins, sans-serif", mb: 2 }}>
            Loading delivery executives…
          </Typography>
        )}

        {!loading && filtered.length === 0 && (
          <Box
            sx={{
              display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", py: 10, gap: 2,
            }}
          >
            <Box
              sx={{
                width: 72, height: 72, borderRadius: "50%",
                background: "linear-gradient(135deg,#FEF2F2,#FEE2E2)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <DeliveryDiningIcon sx={{ fontSize: 36, color: "#E8353A" }} />
            </Box>
            <Typography sx={{ fontSize: 16, fontWeight: 600, color: "#374151", fontFamily: "Poppins, sans-serif" }}>
              No delivery executives found
            </Typography>
            <Typography sx={{ fontSize: 13, color: "#9CA3AF", fontFamily: "Poppins, sans-serif" }}>
              {search ? "Try a different search term" : "No executives have been added yet"}
            </Typography>
          </Box>
        )}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 2,
          }}
        >
          {filtered.map((exec) => {
            const isActive = exec.is_active === 1;

            return (
              <Box
                key={exec.id}
                sx={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: "14px",
                  border: "1px solid #E5E7EB",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                  overflow: "hidden",
                  transition: "box-shadow .2s, transform .2s",
                  "&:hover": { boxShadow: "0 8px 24px rgba(0,0,0,0.1)", transform: "translateY(-2px)" },
                }}
              >
                {/* Card header */}
                <Box
                  sx={{
                    background: "linear-gradient(135deg,#1F2937 0%,#374151 100%)",
                    px: 2, py: 1.5,
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                    <Box
                      sx={{
                        width: 36, height: 36, borderRadius: "50%",
                        background: "linear-gradient(135deg,rgba(232,53,58,.25),rgba(255,107,107,.2))",
                        border: "1px solid rgba(232,53,58,.4)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}
                    >
                      <DeliveryDiningIcon sx={{ fontSize: 18, color: "#FCA5A5" }} />
                    </Box>
                    <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#FFFFFF", fontFamily: "Poppins, sans-serif" }}>
                      {exec.name}
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <FiberManualRecordIcon sx={{ fontSize: 9, color: isActive ? "#4ADE80" : "#9CA3AF" }} />
                    <Typography sx={{ fontSize: 11, fontWeight: 600, color: isActive ? "#4ADE80" : "#9CA3AF", fontFamily: "Poppins, sans-serif" }}>
                      {isActive ? "Active" : "Inactive"}
                    </Typography>
                  </Box>
                </Box>

                {/* Contact info */}
                <Box sx={{ px: 2, py: 1.5, display: "flex", flexDirection: "column", gap: 0.8 }}>
                  {exec.phone && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <PhoneOutlinedIcon sx={{ fontSize: 15, color: "#9CA3AF" }} />
                      <Typography sx={{ fontSize: 13, color: "#374151", fontFamily: "Poppins, sans-serif" }}>
                        {exec.phone}
                      </Typography>
                    </Box>
                  )}
                  {exec.email && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <EmailOutlinedIcon sx={{ fontSize: 15, color: "#9CA3AF" }} />
                      <Typography sx={{ fontSize: 13, color: "#374151", fontFamily: "Poppins, sans-serif" }}>
                        {exec.email}
                      </Typography>
                    </Box>
                  )}
                  {!exec.phone && !exec.email && (
                    <Typography sx={{ fontSize: 12, color: "#D1D5DB", fontFamily: "Poppins, sans-serif", fontStyle: "italic" }}>
                      No contact details
                    </Typography>
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}
