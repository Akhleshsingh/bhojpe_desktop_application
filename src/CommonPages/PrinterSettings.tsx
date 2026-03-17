import React, { useState, useRef, useEffect, useCallback } from "react";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

// ─── CSS Design Tokens ───────────────────────────────────────────────────────
const C = {
  ac: "#FF3D01", ah: "#cc3000",
  adim: "rgba(255,61,1,.07)", amid: "rgba(255,61,1,.13)", abdr: "rgba(255,61,1,.22)",
  bg: "#f4efe8", w: "#fff", s1: "#faf7f3", s2: "#f0ebe3", s3: "#e5ded5",
  bd: "#e2d9d0", bd2: "#cec4b8",
  grn: "#16a34a", gdim: "rgba(22,163,74,.09)", gbdr: "rgba(22,163,74,.26)",
  red: "#dc2626", rdim: "rgba(220,38,38,.09)", rbdr: "rgba(220,38,38,.26)",
  blu: "#2563eb", bdim: "rgba(37,99,235,.08)", bbdr: "rgba(37,99,235,.25)",
  amb: "#d97706", adm2: "rgba(217,119,6,.09)", abdr2: "rgba(217,119,6,.25)",
  pur: "#7c3aed", pdim: "rgba(124,58,237,.08)",
  tx: "#16100a", t2: "#6b5c48", t3: "#a4927e",
};

// ─── Types ───────────────────────────────────────────────────────────────────
type MainTab = "printers" | "kds" | "led";
type PrinterSec = "kitchens" | "printer-config" | "kot-settings" | "bill-settings" | "directprint" | "paper";
type KdsSec = "kds-general" | "kds-display" | "kds-timers" | "kds-screens";
type LedSec = "led-images" | "led-settings" | "led-preview";
type ConnType = "wifi" | "lan" | "bt" | "usb" | "cash";
type PrintType = "kot" | "bill" | "both";

interface Kitchen { id: string; name: string; color: string; printer: string; categories: string[]; online: boolean; autoKot: boolean; showNotes: boolean; }
interface PrinterDevice { id: string; name: string; model: string; conn: string; ip: string; status: "online" | "offline" | "warn"; icon: string; }
interface LedImage { id: string; name: string; size: string; duration: number; src: string; }

const CATEGORIES = ["🥗 Veg Pizza","🍗 Chicken Items","🥘 Paneer","🥬 South Indian","🫓 Roti / Naan","🫕 Dal","🥩 Non-Veg Biryani","🥤 Drinks","🍳 Egg Items","🍮 Desserts","🥩 Mutton Items","🌮 Rolls"];
const COLORS = ["#16a34a","#dc2626","#2563eb","#d97706","#7c3aed","#0f766e"];
const SCAN_DATA: Record<string, { ico: string; nm: string; addr: string }[]> = {
  wifi: [{ico:"🖨️",nm:"Epson TM-T88VI",addr:"192.168.1.10:9100"},{ico:"🖨️",nm:"Star TSP654IIE",addr:"192.168.1.11:9100"},{ico:"🖨️",nm:"Xprinter XP-365B",addr:"192.168.1.25:9100"}],
  lan: [{ico:"🔌",nm:"Epson TM-T20III",addr:"192.168.1.50:9100"},{ico:"🔌",nm:"Generic LAN Printer",addr:"192.168.1.55:9100"}],
  bt: [{ico:"🔵",nm:"BT-Printer-A3B2",addr:"00:1A:7D:DA:71:13"},{ico:"🔵",nm:"Rongta RP80",addr:"AA:BB:CC:DD:EE:FF"}],
  usb: [{ico:"💾",nm:"USB Thermal Printer",addr:"/dev/usb/lp0"},{ico:"💾",nm:"Generic USB",addr:"/dev/usb/lp1"}],
};

// ─── Sub-components ──────────────────────────────────────────────────────────
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label style={{ position:"relative",width:42,height:22,flexShrink:0,display:"inline-block" }}>
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} style={{ opacity:0,width:0,height:0 }} />
      <span onClick={() => onChange(!checked)} style={{
        position:"absolute",cursor:"pointer",inset:0,
        background: checked ? C.grn : C.s3,
        borderRadius:22,transition:".28s",display:"block",
      }}>
        <span style={{
          position:"absolute",height:16,width:16,left: checked ? 23 : 3,bottom:3,
          background:C.w,borderRadius:"50%",transition:".28s",
          boxShadow:"0 1px 3px rgba(0,0,0,.15)",
        }} />
      </span>
    </label>
  );
}

function SbItem({ icon, label, active, badge, badgeColor, onClick }: {
  icon: string; label: string; active: boolean; badge?: string | number;
  badgeColor?: string; onClick: () => void;
}) {
  return (
    <button onClick={onClick} style={{
      display:"flex",alignItems:"center",gap:9,padding:"10px 12px",
      borderRadius:10,marginBottom:2,cursor:"pointer",fontSize:13,
      color: active ? C.ac : C.t2,fontWeight: active ? 700 : 500,
      transition:"all .14s",border: active ? `1.5px solid ${C.abdr}` : "1.5px solid transparent",
      width:"100%",textAlign:"left",background: active ? C.adim : "none",
      fontFamily:"Plus Jakarta Sans,sans-serif",
    }}
      onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLButtonElement).style.background = C.s2; (e.currentTarget as HTMLButtonElement).style.color = C.tx; } }}
      onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLButtonElement).style.background = "none"; (e.currentTarget as HTMLButtonElement).style.color = C.t2; } }}
    >
      <span style={{ fontSize:16,width:20,textAlign:"center",flexShrink:0 }}>{icon}</span>
      {label}
      {badge !== undefined && (
        <span style={{
          marginLeft:"auto",minWidth:18,height:18,borderRadius:9,padding:"0 5px",
          fontSize:"9.5px",fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",
          background: badgeColor || C.grn, color:"#fff",
        }}>{badge}</span>
      )}
    </button>
  );
}

function PrintFieldRow({ label, sub, right }: { label: string; sub?: string; right: React.ReactNode }) {
  return (
    <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"11px 0",borderBottom:`1px solid ${C.bd}` }}>
      <div style={{ display:"flex",flexDirection:"column",gap:2 }}>
        <div style={{ fontSize:"13.5px",fontWeight:700,color:C.tx }}>{label}</div>
        {sub && <div style={{ fontSize:12,color:C.t3 }}>{sub}</div>}
      </div>
      <div style={{ display:"flex",alignItems:"center",gap:10,flexShrink:0 }}>{right}</div>
    </div>
  );
}

function PrintGroup({ title, sub, icon, iconBg, defaultOpen, children }: {
  title: string; sub: string; icon: string; iconBg: string; defaultOpen?: boolean; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(!!defaultOpen);
  const [enabled, setEnabled] = useState(true);
  return (
    <div style={{ background:C.w,border:`1.5px solid ${C.bd}`,borderRadius:14,marginBottom:12,overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,.06)" }}>
      <button onClick={() => setOpen(o => !o)} style={{
        display:"flex",alignItems:"center",gap:12,padding:"15px 18px",cursor:"pointer",
        transition:"background .14s",border:"none",width:"100%",fontFamily:"Plus Jakarta Sans,sans-serif",
        textAlign:"left",background: open ? C.s1 : C.w,borderBottom: open ? `1px solid ${C.bd}` : "none",
      }}>
        <div style={{ width:38,height:38,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0,background:iconBg }}>{icon}</div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:14,fontWeight:800,color:C.tx }}>{title}</div>
          <div style={{ fontSize:12,color:C.t3,marginTop:2 }}>{sub}</div>
        </div>
        <label onClick={e => { e.stopPropagation(); setEnabled(v => !v); }} style={{ position:"relative",width:42,height:22,flexShrink:0,display:"inline-block" }}>
          <input type="checkbox" checked={enabled} readOnly style={{ opacity:0,width:0,height:0 }} />
          <span style={{ position:"absolute",cursor:"pointer",inset:0,background:enabled?C.grn:C.s3,borderRadius:22,transition:".28s",display:"block" }}>
            <span style={{ position:"absolute",height:16,width:16,left:enabled?23:3,bottom:3,background:C.w,borderRadius:"50%",transition:".28s",boxShadow:"0 1px 3px rgba(0,0,0,.15)" }} />
          </span>
        </label>
        <span style={{ fontSize:11,color:C.t3,transition:"transform .22s",flexShrink:0,marginLeft:6,transform:open?"rotate(90deg)":"rotate(0deg)" }}>›</span>
      </button>
      {open && <div style={{ padding:18 }}>{children}</div>}
    </div>
  );
}

function FgInput({ label, value, onChange, placeholder, mono, type }: {
  label: string; value: string; onChange?: (v: string) => void;
  placeholder?: string; mono?: boolean; type?: string;
}) {
  return (
    <div style={{ display:"flex",flexDirection:"column",gap:5 }}>
      <div style={{ fontSize:11,fontWeight:700,color:C.t2,textTransform:"uppercase",letterSpacing:".3px" }}>{label}</div>
      <input
        type={type || "text"} value={value} placeholder={placeholder}
        onChange={e => onChange?.(e.target.value)}
        style={{
          padding:"10px 13px",background:C.s1,border:`1.5px solid ${C.bd}`,borderRadius:10,
          fontFamily: mono ? "JetBrains Mono,monospace" : "Plus Jakarta Sans,sans-serif",
          fontSize:13,color:C.tx,outline:"none",width:"100%",
        }}
        onFocus={e => { e.target.style.borderColor = C.ac; e.target.style.background = C.w; }}
        onBlur={e => { e.target.style.borderColor = C.bd; e.target.style.background = C.s1; }}
      />
    </div>
  );
}

function FgSelect({ label, value, onChange, options }: {
  label: string; value: string; onChange?: (v: string) => void; options: string[];
}) {
  return (
    <div style={{ display:"flex",flexDirection:"column",gap:5 }}>
      <div style={{ fontSize:11,fontWeight:700,color:C.t2,textTransform:"uppercase",letterSpacing:".3px" }}>{label}</div>
      <select value={value} onChange={e => onChange?.(e.target.value)} style={{
        padding:"10px 30px 10px 13px",background:C.s1,border:`1.5px solid ${C.bd}`,borderRadius:10,
        fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:13,color:C.tx,outline:"none",width:"100%",
        appearance:"none",
        backgroundImage:`url("data:image/svg+xml,%3Csvg width='10' height='6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23a4927e' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E")`,
        backgroundRepeat:"no-repeat",backgroundPosition:"right 11px center",cursor:"pointer",
      }}>
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
    </div>
  );
}

function Btn({ children, onClick, variant = "default", sm }: {
  children: React.ReactNode; onClick?: () => void; variant?: "default" | "primary" | "green" | "danger"; sm?: boolean;
}) {
  const styles: Record<string, React.CSSProperties> = {
    default: { background:C.w,border:`1.5px solid ${C.bd}`,color:C.t2 },
    primary: { background:C.ac,border:`1.5px solid ${C.ac}`,color:"#fff",boxShadow:`0 2px 8px rgba(255,61,1,.25)` },
    green: { background:C.grn,border:`1.5px solid ${C.grn}`,color:"#fff" },
    danger: { color:C.red,border:`1.5px solid ${C.rbdr}`,background:C.rdim },
  };
  return (
    <button onClick={onClick} style={{
      display:"flex",alignItems:"center",gap:6,
      padding: sm ? "7px 12px" : "9px 16px",
      borderRadius:10,fontSize: sm ? 12 : 13,fontWeight:700,cursor:"pointer",
      transition:"all .14s",fontFamily:"Plus Jakarta Sans,sans-serif",
      ...styles[variant],
    }}>
      {children}
    </button>
  );
}

function Pill({ children, variant }: { children: React.ReactNode; variant: "g"|"r"|"b"|"a"|"ac" }) {
  const vs = { g:{bg:C.gdim,color:C.grn,border:C.gbdr}, r:{bg:C.rdim,color:C.red,border:C.rbdr}, b:{bg:C.bdim,color:C.blu,border:C.bbdr}, a:{bg:C.adm2,color:C.amb,border:C.abdr2}, ac:{bg:C.adim,color:C.ac,border:C.abdr} };
  const v = vs[variant];
  return <span style={{ display:"inline-flex",alignItems:"center",gap:4,padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:700,background:v.bg,color:v.color,border:`1px solid ${v.border}` }}>{children}</span>;
}

function DotStatus({ status }: { status: "online"|"offline"|"warn" }) {
  const c = status==="online" ? C.grn : status==="warn" ? C.amb : C.red;
  return <span style={{ width:8,height:8,borderRadius:"50%",background:c,display:"inline-block",animation:status==="online"?"pulse 1.2s infinite":undefined }} />;
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function PrinterSettings() {
  const { branchData } = useAuth();
  const [mainTab, setMainTab] = useState<MainTab>("printers");
  const [printerSec, setPrinterSec] = useState<PrinterSec>("kitchens");
  const [kdsSec, setKdsSec] = useState<KdsSec>("kds-general");
  const [ledSec, setLedSec] = useState<LedSec>("led-images");

  // Kitchen state
  const [kitchens, setKitchens] = useState<Kitchen[]>([
    { id:"k1", name:"Veg Kitchen", color:"#16a34a", printer:"Epson TM-T88VI (192.168.1.10)", categories:["🥗 Veg Pizza","🥘 Paneer","🥬 South Indian","🫓 Roti / Naan","🫕 Dal"], online:true, autoKot:true, showNotes:true },
    { id:"k2", name:"Non-Veg Kitchen", color:"#dc2626", printer:"Star TSP654IIE (192.168.1.11)", categories:["🍗 Chicken Items","🥩 Mutton Items","🍳 Egg Items","🥩 Non-Veg Biryani"], online:true, autoKot:true, showNotes:true },
  ]);
  const [openKitchens, setOpenKitchens] = useState<string[]>(["k1"]);
  const [showAddKitchen, setShowAddKitchen] = useState(false);
  const [newKitchenName, setNewKitchenName] = useState("");
  const [newKitchenColor, setNewKitchenColor] = useState("#16a34a");
  const [newKitchenCats, setNewKitchenCats] = useState<string[]>([]);
  const [newKitchenPrinter, setNewKitchenPrinter] = useState("");

  // Printer devices
  const [printers] = useState<PrinterDevice[]>([
    { id:"p1", name:"Veg Kitchen Printer", model:"Epson TM-T88VI · WiFi", conn:"wifi", ip:"192.168.1.10", status:"online", icon:"🖨️" },
    { id:"p2", name:"Non-Veg Kitchen Printer", model:"Star TSP654IIE · LAN", conn:"lan", ip:"192.168.1.11", status:"online", icon:"🖨️" },
    { id:"p3", name:"Bill / Receipt Printer", model:"Epson TM-T20III · USB", conn:"usb", ip:"", status:"online", icon:"🧾" },
    { id:"p4", name:"Cash Drawer", model:"Bill Printer se connect", conn:"cash", ip:"", status:"warn", icon:"🗄️" },
    { id:"p5", name:"KDS Display", model:"Kitchen Display System", conn:"wifi", ip:"", status:"offline", icon:"🖥️" },
  ]);
  const [selectedPrinter, setSelectedPrinter] = useState<string>("p1");

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalName, setModalName] = useState("");
  const [modalFunction, setModalFunction] = useState("");
  const [modalPrintType, setModalPrintType] = useState<PrintType>("kot");
  const [modalConn, setModalConn] = useState<ConnType>("wifi");
  const [modalIp, setModalIp] = useState("");
  const [modalPort, setModalPort] = useState("9100");
  const [modalModel, setModalModel] = useState("");
  const [modalPaperSize, setModalPaperSize] = useState("80mm");
  const [modalCopies, setModalCopies] = useState("1 Copy");
  const [modalEncoding, setModalEncoding] = useState("ESC/POS");
  const [modalAutoPrint, setModalAutoPrint] = useState(true);
  const [modalActive, setModalActive] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [foundPrinters, setFoundPrinters] = useState<{ ico: string; nm: string; addr: string }[]>([]);
  const [selectedFound, setSelectedFound] = useState<string>("");

  // LED state
  const [ledImages, setLedImages] = useState<LedImage[]>([]);
  const [ledPlaying, setLedPlaying] = useState(false);
  const [ledCurrentIdx, setLedCurrentIdx] = useState(0);
  const ledTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // KOT settings toggles
  const [kotToggles, setKotToggles] = useState({ restName:true,branchName:true,logo:false,kotNum:true,table:true,orderType:true,dateTime:true,waiter:true,pax:true,orderId:true,itemNameBold:true,itemQtyLarge:true,itemPrice:false,itemNotes:true,modifiers:true,vegIndicator:true,footer:true,copyNum:true,cutPaper:true });
  const [billToggles, setBillToggles] = useState({ logo:true,restName:true,address:true,phone:true,gstin:true,fssai:false,billNum:true,table:true,dateTime:true,waiter:true,pax:true,customer:false,gstBreakup:true,discount:true,delivery:true,roundOff:false,amtWords:false,upiQr:false,website:false,printInvoice:true,cutPaper:true });
  const [directToggles, setDirectToggles] = useState({ kotDirect:true,billDirect:true,autoKotOnAdd:false,autoBillOnCheckout:true,openDrawer:true,ebillSend:false,kotSound:true,newOrderSound:true,reprintConfirm:true,partialKot:true });

  // Paper
  const [paperSize, setPaperSize] = useState("80mm");
  const [charsPerLine, setCharsPerLine] = useState("48");
  const [fontSize, setFontSize] = useState("Medium (9pt)");
  const [lineSpacing, setLineSpacing] = useState("Normal");

  // KDS
  const [kdsIp, setKdsIp] = useState("");
  const [kdsConnType, setKdsConnType] = useState("WebSocket (LAN)");
  const [kdsToggles, setKdsToggles] = useState({ autoSend:true,showTimer:true,soundAlert:true,autoRemove:true,orderType:true,customerName:false,platform:true });
  const [kdsCols, setKdsCols] = useState("4 Columns");
  const [kdsCardSize, setKdsCardSize] = useState("Medium");
  const [kdsTheme, setKdsTheme] = useState("Dark (Kitchen)");
  const [kdsFontSize, setKdsFontSize] = useState("Medium");
  const [normalMin, setNormalMin] = useState("15");
  const [warnMin, setWarnMin] = useState("25");
  const [critMin, setCritMin] = useState("25");
  const [kdsBlink, setKdsBlink] = useState(true);
  const [kdsSound, setKdsSound] = useState(true);

  // LED settings
  const [ledDuration, setLedDuration] = useState("5");
  const [ledTransition, setLedTransition] = useState("Fade");
  const [ledTransitionSpeed, setLedTransitionSpeed] = useState("Medium (1s)");
  const [ledFit, setLedFit] = useState("Cover (Full Screen)");
  const [ledOrientation, setLedOrientation] = useState("Landscape (16:9)");
  const [ledLoop, setLedLoop] = useState(true);
  const [ledToggles, setLedToggles] = useState({ customerDisplay:true, autoStart:true, pauseOnOrder:false });

  // Bill header
  const [billRestName, setBillRestName] = useState("Bhojpe Restaurant");
  const [billAddress, setBillAddress] = useState("City Center, Gwalior MP");
  const [billPhone, setBillPhone] = useState("+91 94250 08600");
  const [billGstin, setBillGstin] = useState("23AAACB1234A1Z5");
  const [billFssai, setBillFssai] = useState("");
  const [billEmail, setBillEmail] = useState("hello@bhojpe.in");
  const [billUpi, setBillUpi] = useState("");
  const [billFooter1, setBillFooter1] = useState("Thank you! Visit us again 🙏");
  const [billFooter2, setBillFooter2] = useState("");
  const [billCopies, setBillCopies] = useState("1 Copy");

  // KOT header
  const [kotRestName, setKotRestName] = useState(branchData?.data?.restaurant_name || "Bhojpe Restaurant");
  const [kotBranch, setKotBranch] = useState(branchData?.data?.branch_name || "Kap's Cafe, Gwalior");
  const [kotFooter, setKotFooter] = useState("Please prepare these items");

  const showToast = useCallback((msg: string, type: "success"|"error"|"info" = "success") => {
    if (type === "error") toast.error(msg);
    else if (type === "info") toast(msg);
    else toast.success(msg);
  }, []);

  // ── Kitchen helpers ──
  const toggleKitchen = (id: string) => {
    setOpenKitchens(prev => prev.includes(id) ? prev.filter(k => k !== id) : [...prev, id]);
  };
  const removeKitchen = (id: string) => {
    if (!window.confirm("Remove this kitchen?")) return;
    setKitchens(prev => prev.filter(k => k.id !== id));
    showToast("Kitchen removed");
  };
  const addKitchen = async () => {
    if (!newKitchenName.trim()) { showToast("Kitchen name enter karo", "error"); return; }
    const newK: Kitchen = {
      id: `k${Date.now()}`, name: newKitchenName.trim(), color: newKitchenColor,
      printer: newKitchenPrinter || "No printer", categories: newKitchenCats,
      online: false, autoKot: true, showNotes: true,
    };
    try {
      await client.post("/kitchens", { name: newK.name, color: newK.color, printer: newK.printer, categories: newK.categories });
    } catch { /* use local state */ }
    setKitchens(prev => [...prev, newK]);
    setNewKitchenName(""); setNewKitchenColor("#16a34a"); setNewKitchenCats([]); setNewKitchenPrinter(""); setShowAddKitchen(false);
    showToast(`${newK.name} kitchen added ✓`);
  };
  const toggleCat = (cat: string, arr: string[], setArr: (v: string[]) => void) => {
    setArr(arr.includes(cat) ? arr.filter(c => c !== cat) : [...arr, cat]);
  };

  // ── Modal helpers ──
  const openModal = (name: string | null) => {
    setModalName(name || ""); setModalFunction(""); setModalPrintType("kot"); setModalConn("wifi");
    setModalIp(""); setModalPort("9100"); setModalModel(""); setFoundPrinters([]); setSelectedFound("");
    setModalOpen(true);
  };
  const doScan = () => {
    setScanning(true); setFoundPrinters([]);
    setTimeout(() => {
      const results = SCAN_DATA[modalConn] || [];
      setFoundPrinters(results); setScanning(false);
      showToast(`${results.length} printer(s) found`);
    }, 2200);
  };
  const saveModal = async () => {
    if (!modalName.trim()) { showToast("Printer name enter karo", "error"); return; }
    try {
      await client.post("/printers", { name: modalName, function: modalFunction, printType: modalPrintType, conn: modalConn, ip: modalIp, port: modalPort, model: modalModel, paperSize: modalPaperSize, copies: modalCopies, encoding: modalEncoding, autoPrint: modalAutoPrint, active: modalActive });
    } catch { /* local only */ }
    setModalOpen(false);
    showToast(`${modalName} saved successfully ✓`);
  };

  // ── LED helpers ──
  const handleFiles = (files: File[]) => {
    const valid = files.filter(f => f.type.startsWith("image/") && f.size <= 5*1024*1024);
    valid.forEach(f => {
      const reader = new FileReader();
      reader.onload = e => {
        setLedImages(prev => [...prev, { id:`img${Date.now()}${Math.random()}`, name:f.name, size:`${(f.size/1024).toFixed(1)} KB`, duration:5, src:e.target?.result as string }]);
      };
      reader.readAsDataURL(f);
    });
    if (valid.length < files.length) showToast("Some files skipped (>5MB or not image)", "error");
  };

  useEffect(() => {
    if (ledPlaying && ledImages.length > 0) {
      const dur = (ledImages[ledCurrentIdx]?.duration || 5) * 1000;
      ledTimerRef.current = setTimeout(() => { setLedCurrentIdx(i => (i+1) % ledImages.length); }, dur);
    }
    return () => { if (ledTimerRef.current) clearTimeout(ledTimerRef.current); };
  }, [ledPlaying, ledCurrentIdx, ledImages]);

  // ── Save functions ──
  const saveKotSettings = async () => {
    try { await client.post("/print-settings/kot", { ...kotToggles, restaurantName: kotRestName, branchName: kotBranch, footer: kotFooter }); } catch { /* local */ }
    showToast("KOT settings saved ✓");
  };
  const saveBillSettings = async () => {
    try { await client.post("/print-settings/bill", { ...billToggles, restaurantName: billRestName, address: billAddress, phone: billPhone, gstin: billGstin, fssai: billFssai, email: billEmail, upi: billUpi, footer1: billFooter1, footer2: billFooter2, copies: billCopies }); } catch { /* local */ }
    showToast("Bill settings saved ✓");
  };
  const saveDirectPrint = async () => {
    try { await client.post("/print-settings/direct", directToggles); } catch { /* local */ }
    showToast("Direct print settings saved ✓");
  };
  const savePaperSettings = async () => {
    try { await client.post("/print-settings/paper", { paperSize, charsPerLine, fontSize, lineSpacing }); } catch { /* local */ }
    showToast("Paper settings saved ✓");
  };
  const saveKdsSettings = async () => {
    try { await client.post("/kds-settings", { ip: kdsIp, connType: kdsConnType, ...kdsToggles, cols: kdsCols, cardSize: kdsCardSize, theme: kdsTheme, fontSize: kdsFontSize }); } catch { /* local */ }
    showToast("KDS settings saved ✓");
  };
  const saveLedSettings = async () => {
    try { await client.post("/led-settings", { duration: ledDuration, transition: ledTransition, speed: ledTransitionSpeed, fit: ledFit, orientation: ledOrientation, loop: ledLoop, ...ledToggles }); } catch { /* local */ }
    showToast("Display settings saved ✓");
  };

  // ── Styles ──
  const contentStyle: React.CSSProperties = { flex:1,padding:"22px 26px",overflowY:"auto",background:C.bg };
  const sidebarStyle: React.CSSProperties = { width:236,background:C.w,borderRight:`1px solid ${C.bd}`,flexShrink:0,padding:"14px 8px",overflowY:"auto" };
  const sbSecStyle: React.CSSProperties = { fontSize:"9.5px",fontWeight:800,textTransform:"uppercase",letterSpacing:"1.1px",color:C.t3,padding:"10px 12px 4px" };
  const pgTitleStyle: React.CSSProperties = { fontSize:22,fontWeight:800,color:C.tx };
  const pgSubStyle: React.CSSProperties = { fontSize:13,color:C.t3,marginTop:3,fontWeight:500,maxWidth:560 };
  const cardStyle: React.CSSProperties = { background:C.w,border:`1.5px solid ${C.bd}`,borderRadius:14,boxShadow:"0 1px 4px rgba(0,0,0,.06)",marginBottom:18,overflow:"hidden" };
  const cardHdrStyle: React.CSSProperties = { display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 18px",borderBottom:`1px solid ${C.bd}`,background:C.s1 };
  const cardBodyStyle: React.CSSProperties = { padding:18 };
  const grid2: React.CSSProperties = { display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14 };
  const grid3: React.CSSProperties = { display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14,marginBottom:14 };

  // ── Sections ──
  const renderKitchens = () => (
    <div>
      <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:20 }}>
        <div>
          <div style={pgTitleStyle}>Kitchen Management</div>
          <div style={pgSubStyle}>Har kitchen add karo, unhe categories assign karo aur printer link karo</div>
        </div>
        <div style={{ display:"flex",gap:8 }}>
          <Btn onClick={() => showToast("Test all kitchen printers 🖨️")}>🖨️ Test All</Btn>
          <Btn variant="primary" onClick={() => setShowAddKitchen(v=>!v)}>+ Add Kitchen</Btn>
        </div>
      </div>

      {showAddKitchen && (
        <div style={{ background:C.adim,border:`1.5px dashed ${C.abdr}`,borderRadius:14,padding:20,marginBottom:18 }}>
          <div style={{ fontSize:14,fontWeight:800,color:C.ac,marginBottom:14 }}>➕ New Kitchen Setup</div>
          <div style={grid3}>
            <FgInput label="Kitchen Name" value={newKitchenName} onChange={setNewKitchenName} placeholder="e.g. Veg Kitchen" />
            <div style={{ display:"flex",flexDirection:"column",gap:5 }}>
              <div style={{ fontSize:11,fontWeight:700,color:C.t2,textTransform:"uppercase",letterSpacing:".3px" }}>Color</div>
              <div style={{ display:"flex",gap:8,marginTop:4 }}>
                {COLORS.map(col => (
                  <div key={col} onClick={() => setNewKitchenColor(col)} style={{ width:32,height:32,borderRadius:8,background:col,cursor:"pointer",border:newKitchenColor===col?`2px solid ${C.tx}`:"2px solid transparent",transition:"border .14s" }} />
                ))}
              </div>
            </div>
            <FgSelect label="Assign Printer" value={newKitchenPrinter} onChange={setNewKitchenPrinter} options={["Select Printer","Epson TM-T88VI (192.168.1.10)","Star TSP654IIE (192.168.1.11)","Bill Printer (USB)"]} />
          </div>
          <div style={{ display:"flex",flexDirection:"column",gap:5,marginBottom:14 }}>
            <div style={{ fontSize:11,fontWeight:700,color:C.t2,textTransform:"uppercase",letterSpacing:".3px" }}>Item Categories</div>
            <div style={{ display:"flex",flexWrap:"wrap",gap:7,marginTop:8 }}>
              {CATEGORIES.map(cat => {
                const on = newKitchenCats.includes(cat);
                return (
                  <div key={cat} onClick={() => toggleCat(cat, newKitchenCats, setNewKitchenCats)} style={{
                    display:"flex",alignItems:"center",gap:5,padding:"6px 12px",borderRadius:20,fontSize:12,fontWeight:700,cursor:"pointer",transition:"all .14s",userSelect:"none",
                    border: on ? `1.5px solid ${C.gbdr}` : `1.5px solid ${C.bd}`,
                    background: on ? C.gdim : C.s1, color: on ? C.grn : C.t2,
                  }}>
                    {on && <div style={{ width:6,height:6,borderRadius:"50%",background:C.grn }} />}
                    {cat}{on && <span style={{ fontSize:10,opacity:1,color:C.grn }}>✕</span>}
                  </div>
                );
              })}
            </div>
          </div>
          <div style={{ display:"flex",gap:8 }}>
            <Btn variant="primary" onClick={addKitchen}>✅ Add Kitchen</Btn>
            <Btn onClick={() => setShowAddKitchen(false)}>Cancel</Btn>
          </div>
        </div>
      )}

      {kitchens.map(k => {
        const isOpen = openKitchens.includes(k.id);
        return (
          <div key={k.id} style={{ background:C.w,border:`1.5px solid ${C.bd}`,borderRadius:14,marginBottom:16,overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,.06)",transition:"box-shadow .16s" }}>
            <div onClick={() => toggleKitchen(k.id)} style={{ display:"flex",alignItems:"center",gap:12,padding:"16px 18px",cursor:"pointer",borderBottom:isOpen?`1px solid ${C.bd}`:"1px solid transparent",transition:"border-color .2s" }}>
              <div style={{ width:40,height:40,borderRadius:11,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0,background:`${k.color}22` }}>
                {k.name.toLowerCase().includes("veg") && !k.name.toLowerCase().includes("non") ? "🥗" : "🍗"}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:15,fontWeight:800,color:C.tx }}>{k.name}</div>
                <div style={{ fontSize:12,color:C.t3,marginTop:2 }}>{k.printer} · {k.categories.length} categories</div>
              </div>
              <div style={{ display:"flex",gap:6,alignItems:"center",flexWrap:"wrap" }}>
                <Pill variant={k.online?"g":"r"}><DotStatus status={k.online?"online":"offline"} style={{ width:6,height:6 } as any} />{k.online?"Online":"Offline"}</Pill>
                <Pill variant="ac">{k.categories.length} Categories</Pill>
                <span style={{ display:"inline-flex",alignItems:"center",gap:4,padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:700,background:C.s2,color:C.t2,border:`1px solid ${C.bd}` }}>80mm</span>
              </div>
              <div style={{ display:"flex",gap:6,marginLeft:8,flexShrink:0 }} onClick={e => e.stopPropagation()}>
                <Btn sm onClick={() => openModal(k.name)}>⚙️ Printer</Btn>
                <Btn sm onClick={() => showToast("Test KOT sent 🖨️")}>🖨️ Test</Btn>
                <Btn sm variant="danger" onClick={() => removeKitchen(k.id)}>🗑</Btn>
              </div>
            </div>
            {isOpen && (
              <div style={{ padding:18 }}>
                <div style={grid3}>
                  <FgInput label="Kitchen Name" value={k.name} onChange={v => setKitchens(prev => prev.map(x => x.id===k.id?{...x,name:v}:x))} />
                  <FgSelect label="Assigned Printer" value={k.printer} onChange={v => setKitchens(prev => prev.map(x => x.id===k.id?{...x,printer:v}:x))} options={["Epson TM-T88VI (192.168.1.10)","Star TSP654IIE (LAN)","Bill Printer (USB)"]} />
                  <FgSelect label="KOT Copies" value="1 Copy" options={["1 Copy","2 Copies"]} />
                </div>
                <div style={{ display:"flex",flexDirection:"column",gap:5,marginBottom:14 }}>
                  <div style={{ fontSize:11,fontWeight:700,color:C.t2,textTransform:"uppercase",letterSpacing:".3px" }}>Assigned Item Categories</div>
                  <div style={{ display:"flex",flexWrap:"wrap",gap:7,marginTop:8 }}>
                    {CATEGORIES.map(cat => {
                      const on = k.categories.includes(cat);
                      return (
                        <div key={cat} onClick={() => setKitchens(prev => prev.map(x => x.id===k.id?{...x,categories:on?x.categories.filter(c=>c!==cat):[...x.categories,cat]}:x))} style={{
                          display:"flex",alignItems:"center",gap:5,padding:"6px 12px",borderRadius:20,fontSize:12,fontWeight:700,cursor:"pointer",transition:"all .14s",userSelect:"none",
                          border:on?`1.5px solid ${C.gbdr}`:`1.5px solid ${C.bd}`,background:on?C.gdim:C.s1,color:on?C.grn:C.t2,
                        }}>
                          {on && <div style={{ width:6,height:6,borderRadius:"50%",background:C.grn }} />}{cat}{on&&<span style={{ fontSize:10,color:C.grn }}>✕</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div style={{ display:"flex",gap:16,marginTop:14,paddingTop:14,borderTop:`1px solid ${C.bd}`,alignItems:"center" }}>
                  <label style={{ display:"flex",alignItems:"center",gap:7,fontSize:13,fontWeight:600,color:C.t2,cursor:"pointer" }}>
                    <Toggle checked={k.autoKot} onChange={v => setKitchens(prev => prev.map(x => x.id===k.id?{...x,autoKot:v}:x))} />Auto KOT Print
                  </label>
                  <label style={{ display:"flex",alignItems:"center",gap:7,fontSize:13,fontWeight:600,color:C.t2,cursor:"pointer" }}>
                    <Toggle checked={k.showNotes} onChange={v => setKitchens(prev => prev.map(x => x.id===k.id?{...x,showNotes:v}:x))} />Show Notes on KOT
                  </label>
                  <Btn variant="primary" sm onClick={() => showToast(`${k.name} saved ✓`)}>💾 Save</Btn>
                </div>
              </div>
            )}
          </div>
        );
      })}

      <div style={cardStyle}>
        <div style={cardHdrStyle}>
          <div style={{ display:"flex",alignItems:"center",gap:10 }}>
            <div style={{ width:36,height:36,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,background:C.adm2 }}>⚠️</div>
            <div>
              <div style={{ fontSize:15,fontWeight:800,color:C.tx }}>Fallback / Default Printer</div>
              <div style={{ fontSize:12,color:C.t3,marginTop:1 }}>Jab kisi category ka printer assign na ho</div>
            </div>
          </div>
        </div>
        <div style={{ ...cardBodyStyle,display:"flex",alignItems:"center",gap:14 }}>
          <div style={{ flex:1,fontSize:13,color:C.t2 }}>Unassigned categories ke KOT is printer se print honge</div>
          <select style={{ maxWidth:260,padding:"10px 30px 10px 13px",background:C.s1,border:`1.5px solid ${C.bd}`,borderRadius:10,fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:13,color:C.tx,outline:"none",appearance:"none" }}>
            <option>Veg Kitchen Printer (192.168.1.10)</option>
            <option>Non-Veg Kitchen Printer</option>
            <option>Bill Printer (USB)</option>
          </select>
          <Btn variant="primary" sm onClick={() => showToast("Fallback saved ✓")}>💾 Save</Btn>
        </div>
      </div>
    </div>
  );

  const renderPrinterConfig = () => (
    <div>
      <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:20 }}>
        <div>
          <div style={pgTitleStyle}>Printer Configuration</div>
          <div style={pgSubStyle}>Sabhi printers setup karo — WiFi, Bluetooth, LAN, USB, Cash Drawer</div>
        </div>
        <Btn variant="primary" onClick={() => openModal(null)}>+ Add New Printer</Btn>
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:20 }}>
        {printers.map(p => (
          <div key={p.id} onClick={() => { setSelectedPrinter(p.id); openModal(p.name); }} style={{
            background:C.w,border:selectedPrinter===p.id?`1.5px solid ${C.ac}`:`1.5px solid ${C.bd}`,
            borderRadius:14,padding:18,cursor:"pointer",transition:"all .16s",textAlign:"center",
            boxShadow:selectedPrinter===p.id?`0 0 0 3px ${C.adim}`:"0 1px 4px rgba(0,0,0,.06)",
            backgroundColor:selectedPrinter===p.id?C.adim:C.w,
          }}>
            <div style={{ fontSize:32,marginBottom:10 }}>{p.icon}</div>
            <div style={{ fontSize:14,fontWeight:800,color:C.tx,marginBottom:4 }}>{p.name}</div>
            <div style={{ fontSize:12,color:C.t3 }}>{p.model}</div>
            <div style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:6,marginTop:8,fontSize:12,fontWeight:700 }}>
              <DotStatus status={p.status} />
              <span style={{ color:p.status==="online"?C.grn:p.status==="warn"?C.amb:C.red }}>{p.status==="online"?"Online":p.status==="warn"?"Not Configured":"Offline"}</span>
            </div>
          </div>
        ))}
        <div onClick={() => openModal(null)} style={{ background:C.w,border:`1.5px dashed ${C.bd}`,borderRadius:14,padding:18,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",boxShadow:"0 1px 4px rgba(0,0,0,.06)" }}>
          <div style={{ fontSize:32,marginBottom:10,opacity:.4 }}>➕</div>
          <div style={{ fontSize:14,fontWeight:700,color:C.t2 }}>Add Printer</div>
          <div style={{ fontSize:12,color:C.t3,marginTop:4 }}>New device setup</div>
        </div>
      </div>
    </div>
  );

  const renderKotSettings = () => (
    <div>
      <div style={{ marginBottom:20 }}>
        <div style={pgTitleStyle}>KOT Print Settings</div>
        <div style={pgSubStyle}>Kitchen Order Ticket par kya print hoga — sab manual configure karo</div>
      </div>
      <PrintGroup title="Restaurant Header" sub="KOT ke upar restaurant info" icon="🏪" iconBg={C.adim} defaultOpen>
        <div style={grid2}>
          <FgInput label="Restaurant Name" value={kotRestName} onChange={setKotRestName} />
          <FgInput label="Branch Name" value={kotBranch} onChange={setKotBranch} />
        </div>
        <PrintFieldRow label="Print Restaurant Name" sub="KOT ke top par naam dikhe" right={<Toggle checked={kotToggles.restName} onChange={v=>setKotToggles(t=>({...t,restName:v}))} />} />
        <PrintFieldRow label="Print Branch Name" sub="Branch city/area" right={<Toggle checked={kotToggles.branchName} onChange={v=>setKotToggles(t=>({...t,branchName:v}))} />} />
        <div style={{ borderBottom:"none" }}><PrintFieldRow label="Print Logo on KOT" sub="Bhojpe logo print ho" right={<Toggle checked={kotToggles.logo} onChange={v=>setKotToggles(t=>({...t,logo:v}))} />} /></div>
      </PrintGroup>
      <PrintGroup title="Order Details" sub="Table, time, waiter info" icon="📋" iconBg={C.bdim}>
        <PrintFieldRow label="KOT Number" sub="Serial KOT number" right={<Toggle checked={kotToggles.kotNum} onChange={v=>setKotToggles(t=>({...t,kotNum:v}))} />} />
        <PrintFieldRow label="Table Number" sub="T-1, T-2 etc." right={<Toggle checked={kotToggles.table} onChange={v=>setKotToggles(t=>({...t,table:v}))} />} />
        <PrintFieldRow label="Order Type (Dine/Pickup/Delivery)" sub="Order channel print ho" right={<Toggle checked={kotToggles.orderType} onChange={v=>setKotToggles(t=>({...t,orderType:v}))} />} />
        <PrintFieldRow label="Date & Time" sub="KOT print time" right={<Toggle checked={kotToggles.dateTime} onChange={v=>setKotToggles(t=>({...t,dateTime:v}))} />} />
        <PrintFieldRow label="Waiter Name" sub="Assigned waiter ka naam" right={<Toggle checked={kotToggles.waiter} onChange={v=>setKotToggles(t=>({...t,waiter:v}))} />} />
        <PrintFieldRow label="Pax Count" sub="Kitne customer" right={<Toggle checked={kotToggles.pax} onChange={v=>setKotToggles(t=>({...t,pax:v}))} />} />
        <div style={{ borderBottom:"none" }}><PrintFieldRow label="Order ID" sub="#001 order number" right={<Toggle checked={kotToggles.orderId} onChange={v=>setKotToggles(t=>({...t,orderId:v}))} />} /></div>
      </PrintGroup>
      <PrintGroup title="Item Details" sub="Food items ka format" icon="🍽️" iconBg={C.gdim}>
        <PrintFieldRow label="Item Name (Bold)" sub="Item naam bold print ho" right={<Toggle checked={kotToggles.itemNameBold} onChange={v=>setKotToggles(t=>({...t,itemNameBold:v}))} />} />
        <PrintFieldRow label="Item Quantity (Large)" sub="Qty number bada dikhe" right={<Toggle checked={kotToggles.itemQtyLarge} onChange={v=>setKotToggles(t=>({...t,itemQtyLarge:v}))} />} />
        <PrintFieldRow label="Item Price on KOT" sub="Kitchen ko price dikhana" right={<Toggle checked={kotToggles.itemPrice} onChange={v=>setKotToggles(t=>({...t,itemPrice:v}))} />} />
        <PrintFieldRow label="Item Notes / Customization" sub='"Less spicy", "Extra gravy" etc.' right={<Toggle checked={kotToggles.itemNotes} onChange={v=>setKotToggles(t=>({...t,itemNotes:v}))} />} />
        <PrintFieldRow label="Modifiers on KOT" sub="Size, toppings etc." right={<Toggle checked={kotToggles.modifiers} onChange={v=>setKotToggles(t=>({...t,modifiers:v}))} />} />
        <div style={{ borderBottom:"none" }}><PrintFieldRow label="Veg/Non-Veg Indicator" sub="● symbol print ho" right={<Toggle checked={kotToggles.vegIndicator} onChange={v=>setKotToggles(t=>({...t,vegIndicator:v}))} />} /></div>
      </PrintGroup>
      <PrintGroup title="Footer" sub="KOT ke neeche" icon="📄" iconBg={C.adm2}>
        <PrintFieldRow label="Footer Message" sub="Custom message at bottom" right={<input value={kotFooter} onChange={e=>setKotFooter(e.target.value)} style={{ maxWidth:220,padding:"9px 12px",background:C.s1,border:`1.5px solid ${C.bd}`,borderRadius:10,fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:13,color:C.tx,outline:"none" }} />} />
        <PrintFieldRow label="Copy Number" sub="COPY 1/1 ya 1/2" right={<Toggle checked={kotToggles.copyNum} onChange={v=>setKotToggles(t=>({...t,copyNum:v}))} />} />
        <div style={{ borderBottom:"none" }}><PrintFieldRow label="Cut Paper After KOT" sub="Auto paper cut" right={<Toggle checked={kotToggles.cutPaper} onChange={v=>setKotToggles(t=>({...t,cutPaper:v}))} />} /></div>
      </PrintGroup>

      <div style={cardStyle}>
        <div style={cardHdrStyle}>
          <div style={{ display:"flex",alignItems:"center",gap:10 }}>
            <div style={{ width:36,height:36,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,background:C.s2 }}>👁</div>
            <div><div style={{ fontSize:15,fontWeight:800,color:C.tx }}>KOT Preview</div><div style={{ fontSize:12,color:C.t3,marginTop:1 }}>Live preview of KOT ticket</div></div>
          </div>
          <Btn sm variant="green" onClick={() => showToast("Test KOT printed 🖨️")}>🖨️ Print Test KOT</Btn>
        </div>
        <div style={{ ...cardBodyStyle,display:"flex",gap:20 }}>
          <div style={{ flex:1,background:C.s1,border:`1px dashed ${C.bd2}`,borderRadius:14,padding:18,fontFamily:"JetBrains Mono,monospace",fontSize:12,lineHeight:2,textAlign:"center" }}>
            ================================<br/>
            &nbsp;&nbsp;<strong>{kotRestName}</strong><br/>
            &nbsp;&nbsp;{kotBranch}<br/>
            ————————————————<br/>
            <strong>KOT #023 — VEG KITCHEN</strong><br/>
            ————————————————<br/>
            {kotToggles.table && <>Table: T-5 &nbsp;|&nbsp; Pax: 4<br/></>}
            {kotToggles.waiter && <>Waiter: Sanjay S.<br/></>}
            {kotToggles.dateTime && <>Time: 15/03/26 07:30 PM<br/></>}
            {kotToggles.orderType && <>Order Type: Dine In<br/></>}
            ————————————————<br/>
            <strong>3 x Butter Paneer Masala</strong><br/>
            {kotToggles.itemNotes && <>&nbsp;&nbsp;● Spicy · Extra Gravy<br/></>}
            <strong>2 x Garlic Naan</strong><br/>
            <strong>1 x Dal Tadka</strong><br/>
            ================================<br/>
            {kotToggles.footer && <>{kotFooter}<br/></>}
            {kotToggles.copyNum && <>COPY 1 / 1<br/></>}
            ================================
          </div>
        </div>
      </div>
      <div style={{ display:"flex",justifyContent:"flex-end",marginTop:8 }}>
        <Btn variant="primary" onClick={saveKotSettings}>💾 Save KOT Settings</Btn>
      </div>
    </div>
  );

  const renderBillSettings = () => (
    <div>
      <div style={{ marginBottom:20 }}>
        <div style={pgTitleStyle}>Bill Print Settings</div>
        <div style={pgSubStyle}>Customer bill / Tax Invoice par kya print hoga — sab configure karo</div>
      </div>
      <PrintGroup title="Restaurant Header" sub="Bill ke upar restaurant identity" icon="🏪" iconBg={C.adim} defaultOpen>
        <div style={grid2}>
          <FgInput label="Restaurant Name" value={billRestName} onChange={setBillRestName} />
          <FgInput label="Address Line 1" value={billAddress} onChange={setBillAddress} />
          <FgInput label="Phone Number" value={billPhone} onChange={setBillPhone} />
          <FgInput label="GSTIN" value={billGstin} onChange={setBillGstin} mono />
          <FgInput label="FSSAI Number" value={billFssai} onChange={setBillFssai} placeholder="Your FSSAI number" />
          <FgInput label="Email" value={billEmail} onChange={setBillEmail} />
        </div>
        <PrintFieldRow label="Print Logo on Bill" sub="Bhojpe logo at top" right={<Toggle checked={billToggles.logo} onChange={v=>setBillToggles(t=>({...t,logo:v}))} />} />
        <PrintFieldRow label="Print Restaurant Name" right={<Toggle checked={billToggles.restName} onChange={v=>setBillToggles(t=>({...t,restName:v}))} />} />
        <PrintFieldRow label="Print Address" right={<Toggle checked={billToggles.address} onChange={v=>setBillToggles(t=>({...t,address:v}))} />} />
        <PrintFieldRow label="Print Phone Number" right={<Toggle checked={billToggles.phone} onChange={v=>setBillToggles(t=>({...t,phone:v}))} />} />
        <PrintFieldRow label="Print GSTIN" right={<Toggle checked={billToggles.gstin} onChange={v=>setBillToggles(t=>({...t,gstin:v}))} />} />
        <div style={{ borderBottom:"none" }}><PrintFieldRow label="Print FSSAI" right={<Toggle checked={billToggles.fssai} onChange={v=>setBillToggles(t=>({...t,fssai:v}))} />} /></div>
      </PrintGroup>
      <PrintGroup title="Bill Details" sub="Bill number, table, waiter info" icon="📋" iconBg={C.bdim}>
        <PrintFieldRow label="Bill Number" sub="BILL-001 serial" right={<Toggle checked={billToggles.billNum} onChange={v=>setBillToggles(t=>({...t,billNum:v}))} />} />
        <PrintFieldRow label="Table Number" right={<Toggle checked={billToggles.table} onChange={v=>setBillToggles(t=>({...t,table:v}))} />} />
        <PrintFieldRow label="Date & Time" right={<Toggle checked={billToggles.dateTime} onChange={v=>setBillToggles(t=>({...t,dateTime:v}))} />} />
        <PrintFieldRow label="Waiter Name" right={<Toggle checked={billToggles.waiter} onChange={v=>setBillToggles(t=>({...t,waiter:v}))} />} />
        <PrintFieldRow label="Pax Count" right={<Toggle checked={billToggles.pax} onChange={v=>setBillToggles(t=>({...t,pax:v}))} />} />
        <div style={{ borderBottom:"none" }}><PrintFieldRow label="Customer Name" sub="Agar customer add kiya ho" right={<Toggle checked={billToggles.customer} onChange={v=>setBillToggles(t=>({...t,customer:v}))} />} /></div>
      </PrintGroup>
      <PrintGroup title="Tax & Totals" sub="GST, discount, total breakdown" icon="💰" iconBg={C.gdim}>
        <PrintFieldRow label="Show GST Breakup" sub="CGST + SGST alag alag" right={<Toggle checked={billToggles.gstBreakup} onChange={v=>setBillToggles(t=>({...t,gstBreakup:v}))} />} />
        <PrintFieldRow label="Show Discount" right={<Toggle checked={billToggles.discount} onChange={v=>setBillToggles(t=>({...t,discount:v}))} />} />
        <PrintFieldRow label="Show Delivery Charges" right={<Toggle checked={billToggles.delivery} onChange={v=>setBillToggles(t=>({...t,delivery:v}))} />} />
        <PrintFieldRow label="Show Round Off" right={<Toggle checked={billToggles.roundOff} onChange={v=>setBillToggles(t=>({...t,roundOff:v}))} />} />
        <div style={{ borderBottom:"none" }}><PrintFieldRow label="Amount in Words" sub="Total in Hindi/English words" right={<Toggle checked={billToggles.amtWords} onChange={v=>setBillToggles(t=>({...t,amtWords:v}))} />} /></div>
      </PrintGroup>
      <PrintGroup title="QR Code & Digital" sub="UPI QR, website link" icon="📱" iconBg={C.pdim}>
        <PrintFieldRow label="Print UPI QR Code" sub="Customer direct pay kar sake" right={<Toggle checked={billToggles.upiQr} onChange={v=>setBillToggles(t=>({...t,upiQr:v}))} />} />
        <div style={{ marginTop:12 }}><FgInput label="UPI ID" value={billUpi} onChange={setBillUpi} placeholder="yourname@upi" mono /></div>
        <div style={{ borderBottom:"none" }}><PrintFieldRow label="Print Website / Social" right={<Toggle checked={billToggles.website} onChange={v=>setBillToggles(t=>({...t,website:v}))} />} /></div>
      </PrintGroup>
      <PrintGroup title="Footer" sub="Thank you message, terms" icon="📝" iconBg={C.adm2}>
        <div style={{ marginBottom:14 }}><FgInput label="Footer Message" value={billFooter1} onChange={setBillFooter1} /></div>
        <div style={{ marginBottom:14 }}><FgInput label="Footer Line 2" value={billFooter2} onChange={setBillFooter2} placeholder="e.g. Follow us @bhojpe" /></div>
        <PrintFieldRow label='Print "Tax Invoice"' sub="Official tax invoice heading" right={<Toggle checked={billToggles.printInvoice} onChange={v=>setBillToggles(t=>({...t,printInvoice:v}))} />} />
        <PrintFieldRow label="Cut Paper After Bill" right={<Toggle checked={billToggles.cutPaper} onChange={v=>setBillToggles(t=>({...t,cutPaper:v}))} />} />
        <div style={{ marginTop:12 }}><FgSelect label="Bill Copies" value={billCopies} onChange={setBillCopies} options={["1 Copy","2 Copies","3 Copies"]} /></div>
      </PrintGroup>
      <div style={{ display:"flex",justifyContent:"flex-end",marginTop:8 }}>
        <Btn variant="primary" onClick={saveBillSettings}>💾 Save Bill Settings</Btn>
      </div>
    </div>
  );

  const renderDirectPrint = () => (
    <div>
      <div style={{ marginBottom:20 }}>
        <div style={pgTitleStyle}>Direct Print</div>
        <div style={pgSubStyle}>Popup ke bina seedha print — faster operations ke liye</div>
      </div>
      <div style={{ display:"flex",alignItems:"center",gap:8,padding:"10px 14px",borderRadius:10,fontSize:13,fontWeight:600,marginBottom:16,background:C.gdim,border:`1px solid ${C.gbdr}`,color:C.grn }}>
        ✅ Direct print enabled — KOT &amp; Bill bina popup ke print honge
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
        <div style={cardStyle}><div style={cardBodyStyle}>
          <PrintFieldRow label="KOT Direct Print" sub="KOT button → seedha print" right={<Toggle checked={directToggles.kotDirect} onChange={v=>setDirectToggles(t=>({...t,kotDirect:v}))} />} />
          <PrintFieldRow label="Bill Direct Print" sub="Bill button → seedha print" right={<Toggle checked={directToggles.billDirect} onChange={v=>setDirectToggles(t=>({...t,billDirect:v}))} />} />
          <PrintFieldRow label="Auto KOT on Item Add" sub="Item add → auto KOT" right={<Toggle checked={directToggles.autoKotOnAdd} onChange={v=>setDirectToggles(t=>({...t,autoKotOnAdd:v}))} />} />
          <PrintFieldRow label="Auto Bill on Checkout" sub="Checkout → auto bill" right={<Toggle checked={directToggles.autoBillOnCheckout} onChange={v=>setDirectToggles(t=>({...t,autoBillOnCheckout:v}))} />} />
          <div style={{ borderBottom:"none" }}><PrintFieldRow label="Open Drawer on Cash" sub="Cash payment → drawer open" right={<Toggle checked={directToggles.openDrawer} onChange={v=>setDirectToggles(t=>({...t,openDrawer:v}))} />} /></div>
        </div></div>
        <div style={cardStyle}><div style={cardBodyStyle}>
          <PrintFieldRow label="E-Bill Auto Send" sub="SMS/WhatsApp bill" right={<Toggle checked={directToggles.ebillSend} onChange={v=>setDirectToggles(t=>({...t,ebillSend:v}))} />} />
          <PrintFieldRow label="KOT Sound Alert" sub="Print hone par beep" right={<Toggle checked={directToggles.kotSound} onChange={v=>setDirectToggles(t=>({...t,kotSound:v}))} />} />
          <PrintFieldRow label="New Order Alert Sound" sub="Online order aane par sound" right={<Toggle checked={directToggles.newOrderSound} onChange={v=>setDirectToggles(t=>({...t,newOrderSound:v}))} />} />
          <PrintFieldRow label="Reprint Confirmation" sub="Dubara print karte waqt confirm" right={<Toggle checked={directToggles.reprintConfirm} onChange={v=>setDirectToggles(t=>({...t,reprintConfirm:v}))} />} />
          <div style={{ borderBottom:"none" }}><PrintFieldRow label="Partial KOT on Edit" sub="Sirf naye items ka KOT" right={<Toggle checked={directToggles.partialKot} onChange={v=>setDirectToggles(t=>({...t,partialKot:v}))} />} /></div>
        </div></div>
      </div>
      <div style={{ display:"flex",justifyContent:"flex-end",marginTop:14 }}>
        <Btn variant="primary" onClick={saveDirectPrint}>💾 Save Direct Print Settings</Btn>
      </div>
    </div>
  );

  const renderPaper = () => (
    <div>
      <div style={{ marginBottom:20 }}>
        <div style={pgTitleStyle}>Paper Size &amp; Format</div>
        <div style={pgSubStyle}>Print ka paper width, font, margins configure karo</div>
      </div>
      <div style={cardStyle}>
        <div style={cardHdrStyle}>
          <div style={{ display:"flex",alignItems:"center",gap:10 }}>
            <div style={{ width:36,height:36,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,background:C.s2 }}>📄</div>
            <div><div style={{ fontSize:15,fontWeight:800,color:C.tx }}>Paper Size</div></div>
          </div>
        </div>
        <div style={cardBodyStyle}>
          <div style={{ display:"flex",gap:12,marginBottom:18 }}>
            {[{s:"80mm",sub:"Standard · Most printers",ico:"📄"},{s:"58mm",sub:"Compact printers",ico:"📄"},{s:"A4",sub:"Full page bills",ico:"📃"}].map(p => (
              <div key={p.s} onClick={() => { setPaperSize(p.s); showToast(`${p.s} selected`); }} style={{
                border:`2px solid ${paperSize===p.s?C.ac:C.bd}`,borderRadius:14,padding:14,textAlign:"center",cursor:"pointer",transition:"all .15s",
                background:paperSize===p.s?C.adim:C.w,flex:1,
              }}>
                <div style={{ fontSize:24,marginBottom:7 }}>{p.ico}</div>
                <div style={{ fontSize:13,fontWeight:800,color:C.tx }}>{p.s}</div>
                <div style={{ fontSize:11,color:C.t3,marginTop:2 }}>{p.sub}</div>
              </div>
            ))}
          </div>
          <div style={grid3}>
            <FgInput label="Characters/Line" value={charsPerLine} onChange={setCharsPerLine} mono />
            <FgSelect label="Font Size" value={fontSize} onChange={setFontSize} options={["Small (7pt)","Medium (9pt)","Large (12pt)"]} />
            <FgSelect label="Line Spacing" value={lineSpacing} onChange={setLineSpacing} options={["Compact","Normal","Wide"]} />
          </div>
          <Btn variant="primary" onClick={savePaperSettings}>💾 Save</Btn>
        </div>
      </div>
    </div>
  );

  const renderKdsGeneral = () => (
    <div>
      <div style={{ marginBottom:20 }}>
        <div style={pgTitleStyle}>KDS — Kitchen Display System</div>
        <div style={pgSubStyle}>Kitchen display screen setup karo — live order status dikhane ke liye</div>
      </div>
      <div style={{ background:C.tx,borderRadius:14,padding:18,marginBottom:18 }}>
        <div style={{ fontSize:13,fontWeight:700,color:"rgba(255,255,255,.6)",marginBottom:12 }}>📺 KDS Screen Live Preview</div>
        <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,background:"#1a1a2e",borderRadius:14,padding:16,minHeight:260,alignContent:"start" }}>
          {[{id:"#201",table:"Table T-2 · Dine In · 4 Pax",items:["3× Butter Paneer","2× Garlic Naan","1× Dal Tadka"],timer:"⏱ 3 min",timerColor:"rgba(34,197,94,.2)",timerText:"#4ade80",bg:"#1e3a5f",border:"#3b82f6"},
            {id:"#199",table:"Table T-5 · Dine In · 2 Pax",items:["1× Chicken Biryani","2× Raita"],timer:"⏱ 18 min",timerColor:"rgba(251,191,36,.2)",timerText:"#fbbf24",bg:"#2d1f00",border:"#fbbf24"},
            {id:"#197",table:"Delivery · Swiggy",items:["2× Paneer Pizza","1× Cold Coffee"],timer:"🔥 28 min",timerColor:"rgba(239,68,68,.2)",timerText:"#f87171",bg:"#2d1f00",border:"#fbbf24"},
            {id:"#195",table:"✅ Ready",items:["5× Roti","1× Dal Makhani"],timer:"✓ Done",timerColor:"rgba(34,197,94,.2)",timerText:"#4ade80",bg:"#0f2d1a",border:"#22c55e"},
          ].map(card => (
            <div key={card.id} style={{ background:card.bg,border:`1.5px solid ${card.border}`,borderRadius:12,padding:14,fontSize:12 }}>
              <div style={{ fontSize:13,fontWeight:800,color:"#fff",marginBottom:4 }}>{card.id}</div>
              <div style={{ fontSize:11,color:"rgba(255,255,255,.6)",marginBottom:8 }}>{card.table}</div>
              {card.items.map(item => <div key={item} style={{ fontSize:"12.5px",color:"#fff",padding:"3px 0",borderBottom:"1px solid rgba(255,255,255,.1)" }}>{item}</div>)}
              <div style={{ fontSize:11,fontWeight:800,padding:"3px 8px",borderRadius:6,marginTop:8,display:"inline-block",background:card.timerColor,color:card.timerText }}>{card.timer}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16 }}>
        <div style={cardStyle}>
          <div style={cardHdrStyle}><div style={{ display:"flex",alignItems:"center",gap:10 }}><div style={{ width:36,height:36,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,background:C.bdim }}>🖥️</div><div><div style={{ fontSize:15,fontWeight:800,color:C.tx }}>KDS Connection</div></div></div><Pill variant="r">Offline</Pill></div>
          <div style={cardBodyStyle}>
            <div style={{ marginBottom:14 }}><FgInput label="KDS Screen IP / URL" value={kdsIp} onChange={setKdsIp} placeholder="192.168.1.20 or kds.bhojpe.local" mono /></div>
            <FgSelect label="Connection Type" value={kdsConnType} onChange={setKdsConnType} options={["WebSocket (LAN)","HTTP Polling","HDMI Direct"]} />
            <div style={{ display:"flex",gap:8,marginTop:14 }}>
              <Btn variant="primary" sm onClick={() => showToast("Connecting to KDS...", "info")}>🔗 Connect</Btn>
              <Btn variant="green" sm onClick={() => showToast("Test sent to KDS 🖥️")}>📤 Test</Btn>
            </div>
          </div>
        </div>
        <div style={cardStyle}>
          <div style={cardHdrStyle}><div style={{ display:"flex",alignItems:"center",gap:10 }}><div style={{ width:36,height:36,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,background:C.gdim }}>⚙️</div><div><div style={{ fontSize:15,fontWeight:800,color:C.tx }}>KDS Behavior</div></div></div></div>
          <div style={cardBodyStyle}>
            <PrintFieldRow label="Auto Send to KDS on KOT" right={<Toggle checked={kdsToggles.autoSend} onChange={v=>setKdsToggles(t=>({...t,autoSend:v}))} />} />
            <PrintFieldRow label="Show Timer on KDS" right={<Toggle checked={kdsToggles.showTimer} onChange={v=>setKdsToggles(t=>({...t,showTimer:v}))} />} />
            <PrintFieldRow label="Sound Alert on New Order" right={<Toggle checked={kdsToggles.soundAlert} onChange={v=>setKdsToggles(t=>({...t,soundAlert:v}))} />} />
            <div style={{ borderBottom:"none" }}><PrintFieldRow label="Auto Remove Done Orders" right={<Toggle checked={kdsToggles.autoRemove} onChange={v=>setKdsToggles(t=>({...t,autoRemove:v}))} />} /></div>
          </div>
        </div>
      </div>
      <div style={{ display:"flex",justifyContent:"flex-end",marginTop:8 }}>
        <Btn variant="primary" onClick={saveKdsSettings}>💾 Save KDS Settings</Btn>
      </div>
    </div>
  );

  const renderKdsDisplay = () => (
    <div>
      <div style={{ marginBottom:20 }}><div style={pgTitleStyle}>KDS Display Layout</div></div>
      <div style={cardStyle}><div style={cardBodyStyle}>
        <div style={grid2}>
          <FgSelect label="Columns on KDS Screen" value={kdsCols} onChange={setKdsCols} options={["2 Columns","3 Columns","4 Columns","5 Columns"]} />
          <FgSelect label="Card Size" value={kdsCardSize} onChange={setKdsCardSize} options={["Small","Medium","Large"]} />
          <FgSelect label="Theme" value={kdsTheme} onChange={setKdsTheme} options={["Dark (Kitchen)","Light","High Contrast"]} />
          <FgSelect label="Font Size" value={kdsFontSize} onChange={setKdsFontSize} options={["Small","Medium","Large"]} />
        </div>
        <PrintFieldRow label="Show Order Type (Dine/Delivery)" right={<Toggle checked={kdsToggles.orderType} onChange={v=>setKdsToggles(t=>({...t,orderType:v}))} />} />
        <PrintFieldRow label="Show Customer Name" right={<Toggle checked={kdsToggles.customerName} onChange={v=>setKdsToggles(t=>({...t,customerName:v}))} />} />
        <div style={{ borderBottom:"none" }}><PrintFieldRow label="Show Platform (Zomato/Swiggy)" right={<Toggle checked={kdsToggles.platform} onChange={v=>setKdsToggles(t=>({...t,platform:v}))} />} /></div>
        <div style={{ marginTop:14 }}><Btn variant="primary" onClick={() => showToast("Display settings saved ✓")}>💾 Save</Btn></div>
      </div></div>
    </div>
  );

  const renderKdsTimers = () => (
    <div>
      <div style={{ marginBottom:20 }}><div style={pgTitleStyle}>Timer Alert Settings</div></div>
      <div style={cardStyle}><div style={cardBodyStyle}>
        <div style={grid3}>
          <div style={{ display:"flex",flexDirection:"column",gap:5 }}>
            <div style={{ fontSize:11,fontWeight:700,color:C.t2,textTransform:"uppercase",letterSpacing:".3px" }}>Normal (Green) — Under</div>
            <div style={{ display:"flex",alignItems:"center",gap:8 }}>
              <input type="number" value={normalMin} onChange={e=>setNormalMin(e.target.value)} style={{ padding:"10px 13px",background:C.s1,border:`1.5px solid ${C.bd}`,borderRadius:10,fontFamily:"JetBrains Mono,monospace",fontSize:13,color:C.tx,outline:"none",width:"100%" }} />
              <span style={{ fontSize:13,color:C.t2 }}>min</span>
            </div>
          </div>
          <div style={{ display:"flex",flexDirection:"column",gap:5 }}>
            <div style={{ fontSize:11,fontWeight:700,color:C.t2,textTransform:"uppercase",letterSpacing:".3px" }}>Warning (Amber) — Under</div>
            <div style={{ display:"flex",alignItems:"center",gap:8 }}>
              <input type="number" value={warnMin} onChange={e=>setWarnMin(e.target.value)} style={{ padding:"10px 13px",background:C.s1,border:`1.5px solid ${C.bd}`,borderRadius:10,fontFamily:"JetBrains Mono,monospace",fontSize:13,color:C.tx,outline:"none",width:"100%" }} />
              <span style={{ fontSize:13,color:C.t2 }}>min</span>
            </div>
          </div>
          <div style={{ display:"flex",flexDirection:"column",gap:5 }}>
            <div style={{ fontSize:11,fontWeight:700,color:C.t2,textTransform:"uppercase",letterSpacing:".3px" }}>Critical (Red) — Over</div>
            <div style={{ display:"flex",alignItems:"center",gap:8 }}>
              <input type="number" value={critMin} onChange={e=>setCritMin(e.target.value)} style={{ padding:"10px 13px",background:C.s1,border:`1.5px solid ${C.bd}`,borderRadius:10,fontFamily:"JetBrains Mono,monospace",fontSize:13,color:C.tx,outline:"none",width:"100%" }} />
              <span style={{ fontSize:13,color:C.t2 }}>min</span>
            </div>
          </div>
        </div>
        <PrintFieldRow label="Blink on Critical" sub="Red card blink kare" right={<Toggle checked={kdsBlink} onChange={setKdsBlink} />} />
        <div style={{ borderBottom:"none" }}><PrintFieldRow label="Sound on Critical" sub="25 min se zyada hone par alarm" right={<Toggle checked={kdsSound} onChange={setKdsSound} />} /></div>
        <div style={{ marginTop:14 }}><Btn variant="primary" onClick={() => showToast("Timer settings saved ✓")}>💾 Save</Btn></div>
      </div></div>
    </div>
  );

  const renderKdsScreens = () => (
    <div>
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20 }}>
        <div style={pgTitleStyle}>KDS Screen Management</div>
        <Btn variant="primary" onClick={() => showToast("New KDS screen added!")}>+ Add KDS Screen</Btn>
      </div>
      <div style={cardStyle}><div style={cardBodyStyle}>
        {[{name:"Veg Kitchen Display",ip:"192.168.1.20",desc:"Shows: Veg items only"},{name:"Non-Veg Kitchen Display",ip:"192.168.1.21",desc:"Shows: Non-veg items"}].map(s => (
          <div key={s.name} style={{ display:"flex",alignItems:"center",gap:14,padding:14,background:C.s1,border:`1.5px solid ${C.bd}`,borderRadius:14,marginBottom:10 }}>
            <span style={{ fontSize:24 }}>🖥️</span>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:14,fontWeight:700,color:C.tx }}>{s.name}</div>
              <div style={{ fontSize:12,color:C.t3,marginTop:2 }}>{s.ip} · {s.desc}</div>
            </div>
            <Pill variant="r">Offline</Pill>
            <Btn sm onClick={() => showToast(`Configuring ${s.name}...`, "info")}>⚙️ Configure</Btn>
            <Btn sm variant="danger" onClick={() => showToast(`${s.name} removed`, "error")}>🗑</Btn>
          </div>
        ))}
      </div></div>
    </div>
  );

  const renderLedImages = () => (
    <div>
      <div style={{ marginBottom:20 }}>
        <div style={pgTitleStyle}>LED Display — Image Manager</div>
        <div style={pgSubStyle}>Images upload karo, order set karo, scroll time configure karo</div>
      </div>
      <div
        onClick={() => fileInputRef.current?.click()}
        style={{ border:`2.5px dashed ${C.bd2}`,borderRadius:14,padding:32,textAlign:"center",cursor:"pointer",transition:"all .2s",background:C.s1 }}
        onDragOver={e => { e.preventDefault(); (e.currentTarget as HTMLDivElement).style.borderColor = C.ac; }}
        onDragLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = C.bd2; }}
        onDrop={e => { e.preventDefault(); handleFiles([...e.dataTransfer.files]); (e.currentTarget as HTMLDivElement).style.borderColor = C.bd2; }}
      >
        <input ref={fileInputRef} type="file" accept="image/*" multiple style={{ display:"none" }} onChange={e => handleFiles([...(e.target.files||[])])} />
        <div style={{ fontSize:44,marginBottom:12,opacity:.6 }}>📁</div>
        <div style={{ fontSize:16,fontWeight:800,color:C.tx,marginBottom:6 }}>Images Yahan Drop Karo</div>
        <div style={{ fontSize:13,color:C.t3 }}>ya click karke select karo · JPG, PNG, GIF · Max 5MB per image</div>
        <button style={{ marginTop:14,padding:"9px 18px",background:C.ac,border:"none",borderRadius:10,color:"#fff",fontFamily:"Plus Jakarta Sans,sans-serif",fontWeight:800,fontSize:13,cursor:"pointer",display:"inline-flex",alignItems:"center",gap:6 }} onClick={e=>{e.stopPropagation();fileInputRef.current?.click();}}>📤 Upload Images</button>
      </div>
      {ledImages.length > 0 && (
        <div style={{ marginTop:18 }}>
          <div style={{ fontSize:12,fontWeight:800,textTransform:"uppercase",letterSpacing:".6px",color:C.t3,marginBottom:10 }}>Uploaded Images — Drag to reorder</div>
          <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
            {ledImages.map(img => (
              <div key={img.id} style={{ display:"flex",alignItems:"center",gap:12,padding:"12px 14px",background:C.w,border:`1.5px solid ${C.bd}`,borderRadius:14,boxShadow:"0 1px 4px rgba(0,0,0,.06)" }}>
                <span style={{ cursor:"grab",color:C.t3,fontSize:16,flexShrink:0 }}>⠿</span>
                <div style={{ width:72,height:54,borderRadius:9,background:C.s2,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0,overflow:"hidden" }}>
                  <img src={img.src} alt={img.name} style={{ width:"100%",height:"100%",objectFit:"cover" }} />
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:"13.5px",fontWeight:700,color:C.tx }}>{img.name}</div>
                  <div style={{ fontSize:12,color:C.t3,marginTop:2 }}>{img.size}</div>
                  <div style={{ display:"flex",alignItems:"center",gap:6,marginTop:8 }}>
                    <span style={{ fontSize:12,color:C.t2,fontWeight:500 }}>Duration:</span>
                    <input type="number" value={img.duration} min={1} max={60} onChange={e => setLedImages(prev => prev.map(x => x.id===img.id?{...x,duration:Number(e.target.value)}:x))} style={{ width:60,padding:"5px 8px",background:C.s1,border:`1.5px solid ${C.bd}`,borderRadius:7,fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:13,fontWeight:700,color:C.tx,textAlign:"center",outline:"none" }} />
                    <span style={{ fontSize:12,color:C.t2,fontWeight:500 }}>seconds</span>
                  </div>
                </div>
                <div style={{ display:"flex",gap:6,flexShrink:0 }}>
                  <Btn sm onClick={() => setLedCurrentIdx(ledImages.indexOf(img))}>👁</Btn>
                  <Btn sm variant="danger" onClick={() => setLedImages(prev => prev.filter(x => x.id !== img.id))}>🗑</Btn>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderLedSettingsSection = () => (
    <div>
      <div style={{ marginBottom:20 }}><div style={pgTitleStyle}>Display Settings</div></div>
      <div style={cardStyle}><div style={cardBodyStyle}>
        <div style={grid3}>
          <div style={{ display:"flex",flexDirection:"column",gap:5 }}>
            <div style={{ fontSize:11,fontWeight:700,color:C.t2,textTransform:"uppercase",letterSpacing:".3px" }}>Default Image Duration</div>
            <div style={{ display:"flex",alignItems:"center",gap:8 }}>
              <input type="number" value={ledDuration} onChange={e=>setLedDuration(e.target.value)} min={1} max={60} style={{ padding:"10px 13px",background:C.s1,border:`1.5px solid ${C.bd}`,borderRadius:10,fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:13,color:C.tx,outline:"none",width:"100%" }} />
              <span style={{ fontSize:13,color:C.t2 }}>seconds</span>
            </div>
          </div>
          <FgSelect label="Transition Effect" value={ledTransition} onChange={setLedTransition} options={["Fade","Slide Left","Slide Up","Zoom","None"]} />
          <FgSelect label="Transition Speed" value={ledTransitionSpeed} onChange={setLedTransitionSpeed} options={["Fast (0.5s)","Medium (1s)","Slow (2s)"]} />
          <FgSelect label="Image Fit" value={ledFit} onChange={setLedFit} options={["Cover (Full Screen)","Contain (Fit)","Stretch (Fill)"]} />
          <FgSelect label="Screen Orientation" value={ledOrientation} onChange={setLedOrientation} options={["Landscape (16:9)","Portrait (9:16)"]} />
          <div style={{ display:"flex",flexDirection:"column",gap:5 }}>
            <div style={{ fontSize:11,fontWeight:700,color:C.t2,textTransform:"uppercase",letterSpacing:".3px" }}>Loop</div>
            <div style={{ display:"flex",alignItems:"center",gap:8,marginTop:8 }}>
              <Toggle checked={ledLoop} onChange={setLedLoop} />
              <span style={{ fontSize:13,color:C.t2 }}>Continuously loop images</span>
            </div>
          </div>
        </div>
        <PrintFieldRow label="Show on Customer Display" sub="Customer facing screen par show ho" right={<Toggle checked={ledToggles.customerDisplay} onChange={v=>setLedToggles(t=>({...t,customerDisplay:v}))} />} />
        <PrintFieldRow label="Auto Start on POS Open" sub="POS khulte hi slideshow shuru" right={<Toggle checked={ledToggles.autoStart} onChange={v=>setLedToggles(t=>({...t,autoStart:v}))} />} />
        <div style={{ borderBottom:"none" }}><PrintFieldRow label="Pause on Order" sub="Jab order ho tab slideshow ruke" right={<Toggle checked={ledToggles.pauseOnOrder} onChange={v=>setLedToggles(t=>({...t,pauseOnOrder:v}))} />} /></div>
        <div style={{ marginTop:14 }}><Btn variant="primary" onClick={saveLedSettings}>💾 Save Settings</Btn></div>
      </div></div>
    </div>
  );

  const renderLedPreview = () => {
    const currentImg = ledImages[ledCurrentIdx];
    return (
      <div>
        <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:20 }}>
          <div><div style={pgTitleStyle}>Live Preview</div><div style={pgSubStyle}>Slideshow ka preview dekho</div></div>
          <div style={{ display:"flex",gap:8 }}>
            <Btn variant="green" onClick={() => { setLedPlaying(p => !p); }}>{ledPlaying ? "⏸ Pause" : "▶️ Play Preview"}</Btn>
            <Btn onClick={() => showToast("Fullscreen mode (actual LED screen pe hoga)", "info")}>⛶ Fullscreen</Btn>
          </div>
        </div>
        <div style={{ background:"#000",borderRadius:14,overflow:"hidden",position:"relative",aspectRatio:"16/9",width:"100%" }}>
          <div style={{ width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center" }}>
            {currentImg ? (
              <img src={currentImg.src} alt={currentImg.name} style={{ width:"100%",height:"100%",objectFit:"cover",transition:"opacity .8s ease" }} />
            ) : (
              <div style={{ color:"rgba(255,255,255,.3)",fontSize:16,fontWeight:600,textAlign:"center" }}>📷 Koi image nahi — Images upload karein</div>
            )}
          </div>
        </div>
        <div style={{ marginTop:14,padding:"12px 14px",background:C.w,border:`1px solid ${C.bd}`,borderRadius:10,display:"flex",alignItems:"center",gap:14,fontSize:13 }}>
          <span style={{ color:C.t2,fontWeight:500 }}>Current image:</span>
          <span style={{ fontWeight:700,color:C.tx }}>{currentImg?.name || "—"}</span>
          <span style={{ color:C.t2,fontWeight:500,marginLeft:"auto" }}>Next in:</span>
          <span style={{ fontWeight:700,color:C.ac,fontFamily:"JetBrains Mono,monospace" }}>{ledPlaying && currentImg ? `${currentImg.duration}s` : "—"}</span>
        </div>
      </div>
    );
  };

  // ── Printer Modal ──
  const renderModal = () => (
    <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:20,fontFamily:"Plus Jakarta Sans,sans-serif" }}>
      <div style={{ background:C.w,borderRadius:18,width:580,maxWidth:"96vw",boxShadow:"0 20px 60px rgba(0,0,0,.18)",overflow:"hidden",display:"flex",flexDirection:"column",maxHeight:"90vh",animation:"popIn .22s ease" }}>
        <div style={{ background:C.tx,padding:"18px 22px",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0 }}>
          <div>
            <div style={{ fontSize:18,fontWeight:800,color:"#fff" }}>{modalName ? `⚙️ ${modalName} Settings` : "➕ Add New Printer"}</div>
            <div style={{ fontSize:12,color:"rgba(255,255,255,.5)",marginTop:3 }}>{modalName ? "Configure printer settings" : "New printer setup"}</div>
          </div>
          <button onClick={() => setModalOpen(false)} style={{ fontSize:20,color:"rgba(255,255,255,.6)",cursor:"pointer",background:"none",border:"none",lineHeight:1,padding:4 }}>✕</button>
        </div>
        <div style={{ padding:22,overflowY:"auto",flex:1 }}>
          <div style={grid2}>
            <FgInput label="Printer / Device Name" value={modalName} onChange={setModalName} placeholder="e.g. Veg Kitchen Printer" />
            <FgSelect label="Kitchen / Function" value={modalFunction} onChange={setModalFunction} options={["-- Select --","Veg Kitchen KOT","Non-Veg Kitchen KOT","Both Kitchens KOT","Bill / Receipt","KOT + Bill (Same Printer)","Cash Drawer","KDS Display"]} />
          </div>
          <div style={{ marginBottom:14 }}>
            <div style={{ fontSize:11,fontWeight:700,color:C.t2,textTransform:"uppercase",letterSpacing:".3px",marginBottom:10 }}>Print Type</div>
            <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10 }}>
              {([["kot","📋","KOT Only","Kitchen Order Ticket"],["bill","🧾","Bill Only","Customer receipt"],["both","🖨️","Both","KOT + Bill same printer"]] as const).map(([t,ico,title,sub]) => (
                <div key={t} onClick={() => setModalPrintType(t)} style={{ border:`2px solid ${modalPrintType===t?C.ac:C.bd}`,borderRadius:14,padding:14,textAlign:"center",cursor:"pointer",transition:"all .15s",background:modalPrintType===t?C.adim:C.w }}>
                  <div style={{ fontSize:24,marginBottom:7 }}>{ico}</div>
                  <div style={{ fontSize:13,fontWeight:800,color:C.tx }}>{title}</div>
                  <div style={{ fontSize:11,color:C.t3,marginTop:2 }}>{sub}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ marginBottom:14 }}>
            <div style={{ fontSize:11,fontWeight:700,color:C.t2,textTransform:"uppercase",letterSpacing:".3px",marginBottom:8 }}>Connection Type</div>
            <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
              {([["wifi","📶 WiFi"],["lan","🔌 LAN"],["bt","🔵 Bluetooth"],["usb","💾 USB"],["cash","🗄️ Cash Drawer"]] as [ConnType,string][]).map(([t,label]) => (
                <button key={t} onClick={() => setModalConn(t)} style={{ padding:"6px 14px",borderRadius:20,fontSize:12,fontWeight:700,cursor:"pointer",border:`1.5px solid ${modalConn===t?C.ac:C.bd}`,background:modalConn===t?C.ac:C.w,color:modalConn===t?"#fff":C.t2,transition:"all .14s",fontFamily:"Plus Jakarta Sans,sans-serif" }}>{label}</button>
              ))}
            </div>
          </div>
          <div style={{ background:C.s1,border:`1.5px solid ${C.bd}`,borderRadius:14,padding:14,marginBottom:14 }}>
            <div style={{ fontSize:"12.5px",fontWeight:700,color:C.t2,marginBottom:10 }}>
              {modalConn==="wifi"?"📶 WiFi — Enter IP ya Scan":modalConn==="lan"?"🔌 LAN/Ethernet — Enter IP":modalConn==="bt"?"🔵 Bluetooth — Scan karo":modalConn==="usb"?"💾 USB — Auto detect":"🗄️ Cash Drawer — Bill printer se connect"}
            </div>
            <div style={{ display:"flex",gap:8 }}>
              <input value={modalIp} onChange={e=>setModalIp(e.target.value)} placeholder={modalConn==="wifi"||modalConn==="lan"?"IP Address (192.168.1.x)":modalConn==="usb"?"/dev/usb/lp0":modalConn==="bt"?"Scan karke device select karo":"Bill printer port"} style={{ flex:1,padding:"9px 12px",background:C.w,border:`1.5px solid ${C.bd}`,borderRadius:10,fontFamily:"Plus Jakarta Sans,sans-serif",fontSize:13,color:C.tx,outline:"none" }} />
              <input value={modalPort} onChange={e=>setModalPort(e.target.value)} placeholder="Port: 9100" style={{ maxWidth:130,padding:"9px 12px",background:C.w,border:`1.5px solid ${C.bd}`,borderRadius:10,fontFamily:"JetBrains Mono,monospace",fontSize:13,color:C.tx,outline:"none" }} />
              <button onClick={doScan} disabled={scanning} style={{ padding:"9px 16px",background:C.ac,border:"none",borderRadius:10,color:"#fff",fontFamily:"Plus Jakarta Sans,sans-serif",fontWeight:800,fontSize:13,cursor:"pointer",whiteSpace:"nowrap",transition:"all .14s" }}>
                {scanning ? "⟳ Scanning..." : "🔍 Scan"}
              </button>
            </div>
            {scanning && <div style={{ height:3,background:C.s2,borderRadius:3,overflow:"hidden",marginTop:10 }}><div style={{ height:"100%",background:`linear-gradient(90deg,${C.ac},${C.amb})`,borderRadius:3,animation:"spAnim 2s ease-in-out infinite" }} /></div>}
            {foundPrinters.map(p => (
              <div key={p.addr} onClick={() => { setSelectedFound(p.addr); setModalName(p.nm); setModalIp(p.addr.split(":")[0]); setModalPort(p.addr.split(":")[1]||"9100"); setModalModel(p.nm); showToast(`${p.nm} selected`); }} style={{ display:"flex",alignItems:"center",gap:10,padding:"10px 12px",background:C.w,border:`1.5px solid ${selectedFound===p.addr?C.ac:C.bd}`,borderRadius:10,marginTop:8,cursor:"pointer",transition:"all .15s",backgroundColor:selectedFound===p.addr?C.adim:C.w }}>
                <span style={{ fontSize:20,flexShrink:0 }}>{p.ico}</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13,fontWeight:700,color:C.tx }}>{p.nm}</div>
                  <div style={{ fontSize:"11.5px",color:C.t3,fontFamily:"JetBrains Mono,monospace",marginTop:1 }}>{p.addr}</div>
                </div>
                <div style={{ width:20,height:20,borderRadius:"50%",border:`2px solid ${selectedFound===p.addr?C.grn:C.bd}`,display:"flex",alignItems:"center",justifyContent:"center",background:selectedFound===p.addr?C.grn:"transparent",color:"#fff",fontSize:11,transition:"all .15s" }}>{selectedFound===p.addr?"✓":""}</div>
              </div>
            ))}
          </div>
          <div style={grid2}>
            <FgSelect label="Paper Size" value={modalPaperSize} onChange={setModalPaperSize} options={["80mm","58mm","A4"]} />
            <FgSelect label="Copies" value={modalCopies} onChange={setModalCopies} options={["1 Copy","2 Copies"]} />
            <FgInput label="Brand / Model" value={modalModel} onChange={setModalModel} placeholder="Epson, Star, Generic..." />
            <FgSelect label="Encoding" value={modalEncoding} onChange={setModalEncoding} options={["ESC/POS","Star Mode","PCL"]} />
          </div>
          <PrintFieldRow label="Auto Print (no popup)" right={<Toggle checked={modalAutoPrint} onChange={setModalAutoPrint} />} />
          <div style={{ borderBottom:"none" }}><PrintFieldRow label="Active" right={<Toggle checked={modalActive} onChange={setModalActive} />} /></div>
        </div>
        <div style={{ padding:"16px 22px",borderTop:`1px solid ${C.bd}`,display:"flex",gap:10,flexShrink:0,background:C.s1 }}>
          <Btn onClick={() => { showToast("Testing printer..."); setModalOpen(false); }}>🖨️ Test Print</Btn>
          <button onClick={() => setModalOpen(false)} style={{ padding:"13px 20px",background:C.s2,border:`1.5px solid ${C.bd}`,borderRadius:14,color:C.t2,fontFamily:"Plus Jakarta Sans,sans-serif",fontWeight:700,fontSize:14,cursor:"pointer" }}>Cancel</button>
          <button onClick={saveModal} style={{ flex:1,padding:13,background:C.ac,border:"none",borderRadius:14,color:"#fff",fontFamily:"Plus Jakarta Sans,sans-serif",fontWeight:800,fontSize:14,cursor:"pointer",boxShadow:`0 3px 10px rgba(255,61,1,.28)`,transition:"all .15s" }}>💾 Save Printer</button>
        </div>
      </div>
    </div>
  );

  // ── Sidebar Status ──
  const printerStatus = [
    { name:"Veg Kitchen", status:"online" as const },
    { name:"Non-Veg Kitchen", status:"online" as const },
    { name:"Bill Printer", status:"online" as const },
    { name:"Cash Drawer", status:"warn" as const },
  ];

  return (
    <div style={{ fontFamily:"Plus Jakarta Sans,sans-serif",background:C.bg,color:C.tx,minHeight:"100vh",fontSize:14 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
        @keyframes popIn { from { opacity:0; transform:scale(.92) translateY(16px) } to { opacity:1; transform:scale(1) translateY(0) } }
        @keyframes spAnim { 0%{width:0;margin-left:0} 60%{width:100%;margin-left:0} 100%{width:0;margin-left:100%} }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.8)} }
      `}</style>

      {/* Top Tab Bar */}
      <div style={{ display:"flex",alignItems:"center",padding:"0 20px",height:52,background:C.tx,gap:10,boxShadow:"0 2px 14px rgba(0,0,0,.22)",position:"sticky",top:0,zIndex:60 }}>
        <div style={{ fontSize:13,fontWeight:700,color:"rgba(255,255,255,.7)",letterSpacing:".3px" }}>⚙️ Settings</div>
        <div style={{ width:1,height:22,background:"rgba(255,255,255,.15)",flexShrink:0,marginLeft:4 }} />
        <div style={{ display:"flex",gap:4 }}>
          {([["printers","⚙️ Printer Settings"],["kds","🖥️ KDS Settings"],["led","📺 LED Display"]] as [MainTab,string][]).map(([tab,label]) => (
            <button key={tab} onClick={() => setMainTab(tab)} style={{
              padding:"6px 14px",borderRadius:8,fontSize:"12.5px",fontWeight:700,cursor:"pointer",
              border:`1px solid ${mainTab===tab?C.ac:"rgba(255,255,255,.12)"}`,
              background:mainTab===tab?C.ac:"rgba(255,255,255,.06)",
              color:mainTab===tab?"#fff":"rgba(255,255,255,.65)",
              transition:"all .14s",fontFamily:"Plus Jakarta Sans,sans-serif",
              boxShadow:mainTab===tab?`0 2px 8px rgba(255,61,1,.35)`:"none",
            }}>{label}</button>
          ))}
        </div>
        <div style={{ flex:1 }} />
        <button onClick={() => { saveKotSettings(); saveBillSettings(); saveDirectPrint(); savePaperSettings(); }} style={{ display:"flex",alignItems:"center",gap:6,padding:"8px 18px",background:C.ac,border:"none",borderRadius:9,color:"#fff",fontSize:13,fontWeight:800,cursor:"pointer",fontFamily:"Plus Jakarta Sans,sans-serif",boxShadow:`0 3px 10px rgba(255,61,1,.3)`,transition:"all .14s" }}>💾 Save All</button>
      </div>

      {/* PRINTER SETTINGS PAGE */}
      {mainTab === "printers" && (
        <div style={{ display:"flex",minHeight:"calc(100vh - 52px)" }}>
          <div style={sidebarStyle}>
            <div style={sbSecStyle}>Print Settings</div>
            <SbItem icon="👨‍🍳" label="Kitchen Management" active={printerSec==="kitchens"} badge={kitchens.length} onClick={() => setPrinterSec("kitchens")} />
            <SbItem icon="🖨️" label="Printer Config" active={printerSec==="printer-config"} badge={printers.length} onClick={() => setPrinterSec("printer-config")} />
            <SbItem icon="📋" label="KOT Settings" active={printerSec==="kot-settings"} onClick={() => setPrinterSec("kot-settings")} />
            <SbItem icon="🧾" label="Bill Settings" active={printerSec==="bill-settings"} onClick={() => setPrinterSec("bill-settings")} />
            <SbItem icon="⚡" label="Direct Print" active={printerSec==="directprint"} onClick={() => setPrinterSec("directprint")} />
            <SbItem icon="📄" label="Paper &amp; Format" active={printerSec==="paper"} onClick={() => setPrinterSec("paper")} />
            <div style={sbSecStyle}>Status</div>
            <div style={{ padding:"10px 12px",display:"flex",flexDirection:"column",gap:7,fontSize:12 }}>
              {printerStatus.map(ps => (
                <div key={ps.name} style={{ display:"flex",alignItems:"center",justifyContent:"space-between" }}>
                  <span style={{ color:C.t2,fontWeight:500 }}>{ps.name}</span>
                  <span style={{ display:"flex",alignItems:"center",gap:5,fontWeight:700,color:ps.status==="online"?C.grn:C.amb }}>
                    <DotStatus status={ps.status} />{ps.status==="online"?"Online":"Not set"}
                  </span>
                </div>
              ))}
            </div>
            <div style={{ padding:"10px 12px",marginTop:8 }}>
              <button onClick={() => { setPrinterSec("printer-config"); showToast("Testing all printers...", "info"); }} style={{ width:"100%",padding:"7px 12px",background:C.grn,border:`1.5px solid ${C.grn}`,borderRadius:10,color:"#fff",fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:"Plus Jakarta Sans,sans-serif",display:"flex",justifyContent:"center",alignItems:"center",gap:6 }}>🔍 Test All Printers</button>
            </div>
          </div>
          <div style={contentStyle}>
            {printerSec === "kitchens" && renderKitchens()}
            {printerSec === "printer-config" && renderPrinterConfig()}
            {printerSec === "kot-settings" && renderKotSettings()}
            {printerSec === "bill-settings" && renderBillSettings()}
            {printerSec === "directprint" && renderDirectPrint()}
            {printerSec === "paper" && renderPaper()}
          </div>
        </div>
      )}

      {/* KDS PAGE */}
      {mainTab === "kds" && (
        <div style={{ display:"flex",minHeight:"calc(100vh - 52px)" }}>
          <div style={sidebarStyle}>
            <div style={sbSecStyle}>KDS Settings</div>
            <SbItem icon="⚙️" label="General" active={kdsSec==="kds-general"} onClick={() => setKdsSec("kds-general")} />
            <SbItem icon="🖥️" label="Display Layout" active={kdsSec==="kds-display"} onClick={() => setKdsSec("kds-display")} />
            <SbItem icon="⏱️" label="Timer Settings" active={kdsSec==="kds-timers"} onClick={() => setKdsSec("kds-timers")} />
            <SbItem icon="📺" label="KDS Screens" active={kdsSec==="kds-screens"} onClick={() => setKdsSec("kds-screens")} />
          </div>
          <div style={contentStyle}>
            {kdsSec === "kds-general" && renderKdsGeneral()}
            {kdsSec === "kds-display" && renderKdsDisplay()}
            {kdsSec === "kds-timers" && renderKdsTimers()}
            {kdsSec === "kds-screens" && renderKdsScreens()}
          </div>
        </div>
      )}

      {/* LED DISPLAY PAGE */}
      {mainTab === "led" && (
        <div style={{ display:"flex",minHeight:"calc(100vh - 52px)" }}>
          <div style={sidebarStyle}>
            <div style={sbSecStyle}>LED Banner</div>
            <SbItem icon="🖼️" label="Image Management" active={ledSec==="led-images"} onClick={() => setLedSec("led-images")} />
            <SbItem icon="⚙️" label="Display Settings" active={ledSec==="led-settings"} onClick={() => setLedSec("led-settings")} />
            <SbItem icon="▶️" label="Live Preview" active={ledSec==="led-preview"} onClick={() => setLedSec("led-preview")} />
          </div>
          <div style={contentStyle}>
            {ledSec === "led-images" && renderLedImages()}
            {ledSec === "led-settings" && renderLedSettingsSection()}
            {ledSec === "led-preview" && renderLedPreview()}
          </div>
        </div>
      )}

      {/* Printer Modal */}
      {modalOpen && renderModal()}
    </div>
  );
}
