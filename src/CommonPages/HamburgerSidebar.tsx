import { Box, Typography } from "@mui/material";
import { useState, useMemo } from "react";
import dashboardicon from "../assets/image 359.png";
import posicon from "../assets/image 357.png";
import operationsicon from "../assets/image 234 (1).png";
import waiterreq from "../assets/image 235 (1).png";
import reservicon from "../assets/image 360.png";
import stafficon from "../assets/staff.png";
import customerIcon from "../assets/image 261.png";
import paymentIcon from "../assets/image 363 (1).png";
import waiterIcon from "../assets/image 362 (1).png";
import reportsIcon from "../assets/image 364.png";
import kitchenIcon from "../assets/image 365.png";
import updateIcon from "../assets/image 366.png";
import logoutIcon from "../assets/image 367.png";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Dropdown from "react-bootstrap/Dropdown";
import customerSiteIcon from "../assets/image 368.png";
import passkeyicon from "../assets/image 224.png";

type SubItem = { label: string; path: string };

type MenuItem =
  | {
      label: string;
      icon: string;
      path: string;
      children?: undefined;
      action?: undefined;
    }
  | {
      label: string;
      icon: string;
      children: SubItem[];
      path?: undefined;
      action?: undefined;
    }
  | {
      label: string;
      icon: string;
      action: () => Promise<void>;
      path?: undefined;
      children?: undefined;
    };

type Props = {
  open: boolean;
  onClose: () => void;
};

// Static menu structure — typed explicitly to satisfy discriminated union
const STATIC_MENU_ITEMS: MenuItem[] = [
  { label: "Dashboard", icon: dashboardicon, path: "/main-dashboard" },
  { label: "POS", icon: posicon, path: "/menudashboard" },
  { label: "Operations", icon: operationsicon, path: "/operations" },
  { label: "Waiter Requests", icon: waiterreq, path: "/waiter-requests" },
  { label: "Reservations", icon: reservicon, path: "/reservations" },
  { label: "Staff", icon: stafficon, path: "/staff" },
  {
    label: "Security",
    icon: passkeyicon,
    children: [
      { label: "Set Passkey", path: "/set-passkey" },
      { label: "Reset Passkey", path: "/reset-passkey" },
    ],
  },
  {
    label: "Payment",
    icon: paymentIcon,
    children: [
      { label: "Payments", path: "/payments" },
      { label: "Due Payments", path: "/due-payments" },
    ],
  },
  { label: "Customers", icon: customerIcon, path: "/customers" },
  { label: "Waiter", icon: waiterIcon, path: "/waiters" },
  { label: "Reports", icon: reportsIcon, path: "/reports" },
  {
    label: "Kitchens",
    icon: kitchenIcon,
    children: [
      { label: "Kitchen Settings", path: "/kitchens" },
      { label: "All Kitchen KOT", path: "/kitchens/all-kitchens-kot" },
      { label: "Default Kitchen", path: "/kitchens/default" },
      { label: "Non Veg Kitchen", path: "/kitchens/non-veg" },
      { label: "Veg Kitchen", path: "/kitchens/veg" },
      { label: "QSR", path: "/kitchens/qsr" },
    ],
  },
  { label: "Settings", icon: stafficon, path: "/staff" },
  { label: "Updates", icon: updateIcon, path: "/updates" },
];

export default function HamburgerSidebar({ open }: Props) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState<string>("Dashboard");
  const { branchData } = useAuth();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const handleLogout = useMemo(
    () => async () => {
      localStorage.removeItem("branchData");
      localStorage.removeItem("menuItems");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      await logout();
      navigate("/");
    },
    [logout, navigate],
  );

  const menuItems = useMemo<MenuItem[]>(
    () => [
      ...STATIC_MENU_ITEMS,
      { label: "Logout", icon: logoutIcon, action: handleLogout },
    ],
    [handleLogout],
  );

  const handleNavigate = (
    label: string,
    path?: string,
    action?: () => void,
  ) => {
    setActiveMenu(label);
    if (action) action();
    if (path) navigate(path);
  };

  return (
    <Box
      sx={{
        position: "fixed",
        left: 0,
        width: 260,
        maxHeight: "90vh",
        backgroundColor: "#FFFFFF",
        borderRight: "1px solid #E5E7EB",
        transform: open ? "translateX(0)" : "translateX(-100%)",
        transition: "transform 0.3s ease",
        padding: "14px 12px",
        overflowY: "auto",
      }}
    >
      <Box sx={{ mb: 2 }}>
        <Dropdown>
          <Dropdown.Toggle
            variant="light"
            style={{
              width: "100%",
              border: "1px solid #E0E0E0",
              padding: "10px 12px",
              backgroundColor: "#FFFFFF",
              fontSize: "12px",
            }}
          >
            {branchData?.data?.name ?? "Choose Branch"}
          </Dropdown.Toggle>
        </Dropdown>
      </Box>

      <Box>
        {menuItems.map((item) => {
          const isOpen = openDropdown === item.label;
          const isActive = activeMenu === item.label;

          return (
            <Box key={item.label}>
              <Box
                onClick={() => {
                  if (item.children) {
                    setOpenDropdown(isOpen ? null : item.label);
                  } else {
                    handleNavigate(item.label, item.path, item.action);
                  }
                }}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 10px",
                  cursor: "pointer",
                  borderRadius: "6px",
                  backgroundColor: isActive ? "#374151" : "transparent",
                  color: isActive ? "#FFFFFF" : "#374151",
                  fontWeight: 500,
                  "&:hover": {
                    backgroundColor: isActive ? "#374151" : "#F3F4F6",
                  },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <img
                    src={item.icon}
                    style={{
                      width: 22,
                      filter: isActive ? "brightness(0) invert(1)" : "none",
                    }}
                  />
                  <Typography
                    sx={{
                      fontSize: "15px",
                      color: isActive ? "#FFFFFF" : "#000000",
                    }}
                  >
                    {item.label}
                  </Typography>
                </Box>

                {item.children && (
                  <Typography sx={{ fontSize: 12 }}>
                    {isOpen ? "▾" : "▸"}
                  </Typography>
                )}
              </Box>

              {item.children && isOpen && (
                <Box
                  sx={{
                    pl: 4,
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                    mb: 1,
                  }}
                >
                  {item.children.map((sub) => {
                    const isSubActive = activeMenu === sub.label;

                    return (
                      <Box
                        key={sub.label}
                        onClick={() => handleNavigate(sub.label, sub.path)}
                        sx={{
                          padding: "7px 6px",
                          fontSize: "14px",
                          cursor: "pointer",
                          borderRadius: "6px",
                          backgroundColor: isSubActive
                            ? "#374151"
                            : "transparent",
                          color: isSubActive ? "#FFFFFF" : "#4B5563",
                          "&:hover": {
                            backgroundColor: isSubActive
                              ? "#374151"
                              : "#F3F4F6",
                          },
                        }}
                      >
                        {sub.label}
                      </Box>
                    );
                  })}
                </Box>
              )}
            </Box>
          );
        })}
      </Box>

      <Box
        sx={{
          mt: 3,
          height: 50,
          backgroundColor: "#F0F0F0",
          display: "flex",
          alignItems: "center",
          gap: 2,
          padding: "0 14px",
          cursor: "pointer",
          "&:hover": { backgroundColor: "#F9FAFB" },
        }}
        onClick={() => window.open("https://demo.bhojpe.in/", "_blank")}
      >
        <img src={customerSiteIcon} width={30} />
        <Typography>Customer Site</Typography>
      </Box>
    </Box>
  );
}
