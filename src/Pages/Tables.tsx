import { Box, Typography, Grid, Divider } from "@mui/material";
import Header from "../CommonPages/header";
import SecondHeader from "../CommonPages/secondheader";
import { useTables } from "../context/TablesContext";

export default function Tables() {
  const { tables, loading } = useTables();

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f5f0ea" }}>

      <Box sx={{ p: 3 }}>
        <Typography sx={{ fontSize: 22, fontWeight: 700, mb: 3 }}>
          Tables
        </Typography>

        {loading && <Typography>Loading tables...</Typography>}
        {!loading && tables.length === 0 && (
          <Typography>No tables found</Typography>
        )}

        <Grid container spacing={2}>
          {tables.map((table: any) => (
            <Box  key={table.id}>
              <Box
                sx={{
                  height: 160,
                  borderRadius: "10px",
                  backgroundColor: "#fff",
                  p: 2,
                  boxShadow: "0px 4px 12px rgba(0,0,0,0.08)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                {/* HEADER */}
                <Box>
                  <Typography sx={{ fontWeight: 700 }}>
                    Table {table.table_number}
                  </Typography>
                  <Typography sx={{ fontSize: 13, color: "#666" }}>
                    Area: {table.area_name || "N/A"}
                  </Typography>
                </Box>

                <Divider />

                {/* STATUS */}
                <Box>
                  <Typography sx={{ fontSize: 14 }}>
                    Pax: {table.number_of_pax || "-"}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: table.is_occupied ? "#F44336" : "#4CAF50",
                    }}
                  >
                    {table.is_occupied ? "Occupied" : "Available"}
                  </Typography>
                </Box>
              </Box>
            </Box>
          ))}
        </Grid>
      </Box>
    </Box>
  );
}
