import { Box, Typography, Divider, Grid } from "@mui/material";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { useOrders } from "../context/OrdersContext";
import delivery from "../assets/image 358 (1).png";
import orderIcon from "../assets/image 358.png";
import { Button, Dropdown } from "react-bootstrap";
import { useWaiters } from "../context/WaitersContext";
import { useNavigate } from "react-router-dom";
import React from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import  calendericon from "../assets/calendar.png";
import BillDrawer from "../components/BillDrawer";
import CheckoutModal from "../components/CheckoutModal";
type OrderGroup =
  | "all"
  | "dine_in"
  | "delivery"
  | "pickup"
  | "draft"
  | "billed"
  | "kot";
  const PAYMENT_OPTIONS = [
  { value: "cash", label: "Cash" },
  { value: "card", label: "Card" },
  { value: "upi", label: "UPI" },
];
const orderStatusUI = [
  { key: "placed", label: "Placed" },
  { key: "confirmed", label: "Confirmed" },
  { key: "preparing", label: "Preparing" },
  { key: "food_ready", label: "Ready" },
  { key: "served", label: "Served" },
  { key: "delivered", label: "Delivered" },
];
const getDraftDisplayNumber = (draft: any, index: number) => {
  return `D-${draft._draftId?.toString().slice(-4) || index + 1}`;
};

const getDraftTotal = (draft: any) => {
  return (
    draft.cart?.reduce(
      (sum: number, i: any) => sum + i.price * i.qty,
      0
    ) || 0
  );
};


export default function OrdersHistory() {
   const navigate = useNavigate();
 const { orders, loading, fetchOrders,ordersTotal  } = useOrders();
 const { filters } = useOrders();
 const token = localStorage.getItem("token");
  const { waiters } = useWaiters();
  const [dateLabel, setDateLabel] = useState("Today");
  const [orderLabel, setOrderLabel] = useState("Show All Orders");
  const [waiterLabel, setWaiterLabel] = useState("Show All Waiter");
const [selectedOrderNo, setSelectedOrderNo] = useState<string | null>(null);
const [billDrawerOpen, setBillDrawerOpen] = useState(false);
const [billedOrderData, setBilledOrderData] = useState<any>(null);
const [selectedWaiter, setSelectedWaiter] = useState<number | null>(null);
const [checkoutOpen, setCheckoutOpen] = useState(false);
const [checkoutOrder, setCheckoutOrder] = useState<any>(null);
const [page, setPage] = useState(1);
const perPage = 10;
const [fromDate, setFromDate] = useState<string | null>(null);
const [toDate, setToDate] = useState<string | null>(null);
const toDateObj = (d: string | null) => (d ? new Date(d) : null);
const toYMD = (d: Date | null) => {
  if (!d) return null;
  return dayjs(d).format("YYYY-MM-DD");
};

const [selectedOrderGroup, setSelectedOrderGroup] =
  useState<OrderGroup>("all");
const [showFromCal, setShowFromCal] = useState(false);
const [showToCal, setShowToCal] = useState(false);
const draftOrders = React.useMemo(() => {
  const drafts =
    JSON.parse(localStorage.getItem("pos_draft_orders") || "[]");

  const offline =
    JSON.parse(localStorage.getItem("offlineOrders") || "[]");

const normalizedOffline = offline.map((o: any) => ({
  ...o,
  mode: "offline",
  order_number: o.orderNumber,
  created_at: o._createdAt || o.createdAt,
  order_type: {
    order_type_name: o.orderType?.type || "offline",
  },
  cart: o.cart || [],
  kot: [],
  kot_count: 0,
  total:
    o.cart?.reduce(
      (s: number, i: any) => s + i.price * i.qty,
      0
    ) || 0,
}));

  return [...drafts, ...normalizedOffline];
}, []);



const allOrders = React.useMemo(() => {
  if (selectedOrderGroup === "draft") {
    return draftOrders;
  }
  if (selectedOrderGroup === "all") {
    return [...draftOrders, ...orders];
  }
  return orders;
}, [draftOrders, orders, selectedOrderGroup]);



 const getOrderTypeIcon = (type?: string) => {
  if (!type) return null;
  const t = type.toLowerCase();

  if (t.includes("delivery")) return delivery;
  if (t.includes("pickup")) return orderIcon;

  return null; // dine-in or others
};
const getDateRangeFromLabel = (label: string) => {
  const today = dayjs();

  switch (label) {
    case "Today":
      return {
        from: today.format("YYYY-MM-DD"),
        to: today.format("YYYY-MM-DD"),
      };

    case "Yesterday":
      const y = today.subtract(1, "day");
      return {
        from: y.format("YYYY-MM-DD"),
        to: y.format("YYYY-MM-DD"),
      };

    case "This Week":
      return {
        from: today.startOf("week").format("YYYY-MM-DD"),
        to: today.endOf("week").format("YYYY-MM-DD"),
      };

    case "This Month":
      return {
        from: today.startOf("month").format("YYYY-MM-DD"),
        to: today.endOf("month").format("YYYY-MM-DD"),
      };

    case "Last 3 Months":
      return {
        from: today.subtract(3, "month").startOf("month").format("YYYY-MM-DD"),
        to: today.format("YYYY-MM-DD"),
      };

    case "Last 6 Months":
      return {
        from: today.subtract(6, "month").startOf("month").format("YYYY-MM-DD"),
        to: today.format("YYYY-MM-DD"),
      };

    case "This Year":
      return {
        from: today.startOf("year").format("YYYY-MM-DD"),
        to: today.endOf("year").format("YYYY-MM-DD"),
      };

    default:
      return { from: null, to: null };
  }
};

const normalizeOrderType = (v?: string) =>
    v?.toLowerCase().replace(/\s+/g, "_");

 useEffect(() => {
  fetchOrders({
    page,
    per_page: perPage,
    waiter_id: selectedWaiter || "",
    from_date: fromDate || "",
    to_date: toDate || "",
  });
}, [page, selectedWaiter, fromDate, toDate]);

 const ORDER_GROUPS = [
  { key: "all", label: "Show All Orders" },
  { key: "dine_in", label: "Dine-In Orders" },
  { key: "delivery", label: "Delivery Orders" },
  { key: "pickup", label: "Pickup Orders" },
  { key: "kot", label: "KOT Orders" },
  { key: "billed", label: "Billed Orders" },
  { key: "draft", label: "Draft Orders" },
] as const;
const moveDrawerToNextStep = async () => {
  if (!billedOrderData) return;

  console.log("Move status");

  // example logic
  const statuses = orderStatusUI.map((s) => s.key);
  const currentIndex = statuses.indexOf(billedOrderData.order_status);

  if (currentIndex === -1 || currentIndex === statuses.length - 1) return;

  const nextStatus = statuses[currentIndex + 1];

  setBilledOrderData((prev: any) => ({
    ...prev,
    order_status: nextStatus,
  }));
};
const handleDeleteDrawerItem = (item: any) => {
  setBilledOrderData((prev: any) => ({
    ...prev,
    kot: prev.kot.map((k: any) => ({
      ...k,
     items: (k.items || []).filter((i: any) => i.id !== item.id),
    })),
  }));
};
const orderCounts = React.useMemo(() => {
  const counts = {
    all: allOrders.length,
    dine_in: 0,
    delivery: 0,
    pickup: 0,
    kot: 0,
    billed: 0,
    draft: 0,
  };

  allOrders.forEach((order: any) => {
    if (order.mode === "draft") {
      counts.draft++;
      return;
    }

    const type = normalizeOrderType(order.order_type?.order_type_name);

    if (type === "dine_in") counts.dine_in++;
    if (type === "delivery") counts.delivery++;
    if (type === "pickup") counts.pickup++;

    if (order.kot_count > 0) counts.kot++;
    if (order.status === "paid") counts.billed++;
  });

  return counts;
}, [allOrders]);


const filteredOrders = allOrders.filter((order: any) => {
const matchWaiter =
  !selectedWaiter || order.waiter?.id === selectedWaiter;

  let matchGroup = true;

  switch (selectedOrderGroup) {
    case "draft":
  matchGroup =
    order.mode === "draft" ||
    order.mode === "offline";
  break;

    case "dine_in":
    case "delivery":
    case "pickup":
      matchGroup =
        normalizeOrderType(order.order_type?.order_type_name) ===
        selectedOrderGroup;
      break;

    case "kot":
      matchGroup = order.kot_count > 0;
      break;

   case "billed":
  matchGroup =
    order.status === "billed" ||
    order.status === "paid";
  break;

    case "all":
    default:
      matchGroup = true;
  }

  return matchGroup && matchWaiter;
});

const drawerNextStatus = React.useMemo(() => {
  if (!billedOrderData?.order_status) return null;

  const statuses = orderStatusUI.map((s) => s.key);
  const index = statuses.indexOf(billedOrderData.order_status);

  if (index === -1 || index === statuses.length - 1) return null;

  return statuses[index + 1];
}, [billedOrderData]);
const getStatusMeta = (order: any) => {
  const status = (order.order_status || "").toLowerCase();

  const map: Record<string, { label: string; color: string }> = {
    placed: { label: "PLACED", color: "#F59E0B" },        // amber
    confirmed: { label: "CONFIRMED", color: "#2563EB" },  // blue
    preparing: { label: "PREPARING", color: "#8B5CF6" },  // purple
    ready: { label: "READY", color: "#0EA5E9" },          // sky
    delivered: { label: "DELIVERED", color: "#16A34A" },  // green
    cancelled: { label: "CANCELLED", color: "#DC2626" },  // red
  };

  if (order.status === "paid") {
    return { label: "PAID", color: "#16A34A" };
  }

  if (order.status === "billed") {
    return { label: "BILLED", color: "#2563EB" };
  }

  if (order.mode === "draft") {
    return { label: "DRAFT", color: "#F59E0B" };
  }

  return map[status] || { label: status.toUpperCase(), color: "#6B7280" };
};
const handleOrderClick = (order: any) => {

  if (order.mode === "draft") {
    navigate("/menudashboard", {
      state: { draftOrder: order },
    });
    return;
  }
  console.log("Clicked order:", order);
  console.log("Order KOT:", order?.kot);
  const isBilled =
    order.status === "billed" ||
    order.status === "paid";

  if (isBilled) {
    console.log("Opening BillDrawer with:", order);
    setBilledOrderData(order);
    setBillDrawerOpen(true);
    return;
  }

  navigate("/menudashboard", {
    state: {
      mode: "kot",
      tableId: order.table_id,
      activeOrder: order,
      orderId: order.id,
      orderNumber: order.order_number,
    },
  });
};

const drawerItems = React.useMemo(() => {
  if (!billedOrderData?.kot?.length) return [];

  return billedOrderData.kot.flatMap((k: any) =>
    (k.items || []).map((i: any) => ({
      id: i.id,
      name:
        i.menu_item?.item_name ||
        i.menu_item?.translations?.[0]?.item_name ||
        "Item",
      qty: i.quantity,
      price:
        Number(i.price) ||
        Number(i.amount) ||
        Number(i.menu_item?.price) ||
        0,
    }))
  );
}, [billedOrderData]);
const getItemCountText = (order: any) => {
  if (order.mode === "draft") {
    return `${order.cart?.length ?? 0} Item(s)`;
  }

  const totalItems =
    order.kot?.reduce(
      (sum: number, k: any) => sum + (k.items?.length || 0),
      0
    ) || 0;

  return `${totalItems} Item(s)`;
};


const getItemName = (item: any) =>
  item.menu_item?.item_name ||
  item.menu_item?.translations?.[0]?.item_name ||
  `Item #${item.menu_item_id}`;

const handleNewKot = (e: React.MouseEvent, order: any) => {
  e.stopPropagation();

  navigate("/menudashboard", {
    state: {
      mode: "kot",
      tableId: order.table_id,
      activeOrder: order,
      orderId: order.id,
      orderNumber: order.order_number,
    },
  });
};


  return (
<Box
  sx={{
    display: "flex",
    flexDirection: "column",
    height: "170vh",
  }}
>

<Box
  sx={{
    position: "sticky",
    top: 0,
    zIndex: 10,
    backgroundColor: "#F6F6F6",
    pb: 2,
  }}
>


        <Typography sx={{ fontSize: 20, fontWeight: 600, mb: 2 }}>
          Orders History ({allOrders.length})
        </Typography>
        <div
          className="d-flex align-items-center mb-3"
          style={{ gap: "12px", whiteSpace: "nowrap" }}
        >
          <div className="d-flex align-items-center gap-2">
            <Dropdown  >
              <Dropdown.Toggle
                variant="outline-secondary"
                style={{
                  height: "39px",
                  fontSize: "13px",
                  borderRadius: "6px",
                  padding: "0 16px",
                    minWidth: "200px",
                  maxWidth :'300px',
                  boxShadow: "0px 1px 2px #00000040",
                  borderColor :'#FFFFFF',
                  backgroundColor :'#FFFFFF',
                     color: '#000000'
                }}
              >
                {dateLabel}
              </Dropdown.Toggle>

              <Dropdown.Menu>
                {[
                  "Today",
                  "Yesterday",
                  "This Week",
                  "This Month",
                  "Last 3 Months",
                  "Last 6 Months",
                  "This Year",
                ].map((item) => (
                  <Dropdown.Item
                    key={item}
                   onClick={() => {
  setDateLabel(item);

  const range = getDateRangeFromLabel(item);
  setFromDate(range.from);
  setToDate(range.to);
}}

                  >
                    {item}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
{/* FROM DATE */}
<Box sx={{ position: "relative" }}>
  <Box
    onClick={() => {
      setShowFromCal((v) => !v);
      setShowToCal(false);
    }}
    className="form-control order-date-input"
    sx={{
      minWidth: 160,
      height: "39px",
      display: "flex",
      alignItems: "center",
      gap: 1,
      cursor: "pointer",
      backgroundColor: "#FFFFFF",
    }}
  >
    <img src={calendericon} width={16} />
    <span>
      {fromDate
        ? dayjs(fromDate).format("DD MMM YYYY")
        : "From date"}
    </span>
  </Box>

  {showFromCal && (
    <Box sx={{ position: "absolute", top: 45, zIndex: 2000 }}>
      <Calendar
        onChange={(d) => {
          const val = toYMD(d as Date);
          setFromDate(val);
          setShowFromCal(false);
        }}
        value={fromDate ? new Date(fromDate) : null}
      />
    </Box>
  )}
</Box>

<span style={{ fontSize: "13px", color: "#777" }}>To</span>

{/* TO DATE */}
<Box sx={{ position: "relative" }}>
  <Box
    onClick={() => {
      setShowToCal((v) => !v);
      setShowFromCal(false);
    }}
    className="form-control order-date-input"
    sx={{
      minWidth: 160,
      height: "39px",
      display: "flex",
      alignItems: "center",
      gap: 1,
      cursor: "pointer",
      backgroundColor: "#FFFFFF",
    }}
  >
    <img src={calendericon} width={16} />
    <span>
      {toDate
        ? dayjs(toDate).format("DD MMM YYYY")
        : "To date"}
    </span>
  </Box>

  {showToCal && (
    <Box sx={{ position: "absolute", top: 45, zIndex: 2000 }}>
      <Calendar
        minDate={fromDate ? new Date(fromDate) : undefined}
        onChange={(d) => {
          const val = toYMD(d as Date);
          setToDate(val);
          setShowToCal(false);
        }}
        value={toDate ? new Date(toDate) : null}
      />
    </Box>
  )}
</Box>



          </div>

          <div className="d-flex align-items-center gap-2">
            <Dropdown  >
              <Dropdown.Toggle
                variant="outline-secondary"
                style={{
                  height: "39px",
                  fontSize: "13px",
                  borderRadius: "6px",
                  padding: "0 16px",
                  minWidth: "200px",
                  maxWidth :'300px',
                  boxShadow: "0px 1px 2px #00000040",
                   borderColor :'#FFFFFF',
                    backgroundColor :'#FFFFFF',
                       color: '#000000'
                }}
              >
                {orderLabel}
              </Dropdown.Toggle>

            <Dropdown.Menu style={{ maxHeight: 260, overflowY: "auto" }}>
  {ORDER_GROUPS.map((g) => (
   <Dropdown.Item
  key={g.key}
  onClick={() => {
    setOrderLabel(
      `${g.label} (${orderCounts[g.key as keyof typeof orderCounts]})`
    );
    setSelectedOrderGroup(g.key);
  }}
>
  {g.label}{" "}
  <strong>({orderCounts[g.key as keyof typeof orderCounts]})</strong>
</Dropdown.Item>

  ))}
</Dropdown.Menu>

            </Dropdown>
            <Dropdown>
              <Dropdown.Toggle
                variant="outline-secondary"
                style={{
                  height: "39px",
                  fontSize: "13px",
                  borderRadius: "6px",
                  padding: "0 16px",
                    minWidth: "200px",
                  maxWidth :'300px',
                  boxShadow: "0px 1px 2px #00000040",
                   borderColor :'#FFFFFF',
                    backgroundColor :'#FFFFFF',
                    color: '#000000'
                }}
              >
                {waiterLabel}
              </Dropdown.Toggle>

              <Dropdown.Menu
                style={{
    maxHeight: "260px",   // ✅ limit height
    overflowY: "auto",    // ✅ enable scroll
  }}
              >
               <Dropdown.Item
  onClick={() => {
    setWaiterLabel("Show All Waiters");
    setSelectedWaiter(null);
  }}
>
  Show All Waiters
</Dropdown.Item>


                {waiters.map((w: any) => (
     <Dropdown.Item
  onClick={() => {
    setWaiterLabel(w.name);
    setSelectedWaiter(w.id);
    setPage(1);
  }}
>
  {w.name}
</Dropdown.Item>

                ))}
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>
<Box sx={{ pr: 1  }}>  
       {loading && <Typography>Loading orders...</Typography>}
 <Box
    sx={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))",
      gap: 1,
    }}
  >
  {filteredOrders.map((order , index) => {
    const status = getStatusMeta(order);
    const icon = getOrderTypeIcon(order.order_type?.order_type_name);
const latestKot = [...(order.kot || [])]
  .sort((a,b) =>
    new Date(a.created_at).getTime() -
    new Date(b.created_at).getTime()
  )
  .at(-1);
const kotCount = order.kot_count || order.kot?.length || 0;

    return (
 
      <Box
 onClick={() => handleOrderClick(order)}
          sx={{
            width: 462,
            minHeight: 226, 
            height: 226,
            borderRadius: "10px",
            backgroundColor: "#FFFFFF",
            border: "1px solid #E5E5E5",
            p: "14px 16px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
             cursor: "pointer",
    transition: "0.2s",
    "&:hover": {
      boxShadow: "0px 6px 16px rgba(0,0,0,0.15)",
      transform: "translateY(-2px)",
    },
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
         
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
             

<Box
  sx={{
    width: 40,
    height: 40,
    borderRadius: "10px",
    backgroundColor: icon ? "#F3F3F3" : "#4582F440",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 11,
    fontWeight: 700,
    color: "#000",
  }}
>
  {icon ? (
    <img src={icon} width={22} />
  ) : (
    `#${order.mode === "draft"
  ? getDraftDisplayNumber(order, index)
  : order.order_number}`
  )}
</Box>
              <Box>
              <Typography fontWeight={600} fontSize={14}>
  {order.mode === "offline"
  ? `Offline ${getDraftDisplayNumber(order, index)}`
  : order.mode === "draft"
  ? `Draft ${getDraftDisplayNumber(order, index)}`
  : order.show_formatted_order_number
}
</Typography>

             <Typography fontSize={12} color="#8A8A8A">
{order.mode === "draft"
  ? order.orderType?.type?.replace("_", " ").toUpperCase() || "DRAFT"
  : order.order_type?.order_type_name}
</Typography>

              </Box>
            </Box>
           <Box sx={{ display: "flex", flexDirection: "column", gap: "6px" }}>

{order.status === "paid" && (
  <Box
    sx={{
      fontSize: 11,
      fontWeight: 700,
      px: 1,
      py: "2px",
      borderRadius: "4px",
      backgroundColor: "#E6F6EC",
      color: "#27AE60",
      textAlign: "center",
    }}
  >
    PAID
  </Box>
)}

{/* BILLED */}
{order.status === "billed" && (
  <Box
    sx={{
      fontSize: 11,
      fontWeight: 700,
      px: 1,
      py: "2px",
      borderRadius: "4px",
      backgroundColor: "#E8F1FF",
      color: "#2F80ED",
      textAlign: "center",
    }}
  >
    BILLED
  </Box>
)}

{/* KOT */}
{order.status !== "paid" &&
  order.status !== "billed" &&
  kotCount > 0 && (
    <Box
      sx={{
        fontSize: 11,
        fontWeight: 700,
        px: 1,
        py: "2px",
        borderRadius: "4px",
        backgroundColor: "#FFF4D6",
        color: "#C2A429",
        textAlign: "center",
      }}
    >
      KOT × {kotCount}
    </Box>
)}

{/* POS / placed via */}
<Box
  sx={{
    fontSize: 11,
    fontWeight: 600,
    px: 1,
    py: "2px",
    borderRadius: "4px",
    backgroundColor: "#E8F1FF",
    color: "#1E6BD6",
    textAlign: "center",
  }}
>
  {order.placed_via?.toUpperCase()}
</Box>

</Box>
          </Box>

          {/* DATE + ITEM COUNT */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 12,
              color: "#7A7A7A",
            }}
          >
            <Typography>
             Order Date: {dayjs(
  order.mode === "draft"
    ? order.createdAt
    : order.created_at
).format("DD MMM, hh:mm A")}
            </Typography>
            <Typography>{getItemCountText(order)}</Typography>
          </Box>

          <Divider />
          <Box>
{order.mode === "draft" || order.mode === "offline"
  ? order.cart?.slice(0, 2).map((item: any, idx: number) => (
      <Typography fontSize={13} key={idx}>
        {item.name} × {item.qty}
      </Typography>
    ))
  : latestKot?.items?.slice(0, 2).map((item: any) => (
      <Typography fontSize={13} key={item.id}>
        {getItemName(item)} × {item.quantity}
      </Typography>
    ))}


          </Box>

          <Divider />

          {/* FOOTER */}
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Box>
              <Typography fontWeight={700} fontSize={16}>
             ₹{order.mode === "draft"
  ? getDraftTotal(order)
  : order.total}


              </Typography>

             <Box
  sx={{
    display: "flex",
    alignItems: "center",
    gap: 1,
    mt: 0.5,
  }}
>
  <Box
    sx={{
      width: 8,
      height: 8,
      borderRadius: "50%",
      backgroundColor: status.color,
    }}
  />

  <Typography
    sx={{
      fontSize: 12,
      fontWeight: 600,
      letterSpacing: 0.3,
      textTransform: "uppercase",
      color: status.color,
    }}
  >
    {status.label}
  </Typography>
</Box>

              <Typography fontSize={12} color="#555">
                {order.waiter?.name
                  ? `Waiter: ${order.waiter.name}`
                  : "—"}
              </Typography>
            </Box>

            <Button
              size="sm"
              style={{
                backgroundColor: "#FFFFFF",
                color: "#000",
                borderRadius: "6px",
                border: "1px solid #E0E0E0",
                padding: "4px 12px",
                fontWeight: 600,
                height: 32,
              }}
               onClick={(e) => handleNewKot(e, order)}
            >
              New KOT
            </Button>
          </Box>
        </Box>
   
    );
  })}
</Box>
<BillDrawer
  billDrawerOpen={billDrawerOpen}
  setBillDrawerOpen={setBillDrawerOpen}
  setBilledOrderData={setBilledOrderData}

  billedOrderData={billedOrderData}
  drawerItems={drawerItems}
  drawerCustomer={billedOrderData?.customer}

  orderStatusUI={orderStatusUI}
  drawerNextStatus={drawerNextStatus}

  moveDrawerToNextStep={moveDrawerToNextStep}
  handleDrawerPrint={() => window.print()}
  handleDeleteDrawerItem={handleDeleteDrawerItem}

  PAYMENT_OPTIONS={PAYMENT_OPTIONS}
  token={token}

  setCustomerModalOpen={() => {}}

  setCheckoutOpen={setCheckoutOpen}
  setCheckoutOrder={setCheckoutOrder}

  showError={(msg) => alert(msg)}
  saveNewOrder={async () => {}}
/>
<CheckoutModal
  open={checkoutOpen}
  onClose={() => setCheckoutOpen(false)}
  orderNumber={checkoutOrder?.order_number}
  totalAmount={Number(checkoutOrder?.total || 0)}
  cart={
    checkoutOrder?.kot?.flatMap((k: any) => k.items) || []
  }
  orderId={checkoutOrder?.id}
  onPaymentSuccess={(paymentData: { received_amount: any; payment_method: any; }) => {
    const paidAmount =
      Number(paymentData?.received_amount) ||
      Number(checkoutOrder?.total);

    const updatedOrder = {
      ...checkoutOrder,
      status: "paid",
      payment_status: "paid",
      amount_paid: paidAmount,
      payments: [
        {
          id: Date.now(),
          payment_method: paymentData?.payment_method || "cash",
          amount: paidAmount,
        },
      ],
    };

    setCheckoutOpen(false);
    setBilledOrderData(updatedOrder);
  }}
/>
<Box
  sx={{
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 2,
    mt: 4,
    pr: 2
  }}
>
  <Button
    disabled={page === 1}
    onClick={() => setPage((p) => p - 1)}
  >
    Previous
  </Button>

  <Typography sx={{ pt: 1 }}>
    Page {page}
  </Typography>

  <Button
    disabled={page * perPage >= ordersTotal}
    onClick={() => setPage((p) => p + 1)}
  >
    Next
  </Button>
</Box>
</Box>
     

      </Box>
    </Box>
  );
} 
