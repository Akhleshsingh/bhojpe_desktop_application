import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  IconButton
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AddKitchenDrawer from "./AddKitchenDrawer";
import { useAuth } from "../context/AuthContext";
import ManageKitchenItemsModal from "./ManageKitchenItemsModal";
type KitchenItem = {
  id: number;
  name: string;
  price: number;
};

type Kitchen = {
  id: number;
  name: string;
  type: string;
  printer: string;
  active: boolean;
  items: KitchenItem[];
};

const kitchensData: Kitchen[] = [
  {
    id: 1,
    name: "Default Kitchen",
    type: "Food",
    printer: "Default Thermal Printer",
    active: true,
    items: [
      { id: 1, name: "Cold Coffee", price: 70 },
      { id: 2, name: "Vanilla Shake", price: 100 },
      { id: 3, name: "Mango Shake", price: 110 },
      { id: 4, name: "Vanilla Strawberry Shake", price: 120 }
    ]
  },
  {
    id: 2,
    name: "Non Veg Kitchen",
    type: "Non Veg Kitchen",
    printer: "Non Veg Kitchen Printer",
    active: true,
    items: [
      { id: 1, name: "Chocolate Shake", price: 100 },
      { id: 2, name: "Veg Chilli Dry", price: 180 },
      { id: 3, name: "Veg Kofte", price: 190 }
    ]
  },
  {
    id: 3,
    name: "Veg Kitchen",
    type: "Veg Kitchen",
    printer: "Veg Kitchen Printer",
    active: true,
    items: [
      { id: 1, name: "Masala Tea", price: 50 },
      { id: 2, name: "Lemon Tea", price: 50 },
      { id: 3, name: "Hot Coffee", price: 50 }
    ]
  }
];

export default function Kitchens() {
const { branchData } = useAuth();
const kitchens = branchData?.data?.kot_places || [];
const areas = branchData?.data?.area ?? [];
const [manageOpen,setManageOpen] = useState(false);
  const [search,setSearch] = useState("");
  const [showAddKitchen,setShowAddKitchen] = useState(false);

  return (

<Box sx={{p:3, background:"#F9FAFB", minHeight:"100vh"}}>

{/* HEADER */}

<Box
sx={{
display:"flex",
justifyContent:"space-between",
alignItems:"center",
mb:3
}}
>

<Typography sx={{fontSize:22,fontWeight:700}}>
Kitchens
</Typography>

<Button
variant="contained"
sx={{
background:"#BA3131",
textTransform:"none",
fontWeight:600,
"&:hover":{background:"#9f2929"}
}}
onClick={()=>setShowAddKitchen(true)}
>
Add Kitchen
</Button>

</Box>


{/* SEARCH */}

<Box sx={{mb:3}}>

<TextField
fullWidth
placeholder="Search for menu items..."
value={search}
onChange={(e)=>setSearch(e.target.value)}
InputProps={{
startAdornment:<SearchIcon sx={{mr:1,color:"#9CA3AF"}}/>
}}
sx={{
background:"#fff",
borderRadius:"6px"
}}
/>

</Box>


<Box
sx={{
display:"grid",
gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",
gap:2
}}
>

{kitchens.map((kitchen:any)=> (

<Box
key={kitchen.id}
sx={{
background:"#fff",
border:"1px solid #E5E7EB",
borderRadius:"10px",
p:2,
display:"flex",
flexDirection:"column"
}}
>

{/* HEADER */}

<Box
sx={{
display:"flex",
justifyContent:"space-between",
alignItems:"center",
mb:1
}}
>

<Box>

<Typography sx={{fontWeight:700,fontSize:15}}>
{kitchen.name}
</Typography>

<Typography sx={{fontSize:13,color:"#6B7280"}}>
{kitchen.type}
</Typography>

</Box>


<Box sx={{display:"flex",alignItems:"center",gap:0.5}}>

<CheckCircleIcon
sx={{
fontSize:16,
color:kitchen.is_active ? "#22C55E" : "#9CA3AF"
}}
/>

<Typography sx={{fontSize:13}}>
{kitchen.is_active ? "Active" : "Inactive"}
</Typography>

</Box>

</Box>


{/* PRINTER */}

<Typography
sx={{
fontSize:13,
color:"#6B7280",
mb:1
}}
>
🖨 Default Thermal Printer • 0 items
</Typography>


{/* ITEMS HEADER */}

<Box
sx={{
display:"flex",
justifyContent:"space-between",
alignItems:"center",
mb:1
}}
>

<Typography sx={{fontWeight:600}}>
Kitchen Items
</Typography>

<Button
size="small"
variant="outlined"
sx={{textTransform:"none"}}
onClick={()=>setManageOpen(true)}
>
+ Manage Menu Items
</Button>

</Box>


{/* EMPTY STATE */}

<Box sx={{flex:1}}>

<Typography sx={{fontSize:13,color:"#9CA3AF"}}>
No items assigned
</Typography>

</Box>


{/* FOOTER */}

<Box
sx={{
display:"flex",
justifyContent:"space-between",
mt:2
}}
>

<Button
size="small"
variant="outlined"
startIcon={<EditOutlinedIcon/>}
sx={{textTransform:"none"}}
>
Edit
</Button>


<IconButton sx={{color:"#EF4444"}}>
<DeleteOutlineOutlinedIcon/>
</IconButton>

</Box>

</Box>

))}

</Box>
<ManageKitchenItemsModal
open={manageOpen}
onClose={()=>setManageOpen(false)}
/>

<AddKitchenDrawer
show={showAddKitchen}
onClose={()=>setShowAddKitchen(false)}
/>

</Box>

);
}