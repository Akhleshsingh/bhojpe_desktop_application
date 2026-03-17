import { BASE_URL } from "../utils/api";
import React, { act, useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Typography,
  Divider,
  IconButton,
  Button,
  Drawer,
  FormControl,
  Select,
  MenuItem,
  Popover,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "../assets/icons/plus.png"
import RemoveIcon from "../assets/icons/minus.png";
import ShoppingCartCheckoutIcon from "@mui/icons-material/ShoppingCartCheckout";
import orderpannelicon from "../assets/Group 194.png";
import { useTheme } from "@mui/material/styles";
import CheckoutModal from "./CheckoutModal";
import { useLocation, useNavigate } from "react-router-dom";
import person from "../assets/image 278 (1).png";
import ordernumber from "../assets/ordernumber.png";
import waiter from "../assets/icons/Select waiter.png";
import customer from "../assets/image 312.png";
import note from "../assets/icons/Note.png";
import assigntable from "../assets/image 314 (1).png";
import Deleteicon from "../assets/deleteicon.png";
import messageicon from "../assets/icons/It will come after you write the note..png";
import AddCustomerModal from "./AddCustomerModal";
import printerimage from '../assets/image 323.png';
import ebill from '../assets/icons/E-Bill.png';
import ruppeeicon from '../assets/icons/rupee_ item_price.png';
import Discounticon from '../assets/discounticon.png';
import { useNetwork } from "../context/NetworkContext";
import { saveOrderApi } from "../utils/orderApi";
import { useAuth } from "../context/AuthContext";
import OrderTypeSwitcher from "../CommonPages/OrderTypeSwitcher";
import { useKot } from "../context/KotContext";
import ordericon from "../assets//image 328 (1).png";
import ordericon2 from "../assets/image 329 (1).png";
import ordericon3 from "../assets/image 330 (2).png";
import ordericon4 from '../assets/image 331 (1).png';
import ordericon5 from '../assets/image 332 (1).png';
import SettingsIcon from "@mui/icons-material/Settings";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import hold from "../assets/icons/Hold.png";
import kot from "../assets/icons/KOT.png";
import draft from "../assets/icons/Save as draft.png";
import kotprint from "../assets/icons/KOT & Print.png";
import mergeicon from "../assets/icons/Merge table.png";
import noteicon from "../assets/notesicon.png";
import { useOrders } from "../context/OrdersContext";
import { useCustomers } from "../context/CustomerContext";
import AddWaiterModal from "../components/AddWaiterModal";
import AssignTableModal from "../components/AssignTableModal";
import dayjs from "dayjs";
import { fetchOrderStatuses, type OrderStatusResponse } from "./orderStatusapi";
import calendericon from "../assets/calendar.png";
 import clockicon from "../assets/calendar.png";
import DatePicker from "react-datepicker";
import Swal from "sweetalert2";
import { useTables } from "../context/TablesContext";
import { useDeliveryExecutives } 
  from "../context/DeliveryExecutive";
  import { toast } from "react-hot-toast";
import delivery from "../assets/icons/Select Delivery Executive.png";
import BillDrawer from "./BillDrawer";

const SummaryRow: React.FC<{ label: string; value: React.ReactNode }> = ({
  label,
  value,
}) => {
  return (
    <Box display="flex" justifyContent="space-between" mt={1}>
      <Typography fontWeight={600}>{label}</Typography>
      <Typography fontWeight={700}>{value}</Typography>
    </Box>
  );
};
const showError = (
  message: string,
  title: string = "Oops!"
) => {
  Swal.fire({
    icon: "error",
    title,
    text: message,
    confirmButtonText: "OK",
    confirmButtonColor: "#5A7863", // dark green
    background: "#F6F0D7",
    color: "#2F3E2E",
  });
};

type CartItem = {
  id: number;
  qty: number;
  name: string;
  price: number;
  note?: string;
};

type Props = {
  cart: CartItem[];
  onIncrease: (id: number) => void;
  onDecrease: (id: number) => void;
  onRemove: (id: number) => void;
  onClearCart: () => void;
  subtotal: number;
  emptyIllustrationPath?: string;
  onUpdateNote: (id: number, note: string) => void;
  onSaveOrder: any;
  mode:  "bill" | "view" | "kot" | "new" | "draft"| "checkout";
  orderId?: number;
  tableId?: number;
  activeOrder?: any;
  tableNo?: any;
  areaName?: any;
  onKotTrigger?: (cb: () => void) => void;
  cartSnapshotRef?: React.MutableRefObject<any[]>;
  orderType?: any;
  setOrderType?: (t: any) => void;
};
type PaymentMode = "cash" | "upi" | "gpay" | "other" | "due" | "checkout" | "";
type OrderAction =
  | "kot"
  | "bill"
  | "bill_print"
  | "kot_print"
  | "kot_bill_payment"
  | "bill_payment"
  | "checkout"
  | "e-bill";
type NoteTarget =
  | { type: "order" }
  | { type: "item"; itemId: number };
const PAYMENT_OPTIONS = [
  { value: "cash", label: "Cash" },
  { value: "upi", label: "UPI" },
  { value: "razorpay", label: "Razorpay" },
  { value: "account_transfer", label: "Account Transfer" },
];

const DEFAULT_ORDER_STATUSES: OrderStatusResponse[] = [
  { key: "placed", label: "Placed" },
  { key: "confirmed", label: "Confirmed" },
  { key: "preparing", label: "Preparing" },
  { key: "out_for_delivery", label: "Out for delivery" },
  { key: "delivered", label: "Delivered" },
];

export default function OrderPanel({
  onIncrease,
  onDecrease,
  subtotal,
  emptyIllustrationPath,
  onUpdateNote,
  onSaveOrder,
  onRemove,
  mode,
  orderType,
  setOrderType,
  tableId,
  activeOrder,
  onClearCart, tableNo,
  areaName,  onKotTrigger,
  cart
}: Props) {
  const theme = useTheme();
  const { isOnline } = useNetwork();
  const [checkoutOpen, setCheckoutOpen] = React.useState(false);
  const [discountOpen, setDiscountOpen] = useState(false);
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [billDrawerOpen, setBillDrawerOpen] = useState(false);
const [billedOrderData, setBilledOrderData] = useState<any>(null);
const location = useLocation();
const openBillDrawer = location.state?.openBillDrawer;
const computedSubtotal = React.useMemo(() => {
  if (activeOrder) {
    return Number(activeOrder.sub_total || 0);
  }
  return subtotal;
}, [activeOrder, subtotal]);
useEffect(() => {
  if (openBillDrawer && activeOrder) {
    setBilledOrderData(activeOrder);
    setBillDrawerOpen(true);
  }
}, [openBillDrawer, activeOrder]);
const hasKot =
  billedOrderData?.order_status === "preparing" ||
  billedOrderData?.order_status === "confirmed" ||
  billedOrderData?.order_status === "food_ready" ||
  billedOrderData?.order_status === "served";
const { deliveryExecutives} = useDeliveryExecutives();

  const [paymentMode, setPaymentMode] = useState<PaymentMode>("");
  const { fetchOrders } = useOrders();
  const [pickupDate, setPickupDate] = useState<string>(
    dayjs().format("YYYY-MM-DD")
  );
  const [pickupDateTime, setPickupDateTime] = useState<Date>(
    new Date()
  );
  const [pickupModalOpen, setPickupModalOpen] = useState(false);
  const [showPickupDate, setShowPickupDate] = useState(false);
const [showPickupTime, setShowPickupTime] = useState(false);
  const [orderNote, setOrderNote] = useState<string>("");
  const navigate = useNavigate();
  const [noteModalOpen, setNoteModalOpen] = React.useState(false);
  const [currentItemId, setCurrentItemId] = React.useState<number | null>(null);
  const [noteText, setNoteText] = React.useState("");
  const [customerModalOpen, setCustomerModalOpen] = React.useState(false);
  const [customerInfo, setCustomerInfo] = useState<any>(null);
  const [orderSaved, setOrderSaved] = React.useState(false);
  const [showDiscountDetails, setShowDiscountDetails] = useState(false);
  const { orders } = useOrders();
   const { tables , fetchTables} = useTables();
const tempOrderNumberRef = React.useRef<number | null>(null);
const kotActionRef = useRef<null | ((type?: "kot" | "kot_print") => void)>(null);
const cartSnapshotRef = useRef<any[]>([]);
const draftOrder = location.state?.draftOrder;
if (!tempOrderNumberRef.current) {
  const lastOrderNumber =
    orders.length > 0
      ? Math.max(...orders.map((o: any) => Number(o.order_number || 0)))
      : 100;

  tempOrderNumberRef.current = lastOrderNumber + 1;
}
  const { branchData , token } = useAuth();
const [creatingKot, setCreatingKot] = useState(false);
const effectiveCart = cart;
const hasCartItems = React.useMemo(
  () => effectiveCart?.length > 0,
  [effectiveCart]
);
const allKotItems = React.useMemo(() => {
  if (!activeOrder?.kot?.length) return [];
  return activeOrder.kot.flatMap((k: any) => k.items);
}, [activeOrder]);
const hasExistingKotItems = React.useMemo(
  () => allKotItems?.length > 0,
  [allKotItems]
);

const effectiveItems = React.useMemo(() => {
  if (!activeOrder?.kot?.length) return [];

  return activeOrder.kot.flatMap((k: any) => k.items);
}, [activeOrder]);
const [isEditMode, setIsEditMode] = useState(false);
  const [waiterModalOpen, setWaiterModalOpen] = useState(false);
  const [waiterAnchorEl, setWaiterAnchorEl] = useState<HTMLElement | null>(null);
  const [tableModalOpen, setTableModalOpen] = useState(false);
  const [selectedWaiter, setSelectedWaiter] = useState<any>(null);
const [selectedDeliveryExecutive, setSelectedDeliveryExecutive] =
  useState<any>(null);
const [checkoutOrder, setCheckoutOrder] = useState<any>(null);
const [deliveryExecAnchorEl, setDeliveryExecAnchorEl] =
  useState<HTMLElement | null>(null);
const [deliveryExecQuery, setDeliveryExecQuery] = useState("");
const [pendingDeliveryExec, setPendingDeliveryExec] = useState<any>(null);
  const [noteTarget, setNoteTarget] = useState<NoteTarget | null>(null);
  const [orderStatuses, setOrderStatuses] = useState<OrderStatusResponse[]>([]);
 const [discountType, setDiscountType] =
  useState<"fixed" | "percent">("fixed");
  const { customers } = useCustomers();
  const { createKotWithOrder, loading } = useKot();

  const [pax, setPax] = useState<number>(1);
  const gstPercent = React.useMemo(() => {
  return (
    branchData?.data?.restaurant?.taxes?.[0]?.tax_percent ?? 0
  );
}, [branchData]);
  const [selectedTable, setSelectedTable] = useState<{
    tableId: number;
    tableNo: string;
    areaName?: string;
  } | null>(null);
useEffect(() => {
  if (!onKotTrigger) return;

  kotActionRef.current = (type?: "kot" | "kot_print") => {
    if (type === "kot_print") {
      handleSaveOrderDetail("kot_print");
    } else {
      handleSaveOrderDetail("kot");
    }
  };

}, [
  cart,
  orderType,
  activeOrder,
  customerInfo,
  selectedWaiter,
  selectedTable,
  pax,
]);
const computedTax = React.useMemo(() => {
  if (activeOrder) {
    return Number(activeOrder.total_tax_amount || 0);
  }

  return Math.round((computedSubtotal * gstPercent) / 100);
}, [activeOrder, computedSubtotal, gstPercent]);

  const finalTotal = React.useMemo(() => {
    if (activeOrder) {
      return Number(activeOrder.total || 0);
    }
    return computedSubtotal + computedTax;
  }, [activeOrder, computedSubtotal, computedTax]);
const resetOrderState = () => {
  setCustomerInfo(null);
  setSelectedWaiter(null);
  setSelectedTable(null);

  setPickupDate(dayjs().format("YYYY-MM-DD"));
  setPickupDateTime(new Date());

  setPax(1);
  setOrderNote("");
  setPaymentMode("");
  setDiscountValue(0);

  setCustomerModalOpen(false);
  setWaiterModalOpen(false);
  setTableModalOpen(false);
  setPickupModalOpen(false);
  setNoteModalOpen(false);
};

useEffect(() => {
  if (!activeOrder?.id) return;
  if (!orders?.length) return;

  const updated = orders.find(
    (o: any) => o.id === activeOrder.id
  );

  if (!updated) return;
  if (updated.order_status !== activeOrder.order_status) {

    navigate(location.pathname, {
      replace: true,
      state: {
        ...location.state,
        activeOrder: updated,
      },
    });
  }
}, [orders]);
const currentStatusKey = activeOrder?.order_status;

const nextStatus = React.useMemo(() => {
  if (!currentStatusKey) return null;
  if (!orderStatuses?.length) return null;
  if (currentStatusKey === "cancelled") return null;

  const keys = orderStatuses.map((s) => s.key);


  const currentIndex = keys.indexOf(currentStatusKey);

  if (currentIndex === -1) {
    return null;
  }

  if (currentIndex === keys.length - 1) {
    return null;
  }

  const next = keys[currentIndex + 1];


  return next;
}, [currentStatusKey, orderStatuses]);
const FINAL_STATUSES = [
  "cancelled",
  "delivered",
  "served",
];

const isLastStatus = React.useMemo(() => {
  if (!currentStatusKey) return false;

  if (FINAL_STATUSES.includes(currentStatusKey)) {
    return true;
  }

  if (!orderStatuses?.length) return false;

  const keys = orderStatuses.map((s) => s.key);
  const currentIndex = keys.indexOf(currentStatusKey);

  return currentIndex === keys.length - 1;
}, [currentStatusKey, orderStatuses]);

const showMoveNextButton =
  (mode === "view" || mode === "kot") &&
  !!activeOrder &&
  !!nextStatus &&
  orderStatuses.length > 0 &&
  !isLastStatus;
const drawerCurrentStatus = billedOrderData?.order_status;

const drawerNextStatus = React.useMemo(() => {
  if (!drawerCurrentStatus || !orderStatuses?.length) return null;

  const keys = orderStatuses.map((s) => s.key);
  const index = keys.indexOf(drawerCurrentStatus);

  if (index === -1 || index === keys.length - 1) return null;

  return keys[index + 1];
}, [drawerCurrentStatus, orderStatuses]);

const moveToNextStep = async () => {
  if (!token) return;
  if (!activeOrder?.id) return;
  if (!nextStatus) return;
  if (isLastStatus) {
toast("Order is already at final status.");
    return;
  }

  try {
    const res = await fetch(
      `${BASE_URL}/updateorderStatus`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          order_id: activeOrder.id,
          order_type: orderType?.type,
          order_status: nextStatus,
        }),
      }
    );

    const data = await res.json();


    if (!data.status) {
      showError("Failed to update status");
      return;
    }

    if (data.data?.new_status) {
      navigate(location.pathname, {
        replace: true,
        state: {
          ...location.state,
          activeOrder: {
            ...activeOrder,
            order_status: data.data.new_status,
          },
        },
      });

    toast.success(
  `Order moved to ${data.data.new_status.replace(/_/g, " ").toUpperCase()}`
);
    }

    await fetchOrders({ page: 1, per_page: 20 });

  } catch (e) {
    showError("Status update failed");
  }
};
const moveDrawerToNextStep = async () => {
  if (!token) return;
  if (!billedOrderData?.id) return;
  if (!drawerNextStatus) return;

  try {
    const res = await fetch(
      `${BASE_URL}/updateorderStatus`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          order_id: billedOrderData.id,
          order_type: billedOrderData?.order_type?.slug,
          order_status: drawerNextStatus,
        }),
      }
    );

    const data = await res.json();

    if (!data.status) {
      showError("Failed to update status");
      return;
    }
    setBilledOrderData((prev: any) => ({
      ...prev,
      order_status: data.data?.new_status,
    }));

    Swal.fire({
      icon: "success",
      title: "Order Updated",
      text: `Moved to ${data.data?.new_status
        ?.replace(/_/g, " ")
        .toUpperCase()}`,
      confirmButtonColor: "#00000080",
    });

    await fetchOrders({ page: 1, per_page: 20 });

  } catch (err) {
    showError("Status update failed");
  }
};
  const saveNote = () => {
    if (!noteTarget) return;

    if (noteTarget.type === "order") {
      setOrderNote(noteText);
    }

    if (noteTarget.type === "item") {
      onUpdateNote(noteTarget.itemId, noteText);
    }

    setNoteModalOpen(false);
    setNoteTarget(null);
  };
const saveOrderOffline = (draftOrder: any) => {
  const existing =
    JSON.parse(localStorage.getItem("offlineOrders") || "[]");

  const subtotal =
    draftOrder.cart?.reduce(
      (s: number, i: any) => s + i.price * i.qty,
      0
    ) || 0;

  const normalizedOrder = {
    ...draftOrder,

    mode: "offline",              // ⭐ IMPORTANT
    createdAt: new Date().toISOString(),

    subtotal,
    total: subtotal,

    kot: [],
    kot_count: 0,

    order_type: {
      order_type_name:
        draftOrder.orderType?.type || "offline",
    },
  };

  existing.push(normalizedOrder);

  localStorage.setItem(
    "offlineOrders",
    JSON.stringify(existing)
  );
};
const handleDeleteDrawerItem = (item: any) => {
  if (!billedOrderData?.id) return;
  setBilledOrderData((prev: any) => ({
    ...prev,
    kot: prev.kot.map((k: any) => ({
      ...k,
      items: k.items.filter((i: any) => i.id !== item.id),
    })),
  }));
};

const footerChipBtn = {
  bgcolor: "#FFFFFF",
  color: "#000",
  textTransform: "none",
  fontWeight: 500,
  px: 1.5,
  height: 42,
};

  const buildOrderItems = (cart: any[]) => {
    return cart.map((item) => ({
      menu_item_id: item.id,
      kitchen_place_id: 4,            // 🔥 make dynamic later
      menu_item_variation_id: null,
      quantity: item.qty,
      price: item.price,
    tax_percentage: gstPercent,
tax_amount: +(
  (item.price * item.qty * gstPercent) /
  100
).toFixed(2),
      modifiers: [],
      note: item.note || "", 
    }));
  };
  const orderTypes =
    branchData?.data?.order_types?.filter(
      (o: any) => o.is_active === 1
    ) ?? [];
useEffect(() => {
  if (activeOrder?.order_type) {
    setOrderType?.({
      id: activeOrder.order_type.id,
       type: activeOrder.order_type.slug,
    });
    return;
  }
  if (!orderType && orderTypes.length > 0) {
    const def =
      orderTypes.find((o: any) => o.is_default === 1) || orderTypes[0];

    setOrderType?.({
      id: def.id,
      type: def.type,
    });
  }
}, [
  activeOrder?.order_type?.id,
  orderTypes.length,
]);

const displayOrderNumber = React.useMemo(() => {
  if (activeOrder?.order_number) {
    return activeOrder.order_number;
  }
  return tempOrderNumberRef.current;
}, [activeOrder]);

const handleSaveOrderDetail = async (action: OrderAction) => {
  if (mode === "view") {
    showError("Cannot modify order in view mode");
    return;
  }

  const hasCartItems = effectiveCart?.length > 0;
  const hasExistingKotItems = allKotItems?.length > 0;

  if (!hasCartItems && !hasExistingKotItems) {
    toast.error("Please add at least one item before proceeding.");
    return;
  }

  const token = localStorage.getItem("token");
  if (!token) {
    showError("Authentication required");
    return;
  }

  const isNewOrder = !activeOrder?.order_number;
  switch (action) {
   case "kot": {
  let response;

  if (isNewOrder) {
    response = await saveNewOrder(token, "kot");
  } else {
    await createKotForExistingOrder(token);
    const refreshed = await fetchOrders({ page: 1, per_page: 10 });
    response = refreshed?.find((o: any) => o.id === activeOrder.id);
  }

  const refreshed = await fetchOrders({ page: 1, per_page: 10 });

  const updatedOrder =
    refreshed?.find((o: any) => o.id === response?.order?.id) ||
    response?.order ||
    response;
  setBilledOrderData(updatedOrder);
  setBillDrawerOpen(true);

  return;
}
    case "kot_print": {
  let orderResponse;

  if (isNewOrder) {
    orderResponse = await saveNewOrder(token, "kot");
  } else {
    await createKotForExistingOrder(token);

    const refreshed = await fetchOrders({ page: 1, per_page: 10 });
    orderResponse = refreshed?.find(
      (o: any) => o.id === activeOrder.id
    );
  }

  if (!orderResponse?.order && !orderResponse) return;

  const orderToPrint = orderResponse.order || orderResponse;

  const printWindow = window.open(
    "/#/print",
    "_blank",
    "width=400,height=600"
  );

  if (printWindow) {
    const payload = {
      type: "PRINT_ORDER",
      payload: {
        order: orderToPrint,
        items: cart,
        branch: branchData?.data,
      },
    };

    setTimeout(() => {
      printWindow.postMessage(payload, "*");
    }, 500);
  }

  const refreshed = await fetchOrders({ page: 1, per_page: 10 });

  const updatedOrder =
    refreshed?.find((o: any) => o.id === orderToPrint?.id) ||
    orderToPrint;

  setBilledOrderData(updatedOrder);
  setBillDrawerOpen(true);

  return;
}
    case "bill": {
      let response;

    if (isNewOrder) {
  response = await saveNewOrder(token, "bill");
} else {

  if (effectiveCart?.length > 0) {
    await saveNewOrder(token ,"bill" );
  }

  const refreshed = await fetchOrders({ page: 1, per_page: 10 });

  response = refreshed?.find((o: any) => o.id === activeOrder.id) || activeOrder;
}

      const refreshed = await fetchOrders({ page: 1, per_page: 10 });

      const updatedOrder =
        refreshed?.find((o: any) => o.id === response?.order?.id) ||
        response?.order ||
        response;

      setBilledOrderData(updatedOrder);
      setBillDrawerOpen(true);

      return;
    }
    case "bill_print": {
      let response;

      if (isNewOrder) {
        response = await saveNewOrder(token, "bill");
      } else {
        response = activeOrder;
      }

      const orderToPrint = response?.order || response;

      const printWindow = window.open(
        "/#/print",
        "_blank",
        "width=400,height=600"
      );

      if (printWindow) {
        const payload = {
          type: "PRINT_ORDER",
          payload: {
            order: orderToPrint,
            items: cart,
            branch: branchData?.data,
          },
        };

        setTimeout(() => {
          printWindow.postMessage(payload, "*");
        }, 500);
      }

   const refreshed = await fetchOrders({ page: 1, per_page: 10 });

  const updatedOrder =
    refreshed?.find((o: any) => o.id === orderToPrint?.id) ||
    orderToPrint;

  setBilledOrderData(updatedOrder);
  setBillDrawerOpen(true);

  return;
    }
    case "e-bill": {
      if (!customerInfo) {
        toast.error("Customer details required for E-Bill");
        return;
      }

      if (isNewOrder) {
        await saveNewOrder(token, "bill");
      }

      return;
    }

    default:
      showError("Invalid action");
      return;
  }
};
useEffect(() => {
  if (!onKotTrigger) return;

  onKotTrigger((type?: "kot" | "kot_print") => {
    if (type === "kot_print") {
      handleSaveOrderDetail("kot_print");
    } else {
      handleSaveOrderDetail("kot");
    }
  });
}, [
  cart,
  orderType,
  activeOrder,
  customerInfo,
  selectedWaiter,
  selectedTable,
  pax,
]);
const derivedKotGroups = useMemo(() => {
  if (!activeOrder?.kot?.length) return [];

  return activeOrder.kot.map((k: any) => ({
    kotId: k.id,
    kotNumber: k.kot_number,
    items: k.items,
  }));
}, [activeOrder]);

const resolvedTableLabel = React.useMemo(() => {
  if (activeOrder?.table) {
    return {
      tableNo: activeOrder.table.table_code,
      areaName: activeOrder.table.area_name ?? "",
    };
  }
  if (selectedTable) {
    return {
      tableNo: selectedTable.tableNo,
      areaName: selectedTable.areaName ?? "",
    };
  }
  if (tableNo) {
    return { tableNo, areaName };
  }

  return null;
}, [activeOrder, selectedTable, tableNo, areaName]);
const fromTable =
  location.state?.fromTable || false;
const drawerItems = React.useMemo(() => {
  if (!billedOrderData?.kot?.length) return [];

  return billedOrderData.kot.flatMap((kot: any) =>
    (kot.items || []).map((item: any) => {
      const price =
        Number(item.price) ||
        Number(item.amount) ||
        Number(item.menu_item?.price) ||
        0;

      const qty = Number(item.quantity) || 0;

      const name =
        item.menu_item?.item_name ||
        item.menu_item?.translations?.[0]?.item_name ||
        item.name ||
        `Item #${item.menu_item_id ?? ""}`;

      return {
        id: item.id,
        name,
        qty,
        price,
        total: price * qty,
      };
    })
  );
}, [billedOrderData]);
const drawerCustomer = React.useMemo(() => {
  if (customerInfo?.name) return customerInfo;
  if (billedOrderData?.customer?.name)
    return billedOrderData.customer;
  return null;
}, [customerInfo, billedOrderData]);

const handleKotBillPaymentFlow = async () => {
  if (!token) return;

  const hasCartItems = effectiveCart?.length > 0;
  const hasExistingKotItems = allKotItems?.length > 0;

  if (!hasCartItems && !hasExistingKotItems) {
    Swal.fire({
      icon: "warning",
      title: "No items in order",
      text: "Please add at least one item before proceeding.",
    });
    return;
  }

  try {
    let orderData = activeOrder;

    // ✅ If new order → create it with KOT
    if (!activeOrder?.order_number) {
      const response = await saveNewOrder(token, "kot");
      if (!response?.order) return;
      orderData = response.order;
    } 
    // ✅ If existing order → create new KOT
    else {
      await createKotForExistingOrder(token);
    }

    // ✅ Fetch latest updated order from server
    const refreshedOrders = await fetchOrders({
      page: 1,
      per_page: 20,
    });

    const updatedOrder = refreshedOrders?.find(
      (o: any) => o.id === orderData.id
    );

    const finalOrder = updatedOrder || orderData;


    // 🔥 Save this as checkout order
    setCheckoutOrder(finalOrder);

    // 🔥 Open checkout
    setCheckoutOpen(true);

  } catch (err) {
    showError("Something went wrong");
  }
};
const handleDrawerPrint = () => {
  if (!billedOrderData) return;

  const printWindow = window.open(
    "/#/print-receipt",
    "_blank",
    "width=400,height=600"
  );

  if (!printWindow) return;

  const mappedItems = drawerItems.map((item: any) => ({
    name: item.name,
    qty: item.qty,
    price: item.price,
  }));

  const payload = {
    type: "print-receipt",
    payload: {
      order: billedOrderData,
      items: mappedItems,
      branch: branchData?.data,
    },
  };


  const timer = setInterval(() => {
    if (printWindow.closed) {
      clearInterval(timer);
      return;
    }

    printWindow.postMessage(payload, "*");
    clearInterval(timer);
  }, 700); // give little more time
};
const handleSaveDraft = () => {
  if (cart.length === 0) return;

  const existingDrafts =
    JSON.parse(localStorage.getItem("pos_draft_orders") || "[]");

  const draftPayload = {
    _draftId: Date.now(),
    mode: "draft",
    cart,
    orderType,
    tableId,
    tableNo,
    areaName,

    pax: 1,
    paymentMode: "",
    orderNote: "",
    customerInfo: null,
    selectedWaiter: null,

    createdAt: new Date().toISOString(),
  };

  localStorage.setItem(
    "pos_draft_orders",
    JSON.stringify([draftPayload, ...existingDrafts])
  );
onClearCart?.();
cartSnapshotRef.current = [];
resetOrderState?.();

alert("Draft saved successfully");
};

  const saveNewOrder = async (token: string, action: OrderAction) => {
const resolvedTableId =
  activeOrder?.table_id ??
  billedOrderData?.table_id ??
  selectedTable?.tableId ??
  tableId ??
  null;

let itemsForPayload: any[] = [];
if (effectiveCart?.length > 0) {

  itemsForPayload = buildOrderItems(effectiveCart);
}
else if (activeOrder?.kot?.length > 0) {

  itemsForPayload = activeOrder.kot.flatMap((k: any) =>
    (k.items || []).map((i: any) => ({
      menu_item_id: i.menu_item?.id,
      quantity: i.quantity,
      price:
        Number(i.price) ||
        Number(i.amount) ||
        Number(i.menu_item?.price) ||
        0,
      note: i.note || "",
      modifiers: [],
    }))
  );
}


const payload = {
  action,
secondaction: action === draft ? "checkout" : "",
  branch_id: branchData?.data?.id ?? billedOrderData?.branch_id,
  table_id: resolvedTableId,
  order_type_id: orderType?.id ?? billedOrderData?.order_type_id,
  order_type: orderType?.type ?? billedOrderData?.order_type?.slug,
  items: itemsForPayload,
  number_of_pax: pax ?? billedOrderData?.number_of_pax ?? 1,
  delivery_executive_id:
    orderType?.type === "delivery"
      ? selectedDeliveryExecutive?.id ??
        billedOrderData?.delivery_executive_id ??
        null
      : null,
  customer_id: customerInfo?.id ?? billedOrderData?.customer_id ?? null,
  pickup_date:
    orderType?.type === "pickup"
      ? dayjs(pickupDateTime).format("YYYY-MM-DD HH:mm:ss")
      : billedOrderData?.pickup_date ?? null,
  note: orderNote ?? null,
};
    try {
      const res = await saveOrderApi(token, payload);
      const data = await res;

      if (!data.status) {
        throw new Error(data.message || "API failed");
      }
setOrderSaved(true);
onClearCart();
resetOrderState();
setSelectedDeliveryExecutive(null);  
setSelectedWaiter(null);             
toast.success("Order saved successfully");
await fetchOrders({ page: 1, per_page: 10 });
 await fetchTables();
return data;
    } catch (err) {

const resolvedOrderType =
  orderType || (mode === "draft" ? (draft as any)?.orderType : null);
    const draftOrder = {
  _offlineId: Date.now(),
  _createdAt: new Date().toISOString(),
  cart,
  pax,
  paymentMode,
  orderNote,
displayOrderNumber,
  customerInfo,
  selectedWaiter,
  selectedTable,
orderType: resolvedOrderType
  ? { id: resolvedOrderType.id, type: resolvedOrderType.type }
  : null,
  pickupDateTime,
  tableId,
  orderId: activeOrder?.order_number ?? null,
  orderNumber: activeOrder?.order_number ?? displayOrderNumber,
  apiPayload: payload,
};
    saveOrderOffline(draftOrder);
      setOrderSaved(true);
      onClearCart();
    }

  };

  const isAddingNewKot = cart.length > 0;
const createKotForExistingOrder = async (token: string) => {
  const payload = {
    branch_id: branchData?.data?.id,
    order_id: activeOrder?.id,
    table_id: activeOrder?.table_id,
    kitchen_place_id: 4,
 order_type_id: orderType?.id,
      order_type: orderType?.type,
    items: buildOrderItems(effectiveCart),
    number_of_pax: pax,
  };

  const res = await createKotWithOrder(payload);

  if (res.status) {
    onClearCart();
    setSelectedDeliveryExecutive(null);
setSelectedWaiter(null);
toast.success("KOT created successfully");
  await fetchOrders({ page: 1, per_page: 10 });
   await fetchTables();
    const updatedOrder = res.data;
    navigate("/poss", {
      replace: true,
      state: {
        // mode: "kot",
        tableId: updatedOrder?.table_id,
        activeOrder: updatedOrder,
      },
    });
  }
};

const STATUS_ICON_MAP: Record<string, string> = {
  placed: ordericon,
  confirmed: ordericon2,
  preparing: ordericon3,
  food_ready: ordericon3,
  served: ordericon4,
  ready_for_pickup: ordericon4,
  out_for_delivery: ordericon4,
  delivered: ordericon5,
  cancelled: ordericon5,
};


useEffect(() => {
  if (!orderType?.type) return;


  fetchOrderStatuses(orderType.type)
    .then((data) => {
      setOrderStatuses(data);
    })
    .catch((err) => {
      setOrderStatuses([]);
    });
}, [orderType?.type]);

const orderStatusUI = React.useMemo(() => {
  const source =
    orderStatuses?.length > 0
      ? orderStatuses
      : DEFAULT_ORDER_STATUSES;

  return source.map((s) => ({
    key: s.key,
    label: s.label,
    icon: STATUS_ICON_MAP[s.key] ?? ordericon,
  }));
}, [orderStatuses]);


  const FALLBACK_STATUS_ICONS = [
    ordericon,
    ordericon2,
    ordericon3,
    ordericon4,
    ordericon5,
  ];
const headerTextStyle = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  minWidth: 100,
  height: 44,
  px: 1.5,
  border: "1px solid #00000040",
  background: "#FFF",
  cursor: "pointer",
  fontSize: 13,
  fontWeight: 400,
};
const headerTextStyle3 = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  minWidth: 130,
  height: 44,
  px: 1.5,
  border: "1px solid #00000040",
  background: "#FFF",
  cursor: "pointer",
  fontSize: 13,
  fontWeight: 400,
};
const headerTextStyle2 ={
   display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  minWidth: 90,
  height: 40,
  px: 1.5,
  border: "1px solid #00000040",
  background: "#FFF",
  cursor: "pointer",
  fontSize: 13,
  fontWeight: 600,
  maxwidth: 150, 
}
const headerSubText = {
  fontSize: 11,
  color: "#4CAF50",
  fontWeight: 600,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

  const handleHeaderIconClick = (icon: string) => {
    if (icon === customer) {
      setCustomerModalOpen(true);
    }

    if (icon === waiter) {
      setWaiterModalOpen(true);
    }

    if (icon === assigntable) {
      setTableModalOpen(true);
    }
    if (icon === note) {
      setNoteTarget({ type: "order" });
      setNoteText(orderNote);
      setNoteModalOpen(true);
    }
    if (icon === calendericon) {
      setPickupModalOpen(true);
    }
 if (icon === delivery) {
     setDeliveryExecAnchorEl(document.body as HTMLElement);
     setPendingDeliveryExec(selectedDeliveryExecutive);
    }
  };
  const orderContextLabel = React.useMemo(() => {
  if (mode !== "view" && mode !== "kot") return null;

  if (orderType?.type === "dine_in") {
    return {
      left: `Dine In`,
      right: `Pax ${pax}${tableNo ? ` · Table ${tableNo}` : ""}`,
    };
  }

  if (orderType?.type === "delivery") {
    return {
      left: "Delivery",
    right: selectedDeliveryExecutive?.name
  ? `By ${selectedDeliveryExecutive.name}`
  : null,

    };
  }

  if (orderType?.type === "pickup") {
    return {
      left: "Pickup",
      right: pickupDateTime
        ? dayjs(pickupDateTime).format("DD MMM, hh:mm A")
        : null,
    };
  }

  return null;
}, [
  mode,
  orderType?.type,
  pax,
  tableNo,
  selectedWaiter,
  pickupDateTime,
]);

   const getSelectedLabel = (icon: string) => {
    if (icon === customer && customerInfo?.name) {
      return customerInfo.name;
    }

    if (icon === assigntable && selectedTable) {
      return `${selectedTable.tableNo}${selectedTable.areaName ? ` (${selectedTable.areaName})` : ""}`;
    }

    if (icon === waiter && selectedWaiter?.name) {
      return selectedWaiter.name;
    }

    if (icon === calendericon && orderType?.type === "pickup") {
      return dayjs(pickupDateTime).format("DD MMM, hh:mm A");
    }
    if (icon === delivery && selectedDeliveryExecutive?.name) {
  return selectedDeliveryExecutive.name;
}

if (icon === note) {
  if (orderNote) return "Order note";

  const itemNotesCount = cart.filter((i: any) => i.note).length;
  if (itemNotesCount > 0) return `${itemNotesCount} item note(s)`;

  return null;
}
    return null;
  };
 const applyDiscount = async () => {
  debugger;
    if (!activeOrder?.order_number) {
       setDiscountOpen(false);
 toast.error("Please save the order before applying discount.");  
    return;
  }
  const token = localStorage.getItem("token");
  if (!token) return;
  const res = await fetch(`${BASE_URL}/applydiscount`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      order_id: activeOrder.id || "", 
      discount_type: discountType,       
      discount_value: discountValue,   
      total: finalTotal,   
    }),
  });

  const data = await res.json();

  if (data.status) {
    activeOrder.sub_total = data.data.sub_total;
    activeOrder.total_tax_amount = data.data.tax_amount;
    activeOrder.total = data.data.final_total;

    setDiscountOpen(false);
    setDiscountValue(0);
    setDiscountType("fixed");

    fetchOrders({ page: 1, per_page: 20 });
  } else {
   toast.error(data.message || "Unable to apply discount");
       setDiscountOpen(false);
   setDiscountValue(0);
  }
};
const isOrderPaid = React.useMemo(() => {
  if (!activeOrder) return false;
  const paid =
    activeOrder?.status === "paid" ||
    activeOrder?.payment_status === "paid" ||
    Number(activeOrder?.amount_paid || 0) >= Number(finalTotal);
  return paid;
}, [activeOrder, finalTotal]);

const drawerCurrentIndex = orderStatusUI.findIndex(
  (x) => x.key === billedOrderData?.order_status
);

const handlePrintKot = (kot: any) => {
  if (!kot) return;


  const printWindow = window.open("/#/print-kot", "_blank",
    "width=400,height=600"
  );

  if (!printWindow) return;

const mappedItems = kot.items.map((i: any) => ({
  id: i.id,

  name:
    i.menu_item?.item_name ||
    i.menu_item?.translations?.[0]?.item_name ||
    "Item",

  qty: i.quantity ?? 0,
  price:
    Number(i.price) ||
    Number(i.amount) ||
    Number(i.menu_item?.price) ||
    0,

  /* 🔥 NOTE FIX */
  note:
    i.note ||
    i.order_item?.note ||   // fallback if nested
    "",
}));



  const payload = {
    type: "PRINT_KOT",
    payload: {
      kot,
      order: activeOrder,
      items: mappedItems,   // ✅ SEND AS items
    },
  };

  const timer = setInterval(() => {
    if (printWindow.closed) {
      clearInterval(timer);
      return;
    }

    printWindow.postMessage(payload, "*");
    clearInterval(timer);
  }, 500);
};

const handlePrintAllKots = () => {
  if (!activeOrder?.kot?.length) return;

  const printWindow = window.open(
    "/#/print-all-kot",
    "_blank",
    "width=400,height=600"
  );

  if (!printWindow) return;

  const mappedKots = activeOrder.kot.map((kot: any) => ({
    kotNumber: kot.kot_number,

    items: kot.items.map((i: any) => ({
      id: i.id,
      name:
        i.menu_item?.item_name ||
        i.menu_item?.translations?.[0]?.item_name ||
        "Item",
      qty: i.quantity ?? 0,
      price:
        Number(i.price) ||
        Number(i.amount) ||
        Number(i.menu_item?.price) ||
        0,
      note: i.note || "",
    })),
  }));

  const payload = {
    type: "PRINT_ALL_KOTS",
    payload: {
      order: activeOrder,
      kots: mappedKots,
    },
  };

  const timer = setInterval(() => {
    if (printWindow.closed) {
      clearInterval(timer);
      return;
    }

    printWindow.postMessage(payload, "*");
    clearInterval(timer);
  }, 500);
};


const showPaxDropdown =
  orderType?.type === "dine_in" &&
  mode !== "view" &&
  mode !== "kot";
  return (
    <Box
      sx={{
         width: "100%",
    minWidth: 0,
        display: "flex",
        flexDirection: "column",
        minHeight : "86vh",
        backgroundColor: "#FFFFFF",
        color: "var(--text)",
      overflowX :'hidden',
      maxHeight :'95vh',
        borderRight: '1px solid #F8F8F9'
      }}
    >
{mode !== "view" && mode !== "kot" ? (
  !fromTable && (   // ⭐ ADD CONDITION
  <Box sx={{ p: 2, borderBottom: "1px solid #ddd" }}>
    <OrderTypeSwitcher
      activeType={orderType?.type ?? ""}
      onSelect={(type) => {
        const selected = orderTypes.find(
          (o: any) => o.type === type
        );

        if (selected) {
          setOrderType?.({
            id: selected.id,
            type: selected.type,
          });
        }
      }}
      isTableView={false}
    />
  </Box>
)
) : (
<Box
  sx={{
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 1,
    overflowX: "hidden",
  }}
>
  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
    <Typography fontWeight={700} color="#000000">
     <img
              src={ordernumber}
              alt="ordernumber"
              style={{ width: 18, height: 18 }}
            />  Order #{displayOrderNumber}
    </Typography>
    {orderContextLabel && (
      <Typography
        sx={{
          fontSize: 13,
          fontWeight: 600,
          color: "#555",
        }}
      >
        {orderContextLabel.left}
        {orderContextLabel.right && (
          <span style={{ marginLeft: 6, color: "#000" }}>
            · {orderContextLabel.right}
          </span>
        )}
      </Typography>
    )}
  </Box>
  {orderType?.type === "dine_in" &&
    (mode === "view" || mode === "kot") &&
    resolvedTableLabel && (
      <Box
        sx={{
          minWidth: 120,
          maxWidth: 160,
          height: 36,
          backgroundColor: "#C48045",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          fontWeight: 600,
          fontSize: "13px",
          px: 1.5,
        }}
      >
        Table {resolvedTableLabel.tableNo}
        {resolvedTableLabel.areaName &&
          ` (${resolvedTableLabel.areaName})`}
      </Box>
  )}
</Box>

)}
      {orderType?.type === "pickup" && mode === "new" && (
        <Typography fontSize={12} color="#000000" sx={{ mt: 0.5 }}>
          Pickup: {dayjs(pickupDateTime).format("DD MMM, hh:mm A")}
        </Typography>
      )}

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: 1,
          backgroundColor: "#F8F8F9",
          flexShrink: 0,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            flexShrink: 0,
          }}
        >

        <Box sx={{ display: "flex", gap: 3.5 , flexWrap: "wrap", }}>
{activeOrder &&( mode === "view" || mode === "kot")  && orderStatusUI.length > 0 ? (
  orderStatusUI.map((status, index) => {

    const currentIndex = orderStatusUI.findIndex(
      (s) => s.key === activeOrder?.order_status
    );

    const stepIndex = orderStatusUI.findIndex(
      (s) => s.key === status.key
    );
    const isCompleted =
      currentIndex !== -1 && stepIndex < currentIndex;

    const isCurrent =
      currentIndex !== -1 && stepIndex === currentIndex;


          return (
            <Box
              key={index}
              sx={{
                width: 60,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "14px",
              }}
            >
     <Box
  sx={{
    width: 73,
    height: 48,

    backgroundColor: isCompleted
      ? "#0000001A"
      : isCurrent
      ? "#0000001A"
      : "#FFFFFF",

    border: isCompleted || isCurrent
      ? "2px solid #0000001A"
      : "1px solid #89986D",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }}
>
  <img
    src={status.icon}
    alt={status.label}
    style={{ width: 22, height: 22 }}
  />
</Box>

<Typography
  sx={{
    fontSize: "10px",
    fontWeight: isCurrent ? 700 : 500,
    color: isCompleted
      ? "#5A7863"
      : isCurrent
      ? "#5A7863"
      : "#555",
    textAlign: "center",
    lineHeight: 1.2,
  }}
>
  {status.label}
</Typography>

            </Box>
          );
        })
      )
    : (
  <Box
  sx={{
    display: "flex",
    flexDirection: "column",
    gap: 1,
  }}
>

  <Box
    sx={{
      display: "flex",
      flexWrap: "wrap",
      gap: 1,
      alignItems: "center",
    }}
  >
    {mode !== "view" && mode !== "kot" && (
     <Box
  sx={{
    display: "flex",
    alignItems: "center",
    gap: 2,
    borderRight: "1px solid #000000",
    paddingRight: 2,
    marginRight: 1,
  }}
>
  <Typography fontWeight={500} color="#000000">
    <img
      src={ordernumber}
      alt="ordernumber"
      style={{ width: 18, height: 18 }}
    />
    Order #{displayOrderNumber}
  </Typography>
</Box>
    )}

  {showPaxDropdown && (
  <Box
    sx={{
      width: 90,
      height: 60,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 1,
      border: "1px solid #F8F8F9",
      px: 1,
    }}
  >
    <Typography
      sx={{
        fontSize: 13,
        fontWeight: 600,
        color: "#000",
      }}
    >
      Pax
    </Typography>
    <input
      type="number"
      value={pax}
      min={1}
      max={10}
      onChange={(e) =>
        setPax(Number(e.target.value))
      }
      style={{
        width: 38,
        height: 32,
        textAlign: "center",
        border: "1px solid #E0E0E0",
        borderRadius: 4,
        fontWeight: 700,
        fontSize: 14,
        outline: "none",
        backgroundColor: "#FFFFFF",
      }}
    />
  </Box>
)}

  {orderType?.type === "dine_in" && (
  <>
   <Box
  sx={{
    ...headerTextStyle,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 1,
    border: !resolvedTableLabel ? "1px solid #E0E0E0" : "none",
    backgroundColor: !resolvedTableLabel ? "#FFFFFF" : "transparent",
    borderRadius: !resolvedTableLabel ? "6px" : 0,
    padding: !resolvedTableLabel ? "6px 10px" : 0,
  }}
  onClick={() => {
    if (!resolvedTableLabel) {
      setTableModalOpen(true);
    }
  }}
>
  {!resolvedTableLabel ? (
    <Typography
      sx={{
        fontSize: 13,
        fontWeight: 400,
        color: "#000",
      }}
    >
      Assign Table
    </Typography>
  ) : (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.2,
        width: "100%",
        justifyContent: "space-between",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <img
          src={assigntable}
          alt="table"
          style={{
            width: 18,
            height: 18,
            objectFit: "contain",
          }}
        />

        <Typography
          sx={{
            fontSize: 13,
            fontWeight: 600,
            color: "#000",
          }}
        >
          {resolvedTableLabel.tableNo}
          {resolvedTableLabel.areaName &&
            ` (${resolvedTableLabel.areaName})`}
        </Typography>
      </Box>

      <SettingsIcon
        sx={{
          fontSize: 16,
          color: "#555",
          cursor: "pointer",
        }}
        onClick={(e) => {
          e.stopPropagation();
          setTableModalOpen(true);
        }}
      />
    </Box>
  )}
</Box>
    <Box
      sx={headerTextStyle}
      onClick={() => {
        navigate("/dashboard", {
          state: { tableView: true },
        });
      }}
    >
      Table View
    </Box>
    <Box
      sx={{
        ...headerTextStyle2,
        flexDirection: "row",
        alignItems: "center",
        gap: 1,
      }}
      onClick={() => {
        setNoteTarget({ type: "order" });
        setNoteText(orderNote);
        setNoteModalOpen(true);
      }}
    >
      <img
        src={noteicon}
        alt="note"
        style={{
          width: 18,
          height: 18,
          objectFit: "contain",
        }}
      />

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          lineHeight: 1,
        }}
      >
        Note

        {orderNote && (
          <Typography sx={headerSubText}>
            Added
          </Typography>
        )}
      </Box>
    </Box>
  </>
)}

    {orderType?.type === "delivery" && (
      <>
      <Box
        sx={headerTextStyle}
        onClick={(e) => { setDeliveryExecAnchorEl(e.currentTarget); setPendingDeliveryExec(selectedDeliveryExecutive); }}
      >
        Delivery
        {selectedDeliveryExecutive?.name && (
          <Typography sx={headerSubText}>
            {selectedDeliveryExecutive.name}
          </Typography>
        )}
      </Box>
       <Box
  sx={{
    ...headerTextStyle2,
    flexDirection: "row",
    alignItems: "center",
    gap: 1,
  }}
  onClick={() => {
    setNoteTarget({ type: "order" });
    setNoteText(orderNote);
    setNoteModalOpen(true);
  }}
>
  <img
    src={noteicon}
    alt="note"
    style={{
      width: 18,
      height: 18,
      objectFit: "contain",
    }}
  />

  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      lineHeight: 1,
    }}
  >
    Note

    {orderNote && (
      <Typography sx={headerSubText}>
        Added
      </Typography>
    )}
  </Box>
</Box>
</>
    )}

{orderType?.type === "pickup" && (
  <>
      <Box
        sx={{
          display: "flex",
          gap: 1,
          mt: 1,
          position: "relative",
        }}
      >
        <Box sx={{ position: "relative" }}>
          <Box
            onClick={() =>
              setShowPickupDate((v) => !v)
            }
            className="form-control order-date-input"
            sx={{
              minWidth: 150,
              height: "39px",
              display: "flex",
              alignItems: "center",
              gap: 1,
              cursor: "pointer",
              backgroundColor: "#FFFFFF",
            }}
          >
            <img
              src={calendericon}
              width={16}
            />

            <span>
              {dayjs(pickupDateTime).format(
                "DD MMM YYYY"
              )}
            </span>
          </Box>

          {showPickupDate && (
            <Box
              sx={{
                position: "absolute",
                top: 45,
                zIndex: 2000,
              }}
            >
              <DatePicker
                selected={pickupDateTime}
                onChange={(date: Date | null) => {
                  if (!date) return;

                  const updated =
                    new Date(
                      pickupDateTime
                    );

                  updated.setFullYear(
                    date.getFullYear()
                  );
                  updated.setMonth(
                    date.getMonth()
                  );
                  updated.setDate(
                    date.getDate()
                  );

                  setPickupDateTime(
                    updated
                  );
                  setShowPickupDate(
                    false
                  );
                }}
                inline
                minDate={new Date()}
              />
            </Box>
          )}
        </Box>
        <Box sx={{ position: "relative" }}>
          <Box
            onClick={() =>
              setShowPickupTime((v) => !v)
            }
            className="form-control order-date-input"
            sx={{
              minWidth: 130,
              height: "39px",
              display: "flex",
              alignItems: "center",
              gap: 1,
              cursor: "pointer",
              backgroundColor: "#FFFFFF",
            }}
          >
            <img
              src={clockicon}   // use your time icon
              width={16}
            />

            <span>
              {dayjs(pickupDateTime).format(
                "hh:mm A"
              )}
            </span>
          </Box>

          {showPickupTime && (
            <Box
              sx={{
                position: "absolute",
                top: 45,
                zIndex: 2000,
                background: "#fff",
                border: "1px solid #E0E0E0",
                p: 1,
              }}
            >
              <DatePicker
                selected={pickupDateTime}
                onChange={(time: Date | null) => {
                  if (!time) return;

                  const updated =
                    new Date(
                      pickupDateTime
                    );

                  updated.setHours(
                    time.getHours()
                  );
                  updated.setMinutes(
                    time.getMinutes()
                  );

                  setPickupDateTime(
                    updated
                  );
                  setShowPickupTime(
                    false
                  );
                }}
                showTimeSelect
                showTimeSelectOnly
                timeIntervals={15}
                inline
                dateFormat="hh:mm aa"
              />
            </Box>
          )}
        </Box>
      </Box>
      <Box
  sx={{
    ...headerTextStyle2,
    flexDirection: "row",
    alignItems: "center",
    gap: 1,
  }}
  onClick={() => {
    setNoteTarget({ type: "order" });
    setNoteText(orderNote);
    setIsEditMode(!!orderNote); 
    setNoteModalOpen(true);
  }}
>
  <img
    src={noteicon}
    alt="note"
    style={{
      width: 18,
      height: 18,
      objectFit: "contain",
    }}
  />

  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      lineHeight: 1,
    }}
  >
    Note

    {orderNote && (
      <Typography sx={headerSubText}>
        Added
      </Typography>
    )}
  </Box>
</Box>
  </>
)}


    {orderType?.type !== "dine_in" && (
      <Box
        sx={headerTextStyle3}
        onClick={() => setCustomerModalOpen(true)}
      >
        + Add Customer
        {customerInfo?.name && (
          <Typography sx={headerSubText}>
            {customerInfo.name}
          </Typography>
        )}
      </Box>
    )}
  </Box>
  {orderType?.type === "dine_in" && (
    <Box
  sx={{
    display: "flex",
    flexWrap: "wrap",
    gap: 1,
  }}
>
  <Box
    sx={headerTextStyle3}
    onClick={() => setCustomerModalOpen(true)}
  >
    + Add Customer
    {customerInfo?.name && (
      <Typography sx={headerSubText}>
        {customerInfo.name}
      </Typography>
    )}
  </Box>

  {/* Waiter (unchanged) */}
  <img src={waiter} style={{ width: 25 , height : 25 ,marginTop :4}}/>
  <Box
    sx={headerTextStyle}
    onClick={(e) => {
      setWaiterAnchorEl(e.currentTarget);
      setWaiterModalOpen(true);
    }}
  >
    Waiter
    {selectedWaiter?.name && (
      <Typography sx={headerSubText}>
        {selectedWaiter.name}
      </Typography>
    )}
  </Box>
  <img src={mergeicon} style={{ width: 25 , height : 25  , marginTop :4}} /> 
  <Box
    sx={headerTextStyle}
    onClick={() => {
      navigate("/dashboard", {
        state: {
          openMerge: true,              
          sourceTableId:
            activeOrder?.table_id ??
            selectedTable?.tableId ??
            tableId ??
            null,
        },
      });
    }}
  >
    Merge Table
  </Box>
</Box>
  )}
</Box>

      )
  }
</Box>
        </Box>
       {orderType?.type === "dine_in"  && mode === "new" && resolvedTableLabel && (
  <Box
    sx={{
      minWidth: 120,
      maxWidth: 150,
      height: 60,
      backgroundColor: "#C48045",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#fff",
      fontWeight: 600,
      fontSize: "14px",
      flexShrink: 0,
    }}
  >
    {resolvedTableLabel.tableNo}
    {resolvedTableLabel.areaName && ` (${resolvedTableLabel.areaName})`}
  </Box>
)}

      </Box>

      {showMoveNextButton && (
        <Box sx={{ mt: 1, textAlign: "right" }}>
          <Button
            variant="outlined"
            size="small"
            onClick={moveToNextStep}
            sx={{
              textTransform: "none",
              fontSize: "12px",
              padding: "4px 10px",
              borderColor: "#5A7863",
              backgroundColor: "#FFFFFF",
              "&:hover": {
                backgroundColor: "#EBF4DD",
              },
            }}
          >
            Move to Order {nextStatus.replace(/_/g, " ")}
          </Button>
        </Box>
      )}
      <Box style={{
        flex: 1,
        overflowY: "auto", 
        padding: 1,
        minHeight: 0
      }}>

{derivedKotGroups.length > 0 && (
  <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 2 }}>
    
    <Typography fontSize={12} fontWeight={700} color="#5A7863">
      KOTs ({derivedKotGroups.length})
    </Typography>

    {derivedKotGroups.map((kot: any) => (
      <Box
        key={kot.kotId}
        sx={{
          p: .5,
          backgroundColor: "#FAFAFA",
          borderRadius: "5px",
          border: "1px solid #EAEAEA",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 0.8,
          }}
        >
          <Typography
            fontSize={12}
            fontWeight={700}
            color="#5A7863"
          >
            KOT #{kot.kotNumber}
          </Typography>

          <IconButton
            size="small"
            onClick={() => handlePrintKot(kot)}
            sx={{
              background: "#FFFFFF",
              border: "1px solid #E0E0E0",
              "&:hover": {
                background: "#F5F5F5",
              },
            }}
          >
            <img
              src={printerimage}
              alt="print kot"
              style={{ width: 16, height: 16 }}
            />
          </IconButton>
        </Box>

        {kot.items.map((item: any) => (
          <Box
            key={item.id}
            sx={{
              display: "grid",
              gridTemplateColumns: "1.6fr 0.6fr 0.8fr",
              alignItems: "center",
              px: 1.2,
              py: 0.9,
              mb: 0.6,
              background: "#FFFFFF",
              border: "1px solid #F0F0F0",
              borderRadius: "8px",
              fontSize: 12,
            }}
          >
            <Box>
              <Typography
                sx={{
                  fontWeight: 600,
                  fontSize: 13,
                  color: "#222",
                }}
              >
                {item.menu_item?.item_name ?? "Item"}
              </Typography>

              {item.menu_item?.note && (
                <Typography
                  sx={{
                    fontSize: 11,
                    color: "#4CAF50",
                    mt: 0.2,
                  }}
                >
                  {item.menu_item?.note}
                </Typography>
              )}
            </Box>
            <Typography
              sx={{
                textAlign: "center",
                fontWeight: 600,
              }}
            >
              {item.quantity}
            </Typography>

            <Typography
              sx={{
                textAlign: "right",
                fontWeight: 700,
              }}
            >
              ₹{item.menu_item?.price ?? 0}
            </Typography>
          </Box>
        ))}
      </Box>
    ))}
  </Box>
)}

{isAddingNewKot && (
  <Box sx={{ p: 1, mt: 2 }}>
 {cart.map((c) => (
  <Box
    key={`new-kot-${c.id}`}
    sx={{
      border: "1px solid #eee",
      p: 1.5,
      mb: 1,
      backgroundColor: "#FFFFFF",
      display: "flex",
      flexDirection: "column",
      gap: 1,
    }}
  >
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
      }}
    >
      <Typography
        sx={{
          fontSize: 16,     // Bigger item name
          fontWeight: 300,
          color :"#000000"

        }}
      >
        {c.name}
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
  <Typography
    sx={{
      fontSize: 16,
      fontWeight: 500,
    }}
  >
    ₹ {c.price}
  </Typography>

  <Typography
    sx={{
      fontSize: 16,
      fontWeight: 500,
    }}
  >
    ₹ {c.price * c.qty}
  </Typography>
</Box>
    </Box>
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
  xs: "1fr",               
  sm: "120px 1fr 50px",   
  md: "140px 1fr 50px",     
},
gap: 1,

        alignItems: "center",
        width: "100%",
      }}
    >
     <Box
  sx={{
    display: "flex",
    alignItems: "center",
    gap: 1,
  }}
>
  <Box
    onClick={() => onDecrease(c.id)}
    sx={{
      border: "1px solid #ddd",
      width: 32,
      height: 32,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: "0px 1px 3px #00000040",
      borderRadius: 1,
      cursor: "pointer",
    }}
  >
    <img
      src={RemoveIcon}
      style={{
        width: 18,
        height: 18,
      }} />
  </Box>
  <Typography
    sx={{
      fontSize: 16,
      fontWeight: 700,
      width: 32,
      height: 32,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
    }}
  >
    {c.qty}
  </Typography>

  {/* INCREASE */}
  <Box
    onClick={() => onIncrease(c.id)}
    sx={{
      border: "1px solid #ddd",
      width: 32,
      height: 32,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: "0px 1px 3px #00000040",
      borderRadius: 1,
      cursor: "pointer",
    }}
  >
   <img
      src={AddIcon}
      style={{
        width: 18,
        height: 18,
      }} />
  </Box>
</Box>

<Box
 onClick={() => {
  setNoteTarget({
    type: "item",
    itemId: c.id,
  });
  setNoteText(c.note || "");
  setIsEditMode(!!c.note); 
  setNoteModalOpen(true);
}}

  sx={{
    display: "flex",
    alignItems: "center",
    justifyContent: "center",  
    textAlign: "center",       
    gap: 0.5,
    width: "100%",          
    fontSize: 13,
    fontWeight: 600,
    color: c.note ? "#FA5252" : "#9E9E9E",
    cursor: "pointer",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",

    "&:hover": {
      textDecoration: "underline",
    },
  }}
>
  {c.note ? (
    <img
      src={messageicon}
      style={{
        width: 18,
        height: 18,
      }}
    />
  ) : (
    <img
      src={AddIcon}
      style={{
        width: 18,
        height: 18,
      }} />
  )}

  {c.note ? c.note : "Add Note"}
</Box>

      <Box sx={{ textAlign: "right" }}>
  <Box
    onClick={() => onRemove(c.id)}
    sx={{
      border: "1px solid #eee",
      width: 42,
      height: 42,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: "0px 1px 3px #00000040",
      borderRadius: 1,
      cursor: "pointer",
      ml: "auto",
    }}
  >
    <img
      src={Deleteicon}
      style={{
        width: 18,
        height: 18,
      }}
    />
  </Box>
</Box>

    </Box>
  </Box>
))}
  </Box>
)}

      </Box>
  <Box
  sx={{
    backgroundColor: "#4582F40F",
    border: "1px solid #E0E0E0",
  }}
>
  <Box
    sx={{
      height: 60,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      px: 2,
      cursor: "pointer",
    }}
    onClick={() => setShowDiscountDetails(!showDiscountDetails)}
  >
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
      }}
    >
      <img
        src={Discounticon}
        alt="discount"
        style={{ width: 140 }}
      />
    </Box>

    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        fontWeight: 700,
        color: "#000",
      }}
    >
      <Typography fontSize={13} fontWeight={500}>
        Items ({effectiveCart.length + allKotItems.length})
      </Typography>

      <img
        src={ruppeeicon}
        alt="₹"
        style={{ width: 22 }}
      />

      <Typography fontSize={16} fontWeight={700}>
        ₹ {finalTotal}
      </Typography>
    </Box>
  </Box>

  {showDiscountDetails && (
    <Box
      sx={{
        px: 2,
        pb: 2,
        display: "flex",
        flexDirection: "column",
        gap: 1,
        borderTop: "1px solid #E0E0E0",
      }}
    >
      <Box display="flex" justifyContent="space-between">
        <Typography fontSize={13}>Item(s)</Typography>
        <Typography fontSize={13}>
          {effectiveCart.length + allKotItems.length}
        </Typography>
      </Box>

      <Box display="flex" justifyContent="space-between">
        <Typography fontSize={13}>Sub Total</Typography>
        <Typography fontSize={13}>
          ₹{computedSubtotal}
        </Typography>
      </Box>

      {discountValue > 0 && (
        <Box display="flex" justifyContent="space-between">
          <Typography fontSize={13} color="green">
            Discount
          </Typography>
          <Typography fontSize={13} color="green">
            -₹{discountValue}
          </Typography>
        </Box>
      )}

      <Box display="flex" justifyContent="space-between">
       <Typography fontSize={13}>
  GST ({gstPercent}%)
</Typography>
        <Typography fontSize={13}>₹{computedTax}</Typography>
      </Box>

      <Box display="flex" justifyContent="space-between" mt={1}>
        <Typography fontWeight={700}>Total</Typography>
        <Typography fontWeight={700}>
          ₹{finalTotal}
        </Typography>
      </Box>

      <Button
        variant="outlined"
        size="small"
        sx={{
          mt: 1,
          textTransform: "none",
          fontSize: 12,
        }}
        onClick={(e) => {
          e.stopPropagation();
          setDiscountOpen(true);
        }}
      >
        Apply Discount
      </Button>
    </Box>
  )}
</Box>

      {discountOpen && (
        <Box sx={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 4000,
        }}>
          <Box sx={{
            width: 380,
            backgroundColor: "#FFFFFF",
            borderRadius: "16px",
            boxShadow: "0 24px 80px rgba(0,0,0,0.25)",
            overflow: "hidden",
            fontFamily: "Poppins, sans-serif",
          }}>
            {/* Header */}
            <Box sx={{
              background: "linear-gradient(135deg,#1F2937 0%,#374151 100%)",
              px: 2.5, py: 2,
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                <Box sx={{
                  width: 36, height: 36, borderRadius: "8px",
                  background: "rgba(232,53,58,.2)",
                  border: "1px solid rgba(232,53,58,.35)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <LocalOfferOutlinedIcon sx={{ fontSize: 18, color: "#FCA5A5" }} />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: 15, fontWeight: 700, color: "#FFFFFF", fontFamily: "Poppins, sans-serif" }}>
                    Apply Discount
                  </Typography>
                  <Typography sx={{ fontSize: 11, color: "#9CA3AF", fontFamily: "Poppins, sans-serif" }}>
                    Order total: ₹{finalTotal.toFixed(2)}
                  </Typography>
                </Box>
              </Box>
              <IconButton size="small"
                onClick={() => { setDiscountOpen(false); setDiscountValue(0); setDiscountType("fixed"); }}
                sx={{ color: "#9CA3AF", "&:hover": { backgroundColor: "rgba(255,255,255,0.08)" } }}>
                <CloseRoundedIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Box>

            {/* Body */}
            <Box sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 2 }}>

              {/* Type toggle */}
              <Box sx={{ display: "flex", border: "1.5px solid #E5E7EB", borderRadius: "10px", overflow: "hidden", height: 40 }}>
                {[{ v: "fixed", l: "Fixed (₹)" }, { v: "percent", l: "Percentage (%)" }].map(({ v, l }) => (
                  <Box key={v} onClick={() => { setDiscountType(v as any); setDiscountValue(0); }}
                    sx={{
                      flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "Poppins, sans-serif",
                      backgroundColor: discountType === v ? "#FF3D01" : "#FFFFFF",
                      color: discountType === v ? "#FFFFFF" : "#6B7280",
                      transition: "all .15s",
                      "&:hover": { backgroundColor: discountType === v ? "#c62a2f" : "#F9FAFB" },
                    }}
                  >
                    {l}
                  </Box>
                ))}
              </Box>

              {/* Quick preset buttons */}
              <Box>
                <Typography sx={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", fontFamily: "Poppins, sans-serif", mb: 0.8, textTransform: "uppercase", letterSpacing: 0.5 }}>
                  Quick {discountType === "percent" ? "Percentages" : "Amounts"}
                </Typography>
                <Box sx={{ display: "flex", gap: 1 }}>
                  {(discountType === "percent" ? [5, 10, 15, 20] : [50, 100, 150, 200]).map(v => (
                    <Box key={v} onClick={() => setDiscountValue(v)}
                      sx={{
                        flex: 1, height: 36, borderRadius: "8px",
                        border: `1.5px solid ${discountValue === v ? "#FF3D01" : "#E5E7EB"}`,
                        backgroundColor: discountValue === v ? "#FEF2F2" : "#F9FAFB",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        cursor: "pointer", transition: "all .12s",
                        "&:hover": { borderColor: "#FF3D01", backgroundColor: "#FEF2F2" },
                      }}>
                      <Typography sx={{ fontSize: 12, fontWeight: 700, fontFamily: "Poppins, sans-serif", color: discountValue === v ? "#FF3D01" : "#374151" }}>
                        {discountType === "percent" ? `${v}%` : `₹${v}`}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>

              {/* Input */}
              <Box>
                <Typography sx={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", fontFamily: "Poppins, sans-serif", mb: 0.8, textTransform: "uppercase", letterSpacing: 0.5 }}>
                  {discountType === "fixed" ? "Flat Discount Amount (₹)" : "Discount Percentage (%)"}
                </Typography>
                <TextField
                  fullWidth type="number"
                  placeholder={discountType === "fixed" ? "e.g. 50" : "e.g. 10"}
                  value={discountValue || ""}
                  onChange={e => setDiscountValue(Number(e.target.value))}
                  InputProps={{
                    startAdornment: (
                      <Box sx={{ mr: 0.5, color: "#9CA3AF", fontFamily: "Poppins, sans-serif", fontSize: 18, fontWeight: 700 }}>
                        {discountType === "fixed" ? "₹" : "%"}
                      </Box>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      height: 52, fontSize: 22, fontWeight: 700, fontFamily: "Poppins, sans-serif",
                      borderRadius: "10px", backgroundColor: "#F9FAFB",
                      "& fieldset": { borderColor: "#E5E7EB" },
                      "&:hover fieldset": { borderColor: "#9CA3AF" },
                      "&.Mui-focused fieldset": { borderColor: "#FF3D01" },
                    },
                  }}
                />
                {/* Preview */}
                {discountValue > 0 && (
                  <Box sx={{ mt: 1, display: "flex", justifyContent: "space-between", px: 1 }}>
                    <Typography sx={{ fontSize: 12, color: "#9CA3AF", fontFamily: "Poppins, sans-serif" }}>
                      Discount applied
                    </Typography>
                    <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#16A34A", fontFamily: "Poppins, sans-serif" }}>
                      -{discountType === "fixed"
                        ? `₹${discountValue}`
                        : `₹${((finalTotal * discountValue) / 100).toFixed(2)}`}
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Footer buttons */}
              <Box sx={{ display: "flex", gap: 1.2, pt: 0.5, borderTop: "1px solid #F3F4F6" }}>
                <Button fullWidth variant="outlined"
                  onClick={() => { setDiscountOpen(false); setDiscountValue(0); setDiscountType("fixed"); }}
                  sx={{
                    textTransform: "none", fontSize: 13, fontWeight: 600, fontFamily: "Poppins, sans-serif",
                    height: 42, borderRadius: "10px",
                    borderColor: "#D1D5DB", color: "#374151",
                    "&:hover": { borderColor: "#9CA3AF", backgroundColor: "#F9FAFB" },
                  }}>
                  Cancel
                </Button>
                <Button fullWidth variant="contained"
                  disabled={!discountValue || discountValue <= 0}
                  onClick={applyDiscount}
                  sx={{
                    textTransform: "none", fontSize: 13, fontWeight: 700, fontFamily: "Poppins, sans-serif",
                    height: 42, borderRadius: "10px",
                    background: discountValue > 0 ? "linear-gradient(135deg,#16A34A,#15803D)" : "#F3F4F6",
                    color: discountValue > 0 ? "#FFF" : "#D1D5DB",
                    boxShadow: discountValue > 0 ? "0 4px 12px rgba(22,163,74,.3)" : "none",
                    "&:hover": { background: discountValue > 0 ? "linear-gradient(135deg,#15803D,#166534)" : "#F3F4F6" },
                    "&.Mui-disabled": { background: "#F3F4F6", color: "#D1D5DB" },
                  }}>
                  Apply Discount
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
      )}
<Box
  sx={{
    position: "sticky",    
    bottom: 0,
    zIndex: 1000,
    backgroundColor: "#FFFFFF",
    borderTop: "1px solid #E0E0E0",
    display: "flex",
    flexDirection: "column",
  }}
>
  <Box
    sx={{
      backgroundColor: "#4582F40F",
      border: "1px solid #E0E0E0",
      height: 70,
      display: "flex",
      alignItems: "center",
      px: 2,
      flexShrink: 0,
    }}
  >
    <Box
      sx={{
        display: "flex",
        flexWrap: "nowrap",
        overflowX: "hidden",
        width: "100%",
        gap: 0.5,
      }}
    >
      <Button
        variant="contained"
        onClick={handleSaveDraft}
        sx={{ ...footerChipBtn, flex: 1, minWidth: 0, fontSize: 13 }}
        startIcon={
          <img src={hold} alt="hold" style={{ width: 18 }} />
        }
        style={{borderRadius :'0px!important'}}
      >
        Hold
      </Button>
      <Button
        variant="contained"
        onClick={handleSaveDraft}
        sx={{ ...footerChipBtn, flex: 1, minWidth: 0, fontSize: 13 }}
        style={{borderRadius :'0px!important'}}
        startIcon={
          <img src={draft} alt="draft" style={{ width: 18 }} />
        }
      >
        Save as Draft
      </Button>

      {/* KOT */}
      <Button
        variant="contained"
        onClick={() => kotActionRef.current?.("kot")}
        sx={{ ...footerChipBtn, flex: 1, minWidth: 0, fontSize: 13 }}
        style={{borderRadius :'0px!important'}}
        startIcon={
          <img src={kot} alt="kot" style={{ width: 18 }} />
        }
      >
        KOT
      </Button>

      {/* KOT PRINT */}
      <Button
        variant="contained"
        onClick={() =>
          kotActionRef.current?.("kot_print")
        }
        sx={{ ...footerChipBtn, flex: 1, minWidth: 0, fontSize: 13 }}
        style={{borderRadius :'0px!important'}}
        startIcon={
          <img src={kotprint} alt="print" style={{ width: 18 }} />
        }
      >
        KOT & Print
      </Button>

      {/* E-BILL */}
      <Button
        variant="contained"
        sx={{
          bgcolor: "#4BAC51",
          textTransform: "none",
          flex: 1,
          minWidth: 0,
          fontWeight: 700,
          fontSize: 13,
          height: 42,
          color: "#fff",
        }}
        style={{borderRadius :'0px!important'}}
        startIcon={
          <img src={ebill} alt="ebill" style={{ width: 18 }} />
        }
        onClick={() => {
          if (!customerInfo) {
            Swal.fire({
              icon: "error",
              title: "Customer details required",
              text:
                "Please add customer information before generating E-Bill.",
              confirmButtonColor: "#C5D89D",
            });
            return;
          }
          handleSaveOrderDetail("e-bill");
        }}
      >
        E-Bill
      </Button>

    </Box>
  </Box>
  <Box
    sx={{
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      flexShrink: 0,
    }}
  >
    <Button
      variant="contained"
      sx={{
        bgcolor: "#000000B2",
        textTransform: "none",
        border: "1px solid #000000B2",
        minHeight: 52,
        fontSize: 14,
        color: "#FFFFFF",
        fontWeight: 600,
      }}style={{borderRadius :'0px!important'}}
      onClick={() => {
        handleSaveOrderDetail("bill");
      }}
    >
      Bill
    </Button>
    <Button
      variant="outlined"
      sx={{
        color: "#FFFFFF",
        borderColor: "#000",
        textTransform: "none",
        minHeight: 52,
        fontSize: 14,
        fontWeight: 600,
        backgroundColor: "#000000B2",
        border: "1px solid #F6F0D7",
      }}
      style={{borderRadius :'0px!important'}}
      onClick={() => handleSaveOrderDetail("bill_print")}
    >
      Bill & Print
    </Button>
    <Button
      variant="outlined"
      sx={{
        color: "#FFFFFF",
        borderColor: "#000",
        textTransform: "none",
        minHeight: 52,
        fontWeight: 600,
        fontSize: 13,
        backgroundColor: "#000000B2",
        border: "1px solid #F6F0D7",
      }}
      onClick={ handleKotBillPaymentFlow}
    >
      KOT, Bill & Payment
    </Button>
    <Button
      variant="contained"
      sx={{
        bgcolor: "#2295F3",
        textTransform: "none",
        minHeight: 52,
        fontWeight: 600,
        fontSize: 14,
      }}
      disabled={isOrderPaid}
      startIcon={<ShoppingCartCheckoutIcon />}
    onClick={async () => {
  if (!hasCartItems && !hasExistingKotItems) {
    Swal.fire({
      icon: "warning",
      title: "No items in order",
      text: "Please add at least one item before checkout.",
      confirmButtonColor: "#5A7863",
    });
    return;
  }

  let orderData = activeOrder;
  if (!activeOrder?.order_number) {
    const response = await saveNewOrder(token ?? "", "bill");
    if (!response?.order) return;
    orderData = response.order;
  }

  const refreshedOrders = await fetchOrders({
    page: 1,
    per_page: 20,
  });

  const updatedOrder = refreshedOrders?.find(
    (o: any) => o.id === orderData.id
  );

  setCheckoutOrder(updatedOrder || orderData);
  setCheckoutOpen(true);
}}
    >
      Bill & Payment
    </Button>

  </Box>
</Box>
<CheckoutModal
  open={checkoutOpen}
  onClose={() => setCheckoutOpen(false)}
  orderNumber={checkoutOrder?.order_number}
  totalAmount={Number(checkoutOrder?.total || 0)}
  cart={
    checkoutOrder?.kot?.flatMap((k: any) => k.items) || []
  }
  orderId={checkoutOrder?.id}
onPaymentSuccess={async (paymentData) => {
  try {
    if (!checkoutOrder) return;

    const paidAmount =
      Number(paymentData?.received_amount) ||
      Number(checkoutOrder?.total) ||
      0;

    const updatedOrder = {
      ...checkoutOrder,
      status: "paid",
      payment_status: "paid",
      amount_paid: paidAmount,
      payments: [
        {
          id: Date.now(), // temporary id
          payment_method: paymentData?.payment_method || "cash",
          amount: paidAmount,
        },
      ],
    };

    setCheckoutOpen(false);
    setBilledOrderData(updatedOrder);
    setBillDrawerOpen(true);

    await fetchOrders({ page: 1, per_page: 20 });

  } catch (err) {
    showError("Something went wrong after payment.");
  }
}}
/>

{noteModalOpen && (
  <Box
    sx={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.45)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 6000,
    }}
  >
    <Box
      sx={{
        width: 480,
        height: 48,
        background: "#fff",
        border: "1px solid #000",
        display: "flex",
        alignItems: "center",
        px: 1,
        boxShadow: "0px 4px 20px rgba(0,0,0,0.25)",
      }}
    >
      <input
        autoFocus
        value={noteText}
        onChange={(e) => setNoteText(e.target.value)}
        placeholder={
  noteTarget?.type === "order"
    ? "Add note for entire order"
    : "Special Instructions? (e.g., no onions, extra spicy)"
}
        style={{
          flex: 1,
          height: "100%",
          border: "none",
          outline: "none",
          fontSize: 14,
        }}
      />
      <Box
        onClick={() => saveNote()}
        sx={{
          minWidth: 40,
          height: 36,
          background: "#000",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          px: 2,
          mr: 1,
          fontSize: 13,
          fontWeight: 600,
          borderRadius :'5px',
        }}
      >
       {isEditMode ? "Update" : "✓"}
      </Box>
      {isEditMode && (
        <Box
          onClick={() => {
  if (!noteTarget) return;
  if (noteTarget.type === "item") {
    onUpdateNote(noteTarget.itemId, "");
  }
  if (noteTarget.type === "order") {
    setOrderNote("");
  }
  setNoteText("");
  setIsEditMode(false);
  setNoteModalOpen(false);   // close modal after delete
}}

          sx={{
            width: 36,
            height: 36,
            background: "#E53935",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            mr: 1,
          }}
        >
          🗑
        </Box>
      )}
      <Box
        onClick={() => setNoteModalOpen(false)}
        sx={{
          fontSize: 15,
          fontWeight: 300,
          cursor: "pointer",
          px: 1,
        }}
      >
        ✕
      </Box>
    </Box>
  </Box>
)}

<AddCustomerModal
  open={customerModalOpen}
  onClose={() => setCustomerModalOpen(false)}
  onSave={(info) => {
    setCustomerInfo(info);
    setBilledOrderData((prev: any) => ({
      ...prev,
      customer: info,
    }));
    setCustomerModalOpen(false);
  }}
/>   
      <AddWaiterModal
        open={waiterModalOpen}
        anchorEl={waiterAnchorEl}
        onClose={() => { setWaiterModalOpen(false); setWaiterAnchorEl(null); }}
        onSave={(w: any) => {
          setSelectedWaiter(w);
          setWaiterModalOpen(false);
          setWaiterAnchorEl(null);
        }}
      />
      <Popover
        open={Boolean(deliveryExecAnchorEl)}
        anchorEl={deliveryExecAnchorEl}
        onClose={() => { setDeliveryExecAnchorEl(null); setDeliveryExecQuery(""); setPendingDeliveryExec(null); }}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        PaperProps={{
          sx: {
            width: 280,
            borderRadius: "10px",
            boxShadow: "0px 8px 24px rgba(0,0,0,0.15)",
            overflow: "hidden",
          },
        }}
      >
        <Box sx={{ p: 1.5 }}>
          <Typography sx={{ fontSize: 14, fontWeight: 700, mb: 1, color: "#111" }}>
            Select Delivery Executive
          </Typography>
          <TextField
            fullWidth
            size="small"
            placeholder="Search executive..."
            value={deliveryExecQuery}
            onChange={(e) => setDeliveryExecQuery(e.target.value)}
            autoFocus
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 16, color: "#9E9E9E" }} />
                </InputAdornment>
              ),
            }}
            sx={{
              mb: 0.5,
              "& .MuiOutlinedInput-root": { fontSize: 13, borderRadius: "8px" },
            }}
          />
          <List dense disablePadding sx={{ maxHeight: 220, overflowY: "auto" }}>
            {deliveryExecutives
              .filter((d: any) =>
                d.name?.toLowerCase().includes(deliveryExecQuery.toLowerCase())
              )
              .map((d: any) => {
                const isSelected = pendingDeliveryExec?.id === d.id;
                return (
                  <ListItem
                    key={d.id}
                    onClick={() => setPendingDeliveryExec(d)}
                    sx={{
                      borderRadius: "6px",
                      cursor: "pointer",
                      bgcolor: isSelected ? "#FFF0F0" : "transparent",
                      "&:hover": { bgcolor: isSelected ? "#FFF0F0" : "#F5F5F5" },
                      py: 0.8,
                      flexDirection: "column",
                      alignItems: "flex-start",
                    }}
                  >
                    <Typography
                      sx={{ fontSize: 13, fontWeight: isSelected ? 600 : 500, color: isSelected ? "#FF3D01" : "#111" }}
                    >
                      {d.name}
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: "#6B7280" }}>
                      {d.phone}
                    </Typography>
                    <Typography sx={{ fontSize: 11, color: d.status === "available" ? "#22C55E" : "#F59E0B" }}>
                      ● {d.status}
                    </Typography>
                  </ListItem>
                );
              })}
          </List>
          <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
            <Button
              variant="contained"
              fullWidth
              size="small"
              disabled={!pendingDeliveryExec}
              onClick={() => {
                setSelectedDeliveryExecutive(pendingDeliveryExec);
                setDeliveryExecAnchorEl(null);
                setDeliveryExecQuery("");
                setPendingDeliveryExec(null);
              }}
              sx={{
                bgcolor: "#FF3D01",
                "&:hover": { bgcolor: "#c62a2f" },
                textTransform: "none",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              Save
            </Button>
            <Button
              fullWidth
              size="small"
              onClick={() => { setDeliveryExecAnchorEl(null); setDeliveryExecQuery(""); setPendingDeliveryExec(null); }}
              sx={{ textTransform: "none", fontSize: 13, color: "#555" }}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Popover>
<BillDrawer
  billDrawerOpen={billDrawerOpen}
  setBillDrawerOpen={setBillDrawerOpen}
  billedOrderData={billedOrderData}
  drawerItems={drawerItems}
  drawerCustomer={drawerCustomer}
  orderStatusUI={orderStatusUI}
  drawerNextStatus={drawerNextStatus}
  moveDrawerToNextStep={moveDrawerToNextStep}
  handleDrawerPrint={handleDrawerPrint}
  handleDeleteDrawerItem={handleDeleteDrawerItem}
  PAYMENT_OPTIONS={PAYMENT_OPTIONS}
  token={token}
  setCustomerModalOpen={setCustomerModalOpen}
  setCheckoutOpen={setCheckoutOpen}
  setCheckoutOrder={setCheckoutOrder}
  showError={showError}
   setBilledOrderData={setBilledOrderData}
   saveNewOrder={(t, a) => saveNewOrder(t ?? "", a as any)}
/>

      {tableModalOpen && (
        <AssignTableModal
          open={tableModalOpen}
          onClose={() => setTableModalOpen(false)}
          onSelectTable={(table) => {
            setSelectedTable({
              tableId: table.id,
              tableNo: table.tableNo,
              areaName: table.area,
            });
            setTableModalOpen(false);
          }} />
      )}
    </Box>
  );
}
