import TimeUtils from "../utils/TimeUtils.jsx";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import { Typography, Avatar, Chip, Button, Paper } from "@mui/material";

export default function AppointmentCard({ appointment }) {
  const doctor = appointment.doctorId || {};
  const { formatDate } = TimeUtils;

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
