import { useEffect, useState, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import instance from "../api/axios";
import "./DoctorHome.css";
import LogoutIcon from "@mui/icons-material/Logout";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";

export default function DoctorHome() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [doctorDetails, setDoctorDetails] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [queueStatus, setQueueStatus] = useState({
    currentNumber: 0,
    lastTokenNumber: 0,
    remaining: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [nextLoading, setNextLoading] = useState(false);
  const [nextSuccess, setNextSuccess] = useState("");

  const fetchTodayData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await instance.get("/doctors/today-appointments");
      setAppointments(res.data.appointments || []);
      setQueueStatus(
        res.data.queueStatus || {
          currentNumber: 0,
          lastTokenNumber: 0,
          remaining: 0,
        },
      );
    } catch (err) {
      setError("Failed to load today's appointments. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTodayData();
  }, [fetchTodayData]);

  useEffect(() => {
    const fetchDoctorDetails = async () => {
      if (!user?.id) return;
      try {
        const res = await instance.get(`/doctors/${user.id}`);
        setDoctorDetails(res.data.details);
      } catch (err) {
        // Non-critical — greeting will fall back to email/generic
      }
    };
    fetchDoctorDetails();
  }, [user?.id]);

  const handleNextPatient = async () => {
    try {
      setNextLoading(true);
      setNextSuccess("");
      await instance.put("/queues/next");
      await fetchTodayData();
      setNextSuccess("Queue moved to next patient ✓");
      setTimeout(() => setNextSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to move queue");
    } finally {
      setNextLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const todayLabel = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const displayName = doctorDetails?.name || user?.name || "Doctor";
  const displaySpec = doctorDetails?.speciality || "General Physician";

  return (
    <div className="dh-root">
      {/* Top Bar */}
      <div className="dh-topbar">
        <div className="dh-topbar-info">
          <h2 className="dh-doctor-name">Dr. {displayName}</h2>
          <p className="dh-doctor-spec">{displaySpec}</p>
        </div>
        <div className="dh-topbar-actions">
          <button
            className="dh-icon-btn"
            onClick={fetchTodayData}
            title="Refresh"
          >
            <RefreshIcon className="dh-icon-svg" />
          </button>
          <button
            className="dh-icon-btn dh-logout-btn"
            onClick={handleLogout}
            title="Logout"
          >
            <LogoutIcon className="dh-icon-svg" />
          </button>
        </div>
      </div>

      {/* Main Layout */}
      <div className="dh-layout">
        {/* Sidebar — Queue Card */}
        <aside className="dh-sidebar">
          <div className="dh-queue-card">
            <p className="dh-queue-date">{todayLabel}</p>

            <div className="dh-queue-stats">
              <div className="dh-stat">
                <span className="dh-stat-value">
                  {queueStatus.currentNumber}
                </span>
                <span className="dh-stat-label">Serving Now</span>
              </div>
              <div className="dh-stat-divider" />
              <div className="dh-stat">
                <span className="dh-stat-value">
                  {queueStatus.lastTokenNumber}
                </span>
                <span className="dh-stat-label">Total Booked</span>
              </div>
              <div className="dh-stat-divider" />
              <div className="dh-stat">
                <span className="dh-stat-value">{queueStatus.remaining}</span>
                <span className="dh-stat-label">Remaining</span>
              </div>
            </div>

            <button
              className="dh-next-btn"
              onClick={handleNextPatient}
              disabled={nextLoading || queueStatus.remaining === 0}
            >
              {nextLoading ? "Moving…" : "Next Patient →"}
            </button>

            {nextSuccess && <p className="dh-next-success">{nextSuccess}</p>}
          </div>
        </aside>

        {/* Main — Appointment List */}
        <main className="dh-main">
          <div className="dh-section-header">
            <h3 className="dh-section-title">Today's Appointments</h3>
            <span className="dh-count-badge">{appointments.length}</span>
          </div>

          {error && <p className="dh-error">{error}</p>}

          {loading ? (
            <div className="dh-loading">Loading appointments…</div>
          ) : appointments.length === 0 ? (
            <div className="dh-empty">
              <span className="dh-empty-icon">🎉</span>
              <p>No appointments today</p>
            </div>
          ) : (
            <div className="dh-appt-list">
              {appointments.map((appt) => (
                <div
                  key={appt._id}
                  className="dh-appt-card"
                  onClick={() =>
                    navigate(`/doctor/patient/${appt._id}`, {
                      state: { appointment: appt },
                    })
                  }
                >
                  <div className="dh-appt-token">
                    <span className="dh-token-num">
                      #{appt.appointmentNumber}
                    </span>
                  </div>

                  <div className="dh-appt-info">
                    <p className="dh-patient-name">
                      {appt.patientId?.name || "Patient"}
                    </p>
                    <p className="dh-appt-meta">
                      <AccessTimeOutlinedIcon className="dh-time-icon" />
                      {appt.slotTime}
                      {appt.patientId?.phone
                        ? ` · ${appt.patientId.phone}`
                        : ""}
                    </p>
                  </div>

                  <div className="dh-appt-right">
                    <span
                      className={
                        appt.paymentStatus === "paid"
                          ? "dh-pay-badge dh-pay-paid"
                          : "dh-pay-badge dh-pay-pending"
                      }
                    >
                      {appt.paymentStatus === "paid" ? "Paid" : "Pending"}
                    </span>
                    <p className="dh-appt-status">{appt.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
