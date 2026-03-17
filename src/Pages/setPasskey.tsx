import React, { useState, useRef, useCallback } from "react";
import { Box, Typography, Button, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";

const PIN_LENGTH = 4;

function PinInput({
  label,
  value,
  onChange,
  show,
  onToggleShow,
  inputRefs,
  error,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  show: boolean;
  onToggleShow: () => void;
  inputRefs: React.RefObject<HTMLInputElement>[];
  error?: boolean;
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
        <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#374151", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          {label}
        </Typography>
        <Box onClick={onToggleShow} sx={{ display: "flex", alignItems: "center", gap: 0.4, cursor: "pointer" }}>
          {show
            ? <VisibilityOffOutlinedIcon sx={{ fontSize: 15, color: "#9CA3AF" }} />
            : <VisibilityOutlinedIcon sx={{ fontSize: 15, color: "#9CA3AF" }} />}
          <Typography sx={{ fontSize: 11, color: "#9CA3AF", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {show ? "Hide" : "Show"}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: "flex", gap: 1.5, justifyContent: "center" }}>
        {Array.from({ length: PIN_LENGTH }, (_, i) => {
          const filled = i < value.length;
          return (
            <Box
              key={i}
              sx={{
                width: 64, height: 64,
                borderRadius: "12px",
                border: `2px solid ${error ? "#FECACA" : filled ? "#FF3D01" : "#E5E7EB"}`,
                backgroundColor: error ? "#FEF2F2" : filled ? "#FEF2F2" : "#F9FAFB",
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

export default function SetPasskey() {
  const [passkey, setPasskey] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPasskey, setShowPasskey] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const refs1 = Array.from({ length: PIN_LENGTH }, () => useRef<HTMLInputElement>(null));
  const refs2 = Array.from({ length: PIN_LENGTH }, () => useRef<HTMLInputElement>(null));

  const handleSave = useCallback(() => {
    setError("");
    if (passkey.length !== PIN_LENGTH) { setError("Passkey must be exactly 4 digits."); return; }
    if (confirm.length !== PIN_LENGTH) { setError("Please confirm your passkey."); return; }
    if (passkey !== confirm) { setError("Passkeys do not match. Please try again."); return; }

    localStorage.setItem("pos_passkey", passkey);
    setSuccess(true);
    setTimeout(() => navigate(-1), 1400);
  }, [passkey, confirm, navigate]);

  const strength = passkey.length === PIN_LENGTH
    ? passkey === "1234" || passkey === "0000" ? "weak" : "strong"
    : null;

  return (
    <Box sx={{
      minHeight: "100vh", backgroundColor: "#F4F6F9",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Plus Jakarta Sans', sans-serif", p: 3,
    }}>
      <Box sx={{
        width: "100%", maxWidth: 420,
        backgroundColor: "#FFFFFF",
        borderRadius: "20px",
        border: "1px solid #E5E7EB",
        boxShadow: "0 8px 40px rgba(0,0,0,0.10)",
        overflow: "hidden",
      }}>
        {/* ── Card header ── */}
        <Box sx={{
          background: "linear-gradient(135deg,#1F2937 0%,#374151 100%)",
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
              <LockOutlinedIcon sx={{ fontSize: 22, color: "#FCA5A5" }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: 16, fontWeight: 700, color: "#FFFFFF", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Set POS Passkey
              </Typography>
              <Typography sx={{ fontSize: 12, color: "#9CA3AF", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Create a 4-digit security passkey
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
            <ArrowBackIcon sx={{ fontSize: 16, color: "#9CA3AF" }} />
            <Typography sx={{ fontSize: 12, color: "#9CA3AF", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Back</Typography>
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
                Passkey Set Successfully!
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

              <PinInput
                label="Enter Passkey"
                value={passkey}
                onChange={(v) => { setPasskey(v); setError(""); }}
                show={showPasskey}
                onToggleShow={() => setShowPasskey(s => !s)}
                inputRefs={refs1}
                error={!!error && passkey.length < 4}
              />

              {/* Strength indicator */}
              {strength && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box sx={{ flex: 1, height: 3, borderRadius: "2px", backgroundColor: strength === "strong" ? "#16A34A" : "#DC2626" }} />
                  <Typography sx={{ fontSize: 11, fontWeight: 600, color: strength === "strong" ? "#16A34A" : "#DC2626", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    {strength === "strong" ? "Strong passkey" : "Weak passkey — avoid simple patterns"}
                  </Typography>
                </Box>
              )}

              <PinInput
                label="Confirm Passkey"
                value={confirm}
                onChange={(v) => { setConfirm(v); setError(""); }}
                show={showConfirm}
                onToggleShow={() => setShowConfirm(s => !s)}
                inputRefs={refs2}
                error={!!error && (confirm.length < 4 || passkey !== confirm)}
              />

              {/* Match indicator */}
              {confirm.length === PIN_LENGTH && passkey.length === PIN_LENGTH && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.7 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: passkey === confirm ? "#16A34A" : "#DC2626" }} />
                  <Typography sx={{ fontSize: 12, color: passkey === confirm ? "#16A34A" : "#DC2626", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600 }}>
                    {passkey === confirm ? "Passkeys match" : "Passkeys do not match"}
                  </Typography>
                </Box>
              )}

              <Button
                fullWidth
                variant="contained"
                onClick={handleSave}
                disabled={passkey.length !== 4 || confirm.length !== 4}
                sx={{
                  textTransform: "none", fontSize: 14, fontWeight: 700,
                  fontFamily: "'Plus Jakarta Sans', sans-serif", height: 46, borderRadius: "12px",
                  background: passkey.length === 4 && confirm.length === 4
                    ? "linear-gradient(135deg,#FF3D01,#c62a2f)"
                    : "#E5E7EB",
                  color: passkey.length === 4 && confirm.length === 4 ? "#FFF" : "#9CA3AF",
                  boxShadow: passkey.length === 4 && confirm.length === 4 ? "0 4px 12px rgba(232,53,58,.35)" : "none",
                  transition: "all .2s",
                  "&:hover": {
                    background: passkey.length === 4 && confirm.length === 4
                      ? "linear-gradient(135deg,#c62a2f,#a02020)"
                      : "#E5E7EB",
                  },
                  "&.Mui-disabled": { background: "#F3F4F6", color: "#D1D5DB" },
                }}
              >
                Save Passkey
              </Button>

              <Typography sx={{ fontSize: 12, color: "#9CA3AF", fontFamily: "'Plus Jakarta Sans', sans-serif", textAlign: "center", lineHeight: 1.6 }}>
                This passkey protects access to the POS system.<br />Keep it secure and do not share it.
              </Typography>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
}
