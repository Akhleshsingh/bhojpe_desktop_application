/**
 * BhojPe POS — Production Point-of-Sale
 * Route  : /poss  (standalone, no DashboardLayout, no ProtectedRoute)
 * APIs   : Same as menudashboard — /menu-items, /saveOrder, /applydiscount
 * Contexts: useAuth (branchData + token), useWaiters, useDeliveryExecutives,
 *           useCustomers, useTables
 */
import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Box, Typography, Dialog, CircularProgress } from "@mui/material";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { useWaiters } from "../context/WaitersContext";
import { useDeliveryExecutives } from "../context/DeliveryExecutive";
import { useCustomers } from "../context/CustomerContext";
import { useTables } from "../context/TablesContext";
import { BASE_URL } from "../utils/api";
import SecondHeader from "../CommonPages/secondheader";
import HamburgerSidebar from "../CommonPages/HamburgerSidebar";
import CheckoutModal from "../components/CheckoutModal";

// ─── Design Tokens ──────────────────────────────────────────────────────────
const C = {
  ac:"#FF3D01", ah:"#dd3400",
  adim:"rgba(255,61,1,0.07)", amid:"rgba(255,61,1,0.13)", abdr:"rgba(255,61,1,0.25)",
  bg:"#f8f5f1", w:"#fff", s1:"#fdfaf7", s2:"#f2ece5", s3:"#e8e0d8",
  bd:"#e4dbd0", bd2:"#cec4b8",
  grn:"#186b35", gdim:"rgba(24,107,53,0.08)", gbdr:"rgba(24,107,53,0.22)",
  red:"#b81c1c", rdim:"rgba(184,28,28,0.08)", rbdr:"rgba(184,28,28,0.22)",
  yel:"#7a5a00", ydim:"rgba(122,90,0,0.08)", ybdr:"rgba(122,90,0,0.22)",
  blu:"#1a4fcc", bdim:"rgba(26,79,204,0.08)", bbdr:"rgba(26,79,204,0.22)",
  tx:"#24201c", t2:"#68594a", t3:"#a4927e",
  dk:"#24201c", dk2:"#2e2a26", dk3:"#3a342e", dk4:"#2a2420",
} as const;
const FONT   = "'Plus Jakarta Sans', sans-serif";
const SERIF  = "'Playfair Display', serif";

// ─── Meal-Time Groups (for sidebar "Menu" tab) ────────────────────────────
const MEAL_TIMES = [
  { key:"Breakfast", icon:"🌅", cats:["South Indian","Roti","Lassi","Soda","Beverages"] },
  { key:"Lunch",     icon:"☀️", cats:["Thali","Biryani","Punjabi","Roti","Noodles","Rice"] },
  { key:"Dinner",    icon:"🌙", cats:["Pizza","Burger","Biryani","Punjabi","Thali","Noodles","Roti"] },
  { key:"Drinks",    icon:"🥤", cats:["Soda","Lassi","Ice-cream","Sweets","Beverages","Juices"] },
];

// ─── Types ────────────────────────────────────────────────────────────────
interface MenuItem {
  id: number;
  item_name: string;
  price: number;
  item_category_id: number;
  menu_id?: number;
  is_veg: number;
  description?: string;
  image?: string;
  variations?: { id: number; variation: string; price: number }[];
  [key: string]: any;
}
interface CartItem  { item: MenuItem; qty: number; note: string; variationId?: number; variationName?: string; price: number; }
interface Customer  { id: number; name: string; phone: string; email?: string; delivery_address?: string; [k:string]:any; }
interface Staff     { id: number; name: string; [k:string]:any; }
interface PosTable  { id: number; table_no: string; capacity: number; area_name: string; status?: string; is_available?: number; [k:string]:any; }
interface OrderType { id: number; type: string; slug?: string; name?: string; is_active?: number; }

// ─── Helpers ─────────────────────────────────────────────────────────────
const foodType = (item: MenuItem): "veg"|"nonveg" => item.is_veg === 1 ? "veg" : "nonveg";
const foodColor = (t: "veg"|"nonveg") => t === "veg" ? C.grn : C.red;
const foodIcon  = (t: "veg"|"nonveg") => t === "veg" ? "●" : "●";

const NoteIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

const ForkKnifeIcon = () => (
  <svg width="52" height="52" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 8 L20 28 Q20 36 28 36 L28 56" stroke="#888" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M13 8 L13 24 Q13 28 16.5 28" stroke="#888" strokeWidth="2.8" strokeLinecap="round"/>
    <path d="M27 8 L27 24 Q27 28 23.5 28" stroke="#888" strokeWidth="2.8" strokeLinecap="round"/>
    <path d="M44 8 L44 24 Q44 32 40 36 L40 56" stroke="#888" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M44 24 Q48 20 48 8" stroke="#888" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const VDot = ({ type }: { type: "veg"|"nonveg" }) => (
  <Box sx={{
    position:"absolute", top:6, left:6, width:14, height:14, borderRadius:"3px",
    border:`1.5px solid ${foodColor(type)}`, background:C.w,
    display:"flex", alignItems:"center", justifyContent:"center",
    zIndex:1,
  }}>
    <Box sx={{ width:5, height:5, borderRadius:"50%", background:foodColor(type) }} />
  </Box>
);

const foodEmoji = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes("pizza")) return "🍕";
  if (n.includes("burger")) return "🍔";
  if (n.includes("biryani")) return "🍚";
  if (n.includes("noodle") || n.includes("chow")) return "🍜";
  if (n.includes("rice")) return "🍛";
  if (n.includes("roti") || n.includes("naan") || n.includes("paratha")) return "🫓";
  if (n.includes("chai") || n.includes("tea")) return "🍵";
  if (n.includes("coffee")) return "☕";
  if (n.includes("lassi")) return "🥛";
  if (n.includes("juice") || n.includes("lemon")) return "🍋";
  if (n.includes("ice cream") || n.includes("icecream")) return "🍦";
  if (n.includes("gulab") || n.includes("jamun") || n.includes("sweet")) return "🍮";
  if (n.includes("rasgulla")) return "🧆";
  if (n.includes("chicken") || n.includes("mutton") || n.includes("fish") || n.includes("prawn")) return "🍗";
  if (n.includes("egg")) return "🥚";
  if (n.includes("paneer")) return "🧀";
  if (n.includes("soup")) return "🍲";
  if (n.includes("salad")) return "🥗";
  return "🍽️";
};

// ─── sx helpers ─────────────────────────────────────────────────────────
const mkMcSx = () => ({ display:"flex",alignItems:"center",gap:"4px",px:"9px",py:"4px",background:C.s1,border:`1.5px solid ${C.bd}`,borderRadius:"8px",fontSize:"11px",color:C.t2,cursor:"pointer",fontWeight:600,fontFamily:FONT,transition:"all .14s","&:hover":{borderColor:C.bd2,background:C.s2} } as const);
const mkPmSx = (active:boolean) => ({ display:"flex",alignItems:"center",justifyContent:"center",gap:"3px",px:"10px",py:"7px",background:active?"rgba(255,61,1,.22)":C.dk3,border:`1.5px solid ${active?"rgba(255,61,1,.5)":"rgba(255,255,255,.09)"}`,borderRadius:"8px",fontSize:"11px",fontWeight:700,cursor:"pointer",color:active?"#FF3D01":"rgba(255,255,255,.6)",fontFamily:FONT,transition:"all .14s",whiteSpace:"nowrap" as const,flexShrink:0,"&:hover":{background:active?"rgba(255,61,1,.3)":"#453d36",color:active?"#FF3D01":"#fff"} } as const);

// ─── Main Component ───────────────────────────────────────────────────────
export default function Poss() {
  // ── Contexts ──
  const { token, branchData } = useAuth();
  const { waiters }           = useWaiters();
  const { deliveryExecutives } = useDeliveryExecutives();
  const { customers, searchCustomers, saveCustomer } = useCustomers();
  const { tables: flatTables, fetchTables } = useTables();

  // ── Branch-derived data ──
  const branchId      = branchData?.data?.id;
  const categories    = useMemo(() => branchData?.data?.item_categories ?? [], [branchData]);
  const menus         = useMemo(() => branchData?.data?.menus ?? [], [branchData]);
  const orderTypes    = useMemo(() => (branchData?.data?.order_types ?? []).filter((o: OrderType) => o.is_active !== 0), [branchData]);
  const areas         = useMemo<{area_name:string;tables:PosTable[]}[]>(() => branchData?.data?.area ?? [], [branchData]);

  // Map channel slug → order_type record
  const otMap = useMemo(() => {
    const find = (slug: string) => orderTypes.find((o:OrderType) => (o.slug??o.type)===slug || o.type===slug);
    return { dine: find("dine_in"), pickup: find("pickup"), delivery: find("delivery") };
  }, [orderTypes]);

  // ── Menu Items ──
  const [menuItems, setMenuItems]       = useState<MenuItem[]>(() => {
    try { return JSON.parse(localStorage.getItem("menuItems") || "[]"); } catch { return []; }
  });
  const [menuLoading, setMenuLoading]   = useState(true);

  useEffect(() => {
    if (!token) { setMenuLoading(false); return; }
    fetch(`${BASE_URL}/menu-items`, { headers: { Authorization:`Bearer ${token}` } })
      .then(r => r.json())
      .then(d => {
        if (d.status && d.data?.length) {
          setMenuItems(d.data);
          localStorage.setItem("menuItems", JSON.stringify(d.data));
        }
      })
      .catch(() => { /* use cached */ })
      .finally(() => setMenuLoading(false));
  }, [token]);

  // ── Body overflow hidden for POS ──
  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; document.documentElement.style.overflow = ""; };
  }, []);

  // ── Sidebar ──
  const [sideMode, setSideMode]             = useState<"cat"|"menu">("cat");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number|null>(null);
  const [selectedMenuId, setSelectedMenuId] = useState<number|null>(null);
  const [activeMealTime, setActiveMealTime] = useState<string|null>(null);

  // ── Search / Filter ──
  const [srchQ, setSrchQ]   = useState("");
  const [vegFilter, setVegFilter] = useState<"all"|"veg"|"nonveg">("all");

  // ── Cart ──
  const [cart, setCart] = useState<CartItem[]>([]);
  const cartCount  = useMemo(() => cart.reduce((s,i)=>s+i.qty,0), [cart]);
  const subtotal   = useMemo(() => cart.reduce((s,i)=>s+i.price*i.qty,0), [cart]);
  const tax        = useMemo(() => Math.round(subtotal * 0.05), [subtotal]);

  // ── Order state ──
  const [pax, setPax]           = useState(1);
  const [orderNo, setOrderNo]   = useState(1);
  const [channel, setChannel]   = useState<"dine"|"pickup"|"delivery">("dine");
  const [payMode, setPayMode]   = useState("Cash");
  const [selectedWaiter, setSelectedWaiter]     = useState<Staff|null>(null);
  const [selectedDelExec, setSelectedDelExec]   = useState<Staff|null>(null);
  const [assignedTable, setAssignedTable]       = useState<PosTable|null>(null);
  const [channelNotes, setChannelNotes] = useState({dine:"",pickup:"",delivery:""});
  const [custByChannel, setCustByChannel] = useState<{dine:Customer|null;pickup:Customer|null;delivery:Customer|null}>({dine:null,pickup:null,delivery:null});
  const [platform, setPlatform] = useState("bhojpe");
  const [pickupDate, setPickupDate] = useState("Today");
  const [pickupTime, setPickupTime] = useState("Now");
  const [pickupDateTime, setPickupDateTime] = useState<Date>(new Date());

  // ── Summary Drawer ──
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [discAmt, setDiscAmt]         = useState(0);
  const [discLabel, setDiscLabel]     = useState("");
  const [discType, setDiscType]       = useState<"percent"|"fixed">("percent");
  const [delCharge, setDelCharge]     = useState(40);
  const [delKm, setDelKm]             = useState(0);

  const total = subtotal + tax + (channel==="delivery" ? delCharge : 0) - discAmt;

  // ── Popup state ──
  const [custPopup, setCustPopup]       = useState<"dine"|"pickup"|"delivery"|null>(null);
  const [custTab, setCustTab]           = useState<"recent"|"new">("recent");
  const [custSearch, setCustSearch]     = useState("");
  const [custResults, setCustResults]   = useState<Customer[]>([]);
  const [custSearching, setCustSearching] = useState(false);
  const [newCust, setNewCust]           = useState({ name:"",phone:"",addr:"",email:"" });
  const [savingCust, setSavingCust]     = useState(false);

  const [discPopup, setDiscPopup]       = useState(false);
  const [discInput, setDiscInput]       = useState("");
  const [discPopType, setDiscPopType]   = useState<"percent"|"fixed"|"coupon">("percent");
  const [discReason, setDiscReason]     = useState("");
  const [couponCode, setCouponCode]     = useState("");
  const discPreview = useMemo(() => {
    const v = parseFloat(discInput)||0;
    if (!v || discPopType==="coupon") return 0;
    return discPopType==="percent" ? Math.round(subtotal*v/100) : Math.min(v,subtotal);
  }, [discInput, discPopType, subtotal]);

  const [notePopup, setNotePopup]       = useState<{type:"item"|"channel";key:number|string}|null>(null);
  const [noteText, setNoteText]         = useState("");
  const noteRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => { if (notePopup) setTimeout(()=>noteRef.current?.focus(), 80); }, [notePopup]);

  const handleSaveNote = useCallback(() => {
    const txt = noteText.trim();
    if (!notePopup) return;
    if (notePopup.type==="item") {
      setCart(prev => { const next=[...prev]; if(next[notePopup.key as number]) next[notePopup.key as number]={...next[notePopup.key as number],note:txt}; return next; });
    } else {
      setChannelNotes(p => ({...p,[notePopup.key]:txt}));
    }
    setNotePopup(null);
    toast.success(txt?"Note saved ✓":"Note removed");
  }, [notePopup, noteText, setCart]);

  const [kotPopup, setKotPopup]         = useState(false);
  const [kotToken, setKotToken]         = useState("T-001");

  const [pickupDatePopup, setPickupDatePopup] = useState(false);
  const [pickupTimePopup, setPickupTimePopup] = useState(false);
  const [dateInput, setDateInput]       = useState("");
  const [timeInput, setTimeInput]       = useState("");

  const [assignTablePopup, setAssignTablePopup] = useState(false);
  const [ebillPopup, setEbillPopup]     = useState(false);
  const [ebillName, setEbillName]       = useState("");
  const [ebillPhone, setEbillPhone]     = useState("");

  const [tablesPage, setTablesPage]     = useState(false);
  const [ordersPage, setOrdersPage]     = useState(false);
  const [ordersFilter, setOrdersFilter] = useState("all");

  const [variationPopup, setVariationPopup] = useState<MenuItem|null>(null);
  const [selVariation, setSelVariation] = useState<number|null>(null);

  const [placing, setPlacing]           = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [checkoutModal, setCheckoutModal] = useState<{open:boolean;orderId:number;orderNo:number;total:number}|null>(null);

  // ── Grid items ──
  const gridItems = useMemo(() => {
    let items = menuItems;
    if (vegFilter === "veg")    items = items.filter(i => i.is_veg === 1);
    if (vegFilter === "nonveg") items = items.filter(i => i.is_veg !== 1);
    if (srchQ)                  items = items.filter(i => i.item_name?.toLowerCase().includes(srchQ.toLowerCase()));
    if (selectedCategoryId !== null) items = items.filter(i => i.item_category_id === selectedCategoryId || i.category_id === selectedCategoryId);
    if (selectedMenuId !== null)     items = items.filter(i => i.menu_id === selectedMenuId);
    if (activeMealTime && sideMode==="menu") {
      const mt = MEAL_TIMES.find(m=>m.key===activeMealTime);
      if (mt) items = items.filter(i => mt.cats.some(c => i.category_name?.toLowerCase().includes(c.toLowerCase()) || i.item_category?.name?.toLowerCase().includes(c.toLowerCase())));
    }
    return items;
  }, [menuItems, vegFilter, srchQ, selectedCategoryId, selectedMenuId, activeMealTime, sideMode]);

  // ── Cart qty lookup map — O(1) per card instead of O(n) scan ──
  const cartQtyMap = useMemo(() => {
    const m: Record<number, number> = {};
    cart.forEach(c => { m[c.item.id] = (m[c.item.id] ?? 0) + c.qty; });
    return m;
  }, [cart]);

  // ── Cart operations ──
  const addItem = useCallback((item: MenuItem, variation?: {id:number;variation:string;price:number}) => {
    if ((item.variations?.length ?? 0) > 0 && !variation) {
      setVariationPopup(item); setSelVariation(null); return;
    }
    const price = variation ? variation.price : item.price;
    const key   = variation ? `${item.id}_${variation.id}` : `${item.id}`;
    setCart(prev => {
      const idx = prev.findIndex(c => (variation ? c.item.id===item.id && c.variationId===variation.id : c.item.id===item.id && !c.variationId));
      if (idx >= 0) {
        const next = [...prev]; next[idx] = { ...next[idx], qty: next[idx].qty+1 }; return next;
      }
      return [...prev, { item, qty:1, note:"", variationId:variation?.id, variationName:variation?.variation, price }];
    });
    toast.success(`${item.item_name}${variation?` (${variation.variation})`:""} added!`, { duration:900, style:{fontSize:12} });
  }, []);

  const changeQty = useCallback((idx:number, d:number) => {
    setCart(prev => {
      const next = [...prev];
      const newQty = next[idx].qty + d;
      if (newQty <= 0) { next.splice(idx,1); return next; }
      next[idx] = { ...next[idx], qty:newQty }; return next;
    });
  }, []);

  const setItemNote = useCallback((idx:number, note:string) => {
    setCart(prev => { const next=[...prev]; next[idx]={...next[idx],note}; return next; });
  }, []);

  const clearCart = useCallback(() => {
    setCart([]); setPax(1); setWaiter(null); setSelectedDelExec(null);
    setAssignedTable(null); setCustByChannel({dine:null,pickup:null,delivery:null});
    setChannelNotes({dine:"",pickup:"",delivery:""}); setDiscAmt(0); setDiscLabel("");
    setPayMode("Cash"); setSummaryOpen(false);
    setOrderNo(n => n+1);
  }, []);

  // alias
  const setWaiter = setSelectedWaiter;

  // ── Customer search ──
  const handleCustSearch = useCallback(async (q: string) => {
    setCustSearch(q);
    if (!q.trim()) { setCustResults(customers as Customer[]); return; }
    setCustSearching(true);
    try {
      const res = await searchCustomers(q);
      setCustResults(res as Customer[]);
    } catch { setCustResults([]); }
    finally { setCustSearching(false); }
  }, [customers, searchCustomers]);

  useEffect(() => {
    if (custPopup) { setCustResults(customers as Customer[]); setCustSearch(""); }
  }, [custPopup, customers]);

  const selectCust = (c: Customer) => {
    setCustByChannel(p=>({...p,[custPopup!]:c}));
    setCustPopup(null);
    toast.success(`${c.name} selected ✓`, { duration:1200 });
  };

  const handleSaveCust = async () => {
    if (!newCust.name.trim()||!newCust.phone.trim()) { toast.error("Naam aur phone required!"); return; }
    setSavingCust(true);
    try {
      const saved = await saveCustomer({ name:newCust.name.trim(), phone:newCust.phone.trim(), email:newCust.email||undefined, delivery_address:newCust.addr||undefined });
      if (saved) {
        setCustByChannel(p=>({...p,[custPopup!]:saved as Customer}));
        setCustPopup(null); setNewCust({name:"",phone:"",addr:"",email:""});
        toast.success(`${saved.name} saved ✓`);
      }
    } catch { toast.error("Customer save failed"); } finally { setSavingCust(false); }
  };

  // ── Discount ──
  const handleApplyDiscount = () => {
    const v = parseFloat(discInput)||0;
    if (discPopType==="coupon") {
      const coupons: Record<string,{type:"percent"|"fixed";value:number}> = { FLAT10:{type:"percent",value:10}, SAVE50:{type:"fixed",value:50}, VIP20:{type:"percent",value:20} };
      const c = coupons[couponCode.toUpperCase()];
      if (!c) { toast.error("Invalid coupon!"); return; }
      const amt = c.type==="percent" ? Math.round(subtotal*c.value/100) : Math.min(c.value,subtotal);
      setDiscAmt(amt); setDiscLabel(`${couponCode.toUpperCase()}: -₹${amt}`); setDiscType("percent");
      setDiscPopup(false); toast.success(`Coupon applied! -₹${amt}`); return;
    }
    if (!v) { toast.error("Discount value enter karo"); return; }
    const amt = discPopType==="percent" ? Math.round(subtotal*v/100) : Math.min(v,subtotal);
    setDiscAmt(amt); setDiscLabel(discPopType==="percent"?`${v}% off`:`₹${v} off`); setDiscType(discPopType);
    setDiscPopup(false); toast.success(`Discount: -₹${amt}`);
  };

  // ── Pickup date/time ──
  const openPickupDate = () => { const d=new Date(); setDateInput(d.toISOString().split("T")[0]); setPickupDatePopup(true); };
  const applyPickupDate = () => {
    if (!dateInput) { toast.error("Date select karein"); return; }
    const d=new Date(dateInput); const t=new Date(); t.setHours(0,0,0,0);
    setPickupDate(d.getTime()===t.getTime()?"Today":d.toLocaleDateString("en-IN",{day:"2-digit",month:"short"}));
    setPickupDateTime(d); setPickupDatePopup(false);
  };
  const openPickupTime = () => { const d=new Date(); setTimeInput(`${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`); setPickupTimePopup(true); };
  const applyPickupTime = () => {
    if (!timeInput) { toast.error("Time select karein"); return; }
    const [h,m]=timeInput.split(":"); const hr=parseInt(h); const ampm=hr>=12?"PM":"AM"; const h12=hr%12||12;
    setPickupTime(`${h12}:${m} ${ampm}`);
    setPickupTimePopup(false);
  };
  const addMinutes = (v:number) => {
    const d=new Date(); d.setMinutes(d.getMinutes()+v);
    setTimeInput(`${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`);
  };

  // ── Place order ──
  const buildPayload = (action: string) => {
    const ot = otMap[channel];
    const cust = custByChannel[channel];
    return {
      action,
      branch_id: branchId,
      table_id: assignedTable?.id ?? null,
      order_type_id: ot?.id ?? null,
      order_type: ot?.slug ?? ot?.type ?? (channel==="dine"?"dine_in":channel),
      items: cart.map(c => ({ menu_item_id:c.item.id, quantity:c.qty, price:c.price, note:c.note||"", modifiers:[] })),
      number_of_pax: pax,
      delivery_executive_id: channel==="delivery" ? (selectedDelExec?.id??null) : null,
      customer_id: cust?.id ?? null,
      pickup_date: channel==="pickup" ? pickupDateTime.toISOString().slice(0,19).replace("T"," ") : null,
      note: channelNotes[channel] || null,
    };
  };

  const placeOrder = async (action: "kot"|"bill"|"kot_print"|"bill_print") => {
    if (!cart.length) { toast.error("Cart empty hai!"); return; }
    if (!token) { toast.error("Login required"); return; }
    setPlacing(true);
    try {
      const payload = buildPayload(action);
      const res = await fetch(`${BASE_URL}/saveOrder`, {
        method:"POST",
        headers:{ Authorization:`Bearer ${token}`, "Content-Type":"application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.status) throw new Error(data.message||"Order failed");
      const orderId = data.data?.order?.id ?? 0;
      // Apply discount if any
      if (discAmt > 0 && orderId) {
        await fetch(`${BASE_URL}/applydiscount`, {
          method:"POST", headers:{ Authorization:`Bearer ${token}`, "Content-Type":"application/json" },
          body: JSON.stringify({ order_id:orderId, discount_type:discType==="percent"?"percent":"fixed", discount_value:discAmt }),
        });
      }
      // increment KOT token
      const n = parseInt(kotToken.replace(/\D/g,""))||0;
      setKotToken(`T-${String(n+1).padStart(3,"0")}`);
      // print KOT if needed
      if (action==="kot_print"||action==="bill_print") {
        const pw = window.open("/#/print","_blank","width=400,height=600");
        if (pw) setTimeout(()=>pw.postMessage({ type:"PRINT_ORDER", payload:{ order:data.data?.order, items:cart, branch:branchData?.data } },"*"), 500);
      }
      await fetchTables();
      // For bill actions → open payment modal
      if (action==="bill" || action==="bill_print") {
        setCheckoutModal({ open:true, orderId, orderNo:orderNo, total });
        // don't clearCart here — clear on payment success
      } else {
        // KOT only — just clear cart and show success
        const ch = {dine:"🍽️ Dine In",pickup:"🥡 Pickup",delivery:"🛵 Delivery"}[channel];
        toast.success(`${ch} KOT placed! ✓`);
        clearCart();
      }
    } catch(e:any) { toast.error(e.message||"Order place karne mein error!"); }
    finally { setPlacing(false); }
  };

  // ── Cust pill helper ──
  const custPill = (ch: "dine"|"pickup"|"delivery") => {
    const c = custByChannel[ch];
    if (!c) return { filled:false, label:"+ Add Customer", initials:"👤" };
    return { filled:true, label:`${c.name.split(" ")[0]} · ${ch==="delivery"&&c.delivery_address?c.delivery_address.slice(0,18)+"…":c.phone}`, initials:c.name.slice(0,2).toUpperCase() };
  };

  const chStripColor = { dine:C.ac, pickup:C.grn, delivery:C.blu }[channel];

  // ─── Loading splash ───────────────────────────────────────────────────────
  if (menuLoading) return (
    <Box sx={{height:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:C.bg,flexDirection:"column",gap:"16px",fontFamily:FONT}}>
      <CircularProgress size={36} sx={{color:C.ac}} />
      <Typography sx={{fontSize:13,fontWeight:600,color:C.t2,fontFamily:FONT}}>POS load ho raha hai…</Typography>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');`}</style>
    </Box>
  );

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <Box sx={{fontFamily:FONT,background:C.bg,color:C.tx,height:"100vh",overflow:"hidden",display:"flex",flexDirection:"column"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}
        @keyframes popIn{from{opacity:0;transform:scale(.93) translateY(10px)}to{opacity:1;transform:scale(1) translateY(0)}}
        @keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
        ::-webkit-scrollbar{width:4px;height:4px}::-webkit-scrollbar-thumb{background:#cec4b8;border-radius:4px}
      `}</style>

      {/* ══ HEADER (existing app header) ════════════════════════════════════ */}
      <Box sx={{flexShrink:0,zIndex:20}}>
        <SecondHeader
          ordersCount={cartCount}
          sidebarOpen={!sidebarCollapsed}
          setSidebarOpen={(v:boolean)=>setSidebarCollapsed(!v)}
          onNewOrder={() => {
            if (!cart.length || window.confirm("Start a new order? Current cart will be cleared.")) {
              setCart([]);
              setDiscAmt(0);
              setDiscLabel("");
              setOrderNo(n => n + 1);
            }
          }}
        />
      </Box>

      {/* ══ POS BODY ════════════════════════════════════════════════════════ */}
      <Box sx={{display:"flex",flex:1,overflow:"hidden",minHeight:0}}>

        {/* ── NAVIGATION SIDEBAR (existing HamburgerSidebar) ────────────── */}
        <HamburgerSidebar
          collapsed={sidebarCollapsed}
          onToggle={()=>setSidebarCollapsed(v=>!v)}
        />

        {/* ── CATEGORY / MENU SIDEBAR ─────────────────────────────────────── */}
        <Box sx={{width:190,minWidth:170,background:C.w,borderRight:`1.5px solid ${C.bd}`,display:"flex",flexDirection:"column",flexShrink:0,overflow:"hidden",boxShadow:"2px 0 8px rgba(0,0,0,.04)"}}>
          {/* Tab toggle */}
          <Box sx={{display:"grid",gridTemplateColumns:"1fr 1fr",borderBottom:`1.5px solid ${C.bd}`,flexShrink:0,background:C.s1}}>
            {(["cat","menu"] as const).map(m=>(
              <Box key={m} component="button" onClick={()=>{setSideMode(m);setSelectedCategoryId(null);setSelectedMenuId(null);setActiveMealTime(null);}}
                sx={{py:"10px",textAlign:"center",fontSize:"10.5px",fontWeight:800,cursor:"pointer",color:sideMode===m?C.ac:C.t3,border:"none",background:sideMode===m?C.w:"transparent",fontFamily:FONT,letterSpacing:".6px",textTransform:"uppercase",transition:"all .15s",borderBottom:`2.5px solid ${sideMode===m?C.ac:"transparent"}`,boxShadow:sideMode===m?"0 1px 0 #fff inset":"none"}}>
                {m==="cat"?"Category":"Menu"}
              </Box>
            ))}
          </Box>
          {/* List */}
          <Box sx={{flex:1,overflowY:"auto",py:"6px",px:"8px"}}>
            {sideMode==="cat" ? (
              <>
                {[
                  { id:null as number|null, label:"All Items", cnt:menuItems.length },
                  ...categories.map((c:any)=>({
                    id: c.id as number,
                    label: (typeof c.category_name==="object" ? c.category_name?.en : c.category_name) ?? c.name ?? "Unknown",
                    cnt: menuItems.filter((mi:MenuItem)=>mi.item_category_id===c.id||mi.category_id===c.id).length,
                  }))
                ].map(cat=>{
                  const active = selectedCategoryId===cat.id;
                  return (
                    <Box key={cat.id??0} onClick={()=>setSelectedCategoryId(cat.id)}
                      sx={{display:"flex",alignItems:"center",justifyContent:"space-between",px:"10px",py:"9px",borderRadius:"10px",mb:"2px",cursor:"pointer",color:active?C.ac:C.t2,fontWeight:active?700:500,border:`1.5px solid ${active?C.abdr:"transparent"}`,background:active?C.adim:"transparent",transition:"all .13s","&:hover":{background:active?C.adim:C.s2,color:active?C.ac:C.tx}}}>
                      <Typography sx={{fontSize:"12px",fontWeight:"inherit",color:"inherit",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:120,fontFamily:FONT}}>{cat.label}</Typography>
                      <Box component="span" sx={{fontSize:"10px",fontWeight:700,minWidth:20,textAlign:"center",px:"5px",py:"1.5px",borderRadius:"8px",background:active?C.amid:C.s2,color:active?C.ac:C.t3,flexShrink:0,ml:"4px"}}>{cat.cnt}</Box>
                    </Box>
                  );
                })}
              </>
            ) : (
              <>
                {(menus.length > 0 ? menus : MEAL_TIMES.map(mt=>({id:mt.key,menu_name:{en:`${mt.icon} ${mt.key}`}}))).map((menu:any)=>{
                  const label = (typeof menu.menu_name==="object" ? menu.menu_name?.en : menu.menu_name) ?? menu.name ?? "Menu";
                  const isActive = typeof menu.id==="number" ? selectedMenuId===menu.id : activeMealTime===menu.id;
                  const cnt = typeof menu.id==="number" ? menuItems.filter((mi:MenuItem)=>mi.menu_id===menu.id).length : (MEAL_TIMES.find(mt=>mt.key===menu.id)?.cats.length??0);
                  return (
                    <Box key={menu.id} onClick={()=>{ if(typeof menu.id==="number"){setSelectedMenuId(isActive?null:menu.id);setActiveMealTime(null);}else{setActiveMealTime(isActive?null:menu.id);setSelectedMenuId(null);}}}
                      sx={{display:"flex",alignItems:"center",justifyContent:"space-between",px:"10px",py:"9px",borderRadius:"10px",mb:"2px",cursor:"pointer",border:`1.5px solid ${isActive?C.abdr:"transparent"}`,background:isActive?C.adim:"transparent",color:isActive?C.ac:C.t2,transition:"all .13s","&:hover":{background:isActive?C.adim:C.s2}}}>
                      <Typography sx={{fontSize:"12px",fontWeight:isActive?700:500,color:"inherit",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:120,fontFamily:FONT}}>{label}</Typography>
                      <Box component="span" sx={{fontSize:"10px",fontWeight:700,minWidth:20,textAlign:"center",px:"5px",py:"1.5px",borderRadius:"8px",background:isActive?C.amid:C.s2,color:isActive?C.ac:C.t3,flexShrink:0,ml:"4px"}}>{cnt}</Box>
                    </Box>
                  );
                })}
              </>
            )}
          </Box>
        </Box>

        {/* ── CENTER (Search + Grid) ─────────────────────────────────────── */}
        <Box sx={{display:"flex",flexDirection:"column",flex:1,overflow:"hidden",minWidth:0}}>
          {/* Top bar */}
          <Box sx={{display:"flex",alignItems:"center",gap:"10px",px:"14px",py:"8px",background:C.w,borderBottom:`1.5px solid ${C.bd}`,flexShrink:0}}>
            <Box sx={{position:"relative",flex:1}}>
              <Box component="span" sx={{position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",color:C.t3,fontSize:15,pointerEvents:"none",lineHeight:1}}>🔍</Box>
              <Box component="input" value={srchQ} onChange={(e:any)=>setSrchQ(e.target.value)} placeholder="Search menu items…"
                sx={{width:"100%",background:C.s1,border:`1.5px solid ${C.bd}`,borderRadius:"10px",py:"8px",pl:"34px",pr:"12px",color:C.tx,fontFamily:FONT,fontSize:"13px",outline:"none",transition:"all .2s","&:focus":{borderColor:C.ac,background:C.w,boxShadow:`0 0 0 3px ${C.adim}`},"&::placeholder":{color:C.t3}}} />
              {srchQ && <Box component="button" onClick={()=>setSrchQ("")} sx={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",width:16,height:16,borderRadius:"50%",background:C.t3,border:"none",cursor:"pointer",fontSize:9,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800}}>✕</Box>}
            </Box>
            <Box sx={{display:"flex",gap:"6px",flexShrink:0}}>
              {(["all","veg","nonveg"] as const).map(f=>{
                const on = vegFilter===f;
                const cfg = {
                  all:    {label:"All",    c:C.tx,   dc:C.s1,   bd:C.bd  },
                  veg:    {label:"🟢 Veg",  c:C.grn,  dc:C.gdim, bd:C.gbdr},
                  nonveg: {label:"🔴 Non-Veg",c:C.red,dc:C.rdim, bd:C.rbdr},
                }[f];
                return (
                  <Box key={f} component="button" onClick={()=>setVegFilter(f)}
                    sx={{px:"12px",py:"6px",borderRadius:"20px",fontSize:"11.5px",fontWeight:700,cursor:"pointer",border:`1.5px solid ${on?cfg.bd:C.bd}`,background:on?cfg.dc:C.s1,color:on?cfg.c:C.t3,fontFamily:FONT,transition:"all .14s",whiteSpace:"nowrap","&:hover":{borderColor:cfg.bd,color:cfg.c,background:cfg.dc}}}>
                    {cfg.label}
                  </Box>
                );
              })}
            </Box>
            <Typography sx={{fontSize:"11px",color:C.t3,flexShrink:0,fontWeight:600}}>{gridItems.length} items</Typography>
          </Box>

          {/* Product Grid — responsive columns, uniform row heights, scrollable */}
          <Box sx={{
            display:"grid",
            gridTemplateColumns:"repeat(auto-fill, minmax(155px, 1fr))",
            gridAutoRows:"180px",
            gap:"10px",
            px:"12px",
            py:"12px",
            overflowY:"auto",
            flex:1,
            minHeight:0,
            alignContent:"start",
          }}>
            {gridItems.length===0 ? (
              <Box sx={{gridColumn:"1/-1",textAlign:"center",py:"60px",display:"flex",flexDirection:"column",alignItems:"center",gap:"10px"}}>
                <Typography sx={{fontSize:40,opacity:.15}}>🍽️</Typography>
                <Typography sx={{fontSize:14,fontWeight:700,color:C.t2}}>{menuLoading ? "Loading items…" : "No items found"}</Typography>
                {srchQ && <Box component="button" onClick={()=>setSrchQ("")} sx={{px:"12px",py:"6px",background:C.adim,border:`1px solid ${C.abdr}`,borderRadius:"8px",fontSize:12,fontWeight:700,color:C.ac,cursor:"pointer",fontFamily:FONT}}>Clear search</Box>}
              </Box>
            ) : gridItems.map((item: MenuItem) => {
              const qty = cartQtyMap[item.id] ?? 0;
              const ft  = foodType(item);
              const hasVariations = (item.variations?.length??0) > 0;
              const imgSrc = item.image
                ? (item.image.startsWith("http") ? item.image : `https://bhojpe.in${item.image}`)
                : null;
              return (
                <Box key={item.id} onClick={()=>addItem(item)}
                  sx={{
                    background:C.w,
                    border:`1.5px solid ${qty>0?C.ac:C.bd}`,
                    borderRadius:"14px",
                    overflow:"hidden",
                    cursor:"pointer",
                    transition:"border-color .16s ease, box-shadow .16s ease, transform .16s ease",
                    display:"flex",
                    flexDirection:"column",
                    boxShadow:qty>0?"0 0 0 3px rgba(255,61,1,.1), 0 2px 8px rgba(0,0,0,.08)":"0 1px 4px rgba(0,0,0,.05)",
                    position:"relative",
                    contain:"layout style",
                    "&:hover":{
                      transform:"translateY(-2px)",
                      boxShadow:qty>0?"0 0 0 3px rgba(255,61,1,.12), 0 8px 20px rgba(0,0,0,.1)":"0 6px 18px rgba(0,0,0,.09)",
                      borderColor:qty>0?C.ac:C.bd2,
                    },
                  }}>
                  {/* Image area — fixed height for uniform cards */}
                  <Box sx={{width:"100%",height:110,background:`linear-gradient(145deg,${qty>0?"#fff0ea,#fcd8c8":"#fff8f4,#fce8d8"})`,display:"flex",alignItems:"center",justifyContent:"center",position:"relative",overflow:"hidden",flexShrink:0}}>
                    <VDot type={ft} />
                    {imgSrc ? (
                      <Box
                        component="img"
                        src={imgSrc}
                        loading="lazy"
                        alt={item.item_name}
                        onError={(e:any)=>{ e.currentTarget.style.display="none"; (e.currentTarget.nextSibling as HTMLElement)?.style && ((e.currentTarget.nextSibling as HTMLElement).style.display="flex"); }}
                        sx={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}
                      />
                    ) : null}
                    <Box sx={{opacity:.5,display:imgSrc?"none":"flex",alignItems:"center",justifyContent:"center",position:"absolute",inset:0}}>
                      <ForkKnifeIcon />
                    </Box>
                    {qty>0 && (
                      <Box sx={{position:"absolute",top:6,right:6,minWidth:20,height:20,px:"4px",borderRadius:"10px",background:C.ac,color:"#fff",fontSize:"10px",fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 2px 6px rgba(255,61,1,.4)",border:"1.5px solid #fff",zIndex:1}}>
                        {qty}
                      </Box>
                    )}
                    {hasVariations && (
                      <Box sx={{position:"absolute",bottom:5,left:6,fontSize:"8px",fontWeight:800,px:"5px",py:"2px",borderRadius:"5px",background:"rgba(0,0,0,.6)",color:"#fff",letterSpacing:".4px",textTransform:"uppercase",zIndex:1}}>Options</Box>
                    )}
                  </Box>
                  {/* Info — fixed height so all cards are equal */}
                  <Box sx={{px:"10px",pt:"7px",pb:"9px",height:70,display:"flex",flexDirection:"column",flexShrink:0}}>
                    <Typography sx={{fontSize:"12px",fontWeight:700,color:C.tx,lineHeight:1.3,fontFamily:FONT,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden",flex:1}}>{item.item_name}</Typography>
                    <Box sx={{display:"flex",alignItems:"center",justifyContent:"space-between",pt:"5px"}}>
                      <Typography sx={{fontSize:"13px",fontWeight:800,color:C.ac,fontFamily:FONT}}>₹{item.price}</Typography>
                      <Box sx={{width:22,height:22,borderRadius:"6px",background:qty>0?C.ac:C.s2,border:`1.5px solid ${qty>0?C.ac:C.bd}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:800,color:qty>0?"#fff":C.t2,flexShrink:0,transition:"background .14s"}}>
                        {qty>0?"✓":"+"}
                      </Box>
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* ── CART ──────────────────────────────────────────────────────── */}
        <Box sx={{width:550,minWidth:420,background:C.w,borderLeft:`1.5px solid ${C.bd}`,display:"flex",flexDirection:"column",flexShrink:0,boxShadow:"-4px 0 20px rgba(0,0,0,.07)",minHeight:0,overflow:"hidden"}}>
          {/* Channel strip */}
          <Box sx={{height:3,background:chStripColor,transition:"background .2s",flexShrink:0}} />

          {/* Channel tabs */}
          <Box sx={{display:"flex",background:C.s1,borderBottom:`1.5px solid ${C.bd}`,flexShrink:0}}>
            {(["dine","pickup","delivery"] as const).map(ch=>{
              const active=channel===ch;
              const meta={dine:{label:"Dine In",icon:"🍽️",ac:C.ac},pickup:{label:"Pickup",icon:"🥡",ac:C.grn},delivery:{label:"Delivery",icon:"🛵",ac:C.blu}}[ch];
              return (
                <Box key={ch} component="button" onClick={()=>setChannel(ch)}
                  sx={{flex:1,py:"10px",cursor:"pointer",border:"none",background:active?C.w:"transparent",fontFamily:FONT,transition:"all .14s",borderBottom:`3px solid ${active?meta.ac:"transparent"}`,display:"flex",flexDirection:"column",alignItems:"center",gap:"2px","&:hover":{background:active?C.w:C.s2}}}>
                  <Typography sx={{fontSize:"13px",lineHeight:1}}>{meta.icon}</Typography>
                  <Typography sx={{fontSize:"10.5px",fontWeight:800,letterSpacing:".4px",textTransform:"uppercase",fontFamily:FONT,color:active?meta.ac:C.t3}}>{meta.label}</Typography>
                </Box>
              );
            })}
          </Box>

          {/* ── Dine In meta ── */}
          {channel==="dine" && (
            <Box sx={{flexShrink:0,borderBottom:`1px solid ${C.bd}`,background:C.s1}}>
              <Box sx={{display:"flex",alignItems:"center",gap:"6px",flexWrap:"wrap",px:"12px",py:"8px",borderBottom:`1px solid ${C.bd}`}}>
                <Box sx={{...mkMcSx(),fontWeight:800,fontSize:"12px",px:"10px",py:"5px"}}>📋 #{orderNo}</Box>
                <Box sx={{...mkMcSx(),fontSize:"12px",px:"10px",py:"5px"}}>
                  👥&nbsp;Pax&nbsp;
                  <Box sx={{display:"flex",alignItems:"center",gap:"3px",ml:"2px"}}>
                    {([-1,1]).map(d=>(
                      <Box key={d} component="button" onClick={(e:any)=>{e.stopPropagation();setPax(p=>Math.max(1,p+d));}} sx={{width:18,height:18,border:`1px solid ${C.bd2}`,borderRadius:"5px",background:C.w,cursor:"pointer",fontSize:13,color:C.tx,display:"flex",alignItems:"center",justifyContent:"center","&:hover":{background:C.s3,borderColor:C.bd2}}}>{d<0?"−":"+"}</Box>
                    ))}
                    <Typography sx={{fontSize:13,fontWeight:800,minWidth:18,textAlign:"center",color:C.ac}}>{pax}</Typography>
                  </Box>
                </Box>
                <Box component="button" onClick={()=>setAssignTablePopup(true)} sx={{...mkMcSx(),fontSize:"12px",px:"10px",py:"5px",...(assignedTable?{background:C.adim,borderColor:C.abdr,color:C.ac,fontWeight:800}:{})}}>
                  🪑 {assignedTable ? assignedTable.table_no : "Assign Table"}
                </Box>
                <Box component="button" onClick={()=>setKotPopup(true)} sx={{...mkMcSx(),fontSize:"12px",px:"10px",py:"5px"}}>🔖 KOT</Box>
                <Box component="button" onClick={()=>{setNotePopup({type:"channel",key:"dine"});setNoteText(channelNotes.dine);}} sx={{...mkMcSx(),fontSize:"12px",px:"10px",py:"5px",...(channelNotes.dine?{background:C.adim,borderColor:C.abdr,color:C.ac,fontWeight:700}:{})}}><NoteIcon />&nbsp;Note</Box>
              </Box>
              <Box sx={{display:"flex",alignItems:"center",gap:"8px",px:"12px",py:"8px"}}>
                <CustPillBtn pill={custPill("dine")} onClick={()=>{setCustPopup("dine");setCustTab("recent");}} />
                <Box component="select" value={selectedWaiter?.id??""} onChange={(e:any)=>{const w=waiters.find((x:Staff)=>x.id===Number(e.target.value));setWaiter(w??null);}} sx={{flex:"0 0 160px",px:"10px",py:"7px",background:selectedWaiter?C.gdim:C.w,border:`1.5px solid ${selectedWaiter?C.gbdr:C.bd}`,borderRadius:"9px",fontFamily:FONT,fontSize:"12px",fontWeight:600,color:selectedWaiter?C.grn:C.t2,outline:"none",cursor:"pointer",appearance:"none"}}>
                  <option value="">🙋 Select Waiter</option>
                  {(waiters as Staff[]).map(w=><option key={w.id} value={w.id}>{w.name}</option>)}
                </Box>
              </Box>
            </Box>
          )}

          {/* ── Pickup meta ── */}
          {channel==="pickup" && (
            <Box sx={{flexShrink:0,borderBottom:`1px solid ${C.bd}`,background:C.s1}}>
              <Box sx={{display:"flex",alignItems:"center",gap:"6px",flexWrap:"wrap",px:"12px",py:"8px",borderBottom:`1px solid ${C.bd}`}}>
                <Box sx={{...mkMcSx(),fontWeight:800,fontSize:"12px",px:"10px",py:"5px"}}>📋 #{orderNo}</Box>
                <Box sx={{display:"flex",alignItems:"center",gap:"4px",px:"10px",py:"5px",background:"#fff7ed",border:"1.5px solid #fdba74",borderRadius:"8px",fontSize:"12px",fontWeight:800,color:"#c2410c",whiteSpace:"nowrap"}}>🔖 P-{String(orderNo).padStart(3,"0")}</Box>
                <Box component="button" onClick={openPickupDate} sx={{...mkMcSx(),background:C.adim,borderColor:C.abdr,color:C.ac,fontWeight:700,fontSize:"12px",px:"10px",py:"5px"}}>📅 {pickupDate}</Box>
                <Box component="button" onClick={openPickupTime} sx={{...mkMcSx(),background:C.adim,borderColor:C.abdr,color:C.ac,fontWeight:700,fontSize:"12px",px:"10px",py:"5px"}}>🕐 {pickupTime}</Box>
                <Box component="button" onClick={()=>{setNotePopup({type:"channel",key:"pickup"});setNoteText(channelNotes.pickup);}} sx={{...mkMcSx(),fontSize:"12px",px:"10px",py:"5px",...(channelNotes.pickup?{background:C.adim,borderColor:C.abdr,color:C.ac,fontWeight:700}:{})}}><NoteIcon />&nbsp;Note</Box>
              </Box>
              <Box sx={{display:"flex",alignItems:"center",gap:"8px",px:"12px",py:"8px"}}>
                <CustPillBtn pill={custPill("pickup")} onClick={()=>{setCustPopup("pickup");setCustTab("recent");}} />
                <Box component="select" value={selectedWaiter?.id??""} onChange={(e:any)=>{const w=waiters.find((x:Staff)=>x.id===Number(e.target.value));setWaiter(w??null);}} sx={{flex:"0 0 160px",px:"10px",py:"7px",background:selectedWaiter?C.gdim:C.w,border:`1.5px solid ${selectedWaiter?C.gbdr:C.bd}`,borderRadius:"9px",fontFamily:FONT,fontSize:"12px",fontWeight:600,color:selectedWaiter?C.grn:C.t2,outline:"none",cursor:"pointer",appearance:"none"}}>
                  <option value="">🙋 Select Waiter</option>
                  {(waiters as Staff[]).map(w=><option key={w.id} value={w.id}>{w.name}</option>)}
                </Box>
              </Box>
            </Box>
          )}

          {/* ── Delivery meta ── */}
          {channel==="delivery" && (
            <Box sx={{flexShrink:0,borderBottom:`1px solid ${C.bd}`,background:C.s1}}>
              <Box sx={{display:"flex",alignItems:"center",gap:"6px",px:"12px",py:"8px",borderBottom:`1px solid ${C.bd}`,flexWrap:"wrap"}}>
                <Box sx={{...mkMcSx(),fontWeight:800,fontSize:"12px",px:"10px",py:"5px"}}>📋 #{orderNo}</Box>
                <Box component="select" value={platform} onChange={(e:any)=>setPlatform(e.target.value)}
                  sx={{flex:1,minWidth:140,px:"10px",py:"5px",background:C.adim,border:`1.5px solid ${C.abdr}`,borderRadius:"8px",fontFamily:FONT,fontSize:"12px",fontWeight:700,color:C.ac,outline:"none",cursor:"pointer",appearance:"none"}}>
                  <option value="bhojpe">🔴 Bhojpe App</option>
                  <option value="zomato">🔴 Zomato</option>
                  <option value="swiggy">🟠 Swiggy</option>
                  <option value="manual">📞 Direct Call</option>
                  <option value="website">🌐 Website</option>
                </Box>
                <Box component="button" onClick={()=>{setNotePopup({type:"channel",key:"delivery"});setNoteText(channelNotes.delivery);}} sx={{...mkMcSx(),fontSize:"12px",px:"10px",py:"5px",...(channelNotes.delivery?{background:C.adim,borderColor:C.abdr,color:C.ac,fontWeight:700}:{})}}><NoteIcon />&nbsp;Note</Box>
              </Box>
              <Box sx={{display:"flex",alignItems:"center",gap:"8px",px:"12px",py:"8px"}}>
                <CustPillBtn pill={custPill("delivery")} onClick={()=>{setCustPopup("delivery");setCustTab("recent");}} />
                <Box component="select" value={selectedDelExec?.id??""} onChange={(e:any)=>{const d=deliveryExecutives.find((x:Staff)=>x.id===Number(e.target.value));setSelectedDelExec(d??null);}} sx={{flex:"0 0 160px",px:"10px",py:"7px",background:selectedDelExec?C.gdim:C.w,border:`1.5px solid ${selectedDelExec?C.gbdr:C.bd}`,borderRadius:"9px",fontFamily:FONT,fontSize:"12px",fontWeight:600,color:selectedDelExec?C.grn:C.t2,outline:"none",cursor:"pointer",appearance:"none"}}>
                  <option value="">🛵 Select Delivery Boy</option>
                  {(deliveryExecutives as Staff[]).map(d=><option key={d.id} value={d.id}>{d.name}</option>)}
                </Box>
              </Box>
            </Box>
          )}

          {/* Cart items */}
          <Box sx={{flex:1,overflowY:"auto",px:"12px",py:"4px",minHeight:0}}>
            {cart.length===0 ? (
              <Box sx={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",gap:"12px"}}>
                <Typography sx={{fontSize:48,opacity:.12,lineHeight:1}}>🛒</Typography>
                <Typography sx={{fontSize:15,fontWeight:700,color:C.t2}}>Cart is empty</Typography>
                <Typography sx={{fontSize:12,color:C.t3}}>Click menu items to add them here</Typography>
              </Box>
            ) : cart.map((ci, idx) => {
              const hasNote = !!ci.note?.trim();
              const ft = foodType(ci.item);
              return (
                <Box key={`${ci.item.id}_${ci.variationId??0}_${idx}`}
                  sx={{py:"10px",borderBottom:`1px solid ${C.bd}`,animation:"fadeUp .15s ease","&:last-child":{borderBottom:"none"}}}>
                  {/* Row 1: name + total */}
                  <Box sx={{display:"flex",alignItems:"flex-start",gap:"8px",mb:"8px"}}>
                    {/* Veg dot */}
                    <Box sx={{width:12,height:12,borderRadius:"3px",border:`1.5px solid ${foodColor(ft)}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,mt:"3px"}}>
                      <Box sx={{width:5,height:5,borderRadius:"50%",background:foodColor(ft)}} />
                    </Box>
                    <Box sx={{flex:1,minWidth:0}}>
                      <Typography sx={{fontSize:"13px",fontWeight:700,color:C.tx,lineHeight:1.35,mb:"2px",fontFamily:FONT}}>
                        {ci.item.item_name}
                        {ci.variationName && <Box component="span" sx={{fontWeight:500,color:C.t3,fontSize:"11.5px"}}> ({ci.variationName})</Box>}
                      </Typography>
                      <Typography sx={{fontSize:"11px",color:C.t3,fontFamily:FONT}}>₹{ci.price} × {ci.qty}</Typography>
                    </Box>
                    <Typography sx={{fontSize:"14px",fontWeight:800,color:C.ac,flexShrink:0,fontFamily:FONT}}>₹{ci.price*ci.qty}</Typography>
                  </Box>
                  {/* Row 2: qty stepper + note + delete */}
                  <Box sx={{display:"flex",alignItems:"center",gap:"8px",pl:"20px"}}>
                    {/* Qty stepper */}
                    <Box sx={{display:"flex",alignItems:"center",background:C.s1,border:`1.5px solid ${C.bd}`,borderRadius:"8px",overflow:"hidden",flexShrink:0}}>
                      <Box component="button" onClick={()=>changeQty(idx,-1)} sx={{width:30,height:28,border:"none",background:"none",fontSize:16,fontWeight:700,cursor:"pointer",color:C.tx,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:FONT,transition:"background .12s","&:hover":{background:C.s3}}}>−</Box>
                      <Typography sx={{fontSize:13,fontWeight:800,minWidth:28,textAlign:"center",color:C.tx,borderLeft:`1px solid ${C.bd}`,borderRight:`1px solid ${C.bd}`,height:28,lineHeight:"28px",px:"4px"}}>{ci.qty}</Typography>
                      <Box component="button" onClick={()=>changeQty(idx,1)} sx={{width:30,height:28,border:"none",background:"none",fontSize:16,fontWeight:700,cursor:"pointer",color:C.tx,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:FONT,transition:"background .12s","&:hover":{background:C.s3}}}>+</Box>
                    </Box>
                    {/* Note button */}
                    <Box component="button" onClick={()=>{setNotePopup({type:"item",key:idx});setNoteText(ci.note||"");}}
                      sx={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:"4px",px:"8px",py:"4px",height:28,borderRadius:"7px",cursor:"pointer",fontSize:"11px",fontWeight:hasNote?700:500,color:hasNote?C.ac:C.t3,border:`1px ${hasNote?"solid":"dashed"} ${hasNote?"rgba(255,61,1,.4)":C.bd2}`,background:hasNote?"rgba(255,61,1,.08)":"transparent",fontFamily:FONT,transition:"all .13s","&:hover":{color:C.ac,borderColor:"rgba(255,61,1,.4)",background:"rgba(255,61,1,.06)"}}}>
                      <NoteIcon />
                      <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:100}}>
                        {hasNote ? ci.note.slice(0,16)+(ci.note.length>16?"…":"") : "Add note"}
                      </span>
                    </Box>
                    {/* Delete */}
                    <Box component="button" onClick={()=>changeQty(idx,-999)} sx={{width:28,height:28,borderRadius:"7px",flexShrink:0,background:C.rdim,border:`1.5px solid ${C.rbdr}`,color:C.red,cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,transition:"all .13s","&:hover":{background:C.red,color:"#fff",borderColor:C.red}}}>✕</Box>
                  </Box>
                </Box>
              );
            })}
          </Box>

          {/* ── CART FOOTER ── */}
          <Box sx={{borderTop:`1.5px solid rgba(255,255,255,.07)`,flexShrink:0,background:C.dk}}>
            {/* Summary toggle */}
            <Box onClick={()=>setSummaryOpen(o=>!o)} sx={{display:"flex",alignItems:"center",justifyContent:"space-between",px:"11px",py:"9px",cursor:"pointer",background:C.dk2,transition:"background .13s",userSelect:"none",borderBottom:`1px solid rgba(255,255,255,.07)`,"&:hover":{background:"#343028"}}}>
              <Box sx={{display:"flex",alignItems:"center",gap:"8px"}}>
                <Typography sx={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,.45)"}}>Order Total</Typography>
                <Typography sx={{fontFamily:SERIF,fontSize:18,fontWeight:700,color:C.ac}}>₹{total}</Typography>
                <Typography sx={{fontSize:10,color:"rgba(255,255,255,.28)",ml:"2px"}}>({cartCount} item{cartCount!==1?"s":""})</Typography>
              </Box>
              <Box sx={{display:"flex",alignItems:"center",gap:"7px"}}>
                <Box component="button" onClick={(e:React.MouseEvent)=>{e.stopPropagation();setSummaryOpen(true);}} sx={{px:"9px",py:"3px",background:"rgba(255,61,1,.16)",border:"1.5px solid rgba(255,61,1,.35)",borderRadius:"20px",fontSize:"10.5px",fontWeight:700,color:C.ac,cursor:"pointer","&:hover":{background:"rgba(255,61,1,.26)"}}}>View Bill</Box>
                <Typography sx={{fontSize:10,color:"rgba(255,255,255,.25)",transition:"transform .2s",transform:summaryOpen?"rotate(180deg)":"none"}}>▼</Typography>
              </Box>
            </Box>

            {summaryOpen && (
              <Box sx={{background:C.dk2}}>
                <Box sx={{px:"11px",py:"9px",display:"flex",flexDirection:"column",gap:"5px"}}>
                  {[{l:"Subtotal",v:`₹${subtotal}`},{l:"GST (5%)",v:`₹${tax}`},...(channel==="delivery"&&delCharge>0?[{l:"🛵 Delivery",v:`₹${delCharge}`,c:C.blu}]:[]),...(discAmt>0?[{l:`🏷️ Discount (${discLabel})`,v:`-₹${discAmt}`,c:C.grn,rm:true}]:[])].map((r,i)=>(
                    <Box key={i} sx={{display:"flex",alignItems:"center",justifyContent:"space-between",fontSize:12}}>
                      <Typography sx={{color:"rgba(255,255,255,.45)",fontWeight:500,fontSize:12}}>{r.l}</Typography>
                      <Box sx={{display:"flex",alignItems:"center",gap:"6px"}}>
                        <Typography sx={{fontWeight:700,color:(r as any).c??"rgba(255,255,255,.8)",fontSize:12}}>{r.v}</Typography>
                        {(r as any).rm && <Box component="button" onClick={()=>{setDiscAmt(0);setDiscLabel("");}} sx={{px:"6px",py:"2px",background:C.rdim,border:`1px solid ${C.rbdr}`,borderRadius:"5px",fontSize:"9.5px",fontWeight:700,cursor:"pointer",color:C.red,fontFamily:FONT}}>✕</Box>}
                      </Box>
                    </Box>
                  ))}
                </Box>
                {channel==="delivery" && (
                  <Box sx={{display:"flex",gap:"6px",px:"11px",pb:"7px"}}>
                    {[{label:"Charge",prefix:"₹",val:delCharge,set:setDelCharge,color:C.grn,bdr:C.gbdr,bg:C.gdim},{label:"Distance",prefix:"km",val:delKm,set:setDelKm,color:C.blu,bdr:C.bbdr,bg:C.bdim}].map(f=>(
                      <Box key={f.label} sx={{flex:1,display:"flex",flexDirection:"column",gap:"2px"}}>
                        <Typography sx={{fontSize:"9px",fontWeight:800,textTransform:"uppercase",letterSpacing:".4px",color:C.t3}}>{f.label}</Typography>
                        <Box sx={{display:"flex",alignItems:"center",border:`1.5px solid ${f.bdr}`,borderRadius:"7px",background:f.bg,overflow:"hidden"}}>
                          <Typography sx={{px:"6px",fontSize:12,color:f.color,fontWeight:800,borderRight:`1px solid ${f.bdr}`}}>{f.prefix}</Typography>
                          <Box component="input" type="number" value={f.val} min={0} onChange={(e:any)=>f.set(parseFloat(e.target.value)||0)} sx={{flex:1,px:"6px",py:"5px",background:"transparent",border:"none",fontFamily:FONT,fontSize:12,fontWeight:700,color:f.color,outline:"none",width:0}} />
                        </Box>
                      </Box>
                    ))}
                  </Box>
                )}
                <Box sx={{px:"11px",pt:"2px",pb:"9px"}}>
                  <Box component="button" onClick={()=>{setDiscPopup(true);setDiscInput("");setCouponCode("");}}
                    sx={{display:"flex",alignItems:"center",justifyContent:"center",gap:"5px",px:"12px",py:"7px",width:"100%",background:discAmt>0?C.gdim:C.dk2,border:`1.5px ${discAmt>0?"solid":"dashed"} ${discAmt>0?C.gbdr:"rgba(255,255,255,.15)"}`,borderRadius:"8px",fontSize:12,fontWeight:700,color:discAmt>0?C.grn:"rgba(255,255,255,.45)",cursor:"pointer",fontFamily:FONT,transition:"all .13s","&:hover":{borderColor:discAmt>0?C.gbdr:C.ac,color:discAmt>0?C.grn:C.ac}}}>
                    🏷️ {discAmt>0?`Discount: -₹${discAmt}`:"Add Discount / Coupon"}
                  </Box>
                </Box>
              </Box>
            )}

            {/* Payment modes */}
            <Box sx={{px:"12px",py:"8px",borderBottom:`1px solid rgba(255,255,255,.07)`}}>
              <Typography sx={{fontSize:"9.5px",fontWeight:700,color:"rgba(255,255,255,.3)",textTransform:"uppercase",letterSpacing:".6px",mb:"6px"}}>Payment Method</Typography>
              <Box sx={{display:"flex",gap:"5px",flexWrap:"wrap"}}>
                {[{pm:"💵 Cash",lbl:"Cash"},{pm:"📱 UPI",lbl:"UPI"},{pm:"💳 Card",lbl:"Card"},{pm:"📄 Due",lbl:"Due"}].map(({pm,lbl})=>(
                  <Box key={lbl} component="button" onClick={()=>setPayMode(lbl)} sx={{...mkPmSx(payMode===lbl),flex:1,minWidth:70,py:"8px"}}>{pm}</Box>
                ))}
                <Box component="button" onClick={()=>setEbillPopup(true)} sx={{...mkPmSx(false),flex:"0 0 auto",background:"rgba(34,197,94,.15)",borderColor:"rgba(34,197,94,.3)",color:"#4ade80","&:hover":{background:"rgba(34,197,94,.25)",color:"#86efac"}}}>💬 E-Bill</Box>
              </Box>
            </Box>

            {/* Action row — KOT actions */}
            <Box sx={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"4px",px:"12px",py:"8px",borderBottom:`1px solid rgba(255,255,255,.07)`}}>
              {[
                {icon:"⏸️",label:"Hold",   fn:()=>toast("Order held ⏸")},
                {icon:"💾",label:"Draft",   fn:()=>toast("Draft saved 💾")},
                {icon:"🕐",label:"KOT",    fn:()=>placeOrder("kot")},
                {icon:"🖨️",label:"KOT+🖨️",fn:()=>placeOrder("kot_print")},
              ].map(b=>(
                <Box key={b.label} component="button" onClick={b.fn} disabled={placing}
                  sx={{py:"8px",px:"2px",background:C.dk3,border:"1.5px solid rgba(255,255,255,.1)",borderRadius:"9px",fontSize:"11px",fontWeight:700,color:"rgba(255,255,255,.6)",cursor:"pointer",fontFamily:FONT,display:"flex",flexDirection:"column",alignItems:"center",gap:"3px",transition:"all .14s","&:hover":{background:"#4a4038",color:"#fff",borderColor:"rgba(255,255,255,.2)"},"&:disabled":{opacity:.5,cursor:"not-allowed"}}}>
                  <span style={{fontSize:14}}>{b.icon}</span>
                  <span style={{fontSize:"9.5px"}}>{b.label}</span>
                </Box>
              ))}
            </Box>

            {/* Bill row */}
            <Box sx={{display:"grid",gridTemplateColumns:"1fr 1fr 1.6fr"}}>
              {[
                {icon:"🧾",label:"Bill",   fn:()=>placeOrder("bill"),    primary:false},
                {icon:"🖨️",label:"Bill+Print",fn:()=>placeOrder("bill_print"),primary:false},
                {icon:placing?"⏳":(channel==="delivery"?"🛵":channel==="pickup"?"🥡":"✅"),
                 label:channel==="delivery"?"Dispatch & Pay":channel==="pickup"?"Ready & Pay":"Bill & Pay",
                 fn:()=>placeOrder("bill"), primary:true},
              ].map((b,i)=>(
                <Box key={b.label} component="button" onClick={b.fn} disabled={placing}
                  sx={{py:"14px",px:"4px",textAlign:"center",fontSize:b.primary?"12px":"10.5px",fontWeight:800,cursor:"pointer",transition:"all .14s",border:"none",fontFamily:FONT,background:b.primary?C.ac:C.dk4,color:b.primary?"#fff":"rgba(255,255,255,.55)",borderRight:i<2?"1px solid rgba(255,255,255,.07)":"none",borderTop:"1px solid rgba(255,255,255,.07)",display:"flex",flexDirection:"column",alignItems:"center",gap:"3px","&:hover":{background:b.primary?C.ah:"#3a322a",color:b.primary?"#fff":"rgba(255,255,255,.85)"},"&:disabled":{opacity:.65,cursor:"not-allowed"}}}>
                  {placing && b.primary ? <CircularProgress size={14} sx={{color:"#fff",mb:"2px"}} /> : <span style={{fontSize:b.primary?18:14,lineHeight:1}}>{b.icon}</span>}
                  {b.label}
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* ═══════════════════════════════════════════════════════
          VARIATION POPUP
      ══════════════════════════════════════════════════════ */}
      {variationPopup && (
        <Box onClick={(e)=>{if(e.target===e.currentTarget){setVariationPopup(null);}}} sx={{position:"fixed",inset:0,background:"rgba(0,0,0,.52)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",px:"20px"}}>
          <Box sx={{background:C.w,borderRadius:"14px",boxShadow:"0 20px 60px rgba(0,0,0,.2)",overflow:"hidden",animation:"popIn .2s ease",width:340,maxWidth:"96vw"}}>
            <Box sx={{px:"18px",py:"14px",borderBottom:`1px solid ${C.bd}`,display:"flex",alignItems:"center",justifyContent:"space-between",background:C.tx}}>
              <Typography sx={{fontFamily:SERIF,fontSize:16,fontWeight:700,color:"#fff"}}>{variationPopup.item_name}</Typography>
              <Box component="button" onClick={()=>setVariationPopup(null)} sx={{width:27,height:27,borderRadius:"7px",background:"rgba(255,255,255,.1)",border:"none",cursor:"pointer",fontSize:15,color:"rgba(255,255,255,.7)",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</Box>
            </Box>
            <Box sx={{px:"16px",py:"14px"}}>
              <Typography sx={{fontSize:11,fontWeight:700,color:C.t3,mb:"10px",textTransform:"uppercase",letterSpacing:".4px"}}>Select variation</Typography>
              <Box sx={{display:"flex",flexDirection:"column",gap:"7px"}}>
                {variationPopup.variations?.map(v=>(
                  <Box key={v.id} onClick={()=>setSelVariation(v.id)} sx={{display:"flex",alignItems:"center",justifyContent:"space-between",px:"14px",py:"11px",border:`1.5px solid ${selVariation===v.id?C.ac:C.bd}`,borderRadius:"10px",cursor:"pointer",background:selVariation===v.id?C.adim:C.s1,transition:"all .13s"}}>
                    <Typography sx={{fontSize:14,fontWeight:700,color:selVariation===v.id?C.ac:C.tx}}>{v.variation}</Typography>
                    <Typography sx={{fontSize:14,fontWeight:800,color:C.ac}}>₹{v.price}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
            <Box sx={{px:"16px",pb:"16px",display:"flex",gap:"8px"}}>
              <Box component="button" onClick={()=>setVariationPopup(null)} sx={{px:"14px",py:"10px",background:C.s2,border:`1.5px solid ${C.bd}`,borderRadius:"10px",color:C.t2,fontFamily:FONT,fontWeight:700,fontSize:13,cursor:"pointer"}}>Cancel</Box>
              <Box component="button" onClick={()=>{const v=variationPopup.variations?.find(x=>x.id===selVariation);if(!v){toast.error("Please select a variation");return;}addItem(variationPopup,v);setVariationPopup(null);setSelVariation(null);}} sx={{flex:1,py:"10px",background:C.ac,border:"none",borderRadius:"10px",color:"#fff",fontFamily:FONT,fontWeight:800,fontSize:13,cursor:"pointer","&:hover":{background:C.ah}}}>✅ Add to Cart</Box>
            </Box>
          </Box>
        </Box>
      )}

      {/* ═══════════════════════════════════════════════════════
          CUSTOMER POPUP
      ══════════════════════════════════════════════════════ */}
      <Dialog open={!!custPopup} onClose={()=>setCustPopup(null)} PaperProps={{sx:{width:480,maxWidth:"96vw",borderRadius:"14px",overflow:"hidden"}}}>
        <Box sx={{px:"20px",py:"15px",borderBottom:`1px solid ${C.bd}`,display:"flex",alignItems:"center",justifyContent:"space-between",background:C.tx}}>
          <Box>
            <Typography sx={{fontFamily:SERIF,fontSize:17,fontWeight:700,color:"#fff"}}>👤 {custPopup==="dine"?"Dine In":custPopup==="pickup"?"Pickup":"Delivery"} Customer</Typography>
            <Typography sx={{fontSize:11,color:"rgba(255,255,255,.45)",mt:"1px"}}>Customer info add karo ya existing select karo</Typography>
          </Box>
          <Box component="button" onClick={()=>setCustPopup(null)} sx={{width:27,height:27,borderRadius:"7px",background:"rgba(255,255,255,.1)",border:"none",cursor:"pointer",fontSize:15,color:"rgba(255,255,255,.7)",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</Box>
        </Box>
        <Box sx={{px:"18px",py:"16px"}}>
          <Box sx={{display:"flex",background:C.s2,borderRadius:"10px",p:"3px",mb:"14px"}}>
            {(["recent","new"] as const).map(t=>(
              <Box key={t} component="button" onClick={()=>setCustTab(t)} sx={{flex:1,py:"7px",textAlign:"center",borderRadius:"8px",fontSize:12,fontWeight:700,cursor:"pointer",background:custTab===t?C.w:"none",color:custTab===t?C.tx:C.t2,border:"none",fontFamily:FONT,transition:"all .15s",boxShadow:custTab===t?"0 1px 6px rgba(0,0,0,.08)":"none"}}>
                {t==="recent"?"🔍 Recent":"➕ New Customer"}
              </Box>
            ))}
          </Box>
          {custTab==="recent" ? (
            <>
              <Box sx={{position:"relative",mb:"10px"}}>
                <Box component="span" sx={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",fontSize:14,color:C.t3}}>🔍</Box>
                <Box component="input" value={custSearch} onChange={(e:any)=>handleCustSearch(e.target.value)} placeholder="Search by name or phone…" sx={{width:"100%",px:"12px",py:"9px",pl:"34px",background:C.s1,border:`1.5px solid ${C.bd}`,borderRadius:"10px",fontFamily:FONT,fontSize:13,color:C.tx,outline:"none","&:focus":{borderColor:C.ac},"&::placeholder":{color:C.t3}}} />
              </Box>
              <Box sx={{display:"flex",flexDirection:"column",gap:"6px",maxHeight:240,overflowY:"auto",mb:"14px"}}>
                {custSearching ? (
                  <Box sx={{textAlign:"center",py:"20px"}}><CircularProgress size={20} sx={{color:C.ac}} /></Box>
                ) : custResults.length===0 ? (
                  <Typography sx={{textAlign:"center",color:C.t3,py:"20px",fontSize:13}}>No customers found</Typography>
                ) : custResults.map(c=>(
                  <Box key={c.id} sx={{display:"flex",alignItems:"center",gap:"10px",px:"12px",py:"9px",background:C.s1,border:`1.5px solid ${C.bd}`,borderRadius:"10px",cursor:"pointer",transition:"all .13s","&:hover":{borderColor:C.ac,background:C.adim}}}>
                    <Box sx={{width:34,height:34,borderRadius:"50%",background:C.adim,border:`1.5px solid ${C.abdr}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:800,color:C.ac,flexShrink:0}}>{c.name?.slice(0,2).toUpperCase()}</Box>
                    <Box sx={{flex:1}}>
                      <Typography sx={{fontSize:13,fontWeight:700,color:C.tx}}>{c.name}</Typography>
                      <Typography sx={{fontSize:11,color:C.t3}}>📞 {c.phone}</Typography>
                      {c.delivery_address && <Typography sx={{fontSize:11,color:C.t3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:240}}>📍 {c.delivery_address}</Typography>}
                    </Box>
                    <Box component="button" onClick={()=>selectCust(c)} sx={{px:"10px",py:"5px",background:C.gdim,border:`1px solid ${C.gbdr}`,borderRadius:"7px",fontSize:11,fontWeight:700,color:C.grn,cursor:"pointer",fontFamily:FONT}}>Select</Box>
                  </Box>
                ))}
              </Box>
            </>
          ) : (
            <Box sx={{display:"flex",flexDirection:"column",gap:"12px",mb:"12px"}}>
              {[{id:"name",label:"Full Name *",ph:"Customer ka naam"},{id:"phone",label:"Phone *",ph:"10-digit number",type:"tel"}].map(f=>(
                <Box key={f.id}>
                  <Typography sx={{fontSize:11,fontWeight:700,color:C.t2,textTransform:"uppercase",letterSpacing:".3px",mb:"5px"}}>{f.label}</Typography>
                  <Box component="input" type={f.type||"text"} value={(newCust as any)[f.id]} onChange={(e:any)=>setNewCust(p=>({...p,[f.id]:e.target.value}))} placeholder={f.ph} sx={{width:"100%",px:"12px",py:"10px",background:C.s1,border:`1.5px solid ${C.bd}`,borderRadius:"10px",fontFamily:FONT,fontSize:13,color:C.tx,outline:"none","&:focus":{borderColor:C.ac},"&::placeholder":{color:C.t3}}} />
                </Box>
              ))}
              {custPopup==="delivery" && (
                <Box>
                  <Typography sx={{fontSize:11,fontWeight:700,color:C.t2,textTransform:"uppercase",letterSpacing:".3px",mb:"5px"}}>Delivery Address</Typography>
                  <Box component="input" value={newCust.addr} onChange={(e:any)=>setNewCust(p=>({...p,addr:e.target.value}))} placeholder="Full delivery address…" sx={{width:"100%",px:"12px",py:"10px",background:C.s1,border:`1.5px solid ${C.bd}`,borderRadius:"10px",fontFamily:FONT,fontSize:13,color:C.tx,outline:"none","&:focus":{borderColor:C.ac},"&::placeholder":{color:C.t3}}} />
                </Box>
              )}
              <Box>
                <Typography sx={{fontSize:11,fontWeight:700,color:C.t2,textTransform:"uppercase",letterSpacing:".3px",mb:"5px"}}>Email (optional)</Typography>
                <Box component="input" type="email" value={newCust.email} onChange={(e:any)=>setNewCust(p=>({...p,email:e.target.value}))} placeholder="email@example.com" sx={{width:"100%",px:"12px",py:"10px",background:C.s1,border:`1.5px solid ${C.bd}`,borderRadius:"10px",fontFamily:FONT,fontSize:13,color:C.tx,outline:"none","&:focus":{borderColor:C.ac},"&::placeholder":{color:C.t3}}} />
              </Box>
            </Box>
          )}
        </Box>
        <Box sx={{px:"18px",py:"13px",borderTop:`1px solid ${C.bd}`,display:"flex",gap:"8px",background:C.s1}}>
          <Box component="button" onClick={()=>setCustPopup(null)} sx={{px:"16px",py:"10px",background:C.s2,border:`1.5px solid ${C.bd}`,borderRadius:"10px",color:C.t2,fontFamily:FONT,fontWeight:700,fontSize:12,cursor:"pointer"}}>Cancel</Box>
          <Box component="button" onClick={custTab==="new"?handleSaveCust:()=>setCustPopup(null)} disabled={savingCust} sx={{flex:1,py:"10px",background:C.ac,border:"none",borderRadius:"10px",color:"#fff",fontFamily:FONT,fontWeight:800,fontSize:13,cursor:"pointer",boxShadow:"0 2px 8px rgba(255,61,1,.22)",transition:"all .14s","&:hover":{background:C.ah},"&:disabled":{opacity:.6}}}>
            {savingCust?<CircularProgress size={14} sx={{color:"#fff"}} />:<>✅ {custTab==="new"?"Save & Apply":"Done"}</>}
          </Box>
        </Box>
      </Dialog>

      {/* ═══════════════════════════════════════════════════════
          DISCOUNT POPUP
      ══════════════════════════════════════════════════════ */}
      {discPopup && (
        <Box onClick={(e)=>{if(e.target===e.currentTarget)setDiscPopup(false);}} sx={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:150,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
          <Box sx={{background:C.w,borderRadius:"20px 20px 0 0",width:"100%",maxWidth:480,boxShadow:"0 -8px 40px rgba(0,0,0,.16)",animation:"slideUp .26s cubic-bezier(.4,0,.2,1)",overflow:"hidden"}}>
            <Box sx={{px:"18px",pt:"14px",pb:"10px",borderBottom:`1px solid ${C.bd}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <Typography sx={{fontSize:16,fontWeight:800,color:C.tx}}>🏷️ Apply Discount</Typography>
              <Box component="button" onClick={()=>setDiscPopup(false)} sx={{width:27,height:27,borderRadius:"50%",background:C.s2,border:"none",cursor:"pointer",fontSize:15,color:C.t2,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</Box>
            </Box>
            <Box sx={{px:"18px",py:"16px",pb:"20px"}}>
              <Box sx={{display:"flex",background:C.s2,borderRadius:"10px",p:"3px",gap:"3px",mb:"16px"}}>
                {(["percent","fixed","coupon"] as const).map(t=>(
                  <Box key={t} component="button" onClick={()=>setDiscPopType(t)} sx={{flex:1,py:"8px",textAlign:"center",borderRadius:"8px",fontSize:12.5,fontWeight:700,cursor:"pointer",border:"none",background:discPopType===t?C.w:"none",fontFamily:FONT,color:discPopType===t?C.tx:C.t2,transition:"all .16s",boxShadow:discPopType===t?"0 1px 6px rgba(0,0,0,.08)":"none"}}>
                    {t==="percent"?"% Percent":t==="fixed"?"₹ Fixed":"🎟️ Coupon"}
                  </Box>
                ))}
              </Box>
              {discPopType!=="coupon" ? (
                <>
                  <Box sx={{position:"relative",mb:"12px"}}>
                    <Typography sx={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",fontSize:20,fontWeight:800,color:C.ac}}>{discPopType==="percent"?"%":"₹"}</Typography>
                    <Box component="input" type="number" value={discInput} onChange={(e:any)=>setDiscInput(e.target.value)} placeholder="0" min={0} sx={{width:"100%",pl:"36px",pr:"14px",py:"13px",background:C.s1,border:`2px solid ${C.bd}`,borderRadius:"10px",fontFamily:SERIF,fontSize:28,fontWeight:700,color:C.tx,outline:"none",textAlign:"right","&:focus":{borderColor:C.ac,background:C.w}}} />
                  </Box>
                  <Box sx={{display:"flex",gap:"6px",mb:"14px",flexWrap:"wrap"}}>
                    {(discPopType==="percent"?[5,10,15,20,25,50]:[20,50,100,200]).map(v=>(
                      <Box key={v} component="button" onClick={()=>setDiscInput(String(v))} sx={{px:"13px",py:"6px",borderRadius:"20px",fontSize:12,fontWeight:700,cursor:"pointer",border:`1.5px solid ${discInput===String(v)?C.abdr:C.bd}`,background:discInput===String(v)?C.adim:C.s1,color:discInput===String(v)?C.ac:C.t2,fontFamily:FONT,transition:"all .13s"}}>
                        {discPopType==="percent"?`${v}%`:`₹${v}`}
                      </Box>
                    ))}
                  </Box>
                  {discPreview>0 && <Box sx={{display:"flex",alignItems:"center",justifyContent:"space-between",px:"12px",py:"10px",background:C.adim,border:`1px solid ${C.abdr}`,borderRadius:"8px",mb:"12px"}}>
                    <Typography sx={{color:C.t2,fontWeight:500,fontSize:12}}>Discount Amount</Typography>
                    <Typography sx={{fontWeight:800,color:C.ac,fontSize:15}}>₹{discPreview}</Typography>
                  </Box>}
                </>
              ) : (
                <>
                  <Box sx={{position:"relative",mb:"10px"}}>
                    <Typography sx={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",fontSize:16}}>🎟️</Typography>
                    <Box component="input" type="text" value={couponCode} onChange={(e:any)=>setCouponCode(e.target.value.toUpperCase())} placeholder="FLAT10" sx={{width:"100%",pl:"38px",pr:"14px",py:"13px",background:C.s1,border:`2px solid ${C.bd}`,borderRadius:"10px",fontFamily:SERIF,fontSize:20,fontWeight:700,color:C.tx,outline:"none",textTransform:"uppercase","&:focus":{borderColor:C.ac}}} />
                  </Box>
                  <Typography sx={{fontSize:11.5,color:C.t3,mb:"12px"}}>Try: FLAT10 (10% off) · SAVE50 (₹50 off) · VIP20 (20% off)</Typography>
                </>
              )}
              <Box component="select" value={discReason} onChange={(e:any)=>setDiscReason(e.target.value)} sx={{width:"100%",px:"12px",py:"9px",background:C.s1,border:`1.5px solid ${C.bd}`,borderRadius:"10px",fontFamily:FONT,fontSize:12.5,color:C.tx,outline:"none",cursor:"pointer",appearance:"none",mb:"14px"}}>
                <option value="">Reason (optional)</option>
                {["Staff / Employee Discount","Loyalty Reward","Promotional Offer","Food Quality Issue","Manager Approved","Birthday Special","Bulk Order"].map(r=><option key={r}>{r}</option>)}
              </Box>
              <Box component="button" onClick={handleApplyDiscount} sx={{width:"100%",py:"14px",background:C.ac,border:"none",borderRadius:"10px",color:"#fff",fontFamily:FONT,fontWeight:800,fontSize:15,cursor:"pointer",boxShadow:"0 3px 10px rgba(255,61,1,.25)","&:hover":{background:C.ah}}}>✅ Apply Discount</Box>
            </Box>
          </Box>
        </Box>
      )}

      {/* ═══════════════════════════════════════════════════════
          KOT TOKEN POPUP
      ══════════════════════════════════════════════════════ */}
      <Dialog open={kotPopup} onClose={()=>setKotPopup(false)} PaperProps={{sx:{width:420,maxWidth:"96vw",borderRadius:"14px",overflow:"hidden"}}}>
        <Box sx={{background:C.tx,px:"18px",py:"14px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <Typography sx={{fontSize:16,fontWeight:800,color:"#fff"}}>🔖 KOT Token System</Typography>
          <Box component="button" onClick={()=>setKotPopup(false)} sx={{width:27,height:27,borderRadius:"7px",background:"rgba(255,255,255,.1)",border:"none",cursor:"pointer",fontSize:15,color:"rgba(255,255,255,.7)",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</Box>
        </Box>
        <Box sx={{m:"16px",borderRadius:"14px",p:"20px",textAlign:"center",background:"linear-gradient(135deg,#FF3D01,#dd3400)",boxShadow:"0 4px 16px rgba(255,61,1,.28)"}}>
          <Typography sx={{fontFamily:SERIF,fontSize:44,fontWeight:800,color:"#fff",letterSpacing:"3px"}}>{kotToken}</Typography>
          <Typography sx={{fontSize:12,color:"rgba(255,255,255,.7)",fontWeight:600,mt:"4px"}}>Kitchen Order Token</Typography>
        </Box>
        <Box sx={{px:"16px",pb:"16px"}}>
          {[{n:1,t:"Order Place Hoti Hai",s:"Customer order deta hai — Dine In / Pickup / Delivery"},{n:2,t:"KOT Token Generate",s:"Print hota hai — Pickup ke liye customer ko diya jaata hai"},{n:3,t:"Kitchen mein KOT jaati hai",s:"Items prepare hone lagti hain — KDS par bhi show hota hai"},{n:"✓",t:"Bill & Payment",s:"Food delivery ke baad bill settle karein",green:true}].map((s,i)=>(
            <Box key={i} sx={{display:"flex",alignItems:"flex-start",gap:"10px",py:"9px",borderBottom:i<3?`1px solid ${C.bd}`:"none"}}>
              <Box sx={{width:22,height:22,borderRadius:"50%",background:(s as any).green?C.grn:C.ac,color:"#fff",fontSize:10,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,mt:"1px"}}>{s.n}</Box>
              <Box><Typography sx={{fontSize:12.5,fontWeight:700,color:C.tx}}>{s.t}</Typography><Typography sx={{fontSize:11,color:C.t3,mt:"1px"}}>{s.s}</Typography></Box>
            </Box>
          ))}
          <Box component="button" onClick={()=>{toast.success("Token printed 🖨️");setKotPopup(false);}} sx={{width:"100%",mt:"14px",py:"12px",background:C.ac,border:"none",borderRadius:"10px",color:"#fff",fontFamily:FONT,fontWeight:800,fontSize:13,cursor:"pointer","&:hover":{background:C.ah}}}>🖨️ Print Token {kotToken}</Box>
        </Box>
      </Dialog>

      {/* ═══════════════════════════════════════════════════════
          NOTE POPUP
      ══════════════════════════════════════════════════════ */}
      {notePopup && (
        <Box onClick={(e)=>{if(e.target===e.currentTarget)setNotePopup(null);}} sx={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",px:"20px"}}>
          <Box sx={{background:C.w,borderRadius:"14px",boxShadow:"0 20px 60px rgba(0,0,0,.2)",overflow:"hidden",animation:"popIn .2s ease",width:380,maxWidth:"96vw"}}>
            <Box sx={{px:"18px",py:"14px",borderBottom:`1px solid ${C.bd}`,display:"flex",alignItems:"center",justifyContent:"space-between",background:C.tx}}>
              <Typography sx={{fontFamily:SERIF,fontSize:16,fontWeight:700,color:"#fff"}}>
                📝 {notePopup.type==="item" ? `Note — ${cart[notePopup.key as number]?.item.item_name}` : `Order Note — ${notePopup.key==="dine"?"Dine In":notePopup.key==="pickup"?"Pickup":"Delivery"}`}
              </Typography>
              <Box component="button" onClick={()=>setNotePopup(null)} sx={{width:27,height:27,borderRadius:"7px",background:"rgba(255,255,255,.1)",border:"none",cursor:"pointer",fontSize:15,color:"rgba(255,255,255,.7)",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</Box>
            </Box>
            <Box sx={{px:"16px",py:"14px"}}>
              <Box component="textarea" ref={noteRef} value={noteText} onChange={(e:any)=>setNoteText(e.target.value)}
                placeholder="Yahan note likhein… (e.g. Less spicy, extra sauce, allergy info…)"
                onKeyDown={(e:React.KeyboardEvent<HTMLTextAreaElement>)=>{if(e.key==="Enter"&&e.ctrlKey){handleSaveNote();}}}
                sx={{width:"100%",minHeight:100,px:"12px",py:"10px",background:C.s1,border:`1.5px solid ${C.bd}`,borderRadius:"10px",fontFamily:FONT,fontSize:13,color:C.tx,resize:"vertical",outline:"none",lineHeight:1.5,"&:focus":{borderColor:C.ac},"&::placeholder":{color:C.t3}}} />
              <Typography sx={{fontSize:11,color:C.t3,mt:"5px"}}>Ctrl+Enter se save karein</Typography>
            </Box>
            <Box sx={{px:"16px",pb:"14px",display:"flex",gap:"8px"}}>
              <Box component="button" onClick={()=>setNotePopup(null)} sx={{px:"14px",py:"10px",background:C.s2,border:`1.5px solid ${C.bd}`,borderRadius:"10px",color:C.t2,fontFamily:FONT,fontWeight:700,fontSize:12,cursor:"pointer"}}>Cancel</Box>
              <Box component="button" onClick={handleSaveNote} sx={{flex:1,py:"10px",background:C.ac,border:"none",borderRadius:"10px",color:"#fff",fontFamily:FONT,fontWeight:800,fontSize:13,cursor:"pointer","&:hover":{background:C.ah}}}>✅ Save Note</Box>
            </Box>
          </Box>
        </Box>
      )}

      {/* Pickup Date / Time Popups */}
      {[{ open:pickupDatePopup, close:()=>setPickupDatePopup(false), title:"📅 Pickup Date", apply:applyPickupDate,
          body:<>
            <Box component="input" type="date" value={dateInput} onChange={(e:any)=>setDateInput(e.target.value)} sx={{width:"100%",px:"12px",py:"10px",background:C.s1,border:`1.5px solid ${C.bd}`,borderRadius:"10px",fontFamily:FONT,fontSize:15,color:C.tx,outline:"none","&:focus":{borderColor:C.ac}}} />
            <Box sx={{display:"flex",gap:"6px",mt:"10px",flexWrap:"wrap"}}>
              {[{l:"Today",d:0},{l:"Tomorrow",d:1},{l:"+2 Days",d:2}].map(p=>(
                <Box key={p.l} component="button" onClick={()=>{const d=new Date();d.setDate(d.getDate()+p.d);setDateInput(d.toISOString().split("T")[0]);}} sx={{px:"10px",py:"6px",background:C.adim,border:`1.5px solid ${C.abdr}`,borderRadius:"8px",fontSize:11,fontWeight:700,color:C.ac,cursor:"pointer",fontFamily:FONT}}>{p.l}</Box>
              ))}
            </Box>
          </>, btnLabel:"✅ Set Date" },
        { open:pickupTimePopup, close:()=>setPickupTimePopup(false), title:"🕐 Pickup Time", apply:applyPickupTime,
          body:<>
            <Box component="input" type="time" value={timeInput} onChange={(e:any)=>setTimeInput(e.target.value)} sx={{width:"100%",px:"12px",py:"10px",background:C.s1,border:`1.5px solid ${C.bd}`,borderRadius:"10px",fontFamily:FONT,fontSize:15,color:C.tx,outline:"none","&:focus":{borderColor:C.ac}}} />
            <Box sx={{display:"flex",gap:"6px",mt:"10px",flexWrap:"wrap"}}>
              {[{l:"Now",v:0},{l:"+15 min",v:15},{l:"+30 min",v:30},{l:"+1 hr",v:60}].map(p=>(
                <Box key={p.l} component="button" onClick={()=>addMinutes(p.v)} sx={{px:"10px",py:"6px",background:C.s1,border:`1.5px solid ${C.bd}`,borderRadius:"8px",fontSize:11,fontWeight:700,color:C.t2,cursor:"pointer",fontFamily:FONT}}>{p.l}</Box>
              ))}
            </Box>
          </>, btnLabel:"✅ Set Time" }
      ].map(p => (
        <Dialog key={p.title} open={p.open} onClose={p.close} PaperProps={{sx:{width:360,maxWidth:"96vw",borderRadius:"14px",overflow:"hidden"}}}>
          <Box sx={{px:"18px",py:"14px",borderBottom:`1px solid ${C.bd}`,display:"flex",alignItems:"center",justifyContent:"space-between",background:C.tx}}>
            <Typography sx={{fontFamily:SERIF,fontSize:16,fontWeight:700,color:"#fff"}}>{p.title}</Typography>
            <Box component="button" onClick={p.close} sx={{width:27,height:27,borderRadius:"7px",background:"rgba(255,255,255,.1)",border:"none",cursor:"pointer",fontSize:15,color:"rgba(255,255,255,.7)",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</Box>
          </Box>
          <Box sx={{px:"18px",py:"18px"}}>{p.body}</Box>
          <Box sx={{px:"18px",pb:"14px",pt:"12px",borderTop:`1px solid ${C.bd}`,display:"flex",gap:"8px",background:C.s1}}>
            <Box component="button" onClick={p.close} sx={{px:"14px",py:"10px",background:C.s2,border:`1.5px solid ${C.bd}`,borderRadius:"10px",color:C.t2,fontFamily:FONT,fontWeight:700,fontSize:12,cursor:"pointer"}}>Cancel</Box>
            <Box component="button" onClick={p.apply} sx={{flex:1,py:"10px",background:C.ac,border:"none",borderRadius:"10px",color:"#fff",fontFamily:FONT,fontWeight:800,fontSize:13,cursor:"pointer","&:hover":{background:C.ah}}}>{p.btnLabel}</Box>
          </Box>
        </Dialog>
      ))}

      {/* Assign Table Popup */}
      <Dialog open={assignTablePopup} onClose={()=>setAssignTablePopup(false)} PaperProps={{sx:{width:540,maxWidth:"96vw",borderRadius:"14px",overflow:"hidden",maxHeight:"88vh"}}}>
        <Box sx={{px:"18px",py:"14px",borderBottom:`1px solid ${C.bd}`,display:"flex",alignItems:"center",justifyContent:"space-between",background:C.tx}}>
          <Typography sx={{fontFamily:SERIF,fontSize:17,fontWeight:700,color:"#fff"}}>🪑 Assign Table</Typography>
          <Box component="button" onClick={()=>setAssignTablePopup(false)} sx={{width:27,height:27,borderRadius:"7px",background:"rgba(255,255,255,.1)",border:"none",cursor:"pointer",fontSize:15,color:"rgba(255,255,255,.7)",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</Box>
        </Box>
        <Box sx={{overflowY:"auto",px:"16px",py:"14px"}}>
          {areas.length > 0 ? areas.map((area:any)=>(
            <Box key={area.area_name} sx={{mb:"16px"}}>
              <Typography sx={{fontFamily:SERIF,fontSize:15,fontWeight:700,color:C.tx,mb:"9px",pb:"5px",borderBottom:`2px solid ${C.ac}`}}>{area.area_name}</Typography>
              <Box sx={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(100px,1fr))",gap:"8px"}}>
                {area.tables?.map((t:PosTable)=>{
                  const avail = t.is_available===1 || t.status==="available";
                  const isSelected = assignedTable?.id===t.id;
                  return (
                    <Box key={t.id} onClick={()=>{if(!avail&&!isSelected)return;setAssignedTable({...t,area_name:area.area_name});setAssignTablePopup(false);toast.success(`🪑 ${area.area_name} — ${t.table_no} assigned ✓`);}}
                      sx={{border:`1.5px solid ${isSelected?C.ac:avail?C.bd:"#fca5a5"}`,borderRadius:"12px",p:"10px",minHeight:90,display:"flex",flexDirection:"column",cursor:avail||isSelected?"pointer":"not-allowed",transition:"all .15s",background:isSelected?C.adim:avail?C.w:"#ffe4e6","&:hover":{ transform:avail||isSelected?"translateY(-2px)":"none",boxShadow:avail||isSelected?"0 8px 24px rgba(0,0,0,.1)":"none" }}}>
                      <Typography sx={{fontFamily:SERIF,fontSize:22,fontWeight:700,color:isSelected?C.ac:avail?C.tx:"#991b1b"}}>{t.table_no}</Typography>
                      {t.capacity&&<Typography sx={{fontSize:10,color:C.t3,mt:"2px"}}>{t.capacity} seats</Typography>}
                      <Typography sx={{fontSize:9,fontWeight:700,color:isSelected?C.ac:avail?C.grn:"#991b1b",mt:"auto"}}>{isSelected?"✓ Selected":avail?"Available":"Occupied"}</Typography>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          )) : (
            /* Fallback: flat table list from useTables */
            <Box>
              {Object.entries(
                (flatTables as PosTable[]).reduce((acc:any, t) => {
                  const k = t.area_name || "Tables";
                  acc[k] = acc[k]||[];
                  acc[k].push(t);
                  return acc;
                }, {})
              ).map(([areaName, tbls]:any)=>(
                <Box key={areaName} sx={{mb:"14px"}}>
                  <Typography sx={{fontFamily:SERIF,fontSize:15,fontWeight:700,color:C.tx,mb:"8px",pb:"5px",borderBottom:`2px solid ${C.ac}`}}>{areaName}</Typography>
                  <Box sx={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(100px,1fr))",gap:"8px"}}>
                    {tbls.map((t:PosTable)=>{
                      const isSelected=assignedTable?.id===t.id;
                      return (
                        <Box key={t.id} onClick={()=>{setAssignedTable(t);setAssignTablePopup(false);toast.success(`🪑 ${t.table_no} assigned ✓`);}}
                          sx={{border:`1.5px solid ${isSelected?C.ac:C.bd}`,borderRadius:"12px",p:"10px",minHeight:80,display:"flex",flexDirection:"column",cursor:"pointer",background:isSelected?C.adim:C.w,"&:hover":{transform:"translateY(-2px)",boxShadow:"0 8px 24px rgba(0,0,0,.08)"}}}>
                          <Typography sx={{fontFamily:SERIF,fontSize:22,fontWeight:700,color:isSelected?C.ac:C.tx}}>{t.table_no}</Typography>
                          {t.capacity&&<Typography sx={{fontSize:10,color:C.t3,mt:"2px"}}>{t.capacity} seats</Typography>}
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </Dialog>

      {/* E-Bill Popup */}
      <Dialog open={ebillPopup} onClose={()=>setEbillPopup(false)} PaperProps={{sx:{width:420,maxWidth:"96vw",borderRadius:"14px",overflow:"hidden"}}}>
        <Box sx={{px:"18px",py:"14px",borderBottom:`1px solid ${C.bd}`,display:"flex",alignItems:"center",justifyContent:"space-between",background:C.tx}}>
          <Box>
            <Typography sx={{fontFamily:SERIF,fontSize:16,fontWeight:700,color:"#fff"}}>📲 Send E-Bill</Typography>
            <Typography sx={{fontSize:11,color:"rgba(255,255,255,.45)",mt:"1px"}}>Customer ka naam aur WhatsApp number</Typography>
          </Box>
          <Box component="button" onClick={()=>setEbillPopup(false)} sx={{width:27,height:27,borderRadius:"7px",background:"rgba(255,255,255,.1)",border:"none",cursor:"pointer",fontSize:15,color:"rgba(255,255,255,.7)",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</Box>
        </Box>
        <Box sx={{px:"18px",py:"14px"}}>
          {[{label:"Full Name *",val:ebillName,set:setEbillName,ph:"Customer ka naam"},{label:"WhatsApp Number *",val:ebillPhone,set:setEbillPhone,ph:"10-digit number",type:"tel"}].map(f=>(
            <Box key={f.label} sx={{mb:"12px"}}>
              <Typography sx={{fontSize:11,fontWeight:700,color:C.t2,textTransform:"uppercase",letterSpacing:".3px",mb:"5px"}}>{f.label}</Typography>
              <Box component="input" type={f.type||"text"} value={f.val} onChange={(e:any)=>f.set(e.target.value)} placeholder={f.ph} sx={{width:"100%",px:"12px",py:"10px",background:C.s1,border:`1.5px solid ${C.bd}`,borderRadius:"10px",fontFamily:FONT,fontSize:13,color:C.tx,outline:"none","&:focus":{borderColor:C.ac},"&::placeholder":{color:C.t3}}} />
            </Box>
          ))}
          {/* Quick-fill from channel customer */}
          {custByChannel[channel] && (
            <Box component="button" onClick={()=>{const c=custByChannel[channel]!;setEbillName(c.name);setEbillPhone(c.phone);}} sx={{px:"10px",py:"5px",background:C.adim,border:`1px solid ${C.abdr}`,borderRadius:"8px",fontSize:11,fontWeight:600,color:C.ac,cursor:"pointer",fontFamily:FONT,mb:"4px"}}>
              Use {custByChannel[channel]!.name.split(" ")[0]}'s details
            </Box>
          )}
        </Box>
        <Box sx={{px:"18px",py:"13px",borderTop:`1px solid ${C.bd}`,display:"flex",gap:"8px",background:C.s1}}>
          <Box component="button" onClick={()=>setEbillPopup(false)} sx={{px:"14px",py:"10px",background:C.s2,border:`1.5px solid ${C.bd}`,borderRadius:"10px",color:C.t2,fontFamily:FONT,fontWeight:700,fontSize:12,cursor:"pointer"}}>Cancel</Box>
          <Box component="button" onClick={()=>{if(!ebillName||!ebillPhone){toast.error("Naam aur number required!");return;}toast.success(`E-bill sent to ${ebillName} ✓`);setEbillPopup(false);}} sx={{flex:1,py:"10px",background:"#25d366",border:"none",borderRadius:"10px",color:"#fff",fontFamily:FONT,fontWeight:800,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:"6px",boxShadow:"0 2px 8px rgba(37,211,102,.28)"}}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            Send via WhatsApp
          </Box>
        </Box>
      </Dialog>

      {/* Table View Overlay */}
      <Box sx={{position:"fixed",inset:0,zIndex:60,background:C.bg,transform:tablesPage?"translateX(0)":"translateX(100%)",transition:"transform .3s cubic-bezier(.4,0,.2,1)",display:"flex",flexDirection:"column"}}>
        <Box sx={{display:"flex",alignItems:"center",gap:"10px",px:"16px",height:50,background:C.w,borderBottom:`1px solid ${C.bd}`,flexShrink:0}}>
          <Box component="button" onClick={()=>setTablesPage(false)} sx={{display:"flex",alignItems:"center",gap:"5px",px:"12px",py:"6px",background:C.s1,border:`1.5px solid ${C.bd}`,borderRadius:"8px",fontSize:12.5,fontWeight:700,cursor:"pointer",color:C.t2,fontFamily:FONT,"&:hover":{color:C.tx}}}>← Back to POS</Box>
          <Typography sx={{fontFamily:SERIF,fontSize:17,fontWeight:700,color:C.tx}}>🪑 Table View</Typography>
        </Box>
        <Box sx={{flex:1,overflowY:"auto",px:"16px",py:"16px"}}>
          {areas.length>0 ? areas.map((area:any)=>(
            <Box key={area.area_name} sx={{mb:"20px"}}>
              <Typography sx={{fontFamily:SERIF,fontSize:16,fontWeight:700,color:C.tx,mb:"10px",pb:"6px",borderBottom:`2px solid ${C.ac}`}}>{area.area_name}</Typography>
              <Box sx={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:"10px"}}>
                {area.tables?.map((t:PosTable)=>{
                  const avail=t.is_available===1||t.status==="available";
                  return (
                    <Box key={t.id} onClick={()=>{if(!avail)return;setAssignedTable({...t,area_name:area.area_name});setChannel("dine");setTablesPage(false);toast.success(`🪑 ${t.table_no} selected`);}}
                      sx={{border:`1.5px solid ${avail?"#93c5fd":"#fca5a5"}`,borderRadius:"14px",p:"13px",minHeight:100,display:"flex",flexDirection:"column",cursor:avail?"pointer":"not-allowed",background:avail?"#dbeafe":"#ffe4e6","&:hover":{transform:avail?"translateY(-2px)":"none",boxShadow:avail?"0 8px 28px rgba(0,0,0,.1)":"none"}}}>
                      {t.capacity&&<Typography sx={{fontSize:10,fontWeight:600,color:C.t3}}>{t.capacity} seats</Typography>}
                      <Typography sx={{fontFamily:SERIF,fontSize:26,fontWeight:700,color:avail?"#1d4ed8":"#991b1b",mb:"auto"}}>{t.table_no}</Typography>
                      <Typography sx={{fontSize:9,fontWeight:700,color:avail?C.grn:"#991b1b"}}>{avail?"Available":"Occupied"}</Typography>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          )) : <Typography sx={{color:C.t3,textAlign:"center",py:"40px"}}>No tables configured. Check branch settings.</Typography>}
        </Box>
      </Box>

      {/* All Orders Overlay */}
      <Box sx={{position:"fixed",inset:0,zIndex:60,background:C.bg,transform:ordersPage?"translateX(0)":"translateX(100%)",transition:"transform .3s cubic-bezier(.4,0,.2,1)",display:"flex",flexDirection:"column"}}>
        <Box sx={{display:"flex",alignItems:"center",gap:"10px",px:"16px",height:50,background:C.w,borderBottom:`1px solid ${C.bd}`,flexShrink:0}}>
          <Box component="button" onClick={()=>setOrdersPage(false)} sx={{display:"flex",alignItems:"center",gap:"5px",px:"12px",py:"6px",background:C.s1,border:`1.5px solid ${C.bd}`,borderRadius:"8px",fontSize:12.5,fontWeight:700,cursor:"pointer",color:C.t2,fontFamily:FONT,"&:hover":{color:C.tx}}}>← Back to POS</Box>
          <Typography sx={{fontFamily:SERIF,fontSize:17,fontWeight:700,color:C.tx}}>📋 All Orders</Typography>
          <Box sx={{ml:"auto",display:"flex",gap:"7px"}}>
            <Box component="button" onClick={()=>setOrdersPage(false)} sx={{px:"12px",py:"6px",background:C.ac,border:"none",borderRadius:"8px",color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:FONT}}>⚡ New Order</Box>
          </Box>
        </Box>
        <Box sx={{flex:1,overflowY:"auto",px:"16px",py:"16px"}}>
          <Typography sx={{color:C.t3,textAlign:"center",py:"40px",fontSize:13}}>Order history ko refresh karein ya menudashboard se check karein.</Typography>
        </Box>
      </Box>

      {/* ── PAYMENT CHECKOUT MODAL ──────────────────────────────────────── */}
      {checkoutModal && (
        <CheckoutModal
          open={checkoutModal.open}
          onClose={()=>setCheckoutModal(null)}
          orderNumber={checkoutModal.orderNo}
          totalAmount={checkoutModal.total}
          cart={cart}
          orderId={checkoutModal.orderId}
          onPaymentSuccess={()=>{
            setCheckoutModal(null);
            const ch = {dine:"🍽️ Dine In",pickup:"🥡 Pickup",delivery:"🛵 Delivery"}[channel];
            toast.success(`${ch} payment complete! ✓`);
            clearCart();
          }}
        />
      )}
    </Box>
  );
}


function CustPillBtn({ pill, onClick }: { pill:{filled:boolean;label:string;initials:string}; onClick:()=>void }) {
  return (
    <Box component="button" onClick={onClick} sx={{flex:1,display:"flex",alignItems:"center",gap:"5px",px:"9px",py:"4px",background:pill.filled?"rgba(24,107,53,0.08)":"#fdfaf7",border:`1px solid ${pill.filled?"rgba(24,107,53,0.22)":"#e4dbd0"}`,borderRadius:"8px",fontSize:"10.5px",cursor:"pointer",fontWeight:600,fontFamily:FONT,color:pill.filled?"#186b35":"#68594a",transition:"all .13s","&:hover":{borderColor:"#cec4b8"},minWidth:0}}>
      <Box sx={{width:18,height:18,borderRadius:"50%",background:pill.filled?"rgba(24,107,53,0.22)":"#FF3D01",color:"#fff",fontSize:"8px",fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{pill.initials}</Box>
      <Typography sx={{fontSize:"10.5px",fontWeight:600,fontFamily:"'Plus Jakarta Sans',sans-serif",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{pill.label}</Typography>
    </Box>
  );
}

