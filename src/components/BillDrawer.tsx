import { BASE_URL } from "../utils/api";
import React from "react";
import {
  Drawer,
  Box,
  Typography,
  Button,
  IconButton,
  FormControl,
  Select,
  MenuItem,
} from "@mui/material";
import dayjs from "dayjs";
import assigntable from "../assets/image 314 (1).png";
import Deleteicon from "../assets/deleteicon.png";
import ordericon from "../assets//image 328 (1).png";
import ordericon2 from "../assets/image 329 (1).png";
import ordericon3 from "../assets/image 330 (2).png";
import ordericon4 from '../assets/image 331 (1).png';
import ordericon5 from '../assets/image 332 (1).png';
import type { OrderStatusResponse } from "./orderStatusapi";

type PaymentOption = {
  value: string;
  label: string;
};
const DEFAULT_ORDER_STATUSES: OrderStatusResponse[] = [
  { key: "placed", label: "Placed" },
  { key: "confirmed", label: "Confirmed" },
  { key: "preparing", label: "Preparing" },
  { key: "out_for_delivery", label: "Out for delivery" },
  { key: "delivered", label: "Delivered" },
];
type BillDrawerProps = {
  billDrawerOpen: boolean;
  setBillDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;

  billedOrderData: any;
  drawerItems: any[];
  drawerCustomer: any;

  orderStatusUI: any[];
  drawerNextStatus: string | null;

  moveDrawerToNextStep: () => void;
  handleDrawerPrint: () => void;
  handleDeleteDrawerItem: (item: any) => void;

  PAYMENT_OPTIONS: PaymentOption[];

  token: string | null;

  setCustomerModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setCheckoutOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setCheckoutOrder: React.Dispatch<React.SetStateAction<any>>;
saveNewOrder: (token: string | null, action: string) => void;
  showError: (msg: string) => void;
};

const BillDrawer: React.FC<BillDrawerProps> = ({
  billDrawerOpen,
  setBillDrawerOpen,
  billedOrderData,
  drawerItems,
  drawerCustomer,
  orderStatusUI,
  drawerNextStatus,
  moveDrawerToNextStep,
  handleDrawerPrint,
  handleDeleteDrawerItem,
  PAYMENT_OPTIONS,
  token,
  setCustomerModalOpen,
  setCheckoutOpen,
  setCheckoutOrder,
  showError,saveNewOrder
}) => {
    const SummaryRow = ({ label, value }: { label: string; value: any }) => (
  <Box display="flex" justifyContent="space-between" mt={0.5}>
    <Typography fontSize={13}>{label}</Typography>
    <Typography fontSize={13} fontWeight={600}>
      {value}
    </Typography>
  </Box>
);
      const hasKot =
    billedOrderData?.kot && billedOrderData?.kot.length > 0;
    const isPaid =
  billedOrderData?.payment_status === "paid" ||
  Number(billedOrderData?.amount_paid || 0) >=
  Number(billedOrderData?.total || 0);
const isBilled =
  billedOrderData?.order_status === "billed" ||
  billedOrderData?.status === "billed";
  return (
   <Drawer
     anchor="right"
     open={billDrawerOpen}
     onClose={(event, reason) => {
       if (reason === "backdropClick") return;
       if (reason === "escapeKeyDown") return;
     }}
   PaperProps={{
     sx: {
       width: 720,
       background: "#F9FAFB",   
       display: "flex",
       flexDirection: "column",
       boxShadow: "none",
     },
     }}
   >
     <Box
       sx={{
      background: "#FFFFFF",
   borderBottom: "1px solid #E6E6E6",
   padding: "20px 24px",
       }}
     >
       <Box display="flex" justifyContent="space-between" alignItems="flex-start">
         <Box display="flex" flexDirection="column" gap={0.5}>
           <Typography fontWeight={700} fontSize={18}>
             Order #{billedOrderData?.order_number}
           </Typography>
   
          <Box display="flex" alignItems="center" gap={1}>
     <Typography fontSize={13} fontWeight={600}>
       {billedOrderData?.order_type?.order_type_name}
     </Typography>
   
     {billedOrderData?.order_type?.slug === "dine_in" && (
       <Typography
         sx={{
           fontSize: 12,
           fontWeight: 600,
           color: "#374151",
           background: "#F3F4F6",
           px: 1,
           py: 0.3,
           borderRadius: "4px",
         }}
       >
         Pax {billedOrderData?.number_of_pax || 1}
       </Typography>
     )}
   </Box>
   
           <Typography fontSize={12} color="#6B7280">
             {dayjs(billedOrderData?.created_at).format(
               "DD/MM/YYYY hh:mm A"
             )}
           </Typography>
   
           <Box
     onClick={() => setCustomerModalOpen(true)}
     sx={{
       cursor: "pointer",
       mt: 1,
     }}
   >
     <Typography fontSize={12} color="#6B7280">
       Customer
     </Typography>
   
     <Typography
       fontSize={13}
       fontWeight={600}
       color={drawerCustomer ? "#111827" : "#9CA3AF"}
     >
       {drawerCustomer?.name || "+ Add Customer"}
     </Typography>
   </Box>
           {billedOrderData?.order_type?.slug === "delivery" && (
             <>
               <Typography fontSize={12} color="#6B7280" mt={1}>
                 Delivery Executive
               </Typography>
               <Typography fontSize={13} fontWeight={600}>
                 {billedOrderData?.delivery_executive?.name || "Not Assigned"}
               </Typography>
             </>
           )}
   
          {billedOrderData?.order_type?.slug === "dine_in" && (
     <>
       <Typography fontSize={13} fontWeight={600}>
         Table {billedOrderData?.table?.table_code}
       </Typography>
   
       {billedOrderData?.waiter?.name && (
         <>
           <Typography fontSize={12} color="#6B7280" mt={1}>
             Waiter
           </Typography>
           <Typography fontSize={13} fontWeight={600}>
             {billedOrderData.waiter.name}
           </Typography>
         </>
       )}
     </>
   )}
   {billedOrderData?.order_type?.slug === "pickup" &&
     billedOrderData?.pickup_date && (
       <>
         <Typography fontSize={12} color="#6B7280" mt={1}>
           Pickup Time
         </Typography>
         <Typography fontSize={13} fontWeight={600}>
           {dayjs(billedOrderData.pickup_date).format("DD MMM, hh:mm A")}
         </Typography>
       </>
   )}
         </Box>
   
         {/* RIGHT SIDE STATUS */}
         <Box display="flex" gap={1}>
           <Box
             sx={{
               px: 1.5,
               py: 0.5,
               borderRadius: "6px",
               fontSize: 11,
               fontWeight: 700,
               backgroundColor:
                 billedOrderData?.amount_paid > 0
                   ? "#DCFCE7"
                   : "#FEF3C7",
               color:
                 billedOrderData?.amount_paid > 0
                   ? "#15803D"
                   : "#92400E",
             }}
           >
             {billedOrderData?.amount_paid > 0 ? "PAID" : "BILLED"}
           </Box>
   
           <Box
             sx={{
               px: 1.5,
               py: 0.5,
               borderRadius: "6px",
               fontSize: 11,
               fontWeight: 700,
               backgroundColor: "#E0E7FF",
               color: "#3730A3",
             }}
           >
             POS
           </Box>
         </Box>
       </Box>
     </Box>
     <Box
       sx={{
         p: 3,
         background: "#FFFFFF",
         borderBottom: "1px solid #E5E7EB",
       }}
     >
   <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
     <Typography fontWeight={700} fontSize={14}>
       Set Order Status
     </Typography>
   
     <Box
       sx={{
         px: 1.5,
         py: 0.5,
         borderRadius: "6px",
         background: "#E0E7FF",
         color: "#3730A3",
         fontSize: 12,
         fontWeight: 600,
         textTransform: "capitalize",
       }}
     >
       {billedOrderData?.order_status?.replace(/_/g, " ")}
     </Box>
   </Box>
       <Box display="flex" justifyContent="space-between">
         {orderStatusUI.map((s, i) => {
           const currentIndex = orderStatusUI.findIndex(
             (x) => x.key === billedOrderData?.order_status
           );
   
           const isCompleted = i < currentIndex;
           const isCurrent = i === currentIndex;
   
           return (
             <Box key={s.key} textAlign="center" flex={1}>
             <Box
  sx={{
    width: 44,
    height: 44,
    borderRadius: "50%",
    margin: "0 auto",
    backgroundColor:
      isCompleted || isCurrent ? "#111827" : "#E5E7EB",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }}
>
  <img
    src={s.icon}
    alt={s.label}
    style={{
      width: 22,
      height: 22,
      filter: isCompleted || isCurrent ? "invert(1)" : "none",
    }}
  />
</Box>
   
               <Typography
                 fontSize={11}
                 mt={1}
                 fontWeight={isCurrent ? 700 : 500}
                 color={isCurrent ? "#111827" : "#6B7280"}
               >
                 {s.label}
               </Typography>
             </Box>
           );
         })}
       </Box>
   
       {drawerNextStatus && (
         <Box textAlign="right" mt={3}>
           <Button
             variant="outlined"
             size="small"
             onClick={moveDrawerToNextStep}
             sx={{
               textTransform: "none",
               fontSize: 12,
               borderColor: "#111827",
               color: "#111827",
             }}
           >
             Move to {drawerNextStatus.replace(/_/g, " ")} →
           </Button>
         </Box>
       )}
     </Box>
   {!hasKot && (
     <Box
       sx={{
         mx: 3,
         mt: 3,
         p: 1,
         border: "1px solid #FECACA",
         background: "#FEF2F2",
         display: "flex",
         justifyContent: "space-between",
         alignItems: "center",
         borderLeft: "2px solid #DC2626",
       }}
     >
       <Box>
         <Typography fontSize={13} fontWeight={700} color="#DC2626">
           No Kitchen Order Ticket
         </Typography>
   
         <Typography fontSize={12} color="#7F1D1D">
           This order has no KOT. Create one to send it to the kitchen.
         </Typography>
       </Box>
   
       <Button
         variant="contained"
         onClick={() => saveNewOrder(token, "kot")}
         sx={{
           bgcolor: "#111827",
           textTransform: "none",
           fontSize: 12,
           fontWeight: 600,
         }}
       >
         + Create KOT
       </Button>
     </Box>
   )}
     <Box
       sx={{
         px: 3,
         py: 2,
         mt: 3,
         background: "#F9FAFB",
         borderBottom: "1px solid #E5E7EB",
       }}
     >
       <Box
         display="grid"
         gridTemplateColumns="1.6fr 0.6fr 0.8fr 0.8fr"
         fontSize={12}
         fontWeight={700}
         color="#6B7280"
       >
         <Typography>Item</Typography>
         <Typography textAlign="center">Qty</Typography>
         <Typography textAlign="right">Price</Typography>
         <Typography textAlign="right">Amount</Typography>
       </Box>
     </Box>
   
    <Box px={3}>
     {drawerItems?.map((item: { name: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; qty: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; price: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; }, idx: React.Key | null | undefined) => (
       <Box
         key={idx}
         display="grid"
         gridTemplateColumns="1.5fr 0.5fr 0.7fr 0.7fr 40px"
         py={1.5}
         borderBottom="1px solid #F1F5F9"
         fontSize={13}
         alignItems="center"
         bgcolor= "#F9FAFB"
       >
         <Typography>{item.name}</Typography>
   
         <Typography textAlign="center">
           {item.qty}
         </Typography>
   
         <Typography textAlign="right">
           ₹{item.price}
         </Typography>
   
         <Typography textAlign="right">
           ₹{item.qty * item.price}
         </Typography>
   
         {/* DELETE ICON */}
         <Box textAlign="right">
           <IconButton
             size="small"
             onClick={() => handleDeleteDrawerItem(item)}
             sx={{
               color: "#DC2626",
               "&:hover": {
                 background: "#FEE2E2",
               },
             }}
           >
            <img
         src={Deleteicon}
         style={{
           width: 18,
           height: 18,
         }}
       />
           </IconButton>
         </Box>
       </Box>
     ))}
   </Box>
     <Box
       sx={{
         p: 3,
         background: "#FFFFFF",
         borderTop: "1px solid #E5E7EB",
         mt: "auto",
       }}
     >
       <SummaryRow label="Items" value={drawerItems.length} />
       <SummaryRow
         label="Sub Total"
         value={`₹${billedOrderData?.sub_total}`}
       />
       <SummaryRow
         label="GST (5%)"
         value={`₹${billedOrderData?.total_tax_amount}`}
       />
   
       <Box display="flex" justifyContent="space-between" mt={1.5}>
         <Typography fontWeight={700}>Total</Typography>
         <Typography fontWeight={700}>
           ₹{billedOrderData?.total}
         </Typography>
       </Box>
   
   <Box mt={2}>
     <Typography fontWeight={600} mb={1}>
       Payments
     </Typography>
     {billedOrderData?.payment_status !== "paid" &&
     Number(billedOrderData?.amount_paid || 0) <= 0 ? (
       <Button
         fullWidth
         variant="contained"
         sx={{
           bgcolor: "#16A34A",
           mb: 2,
           textTransform: "none",
           fontWeight: 700,
           fontSize: 14,
           "&:hover": {
             bgcolor: "#15803D",
           },
         }}
         onClick={() => {
           setCheckoutOrder(billedOrderData);
           setCheckoutOpen(true);
         }}
       >
      + Add Payment
       </Button>
     ) : billedOrderData?.payments?.length > 0 ? (
       billedOrderData.payments.map((p: any, idx: number) => (
         <Box
           key={idx}
           display="flex"
           justifyContent="space-between"
           fontSize={13}
           mb={0.5}
           alignItems="center"
         >
           <FormControl size="small" sx={{ minWidth: 130 }}>
             <Select
               value={p.payment_method || ""}
               onChange={async (e) => {
                 const newMethod = e.target.value;
   
                 try {
                   const res = await fetch(
                     `${BASE_URL}/update-order-payment`,
                     {
                       method: "POST",
                       headers: {
                         Authorization: `Bearer ${token}`,
                         "Content-Type": "application/json",
                       },
                       body: JSON.stringify({
                         order_id: billedOrderData.id,
                         payment_id: p.id,
                         payment_method: newMethod,
                       }),
                     }
                   );
   
                   const data = await res.json();
   
                   if (data.status) {
                     setBilledOrderData((prev: any) => ({
                       ...prev,
                       payments: prev.payments.map((pay: any) =>
                         pay.id === p.id
                           ? { ...pay, payment_method: newMethod }
                           : pay
                       ),
                     }));
                   } else {
                     showError("Failed to update payment method");
                   }
                 } catch (err) {
                   showError("Payment method update failed");
                 }
               }}
               sx={{ fontSize: 12, height: 32 }}
             >
               {PAYMENT_OPTIONS.map((option) => (
                 <MenuItem key={option.value} value={option.value}>
                   {option.label}
                 </MenuItem>
               ))}
             </Select>
           </FormControl>
   
           <Typography>₹{p.amount}</Typography>
         </Box>
       ))
   
     ) : billedOrderData?.payment ? (
   
       /* 🔥 CASE 3: SINGLE PAYMENT */
       <Box
         display="flex"
         justifyContent="space-between"
         fontSize={13}
       >
         <Typography sx={{ textTransform: "capitalize" }}>
           {billedOrderData.payment?.payment_method}
         </Typography>
   
         <Typography>
           ₹{billedOrderData.payment?.amount}
         </Typography>
       </Box>
   
     ) : (
       <Typography fontSize={12} color="#999">
         No payments recorded
       </Typography>
     )}
   </Box>
     </Box>
   {isPaid && (
<Box display="grid" gridTemplateColumns="repeat(3,1fr)" gap={1}>

<Button variant="outlined" onClick={handleDrawerPrint}>
Print
</Button>

<Button variant="contained" sx={{ bgcolor: "#DC2626" }}>
Cancel
</Button>

<Button
variant="outlined"
onClick={() => setBillDrawerOpen(false)}
>
Close
</Button>

</Box>
)}

{!isPaid && (
<Box display="grid" gridTemplateColumns="repeat(4,1fr)" gap={1}>

<Button variant="outlined" onClick={handleDrawerPrint}>
Print
</Button>

<Button variant="contained" sx={{ bgcolor: "#DC2626" }}>
Cancel
</Button>

<Button variant="contained" sx={{ bgcolor: "#EF4444" }}>
Delete
</Button>

<Button
variant="outlined"
onClick={() => setBillDrawerOpen(false)}
>
Close
</Button>

</Box>
)}
   <Box p={2} borderTop="1px solid #E5E7EB" bgcolor="#fff">
     {/* EXISTING BUTTONS */}
     {/* <Box display="grid" gridTemplateColumns="repeat(4,1fr)" gap={1}>
       <Button variant="outlined" onClick={handleDrawerPrint}>
         Print
       </Button>
   
       <Button variant="contained" sx={{ bgcolor: "#DC2626" }}>
         Cancel
       </Button>
   
       <Button variant="contained" sx={{ bgcolor: "#EF4444" }}>
         Delete
       </Button>
   
       <Button
         variant="outlined"
         onClick={() => setBillDrawerOpen(false)}
       >
         Close
       </Button>
     </Box> */}
   </Box>
   </Drawer>
  );
};

export default BillDrawer;