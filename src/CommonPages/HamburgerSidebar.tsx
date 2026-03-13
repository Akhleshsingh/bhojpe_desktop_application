import { Box, Typography, Collapse } from "@mui/material";
import { useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import FmdGoodIcon from "@mui/icons-material/FmdGood";
import KeyboardArrowDownOutlinedIcon from "@mui/icons-material/KeyboardArrowDownOutlined";

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
import customerSiteIcon from "../assets/image 368.png";
import passkeyicon from "../assets/image 224.png";

import { useAuth } from "../context/AuthContext";

type SubItem = { label: string; path: string };
type MenuItem =
  | { label: string; icon: string; path: string; children?: undefined; action?: undefined }
  | { label: string; icon: string; children: SubItem[]; path?: undefined; action?: undefined }
  | { label: string; icon: string; action: () => Promise<void>; path?: undefined; children?: undefined };

const ACTIVE_BG = "#E8353A";

const STATIC_MENU_ITEMS: MenuItem[] = [
  { label: "Dashboard", icon: dashboardicon, path: "/main-dashboard" },
  { label: "POS", icon: posicon, path: "/menudashboard" },
  { label: "Operations", icon: operationsicon, path: "/operations" },
  { label: "Waiter Requests", icon: waiterreq, path: "/waiter-requests" },
  { label: "Reservations", icon: reservicon, path: "/reservations" },
  { label: "Customers", icon: customerIcon, path: "/customers" },
  { label: "Staff", icon: stafficon, path: "/staff" },
  {
    label: "Payments",
    icon: paymentIcon,
    children: [
      { label: "Payments", path: "/payments" },
      { label: "Due Payments", path: "/due-payments" },
    ],
  },
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
  {
    label: "Security",
    icon: passkeyicon,
    children: [
      { label: "Set Passkey", path: "/set-passkey" },
      { label: "Reset Passkey", path: "/reset-passkey" },
    ],
  },
  { label: "Updates", icon: updateIcon, path: "/updates" },
];

type Props = {
  open?: boolean;
  onClose?: () => void;
};

export default function HamburgerSidebar(_props: Props) {
  const { logout, branchData } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const branchName: string = (branchData as any)?.data?.name ?? "Branch";

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
    () => [...STATIC_MENU_ITEMS, { label: "Logout", icon: logoutIcon, action: handleLogout }],
    [handleLogout],
  );

  const isItemActive = (item: MenuItem): boolean => {
    if (item.path) return location.pathname === item.path;
    if (item.children) return item.children.some((c) => location.pathname === c.path);
    return false;
  };

  const isSubItemActive = (path: string) => location.pathname === path;

  const handleClick = (item: MenuItem) => {
    if (item.children) {
      setOpenDropdown(openDropdown === item.label ? null : item.label);
    } else if (item.action) {
      item.action();
    } else if (item.path) {
      navigate(item.path);
    }
  };

  return (
    <Box
      sx={{
        width: 220,
        flexShrink: 0,
        backgroundColor: "#FFFFFF",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        borderRight: "1px solid #E5E7EB",
        overflowY: "auto",
        overflowX: "hidden",
        fontFamily: "Poppins, sans-serif",
        "&::-webkit-scrollbar": { width: 4 },
        "&::-webkit-scrollbar-thumb": { backgroundColor: "#D1D5DB", borderRadius: 2 },
      }}
    >
      {/* Branch / location row */}
      <Box
        sx={{
          px: 2,
          py: 1.4,
          display: "flex",
          alignItems: "center",
          gap: 1,
          borderBottom: "1px solid #E5E7EB",
          flexShrink: 0,
          cursor: "pointer",
          "&:hover": { backgroundColor: "#F9FAFB" },
        }}
      >
        <FmdGoodIcon sx={{ color: "#22C55E", fontSize: 20, flexShrink: 0 }} />
        <Typography
          sx={{
            fontSize: 13,
            fontWeight: 600,
            color: "#1F2937",
            fontFamily: "Poppins, sans-serif",
            flex: 1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {branchName}
        </Typography>
        <KeyboardArrowDownOutlinedIcon sx={{ fontSize: 17, color: "#6B7280", flexShrink: 0 }} />
      </Box>

      {/* Navigation items */}
      <Box sx={{ flex: 1, py: 0.5 }}>
        {menuItems.map((item) => {
          const active = isItemActive(item);
          const hasChildren = Boolean(item.children);
          const isExpanded = openDropdown === item.label;

          return (
            <Box key={item.label}>
              <Box
                onClick={() => handleClick(item)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  px: 2,
                  py: 1.15,
                  cursor: "pointer",
                  backgroundColor: active ? ACTIVE_BG : "transparent",
                  transition: "background 0.12s",
                  "&:hover": {
                    backgroundColor: active ? ACTIVE_BG : "#F3F4F6",
                  },
                }}
              >
                <img
                  src={item.icon}
                  alt={item.label}
                  style={{
                    width: 20,
                    height: 20,
                    objectFit: "contain",
                    flexShrink: 0,
                    filter: active
                      ? "brightness(0) invert(1)"
                      : "brightness(0) saturate(0) opacity(0.6)",
                  }}
                />
                <Typography
                  sx={{
                    fontSize: 14,
                    fontWeight: active ? 600 : 500,
                    color: active ? "#FFFFFF" : "#111827",
                    fontFamily: "Poppins, sans-serif",
                    flex: 1,
                    lineHeight: 1.4,
                  }}
                >
                  {item.label}
                </Typography>
                {hasChildren && (
                  isExpanded
                    ? <KeyboardArrowDownIcon sx={{ fontSize: 17, color: active ? "#FFF" : "#9CA3AF" }} />
                    : <KeyboardArrowRightIcon sx={{ fontSize: 17, color: active ? "#FFF" : "#9CA3AF" }} />
                )}
              </Box>

              {/* Sub-items */}
              {hasChildren && (
                <Collapse in={isExpanded} timeout={160}>
                  <Box sx={{ backgroundColor: "#F9FAFB" }}>
                    {item.children!.map((sub) => {
                      const subActive = isSubItemActive(sub.path);
                      return (
                        <Box
                          key={sub.label}
                          onClick={() => navigate(sub.path)}
                          sx={{
                            px: 4,
                            py: 0.85,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            backgroundColor: subActive ? "#FEF2F2" : "transparent",
                            "&:hover": { backgroundColor: subActive ? "#FEF2F2" : "#F3F4F6" },
                          }}
                        >
                          <Box
                            sx={{
                              width: 5,
                              height: 5,
                              borderRadius: "50%",
                              backgroundColor: subActive ? ACTIVE_BG : "#9CA3AF",
                              flexShrink: 0,
                            }}
                          />
                          <Typography
                            sx={{
                              fontSize: 13,
                              fontWeight: subActive ? 600 : 400,
                              color: subActive ? ACTIVE_BG : "#374151",
                              fontFamily: "Poppins, sans-serif",
                            }}
                          >
                            {sub.label}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>
                </Collapse>
              )}
            </Box>
          );
        })}
      </Box>

      {/* Customer Site */}
      <Box sx={{ px: 2, py: 1.5, borderTop: "1px solid #E5E7EB", flexShrink: 0 }}>
        <Box
          onClick={() => window.open("https://demo.bhojpe.in/", "_blank")}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            px: 2,
            py: 0.9,
            border: "1px solid #E5E7EB",
            borderRadius: "8px",
            cursor: "pointer",
            backgroundColor: "#F9FAFB",
            "&:hover": { backgroundColor: "#F3F4F6" },
          }}
        >
          <img
            src={customerSiteIcon}
            alt="Customer Site"
            style={{ width: 20, height: 20, objectFit: "contain" }}
          />
          <Typography
            sx={{
              fontSize: 13,
              fontWeight: 500,
              color: "#374151",
              fontFamily: "Poppins, sans-serif",
            }}
          >
            Customer Site
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
