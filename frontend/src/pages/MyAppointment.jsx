import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MyAppointment.css";
import instance from "../api/axios";

import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
} from "@mui/material";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import SearchIcon from "@mui/icons-material/Search";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import AppointmentCard from "../components/AppointmentCard";

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

  const navigate = useNavigate();

  useEffect(() => {
    const fetchAppointments = async () => {
      const res = await instance.get("/appointments/my-appointements");
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
      const appointmentDateStr = new Date(a.date).toISOString().split("T")[0];
      const todayStr = new Date().toISOString().split("T")[0];
      return appointmentDateStr >= todayStr;
    }),
  );

  const past = filterBySearch(
    myAppointments.filter((a) => {
      const appointmentDateStr = new Date(a.date).toISOString().split("T")[0];
      const todayStr = new Date().toISOString().split("T")[0];
      return appointmentDateStr < todayStr;
    }),
  );

  return (
    <div className="my-appointment-page">
      {/* ── Sticky Header ── */}
      <div className="my-appointment-header">
        <div className="my-appointment-top-nav">
          <IconButton
            className="my-appointment-back-btn"
            onClick={() => navigate(-1)}
          >
            <ArrowBackIosNewIcon fontSize="small" />
          </IconButton>
          <IconButton
            className="my-appointment-home-btn"
            onClick={() => navigate("/home")}
          >
            <HomeOutlinedIcon fontSize="small" />
          </IconButton>
        </div>

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
