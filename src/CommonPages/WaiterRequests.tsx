import React, { useState, useCallback, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Chip,
} from "@mui/material";
import NotificationsOffOutlinedIcon from "@mui/icons-material/NotificationsOffOutlined";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import { useAuth } from "../context/AuthContext";

type WaiterRequest = {
  id: number;
  tableId: number;
  tableNumber: string;
  customerName?: string;
  requestedAt: Date;
  attended: boolean;
};

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds} seconds ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
}

export default function WaiterRequests() {
  const { branchData } = useAuth();
  const areas = branchData?.data?.area ?? [];

  const [requests, setRequests] = useState<WaiterRequest[]>([]);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 10000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAttended = useCallback((requestId: number) => {
    setRequests((prev) => prev.filter((r) => r.id !== requestId));
  }, []);

  const totalRequests = requests.filter((r) => !r.attended).length;

  return (
    <Box
      sx={{
        backgroundColor: "#F8FAFC",
        minHeight: "100vh",
        fontFamily: "Poppins, sans-serif",
        p: 3,
      }}
    >
      {/* ── PAGE HEADER ── */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 3,
        }}
      >
        <Typography
          sx={{
            fontSize: 22,
            fontWeight: 700,
            color: "#111827",
            fontFamily: "Poppins, sans-serif",
          }}
        >
          Waiter Requests ({totalRequests})
        </Typography>

        {/* Real Time Update badge */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.7,
            px: 1.5,
            py: 0.5,
            borderRadius: "20px",
            backgroundColor: "#DCFCE7",
            border: "1px solid #BBF7D0",
          }}
        >
          <FiberManualRecordIcon sx={{ fontSize: 8, color: "#16A34A" }} />
          <Typography
            sx={{
              fontSize: 12,
              fontWeight: 600,
              color: "#15803D",
              fontFamily: "Poppins, sans-serif",
            }}
          >
            Real Time Update
          </Typography>
        </Box>
      </Box>

      {/* ── AREAS ── */}
      {areas.length === 0 ? (
        <Box
          sx={{
            backgroundColor: "#FFFFFF",
            borderRadius: "12px",
            border: "1px solid #E5E7EB",
            py: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 1.5,
          }}
        >
          <NotificationsOffOutlinedIcon sx={{ fontSize: 40, color: "#D1D5DB" }} />
          <Typography sx={{ fontSize: 14, color: "#6B7280", fontFamily: "Poppins, sans-serif" }}>
            No areas configured yet.
          </Typography>
        </Box>
      ) : (
        areas.map((area: any) => {
          const tablesCount = area.tables?.length ?? 0;
          const areaRequests = requests.filter(
            (r) => area.tables?.some((t: any) => t.id === r.tableId)
          );

          return (
            <Box key={area.id} sx={{ mb: 4 }}>
              {/* Area header */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  mb: 1.5,
                }}
              >
                <Typography
                  sx={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: "#111827",
                    fontFamily: "Poppins, sans-serif",
                  }}
                >
                  {area.area_name}
                </Typography>

                <Box
                  sx={{
                    px: 1.2,
                    py: 0.2,
                    borderRadius: "6px",
                    backgroundColor: "#F1F5F9",
                    border: "1px solid #E2E8F0",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#64748B",
                      fontFamily: "Poppins, sans-serif",
                    }}
                  >
                    {tablesCount} Table{tablesCount !== 1 ? "s" : ""}
                  </Typography>
                </Box>
              </Box>

              {/* Request cards */}
              {areaRequests.length === 0 ? (
                <Box
                  sx={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: "10px",
                    border: "1px solid #E5E7EB",
                    py: 5,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 1,
                  }}
                >
                  <NotificationsOffOutlinedIcon
                    sx={{ fontSize: 30, color: "#D1D5DB" }}
                  />
                  <Typography
                    sx={{
                      fontSize: 13,
                      color: "#9CA3AF",
                      fontFamily: "Poppins, sans-serif",
                    }}
                  >
                    No waiter request found in this area.
                  </Typography>
                </Box>
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 2,
                  }}
                >
                  {areaRequests.map((req) => (
                    <Box
                      key={req.id}
                      sx={{
                        width: 220,
                        backgroundColor: "#FFFFFF",
                        borderRadius: "10px",
                        border: "1px solid #E5E7EB",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                        p: 1.5,
                        display: "flex",
                        flexDirection: "column",
                        gap: 1.2,
                        transition: "box-shadow .2s",
                        "&:hover": { boxShadow: "0 6px 20px rgba(0,0,0,0.10)" },
                      }}
                    >
                      {/* Table number + time */}
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "flex-start",
                          justifyContent: "space-between",
                        }}
                      >
                        <Box
                          sx={{
                            px: 1.2,
                            py: 0.4,
                            borderRadius: "8px",
                            backgroundColor: "#EEF2FF",
                            border: "1px solid #C7D2FE",
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: 13,
                              fontWeight: 700,
                              color: "#4338CA",
                              fontFamily: "Poppins, sans-serif",
                            }}
                          >
                            {req.tableNumber}
                          </Typography>
                        </Box>

                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          <AccessTimeIcon
                            sx={{ fontSize: 13, color: "#9CA3AF" }}
                          />
                          <Typography
                            sx={{
                              fontSize: 11,
                              color: "#9CA3AF",
                              fontFamily: "Poppins, sans-serif",
                            }}
                          >
                            {timeAgo(req.requestedAt)}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Customer name */}
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.8,
                        }}
                      >
                        <PersonOutlineIcon
                          sx={{ fontSize: 16, color: "#9CA3AF" }}
                        />
                        <Typography
                          sx={{
                            fontSize: 12,
                            color: "#6B7280",
                            fontFamily: "Poppins, sans-serif",
                          }}
                        >
                          {req.customerName || "--"}
                        </Typography>
                      </Box>

                      {/* Action buttons */}
                      <Box sx={{ display: "flex", gap: 0.8, mt: 0.5 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<CheckCircleOutlineIcon sx={{ fontSize: 14 }} />}
                          onClick={() => handleMarkAttended(req.id)}
                          sx={{
                            flex: 1,
                            textTransform: "none",
                            fontSize: 11,
                            fontWeight: 600,
                            fontFamily: "Poppins, sans-serif",
                            borderColor: "#D1D5DB",
                            color: "#374151",
                            borderRadius: "7px",
                            py: 0.6,
                            "&:hover": {
                              borderColor: "#16A34A",
                              color: "#16A34A",
                              backgroundColor: "#F0FDF4",
                            },
                          }}
                        >
                          Mark Attended
                        </Button>

                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<ReceiptLongOutlinedIcon sx={{ fontSize: 14 }} />}
                          sx={{
                            flex: 1,
                            textTransform: "none",
                            fontSize: 11,
                            fontWeight: 600,
                            fontFamily: "Poppins, sans-serif",
                            borderColor: "#D1D5DB",
                            color: "#374151",
                            borderRadius: "7px",
                            py: 0.6,
                            "&:hover": {
                              borderColor: "#2563EB",
                              color: "#2563EB",
                              backgroundColor: "#EFF6FF",
                            },
                          }}
                        >
                          Show Order
                        </Button>
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          );
        })
      )}
    </Box>
  );
}
