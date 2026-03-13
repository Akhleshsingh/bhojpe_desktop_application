import {
  Box,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Drawer,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";

import FileDownloadIcon from "@mui/icons-material/FileDownload";
import PaymentsIcon from "@mui/icons-material/Payments";
import QrCodeIcon from "@mui/icons-material/QrCode";
import ReplayIcon from "@mui/icons-material/Replay";
import CloseIcon from "@mui/icons-material/Close";

import { useState } from "react";

export default function Payments() {
  const [refundOpen, setRefundOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);

  const rows = [
    {
      id: 10,
      amount: "₹168.00",
      method: "Cash",
      order: "Order #118",
      time: "01:24 PM",
      ago: "7h ago",
    },
    {
      id: 9,
      amount: "₹199.00",
      method: "Cash",
      order: "Order #117",
      time: "01:21 PM",
      ago: "7h ago",
    },
  ];

  const openRefund = (row: any) => {
    setSelectedPayment(row);
    setRefundOpen(true);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* HEADER */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Typography fontSize={22} fontWeight={700}>
          Payments
        </Typography>

        <Button
          variant="outlined"
          startIcon={<FileDownloadIcon />}
          sx={{ textTransform: "none", fontWeight: 600 }}
        >
          Export
        </Button>
      </Box>

      {/* SEARCH */}
      <TextField
        fullWidth
        placeholder="Search payments by amount, method, TX ID"
        size="small"
        sx={{ mb: 2, background: "#fff", maxWidth: 420 }}
      />

      {/* TABLE */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ background: "#F6F7F9" }}>
              <TableCell>ID</TableCell>
              <TableCell>AMOUNT</TableCell>
              <TableCell>PAYMENT METHOD</TableCell>
              <TableCell>ORDER</TableCell>
              <TableCell align="right">DATE & TIME</TableCell>
              <TableCell align="right">ACTION</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.id}</TableCell>

                <TableCell sx={{ fontWeight: 600 }}>
                  {row.amount}
                </TableCell>

                <TableCell>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    {row.method === "UPI" ? (
                      <QrCodeIcon fontSize="small" />
                    ) : (
                      <PaymentsIcon fontSize="small" />
                    )}
                    {row.method}
                  </Box>
                </TableCell>

                <TableCell>{row.order}</TableCell>

                <TableCell align="right">
                  <Typography fontWeight={600}>
                    {row.time}
                  </Typography>
                  <Typography fontSize={11} color="text.secondary">
                    {row.ago}
                  </Typography>
                </TableCell>

                {/* REFUND BUTTON */}
                <TableCell align="right">
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<ReplayIcon />}
                    onClick={() => openRefund(row)}
                  >
                    Refund
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ⭐ RIGHT SLIDER REFUND PANEL */}
      <Drawer
        anchor="right"
        open={refundOpen}
        onClose={() => setRefundOpen(false)}
        PaperProps={{
          sx: { width: 520, p: 3 },
        }}
      >
        {/* HEADER */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <Typography fontWeight={700}>
            Process Refund
          </Typography>

          <CloseIcon
            sx={{ cursor: "pointer" }}
            onClick={() => setRefundOpen(false)}
          />
        </Box>

        {/* PAYMENT INFO */}
        <Box
          sx={{
            background: "#F6F7F9",
            p: 2,
            borderRadius: 2,
            mb: 2,
          }}
        >
          <Typography fontWeight={600}>
            Order: {selectedPayment?.order}
          </Typography>
          <Typography>
            Amount: {selectedPayment?.amount}
          </Typography>
          <Typography>
            Payment Method: {selectedPayment?.method}
          </Typography>
        </Box>

        {/* REFUND REASON */}
        <Typography fontWeight={600} mb={1}>
          Refund Reason
        </Typography>

        <TextField
          select
          fullWidth
          size="small"
          sx={{ mb: 2 }}
        >
          <MenuItem>Order Cancelled</MenuItem>
          <MenuItem>Payment Mistake</MenuItem>
        </TextField>

        {/* REFUND TYPE */}
        <Typography fontWeight={600} mb={1}>
          Refund Type
        </Typography>

        <RadioGroup defaultValue="full">
          <FormControlLabel
            value="full"
            control={<Radio />}
            label="Full Refund"
          />
          <FormControlLabel
            value="partial"
            control={<Radio />}
            label="Partial Refund"
          />
          <FormControlLabel
            value="waste"
            control={<Radio />}
            label="Waste / Write-Off Refund"
          />
        </RadioGroup>

        {/* AMOUNT */}
        <Typography fontWeight={600} mt={2} mb={1}>
          Refund Amount
        </Typography>

        <TextField
          fullWidth
          size="small"
          defaultValue={selectedPayment?.amount}
          disabled
        />

        {/* NOTES */}
        <Typography fontWeight={600} mt={2} mb={1}>
          Notes
        </Typography>

        <TextField
          fullWidth
          multiline
          rows={3}
        />

        {/* ACTIONS */}
        <Box
          sx={{
            display: "flex",
            gap: 2,
            mt: 3,
          }}
        >
          <Button
            variant="contained"
            sx={{ bgcolor: "#000" }}
            fullWidth
          >
            Process Refund
          </Button>

          <Button
            variant="outlined"
            fullWidth
            onClick={() => setRefundOpen(false)}
          >
            Cancel
          </Button>
        </Box>
      </Drawer>
    </Box>
  );
}
