import React, { useState } from "react";
import { Box, Typography, Button, TextField, Chip } from "@mui/material";
import Dropdown from "react-bootstrap/Dropdown";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";

type Reservation = {
  id: number;
  table?: string;
  guests: number;
  date: string;
  time: string;
  name: string;
  email: string;
  phone: string;
  status: "Confirmed" | "Pending";
};

const dummyReservations: Reservation[] = [
  {
    id: 1,
    table: "T-3",
    guests: 2,
    date: "Sunday, 25 Jan",
    time: "01:00 PM",
    name: "datscvjvkvbkbl",
    email: "fy@gmail.com",
    phone: "+919999999999",
    status: "Confirmed",
  },
  {
    id: 2,
    guests: 2,
    date: "Sunday, 25 Jan",
    time: "06:00 PM",
    name: "akhleshsisjdj",
    email: "akhlesh@gmail.com",
    phone: "+916260129453",
    status: "Pending",
  },
];

export default function Reservations() {
  const [statusMap, setStatusMap] = useState<Record<number, string>>({});

  const handleStatusChange = (id: number, status: string) => {
    setStatusMap((prev) => ({ ...prev, [id]: status }));
  };

  return (
    <Box sx={{ padding: 3, backgroundColor: "#F9FAFB", minHeight: "100vh" }}>
      {/* TITLE */}
      <Typography sx={{ fontSize: 22, fontWeight: 700, mb: 2 }}>
        Reservations
      </Typography>

      {/* FILTER BAR */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          alignItems: "center",
          mb: 3,
          flexWrap: "wrap",
        }}
      >
        <Dropdown>
          <Dropdown.Toggle variant="light">
            Current Week
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item>Today</Dropdown.Item>
            <Dropdown.Item>This Week</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>

        <TextField size="small" type="date" />
        <Typography>To</Typography>
        <TextField size="small" type="date" />

        <TextField
          size="small"
          placeholder="Search by name, email or phone"
          sx={{ width: 260 }}
        />

        <Button
          variant="contained"
          sx={{ backgroundColor: "#BA3131", textTransform: "none" }}
        >
          New Reservation
        </Button>
      </Box>

      {/* RESERVATION GRID */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: 2,
        }}
      >
        {dummyReservations.map((res) => {
          const status = statusMap[res.id] || res.status;

          return (
            <Box
              key={res.id}
              sx={{
                backgroundColor: "#fff",
                borderRadius: "10px",
                border: "1px solid #E5E7EB",
                padding: 2,
              }}
            >
              {/* TOP ROW */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 1,
                }}
              >
                {res.table ? (
                  <Chip
                    label={res.table}
                    sx={{ backgroundColor: "#FADBD8", fontWeight: 600 }}
                  />
                ) : (
                  <Button size="small" variant="outlined">
                    Assign Table
                  </Button>
                )}

                <Typography sx={{ fontWeight: 600 }}>
                  {res.guests} Guests
                </Typography>
              </Box>

              {/* DATE TIME */}
              <Box sx={{ display: "flex", gap: 1, alignItems: "center", mb: 1 }}>
                <CalendarTodayOutlinedIcon fontSize="small" color="error" />
                <Typography sx={{ color: "#BA3131", fontWeight: 600 }}>
                  {res.date}, {res.time}
                </Typography>
              </Box>

              {/* STATUS */}
              <Chip
                label={status}
                sx={{
                  mb: 1,
                  backgroundColor:
                    status === "Confirmed" ? "#D1FAE5" : "#FEF3C7",
                  color: status === "Confirmed" ? "#065F46" : "#92400E",
                  fontWeight: 600,
                }}
              />

              {/* CUSTOMER INFO */}
              <Box sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 0.5 }}>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <PersonOutlineIcon fontSize="small" />
                  <Typography>{res.name}</Typography>
                </Box>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <EmailOutlinedIcon fontSize="small" />
                  <Typography>{res.email}</Typography>
                </Box>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <PhoneOutlinedIcon fontSize="small" />
                  <Typography>{res.phone}</Typography>
                </Box>
              </Box>

              {/* STATUS DROPDOWN */}
              <Dropdown className="mt-2">
                <Dropdown.Toggle
                  variant="light"
                  style={{ width: "100%" }}
                >
                  {status}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item
                    onClick={() => handleStatusChange(res.id, "Confirmed")}
                  >
                    Confirmed
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={() => handleStatusChange(res.id, "Pending")}
                  >
                    Pending
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
