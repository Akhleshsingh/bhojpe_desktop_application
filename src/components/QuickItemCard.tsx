import { Box, Typography } from "@mui/material";

export default function QuickItemCard() {
  return (
    <Box
      sx={{
        width: "176.78px",
        height: "100.94px",
        backgroundColor: "#FFFFFF",
        borderRadius: "5px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        "&:hover": { backgroundColor: "#CC4B4B", color: "#fff" },
      }}
    >
      <Typography sx={{ fontWeight: 600, fontSize: "14px" }}>
        Quick Item Add
      </Typography>
    </Box>
  );
}
