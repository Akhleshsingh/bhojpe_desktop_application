import React from "react";
import { Button, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Footer: React.FC = () => {
  const navigate = useNavigate();
  const { branchData } = useAuth();

  const goToDashboard = () => {
    navigate("/dashboard");
  };

  return (
    <Box
      sx={{
        backgroundColor: "#C5D89D",
        borderTop: "1px solid #E0E0E0",
        height: "80px",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center", // ✅ CENTER buttons
        px: 2,
      }}
    >
      {/* BUTTON GROUP */}
      <Box
        sx={{
          display: "flex",
          gap: 1.5,
          flexWrap: "wrap",            // ✅ responsive
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Button
          variant="contained"
          sx={{
            bgcolor: "#F6F0D7",
            textTransform: "none",
            color: "#000",
            borderRadius: "5px",
            fontWeight: 700,
          }}
        >
          Save as Draft
        </Button>

        <Button
          variant="contained"
          sx={{
            textTransform: "none",
            color: "#000",
            borderRadius: "5px",
            fontWeight: 700,
          }}
        >
          KOT
        </Button>

        <Button
          variant="outlined"
          onClick={goToDashboard}
          sx={{
            textTransform: "none",
            bgcolor: "#F6F0D7",
            color: "#000",
            borderRadius: "5px",
            fontWeight: 700,
          }}
        >
          Table
        </Button>

        <Button
          variant="contained"
          sx={{
            bgcolor: "#F6F0D7",
            textTransform: "none",
            color: "#000",
            borderRadius: "5px",
            fontWeight: 700,
          }}
        >
          KOT & Print
        </Button>
      </Box>
    </Box>
  );
};

export default Footer;
