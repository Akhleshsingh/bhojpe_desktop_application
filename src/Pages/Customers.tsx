import { Box, Typography, Divider } from "@mui/material";
import { useCustomers } from "../context/CustomerContext";

export default function Customers() {
  const { customers, loading } = useCustomers();

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#F6F6F6" }}>
      <Box sx={{ p: 3 }}>
        <Typography sx={{ fontSize: 22, fontWeight: 700, mb: 2 }}>
          Customers
        </Typography>

        {loading && <Typography>Loading customers...</Typography>}

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {customers.map((customer) => (
            <Box
              key={customer.id}
              sx={{
                backgroundColor: "#fff",
                borderRadius: "10px",
                border: "1px solid #E6E6E6",
                p: 2,
                boxShadow: "0px 2px 6px rgba(0,0,0,0.06)",
              }}
            >
              {/* HEADER */}
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography sx={{ fontWeight: 600 }}>
                  {customer.name}
                </Typography>
                <Typography sx={{ fontSize: 13, color: "#9CAB84" }}>
                  Orders: {customer.orders_count}
                </Typography>
              </Box>

              <Divider sx={{ my: 1 }} />

              {/* DETAILS */}
              <Typography sx={{ fontSize: 13, color: "#555" }}>
                📞 {customer.phone ?? "—"}
              </Typography>

              <Typography sx={{ fontSize: 13, color: "#555" }}>
                ✉️ {customer.email ?? "—"}
              </Typography>

              <Typography sx={{ fontSize: 13, color: "#777", mt: 0.5 }}>
                📍 {customer.delivery_address || "No address"}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
