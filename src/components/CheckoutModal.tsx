import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Typography,
  Modal,
  IconButton,
  TextField,
  MenuItem,
} from "@mui/material";

type PaymentMode = "cash" | "card" | "upi" | "bank" | "due";

interface Props {
  open: boolean;
  onClose: () => void;
  orderNumber: number;
  totalAmount: number;
  cart: any[];
  orderId: number;   // ⭐ ADD THIS
  onPaymentSuccess?: (paymentData: any) => void;

}


type SplitCardProps = {
  title: string;
  subtitle: string;
  onClick: () => void;
};

const SplitCard = ({ title, subtitle, onClick }: SplitCardProps) => {
  return (
    <Box
      onClick={onClick}
      sx={{
        border: "1px solid #E0E0E0",
        borderRadius: 2,
        p: 3,
        cursor: "pointer",
        transition: "0.2s",
        "&:hover": {
          boxShadow: "0px 4px 12px rgba(0,0,0,0.1)",
          borderColor: "#000",
        },
      }}
    >
      <Typography fontWeight={700} mb={0.5}>
        {title}
      </Typography>
      <Typography fontSize={13} color="text.secondary">
        {subtitle}
      </Typography>
    </Box>
  );
};
type Split = {
  id: number;
  amount: number;
  paymentMode: PaymentMode;
  items: any[];
};
export default function CheckoutModal({
  open,
  onClose,
  orderNumber,
  totalAmount, cart, orderId, onPaymentSuccess,
}: Props) {
  const [mode, setMode] = useState<"full" | "split">("full");
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("cash");
  const [amount, setAmount] = useState<number>(totalAmount);
  const [tip, setTip] = useState<number>(0);
  const [activeSplitId, setActiveSplitId] = useState<number>(1);
  const payableAmount = useMemo(() => {
    return Number((totalAmount + tip).toFixed(2));
  }, [totalAmount, tip]);
 const [splits, setSplits] = useState<Split[]>([
  { id: 1, amount: payableAmount, paymentMode: "cash", items: [] },
]);
const activeSplit = splits.find(s => s.id === activeSplitId)!;

const splitTotal = splits.reduce((s, x) => s + x.amount, 0);
const remainingAmount = payableAmount - splitTotal;


  const [splitView, setSplitView] = useState<
  "options" | "equal" | "custom" | "items"
>("options");
const updateSplitAmount = (id: number, value: number) => {
  setSplits(prev => {
    const other = prev.find(s => s.id !== id)!;

    return prev.map(s =>
      s.id === id
        ? { ...s, amount: value }
        : { ...s, amount: Math.max(payableAmount - value, 0) }
    );
  });
};

  const dueAmount = useMemo(() => {
    const d = payableAmount - amount;
    return d > 0 ? d : 0;
  }, [payableAmount, amount]);

  const paidExtra = useMemo(() => {
    const e = amount - payableAmount;
    return e > 0 ? e : 0;
  }, [payableAmount, amount]);
const addItemToSplit = (item: any, qty: number) => {
  setSplits(prev =>
    prev.map(s =>
      s.id === activeSplitId
        ? {
            ...s,
            items: [...s.items, { ...item, qty }],
            amount: s.amount + item.price * qty,
          }
        : s
    )
  );
};
useEffect(() => {
  setAmount(totalAmount);
}, [totalAmount]);

useEffect(() => {
  setSplits([
    { id: 1, amount: totalAmount, paymentMode: "cash", items: [] },
  ]);
  setActiveSplitId(1);
  setMode("full");
  setTip(0);
}, [orderId]);
const handleCompletePayment = async () => {
  const token = localStorage.getItem("token");
  if (!token || !orderId) return;

  const receivedAmount =
    mode === "full" ? amount : splitTotal;

  try {
    const res = await fetch(
      "http://bhojpe.in/api/v1/update-order-payment",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          order_id: orderId,
          received_amount: receivedAmount,
          payment_method:
            mode === "full" ? paymentMode : "split",
          razorpay_payment_id: "",
          razorpay_order_id: "",
          razorpay_signature: "",
        }),
      }
    );

    const data = await res.json();

    if (!data.status) {
      alert(data.message || "Payment failed");
      return;
    }

    onPaymentSuccess?.({
      ...data.data,
      received_amount: receivedAmount,
      payment_method:
        mode === "full" ? paymentMode : "split",
    });

  } catch (err) {
    console.error("Payment error", err);
    alert("Payment API failed");
  }
};
  const handleKeypad = (val: string) => {
    if (val === "clear") {
      setAmount(0);
      return;
    }
    if (val === "back") {
      setAmount((p) => Number(String(p).slice(0, -1) || 0));
      return;
    }
    setAmount((p) => Number(`${p}${val}`));
  };
  const SummaryRow = ({ label, value, bold, color }: any) => (
  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
    <Typography fontWeight={bold ? 700 : 500} color={color}>
      {label}
    </Typography>
    <Typography fontWeight={bold ? 700 : 500} color={color}>
      ₹{Number(value).toFixed(2)}
    </Typography>
  </Box>
);
return (
  <Modal open={open} onClose={onClose}>
    <Box
      sx={{
        width: 920,
        background: "#fff",
        borderRadius: 3,
        p: 3,
        mx: "auto",
        mt: "4vh",
        boxShadow: "0px 20px 60px rgba(0,0,0,0.2)",
      }}
    >
      {/* HEADER */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography fontSize={22} fontWeight={700}>
          Payment
        </Typography>
        <Typography fontWeight={600}>
          Order #{orderNumber} &nbsp; ₹{totalAmount.toFixed(2)}
        </Typography>
      </Box>

   
      <Box sx={{ display: "flex", gap: 1.5, mb: 3 }}>
        {["full", "split"].map((m) => (
          <Button
            key={m}
            variant={mode === m ? "contained" : "outlined"}
            sx={{
              height: 44,
              fontWeight: 600,
              bgcolor: mode === m ? "#000" : "#fff",
              color: mode === m ? "#fff" : "#000",
              borderRadius: 2,
            }}
            onClick={() => {
              setMode(m as any);
              if (m === "split") setSplitView("options");
            }}
          >
            {m === "full" ? "Full Payment" : "Split Bill"}
          </Button>
        ))}
      </Box>
      {mode === "full" && (
      <Box
  sx={{
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 4,
  }}
>
  {/* LEFT */}
  <Box>
    {/* PAYMENT MODES */}
    <Typography fontWeight={700} mb={1}>
      Payment Method
    </Typography>

    <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 3 }}>
      {[
        { key: "cash", label: "Cash" },
        { key: "card", label: "Card" },
        { key: "upi", label: "UPI" },
        { key: "bank", label: "Bank" },
        { key: "due", label: "Due" },
      ].map((p) => {
        const active = paymentMode === p.key;

        return (
          <Box
            key={p.key}
            onClick={() => setPaymentMode(p.key as PaymentMode)}
            sx={{
              width: 120,
              height: 90,
              borderRadius: 2,
              border: active ? "2px solid #000" : "1px solid #E0E0E0",
              backgroundColor: active ? "#F5F5F5" : "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontWeight: 600,
              transition: "0.2s",
              "&:hover": {
                boxShadow: "0px 4px 10px rgba(0,0,0,0.08)",
              },
            }}
          >
            {p.label}
          </Box>
        );
      })}
    </Box>

    {/* TIP */}
    <Button
      variant="outlined"
      sx={{
        borderStyle: "dashed",
        mb: 2,
        height: 40,
        fontWeight: 600,
        color: "#555",
      }}
      onClick={() => setTip((t) => t + 10)}
    >
      + Add Tip
    </Button>

    {/* AMOUNT */}
    <TextField
      fullWidth
      label="Amount"
      value={amount}
      onChange={(e) => setAmount(Number(e.target.value))}
      sx={{
        mb: 3,
        "& input": {
          fontSize: 26,
          fontWeight: 800,
          textAlign: "right",
        },
      }}
    />

    {/* SUMMARY */}
    <Box
      sx={{
        background: "#FAFAFA",
        borderRadius: 2,
        p: 2,
        border: "1px solid #E0E0E0",
      }}
    >
      <SummaryRow label="Total" value={totalAmount} />
      <SummaryRow label="Payable" value={payableAmount} bold />
      <SummaryRow label="Due" value={dueAmount} color="red" />
      {paidExtra > 0 && (
        <SummaryRow label="Change" value={paidExtra} color="green" />
      )}
    </Box>
  </Box>

  {/* RIGHT – KEYPAD */}
  <Box>
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(2,1fr)",
        gap: 1.5,
        mb: 2, mt: -9,
      }}
    >
      {[50, 100, 500, 1000].map((v) => (
        <Button
          key={v}
          variant="outlined"
          sx={{ height: 44, fontWeight: 700 }}
          onClick={() => setAmount(v)}
        >
          ₹{v}
        </Button>
      ))}
    </Box>

    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(3,1fr)",
        gap: 1.5
      }}
    >
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, ".", 0].map((k) => (
        <Button
          key={k}
          onClick={() => handleKeypad(String(k))}
          variant="outlined"
          sx={{
            height: 64,
            fontSize: 20,
            fontWeight: 800,
            borderRadius: 2,
          }}
        >
          {k}
        </Button>
      ))}

      <Button
        onClick={() => handleKeypad("back")}
        variant="outlined"
        sx={{
          height: 64,
          fontSize: 20,
          fontWeight: 800,
        }}
      >
        ⌫
      </Button>
    </Box>
  </Box>
</Box>

      )}

      {mode === "split" && splitView === "options" && (
        <Box>
          <Typography fontWeight={700} mb={3}>
            Split Bill
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              gap: 2,
            }}
          >
            <SplitCard
              title="Equal Split"
              subtitle="Split equally"
              onClick={() => setSplitView("equal")}
            />

            <SplitCard
              title="Custom Split"
              subtitle="Split by amount"
              onClick={() => setSplitView("custom")}
            />

            <SplitCard
              title="Split by Items"
              subtitle="Split by dishes"
              onClick={() => setSplitView("items")}
            />
          </Box>
        </Box>
      )}
      {mode === "split" && splitView === "equal" && (
        <Box>
          <Typography fontWeight={700} mb={2}>
            Split Bill{" "}
            <Typography
              component="span"
              sx={{ color: "#1976d2", cursor: "pointer", fontSize: 13 }}
              onClick={() => setSplitView("options")}
            >
              (Change Method)
            </Typography>
          </Typography>

          <Box sx={{ display: "flex", gap: 2 }}>
            {[1, 2].map((s) => (
              <Box
                key={s}
                sx={{
                  flex: 1,
                  border: "1px solid #E0E0E0",
                  borderRadius: 2,
                  p: 2,
                }}
              >
                <Typography fontWeight={600}>Split {s}</Typography>

                <TextField
                  fullWidth
                  size="small"
                  value={(payableAmount / 2).toFixed(2)}
                  disabled
                  sx={{ my: 1 }}
                />

                <TextField select fullWidth size="small" defaultValue="cash">
                  <MenuItem value="cash">Cash</MenuItem>
                  <MenuItem value="upi">UPI</MenuItem>
                </TextField>
              </Box>
            ))}
          </Box>

          <Box sx={{ mt: 3 }}>
            <SummaryRow label="Total" value={payableAmount} bold />
            <SummaryRow
              label="Amount per split"
              value={payableAmount / 2}
              color="primary"
            />
          </Box>
        </Box>
      )}
{mode === "split" && splitView === "custom" && (
  <Box>
    <Typography fontWeight={700} mb={2}>
      Split Bill{" "}
      <Typography
        component="span"
        sx={{ color: "#1976d2", cursor: "pointer", fontSize: 13 }}
        onClick={() => setSplitView("options")}
      >
        (Change Method)
      </Typography>
    </Typography>

    <Box sx={{ display: "flex", gap: 2 }}>
      {splits.map((s) => (
        <Box
          key={s.id}
          sx={{
            flex: 1,
            border: activeSplitId === s.id
              ? "2px solid #000"
              : "1px solid #E0E0E0",
            borderRadius: 2,
            p: 2,
            background: "#FAFAFA",
            cursor: "pointer",
          }}
          onClick={() => setActiveSplitId(s.id)}
        >
          <Typography fontWeight={600}>Split {s.id}</Typography>

          <TextField
            fullWidth
            size="small"
            type="number"
            value={s.amount}
            onChange={(e) =>
              updateSplitAmount(s.id, Number(e.target.value))
            }
            sx={{ my: 1 }}
          />

          <TextField
            select
            fullWidth
            size="small"
            value={s.paymentMode}
            onChange={(e) =>
              setSplits(prev =>
                prev.map(p =>
                  p.id === s.id
                    ? { ...p, paymentMode: e.target.value as PaymentMode }
                    : p
                )
              )
            }
          >
            <MenuItem value="cash">Cash</MenuItem>
            <MenuItem value="upi">UPI</MenuItem>
          </TextField>
        </Box>
      ))}
    </Box>

    <Box sx={{ mt: 3 }}>
      <SummaryRow label="Total" value={payableAmount} bold />
      <SummaryRow label="Split Total" value={splitTotal} color="primary" />
      <SummaryRow label="Remaining" value={remainingAmount} color="error" />
    </Box>
  </Box>
)}

{mode === "split" && splitView === "items" && (
  <Box>
    <Typography fontWeight={700} mb={2}>
      Split Bill{" "}
      <Typography
        component="span"
        sx={{ color: "#1976d2", cursor: "pointer", fontSize: 13 }}
        onClick={() => setSplitView("options")}
      >
        (Change Method)
      </Typography>
    </Typography>

    {/* SPLIT TABS */}
    <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
      {splits.map(s => (
        <Button
          key={s.id}
          variant={activeSplitId === s.id ? "contained" : "outlined"}
          onClick={() => setActiveSplitId(s.id)}
        >
          Split {s.id}
        </Button>
      ))}

      <Button
        onClick={() =>
          setSplits(prev => [
            ...prev,
            { id: prev.length + 1, amount: 0, paymentMode: "cash", items: [] },
          ])
        }
      >
        + New Split
      </Button>
    </Box>

    <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
      {/* AVAILABLE ITEMS */}
      <Box>
        <Typography fontWeight={600} mb={1}>Available Items</Typography>
        {cart.map(item => (
          <Box
            key={item.id}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mb: 1,
              p: 1,
              border: "1px solid #E0E0E0",
              borderRadius: 1,
            }}
          >
            <Typography>{item.name}</Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button size="small" onClick={() => addItemToSplit(item, 1)}>
                +1
              </Button>
              <Button size="small" onClick={() => addItemToSplit(item, item.qty)}>
                All
              </Button>
            </Box>
          </Box>
        ))}
      </Box>

      {/* ITEMS IN SPLIT */}
      <Box>
        <Typography fontWeight={600} mb={1}>
          Items in Split {activeSplitId}
        </Typography>

        {activeSplit.items.length === 0 ? (
          <Typography fontSize={13} color="text.secondary">
            No items added
          </Typography>
        ) : (
          activeSplit.items.map((i, idx) => (
            <Typography key={idx}>
              {i.name} × {i.qty}
            </Typography>
          ))
        )}
      </Box>
    </Box>

    <Box sx={{ mt: 3 }}>
      <SummaryRow label="Total" value={payableAmount} bold />
      <SummaryRow label="Split Total" value={splitTotal} color="primary" />
      <SummaryRow label="Remaining" value={remainingAmount} color="error" />
    </Box>
  </Box>
)}

      <Box sx={{ display: "flex", gap: 2, mt: 4 }}>
        <Button fullWidth sx={{ height: 48 }} onClick={onClose}>
          Cancel
        </Button>
      <Button
  fullWidth
  variant="contained"
  sx={{
    bgcolor: "#000",
    height: 48,
    fontSize: 16,
    fontWeight: 700,
  }}
disabled={
  mode === "full"
    ? amount < payableAmount && paymentMode !== "due"
    : splitTotal < payableAmount
}
  onClick={handleCompletePayment}   // ⭐ API CALL
>
  Complete Payment
</Button>

      </Box>
    </Box>
  </Modal>
);
}
