import {
  Box,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
} from "@mui/material";

export default function DuePayments() {
  const rows = [
    {
      amount: "₹112.85",
      method: "Due",
      order: "Order #69",
      datetime: "03/02/2026 12:50 PM",
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* HEADER */}
      <Typography fontSize={22} fontWeight={700} mb={2}>
        Due Payments (₹112.85)
      </Typography>

      {/* SEARCH */}
      <TextField
        placeholder="Search payments by amount or order #"
        size="small"
        sx={{ mb: 2, maxWidth: 420, background: "#fff" }}
      />

      {/* TABLE */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ background: "#F6F7F9" }}>
              <TableCell>AMOUNT</TableCell>
              <TableCell>PAYMENT METHOD</TableCell>
              <TableCell>ORDER</TableCell>
              <TableCell>DATE & TIME</TableCell>
              <TableCell align="right">ACTION</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.map((row, i) => (
              <TableRow key={i}>
                <TableCell sx={{ fontWeight: 600 }}>
                  {row.amount}
                </TableCell>

                <TableCell>{row.method}</TableCell>

                <TableCell
                  sx={{
                    textDecoration: "underline",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  {row.order}
                </TableCell>

                <TableCell>{row.datetime}</TableCell>

                {/* ADD PAYMENT BUTTON */}
                <TableCell align="right">
                  <Button
                    variant="outlined"
                    size="small"
                  >
                    + Add Payment
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
