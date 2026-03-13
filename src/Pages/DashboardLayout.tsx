import { Box } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import SecondHeader from "../CommonPages/secondheader";
import HamburgerSidebar from "../CommonPages/HamburgerSidebar";
import { useAuth } from "../context/AuthContext";

export default function DashboardLayout({
  children,
  noPad = false,
}: {
  children: React.ReactNode;
  noPad?: boolean;
}) {
  const { branchData } = useAuth();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const offlineLogin = localStorage.getItem("offline_login");
    if (!token && !offlineLogin) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  const orderTypes = useMemo(
    () =>
      (branchData as any)?.data?.order_types?.filter((o: any) => o.is_active === 1) ?? [],
    [branchData],
  );

  const [orderType, setOrderType] = useState<string>("");

  useEffect(() => {
    if (!orderType && orderTypes.length > 0) {
      setOrderType(orderTypes[0].type.replace("_", ""));
    }
  }, [orderTypes, orderType]);

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#F6F6F6",
      }}
    >
      {/* Top header — full width, sticky */}
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 1100,
          flexShrink: 0,
          mb: "10px",
        }}
      >
        <SecondHeader
          orderType={orderType}
          setOrderType={setOrderType}
          ordersCount={0}
          sidebarOpen={!sidebarCollapsed}
          setSidebarOpen={(v: boolean) => setSidebarCollapsed(!v)}
          tables={undefined}
          waiters={undefined}
        />
      </Box>

      {/* Below header: persistent sidebar + content */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          overflow: "hidden",
        }}
      >
        {/* Persistent nav sidebar */}
        <HamburgerSidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed((v) => !v)}
        />

        {/* Main content */}
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            ...(noPad
              ? { overflow: "hidden" }
              : { p: 1.5, overflowY: "auto" }),
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
