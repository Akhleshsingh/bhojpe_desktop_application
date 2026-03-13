import React from "react";
import { useAuth } from "../context/AuthContext";
import { useTables } from "../context/TablesContext";
import {
  Box,
  Typography,
  Modal,
  Button,
  Divider,
} from "@mui/material";

type Props = {
  open: boolean;
  onClose: () => void;
  onSelectTable: (table: any) => void;
};
const TABLE_STATUS_COLOR: Record<string, string> = {
  available: "#FFFFFF",   // Empty
  running: "#CBDBF8",     // Running order
  reserved: "#FAC9BB",    // Reserved / KOT
  kot: "#FAC9BB",         // Alias if comes
};


export default function AssignTableModal({
  open,
  onClose,
  onSelectTable,
}: Props) {

   const { branchData } = useAuth();
const [selectedTable, setSelectedTable] = React.useState<any>(null);
     const { tables :liveTables  } = useTables();
const tables = liveTables || "null";
const tableAreaMap = React.useMemo(() => {
  const map = new Map<number, string>();

  branchData?.data?.area?.forEach((area: any) => {
    area.tables.forEach((t: any) => {
      map.set(t.id, area.area_name.toLowerCase());
    });
  });

  return map;
}, [branchData]);

const normalizedTables = React.useMemo(() => {
  return liveTables.map((t: any) => ({
    id: t.id,
    tableNo: t.table_code,
    seats: t.seating_capacity,
    status: t.available_status,     // available | running | reserved
    activeOrder: t.active_order,    // 👈 IMPORTANT
 area: tableAreaMap.get(t.id)?.includes("ground")
  ? "ground"
  : tableAreaMap.get(t.id)?.includes("first")
  ? "first"
  : tableAreaMap.get(t.id)?.includes("roof")
  ? "roof"
  : "other",

  }));
}, [liveTables, tableAreaMap]);
const groupedTables = React.useMemo(() => {
  return normalizedTables.reduce((acc: any, table: any) => {
    if (!acc[table.area]) acc[table.area] = [];
    acc[table.area].push(table);
    return acc;
  }, {});
}, [normalizedTables]);

console.log("Grouped Tables:", groupedTables);
  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          width: 700,
          background: "#fff",
          borderRadius: "10px",
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          boxShadow: 24,
          overflow: "hidden",
        }}
      >
        {/* HEADER */}
        <Box sx={{ p: 3 }}>
          <Typography fontSize={18} fontWeight={700}>
            Available Tables
          </Typography>
        </Box>

        <Divider />

        {/* BODY */}
      {/* BODY */}
<Box
  sx={{
    display: "grid",
    gridTemplateColumns: "2fr 1fr",
    gap: 4,
    p: 3,
  }}
>
  {/* LEFT SIDE */}
  <Box>
    {/* GROUND FLOOR */}
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        <Typography fontWeight={600}>Ground Floor</Typography>
        <Box
          sx={{
            px: 1.5,
            py: "2px",
            border: "1px solid #CBD5E1",
            borderRadius: "6px",
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          {groupedTables.ground?.length || 0} Table
        </Box>
      </Box>

      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" , overflowY: 'auto', maxHeight: '350px' }}>
        {groupedTables.ground?.map((table: any) => (
          <Box
            key={table.id}
          onClick={() => setSelectedTable(table)}
          sx={{
  width: 120,
  height: 90,
  border: "1px solid #E5E7EB",
  borderRadius: "8px",
  backgroundColor:
    TABLE_STATUS_COLOR[table.status] || "#FFFFFF",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  transition: "all 0.2s ease",
  "&:hover": {
    boxShadow: "0px 4px 12px rgba(0,0,0,0.1)",
  },
}}

          >
            <Box
              sx={{
                backgroundColor:
                  table.status === "available"
                    ? "#D1FAE5"
                    : "#FEE2E2",
                color:
                  table.status === "available"
                    ? "#047857"
                    : "#DC2626",
                px: 2,
                py: "4px",
                borderRadius: "6px",
                fontWeight: 700,
                mb: 1,
              }}
            >
              {table.tableNo}
            </Box>

            <Typography fontSize={12} color="#6B7280">
              {table.seats} Seat(s)
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>

    {/* FIRST FLOOR */}
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        <Typography fontWeight={600}>First Floor</Typography>
        <Box
          sx={{
            px: 1.5,
            py: "2px",
            border: "1px solid #CBD5E1",
            borderRadius: "6px",
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          {groupedTables.first?.length || 0} Table
        </Box>
      </Box>

      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
        {groupedTables.first?.map((table: any) => (
          <Box
            key={table.id}
          onClick={() => setSelectedTable(table)}
            sx={{
  width: 120,
  height: 90,
  borderRadius: "8px",
  border:
    selectedTable?.id === table.id
      ? "2px solid #5A7863"
      : "1px solid #E5E7EB",
   backgroundColor:
  selectedTable?.id === table.id
    ? "#EBF4DD"
    : TABLE_STATUS_COLOR[table.status] || "#FFFFFF",

  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  transition: "all 0.2s ease",
  "&:hover": {
    boxShadow: "0px 4px 12px rgba(0,0,0,0.1)",
  },
}}
          >
            <Box
              sx={{
                backgroundColor:
                  table.status === "available"
                    ? "#D1FAE5"
                    : "#FEE2E2",
                color:
                  table.status === "available"
                    ? "#047857"
                    : "#DC2626",
                px: 2,
                py: "4px",
                borderRadius: "6px",
                fontWeight: 700,
                mb: 1,
              }}
            >
              {table.tableNo}
            </Box>

            <Typography fontSize={12} color="#6B7280">
              {table.seats} Seat(s)
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>

    {/* ROOF TOP */}
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Typography fontWeight={600}>Roof Top</Typography>
        <Box
          sx={{
            px: 1.5,
            py: "2px",
            border: "1px solid #CBD5E1",
            borderRadius: "6px",
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          {groupedTables.roof?.length || 0} Table
        </Box>
      </Box>
    </Box>
  </Box>

  {/* RIGHT SIDE */}
  <Box>
    <Typography fontWeight={600} mb={1}>
      Today Reservations
    </Typography>
    <Typography fontSize={14} color="#6B7280">
      No table is reserved.
    </Typography>
  </Box>
</Box>


    <Box
  sx={{
    backgroundColor: "#F3F4F6",
    p: 2,
    display: "flex",
    justifyContent: "space-between",
  }}
>
  <Button variant="outlined" onClick={onClose}>
    Cancel
  </Button>

  <Button
    variant="contained"
    disabled={!selectedTable}
    sx={{
      bgcolor: "#5A7863",
      textTransform: "none",
      "&:disabled": { bgcolor: "#CBD5E1" },
    }}
    onClick={() => {
      onSelectTable(selectedTable);
      onClose();
    }}
  >
    Assign Table
  </Button>
</Box>

      </Box>
    </Modal>
  );
}
