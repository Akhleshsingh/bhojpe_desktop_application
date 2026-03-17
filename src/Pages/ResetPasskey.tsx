import React, { useState, useRef, useCallback } from "react";
import { Box, Typography, Button, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";
import LockResetOutlinedIcon from "@mui/icons-material/LockResetOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";

const PIN_LENGTH = 4;

function PinInput({
  label,
  value,
  onChange,
  show,
  onToggleShow,
  inputRefs,
  error,
  hint,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  show: boolean;
  onToggleShow: () => void;
  inputRefs: React.RefObject<HTMLInputElement>[];
  error?: boolean;
  hint?: string;
}) {
  const handleKey = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (value[idx]) {
        const arr = value.split("");
        arr[idx] = "";
        onChange(arr.join(""));
      } else if (idx > 0) {
        inputRefs[idx - 1].current?.focus();
        const arr = value.split("");
        arr[idx - 1] = "";
        onChange(arr.join(""));
      }
    }
  };

  const handleInput = (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const ch = e.target.value.replace(/\D/g, "").slice(-1);
    if (!ch) return;
    const arr = value.padEnd(PIN_LENGTH, " ").split("");
    arr[idx] = ch;
    const next = arr.join("").trimEnd();
    onChange(next.slice(0, PIN_LENGTH));
    if (idx < PIN_LENGTH - 1) inputRefs[idx + 1].current?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, PIN_LENGTH);
    if (pasted) { onChange(pasted); inputRefs[Math.min(pasted.length, PIN_LENGTH - 1)].current?.focus(); }
    e.preventDefault();
  };

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
        <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#6b5c4a", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          {label}
        </Typography>
        <Box onClick={onToggleShow} sx={{ display: "flex", alignItems: "center", gap: 0.4, cursor: "pointer" }}>
          {show
            ? <VisibilityOffOutlinedIcon sx={{ fontSize: 15, color: "#a08c7c" }} />
            : <VisibilityOutlinedIcon sx={{ fontSize: 15, color: "#a08c7c" }} />}
          <Typography sx={{ fontSize: 11, color: "#a08c7c", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {show ? "Hide" : "Show"}
          </Typography>
        </Box>
      </Box>

      {hint && (
        <Typography sx={{ fontSize: 11, color: "#a08c7c", fontFamily: "'Plus Jakarta Sans', sans-serif", mb: 0.8 }}>
          {hint}
        </Typography>
      )}

      <Box sx={{ display: "flex", gap: 1.5, justifyContent: "center" }}>
        {Array.from({ length: PIN_LENGTH }, (_, i) => {
          const filled = i < value.length;
          return (
            <Box
              key={i}
              sx={{
                width: 64, height: 64,
                borderRadius: "12px",
                border: `2px solid ${error ? "#FECACA" : filled ? "#FF3D01" : "#e2d9d0"}`,
                backgroundColor: error ? "#FEF2F2" : filled ? "#FEF2F2" : "#faf7f3",
                display: "flex", alignItems: "center", justifyContent: "center",
                position: "relative",
                transition: "all .15s",
                boxShadow: filled ? "0 0 0 3px rgba(232,53,58,.1)" : "none",
              }}
            >
              <input
                ref={inputRefs[i]}
                type="tel"
                maxLength={1}
                value={filled ? (show ? value[i] : "•") : ""}
                onChange={(e) => handleInput(i, e)}
                onKeyDown={(e) => handleKey(i, e)}
                onPaste={handlePaste}
                style={{
                  position: "absolute", inset: 0, opacity: 0,
                  width: "100%", height: "100%", cursor: "text", zIndex: 1,
                }}
              />
              <Typography sx={{
                fontSize: show ? 22 : 28, fontWeight: 700, color: error ? "#DC2626" : "#FF3D01",
                fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1, userSelect: "none",
              }}>
                {filled ? (show ? value[i] : "●") : ""}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

export default function ResetPasskey() {
  const [oldKey, setOldKey] = useState("");
  const [newKey, setNewKey] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const oldRefs = Array.from({ length: PIN_LENGTH }, () => useRef<HTMLInputElement>(null));
  const newRefs = Array.from({ length: PIN_LENGTH }, () => useRef<HTMLInputElement>(null));

  const handleReset = useCallback(() => {
    setError("");
    const saved = localStorage.getItem("pos_passkey");

    if (oldKey.length !== PIN_LENGTH) { setError("Please enter your current 4-digit passkey."); return; }
    if (oldKey !== saved) { setError("Current passkey is incorrect. Please try again."); return; }
    if (newKey.length !== PIN_LENGTH) { setError("New passkey must be exactly 4 digits."); return; }
    if (newKey === oldKey) { setError("New passkey must be different from the current passkey."); return; }

    localStorage.setItem("pos_passkey", newKey);
    setSuccess(true);
    setTimeout(() => navigate(-1), 1400);
  }, [oldKey, newKey, navigate]);

  const strength = newKey.length === PIN_LENGTH
    ? newKey === "1234" || newKey === "0000" || newKey === oldKey ? "weak" : "strong"
    : null;

  return (
    <Box sx={{
      minHeight: "100vh", backgroundColor: "#f5f0ea",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Plus Jakarta Sans', sans-serif", p: 3,
    }}>
      <Box sx={{
        width: "100%", maxWidth: 420,
        backgroundColor: "#FFFFFF",
        borderRadius: "20px",
        border: "1px solid #e2d9d0",
        boxShadow: "0 8px 40px rgba(0,0,0,0.10)",
        overflow: "hidden",
      }}>
        {/* ── Card header ── */}
        <Box sx={{
          background: "linear-gradient(135deg,#2c1a0e 0%,#3d2810 100%)",
          px: 3, py: 3,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box sx={{
              width: 44, height: 44, borderRadius: "12px",
              background: "rgba(232,53,58,.2)",
              border: "1px solid rgba(232,53,58,.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <LockResetOutlinedIcon sx={{ fontSize: 22, color: "#FCA5A5" }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: 16, fontWeight: 700, color: "#FFFFFF", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Reset Passkey
              </Typography>
              <Typography sx={{ fontSize: 12, color: "#a08c7c", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Verify current &amp; set new passkey
              </Typography>
            </Box>
          </Box>

          <Box
            onClick={() => navigate(-1)}
            sx={{
              display: "flex", alignItems: "center", gap: 0.5, cursor: "pointer",
              px: 1.2, py: 0.5, borderRadius: "8px",
              "&:hover": { backgroundColor: "rgba(255,255,255,0.08)" },
            }}
          >
            <ArrowBackIcon sx={{ fontSize: 16, color: "#a08c7c" }} />
            <Typography sx={{ fontSize: 12, color: "#a08c7c", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Back</Typography>
          </Box>
        </Box>

        {/* ── Body ── */}
        <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 3 }}>

          {success ? (
            <Box sx={{ py: 3, display: "flex", flexDirection: "column", alignItems: "center", gap: 1.5 }}>
              <Box sx={{ width: 60, height: 60, borderRadius: "50%", backgroundColor: "#DCFCE7", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <CheckCircleOutlineIcon sx={{ fontSize: 32, color: "#16A34A" }} />
              </Box>
              <Typography sx={{ fontSize: 16, fontWeight: 700, color: "#111827", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Passkey Reset Successfully!
              </Typography>
              <Typography sx={{ fontSize: 13, color: "#9CA3AF", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Redirecting you back…
              </Typography>
            </Box>
          ) : (
            <>
              {error && (
                <Alert severity="error" sx={{ borderRadius: "10px", fontSize: 13, fontFamily: "'Plus Jakarta Sans', sans-serif", py: 0.5 }}>
                  {error}
                </Alert>
              )}

              {/* Security notice */}
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1, p: 1.5, borderRadius: "10px", backgroundColor: "#FFFBEB", border: "1px solid #FDE68A" }}>
                <ShieldOutlinedIcon sx={{ fontSize: 16, color: "#D97706", mt: 0.1, flexShrink: 0 }} />
                <Typography sx={{ fontSize: 12, color: "#92400E", fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1.6 }}>
                  You must enter your <strong>current passkey</strong> to set a new one. This ensures only authorized users can change security settings.
                </Typography>
              </Box>

              {/* Current passkey */}
              <PinInput
                label="Current Passkey"
                value={oldKey}
                onChange={(v) => { setOldKey(v); setError(""); }}
                show={showOld}
                onToggleShow={() => setShowOld(s => !s)}
                inputRefs={oldRefs}
                error={!!error && (oldKey.length < 4 || error.includes("incorrect"))}
                hint="Enter your existing 4-digit passkey"
              />

              {/* Divider */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box sx={{ flex: 1, height: 1, backgroundColor: "#e2d9d0" }} />
                <Typography sx={{ fontSize: 11, color: "#a08c7c", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>NEW PASSKEY</Typography>
                <Box sx={{ flex: 1, height: 1, backgroundColor: "#e2d9d0" }} />
              </Box>

              {/* New passkey */}
              <PinInput
                label="New Passkey"
                value={newKey}
                onChange={(v) => { setNewKey(v); setError(""); }}
                show={showNew}
                onToggleShow={() => setShowNew(s => !s)}
                inputRefs={newRefs}
                error={!!error && newKey.length < 4}
              />

              {/* Strength indicator */}
              {strength && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box sx={{ width: 40, height: 3, borderRadius: "2px", backgroundColor: strength === "strong" ? "#16A34A" : "#DC2626" }} />
                  <Box sx={{ width: 40, height: 3, borderRadius: "2px", backgroundColor: strength === "strong" ? "#16A34A" : "#F3F4F6" }} />
                  <Typography sx={{ fontSize: 11, fontWeight: 600, color: strength === "strong" ? "#16A34A" : "#DC2626", fontFamily: "'Plus Jakarta Sans', sans-serif", ml: 0.5 }}>
                    {strength === "strong" ? "Strong passkey" : "Weak passkey — choose a less predictable combination"}
                  </Typography>
                </Box>
              )}

              <Button
                fullWidth
                variant="contained"
                onClick={handleReset}
                disabled={oldKey.length !== 4 || newKey.length !== 4}
                sx={{
                  textTransform: "none", fontSize: 14, fontWeight: 700,
                  fontFamily: "'Plus Jakarta Sans', sans-serif", height: 46, borderRadius: "12px",
                  background: oldKey.length === 4 && newKey.length === 4
                    ? "linear-gradient(135deg,#FF3D01,#c62a2f)"
                    : "#E5E7EB",
                  color: oldKey.length === 4 && newKey.length === 4 ? "#FFF" : "#9CA3AF",
                  boxShadow: oldKey.length === 4 && newKey.length === 4 ? "0 4px 12px rgba(232,53,58,.35)" : "none",
                  transition: "all .2s",
                  "&:hover": {
                    background: oldKey.length === 4 && newKey.length === 4
                      ? "linear-gradient(135deg,#c62a2f,#a02020)"
                      : "#E5E7EB",
                  },
                  "&.Mui-disabled": { background: "#F3F4F6", color: "#D1D5DB" },
                }}
              >
                Reset Passkey
              </Button>

              <Typography sx={{ fontSize: 12, color: "#a08c7c", fontFamily: "'Plus Jakarta Sans', sans-serif", textAlign: "center", lineHeight: 1.6 }}>
                After resetting, your new passkey will immediately protect POS access.
              </Typography>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
}
