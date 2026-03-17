import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Box, Typography, Button, Paper, Chip, Switch, TextField, Select, MenuItem,
  FormControl, Accordion, AccordionSummary, AccordionDetails, Tabs, Tab, Divider, Stack,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

// ─── Design Tokens ────────────────────────────────────────────────────────────
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

// ─── Types ────────────────────────────────────────────────────────────────────
type MainTab = "printers"|"kds"|"led";
type PrinterSec = "kitchens"|"printer-config"|"kot-settings"|"bill-settings"|"directprint"|"paper";
type KdsSec = "kds-general"|"kds-display"|"kds-timers"|"kds-screens";
type LedSec = "led-images"|"led-settings"|"led-preview";
type ConnType = "wifi"|"lan"|"bt"|"usb"|"cash";
type PrintType = "kot"|"bill"|"both";
interface Kitchen { id:string; name:string; color:string; printer:string; categories:string[]; online:boolean; autoKot:boolean; showNotes:boolean; }
interface PrinterDevice { id:string; name:string; model:string; conn:string; ip:string; status:"online"|"offline"|"warn"; icon:string; }
interface LedImage { id:string; name:string; size:string; duration:number; src:string; }

const CATEGORIES = ["🥗 Veg Pizza","🍗 Chicken Items","🥘 Paneer","🥬 South Indian","🫓 Roti / Naan","🫕 Dal","🥩 Non-Veg Biryani","🥤 Drinks","🍳 Egg Items","🍮 Desserts","🥩 Mutton Items","🌮 Rolls"];
const COLORS = ["#16a34a","#dc2626","#2563eb","#d97706","#7c3aed","#0f766e"];
const SCAN_DATA: Record<string, {ico:string;nm:string;addr:string}[]> = {
  wifi: [{ico:"🖨️",nm:"Epson TM-T88VI",addr:"192.168.1.10:9100"},{ico:"🖨️",nm:"Star TSP654IIE",addr:"192.168.1.11:9100"},{ico:"🖨️",nm:"Xprinter XP-365B",addr:"192.168.1.25:9100"}],
  lan: [{ico:"🔌",nm:"Epson TM-T20III",addr:"192.168.1.50:9100"},{ico:"🔌",nm:"Generic LAN Printer",addr:"192.168.1.55:9100"}],
  bt: [{ico:"🔵",nm:"BT-Printer-A3B2",addr:"00:1A:7D:DA:71:13"},{ico:"🔵",nm:"Rongta RP80",addr:"AA:BB:CC:DD:EE:FF"}],
  usb: [{ico:"💾",nm:"USB Thermal Printer",addr:"/dev/usb/lp0"},{ico:"💾",nm:"Generic USB",addr:"/dev/usb/lp1"}],
};

// ─── MUI-based sub-components ─────────────────────────────────────────────────
const muiSwSx = { "& .MuiSwitch-switchBase.Mui-checked": { color: C.grn }, "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: C.grn } };

function FieldRow({ label, sub, right }: { label:string; sub?:string; right:React.ReactNode }) {
  return (
    <Box sx={{ display:"flex",alignItems:"center",justifyContent:"space-between",py:"11px",borderBottom:`1px solid ${C.bd}` }}>
      <Box>
        <Typography sx={{ fontSize:"13.5px",fontWeight:700,color:C.tx }}>{label}</Typography>
        {sub && <Typography sx={{ fontSize:12,color:C.t3,mt:"1px" }}>{sub}</Typography>}
      </Box>
      <Box sx={{ display:"flex",alignItems:"center",gap:"10px",flexShrink:0 }}>{right}</Box>
    </Box>
  );
}

function SbItem({ icon, label, active, badge, badgeColor, onClick }: {
  icon:string; label:string; active:boolean; badge?:string|number; badgeColor?:string; onClick:()=>void;
}) {
  return (
    <Box onClick={onClick} sx={{
      display:"flex",alignItems:"center",gap:"9px",p:"10px 12px",borderRadius:"10px",
      mb:"2px",cursor:"pointer",fontSize:13,fontWeight:active?700:500,transition:"all .14s",
      border:`1.5px solid ${active?C.abdr:"transparent"}`,
      background:active?C.adim:"none",color:active?C.ac:C.t2,
      "&:hover":active?{}:{ background:C.s2,color:C.tx },
    }}>
      <Box component="span" sx={{ fontSize:16,width:20,textAlign:"center",flexShrink:0 }}>{icon}</Box>
      <Box sx={{ flex:1 }}>{label}</Box>
      {badge !== undefined && (
        <Chip label={badge} size="small" sx={{ height:18,fontSize:"9.5px",fontWeight:800,background:badgeColor||C.grn,color:"#fff","& .MuiChip-label":{px:"5px"} }} />
      )}
    </Box>
  );
}

function FgField({ label, value, onChange, placeholder, mono, type }: {
  label:string; value:string; onChange?:(v:string)=>void; placeholder?:string; mono?:boolean; type?:string;
}) {
  return (
    <TextField label={label} value={value} type={type||"text"} placeholder={placeholder}
      onChange={e=>onChange?.(e.target.value)} size="small" fullWidth variant="outlined"
      inputProps={{ style:{ fontFamily:mono?"JetBrains Mono,monospace":"Plus Jakarta Sans,sans-serif",fontSize:13 } }}
      sx={{ "& .MuiOutlinedInput-root":{ background:C.s1,borderRadius:"10px","& fieldset":{borderColor:C.bd},"&:hover fieldset":{borderColor:C.bd2},"&.Mui-focused fieldset":{borderColor:C.ac,background:C.w} },"& label":{fontSize:11,fontWeight:700,color:C.t2,textTransform:"uppercase",letterSpacing:".3px"},"& label.Mui-focused":{color:C.ac} }}
    />
  );
}

function FgSel({ label, value, onChange, options }: {
  label:string; value:string; onChange?:(v:string)=>void; options:string[];
}) {
  return (
    <FormControl size="small" fullWidth>
      <Typography sx={{ fontSize:11,fontWeight:700,color:C.t2,textTransform:"uppercase",letterSpacing:".3px",mb:"5px" }}>{label}</Typography>
      <Select value={value} onChange={e=>onChange?.(e.target.value as string)}
        sx={{ background:C.s1,borderRadius:"10px","& .MuiOutlinedInput-notchedOutline":{borderColor:C.bd},"&:hover .MuiOutlinedInput-notchedOutline":{borderColor:C.bd2},"&.Mui-focused .MuiOutlinedInput-notchedOutline":{borderColor:C.ac},fontSize:13,fontFamily:"Plus Jakarta Sans,sans-serif",color:C.tx }}>
        {options.map(o=><MenuItem key={o} value={o} sx={{fontSize:13}}>{o}</MenuItem>)}
      </Select>
    </FormControl>
  );
}

function ABtn({ children, onClick, variant="default", sm, startIcon }: {
  children:React.ReactNode; onClick?:()=>void; variant?:"default"|"primary"|"green"|"danger"; sm?:boolean; startIcon?:React.ReactNode;
}) {
  const vs = {
    default:{bg:C.w,border:`1.5px solid ${C.bd}`,color:C.t2,hover:{}},
    primary:{bg:C.ac,border:`1.5px solid ${C.ac}`,color:"#fff",hover:{bg:C.ah}},
    green:{bg:C.grn,border:`1.5px solid ${C.grn}`,color:"#fff",hover:{}},
    danger:{bg:C.rdim,border:`1.5px solid ${C.rbdr}`,color:C.red,hover:{}},
  };
  const v = vs[variant];
  return (
    <Button onClick={onClick} size={sm?"small":"medium"} startIcon={startIcon}
      sx={{ background:v.bg,border:v.border,color:v.color,borderRadius:"10px",fontWeight:700,textTransform:"none",fontSize:sm?12:13,fontFamily:"Plus Jakarta Sans,sans-serif",px:sm?"12px":"16px",py:sm?"7px":"9px","&:hover":{background:"hover" in v && "bg" in (v.hover||{})?(v.hover as any).bg:v.bg,border:v.border,opacity:.88},boxShadow:variant==="primary"?`0 2px 8px rgba(255,61,1,.25)`:"none" }}>
      {children}
    </Button>
  );
}

function StatusChip({ status }:{ status:"online"|"offline"|"warn" }) {
  const c = status==="online"?{bg:C.gdim,color:C.grn,label:"Online"}:status==="warn"?{bg:C.adm2,color:C.amb,label:"Not Set"}:{bg:C.rdim,color:C.red,label:"Offline"};
  return <Chip label={c.label} size="small" sx={{background:c.bg,color:c.color,fontWeight:700,fontSize:11}} />;
}

function CPill({ children, variant }:{ children:React.ReactNode; variant:"g"|"r"|"b"|"a"|"ac" }) {
  const vs={g:{bg:C.gdim,color:C.grn},r:{bg:C.rdim,color:C.red},b:{bg:C.bdim,color:C.blu},a:{bg:C.adm2,color:C.amb},ac:{bg:C.adim,color:C.ac}};
  const v=vs[variant];
  return <Chip label={children} size="small" sx={{background:v.bg,color:v.color,fontWeight:700,fontSize:11,borderRadius:"20px"}} />;
}

const cardSx = { background:C.w,border:`1.5px solid ${C.bd}`,borderRadius:"14px",boxShadow:"0 1px 4px rgba(0,0,0,.06)",mb:"18px",overflow:"hidden" };
const cardHdrSx = { display:"flex",alignItems:"center",justifyContent:"space-between",p:"14px 18px",borderBottom:`1px solid ${C.bd}`,background:C.s1 };
const cardBodySx = { p:"18px" };
const grid2 = { display:"grid",gridTemplateColumns:"1fr 1fr",gap:"14px",mb:"14px" };
const grid3 = { display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"14px",mb:"14px" };
const pgTitleSx = { fontSize:22,fontWeight:800,color:C.tx };
const pgSubSx = { fontSize:13,color:C.t3,mt:"3px",fontWeight:500,maxWidth:560 };
const sbSecSx = { fontSize:"9.5px",fontWeight:800,textTransform:"uppercase" as const,letterSpacing:"1.1px",color:C.t3,p:"10px 12px 4px" };

// ─── Main Component ────────────────────────────────────────────────────────────
export default function PrinterSettings() {
  const { branchData } = useAuth();
  const [mainTab, setMainTab] = useState<MainTab>("printers");
  const [printerSec, setPrinterSec] = useState<PrinterSec>("kitchens");
  const [kdsSec, setKdsSec] = useState<KdsSec>("kds-general");
  const [ledSec, setLedSec] = useState<LedSec>("led-images");

  const [kitchens, setKitchens] = useState<Kitchen[]>([
    { id:"k1",name:"Veg Kitchen",color:"#16a34a",printer:"Epson TM-T88VI (192.168.1.10)",categories:["🥗 Veg Pizza","🥘 Paneer","🥬 South Indian","🫓 Roti / Naan","🫕 Dal"],online:true,autoKot:true,showNotes:true },
    { id:"k2",name:"Non-Veg Kitchen",color:"#dc2626",printer:"Star TSP654IIE (192.168.1.11)",categories:["🍗 Chicken Items","🥩 Mutton Items","🍳 Egg Items","🥩 Non-Veg Biryani"],online:true,autoKot:true,showNotes:true },
  ]);
  const [openKitchens, setOpenKitchens] = useState<string[]>(["k1"]);
  const [showAddKitchen, setShowAddKitchen] = useState(false);
  const [newKitchenName, setNewKitchenName] = useState("");
  const [newKitchenColor, setNewKitchenColor] = useState("#16a34a");
  const [newKitchenCats, setNewKitchenCats] = useState<string[]>([]);
  const [newKitchenPrinter, setNewKitchenPrinter] = useState("");

  const [printers] = useState<PrinterDevice[]>([
    { id:"p1",name:"Veg Kitchen Printer",model:"Epson TM-T88VI · WiFi",conn:"wifi",ip:"192.168.1.10",status:"online",icon:"🖨️" },
    { id:"p2",name:"Non-Veg Kitchen Printer",model:"Star TSP654IIE · LAN",conn:"lan",ip:"192.168.1.11",status:"online",icon:"🖨️" },
    { id:"p3",name:"Bill / Receipt Printer",model:"Epson TM-T20III · USB",conn:"usb",ip:"",status:"online",icon:"🧾" },
    { id:"p4",name:"Cash Drawer",model:"Bill Printer se connect",conn:"cash",ip:"",status:"warn",icon:"🗄️" },
    { id:"p5",name:"KDS Display",model:"Kitchen Display System",conn:"wifi",ip:"",status:"offline",icon:"🖥️" },
  ]);
  const [selectedPrinter, setSelectedPrinter] = useState<string>("p1");
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
  const [foundPrinters, setFoundPrinters] = useState<{ico:string;nm:string;addr:string}[]>([]);
  const [selectedFound, setSelectedFound] = useState<string>("");

  const [ledImages, setLedImages] = useState<LedImage[]>([]);
  const [ledPlaying, setLedPlaying] = useState(false);
  const [ledCurrentIdx, setLedCurrentIdx] = useState(0);
  const ledTimerRef = useRef<ReturnType<typeof setTimeout>|null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [kotToggles, setKotToggles] = useState({ restName:true,branchName:true,logo:false,kotNum:true,table:true,orderType:true,dateTime:true,waiter:true,pax:true,orderId:true,itemNameBold:true,itemQtyLarge:true,itemPrice:false,itemNotes:true,modifiers:true,vegIndicator:true,footer:true,copyNum:true,cutPaper:true });
  const [billToggles, setBillToggles] = useState({ logo:true,restName:true,address:true,phone:true,gstin:true,fssai:false,billNum:true,table:true,dateTime:true,waiter:true,pax:true,customer:false,gstBreakup:true,discount:true,delivery:true,roundOff:false,amtWords:false,upiQr:false,website:false,printInvoice:true,cutPaper:true });
  const [directToggles, setDirectToggles] = useState({ kotDirect:true,billDirect:true,autoKotOnAdd:false,autoBillOnCheckout:true,openDrawer:true,ebillSend:false,kotSound:true,newOrderSound:true,reprintConfirm:true,partialKot:true });

  const [paperSize, setPaperSize] = useState("80mm");
  const [charsPerLine, setCharsPerLine] = useState("48");
  const [fontSize, setFontSize] = useState("Medium (9pt)");
  const [lineSpacing, setLineSpacing] = useState("Normal");

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

  const [ledDuration, setLedDuration] = useState("5");
  const [ledTransition, setLedTransition] = useState("Fade");
  const [ledTransitionSpeed, setLedTransitionSpeed] = useState("Medium (1s)");
  const [ledFit, setLedFit] = useState("Cover (Full Screen)");
  const [ledOrientation, setLedOrientation] = useState("Landscape (16:9)");
  const [ledLoop, setLedLoop] = useState(true);
  const [ledToggles, setLedToggles] = useState({ customerDisplay:true,autoStart:true,pauseOnOrder:false });

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
  const [kotRestName, setKotRestName] = useState(branchData?.data?.restaurant_name||"Bhojpe Restaurant");
  const [kotBranch, setKotBranch] = useState(branchData?.data?.branch_name||"Kap's Cafe, Gwalior");
  const [kotFooter, setKotFooter] = useState("Please prepare these items");

  const showToast = useCallback((msg:string, type:"success"|"error"|"info"="success")=>{
    if (type==="error") toast.error(msg); else if (type==="info") toast(msg); else toast.success(msg);
  },[]);

  const toggleKitchen = (id:string)=>setOpenKitchens(p=>p.includes(id)?p.filter(k=>k!==id):[...p,id]);
  const removeKitchen = (id:string)=>{ if (!window.confirm("Remove this kitchen?")) return; setKitchens(p=>p.filter(k=>k.id!==id)); showToast("Kitchen removed"); };
  const addKitchen = async ()=>{
    if (!newKitchenName.trim()){showToast("Kitchen name enter karo","error");return;}
    const newK:Kitchen={id:`k${Date.now()}`,name:newKitchenName.trim(),color:newKitchenColor,printer:newKitchenPrinter||"No printer",categories:newKitchenCats,online:false,autoKot:true,showNotes:true};
    try{await client.post("/kitchens",{name:newK.name,color:newK.color,printer:newK.printer,categories:newK.categories});}catch{/*local*/}
    setKitchens(p=>[...p,newK]);setNewKitchenName("");setNewKitchenColor("#16a34a");setNewKitchenCats([]);setNewKitchenPrinter("");setShowAddKitchen(false);showToast(`${newK.name} kitchen added ✓`);
  };
  const toggleCat=(cat:string,arr:string[],setArr:(v:string[])=>void)=>setArr(arr.includes(cat)?arr.filter(c=>c!==cat):[...arr,cat]);
  const openModal=(name:string|null)=>{setModalName(name||"");setModalFunction("");setModalPrintType("kot");setModalConn("wifi");setModalIp("");setModalPort("9100");setModalModel("");setFoundPrinters([]);setSelectedFound("");setModalOpen(true);};
  const doScan=()=>{setScanning(true);setFoundPrinters([]);setTimeout(()=>{const r=SCAN_DATA[modalConn]||[];setFoundPrinters(r);setScanning(false);showToast(`${r.length} printer(s) found`);},2200);};
  const saveModal=async()=>{if(!modalName.trim()){showToast("Printer name enter karo","error");return;}try{await client.post("/printers",{name:modalName,function:modalFunction,printType:modalPrintType,conn:modalConn,ip:modalIp,port:modalPort,model:modalModel,paperSize:modalPaperSize,copies:modalCopies,encoding:modalEncoding,autoPrint:modalAutoPrint,active:modalActive});}catch{/*local*/}setModalOpen(false);showToast(`${modalName} saved ✓`);};
  const handleFiles=(files:File[])=>{const valid=files.filter(f=>f.type.startsWith("image/")&&f.size<=5*1024*1024);valid.forEach(f=>{const r=new FileReader();r.onload=e=>setLedImages(p=>[...p,{id:`img${Date.now()}${Math.random()}`,name:f.name,size:`${(f.size/1024).toFixed(1)} KB`,duration:5,src:e.target?.result as string}]);r.readAsDataURL(f);});if(valid.length<files.length)showToast("Some files skipped (>5MB or not image)","error");};

  useEffect(()=>{
    if(ledPlaying&&ledImages.length>0){const dur=(ledImages[ledCurrentIdx]?.duration||5)*1000;ledTimerRef.current=setTimeout(()=>setLedCurrentIdx(i=>(i+1)%ledImages.length),dur);}
    return()=>{if(ledTimerRef.current)clearTimeout(ledTimerRef.current);};
  },[ledPlaying,ledCurrentIdx,ledImages]);

  const saveKotSettings=async()=>{try{await client.post("/print-settings/kot",{...kotToggles,restaurantName:kotRestName,branchName:kotBranch,footer:kotFooter});}catch{/*local*/}showToast("KOT settings saved ✓");};
  const saveBillSettings=async()=>{try{await client.post("/print-settings/bill",{...billToggles,restaurantName:billRestName,address:billAddress,phone:billPhone,gstin:billGstin,fssai:billFssai,email:billEmail,upi:billUpi,footer1:billFooter1,footer2:billFooter2,copies:billCopies});}catch{/*local*/}showToast("Bill settings saved ✓");};
  const saveDirectPrint=async()=>{try{await client.post("/print-settings/direct",directToggles);}catch{/*local*/}showToast("Direct print saved ✓");};
  const savePaperSettings=async()=>{try{await client.post("/print-settings/paper",{paperSize,charsPerLine,fontSize,lineSpacing});}catch{/*local*/}showToast("Paper settings saved ✓");};
  const saveKdsSettings=async()=>{try{await client.post("/kds-settings",{ip:kdsIp,connType:kdsConnType,...kdsToggles,cols:kdsCols,cardSize:kdsCardSize,theme:kdsTheme,fontSize:kdsFontSize});}catch{/*local*/}showToast("KDS settings saved ✓");};
  const saveLedSettings=async()=>{try{await client.post("/led-settings",{duration:ledDuration,transition:ledTransition,speed:ledTransitionSpeed,fit:ledFit,orientation:ledOrientation,loop:ledLoop,...ledToggles});}catch{/*local*/}showToast("Display settings saved ✓");};

  const printerStatus=[{name:"Veg Kitchen",status:"online" as const},{name:"Non-Veg Kitchen",status:"online" as const},{name:"Bill Printer",status:"online" as const},{name:"Cash Drawer",status:"warn" as const}];

  // ─── Sections ───────────────────────────────────────────────────────────────
  const renderKitchens=()=>(
    <Box>
      <Box sx={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",mb:"20px"}}>
        <Box><Typography sx={pgTitleSx}>Kitchen Management</Typography><Typography sx={pgSubSx}>Har kitchen add karo, categories assign karo aur printer link karo</Typography></Box>
        <Stack direction="row" spacing={1}>
          <ABtn onClick={()=>showToast("Test all kitchen printers 🖨️")}>🖨️ Test All</ABtn>
          <ABtn variant="primary" onClick={()=>setShowAddKitchen(v=>!v)}>+ Add Kitchen</ABtn>
        </Stack>
      </Box>

      {showAddKitchen && (
        <Box sx={{background:C.adim,border:`1.5px dashed ${C.abdr}`,borderRadius:"14px",p:"20px",mb:"18px"}}>
          <Typography sx={{fontSize:14,fontWeight:800,color:C.ac,mb:"14px"}}>➕ New Kitchen Setup</Typography>
          <Box sx={grid3}>
            <FgField label="Kitchen Name" value={newKitchenName} onChange={setNewKitchenName} placeholder="e.g. Veg Kitchen" />
            <Box>
              <Typography sx={{fontSize:11,fontWeight:700,color:C.t2,textTransform:"uppercase",letterSpacing:".3px",mb:"5px"}}>Color</Typography>
              <Box sx={{display:"flex",gap:"8px",mt:"4px"}}>
                {COLORS.map(col=><Box key={col} onClick={()=>setNewKitchenColor(col)} sx={{width:32,height:32,borderRadius:"8px",background:col,cursor:"pointer",border:newKitchenColor===col?`2px solid ${C.tx}`:"2px solid transparent",transition:"border .14s"}} />)}
              </Box>
            </Box>
            <FgSel label="Assign Printer" value={newKitchenPrinter} onChange={setNewKitchenPrinter} options={["Select Printer","Epson TM-T88VI (192.168.1.10)","Star TSP654IIE (192.168.1.11)","Bill Printer (USB)"]} />
          </Box>
          <Box sx={{mb:"14px"}}>
            <Typography sx={{fontSize:11,fontWeight:700,color:C.t2,textTransform:"uppercase",letterSpacing:".3px",mb:"8px"}}>Item Categories</Typography>
            <Box sx={{display:"flex",flexWrap:"wrap",gap:"7px",mt:"8px"}}>
              {CATEGORIES.map(cat=>{const on=newKitchenCats.includes(cat);return(
                <Chip key={cat} label={cat} onClick={()=>toggleCat(cat,newKitchenCats,setNewKitchenCats)} variant={on?"filled":"outlined"} size="small"
                  sx={{cursor:"pointer",fontWeight:700,fontSize:12,background:on?C.gdim:"transparent",color:on?C.grn:C.t2,border:`1.5px solid ${on?C.gbdr:C.bd}`,"&:hover":{background:on?C.gdim:C.s2}}} />
              );})}
            </Box>
          </Box>
          <Stack direction="row" spacing={1}>
            <ABtn variant="primary" onClick={addKitchen}>✅ Add Kitchen</ABtn>
            <ABtn onClick={()=>setShowAddKitchen(false)}>Cancel</ABtn>
          </Stack>
        </Box>
      )}

      {kitchens.map(k=>{const isOpen=openKitchens.includes(k.id);return(
        <Paper key={k.id} elevation={0} sx={{...cardSx,transition:"box-shadow .16s"}}>
          <Box onClick={()=>toggleKitchen(k.id)} sx={{display:"flex",alignItems:"center",gap:"12px",p:"16px 18px",cursor:"pointer",borderBottom:isOpen?`1px solid ${C.bd}`:"1px solid transparent",transition:"border-color .2s"}}>
            <Box sx={{width:40,height:40,borderRadius:"11px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0,background:`${k.color}22`}}>
              {k.name.toLowerCase().includes("veg")&&!k.name.toLowerCase().includes("non")?"🥗":"🍗"}
            </Box>
            <Box sx={{flex:1}}>
              <Typography sx={{fontSize:15,fontWeight:800,color:C.tx}}>{k.name}</Typography>
              <Typography sx={{fontSize:12,color:C.t3,mt:"2px"}}>{k.printer} · {k.categories.length} categories</Typography>
            </Box>
            <Stack direction="row" spacing={.75} alignItems="center" flexWrap="wrap">
              <CPill variant={k.online?"g":"r"}>{k.online?"● Online":"● Offline"}</CPill>
              <CPill variant="ac">{k.categories.length} Categories</CPill>
              <Chip label="80mm" size="small" sx={{background:C.s2,color:C.t2,border:`1px solid ${C.bd}`,fontWeight:700,fontSize:11}} />
            </Stack>
            <Stack direction="row" spacing={.75} sx={{ml:"8px",flexShrink:0}} onClick={e=>e.stopPropagation()}>
              <ABtn sm onClick={()=>openModal(k.name)}>⚙️ Printer</ABtn>
              <ABtn sm onClick={()=>showToast("Test KOT sent 🖨️")}>🖨️ Test</ABtn>
              <ABtn sm variant="danger" onClick={()=>removeKitchen(k.id)}>🗑</ABtn>
            </Stack>
          </Box>
          {isOpen&&(
            <Box sx={cardBodySx}>
              <Box sx={grid3}>
                <FgField label="Kitchen Name" value={k.name} onChange={v=>setKitchens(p=>p.map(x=>x.id===k.id?{...x,name:v}:x))} />
                <FgSel label="Assigned Printer" value={k.printer} onChange={v=>setKitchens(p=>p.map(x=>x.id===k.id?{...x,printer:v}:x))} options={["Epson TM-T88VI (192.168.1.10)","Star TSP654IIE (LAN)","Bill Printer (USB)"]} />
                <FgSel label="KOT Copies" value="1 Copy" options={["1 Copy","2 Copies"]} />
              </Box>
              <Box sx={{mb:"14px"}}>
                <Typography sx={{fontSize:11,fontWeight:700,color:C.t2,textTransform:"uppercase",letterSpacing:".3px",mb:"8px"}}>Assigned Item Categories</Typography>
                <Box sx={{display:"flex",flexWrap:"wrap",gap:"7px",mt:"8px"}}>
                  {CATEGORIES.map(cat=>{const on=k.categories.includes(cat);return(
                    <Chip key={cat} label={cat} onClick={()=>setKitchens(p=>p.map(x=>x.id===k.id?{...x,categories:on?x.categories.filter(c=>c!==cat):[...x.categories,cat]}:x))} variant={on?"filled":"outlined"} size="small"
                      sx={{cursor:"pointer",fontWeight:700,fontSize:12,background:on?C.gdim:"transparent",color:on?C.grn:C.t2,border:`1.5px solid ${on?C.gbdr:C.bd}`}} />
                  );})}
                </Box>
              </Box>
              <Box sx={{display:"flex",gap:"16px",mt:"14px",pt:"14px",borderTop:`1px solid ${C.bd}`,alignItems:"center"}}>
                <Box sx={{display:"flex",alignItems:"center",gap:"7px",cursor:"pointer"}} onClick={()=>setKitchens(p=>p.map(x=>x.id===k.id?{...x,autoKot:!x.autoKot}:x))}>
                  <Switch checked={k.autoKot} size="small" sx={muiSwSx} />
                  <Typography sx={{fontSize:13,fontWeight:600,color:C.t2}}>Auto KOT Print</Typography>
                </Box>
                <Box sx={{display:"flex",alignItems:"center",gap:"7px",cursor:"pointer"}} onClick={()=>setKitchens(p=>p.map(x=>x.id===k.id?{...x,showNotes:!x.showNotes}:x))}>
                  <Switch checked={k.showNotes} size="small" sx={muiSwSx} />
                  <Typography sx={{fontSize:13,fontWeight:600,color:C.t2}}>Show Notes on KOT</Typography>
                </Box>
                <ABtn variant="primary" sm onClick={()=>showToast(`${k.name} saved ✓`)} startIcon={<SaveOutlinedIcon sx={{fontSize:"14px !important"}} />}>Save</ABtn>
              </Box>
            </Box>
          )}
        </Paper>
      );})}

      <Paper elevation={0} sx={cardSx}>
        <Box sx={cardHdrSx}>
          <Box sx={{display:"flex",alignItems:"center",gap:"10px"}}>
            <Box sx={{width:36,height:36,borderRadius:"10px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,background:C.adm2}}>⚠️</Box>
            <Box><Typography sx={{fontSize:15,fontWeight:800,color:C.tx}}>Fallback / Default Printer</Typography><Typography sx={{fontSize:12,color:C.t3,mt:"1px"}}>Jab kisi category ka printer assign na ho</Typography></Box>
          </Box>
        </Box>
        <Box sx={{...cardBodySx,display:"flex",alignItems:"center",gap:"14px"}}>
          <Typography sx={{flex:1,fontSize:13,color:C.t2}}>Unassigned categories ke KOT is printer se print honge</Typography>
          <FgSel label="" value="Veg Kitchen Printer (192.168.1.10)" options={["Veg Kitchen Printer (192.168.1.10)","Non-Veg Kitchen Printer","Bill Printer (USB)"]} />
          <ABtn variant="primary" sm onClick={()=>showToast("Fallback saved ✓")} startIcon={<SaveOutlinedIcon sx={{fontSize:"14px !important"}} />}>Save</ABtn>
        </Box>
      </Paper>
    </Box>
  );

  const renderPrinterConfig=()=>(
    <Box>
      <Box sx={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",mb:"20px"}}>
        <Box><Typography sx={pgTitleSx}>Printer Configuration</Typography><Typography sx={pgSubSx}>Sabhi printers setup karo — WiFi, Bluetooth, LAN, USB, Cash Drawer</Typography></Box>
        <ABtn variant="primary" onClick={()=>openModal(null)}>+ Add New Printer</ABtn>
      </Box>
      <Box sx={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"14px",mb:"20px"}}>
        {printers.map(p=>(
          <Paper key={p.id} elevation={0} onClick={()=>{setSelectedPrinter(p.id);openModal(p.name);}} sx={{
            border:`1.5px solid ${selectedPrinter===p.id?C.ac:C.bd}`,borderRadius:"14px",p:"18px",cursor:"pointer",textAlign:"center",
            transition:"all .16s",boxShadow:selectedPrinter===p.id?`0 0 0 3px ${C.adim}`:"0 1px 4px rgba(0,0,0,.06)",
            background:selectedPrinter===p.id?C.adim:C.w,"&:hover":{boxShadow:"0 4px 16px rgba(0,0,0,.10)"},
          }}>
            <Typography sx={{fontSize:32,mb:"10px"}}>{p.icon}</Typography>
            <Typography sx={{fontSize:14,fontWeight:800,color:C.tx,mb:"4px"}}>{p.name}</Typography>
            <Typography sx={{fontSize:12,color:C.t3}}>{p.model}</Typography>
            <Box sx={{display:"flex",alignItems:"center",justifyContent:"center",mt:"8px"}}><StatusChip status={p.status} /></Box>
          </Paper>
        ))}
        <Paper elevation={0} onClick={()=>openModal(null)} sx={{border:`1.5px dashed ${C.bd}`,borderRadius:"14px",p:"18px",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center","&:hover":{borderColor:C.ac,background:C.adim}}}>
          <Typography sx={{fontSize:32,mb:"10px",opacity:.4}}>➕</Typography>
          <Typography sx={{fontSize:14,fontWeight:700,color:C.t2}}>Add Printer</Typography>
          <Typography sx={{fontSize:12,color:C.t3,mt:"4px"}}>New device setup</Typography>
        </Paper>
      </Box>
    </Box>
  );

  const renderKotSettings=()=>(
    <Box>
      <Box sx={{mb:"20px"}}><Typography sx={pgTitleSx}>KOT Print Settings</Typography><Typography sx={pgSubSx}>Kitchen Order Ticket par kya print hoga</Typography></Box>
      {[
        { title:"Restaurant Header",sub:"KOT ke upar restaurant info",icon:"🏪",bg:C.adim,rows:[
          {label:"Print Restaurant Name",sub:"KOT ke top par naam dikhe",tog:"restName" as const},
          {label:"Print Branch Name",sub:"Branch city/area",tog:"branchName" as const},
          {label:"Print Logo on KOT",sub:"Bhojpe logo print ho",tog:"logo" as const},
        ],extras:<Box sx={grid2}><FgField label="Restaurant Name" value={kotRestName} onChange={setKotRestName} /><FgField label="Branch Name" value={kotBranch} onChange={setKotBranch} /></Box>},
        { title:"Order Details",sub:"Table, time, waiter info",icon:"📋",bg:C.bdim,rows:[
          {label:"KOT Number",sub:"Serial KOT number",tog:"kotNum" as const},
          {label:"Table Number",sub:"T-1, T-2 etc.",tog:"table" as const},
          {label:"Order Type",sub:"Dine/Pickup/Delivery",tog:"orderType" as const},
          {label:"Date & Time",sub:"KOT print time",tog:"dateTime" as const},
          {label:"Waiter Name",sub:"Assigned waiter ka naam",tog:"waiter" as const},
          {label:"Pax Count",sub:"Kitne customer",tog:"pax" as const},
          {label:"Order ID",sub:"#001 order number",tog:"orderId" as const},
        ]},
        { title:"Item Details",sub:"Food items ka format",icon:"🍽️",bg:C.gdim,rows:[
          {label:"Item Name (Bold)",tog:"itemNameBold" as const},
          {label:"Item Quantity (Large)",tog:"itemQtyLarge" as const},
          {label:"Item Price on KOT",tog:"itemPrice" as const},
          {label:"Item Notes / Customization",tog:"itemNotes" as const},
          {label:"Modifiers on KOT",tog:"modifiers" as const},
          {label:"Veg/Non-Veg Indicator",tog:"vegIndicator" as const},
        ]},
      ].map(sec=>(
        <Accordion key={sec.title} defaultExpanded={sec.title==="Restaurant Header"} disableGutters elevation={0}
          sx={{border:`1.5px solid ${C.bd}`,borderRadius:"14px !important",mb:"12px",overflow:"hidden","&:before":{display:"none"},boxShadow:"0 1px 4px rgba(0,0,0,.06)"}}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{background:C.s1,"&.Mui-expanded":{borderBottom:`1px solid ${C.bd}`}}}>
            <Box sx={{display:"flex",alignItems:"center",gap:"12px"}}>
              <Box sx={{width:38,height:38,borderRadius:"10px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,background:sec.bg}}>{sec.icon}</Box>
              <Box><Typography sx={{fontSize:14,fontWeight:800,color:C.tx}}>{sec.title}</Typography><Typography sx={{fontSize:12,color:C.t3,mt:"2px"}}>{sec.sub}</Typography></Box>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{p:"18px"}}>
            {"extras" in sec && sec.extras}
            {sec.rows.map(r=>(
              <FieldRow key={r.label} label={r.label} sub={"sub" in r?r.sub:undefined}
                right={<Switch checked={kotToggles[r.tog]} onChange={e=>setKotToggles(t=>({...t,[r.tog]:e.target.checked}))} size="small" sx={muiSwSx} />} />
            ))}
          </AccordionDetails>
        </Accordion>
      ))}
      <Accordion disableGutters elevation={0} sx={{border:`1.5px solid ${C.bd}`,borderRadius:"14px !important",mb:"12px",overflow:"hidden","&:before":{display:"none"},boxShadow:"0 1px 4px rgba(0,0,0,.06)"}}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{background:C.s1}}>
          <Box sx={{display:"flex",alignItems:"center",gap:"12px"}}>
            <Box sx={{width:38,height:38,borderRadius:"10px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,background:C.adm2}}>📄</Box>
            <Box><Typography sx={{fontSize:14,fontWeight:800,color:C.tx}}>Footer</Typography><Typography sx={{fontSize:12,color:C.t3,mt:"2px"}}>KOT ke neeche</Typography></Box>
          </Box>
        </AccordionSummary>
        <AccordionDetails sx={{p:"18px"}}>
          <FieldRow label="Footer Message" right={<TextField size="small" value={kotFooter} onChange={e=>setKotFooter(e.target.value)} sx={{width:220,"& .MuiOutlinedInput-root":{background:C.s1,borderRadius:"10px","& fieldset":{borderColor:C.bd},"&.Mui-focused fieldset":{borderColor:C.ac}}}} />} />
          <FieldRow label="Copy Number" sub="COPY 1/1 ya 1/2" right={<Switch checked={kotToggles.copyNum} onChange={e=>setKotToggles(t=>({...t,copyNum:e.target.checked}))} size="small" sx={muiSwSx} />} />
          <FieldRow label="Cut Paper After KOT" sub="Auto paper cut" right={<Switch checked={kotToggles.cutPaper} onChange={e=>setKotToggles(t=>({...t,cutPaper:e.target.checked}))} size="small" sx={muiSwSx} />} />
        </AccordionDetails>
      </Accordion>
      <Paper elevation={0} sx={cardSx}>
        <Box sx={cardHdrSx}>
          <Box sx={{display:"flex",alignItems:"center",gap:"10px"}}>
            <Box sx={{width:36,height:36,borderRadius:"10px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,background:C.s2}}>👁</Box>
            <Box><Typography sx={{fontSize:15,fontWeight:800,color:C.tx}}>KOT Preview</Typography><Typography sx={{fontSize:12,color:C.t3,mt:"1px"}}>Live preview of KOT ticket</Typography></Box>
          </Box>
          <ABtn sm variant="green" onClick={()=>showToast("Test KOT printed 🖨️")}>🖨️ Print Test KOT</ABtn>
        </Box>
        <Box sx={{...cardBodySx,display:"flex",gap:"20px"}}>
          <Box sx={{flex:1,background:C.s1,border:`1px dashed ${C.bd2}`,borderRadius:"14px",p:"18px",fontFamily:"JetBrains Mono,monospace",fontSize:12,lineHeight:2,textAlign:"center",whiteSpace:"pre-line"}}>
{`================================
  ${kotRestName}
  ${kotBranch}
————————————————
KOT #023 — VEG KITCHEN
————————————————
${kotToggles.table?"Table: T-5  |  Pax: 4\n":""}${kotToggles.waiter?"Waiter: Sanjay S.\n":""}${kotToggles.dateTime?"Time: 15/03/26 07:30 PM\n":""}${kotToggles.orderType?"Order Type: Dine In\n":""}————————————————
3 x Butter Paneer Masala
${kotToggles.itemNotes?"  ● Spicy · Extra Gravy\n":""}2 x Garlic Naan
1 x Dal Tadka
================================
${kotToggles.footer?kotFooter+"\n":""}${kotToggles.copyNum?"COPY 1 / 1\n":""}================================`}
          </Box>
        </Box>
      </Paper>
      <Box sx={{display:"flex",justifyContent:"flex-end",mt:"8px"}}>
        <ABtn variant="primary" onClick={saveKotSettings} startIcon={<SaveOutlinedIcon />}>Save KOT Settings</ABtn>
      </Box>
    </Box>
  );

  const renderBillSettings=()=>(
    <Box>
      <Box sx={{mb:"20px"}}><Typography sx={pgTitleSx}>Bill Print Settings</Typography><Typography sx={pgSubSx}>Customer bill / Tax Invoice par kya print hoga</Typography></Box>
      {[
        {title:"Restaurant Header",sub:"Bill ke upar restaurant identity",icon:"🏪",bg:C.adim,rows:[{label:"Print Logo on Bill",tog:"logo" as const},{label:"Print Restaurant Name",tog:"restName" as const},{label:"Print Address",tog:"address" as const},{label:"Print Phone Number",tog:"phone" as const},{label:"Print GSTIN",tog:"gstin" as const},{label:"Print FSSAI",tog:"fssai" as const}],
          extras:<Box sx={grid2}><FgField label="Restaurant Name" value={billRestName} onChange={setBillRestName} /><FgField label="Address" value={billAddress} onChange={setBillAddress} /><FgField label="Phone" value={billPhone} onChange={setBillPhone} /><FgField label="GSTIN" value={billGstin} onChange={setBillGstin} mono /><FgField label="FSSAI" value={billFssai} onChange={setBillFssai} /><FgField label="Email" value={billEmail} onChange={setBillEmail} /></Box>},
        {title:"Bill Details",sub:"Bill number, table, waiter info",icon:"📋",bg:C.bdim,rows:[{label:"Bill Number",tog:"billNum" as const},{label:"Table Number",tog:"table" as const},{label:"Date & Time",tog:"dateTime" as const},{label:"Waiter Name",tog:"waiter" as const},{label:"Pax Count",tog:"pax" as const},{label:"Customer Name",tog:"customer" as const}]},
        {title:"Tax & Totals",sub:"GST, discount, total breakdown",icon:"💰",bg:C.gdim,rows:[{label:"Show GST Breakup",tog:"gstBreakup" as const},{label:"Show Discount",tog:"discount" as const},{label:"Show Delivery Charges",tog:"delivery" as const},{label:"Show Round Off",tog:"roundOff" as const},{label:"Amount in Words",tog:"amtWords" as const}]},
      ].map(sec=>(
        <Accordion key={sec.title} defaultExpanded={sec.title==="Restaurant Header"} disableGutters elevation={0} sx={{border:`1.5px solid ${C.bd}`,borderRadius:"14px !important",mb:"12px",overflow:"hidden","&:before":{display:"none"},boxShadow:"0 1px 4px rgba(0,0,0,.06)"}}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{background:C.s1,"&.Mui-expanded":{borderBottom:`1px solid ${C.bd}`}}}>
            <Box sx={{display:"flex",alignItems:"center",gap:"12px"}}>
              <Box sx={{width:38,height:38,borderRadius:"10px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,background:sec.bg}}>{sec.icon}</Box>
              <Box><Typography sx={{fontSize:14,fontWeight:800,color:C.tx}}>{sec.title}</Typography><Typography sx={{fontSize:12,color:C.t3,mt:"2px"}}>{sec.sub}</Typography></Box>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{p:"18px"}}>
            {"extras" in sec && sec.extras}
            {sec.rows.map(r=><FieldRow key={r.label} label={r.label} right={<Switch checked={billToggles[r.tog]} onChange={e=>setBillToggles(t=>({...t,[r.tog]:e.target.checked}))} size="small" sx={muiSwSx} />} />)}
          </AccordionDetails>
        </Accordion>
      ))}
      <Box sx={{display:"flex",justifyContent:"flex-end",mt:"8px"}}>
        <ABtn variant="primary" onClick={saveBillSettings} startIcon={<SaveOutlinedIcon />}>Save Bill Settings</ABtn>
      </Box>
    </Box>
  );

  const renderDirectPrint=()=>(
    <Box>
      <Box sx={{mb:"20px"}}><Typography sx={pgTitleSx}>Direct Print</Typography><Typography sx={pgSubSx}>Popup ke bina seedha print — faster operations ke liye</Typography></Box>
      <Box sx={{display:"flex",alignItems:"center",gap:"8px",p:"10px 14px",borderRadius:"10px",fontSize:13,fontWeight:600,mb:"16px",background:C.gdim,border:`1px solid ${C.gbdr}`,color:C.grn}}>
        ✅ Direct print enabled — KOT & Bill bina popup ke print honge
      </Box>
      <Box sx={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"14px"}}>
        <Paper elevation={0} sx={cardSx}><Box sx={cardBodySx}>
          <FieldRow label="KOT Direct Print" sub="KOT button → seedha print" right={<Switch checked={directToggles.kotDirect} onChange={e=>setDirectToggles(t=>({...t,kotDirect:e.target.checked}))} size="small" sx={muiSwSx} />} />
          <FieldRow label="Bill Direct Print" sub="Bill button → seedha print" right={<Switch checked={directToggles.billDirect} onChange={e=>setDirectToggles(t=>({...t,billDirect:e.target.checked}))} size="small" sx={muiSwSx} />} />
          <FieldRow label="Auto KOT on Item Add" sub="Item add → auto KOT" right={<Switch checked={directToggles.autoKotOnAdd} onChange={e=>setDirectToggles(t=>({...t,autoKotOnAdd:e.target.checked}))} size="small" sx={muiSwSx} />} />
          <FieldRow label="Auto Bill on Checkout" sub="Checkout → auto bill" right={<Switch checked={directToggles.autoBillOnCheckout} onChange={e=>setDirectToggles(t=>({...t,autoBillOnCheckout:e.target.checked}))} size="small" sx={muiSwSx} />} />
          <Box sx={{borderBottom:"none"}}><FieldRow label="Open Drawer on Cash" sub="Cash payment → drawer open" right={<Switch checked={directToggles.openDrawer} onChange={e=>setDirectToggles(t=>({...t,openDrawer:e.target.checked}))} size="small" sx={muiSwSx} />} /></Box>
        </Box></Paper>
        <Paper elevation={0} sx={cardSx}><Box sx={cardBodySx}>
          <FieldRow label="E-Bill Auto Send" sub="SMS/WhatsApp bill" right={<Switch checked={directToggles.ebillSend} onChange={e=>setDirectToggles(t=>({...t,ebillSend:e.target.checked}))} size="small" sx={muiSwSx} />} />
          <FieldRow label="KOT Sound Alert" sub="Print hone par beep" right={<Switch checked={directToggles.kotSound} onChange={e=>setDirectToggles(t=>({...t,kotSound:e.target.checked}))} size="small" sx={muiSwSx} />} />
          <FieldRow label="New Order Alert Sound" sub="Online order aane par sound" right={<Switch checked={directToggles.newOrderSound} onChange={e=>setDirectToggles(t=>({...t,newOrderSound:e.target.checked}))} size="small" sx={muiSwSx} />} />
          <FieldRow label="Reprint Confirmation" sub="Dubara print karte waqt confirm" right={<Switch checked={directToggles.reprintConfirm} onChange={e=>setDirectToggles(t=>({...t,reprintConfirm:e.target.checked}))} size="small" sx={muiSwSx} />} />
          <Box sx={{borderBottom:"none"}}><FieldRow label="Partial KOT on Edit" sub="Sirf naye items ka KOT" right={<Switch checked={directToggles.partialKot} onChange={e=>setDirectToggles(t=>({...t,partialKot:e.target.checked}))} size="small" sx={muiSwSx} />} /></Box>
        </Box></Paper>
      </Box>
      <Box sx={{display:"flex",justifyContent:"flex-end",mt:"14px"}}>
        <ABtn variant="primary" onClick={saveDirectPrint} startIcon={<SaveOutlinedIcon />}>Save Direct Print Settings</ABtn>
      </Box>
    </Box>
  );

  const renderPaper=()=>(
    <Box>
      <Box sx={{mb:"20px"}}><Typography sx={pgTitleSx}>Paper Size & Format</Typography><Typography sx={pgSubSx}>Print ka paper width, font, margins configure karo</Typography></Box>
      <Paper elevation={0} sx={cardSx}>
        <Box sx={cardHdrSx}><Box sx={{display:"flex",alignItems:"center",gap:"10px"}}><Box sx={{width:36,height:36,borderRadius:"10px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,background:C.s2}}>📄</Box><Typography sx={{fontSize:15,fontWeight:800,color:C.tx}}>Paper Size</Typography></Box></Box>
        <Box sx={cardBodySx}>
          <Box sx={{display:"flex",gap:"12px",mb:"18px"}}>
            {[{s:"80mm",sub:"Standard · Most printers",ico:"📄"},{s:"58mm",sub:"Compact printers",ico:"📄"},{s:"A4",sub:"Full page bills",ico:"📃"}].map(p=>(
              <Paper key={p.s} onClick={()=>{setPaperSize(p.s);showToast(`${p.s} selected`);}} elevation={0} sx={{border:`2px solid ${paperSize===p.s?C.ac:C.bd}`,borderRadius:"14px",p:"14px",textAlign:"center",cursor:"pointer",transition:"all .15s",background:paperSize===p.s?C.adim:C.w,flex:1,"&:hover":{borderColor:C.ac}}}>
                <Typography sx={{fontSize:24,mb:"7px"}}>{p.ico}</Typography>
                <Typography sx={{fontSize:13,fontWeight:800,color:C.tx}}>{p.s}</Typography>
                <Typography sx={{fontSize:11,color:C.t3,mt:"2px"}}>{p.sub}</Typography>
              </Paper>
            ))}
          </Box>
          <Box sx={grid3}>
            <FgField label="Characters/Line" value={charsPerLine} onChange={setCharsPerLine} mono />
            <FgSel label="Font Size" value={fontSize} onChange={setFontSize} options={["Small (7pt)","Medium (9pt)","Large (12pt)"]} />
            <FgSel label="Line Spacing" value={lineSpacing} onChange={setLineSpacing} options={["Compact","Normal","Wide"]} />
          </Box>
          <ABtn variant="primary" onClick={savePaperSettings} startIcon={<SaveOutlinedIcon />}>Save</ABtn>
        </Box>
      </Paper>
    </Box>
  );

  const renderKdsGeneral=()=>(
    <Box>
      <Box sx={{mb:"20px"}}><Typography sx={pgTitleSx}>KDS — Kitchen Display System</Typography><Typography sx={pgSubSx}>Kitchen display screen setup karo — live order status dikhane ke liye</Typography></Box>
      <Box sx={{background:C.tx,borderRadius:"14px",p:"18px",mb:"18px"}}>
        <Typography sx={{fontSize:13,fontWeight:700,color:"rgba(255,255,255,.6)",mb:"12px"}}>📺 KDS Screen Live Preview</Typography>
        <Box sx={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"10px",background:"#1a1a2e",borderRadius:"14px",p:"16px",minHeight:260}}>
          {[{id:"#201",table:"Table T-2 · Dine In · 4 Pax",items:["3× Butter Paneer","2× Garlic Naan","1× Dal Tadka"],timer:"⏱ 3 min",tColor:"rgba(34,197,94,.2)",tText:"#4ade80",bg:"#1e3a5f",border:"#3b82f6"},
            {id:"#199",table:"Table T-5 · Dine In · 2 Pax",items:["1× Chicken Biryani","2× Raita"],timer:"⏱ 18 min",tColor:"rgba(251,191,36,.2)",tText:"#fbbf24",bg:"#2d1f00",border:"#fbbf24"},
            {id:"#197",table:"Delivery · Swiggy",items:["2× Paneer Pizza","1× Cold Coffee"],timer:"🔥 28 min",tColor:"rgba(239,68,68,.2)",tText:"#f87171",bg:"#2d1f00",border:"#fbbf24"},
            {id:"#195",table:"✅ Ready",items:["5× Roti","1× Dal Makhani"],timer:"✓ Done",tColor:"rgba(34,197,94,.2)",tText:"#4ade80",bg:"#0f2d1a",border:"#22c55e"},
          ].map(card=>(
            <Box key={card.id} sx={{background:card.bg,border:`1.5px solid ${card.border}`,borderRadius:"12px",p:"14px",fontSize:12}}>
              <Typography sx={{fontSize:13,fontWeight:800,color:"#fff",mb:"4px"}}>{card.id}</Typography>
              <Typography sx={{fontSize:11,color:"rgba(255,255,255,.6)",mb:"8px"}}>{card.table}</Typography>
              {card.items.map(item=><Typography key={item} sx={{fontSize:"12.5px",color:"#fff",py:"3px",borderBottom:"1px solid rgba(255,255,255,.1)"}}>{item}</Typography>)}
              <Box sx={{fontSize:11,fontWeight:800,p:"3px 8px",borderRadius:"6px",mt:"8px",display:"inline-block",background:card.tColor,color:card.tText}}>{card.timer}</Box>
            </Box>
          ))}
        </Box>
      </Box>
      <Box sx={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"16px"}}>
        <Paper elevation={0} sx={cardSx}>
          <Box sx={cardHdrSx}><Box sx={{display:"flex",alignItems:"center",gap:"10px"}}><Box sx={{width:36,height:36,borderRadius:"10px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,background:C.bdim}}>🖥️</Box><Typography sx={{fontSize:15,fontWeight:800,color:C.tx}}>KDS Connection</Typography></Box><CPill variant="r">Offline</CPill></Box>
          <Box sx={cardBodySx}>
            <Box sx={{mb:"14px"}}><FgField label="KDS Screen IP / URL" value={kdsIp} onChange={setKdsIp} placeholder="192.168.1.20 or kds.bhojpe.local" mono /></Box>
            <FgSel label="Connection Type" value={kdsConnType} onChange={setKdsConnType} options={["WebSocket (LAN)","HTTP Polling","HDMI Direct"]} />
            <Stack direction="row" spacing={1} sx={{mt:"14px"}}>
              <ABtn variant="primary" sm onClick={()=>showToast("Connecting to KDS...", "info")}>🔗 Connect</ABtn>
              <ABtn variant="green" sm onClick={()=>showToast("Test sent to KDS 🖥️")}>📤 Test</ABtn>
            </Stack>
          </Box>
        </Paper>
        <Paper elevation={0} sx={cardSx}>
          <Box sx={cardHdrSx}><Box sx={{display:"flex",alignItems:"center",gap:"10px"}}><Box sx={{width:36,height:36,borderRadius:"10px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,background:C.gdim}}>⚙️</Box><Typography sx={{fontSize:15,fontWeight:800,color:C.tx}}>KDS Behavior</Typography></Box></Box>
          <Box sx={cardBodySx}>
            <FieldRow label="Auto Send to KDS on KOT" right={<Switch checked={kdsToggles.autoSend} onChange={e=>setKdsToggles(t=>({...t,autoSend:e.target.checked}))} size="small" sx={muiSwSx} />} />
            <FieldRow label="Show Timer on KDS" right={<Switch checked={kdsToggles.showTimer} onChange={e=>setKdsToggles(t=>({...t,showTimer:e.target.checked}))} size="small" sx={muiSwSx} />} />
            <FieldRow label="Sound Alert on New Order" right={<Switch checked={kdsToggles.soundAlert} onChange={e=>setKdsToggles(t=>({...t,soundAlert:e.target.checked}))} size="small" sx={muiSwSx} />} />
            <Box sx={{borderBottom:"none"}}><FieldRow label="Auto Remove Done Orders" right={<Switch checked={kdsToggles.autoRemove} onChange={e=>setKdsToggles(t=>({...t,autoRemove:e.target.checked}))} size="small" sx={muiSwSx} />} /></Box>
          </Box>
        </Paper>
      </Box>
      <Box sx={{display:"flex",justifyContent:"flex-end",mt:"8px"}}>
        <ABtn variant="primary" onClick={saveKdsSettings} startIcon={<SaveOutlinedIcon />}>Save KDS Settings</ABtn>
      </Box>
    </Box>
  );

  const renderKdsDisplay=()=>(
    <Box>
      <Box sx={{mb:"20px"}}><Typography sx={pgTitleSx}>KDS Display Layout</Typography></Box>
      <Paper elevation={0} sx={cardSx}><Box sx={cardBodySx}>
        <Box sx={grid2}>
          <FgSel label="Columns on KDS Screen" value={kdsCols} onChange={setKdsCols} options={["2 Columns","3 Columns","4 Columns","5 Columns"]} />
          <FgSel label="Card Size" value={kdsCardSize} onChange={setKdsCardSize} options={["Small","Medium","Large"]} />
          <FgSel label="Theme" value={kdsTheme} onChange={setKdsTheme} options={["Dark (Kitchen)","Light","High Contrast"]} />
          <FgSel label="Font Size" value={kdsFontSize} onChange={setKdsFontSize} options={["Small","Medium","Large"]} />
        </Box>
        <FieldRow label="Show Order Type (Dine/Delivery)" right={<Switch checked={kdsToggles.orderType} onChange={e=>setKdsToggles(t=>({...t,orderType:e.target.checked}))} size="small" sx={muiSwSx} />} />
        <FieldRow label="Show Customer Name" right={<Switch checked={kdsToggles.customerName} onChange={e=>setKdsToggles(t=>({...t,customerName:e.target.checked}))} size="small" sx={muiSwSx} />} />
        <Box sx={{borderBottom:"none"}}><FieldRow label="Show Platform (Zomato/Swiggy)" right={<Switch checked={kdsToggles.platform} onChange={e=>setKdsToggles(t=>({...t,platform:e.target.checked}))} size="small" sx={muiSwSx} />} /></Box>
        <Box sx={{mt:"14px"}}><ABtn variant="primary" onClick={()=>showToast("Display settings saved ✓")} startIcon={<SaveOutlinedIcon />}>Save</ABtn></Box>
      </Box></Paper>
    </Box>
  );

  const renderKdsTimers=()=>(
    <Box>
      <Box sx={{mb:"20px"}}><Typography sx={pgTitleSx}>Timer Alert Settings</Typography></Box>
      <Paper elevation={0} sx={cardSx}><Box sx={cardBodySx}>
        <Box sx={grid3}>
          {[{label:"Normal (Green) — Under",val:normalMin,setVal:setNormalMin},{label:"Warning (Amber) — Under",val:warnMin,setVal:setWarnMin},{label:"Critical (Red) — Over",val:critMin,setVal:setCritMin}].map(item=>(
            <Box key={item.label}>
              <Typography sx={{fontSize:11,fontWeight:700,color:C.t2,textTransform:"uppercase",letterSpacing:".3px",mb:"5px"}}>{item.label}</Typography>
              <Box sx={{display:"flex",alignItems:"center",gap:"8px"}}>
                <TextField type="number" value={item.val} onChange={e=>item.setVal(e.target.value)} size="small" fullWidth
                  inputProps={{style:{fontFamily:"JetBrains Mono,monospace",fontSize:13}}}
                  sx={{"& .MuiOutlinedInput-root":{background:C.s1,borderRadius:"10px","& fieldset":{borderColor:C.bd},"&.Mui-focused fieldset":{borderColor:C.ac}}}} />
                <Typography sx={{fontSize:13,color:C.t2}}>min</Typography>
              </Box>
            </Box>
          ))}
        </Box>
        <FieldRow label="Blink on Critical" sub="Red card blink kare" right={<Switch checked={kdsBlink} onChange={e=>setKdsBlink(e.target.checked)} size="small" sx={muiSwSx} />} />
        <Box sx={{borderBottom:"none"}}><FieldRow label="Sound on Critical" sub="25 min se zyada hone par alarm" right={<Switch checked={kdsSound} onChange={e=>setKdsSound(e.target.checked)} size="small" sx={muiSwSx} />} /></Box>
        <Box sx={{mt:"14px"}}><ABtn variant="primary" onClick={()=>showToast("Timer settings saved ✓")} startIcon={<SaveOutlinedIcon />}>Save</ABtn></Box>
      </Box></Paper>
    </Box>
  );

  const renderKdsScreens=()=>(
    <Box>
      <Box sx={{display:"flex",alignItems:"center",justifyContent:"space-between",mb:"20px"}}>
        <Typography sx={pgTitleSx}>KDS Screen Management</Typography>
        <ABtn variant="primary" onClick={()=>showToast("New KDS screen added!")}>+ Add KDS Screen</ABtn>
      </Box>
      <Paper elevation={0} sx={cardSx}><Box sx={cardBodySx}>
        {[{name:"Veg Kitchen Display",ip:"192.168.1.20",desc:"Shows: Veg items only"},{name:"Non-Veg Kitchen Display",ip:"192.168.1.21",desc:"Shows: Non-veg items"}].map(s=>(
          <Box key={s.name} sx={{display:"flex",alignItems:"center",gap:"14px",p:"14px",background:C.s1,border:`1.5px solid ${C.bd}`,borderRadius:"14px",mb:"10px"}}>
            <Typography sx={{fontSize:24}}>🖥️</Typography>
            <Box sx={{flex:1}}><Typography sx={{fontSize:14,fontWeight:700,color:C.tx}}>{s.name}</Typography><Typography sx={{fontSize:12,color:C.t3,mt:"2px"}}>{s.ip} · {s.desc}</Typography></Box>
            <CPill variant="r">Offline</CPill>
            <ABtn sm onClick={()=>showToast(`Configuring ${s.name}...`,"info")}>⚙️ Configure</ABtn>
            <ABtn sm variant="danger" onClick={()=>showToast(`${s.name} removed`,"error")}>🗑</ABtn>
          </Box>
        ))}
      </Box></Paper>
    </Box>
  );

  const renderLedImages=()=>(
    <Box>
      <Box sx={{mb:"20px"}}><Typography sx={pgTitleSx}>LED Display — Image Manager</Typography><Typography sx={pgSubSx}>Images upload karo, order set karo, scroll time configure karo</Typography></Box>
      <Box onClick={()=>fileInputRef.current?.click()} onDragOver={e=>{e.preventDefault();(e.currentTarget as HTMLDivElement).style.borderColor=C.ac;}} onDragLeave={e=>{(e.currentTarget as HTMLDivElement).style.borderColor=C.bd2;}} onDrop={e=>{e.preventDefault();handleFiles([...e.dataTransfer.files]);(e.currentTarget as HTMLDivElement).style.borderColor=C.bd2;}}
        sx={{border:`2.5px dashed ${C.bd2}`,borderRadius:"14px",p:"32px",textAlign:"center",cursor:"pointer",transition:"all .2s",background:C.s1,"&:hover":{borderColor:C.ac}}}>
        <input ref={fileInputRef} type="file" accept="image/*" multiple style={{display:"none"}} onChange={e=>handleFiles([...(e.target.files||[])])} />
        <Typography sx={{fontSize:44,mb:"12px",opacity:.6}}>📁</Typography>
        <Typography sx={{fontSize:16,fontWeight:800,color:C.tx,mb:"6px"}}>Images Yahan Drop Karo</Typography>
        <Typography sx={{fontSize:13,color:C.t3}}>ya click karke select karo · JPG, PNG, GIF · Max 5MB per image</Typography>
        <Button onClick={e=>{e.stopPropagation();fileInputRef.current?.click();}} variant="contained" sx={{mt:"14px",background:C.ac,borderRadius:"10px",fontWeight:800,textTransform:"none","&:hover":{background:C.ah}}}>📤 Upload Images</Button>
      </Box>
      {ledImages.length>0&&(
        <Box sx={{mt:"18px"}}>
          <Typography sx={{fontSize:12,fontWeight:800,textTransform:"uppercase",letterSpacing:".6px",color:C.t3,mb:"10px"}}>Uploaded Images</Typography>
          {ledImages.map(img=>(
            <Paper key={img.id} elevation={0} sx={{display:"flex",alignItems:"center",gap:"12px",p:"12px 14px",border:`1.5px solid ${C.bd}`,borderRadius:"14px",mb:"10px",boxShadow:"0 1px 4px rgba(0,0,0,.06)"}}>
              <Typography sx={{cursor:"grab",color:C.t3,fontSize:16}}>⠿</Typography>
              <Box sx={{width:72,height:54,borderRadius:"9px",overflow:"hidden",flexShrink:0}}><img src={img.src} alt={img.name} style={{width:"100%",height:"100%",objectFit:"cover"}} /></Box>
              <Box sx={{flex:1}}>
                <Typography sx={{fontSize:"13.5px",fontWeight:700,color:C.tx}}>{img.name}</Typography>
                <Typography sx={{fontSize:12,color:C.t3,mt:"2px"}}>{img.size}</Typography>
                <Box sx={{display:"flex",alignItems:"center",gap:"6px",mt:"8px"}}>
                  <Typography sx={{fontSize:12,color:C.t2,fontWeight:500}}>Duration:</Typography>
                  <TextField type="number" value={img.duration} size="small" inputProps={{min:1,max:60,style:{width:50,fontFamily:"Plus Jakarta Sans",fontSize:13,fontWeight:700,textAlign:"center"}}} onChange={e=>setLedImages(p=>p.map(x=>x.id===img.id?{...x,duration:Number(e.target.value)}:x))} sx={{"& .MuiOutlinedInput-root":{background:C.s1,borderRadius:"7px","& fieldset":{borderColor:C.bd}}}} />
                  <Typography sx={{fontSize:12,color:C.t2,fontWeight:500}}>seconds</Typography>
                </Box>
              </Box>
              <Stack direction="row" spacing={.75}>
                <ABtn sm onClick={()=>setLedCurrentIdx(ledImages.indexOf(img))}>👁</ABtn>
                <ABtn sm variant="danger" onClick={()=>setLedImages(p=>p.filter(x=>x.id!==img.id))}>🗑</ABtn>
              </Stack>
            </Paper>
          ))}
        </Box>
      )}
    </Box>
  );

  const renderLedSettingsSection=()=>(
    <Box>
      <Box sx={{mb:"20px"}}><Typography sx={pgTitleSx}>Display Settings</Typography></Box>
      <Paper elevation={0} sx={cardSx}><Box sx={cardBodySx}>
        <Box sx={grid3}>
          <Box>
            <Typography sx={{fontSize:11,fontWeight:700,color:C.t2,textTransform:"uppercase",letterSpacing:".3px",mb:"5px"}}>Default Image Duration</Typography>
            <Box sx={{display:"flex",alignItems:"center",gap:"8px"}}>
              <TextField type="number" value={ledDuration} onChange={e=>setLedDuration(e.target.value)} size="small" fullWidth inputProps={{min:1,max:60}} sx={{"& .MuiOutlinedInput-root":{background:C.s1,borderRadius:"10px","& fieldset":{borderColor:C.bd},"&.Mui-focused fieldset":{borderColor:C.ac}}}} />
              <Typography sx={{fontSize:13,color:C.t2}}>seconds</Typography>
            </Box>
          </Box>
          <FgSel label="Transition Effect" value={ledTransition} onChange={setLedTransition} options={["Fade","Slide Left","Slide Up","Zoom","None"]} />
          <FgSel label="Transition Speed" value={ledTransitionSpeed} onChange={setLedTransitionSpeed} options={["Fast (0.5s)","Medium (1s)","Slow (2s)"]} />
          <FgSel label="Image Fit" value={ledFit} onChange={setLedFit} options={["Cover (Full Screen)","Contain (Fit)","Stretch (Fill)"]} />
          <FgSel label="Screen Orientation" value={ledOrientation} onChange={setLedOrientation} options={["Landscape (16:9)","Portrait (9:16)"]} />
          <Box>
            <Typography sx={{fontSize:11,fontWeight:700,color:C.t2,textTransform:"uppercase",letterSpacing:".3px",mb:"5px"}}>Loop</Typography>
            <Box sx={{display:"flex",alignItems:"center",gap:"8px",mt:"8px"}}>
              <Switch checked={ledLoop} onChange={e=>setLedLoop(e.target.checked)} size="small" sx={muiSwSx} />
              <Typography sx={{fontSize:13,color:C.t2}}>Continuously loop images</Typography>
            </Box>
          </Box>
        </Box>
        <FieldRow label="Show on Customer Display" sub="Customer facing screen par show ho" right={<Switch checked={ledToggles.customerDisplay} onChange={e=>setLedToggles(t=>({...t,customerDisplay:e.target.checked}))} size="small" sx={muiSwSx} />} />
        <FieldRow label="Auto Start on POS Open" sub="POS khulte hi slideshow shuru" right={<Switch checked={ledToggles.autoStart} onChange={e=>setLedToggles(t=>({...t,autoStart:e.target.checked}))} size="small" sx={muiSwSx} />} />
        <Box sx={{borderBottom:"none"}}><FieldRow label="Pause on Order" sub="Jab order ho tab slideshow ruke" right={<Switch checked={ledToggles.pauseOnOrder} onChange={e=>setLedToggles(t=>({...t,pauseOnOrder:e.target.checked}))} size="small" sx={muiSwSx} />} /></Box>
        <Box sx={{mt:"14px"}}><ABtn variant="primary" onClick={saveLedSettings} startIcon={<SaveOutlinedIcon />}>Save Settings</ABtn></Box>
      </Box></Paper>
    </Box>
  );

  const renderLedPreview=()=>{const currentImg=ledImages[ledCurrentIdx];return(
    <Box>
      <Box sx={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",mb:"20px"}}>
        <Box><Typography sx={pgTitleSx}>Live Preview</Typography><Typography sx={pgSubSx}>Slideshow ka preview dekho</Typography></Box>
        <Stack direction="row" spacing={1}>
          <ABtn variant="green" onClick={()=>setLedPlaying(p=>!p)}>{ledPlaying?"⏸ Pause":"▶️ Play Preview"}</ABtn>
          <ABtn onClick={()=>showToast("Fullscreen mode (actual LED screen pe hoga)","info")}>⛶ Fullscreen</ABtn>
        </Stack>
      </Box>
      <Box sx={{background:"#000",borderRadius:"14px",overflow:"hidden",position:"relative",aspectRatio:"16/9",width:"100%",display:"flex",alignItems:"center",justifyContent:"center"}}>
        {currentImg?<img src={currentImg.src} alt={currentImg.name} style={{width:"100%",height:"100%",objectFit:"cover",transition:"opacity .8s ease"}} />:<Typography sx={{color:"rgba(255,255,255,.3)",fontSize:16,fontWeight:600,textAlign:"center"}}>📷 Koi image nahi — Images upload karein</Typography>}
      </Box>
      <Box sx={{mt:"14px",p:"12px 14px",background:C.w,border:`1px solid ${C.bd}`,borderRadius:"10px",display:"flex",alignItems:"center",gap:"14px",fontSize:13}}>
        <Typography sx={{color:C.t2,fontWeight:500,fontSize:13}}>Current image:</Typography>
        <Typography sx={{fontWeight:700,color:C.tx,fontSize:13}}>{currentImg?.name||"—"}</Typography>
        <Typography sx={{color:C.t2,fontWeight:500,fontSize:13,ml:"auto"}}>Next in:</Typography>
        <Typography sx={{fontWeight:700,color:C.ac,fontFamily:"JetBrains Mono,monospace",fontSize:13}}>{ledPlaying&&currentImg?`${currentImg.duration}s`:"—"}</Typography>
      </Box>
    </Box>
  );};

  // ─── Printer Modal ─────────────────────────────────────────────────────────
  const renderModal=()=>(
    <Box sx={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",p:"20px",fontFamily:"Plus Jakarta Sans,sans-serif"}}>
      <Paper elevation={0} sx={{borderRadius:"18px",width:580,maxWidth:"96vw",overflow:"hidden",display:"flex",flexDirection:"column",maxHeight:"90vh",animation:"popIn .22s ease"}}>
        <Box sx={{background:C.tx,p:"18px 22px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <Box>
            <Typography sx={{fontSize:18,fontWeight:800,color:"#fff"}}>{modalName?`⚙️ ${modalName} Settings`:"➕ Add New Printer"}</Typography>
            <Typography sx={{fontSize:12,color:"rgba(255,255,255,.5)",mt:"3px"}}>{modalName?"Configure printer settings":"New printer setup"}</Typography>
          </Box>
          <Box component="button" onClick={()=>setModalOpen(false)} sx={{fontSize:20,color:"rgba(255,255,255,.6)",cursor:"pointer",background:"none",border:"none",lineHeight:1,p:"4px"}}>✕</Box>
        </Box>
        <Box sx={{p:"22px",overflowY:"auto",flex:1}}>
          <Box sx={grid2}>
            <FgField label="Printer / Device Name" value={modalName} onChange={setModalName} placeholder="e.g. Veg Kitchen Printer" />
            <FgSel label="Kitchen / Function" value={modalFunction} onChange={setModalFunction} options={["-- Select --","Veg Kitchen KOT","Non-Veg Kitchen KOT","Both Kitchens KOT","Bill / Receipt","KOT + Bill (Same Printer)","Cash Drawer","KDS Display"]} />
          </Box>
          <Box sx={{mb:"14px"}}>
            <Typography sx={{fontSize:11,fontWeight:700,color:C.t2,textTransform:"uppercase",letterSpacing:".3px",mb:"10px"}}>Print Type</Typography>
            <Box sx={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"10px"}}>
              {(([["kot","📋","KOT Only","Kitchen Order Ticket"],["bill","🧾","Bill Only","Customer receipt"],["both","🖨️","Both","KOT + Bill same printer"]] as const)).map(([t,ico,title,sub])=>(
                <Paper key={t} onClick={()=>setModalPrintType(t)} elevation={0} sx={{border:`2px solid ${modalPrintType===t?C.ac:C.bd}`,borderRadius:"14px",p:"14px",textAlign:"center",cursor:"pointer",transition:"all .15s",background:modalPrintType===t?C.adim:C.w}}>
                  <Typography sx={{fontSize:24,mb:"7px"}}>{ico}</Typography>
                  <Typography sx={{fontSize:13,fontWeight:800,color:C.tx}}>{title}</Typography>
                  <Typography sx={{fontSize:11,color:C.t3,mt:"2px"}}>{sub}</Typography>
                </Paper>
              ))}
            </Box>
          </Box>
          <Box sx={{mb:"14px"}}>
            <Typography sx={{fontSize:11,fontWeight:700,color:C.t2,textTransform:"uppercase",letterSpacing:".3px",mb:"8px"}}>Connection Type</Typography>
            <Box sx={{display:"flex",gap:"6px",flexWrap:"wrap"}}>
              {(([["wifi","📶 WiFi"],["lan","🔌 LAN"],["bt","🔵 Bluetooth"],["usb","💾 USB"],["cash","🗄️ Cash Drawer"]] as [ConnType,string][])).map(([t,label])=>(
                <Chip key={t} label={label} onClick={()=>setModalConn(t)} sx={{cursor:"pointer",fontWeight:700,background:modalConn===t?C.ac:C.w,color:modalConn===t?"#fff":C.t2,border:`1.5px solid ${modalConn===t?C.ac:C.bd}`,borderRadius:"20px","&:hover":{background:modalConn===t?C.ac:C.s2}}} />
              ))}
            </Box>
          </Box>
          <Box sx={{background:C.s1,border:`1.5px solid ${C.bd}`,borderRadius:"14px",p:"14px",mb:"14px"}}>
            <Typography sx={{fontSize:"12.5px",fontWeight:700,color:C.t2,mb:"10px"}}>
              {modalConn==="wifi"?"📶 WiFi — Enter IP ya Scan":modalConn==="lan"?"🔌 LAN/Ethernet — Enter IP":modalConn==="bt"?"🔵 Bluetooth — Scan karo":modalConn==="usb"?"💾 USB — Auto detect":"🗄️ Cash Drawer — Bill printer se connect"}
            </Typography>
            <Box sx={{display:"flex",gap:"8px"}}>
              <TextField value={modalIp} onChange={e=>setModalIp(e.target.value)} size="small" sx={{flex:1,"& .MuiOutlinedInput-root":{background:C.w,borderRadius:"10px","& fieldset":{borderColor:C.bd},"&.Mui-focused fieldset":{borderColor:C.ac}}}} placeholder={modalConn==="wifi"||modalConn==="lan"?"IP Address (192.168.1.x)":modalConn==="usb"?"/dev/usb/lp0":"Scan to select"} />
              <TextField value={modalPort} onChange={e=>setModalPort(e.target.value)} size="small" placeholder="Port: 9100" sx={{maxWidth:130,"& .MuiOutlinedInput-root":{background:C.w,borderRadius:"10px","& fieldset":{borderColor:C.bd}},"& input":{fontFamily:"JetBrains Mono,monospace"}}} />
              <Button onClick={doScan} disabled={scanning} variant="contained" sx={{background:C.ac,borderRadius:"10px",fontWeight:800,textTransform:"none",whiteSpace:"nowrap","&:hover":{background:C.ah},"&:disabled":{background:C.s3}}}>{scanning?"⟳ Scanning...":"🔍 Scan"}</Button>
            </Box>
            {scanning&&<Box sx={{height:3,background:C.s2,borderRadius:3,overflow:"hidden",mt:"10px"}}><Box sx={{height:"100%",background:`linear-gradient(90deg,${C.ac},${C.amb})`,borderRadius:3,animation:"spAnim 2s ease-in-out infinite"}} /></Box>}
            {foundPrinters.map(p=>(
              <Box key={p.addr} onClick={()=>{setSelectedFound(p.addr);setModalName(p.nm);setModalIp(p.addr.split(":")[0]);setModalPort(p.addr.split(":")[1]||"9100");setModalModel(p.nm);showToast(`${p.nm} selected`);}} sx={{display:"flex",alignItems:"center",gap:"10px",p:"10px 12px",background:C.w,border:`1.5px solid ${selectedFound===p.addr?C.ac:C.bd}`,borderRadius:"10px",mt:"8px",cursor:"pointer",transition:"all .15s",backgroundColor:selectedFound===p.addr?C.adim:C.w}}>
                <Typography sx={{fontSize:20,flexShrink:0}}>{p.ico}</Typography>
                <Box sx={{flex:1}}><Typography sx={{fontSize:13,fontWeight:700,color:C.tx}}>{p.nm}</Typography><Typography sx={{fontSize:"11.5px",color:C.t3,fontFamily:"JetBrains Mono,monospace",mt:"1px"}}>{p.addr}</Typography></Box>
                <Box sx={{width:20,height:20,borderRadius:"50%",border:`2px solid ${selectedFound===p.addr?C.grn:C.bd}`,display:"flex",alignItems:"center",justifyContent:"center",background:selectedFound===p.addr?C.grn:"transparent",color:"#fff",fontSize:11,transition:"all .15s"}}>{selectedFound===p.addr?"✓":""}</Box>
              </Box>
            ))}
          </Box>
          <Box sx={grid2}>
            <FgSel label="Paper Size" value={modalPaperSize} onChange={setModalPaperSize} options={["80mm","58mm","A4"]} />
            <FgSel label="Copies" value={modalCopies} onChange={setModalCopies} options={["1 Copy","2 Copies"]} />
            <FgField label="Brand / Model" value={modalModel} onChange={setModalModel} placeholder="Epson, Star, Generic..." />
            <FgSel label="Encoding" value={modalEncoding} onChange={setModalEncoding} options={["ESC/POS","Star Mode","PCL"]} />
          </Box>
          <FieldRow label="Auto Print (no popup)" right={<Switch checked={modalAutoPrint} onChange={e=>setModalAutoPrint(e.target.checked)} size="small" sx={muiSwSx} />} />
          <Box sx={{borderBottom:"none"}}><FieldRow label="Active" right={<Switch checked={modalActive} onChange={e=>setModalActive(e.target.checked)} size="small" sx={muiSwSx} />} /></Box>
        </Box>
        <Box sx={{p:"16px 22px",borderTop:`1px solid ${C.bd}`,display:"flex",gap:"10px",background:C.s1}}>
          <ABtn onClick={()=>{showToast("Testing printer...");setModalOpen(false);}}>🖨️ Test Print</ABtn>
          <Button onClick={()=>setModalOpen(false)} sx={{px:"20px",py:"13px",background:C.s2,border:`1.5px solid ${C.bd}`,borderRadius:"14px",color:C.t2,fontFamily:"Plus Jakarta Sans,sans-serif",fontWeight:700,fontSize:14,cursor:"pointer",textTransform:"none","&:hover":{background:C.s3}}}>Cancel</Button>
          <Button onClick={saveModal} variant="contained" sx={{flex:1,py:"13px",background:C.ac,borderRadius:"14px",fontFamily:"Plus Jakarta Sans,sans-serif",fontWeight:800,fontSize:14,textTransform:"none",boxShadow:`0 3px 10px rgba(255,61,1,.28)`,"&:hover":{background:C.ah}}}>💾 Save Printer</Button>
        </Box>
      </Paper>
    </Box>
  );

  const sidebarSx={width:236,background:C.w,borderRight:`1px solid ${C.bd}`,flexShrink:0,p:"14px 8px",overflowY:"auto" as const};
  const contentSx={flex:1,p:"22px 26px",overflowY:"auto" as const,background:C.bg};

  return (
    <Box sx={{fontFamily:"Plus Jakarta Sans,sans-serif",background:C.bg,color:C.tx,minHeight:"100vh",fontSize:14}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
        @keyframes popIn{from{opacity:0;transform:scale(.92) translateY(16px)}to{opacity:1;transform:scale(1) translateY(0)}}
        @keyframes spAnim{0%{width:0;margin-left:0}60%{width:100%;margin-left:0}100%{width:0;margin-left:100%}}
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.8)}}
      `}</style>

      {/* Top Tab Bar */}
      <Box sx={{display:"flex",alignItems:"center",p:"0 20px",height:52,background:C.tx,gap:"10px",boxShadow:"0 2px 14px rgba(0,0,0,.22)",position:"sticky",top:0,zIndex:60}}>
        <Typography sx={{fontSize:13,fontWeight:700,color:"rgba(255,255,255,.7)",letterSpacing:".3px"}}>⚙️ Settings</Typography>
        <Divider orientation="vertical" flexItem sx={{borderColor:"rgba(255,255,255,.15)",mx:"4px",my:"8px"}} />
        <Tabs value={mainTab} onChange={(_,v)=>setMainTab(v as MainTab)} sx={{"& .MuiTabs-indicator":{background:C.ac},"& .MuiTab-root":{color:"rgba(255,255,255,.65)",fontFamily:"Plus Jakarta Sans,sans-serif",fontWeight:700,fontSize:"12.5px",textTransform:"none",minHeight:52,p:"6px 14px"},"& .Mui-selected":{color:"#fff"}}}>
          <Tab value="printers" label="⚙️ Printer Settings" />
          <Tab value="kds" label="🖥️ KDS Settings" />
          <Tab value="led" label="📺 LED Display" />
        </Tabs>
        <Box sx={{flex:1}} />
        <Button onClick={()=>{saveKotSettings();saveBillSettings();saveDirectPrint();savePaperSettings();}} variant="contained" startIcon={<SaveOutlinedIcon />}
          sx={{background:C.ac,borderRadius:"9px",fontFamily:"Plus Jakarta Sans,sans-serif",fontWeight:800,fontSize:13,textTransform:"none",boxShadow:`0 3px 10px rgba(255,61,1,.3)`,"&:hover":{background:C.ah}}}>
          Save All
        </Button>
      </Box>

      {/* PRINTER SETTINGS */}
      {mainTab==="printers"&&(
        <Box sx={{display:"flex",minHeight:"calc(100vh - 52px)"}}>
          <Box sx={sidebarSx}>
            <Typography sx={sbSecSx}>Print Settings</Typography>
            <SbItem icon="👨‍🍳" label="Kitchen Management" active={printerSec==="kitchens"} badge={kitchens.length} onClick={()=>setPrinterSec("kitchens")} />
            <SbItem icon="🖨️" label="Printer Config" active={printerSec==="printer-config"} badge={printers.length} onClick={()=>setPrinterSec("printer-config")} />
            <SbItem icon="📋" label="KOT Settings" active={printerSec==="kot-settings"} onClick={()=>setPrinterSec("kot-settings")} />
            <SbItem icon="🧾" label="Bill Settings" active={printerSec==="bill-settings"} onClick={()=>setPrinterSec("bill-settings")} />
            <SbItem icon="⚡" label="Direct Print" active={printerSec==="directprint"} onClick={()=>setPrinterSec("directprint")} />
            <SbItem icon="📄" label="Paper & Format" active={printerSec==="paper"} onClick={()=>setPrinterSec("paper")} />
            <Typography sx={sbSecSx}>Status</Typography>
            <Box sx={{p:"10px 12px",display:"flex",flexDirection:"column",gap:"7px",fontSize:12}}>
              {printerStatus.map(ps=>(
                <Box key={ps.name} sx={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <Typography sx={{color:C.t2,fontWeight:500,fontSize:12}}>{ps.name}</Typography>
                  <StatusChip status={ps.status} />
                </Box>
              ))}
            </Box>
            <Box sx={{p:"10px 12px",mt:"8px"}}>
              <Button fullWidth onClick={()=>{setPrinterSec("printer-config");showToast("Testing all printers...","info");}} variant="contained"
                sx={{background:C.grn,borderRadius:"10px",fontFamily:"Plus Jakarta Sans,sans-serif",fontWeight:800,fontSize:12,textTransform:"none","&:hover":{background:"#15803d"}}}>
                🔍 Test All Printers
              </Button>
            </Box>
          </Box>
          <Box sx={contentSx}>
            {printerSec==="kitchens"&&renderKitchens()}
            {printerSec==="printer-config"&&renderPrinterConfig()}
            {printerSec==="kot-settings"&&renderKotSettings()}
            {printerSec==="bill-settings"&&renderBillSettings()}
            {printerSec==="directprint"&&renderDirectPrint()}
            {printerSec==="paper"&&renderPaper()}
          </Box>
        </Box>
      )}

      {/* KDS PAGE */}
      {mainTab==="kds"&&(
        <Box sx={{display:"flex",minHeight:"calc(100vh - 52px)"}}>
          <Box sx={sidebarSx}>
            <Typography sx={sbSecSx}>KDS Settings</Typography>
            <SbItem icon="⚙️" label="General" active={kdsSec==="kds-general"} onClick={()=>setKdsSec("kds-general")} />
            <SbItem icon="🖥️" label="Display Layout" active={kdsSec==="kds-display"} onClick={()=>setKdsSec("kds-display")} />
            <SbItem icon="⏱️" label="Timer Settings" active={kdsSec==="kds-timers"} onClick={()=>setKdsSec("kds-timers")} />
            <SbItem icon="📺" label="KDS Screens" active={kdsSec==="kds-screens"} onClick={()=>setKdsSec("kds-screens")} />
          </Box>
          <Box sx={contentSx}>
            {kdsSec==="kds-general"&&renderKdsGeneral()}
            {kdsSec==="kds-display"&&renderKdsDisplay()}
            {kdsSec==="kds-timers"&&renderKdsTimers()}
            {kdsSec==="kds-screens"&&renderKdsScreens()}
          </Box>
        </Box>
      )}

      {/* LED DISPLAY PAGE */}
      {mainTab==="led"&&(
        <Box sx={{display:"flex",minHeight:"calc(100vh - 52px)"}}>
          <Box sx={sidebarSx}>
            <Typography sx={sbSecSx}>LED Banner</Typography>
            <SbItem icon="🖼️" label="Image Management" active={ledSec==="led-images"} onClick={()=>setLedSec("led-images")} />
            <SbItem icon="⚙️" label="Display Settings" active={ledSec==="led-settings"} onClick={()=>setLedSec("led-settings")} />
            <SbItem icon="▶️" label="Live Preview" active={ledSec==="led-preview"} onClick={()=>setLedSec("led-preview")} />
          </Box>
          <Box sx={contentSx}>
            {ledSec==="led-images"&&renderLedImages()}
            {ledSec==="led-settings"&&renderLedSettingsSection()}
            {ledSec==="led-preview"&&renderLedPreview()}
          </Box>
        </Box>
      )}

      {modalOpen&&renderModal()}
    </Box>
  );
}
