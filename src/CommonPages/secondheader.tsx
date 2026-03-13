import { Box, Typography } from "@mui/material";
import { Button } from "@mui/material";
import Sidebar from "../assets/hamburgericon.png";
import Bhojpeblack from "../assets/mainLogo.png";
import cart from "../assets/image 2.png";
import person from "../assets/image 4.png";
import waiter from "../assets/image 8.png";
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
import OrderTypeSwitcher from "../CommonPages/OrderTypeSwitcher.tsx";
import { useWaiters } from "../context/WaitersContext.tsx";

const QUICK_ICONS = [image1, image2, image3, image4, image5, image6];

export default function SecondHeader({
  setOrderType,
  ordersCount: _ordersCount,
  sidebarOpen,
  setSidebarOpen,
  orderType,
}: {
  orderType: string;
  setOrderType: (type: string) => void;
  ordersCount: number;
  tables?: any;
  waiters?: any;
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isOnline } = useNetwork();
  const { loading, ordersTotal, fetchOrders } = useOrders();
  const { customers, loading: customersLoading } = useCustomers();
  const { waiters = [], loading: waitersLoading } = useWaiters();

  const isDashboardFull = location.pathname === "/menudashboard";
  const isMainDashboard = location.pathname === "/main-dashboard";
  const isTableView = location.pathname === "/dashboard";
  const isOrder = location.pathname === "/ordershistory";
  const isMyOrder = location.pathname === "/myorders";
  const isNewOrder = location.pathname === "/neworders";

  const isOrderHistory = isOrder;
  const isWaiterPage = location.pathname === "/waiters";
  const isCustomerPage = location.pathname === "/customers";

  const hideOrderControls = useMemo(
    () => isMainDashboard || isOrderHistory || isWaiterPage || isCustomerPage,
    [isMainDashboard, isOrderHistory, isWaiterPage, isCustomerPage],
  );

  const handleNewKot = () => {
    navigate("/menudashboard", {});
  };

  const handleQuickIconClick = (index: number) => {
    if (index === 0) navigate("/kitchens/all-kitchens-kot");
    else if (index === 1) navigate("/dashboard");
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
            onClick={() => setSidebarOpen(!sidebarOpen)}
          />
          <img
            src={Bhojpeblack}
            alt="App Logo"
            style={{ width: 130, cursor: "pointer" }}
            onClick={() => navigate("/dashboard")}
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
                navigate("/ordershistory", { replace: true });
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

            {/* Waiters */}
            <Box
              className="clickable"
              onClick={() => navigate("/waiters")}
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
              <img src={waiter} alt="Waiter" style={{ width: 22 }} />
              <Typography
                sx={{ fontSize: 12, fontWeight: 700, color: "#9CAB84" }}
              >
                {waitersLoading ? "…" : waiters.length}
              </Typography>
            </Box>

            {/* New Order Button */}
            <Button
              onClick={handleNewKot}
              sx={{
                backgroundColor: "#E8353A",
                color: "#fff",
                fontFamily: "Poppins, sans-serif",
                fontWeight: 600,
                fontSize: "13px",
                borderRadius: "6px",
                padding: "6px 16px",
                textTransform: "none",
                whiteSpace: "nowrap",
                boxShadow: "none",
                "&:hover": { backgroundColor: "#C62828", boxShadow: "none" },
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

      {!isMainDashboard && !isDashboardFull && (
        <Box
          sx={{
            height: "auto",
            py: "10px",
            backgroundColor: "var(--card-bg)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2,
            borderTop: "1px solid #E5E5E5",
          }}
        >
          <Typography sx={{ fontSize: 16, fontWeight: 600 }}>
            {isTableView ? "Table View" : isOrder ? "Order" : ""}
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
            {!hideOrderControls && (
              <OrderTypeSwitcher
                activeType={orderType}
                onSelect={(type) => {
                  setOrderType(type);
                  navigate("/menudashboard");
                }}
                isTableView={false}
              />
            )}
            {isOrder && (
              <Button
                onClick={handleNewKot}
                style={{
                  backgroundColor: "#5A7863",
                  border: "none",
                  borderRadius: "5px",
                  padding: "6px 16px",
                  fontWeight: 600,
                  height: 36,
                  whiteSpace: "nowrap",
                  color: "#fff",
                }}
              >
                + New Order
              </Button>
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
}
