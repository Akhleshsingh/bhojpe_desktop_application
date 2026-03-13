import React from "react";
import { Box, Typography, Chip } from "@mui/material";
import NotificationsOffOutlinedIcon from "@mui/icons-material/NotificationsOffOutlined";
import { useAuth } from "../context/AuthContext";

type Area = {
  id: number;
  name: string;
  tablesCount: number;
};



export default function WaiterRequests() {

const { branchData } = useAuth();

const areas = branchData?.data?.area ?? [];



  return (
    <Box
      sx={{
        padding: "24px",
        backgroundColor: "#F8F9FB",
        minHeight: "100vh",
      }}
    >
      {/* PAGE TITLE */}
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontSize: 22, fontWeight: 700 }}>
          Waiter Requests (0)
        </Typography>
      </Box>

     {areas.map((area: any) => {
  const tablesCount = area.tables?.length ?? 0;

  return (
    <Box key={area.id} sx={{ mb: 4 }}>
      {/* AREA HEADER */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          mb: 1.5,
        }}
      >
        <Typography sx={{ fontSize: 16, fontWeight: 600 }}>
          {area.area_name}
        </Typography>

        <Chip
          label={`${tablesCount} Table`}
          size="small"
          sx={{
            backgroundColor: "#EEF2F7",
            fontWeight: 600,
          }}
        />
      </Box>

      {/* EMPTY STATE (for now) */}
      <Box
        sx={{
          backgroundColor: "#FFFFFF",
          borderRadius: "8px",
          border: "1px solid #E5E7EB",
          height: 140,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 1,
        }}
      >
        <NotificationsOffOutlinedIcon
          sx={{ fontSize: 34, color: "#9CA3AF" }}
        />

        <Typography
          sx={{
            fontSize: 14,
            color: "#6B7280",
            fontWeight: 500,
          }}
        >
          No waiter request found in this area.
        </Typography>
      </Box>
    </Box>
  );
})}

    </Box>
  );
}
