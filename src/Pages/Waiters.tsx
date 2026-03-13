import { Box, Typography, Grid, Divider, Button } from "@mui/material";
import { useWaiters } from "../context/WaitersContext";

export default function Waiters() {
  const { waiters, loading } = useWaiters();

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#F6F6F6" }}>
      <Box sx={{ p: 3 }}>
        {/* TITLE */}
        <Typography sx={{ fontSize: 20, fontWeight: 600, mb: 3 }}>
          Waiters ({waiters.length})
        </Typography>

        {loading && <Typography>Loading waiters...</Typography>}
        {!loading && waiters.length === 0 && (
          <Typography>No waiters found</Typography>
        )}

        <Grid container spacing={2}>
          {waiters.map((waiter: any) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={waiter.id}>
              <Box
                sx={{
                  height: 220,
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
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: "6px",
                        backgroundColor: "#F6F6F6",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                      }}
                    >
                      {waiter.name?.charAt(0).toUpperCase()}
                    </Box>

                    <Typography sx={{ fontWeight: 600, fontSize: 14 }}>
                      {waiter.name}
                    </Typography>
                  </Box>

                  {/* STATUS BADGE */}
                  <Box
                    sx={{
                      px: 1.2,
                      py: 0.3,
                      fontSize: 11,
                      borderRadius: "4px",
                      backgroundColor: waiter.is_active
                        ? "#E6F4EA"
                        : "#FDECEC",
                      color: waiter.is_active ? "#1E8E3E" : "#BA3131",
                      fontWeight: 600,
                    }}
                  >
                    {waiter.is_active ? "Active" : "Inactive"}
                  </Box>
                </Box>

                <Typography sx={{ fontSize: 12, color: "#666", mt: 0.5 }}>
                  ID • {waiter.id}
                </Typography>

                <Divider />

                {/* DETAILS */}
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontSize: 13 }}>
                    📞 {waiter.phone_number || "N/A"}
                  </Typography>
                  <Typography sx={{ fontSize: 13 }}>
                    ✉️ {waiter.email || "N/A"}
                  </Typography>
                </Box>

                <Divider />

                {/* FOOTER */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                  }}
                >
                  <Button size="small" sx={{ textTransform: "none" }}>
                    View
                  </Button>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
}

