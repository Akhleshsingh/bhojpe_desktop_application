import { Box, Typography, Collapse, Popover, Divider } from "@mui/material";
import { useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import FmdGoodIcon from "@mui/icons-material/FmdGood";
import KeyboardArrowDownOutlinedIcon from "@mui/icons-material/KeyboardArrowDownOutlined";
import StoreIcon from "@mui/icons-material/Store";
import LocationOnIcon from "@mui/icons-material/LocationOn";

import dashboardicon from "../assets/image 359.png";
import posicon from "../assets/image 357.png";
import deliveryExecIcon from "../assets/image 358 (1).png";
import ordersIcon from "../assets/ordernumber.png";
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
const EXPANDED_W = 220;
const COLLAPSED_W = 56;

const STATIC_MENU_ITEMS: MenuItem[] = [
  { label: "Dashboard", icon: dashboardicon, path: "/main-dashboard" },
  { label: "POS", icon: posicon, path: "/menudashboard" },
  { label: "Orders", icon: ordersIcon, path: "/ordershistory" },
  { label: "Delivery Executive", icon: deliveryExecIcon, path: "/delivery-executives" },
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
  {
    label: "Settings",
    icon: kitchenIcon,
    children: [
      { label: "Printer Settings", path: "/printer-settings" },
    ],
  },
];

type Props = {
  open?: boolean;
  onClose?: () => void;
  collapsed?: boolean;
  onToggle?: () => void;
};

export default function HamburgerSidebar({ collapsed = false, onToggle }: Props) {
  const { logout, branchData } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Branch popover
  const [branchAnchorEl, setBranchAnchorEl] = useState<HTMLElement | null>(null);
  const branchPopoverOpen = Boolean(branchAnchorEl);

  const branch = (branchData as any)?.data;
  const restaurant = branch?.restaurant;
  const branchName: string = branch?.name ?? "Branch";

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
        width: collapsed ? COLLAPSED_W : EXPANDED_W,
        flexShrink: 0,
        backgroundColor: "#FFFFFF",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        borderRight: "1px solid #E5E7EB",
        overflowY: "auto",
        overflowX: "hidden",
        fontFamily: "Poppins, sans-serif",
        transition: "width 0.22s ease",
        "&::-webkit-scrollbar": { width: 4 },
        "&::-webkit-scrollbar-thumb": { backgroundColor: "#D1D5DB", borderRadius: 2 },
      }}
    >
      {/* Branch / location row */}
      <Box
        sx={{
          px: collapsed ? 0 : 2,
          py: 1.4,
          display: "flex",
          alignItems: "center",
          gap: 1,
          borderBottom: "1px solid #E5E7EB",
          flexShrink: 0,
          cursor: "pointer",
          justifyContent: collapsed ? "center" : "flex-start",
          "&:hover": { backgroundColor: "#F9FAFB" },
        }}
        onClick={(e) => setBranchAnchorEl(e.currentTarget)}
      >
        <FmdGoodIcon sx={{ color: "#22C55E", fontSize: 20, flexShrink: 0 }} />
        {!collapsed && (
          <>
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
          </>
        )}
      </Box>

      {/* Branch info popover */}
      <Popover
        open={branchPopoverOpen}
        anchorEl={branchAnchorEl}
        onClose={() => setBranchAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        PaperProps={{
          sx: {
            width: 260,
            borderRadius: "10px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            p: 0,
            overflow: "hidden",
          },
        }}
      >
        {/* Restaurant header */}
        <Box sx={{ backgroundColor: ACTIVE_BG, px: 2, py: 1.5 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#FFF", fontFamily: "Poppins, sans-serif" }}>
            {restaurant?.name ?? "Restaurant"}
          </Typography>
          <Typography sx={{ fontSize: 11, color: "rgba(255,255,255,0.85)", fontFamily: "Poppins, sans-serif", mt: 0.3 }}>
            {restaurant?.email ?? ""}
          </Typography>
        </Box>

        {/* Branch detail */}
        <Box sx={{ px: 2, py: 1.5 }}>
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1, mb: 1 }}>
            <StoreIcon sx={{ fontSize: 16, color: "#6B7280", mt: 0.2, flexShrink: 0 }} />
            <Box>
              <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#111827", fontFamily: "Poppins, sans-serif" }}>
                {branchName}
              </Typography>
              <Typography sx={{ fontSize: 11, color: "#6B7280", fontFamily: "Poppins, sans-serif" }}>
                Current Branch
              </Typography>
            </Box>
          </Box>

          {restaurant?.address && (
            <>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                <LocationOnIcon sx={{ fontSize: 16, color: "#22C55E", mt: 0.2, flexShrink: 0 }} />
                <Typography sx={{ fontSize: 12, color: "#374151", fontFamily: "Poppins, sans-serif", lineHeight: 1.5 }}>
                  {restaurant.address}
                </Typography>
              </Box>
            </>
          )}

          {restaurant?.phone_number && (
            <>
              <Divider sx={{ my: 1 }} />
              <Typography sx={{ fontSize: 12, color: "#374151", fontFamily: "Poppins, sans-serif" }}>
                📞 +{restaurant.phone_code} {restaurant.phone_number}
              </Typography>
            </>
          )}
        </Box>
      </Popover>

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
                title={collapsed ? item.label : undefined}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: collapsed ? 0 : 1.5,
                  px: collapsed ? 0 : 2,
                  py: 1.15,
                  cursor: "pointer",
                  justifyContent: collapsed ? "center" : "flex-start",
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
                {!collapsed && (
                  <>
                    <Typography
                      sx={{
                        fontSize: 14,
                        fontWeight: active ? 600 : 500,
                        color: active ? "#FFFFFF" : "#111827",
                        fontFamily: "Poppins, sans-serif",
                        flex: 1,
                        lineHeight: 1.4,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {item.label}
                    </Typography>
                    {hasChildren && (
                      isExpanded
                        ? <KeyboardArrowDownIcon sx={{ fontSize: 17, color: active ? "#FFF" : "#9CA3AF" }} />
                        : <KeyboardArrowRightIcon sx={{ fontSize: 17, color: active ? "#FFF" : "#9CA3AF" }} />
                    )}
                  </>
                )}
              </Box>

              {/* Sub-items — only when expanded */}
              {!collapsed && hasChildren && (
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

      {/* Collapse toggle button */}
      <Box
        onClick={onToggle}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "flex-end",
          px: collapsed ? 0 : 1.5,
          py: 1,
          borderTop: "1px solid #E5E7EB",
          cursor: "pointer",
          flexShrink: 0,
          "&:hover": { backgroundColor: "#F3F4F6" },
        }}
      >
        {collapsed
          ? <ChevronRightIcon sx={{ fontSize: 18, color: "#6B7280" }} />
          : (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <ChevronLeftIcon sx={{ fontSize: 18, color: "#6B7280" }} />
              <Typography sx={{ fontSize: 12, color: "#9CA3AF", fontFamily: "Poppins, sans-serif" }}>
                Collapse
              </Typography>
            </Box>
          )}
      </Box>

      {/* Customer Site — only when expanded */}
      {!collapsed && (
        <Box sx={{ px: 2, py: 1.2, borderTop: "1px solid #E5E7EB", flexShrink: 0 }}>
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
      )}
    </Box>
  );
}
