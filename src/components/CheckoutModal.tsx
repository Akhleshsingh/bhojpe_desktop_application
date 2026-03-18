import { BASE_URL } from "../utils/api";
import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Typography,
  Modal,
  TextField,
  MenuItem,
} from "@mui/material";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import CreditCardOutlinedIcon from "@mui/icons-material/CreditCardOutlined";
import QrCodeIcon from "@mui/icons-material/QrCode";
import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import BackspaceOutlinedIcon from "@mui/icons-material/BackspaceOutlined";
import ReceiptOutlinedIcon from "@mui/icons-material/ReceiptOutlined";

type PaymentMode = "cash" | "card" | "upi" | "bank" | "due";

interface Props {
  open: boolean;
  onClose: () => void;
  orderNumber: number;
  totalAmount: number;
  cart: any[];
  orderId: number;
  onPaymentSuccess?: (paymentData: any) => void;
}

type Split = {
  id: number;
  amount: number;
  paymentMode: PaymentMode;
  items: any[];
};

const PAYMENT_METHODS = [
  { key: "cash",  label: "Cash",          icon: <PaymentsOutlinedIcon sx={{ fontSize: 22 }} /> },
  { key: "card",  label: "Card",          icon: <CreditCardOutlinedIcon sx={{ fontSize: 22 }} /> },
  { key: "upi",   label: "UPI",           icon: <QrCodeIcon sx={{ fontSize: 22 }} /> },
  { key: "bank",  label: "Bank Transfer", icon: <AccountBalanceOutlinedIcon sx={{ fontSize: 22 }} /> },
  { key: "due",   label: "Due",           icon: <AccessTimeOutlinedIcon sx={{ fontSize: 22 }} /> },
];

const QUICK_AMOUNTS = [50, 100, 500, 1000];
const KEYPAD_KEYS = [1, 2, 3, 4, 5, 6, 7, 8, 9, ".", 0, "back"] as const;

const FONT = "'Montserrat', sans-serif";

const SummaryRow = ({
  label, value, red, bold,
}: { label: string; value: number; red?: boolean; bold?: boolean }) => (
  <Box sx={{ display: "flex", justifyContent: "space-between", py: 0.5 }}>
    <Typography sx={{ fontSize: 14, fontWeight: red || bold ? 600 : 400, color: red ? "#FF3D01" : "#111827", fontFamily: FONT }}>
      {label}
    </Typography>
    <Typography sx={{ fontSize: 14, fontWeight: red || bold ? 700 : 500, color: red ? "#FF3D01" : "#111827", fontFamily: FONT }}>
      ₹{Number(value).toFixed(2)}
    </Typography>
  </Box>
);

export default function CheckoutModal({
  open, onClose, orderNumber, totalAmount, cart, orderId, onPaymentSuccess,
}: Props) {
  const [mode, setMode]               = useState<"full" | "split">("full");
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("cash");
  const [amount, setAmount]           = useState<number>(totalAmount);
  const [tip, setTip]                 = useState<number>(0);
  const [activeSplitId, setActiveSplitId] = useState<number>(1);
  const [splitView, setSplitView]     = useState<"options" | "equal" | "custom" | "items">("options");

  const payableAmount = useMemo(() => Number((totalAmount + tip).toFixed(2)), [totalAmount, tip]);

  const [splits, setSplits] = useState<Split[]>([
    { id: 1, amount: payableAmount, paymentMode: "cash", items: [] },
  ]);

  const activeSplit   = splits.find(s => s.id === activeSplitId)!;
  const splitTotal    = splits.reduce((s, x) => s + x.amount, 0);
  const remainingAmount = payableAmount - splitTotal;
  const dueAmount     = useMemo(() => Math.max(payableAmount - amount, 0), [payableAmount, amount]);
  const paidExtra     = useMemo(() => Math.max(amount - payableAmount, 0), [payableAmount, amount]);

  useEffect(() => { setAmount(totalAmount); }, [totalAmount]);
  useEffect(() => {
    setSplits([{ id: 1, amount: totalAmount, paymentMode: "cash", items: [] }]);
    setActiveSplitId(1);
    setMode("full");
    setTip(0);
    setPaymentMode("cash");
  }, [orderId]);

  const handleKeypad = (val: string | number) => {
    if (val === "back") { setAmount(p => Number(String(p).slice(0, -1) || 0)); return; }
    setAmount(p => Number(`${p === 0 ? "" : p}${val}`));
  };

  const updateSplitAmount = (id: number, value: number) => {
    setSplits(prev => prev.map(s =>
      s.id === id ? { ...s, amount: value } : { ...s, amount: Math.max(payableAmount - value, 0) }
    ));
  };

  const addItemToSplit = (item: any, qty: number) => {
    setSplits(prev => prev.map(s =>
      s.id === activeSplitId
        ? { ...s, items: [...s.items, { ...item, qty }], amount: s.amount + item.price * qty }
        : s
    ));
  };

  const handleCompletePayment = async () => {
    const token = localStorage.getItem("token");
    if (!token || !orderId) return;
    const receivedAmount = mode === "full" ? amount : splitTotal;
    try {
      const res = await fetch(`${BASE_URL}/update-order-payment`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          order_id: orderId,
          received_amount: receivedAmount,
          payment_method: mode === "full" ? paymentMode : "split",
          razorpay_payment_id: "",
          razorpay_order_id: "",
          razorpay_signature: "",
        }),
      });
      const data = await res.json();
      if (!data.status) { alert(data.message || "Payment failed"); return; }
      onPaymentSuccess?.({ ...data.data, received_amount: receivedAmount, payment_method: mode === "full" ? paymentMode : "split" });
    } catch (err) {
      console.error("Payment error", err);
      alert("Payment API failed");
    }
  };

  const canPay = mode === "full"
    ? (amount >= payableAmount || paymentMode === "due")
    : splitTotal >= payableAmount;

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{
        width: 860,
        background: "#FFFFFF",
        borderRadius: "16px",
        mx: "auto",
        mt: "4vh",
        boxShadow: "0 24px 80px rgba(0,0,0,0.22)",
        overflow: "hidden",
        fontFamily: FONT,
        outline: "none",
      }}>

        {/* ── HEADER ── */}
        <Box sx={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          px: 3, py: 2.2,
          borderBottom: "1px solid #F3F4F6",
          backgroundColor: "#FFFFFF",
        }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
            <Box sx={{
              width: 36, height: 36, borderRadius: "8px",
              backgroundColor: "#FEF2F2", border: "1px solid #FECACA",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <ReceiptOutlinedIcon sx={{ fontSize: 18, color: "#FF3D01" }} />
            </Box>
            <Typography sx={{ fontSize: 18, fontWeight: 700, color: "#111827", fontFamily: FONT }}>
              Payment
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Typography sx={{ fontSize: 14, fontWeight: 500, color: "#6B7280", fontFamily: FONT }}>
              Order #{orderNumber}
            </Typography>
            <Typography sx={{ fontSize: 18, fontWeight: 800, color: "#FF3D01", fontFamily: FONT }}>
              ₹{totalAmount.toFixed(2)}
            </Typography>
          </Box>
        </Box>

        {/* ── BODY ── */}
        <Box sx={{ display: "flex", height: 540 }}>

          {/* LEFT PANEL */}
          <Box sx={{ flex: 1, borderRight: "1px solid #F3F4F6", px: 3, py: 2.5, display: "flex", flexDirection: "column", gap: 2, overflowY: "auto" }}>

            {/* Mode toggle */}
            <Box sx={{ display: "flex", border: "1px solid #E5E7EB", borderRadius: "10px", overflow: "hidden", height: 42 }}>
              {[{ v: "full", l: "Full Payment" }, { v: "split", l: "Split Bill" }].map(({ v, l }) => (
                <Box
                  key={v}
                  onClick={() => { setMode(v as any); if (v === "split") setSplitView("options"); }}
                  sx={{
                    flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", fontFamily: FONT, fontSize: 13, fontWeight: 700,
                    backgroundColor: mode === v ? "#FF3D01" : "#FFFFFF",
                    color: mode === v ? "#FFFFFF" : "#6B7280",
                    transition: "all .15s",
                    "&:hover": { backgroundColor: mode === v ? "#c62a2f" : "#F9FAFB" },
                  }}
                >
                  {l}
                </Box>
              ))}
            </Box>

            {mode === "full" && (<>
              {/* Payment methods */}
              <Box sx={{ display: "flex", gap: 1.2, flexWrap: "wrap" }}>
                {PAYMENT_METHODS.map(({ key, label, icon }) => {
                  const active = paymentMode === key;
                  return (
                    <Box
                      key={key}
                      onClick={() => setPaymentMode(key as PaymentMode)}
                      sx={{
                        width: 88, minHeight: 80,
                        borderRadius: "10px",
                        border: active ? "2px dashed #FF3D01" : "1.5px solid #E5E7EB",
                        backgroundColor: active ? "#FEF2F2" : "#FAFAFA",
                        display: "flex", flexDirection: "column",
                        alignItems: "center", justifyContent: "center", gap: 0.7,
                        cursor: "pointer", transition: "all .15s",
                        color: active ? "#FF3D01" : "#6B7280",
                        "&:hover": { borderColor: "#FF3D01", backgroundColor: "#FEF2F2", color: "#FF3D01" },
                      }}
                    >
                      {icon}
                      <Typography sx={{ fontSize: 11, fontWeight: 600, fontFamily: FONT, textAlign: "center", lineHeight: 1.2 }}>
                        {label}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>

              {/* Add Tip */}
              <Box
                onClick={() => setTip(t => t + 10)}
                sx={{
                  width: 88, minHeight: 80,
                  borderRadius: "10px",
                  border: "1.5px dashed #D1D5DB",
                  backgroundColor: "#FAFAFA",
                  display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 0.7,
                  cursor: "pointer", color: "#9CA3AF",
                  "&:hover": { borderColor: "#6B7280", color: "#374151" },
                }}
              >
                <AttachMoneyIcon sx={{ fontSize: 22 }} />
                <Typography sx={{ fontSize: 11, fontWeight: 600, fontFamily: FONT }}>
                  {tip > 0 ? `+₹${tip}` : "Add Tip"}
                </Typography>
              </Box>

              {/* Amount field */}
              <Box>
                <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#9CA3AF", fontFamily: FONT, mb: 0.6, textTransform: "uppercase", letterSpacing: 0.5 }}>
                  Amount
                </Typography>
                <Box sx={{
                  border: "1.5px solid #E5E7EB", borderRadius: "10px",
                  px: 2, py: 1.5, backgroundColor: "#FAFAFA",
                }}>
                  <Typography sx={{ fontSize: 26, fontWeight: 700, color: "#111827", fontFamily: FONT }}>
                    {amount}
                  </Typography>
                </Box>
              </Box>

              {/* Summary */}
              <Box sx={{
                borderTop: "1px solid #F3F4F6",
                pt: 1.5, mt: "auto",
                display: "flex", flexDirection: "column", gap: 0.2,
              }}>
                <SummaryRow label="Total" value={totalAmount} />
                <SummaryRow label="Payable Amount" value={payableAmount} red />
                <SummaryRow label="Due Amount" value={dueAmount} red />
                {paidExtra > 0 && <SummaryRow label="Change" value={paidExtra} />}
              </Box>
            </>)}

            {/* SPLIT: options */}
            {mode === "split" && splitView === "options" && (
              <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 1.5 }}>
                {[
                  { k: "equal", l: "Equal Split", s: "Divide equally" },
                  { k: "custom", l: "Custom Split", s: "Split by amount" },
                  { k: "items", l: "Split by Items", s: "Split by dishes" },
                ].map(({ k, l, s }) => (
                  <Box key={k} onClick={() => setSplitView(k as any)}
                    sx={{
                      border: "1.5px solid #E5E7EB", borderRadius: "10px", p: 2,
                      cursor: "pointer", transition: "all .15s",
                      "&:hover": { borderColor: "#FF3D01", boxShadow: "0 4px 12px rgba(232,53,58,.1)" },
                    }}>
                    <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#111827", fontFamily: FONT }}>{l}</Typography>
                    <Typography sx={{ fontSize: 12, color: "#9CA3AF", fontFamily: FONT, mt: 0.3 }}>{s}</Typography>
                  </Box>
                ))}
              </Box>
            )}

            {/* SPLIT: equal */}
            {mode === "split" && splitView === "equal" && (
              <Box>
                <Typography sx={{ fontSize: 13, color: "#2563EB", cursor: "pointer", fontFamily: FONT, mb: 2 }}
                  onClick={() => setSplitView("options")}>← Change Method</Typography>
                <Box sx={{ display: "flex", gap: 2 }}>
                  {[1, 2].map(s => (
                    <Box key={s} sx={{ flex: 1, border: "1.5px solid #E5E7EB", borderRadius: "10px", p: 2 }}>
                      <Typography sx={{ fontSize: 14, fontWeight: 600, fontFamily: FONT, mb: 1 }}>Split {s}</Typography>
                      <TextField fullWidth size="small" value={(payableAmount / 2).toFixed(2)} disabled
                        sx={{ mb: 1, "& .MuiOutlinedInput-root": { borderRadius: "8px", fontFamily: FONT } }} />
                      <TextField select fullWidth size="small" defaultValue="cash"
                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px", fontFamily: FONT } }}>
                        <MenuItem value="cash">Cash</MenuItem>
                        <MenuItem value="upi">UPI</MenuItem>
                        <MenuItem value="card">Card</MenuItem>
                      </TextField>
                    </Box>
                  ))}
                </Box>
                <Box sx={{ mt: 2 }}>
                  <SummaryRow label="Total" value={payableAmount} bold />
                  <SummaryRow label="Per Split" value={payableAmount / 2} red />
                </Box>
              </Box>
            )}

            {/* SPLIT: custom */}
            {mode === "split" && splitView === "custom" && (
              <Box>
                <Typography sx={{ fontSize: 13, color: "#2563EB", cursor: "pointer", fontFamily: FONT, mb: 2 }}
                  onClick={() => setSplitView("options")}>← Change Method</Typography>
                <Box sx={{ display: "flex", gap: 2 }}>
                  {splits.map(s => (
                    <Box key={s.id} onClick={() => setActiveSplitId(s.id)}
                      sx={{
                        flex: 1, border: activeSplitId === s.id ? "2px solid #FF3D01" : "1.5px solid #E5E7EB",
                        borderRadius: "10px", p: 2, cursor: "pointer",
                      }}>
                      <Typography sx={{ fontSize: 14, fontWeight: 600, fontFamily: FONT, mb: 1 }}>Split {s.id}</Typography>
                      <TextField fullWidth size="small" type="number" value={s.amount}
                        onChange={e => updateSplitAmount(s.id, Number(e.target.value))}
                        sx={{ mb: 1, "& .MuiOutlinedInput-root": { borderRadius: "8px", fontFamily: FONT } }} />
                      <TextField select fullWidth size="small" value={s.paymentMode}
                        onChange={e => setSplits(prev => prev.map(p =>
                          p.id === s.id ? { ...p, paymentMode: e.target.value as PaymentMode } : p))}
                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px", fontFamily: FONT } }}>
                        <MenuItem value="cash">Cash</MenuItem>
                        <MenuItem value="upi">UPI</MenuItem>
                        <MenuItem value="card">Card</MenuItem>
                      </TextField>
                    </Box>
                  ))}
                </Box>
                <Box sx={{ mt: 2 }}>
                  <SummaryRow label="Total" value={payableAmount} bold />
                  <SummaryRow label="Split Total" value={splitTotal} />
                  <SummaryRow label="Remaining" value={remainingAmount} red />
                </Box>
              </Box>
            )}

            {/* SPLIT: items */}
            {mode === "split" && splitView === "items" && (
              <Box>
                <Typography sx={{ fontSize: 13, color: "#2563EB", cursor: "pointer", fontFamily: FONT, mb: 1 }}
                  onClick={() => setSplitView("options")}>← Change Method</Typography>
                <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                  {splits.map(s => (
                    <Button key={s.id} size="small"
                      variant={activeSplitId === s.id ? "contained" : "outlined"}
                      onClick={() => setActiveSplitId(s.id)}
                      sx={{ textTransform: "none", fontFamily: FONT, borderRadius: "8px",
                        bgcolor: activeSplitId === s.id ? "#FF3D01" : undefined,
                        borderColor: "#FF3D01", color: activeSplitId === s.id ? "#fff" : "#FF3D01" }}>
                      Split {s.id}
                    </Button>
                  ))}
                  <Button size="small" onClick={() =>
                    setSplits(p => [...p, { id: p.length + 1, amount: 0, paymentMode: "cash", items: [] }])}
                    sx={{ textTransform: "none", fontFamily: FONT, borderRadius: "8px" }}>
                    + New Split
                  </Button>
                </Box>
                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                  <Box>
                    <Typography sx={{ fontSize: 13, fontWeight: 600, fontFamily: FONT, mb: 1 }}>Available</Typography>
                    {cart.map(item => (
                      <Box key={item.id} sx={{ display: "flex", justifyContent: "space-between", mb: 0.8, p: 1, border: "1px solid #E5E7EB", borderRadius: "8px" }}>
                        <Typography sx={{ fontSize: 12, fontFamily: FONT }}>{item.name}</Typography>
                        <Box sx={{ display: "flex", gap: 0.5 }}>
                          <Button size="small" onClick={() => addItemToSplit(item, 1)} sx={{ minWidth: 0, px: 1, fontSize: 11, fontFamily: FONT }}>+1</Button>
                          <Button size="small" onClick={() => addItemToSplit(item, item.qty)} sx={{ minWidth: 0, px: 1, fontSize: 11, fontFamily: FONT }}>All</Button>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 13, fontWeight: 600, fontFamily: FONT, mb: 1 }}>Split {activeSplitId}</Typography>
                    {activeSplit.items.length === 0
                      ? <Typography sx={{ fontSize: 12, color: "#9CA3AF", fontFamily: FONT }}>No items added</Typography>
                      : activeSplit.items.map((i, idx) => (
                          <Typography key={idx} sx={{ fontSize: 12, fontFamily: FONT }}>{i.name} × {i.qty}</Typography>
                        ))}
                  </Box>
                </Box>
                <Box sx={{ mt: 2 }}>
                  <SummaryRow label="Total" value={payableAmount} bold />
                  <SummaryRow label="Split Total" value={splitTotal} />
                  <SummaryRow label="Remaining" value={remainingAmount} red />
                </Box>
              </Box>
            )}
          </Box>

          {/* RIGHT PANEL — Keypad (only in full payment mode) */}
          {mode === "full" && (
            <Box sx={{ width: 260, px: 2.5, py: 2.5, display: "flex", flexDirection: "column", gap: 1.2 }}>

              {/* Quick amounts */}
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
                {QUICK_AMOUNTS.map(v => (
                  <Box
                    key={v}
                    onClick={() => setAmount(v)}
                    sx={{
                      border: "1.5px solid #E5E7EB", borderRadius: "8px",
                      height: 42, display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: "pointer", backgroundColor: amount === v ? "#FEF2F2" : "#FAFAFA",
                      borderColor: amount === v ? "#FF3D01" : "#E5E7EB",
                      transition: "all .12s",
                      "&:hover": { borderColor: "#FF3D01", backgroundColor: "#FEF2F2" },
                    }}
                  >
                    <Typography sx={{ fontSize: 13, fontWeight: 700, color: amount === v ? "#FF3D01" : "#374151", fontFamily: FONT }}>
                      ₹{v.toLocaleString()}
                    </Typography>
                  </Box>
                ))}
              </Box>

              {/* Numpad */}
              <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 1, flex: 1 }}>
                {KEYPAD_KEYS.map(k => (
                  <Box
                    key={String(k)}
                    onClick={() => handleKeypad(k)}
                    sx={{
                      border: "1.5px solid #E5E7EB", borderRadius: "8px",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: "pointer", minHeight: 52,
                      backgroundColor: k === "back" ? "#FEF2F2" : "#FAFAFA",
                      borderColor: k === "back" ? "#FECACA" : "#E5E7EB",
                      transition: "all .1s",
                      "&:hover": {
                        backgroundColor: k === "back" ? "#FEE2E2" : "#F3F4F6",
                        borderColor: k === "back" ? "#FF3D01" : "#9CA3AF",
                      },
                      "&:active": { transform: "scale(0.96)" },
                    }}
                  >
                    {k === "back"
                      ? <BackspaceOutlinedIcon sx={{ fontSize: 20, color: "#FF3D01" }} />
                      : <Typography sx={{ fontSize: 18, fontWeight: 700, color: "#374151", fontFamily: FONT }}>{k}</Typography>}
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </Box>

        {/* ── FOOTER ── */}
        <Box sx={{
          display: "flex", gap: 2,
          px: 3, py: 2,
          borderTop: "1px solid #F3F4F6",
          backgroundColor: "#FAFAFA",
        }}>
          <Button
            fullWidth
            variant="outlined"
            onClick={onClose}
            sx={{
              textTransform: "none", fontSize: 14, fontWeight: 600, fontFamily: FONT,
              height: 48, borderRadius: "10px",
              borderColor: "#D1D5DB", color: "#374151",
              "&:hover": { borderColor: "#9CA3AF", backgroundColor: "#F3F4F6" },
            }}
          >
            Cancel
          </Button>

          <Button
            fullWidth
            variant="contained"
            disabled={!canPay}
            onClick={handleCompletePayment}
            sx={{
              textTransform: "none", fontSize: 14, fontWeight: 700, fontFamily: FONT,
              height: 48, borderRadius: "10px",
              background: canPay
                ? "linear-gradient(135deg,#FF3D01,#c62a2f)"
                : "#E5E7EB",
              color: canPay ? "#FFFFFF" : "#9CA3AF",
              boxShadow: canPay ? "0 4px 16px rgba(232,53,58,.4)" : "none",
              "&:hover": {
                background: canPay ? "linear-gradient(135deg,#c62a2f,#a02020)" : "#E5E7EB",
              },
              "&.Mui-disabled": { background: "#F3F4F6", color: "#D1D5DB" },
            }}
          >
            Complete Payment
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}
