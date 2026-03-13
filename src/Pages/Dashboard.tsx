import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import eyeicon from "../assets/Group 314.png";
import printicon from "../assets/Group 315.png";
import mergeicon from "../assets/image 330.png";
import { useAuth } from "../context/AuthContext";
import { useTables } from "../context/TablesContext";
type TableStatus = "all" | "available" | "running" | "kot";
import { useOrders } from "../context/OrdersContext";
import { useLocation } from "react-router-dom";


const TABLE_STATUS_COLOR: Record<string, string> = {
  available: "#FFFFFF",
  running: "#CBDBF8",
  kot: "#FAC9BB",
  print: "#F6F0D7",
};

const areaBoxStyle = {
  width: 100,
  height: 32,
  borderRadius: "5px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  fontSize: "14px",
};

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { branchData } = useAuth();
  const { orders } = useOrders();
   const { tables :liveTables , loading , fetchTables} = useTables();
const [mergeOpen, setMergeOpen] = useState(false);
const [selectedTables, setSelectedTables] = useState<number[]>([]);
const [kotMoveOpen, setKotMoveOpen] = useState(false);
const [sourceTable, setSourceTable] = useState<any>(null);
const [targetTableId, setTargetTableId] = useState<number | null>(null);
const [sourceSelectOpen, setSourceSelectOpen] = useState(false);
  const [selectedArea, setSelectedArea] = useState<
    "all" | "ground" | "first" | "roof"
  >("all");
  const [selectedStatus, setSelectedStatus] = useState<
  "all" | "available" | "running" | "kot"
>("all");
const deriveTableStatus = (
  availableStatus: string,
  order: any
) => {
  if (order) {
    if (order.status === "billed") return "print";
    if (order.status === "kot") return "kot";
    return "running";
  }

  if (availableStatus === "reserved") return "kot";

  return "available";
};
const getOrderByTableId = (tableId: number) => {
  return orders.find(
    (o: any) =>
      o.table_id === tableId &&
      o.order_type?.slug === "dine_in" &&
      o.status !== "cancelled"
  ) || null;
};
const getFullActiveOrderByTableId = (tableId: number) => {
  const liveOrder = liveTableMap.get(tableId)?.active_order;

  if (liveOrder) {
        return (
      orders.find(
        (o: any) =>
          o.id === liveOrder.id ||
          o.order_number === liveOrder.order_number
      ) || liveOrder
    );
  }

  // 2️⃣ Fallback → derive from orders API
  return getOrderByTableId(tableId);
};

const liveTableMap = React.useMemo(() => {
  const map = new Map<number, any>();
  liveTables.forEach(t => map.set(t.id, t));
  return map;
}, [liveTables]);
console.log(liveTableMap ,"livetablemap")
useEffect(() => {
  console.log("LIVE TABLES", liveTables);
}, [liveTables]);

const getActiveOrderByTableId = (tableId: number) => {
  return liveTableMap.get(tableId)?.active_order ?? null;
};
  const areas = branchData?.data?.area ?? [];

const mappedTables = areas.flatMap((area: any) =>
  (area.tables || []).map((table: any) => {
    const liveTable = liveTableMap.get(table.id);

   const fullActiveOrder = getFullActiveOrderByTableId(table.id);

return {
  id: table.id,
  tableNo: table.table_code,
  seating: table.seating_capacity,
    activeOrder: fullActiveOrder,
  kotCount: fullActiveOrder?.kot?.length ?? 0,
  amount: fullActiveOrder?.total ?? null,
  area: area.area_name.toLowerCase().includes("ground")
    ? "ground"
    : area.area_name.toLowerCase().includes("first")
    ? "first"
    : area.area_name.toLowerCase().includes("roof")
    ? "roof"
    : "other",
  status: deriveTableStatus(
    table.available_status,
    fullActiveOrder
  ),


};

  })
);
React.useEffect(() => {
  if (selectedArea === "all") {
    setSelectedStatus("all");
  }
}, [selectedArea]);
  const visibleTables =
    selectedArea === "all"
      ? mappedTables
      : mappedTables.filter((t) => t.area === selectedArea);

const statusFilteredTables =
  selectedStatus === "all"
    ? visibleTables
    : visibleTables.filter(
        (t) => t.status === selectedStatus
      );

  const handleTableClick = (table: any) => {
    navigate("/menudashboard", {
      state: {
        tableId: table.id,
        tableNo: table.tableNo,
        seating: table.seating,
         fromTable: true,
      },
    });
  };
const areaTitleMap: Record<string, string> = {
  ground: "Ground Floor",
  first: "First Floor",
  roof: "Roof Top",
};

const groupedTables = statusFilteredTables.reduce((acc: any, table: any) => {
  if (!acc[table.area]) acc[table.area] = [];
  acc[table.area].push(table);
  return acc;
}, {});

const handleNewOrder = (table: any) => {
  navigate("/menudashboard", {
    state: {
      mode: "new",
      tableId: table.id,
      tableNo: table.tableNo,
      seating: table.seating,
       fromTable: true,
    },
  });
};

const handleViewOrder = (table: any) => {
const activeOrder = getActiveOrderByTableId(table.id);
console.log(activeOrder)
  navigate("/menudashboard", {
    state: {
      mode: "view",
      tableId: table.id,
    activeOrder: activeOrder,
        tableNo: table.tableNo,
        seating: table.seating,
         fromTable: true,
    },
  });
};

const handleNewKot = (table: any) => {
const activeOrder = getActiveOrderByTableId(table.id);
  navigate("/menudashboard", {
    state: {
      mode: "kot",
      tableId: table.id,
     activeOrder: activeOrder,
        tableNo: table.tableNo,
        seating: table.seating,
         fromTable: true,
    },
  });
};
const mergeableTables = mappedTables.filter(
  (t) => t.status === "running" || t.status === "kot"
);
const toggleTableSelect = (tableId: number) => {
  setSelectedTables((prev) =>
    prev.includes(tableId)
      ? prev.filter((id) => id !== tableId)
      : [...prev, tableId]
  );
};
const handleMergeTables = () => {
  if (selectedTables.length < 2) {
    alert("Select at least 2 tables to merge");
    return;
  }

  console.log("Merging tables:", selectedTables);
  setMergeOpen(false);
  setSelectedTables([]);
};
const availableTables = mappedTables.filter(
  (t) =>
    t.status === "available" &&
    t.id !== sourceTable?.id
);

const handleKotMove = async () => {
  if (!sourceTable || !targetTableId) return;

  console.log("Moving KOT →", {
    from: sourceTable.id,
    to: targetTableId,
  });


  alert(
    `KOT moved from Table ${sourceTable.tableNo} → ${targetTableId}`
  );

  setKotMoveOpen(false);
  setTargetTableId(null);
  setSourceTable(null);
};
useEffect(() => {
  if (location.state?.openMerge) {
    setMergeOpen(true);
    if (location.state?.sourceTableId) {
      const table = mappedTables.find(
        (t) => t.id === location.state.sourceTableId
      );

      if (table) {
        setSelectedTables([table.id]);
      }
    }
    navigate(location.pathname, { replace: true });
  }
}, [location.state, mappedTables, navigate, location.pathname]);

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#FFFFFF", overflow: "auto", fontFamily: "Poppins, sans-serif" }}>
      <Box sx={{ padding: 2 }}>
        {/* Page title row */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5, px: 1, pb: 1.5, borderBottom: "1px solid #E5E5E5" }}>
          <Typography sx={{ fontWeight: 700, fontSize: 18, fontFamily: "Poppins, sans-serif" }}>
            Table View
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button variant="outlined" sx={{ textTransform: "none", borderRadius: "6px", borderColor: "#DADADA", color: "#333", fontFamily: "Poppins, sans-serif", fontSize: 13, px: 2, "&:hover": { borderColor: "#999", backgroundColor: "#F5F5F5" } }}>Pickup</Button>
            <Button variant="outlined" sx={{ textTransform: "none", borderRadius: "6px", borderColor: "#DADADA", color: "#333", fontFamily: "Poppins, sans-serif", fontSize: 13, px: 2, "&:hover": { borderColor: "#999", backgroundColor: "#F5F5F5" } }}>Delivery</Button>
            <Button variant="contained" sx={{ textTransform: "none", borderRadius: "6px", backgroundColor: "#E8353A", fontFamily: "Poppins, sans-serif", fontSize: 13, px: 2, boxShadow: "none", "&:hover": { backgroundColor: "#C62828", boxShadow: "none" } }}>Add Table</Button>
          </Box>
        </Box>

        {/* Filters row */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1, p: 1.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0 }}>
            {[
              { key: "all", label: "All Area" },
              { key: "ground", label: "Ground Floor" },
              { key: "first", label: "First Floor" },
              { key: "roof", label: "Roof Top" },
            ].map((area) => (
              <Box
                key={area.key}
                onClick={() => setSelectedArea(area.key as any)}
                sx={{
                  ...areaBoxStyle,
                  fontFamily: "Poppins, sans-serif",
                  backgroundColor: selectedArea === area.key ? "#C5D89D" : "transparent",
                  fontWeight: selectedArea === area.key ? 600 : 400,
                  border: selectedArea === area.key ? "1px solid #DADADA" : "none",
                }}
              >
                {area.label}
              </Box>
            ))}
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            {[
              { key: "available", label: "Available",  color: "#FFFFFF" },
              { key: "running",   label: "Running",    color: "#CBDBF8" },
              { key: "kot",       label: "Reserved",   color: "#FAC9BB" },
              { key: "print",     label: "Bill Print", color: "#F6F0D7" },
            ].map((item) => (
              <Box
                key={item.label}
                onClick={() => setSelectedStatus(item.key as any)}
                sx={{
                  display: "flex", alignItems: "center", gap: 1,
                  padding: "4px 10px",
                  border: "1px solid #00000030",
                  borderRadius: "5px",
                  cursor: "pointer",
                  fontFamily: "Poppins, sans-serif",
                  backgroundColor: selectedStatus === item.key ? "#F5F5F5" : "transparent",
                }}
              >
                <Box sx={{ width: 26, height: 26, backgroundColor: item.color, borderRadius: "4px", boxShadow: "0px 0px 4px 0px #00000040", border: "1px solid #E0E0E0" }} />
                <Typography fontSize="13px" fontFamily="Poppins, sans-serif">{item.label}</Typography>
              </Box>
            ))}
          </Box>

          <Box sx={{ display: "flex", gap: 1 }}>
            <Button variant="contained" onClick={() => setSourceSelectOpen(true)} sx={{ textTransform: "none", backgroundColor: "#FFFFFF", border: "1px solid #DADADA", color: "#333", borderRadius: "5px", fontFamily: "Poppins, sans-serif", fontSize: 13, boxShadow: "none", "&:hover": { backgroundColor: "#C5D89D", boxShadow: "none" } }}>Items/KOT Move</Button>
            <Button variant="contained" onClick={() => setMergeOpen(true)} sx={{ textTransform: "none", backgroundColor: "#FFFFFF", border: "1px solid #DADADA", color: "#333", borderRadius: "5px", fontFamily: "Poppins, sans-serif", fontSize: 13, boxShadow: "none", display: "flex", alignItems: "center", gap: "6px", "&:hover": { backgroundColor: "#C5D89D", boxShadow: "none" } }}>
              <img src={mergeicon} alt="merge" width={20} height={20} />
              Merge Table
            </Button>
          </Box>
        </Box>
<Box sx={{ mt: 3, px: 2 }}>
  {selectedArea === "all" ? (
    Object.entries(groupedTables).map(([areaKey, tables]: any) => (
      <Box key={areaKey} sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
          <Typography sx={{ fontSize: "16px", fontWeight: 600, color: "#111111", fontFamily: "Poppins, sans-serif" }}>
            {areaTitleMap[areaKey] ?? areaKey}
          </Typography>
          <Box sx={{ px: 1, py: "2px", backgroundColor: "#F0F0F0", borderRadius: "4px", fontSize: 12, color: "#555", fontFamily: "Poppins, sans-serif" }}>
            Table {tables.length}
          </Box>
        </Box>
        <Box
          sx={{
            display: "grid",
          gridTemplateColumns: "repeat(auto-fill, 250px)",
            gap: 2, cursor: "pointer",
          }}
        >
          {tables.map((table: any, i: number) => (
            <Box
              key={i}
            onClick={() => handleNewOrder(table)}
              sx={{
                width: "250px",
                height: "122px",
                borderRadius: "10px",
                padding: "8px",
                border: "1px solid #DADADA",
                backgroundColor: TABLE_STATUS_COLOR[table.status],
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between", cursor: "pointer",
              }}
            >
<Box
  sx={{
    display: "grid",
    gridTemplateColumns: "1fr auto 1fr",
    alignItems: "center",
  }}
>
  <Typography
    sx={{
      fontWeight: 600,
      fontSize: 13,
      textAlign: "left",
    }}
  >
    {table.seating} Seat(s)
  </Typography>

  <Typography
    sx={{
      fontWeight: 700,
      fontSize: 16,
      textAlign: "center",
    }}
  >
    {table.tableNo}
  </Typography>

  {/* RIGHT → Pax + KOT */}
  <Box
    sx={{
      display: "flex",
      justifyContent: "flex-end",
      alignItems: "center",
      gap: 1,
    }}
  >

    {/* KOT */}
    <Typography
      sx={{
        fontWeight: 600,
        fontSize: 12,
        color: "#555",
      }}
    >
      {table.kotCount} KOT
    </Typography>
  </Box>
</Box>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box sx={{ display: "flex", gap: 2 ,cursor: "pointer",}}>
                  {(table.status === "running" ||
                    table.status === "print" ||
                    table.status === "kot") && (
                    <>
                      <img src={eyeicon} style={{cursor :"pointer"}} width={30}  onClick={(e) => {
    e.stopPropagation();
    handleViewOrder(table);
  }} />
                      <img src={printicon}  style={{cursor :"pointer"}}  onClick={(e) => {
    e.stopPropagation();
    handleNewKot(table);
  }} width={30} />
                    </>
                  )}
                </Box>
 {/* Pax */}
    {table.activeOrder?.number_of_pax && (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.5,
        }}
      >
        {/* Dummy icon – replace later */}
        <span style={{ fontSize: 14 }}>👥</span>

        <Typography
          sx={{
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          {table.activeOrder.number_of_pax}
        </Typography>
      </Box>
    )}
                {table.amount && (
                  <Typography fontWeight={600}>
                    ₹{table.amount}
                  </Typography>
                )}
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    ))
  ) : (
    <>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
        <Typography sx={{ fontSize: "16px", fontWeight: 600, color: "#111111", fontFamily: "Poppins, sans-serif" }}>
          {areaTitleMap[selectedArea]}
        </Typography>
        <Box sx={{ px: 1, py: "2px", backgroundColor: "#F0F0F0", borderRadius: "4px", fontSize: 12, color: "#555", fontFamily: "Poppins, sans-serif" }}>
          Table {statusFilteredTables.length}
        </Box>
      </Box>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, 250px)",
          gap: 2,
        }}
      >
        {statusFilteredTables.map((table, i) => (
          <Box
            key={i}
            onClick={() => handleTableClick(table)}
            sx={{
              width: "250px",
              height: "122px",
              borderRadius: "10px",
              padding: "8px",
              border: "1px solid #DADADA",
              backgroundColor: TABLE_STATUS_COLOR[table.status],
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography fontWeight={600}>{table.seating}</Typography>
              <Typography fontWeight={700}>{table.tableNo}</Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box sx={{ display: "flex", gap: 2 }}>
                {(table.status === "running" ||
                  table.status === "print" ||
                  table.status === "kot") && (
                  <>
                    <img src={eyeicon}  style={{cursor :"pointer"}}  width={30} />
                    <img src={printicon}  style={{cursor :"pointer"}}  width={30} />
                  </>
                )}
              </Box>

              {table.amount && (
                <Typography fontWeight={600}>
                  ₹{table.amount}
                </Typography>
              )}
            </Box>
          </Box>
        ))}
      </Box>
    </>
  )}
</Box>
{mergeOpen && (
  <Box
    sx={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.45)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 4000,
    }}
  >
    <Box
      sx={{
        width: 440,
        background: "#FFFFFF",
        borderRadius: "12px",
        boxShadow: "0px 10px 30px rgba(0,0,0,0.2)",
        p: 3,
      }}
    >
      {/* 🔹 HEADER */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: "8px",
            background: "#E8F0FE",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
          }}
        >
          🔀
        </Box>

        <Typography fontSize={18} fontWeight={700}>
          Merge Tables
        </Typography>
      </Box>

      {/* 🔹 SUBTITLE */}
      <Typography
        fontSize={13}
        color="#6B7280"
        sx={{ mb: 2.5, lineHeight: 1.5 }}
      >
        Select one or more tables with unpaid orders to merge
        into the current order:
      </Typography>

      {/* 🔹 TABLE LIST */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        {mergeableTables.map((table) => (
          <Box
            key={table.id}
            sx={{
              border: "1px solid #E5E7EB",
              borderRadius: "10px",
              px: 2,
              py: 1.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              transition: "0.2s",
              "&:hover": {
                borderColor: "#C5D89D",
                background: "#FAFAFA",
              },
            }}
          >
            {/* LEFT */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <input
                type="checkbox"
                checked={selectedTables.includes(table.id)}
                onChange={() => toggleTableSelect(table.id)}
                style={{ width: 16, height: 16 }}
              />

              <Typography fontWeight={600}>
                {table.tableNo}
              </Typography>
            </Box>

            {/* RIGHT */}
            <Typography
              fontSize={12}
              color="#9CA3AF"
              fontWeight={600}
            >
              Kot
            </Typography>
          </Box>
        ))}
      </Box>

      {/* 🔹 FOOTER */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 1.5,
          mt: 3,
        }}
      >
        <Button
          variant="outlined"
          onClick={() => setMergeOpen(false)}
          sx={{
            textTransform: "none",
            borderRadius: "8px",
            px: 2.5,
          }}
        >
          Cancel
        </Button>

       <Button
  variant="contained"
  disabled={selectedTables.length < 2}
  onClick={handleMergeTables}
  sx={{
    textTransform: "none",
    borderRadius: "8px",
    px: 2.5,
    bgcolor: selectedTables.length < 2 ? "#E5E7EB" : "#5A7863",
    color: selectedTables.length < 2 ? "#9CA3AF" : "#FFFFFF",
    boxShadow: "none",
  }}
>
  MERGE TABLES
</Button>

      </Box>
    </Box>
  </Box>
)}
{sourceSelectOpen && (
  <Box
    sx={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.45)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 5000,
    }}
  >
    <Box
      sx={{
        width: 420,
        background: "#FFF",
        borderRadius: "12px",
        p: 3,
      }}
    >
      <Typography fontWeight={700} mb={2}>
        Select Table to Move KOT
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 1.5,
        }}
      >
        {mappedTables
          .filter(
            (t) =>
              t.status === "running" || t.status === "kot"
          )
          .map((table) => (
            <Box
              key={table.id}
              onClick={() => {
                setSourceTable(table);
                setSourceSelectOpen(false);
                setKotMoveOpen(true);
              }}
              sx={{
                height: 60,
                borderRadius: "8px",
                background: "#CBDBF8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {table.tableNo}
            </Box>
          ))}
      </Box>
    </Box>
  </Box>
)}

{kotMoveOpen && (
  <Box
    sx={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.45)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 5000,
    }}
  >
    <Box
      sx={{
        width: 420,
        background: "#FFFFFF",
        borderRadius: "12px",
        boxShadow: "0px 10px 30px rgba(0,0,0,0.2)",
        p: 3,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* 🔹 HEADER */}
      <Typography fontSize={18} fontWeight={700} mb={1}>
        Move KOT
      </Typography>

      <Typography fontSize={13} color="#6B7280" mb={2}>
        Move order from Table{" "}
        <strong>{sourceTable?.tableNo}</strong>
      </Typography>

      {/* 🔹 TABLE GRID */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 1.5,
          maxHeight: 220,
          overflowY: "auto",
        }}
      >
        {availableTables.length === 0 && (
          <Typography fontSize={12}>
            No available tables
          </Typography>
        )}

        {availableTables.map((table) => (
          <Box
            key={table.id}
            onClick={() => setTargetTableId(table.id)}
            sx={{
              height: 60,
              borderRadius: "8px",
              border:
                targetTableId === table.id
                  ? "2px solid #5A7863"
                  : "1px solid #E5E7EB",
              background:
                targetTableId === table.id
                  ? "#EBF4DD"
                  : "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {table.tableNo}
          </Box>
        ))}
      </Box>

      {/* 🔹 FOOTER (UPDATED) */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 1.5,
          mt: 3,
        }}
      >
        {/* ✅ CANCEL BUTTON */}
        <Button
          variant="outlined"
          onClick={() => {
            setKotMoveOpen(false);
            setTargetTableId(null);
            setSourceTable(null);
          }}
          sx={{
            textTransform: "none",
            borderRadius: "8px",
            px: 2.5,
          }}
        >
          Cancel
        </Button>

        {/* ✅ MOVE BUTTON */}
        <Button
          variant="contained"
          disabled={!targetTableId}
          onClick={handleKotMove}
          sx={{
            bgcolor: "#5A7863",
            textTransform: "none",
            borderRadius: "8px",
            px: 2.5,
          }}
        >
          Move KOT
        </Button>
      </Box>
    </Box>
  </Box>
)}
      </Box>
    </Box>
  );
}


