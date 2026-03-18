import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import {
  Box, Typography, Button, Paper, Chip, Table, TableHead, TableBody, TableRow,
  TableCell, TableContainer, Select, MenuItem, Divider, Stack,
} from "@mui/material";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, CartesianGrid,
} from "recharts";
import data from "../data/reportsDummyData.json";
import toast from "react-hot-toast";

function exportCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  const esc = (v: string | number | null | undefined) => {
    const s = v == null ? "" : String(v);
    return s.includes(",") || s.includes('"') || s.includes("\n")
      ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [headers.join(","), ...rows.map(r => r.map(esc).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
  toast.success("CSV exported!");
}

// ── Design tokens ──────────────────────────────────────────────────────────
const T = {
  ac: "#FF3D01", acH: "#e03500", acDim: "rgba(255,61,1,0.07)", acMid: "rgba(255,61,1,0.13)", acBdr: "rgba(255,61,1,0.25)",
  bg: "#f5f0ea", w: "#fff", s1: "#faf7f3", s2: "#f0ebe3",
  bd: "#e2d9d0", bd2: "#cec4b8",
  grn: "#186b35", grnDim: "rgba(24,107,53,0.09)", grnBdr: "rgba(24,107,53,0.22)",
  blu: "#1a4fcc", bluDim: "rgba(26,79,204,0.08)", bluBdr: "rgba(26,79,204,0.22)",
  pur: "#6d28d9", purDim: "rgba(109,40,217,0.08)",
  amb: "#92400e", ambDim: "rgba(146,64,14,0.08)",
  tel: "#0f766e", telDim: "rgba(15,118,110,0.08)",
  red: "#b91c1c", redDim: "rgba(185,28,28,0.08)", redBdr: "rgba(185,28,28,0.22)",
  tx: "#16100a", t2: "#6b5c48", t3: "#a4927e",
};

type ReportKey = "sales"|"item"|"category"|"delivery"|"expense"|"cancelled"|"removedkot"|"refund"|"tax"|"outstanding"|"inventory"|"stock";
type BadgeVariant = "ac"|"grn"|"blu"|"pur"|"tel"|"amb"|"ora"|"red";
type StatusVariant = "green"|"red"|"amber"|"blue";

const ACCENT_MAP: Record<string, { dim: string; color: string }> = {
  ac: { dim: T.acDim, color: T.ac },
  grn: { dim: T.grnDim, color: T.grn },
  blu: { dim: T.bluDim, color: T.blu },
  pur: { dim: T.purDim, color: T.pur },
  tel: { dim: T.telDim, color: T.tel },
  amb: { dim: T.ambDim, color: T.amb },
  ora: { dim: "rgba(194,65,12,0.08)", color: "#c2410c" },
  red: { dim: T.redDim, color: T.red },
};

// ── Shared MUI-based sub-components ────────────────────────────────────────
function StatCard({ label, value, icon, variant, rows }: {
  label: string; value: string|number; icon: string; variant: BadgeVariant;
  rows?: { key: string; value: React.ReactNode }[];
}) {
  const { dim, color } = ACCENT_MAP[variant] ?? ACCENT_MAP.ac;
  return (
    <Paper elevation={0} sx={{
      border: `1.5px solid ${T.bd}`, borderRadius: "14px", p: "15px 16px", position: "relative",
      overflow: "hidden", transition: "transform .15s, box-shadow .15s", cursor: "default",
      "&:hover": { transform: "translateY(-2px)", boxShadow: "0 6px 22px rgba(0,0,0,0.10)" },
      "&::after": { content: '""', position: "absolute", bottom: 0, left: 0, right: 0, height: 3, background: color, borderRadius: "0 0 14px 14px" },
    }}>
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 1 }}>
        <Typography sx={{ fontSize: 10.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".5px", color: T.t3 }}>{label}</Typography>
        <Box sx={{ width: 28, height: 28, borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, background: dim }}>{icon}</Box>
      </Box>
      <Typography sx={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color, mb: 1 }}>{value}</Typography>
      {rows && (
        <Box sx={{ borderTop: `1px solid ${T.bd}`, pt: "7px", display: "flex", flexDirection: "column", gap: "4px" }}>
          {rows.map((r, i) => (
            <Box key={i} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 11.5 }}>
              <Typography sx={{ color: T.t3, fontWeight: 500, fontSize: 11.5 }}>{r.key}</Typography>
              <Box>{r.value}</Box>
            </Box>
          ))}
        </Box>
      )}
    </Paper>
  );
}

function SChip({ children, color, bg }: { children: React.ReactNode; color: string; bg: string }) {
  return <Chip label={children} size="small" sx={{ background: bg, color, fontWeight: 800, fontSize: 10, height: 18, "& .MuiChip-label": { px: "7px" } }} />;
}

function StatusChip({ children, variant }: { children: React.ReactNode; variant: StatusVariant }) {
  const vs: Record<StatusVariant, { bg: string; color: string }> = {
    green: { bg: T.grnDim, color: T.grn },
    red: { bg: T.redDim, color: T.red },
    amber: { bg: T.ambDim, color: T.amb },
    blue: { bg: T.bluDim, color: T.blu },
  };
  const v = vs[variant];
  return <Chip label={children} size="small" sx={{ background: v.bg, color: v.color, fontWeight: 700, fontSize: 11, height: 22, borderRadius: "20px", "& .MuiChip-label": { px: "10px" } }} />;
}

function OChip({ children }: { children: React.ReactNode }) {
  return <Chip label={children} size="small" sx={{ background: T.bluDim, color: T.blu, fontWeight: 800, fontSize: 12, height: 24, borderRadius: "6px", "& .MuiChip-label": { px: "5px" } }} />;
}

function PageHeader({ title, sub, onExport, onPrint, exportLabel }: {
  title: string; sub: React.ReactNode; onExport?: () => void; onPrint?: () => void; exportLabel?: string;
}) {
  return (
    <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: "18px" }}>
      <Box>
        <Typography sx={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 700, color: T.tx }}>{title}</Typography>
        <Typography sx={{ fontSize: 12, color: T.t3, mt: "4px", fontWeight: 500 }}>{sub}</Typography>
      </Box>
      <Stack direction="row" spacing={1}>
        {onExport && (
          <Button variant="outlined" size="small" startIcon={<FileDownloadOutlinedIcon sx={{ fontSize: "15px !important" }} />} onClick={onExport}
            sx={{ borderColor: T.bd, color: T.t2, borderRadius: "9px", fontWeight: 700, fontSize: 12.5, textTransform: "none", "&:hover": { borderColor: T.bd2, background: T.s1 } }}>
            {exportLabel || "Export CSV"}
          </Button>
        )}
        {onPrint && (
          <Button variant="contained" size="small" startIcon={<PrintOutlinedIcon sx={{ fontSize: "15px !important" }} />} onClick={onPrint}
            sx={{ background: T.ac, color: "#fff", borderRadius: "9px", fontWeight: 700, fontSize: 12.5, textTransform: "none", boxShadow: "0 2px 8px rgba(255,61,1,0.25)", "&:hover": { background: T.acH } }}>
            Print PDF
          </Button>
        )}
      </Stack>
    </Box>
  );
}

function FilterBar({ children }: { children: React.ReactNode }) {
  return (
    <Paper elevation={0} sx={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", p: "11px 16px", border: `1.5px solid ${T.bd}`, borderRadius: "14px", mb: "18px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
      {children}
    </Paper>
  );
}

const fLabel = <T extends React.ReactNode>({ label }: { label: T }) => (
  <Typography sx={{ fontSize: 12, fontWeight: 600, color: T.t2, whiteSpace: "nowrap" }}>{label}</Typography>
);
const flSx = { fontSize: 12, fontWeight: 600, color: T.t2, whiteSpace: "nowrap" as const };
const fSepSx = { fontSize: 12, fontWeight: 500, color: T.t3 };
const fSelSx = { fontSize: "12.5px", fontWeight: 600, color: T.tx, background: T.s1, borderRadius: "8px", "& .MuiOutlinedInput-notchedOutline": { borderColor: T.bd }, "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: T.bd2 }, "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: T.ac } };
const fInputSx = { "& .MuiOutlinedInput-root": { fontSize: 12.5, fontWeight: 600, background: T.s1, borderRadius: "8px", "& fieldset": { borderColor: T.bd }, "&:hover fieldset": { borderColor: T.bd2 }, "&.Mui-focused fieldset": { borderColor: T.ac } }, "& input": { py: "7px", px: "10px" } };

function FiltSel({ value, onChange, children }: { value: string; onChange: (v: string) => void; children: React.ReactNode }) {
  return (
    <Select value={value} onChange={e => onChange(e.target.value as string)} size="small" sx={fSelSx}>
      {children}
    </Select>
  );
}

function TCard({ title, badge, badgeGreen, children }: { title: string; badge: string; badgeGreen?: boolean; children: React.ReactNode }) {
  return (
    <Paper elevation={0} sx={{ border: `1.5px solid ${T.bd}`, borderRadius: "14px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden", mb: "18px" }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: "14px 18px", borderBottom: `1px solid ${T.bd}` }}>
        <Typography sx={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, color: T.tx }}>{title}</Typography>
        <Chip label={badge} size="small" sx={{ fontSize: 11, fontWeight: 700, background: badgeGreen ? T.grnDim : T.acDim, color: badgeGreen ? T.grn : T.ac, border: `1px solid ${badgeGreen ? T.grnBdr : T.acBdr}`, borderRadius: "20px" }} />
      </Box>
      <TableContainer sx={{ "&::-webkit-scrollbar": { height: 4 }, "&::-webkit-scrollbar-thumb": { background: T.bd2, borderRadius: 4 } }}>
        {children}
      </TableContainer>
    </Paper>
  );
}

const thSx = { fontSize: 10.5, fontWeight: 800, textTransform: "uppercase" as const, letterSpacing: ".5px", color: T.t3, borderBottom: `1.5px solid ${T.bd}`, background: T.s1, whiteSpace: "nowrap" as const, py: "10px", px: "14px" };
const thRSx = { ...thSx, textAlign: "right" as const };
const tdSx = { fontSize: 13, color: T.tx, borderBottom: `1px solid ${T.bd}`, py: "11px", px: "14px" };
const tdRSx = { ...tdSx, textAlign: "right" as const, fontWeight: 700, fontFamily: "'Playfair Display',serif" };

function ChartCard({ title, sub, total, totalLabel, children }: {
  title: string; sub?: string; total?: string; totalLabel?: string; children: React.ReactNode;
}) {
  return (
    <Paper elevation={0} sx={{ border: `1.5px solid ${T.bd}`, borderRadius: "14px", p: "18px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: "14px" }}>
        <Box>
          <Typography sx={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, color: T.tx }}>{title}</Typography>
          {sub && <Typography sx={{ fontSize: 11, color: T.t3, mt: "2px" }}>{sub}</Typography>}
        </Box>
        {total && (
          <Box sx={{ textAlign: "right" }}>
            <Typography sx={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, color: T.ac }}>{total}</Typography>
            {totalLabel && <Typography sx={{ fontSize: 11, color: T.t3, mt: "2px" }}>{totalLabel}</Typography>}
          </Box>
        )}
      </Box>
      <Box sx={{ height: 200 }}>{children}</Box>
    </Paper>
  );
}

function PbarSection({ title, items, footer }: {
  title: string;
  items: { label: string; pct: number; value: string; color: string }[];
  footer?: React.ReactNode;
}) {
  return (
    <Paper elevation={0} sx={{ border: `1.5px solid ${T.bd}`, borderRadius: "14px", p: "18px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
      <Typography sx={{ fontFamily: "'Playfair Display',serif", fontSize: 15, fontWeight: 700, color: T.tx, mb: "14px" }}>{title}</Typography>
      {items.map((item, i) => (
        <Box key={i} sx={{ display: "flex", alignItems: "center", gap: "10px", mb: "10px" }}>
          <Typography sx={{ fontSize: 12, fontWeight: 600, color: T.t2, minWidth: 90, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.label}</Typography>
          <Box sx={{ flex: 1, height: 8, background: T.s2, borderRadius: "4px", overflow: "hidden" }}>
            <Box sx={{ height: "100%", width: `${item.pct}%`, background: item.color, borderRadius: "4px", transition: "width .6s ease" }} />
          </Box>
          <Typography sx={{ fontSize: 12, fontWeight: 800, minWidth: 60, textAlign: "right", color: item.pct > 0 ? item.color : T.t3 }}>{item.value}</Typography>
        </Box>
      ))}
      {footer}
    </Paper>
  );
}

function InfoCard({ title, rows }: { title: string; rows: { key: string; value: string; color?: string }[] }) {
  return (
    <Paper elevation={0} sx={{ border: `1.5px solid ${T.bd}`, borderRadius: "14px", p: "18px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
      <Typography sx={{ fontFamily: "'Playfair Display',serif", fontSize: 15, fontWeight: 700, color: T.tx, mb: "12px", pb: "8px", borderBottom: `1px solid ${T.bd}` }}>{title}</Typography>
      {rows.map((r, i) => (
        <Box key={i} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: "7px", borderBottom: i < rows.length - 1 ? `1px solid ${T.bd}` : "none", fontSize: 13 }}>
          <Typography sx={{ color: T.t2, fontWeight: 500, fontSize: 13 }}>{r.key}</Typography>
          <Typography sx={{ fontWeight: 700, color: r.color || T.tx, fontSize: 13 }}>{r.value}</Typography>
        </Box>
      ))}
    </Paper>
  );
}

const sg4 = { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "12px", mb: "18px" };
const sg6 = { display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: "12px", mb: "18px" };
const chartRow2 = { display: "grid", gridTemplateColumns: "1fr 280px", gap: "16px", mb: "18px" };
const info2 = { display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "16px", mb: "18px" };

// ── Inline style helpers for table hover ──
const trHover = { "&:hover td": { background: T.s1 }, "&:last-child td": { borderBottom: "none" } };
const totalRowSx = { background: T.s1 };

// ── Date range picker ──────────────────────────────────────────────────────
const calBtnSx = {
  display: "flex", alignItems: "center", gap: "5px", px: "10px", py: "6px",
  background: T.s1, border: `1.5px solid ${T.bd}`, borderRadius: "8px",
  cursor: "pointer", userSelect: "none" as const,
  fontSize: 12.5, fontWeight: 600, color: T.tx, fontFamily: "Montserrat,sans-serif",
  "&:hover": { borderColor: T.bd2 },
} as const;
const calDropSx = {
  position: "absolute" as const, top: 38, left: 0, zIndex: 2000,
  boxShadow: "0 8px 24px rgba(0,0,0,.15)", borderRadius: "10px", overflow: "hidden",
};
function DateRange() {
  const [from, setFrom] = useState<Date>(new Date("2026-03-09"));
  const [to, setTo] = useState<Date>(new Date("2026-03-15"));
  const [showFrom, setShowFrom] = useState(false);
  const [showTo, setShowTo] = useState(false);
  const fmt = (d: Date) => d.toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" });
  return (
    <>
      <Typography sx={fSepSx}>From</Typography>
      <Box sx={{ position: "relative" }}>
        <Box sx={calBtnSx} onClick={() => { setShowFrom(v => !v); setShowTo(false); }}>
          <span>📅</span><span>{fmt(from)}</span>
        </Box>
        {showFrom && (
          <Box sx={calDropSx}>
            <Calendar value={from} onChange={(d) => { setFrom(d as Date); setShowFrom(false); }} />
          </Box>
        )}
      </Box>
      <Typography sx={fSepSx}>To</Typography>
      <Box sx={{ position: "relative" }}>
        <Box sx={calBtnSx} onClick={() => { setShowTo(v => !v); setShowFrom(false); }}>
          <span>📅</span><span>{fmt(to)}</span>
        </Box>
        {showTo && (
          <Box sx={calDropSx}>
            <Calendar minDate={from} value={to} onChange={(d) => { setTo(d as Date); setShowTo(false); }} />
          </Box>
        )}
      </Box>
    </>
  );
}

// ── 12 Report Sections ─────────────────────────────────────────────────────

function SalesReport() {
  const s = data.sales;
  const [period, setPeriod] = useState("Current Week");
  return (
    <div>
      <PageHeader title="Sales Report" sub={<>Sales data <b>09/03/2026 – 15/03/2026</b> · Each day 12:00 AM – 11:59 PM</>} onExport={() => exportCSV("sales_report.csv", ["Date","Orders","GST 5%","Total Tax","Cash","UPI","Card","Due","Discount","Total"], s.dailyBreakdown.map(r => [r.date,r.orders,r.gst5,r.totalTax,r.cash,r.upi,r.card,r.due,r.discount,r.total]))} onPrint={() => toast.success("PDF Generated!")} />
      <FilterBar>
        <Typography sx={flSx}>Period:</Typography>
        <FiltSel value={period} onChange={setPeriod}><MenuItem value="Current Week">Current Week</MenuItem><MenuItem value="Today">Today</MenuItem><MenuItem value="Last 30 Days">Last 30 Days</MenuItem></FiltSel>
        <DateRange />
      </FilterBar>
      <Box sx={sg6}>
        <StatCard label="Total Sales" value="₹745" icon="💰" variant="ac" rows={[{ key: "Orders", value: <SChip color={T.blu} bg={T.bluDim}>5</SChip> }, { key: "Avg/Order", value: <b>₹149</b> }]} />
        <StatCard label="Cash Received" value="₹745" icon="💵" variant="grn" rows={[{ key: "Cash", value: <b>₹745</b> }, { key: "Other", value: <b>₹0</b> }]} />
        <StatCard label="Gateway" value="₹0" icon="🔗" variant="blu" rows={[{ key: "Razorpay", value: <b>₹0</b> }, { key: "Status", value: <SChip color={T.grn} bg={T.grnDim}>Active</SChip> }]} />
        <StatCard label="Additional" value="₹0" icon="➕" variant="pur" rows={[{ key: "Charges", value: <b>₹0</b> }, { key: "Discount", value: <b>₹0</b> }]} />
        <StatCard label="Tax (GST 5%)" value="₹192.50" icon="🧾" variant="tel" rows={[{ key: "Mode", value: <SChip color={T.blu} bg={T.bluDim}>Item</SChip> }, { key: "Total Tax", value: <b>₹192.50</b> }]} />
        <StatCard label="Outstanding" value="₹0" icon="⏳" variant="amb" rows={[{ key: "Orders", value: <SChip color={T.grn} bg={T.grnDim}>0</SChip> }, { key: "Status", value: <SChip color={T.grn} bg={T.grnDim}>Clear</SChip> }]} />
      </Box>
      <Box sx={chartRow2}>
        <ChartCard title="Daily Sales Trend" sub="Revenue per day this week" total="₹745" totalLabel="Period Total">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={s.chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={T.ac} stopOpacity={0.18} /><stop offset="95%" stopColor={T.ac} stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke={T.bd} />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: T.t3 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: T.t3 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v}`} />
              <Tooltip formatter={(v: number) => [`₹${v}`, "Sales"]} contentStyle={{ fontFamily: "Montserrat,sans-serif", fontSize: 12 }} />
              <Area type="monotone" dataKey="sales" stroke={T.ac} strokeWidth={2.5} fill="url(#sg)" dot={{ fill: T.ac, r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
        <PbarSection title="Payment Methods" items={[
          { label: "Cash", pct: 100, value: "₹745", color: T.grn },
          { label: "UPI", pct: 0, value: "₹0", color: T.blu },
          { label: "Card", pct: 0, value: "₹0", color: T.pur },
          { label: "Bank", pct: 0, value: "₹0", color: T.tel },
        ]} footer={
          <Box sx={{ borderTop: `1px solid ${T.bd}`, mt: 1, pt: 1 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", fontSize: 12, mb: "5px" }}><Typography sx={{ color: T.t3, fontSize: 12 }}>Total Tax</Typography><Typography sx={{ fontWeight: 800, color: T.tel, fontSize: 12 }}>₹192.50</Typography></Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}><Typography sx={{ color: T.t3, fontSize: 12 }}>Discount</Typography><Typography sx={{ fontWeight: 800, color: T.red, fontSize: 12 }}>₹0</Typography></Box>
          </Box>
        } />
      </Box>
      <TCard title="Detailed Sales" badge="5 records">
        <Table size="small" sx={{ minWidth: 700 }}>
          <TableHead><TableRow>
            {["Date", "Orders", "GST 5%", "Total Tax", "Cash", "UPI", "Card", "Due", "Discount", "Total"].map((h, i) => (
              <TableCell key={h} sx={i > 0 ? thRSx : thSx}>{h}</TableCell>
            ))}
          </TableRow></TableHead>
          <TableBody>
            {s.dailyBreakdown.map((row, i) => (
              <TableRow key={i} sx={trHover}>
                <TableCell sx={{ ...tdSx, fontWeight: 700 }}>{row.date}</TableCell>
                <TableCell sx={tdRSx}><OChip>{row.orders}</OChip></TableCell>
                <TableCell sx={tdRSx}>₹{row.gst5.toFixed(2)}</TableCell>
                <TableCell sx={tdRSx}>₹{row.totalTax.toFixed(2)}</TableCell>
                <TableCell sx={{ ...tdRSx, color: T.grn }}>₹{row.cash.toFixed(2)}</TableCell>
                <TableCell sx={tdRSx}>₹{row.upi}</TableCell>
                <TableCell sx={tdRSx}>₹{row.card}</TableCell>
                <TableCell sx={tdRSx}>₹{row.due}</TableCell>
                <TableCell sx={tdRSx}>₹{row.discount}</TableCell>
                <TableCell sx={{ ...tdRSx, color: T.ac }}>₹{row.total.toFixed(2)}</TableCell>
              </TableRow>
            ))}
            <TableRow sx={totalRowSx}>
              <TableCell sx={{ ...tdSx, fontWeight: 800, color: T.ac }}>Total</TableCell>
              <TableCell sx={tdRSx}><OChip>5</OChip></TableCell>
              <TableCell sx={{ ...tdRSx, fontWeight: 800 }}>₹192.50</TableCell>
              <TableCell sx={{ ...tdRSx, fontWeight: 800 }}>₹192.50</TableCell>
              <TableCell sx={{ ...tdRSx, color: T.grn, fontSize: 14 }}>₹745.00</TableCell>
              <TableCell sx={tdRSx}>₹0</TableCell>
              <TableCell sx={tdRSx}>₹0</TableCell>
              <TableCell sx={tdRSx}>₹0</TableCell>
              <TableCell sx={tdRSx}>₹0</TableCell>
              <TableCell sx={{ ...tdRSx, color: T.ac, fontSize: 15 }}>₹745.00</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TCard>
    </div>
  );
}

function ItemReport() {
  const d = data.items;
  const typeVariant = (t: string): StatusVariant => t === "Veg" ? "green" : t === "Non-Veg" ? "red" : "amber";
  return (
    <div>
      <PageHeader title="Item Report" sub={<>Best selling items · <b>09/03/2026 – 15/03/2026</b></>} onExport={() => exportCSV("item_report.csv", ["Rank","Item Name","Category","Type","Qty Sold","Unit Price","Total Revenue","Tax","Share"], d.itemSales.map(r => [r.rank,r.name,r.category,r.type,r.qty,r.unitPrice,r.revenue,r.tax,r.share]))} onPrint={() => toast.success("PDF Generated!")} />
      <FilterBar>
        <Typography sx={flSx}>Period:</Typography>
        <Select defaultValue="Current Week" size="small" sx={fSelSx}><MenuItem value="Current Week">Current Week</MenuItem><MenuItem value="Today">Today</MenuItem></Select>
        <DateRange />
      </FilterBar>
      <Box sx={sg4}>
        <StatCard label="Total Items Sold" value={d.totalItemsSold} icon="🍽️" variant="ac" rows={[{ key: "Unique Items", value: <b>{d.uniqueItems}</b> }, { key: "Top Item", value: <SChip color={T.blu} bg={T.bluDim}>{d.topItem}</SChip> }]} />
        <StatCard label="Veg Items" value={d.vegItems} icon="🥦" variant="grn" rows={[{ key: "Revenue", value: <b>₹{d.vegRevenue}</b> }, { key: "Share", value: <SChip color={T.grn} bg={T.grnDim}>{d.vegShare}%</SChip> }]} />
        <StatCard label="Non-Veg Items" value={d.nonVegItems} icon="🍗" variant="blu" rows={[{ key: "Revenue", value: <b>₹{d.nonVegRevenue}</b> }, { key: "Share", value: <SChip color={T.blu} bg={T.bluDim}>{d.nonVegShare}%</SChip> }]} />
        <StatCard label="Avg Item Price" value={`₹${d.avgItemPrice}`} icon="💲" variant="amb" rows={[{ key: "Min Price", value: <b>₹{d.minPrice}</b> }, { key: "Max Price", value: <b>₹{d.maxPrice}</b> }]} />
      </Box>
      <Box sx={chartRow2}>
        <ChartCard title="Top Items by Quantity" sub="Most ordered this period">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={d.topItemsChart} margin={{ top: 4, right: 4, left: 0, bottom: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={T.bd} />
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: T.t3 }} angle={-35} textAnchor="end" interval={0} />
              <YAxis tick={{ fontSize: 10, fill: T.t3 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontFamily: "Montserrat,sans-serif", fontSize: 12 }} />
              <Bar dataKey="qty" fill={T.ac} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <PbarSection title="Revenue by Item" items={d.revenueByItem.map(it => ({ label: it.name, pct: it.pct, value: `₹${it.revenue}`, color: it.color }))} />
      </Box>
      <TCard title="Item-wise Sales" badge={`${d.itemSales.length} items`}>
        <Table size="small" sx={{ minWidth: 700 }}>
          <TableHead><TableRow>
            {["#","Item Name","Category","Type"].map(h => <TableCell key={h} sx={thSx}>{h}</TableCell>)}
            {["Qty Sold","Unit Price","Total Revenue","Tax","Share"].map(h => <TableCell key={h} sx={thRSx}>{h}</TableCell>)}
          </TableRow></TableHead>
          <TableBody>
            {d.itemSales.map((row, i) => (
              <TableRow key={i} sx={trHover}>
                <TableCell sx={tdSx}>{row.rank}</TableCell>
                <TableCell sx={{ ...tdSx, fontWeight: 700 }}>{row.name}</TableCell>
                <TableCell sx={tdSx}>{row.category}</TableCell>
                <TableCell sx={tdSx}><StatusChip variant={typeVariant(row.type)}>{row.type}</StatusChip></TableCell>
                <TableCell sx={tdRSx}><OChip>{row.qty}</OChip></TableCell>
                <TableCell sx={tdRSx}>₹{row.unitPrice}</TableCell>
                <TableCell sx={{ ...tdRSx, color: T.ac }}>₹{row.revenue}</TableCell>
                <TableCell sx={tdRSx}>₹{row.tax.toFixed(2)}</TableCell>
                <TableCell sx={{ ...tdRSx, color: T.grn }}>{row.share}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TCard>
    </div>
  );
}

function CategoryReport() {
  const d = data.categories;
  return (
    <div>
      <PageHeader title="Category Report" sub={<>Sales by menu category · <b>09/03/2026 – 15/03/2026</b></>} onExport={() => exportCSV("category_report.csv", ["Rank","Category","Items Sold","Orders","Revenue","Tax","Discount","Net Total","Share"], d.categorySales.map(r => [r.rank,r.category,r.items,r.orders,r.revenue,r.tax,r.discount,r.net,r.share]))} onPrint={() => toast.success("PDF Generated!")} />
      <FilterBar>
        <Typography sx={flSx}>Period:</Typography>
        <Select defaultValue="Current Week" size="small" sx={fSelSx}><MenuItem value="Current Week">Current Week</MenuItem><MenuItem value="Today">Today</MenuItem></Select>
        <DateRange />
      </FilterBar>
      <Box sx={sg4}>
        <StatCard label="Categories Active" value={d.activeCategories} icon="📂" variant="ac" rows={[{ key: "Total Items", value: <b>{d.totalItemsSold}</b> }, { key: "Top Category", value: <SChip color={T.blu} bg={T.bluDim}>{d.topCategory}</SChip> }]} />
        <StatCard label="Top Revenue" value={`₹${d.topRevenue}`} icon="🥇" variant="grn" rows={[{ key: "Category", value: <b>{d.topCategory}</b> }, { key: "Share", value: <SChip color={T.grn} bg={T.grnDim}>{d.topCategoryShare}%</SChip> }]} />
        <StatCard label="Avg per Cat" value={`₹${d.avgPerCategory}`} icon="📊" variant="blu" rows={[{ key: "Avg Orders", value: <b>{d.avgOrders}</b> }, { key: "Variance", value: <SChip color={T.amb} bg={T.ambDim}>High</SChip> }]} />
        <StatCard label="Least Ordered" value={d.leastOrdered} icon="📉" variant="tel" rows={[{ key: "Orders", value: <b>0</b> }, { key: "Revenue", value: <b>₹0</b> }]} />
      </Box>
      <Box sx={chartRow2}>
        <ChartCard title="Revenue by Category" sub="Comparison this period">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={d.chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={T.bd} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: T.t3 }} />
              <YAxis tick={{ fontSize: 10, fill: T.t3 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v}`} />
              <Tooltip formatter={(v: number) => [`₹${v}`, "Revenue"]} contentStyle={{ fontFamily: "Montserrat,sans-serif", fontSize: 12 }} />
              <Bar dataKey="revenue" fill={T.ac} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <PbarSection title="Category Breakdown" items={d.breakdown.map(b => ({ label: b.name, pct: b.pct, value: `₹${b.revenue}`, color: b.color }))} />
      </Box>
      <TCard title="Category-wise Sales" badge={`${d.categorySales.length} categories`}>
        <Table size="small" sx={{ minWidth: 700 }}>
          <TableHead><TableRow>
            {["#","Category"].map(h => <TableCell key={h} sx={thSx}>{h}</TableCell>)}
            {["Items Sold","Orders","Revenue","Tax","Discount","Net Total","Share"].map(h => <TableCell key={h} sx={thRSx}>{h}</TableCell>)}
          </TableRow></TableHead>
          <TableBody>
            {d.categorySales.map((row, i) => (
              <TableRow key={i} sx={trHover}>
                <TableCell sx={tdSx}>{row.rank}</TableCell>
                <TableCell sx={{ ...tdSx, fontWeight: 700 }}>{row.category}</TableCell>
                <TableCell sx={tdRSx}><OChip>{row.items}</OChip></TableCell>
                <TableCell sx={tdRSx}>{row.orders}</TableCell>
                <TableCell sx={{ ...tdRSx, color: T.grn }}>₹{row.revenue}</TableCell>
                <TableCell sx={tdRSx}>₹{row.tax.toFixed(2)}</TableCell>
                <TableCell sx={tdRSx}>₹{row.discount}</TableCell>
                <TableCell sx={{ ...tdRSx, color: T.ac }}>₹{row.net}</TableCell>
                <TableCell sx={tdRSx}>{row.share}</TableCell>
              </TableRow>
            ))}
            <TableRow sx={totalRowSx}>
              <TableCell colSpan={4} sx={{ ...tdSx, fontWeight: 800, color: T.ac }}>Total</TableCell>
              <TableCell sx={{ ...tdRSx, color: T.grn, fontSize: 14 }}>₹1160</TableCell>
              <TableCell sx={{ ...tdRSx, fontWeight: 800 }}>₹55.22</TableCell>
              <TableCell sx={tdRSx}>₹0</TableCell>
              <TableCell sx={{ ...tdRSx, color: T.ac, fontSize: 14 }}>₹745</TableCell>
              <TableCell sx={tdRSx}>100%</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TCard>
    </div>
  );
}

function DeliveryReport() {
  const d = data.delivery;
  const sv = (s: string): StatusVariant => s === "Delivered" ? "green" : s === "Pending" ? "amber" : "red";
  return (
    <div>
      <PageHeader title="Delivery App Report" sub={<>Online delivery platform orders · <b>09/03/2026 – 15/03/2026</b></>} onExport={() => exportCSV("delivery_report.csv", ["Order #","Date","Platform","Customer","Items","Order Amount","Delivery Fee","Commission","Net Amount","Status"], d.orders.map(r => [r.id,r.date,r.platform,r.customer,r.items,r.amount,r.deliveryFee,r.commission,r.net,r.status]))} onPrint={() => toast.success("PDF Generated!")} />
      <FilterBar>
        <Typography sx={flSx}>Platform:</Typography>
        <Select defaultValue="All Platforms" size="small" sx={fSelSx}><MenuItem value="All Platforms">All Platforms</MenuItem><MenuItem value="Swiggy">Swiggy</MenuItem><MenuItem value="Zomato">Zomato</MenuItem><MenuItem value="Direct">Direct</MenuItem></Select>
        <DateRange />
      </FilterBar>
      <Box sx={sg4}>
        <StatCard label="Total Deliveries" value={d.totalDeliveries} icon="🛵" variant="ac" rows={[{ key: "Revenue", value: <b>₹{d.deliveryRevenue}</b> }, { key: "Avg Delivery", value: <b>₹{d.avgDeliveryAmount}</b> }]} />
        <StatCard label="Delivery Charges" value={`₹${d.deliveryChargesTotal}`} icon="🏷️" variant="grn" rows={[{ key: "Avg Charge", value: <b>₹{d.avgDeliveryCharge}</b> }, { key: "Free Deliveries", value: <b>{d.freeDeliveries}</b> }]} />
        <StatCard label="Platform Commission" value={`₹${d.platformCommission}`} icon="💸" variant="blu" rows={[{ key: "Rate", value: <b>{d.commissionRate}</b> }, { key: "Net After", value: <b>₹{d.netAfterCommission}</b> }]} />
        <StatCard label="Avg Delivery Time" value={`${d.avgDeliveryTime} min`} icon="⏱️" variant="tel" rows={[{ key: "Fastest", value: <b>{d.fastestDelivery} min</b> }, { key: "Slowest", value: <b>{d.slowestDelivery} min</b> }]} />
      </Box>
      <TCard title="Delivery Orders" badge={`${d.orders.length} orders`}>
        <Table size="small" sx={{ minWidth: 800 }}>
          <TableHead><TableRow>
            {["Order #","Date","Platform","Customer"].map(h => <TableCell key={h} sx={thSx}>{h}</TableCell>)}
            {["Items","Order Amount","Delivery Fee","Commission","Net Amount"].map(h => <TableCell key={h} sx={thRSx}>{h}</TableCell>)}
            <TableCell sx={thSx}>Status</TableCell>
          </TableRow></TableHead>
          <TableBody>
            {d.orders.map((row, i) => (
              <TableRow key={i} sx={trHover}>
                <TableCell sx={{ ...tdSx, fontWeight: 700 }}>{row.id}</TableCell>
                <TableCell sx={tdSx}>{row.date}</TableCell>
                <TableCell sx={tdSx}>{row.platform}</TableCell>
                <TableCell sx={tdSx}>{row.customer}</TableCell>
                <TableCell sx={tdRSx}><OChip>{row.items}</OChip></TableCell>
                <TableCell sx={{ ...tdRSx, color: T.grn }}>₹{row.amount}</TableCell>
                <TableCell sx={tdRSx}>₹{row.deliveryFee}</TableCell>
                <TableCell sx={{ ...tdRSx, color: T.red }}>₹{row.commission}</TableCell>
                <TableCell sx={{ ...tdRSx, color: T.ac }}>₹{row.net}</TableCell>
                <TableCell sx={tdSx}><StatusChip variant={sv(row.status)}>{row.status}</StatusChip></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TCard>
    </div>
  );
}

function ExpenseReport() {
  const d = data.expenses;
  const sv = (s: string): StatusVariant => s === "Paid" ? "green" : s === "Partial" ? "amber" : "blue";
  return (
    <div>
      <PageHeader title="Expense Reports" sub={<>Business expenses & overheads · <b>March 2026</b></>} onExport={() => exportCSV("expense_report.csv", ["Date","Description","Category","Vendor","Added By","Amount","Payment","Status"], d.entries.map(r => [r.date,r.description,r.category,r.vendor,r.addedBy,r.amount,r.payment,r.status]))} onPrint={() => toast.success("PDF Generated!")} />
      <FilterBar>
        <Typography sx={flSx}>Category:</Typography>
        <Select defaultValue="All Categories" size="small" sx={fSelSx}><MenuItem value="All Categories">All Categories</MenuItem><MenuItem value="Raw Material">Raw Material</MenuItem><MenuItem value="Utilities">Utilities</MenuItem><MenuItem value="Salary">Salary</MenuItem></Select>
        <Typography sx={fSepSx}>Month:</Typography>
        <Select defaultValue="March 2026" size="small" sx={fSelSx}><MenuItem value="March 2026">March 2026</MenuItem><MenuItem value="February 2026">February 2026</MenuItem></Select>
      </FilterBar>
      <Box sx={sg4}>
        <StatCard label="Total Expenses" value="₹12,450" icon="💸" variant="ac" rows={[{ key: "vs Last Month", value: <SChip color={T.red} bg={T.redDim}>+8%</SChip> }, { key: "Entries", value: <b>{d.totalEntries}</b> }]} />
        <StatCard label="Raw Material" value={`₹${d.rawMaterial.toLocaleString()}`} icon="🛒" variant="grn" rows={[{ key: "Share", value: <SChip color={T.grn} bg={T.grnDim}>{d.rawMaterialShare}</SChip> }, { key: "Entries", value: <b>{d.rawMaterialEntries}</b> }]} />
        <StatCard label="Utilities" value={`₹${d.utilities.toLocaleString()}`} icon="💡" variant="blu" rows={[{ key: "Share", value: <SChip color={T.blu} bg={T.bluDim}>{d.utilitiesShare}</SChip> }, { key: "Entries", value: <b>{d.utilitiesEntries}</b> }]} />
        <StatCard label="Salary & Others" value={`₹${d.salaryOthers.toLocaleString()}`} icon="👨‍💼" variant="amb" rows={[{ key: "Share", value: <SChip color={T.amb} bg={T.ambDim}>{d.salaryShare}</SChip> }, { key: "Entries", value: <b>{d.salaryEntries}</b> }]} />
      </Box>
      <TCard title="Expense Entries" badge={`${d.entries.length} entries`}>
        <Table size="small" sx={{ minWidth: 750 }}>
          <TableHead><TableRow>
            {["Date","Description","Category","Vendor","Added By"].map(h => <TableCell key={h} sx={thSx}>{h}</TableCell>)}
            <TableCell sx={thRSx}>Amount</TableCell>
            {["Payment","Status"].map(h => <TableCell key={h} sx={thSx}>{h}</TableCell>)}
          </TableRow></TableHead>
          <TableBody>
            {d.entries.map((row, i) => (
              <TableRow key={i} sx={trHover}>
                <TableCell sx={{ ...tdSx, fontWeight: 700 }}>{row.date}</TableCell>
                <TableCell sx={tdSx}>{row.description}</TableCell>
                <TableCell sx={tdSx}>{row.category}</TableCell>
                <TableCell sx={tdSx}>{row.vendor}</TableCell>
                <TableCell sx={tdSx}>{row.addedBy}</TableCell>
                <TableCell sx={{ ...tdRSx, color: T.ac }}>₹{row.amount.toLocaleString()}</TableCell>
                <TableCell sx={tdSx}>{row.payment}</TableCell>
                <TableCell sx={tdSx}><StatusChip variant={sv(row.status)}>{row.status}</StatusChip></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TCard>
    </div>
  );
}

function CancelledReport() {
  const d = data.cancelledOrders;
  const kotV = (s: string): StatusVariant => s === "Before KOT" ? "green" : "red";
  return (
    <div>
      <PageHeader title="Cancelled Order Report" sub={<>Orders cancelled before completion · <b>09/03/2026 – 15/03/2026</b></>} onExport={() => exportCSV("cancelled_orders.csv", ["Order #","Date","Channel","Table","Waiter","Items","Order Value","Cancelled By","Reason","KOT Status"], d.orders.map(r => [r.id,r.date,r.channel,r.table,r.waiter,r.items,r.value,r.cancelledBy,r.reason,r.kotStatus]))} onPrint={() => toast.success("PDF Generated!")} />
      <FilterBar>
        <Typography sx={flSx}>Channel:</Typography>
        <Select defaultValue="All Channels" size="small" sx={fSelSx}><MenuItem value="All Channels">All Channels</MenuItem><MenuItem value="Dine In">Dine In</MenuItem><MenuItem value="Delivery">Delivery</MenuItem><MenuItem value="Pickup">Pickup</MenuItem></Select>
        <DateRange />
      </FilterBar>
      <Box sx={sg4}>
        <StatCard label="Cancelled Orders" value={d.count} icon="❌" variant="ac" rows={[{ key: "Lost Revenue", value: <Typography sx={{ fontWeight: 700, color: T.red, fontSize: 11.5 }}>₹{d.lostRevenue}</Typography> }, { key: "Cancel Rate", value: <SChip color={T.red} bg={T.redDim}>{d.cancelRate}</SChip> }]} />
        <StatCard label="Before KOT" value={d.beforeKot} icon="🕐" variant="amb" rows={[{ key: "Revenue Impact", value: <b>₹{d.beforeKotRevenue}</b> }, { key: "Share", value: <SChip color={T.amb} bg={T.ambDim}>{d.beforeKotShare}</SChip> }]} />
        <StatCard label="After KOT" value={d.afterKot} icon="🍳" variant="blu" rows={[{ key: "Food Wasted", value: <b>₹{d.afterKotRevenue}</b> }, { key: "Share", value: <SChip color={T.blu} bg={T.bluDim}>{d.afterKotShare}</SChip> }]} />
        <StatCard label="Top Reason" value="No Show" icon="📝" variant="tel" rows={[{ key: "Count", value: <b>{d.topReasonCount}</b> }, { key: "Other", value: <b>Wrong Order</b> }]} />
      </Box>
      <TCard title="Cancelled Orders" badge={`${d.orders.length} orders`}>
        <Table size="small" sx={{ minWidth: 800 }}>
          <TableHead><TableRow>
            {["Order #","Date","Channel","Table","Waiter"].map(h => <TableCell key={h} sx={thSx}>{h}</TableCell>)}
            <TableCell sx={thRSx}>Items</TableCell>
            <TableCell sx={thRSx}>Order Value</TableCell>
            {["Cancelled By","Reason","KOT Status"].map(h => <TableCell key={h} sx={thSx}>{h}</TableCell>)}
          </TableRow></TableHead>
          <TableBody>
            {d.orders.map((row, i) => (
              <TableRow key={i} sx={trHover}>
                <TableCell sx={{ ...tdSx, fontWeight: 700 }}>{row.id}</TableCell>
                <TableCell sx={tdSx}>{row.date}</TableCell>
                <TableCell sx={tdSx}>{row.channel}</TableCell>
                <TableCell sx={tdSx}>{row.table}</TableCell>
                <TableCell sx={tdSx}>{row.waiter}</TableCell>
                <TableCell sx={tdRSx}><OChip>{row.items}</OChip></TableCell>
                <TableCell sx={{ ...tdRSx, color: T.red }}>₹{row.value}</TableCell>
                <TableCell sx={tdSx}>{row.cancelledBy}</TableCell>
                <TableCell sx={tdSx}>{row.reason}</TableCell>
                <TableCell sx={tdSx}><StatusChip variant={kotV(row.kotStatus)}>{row.kotStatus}</StatusChip></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TCard>
    </div>
  );
}

function RemovedKotReport() {
  const d = data.removedKotItems;
  return (
    <div>
      <PageHeader title="Removed KOT Item Report" sub={<>Items removed from KOT after kitchen confirmation · <b>09/03/2026 – 15/03/2026</b></>} onExport={() => exportCSV("removed_kot_items.csv", ["Order #","Date & Time","Item Name","Qty","Price","Total Loss","Removed By","Reason","KOT #"], d.items.map(r => [r.orderId,r.datetime,r.item,r.qty,r.price,r.totalLoss,r.removedBy,r.reason,r.kot]))} onPrint={() => toast.success("PDF Generated!")} />
      <FilterBar>
        <Typography sx={flSx}>Period:</Typography>
        <Select defaultValue="Current Week" size="small" sx={fSelSx}><MenuItem value="Current Week">Current Week</MenuItem><MenuItem value="Today">Today</MenuItem></Select>
        <DateRange />
      </FilterBar>
      <Box sx={sg4}>
        <StatCard label="Items Removed" value={d.count} icon="🗑️" variant="ac" rows={[{ key: "Value Lost", value: <Typography sx={{ fontWeight: 700, color: T.red, fontSize: 11.5 }}>₹{d.valueLost}</Typography> }, { key: "Orders Affected", value: <b>{d.ordersAffected}</b> }]} />
        <StatCard label="By Waiter" value={d.byWaiter} icon="🙋" variant="amb" rows={[{ key: "Value", value: <b>₹{d.byWaiterValue}</b> }, { key: `Top: ${d.topWaiter}`, value: <SChip color={T.amb} bg={T.ambDim}>{d.topWaiterCount}x</SChip> }]} />
        <StatCard label="By Manager" value={d.byManager} icon="👔" variant="blu" rows={[{ key: "Value", value: <b>₹{d.byManagerValue}</b> }, { key: "Reason", value: <SChip color={T.blu} bg={T.bluDim}>{d.byManagerReason}</SChip> }]} />
        <StatCard label="Most Removed" value={d.mostRemovedItem} icon="🍽️" variant="grn" rows={[{ key: "Count", value: <b>{d.mostRemovedCount}</b> }, { key: "Value", value: <Typography sx={{ fontWeight: 700, color: T.red, fontSize: 11.5 }}>₹{d.mostRemovedValue}</Typography> }]} />
      </Box>
      <TCard title="Removed Items Log" badge={`${d.items.length} removals`}>
        <Table size="small" sx={{ minWidth: 750 }}>
          <TableHead><TableRow>
            {["Order #","Date & Time","Item Name"].map(h => <TableCell key={h} sx={thSx}>{h}</TableCell>)}
            {["Qty","Price","Total Loss"].map(h => <TableCell key={h} sx={thRSx}>{h}</TableCell>)}
            {["Removed By","Reason","KOT #"].map(h => <TableCell key={h} sx={thSx}>{h}</TableCell>)}
          </TableRow></TableHead>
          <TableBody>
            {d.items.map((row, i) => (
              <TableRow key={i} sx={trHover}>
                <TableCell sx={{ ...tdSx, fontWeight: 700 }}>{row.orderId}</TableCell>
                <TableCell sx={tdSx}>{row.datetime}</TableCell>
                <TableCell sx={tdSx}>{row.item}</TableCell>
                <TableCell sx={tdRSx}>{row.qty}</TableCell>
                <TableCell sx={tdRSx}>₹{row.price}</TableCell>
                <TableCell sx={{ ...tdRSx, color: T.red }}>₹{row.totalLoss}</TableCell>
                <TableCell sx={tdSx}>{row.removedBy}</TableCell>
                <TableCell sx={tdSx}>{row.reason}</TableCell>
                <TableCell sx={tdSx}>{row.kot}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TCard>
    </div>
  );
}

function RefundReport() {
  const d = data.refunds;
  const tv = (t: string): StatusVariant => t === "Full" ? "red" : "amber";
  return (
    <div>
      <PageHeader title="Refund Report" sub={<>Processed refunds & adjustments · <b>09/03/2026 – 15/03/2026</b></>} onExport={() => exportCSV("refund_report.csv", ["Refund #","Order #","Date","Customer","Order Amount","Refund Amount","Method","Type","Reason","Status"], d.transactions.map(r => [r.refundId,r.orderId,r.date,r.customer,r.orderAmt,r.refundAmt,r.method,r.type,r.reason,r.status]))} onPrint={() => toast.success("PDF Generated!")} />
      <FilterBar>
        <Typography sx={flSx}>Type:</Typography>
        <Select defaultValue="All Refunds" size="small" sx={fSelSx}><MenuItem value="All Refunds">All Refunds</MenuItem><MenuItem value="Full Refund">Full Refund</MenuItem><MenuItem value="Partial Refund">Partial Refund</MenuItem></Select>
        <DateRange />
      </FilterBar>
      <Box sx={sg4}>
        <StatCard label="Total Refunds" value={`₹${d.totalRefunds}`} icon="↩️" variant="ac" rows={[{ key: "Count", value: <b>{d.refundCount}</b> }, { key: "% of Sales", value: <SChip color={T.red} bg={T.redDim}>{d.pctOfSales}</SChip> }]} />
        <StatCard label="Full Refunds" value={`₹${d.fullRefunds}`} icon="✅" variant="amb" rows={[{ key: "Orders", value: <b>{d.fullRefundCount}</b> }, { key: "Reason", value: <b>{d.fullRefundReason}</b> }]} />
        <StatCard label="Partial Refunds" value={`₹${d.partialRefunds}`} icon="⚖️" variant="blu" rows={[{ key: "Orders", value: <b>{d.partialRefundCount}</b> }, { key: "Reason", value: <b>{d.partialRefundReason}</b> }]} />
        <StatCard label="Refund Rate" value={d.refundRate} icon="📊" variant="grn" rows={[{ key: "Target", value: <b>&lt;2%</b> }, { key: "Status", value: <SChip color={T.amb} bg={T.ambDim}>Watch</SChip> }]} />
      </Box>
      <TCard title="Refund Transactions" badge={`${d.transactions.length} refunds`}>
        <Table size="small" sx={{ minWidth: 800 }}>
          <TableHead><TableRow>
            {["Refund #","Order #","Date","Customer"].map(h => <TableCell key={h} sx={thSx}>{h}</TableCell>)}
            {["Order Amt","Refund Amt"].map(h => <TableCell key={h} sx={thRSx}>{h}</TableCell>)}
            {["Method","Type","Reason","Status"].map(h => <TableCell key={h} sx={thSx}>{h}</TableCell>)}
          </TableRow></TableHead>
          <TableBody>
            {d.transactions.map((row, i) => (
              <TableRow key={i} sx={trHover}>
                <TableCell sx={{ ...tdSx, fontWeight: 700 }}>{row.refundId}</TableCell>
                <TableCell sx={tdSx}>{row.orderId}</TableCell>
                <TableCell sx={tdSx}>{row.date}</TableCell>
                <TableCell sx={tdSx}>{row.customer}</TableCell>
                <TableCell sx={tdRSx}>₹{row.orderAmt}</TableCell>
                <TableCell sx={{ ...tdRSx, color: T.red }}>₹{row.refundAmt}</TableCell>
                <TableCell sx={tdSx}>{row.method}</TableCell>
                <TableCell sx={tdSx}><StatusChip variant={tv(row.type)}>{row.type}</StatusChip></TableCell>
                <TableCell sx={tdSx}>{row.reason}</TableCell>
                <TableCell sx={tdSx}><StatusChip variant="green">{row.status}</StatusChip></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TCard>
    </div>
  );
}

function TaxReport() {
  const d = data.tax;
  return (
    <div>
      <PageHeader title="Tax Report" sub={<>GST & tax breakdown for filing · <b>09/03/2026 – 15/03/2026</b></>} onExport={() => exportCSV("tax_report.csv", ["Date","Orders","Sales","Taxable Amount","CGST 2.5%","SGST 2.5%","Total GST","Net Sales"], d.dailyTax.map(r => [r.date,r.orders,r.sales,r.taxableAmt,r.cgst,r.sgst,r.totalGst,r.netSales]))} exportLabel="Export GST" onPrint={() => toast.success("PDF Generated!")} />
      <FilterBar>
        <Typography sx={flSx}>Tax Mode:</Typography>
        <Select defaultValue="Item-wise" size="small" sx={fSelSx}><MenuItem value="Item-wise">Item-wise</MenuItem><MenuItem value="Order-wise">Order-wise</MenuItem></Select>
        <Typography sx={fSepSx}>Period:</Typography>
        <Select defaultValue="Current Week" size="small" sx={fSelSx}><MenuItem value="Current Week">Current Week</MenuItem><MenuItem value="This Month">This Month</MenuItem><MenuItem value="Last Quarter">Last Quarter</MenuItem></Select>
      </FilterBar>
      <Box sx={sg4}>
        <StatCard label="Total Tax Collected" value="₹192.50" icon="🧾" variant="ac" rows={[{ key: "Taxable Sales", value: <b>₹{d.taxableSales}</b> }, { key: "Tax Rate", value: <SChip color={T.blu} bg={T.bluDim}>{d.taxRate}</SChip> }]} />
        <StatCard label="CGST (2.5%)" value={`₹${d.cgst}`} icon="🏛️" variant="grn" rows={[{ key: "On Sales", value: <b>₹{d.taxableSales}</b> }, { key: "Payable", value: <SChip color={T.grn} bg={T.grnDim}>₹{d.cgst}</SChip> }]} />
        <StatCard label="SGST (2.5%)" value={`₹${d.sgst}`} icon="🏢" variant="blu" rows={[{ key: "On Sales", value: <b>₹{d.taxableSales}</b> }, { key: "Payable", value: <SChip color={T.blu} bg={T.bluDim}>₹{d.sgst}</SChip> }]} />
        <StatCard label="Non-Taxable" value={`₹${d.nonTaxable}`} icon="🔖" variant="tel" rows={[{ key: "Exempt Items", value: <b>₹0</b> }, { key: "Orders", value: <b>5</b> }]} />
      </Box>
      <Box sx={info2}>
        <InfoCard title="GST Summary" rows={[
          { key: "Total Sales (incl. tax)", value: `₹${d.gstSummary.totalSales.toFixed(2)}` },
          { key: "Taxable Amount", value: `₹${d.gstSummary.taxableAmount.toFixed(2)}` },
          { key: "CGST @ 2.5%", value: `₹${d.gstSummary.cgst.toFixed(2)}`, color: T.ac },
          { key: "SGST @ 2.5%", value: `₹${d.gstSummary.sgst.toFixed(2)}`, color: T.ac },
          { key: "Total GST", value: `₹${d.gstSummary.totalGst.toFixed(2)}`, color: T.grn },
        ]} />
        <InfoCard title="Tax by Category" rows={[
          ...d.taxByCategory.map(tc => ({ key: tc.category, value: `₹${tc.tax.toFixed(2)}`, color: T.ac })),
          { key: "Total", value: `₹${d.totalTaxCollected.toFixed(2)}`, color: T.grn },
        ]} />
      </Box>
      <TCard title="Day-wise Tax Collection" badge="5 days">
        <Table size="small" sx={{ minWidth: 750 }}>
          <TableHead><TableRow>
            <TableCell sx={thSx}>Date</TableCell>
            {["Orders","Sales","Taxable Amt","CGST 2.5%","SGST 2.5%","Total GST","Net Sales"].map(h => <TableCell key={h} sx={thRSx}>{h}</TableCell>)}
          </TableRow></TableHead>
          <TableBody>
            {d.dailyTax.map((row, i) => (
              <TableRow key={i} sx={trHover}>
                <TableCell sx={{ ...tdSx, fontWeight: 700 }}>{row.date}</TableCell>
                <TableCell sx={tdRSx}><OChip>{row.orders}</OChip></TableCell>
                <TableCell sx={tdRSx}>₹{row.sales}</TableCell>
                <TableCell sx={tdRSx}>₹{row.taxableAmt}</TableCell>
                <TableCell sx={tdRSx}>₹{row.cgst}</TableCell>
                <TableCell sx={tdRSx}>₹{row.sgst}</TableCell>
                <TableCell sx={{ ...tdRSx, color: T.grn }}>₹{row.totalGst}</TableCell>
                <TableCell sx={{ ...tdRSx, color: T.ac }}>₹{row.netSales}</TableCell>
              </TableRow>
            ))}
            <TableRow sx={totalRowSx}>
              <TableCell sx={{ ...tdSx, fontWeight: 800, color: T.ac }}>Total</TableCell>
              <TableCell sx={tdRSx}><OChip>5</OChip></TableCell>
              <TableCell sx={{ ...tdRSx, fontWeight: 800 }}>₹745</TableCell>
              <TableCell sx={{ ...tdRSx, fontWeight: 800 }}>₹552.50</TableCell>
              <TableCell sx={{ ...tdRSx, color: T.grn, fontSize: 14 }}>₹96.25</TableCell>
              <TableCell sx={{ ...tdRSx, color: T.grn, fontSize: 14 }}>₹96.25</TableCell>
              <TableCell sx={{ ...tdRSx, color: T.ac, fontSize: 14 }}>₹192.50</TableCell>
              <TableCell sx={{ ...tdRSx, color: T.ac, fontSize: 15 }}>₹745</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TCard>
    </div>
  );
}

function OutstandingReport() {
  const d = data.outstanding;
  return (
    <div>
      <PageHeader title="Outstanding Payments" sub={<>Unpaid & due orders · As of <b>15/03/2026</b></>} onExport={() => exportCSV("outstanding_payments.csv", ["Order #","Date","Customer","Amount Due","Days Overdue","Status"], (d.orders as {id:string;date:string;customer:string;amountDue:number;daysOverdue:number;status:string}[]).map(r => [r.id,r.date,r.customer,r.amountDue,r.daysOverdue,r.status]))} exportLabel="Export CSV" onPrint={() => toast.success("PDF Generated!")} />
      <FilterBar>
        <Typography sx={flSx}>Status:</Typography>
        <Select defaultValue="All Outstanding" size="small" sx={fSelSx}><MenuItem value="All Outstanding">All Outstanding</MenuItem><MenuItem value="Overdue">Overdue</MenuItem><MenuItem value="Due Today">Due Today</MenuItem></Select>
        <Typography sx={flSx}>Customer:</Typography>
        <input type="text" placeholder="Search customer…" style={{ padding: "7px 10px", background: T.s1, border: `1.5px solid ${T.bd}`, borderRadius: 8, fontFamily: "inherit", fontSize: 12.5, color: T.tx, outline: "none", width: 160 }} />
      </FilterBar>
      <Box sx={sg4}>
        <StatCard label="Total Outstanding" value={`₹${d.totalOutstanding}`} icon="⏳" variant="ac" rows={[{ key: "Orders", value: <SChip color={T.grn} bg={T.grnDim}>0</SChip> }, { key: "Status", value: <SChip color={T.grn} bg={T.grnDim}>All Clear</SChip> }]} />
        <StatCard label="Overdue (>7 days)" value={`₹${d.overdue}`} icon="🚨" variant="amb" rows={[{ key: "Orders", value: <SChip color={T.grn} bg={T.grnDim}>0</SChip> }, { key: "Avg Days", value: <b>—</b> }]} />
        <StatCard label="Due This Week" value={`₹${d.dueThisWeek}`} icon="📅" variant="blu" rows={[{ key: "Orders", value: <SChip color={T.grn} bg={T.grnDim}>0</SChip> }, { key: "Follow-up", value: <SChip color={T.grn} bg={T.grnDim}>None</SChip> }]} />
        <StatCard label="Recovered" value={`₹${d.recoveredThisMonth}`} icon="✅" variant="grn" rows={[{ key: "This Month", value: <SChip color={T.grn} bg={T.grnDim}>₹{d.recoveredThisMonth}</SChip> }, { key: "Orders", value: <b>{d.recoveredOrders}</b> }]} />
      </Box>
      <Paper elevation={0} sx={{ border: `1.5px solid ${T.bd}`, borderRadius: "14px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden" }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: "14px 18px", borderBottom: `1px solid ${T.bd}` }}>
          <Typography sx={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, color: T.tx }}>Outstanding Orders</Typography>
          <Chip label="0 pending" size="small" sx={{ background: T.grnDim, color: T.grn, fontWeight: 700, border: `1px solid ${T.grnBdr}`, borderRadius: "20px" }} />
        </Box>
        <Box sx={{ p: "60px 20px", textAlign: "center" }}>
          <Typography sx={{ fontSize: 48, mb: "12px" }}>🎉</Typography>
          <Typography sx={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, color: T.tx, mb: "8px" }}>All Payments Cleared!</Typography>
          <Typography sx={{ fontSize: 13, color: T.t3 }}>No outstanding payments as of 15/03/2026</Typography>
        </Box>
      </Paper>
    </div>
  );
}

function InventoryReport() {
  const d = data.inventory;
  const sv = (s: string): StatusVariant => s === "Good" ? "green" : s === "Out of Stock" ? "red" : "amber";
  return (
    <div>
      <PageHeader title="Inventory Report" sub={<>Current stock & usage tracking · <b>March 2026</b></>} onExport={() => exportCSV("inventory_report.csv", ["Item","Category","Unit","Opening","Received","Consumed","Closing","Min Stock","Status"], d.items.map(r => [r.name,r.category,r.unit,r.opening,r.received,r.consumed,r.closing,r.minStock,r.status]))} onPrint={() => toast.success("PDF Generated!")} />
      <FilterBar>
        <Typography sx={flSx}>Category:</Typography>
        <Select defaultValue="All Items" size="small" sx={fSelSx}><MenuItem value="All Items">All Items</MenuItem><MenuItem value="Raw Material">Raw Material</MenuItem><MenuItem value="Beverages">Beverages</MenuItem></Select>
        <Typography sx={flSx}>Status:</Typography>
        <Select defaultValue="All Status" size="small" sx={fSelSx}><MenuItem value="All Status">All Status</MenuItem><MenuItem value="Low Stock">Low Stock</MenuItem><MenuItem value="Out of Stock">Out of Stock</MenuItem><MenuItem value="Good">Good</MenuItem></Select>
      </FilterBar>
      <Box sx={sg4}>
        <StatCard label="Total Items" value={d.totalItems} icon="📦" variant="ac" rows={[{ key: "Low Stock", value: <SChip color={T.red} bg={T.redDim}>{d.lowStockCount}</SChip> }, { key: "Out of Stock", value: <SChip color={T.red} bg={T.redDim}>{d.outOfStockCount}</SChip> }]} />
        <StatCard label="Low Stock Alert" value={d.lowStockCount} icon="⚠️" variant="amb" rows={[{ key: "Needs Reorder", value: <b>{d.needsReorder}</b> }, { key: "Critical", value: <SChip color={T.red} bg={T.redDim}>{d.criticalCount}</SChip> }]} />
        <StatCard label="Well Stocked" value={d.wellStocked} icon="✅" variant="grn" rows={[{ key: "Optimal", value: <b>{d.optimal}</b> }, { key: "Overstocked", value: <SChip color={T.amb} bg={T.ambDim}>{d.overstocked}</SChip> }]} />
        <StatCard label="Consumed" value={d.consumedThisMonth} icon="📉" variant="blu" rows={[{ key: "of Total", value: <b>{d.consumedPct}</b> }, { key: "Reorder Value", value: <b>{d.reorderValue}</b> }]} />
      </Box>
      <TCard title="Inventory Items" badge={`${d.items.length} items`}>
        <Table size="small" sx={{ minWidth: 800 }}>
          <TableHead><TableRow>
            {["Item","Category","Unit"].map(h => <TableCell key={h} sx={thSx}>{h}</TableCell>)}
            {["Opening","Received","Consumed","Closing","Min Stock"].map(h => <TableCell key={h} sx={thRSx}>{h}</TableCell>)}
            <TableCell sx={thSx}>Status</TableCell>
          </TableRow></TableHead>
          <TableBody>
            {d.items.map((row, i) => (
              <TableRow key={i} sx={trHover}>
                <TableCell sx={{ ...tdSx, fontWeight: 700 }}>{row.name}</TableCell>
                <TableCell sx={tdSx}>{row.category}</TableCell>
                <TableCell sx={tdSx}>{row.unit}</TableCell>
                <TableCell sx={tdRSx}>{row.opening}</TableCell>
                <TableCell sx={tdRSx}>{row.received}</TableCell>
                <TableCell sx={tdRSx}>{row.consumed}</TableCell>
                <TableCell sx={{ ...tdRSx, color: row.closing === 0 ? T.red : row.closing < row.minStock ? T.amb : T.grn, fontWeight: 800 }}>{row.closing}</TableCell>
                <TableCell sx={tdRSx}>{row.minStock}</TableCell>
                <TableCell sx={tdSx}><StatusChip variant={sv(row.status)}>{row.status}</StatusChip></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TCard>
    </div>
  );
}

function StockReport() {
  const d = data.stock;
  const sv = (s: string): StatusVariant => s === "Good" ? "green" : s === "Out" ? "red" : "amber";
  return (
    <div>
      <PageHeader title="Stock Report" sub={<>SKU-level stock valuation & reorder status · <b>March 2026</b></>} onExport={() => exportCSV("stock_report.csv", ["SKU","Item Name","Category","Unit","Qty","Unit Cost","Total Value","Reorder Level","Supplier","Last Purchase","Status"], d.items.map(r => [r.sku,r.name,r.category,r.unit,r.qty,r.unitCost,r.totalValue,r.reorderLevel,r.supplier,r.lastPurchase,r.status]))} onPrint={() => toast.success("PDF Generated!")} />
      <FilterBar>
        <Typography sx={flSx}>Category:</Typography>
        <Select defaultValue="All Items" size="small" sx={fSelSx}><MenuItem value="All Items">All Items</MenuItem><MenuItem value="Vegetables">Vegetables</MenuItem><MenuItem value="Non-Veg">Non-Veg</MenuItem><MenuItem value="Dairy">Dairy</MenuItem></Select>
        <Typography sx={flSx}>Status:</Typography>
        <Select defaultValue="All Status" size="small" sx={fSelSx}><MenuItem value="All Status">All Status</MenuItem><MenuItem value="Low">Low</MenuItem><MenuItem value="Critical">Critical</MenuItem><MenuItem value="Out">Out</MenuItem></Select>
      </FilterBar>
      <Box sx={sg4}>
        <StatCard label="Total SKUs" value={d.totalSKUs} icon="🗄️" variant="ac" rows={[{ key: "Total Value", value: <b>{d.totalValue}</b> }, { key: "vs Last Month", value: <SChip color={T.grn} bg={T.grnDim}>{d.totalValueChange}</SChip> }]} />
        <StatCard label="In Transit" value={d.inTransit} icon="🚚" variant="blu" rows={[{ key: "Value", value: <b>{d.inTransitValue}</b> }, { key: "ETA", value: <b>2 days</b> }]} />
        <StatCard label="Reorder Needed" value="4 items" icon="⚠️" variant="amb" rows={[{ key: "Value", value: <b>₹2,200</b> }, { key: "Urgent", value: <SChip color={T.red} bg={T.redDim}>2</SChip> }]} />
        <StatCard label="Last Updated" value={d.lastUpdated} icon="🔄" variant="grn" rows={[{ key: "By", value: <b>Arjun K.</b> }, { key: "Next Audit", value: <b>22/03</b> }]} />
      </Box>
      <TCard title="Stock Ledger" badge={`${d.items.length} items`}>
        <Table size="small" sx={{ minWidth: 900 }}>
          <TableHead><TableRow>
            {["SKU","Item Name","Category","Unit"].map(h => <TableCell key={h} sx={thSx}>{h}</TableCell>)}
            {["Qty","Unit Cost","Total Value","Reorder Level"].map(h => <TableCell key={h} sx={thRSx}>{h}</TableCell>)}
            {["Supplier","Last Purchase","Status"].map(h => <TableCell key={h} sx={thSx}>{h}</TableCell>)}
          </TableRow></TableHead>
          <TableBody>
            {d.items.map((row, i) => (
              <TableRow key={i} sx={trHover}>
                <TableCell sx={{ ...tdSx, fontFamily: "monospace", fontSize: 12 }}>{row.sku}</TableCell>
                <TableCell sx={{ ...tdSx, fontWeight: 700 }}>{row.name}</TableCell>
                <TableCell sx={tdSx}>{row.category}</TableCell>
                <TableCell sx={tdSx}>{row.unit}</TableCell>
                <TableCell sx={{ ...tdRSx, color: row.qty === 0 ? T.red : row.qty < row.reorderLevel ? T.amb : T.grn, fontWeight: 800 }}>{row.qty}</TableCell>
                <TableCell sx={tdRSx}>₹{row.unitCost}</TableCell>
                <TableCell sx={{ ...tdRSx, color: T.ac }}>₹{row.totalValue.toLocaleString()}</TableCell>
                <TableCell sx={tdRSx}>{row.reorderLevel}</TableCell>
                <TableCell sx={tdSx}>{row.supplier}</TableCell>
                <TableCell sx={tdSx}>{row.lastPurchase}</TableCell>
                <TableCell sx={tdSx}><StatusChip variant={sv(row.status)}>{row.status}</StatusChip></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TCard>
    </div>
  );
}

// ── Nav items ──────────────────────────────────────────────────────────────
const NAV_ITEMS: { key: ReportKey; icon: string; label: string; section: string }[] = [
  { key: "sales", icon: "📈", label: "Sales Report", section: "Sales" },
  { key: "item", icon: "🍽️", label: "Item Report", section: "Sales" },
  { key: "category", icon: "📂", label: "Category Report", section: "Sales" },
  { key: "delivery", icon: "🛵", label: "Delivery App Report", section: "Delivery & Expenses" },
  { key: "expense", icon: "💸", label: "Expense Reports", section: "Delivery & Expenses" },
  { key: "cancelled", icon: "❌", label: "Cancelled Orders", section: "Orders" },
  { key: "removedkot", icon: "🗑️", label: "Removed KOT Items", section: "Orders" },
  { key: "refund", icon: "↩️", label: "Refund Report", section: "Orders" },
  { key: "tax", icon: "🧾", label: "Tax Report", section: "Finance" },
  { key: "outstanding", icon: "⏳", label: "Outstanding Payments", section: "Finance" },
  { key: "inventory", icon: "📦", label: "Inventory Report", section: "Inventory" },
  { key: "stock", icon: "🗄️", label: "Stock Report", section: "Inventory" },
];

const REPORT_COMPONENTS: Record<ReportKey, React.FC> = {
  sales: SalesReport, item: ItemReport, category: CategoryReport,
  delivery: DeliveryReport, expense: ExpenseReport, cancelled: CancelledReport,
  removedkot: RemovedKotReport, refund: RefundReport, tax: TaxReport,
  outstanding: OutstandingReport, inventory: InventoryReport, stock: StockReport,
};

// ── Main export ────────────────────────────────────────────────────────────
export default function Reports() {
  const [active, setActive] = useState<ReportKey>("sales");
  const ReportComponent = REPORT_COMPONENTS[active];
  const sections = [...new Set(NAV_ITEMS.map(n => n.section))];

  return (
    <Box sx={{ display: "flex", height: "100%", fontFamily: "Montserrat,sans-serif", background: T.bg, color: T.tx, fontSize: 14 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=Montserrat:wght@400;500;600;700;800&display=swap');`}</style>

      {/* Sidebar */}
      <Box sx={{ width: 210, background: T.w, borderRight: `1px solid ${T.bd}`, display: "flex", flexDirection: "column", flexShrink: 0, overflow: "hidden" }}>
        <Typography sx={{ p: "14px 14px 6px", fontFamily: "'Playfair Display',serif", fontSize: 17, fontWeight: 700, color: T.tx }}>
          Reports<Box component="span" sx={{ color: T.ac }}>.</Box>
        </Typography>
        <Box sx={{ mx: "14px", mb: "8px", height: 2, borderRadius: "2px", background: `linear-gradient(90deg,${T.ac},transparent)` }} />

        <Box sx={{ flex: 1, overflowY: "auto", pb: "10px", "&::-webkit-scrollbar": { width: 3 }, "&::-webkit-scrollbar-thumb": { background: T.bd, borderRadius: 3 } }}>
          {sections.map(sec => (
            <Box key={sec}>
              <Typography sx={{ p: "8px 20px 3px", fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "1.2px", color: T.t3 }}>{sec}</Typography>
              {NAV_ITEMS.filter(n => n.section === sec).map(item => (
                <Box
                  key={item.key}
                  onClick={() => setActive(item.key)}
                  sx={{
                    display: "flex", alignItems: "center", gap: "9px", p: "9px 12px",
                    borderRadius: "10px", mx: "8px", my: "1px", cursor: "pointer",
                    fontSize: 12.5, fontWeight: active === item.key ? 700 : 500,
                    transition: "all .14s",
                    background: active === item.key ? T.ac : "transparent",
                    color: active === item.key ? "#fff" : T.t2,
                    boxShadow: active === item.key ? "0 3px 10px rgba(255,61,1,0.22)" : "none",
                    "&:hover": active === item.key ? {} : { background: T.s2, color: T.tx },
                  }}
                >
                  <Box component="span" sx={{ width: 18, textAlign: "center", flexShrink: 0, fontSize: 14 }}>{item.icon}</Box>
                  {item.label}
                </Box>
              ))}
            </Box>
          ))}
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, overflowY: "auto", p: "20px 22px", "&::-webkit-scrollbar": { width: 5 }, "&::-webkit-scrollbar-thumb": { background: T.bd2, borderRadius: 4 } }}>
        <ReportComponent />
      </Box>
    </Box>
  );
}
