import { Box, Typography } from "@mui/material";
import { Button } from "@mui/material";
import Sidebar from "../assets/hamburgericon.png";
import Bhojpeblack from "../assets/mainLogo.png";
import cart from "../assets/image 2.png";
import person from "../assets/image 4.png";
import onlineicon from "../assets/frequency (1).png";
import offlineicon from "../assets/offlineicon.png";
import { useNavigate, useLocation } from "react-router-dom";
import { useMemo } from "react";
import { useNetwork } from "../context/NetworkContext";
import { useOrders } from "../context/OrdersContext";
import image1 from "../assets/image 313.png";
import image2 from "../assets/image 311.png";
import image3 from "../assets/image 310.png";
import image4 from "../assets/image 309.png";
import image5 from "../assets/image 308.png";
import image6 from "../assets/image 307.png";
import { useCustomers } from "../context/CustomerContext.tsx";
import { useTables } from "../context/TablesContext.tsx";

const QUICK_ICONS = [image1, image2, image3, image4, image5, image6];

export default function SecondHeader({
  setOrderType,
  ordersCount: _ordersCount,
  sidebarOpen,
  setSidebarOpen,
  orderType,
  onNewOrder,
}: {
  orderType?: any;
  setOrderType?: (type: any) => void;
  ordersCount: number;
  tables?: any;
  waiters?: any;
  sidebarOpen?: boolean;
  setSidebarOpen?: (v: boolean) => void;
  onNewOrder?: () => void;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isOnline } = useNetwork();
  const { loading, ordersTotal, fetchOrders } = useOrders();
  const { customers, loading: customersLoading } = useCustomers();
  const { tables, loading: tablesLoading } = useTables();

  const isPoss = location.pathname === "/poss";
  const isDashboardFull = location.pathname === "/menudashboard";
  const isMainDashboard = location.pathname === "/dashboard";

  const handleNewKot = () => {
    if (onNewOrder) { onNewOrder(); return; }
    navigate("/poss");
  };

  const handleQuickIconClick = (index: number) => {
    if (index === 0) navigate("/kots");
    else if (index === 1) navigate("/tables");
    else if (index === 2) navigate("/inventory");
  };

  return (
    <Box
      sx={{
        width: "100%",
        backgroundColor: "var(--card-bg)",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      <Box
        sx={{
          height: "70px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          px: 2,
          py: "10px",
          whiteSpace: "nowrap",
          color: "var(--text)",
          backgroundColor: "var(--card-bg)",
          borderBottom: "1px solid #D9D3D3",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            padding: 1,
            color: "var(--text)",
            backgroundColor: "var(--card-bg)",
          }}
        >
          <img
            className="clickable"
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            src={Sidebar}
            alt="Menu"
            style={{ width: 42, cursor: "pointer" }}
            onClick={() => setSidebarOpen?.(!sidebarOpen)}
          />
          <img
            src={Bhojpeblack}
            alt="App Logo"
            style={{ width: 130, cursor: "pointer" }}
            onClick={() => navigate("/tables")}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          />

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              padding: "6px 10px",
            }}
          >
            {/* Orders button */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                cursor: "pointer",
                padding: "6px 10px",
                border: "1px solid #ddd",
                borderRadius: "5px",
                backgroundColor: "#fff",
                "&:hover": { opacity: 0.7 },
              }}
              onClick={() => {
                fetchOrders({
                  page: 1,
                  per_page: 10,
                  waiter_id: "",
                  from_date: "",
                  to_date: "",
                });
                navigate("/orders", { replace: true });
              }}
              className="clickable"
            >
              <img src={cart} alt="Cart" style={{ width: 22 }} />
              <Typography
                sx={{ fontSize: 12, fontWeight: 700, color: "#9CAB84" }}
              >
                {loading ? "…" : ordersTotal}
              </Typography>
            </Box>

            {/* Reservations */}
            <Box
              onClick={() => navigate("/reservations")}
              className="clickable"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                cursor: "pointer",
                padding: "6px 10px",
                border: "1px solid #ddd",
                borderRadius: "5px",
                backgroundColor: "#fff",
                "&:hover": { opacity: 0.7 },
              }}
            >
              <img src={person} alt="Profile" style={{ width: 22 }} />
              <Typography
                sx={{ fontSize: 12, fontWeight: 700, color: "#9CAB84" }}
              >
                {customersLoading ? "…" : customers.length}
              </Typography>
            </Box>

            {/* Tables */}
            <Box
              className="clickable"
              onClick={() => navigate("/tables")}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                cursor: "pointer",
                padding: "6px 10px",
                border: "1px solid #ddd",
                borderRadius: "5px",
                backgroundColor: "#fff",
                "&:hover": { opacity: 0.7 },
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="7" width="20" height="3" rx="1.5" fill="#9CAB84"/>
                <rect x="4" y="10" width="2.5" height="7" rx="1.2" fill="#9CAB84"/>
                <rect x="17.5" y="10" width="2.5" height="7" rx="1.2" fill="#9CAB84"/>
                <rect x="3" y="5" width="18" height="2.5" rx="1.2" fill="#b8c8a4"/>
              </svg>
              <Typography
                sx={{ fontSize: 12, fontWeight: 700, color: "#9CAB84" }}
              >
                {tablesLoading ? "…" : tables.length}
              </Typography>
            </Box>

            {/* All KOT Button */}
            <Button
              onClick={() => navigate("/kots")}
              sx={{
                backgroundColor: "#fff",
                color: "#FF3D01",
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 600,
                fontSize: "13px",
                borderRadius: "6px",
                padding: "6px 16px",
                textTransform: "none",
                whiteSpace: "nowrap",
                border: "1.5px solid #FF3D01",
                boxShadow: "none",
                "&:hover": { backgroundColor: "#FFF0EE", boxShadow: "none" },
              }}
              variant="outlined"
            >
              All KOT
            </Button>

            {/* New Order Button */}
            <Button
              onClick={handleNewKot}
              sx={{
                backgroundColor: "#FF3D01",
                color: "#fff",
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 600,
                fontSize: "13px",
                borderRadius: "6px",
                padding: "6px 16px",
                textTransform: "none",
                whiteSpace: "nowrap",
                boxShadow: "none",
                "&:hover": { backgroundColor: "#e63500", boxShadow: "none" },
              }}
              variant="contained"
            >
              New Order
            </Button>
          </Box>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2, px: 1.5 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              flexWrap: "nowrap",
            }}
          >
            {QUICK_ICONS.map((img, index) => (
              <img
                className="clickable"
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                key={index}
                src={img}
                alt={`icon-${index}`}
                onClick={() => handleQuickIconClick(index)}
                style={{
                  cursor: "pointer",
                  width: 34,
                  height: 34,
                  objectFit: "contain",
                  flexShrink: 0,
                }}
              />
            ))}
          </Box>

          <img
            src={isOnline ? onlineicon : offlineicon}
            alt={isOnline ? "Online" : "Offline"}
            style={{ width: 38, height: 38, flexShrink: 0 }}
          />
        </Box>
      </Box>

    </Box>
  );
}
