import React, { useCallback, useRef, useState } from "react";
import {
  Box,
  Typography,
  Modal,
  Button,
  IconButton,
  CircularProgress,
  LinearProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import { useCustomers } from "../context/CustomerContext";

const FONT = "'Montserrat', sans-serif";

type ParsedRow = {
  name: string;
  phone: string;
  email?: string;
  delivery_address?: string;
  _error?: string;
};

function parseCSV(text: string): ParsedRow[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, "").toLowerCase());
  const nameIdx    = headers.findIndex(h => h === "name");
  const phoneIdx   = headers.findIndex(h => ["phone", "phone number", "mobile"].includes(h));
  const emailIdx   = headers.findIndex(h => h === "email");
  const addressIdx = headers.findIndex(h => ["address", "delivery address", "delivery_address"].includes(h));

  return lines.slice(1).map(line => {
    const cols = line.split(",").map(c => c.trim().replace(/^"|"$/g, ""));
    const name  = nameIdx  >= 0 ? cols[nameIdx]  ?? "" : "";
    const phone = phoneIdx >= 0 ? cols[phoneIdx] ?? "" : "";
    if (!name.trim()) return { name, phone, _error: "Name is required" };
    if (!phone.trim()) return { name, phone, _error: "Phone is required" };
    return {
      name:             name.trim(),
      phone:            phone.trim(),
      email:            emailIdx   >= 0 ? cols[emailIdx]   || undefined : undefined,
      delivery_address: addressIdx >= 0 ? cols[addressIdx] || undefined : undefined,
    };
  }).filter(r => r.name || r._error);
}

type Props = {
  open: boolean;
  onClose: () => void;
  onDone: () => void;
};

export default function ImportCustomerModal({ open, onClose, onDone }: Props) {
  const { saveCustomer } = useCustomers();
  const fileRef = useRef<HTMLInputElement>(null);

  const [rows, setRows]           = useState<ParsedRow[]>([]);
  const [fileName, setFileName]   = useState("");
  const [importing, setImporting] = useState(false);
  const [progress, setProgress]   = useState(0);
  const [done, setDone]           = useState(false);
  const [successCount, setSuccessCount] = useState(0);
  const [failCount, setFailCount]       = useState(0);
  const [dragOver, setDragOver]   = useState(false);

  const reset = () => {
    setRows([]); setFileName(""); setImporting(false);
    setProgress(0); setDone(false); setSuccessCount(0); setFailCount(0);
  };

  const handleClose = () => { if (!importing) { reset(); onClose(); } };

  const loadFile = (file: File) => {
    if (!file.name.endsWith(".csv")) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = e => {
      const text = e.target?.result as string;
      setRows(parseCSV(text));
      setDone(false);
    };
    reader.readAsText(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) loadFile(f);
    e.target.value = "";
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) loadFile(f);
  }, []);

  const validRows = rows.filter(r => !r._error);
  const errorRows = rows.filter(r => r._error);

  const handleImport = async () => {
    if (!validRows.length) return;
    setImporting(true); setProgress(0); setSuccessCount(0); setFailCount(0);

    let ok = 0; let fail = 0;
    for (let i = 0; i < validRows.length; i++) {
      const r = validRows[i];
      const result = await saveCustomer({
        name: r.name,
        phone: r.phone,
        email: r.email,
        delivery_address: r.delivery_address,
      });
      if (result) ok++; else fail++;
      setProgress(Math.round(((i + 1) / validRows.length) * 100));
    }

    setSuccessCount(ok); setFailCount(fail);
    setImporting(false); setDone(true);
  };

  const handleFinish = () => { reset(); onDone(); onClose(); };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={{
        width: 520,
        backgroundColor: "#FFFFFF",
        borderRadius: "16px",
        boxShadow: "0 24px 80px rgba(0,0,0,0.22)",
        mx: "auto", mt: "7vh",
        overflow: "hidden",
        fontFamily: FONT,
        outline: "none",
      }}>
        {/* Header */}
        <Box sx={{
          background: "linear-gradient(135deg,#1F2937 0%,#374151 100%)",
          px: 3, py: 2.5,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box sx={{
              width: 40, height: 40, borderRadius: "10px",
              background: "rgba(16,185,129,.2)",
              border: "1px solid rgba(16,185,129,.35)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <FileUploadOutlinedIcon sx={{ fontSize: 20, color: "#6EE7B7" }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: 16, fontWeight: 700, color: "#FFFFFF", fontFamily: FONT }}>
                Import Customers
              </Typography>
              <Typography sx={{ fontSize: 12, color: "#9CA3AF", fontFamily: FONT }}>
                Upload a CSV file to bulk-add customers
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={handleClose} size="small" disabled={importing}
            sx={{ color: "#9CA3AF", "&:hover": { backgroundColor: "rgba(255,255,255,0.08)" } }}>
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>

        <Box sx={{ px: 3, pt: 2.5, pb: 3, display: "flex", flexDirection: "column", gap: 2 }}>

          {/* Done state */}
          {done ? (
            <Box sx={{ py: 3, display: "flex", flexDirection: "column", alignItems: "center", gap: 1.5 }}>
              <Box sx={{ width: 52, height: 52, borderRadius: "50%", backgroundColor: "#DCFCE7", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <CheckCircleOutlineIcon sx={{ fontSize: 28, color: "#16A34A" }} />
              </Box>
              <Typography sx={{ fontSize: 15, fontWeight: 700, color: "#111827", fontFamily: FONT }}>Import Complete</Typography>
              <Box sx={{ display: "flex", gap: 3 }}>
                <Box sx={{ textAlign: "center" }}>
                  <Typography sx={{ fontSize: 22, fontWeight: 700, color: "#16A34A", fontFamily: FONT }}>{successCount}</Typography>
                  <Typography sx={{ fontSize: 12, color: "#6B7280", fontFamily: FONT }}>Imported</Typography>
                </Box>
                {failCount > 0 && (
                  <Box sx={{ textAlign: "center" }}>
                    <Typography sx={{ fontSize: 22, fontWeight: 700, color: "#DC2626", fontFamily: FONT }}>{failCount}</Typography>
                    <Typography sx={{ fontSize: 12, color: "#6B7280", fontFamily: FONT }}>Failed</Typography>
                  </Box>
                )}
              </Box>
              <Button variant="contained" onClick={handleFinish}
                sx={{
                  mt: 1, textTransform: "none", fontSize: 13, fontWeight: 700, fontFamily: FONT,
                  height: 40, px: 3, borderRadius: "10px",
                  background: "linear-gradient(135deg,#FF3D01,#c62a2f)",
                  "&:hover": { background: "linear-gradient(135deg,#c62a2f,#a02020)" },
                }}>
                Done
              </Button>
            </Box>
          ) : (
            <>
              {/* Drop zone */}
              <Box
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
                sx={{
                  border: `2px dashed ${dragOver ? "#FF3D01" : "#D1D5DB"}`,
                  borderRadius: "12px",
                  py: 4, px: 2,
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 1,
                  cursor: "pointer",
                  backgroundColor: dragOver ? "#FFF5F2" : "#F9FAFB",
                  transition: "all .15s",
                  "&:hover": { borderColor: "#FF3D01", backgroundColor: "#FFF5F2" },
                }}
              >
                <FileUploadOutlinedIcon sx={{ fontSize: 32, color: dragOver ? "#FF3D01" : "#9CA3AF" }} />
                <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#374151", fontFamily: FONT }}>
                  Drag & drop or click to upload
                </Typography>
                <Typography sx={{ fontSize: 12, color: "#9CA3AF", fontFamily: FONT }}>
                  CSV file with columns: <strong>name</strong>, <strong>phone</strong>, email, address
                </Typography>
              </Box>
              <input ref={fileRef} type="file" accept=".csv" hidden onChange={handleFileChange} />

              {/* Sample download */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography sx={{ fontSize: 12, color: "#9CA3AF", fontFamily: FONT }}>
                  Need a template?
                </Typography>
                <Typography
                  component="span"
                  onClick={() => {
                    const sample = "name,phone,email,address\nJohn Doe,9876543210,john@example.com,123 Main St\n";
                    const blob = new Blob([sample], { type: "text/csv" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a"); a.href = url; a.download = "customers_template.csv"; a.click();
                    URL.revokeObjectURL(url);
                  }}
                  sx={{ fontSize: 12, color: "#FF3D01", fontWeight: 600, fontFamily: FONT, cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
                >
                  Download sample CSV
                </Typography>
              </Box>

              {/* File loaded */}
              {fileName && rows.length > 0 && (
                <Box>
                  {/* File name badge */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5, px: 1.5, py: 1, backgroundColor: "#F0FDF4", borderRadius: "8px", border: "1px solid #BBF7D0" }}>
                    <InsertDriveFileOutlinedIcon sx={{ fontSize: 16, color: "#16A34A" }} />
                    <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#15803D", fontFamily: FONT, flex: 1 }}>{fileName}</Typography>
                    <Typography sx={{ fontSize: 12, color: "#6B7280", fontFamily: FONT }}>{validRows.length} valid · {errorRows.length} skipped</Typography>
                  </Box>

                  {/* Preview table */}
                  <Box sx={{ border: "1px solid #E5E7EB", borderRadius: "8px", overflow: "hidden", maxHeight: 200, overflowY: "auto" }}>
                    <Box sx={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 2fr", px: 2, py: 1, backgroundColor: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
                      {["Name", "Phone", "Email"].map(h => (
                        <Typography key={h} sx={{ fontSize: 11, fontWeight: 700, color: "#6B7280", fontFamily: FONT, textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</Typography>
                      ))}
                    </Box>
                    {rows.slice(0, 8).map((r, i) => (
                      <Box key={i} sx={{
                        display: "grid", gridTemplateColumns: "2fr 1.5fr 2fr",
                        px: 2, py: 0.9, alignItems: "center",
                        borderBottom: "1px solid #F3F4F6",
                        backgroundColor: r._error ? "#FFF5F5" : (i % 2 === 0 ? "#FFF" : "#FAFAFA"),
                        "&:last-child": { borderBottom: "none" },
                      }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                          {r._error && <ErrorOutlineIcon sx={{ fontSize: 13, color: "#DC2626" }} />}
                          <Typography sx={{ fontSize: 12, color: r._error ? "#DC2626" : "#111827", fontFamily: FONT }}>{r.name || "—"}</Typography>
                        </Box>
                        <Typography sx={{ fontSize: 12, color: "#374151", fontFamily: FONT }}>{r.phone || "—"}</Typography>
                        <Typography sx={{ fontSize: 12, color: "#6B7280", fontFamily: FONT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.email || "—"}</Typography>
                      </Box>
                    ))}
                    {rows.length > 8 && (
                      <Box sx={{ px: 2, py: 1, backgroundColor: "#F9FAFB" }}>
                        <Typography sx={{ fontSize: 11, color: "#9CA3AF", fontFamily: FONT }}>+ {rows.length - 8} more rows…</Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              )}

              {/* Importing progress */}
              {importing && (
                <Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                    <Typography sx={{ fontSize: 12, color: "#374151", fontFamily: FONT }}>Importing customers…</Typography>
                    <Typography sx={{ fontSize: 12, color: "#6B7280", fontFamily: FONT }}>{progress}%</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={progress}
                    sx={{ height: 6, borderRadius: 3, backgroundColor: "#F3F4F6", "& .MuiLinearProgress-bar": { backgroundColor: "#FF3D01", borderRadius: 3 } }} />
                </Box>
              )}

              {/* Footer */}
              <Box sx={{ display: "flex", gap: 1.5, pt: 0.5, borderTop: "1px solid #F3F4F6" }}>
                <Button fullWidth variant="outlined" onClick={handleClose} disabled={importing}
                  sx={{
                    textTransform: "none", fontSize: 13, fontWeight: 600, fontFamily: FONT,
                    height: 42, borderRadius: "10px",
                    borderColor: "#D1D5DB", color: "#374151",
                    "&:hover": { borderColor: "#9CA3AF", backgroundColor: "#F9FAFB" },
                  }}>
                  Cancel
                </Button>
                <Button fullWidth variant="contained"
                  onClick={handleImport}
                  disabled={!validRows.length || importing}
                  sx={{
                    textTransform: "none", fontSize: 13, fontWeight: 700, fontFamily: FONT,
                    height: 42, borderRadius: "10px",
                    background: validRows.length && !importing ? "linear-gradient(135deg,#FF3D01,#c62a2f)" : "#F3F4F6",
                    color: validRows.length && !importing ? "#FFF" : "#D1D5DB",
                    boxShadow: validRows.length && !importing ? "0 4px 12px rgba(232,53,58,.3)" : "none",
                    "&:hover": { background: validRows.length && !importing ? "linear-gradient(135deg,#c62a2f,#a02020)" : "#F3F4F6" },
                    "&.Mui-disabled": { background: "#F3F4F6", color: "#D1D5DB" },
                  }}>
                  {importing
                    ? <CircularProgress size={16} sx={{ color: "#fff" }} />
                    : `Import ${validRows.length || ""} Customer${validRows.length !== 1 ? "s" : ""}`}
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Box>
    </Modal>
  );
}
