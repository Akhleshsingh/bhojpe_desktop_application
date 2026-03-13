import { Box } from "@mui/material";
import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import SecondHeader from "../CommonPages/secondheader";
import HamburgerSidebar from "../CommonPages/HamburgerSidebar";
import { useAuth } from "../context/AuthContext";
import { OrderTypeProvider, useOrderType } from "../context/OrderTypeContext";
import { useState } from "react";

function LayoutInner({
  children,
  noPad = false,
}: {
  children: React.ReactNode;
  noPad?: boolean;
}) {
  const { branchData } = useAuth();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { orderType, setOrderType } = useOrderType();

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

      <Box
        sx={{
          flex: 1,
          display: "flex",
          overflow: "hidden",
        }}
      >
        <HamburgerSidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed((v) => !v)}
        />

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

export default function DashboardLayout({
  children,
  noPad = false,
}: {
  children: React.ReactNode;
  noPad?: boolean;
}) {
  return (
    <OrderTypeProvider>
      <LayoutInner noPad={noPad}>{children}</LayoutInner>
    </OrderTypeProvider>
  );
}
