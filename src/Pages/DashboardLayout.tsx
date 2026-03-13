import { Box } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../CommonPages/header";
import SecondHeader from "../CommonPages/secondheader";
import HamburgerSidebar from "../CommonPages/HamburgerSidebar";
import { useAuth } from "../context/AuthContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { branchData } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const offlineLogin = localStorage.getItem("offline_login");

    if (!token && !offlineLogin) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  const orderTypes = useMemo(
    () =>
      branchData?.data?.order_types?.filter((o: any) => o.is_active === 1) ??
      [],
    [branchData],
  );

  // ✅ default from backend
  const [orderType, setOrderType] = useState<string>("");

  useEffect(() => {
    if (!orderType && orderTypes.length > 0) {
      setOrderType(orderTypes[0].type.replace("_", ""));
    }
  }, [orderTypes, orderType]);

  return (
    <Box
      sx={{
        height: "100vh", // 🔥 fixed viewport height
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#F6F6F6",
      }}
    >
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 1100,
          flexShrink: 0,
        }}
      >
        <SecondHeader
          orderType={orderType}
          setOrderType={setOrderType}
          ordersCount={0}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          tables={undefined}
          waiters={undefined}
        />
      </Box>
      <Box
        sx={{
          flex: 1,
          display: "flex",
          overflow: "hidden",
        }}
      >
        {/* Sidebar */}
        <HamburgerSidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <Box
          sx={{
            flex: 1,
            p: 1,
            transition: "margin-left 0.3s ease",
            marginLeft: sidebarOpen ? "280px" : "0px",
            overflowY: "auto", // 🔥 scroll only here
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
