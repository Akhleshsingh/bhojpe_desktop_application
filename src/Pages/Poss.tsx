/**
 * BhojPe POS — Full Point of Sale Screen
 * Route: /poss  (standalone, no DashboardLayout)
 * Mirrors: poss_1773737159048.html
 */
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Box, Typography, TextField, InputAdornment, Dialog, DialogContent, Tabs, Tab } from "@mui/material";
import toast from "react-hot-toast";
import {
  loadPosInitData,
  createPosOrder,
  createPosCustomer,
  validateCoupon,
  type PosMenuItem,
  type PosFloor,
  type PosCustomer,
  type PosStaff,
} from "../api/endpoints/pos";

// ─── Design Tokens ─────────────────────────────────────────────────────────
const C = {
  ac:"#FF3D01", ah:"#dd3400",
  adim:"rgba(255,61,1,0.07)", amid:"rgba(255,61,1,0.13)", abdr:"rgba(255,61,1,0.22)",
  bg:"#f8f5f1", w:"#fff", s1:"#fdfaf7", s2:"#f2ece5", s3:"#e8e0d8",
  bd:"#e4dbd0", bd2:"#cec4b8",
  grn:"#186b35", gdim:"rgba(24,107,53,0.08)", gbdr:"rgba(24,107,53,0.22)",
  red:"#b81c1c", rdim:"rgba(184,28,28,0.08)", rbdr:"rgba(184,28,28,0.22)",
  yel:"#7a5a00", ydim:"rgba(122,90,0,0.08)", ybdr:"rgba(122,90,0,0.22)",
  blu:"#1a4fcc", bdim:"rgba(26,79,204,0.08)", bbdr:"rgba(26,79,204,0.22)",
  tx:"#24201c", t2:"#68594a", t3:"#a4927e",
  dark:"#24201c", dark2:"#2e2a26", dark3:"#3a342e", dark4:"#2a2420",
  darkBdr:"rgba(255,255,255,0.08)",
} as const;

const FONT = "'Plus Jakarta Sans', sans-serif";
const SERIF = "'Playfair Display', serif";

// ─── Meal Time Groups ───────────────────────────────────────────────────────
const MEAL_TIMES = [
  { key:"Breakfast", icon:"🌅", cats:["South Indian","Roti","Lassi","Soda"] },
  { key:"Lunch",     icon:"☀️", cats:["Thali","Biryani","Punjabi","Roti","Noodles"] },
  { key:"Dinner",    icon:"🌙", cats:["Pizza","Burger","Biryani","Punjabi","Thali","Noodles","Roti"] },
  { key:"Drinks",    icon:"🥤", cats:["Soda","Lassi","Ice-cream","Sweets"] },
];

// ─── Cart Item type ─────────────────────────────────────────────────────────
interface CartItem extends PosMenuItem { qty: number; note?: string; }

// ─── Small helper components ────────────────────────────────────────────────
const VDot = ({ type }: { type: string }) => (
  <Box sx={{
    position:"absolute", top:6, left:6, width:13, height:13,
    borderRadius:"3px", border:`1.5px solid ${type==="veg"?C.grn:type==="nonveg"?C.red:C.yel}`,
    background:C.w, display:"flex", alignItems:"center", justifyContent:"center",
    "& span": {
      width:5, height:5, borderRadius:"50%",
      background: type==="veg"?C.grn:type==="nonveg"?C.red:C.yel,
      display:"block",
    }
  }}><span /></Box>
);

const NoteIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

// ─── Main Component ─────────────────────────────────────────────────────────
export default function Poss() {
  // ── Data state ──
  const [menu, setMenu] = useState<PosMenuItem[]>([]);
  const [floors, setFloors] = useState<PosFloor[]>([]);
  const [customers, setCustomers] = useState<PosCustomer[]>([]);
  const [waiters, setWaiters] = useState<PosStaff[]>([]);
  const [deliveryExecs, setDeliveryExecs] = useState<PosStaff[]>([]);
  const [initLoading, setInitLoading] = useState(true);

  // ── Sidebar ──
  const [sideMode, setSideMode] = useState<"cat"|"menu">("cat");
  const [activeCat, setActiveCat] = useState("All");
  const [activeMealTime, setActiveMealTime] = useState<string|null>(null);

  // ── Search & Filter ──
  const [srchQ, setSrchQ] = useState("");
  const [filters, setFilters] = useState(new Set(["veg","nonveg","egg"]));

  // ── Cart ──
  const [cart, setCart] = useState<Record<number, CartItem>>({});
  const [pax, setPax] = useState(1);
  const [orderNo] = useState(1);

  // ── Channel ──
  const [channel, setChannel] = useState<"dine"|"pickup"|"delivery">("dine");
  const [waiter, setWaiter] = useState("");
  const [platform, setPlatform] = useState("bhojpe");
  const [deliveryExec, setDeliveryExec] = useState("");
  const [pickupDate, setPickupDate] = useState("Today");
  const [pickupTime, setPickupTime] = useState("Now");
  const [delCharge, setDelCharge] = useState(40);
  const [delKm, setDelKm] = useState(2.3);
  const [assignedTable, setAssignedTable] = useState<{id:string;name:string;floor:string}|null>(null);
  const [channelNotes, setChannelNotes] = useState({ dine:"", pickup:"", delivery:"" });
  const [custByChannel, setCustByChannel] = useState<{dine:PosCustomer|null;pickup:PosCustomer|null;delivery:PosCustomer|null}>({dine:null,pickup:null,delivery:null});

  // ── Summary Drawer ──
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [discAmt, setDiscAmt] = useState(0);
  const [discLabel, setDiscLabel] = useState("");
  const [payMode, setPayMode] = useState("Cash");

  // ── Popups ──
  const [custPopup, setCustPopup] = useState<"dine"|"pickup"|"delivery"|null>(null);
  const [custTab, setCustTab] = useState<"recent"|"new">("recent");
  const [custSearch, setCustSearch] = useState("");
  const [newCust, setNewCust] = useState({ name:"", phone:"", addr:"", email:"", pin:"", note:"" });
  const [discPopup, setDiscPopup] = useState(false);
  const [discType, setDiscType] = useState<"percent"|"fixed"|"coupon">("percent");
  const [discVal, setDiscVal] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [discReason, setDiscReason] = useState("");
  const [notePopup, setNotePopup] = useState<{type:"item"|"channel";id:number|string}|null>(null);
  const [noteText, setNoteText] = useState("");
  const [kotPopup, setKotPopup] = useState(false);
  const [kotToken, setKotToken] = useState("T-001");
  const [kotTime, setKotTime] = useState("");
  const [pickupDatePopup, setPickupDatePopup] = useState(false);
  const [pickupTimePopup, setPickupTimePopup] = useState(false);
  const [pickupDateInput, setPickupDateInput] = useState("");
  const [pickupTimeInput, setPickupTimeInput] = useState("");
  const [assignTablePopup, setAssignTablePopup] = useState(false);
  const [mergeTablePopup, setMergeTablePopup] = useState(false);
  const [mergeStep, setMergeStep] = useState(1);
  const [mergePrimary, setMergePrimary] = useState<string|null>(null);
  const [mergeSelected, setMergeSelected] = useState<string[]>([]);
  const [ebillPopup, setEbillPopup] = useState(false);
  const [ebillName, setEbillName] = useState("");
  const [ebillPhone, setEbillPhone] = useState("");

  // ── Page Overlays ──
  const [tablesPageOpen, setTablesPageOpen] = useState(false);
  const [ordersPageOpen, setOrdersPageOpen] = useState(false);
  const [ordersFilter, setOrdersFilter] = useState("all");

  const dummyOrders = [
    {id:"ORD-001",channel:"dine",  table:"T1", customer:"Rahul Sharma",   waiter:"Sanjay Singh", status:"running",  total:720,  items:4, time:"12:32 PM"},
    {id:"ORD-002",channel:"pickup",table:"",   customer:"Priya Malhotra", waiter:"",             status:"running",  total:380,  items:2, time:"12:45 PM"},
    {id:"ORD-003",channel:"delivery",table:"",customer:"Amit Kumar",     waiter:"",             status:"running",  total:540,  items:3, time:"1:10 PM"},
    {id:"ORD-004",channel:"dine",  table:"T3", customer:"Sneha Gupta",    waiter:"Arjun Kumar",  status:"billed",   total:920,  items:5, time:"11:58 AM"},
    {id:"ORD-005",channel:"dine",  table:"F2", customer:"Vikram Singh",   waiter:"Pooja Mehta",  status:"running",  total:1240, items:6, time:"1:00 PM"},
    {id:"ORD-006",channel:"delivery",table:"",customer:"Rahul Sharma",   waiter:"",             status:"paid",     total:280,  items:2, time:"11:30 AM"},
  ];

  const noteRef = useRef<HTMLTextAreaElement>(null);

  // ── Load initial data ──
  useEffect(() => {
    loadPosInitData().then(d => {
      setMenu(d.menuItems);
      setFloors(d.tables);
      setCustomers(d.customers);
      setWaiters(d.waiters);
      setDeliveryExecs(d.deliveryExecs);
    }).finally(() => setInitLoading(false));
    // overflow hidden for POS layout
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    if (notePopup) setTimeout(() => noteRef.current?.focus(), 80);
  }, [notePopup]);

  // ── Derived ──
  const allCats = useMemo(() => ["All", ...Array.from(new Set(menu.map(p => p.cat)))], [menu]);
  const cartItems = useMemo(() => Object.values(cart), [cart]);
  const cartCount = useMemo(() => cartItems.reduce((s,i)=>s+i.qty,0), [cartItems]);
  const subtotal = useMemo(() => cartItems.reduce((s,i)=>s+i.price*i.qty,0), [cartItems]);
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + tax + (channel==="delivery" ? delCharge : 0) - discAmt;
  const discPreview = useMemo(() => {
    const v = parseFloat(discVal) || 0;
    if (!v) return 0;
    if (discType==="percent") return Math.round(subtotal * v / 100);
    if (discType==="fixed") return Math.min(v, subtotal);
    return 0;
  }, [discVal, discType, subtotal]);

  // ── Grid items ──
  const gridItems = useMemo(() => {
    const mealCats = activeMealTime ? MEAL_TIMES.find(m=>m.key===activeMealTime)?.cats ?? null : null;
    if (srchQ) {
      return menu.filter(p => filters.has(p.type) && p.name.toLowerCase().includes(srchQ.toLowerCase()) && (!mealCats||mealCats.includes(p.cat)));
    }
    const srcCats = activeCat==="All" ? (mealCats || allCats.filter(c=>c!=="All")) : [activeCat];
    return srcCats.flatMap(cat => menu.filter(p => p.cat===cat && filters.has(p.type)));
  }, [menu, srchQ, activeCat, activeMealTime, filters, allCats]);

  // ── Handlers ──
  const toggleFilter = useCallback((f: string) => {
    setFilters(prev => {
      const next = new Set(prev);
      next.has(f) ? next.delete(f) : next.add(f);
      return next;
    });
  }, []);

  const addItem = useCallback((item: PosMenuItem) => {
    setCart(prev => {
      const existing = prev[item.id];
      return { ...prev, [item.id]: existing ? { ...existing, qty: existing.qty+1 } : { ...item, qty:1 } };
    });
    toast.success(`${item.name} added!`, { duration:1000 });
  }, []);

  const changeQty = useCallback((id: number, delta: number) => {
    setCart(prev => {
      const existing = prev[id];
      if (!existing) return prev;
      const newQty = existing.qty + delta;
      if (newQty <= 0) { const next = {...prev}; delete next[id]; return next; }
      return { ...prev, [id]: { ...existing, qty: newQty } };
    });
  }, []);

  const removeItem = useCallback((id: number) => {
    setCart(prev => { const next = {...prev}; delete next[id]; return next; });
  }, []);

  const clearCart = useCallback(() => { setCart({}); setPax(1); setWaiter(""); setDeliveryExec(""); setAssignedTable(null); setCustByChannel({dine:null,pickup:null,delivery:null}); setChannelNotes({dine:"",pickup:"",delivery:""}); setDiscAmt(0); setDiscLabel(""); setPayMode("Cash"); }, []);

  const openKotToken = () => {
    const t = kotToken;
    const now = new Date();
    setKotTime(now.toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"})+" · "+now.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"}));
    setKotToken(t);
    setKotPopup(true);
  };

  const handleCheckout = async () => {
    if (!cartItems.length) { toast.error("Cart empty hai!"); return; }
    try {
      const payload = {
        channel, payment_mode: payMode,
        items: cartItems.map(i => ({ menu_item_id:i.id, qty:i.qty, note:i.note, price:i.price })),
        pax, table_id: assignedTable?.id, waiter_id: waiter, delivery_exec_id: deliveryExec,
        delivery_charge: channel==="delivery" ? delCharge : undefined,
        discount_type: discLabel ? (discType as "percent"|"fixed"|"coupon") : undefined,
        discount_value: discAmt || undefined,
      };
      await createPosOrder(payload);
      const chan = {dine:"🍽️ Dine In",pickup:"🥡 Pickup",delivery:"🛵 Delivery"}[channel];
      toast.success(`${chan} order placed! ✓`);
      const n = kotToken.replace(/\D/g,"");
      setKotToken(`T-${String(parseInt(n||"0")+1).padStart(3,"0")}`);
      clearCart();
    } catch { toast.error("Order place karne mein error!"); }
  };

  const handleKot = () => {
    if (!cartItems.length) { toast.error("Cart empty hai!"); return; }
    const n = kotToken.replace(/\D/g,"");
    setKotToken(`T-${String(parseInt(n||"0")+1).padStart(3,"0")}`);
    toast.success("KOT sent 🖨️");
  };

  const applyDiscount = async () => {
    const v = parseFloat(discVal) || 0;
    if (discType==="coupon") {
      if (!couponCode.trim()) { toast.error("Coupon code enter karo"); return; }
      const res = await validateCoupon(couponCode.trim(), subtotal);
      if (!res.valid) { toast.error("Invalid coupon code!"); return; }
      const amt = res.discount_type==="percent" ? Math.round(subtotal*res.value/100) : Math.min(res.value,subtotal);
      setDiscAmt(amt); setDiscLabel(`${couponCode.toUpperCase()}: -₹${amt}`);
      setDiscPopup(false); toast.success(`Coupon applied! -₹${amt}`); return;
    }
    if (!v) { toast.error("Discount amount enter karo"); return; }
    const amt = discType==="percent" ? Math.round(subtotal*v/100) : Math.min(v,subtotal);
    setDiscAmt(amt); setDiscLabel(discType==="percent"?`${v}% off`:`₹${v} off`);
    setDiscPopup(false); toast.success(`Discount applied! -₹${amt}`);
  };

  const saveCust = async () => {
    const { name, phone } = newCust;
    if (!name.trim()||!phone.trim()) { toast.error("Naam aur phone required!"); return; }
    let c: PosCustomer;
    try { c = await createPosCustomer({ name:name.trim(), phone:phone.trim(), addr:newCust.addr, email:newCust.email, pincode:newCust.pin, note:newCust.note }); }
    catch { c = { id:Date.now(), name:name.trim(), phone:phone.trim(), addr:newCust.addr, orders:0, initials:name.slice(0,2).toUpperCase() }; }
    setCustomers(prev => [c, ...prev]);
    setCustByChannel(prev => ({ ...prev, [custPopup!]: c }));
    setCustPopup(null); setNewCust({ name:"",phone:"",addr:"",email:"",pin:"",note:"" });
    toast.success(`${c.name} added ✓`);
  };

  const filteredCustomers = useMemo(() =>
    custSearch ? customers.filter(c => c.name.toLowerCase().includes(custSearch.toLowerCase())||c.phone.includes(custSearch)) : customers,
  [customers, custSearch]);

  const selectCust = (c: PosCustomer) => {
    setCustByChannel(prev => ({ ...prev, [custPopup!]: c }));
    setCustPopup(null); toast.success(`${c.name} selected ✓`);
  };

  const openPickupDate = () => {
    const now = new Date();
    setPickupDateInput(now.toISOString().split("T")[0]);
    setPickupDatePopup(true);
  };
  const applyPickupDate = () => {
    if (!pickupDateInput) { toast.error("Date select karein"); return; }
    const d = new Date(pickupDateInput);
    const today = new Date(); today.setHours(0,0,0,0);
    const label = d.getTime()===today.getTime() ? "Today" : d.toLocaleDateString("en-IN",{day:"2-digit",month:"short"});
    setPickupDate(label); setPickupDatePopup(false); toast.success(`Date set: ${label} ✓`);
  };
  const openPickupTime = () => {
    const now = new Date();
    setPickupTimeInput(`${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`);
    setPickupTimePopup(true);
  };
  const applyPickupTime = () => {
    if (!pickupTimeInput) { toast.error("Time select karein"); return; }
    const [h, m] = pickupTimeInput.split(":");
    const hr = parseInt(h); const ampm = hr>=12?"PM":"AM"; const h12 = hr%12||12;
    const label = `${h12}:${m} ${ampm}`;
    setPickupTime(label); setPickupTimePopup(false); toast.success(`Time set: ${label} ✓`);
  };
  const setPickupTimePreset = (v: "now"|number) => {
    const now = new Date();
    if (v==="now") { setPickupTimeInput(`${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`); return; }
    now.setMinutes(now.getMinutes()+(v as number));
    setPickupTimeInput(`${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`);
  };

  const custPill = (ch: "dine"|"pickup"|"delivery") => {
    const c = custByChannel[ch];
    const short = c?.name.split(" ")[0] ?? "";
    return c ? { filled:true, label:`${short} · ${ch==="delivery"&&c.addr?c.addr.slice(0,18)+"…":c.phone}`, initials:c.initials } : { filled:false, label:"+ Add Customer", initials:"👤" };
  };

  const chStripColor = { dine:C.ac, pickup:C.grn, delivery:C.blu }[channel];

  const finalBtnLabel = channel==="delivery" ? "🛵 Dispatch" : channel==="pickup" ? "✅ Ready & Pay" : "✅ Bill & Pay";

  // ── Pill button style ──
  const pillSx = { display:"flex",alignItems:"center",gap:"4px",px:"13px",py:"6px",background:"transparent",border:`1.5px solid ${C.bd2}`,borderRadius:"8px",cursor:"pointer",fontSize:12,color:C.tx,fontWeight:600,fontFamily:FONT,transition:"all .15s","&:hover":{borderColor:C.ac,color:C.ac,background:C.adim} };
  const mcSx   = { display:"flex",alignItems:"center",gap:"4px",px:"8px",py:"4px",background:C.s1,border:`1px solid ${C.bd}`,borderRadius:"8px",fontSize:11,color:C.t2,cursor:"pointer",fontWeight:600,fontFamily:FONT,transition:"all .14s","&:hover":{borderColor:C.bd2,background:C.s2} };
  const pmSx   = (active:boolean) => ({ display:"flex",alignItems:"center",justifyContent:"center",gap:"3px",px:"8px",py:"6px",background:active?"rgba(255,61,1,.22)":C.dark3,border:`1.5px solid ${active?"rgba(255,61,1,.5)":"rgba(255,255,255,.1)"}`,borderRadius:"8px",fontSize:11,fontWeight:700,cursor:"pointer",color:active?"#FF3D01":"rgba(255,255,255,.65)",fontFamily:FONT,transition:"all .14s",whiteSpace:"nowrap" as const,flexShrink:0,"&:hover":{background:active?"rgba(255,61,1,.3)":"#453d36",color:active?"#FF3D01":"#fff"} });

  // ─── Table grid item styles ──
  const tblCardSx = (s: string) => ({
    border:`1.5px solid ${s==="avail"?C.bd:s==="running"?"#93c5fd":s==="print"?"#fde047":"#fca5a5"}`,
    borderRadius:"14px", padding:"13px", minHeight:115, display:"flex", flexDirection:"column" as const,
    cursor: s==="reserved"?"not-allowed":"pointer", transition:"all .16s", position:"relative" as const,
    background: s==="avail"?C.w:s==="running"?"#dbeafe":s==="print"?"#fef9c3":"#ffe4e6",
    "&:hover":{ transform: s!=="reserved"?"translateY(-2px)":"none", boxShadow: s!=="reserved"?"0 8px 28px rgba(0,0,0,.1)":"none" }
  });
  const tcNameColor = (s: string) => s==="avail"?"#9ca3af":s==="running"?"#1d4ed8":s==="print"?"#854d0e":"#991b1b";

  if (initLoading) return (
    <Box sx={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:C.bg,flexDirection:"column",gap:2,fontFamily:FONT}}>
      <Box sx={{width:40,height:40,border:`4px solid ${C.bd}`,borderTop:`4px solid ${C.ac}`,borderRadius:"50%",animation:"spin .9s linear infinite"}} />
      <Typography sx={{fontSize:13,fontWeight:600,color:C.t2,fontFamily:FONT}}>POS load ho raha hai…</Typography>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}@keyframes fadeUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </Box>
  );

  return (
    <Box sx={{fontFamily:FONT,background:C.bg,color:C.tx,height:"100vh",overflow:"hidden",display:"flex",flexDirection:"column",fontSize:14}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes popIn{from{opacity:0;transform:scale(.93) translateY(12px)}to{opacity:1;transform:scale(1) translateY(0)}}
        @keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-thumb{background:#cec4b8;border-radius:4px}
      `}</style>

      {/* ══ TOPBAR ══ */}
      <Box sx={{display:"flex",alignItems:"center",px:"18px",height:56,background:C.w,borderBottom:`1.5px solid ${C.bd}`,gap:"8px",flexShrink:0,boxShadow:`0 1px 0 ${C.bd},0 2px 10px rgba(0,0,0,.05)`,zIndex:20}}>
        <Typography sx={{fontFamily:FONT,fontSize:22,fontWeight:800,color:C.tx,letterSpacing:"-.5px",mr:"4px"}}>Bhojpe</Typography>
        <Box sx={{width:1,height:28,background:C.bd,mx:"2px",flexShrink:0}} />

        {/* Order pills */}
        <Box component="button" sx={{...pillSx,fontWeight:800}} onClick={()=>toast("Order #"+orderNo)}>
          📋 #{orderNo} <Box component="span" sx={{minWidth:16,height:16,borderRadius:"8px",px:"4px",background:cartCount>0?C.ac:C.s3,color:cartCount>0?"#fff":C.t3,fontSize:9,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center"}}>{cartCount}</Box>
        </Box>

        <Box sx={{flex:1}} />

        {/* Nav icons */}
        <Box sx={{display:"flex",alignItems:"center",gap:"1px"}}>
          {[
            { icon:"🪑", label:"Tables",  onClick:()=>setTablesPageOpen(true) },
            { icon:"📋", label:"Orders",  onClick:()=>setOrdersPageOpen(true) },
            { icon:"🔔", label:"Alerts",  onClick:()=>toast("No new alerts") },
            { icon:"⚙️", label:"Settings",onClick:()=>toast("Settings") },
          ].map(b => (
            <Box key={b.label} component="button" title={b.label} onClick={b.onClick}
              sx={{width:34,height:34,borderRadius:"7px",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",border:"none",background:"none",fontSize:16,transition:"all .15s","&:hover":{background:C.s2}}}>
              {b.icon}
            </Box>
          ))}
          <Box component="button" onClick={()=>{ if(window.confirm("New order? Cart clear ho jaayega.")) clearCart(); }}
            sx={{ml:"4px",px:"16px",py:"7px",background:C.ac,border:"none",borderRadius:"8px",color:"#fff",fontFamily:FONT,fontWeight:700,fontSize:12.5,cursor:"pointer",display:"flex",alignItems:"center",gap:"5px",boxShadow:"0 2px 8px rgba(255,61,1,.28)",transition:"all .15s","&:hover":{background:C.ah}}}>
            + New Order
          </Box>
        </Box>
      </Box>

      {/* ══ POS BODY ══ */}
      <Box sx={{display:"flex",flex:1,overflow:"hidden",minHeight:0}}>

        {/* ══ SIDEBAR ══ */}
        <Box sx={{width:164,background:C.w,borderRight:`1px solid ${C.bd}`,display:"flex",flexDirection:"column",flexShrink:0,overflow:"hidden"}}>
          {/* Tabs: Cat / Menu */}
          <Box sx={{display:"grid",gridTemplateColumns:"1fr 1fr",borderBottom:`1px solid ${C.bd}`,flexShrink:0}}>
            {(["cat","menu"] as const).map(m => (
              <Box key={m} component="button" onClick={()=>{setSideMode(m);setActiveCat("All");setActiveMealTime(null);}}
                sx={{py:"9px",textAlign:"center",fontSize:11,fontWeight:700,cursor:"pointer",color:sideMode===m?C.ac:C.t3,border:"none",background:sideMode===m?C.adim:"none",fontFamily:FONT,letterSpacing:".4px",textTransform:"uppercase",transition:"all .15s",borderBottom:`2px solid ${sideMode===m?C.ac:"transparent"}`}}>
                {m==="cat"?"CATEGORY":"MEAL"}
              </Box>
            ))}
          </Box>

          {/* Category / Meal list */}
          <Box sx={{flex:1,overflowY:"auto",py:"5px",px:"7px",pb:"8px"}}>
            {sideMode==="cat" ? allCats.map(cat => {
              const cnt = cat==="All" ? menu.length : menu.filter(p=>p.cat===cat).length;
              const active = activeCat===cat;
              return (
                <Box key={cat} onClick={()=>{setActiveCat(cat);setActiveMealTime(null);}}
                  sx={{display:"flex",alignItems:"center",justifyContent:"space-between",px:"9px",py:"8px",borderRadius:"10px",mb:"2px",cursor:"pointer",fontSize:12.5,color:active?C.ac:C.t2,fontWeight:active?700:500,transition:"all .14s",border:`1.5px solid ${active?C.abdr:"transparent"}`,background:active?C.adim:"transparent","&:hover":{background:active?C.adim:C.s2,color:active?C.ac:C.tx}}}>
                  {cat}
                  <Box component="span" sx={{fontSize:"9.5px",fontWeight:700,px:"6px",py:"1px",borderRadius:"8px",background:active?C.amid:C.s2,color:active?C.ac:C.t3}}>{cnt}</Box>
                </Box>
              );
            }) : MEAL_TIMES.map(mt => {
              const isActive = activeMealTime===mt.key;
              const cnt = mt.cats.reduce((s,c)=>s+menu.filter(p=>p.cat===c).length,0);
              return (
                <Box key={mt.key}>
                  <Box onClick={()=>{setActiveMealTime(activeMealTime===mt.key?null:mt.key);setActiveCat("All");}}
                    sx={{display:"flex",alignItems:"center",justifyContent:"space-between",px:"9px",py:"8px",borderRadius:"10px",mb:"2px",cursor:"pointer",fontSize:12.5,fontWeight:700,transition:"all .14s",border:`1.5px solid ${isActive?C.abdr:"transparent"}`,background:isActive?C.adim:"transparent",color:isActive?C.ac:C.t2,"&:hover":{background:isActive?C.adim:C.s2}}}>
                    <span>{mt.icon} {mt.key}</span>
                    <Box component="span" sx={{fontSize:"9.5px",fontWeight:700,px:"6px",py:"1px",borderRadius:"8px",background:isActive?C.amid:C.s2,color:isActive?C.ac:C.t3}}>{cnt}</Box>
                  </Box>
                  {isActive && mt.cats.map(cat => {
                    const items = menu.filter(p=>p.cat===cat);
                    if (!items.length) return null;
                    return (
                      <Box key={cat} sx={{pl:"12px",mb:"4px"}}>
                        <Typography sx={{fontSize:9,fontWeight:800,textTransform:"uppercase",letterSpacing:".8px",color:C.t3,px:"9px",pt:"6px",pb:"2px"}}>{cat}</Typography>
                        {items.map(p=>(
                          <Box key={p.id} onClick={()=>addItem(p)} sx={{display:"flex",alignItems:"center",gap:"6px",px:"9px",py:"5px",borderRadius:"8px",cursor:"pointer",transition:"background .14s",mb:"1px","&:hover":{background:C.s2}}}>
                            <span style={{fontSize:15}}>{p.img}</span>
                            <Typography sx={{fontSize:12,fontWeight:600,color:C.t2,flex:1,lineHeight:1.2}}>{p.name}</Typography>
                            <Typography sx={{fontSize:11,fontWeight:800,color:C.ac}}>₹{p.price}</Typography>
                          </Box>
                        ))}
                      </Box>
                    );
                  })}
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* ══ CENTER ══ */}
        <Box sx={{display:"flex",flexDirection:"column",flex:1,overflow:"hidden",minWidth:0}}>
          {/* Search + Filter chips */}
          <Box sx={{display:"flex",alignItems:"center",gap:"9px",px:"12px",py:"8px",background:C.w,borderBottom:`1px solid ${C.bd}`,flexShrink:0}}>
            <Box sx={{position:"relative",flex:1,maxWidth:340}}>
              <Box component="span" sx={{position:"absolute",left:9,top:"50%",transform:"translateY(-50%)",color:C.t3,fontSize:14}}>🔍</Box>
              <Box component="input" value={srchQ} onChange={(e:any)=>setSrchQ(e.target.value)} placeholder="Search menu items…"
                sx={{width:"100%",background:C.s1,border:`1.5px solid ${C.bd}`,borderRadius:"10px",py:"7px",pl:"30px",pr:"10px",color:C.tx,fontFamily:FONT,fontSize:12.5,outline:"none",transition:"border-color .2s","&:focus":{borderColor:C.ac,background:C.w},"&::placeholder":{color:C.t3}}} />
            </Box>
            <Box sx={{display:"flex",gap:"4px"}}>
              {(["veg","nonveg","egg"] as const).map(f => {
                const on = filters.has(f);
                const color = f==="veg"?C.grn:f==="nonveg"?C.red:C.yel;
                const dimBg = f==="veg"?C.gdim:f==="nonveg"?C.rdim:C.ydim;
                const bdr = f==="veg"?C.gbdr:f==="nonveg"?C.rbdr:C.ybdr;
                return (
                  <Box key={f} component="button" onClick={()=>toggleFilter(f)}
                    sx={{px:"10px",py:"4px",borderRadius:"20px",fontSize:11,fontWeight:700,cursor:"pointer",border:`1.5px solid ${on?bdr:C.bd}`,background:on?dimBg:"transparent",color:on?color:C.t3,fontFamily:FONT,transition:"all .14s",opacity:on?1:.4}}>
                    ● {f==="veg"?"Veg":f==="nonveg"?"Non-Veg":"Egg"}
                  </Box>
                );
              })}
            </Box>
          </Box>

          {/* Product Grid */}
          <Box sx={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"9px",px:"12px",py:"11px",overflowY:"auto",flex:1,alignContent:"start"}}>
            {gridItems.length===0 ? (
              <Box sx={{gridColumn:"1/-1",textAlign:"center",color:C.t3,py:"3rem",fontSize:13}}>Koi item nahi mila</Box>
            ) : gridItems.map(p => {
              const qty = cart[p.id]?.qty ?? 0;
              const inCart = qty > 0;
              return (
                <Box key={p.id} onClick={()=>addItem(p)}
                  sx={{background:C.w,border:`1.5px solid ${inCart?C.ac:C.bd}`,borderRadius:"14px",overflow:"hidden",cursor:"pointer",transition:"all .15s",display:"flex",flexDirection:"column",boxShadow:`0 1px 3px rgba(0,0,0,.06),0 2px 8px rgba(0,0,0,.04)`,position:"relative",boxSizing:"border-box","&:hover":{borderColor:inCart?C.ac:C.bd2,transform:"translateY(-2px)",boxShadow:"0 8px 28px rgba(0,0,0,.1)"},...(inCart?{boxShadow:`0 0 0 2px ${C.adim}`}:{})}}>
                  {/* Image area */}
                  <Box sx={{width:"100%",aspectRatio:"4/3",overflow:"hidden",background:"linear-gradient(145deg,#fff4ee,#fce3d4)",display:"flex",alignItems:"center",justifyContent:"center",position:"relative"}}>
                    <VDot type={p.type} />
                    <Box sx={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:"4px",transition:"transform .18s","&:hover":{transform:"scale(1.06)"}}}>
                      <span style={{fontSize:36}}>{p.img}</span>
                      <Typography sx={{fontSize:"8.5px",fontWeight:700,letterSpacing:".6px",color:"#d4a090",textTransform:"uppercase"}}>{p.cat}</Typography>
                    </Box>
                    {inCart && <Box sx={{position:"absolute",top:6,right:6,minWidth:19,height:19,borderRadius:"10px",px:"4px",background:C.ac,color:"#fff",fontSize:"9.5px",fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 2px 6px rgba(255,61,1,.35)"}}>{qty}</Box>}
                  </Box>
                  {/* Body */}
                  <Box sx={{px:"9px",pt:"7px",pb:"10px",display:"flex",flexDirection:"column",gap:"3px"}}>
                    <Typography sx={{fontSize:11.5,fontWeight:700,color:C.tx,lineHeight:1.3}}>{p.name}</Typography>
                    <Typography sx={{fontSize:13,fontWeight:800,color:C.ac}}>₹{p.price}</Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* ══ CART ══ */}
        <Box sx={{width:360,background:C.w,borderLeft:`1px solid ${C.bd}`,display:"flex",flexDirection:"column",flexShrink:0,boxShadow:"-3px 0 14px rgba(0,0,0,.05)",minHeight:0,overflow:"hidden"}}>
          {/* Channel color strip */}
          <Box sx={{height:3,flexShrink:0,background:chStripColor,transition:"background .2s"}} />

          {/* Channel Tabs */}
          <Box sx={{display:"flex",background:C.s1,borderBottom:`1px solid ${C.bd}`,flexShrink:0}}>
            {(["dine","pickup","delivery"] as const).map(ch => {
              const active = channel===ch;
              const label = { dine:"Dine In", pickup:"Pickup", delivery:"Delivery" }[ch];
              return (
                <Box key={ch} component="button" onClick={()=>setChannel(ch)}
                  sx={{flex:1,py:"9px",textAlign:"center",cursor:"pointer",color:active?C.ac:C.t3,border:"none",background:active?C.w:"transparent",fontFamily:FONT,transition:"all .14s",borderBottom:`2.5px solid ${active?C.ac:"transparent"}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center","&:hover":{color:active?C.ac:C.t2}}}>
                  <Typography sx={{fontSize:12,fontWeight:700,letterSpacing:".3px",textTransform:"uppercase",fontFamily:FONT}}>{label}</Typography>
                </Box>
              );
            })}
          </Box>

          {/* Channel meta: Dine In */}
          {channel==="dine" && (
            <Box sx={{flexShrink:0,borderBottom:`1px solid ${C.bd}`}}>
              <Box sx={{display:"flex",alignItems:"center",gap:"5px",flexWrap:"wrap",px:"11px",py:"7px",borderBottom:`1px solid ${C.bd}`}}>
                <Box component="button" sx={{...mcSx,fontWeight:800}}>📋 #{orderNo}</Box>
                <Box sx={{...mcSx,cursor:"default"}}>
                  Pax&nbsp;
                  <Box sx={{display:"flex",alignItems:"center",gap:"2px"}}>
                    {[{d:-1},{d:1}].map(({d},i) => (
                      <Box key={i} component="button" onClick={()=>setPax(Math.max(1,pax+d))} sx={{width:17,height:17,border:`1px solid ${C.bd2}`,borderRadius:"4px",background:C.w,cursor:"pointer",fontSize:12,color:C.tx,display:"flex",alignItems:"center",justifyContent:"center",transition:"background .14s","&:hover":{background:C.s3}}}>{d<0?"−":"+"}</Box>
                    ))}
                    <Typography sx={{fontSize:12,fontWeight:800,minWidth:14,textAlign:"center"}}>{pax}</Typography>
                  </Box>
                </Box>
                <Box component="button" onClick={()=>setAssignTablePopup(true)} sx={{...mcSx,...(assignedTable?{background:C.adim,borderColor:C.abdr,color:C.ac,fontWeight:700}:{})}}>
                  🪑 {assignedTable?assignedTable.name:"Assign Table"}
                </Box>
                <Box component="button" onClick={()=>setMergeTablePopup(true)} sx={mcSx}>⇄ Merge</Box>
                <Box component="button" onClick={()=>{setNotePopup({type:"channel",id:"dine"});setNoteText(channelNotes.dine);}} sx={{...mcSx,...(channelNotes.dine?{background:C.adim,borderColor:C.abdr,color:C.ac,fontWeight:700}:{})}}><NoteIcon />&nbsp;Note</Box>
                <Box component="button" onClick={openKotToken} sx={{...mcSx,display:"flex",alignItems:"center",gap:"4px"}}>🔖 KOT Token</Box>
              </Box>
              <Box sx={{display:"flex",alignItems:"center",gap:"6px",px:"11px",py:"6px"}}>
                <Box component="button" onClick={()=>{setCustPopup("dine");setCustTab("recent");setCustSearch("");}} sx={{flex:1,display:"flex",alignItems:"center",gap:"5px",px:"10px",py:"4px",background:custPill("dine").filled?C.gdim:C.s1,border:`1px solid ${custPill("dine").filled?C.gbdr:C.bd}`,borderRadius:"8px",fontSize:11,cursor:"pointer",fontWeight:600,fontFamily:FONT,color:custPill("dine").filled?C.grn:C.t2,transition:"all .14s","&:hover":{borderColor:C.bd2}}}>
                  <Box sx={{width:18,height:18,borderRadius:"50%",background:custPill("dine").filled?C.gbdr:C.ac,color:"#fff",fontSize:9,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{custPill("dine").initials}</Box>
                  <Typography sx={{fontSize:11,fontWeight:600,fontFamily:FONT,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{custPill("dine").label}</Typography>
                </Box>
                <Box component="select" value={waiter} onChange={(e:any)=>setWaiter(e.target.value)} sx={{flex:1,px:"8px",py:"5px",background:waiter?C.gdim:C.s1,border:`1.5px solid ${waiter?C.gbdr:C.bd}`,borderRadius:"8px",fontFamily:FONT,fontSize:11.5,fontWeight:600,color:waiter?C.grn:C.t2,outline:"none",cursor:"pointer",appearance:"none",maxWidth:160}}>
                  <option value="">🙋 Waiter ▾</option>
                  {waiters.map(w=><option key={w.id} value={w.id}>{w.name}</option>)}
                </Box>
              </Box>
            </Box>
          )}

          {/* Channel meta: Pickup */}
          {channel==="pickup" && (
            <Box sx={{flexShrink:0,borderBottom:`1px solid ${C.bd}`}}>
              <Box sx={{display:"flex",alignItems:"center",gap:"5px",flexWrap:"wrap",px:"11px",py:"7px",borderBottom:`1px solid ${C.bd}`}}>
                <Box component="button" sx={{...mcSx,fontWeight:800}}>📋 #{orderNo}</Box>
                <Box sx={{display:"flex",alignItems:"center",gap:"4px",px:"10px",py:"4px",background:"#fff7ed",border:"1.5px solid #fdba74",borderRadius:"8px",fontSize:11,fontWeight:800,color:"#c2410c",whiteSpace:"nowrap"}}>🔖 P-001</Box>
                <Box component="button" onClick={openPickupDate} sx={{...mcSx,background:C.adim,borderColor:C.abdr,color:C.ac,fontWeight:700}}>📅 {pickupDate}</Box>
                <Box component="button" onClick={openPickupTime} sx={{...mcSx,background:C.adim,borderColor:C.abdr,color:C.ac,fontWeight:700}}>🕐 {pickupTime}</Box>
                <Box component="button" onClick={()=>{setNotePopup({type:"channel",id:"pickup"});setNoteText(channelNotes.pickup);}} sx={{...mcSx,...(channelNotes.pickup?{background:C.adim,borderColor:C.abdr,color:C.ac,fontWeight:700}:{})}}><NoteIcon />&nbsp;Note</Box>
              </Box>
              <Box sx={{display:"flex",alignItems:"center",gap:"6px",px:"11px",py:"6px"}}>
                <Box component="button" onClick={()=>{setCustPopup("pickup");setCustTab("recent");setCustSearch("");}} sx={{flex:1,display:"flex",alignItems:"center",gap:"5px",px:"10px",py:"4px",background:custPill("pickup").filled?C.gdim:C.s1,border:`1px solid ${custPill("pickup").filled?C.gbdr:C.bd}`,borderRadius:"8px",fontSize:11,cursor:"pointer",fontWeight:600,fontFamily:FONT,color:custPill("pickup").filled?C.grn:C.t2,transition:"all .14s"}}>
                  <Box sx={{width:18,height:18,borderRadius:"50%",background:C.ac,color:"#fff",fontSize:9,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{custPill("pickup").initials}</Box>
                  <Typography sx={{fontSize:11,fontWeight:600,fontFamily:FONT,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{custPill("pickup").label}</Typography>
                </Box>
                <Box component="select" value={waiter} onChange={(e:any)=>setWaiter(e.target.value)} sx={{flex:1,px:"8px",py:"5px",background:waiter?C.gdim:C.s1,border:`1.5px solid ${waiter?C.gbdr:C.bd}`,borderRadius:"8px",fontFamily:FONT,fontSize:11.5,fontWeight:600,color:waiter?C.grn:C.t2,outline:"none",cursor:"pointer",appearance:"none",maxWidth:160}}>
                  <option value="">🙋 Waiter ▾</option>
                  {waiters.map(w=><option key={w.id} value={w.id}>{w.name}</option>)}
                </Box>
              </Box>
            </Box>
          )}

          {/* Channel meta: Delivery */}
          {channel==="delivery" && (
            <Box sx={{flexShrink:0,borderBottom:`1px solid ${C.bd}`}}>
              <Box sx={{display:"flex",alignItems:"center",gap:"6px",px:"11px",py:"7px",background:C.s1,borderBottom:`1px solid ${C.bd}`,flexWrap:"wrap"}}>
                <Box component="button" sx={{...mcSx,fontWeight:800}}>📋 #{orderNo}</Box>
                <Box component="button" onClick={()=>{setNotePopup({type:"channel",id:"delivery"});setNoteText(channelNotes.delivery);}} sx={{...mcSx,...(channelNotes.delivery?{background:C.adim,borderColor:C.abdr,color:C.ac,fontWeight:700}:{})}}><NoteIcon />&nbsp;Note</Box>
                <Box component="select" value={platform} onChange={(e:any)=>setPlatform(e.target.value)}
                  sx={{flex:1,maxWidth:180,px:"8px",py:"5px",background:platform==="bhojpe"?C.adim:platform==="zomato"?"#fff0f0":platform==="swiggy"?"#fff7ed":C.w,border:`1.5px solid ${platform==="bhojpe"?C.abdr:platform==="zomato"?"#fca5a5":platform==="swiggy"?"#fdba74":C.bd}`,borderRadius:"8px",fontFamily:FONT,fontSize:12,fontWeight:700,color:platform==="bhojpe"?C.ac:platform==="zomato"?"#dc2626":platform==="swiggy"?"#ea580c":C.tx,outline:"none",cursor:"pointer",appearance:"none"}}>
                  <option value="bhojpe">🔴 Bhojpe App</option>
                  <option value="zomato">🔴 Zomato</option>
                  <option value="swiggy">🟠 Swiggy</option>
                  <option value="manual">📞 Direct Call</option>
                  <option value="website">🌐 Website</option>
                </Box>
              </Box>
              <Box sx={{display:"flex",alignItems:"center",gap:"6px",px:"11px",py:"6px"}}>
                <Box component="button" onClick={()=>{setCustPopup("delivery");setCustTab("recent");setCustSearch("");}} sx={{flex:1,display:"flex",alignItems:"center",gap:"5px",px:"10px",py:"4px",background:custPill("delivery").filled?C.gdim:C.s1,border:`1px solid ${custPill("delivery").filled?C.gbdr:C.bd}`,borderRadius:"8px",fontSize:11,cursor:"pointer",fontWeight:600,fontFamily:FONT,color:custPill("delivery").filled?C.grn:C.t2,transition:"all .14s"}}>
                  <Box sx={{width:18,height:18,borderRadius:"50%",background:C.ac,color:"#fff",fontSize:9,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{custPill("delivery").initials}</Box>
                  <Typography sx={{fontSize:11,fontWeight:600,fontFamily:FONT,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{custPill("delivery").label}</Typography>
                </Box>
                <Box component="select" value={deliveryExec} onChange={(e:any)=>setDeliveryExec(e.target.value)} sx={{flex:1,px:"8px",py:"5px",background:deliveryExec?C.gdim:C.s1,border:`1.5px solid ${deliveryExec?C.gbdr:C.bd}`,borderRadius:"8px",fontFamily:FONT,fontSize:11.5,fontWeight:600,color:deliveryExec?C.grn:C.t2,outline:"none",cursor:"pointer",appearance:"none",maxWidth:160}}>
                  <option value="">🛵 Delivery Boy ▾</option>
                  {deliveryExecs.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}
                </Box>
              </Box>
            </Box>
          )}

          {/* Cart body */}
          <Box sx={{flex:1,overflowY:"auto",px:"10px",py:"2px",minHeight:0}}>
            {cartItems.length===0 ? (
              <Box sx={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",gap:"7px",p:"20px"}}>
                <Typography sx={{fontSize:38,opacity:.25}}>🛒</Typography>
                <Typography sx={{fontSize:13.5,fontWeight:700,color:C.t2}}>Cart is empty</Typography>
                <Typography sx={{fontSize:11,color:C.t3}}>Menu se item chunein</Typography>
              </Box>
            ) : cartItems.map(item => {
              const hasNote = !!(item.note?.trim());
              return (
                <Box key={item.id} sx={{py:"7px",borderBottom:`1px solid ${C.bd}`,animation:"fadeUp .18s ease"}}>
                  <Box sx={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:"6px",mb:"5px"}}>
                    <Box sx={{flex:1,minWidth:0}}>
                      <Typography sx={{fontSize:12.5,fontWeight:700,color:C.tx,lineHeight:1.2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{item.name}</Typography>
                      <Typography sx={{fontSize:10,color:C.t3,mt:"1px"}}>₹{item.price} / item</Typography>
                    </Box>
                    <Typography sx={{fontSize:13,fontWeight:800,color:C.ac,flexShrink:0}}>₹{(item.price*item.qty).toFixed(0)}</Typography>
                  </Box>
                  <Box sx={{display:"flex",alignItems:"center",gap:"5px"}}>
                    {/* Stepper */}
                    <Box sx={{display:"flex",alignItems:"center",background:C.s1,border:`1.5px solid ${C.bd}`,borderRadius:"7px",overflow:"hidden"}}>
                      {[-1,1].map(d=>(
                        <Box key={d} component="button" onClick={()=>changeQty(item.id,d)} sx={{width:26,height:24,border:"none",background:"none",fontSize:15,fontWeight:700,cursor:"pointer",color:C.tx,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:FONT,transition:"background .13s","&:hover":{background:C.s3}}}>{d<0?"−":"+"}</Box>
                      ))}
                      <Typography sx={{fontSize:12,fontWeight:800,minWidth:22,textAlign:"center",color:C.tx,borderLeft:`1px solid ${C.bd}`,borderRight:`1px solid ${C.bd}`,height:24,lineHeight:"24px"}}>{item.qty}</Typography>
                    </Box>
                    {/* Note btn */}
                    <Box component="button" onClick={()=>{setNotePopup({type:"item",id:item.id});setNoteText(item.note||"");}}
                      sx={{flex:1,display:"flex",justifyContent:"center",px:"8px",py:"2px",borderRadius:"6px",cursor:"pointer",fontSize:"9.5px",fontWeight:hasNote?700:600,color:hasNote?C.ac:C.t3,border:`1px ${hasNote?"solid dashed".split(" ")[0]:"dashed"} ${hasNote?"rgba(255,61,1,.4)":C.bd2}`,background:hasNote?"rgba(255,61,1,.1)":"none",fontFamily:FONT,transition:"all .14s",alignItems:"center",gap:"3px","&:hover":{background:hasNote?"rgba(255,61,1,.15)":C.s2,color:hasNote?C.ac:C.t2}}}>
                      <NoteIcon /> {hasNote ? item.note!.slice(0,12)+(item.note!.length>12?"…":"") : "Note"}
                    </Box>
                    {/* Delete */}
                    <Box component="button" onClick={()=>removeItem(item.id)} sx={{width:24,height:24,borderRadius:"6px",flexShrink:0,background:C.rdim,border:`1.5px solid ${C.rbdr}`,color:C.red,cursor:"pointer",fontSize:12,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,transition:"all .14s","&:hover":{background:C.red,color:"#fff"}}}>✕</Box>
                  </Box>
                </Box>
              );
            })}
          </Box>

          {/* ── Cart Footer ── */}
          <Box sx={{borderTop:`1.5px solid rgba(255,255,255,.08)`,flexShrink:0,background:C.dark}}>

            {/* Summary Drawer */}
            <Box sx={{borderBottom:`1px solid rgba(255,255,255,.08)`}}>
              <Box onClick={()=>setSummaryOpen(!summaryOpen)} sx={{display:"flex",alignItems:"center",justifyContent:"space-between",px:"11px",py:"9px",cursor:"pointer",background:"#2e2a26",transition:"background .14s",userSelect:"none",borderBottom:`1px solid rgba(255,255,255,.07)`,"&:hover":{background:"#343028"}}}>
                <Box sx={{display:"flex",alignItems:"center",gap:"8px"}}>
                  <Typography sx={{fontSize:12,fontWeight:700,color:"rgba(255,255,255,.5)"}}>Order Total</Typography>
                  <Typography sx={{fontFamily:SERIF,fontSize:18,fontWeight:700,color:"#FF3D01"}}>₹{total}</Typography>
                  <Typography sx={{fontSize:11,color:"rgba(255,255,255,.3)",fontWeight:500,ml:"4px"}}>({cartCount} item{cartCount!==1?"s":""})</Typography>
                </Box>
                <Box sx={{display:"flex",alignItems:"center",gap:"7px"}}>
                  <Box component="button" onClick={(e:any)=>{e.stopPropagation();setSummaryOpen(true);}} sx={{px:"10px",py:"4px",background:"rgba(255,61,1,.18)",border:"1.5px solid rgba(255,61,1,.35)",borderRadius:"20px",fontSize:11,fontWeight:700,color:"#FF3D01",cursor:"pointer",transition:"all .14s","&:hover":{background:"rgba(255,61,1,.28)"}}}>View Bill</Box>
                  <Typography sx={{fontSize:11,color:"rgba(255,255,255,.3)",transition:"transform .22s",transform:summaryOpen?"rotate(180deg)":"rotate(0deg)"}}>▼</Typography>
                </Box>
              </Box>

              {summaryOpen && (
                <Box>
                  <Box sx={{px:"11px",py:"10px",display:"flex",flexDirection:"column",gap:"5px",background:"#2e2a26"}}>
                    {[
                      {label:"Subtotal",val:`₹${subtotal}`},
                      {label:"GST (5%)",val:`₹${tax}`},
                      ...(channel==="delivery"&&delCharge>0?[{label:"🛵 Delivery Charge",val:`₹${delCharge}`,color:C.blu}]:[]),
                      ...(discAmt>0?[{label:`🏷️ Discount (${discLabel})`,val:`-₹${discAmt}`,color:C.grn,hasRemove:true}]:[]),
                    ].map((r,i) => (
                      <Box key={i} sx={{display:"flex",alignItems:"center",justifyContent:"space-between",fontSize:12}}>
                        <Typography sx={{color:"rgba(255,255,255,.5)",fontWeight:500,fontSize:12}}>{r.label}</Typography>
                        <Box sx={{display:"flex",alignItems:"center",gap:"6px"}}>
                          <Typography sx={{fontWeight:700,color:(r as any).color??"rgba(255,255,255,.88)",fontSize:12}}>{r.val}</Typography>
                          {(r as any).hasRemove && <Box component="button" onClick={()=>{setDiscAmt(0);setDiscLabel("");}} sx={{px:"7px",py:"2px",background:C.rdim,border:`1px solid ${C.rbdr}`,borderRadius:"6px",fontSize:10,fontWeight:700,cursor:"pointer",color:C.red,fontFamily:FONT}}>✕</Box>}
                        </Box>
                      </Box>
                    ))}
                  </Box>

                  {/* Delivery charge + KM inputs */}
                  {channel==="delivery" && (
                    <Box sx={{display:"flex",gap:"6px",px:"11px",pt:"7px",alignItems:"stretch"}}>
                      <Box sx={{flex:1,display:"flex",flexDirection:"column",gap:"3px"}}>
                        <Typography sx={{fontSize:"9.5px",fontWeight:800,textTransform:"uppercase",letterSpacing:".4px",color:C.t3}}>Delivery Charge</Typography>
                        <Box sx={{display:"flex",alignItems:"center",border:`1.5px solid ${C.gbdr}`,borderRadius:"8px",background:C.gdim,overflow:"hidden"}}>
                          <Typography sx={{px:"7px",fontSize:13,color:C.grn,fontWeight:800,borderRight:`1px solid ${C.gbdr}`}}>₹</Typography>
                          <Box component="input" type="number" value={delCharge} min={0} onChange={(e:any)=>setDelCharge(parseInt(e.target.value)||0)} sx={{flex:1,px:"7px",py:"6px",background:"transparent",border:"none",fontFamily:FONT,fontSize:13,fontWeight:700,color:C.grn,outline:"none"}} />
                        </Box>
                      </Box>
                      <Box sx={{flex:1,display:"flex",flexDirection:"column",gap:"3px"}}>
                        <Typography sx={{fontSize:"9.5px",fontWeight:800,textTransform:"uppercase",letterSpacing:".4px",color:C.t3}}>Distance</Typography>
                        <Box sx={{display:"flex",alignItems:"center",border:`1.5px solid ${C.bbdr}`,borderRadius:"8px",background:C.bdim,overflow:"hidden"}}>
                          <Typography sx={{px:"7px",fontSize:11,color:C.blu,fontWeight:800,borderRight:`1px solid ${C.bbdr}`}}>km</Typography>
                          <Box component="input" type="number" value={delKm} min={0} step="0.1" onChange={(e:any)=>setDelKm(parseFloat(e.target.value)||0)} sx={{flex:1,px:"7px",py:"6px",background:"transparent",border:"none",fontFamily:FONT,fontSize:13,fontWeight:700,color:C.blu,outline:"none"}} />
                        </Box>
                      </Box>
                    </Box>
                  )}

                  {/* Discount button */}
                  <Box sx={{px:"11px",pt:"6px",pb:"9px"}}>
                    <Box component="button" onClick={()=>{setDiscPopup(true);setDiscVal("");setCouponCode("");}} sx={{display:"flex",alignItems:"center",gap:"5px",px:"12px",py:"7px",background:discAmt>0?C.gdim:"#2e2a26",border:`1.5px ${discAmt>0?"solid":"dashed"} ${discAmt>0?C.gbdr:"rgba(255,255,255,.15)"}`,borderRadius:"8px",fontSize:12,fontWeight:700,color:discAmt>0?C.grn:"rgba(255,255,255,.55)",cursor:"pointer",fontFamily:FONT,transition:"all .14s",width:"100%",justifyContent:"center","&:hover":{background:discAmt>0?C.gdim:"#343028",borderColor:discAmt>0?C.gbdr:C.ac,color:discAmt>0?C.grn:C.ac}}}>
                      🏷️ {discAmt>0 ? `Discount Applied: -₹${discAmt}` : "Add Discount / Coupon"}
                    </Box>
                  </Box>
                </Box>
              )}
            </Box>

            {/* Payment Mode */}
            <Box sx={{display:"flex",alignItems:"center",gap:"8px",px:"11px",py:"7px",borderBottom:`1px solid rgba(255,255,255,.07)`}}>
              <Typography sx={{fontSize:10,fontWeight:700,color:"rgba(255,255,255,.35)",textTransform:"uppercase",letterSpacing:".5px",whiteSpace:"nowrap",flexShrink:0}}>Pay</Typography>
              <Box sx={{display:"flex",gap:"4px",flex:1,overflowX:"auto","&::-webkit-scrollbar":{display:"none"}}}>
                {["💵 Cash","📱 UPI","💳 Card","📄 Due"].map(pm => {
                  const label = pm.split(" ").slice(1).join(" ");
                  return <Box key={pm} component="button" onClick={()=>setPayMode(label)} sx={pmSx(payMode===label)}>{pm}</Box>;
                })}
                <Box component="button" onClick={()=>setEbillPopup(true)} sx={{...pmSx(false),background:payMode==="E-Bill"?"#16a34a":"#dcfce7",borderColor:payMode==="E-Bill"?"#16a34a":"#4ade80",color:payMode==="E-Bill"?"#fff":"#15803d"}}>
                  💬 E-Bill
                </Box>
              </Box>
            </Box>

            {/* Action Row */}
            <Box sx={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"4px",px:"11px",py:"6px",borderBottom:`1px solid rgba(255,255,255,.07)`}}>
              {[
                {icon:"⏸️",label:"Hold",   onClick:()=>toast("Order held ⏸")},
                {icon:"💾",label:"Draft",  onClick:()=>toast("Draft saved 💾")},
                {icon:"🕐",label:"KOT",    onClick:handleKot},
                {icon:"🖨️",label:"KOT+Print",onClick:()=>{handleKot();toast("Printing… 🖨️");}},
              ].map(b=>(
                <Box key={b.label} component="button" onClick={b.onClick} sx={{py:"6px",px:"3px",background:"#3a342e",border:"1.5px solid rgba(255,255,255,.1)",borderRadius:"8px",fontSize:10,fontWeight:700,color:"rgba(255,255,255,.6)",cursor:"pointer",fontFamily:FONT,display:"flex",flexDirection:"column",alignItems:"center",gap:"2px",transition:"all .14s","&:hover":{background:"#453d36",borderColor:"rgba(255,255,255,.18)",color:"#fff"}}}>
                  <span style={{fontSize:13}}>{b.icon}</span>{b.label}
                </Box>
              ))}
            </Box>

            {/* Bill Row */}
            <Box sx={{display:"grid",gridTemplateColumns:"repeat(4,1fr)"}}>
              {[
                {icon:"🧾",label:"Bill",      color:"",    onClick:()=>toast("Bill generated 🧾")},
                {icon:"🖨️",label:"Bill+Print",color:"",    onClick:()=>toast("Bill printed 🖨️")},
                {icon:"💳",label:"KOT+Pay",   color:"",    onClick:()=>toast("KOT Bill & Pay ✓")},
                {icon:"✅",label:finalBtnLabel,color:"ac",  onClick:handleCheckout},
              ].map((b,i)=>(
                <Box key={b.label} component="button" onClick={b.onClick}
                  sx={{py:"11px",px:"3px",textAlign:"center",fontSize:10.5,fontWeight:700,cursor:"pointer",transition:"all .14s",border:"none",fontFamily:FONT,background:b.color==="ac"?C.ac:"#2a2420",color:b.color==="ac"?"#fff":"rgba(255,255,255,.55)",borderRight:i<3?"1px solid rgba(255,255,255,.07)":"none",borderTop:"1px solid rgba(255,255,255,.07)",display:"flex",flexDirection:"column",alignItems:"center",gap:"2px","&:hover":{background:b.color==="ac"?C.ah:"#362f28",color:"#fff"}}}>
                  <span style={{fontSize:12}}>{b.icon}</span>{b.label}
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* ══════════════════════════
          CUSTOMER POPUP
      ══════════════════════════ */}
      <Dialog open={!!custPopup} onClose={()=>setCustPopup(null)} PaperProps={{sx:{width:480,maxWidth:"96vw",borderRadius:"14px",overflow:"hidden",animation:"popIn .22s ease"}}}>
        <Box sx={{px:"20px",py:"16px",borderBottom:`1px solid ${C.bd}`,display:"flex",alignItems:"center",justifyContent:"space-between",background:C.tx}}>
          <Box>
            <Typography sx={{fontFamily:SERIF,fontSize:17,fontWeight:700,color:"#fff"}}>👤 {custPopup==="dine"?"Dine In":custPopup==="pickup"?"Pickup":"Delivery"} Customer</Typography>
            <Typography sx={{fontSize:11.5,color:"rgba(255,255,255,.5)",mt:"2px"}}>Customer info add karo ya existing select karo</Typography>
          </Box>
          <Box component="button" onClick={()=>setCustPopup(null)} sx={{width:28,height:28,borderRadius:"7px",background:"rgba(255,255,255,.1)",border:"none",cursor:"pointer",fontSize:16,color:"rgba(255,255,255,.7)",display:"flex",alignItems:"center",justifyContent:"center","&:hover":{background:"rgba(255,255,255,.18)"}}}>✕</Box>
        </Box>
        <Box sx={{px:"20px",py:"18px"}}>
          {/* Tabs */}
          <Box sx={{display:"flex",border:`1.5px solid ${C.bd}`,borderRadius:"10px",overflow:"hidden",mb:"16px"}}>
            {(["recent","new"] as const).map(t=>(
              <Box key={t} component="button" onClick={()=>setCustTab(t)} sx={{flex:1,py:"8px",textAlign:"center",fontSize:12,fontWeight:700,cursor:"pointer",background:custTab===t?C.ac:C.s1,color:custTab===t?"#fff":C.t2,border:"none",fontFamily:FONT,transition:"all .14s",borderRight:t==="recent"?`1px solid ${C.bd}`:"none"}}>
                {t==="recent"?"🔍 Recent Customers":"➕ New Customer"}
              </Box>
            ))}
          </Box>

          {custTab==="recent" ? (
            <>
              <Box sx={{mb:"10px",position:"relative"}}>
                <Box component="input" value={custSearch} onChange={(e:any)=>setCustSearch(e.target.value)} placeholder="Search by name or phone…"
                  sx={{width:"100%",px:"12px",py:"10px",pl:"36px",background:C.s1,border:`1.5px solid ${C.bd}`,borderRadius:"10px",fontFamily:FONT,fontSize:13,color:C.tx,outline:"none",transition:"border-color .2s","&:focus":{borderColor:C.ac,background:C.w},"&::placeholder":{color:C.t3}}} />
                <Typography sx={{position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",fontSize:14}}>🔍</Typography>
              </Box>
              <Box sx={{display:"flex",flexDirection:"column",gap:"7px",mb:"16px",maxHeight:240,overflowY:"auto"}}>
                {filteredCustomers.length===0 ? (
                  <Typography sx={{textAlign:"center",color:C.t3,py:"20px",fontSize:13}}>No customers found</Typography>
                ) : filteredCustomers.map(c=>(
                  <Box key={c.id} sx={{display:"flex",alignItems:"center",gap:"10px",px:"12px",py:"9px",background:C.s1,border:`1.5px solid ${C.bd}`,borderRadius:"10px",cursor:"pointer",transition:"all .14s","&:hover":{borderColor:C.ac,background:C.adim}}}>
                    <Box sx={{width:34,height:34,borderRadius:"50%",background:C.adim,border:`1.5px solid ${C.abdr}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:800,color:C.ac,flexShrink:0}}>{c.initials}</Box>
                    <Box sx={{flex:1}}>
                      <Typography sx={{fontSize:13,fontWeight:700,color:C.tx}}>{c.name}</Typography>
                      <Typography sx={{fontSize:11.5,color:C.t3,mt:"1px"}}>📞 {c.phone}</Typography>
                      <Typography sx={{fontSize:11,fontWeight:600,color:C.t3,mt:"1px"}}>🛍️ {c.orders} orders · {c.addr}</Typography>
                    </Box>
                    <Box component="button" onClick={()=>selectCust(c)} sx={{px:"11px",py:"5px",background:C.gdim,border:`1px solid ${C.gbdr}`,borderRadius:"7px",fontSize:11.5,fontWeight:700,color:C.grn,cursor:"pointer",fontFamily:FONT}}>Select</Box>
                  </Box>
                ))}
              </Box>
            </>
          ) : (
            <>
              <Box sx={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",mb:"13px"}}>
                {[{id:"name",label:"Full Name *",ph:"Customer ka naam"},{id:"phone",label:"Phone *",ph:"10-digit number",type:"tel"}].map(f=>(
                  <Box key={f.id}>
                    <Typography sx={{fontSize:11,fontWeight:700,color:C.t2,textTransform:"uppercase",letterSpacing:".3px",mb:"5px"}}>{f.label}</Typography>
                    <Box component="input" type={f.type||"text"} value={(newCust as any)[f.id]} onChange={(e:any)=>setNewCust(p=>({...p,[f.id]:e.target.value}))} placeholder={f.ph}
                      sx={{width:"100%",px:"12px",py:"10px",background:C.s1,border:`1.5px solid ${C.bd}`,borderRadius:"10px",fontFamily:FONT,fontSize:13,color:C.tx,outline:"none",transition:"border-color .2s","&:focus":{borderColor:C.ac,background:C.w},"&::placeholder":{color:C.t3}}} />
                  </Box>
                ))}
              </Box>
              {custPopup==="delivery" && (
                <Box sx={{mb:"13px"}}>
                  <Typography sx={{fontSize:11,fontWeight:700,color:C.t2,textTransform:"uppercase",letterSpacing:".3px",mb:"5px"}}>Delivery Address</Typography>
                  <Box component="input" value={newCust.addr} onChange={(e:any)=>setNewCust(p=>({...p,addr:e.target.value}))} placeholder="Full delivery address…" sx={{width:"100%",px:"12px",py:"10px",background:C.s1,border:`1.5px solid ${C.bd}`,borderRadius:"10px",fontFamily:FONT,fontSize:13,color:C.tx,outline:"none","&:focus":{borderColor:C.ac},"&::placeholder":{color:C.t3}}} />
                </Box>
              )}
              <Box sx={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px"}}>
                {[{id:"email",label:"Email (optional)",ph:"email@example.com",type:"email"},{id:"pin",label:"Area / Pincode",ph:"e.g. Gwalior - 474001"}].map(f=>(
                  <Box key={f.id}>
                    <Typography sx={{fontSize:11,fontWeight:700,color:C.t2,textTransform:"uppercase",letterSpacing:".3px",mb:"5px"}}>{f.label}</Typography>
                    <Box component="input" type={f.type||"text"} value={(newCust as any)[f.id]} onChange={(e:any)=>setNewCust(p=>({...p,[f.id]:e.target.value}))} placeholder={f.ph} sx={{width:"100%",px:"12px",py:"10px",background:C.s1,border:`1.5px solid ${C.bd}`,borderRadius:"10px",fontFamily:FONT,fontSize:13,color:C.tx,outline:"none","&:focus":{borderColor:C.ac},"&::placeholder":{color:C.t3}}} />
                  </Box>
                ))}
              </Box>
            </>
          )}
        </Box>
        <Box sx={{px:"20px",py:"14px",borderTop:`1px solid ${C.bd}`,display:"flex",gap:"9px",background:C.s1}}>
          <Box component="button" onClick={()=>setCustPopup(null)} sx={{px:"18px",py:"11px",background:C.s2,border:`1.5px solid ${C.bd}`,borderRadius:"10px",color:C.t2,fontFamily:FONT,fontWeight:700,fontSize:13,cursor:"pointer","&:hover":{background:C.s3}}}>Cancel</Box>
          <Box component="button" onClick={custTab==="new"?saveCust:()=>setCustPopup(null)} sx={{flex:1,py:"11px",background:C.ac,border:"none",borderRadius:"10px",color:"#fff",fontFamily:FONT,fontWeight:800,fontSize:14,cursor:"pointer",boxShadow:"0 2px 8px rgba(255,61,1,.25)",transition:"all .15s","&:hover":{background:C.ah}}}>
            ✅ {custTab==="new"?"Save & Apply":"Done"}
          </Box>
        </Box>
      </Dialog>

      {/* ══════════════════════════
          DISCOUNT POPUP (bottom sheet)
      ══════════════════════════ */}
      {discPopup && (
        <Box onClick={(e)=>{if(e.target===e.currentTarget)setDiscPopup(false);}} sx={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:150,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
          <Box sx={{background:C.w,borderRadius:"20px 20px 0 0",width:"100%",maxWidth:480,boxShadow:"0 -8px 40px rgba(0,0,0,.18)",animation:"slideUp .28s cubic-bezier(.4,0,.2,1)",overflow:"hidden"}}>
            <Box sx={{px:"18px",pt:"14px",pb:"10px",borderBottom:`1px solid ${C.bd}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <Typography sx={{fontSize:16,fontWeight:800,color:C.tx}}>🏷️ Apply Discount</Typography>
              <Box component="button" onClick={()=>setDiscPopup(false)} sx={{width:28,height:28,borderRadius:"50%",background:C.s2,border:"none",cursor:"pointer",fontSize:16,color:C.t2,display:"flex",alignItems:"center",justifyContent:"center","&:hover":{background:C.s3}}}>✕</Box>
            </Box>
            <Box sx={{px:"18px",py:"16px",pb:"20px"}}>
              {/* Type toggle */}
              <Box sx={{display:"flex",background:C.s2,borderRadius:"10px",p:"4px",gap:"4px",mb:"16px"}}>
                {(["percent","fixed","coupon"] as const).map(t=>(
                  <Box key={t} component="button" onClick={()=>setDiscType(t)} sx={{flex:1,py:"9px",textAlign:"center",borderRadius:"8px",fontSize:13,fontWeight:700,cursor:"pointer",transition:"all .18s",border:"none",background:discType===t?C.w:"none",fontFamily:FONT,color:discType===t?C.tx:C.t2,boxShadow:discType===t?"0 2px 8px rgba(0,0,0,.1)":"none"}}>
                    {t==="percent"?"% Percent":t==="fixed"?"₹ Fixed Amount":"🎟️ Coupon"}
                  </Box>
                ))}
              </Box>

              {discType!=="coupon" ? (
                <>
                  <Box sx={{position:"relative",mb:"12px"}}>
                    <Typography sx={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",fontSize:20,fontWeight:800,color:C.ac}}>{discType==="percent"?"%":"₹"}</Typography>
                    <Box component="input" type="number" value={discVal} onChange={(e:any)=>setDiscVal(e.target.value)} placeholder="0" min={0}
                      sx={{width:"100%",pl:"36px",pr:"14px",py:"13px",background:C.s1,border:`2px solid ${C.bd}`,borderRadius:"10px",fontFamily:SERIF,fontSize:28,fontWeight:700,color:C.tx,outline:"none",transition:"border-color .2s",textAlign:"right",letterSpacing:".5px","&:focus":{borderColor:C.ac,background:C.w}}} />
                  </Box>
                  <Box sx={{display:"flex",gap:"7px",mb:"14px",flexWrap:"wrap"}}>
                    {(discType==="percent"?[5,10,15,20,25,50]:[20,50,100,200]).map(v=>(
                      <Box key={v} component="button" onClick={()=>setDiscVal(String(v))} sx={{px:"14px",py:"6px",borderRadius:"20px",fontSize:12.5,fontWeight:700,cursor:"pointer",border:`1.5px solid ${discVal===String(v)?C.abdr:C.bd}`,background:discVal===String(v)?C.adim:C.s1,color:discVal===String(v)?C.ac:C.t2,fontFamily:FONT,transition:"all .14s"}}>
                        {discType==="percent"?`${v}%`:`₹${v}`}
                      </Box>
                    ))}
                  </Box>
                  {discPreview>0&&<Box sx={{display:"flex",alignItems:"center",justifyContent:"space-between",px:"12px",py:"10px",background:C.adim,border:`1px solid ${C.abdr}`,borderRadius:"8px",mb:"12px",fontSize:13}}>
                    <Typography sx={{color:C.t2,fontWeight:500}}>Discount Amount</Typography>
                    <Typography sx={{fontWeight:800,color:C.ac,fontSize:15}}>₹{discPreview}</Typography>
                  </Box>}
                </>
              ) : (
                <>
                  <Box sx={{position:"relative",mb:"12px"}}>
                    <Typography sx={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",fontSize:16}}>🎟️</Typography>
                    <Box component="input" type="text" value={couponCode} onChange={(e:any)=>setCouponCode(e.target.value.toUpperCase())} placeholder="FLAT10"
                      sx={{width:"100%",pl:"36px",pr:"14px",py:"13px",background:C.s1,border:`2px solid ${C.bd}`,borderRadius:"10px",fontFamily:SERIF,fontSize:20,fontWeight:700,color:C.tx,outline:"none",transition:"border-color .2s",textTransform:"uppercase","&:focus":{borderColor:C.ac,background:C.w}}} />
                  </Box>
                  <Typography sx={{fontSize:12,color:C.t3,mb:"12px"}}>Try: FLAT10 (10% off) · SAVE50 (₹50 off) · VIP20 (20% off)</Typography>
                </>
              )}

              <Box component="select" value={discReason} onChange={(e:any)=>setDiscReason(e.target.value)} sx={{width:"100%",px:"12px",py:"8px",background:C.s1,border:`1.5px solid ${C.bd}`,borderRadius:"10px",fontFamily:FONT,fontSize:12.5,color:C.tx,outline:"none",cursor:"pointer",appearance:"none",mb:"14px"}}>
                <option value="">Reason (optional)</option>
                {["Staff / Employee Discount","Loyalty Reward","Promotional Offer","Food Quality Issue","Manager Approved","Birthday Special","Bulk Order"].map(r=><option key={r}>{r}</option>)}
              </Box>
              <Box component="button" onClick={applyDiscount} sx={{width:"100%",py:"14px",background:C.ac,border:"none",borderRadius:"10px",color:"#fff",fontFamily:FONT,fontWeight:800,fontSize:15,cursor:"pointer",boxShadow:"0 3px 10px rgba(255,61,1,.28)","&:hover":{background:C.ah}}}>
                ✅ Apply Discount
              </Box>
            </Box>
          </Box>
        </Box>
      )}

      {/* ══════════════════════════
          KOT TOKEN POPUP
      ══════════════════════════ */}
      <Dialog open={kotPopup} onClose={()=>setKotPopup(false)} PaperProps={{sx:{width:440,maxWidth:"96vw",borderRadius:"14px",overflow:"hidden"}}}>
        <Box sx={{background:C.tx,px:"18px",py:"16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <Typography sx={{fontSize:16,fontWeight:800,color:"#fff"}}>🔖 KOT Token System</Typography>
          <Box component="button" onClick={()=>setKotPopup(false)} sx={{width:27,height:27,borderRadius:"7px",background:"rgba(255,255,255,.1)",border:"none",cursor:"pointer",fontSize:15,color:"rgba(255,255,255,.7)",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</Box>
        </Box>
        <Box sx={{m:"16px",borderRadius:"14px",p:"20px",textAlign:"center",background:"linear-gradient(135deg,#FF3D01,#dd3400)",boxShadow:"0 4px 16px rgba(255,61,1,.3)"}}>
          <Typography sx={{fontFamily:SERIF,fontSize:44,fontWeight:800,color:"#fff",letterSpacing:"2px"}}>{kotToken}</Typography>
          <Typography sx={{fontSize:12,color:"rgba(255,255,255,.75)",mt:"4px",fontWeight:600}}>Kitchen Order Token</Typography>
          <Typography sx={{fontSize:11,color:"rgba(255,255,255,.6)",mt:"2px"}}>{kotTime}</Typography>
        </Box>
        <Box sx={{px:"16px",pb:"16px"}}>
          {[{n:1,title:"Order Place Hoti Hai",sub:"Customer order deta hai — Dine In / Pickup / Delivery"},{n:2,title:"KOT Token Generate Hota Hai",sub:"Token number print hota hai — Customer ko diya jaata hai (Pickup ke liye)"},{n:3,title:"Kitchen mein KOT jaati hai",sub:"Items prepare hone lagti hain — KDS par bhi show hota hai"},{n:4,title:"Food Ready hone par Token Call",sub:"Customer ka token number announce karein — Counter se food le jaaye"},{n:"✓",title:"Bill & Payment",sub:"Food delivery ke baad bill settle karein",green:true}].map((s,i)=>(
            <Box key={i} sx={{display:"flex",alignItems:"flex-start",gap:"10px",py:"10px",borderBottom:i<4?`1px solid ${C.bd}`:"none"}}>
              <Box sx={{width:24,height:24,borderRadius:"50%",background:(s as any).green?C.grn:C.ac,color:"#fff",fontSize:11,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,mt:"2px"}}>{s.n}</Box>
              <Box>
                <Typography sx={{fontSize:13,fontWeight:700,color:C.tx}}>{s.title}</Typography>
                <Typography sx={{fontSize:11.5,color:C.t3,mt:"2px"}}>{s.sub}</Typography>
              </Box>
            </Box>
          ))}
          <Box component="button" onClick={()=>{toast("Token printed 🖨️");setKotPopup(false);}} sx={{width:"100%",mt:"16px",py:"12px",background:C.ac,border:"none",borderRadius:"10px",color:"#fff",fontFamily:FONT,fontWeight:800,fontSize:14,cursor:"pointer",boxShadow:"0 2px 8px rgba(255,61,1,.25)","&:hover":{background:C.ah}}}>
            🖨️ Print Token {kotToken}
          </Box>
        </Box>
      </Dialog>

      {/* ══════════════════════════
          NOTE POPUP
      ══════════════════════════ */}
      {notePopup && (
        <Box onClick={(e)=>{if(e.target===e.currentTarget){setNotePopup(null);}}} sx={{position:"fixed",inset:0,background:"rgba(0,0,0,.52)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",px:"20px"}}>
          <Box sx={{background:C.w,borderRadius:"14px",boxShadow:"0 20px 60px rgba(0,0,0,.2)",overflow:"hidden",animation:"popIn .22s ease",width:400,maxWidth:"96vw"}}>
            <Box sx={{px:"20px",py:"16px",borderBottom:`1px solid ${C.bd}`,display:"flex",alignItems:"center",justifyContent:"space-between",background:C.tx}}>
              <Typography sx={{fontFamily:SERIF,fontSize:17,fontWeight:700,color:"#fff"}}>
                📝 {notePopup.type==="item" ? `Note — ${cart[notePopup.id as number]?.name}` : `Order Note — ${notePopup.id==="dine"?"Dine In":notePopup.id==="pickup"?"Pickup":"Delivery"}`}
              </Typography>
              <Box component="button" onClick={()=>setNotePopup(null)} sx={{width:28,height:28,borderRadius:"7px",background:"rgba(255,255,255,.1)",border:"none",cursor:"pointer",fontSize:16,color:"rgba(255,255,255,.7)",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</Box>
            </Box>
            <Box sx={{px:"16px",py:"16px"}}>
              <Box component="textarea" ref={noteRef} value={noteText} onChange={(e:any)=>setNoteText(e.target.value)} placeholder="Yahan note likhein… (e.g. Less spicy, extra sauce…)" onKeyDown={(e:any)=>{if(e.key==="Enter"&&e.ctrlKey){
                if(notePopup.type==="item"){ setCart(p=>({...p,[notePopup.id as number]:{...p[notePopup.id as number],note:noteText.trim()}})); } else { setChannelNotes(p=>({...p,[notePopup.id]:noteText.trim()})); }
                setNotePopup(null); toast.success(noteText.trim()?"Note saved ✓":"Note removed");
              }}}
                sx={{width:"100%",minHeight:100,px:"12px",py:"10px",background:C.s1,border:`1.5px solid ${C.bd}`,borderRadius:"10px",fontFamily:FONT,fontSize:13,color:C.tx,resize:"vertical",outline:"none",lineHeight:1.5,transition:"border-color .18s","&:focus":{borderColor:C.ac},"&::placeholder":{color:C.t3}}} />
              <Typography sx={{fontSize:11,color:C.t3,mt:"6px"}}>Ctrl+Enter se save karein</Typography>
            </Box>
            <Box sx={{px:"20px",py:"14px",borderTop:`1px solid ${C.bd}`,display:"flex",gap:"9px",background:C.s1}}>
              <Box component="button" onClick={()=>setNotePopup(null)} sx={{px:"18px",py:"11px",background:C.s2,border:`1.5px solid ${C.bd}`,borderRadius:"10px",color:C.t2,fontFamily:FONT,fontWeight:700,fontSize:13,cursor:"pointer"}}>Cancel</Box>
              <Box component="button" onClick={()=>{
                const txt = noteText.trim();
                if(notePopup.type==="item"){ setCart(p=>({...p,[notePopup.id as number]:{...p[notePopup.id as number],note:txt}})); }
                else { setChannelNotes(p=>({...p,[notePopup.id]:txt})); }
                setNotePopup(null); toast.success(txt?"Note saved ✓":"Note removed");
              }} sx={{flex:1,py:"11px",background:C.ac,border:"none",borderRadius:"10px",color:"#fff",fontFamily:FONT,fontWeight:800,fontSize:14,cursor:"pointer","&:hover":{background:C.ah}}}>✅ Save Note</Box>
            </Box>
          </Box>
        </Box>
      )}

      {/* ══════════════════════════
          ASSIGN TABLE POPUP
      ══════════════════════════ */}
      <Dialog open={assignTablePopup} onClose={()=>setAssignTablePopup(false)} PaperProps={{sx:{width:540,maxWidth:"96vw",borderRadius:"14px",overflow:"hidden",maxHeight:"88vh"}}}>
        <Box sx={{px:"18px",py:"14px",borderBottom:`1px solid ${C.bd}`,display:"flex",alignItems:"center",justifyContent:"space-between",background:C.tx}}>
          <Typography sx={{fontFamily:SERIF,fontSize:17,fontWeight:700,color:"#fff"}}>🪑 Assign Table</Typography>
          <Box component="button" onClick={()=>setAssignTablePopup(false)} sx={{width:28,height:28,borderRadius:"7px",background:"rgba(255,255,255,.1)",border:"none",cursor:"pointer",fontSize:16,color:"rgba(255,255,255,.7)",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</Box>
        </Box>
        <Box sx={{overflowY:"auto",px:"16px",py:"14px"}}>
          {/* Legend */}
          <Box sx={{display:"flex",gap:"12px",flexWrap:"wrap",mb:"14px",alignItems:"center"}}>
            {[{bg:C.w,bdr:C.bd,label:"Available"},{bg:"#dbeafe",bdr:"#93c5fd",label:"Running"},{bg:"#fef9c3",bdr:"#fde047",label:"Bill Print"},{bg:"#ffe4e6",bdr:"#fca5a5",label:"Reserved"}].map(l=>(
              <Box key={l.label} sx={{display:"flex",alignItems:"center",gap:"5px",fontSize:12,color:C.t2,fontWeight:500}}>
                <Box sx={{width:11,height:11,borderRadius:"3px",border:`1.5px solid ${l.bdr}`,background:l.bg,flexShrink:0}} />{l.label}
              </Box>
            ))}
          </Box>
          {floors.map(floor=>(
            <Box key={floor.floor} sx={{mb:"16px"}}>
              <Typography sx={{fontFamily:SERIF,fontSize:16,fontWeight:700,color:C.tx,mb:"10px",pb:"6px",borderBottom:`2px solid ${C.ac}`,display:"flex",alignItems:"center",gap:"8px"}}>
                {floor.floor}
                <Box component="span" sx={{fontSize:11,fontWeight:600,color:C.t3,background:C.s2,px:"8px",py:"2px",borderRadius:"12px"}}>{floor.tables.length} tables</Box>
              </Typography>
              <Box sx={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(120px,1fr))",gap:"10px"}}>
                {floor.tables.map(t=>{
                  const selectable = t.status==="avail"||t.status==="print";
                  const isSelected = assignedTable?.id===t.id;
                  const tcColor = tcNameColor(isSelected?"running":t.status);
                  return (
                    <Box key={t.id} onClick={()=>{if(!selectable)return;setAssignedTable({id:t.id,name:t.name,floor:floor.floor});setAssignTablePopup(false);toast.success(`🪑 ${floor.floor} — ${t.name} assigned ✓`);}}
                      sx={{...tblCardSx(isSelected?"running":t.status),cursor:selectable?"pointer":"not-allowed",...(isSelected?{border:`2px solid ${C.ac}`,background:C.adim}:{})}}>
                      <Box sx={{display:"flex",justifyContent:"space-between",mb:"3px"}}>
                        <Typography sx={{fontSize:10.5,fontWeight:600,color:C.t3}}>{t.seats} seats</Typography>
                        {t.kots?<Typography sx={{fontSize:11,fontWeight:800,color:tcColor}}>{t.kots} KOT</Typography>:null}
                      </Box>
                      <Typography sx={{fontFamily:SERIF,fontSize:26,fontWeight:700,mb:"2px",color:tcColor}}>{t.name}</Typography>
                      {t.time&&<Typography sx={{fontSize:11,fontWeight:700,color:"#ef4444"}}>{t.time}</Typography>}
                      <Typography sx={{fontSize:9,fontWeight:700,color:tcColor,mt:"auto"}}>{t.status==="avail"?"Available":t.status==="running"?"Running":t.status==="print"?"Bill Print":"Reserved"}</Typography>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          ))}
        </Box>
      </Dialog>

      {/* ══════════════════════════
          PICKUP DATE POPUP
      ══════════════════════════ */}
      <Dialog open={pickupDatePopup} onClose={()=>setPickupDatePopup(false)} PaperProps={{sx:{width:380,maxWidth:"96vw",borderRadius:"14px",overflow:"hidden"}}}>
        <Box sx={{px:"20px",py:"16px",borderBottom:`1px solid ${C.bd}`,display:"flex",alignItems:"center",justifyContent:"space-between",background:C.tx}}>
          <Typography sx={{fontFamily:SERIF,fontSize:17,fontWeight:700,color:"#fff"}}>📅 Pickup Date</Typography>
          <Box component="button" onClick={()=>setPickupDatePopup(false)} sx={{width:28,height:28,borderRadius:"7px",background:"rgba(255,255,255,.1)",border:"none",cursor:"pointer",fontSize:16,color:"rgba(255,255,255,.7)",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</Box>
        </Box>
        <Box sx={{px:"20px",py:"20px"}}>
          <Box component="input" type="date" value={pickupDateInput} onChange={(e:any)=>setPickupDateInput(e.target.value)} sx={{width:"100%",px:"12px",py:"10px",background:C.s1,border:`1.5px solid ${C.bd}`,borderRadius:"10px",fontFamily:FONT,fontSize:15,color:C.tx,outline:"none",cursor:"pointer","&:focus":{borderColor:C.ac}}} />
          <Box sx={{display:"flex",gap:"6px",mt:"12px",flexWrap:"wrap"}}>
            {[{label:"Today",d:0},{label:"Tomorrow",d:1},{label:"+2 Days",d:2}].map(p=>(
              <Box key={p.label} component="button" onClick={()=>{const d=new Date();d.setDate(d.getDate()+p.d);setPickupDateInput(d.toISOString().split("T")[0]);}} sx={{px:"10px",py:"6px",background:C.adim,border:`1.5px solid ${C.abdr}`,borderRadius:"8px",fontSize:11,fontWeight:700,color:C.ac,cursor:"pointer",fontFamily:FONT}}>{p.label}</Box>
            ))}
          </Box>
        </Box>
        <Box sx={{px:"20px",pb:"14px",display:"flex",gap:"9px",background:C.s1,pt:"14px",borderTop:`1px solid ${C.bd}`}}>
          <Box component="button" onClick={()=>setPickupDatePopup(false)} sx={{px:"18px",py:"11px",background:C.s2,border:`1.5px solid ${C.bd}`,borderRadius:"10px",color:C.t2,fontFamily:FONT,fontWeight:700,fontSize:13,cursor:"pointer"}}>Cancel</Box>
          <Box component="button" onClick={applyPickupDate} sx={{flex:1,py:"11px",background:C.ac,border:"none",borderRadius:"10px",color:"#fff",fontFamily:FONT,fontWeight:800,fontSize:14,cursor:"pointer","&:hover":{background:C.ah}}}>✅ Set Date</Box>
        </Box>
      </Dialog>

      {/* ══════════════════════════
          PICKUP TIME POPUP
      ══════════════════════════ */}
      <Dialog open={pickupTimePopup} onClose={()=>setPickupTimePopup(false)} PaperProps={{sx:{width:380,maxWidth:"96vw",borderRadius:"14px",overflow:"hidden"}}}>
        <Box sx={{px:"20px",py:"16px",borderBottom:`1px solid ${C.bd}`,display:"flex",alignItems:"center",justifyContent:"space-between",background:C.tx}}>
          <Typography sx={{fontFamily:SERIF,fontSize:17,fontWeight:700,color:"#fff"}}>🕐 Pickup Time</Typography>
          <Box component="button" onClick={()=>setPickupTimePopup(false)} sx={{width:28,height:28,borderRadius:"7px",background:"rgba(255,255,255,.1)",border:"none",cursor:"pointer",fontSize:16,color:"rgba(255,255,255,.7)",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</Box>
        </Box>
        <Box sx={{px:"20px",py:"20px"}}>
          <Box component="input" type="time" value={pickupTimeInput} onChange={(e:any)=>setPickupTimeInput(e.target.value)} sx={{width:"100%",px:"12px",py:"10px",background:C.s1,border:`1.5px solid ${C.bd}`,borderRadius:"10px",fontFamily:FONT,fontSize:15,color:C.tx,outline:"none",cursor:"pointer","&:focus":{borderColor:C.ac}}} />
          <Box sx={{display:"flex",gap:"6px",mt:"12px",flexWrap:"wrap"}}>
            {[{label:"Now",v:"now" as const},{label:"+15 min",v:15},{label:"+30 min",v:30},{label:"+1 hr",v:60}].map(p=>(
              <Box key={p.label} component="button" onClick={()=>setPickupTimePreset(p.v)} sx={{px:"10px",py:"6px",background:C.s1,border:`1.5px solid ${C.bd}`,borderRadius:"8px",fontSize:11,fontWeight:700,color:C.t2,cursor:"pointer",fontFamily:FONT}}>{p.label}</Box>
            ))}
          </Box>
        </Box>
        <Box sx={{px:"20px",pb:"14px",display:"flex",gap:"9px",background:C.s1,pt:"14px",borderTop:`1px solid ${C.bd}`}}>
          <Box component="button" onClick={()=>setPickupTimePopup(false)} sx={{px:"18px",py:"11px",background:C.s2,border:`1.5px solid ${C.bd}`,borderRadius:"10px",color:C.t2,fontFamily:FONT,fontWeight:700,fontSize:13,cursor:"pointer"}}>Cancel</Box>
          <Box component="button" onClick={applyPickupTime} sx={{flex:1,py:"11px",background:C.ac,border:"none",borderRadius:"10px",color:"#fff",fontFamily:FONT,fontWeight:800,fontSize:14,cursor:"pointer","&:hover":{background:C.ah}}}>✅ Set Time</Box>
        </Box>
      </Dialog>

      {/* ══════════════════════════
          E-BILL POPUP
      ══════════════════════════ */}
      <Dialog open={ebillPopup} onClose={()=>setEbillPopup(false)} PaperProps={{sx:{width:420,maxWidth:"96vw",borderRadius:"14px",overflow:"hidden"}}}>
        <Box sx={{px:"20px",py:"16px",borderBottom:`1px solid ${C.bd}`,display:"flex",alignItems:"center",justifyContent:"space-between",background:C.tx}}>
          <Box>
            <Typography sx={{fontFamily:SERIF,fontSize:17,fontWeight:700,color:"#fff"}}>📲 Send E-Bill</Typography>
            <Typography sx={{fontSize:11.5,color:"rgba(255,255,255,.5)",mt:"2px"}}>Customer ka naam aur number required hai</Typography>
          </Box>
          <Box component="button" onClick={()=>setEbillPopup(false)} sx={{width:28,height:28,borderRadius:"7px",background:"rgba(255,255,255,.1)",border:"none",cursor:"pointer",fontSize:16,color:"rgba(255,255,255,.7)",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</Box>
        </Box>
        <Box sx={{px:"20px",py:"16px"}}>
          <Box sx={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",mb:"13px"}}>
            {[{label:"Full Name *",val:ebillName,set:setEbillName,ph:"Customer ka naam"},{label:"WhatsApp Number *",val:ebillPhone,set:setEbillPhone,ph:"10-digit number",type:"tel"}].map(f=>(
              <Box key={f.label}>
                <Typography sx={{fontSize:11,fontWeight:700,color:C.t2,textTransform:"uppercase",letterSpacing:".3px",mb:"5px"}}>{f.label}</Typography>
                <Box component="input" type={f.type||"text"} value={f.val} onChange={(e:any)=>f.set(e.target.value)} placeholder={f.ph} sx={{width:"100%",px:"12px",py:"10px",background:C.s1,border:`1.5px solid ${C.bd}`,borderRadius:"10px",fontFamily:FONT,fontSize:13,color:C.tx,outline:"none","&:focus":{borderColor:C.ac},"&::placeholder":{color:C.t3}}} />
              </Box>
            ))}
          </Box>
          {customers.length>0&&(
            <Box>
              <Typography sx={{fontSize:11,fontWeight:700,color:C.t3,textTransform:"uppercase",letterSpacing:".4px",mb:"7px"}}>Recent Customers</Typography>
              <Box sx={{display:"flex",flexWrap:"wrap",gap:"5px"}}>
                {customers.slice(0,5).map(c=>(
                  <Box key={c.id} component="button" onClick={()=>{setEbillName(c.name);setEbillPhone(c.phone.replace(/\s/g,""));}} sx={{px:"9px",py:"5px",background:C.s1,border:`1px solid ${C.bd}`,borderRadius:"8px",fontSize:11,fontWeight:600,color:C.t2,cursor:"pointer",fontFamily:FONT,"&:hover":{borderColor:C.ac,color:C.ac}}}>
                    {c.initials} {c.name.split(" ")[0]}
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </Box>
        <Box sx={{px:"20px",py:"14px",borderTop:`1px solid ${C.bd}`,display:"flex",gap:"9px",background:C.s1}}>
          <Box component="button" onClick={()=>setEbillPopup(false)} sx={{px:"18px",py:"11px",background:C.s2,border:`1.5px solid ${C.bd}`,borderRadius:"10px",color:C.t2,fontFamily:FONT,fontWeight:700,fontSize:13,cursor:"pointer"}}>Cancel</Box>
          <Box component="button" onClick={()=>{if(!ebillName||!ebillPhone){toast.error("Naam aur number required!");return;}toast.success(`E-bill sent to ${ebillName} ✓`);setEbillPopup(false);}} sx={{flex:1,py:"11px",background:"#25d366",border:"none",borderRadius:"10px",color:"#fff",fontFamily:FONT,fontWeight:800,fontSize:14,cursor:"pointer",boxShadow:"0 2px 8px rgba(37,211,102,.3)",display:"flex",alignItems:"center",justifyContent:"center",gap:"6px"}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            Send via WhatsApp
          </Box>
        </Box>
      </Dialog>

      {/* ══════════════════════════
          TABLE VIEW PAGE OVERLAY
      ══════════════════════════ */}
      <Box sx={{position:"fixed",inset:0,top:0,zIndex:60,background:C.bg,transform:tablesPageOpen?"translateX(0)":"translateX(100%)",transition:"transform .3s cubic-bezier(.4,0,.2,1)",display:"flex",flexDirection:"column",boxShadow:"-8px 0 40px rgba(0,0,0,.15)"}}>
        <Box sx={{display:"flex",alignItems:"center",gap:"10px",px:"16px",height:50,background:C.w,borderBottom:`1px solid ${C.bd}`,flexShrink:0,boxShadow:`0 1px 3px rgba(0,0,0,.06)`}}>
          <Box component="button" onClick={()=>setTablesPageOpen(false)} sx={{display:"flex",alignItems:"center",gap:"6px",px:"12px",py:"6px",background:C.s1,border:`1.5px solid ${C.bd}`,borderRadius:"8px",fontSize:12.5,fontWeight:700,cursor:"pointer",color:C.t2,fontFamily:FONT,transition:"all .14s","&:hover":{borderColor:C.bd2,color:C.tx}}}>← Back to POS</Box>
          <Typography sx={{fontFamily:SERIF,fontSize:18,fontWeight:700,color:C.tx}}>🪑 Table View</Typography>
          <Box sx={{ml:"auto",display:"flex",gap:"7px"}}>
            <Box component="button" onClick={()=>toast("Add table")} sx={{px:"12px",py:"6px",background:C.ac,border:"none",borderRadius:"8px",color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:FONT}}>+ Add Table</Box>
          </Box>
        </Box>
        <Box sx={{flex:1,overflowY:"auto",px:"16px",py:"16px"}}>
          <Box sx={{display:"flex",gap:"12px",flexWrap:"wrap",mb:"14px",alignItems:"center"}}>
            {[{bg:C.w,bdr:C.bd,label:"Available"},{bg:"#dbeafe",bdr:"#93c5fd",label:"Running"},{bg:"#fef9c3",bdr:"#fde047",label:"Bill Print"},{bg:"#ffe4e6",bdr:"#fca5a5",label:"Reserved"}].map(l=>(
              <Box key={l.label} sx={{display:"flex",alignItems:"center",gap:"5px",fontSize:12,color:C.t2,fontWeight:500}}>
                <Box sx={{width:11,height:11,borderRadius:"3px",border:`1.5px solid ${l.bdr}`,background:l.bg}} />{l.label}
              </Box>
            ))}
          </Box>
          {floors.map(floor=>(
            <Box key={floor.floor} sx={{mb:"20px"}}>
              <Typography sx={{fontFamily:SERIF,fontSize:16,fontWeight:700,color:C.tx,mb:"10px",pb:"6px",borderBottom:`2px solid ${C.ac}`,display:"flex",alignItems:"center",gap:"8px"}}>
                {floor.floor}<Box component="span" sx={{fontSize:11,fontWeight:600,color:C.t3,background:C.s2,px:"8px",py:"2px",borderRadius:"12px"}}>{floor.tables.length} tables</Box>
              </Typography>
              <Box sx={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:"10px"}}>
                {floor.tables.map(t=>(
                  <Box key={t.id} onClick={()=>{if(t.status==="reserved")return;setAssignedTable({id:t.id,name:t.name,floor:floor.floor});setTablesPageOpen(false);setChannel("dine");toast.success(`🪑 ${t.name} selected ✓`);}} sx={tblCardSx(t.status)}>
                    <Box sx={{display:"flex",justifyContent:"space-between",mb:"3px"}}>
                      <Typography sx={{fontSize:10.5,fontWeight:600,color:C.t3}}>{t.seats} seats</Typography>
                      {t.kots?<Typography sx={{fontSize:11,fontWeight:800,color:tcNameColor(t.status)}}>{t.kots} KOT</Typography>:null}
                    </Box>
                    <Typography sx={{fontFamily:SERIF,fontSize:26,fontWeight:700,mb:"2px",color:tcNameColor(t.status)}}>{t.name}</Typography>
                    {t.time&&<Typography sx={{fontSize:11,fontWeight:700,color:"#ef4444"}}>{t.time}</Typography>}
                    {(t.status==="running"||t.status==="print")&&(
                      <Box sx={{display:"flex",gap:"5px",mt:"auto"}}>
                        {["🧾","🖨️"].map(ic=>(
                          <Box key={ic} component="button" onClick={(e:any)=>{e.stopPropagation();toast(ic==="🧾"?"Bill generated":"Printing…");}} sx={{width:30,height:28,borderRadius:"7px",border:`1px solid ${t.status==="running"?"#93c5fd":"#fde047"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,cursor:"pointer",background:"rgba(255,255,255,.6)","&:hover":{background:"rgba(255,255,255,.9)"}}}>{ic}</Box>
                        ))}
                      </Box>
                    )}
                  </Box>
                ))}
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      {/* ══════════════════════════
          ALL ORDERS PAGE OVERLAY
      ══════════════════════════ */}
      <Box sx={{position:"fixed",inset:0,top:0,zIndex:60,background:C.bg,transform:ordersPageOpen?"translateX(0)":"translateX(100%)",transition:"transform .3s cubic-bezier(.4,0,.2,1)",display:"flex",flexDirection:"column",boxShadow:"-8px 0 40px rgba(0,0,0,.15)"}}>
        <Box sx={{display:"flex",alignItems:"center",gap:"10px",px:"16px",height:50,background:C.w,borderBottom:`1px solid ${C.bd}`,flexShrink:0}}>
          <Box component="button" onClick={()=>setOrdersPageOpen(false)} sx={{display:"flex",alignItems:"center",gap:"6px",px:"12px",py:"6px",background:C.s1,border:`1.5px solid ${C.bd}`,borderRadius:"8px",fontSize:12.5,fontWeight:700,cursor:"pointer",color:C.t2,fontFamily:FONT,"&:hover":{borderColor:C.bd2,color:C.tx}}}>← Back to POS</Box>
          <Typography sx={{fontFamily:SERIF,fontSize:18,fontWeight:700,color:C.tx}}>📋 All Orders</Typography>
          <Box sx={{ml:"auto",display:"flex",gap:"7px"}}>
            <Box component="button" onClick={()=>toast("Refresh ✓")} sx={{px:"12px",py:"6px",background:C.s1,border:`1.5px solid ${C.bd}`,borderRadius:"8px",fontSize:12,fontWeight:600,cursor:"pointer",color:C.t2,fontFamily:FONT}}>🔄 Refresh</Box>
            <Box component="button" onClick={()=>setOrdersPageOpen(false)} sx={{px:"12px",py:"6px",background:C.ac,border:"none",borderRadius:"8px",color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:FONT}}>⚡ New Order</Box>
          </Box>
        </Box>
        <Box sx={{flex:1,overflowY:"auto",px:"16px",py:"16px"}}>
          <Box sx={{display:"flex",gap:"6px",mb:"14px",flexWrap:"wrap"}}>
            {[{f:"all",label:`All (${dummyOrders.length})`},{f:"active",label:`Active (${dummyOrders.filter(o=>o.status==="running").length})`},{f:"billed",label:`Billed (${dummyOrders.filter(o=>o.status==="billed").length})`},{f:"paid",label:`Paid (${dummyOrders.filter(o=>o.status==="paid").length})`}].map(b=>(
              <Box key={b.f} component="button" onClick={()=>setOrdersFilter(b.f)} sx={{px:"14px",py:"6px",borderRadius:"20px",fontSize:12,fontWeight:600,cursor:"pointer",border:`1.5px solid ${ordersFilter===b.f?C.ac:C.bd}`,background:ordersFilter===b.f?C.ac:C.w,color:ordersFilter===b.f?"#fff":C.t2,fontFamily:FONT,transition:"all .14s"}}>
                {b.label}
              </Box>
            ))}
          </Box>
          <Box sx={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:"12px"}}>
            {dummyOrders.filter(o=>ordersFilter==="all"||o.status===ordersFilter||(ordersFilter==="active"&&o.status==="running")).map(o=>{
              const statusMeta:{label:string;color:string;bg:string} = o.status==="running"?{label:"Running",color:C.blu,bg:C.bdim}:o.status==="billed"?{label:"Billed",color:"#d97706",bg:"#fef3c7"}:{label:"Paid",color:C.grn,bg:C.gdim};
              const chIcon = {dine:"🍽️",pickup:"🥡",delivery:"🛵"}[o.channel as "dine"|"pickup"|"delivery"];
              return (
                <Box key={o.id} onClick={()=>toast(`Order ${o.id} details`)} sx={{background:C.w,border:`1.5px solid ${C.bd}`,borderRadius:"14px",px:"14px",py:"14px",boxShadow:`0 1px 3px rgba(0,0,0,.06)`,transition:"all .15s",cursor:"pointer","&:hover":{borderColor:C.bd2,boxShadow:"0 8px 28px rgba(0,0,0,.1)"}}}>
                  <Box sx={{display:"flex",alignItems:"center",justifyContent:"space-between",mb:"8px"}}>
                    <Typography sx={{fontFamily:SERIF,fontSize:16,fontWeight:700,color:C.tx}}>{o.id}</Typography>
                    <Box sx={{display:"inline-flex",px:"9px",py:"3px",borderRadius:"20px",fontSize:11,fontWeight:700,background:statusMeta.bg,color:statusMeta.color}}>{statusMeta.label}</Box>
                  </Box>
                  <Typography sx={{fontSize:12.5,fontWeight:600,color:C.t2,mb:"4px"}}>{chIcon} {o.channel==="dine"?"Dine In":o.channel==="pickup"?"Pickup":"Delivery"}{o.table?` · ${o.table}`:""}</Typography>
                  {o.customer&&<Typography sx={{fontSize:12,color:C.t2,mb:"4px"}}>👤 {o.customer}{o.waiter?` · 🙋 ${o.waiter}`:""}</Typography>}
                  <Box sx={{display:"flex",alignItems:"center",justifyContent:"space-between",mt:"8px"}}>
                    <Typography sx={{fontSize:12,color:C.t3,fontWeight:500}}>🕐 {o.time} · {o.items} items</Typography>
                    <Typography sx={{fontSize:14,fontWeight:800,color:C.ac}}>₹{o.total}</Typography>
                  </Box>
                  <Box sx={{display:"flex",gap:"6px",mt:"10px"}}>
                    {["🖨️ KOT","🧾 Bill","💳 Pay"].map(btn=>(
                      <Box key={btn} component="button" onClick={(e:any)=>{e.stopPropagation();toast(btn+" ✓");}} sx={{flex:1,py:"5px",background:C.s1,border:`1px solid ${C.bd}`,borderRadius:"8px",fontSize:10.5,fontWeight:600,cursor:"pointer",color:C.t2,fontFamily:FONT,transition:"all .14s","&:hover":{background:C.s2,borderColor:C.bd2}}}>{btn}</Box>
                    ))}
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
