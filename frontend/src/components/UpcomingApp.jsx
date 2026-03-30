import React, { useEffect, useState } from "react";
import instance from "../api/axios";
import Box from "@mui/material/Box";
import AppointmentCard from "./AppointmentCard";
import "./UpcomingApp.css";

function UpcomingAppBox() {
  const [myAppointments, setMyAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await instance.get("/appointments/my-appointements");
        setMyAppointments(res.data.appointments);
      } catch (err) {
        setError("Failed to load appointments.");
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcoming = myAppointments.filter((a) => {
    const d = new Date(a.date);
    d.setHours(0, 0, 0, 0);
    return d >= today && (a.status === "booked" || a.status === "served");
  });

  if (loading) return <p>Loading appointments...</p>;
  if (error) return <p>{error}</p>;

  return (
    <Box className="upcoming-box">
      <div className="upcoming-box-header">
        <h3 className="upcoming-box-title">Upcoming Appointments</h3>
      </div>
      {upcoming.length === 0 ? (
        <p className="upcoming-empty">No upcoming appointments</p>
      ) : (
        upcoming.map((a) => <AppointmentCard key={a._id} appointment={a} />)
      )}
    </Box>
  );
}

export default UpcomingAppBox;
