import React, { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, CartesianGrid,
} from "recharts";
import data from "../data/reportsDummyData.json";
import toast from "react-hot-toast";

// ── Design tokens ──────────────────────────────────────────────────────────
const T = {
  ac: "#FF3D01", acH: "#e03500", acDim: "rgba(255,61,1,0.07)", acMid: "rgba(255,61,1,0.13)", acBdr: "rgba(255,61,1,0.25)",
  bg: "#f5f0ea", w: "#fff", s1: "#faf7f3", s2: "#f0ebe3", s3: "#e5ded5",
  bd: "#e2d9d0", bd2: "#cec4b8",
  grn: "#186b35", grnDim: "rgba(24,107,53,0.09)", grnBdr: "rgba(24,107,53,0.22)",
  blu: "#1a4fcc", bluDim: "rgba(26,79,204,0.08)", bluBdr: "rgba(26,79,204,0.22)",
  pur: "#6d28d9", purDim: "rgba(109,40,217,0.08)",
  amb: "#92400e", ambDim: "rgba(146,64,14,0.08)",
  tel: "#0f766e", telDim: "rgba(15,118,110,0.08)",
  red: "#b91c1c", redDim: "rgba(185,28,28,0.08)", redBdr: "rgba(185,28,28,0.22)",
  ora: "#c2410c", oraDim: "rgba(194,65,12,0.08)",
  tx: "#16100a", t2: "#6b5c48", t3: "#a4927e",
};

type ReportKey = "sales" | "item" | "category" | "delivery" | "expense" | "cancelled" | "removedkot" | "refund" | "tax" | "outstanding" | "inventory" | "stock";

// ── Shared sub-components ──────────────────────────────────────────────────
type StatCardVariant = "ac"|"grn"|"blu"|"pur"|"tel"|"amb"|"ora";
const ACCENT_MAP: Record<StatCardVariant, { dim: string; color: string; }> = {
  ac: { dim: T.acDim, color: T.ac },
  grn: { dim: T.grnDim, color: T.grn },
  blu: { dim: T.bluDim, color: T.blu },
  pur: { dim: T.purDim, color: T.pur },
  tel: { dim: T.telDim, color: T.tel },
  amb: { dim: T.ambDim, color: T.amb },
  ora: { dim: T.oraDim, color: T.ora },
};

function StatCard({ label, value, icon, variant, rows }: {
  label: string; value: string | number; icon: string; variant: StatCardVariant;
  rows?: { key: string; value: React.ReactNode }[];
}) {
  const { dim, color } = ACCENT_MAP[variant];
  return (
    <div style={{ background: T.w, border: `1.5px solid ${T.bd}`, borderRadius: 14, padding: "15px 16px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", position: "relative", overflow: "hidden", transition: "transform .15s, box-shadow .15s" }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 6px 22px rgba(0,0,0,0.10)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ""; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 4px rgba(0,0,0,0.06)"; }}
    >
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, borderRadius: "0 0 14px 14px", background: color }} />
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
        <div style={{ fontSize: 10.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".5px", color: T.t3 }}>{label}</div>
        <div style={{ width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, background: dim }}>{icon}</div>
      </div>
      <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color, marginBottom: 8 }}>{value}</div>
      {rows && (
        <div style={{ display: "flex", flexDirection: "column", gap: 4, borderTop: `1px solid ${T.bd}`, paddingTop: 7 }}>
          {rows.map((r, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 11.5 }}>
              <span style={{ color: T.t3, fontWeight: 500 }}>{r.key}</span>
              <span>{r.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Badge({ children, color, bg }: { children: React.ReactNode; color: string; bg: string }) {
  return <span style={{ padding: "1px 7px", borderRadius: 8, fontSize: 10, fontWeight: 700, color, background: bg }}>{children}</span>;
}
function StatusPill({ children, variant }: { children: React.ReactNode; variant: "green"|"red"|"amber"|"blue" }) {
  const vs = { green: { bg: T.grnDim, color: T.grn }, red: { bg: T.redDim, color: T.red }, amber: { bg: T.ambDim, color: T.amb }, blue: { bg: T.bluDim, color: T.blu } };
  const v = vs[variant];
  return <span style={{ display: "inline-flex", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: v.bg, color: v.color }}>{children}</span>;
}
function OrderBadge({ children }: { children: React.ReactNode }) {
  return <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: 24, height: 24, borderRadius: 6, background: T.bluDim, color: T.blu, fontSize: 12, fontWeight: 800, padding: "0 5px" }}>{children}</div>;
}

function PageHeader({ title, sub, onExport, onPrint }: { title: string; sub: React.ReactNode; onExport?: () => void; onPrint?: () => void }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 18 }}>
      <div>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 700, color: T.tx }}>{title}</div>
        <div style={{ fontSize: 12, color: T.t3, marginTop: 4, fontWeight: 500 }}>{sub}</div>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        {onExport && <Ebtn onClick={onExport}>⬇ Export CSV</Ebtn>}
        {onPrint && <Ebtn primary onClick={onPrint}>🖨 Print PDF</Ebtn>}
      </div>
    </div>
  );
}

function Ebtn({ children, onClick, primary }: { children: React.ReactNode; onClick?: () => void; primary?: boolean }) {
  return (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 6, padding: "8px 14px",
      background: primary ? T.ac : T.w,
      border: `1.5px solid ${primary ? T.ac : T.bd}`,
      borderRadius: 9, fontSize: 12.5, fontWeight: 700, cursor: "pointer", color: primary ? "#fff" : T.t2,
      fontFamily: "Plus Jakarta Sans,sans-serif", transition: "all .14s",
      boxShadow: primary ? "0 2px 8px rgba(255,61,1,0.25)" : "none",
    }}>{children}</button>
  );
}

function FilterBar({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", padding: "11px 16px", background: T.w, border: `1.5px solid ${T.bd}`, borderRadius: 14, marginBottom: 18, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
      {children}
    </div>
  );
}
const fSelStyle: React.CSSProperties = { padding: "7px 26px 7px 10px", background: T.s1, border: `1.5px solid ${T.bd}`, borderRadius: 8, fontFamily: "Plus Jakarta Sans,sans-serif", fontSize: 12.5, fontWeight: 600, color: T.tx, outline: "none", cursor: "pointer", appearance: "none", backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23a4927e' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center" };
const fInputStyle: React.CSSProperties = { padding: "7px 10px", background: T.s1, border: `1.5px solid ${T.bd}`, borderRadius: 8, fontFamily: "Plus Jakarta Sans,sans-serif", fontSize: 12.5, color: T.tx, outline: "none" };
const fLabelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: T.t2, whiteSpace: "nowrap" };
const fSepStyle: React.CSSProperties = { color: T.t3, fontSize: 12, fontWeight: 500 };

function TCard({ title, badge, children }: { title: string; badge: string; children: React.ReactNode }) {
  return (
    <div style={{ background: T.w, border: `1.5px solid ${T.bd}`, borderRadius: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden", marginBottom: 18 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: `1px solid ${T.bd}` }}>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, color: T.tx }}>{title}</div>
        <div style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: T.acDim, color: T.ac, border: `1px solid ${T.acBdr}` }}>{badge}</div>
      </div>
      <div style={{ overflowX: "auto" }}>{children}</div>
    </div>
  );
}

const thStyle: React.CSSProperties = { padding: "10px 14px", textAlign: "left", fontSize: 10.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".5px", color: T.t3, borderBottom: `1.5px solid ${T.bd}`, whiteSpace: "nowrap", background: T.s1 };
const thR: React.CSSProperties = { ...thStyle, textAlign: "right" };
const tdStyle: React.CSSProperties = { padding: "11px 14px", fontSize: 13, color: T.tx, borderBottom: `1px solid ${T.bd}` };
const tdR: React.CSSProperties = { ...tdStyle, textAlign: "right", fontWeight: 700, fontFamily: "'Playfair Display',serif", fontSize: 13 };

function ChartCard({ title, sub, total, totalLabel, children }: {
  title: string; sub?: string; total?: string; totalLabel?: string; children: React.ReactNode;
}) {
  return (
    <div style={{ background: T.w, border: `1.5px solid ${T.bd}`, borderRadius: 14, padding: 18, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", marginBottom: 0 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
        <div>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, color: T.tx }}>{title}</div>
          {sub && <div style={{ fontSize: 11, color: T.t3, marginTop: 2 }}>{sub}</div>}
        </div>
        {total && (
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, color: T.ac }}>{total}</div>
            {totalLabel && <div style={{ fontSize: 11, color: T.t3, marginTop: 2 }}>{totalLabel}</div>}
          </div>
        )}
      </div>
      <div style={{ height: 200 }}>{children}</div>
    </div>
  );
}

function PbarSection({ title, items }: { title: string; items: { label: string; pct: number; value: string; color: string }[] }) {
  return (
    <div style={{ background: T.w, border: `1.5px solid ${T.bd}`, borderRadius: 14, padding: 18, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
      <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 15, fontWeight: 700, color: T.tx, marginBottom: 14 }}>{title}</div>
      {items.map((item, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: T.t2, minWidth: 90, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.label}</div>
          <div style={{ flex: 1, height: 8, background: T.s2, borderRadius: 4, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${item.pct}%`, background: item.color, borderRadius: 4, transition: "width .6s ease" }} />
          </div>
          <div style={{ fontSize: 12, fontWeight: 800, minWidth: 60, textAlign: "right", color: item.pct > 0 ? item.color : T.t3 }}>{item.value}</div>
        </div>
      ))}
    </div>
  );
}

function InfoCard({ title, rows }: { title: string; rows: { key: string; value: string; color?: string }[] }) {
  return (
    <div style={{ background: T.w, border: `1.5px solid ${T.bd}`, borderRadius: 14, padding: 18, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
      <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 15, fontWeight: 700, color: T.tx, marginBottom: 12, paddingBottom: 8, borderBottom: `1px solid ${T.bd}` }}>{title}</div>
      {rows.map((r, i) => (
        <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: i < rows.length - 1 ? `1px solid ${T.bd}` : "none", fontSize: 13 }}>
          <span style={{ color: T.t2, fontWeight: 500 }}>{r.key}</span>
          <span style={{ fontWeight: 700, color: r.color || T.tx }}>{r.value}</span>
        </div>
      ))}
    </div>
  );
}

const sg4: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 18 };
const sg6: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 12, marginBottom: 18 };
const chartRow2: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 280px", gap: 16, marginBottom: 18 };
const info2: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 16, marginBottom: 18 };

// ── Report Sections ─────────────────────────────────────────────────────────

function SalesReport() {
  const s = data.sales;
  return (
    <div>
      <PageHeader
        title="Sales Report"
        sub={<>Sales data <b>09/03/2026 – 15/03/2026</b> · Each day 12:00 AM – 11:59 PM</>}
        onExport={() => toast.success("CSV Exported!")}
        onPrint={() => toast.success("PDF Generated!")}
      />
      <FilterBar>
        <span style={fLabelStyle}>Period:</span>
        <select style={fSelStyle}><option>Current Week</option><option>Today</option><option>Last 30 Days</option></select>
        <span style={fSepStyle}>From</span><input style={fInputStyle} type="date" defaultValue="2026-03-09" />
        <span style={fSepStyle}>To</span><input style={fInputStyle} type="date" defaultValue="2026-03-15" />
        <select style={fSelStyle}><option>All Users</option><option>Sanjay Singh</option></select>
      </FilterBar>
      <div style={sg6}>
        <StatCard label="Total Sales" value="₹745" icon="💰" variant="ac" rows={[{ key: "Orders", value: <Badge color={T.blu} bg={T.bluDim}>5</Badge> }, { key: "Avg/Order", value: <span style={{ fontWeight: 700, color: T.tx }}>₹149</span> }]} />
        <StatCard label="Cash Received" value="₹745" icon="💵" variant="grn" rows={[{ key: "Cash", value: <span style={{ fontWeight: 700, color: T.tx }}>₹745</span> }, { key: "Other", value: <span style={{ fontWeight: 700, color: T.tx }}>₹0</span> }]} />
        <StatCard label="Gateway" value="₹0" icon="🔗" variant="blu" rows={[{ key: "Razorpay", value: <span style={{ fontWeight: 700, color: T.tx }}>₹0</span> }, { key: "Status", value: <Badge color={T.grn} bg={T.grnDim}>Active</Badge> }]} />
        <StatCard label="Additional" value="₹0" icon="➕" variant="pur" rows={[{ key: "Charges", value: <span style={{ fontWeight: 700, color: T.tx }}>₹0</span> }, { key: "Discount", value: <span style={{ fontWeight: 700, color: T.tx }}>₹0</span> }]} />
        <StatCard label="Tax (GST 5%)" value="₹192.50" icon="🧾" variant="tel" rows={[{ key: "Mode", value: <Badge color={T.blu} bg={T.bluDim}>Item</Badge> }, { key: "Total Tax", value: <span style={{ fontWeight: 700, color: T.tx }}>₹192.50</span> }]} />
        <StatCard label="Outstanding" value="₹0" icon="⏳" variant="amb" rows={[{ key: "Orders", value: <Badge color={T.grn} bg={T.grnDim}>0</Badge> }, { key: "Status", value: <Badge color={T.grn} bg={T.grnDim}>Clear</Badge> }]} />
      </div>
      <div style={chartRow2}>
        <ChartCard title="Daily Sales Trend" sub="Revenue per day this week" total="₹745" totalLabel="Period Total">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={s.chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={T.ac} stopOpacity={0.18} /><stop offset="95%" stopColor={T.ac} stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke={T.bd} />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: T.t3 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: T.t3 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v}`} />
              <Tooltip formatter={(v: number) => [`₹${v}`, "Sales"]} contentStyle={{ fontFamily: "Plus Jakarta Sans,sans-serif", fontSize: 12 }} />
              <Area type="monotone" dataKey="sales" stroke={T.ac} strokeWidth={2.5} fill="url(#sg)" dot={{ fill: T.ac, r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
        <PbarSection title="Payment Methods" items={[
          { label: "Cash", pct: 100, value: "₹745", color: T.grn },
          { label: "UPI", pct: 0, value: "₹0", color: T.blu },
          { label: "Card", pct: 0, value: "₹0", color: T.pur },
          { label: "Bank", pct: 0, value: "₹0", color: T.tel },
        ]} />
      </div>
      <TCard title="Detailed Sales" badge="5 records">
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
          <thead><tr>
            <th style={thStyle}>Date</th><th style={thR}>Orders</th><th style={thR}>GST 5%</th><th style={thR}>Total Tax</th>
            <th style={thR}>Cash</th><th style={thR}>UPI</th><th style={thR}>Card</th><th style={thR}>Due</th>
            <th style={thR}>Discount</th><th style={thR}>Total</th>
          </tr></thead>
          <tbody>
            {s.dailyBreakdown.map((row, i) => (
              <tr key={i} style={{ background: T.w }} onMouseEnter={e => (e.currentTarget.style.background = T.s1)} onMouseLeave={e => (e.currentTarget.style.background = T.w)}>
                <td style={{ ...tdStyle, fontWeight: 700 }}>{row.date}</td>
                <td style={tdR}><OrderBadge>{row.orders}</OrderBadge></td>
                <td style={tdR}>₹{row.gst5.toFixed(2)}</td><td style={tdR}>₹{row.totalTax.toFixed(2)}</td>
                <td style={{ ...tdR, color: T.grn }}>₹{row.cash.toFixed(2)}</td>
                <td style={tdR}>₹{row.upi}</td><td style={tdR}>₹{row.card}</td>
                <td style={tdR}>₹{row.due}</td><td style={tdR}>₹{row.discount}</td>
                <td style={{ ...tdR, color: T.ac }}>₹{row.total.toFixed(2)}</td>
              </tr>
            ))}
            <tr style={{ background: T.s1 }}>
              <td style={{ ...tdStyle, fontWeight: 800, color: T.ac }}>Total</td>
              <td style={tdR}><OrderBadge>5</OrderBadge></td>
              <td style={{ ...tdR, fontWeight: 800 }}>₹192.50</td><td style={{ ...tdR, fontWeight: 800 }}>₹192.50</td>
              <td style={{ ...tdR, color: T.grn, fontSize: 14 }}>₹745.00</td>
              <td style={tdR}>₹0</td><td style={tdR}>₹0</td><td style={tdR}>₹0</td><td style={tdR}>₹0</td>
              <td style={{ ...tdR, color: T.ac, fontSize: 15 }}>₹745.00</td>
            </tr>
          </tbody>
        </table>
      </TCard>
    </div>
  );
}

function ItemReport() {
  const d = data.items;
  const typeColor = (t: string) => t === "Veg" ? "green" : t === "Non-Veg" ? "red" : "amber";
  return (
    <div>
      <PageHeader title="Item Report" sub={<>Best selling items · <b>09/03/2026 – 15/03/2026</b></>} onExport={() => toast.success("Exported!")} onPrint={() => toast.success("PDF Generated!")} />
      <FilterBar>
        <span style={fLabelStyle}>Period:</span>
        <select style={fSelStyle}><option>Current Week</option><option>Today</option><option>Last 30 Days</option></select>
        <span style={fSepStyle}>From</span><input style={fInputStyle} type="date" defaultValue="2026-03-09" />
        <span style={fSepStyle}>To</span><input style={fInputStyle} type="date" defaultValue="2026-03-15" />
      </FilterBar>
      <div style={sg4}>
        <StatCard label="Total Items Sold" value={d.totalItemsSold} icon="🍽️" variant="ac" rows={[{ key: "Unique Items", value: <span style={{ fontWeight: 700 }}>{d.uniqueItems}</span> }, { key: "Top Item", value: <Badge color={T.blu} bg={T.bluDim}>{d.topItem}</Badge> }]} />
        <StatCard label="Veg Items" value={d.vegItems} icon="🥦" variant="grn" rows={[{ key: "Revenue", value: <span style={{ fontWeight: 700 }}>₹{d.vegRevenue}</span> }, { key: "Share", value: <Badge color={T.grn} bg={T.grnDim}>{d.vegShare}%</Badge> }]} />
        <StatCard label="Non-Veg Items" value={d.nonVegItems} icon="🍗" variant="blu" rows={[{ key: "Revenue", value: <span style={{ fontWeight: 700 }}>₹{d.nonVegRevenue}</span> }, { key: "Share", value: <Badge color={T.blu} bg={T.bluDim}>{d.nonVegShare}%</Badge> }]} />
        <StatCard label="Avg Item Price" value={`₹${d.avgItemPrice}`} icon="💲" variant="amb" rows={[{ key: "Min Price", value: <span style={{ fontWeight: 700 }}>₹{d.minPrice}</span> }, { key: "Max Price", value: <span style={{ fontWeight: 700 }}>₹{d.maxPrice}</span> }]} />
      </div>
      <div style={chartRow2}>
        <ChartCard title="Top Items by Quantity" sub="Most ordered this period">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={d.topItemsChart} margin={{ top: 4, right: 4, left: 0, bottom: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={T.bd} />
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: T.t3 }} angle={-35} textAnchor="end" interval={0} />
              <YAxis tick={{ fontSize: 10, fill: T.t3 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontFamily: "Plus Jakarta Sans,sans-serif", fontSize: 12 }} />
              <Bar dataKey="qty" fill={T.ac} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <PbarSection title="Revenue by Item" items={d.revenueByItem.map(it => ({ label: it.name, pct: it.pct, value: `₹${it.revenue}`, color: it.color }))} />
      </div>
      <TCard title="Item-wise Sales" badge={`${d.itemSales.length} items`}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
          <thead><tr>
            <th style={thStyle}>#</th><th style={thStyle}>Item Name</th><th style={thStyle}>Category</th><th style={thStyle}>Type</th>
            <th style={thR}>Qty Sold</th><th style={thR}>Unit Price</th><th style={thR}>Total Revenue</th><th style={thR}>Tax</th><th style={thR}>Share</th>
          </tr></thead>
          <tbody>
            {d.itemSales.map((row, i) => (
              <tr key={i} onMouseEnter={e => (e.currentTarget.style.background = T.s1)} onMouseLeave={e => (e.currentTarget.style.background = "")}>
                <td style={tdStyle}>{row.rank}</td>
                <td style={{ ...tdStyle, fontWeight: 700 }}>{row.name}</td>
                <td style={tdStyle}>{row.category}</td>
                <td style={tdStyle}><StatusPill variant={typeColor(row.type) as any}>{row.type}</StatusPill></td>
                <td style={tdR}><OrderBadge>{row.qty}</OrderBadge></td>
                <td style={tdR}>₹{row.unitPrice}</td>
                <td style={{ ...tdR, color: T.ac }}>₹{row.revenue}</td>
                <td style={tdR}>₹{row.tax.toFixed(2)}</td>
                <td style={{ ...tdR, color: T.grn }}>{row.share}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </TCard>
    </div>
  );
}

function CategoryReport() {
  const d = data.categories;
  return (
    <div>
      <PageHeader title="Category Report" sub={<>Sales by menu category · <b>09/03/2026 – 15/03/2026</b></>} onExport={() => toast.success("Exported!")} onPrint={() => toast.success("PDF Generated!")} />
      <FilterBar>
        <span style={fLabelStyle}>Period:</span>
        <select style={fSelStyle}><option>Current Week</option><option>Today</option><option>Last 30 Days</option></select>
        <span style={fSepStyle}>From</span><input style={fInputStyle} type="date" defaultValue="2026-03-09" />
        <span style={fSepStyle}>To</span><input style={fInputStyle} type="date" defaultValue="2026-03-15" />
      </FilterBar>
      <div style={sg4}>
        <StatCard label="Categories Active" value={d.activeCategories} icon="📂" variant="ac" rows={[{ key: "Total Items", value: <span style={{ fontWeight: 700 }}>{d.totalItemsSold}</span> }, { key: "Top Category", value: <Badge color={T.blu} bg={T.bluDim}>{d.topCategory}</Badge> }]} />
        <StatCard label="Top Revenue" value={`₹${d.topRevenue}`} icon="🥇" variant="grn" rows={[{ key: "Category", value: <span style={{ fontWeight: 700 }}>{d.topCategory}</span> }, { key: "Share", value: <Badge color={T.grn} bg={T.grnDim}>{d.topCategoryShare}%</Badge> }]} />
        <StatCard label="Avg per Cat" value={`₹${d.avgPerCategory}`} icon="📊" variant="blu" rows={[{ key: "Avg Orders", value: <span style={{ fontWeight: 700 }}>{d.avgOrders}</span> }, { key: "Variance", value: <Badge color={T.amb} bg={T.ambDim}>High</Badge> }]} />
        <StatCard label="Least Ordered" value={d.leastOrdered} icon="📉" variant="tel" rows={[{ key: "Orders", value: <span style={{ fontWeight: 700 }}>0</span> }, { key: "Revenue", value: <span style={{ fontWeight: 700 }}>₹0</span> }]} />
      </div>
      <div style={chartRow2}>
        <ChartCard title="Revenue by Category" sub="Comparison this period">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={d.chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={T.bd} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: T.t3 }} />
              <YAxis tick={{ fontSize: 10, fill: T.t3 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v}`} />
              <Tooltip formatter={(v: number) => [`₹${v}`, "Revenue"]} contentStyle={{ fontFamily: "Plus Jakarta Sans,sans-serif", fontSize: 12 }} />
              <Bar dataKey="revenue" fill={T.ac} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <PbarSection title="Category Breakdown" items={d.breakdown.map(b => ({ label: b.name, pct: b.pct, value: `₹${b.revenue}`, color: b.color }))} />
      </div>
      <TCard title="Category-wise Sales" badge={`${d.categorySales.length} categories`}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
          <thead><tr>
            <th style={thStyle}>#</th><th style={thStyle}>Category</th><th style={thR}>Items Sold</th><th style={thR}>Orders</th>
            <th style={thR}>Revenue</th><th style={thR}>Tax</th><th style={thR}>Discount</th><th style={thR}>Net Total</th><th style={thR}>Share</th>
          </tr></thead>
          <tbody>
            {d.categorySales.map((row, i) => (
              <tr key={i} onMouseEnter={e => (e.currentTarget.style.background = T.s1)} onMouseLeave={e => (e.currentTarget.style.background = "")}>
                <td style={tdStyle}>{row.rank}</td>
                <td style={{ ...tdStyle, fontWeight: 700 }}>{row.category}</td>
                <td style={tdR}><OrderBadge>{row.items}</OrderBadge></td>
                <td style={tdR}>{row.orders}</td>
                <td style={{ ...tdR, color: T.grn }}>₹{row.revenue}</td>
                <td style={tdR}>₹{row.tax.toFixed(2)}</td>
                <td style={tdR}>₹{row.discount}</td>
                <td style={{ ...tdR, color: T.ac }}>₹{row.net}</td>
                <td style={tdR}>{row.share}</td>
              </tr>
            ))}
            <tr style={{ background: T.s1 }}>
              <td colSpan={4} style={{ ...tdStyle, fontWeight: 800, color: T.ac }}>Total</td>
              <td style={{ ...tdR, color: T.grn, fontSize: 14 }}>₹1160</td>
              <td style={{ ...tdR, fontWeight: 800 }}>₹55.22</td>
              <td style={tdR}>₹0</td>
              <td style={{ ...tdR, color: T.ac, fontSize: 14 }}>₹745</td>
              <td style={tdR}>100%</td>
            </tr>
          </tbody>
        </table>
      </TCard>
    </div>
  );
}

function DeliveryReport() {
  const d = data.delivery;
  const statusVariant = (s: string): "green" | "amber" | "red" | "blue" => s === "Delivered" ? "green" : s === "Pending" ? "amber" : "red";
  return (
    <div>
      <PageHeader title="Delivery App Report" sub={<>Online delivery platform orders · <b>09/03/2026 – 15/03/2026</b></>} onExport={() => toast.success("Exported!")} onPrint={() => toast.success("PDF Generated!")} />
      <FilterBar>
        <span style={fLabelStyle}>Platform:</span>
        <select style={fSelStyle}><option>All Platforms</option><option>Swiggy</option><option>Zomato</option><option>Direct</option></select>
        <span style={fSepStyle}>From</span><input style={fInputStyle} type="date" defaultValue="2026-03-09" />
        <span style={fSepStyle}>To</span><input style={fInputStyle} type="date" defaultValue="2026-03-15" />
      </FilterBar>
      <div style={sg4}>
        <StatCard label="Total Deliveries" value={d.totalDeliveries} icon="🛵" variant="ac" rows={[{ key: "Revenue", value: <span style={{ fontWeight: 700 }}>₹{d.deliveryRevenue}</span> }, { key: "Avg Delivery", value: <span style={{ fontWeight: 700 }}>₹{d.avgDeliveryAmount}</span> }]} />
        <StatCard label="Delivery Charges" value={`₹${d.deliveryChargesTotal}`} icon="🏷️" variant="grn" rows={[{ key: "Avg Charge", value: <span style={{ fontWeight: 700 }}>₹{d.avgDeliveryCharge}</span> }, { key: "Free Deliveries", value: <span style={{ fontWeight: 700 }}>{d.freeDeliveries}</span> }]} />
        <StatCard label="Platform Commission" value={`₹${d.platformCommission}`} icon="💸" variant="blu" rows={[{ key: "Rate", value: <span style={{ fontWeight: 700 }}>{d.commissionRate}</span> }, { key: "Net After", value: <span style={{ fontWeight: 700 }}>₹{d.netAfterCommission}</span> }]} />
        <StatCard label="Avg Delivery Time" value={`${d.avgDeliveryTime} min`} icon="⏱️" variant="tel" rows={[{ key: "Fastest", value: <span style={{ fontWeight: 700 }}>{d.fastestDelivery} min</span> }, { key: "Slowest", value: <span style={{ fontWeight: 700 }}>{d.slowestDelivery} min</span> }]} />
      </div>
      <TCard title="Delivery Orders" badge={`${d.orders.length} orders`}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 800 }}>
          <thead><tr>
            <th style={thStyle}>Order #</th><th style={thStyle}>Date</th><th style={thStyle}>Platform</th><th style={thStyle}>Customer</th>
            <th style={thR}>Items</th><th style={thR}>Order Amount</th><th style={thR}>Delivery Fee</th><th style={thR}>Commission</th><th style={thR}>Net Amount</th><th style={thStyle}>Status</th>
          </tr></thead>
          <tbody>
            {d.orders.map((row, i) => (
              <tr key={i} onMouseEnter={e => (e.currentTarget.style.background = T.s1)} onMouseLeave={e => (e.currentTarget.style.background = "")}>
                <td style={{ ...tdStyle, fontWeight: 700 }}>{row.id}</td>
                <td style={tdStyle}>{row.date}</td><td style={tdStyle}>{row.platform}</td><td style={tdStyle}>{row.customer}</td>
                <td style={tdR}><OrderBadge>{row.items}</OrderBadge></td>
                <td style={{ ...tdR, color: T.grn }}>₹{row.amount}</td>
                <td style={tdR}>₹{row.deliveryFee}</td>
                <td style={{ ...tdR, color: T.red }}>₹{row.commission}</td>
                <td style={{ ...tdR, color: T.ac }}>₹{row.net}</td>
                <td style={tdStyle}><StatusPill variant={statusVariant(row.status)}>{row.status}</StatusPill></td>
              </tr>
            ))}
          </tbody>
        </table>
      </TCard>
    </div>
  );
}

function ExpenseReport() {
  const d = data.expenses;
  const statusVariant = (s: string): "green" | "amber" | "blue" => s === "Paid" ? "green" : s === "Partial" ? "amber" : "blue";
  return (
    <div>
      <PageHeader title="Expense Reports" sub={<>Business expenses & overheads · <b>March 2026</b></>} onExport={() => toast.success("Exported!")} onPrint={() => toast.success("PDF Generated!")} />
      <FilterBar>
        <span style={fLabelStyle}>Category:</span>
        <select style={fSelStyle}><option>All Categories</option><option>Raw Material</option><option>Utilities</option><option>Salary</option></select>
        <span style={fSepStyle}>Month:</span>
        <select style={fSelStyle}><option>March 2026</option><option>February 2026</option></select>
      </FilterBar>
      <div style={sg4}>
        <StatCard label="Total Expenses" value="₹12,450" icon="💸" variant="ac" rows={[{ key: "vs Last Month", value: <Badge color={T.red} bg={T.redDim}>+8%</Badge> }, { key: "Entries", value: <span style={{ fontWeight: 700 }}>{d.totalEntries}</span> }]} />
        <StatCard label="Raw Material" value={`₹${d.rawMaterial.toLocaleString()}`} icon="🛒" variant="grn" rows={[{ key: "Share", value: <Badge color={T.grn} bg={T.grnDim}>{d.rawMaterialShare}</Badge> }, { key: "Entries", value: <span style={{ fontWeight: 700 }}>{d.rawMaterialEntries}</span> }]} />
        <StatCard label="Utilities" value={`₹${d.utilities.toLocaleString()}`} icon="💡" variant="blu" rows={[{ key: "Share", value: <Badge color={T.blu} bg={T.bluDim}>{d.utilitiesShare}</Badge> }, { key: "Entries", value: <span style={{ fontWeight: 700 }}>{d.utilitiesEntries}</span> }]} />
        <StatCard label="Salary & Others" value={`₹${d.salaryOthers.toLocaleString()}`} icon="👨‍💼" variant="amb" rows={[{ key: "Share", value: <Badge color={T.amb} bg={T.ambDim}>{d.salaryShare}</Badge> }, { key: "Entries", value: <span style={{ fontWeight: 700 }}>{d.salaryEntries}</span> }]} />
      </div>
      <TCard title="Expense Entries" badge={`${d.entries.length} entries`}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 750 }}>
          <thead><tr>
            <th style={thStyle}>Date</th><th style={thStyle}>Description</th><th style={thStyle}>Category</th><th style={thStyle}>Vendor</th>
            <th style={thStyle}>Added By</th><th style={thR}>Amount</th><th style={thStyle}>Payment</th><th style={thStyle}>Status</th>
          </tr></thead>
          <tbody>
            {d.entries.map((row, i) => (
              <tr key={i} onMouseEnter={e => (e.currentTarget.style.background = T.s1)} onMouseLeave={e => (e.currentTarget.style.background = "")}>
                <td style={{ ...tdStyle, fontWeight: 700 }}>{row.date}</td>
                <td style={tdStyle}>{row.description}</td><td style={tdStyle}>{row.category}</td>
                <td style={tdStyle}>{row.vendor}</td><td style={tdStyle}>{row.addedBy}</td>
                <td style={{ ...tdR, color: T.ac }}>₹{row.amount.toLocaleString()}</td>
                <td style={tdStyle}>{row.payment}</td>
                <td style={tdStyle}><StatusPill variant={statusVariant(row.status)}>{row.status}</StatusPill></td>
              </tr>
            ))}
          </tbody>
        </table>
      </TCard>
    </div>
  );
}

function CancelledReport() {
  const d = data.cancelledOrders;
  const kotVariant = (s: string): "green" | "red" => s === "Before KOT" ? "green" : "red";
  return (
    <div>
      <PageHeader title="Cancelled Order Report" sub={<>Orders cancelled before completion · <b>09/03/2026 – 15/03/2026</b></>} onExport={() => toast.success("Exported!")} onPrint={() => toast.success("PDF Generated!")} />
      <FilterBar>
        <span style={fLabelStyle}>Channel:</span>
        <select style={fSelStyle}><option>All Channels</option><option>Dine In</option><option>Delivery</option><option>Pickup</option></select>
        <span style={fSepStyle}>From</span><input style={fInputStyle} type="date" defaultValue="2026-03-09" />
        <span style={fSepStyle}>To</span><input style={fInputStyle} type="date" defaultValue="2026-03-15" />
      </FilterBar>
      <div style={sg4}>
        <StatCard label="Cancelled Orders" value={d.count} icon="❌" variant="ac" rows={[{ key: "Lost Revenue", value: <span style={{ fontWeight: 700, color: T.red }}>₹{d.lostRevenue}</span> }, { key: "Cancel Rate", value: <Badge color={T.red} bg={T.redDim}>{d.cancelRate}</Badge> }]} />
        <StatCard label="Before KOT" value={d.beforeKot} icon="🕐" variant="amb" rows={[{ key: "Revenue Impact", value: <span style={{ fontWeight: 700 }}>₹{d.beforeKotRevenue}</span> }, { key: "Share", value: <Badge color={T.amb} bg={T.ambDim}>{d.beforeKotShare}</Badge> }]} />
        <StatCard label="After KOT" value={d.afterKot} icon="🍳" variant="blu" rows={[{ key: "Food Wasted", value: <span style={{ fontWeight: 700 }}>₹{d.afterKotRevenue}</span> }, { key: "Share", value: <Badge color={T.blu} bg={T.bluDim}>{d.afterKotShare}</Badge> }]} />
        <StatCard label="Top Reason" value="No Show" icon="📝" variant="tel" rows={[{ key: "Count", value: <span style={{ fontWeight: 700 }}>{d.topReasonCount}</span> }, { key: "Other", value: <span style={{ fontWeight: 700 }}>Wrong Order</span> }]} />
      </div>
      <TCard title="Cancelled Orders" badge={`${d.orders.length} orders`}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 800 }}>
          <thead><tr>
            <th style={thStyle}>Order #</th><th style={thStyle}>Date</th><th style={thStyle}>Channel</th><th style={thStyle}>Table</th>
            <th style={thStyle}>Waiter</th><th style={thR}>Items</th><th style={thR}>Order Value</th>
            <th style={thStyle}>Cancelled By</th><th style={thStyle}>Reason</th><th style={thStyle}>KOT Status</th>
          </tr></thead>
          <tbody>
            {d.orders.map((row, i) => (
              <tr key={i} onMouseEnter={e => (e.currentTarget.style.background = T.s1)} onMouseLeave={e => (e.currentTarget.style.background = "")}>
                <td style={{ ...tdStyle, fontWeight: 700 }}>{row.id}</td>
                <td style={tdStyle}>{row.date}</td><td style={tdStyle}>{row.channel}</td>
                <td style={tdStyle}>{row.table}</td><td style={tdStyle}>{row.waiter}</td>
                <td style={tdR}><OrderBadge>{row.items}</OrderBadge></td>
                <td style={{ ...tdR, color: T.red }}>₹{row.value}</td>
                <td style={tdStyle}>{row.cancelledBy}</td><td style={tdStyle}>{row.reason}</td>
                <td style={tdStyle}><StatusPill variant={kotVariant(row.kotStatus)}>{row.kotStatus}</StatusPill></td>
              </tr>
            ))}
          </tbody>
        </table>
      </TCard>
    </div>
  );
}

function RemovedKotReport() {
  const d = data.removedKotItems;
  return (
    <div>
      <PageHeader title="Removed KOT Item Report" sub={<>Items removed from KOT after kitchen confirmation · <b>09/03/2026 – 15/03/2026</b></>} onExport={() => toast.success("Exported!")} onPrint={() => toast.success("PDF Generated!")} />
      <FilterBar>
        <span style={fLabelStyle}>Period:</span>
        <select style={fSelStyle}><option>Current Week</option><option>Today</option><option>Last Month</option></select>
        <span style={fSepStyle}>From</span><input style={fInputStyle} type="date" defaultValue="2026-03-09" />
        <span style={fSepStyle}>To</span><input style={fInputStyle} type="date" defaultValue="2026-03-15" />
      </FilterBar>
      <div style={sg4}>
        <StatCard label="Items Removed" value={d.count} icon="🗑️" variant="ac" rows={[{ key: "Value Lost", value: <span style={{ fontWeight: 700, color: T.red }}>₹{d.valueLost}</span> }, { key: "Orders Affected", value: <span style={{ fontWeight: 700 }}>{d.ordersAffected}</span> }]} />
        <StatCard label="By Waiter" value={d.byWaiter} icon="🙋" variant="amb" rows={[{ key: "Value", value: <span style={{ fontWeight: 700 }}>₹{d.byWaiterValue}</span> }, { key: `Top: ${d.topWaiter}`, value: <Badge color={T.amb} bg={T.ambDim}>{d.topWaiterCount}x</Badge> }]} />
        <StatCard label="By Manager" value={d.byManager} icon="👔" variant="blu" rows={[{ key: "Value", value: <span style={{ fontWeight: 700 }}>₹{d.byManagerValue}</span> }, { key: "Reason", value: <Badge color={T.blu} bg={T.bluDim}>{d.byManagerReason}</Badge> }]} />
        <StatCard label="Most Removed" value={d.mostRemovedItem} icon="🍽️" variant="grn" rows={[{ key: "Count", value: <span style={{ fontWeight: 700 }}>{d.mostRemovedCount}</span> }, { key: "Value", value: <span style={{ fontWeight: 700, color: T.red }}>₹{d.mostRemovedValue}</span> }]} />
      </div>
      <TCard title="Removed Items Log" badge={`${d.items.length} removals`}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 750 }}>
          <thead><tr>
            <th style={thStyle}>Order #</th><th style={thStyle}>Date & Time</th><th style={thStyle}>Item Name</th>
            <th style={thR}>Qty</th><th style={thR}>Price</th><th style={thR}>Total Loss</th>
            <th style={thStyle}>Removed By</th><th style={thStyle}>Reason</th><th style={thStyle}>KOT #</th>
          </tr></thead>
          <tbody>
            {d.items.map((row, i) => (
              <tr key={i} onMouseEnter={e => (e.currentTarget.style.background = T.s1)} onMouseLeave={e => (e.currentTarget.style.background = "")}>
                <td style={{ ...tdStyle, fontWeight: 700 }}>{row.orderId}</td>
                <td style={tdStyle}>{row.datetime}</td><td style={tdStyle}>{row.item}</td>
                <td style={tdR}>{row.qty}</td>
                <td style={tdR}>₹{row.price}</td>
                <td style={{ ...tdR, color: T.red }}>₹{row.totalLoss}</td>
                <td style={tdStyle}>{row.removedBy}</td><td style={tdStyle}>{row.reason}</td>
                <td style={tdStyle}>{row.kot}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </TCard>
    </div>
  );
}

function RefundReport() {
  const d = data.refunds;
  const typeVariant = (t: string): "red" | "amber" => t === "Full" ? "red" : "amber";
  return (
    <div>
      <PageHeader title="Refund Report" sub={<>Processed refunds & adjustments · <b>09/03/2026 – 15/03/2026</b></>} onExport={() => toast.success("Exported!")} onPrint={() => toast.success("PDF Generated!")} />
      <FilterBar>
        <span style={fLabelStyle}>Type:</span>
        <select style={fSelStyle}><option>All Refunds</option><option>Full Refund</option><option>Partial Refund</option></select>
        <span style={fSepStyle}>From</span><input style={fInputStyle} type="date" defaultValue="2026-03-09" />
        <span style={fSepStyle}>To</span><input style={fInputStyle} type="date" defaultValue="2026-03-15" />
      </FilterBar>
      <div style={sg4}>
        <StatCard label="Total Refunds" value={`₹${d.totalRefunds}`} icon="↩️" variant="ac" rows={[{ key: "Count", value: <span style={{ fontWeight: 700 }}>{d.refundCount}</span> }, { key: "% of Sales", value: <Badge color={T.red} bg={T.redDim}>{d.pctOfSales}</Badge> }]} />
        <StatCard label="Full Refunds" value={`₹${d.fullRefunds}`} icon="✅" variant="amb" rows={[{ key: "Orders", value: <span style={{ fontWeight: 700 }}>{d.fullRefundCount}</span> }, { key: "Reason", value: <span style={{ fontWeight: 700 }}>{d.fullRefundReason}</span> }]} />
        <StatCard label="Partial Refunds" value={`₹${d.partialRefunds}`} icon="⚖️" variant="blu" rows={[{ key: "Orders", value: <span style={{ fontWeight: 700 }}>{d.partialRefundCount}</span> }, { key: "Reason", value: <span style={{ fontWeight: 700 }}>{d.partialRefundReason}</span> }]} />
        <StatCard label="Refund Rate" value={d.refundRate} icon="📊" variant="grn" rows={[{ key: "Target", value: <span style={{ fontWeight: 700 }}>&lt;2%</span> }, { key: "Status", value: <Badge color={T.amb} bg={T.ambDim}>Watch</Badge> }]} />
      </div>
      <TCard title="Refund Transactions" badge={`${d.transactions.length} refunds`}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 800 }}>
          <thead><tr>
            <th style={thStyle}>Refund #</th><th style={thStyle}>Order #</th><th style={thStyle}>Date</th><th style={thStyle}>Customer</th>
            <th style={thR}>Order Amt</th><th style={thR}>Refund Amt</th><th style={thStyle}>Method</th>
            <th style={thStyle}>Type</th><th style={thStyle}>Reason</th><th style={thStyle}>Status</th>
          </tr></thead>
          <tbody>
            {d.transactions.map((row, i) => (
              <tr key={i} onMouseEnter={e => (e.currentTarget.style.background = T.s1)} onMouseLeave={e => (e.currentTarget.style.background = "")}>
                <td style={{ ...tdStyle, fontWeight: 700 }}>{row.refundId}</td>
                <td style={tdStyle}>{row.orderId}</td><td style={tdStyle}>{row.date}</td><td style={tdStyle}>{row.customer}</td>
                <td style={tdR}>₹{row.orderAmt}</td>
                <td style={{ ...tdR, color: T.red }}>₹{row.refundAmt}</td>
                <td style={tdStyle}>{row.method}</td>
                <td style={tdStyle}><StatusPill variant={typeVariant(row.type)}>{row.type}</StatusPill></td>
                <td style={tdStyle}>{row.reason}</td>
                <td style={tdStyle}><StatusPill variant="green">{row.status}</StatusPill></td>
              </tr>
            ))}
          </tbody>
        </table>
      </TCard>
    </div>
  );
}

function TaxReport() {
  const d = data.tax;
  return (
    <div>
      <PageHeader title="Tax Report" sub={<>GST & tax breakdown for filing · <b>09/03/2026 – 15/03/2026</b></>} onExport={() => toast.success("GST File Exported!")} onPrint={() => toast.success("PDF Generated!")} />
      <FilterBar>
        <span style={fLabelStyle}>Tax Mode:</span>
        <select style={fSelStyle}><option>Item-wise</option><option>Order-wise</option></select>
        <span style={fSepStyle}>Period:</span>
        <select style={fSelStyle}><option>Current Week</option><option>This Month</option><option>Last Quarter</option></select>
      </FilterBar>
      <div style={sg4}>
        <StatCard label="Total Tax Collected" value="₹192.50" icon="🧾" variant="ac" rows={[{ key: "Taxable Sales", value: <span style={{ fontWeight: 700 }}>₹{d.taxableSales}</span> }, { key: "Tax Rate", value: <Badge color={T.blu} bg={T.bluDim}>{d.taxRate}</Badge> }]} />
        <StatCard label="CGST (2.5%)" value={`₹${d.cgst}`} icon="🏛️" variant="grn" rows={[{ key: "On Sales", value: <span style={{ fontWeight: 700 }}>₹{d.taxableSales}</span> }, { key: "Payable", value: <Badge color={T.grn} bg={T.grnDim}>₹{d.cgst}</Badge> }]} />
        <StatCard label="SGST (2.5%)" value={`₹${d.sgst}`} icon="🏢" variant="blu" rows={[{ key: "On Sales", value: <span style={{ fontWeight: 700 }}>₹{d.taxableSales}</span> }, { key: "Payable", value: <Badge color={T.blu} bg={T.bluDim}>₹{d.sgst}</Badge> }]} />
        <StatCard label="Non-Taxable" value={`₹${d.nonTaxable}`} icon="🔖" variant="tel" rows={[{ key: "Exempt Items", value: <span style={{ fontWeight: 700 }}>₹0</span> }, { key: "Orders", value: <span style={{ fontWeight: 700 }}>5</span> }]} />
      </div>
      <div style={info2}>
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
      </div>
      <TCard title="Day-wise Tax Collection" badge="5 days">
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 750 }}>
          <thead><tr>
            <th style={thStyle}>Date</th><th style={thR}>Orders</th><th style={thR}>Sales</th><th style={thR}>Taxable Amt</th>
            <th style={thR}>CGST 2.5%</th><th style={thR}>SGST 2.5%</th><th style={thR}>Total GST</th><th style={thR}>Net Sales</th>
          </tr></thead>
          <tbody>
            {d.dailyTax.map((row, i) => (
              <tr key={i} onMouseEnter={e => (e.currentTarget.style.background = T.s1)} onMouseLeave={e => (e.currentTarget.style.background = "")}>
                <td style={{ ...tdStyle, fontWeight: 700 }}>{row.date}</td>
                <td style={tdR}><OrderBadge>{row.orders}</OrderBadge></td>
                <td style={tdR}>₹{row.sales}</td><td style={tdR}>₹{row.taxableAmt}</td>
                <td style={tdR}>₹{row.cgst}</td><td style={tdR}>₹{row.sgst}</td>
                <td style={{ ...tdR, color: T.grn }}>₹{row.totalGst}</td>
                <td style={{ ...tdR, color: T.ac }}>₹{row.netSales}</td>
              </tr>
            ))}
            <tr style={{ background: T.s1 }}>
              <td style={{ ...tdStyle, fontWeight: 800, color: T.ac }}>Total</td>
              <td style={tdR}><OrderBadge>5</OrderBadge></td>
              <td style={{ ...tdR, fontWeight: 800 }}>₹745</td>
              <td style={{ ...tdR, fontWeight: 800 }}>₹552.50</td>
              <td style={{ ...tdR, color: T.grn, fontSize: 14 }}>₹96.25</td>
              <td style={{ ...tdR, color: T.grn, fontSize: 14 }}>₹96.25</td>
              <td style={{ ...tdR, color: T.ac, fontSize: 14 }}>₹192.50</td>
              <td style={{ ...tdR, color: T.ac, fontSize: 15 }}>₹745</td>
            </tr>
          </tbody>
        </table>
      </TCard>
    </div>
  );
}

function OutstandingReport() {
  const d = data.outstanding;
  return (
    <div>
      <PageHeader title="Outstanding Payments" sub={<>Unpaid & due orders · As of <b>15/03/2026</b></>} onExport={() => toast.success("Reminder Sent!")} onPrint={() => toast.success("PDF Generated!")} />
      <FilterBar>
        <span style={fLabelStyle}>Status:</span>
        <select style={fSelStyle}><option>All Outstanding</option><option>Overdue</option><option>Due Today</option></select>
        <span style={fLabelStyle}>Customer:</span>
        <input style={{ ...fInputStyle, width: 160 }} type="text" placeholder="Search customer…" />
      </FilterBar>
      <div style={sg4}>
        <StatCard label="Total Outstanding" value={`₹${d.totalOutstanding}`} icon="⏳" variant="ac" rows={[{ key: "Orders", value: <Badge color={T.grn} bg={T.grnDim}>0</Badge> }, { key: "Status", value: <Badge color={T.grn} bg={T.grnDim}>All Clear</Badge> }]} />
        <StatCard label="Overdue (>7 days)" value={`₹${d.overdue}`} icon="🚨" variant="amb" rows={[{ key: "Orders", value: <Badge color={T.grn} bg={T.grnDim}>0</Badge> }, { key: "Avg Days", value: <span style={{ fontWeight: 700 }}>—</span> }]} />
        <StatCard label="Due This Week" value={`₹${d.dueThisWeek}`} icon="📅" variant="blu" rows={[{ key: "Orders", value: <Badge color={T.grn} bg={T.grnDim}>0</Badge> }, { key: "Follow-up", value: <Badge color={T.grn} bg={T.grnDim}>None</Badge> }]} />
        <StatCard label="Recovered" value={`₹${d.recoveredThisMonth}`} icon="✅" variant="grn" rows={[{ key: "This Month", value: <Badge color={T.grn} bg={T.grnDim}>₹{d.recoveredThisMonth}</Badge> }, { key: "Orders", value: <span style={{ fontWeight: 700 }}>{d.recoveredOrders}</span> }]} />
      </div>
      <div style={{ background: T.w, border: `1.5px solid ${T.bd}`, borderRadius: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: `1px solid ${T.bd}` }}>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, color: T.tx }}>Outstanding Orders</div>
          <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: T.grnDim, color: T.grn, border: `1px solid ${T.grnBdr}` }}>0 pending</span>
        </div>
        <div style={{ padding: "60px 20px", textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, color: T.tx, marginBottom: 8 }}>All Payments Cleared!</div>
          <div style={{ fontSize: 13, color: T.t3 }}>No outstanding payments as of 15/03/2026</div>
        </div>
      </div>
    </div>
  );
}

function InventoryReport() {
  const d = data.inventory;
  const statusVariant = (s: string): "green" | "red" | "amber" => s === "Good" ? "green" : s === "Out of Stock" ? "red" : "amber";
  return (
    <div>
      <PageHeader title="Inventory Report" sub={<>Current stock & usage tracking · <b>March 2026</b></>} onExport={() => toast.success("Exported!")} onPrint={() => toast.success("PDF Generated!")} />
      <FilterBar>
        <span style={fLabelStyle}>Category:</span>
        <select style={fSelStyle}><option>All Items</option><option>Raw Material</option><option>Beverages</option><option>Packaging</option></select>
        <span style={fLabelStyle}>Status:</span>
        <select style={fSelStyle}><option>All Status</option><option>Low Stock</option><option>Out of Stock</option><option>Good</option></select>
      </FilterBar>
      <div style={sg4}>
        <StatCard label="Total Items" value={d.totalItems} icon="📦" variant="ac" rows={[{ key: "Low Stock", value: <Badge color={T.red} bg={T.redDim}>{d.lowStockCount}</Badge> }, { key: "Out of Stock", value: <Badge color={T.red} bg={T.redDim}>{d.outOfStockCount}</Badge> }]} />
        <StatCard label="Low Stock Alert" value={d.lowStockCount} icon="⚠️" variant="amb" rows={[{ key: "Needs Reorder", value: <span style={{ fontWeight: 700 }}>{d.needsReorder}</span> }, { key: "Critical", value: <Badge color={T.red} bg={T.redDim}>{d.criticalCount}</Badge> }]} />
        <StatCard label="Well Stocked" value={d.wellStocked} icon="✅" variant="grn" rows={[{ key: "Optimal", value: <span style={{ fontWeight: 700 }}>{d.optimal}</span> }, { key: "Overstocked", value: <Badge color={T.amb} bg={T.ambDim}>{d.overstocked}</Badge> }]} />
        <StatCard label="Consumed" value={d.consumedThisMonth} icon="📉" variant="blu" rows={[{ key: "of Total", value: <span style={{ fontWeight: 700 }}>{d.consumedPct}</span> }, { key: "Reorder Value", value: <span style={{ fontWeight: 700 }}>{d.reorderValue}</span> }]} />
      </div>
      <TCard title="Inventory Items" badge={`${d.items.length} items`}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 800 }}>
          <thead><tr>
            <th style={thStyle}>Item</th><th style={thStyle}>Category</th><th style={thStyle}>Unit</th>
            <th style={thR}>Opening</th><th style={thR}>Received</th><th style={thR}>Consumed</th><th style={thR}>Closing</th>
            <th style={thR}>Min Stock</th><th style={thStyle}>Status</th>
          </tr></thead>
          <tbody>
            {d.items.map((row, i) => (
              <tr key={i} onMouseEnter={e => (e.currentTarget.style.background = T.s1)} onMouseLeave={e => (e.currentTarget.style.background = "")}>
                <td style={{ ...tdStyle, fontWeight: 700 }}>{row.name}</td>
                <td style={tdStyle}>{row.category}</td><td style={tdStyle}>{row.unit}</td>
                <td style={tdR}>{row.opening}</td><td style={tdR}>{row.received}</td>
                <td style={tdR}>{row.consumed}</td>
                <td style={{ ...tdR, color: row.closing === 0 ? T.red : row.closing < row.minStock ? T.amb : T.grn, fontWeight: 800 }}>{row.closing}</td>
                <td style={tdR}>{row.minStock}</td>
                <td style={tdStyle}><StatusPill variant={statusVariant(row.status)}>{row.status}</StatusPill></td>
              </tr>
            ))}
          </tbody>
        </table>
      </TCard>
    </div>
  );
}

function StockReport() {
  const d = data.stock;
  const statusVariant = (s: string): "green" | "red" | "amber" => s === "Good" ? "green" : s === "Out" ? "red" : "amber";
  return (
    <div>
      <PageHeader title="Stock Report" sub={<>SKU-level stock valuation & reorder status · <b>March 2026</b></>} onExport={() => toast.success("Exported!")} onPrint={() => toast.success("PDF Generated!")} />
      <FilterBar>
        <span style={fLabelStyle}>Category:</span>
        <select style={fSelStyle}><option>All Items</option><option>Vegetables</option><option>Non-Veg</option><option>Dairy</option><option>Grains</option></select>
        <span style={fLabelStyle}>Status:</span>
        <select style={fSelStyle}><option>All Status</option><option>Low</option><option>Critical</option><option>Out</option><option>Good</option></select>
      </FilterBar>
      <div style={sg4}>
        <StatCard label="Total SKUs" value={d.totalSKUs} icon="🗄️" variant="ac" rows={[{ key: "Total Value", value: <span style={{ fontWeight: 700 }}>{d.totalValue}</span> }, { key: "vs Last Month", value: <Badge color={T.grn} bg={T.grnDim}>{d.totalValueChange}</Badge> }]} />
        <StatCard label="In Transit" value={d.inTransit} icon="🚚" variant="blu" rows={[{ key: "Value", value: <span style={{ fontWeight: 700 }}>{d.inTransitValue}</span> }, { key: "ETA", value: <span style={{ fontWeight: 700 }}>2 days</span> }]} />
        <StatCard label="Reorder Needed" value="4 items" icon="⚠️" variant="amb" rows={[{ key: "Value", value: <span style={{ fontWeight: 700 }}>₹2,200</span> }, { key: "Urgent", value: <Badge color={T.red} bg={T.redDim}>2</Badge> }]} />
        <StatCard label="Last Updated" value={d.lastUpdated} icon="🔄" variant="grn" rows={[{ key: "By", value: <span style={{ fontWeight: 700 }}>Arjun K.</span> }, { key: "Next Audit", value: <span style={{ fontWeight: 700 }}>22/03</span> }]} />
      </div>
      <TCard title="Stock Ledger" badge={`${d.items.length} items`}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
          <thead><tr>
            <th style={thStyle}>SKU</th><th style={thStyle}>Item Name</th><th style={thStyle}>Category</th><th style={thStyle}>Unit</th>
            <th style={thR}>Qty</th><th style={thR}>Unit Cost</th><th style={thR}>Total Value</th>
            <th style={thR}>Reorder Level</th><th style={thStyle}>Supplier</th><th style={thStyle}>Last Purchase</th><th style={thStyle}>Status</th>
          </tr></thead>
          <tbody>
            {d.items.map((row, i) => (
              <tr key={i} onMouseEnter={e => (e.currentTarget.style.background = T.s1)} onMouseLeave={e => (e.currentTarget.style.background = "")}>
                <td style={{ ...tdStyle, fontFamily: "monospace", fontSize: 12 }}>{row.sku}</td>
                <td style={{ ...tdStyle, fontWeight: 700 }}>{row.name}</td>
                <td style={tdStyle}>{row.category}</td><td style={tdStyle}>{row.unit}</td>
                <td style={{ ...tdR, color: row.qty === 0 ? T.red : row.qty < row.reorderLevel ? T.amb : T.grn, fontWeight: 800 }}>{row.qty}</td>
                <td style={tdR}>₹{row.unitCost}</td>
                <td style={{ ...tdR, color: T.ac }}>₹{row.totalValue.toLocaleString()}</td>
                <td style={tdR}>{row.reorderLevel}</td>
                <td style={tdStyle}>{row.supplier}</td><td style={tdStyle}>{row.lastPurchase}</td>
                <td style={tdStyle}><StatusPill variant={statusVariant(row.status)}>{row.status}</StatusPill></td>
              </tr>
            ))}
          </tbody>
        </table>
      </TCard>
    </div>
  );
}

// ── Sidebar nav items ──────────────────────────────────────────────────────
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
    <div style={{ display: "flex", height: "100%", fontFamily: "Plus Jakarta Sans,sans-serif", background: T.bg, color: T.tx, fontSize: 14 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        table { min-width: 100% }
      `}</style>

      {/* Sidebar */}
      <div style={{ width: 210, background: T.w, borderRight: `1px solid ${T.bd}`, display: "flex", flexDirection: "column", flexShrink: 0, overflow: "hidden" }}>
        <div style={{ padding: "14px 14px 6px", fontFamily: "'Playfair Display',serif", fontSize: 17, fontWeight: 700, color: T.tx }}>
          Reports<span style={{ color: T.ac }}>.</span>
        </div>
        <div style={{ margin: "0 14px 8px", height: 2, borderRadius: 2, background: `linear-gradient(90deg,${T.ac},transparent)` }} />
        <div style={{ flex: 1, overflowY: "auto", paddingBottom: 10 }}>
          {sections.map(sec => (
            <div key={sec}>
              <div style={{ padding: "8px 20px 3px", fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "1.2px", color: T.t3 }}>{sec}</div>
              {NAV_ITEMS.filter(n => n.section === sec).map(item => (
                <div
                  key={item.key}
                  onClick={() => setActive(item.key)}
                  style={{
                    display: "flex", alignItems: "center", gap: 9, padding: "9px 12px",
                    borderRadius: 10, margin: "1px 8px", cursor: "pointer",
                    fontSize: 12.5, fontWeight: active === item.key ? 700 : 500,
                    transition: "all .14s",
                    background: active === item.key ? T.ac : "transparent",
                    color: active === item.key ? "#fff" : T.t2,
                    boxShadow: active === item.key ? "0 3px 10px rgba(255,61,1,0.22)" : "none",
                  }}
                  onMouseEnter={e => { if (active !== item.key) { (e.currentTarget as HTMLDivElement).style.background = T.s2; (e.currentTarget as HTMLDivElement).style.color = T.tx; } }}
                  onMouseLeave={e => { if (active !== item.key) { (e.currentTarget as HTMLDivElement).style.background = "transparent"; (e.currentTarget as HTMLDivElement).style.color = T.t2; } }}
                >
                  <span style={{ width: 18, textAlign: "center", flexShrink: 0, fontSize: 14 }}>{item.icon}</span>
                  {item.label}
                </div>
              ))}
            </div>
          ))}
        </div>
        <div style={{ padding: "10px 12px", borderTop: `1px solid ${T.bd}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 12px", background: T.s1, border: `1.5px solid ${T.bd}`, borderRadius: 10, cursor: "pointer", fontSize: 12, fontWeight: 600, color: T.t2 }}>
            🛒 Customer Site
            <svg style={{ marginLeft: "auto", opacity: .4 }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 22px" }}>
        <ReportComponent />
      </div>
    </div>
  );
}
