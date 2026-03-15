import React, { useEffect, useState } from "react";
import "./MyAppointment.css";
import instance from "../api/axios";

import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Avatar,
  Chip,
  Button,
  Paper,
} from "@mui/material";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import SearchIcon from "@mui/icons-material/Search";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";

// ─── Utility ─────────────────────────────────────────────────────────────────

function formatDate(dateStr) {
  const apptDate = new Date(dateStr);
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  const isSameDay = (a, b) =>
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear();

  if (isSameDay(apptDate, today)) return "Today";
  if (isSameDay(apptDate, tomorrow)) return "Tomorrow";

  return apptDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });
}

// ─── AppointmentCard ──────────────────────────────────────────────────────────

function AppointmentCard({ appointment }) {
  const doctor = appointment.doctorId || {};

  return (
    <Paper className="appointment-card" elevation={0}>
      {/* ── Top Row: Avatar + Doctor Info + Status Badge ── */}
      <div className="card-top-row">
        <div className="card-doctor-info">
          <Avatar
            src={doctor.avatarUrl}
            alt={doctor.name}
            variant="rounded"
            className="doctor-avatar"
          >
            {doctor.name?.[0] || "D"}
          </Avatar>

          <div>
            <Typography className="doctor-name">
              {doctor.name || "Doctor"}
            </Typography>
            <Typography className="doctor-specialty">
              {doctor.speciality || doctor.specialty || "Specialist"}
            </Typography>
          </div>
        </div>

        <Chip label="UPCOMING" className="status-badge" />
      </div>

      {/* ── Info Chips: Date, Time, Token, Payment ── */}
      <div className="info-chips-row">
        <div className="info-chip">
          <CalendarTodayOutlinedIcon className="info-chip-icon" />
          {formatDate(appointment.date)}
        </div>

        <div className="info-chip">
          <AccessTimeOutlinedIcon className="info-chip-icon" />
          {appointment.slotTime || "—"}
        </div>

        <div className="info-chip">
          #{appointment.appointmentNumber ?? "—"} Token
        </div>

        <div
          className={
            appointment.paymentStatus === "paid" ? "paid-chip" : "pending-chip"
          }
        >
          {appointment.paymentStatus === "paid" ? "Paid" : "Pending"}
        </div>
      </div>

      {/* ── Action Buttons ── */}
      <div className="card-actions">
        <Button variant="outlined" className="btn-cancel">
          Cancel
        </Button>
        <Button variant="contained" className="btn-reschedule">
          Reschedule
        </Button>
      </div>
    </Paper>
  );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────

function EmptyState({ label }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">📭</div>
      <Typography className="empty-state-title">
        No {label} appointments
      </Typography>
    </div>
  );
}

// ─── MyAppointment (Page) ─────────────────────────────────────────────────────

export default function MyAppointment() {
  const [myAppointments, setMyAppointments] = useState([]);
  const [value, setValue] = useState("1");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchAppointments = async () => {
      const res = await instance.get("/appointment/my-appointements");
      setMyAppointments(res.data.appointments);
    };
    fetchAppointments();
  }, []);

  const handleTabChange = (event, newValue) => {
    setValue(newValue);
  };

  // ── Filter by date ──
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const filterBySearch = (list) =>
    list.filter((a) =>
      a.doctorId?.name?.toLowerCase().includes(search.toLowerCase()),
    );

  const upcoming = filterBySearch(
    myAppointments.filter((a) => {
      const d = new Date(a.date);
      d.setHours(0, 0, 0, 0);
      return d >= today;
    }),
  );

  const past = filterBySearch(
    myAppointments.filter((a) => {
      const d = new Date(a.date);
      d.setHours(0, 0, 0, 0);
      return d < today;
    }),
  );

  return (
    <div className="my-appointment-page">
      {/* ── Sticky Header ── */}
      <div className="my-appointment-header">
        <p className="greeting-text">Good Morning 👋</p>
        <h1 className="page-title">My Appointments</h1>

        {/* ── Search ── */}
        <div className="search-wrapper">
          <TextField
            placeholder="Search for doctor..."
            size="small"
            fullWidth
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 18, color: "#7a8799" }} />
                </InputAdornment>
              ),
            }}
          />
        </div>

        {/* ── Tabs ── */}
        <TabContext value={value}>
          <TabList onChange={handleTabChange} className="appointment-tabs">
            <Tab label="Upcoming" value="1" className="appointment-tab" />
            <Tab label="Past" value="2" className="appointment-tab" />
            <Tab label="Cancelled" value="3" className="appointment-tab" />
          </TabList>

          {/* ── Panels ── */}
          <Box className="tab-panel-content">
            <TabPanel value="1" sx={{ p: 0 }}>
              {upcoming.length === 0 ? (
                <EmptyState label="upcoming" />
              ) : (
                upcoming.map((a) => (
                  <AppointmentCard key={a._id} appointment={a} />
                ))
              )}
            </TabPanel>

            <TabPanel value="2" sx={{ p: 0 }}>
              {past.length === 0 ? (
                <EmptyState label="past" />
              ) : (
                past.map((a) => <AppointmentCard key={a._id} appointment={a} />)
              )}
            </TabPanel>

            <TabPanel value="3" sx={{ p: 0 }}>
              <EmptyState label="cancelled" />
            </TabPanel>
          </Box>
        </TabContext>
      </div>
    </div>
  );
}
