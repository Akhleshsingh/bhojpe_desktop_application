import {
  Box, Typography, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Select, MenuItem, FormControl,
  InputLabel, ToggleButton, ToggleButtonGroup, CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import eyeicon from "../assets/Group 314.png";
import printicon from "../assets/Group 315.png";
import { useAuth } from "../context/AuthContext";
import { useTables } from "../context/TablesContext";
import { useOrders } from "../context/OrdersContext";
import { useLocation } from "react-router-dom";
import { BASE_URL } from "../utils/api";

/* ── design tokens ── */
const ACCENT = "#FF3D01";
const ACCENT_H = "#e63500";
const ACCENT_DIM = "rgba(255,61,1,0.08)";
const FONT = "'Montserrat', sans-serif";
const SERIF = "'Playfair Display', serif";

const STATUS_STYLES: Record<string, { bg: string; border: string; text: string }> = {
  available:  { bg: "#ffffff",   border: "#d1d5db",  text: "#9ca3af"  },
  running:    { bg: "#dbeafe",   border: "#93c5fd",  text: "#1d4ed8"  },
  kot:        { bg: "#ffe4d6",   border: "#fdba74",  text: "#c2410c"  },
  print:      { bg: "#fef9c3",   border: "#fde047",  text: "#a16207"  },
};
const LEGEND_ITEMS = [
  { key: "available", label: "Available" },
  { key: "running",   label: "Running"   },
  { key: "kot",       label: "Reserved"  },
  { key: "print",     label: "Bill Print"},
];

export default function Dashboard() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { branchData, token } = useAuth();
  const { orders }  = useOrders();
  const { tables: liveTables, fetchTables } = useTables();

  /* ── merge / KOT-move state ── */
  const [mergeOpen,       setMergeOpen]       = useState(false);
  const [selectedTables,  setSelectedTables]  = useState<number[]>([]);
  const [kotMoveOpen,     setKotMoveOpen]     = useState(false);
  const [sourceTable,     setSourceTable]     = useState<any>(null);
  const [targetTableId,   setTargetTableId]   = useState<number | null>(null);
  const [sourceSelectOpen,setSourceSelectOpen]= useState(false);

  /* ── filter state ── */
  const [selectedAreaId,  setSelectedAreaId]  = useState<number | "all">("all");
  const [selectedStatus,  setSelectedStatus]  = useState<string>("all");

  /* ── add-table popup ── */
  const [addOpen,     setAddOpen]     = useState(false);
  const [addArea,     setAddArea]     = useState<number | "">("");
  const [addCode,     setAddCode]     = useState("");
  const [addSeats,    setAddSeats]    = useState("");
  const [addStatus,   setAddStatus]   = useState<"active" | "inactive">("active");
  const [addSaving,   setAddSaving]   = useState(false);
  const [addError,    setAddError]    = useState("");

  /* ── areas from branchData ── */
  const areas: any[] = branchData?.data?.area ?? [];

  /* ── live table map ── */
  const liveTableMap = React.useMemo(() => {
    const m = new Map<number, any>();
    liveTables.forEach((t: any) => m.set(t.id, t));
    return m;
  }, [liveTables]);

  /* ── helpers ── */
  const deriveStatus = (availStatus: string, order: any) => {
    if (order) {
      if (order.status === "billed") return "print";
      if (order.status === "kot")    return "kot";
      return "running";
    }
    if (availStatus === "reserved") return "kot";
    return "available";
  };

  const getFullOrder = (tableId: number) => {
    const liveOrder = liveTableMap.get(tableId)?.active_order;
    if (liveOrder) {
      return orders.find((o: any) =>
        o.id === liveOrder.id || o.order_number === liveOrder.order_number
      ) || liveOrder;
    }
    return orders.find((o: any) =>
      o.table_id === tableId &&
      o.order_type?.slug === "dine_in" &&
      o.status !== "cancelled"
    ) || null;
  };

  const getActiveOrder = (tableId: number) =>
    liveTableMap.get(tableId)?.active_order ?? null;

  /* ── mapped tables (area-enriched) ── */
  const mappedTables = areas.flatMap((area: any) =>
    (area.tables || []).map((table: any) => {
      const order = getFullOrder(table.id);
      return {
        id:          table.id,
        tableNo:     table.table_code,
        seating:     table.seating_capacity,
        areaId:      area.id,
        areaName:    typeof area.area_name === "object"
                       ? (area.area_name.en ?? Object.values(area.area_name)[0])
                       : area.area_name,
        activeOrder: order,
        kotCount:    order?.kot?.length ?? 0,
        amount:      order?.total ?? null,
        status:      deriveStatus(table.available_status, order),
      };
    })
  );

  /* ── filtered tables ── */
  const byArea = selectedAreaId === "all"
    ? mappedTables
    : mappedTables.filter((t: any) => t.areaId === selectedAreaId);

  const byStatus = selectedStatus === "all"
    ? byArea
    : byArea.filter((t: any) => t.status === selectedStatus);

  /* ── grouped by areaId for "All Area" view ── */
  const groupedByArea = areas.map((area: any) => ({
    area,
    tables: byStatus.filter((t: any) => t.areaId === area.id),
  })).filter(g => g.tables.length > 0);

  /* ── area tabs ── */
  React.useEffect(() => {
    if (selectedAreaId === "all") setSelectedStatus("all");
  }, [selectedAreaId]);

  /* ── navigation ── */
  const gotoMenu = (table: any, mode: string) => {
    navigate("/poss", {
      state: {
        mode,
        tableId: table.id,
        tableNo: table.tableNo,
        seating: table.seating,
        fromTable: true,
        activeOrder: getActiveOrder(table.id),
      },
    });
  };

  /* ── merge ── */
  const mergeableTables = mappedTables.filter(
    (t: any) => t.status === "running" || t.status === "kot"
  );
  const toggleMergeSelect = (id: number) =>
    setSelectedTables(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  const handleMergeTables = () => {
    if (selectedTables.length < 2) { alert("Select at least 2 tables"); return; }
    setMergeOpen(false);
    setSelectedTables([]);
  };

  /* ── KOT move ── */
  const availableTables = mappedTables.filter(
    (t: any) => t.status === "available" && t.id !== sourceTable?.id
  );
  const handleKotMove = async () => {
    if (!sourceTable || !targetTableId) return;
    alert(`KOT moved from Table ${sourceTable.tableNo} → ${targetTableId}`);
    setKotMoveOpen(false);
    setTargetTableId(null);
    setSourceTable(null);
  };

  /* ── open merge from route state ── */
  useEffect(() => {
    if (location.state?.openMerge) {
      setMergeOpen(true);
      if (location.state?.sourceTableId) {
        const t = mappedTables.find((t: any) => t.id === location.state.sourceTableId);
        if (t) setSelectedTables([t.id]);
      }
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, mappedTables, navigate, location.pathname]);

  /* ── add table ── */
  const handleAddTable = async () => {
    if (!addCode.trim() || !addSeats || !addArea) {
      setAddError("Please fill all fields");
      return;
    }
    setAddSaving(true);
    setAddError("");
    try {
      const res = await fetch(`${BASE_URL}/tables/store`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          area_id: addArea,
          table_code: addCode.trim(),
          seating_capacity: Number(addSeats),
          available_status: addStatus === "active" ? "available" : "inactive",
        }),
      });
      const json = await res.json();
      if (json.status || res.ok) {
        await fetchTables();
        setAddOpen(false);
        setAddCode(""); setAddSeats(""); setAddArea(""); setAddStatus("active");
      } else {
        setAddError(json.message || "Failed to add table");
      }
    } catch {
      setAddError("Network error, please try again");
    } finally {
      setAddSaving(false);
    }
  };

  /* ── table card renderer ── */
  const TableCard = ({ table }: { table: any }) => {
    const s = STATUS_STYLES[table.status] ?? STATUS_STYLES.available;
    const isOccupied = table.status !== "available";
    return (
      <Box
        onClick={() => gotoMenu(table, isOccupied ? "view" : "new")}
        sx={{
          border: `1.5px solid ${s.border}`,
          borderRadius: "14px",
          padding: "13px",
          cursor: "pointer",
          minHeight: 110,
          background: s.bg,
          display: "flex",
          flexDirection: "column",
          transition: "all .18s",
          "&:hover": { transform: "translateY(-2px)", boxShadow: "0 4px 16px rgba(0,0,0,0.10)" },
        }}
      >
        {/* row 1: seats + KOT */}
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: "4px" }}>
          <Typography sx={{ fontSize: 11, fontWeight: 600, color: s.text, fontFamily: FONT }}>
            {table.seating} Seat(s)
          </Typography>
          <Typography sx={{ fontSize: 11, fontWeight: 700, color: s.text, fontFamily: FONT }}>
            {isOccupied ? `${table.kotCount} KOT` : ""}
          </Typography>
        </Box>

        {/* table number */}
        <Typography sx={{ fontFamily: SERIF, fontSize: 26, fontWeight: 700, color: s.text, mb: "2px" }}>
          {table.tableNo}
        </Typography>

        {/* time / pax placeholder */}
        <Typography sx={{ fontSize: 12, fontWeight: 700, color: s.text, mb: "auto", fontFamily: FONT }}>
          {table.amount ? `₹${table.amount}` : ""}
        </Typography>

        {/* row bottom: action icons + pax */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
          {isOccupied && (
            <>
              <Box
                component="span"
                onClick={e => { e.stopPropagation(); gotoMenu(table, "view"); }}
                sx={{
                  width: 30, height: 30, borderRadius: "8px",
                  border: `1px solid ${s.border}`, background: "rgba(255,255,255,0.7)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", "&:hover": { opacity: 0.75 },
                }}
              >
                <img src={eyeicon} width={16} alt="view" />
              </Box>
              <Box
                component="span"
                onClick={e => { e.stopPropagation(); gotoMenu(table, "kot"); }}
                sx={{
                  width: 30, height: 30, borderRadius: "8px",
                  border: `1px solid ${s.border}`, background: "rgba(255,255,255,0.7)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", "&:hover": { opacity: 0.75 },
                }}
              >
                <img src={printicon} width={16} alt="kot" />
              </Box>
            </>
          )}
          {table.activeOrder?.number_of_pax && (
            <Box sx={{ ml: "auto", display: "flex", alignItems: "center", gap: 0.5 }}>
              <span style={{ fontSize: 13 }}>👥</span>
              <Typography sx={{ fontSize: 12, fontWeight: 600, color: s.text, fontFamily: FONT }}>
                {table.activeOrder.number_of_pax}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    );
  };

  /* ── area tab area name helper ── */
  const areaLabel = (area: any) =>
    typeof area.area_name === "object"
      ? (area.area_name.en ?? Object.values(area.area_name)[0])
      : area.area_name;

  /* ────────────────── RENDER ────────────────── */
  return (
    <Box sx={{
      minHeight: "100vh",
      background: "#f5f0ea",
      fontFamily: FONT,
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
    }}>

      {/* ── CONTENT ── */}
      <Box sx={{ flex: 1, overflowY: "auto", px: "22px", py: "20px",
        "&::-webkit-scrollbar": { width: 5 },
        "&::-webkit-scrollbar-thumb": { background: "#cfc5ba", borderRadius: 4 },
      }}>

        {/* PAGE HEADER */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: "16px" }}>
          <Typography sx={{ fontFamily: SERIF, fontSize: 22, fontWeight: 700, color: "#1a1208" }}>
            Table View
          </Typography>
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            {/* Pickup shortcut */}
            <Button
              onClick={() => navigate("/poss", { state: { channel: "pickup" } })}
              sx={{
                fontFamily: FONT, fontWeight: 700, fontSize: 13, textTransform: "none",
                background: "#fff", color: "#2563eb",
                border: "1.5px solid #2563eb",
                borderRadius: "9px", px: "16px", py: "7px",
                "&:hover": { background: "rgba(37,99,235,.07)" },
              }}
            >
              🛍️ Pickup
            </Button>
            {/* Delivery shortcut */}
            <Button
              onClick={() => navigate("/poss", { state: { channel: "delivery" } })}
              sx={{
                fontFamily: FONT, fontWeight: 700, fontSize: 13, textTransform: "none",
                background: "#fff", color: "#16a34a",
                border: "1.5px solid #16a34a",
                borderRadius: "9px", px: "16px", py: "7px",
                "&:hover": { background: "rgba(22,163,74,.07)" },
              }}
            >
              🛵 Delivery
            </Button>
            <Button
              onClick={() => { setAddArea(""); setAddCode(""); setAddSeats(""); setAddStatus("active"); setAddError(""); setAddOpen(true); }}
              sx={{
                fontFamily: FONT, fontWeight: 700, fontSize: 13, textTransform: "none",
                background: ACCENT, color: "#fff", borderRadius: "9px", px: "18px", py: "8px",
                boxShadow: "0 3px 10px rgba(255,61,1,0.25)",
                "&:hover": { background: ACCENT_H },
              }}
            >
              + Add Table
            </Button>
          </Box>
        </Box>

        {/* CONTROLS ROW */}
        <Box sx={{ display: "flex", alignItems: "center", gap: "10px", mb: "20px", flexWrap: "wrap" }}>

          {/* Area tabs */}
          <Box sx={{ display: "flex", gap: "6px" }}>
            {[{ id: "all", label: "All Area" }, ...areas.map(a => ({ id: a.id, label: areaLabel(a) }))].map(tab => {
              const active = selectedAreaId === tab.id;
              return (
                <Box
                  key={tab.id}
                  onClick={() => setSelectedAreaId(tab.id as any)}
                  sx={{
                    px: "16px", py: "7px", borderRadius: "20px", fontSize: 12, fontWeight: 600,
                    cursor: "pointer", fontFamily: FONT,
                    border: `1.5px solid ${active ? ACCENT : "#e2d9d0"}`,
                    background: active ? ACCENT : "#ffffff",
                    color: active ? "#fff" : "#6b5c4a",
                    boxShadow: active ? "0 2px 8px rgba(255,61,1,0.25)" : "none",
                    transition: "all .15s",
                    "&:hover": active ? {} : { borderColor: "#cfc5ba", color: "#1a1208" },
                  }}
                >
                  {tab.label}
                </Box>
              );
            })}
          </Box>

          <Box sx={{ flex: 1 }} />

          {/* Legend */}
          <Box sx={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            {LEGEND_ITEMS.map(item => {
              const s = STATUS_STYLES[item.key];
              const active = selectedStatus === item.key;
              return (
                <Box
                  key={item.key}
                  onClick={() => setSelectedStatus(prev => prev === item.key ? "all" : item.key)}
                  sx={{
                    display: "flex", alignItems: "center", gap: "6px",
                    fontSize: 12, color: "#6b5c4a", fontWeight: 500, fontFamily: FONT,
                    cursor: "pointer",
                    px: "8px", py: "4px", borderRadius: "6px",
                    background: active ? ACCENT_DIM : "transparent",
                    border: `1px solid ${active ? "rgba(255,61,1,0.3)" : "transparent"}`,
                    transition: "all .15s",
                  }}
                >
                  <Box sx={{
                    width: 12, height: 12, borderRadius: "3px",
                    background: s.bg, border: `1.5px solid ${s.border}`,
                  }} />
                  {item.label}
                </Box>
              );
            })}
          </Box>

          {/* Action chips */}
          <Box sx={{ display: "flex", gap: "8px" }}>
            <Box
              onClick={() => setSourceSelectOpen(true)}
              sx={{
                display: "flex", alignItems: "center", gap: "6px",
                px: "14px", py: "7px", background: "#fff",
                border: "1.5px solid #e2d9d0", borderRadius: "9px",
                fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: FONT, color: "#6b5c4a",
                transition: "all .15s", "&:hover": { borderColor: "#cfc5ba", color: "#1a1208" },
              }}
            >
              🔀 Items/KOT Move
            </Box>
            <Box
              onClick={() => setMergeOpen(true)}
              sx={{
                display: "flex", alignItems: "center", gap: "6px",
                px: "14px", py: "7px", background: "#fff",
                border: "1.5px solid #e2d9d0", borderRadius: "9px",
                fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: FONT, color: "#6b5c4a",
                transition: "all .15s", "&:hover": { borderColor: "#cfc5ba", color: "#1a1208" },
              }}
            >
              ⇄ Merge Table
            </Box>
          </Box>
        </Box>

        {/* TABLE SECTIONS */}
        {selectedAreaId === "all" ? (
          groupedByArea.length === 0 ? (
            <Typography sx={{ color: "#a8978a", fontFamily: FONT, mt: 4, textAlign: "center" }}>
              No tables found
            </Typography>
          ) : (
            groupedByArea.map(({ area, tables }) => (
              <Box key={area.id} sx={{ mb: "24px" }}>
                {/* Floor header */}
                <Box sx={{ display: "flex", alignItems: "center", gap: "12px", mb: "12px" }}>
                  <Typography sx={{ fontFamily: SERIF, fontSize: 17, fontWeight: 700, color: "#1a1208" }}>
                    {areaLabel(area)}
                  </Typography>
                  <Box sx={{
                    fontSize: 11, fontWeight: 700, px: "10px", py: "3px",
                    borderRadius: "20px", background: "#f0ebe3", color: "#6b5c4a",
                    border: "1px solid #e2d9d0", fontFamily: FONT,
                  }}>
                    {tables.length} Tables
                  </Box>
                </Box>

                {/* Table grid */}
                <Box sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(150px, 180px))",
                  gap: "12px",
                }}>
                  {tables.map((table: any) => (
                    <TableCard key={table.id} table={table} />
                  ))}
                </Box>
              </Box>
            ))
          )
        ) : (
          <Box sx={{ mb: "24px" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: "12px", mb: "12px" }}>
              <Typography sx={{ fontFamily: SERIF, fontSize: 17, fontWeight: 700, color: "#1a1208" }}>
                {areaLabel(areas.find((a: any) => a.id === selectedAreaId) ?? {})}
              </Typography>
              <Box sx={{
                fontSize: 11, fontWeight: 700, px: "10px", py: "3px",
                borderRadius: "20px", background: "#f0ebe3", color: "#6b5c4a",
                border: "1px solid #e2d9d0", fontFamily: FONT,
              }}>
                {byStatus.length} Tables
              </Box>
            </Box>
            <Box sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(150px, 180px))",
              gap: "12px",
            }}>
              {byStatus.map((table: any) => (
                <TableCard key={table.id} table={table} />
              ))}
            </Box>
          </Box>
        )}
      </Box>

      {/* ══════════════════ ADD TABLE DIALOG ══════════════════ */}
      <Dialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        PaperProps={{
          sx: {
            width: 480, borderRadius: "14px",
            fontFamily: FONT, p: 1,
          },
        }}
      >
        <DialogTitle sx={{ fontFamily: FONT, fontWeight: 700, fontSize: 20, pb: 0 }}>
          Add Table
        </DialogTitle>
        <DialogContent sx={{ pt: "20px !important", display: "flex", flexDirection: "column", gap: 2.5 }}>

          {/* Choose Area */}
          <FormControl fullWidth>
            <InputLabel sx={{ fontFamily: FONT, fontSize: 13 }}>Choose Area</InputLabel>
            <Select
              value={addArea}
              label="Choose Area"
              onChange={e => setAddArea(e.target.value as number)}
              sx={{ fontFamily: FONT, fontSize: 13, borderRadius: "8px" }}
            >
              <MenuItem value="" disabled>--</MenuItem>
              {areas.map((area: any) => (
                <MenuItem key={area.id} value={area.id} sx={{ fontFamily: FONT, fontSize: 13 }}>
                  {areaLabel(area)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Table Code */}
          <TextField
            label="Table Code"
            placeholder="e.g. T01"
            value={addCode}
            onChange={e => setAddCode(e.target.value)}
            fullWidth
            InputProps={{ sx: { fontFamily: FONT, fontSize: 13, borderRadius: "8px" } }}
            InputLabelProps={{ sx: { fontFamily: FONT, fontSize: 13 } }}
          />

          {/* Seating Capacity */}
          <TextField
            label="Seating Capacity"
            placeholder="Enter number of seats (e.g., 4)"
            type="number"
            value={addSeats}
            onChange={e => setAddSeats(e.target.value)}
            fullWidth
            InputProps={{ sx: { fontFamily: FONT, fontSize: 13, borderRadius: "8px" } }}
            InputLabelProps={{ sx: { fontFamily: FONT, fontSize: 13 } }}
          />

          {/* Status */}
          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 600, fontFamily: FONT, mb: 1 }}>
              Status
            </Typography>
            <ToggleButtonGroup
              exclusive
              value={addStatus}
              onChange={(_e, v) => { if (v) setAddStatus(v); }}
              sx={{ gap: 1 }}
            >
              <ToggleButton
                value="active"
                sx={{
                  fontFamily: FONT, fontSize: 13, textTransform: "none",
                  borderRadius: "8px !important", px: 3, border: "1.5px solid #d1d5db !important",
                  "&.Mui-selected": {
                    borderColor: `${ACCENT} !important`,
                    color: ACCENT, background: ACCENT_DIM,
                  },
                }}
              >
                Active
              </ToggleButton>
              <ToggleButton
                value="inactive"
                sx={{
                  fontFamily: FONT, fontSize: 13, textTransform: "none",
                  borderRadius: "8px !important", px: 3, border: "1.5px solid #d1d5db !important",
                  "&.Mui-selected": {
                    borderColor: "#d1d5db !important",
                    color: "#374151", background: "#f3f4f6",
                  },
                }}
              >
                Inactive
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {addError && (
            <Typography sx={{ fontSize: 12, color: "red", fontFamily: FONT }}>
              {addError}
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button
            variant="contained"
            onClick={handleAddTable}
            disabled={addSaving}
            sx={{
              fontFamily: FONT, fontWeight: 700, textTransform: "none",
              background: ACCENT, borderRadius: "8px", px: 3,
              boxShadow: "none",
              "&:hover": { background: ACCENT_H, boxShadow: "none" },
              "&.Mui-disabled": { background: "#e5e7eb", color: "#9ca3af" },
            }}
          >
            {addSaving ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : "Save"}
          </Button>
          <Button
            variant="outlined"
            onClick={() => setAddOpen(false)}
            sx={{
              fontFamily: FONT, textTransform: "none", borderRadius: "8px",
              borderColor: "#d1d5db", color: "#374151",
              "&:hover": { borderColor: "#9ca3af", background: "#f9fafb" },
            }}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* ══════════════════ MERGE TABLES DIALOG ══════════════════ */}
      {mergeOpen && (
        <Box sx={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 4000,
        }}>
          <Box sx={{ width: 440, background: "#fff", borderRadius: "12px", boxShadow: "0 10px 30px rgba(0,0,0,0.2)", p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
              <Box sx={{ width: 36, height: 36, borderRadius: "8px", background: "#E8F0FE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🔀</Box>
              <Typography fontSize={18} fontWeight={700} fontFamily={FONT}>Merge Tables</Typography>
            </Box>
            <Typography fontSize={13} color="#6B7280" sx={{ mb: 2.5, lineHeight: 1.5, fontFamily: FONT }}>
              Select one or more tables with unpaid orders to merge into the current order:
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {mergeableTables.map((table: any) => (
                <Box key={table.id} sx={{
                  border: "1px solid #E5E7EB", borderRadius: "10px", px: 2, py: 1.5,
                  display: "flex", alignItems: "center", justifyContent: "space-between", transition: "0.2s",
                  "&:hover": { borderColor: "#c5d89d", background: "#FAFAFA" },
                }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <input type="checkbox" checked={selectedTables.includes(table.id)} onChange={() => toggleMergeSelect(table.id)} style={{ width: 16, height: 16 }} />
                    <Typography fontWeight={600} fontFamily={FONT}>{table.tableNo}</Typography>
                  </Box>
                  <Typography fontSize={12} color="#9CA3AF" fontWeight={600} fontFamily={FONT}>Kot</Typography>
                </Box>
              ))}
            </Box>
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5, mt: 3 }}>
              <Button variant="outlined" onClick={() => setMergeOpen(false)} sx={{ textTransform: "none", borderRadius: "8px", px: 2.5, fontFamily: FONT }}>Cancel</Button>
              <Button variant="contained" disabled={selectedTables.length < 2} onClick={handleMergeTables}
                sx={{
                  textTransform: "none", borderRadius: "8px", px: 2.5, boxShadow: "none", fontFamily: FONT,
                  bgcolor: selectedTables.length < 2 ? "#E5E7EB" : "#5A7863",
                  color: selectedTables.length < 2 ? "#9CA3AF" : "#fff",
                }}>
                MERGE TABLES
              </Button>
            </Box>
          </Box>
        </Box>
      )}

      {/* ══════════════════ KOT MOVE — SOURCE SELECT ══════════════════ */}
      {sourceSelectOpen && (
        <Box sx={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 5000 }}>
          <Box sx={{ width: 420, background: "#FFF", borderRadius: "12px", p: 3 }}>
            <Typography fontWeight={700} mb={2} fontFamily={FONT}>Select Table to Move KOT</Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1.5 }}>
              {mappedTables.filter((t: any) => t.status === "running" || t.status === "kot")
                .map((table: any) => {
                  const s = STATUS_STYLES[table.status];
                  return (
                    <Box key={table.id} onClick={() => { setSourceTable(table); setSourceSelectOpen(false); setKotMoveOpen(true); }}
                      sx={{
                        border: `1.5px solid ${s.border}`, borderRadius: "10px", p: 1.5,
                        background: s.bg, cursor: "pointer", textAlign: "center",
                        "&:hover": { transform: "scale(1.03)" }, transition: "0.15s",
                      }}>
                      <Typography fontWeight={700} fontFamily={SERIF} fontSize={20} color={s.text}>{table.tableNo}</Typography>
                      <Typography fontSize={11} color={s.text} fontFamily={FONT}>{table.kotCount} KOT</Typography>
                    </Box>
                  );
                })}
            </Box>
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
              <Button variant="outlined" onClick={() => setSourceSelectOpen(false)} sx={{ textTransform: "none", borderRadius: "8px", fontFamily: FONT }}>Cancel</Button>
            </Box>
          </Box>
        </Box>
      )}

      {/* ══════════════════ KOT MOVE — TARGET SELECT ══════════════════ */}
      {kotMoveOpen && (
        <Box sx={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 5000 }}>
          <Box sx={{ width: 420, background: "#FFF", borderRadius: "12px", p: 3 }}>
            <Typography fontWeight={700} mb={1} fontFamily={FONT}>
              Move KOT from <span style={{ color: ACCENT }}>{sourceTable?.tableNo}</span> to:
            </Typography>
            <Typography fontSize={13} color="#6B7280" mb={2} fontFamily={FONT}>Select an available table</Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1.5 }}>
              {availableTables.map((table: any) => (
                <Box key={table.id} onClick={() => setTargetTableId(table.id)}
                  sx={{
                    border: `1.5px solid ${targetTableId === table.id ? ACCENT : "#d1d5db"}`,
                    borderRadius: "10px", p: 1.5, background: targetTableId === table.id ? ACCENT_DIM : "#fff",
                    cursor: "pointer", textAlign: "center", transition: "0.15s",
                    "&:hover": { borderColor: ACCENT },
                  }}>
                  <Typography fontWeight={700} fontFamily={SERIF} fontSize={20} color={targetTableId === table.id ? ACCENT : "#1a1208"}>{table.tableNo}</Typography>
                  <Typography fontSize={11} color="#6b5c4a" fontFamily={FONT}>{table.seating} Seats</Typography>
                </Box>
              ))}
            </Box>
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5, mt: 3 }}>
              <Button variant="outlined" onClick={() => { setKotMoveOpen(false); setTargetTableId(null); }} sx={{ textTransform: "none", borderRadius: "8px", fontFamily: FONT }}>Cancel</Button>
              <Button variant="contained" disabled={!targetTableId} onClick={handleKotMove}
                sx={{
                  textTransform: "none", borderRadius: "8px", px: 2.5, boxShadow: "none", fontFamily: FONT,
                  bgcolor: targetTableId ? ACCENT : "#E5E7EB",
                  color: targetTableId ? "#fff" : "#9CA3AF",
                  "&:hover": { bgcolor: targetTableId ? ACCENT_H : "#E5E7EB" },
                }}>
                Move KOT
              </Button>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
}
