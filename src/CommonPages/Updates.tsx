import React, { useState } from "react";
import {
  Box, Typography, Chip, Accordion, AccordionSummary,
  AccordionDetails, Divider, Badge,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import NewReleasesOutlinedIcon from "@mui/icons-material/NewReleasesOutlined";
import BugReportOutlinedIcon from "@mui/icons-material/BugReportOutlined";
import AutoFixHighOutlinedIcon from "@mui/icons-material/AutoFixHighOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import RocketLaunchOutlinedIcon from "@mui/icons-material/RocketLaunchOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";

const FONT = "'Plus Jakarta Sans', sans-serif";
const RED = "#FF3D01";

type ChangeType = "new" | "fixed" | "improved" | "security" | "removed";

interface ChangeItem {
  type: ChangeType;
  text: string;
}

interface VersionEntry {
  version: string;
  date: string;
  label?: string;
  summary: string;
  changes: ChangeItem[];
}

const CHANGE_META: Record<
  ChangeType,
  { label: string; bg: string; color: string; icon: React.ReactNode }
> = {
  new: {
    label: "New",
    bg: "#F0FDF4",
    color: "#15803D",
    icon: <NewReleasesOutlinedIcon sx={{ fontSize: 13 }} />,
  },
  fixed: {
    label: "Fixed",
    bg: "#EFF6FF",
    color: "#2563EB",
    icon: <BugReportOutlinedIcon sx={{ fontSize: 13 }} />,
  },
  improved: {
    label: "Improved",
    bg: "#FFFBEB",
    color: "#D97706",
    icon: <AutoFixHighOutlinedIcon sx={{ fontSize: 13 }} />,
  },
  security: {
    label: "Security",
    bg: "#FFF1F2",
    color: "#BE123C",
    icon: <SecurityOutlinedIcon sx={{ fontSize: 13 }} />,
  },
  removed: {
    label: "Removed",
    bg: "#F3F4F6",
    color: "#6B7280",
    icon: <CheckCircleOutlineIcon sx={{ fontSize: 13 }} />,
  },
};

const RELEASES: VersionEntry[] = [
  {
    version: "2.4.0",
    date: "March 13, 2026",
    label: "Latest",
    summary: "Major performance upgrade with Axios + Redux + React Query architecture, real-time offline order sync, and order type state sharing across the dashboard.",
    changes: [
      { type: "new", text: "Axios HTTP client with auto auth-token injection and 401 session redirect" },
      { type: "new", text: "Redux Toolkit store — auth slice, cart slice, and offline order queue with retry tracking" },
      { type: "new", text: "React Query integration — all server data cached with staleTime, background refetch, and refetchOnReconnect" },
      { type: "new", text: "Offline order queue: orders placed offline are auto-synced when internet reconnects" },
      { type: "new", text: "React Query DevTools visible in development mode for cache inspection" },
      { type: "improved", text: "OrderTypeContext: order type selection now synced between header buttons and OrderPanel — 'Change Branch' fix" },
      { type: "improved", text: "All 15 hardcoded API URLs replaced with centralized BASE_URL from utils/api" },
      { type: "improved", text: "Staff page role select auto-selects first role on load; MUI out-of-range warnings resolved" },
      { type: "fixed", text: "Multi-line console.log orphan lines left after sed cleanup in Dashboard and OrderPanel" },
      { type: "fixed", text: "OrderTypeSwitcher MUI Select out-of-range warning with displayEmpty + placeholder item" },
      { type: "security", text: "Auth token automatically cleared from localStorage on 401 Unauthorized response" },
    ],
  },
  {
    version: "2.3.0",
    date: "February 18, 2026",
    summary: "MUI-only premium redesign of StaffPage, Orders History, and Customers page with consistent brand styling.",
    changes: [
      { type: "new", text: "StaffPage fully redesigned with MUI — dark gradient header, role color chips, paginated grid table" },
      { type: "new", text: "Orders History page: date range filter, waiter filter, status filter, and live search" },
      { type: "new", text: "Customers page redesigned with inline add-customer drawer and phone lookup" },
      { type: "improved", text: "Poppins font applied globally across all redesigned pages" },
      { type: "improved", text: "Table pattern standardised: #F9FAFB header, alternating rows, #F0F9FF hover, red active pagination" },
      { type: "improved", text: "Showing 'X to Y of Z results' pagination label on all data tables" },
      { type: "fixed", text: "Staff drawer closing on outside click in some browsers" },
    ],
  },
  {
    version: "2.2.1",
    date: "January 30, 2026",
    summary: "Hotfix release addressing React Router warnings, MUI Select edge cases, and console noise reduction.",
    changes: [
      { type: "fixed", text: "React Router future flags v7_startTransition and v7_relativeSplatPath added to silence console warnings" },
      { type: "fixed", text: "64 console.log / console.error / console.warn statements removed from production build" },
      { type: "fixed", text: "OrderTypeSwitcher 'More Channels' default value causing MUI Select out-of-range warning" },
      { type: "improved", text: "ProtectedRoute simplified — redirects unauthenticated users to login without flash" },
    ],
  },
  {
    version: "2.2.0",
    date: "December 20, 2025",
    summary: "Dashboard and KOT panel visual overhaul with offline awareness indicator and sound alerts.",
    changes: [
      { type: "new", text: "Offline mode indicator in top header — toggleable for testing offline scenarios" },
      { type: "new", text: "Sound alert on new incoming KOT ticket" },
      { type: "new", text: "KOT page with real-time polling and status update controls" },
      { type: "improved", text: "Dashboard stats cards redesigned with chart integration via Recharts" },
      { type: "improved", text: "OrderPanel menu category tab scroll — supports unlimited categories without overflow" },
      { type: "fixed", text: "Bill drawer print layout misalignment on narrow screens" },
      { type: "fixed", text: "Duplicate Split type declaration in CheckoutModal causing TypeScript error" },
    ],
  },
  {
    version: "2.1.0",
    date: "November 10, 2025",
    summary: "Delivery management module, waiter request system, and table reservation flow added.",
    changes: [
      { type: "new", text: "Delivery Executives page — status tracking and assignment per order" },
      { type: "new", text: "Waiter request panel — staff can raise table service requests from POS" },
      { type: "new", text: "Table reservation system with time-slot and guest count management" },
      { type: "improved", text: "Tables page redesigned with visual floor plan grid" },
      { type: "improved", text: "Inventory context lazy-loads item data to reduce initial page load time" },
      { type: "fixed", text: "Customer context race condition when branch ID changes mid-session" },
      { type: "removed", text: "Legacy jQuery date picker dependency removed (replaced with MUI DatePicker)" },
    ],
  },
  {
    version: "2.0.0",
    date: "October 1, 2025",
    summary: "Full application rewrite from Class components to React 18 functional components with TypeScript.",
    changes: [
      { type: "new", text: "Complete codebase rewrite in React 18 + TypeScript + Vite" },
      { type: "new", text: "HashRouter-based routing for static hosting compatibility" },
      { type: "new", text: "Multi-context architecture: Auth, Customer, Inventory, KOT, Orders, Tables, Waiters" },
      { type: "new", text: "MUI v6 as primary UI library with brand #FF3D01 theming" },
      { type: "new", text: "Vite proxy configuration to forward /api/v1 to bhojpe.in backend" },
      { type: "improved", text: "Login page with passcode support and 'Remember me' option" },
      { type: "improved", text: "Print receipt component with thermal-printer-optimised layout" },
      { type: "security", text: "JWT token stored securely; removed from URL parameters" },
    ],
  },
];

const TypeChip = ({ type }: { type: ChangeType }) => {
  const meta = CHANGE_META[type];
  return (
    <Chip
      label={meta.label}
      icon={meta.icon as any}
      size="small"
      sx={{
        fontFamily: FONT,
        fontSize: 11,
        fontWeight: 600,
        height: 22,
        px: 0.5,
        bgcolor: meta.bg,
        color: meta.color,
        border: `1px solid ${meta.color}22`,
        "& .MuiChip-icon": { color: meta.color, ml: "5px" },
      }}
    />
  );
};

const ChangeList = ({ changes }: { changes: ChangeItem[] }) => (
  <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
    {changes.map((c, i) => (
      <Box key={i} sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
        <TypeChip type={c.type} />
        <Typography
          sx={{ fontFamily: FONT, fontSize: 13.5, color: "#374151", lineHeight: 1.6, flex: 1 }}
        >
          {c.text}
        </Typography>
      </Box>
    ))}
  </Box>
);

const countByType = (changes: ChangeItem[]) => {
  const counts: Partial<Record<ChangeType, number>> = {};
  changes.forEach((c) => { counts[c.type] = (counts[c.type] || 0) + 1; });
  return counts;
};

export default function Updates() {
  const [expanded, setExpanded] = useState<string | false>(false);
  const latest = RELEASES[0];
  const previous = RELEASES.slice(1);

  return (
    <Box sx={{ bgcolor: "#f5f0ea", minHeight: "100vh", fontFamily: FONT, p: { xs: 2, md: 3 } }}>
      <Box sx={{ maxWidth: 820, mx: "auto" }}>

        {/* Page Header */}
        <Box sx={{ mb: 3.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.5 }}>
            <RocketLaunchOutlinedIcon sx={{ color: RED, fontSize: 26 }} />
            <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: 22, color: "#111827" }}>
              What's New in BhojPe
            </Typography>
          </Box>
          <Typography sx={{ fontFamily: FONT, fontSize: 13.5, color: "#6B7280" }}>
            Release notes, improvements, and bug fixes across all versions.
          </Typography>
        </Box>

        {/* Latest Version Card */}
        <Box
          sx={{
            borderRadius: 3,
            overflow: "hidden",
            boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
            mb: 3,
            border: `1.5px solid ${RED}22`,
          }}
        >
          {/* Card Header */}
          <Box
            sx={{
              background: "linear-gradient(135deg, #1F2937 0%, #374151 100%)",
              px: 3,
              py: 2.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 1.5,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Badge
                badgeContent="LATEST"
                sx={{
                  "& .MuiBadge-badge": {
                    bgcolor: RED,
                    color: "#fff",
                    fontFamily: FONT,
                    fontWeight: 700,
                    fontSize: 9,
                    px: 0.8,
                    top: -2,
                    right: -38,
                    borderRadius: 1,
                    height: 18,
                  },
                }}
              >
                <Typography
                  sx={{ fontFamily: FONT, fontWeight: 700, fontSize: 22, color: "#fff", pr: 4 }}
                >
                  v{latest.version}
                </Typography>
              </Badge>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
                <CalendarTodayOutlinedIcon sx={{ fontSize: 13, color: "#9CA3AF" }} />
                <Typography sx={{ fontFamily: FONT, fontSize: 12.5, color: "#D1D5DB" }}>
                  {latest.date}
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.6,
                  bgcolor: "#15803D22",
                  border: "1px solid #15803D55",
                  borderRadius: 2,
                  px: 1.2,
                  py: 0.4,
                }}
              >
                <CheckCircleOutlineIcon sx={{ fontSize: 13, color: "#4ADE80" }} />
                <Typography sx={{ fontFamily: FONT, fontSize: 12, fontWeight: 600, color: "#4ADE80" }}>
                  You're up to date
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Summary */}
          <Box sx={{ bgcolor: "#fff", px: 3, pt: 2.5, pb: 1 }}>
            <Typography
              sx={{
                fontFamily: FONT,
                fontSize: 13.5,
                color: "#4B5563",
                fontStyle: "italic",
                borderLeft: `3px solid ${RED}`,
                pl: 1.5,
                mb: 2.5,
                lineHeight: 1.7,
              }}
            >
              {latest.summary}
            </Typography>

            {/* Type summary badges */}
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2.5 }}>
              {(Object.entries(countByType(latest.changes)) as [ChangeType, number][]).map(
                ([type, count]) => {
                  const m = CHANGE_META[type];
                  return (
                    <Box
                      key={type}
                      sx={{
                        bgcolor: m.bg,
                        border: `1px solid ${m.color}33`,
                        borderRadius: 2,
                        px: 1.2,
                        py: 0.3,
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                      }}
                    >
                      <Box sx={{ color: m.color, display: "flex", alignItems: "center" }}>
                        {m.icon}
                      </Box>
                      <Typography sx={{ fontFamily: FONT, fontSize: 12, fontWeight: 600, color: m.color }}>
                        {count} {m.label}
                      </Typography>
                    </Box>
                  );
                }
              )}
            </Box>

            <Divider sx={{ mb: 2.5 }} />
            <ChangeList changes={latest.changes} />
          </Box>

          <Box sx={{ bgcolor: "#fff", px: 3, pb: 2.5 }} />
        </Box>

        {/* Previous Versions */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <HistoryOutlinedIcon sx={{ fontSize: 18, color: "#6B7280" }} />
          <Typography sx={{ fontFamily: FONT, fontWeight: 600, fontSize: 14, color: "#6B7280" }}>
            Previous Releases
          </Typography>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {previous.map((release) => {
            const counts = countByType(release.changes);
            const isOpen = expanded === release.version;
            return (
              <Accordion
                key={release.version}
                expanded={isOpen}
                onChange={() => setExpanded(isOpen ? false : release.version)}
                disableGutters
                elevation={0}
                sx={{
                  borderRadius: "12px !important",
                  border: "1.5px solid",
                  borderColor: isOpen ? `${RED}33` : "#E5E7EB",
                  overflow: "hidden",
                  transition: "border-color 0.2s",
                  "&:before": { display: "none" },
                  boxShadow: isOpen ? "0 4px 16px rgba(0,0,0,0.06)" : "none",
                }}
              >
                <AccordionSummary
                  expandIcon={
                    <ExpandMoreIcon
                      sx={{ color: isOpen ? RED : "#9CA3AF", fontSize: 20 }}
                    />
                  }
                  sx={{
                    bgcolor: isOpen ? "#FFF5F5" : "#fff",
                    px: 2.5,
                    py: 0.5,
                    minHeight: 60,
                    transition: "background-color 0.2s",
                    "&:hover": { bgcolor: isOpen ? "#FFF5F5" : "#F9FAFB" },
                    "& .MuiAccordionSummary-content": {
                      display: "flex",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: 1.5,
                    },
                  }}
                >
                  {/* Version + date */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flex: 1 }}>
                    <Box
                      sx={{
                        bgcolor: isOpen ? RED : "#F3F4F6",
                        color: isOpen ? "#fff" : "#374151",
                        fontFamily: FONT,
                        fontWeight: 700,
                        fontSize: 13,
                        px: 1.5,
                        py: 0.4,
                        borderRadius: 1.5,
                        transition: "all 0.2s",
                        minWidth: 60,
                        textAlign: "center",
                      }}
                    >
                      v{release.version}
                    </Box>
                    <Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <CalendarTodayOutlinedIcon sx={{ fontSize: 11, color: "#9CA3AF" }} />
                        <Typography sx={{ fontFamily: FONT, fontSize: 12, color: "#9CA3AF" }}>
                          {release.date}
                        </Typography>
                      </Box>
                      <Typography
                        sx={{
                          fontFamily: FONT,
                          fontSize: 13,
                          color: "#374151",
                          fontWeight: 500,
                          lineHeight: 1.4,
                          display: { xs: "none", sm: "block" },
                        }}
                      >
                        {release.summary.length > 80
                          ? release.summary.slice(0, 80) + "…"
                          : release.summary}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Type count chips */}
                  <Box sx={{ display: "flex", gap: 0.8, flexWrap: "wrap" }}>
                    {(Object.entries(counts) as [ChangeType, number][]).map(([type, count]) => {
                      const m = CHANGE_META[type];
                      return (
                        <Box
                          key={type}
                          sx={{
                            bgcolor: m.bg,
                            border: `1px solid ${m.color}33`,
                            borderRadius: 1.5,
                            px: 0.9,
                            py: 0.2,
                            display: "flex",
                            alignItems: "center",
                            gap: 0.4,
                          }}
                        >
                          <Box sx={{ color: m.color, display: "flex", alignItems: "center" }}>
                            {m.icon}
                          </Box>
                          <Typography sx={{ fontFamily: FONT, fontSize: 11, fontWeight: 600, color: m.color }}>
                            {count}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>
                </AccordionSummary>

                <AccordionDetails sx={{ bgcolor: "#fff", px: 3, pt: 2, pb: 2.5 }}>
                  <Typography
                    sx={{
                      fontFamily: FONT,
                      fontSize: 13,
                      color: "#4B5563",
                      fontStyle: "italic",
                      borderLeft: `3px solid #E5E7EB`,
                      pl: 1.5,
                      mb: 2,
                      lineHeight: 1.7,
                    }}
                  >
                    {release.summary}
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <ChangeList changes={release.changes} />
                </AccordionDetails>
              </Accordion>
            );
          })}
        </Box>

        {/* Footer note */}
        <Box sx={{ mt: 4, mb: 2, textAlign: "center" }}>
          <Typography sx={{ fontFamily: FONT, fontSize: 12, color: "#9CA3AF" }}>
            BhojPe POS · All versions shown above. Contact support@bhojpe.com for issues.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
