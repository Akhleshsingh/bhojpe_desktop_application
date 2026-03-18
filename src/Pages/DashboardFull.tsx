import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

import ItemCard from "../components/ItemCard";
import OrderPanel from "../components/OrderPanel";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import { BASE_URL } from "../utils/api";
import { useOrders } from "../context/OrdersContext";
import { useLocation, useNavigate } from "react-router-dom";
import type { Order } from "../types/order";
import { useWaiters } from "../context/WaitersContext";
import Swal from "sweetalert2";
import { useOrderType } from "../context/OrderTypeContext";
const EMPTY_ILLUSTRATION_PATH =
  "/mnt/data/a7d20b31-7dbc-4061-af69-cfbf1f3187e2.png";
type Item = {
  id: number;
  name: string;
  price: number;
  veg?: boolean;
  category?: string;
};

type DashboardFullProps = {
  savedOrders: Order[];
  onSaveOrder: (order: Omit<Order, "id">) => void;
};

export default function DashboardFull({
  savedOrders,
  onSaveOrder,
}: DashboardFullProps) {
  const location = useLocation();
  const { waiters } = useWaiters();
  const { branchData } = useAuth();
const kotActionRef = useRef<null | ((type?: "kot" | "kot_print") => void)>(null);
const cartSnapshotRef = useRef<any[]>([]);
const draftOrder = location.state?.draftOrder;
 const { mode, tableId ,activeOrder: navOrder} = location.state || {};
const { orders } = useOrders();
const fromTable =
  location.state?.fromTable || false;

const activeOrder = React.useMemo(() => {
  if (navOrder) {
    const full = orders.find(
      (o: any) =>
        o.id === navOrder.id ||
        o.order_number === navOrder.order_number
    );

    return full || navOrder;
  }

  if (tableId) {
    return (
      orders.find(
        (o: any) =>
          o.table_id === tableId &&
          o.status !== "cancelled"
      ) || null
    );
  }

  return null;
}, [orders, tableId, navOrder]);



  const tableData = location.state;
const [selectedTable, setSelectedTable] = useState<{
  tableId: number | null;
  tableNo?: string;
  areaName?: string;
}>(() => ({
  tableId: location.state?.tableId ?? null,
  tableNo: location.state?.tableNo,
  areaName: location.state?.areaName,
}));

  const menus = branchData?.data?.menus || [];
  const allCategories = branchData?.data?.item_categories || [];
  const orderTypes =
    branchData?.data?.order_types?.filter((o: any) => o.is_active === 1) ?? [];

  const [query, setQuery] = useState("");
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedMenuId, setSelectedMenuId] = useState<number | null>(null);
 const [menuItems, setMenuItems] = useState<any[]>(
  () =>
    JSON.parse(localStorage.getItem("menuItems") || "[]")
);
  const [cart, setCart] = useState<any[]>([]);
  const [vegFilter, setVegFilter] = useState<"all" | "veg" | "nonveg" | "egg">("all");
  const { orderType, setOrderType } = useOrderType();
const [variationOpen, setVariationOpen] = useState(false);
const [selectedItem, setSelectedItem] = useState<any>(null);
const [selectedVariation, setSelectedVariation] = useState<any>(null);


  const tableNo = tableData?.tableNo;
  const areaName =
    branchData?.data?.area
      ?.flatMap((a: any) =>
        a.tables.map((t: any) => ({ ...t, area: a.area_name }))
      )
      ?.find((t: any) => t.id === tableId)?.area;
  const navigate = useNavigate();

 
useEffect(() => {
  const token = localStorage.getItem("token");
  const cached = localStorage.getItem("menuItems");

  if (!token) return;

  fetch(`${BASE_URL}/menu-items`, {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.status) {
        const enrichedItems = data.data.map((item: any) => {
          const name = item.item_name?.toLowerCase() || "";
          if (
            name.includes("dal") ||
            name.includes("khichdi")
          ) {
            return {
              ...item,
              variations: [
                {
                  id: 1,
                  variation: "Half",
                  price: Math.round(item.price * 0.6),
                },
                {
                  id: 2,
                  variation: "Full",
                  price: item.price,
                },
              ],
            };
          }

          // 🫓 Roti / Naan → Plain / Butter
          if (
            name.includes("roti") ||
            name.includes("naan")
          ) {
            return {
              ...item,
              variations: [
                {
                  id: 3,
                  variation: "Plain",
                  price: item.price,
                },
                {
                  id: 4,
                  variation: "Butter",
                  price: item.price + 10,
                },
              ],
            };
          }

          // ❌ No variation
          return {
            ...item,
            variations: [],
          };
        });

        setMenuItems(enrichedItems);

        localStorage.setItem(
          "menuItems",
          JSON.stringify(enrichedItems)
        );
      }
    })
    .catch(() => {
      if (cached) {
        setMenuItems(JSON.parse(cached));
      }
    });
}, []);



 useEffect(() => {
  if (fromTable && orderTypes.length > 0) {
    const dineIn = orderTypes.find(
      (o: any) =>
        o.type === "dine_in" ||
        o.slug === "dine_in"
    );

    if (dineIn) {
      setOrderType({
        id: dineIn.id,
        type: dineIn.type,
      });
    }

    return;
  }
  if (activeOrder?.order_type) {
    setOrderType({
      id: activeOrder.order_type.id,
      type: activeOrder.order_type.type,
    });
    return;
  }
  if (mode === "draft" && location.state?.draftOrder?.orderType) {
    setOrderType(location.state.draftOrder.orderType);
    return;
  }
  if (!orderType && orderTypes.length > 0) {
    setOrderType(orderTypes.find((o: any) => o.is_default) || orderTypes[0]);
  }
}, [
  activeOrder?.order_type?.id,
  mode,
  orderTypes.length,  fromTable,
]);

const handleUpdateNote = (itemId: number, note: string) => {
  setCart((prev) =>
    prev.map((item) =>
      item.id === itemId
        ? { ...item, note }
        : item
    )
  );
  if (activeOrder) {
    activeOrder.kot?.forEach((kot: any) => {
      kot.items.forEach((i: any) => {
        if (i.menu_item_id === itemId) {
          i.note = note;
        }
      });
    });
  }
};


useEffect(() => {
  if (mode !== "view") return;
  if (!activeOrder) return;

  const kots = activeOrder.kot || [];

  const items = kots.flatMap((kot: any) =>
    kot.items?.map((item: any) => ({
      id: item.menu_item_id,
      name: item.menu_item?.item_name,
      qty: item.quantity,
      price: Number(item.menu_item?.price),
      note: item.note || "",
    })) || []
  );

  setCart(items);
}, [mode, activeOrder]);


  const visibleItems = useMemo(() => {
    const q = query.trim().toLowerCase();

    return menuItems.filter((item: any) => {
      const matchesSearch =
        !q ||
        item.item_name?.toLowerCase().includes(q) ||
        String(item.price).includes(q);

      const matchesCategory =
        selectedCategoryId === null ||
        item.item_category_id === selectedCategoryId ||
        item.category_id === selectedCategoryId;

      const matchesMenu =
        selectedMenuId === null ||
        item.menu_id === selectedMenuId;

      const matchesVeg =
        vegFilter === "all" || item.type === vegFilter;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesMenu &&
        matchesVeg
      );
    });
  }, [menuItems, query, selectedCategoryId, selectedMenuId, vegFilter]);
  const addToCart = (item: Item) => {
    setCart((prev) => {
      const found = prev.find((p: any) => p.id === item.id);
      if (found)
        return prev.map((p: any) =>
          p.id === item.id ? { ...p, qty: p.qty + 1 } : p
        );
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const changeQty = (id: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((p: any) =>
          p.id === id ? { ...p, qty: Math.max(0, p.qty + delta) } : p
        )
        .filter((p: any) => p.qty > 0)
    );
  };

  const onRemove = (id: number) => {
    setCart((prev) => prev.filter((p: any) => p.id !== id));
  };

  const subtotal = cart.reduce(
    (s: number, c: any) => s + c.price * c.qty,
    0
  );
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

  setCart([]);
  alert("Draft saved successfully");
};


useEffect(() => {
  if (!draftOrder) return;
  if (draftOrder.cart?.length) {
    setCart(draftOrder.cart);
  }

  if (draftOrder.orderType) {
    setOrderType(draftOrder.orderType);
  }

  if (draftOrder.tableId) {
    setSelectedTable({
      tableId: draftOrder.tableId,
      tableNo: draftOrder.tableNo,
      areaName: draftOrder.areaName,
    });
  }
  navigate("/poss", {
    replace: true,
    state: {
      mode: "new",
      tableId: draftOrder.tableId ?? null,
      tableNo: draftOrder.tableNo,
      areaName: draftOrder.areaName,
    },
  });
}, []);

useEffect(() => {
  cartSnapshotRef.current = cart;
}, [cart]);

  const handleClearCart = () => setCart([]);
  return (
   <Box
  sx={{
    flex: 1,
    minHeight: 0,
    display: "flex",
    flexDirection: "column",
    fontFamily: "'Montserrat', sans-serif",
    overflow: "hidden",
  }}
>
      <Box sx={{ display: "flex", flex: 1, minHeight: 0 }}>
        {/* LEFT CATEGORY SIDEBAR */}
        <Sidebar
          categories={allCategories}
          selectedCategoryId={selectedCategoryId}
          onSelect={(cat) =>
            setSelectedCategoryId(cat === null ? null : cat.id === selectedCategoryId ? null : cat.id)
          }
          menus={menus}
          selectedMenuId={selectedMenuId}
          onMenuSelect={setSelectedMenuId}
          collapsed={leftSidebarCollapsed}
          onToggleCollapse={() => setLeftSidebarCollapsed((v) => !v)}
        />

        {/* MIDDLE: SEARCH + ITEMS */}
        <Box sx={{
          flex: 1,
          p: 2,
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          minWidth: 0,
          overflow: "hidden",
        }}>
          {/* SEARCH + VEG FILTER ROW */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
            <TextField
              size="small"
              placeholder="Search your menu items here"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: "#BDBDBD", fontSize: 18 }} />,
              }}
              sx={{
                flex: 1,
                background: "#fff",
                borderRadius: "6px",
                "& .MuiOutlinedInput-root": {
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: 13,
                },
              }}
            />
            {/* Veg / NonVeg / Egg pill buttons */}
            <Box
              onClick={() => setVegFilter(vegFilter === "veg" ? "all" : "veg")}
              sx={{
                width: 28, height: 28,
                borderRadius: "50%",
                backgroundColor: vegFilter === "veg" ? "#4CAF50" : "#E8F5E9",
                border: "2px solid #4CAF50",
                cursor: "pointer",
                flexShrink: 0,
              }}
            />
            <Box
              onClick={() => setVegFilter(vegFilter === "nonveg" ? "all" : "nonveg")}
              sx={{
                width: 28, height: 28,
                borderRadius: "50%",
                backgroundColor: vegFilter === "nonveg" ? "#F44336" : "#FFEBEE",
                border: "2px solid #F44336",
                cursor: "pointer",
                flexShrink: 0,
              }}
            />
            <Box
              onClick={() => setVegFilter(vegFilter === "egg" ? "all" : ("egg" as any))}
              sx={{
                width: 28, height: 28,
                borderRadius: "50%",
                backgroundColor: vegFilter === "egg" ? "#FFC107" : "#FFFDE7",
                border: "2px solid #FFC107",
                cursor: "pointer",
                flexShrink: 0,
              }}
            />
          </Box>

          {/* ITEM GRID */}
          <Box sx={{ flex: 1, overflowY: "auto" }}>
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "14px" }}>
              {visibleItems.map((apiItem: any) => (
                <Box
                  key={apiItem.id}
                  sx={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: "10px",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.10)",
                    overflow: "hidden",
                    borderBottom: apiItem.type === "nonveg"
                      ? "3px solid #F44336"
                      : apiItem.type === "egg"
                      ? "3px solid #FFC107"
                      : "3px solid #4CAF50",
                  }}
                >
                  <ItemCard
                    item={{
                      id: apiItem.id,
                      name: apiItem.item_name,
                      price: apiItem.price,
                      category: apiItem.category,
                      veg: apiItem.type === "veg",
                      image: apiItem.photo_url,
                      variations: apiItem.variations,
                    }}
                    onAdd={() => {
                      if (apiItem.variations?.length > 0) {
                        setSelectedItem(apiItem);
                        setSelectedVariation(null);
                        setVariationOpen(true);
                      } else {
                        addToCart({
                          id: apiItem.id,
                          name: apiItem.item_name,
                          price: apiItem.price,
                        });
                      }
                    }}
                  />
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        {/* RIGHT: ORDER PANEL */}
  <Box
  sx={{
    width: 730,
    flexShrink: 0,
    display: "flex",
    flexDirection: "column",
    overflowX: "hidden",
    overflowY: "hidden",
    borderLeft: "1px solid #EBEBEB",
  }}
>
          <OrderPanel
            cart={cart}
            onIncrease={(id) => changeQty(id, +1)}
            onDecrease={(id) => changeQty(id, -1)}
            subtotal={subtotal}
            onRemove={onRemove}
            emptyIllustrationPath={EMPTY_ILLUSTRATION_PATH}
             onUpdateNote={handleUpdateNote}
            onSaveOrder={onSaveOrder}
            mode={mode}
            tableId={tableId}
            activeOrder={activeOrder}
            onClearCart={handleClearCart}
            tableNo={tableNo}
            areaName={areaName}
             orderType={orderType} 
            onKotTrigger={(fn) => {
    kotActionRef.current = fn;
  }}  cartSnapshotRef={cartSnapshotRef}  
  setOrderType={setOrderType}
          />
        </Box>
      </Box>
{variationOpen && (
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
        width: 360,
        background: "#FFF",
        borderRadius: "12px",
        p: 3,
      }}
    >
      {/* TITLE */}
      <Typography fontWeight={700} mb={2}>
        Select Variation
      </Typography>
      <Typography mb={2}>
        {selectedItem?.item_name}
      </Typography>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
          mb: 2,
        }}
      >
        {selectedItem?.variations?.map((v: any) => (
          <Box
            key={v.id}
            onClick={() => setSelectedVariation(v)}
            sx={{
              border:
                selectedVariation?.id === v.id
                  ? "2px solid #5A7863"
                  : "1px solid #E5E7EB",
              borderRadius: "8px",
              px: 2,
              py: 1.5,
              display: "flex",
              justifyContent: "space-between",
              cursor: "pointer",
              background:
                selectedVariation?.id === v.id
                  ? "#EBF4DD"
                  : "#FFF",
            }}
          >
            <Typography>{v.variation}</Typography>
            <Typography>₹{v.price}</Typography>
          </Box>
        ))}
      </Box>

      {/* FOOTER */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 1.5,
        }}
      >
        <Button
          variant="outlined"
          onClick={() => setVariationOpen(false)}
        >
          Cancel
        </Button>

        <Button
          variant="contained"
          disabled={!selectedVariation}
          onClick={() => {
            addToCart({
              id: selectedItem.id,
              name: `${selectedItem.item_name} (${selectedVariation.variation})`,
              price: selectedVariation.price,
            });

            setVariationOpen(false);
            setSelectedItem(null);
            setSelectedVariation(null);
          }}
          sx={{ bgcolor: "#5A7863" }}
        >
          Add Item
        </Button>
      </Box>
    </Box>
  </Box>
)}

    </Box>
  );
}
