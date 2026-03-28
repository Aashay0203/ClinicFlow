import React, { useState, useEffect, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  Avatar,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  TextField,
  MenuItem,
  CircularProgress,
  Divider,
  Skeleton,
  Snackbar,
  Alert,
  Chip,
  Tooltip,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";
import PersonIcon from "@mui/icons-material/Person";
import CakeIcon from "@mui/icons-material/Cake";
import WcIcon from "@mui/icons-material/Wc";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import LockIcon from "@mui/icons-material/Lock";
import { AuthContext } from "../context/AuthContext";
import instance from "../api/axios";
import PatientIdCard from "../components/PatientIdCard.jsx";
import "./Profile.css";

const GENDER_OPTIONS = ["Male", "Female", "Other", "Prefer not to say"];

/* ─── helpers ─── */
const formatDob = (dob) => {
  if (!dob) return "—";
  try {
    return new Date(dob).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dob;
  }
};

/* ─── MUI TextField override (kept as sx — targets internal MUI fieldset) ─── */
const inputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px",
    fontFamily: "Nunito",
    fontSize: 14,
    "& fieldset": { borderColor: "#dde3ea" },
    "&:hover fieldset": { borderColor: "#3e7df5" },
    "&.Mui-focused fieldset": { borderColor: "#3e7df5" },
  },
};

/* ─── InfoRow sub-component ─── */
const InfoRow = ({ icon, label, value, locked, children, showDivider }) => (
  <>
    {showDivider && <Divider sx={{ my: 0.5 }} />}
    <div className="profile-info-row">
      <div className="profile-icon-box">{icon}</div>
      <div className="profile-info-row__text">
        <div className="profile-info-row__label-wrap">
          <Typography className="profile-info-label">{label}</Typography>
          {locked && <LockIcon sx={{ fontSize: 10, color: "#b0bac5" }} />}
        </div>
        {children || (
          <Typography
            className={`profile-info-value${!value || value === "—" ? " profile-info-value--empty" : ""}`}
          >
            {value || "—"}
          </Typography>
        )}
      </div>
    </div>
  </>
);

/* ════════════════════════════════════════
   Profile page
════════════════════════════════════════ */
const Profile = () => {
  const { user: authUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [profile, setProfile] = useState(null);
  const [healthData, setHealthData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPic, setUploadingPic] = useState(false);
  const [snack, setSnack] = useState({
    open: false,
    msg: "",
    severity: "success",
  });

  useEffect(() => {
    fetchProfile();
    fetchHealth();
  }, []);

  /* ─── data fetching ─── */
  const fetchProfile = async () => {
    try {
      const res = await instance.get("/user/profile");
      const u = res.data.user;
      setProfile(u);
      setEditForm({
        dob: u.dob ? u.dob.split("T")[0] : "",
        gender: u.gender || "",
        address: u.address || "",
        abhaId: u.abhaId || "",
      });
    } catch {
      showSnack("Failed to load profile", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchHealth = async () => {
    try {
      const res = await instance.get("/user/profile");
      //console.log(res.data);
      setHealthData(res.data.profile);
    } catch {
      // health profile may not exist yet — fine
    }
  };

  /* ─── handlers ─── */
  const showSnack = (msg, severity = "success") =>
    setSnack({ open: true, msg, severity });

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await instance.patch("/user/profile", editForm);
      setProfile(res.data.user);
      setEditMode(false);
      showSnack("Profile updated!");
    } catch {
      showSnack("Save failed. Try again.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (profile) {
      setEditForm({
        dob: profile.dob ? profile.dob.split("T")[0] : "",
        gender: profile.gender || "",
        address: profile.address || "",
        abhaId: profile.abhaId || "",
      });
    }
    setEditMode(false);
  };

  const handlePictureUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showSnack("Image must be under 5 MB", "error");
      return;
    }
    setUploadingPic(true);
    const formData = new FormData();
    formData.append("profilePicture", file);
    try {
      const res = await instance.post("/user/profile/picture", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setProfile((prev) => ({
        ...prev,
        profilePicture: res.data.profilePicture,
      }));
      showSnack("Photo updated!");
    } catch {
      showSnack("Upload failed. Try again.", "error");
    } finally {
      setUploadingPic(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const fieldChange = (field) => (e) =>
    setEditForm((f) => ({ ...f, [field]: e.target.value }));

  const phone = profile?.phone || profile?.mobile;

  /* ─── loading skeleton ─── */
  if (loading) {
    return (
      <div className="profile-root">
        <div className="profile-skeleton-bar">
          <Skeleton variant="circular" width={32} height={32} />
          <Skeleton variant="text" width={90} height={22} />
        </div>
        <div className="profile-skeleton-body">
          <Skeleton
            variant="rounded"
            height={145}
            sx={{ borderRadius: "20px" }}
          />
          <Skeleton
            variant="rounded"
            height={210}
            sx={{ borderRadius: "20px" }}
          />
          <Skeleton
            variant="rounded"
            height={260}
            sx={{ borderRadius: "20px" }}
          />
          <Skeleton
            variant="rounded"
            height={180}
            sx={{ borderRadius: "20px" }}
          />
        </div>
      </div>
    );
  }

  /* ─── render ─── */
  return (
    <div className="profile-root">
      {/* ════ AppBar ════ */}
      <AppBar position="sticky" elevation={0} className="profile-appbar">
        <Toolbar className="profile-toolbar">
          <div className="profile-appbar-left">
            <IconButton
              onClick={() => navigate(-1)}
              size="small"
              className="profile-back-btn"
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography className="profile-appbar-title">My Profile</Typography>
          </div>

          {editMode ? (
            <div className="profile-appbar-actions">
              <IconButton
                size="small"
                onClick={handleCancelEdit}
                className="profile-cancel-btn"
              >
                <CloseIcon fontSize="small" />
              </IconButton>
              <div
                className={`profile-save-btn${saving ? " profile-save-btn--saving" : ""}`}
                onClick={!saving ? handleSave : undefined}
              >
                {saving ? (
                  <CircularProgress size={14} sx={{ color: "#7a8799" }} />
                ) : (
                  <SaveIcon sx={{ fontSize: 16 }} />
                )}
                {saving ? "Saving…" : "Save"}
              </div>
            </div>
          ) : (
            <div className="profile-edit-btn" onClick={() => setEditMode(true)}>
              <EditIcon sx={{ fontSize: 15 }} />
              Edit
            </div>
          )}
        </Toolbar>
      </AppBar>

      {/* ════ Content ════ */}
      <div className="profile-content">
        {/* ── Avatar card ── */}
        <div className="profile-section-card">
          <div className="profile-avatar-section">
            <div className="profile-avatar-wrap">
              <Avatar src={profile?.profilePicture} className="profile-avatar">
                {profile?.name?.charAt(0)?.toUpperCase()}
              </Avatar>
              <div
                className={`profile-camera-btn${uploadingPic ? " profile-camera-btn--uploading" : ""}`}
                onClick={() => !uploadingPic && fileInputRef.current?.click()}
              >
                {uploadingPic ? (
                  <CircularProgress size={13} sx={{ color: "#fff" }} />
                ) : (
                  <CameraAltIcon sx={{ fontSize: 13, color: "#fff" }} />
                )}
              </div>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handlePictureUpload}
              />
            </div>
            <Typography className="profile-avatar-name">
              {profile?.name}
            </Typography>
            <Typography className="profile-avatar-phone">{phone}</Typography>
            <Chip
              label={`ID: ${profile?.patientId}`}
              size="small"
              className="profile-patient-id-chip"
            />
          </div>
        </div>

        {/* ── Patient ID Card ── */}
        <div className="profile-section-card">
          <Typography className="profile-section-title">
            Patient ID Card
          </Typography>
          <PatientIdCard
            name={profile?.name}
            patientId={profile?.patientId}
            phone={phone}
            bloodGroup={healthData?.bloodGroup}
            abhaId={profile?.abhaId}
            profilePicture={profile?.profilePicture}
          />
        </div>

        {/* ── Personal Information ── */}
        <div className="profile-section-card">
          <Typography className="profile-section-title">
            Personal Information
          </Typography>

          <div className="profile-info-rows">
            <InfoRow
              icon={<PersonIcon sx={{ fontSize: 16 }} />}
              label="Full Name"
              value={profile?.name}
              locked
            />
            <InfoRow
              icon={<PhoneIcon sx={{ fontSize: 16 }} />}
              label="Phone"
              value={phone}
              locked
              showDivider
            />
            <InfoRow
              icon={<EmailIcon sx={{ fontSize: 16 }} />}
              label="Email"
              value={profile?.email}
              locked
              showDivider
            />

            {/* Date of Birth */}
            <InfoRow
              icon={<CakeIcon sx={{ fontSize: 16 }} />}
              label="Date of Birth"
              value={formatDob(profile?.dob)}
              showDivider
            >
              {editMode && (
                <TextField
                  type="date"
                  size="small"
                  fullWidth
                  value={editForm.dob}
                  onChange={fieldChange("dob")}
                  sx={inputSx}
                  inputProps={{ max: new Date().toISOString().split("T")[0] }}
                />
              )}
            </InfoRow>

            {/* Gender */}
            <InfoRow
              icon={<WcIcon sx={{ fontSize: 16 }} />}
              label="Gender"
              value={profile?.gender || "—"}
              showDivider
            >
              {editMode && (
                <TextField
                  select
                  size="small"
                  fullWidth
                  value={editForm.gender}
                  onChange={fieldChange("gender")}
                  sx={inputSx}
                >
                  <MenuItem
                    value=""
                    sx={{ fontFamily: "Nunito", color: "#7a8799" }}
                  >
                    Select gender
                  </MenuItem>
                  {GENDER_OPTIONS.map((opt) => (
                    <MenuItem
                      key={opt}
                      value={opt}
                      sx={{ fontFamily: "Nunito" }}
                    >
                      {opt}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            </InfoRow>

            {/* Address */}
            <InfoRow
              icon={<LocationOnIcon sx={{ fontSize: 16 }} />}
              label="Address"
              value={profile?.address || "—"}
              showDivider
            >
              {editMode && (
                <TextField
                  size="small"
                  fullWidth
                  multiline
                  rows={2}
                  value={editForm.address}
                  onChange={fieldChange("address")}
                  placeholder="Your full address"
                  sx={inputSx}
                />
              )}
            </InfoRow>

            {/* ABHA ID */}
            <Divider sx={{ my: 0.5 }} />
            <div className="profile-info-row">
              <div className="profile-icon-box">
                <VerifiedUserIcon sx={{ fontSize: 16 }} />
              </div>
              <div className="profile-info-row__text">
                <div className="profile-info-row__label-wrap">
                  <Typography className="profile-info-label">
                    ABHA ID
                  </Typography>
                  <Tooltip
                    title="Ayushman Bharat Health Account — India's national digital health ID issued by NHA. Linking it helps connect your records with government health services."
                    arrow
                    placement="top"
                  >
                    <InfoOutlinedIcon
                      sx={{ fontSize: 13, color: "#b0bac5", cursor: "help" }}
                    />
                  </Tooltip>
                </div>
                {editMode ? (
                  <TextField
                    size="small"
                    fullWidth
                    value={editForm.abhaId}
                    onChange={fieldChange("abhaId")}
                    placeholder="XX-XXXX-XXXX-XXXX"
                    inputProps={{ maxLength: 17 }}
                    helperText="14-digit ABHA number (optional)"
                    sx={{
                      ...inputSx,
                      "& .MuiFormHelperText-root": {
                        fontFamily: "Nunito",
                        fontSize: 11,
                      },
                    }}
                  />
                ) : (
                  <div className="profile-abha-value-row">
                    {/* color is dynamic — depends on whether abhaId exists */}
                    <Typography
                      className="profile-info-value"
                      sx={{ color: profile?.abhaId ? "#010101" : "#b0bac5" }}
                    >
                      {profile?.abhaId || "Not linked"}
                    </Typography>
                    {profile?.abhaId && (
                      <Chip
                        label="✓ Linked"
                        size="small"
                        className="profile-abha-linked"
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {editMode && (
            <Typography className="profile-locked-note">
              <LockIcon sx={{ fontSize: 11 }} />
              Name, phone, and email are managed by the clinic.
            </Typography>
          )}
        </div>

        {/* ── Health Snapshot ── */}
        <div className="profile-section-card">
          <Typography className="profile-section-title">
            Health Snapshot
          </Typography>

          {healthData ? (
            <div className="profile-health-data">
              {healthData.bloodGroup && (
                <div className="profile-blood-row">
                  <div className="profile-blood-icon-box">
                    <Typography sx={{ fontSize: 20 }}>🩸</Typography>
                  </div>
                  <div>
                    <Typography className="profile-chip-group-label">
                      Blood Group
                    </Typography>
                    <Typography className="profile-blood-group-value">
                      {healthData.bloodGroup}
                    </Typography>
                  </div>
                </div>
              )}

              {healthData.allergies?.length > 0 && (
                <div>
                  <Typography className="profile-chip-group-label">
                    ⚠️ Known Allergies
                  </Typography>
                  <div className="profile-chip-row">
                    {healthData.allergies.slice(0, 4).map((a, i) => (
                      <Chip
                        key={i}
                        label={a}
                        size="small"
                        className="chip-allergy"
                      />
                    ))}
                    {healthData.allergies.length > 4 && (
                      <Chip
                        label={`+${healthData.allergies.length - 4} more`}
                        size="small"
                        className="chip-more"
                      />
                    )}
                  </div>
                </div>
              )}

              {healthData.currentMedications?.length > 0 && (
                <div>
                  <Typography className="profile-chip-group-label">
                    💊 Current Medications
                  </Typography>
                  <div className="profile-chip-row">
                    {healthData.currentMedications.slice(0, 3).map((m, i) => (
                      <Chip
                        key={i}
                        label={m}
                        size="small"
                        className="chip-medication"
                      />
                    ))}
                    {healthData.currentMedications.length > 3 && (
                      <Chip
                        label={`+${healthData.currentMedications.length - 3} more`}
                        size="small"
                        className="chip-more"
                      />
                    )}
                  </div>
                </div>
              )}

              {healthData.chronicConditions?.length > 0 && (
                <div>
                  <Typography className="profile-chip-group-label">
                    🫀 Chronic Conditions
                  </Typography>
                  <div className="profile-chip-row">
                    {healthData.chronicConditions.slice(0, 3).map((c, i) => (
                      <Chip
                        key={i}
                        label={c}
                        size="small"
                        className="chip-condition"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="profile-health-empty">
              <span className="profile-health-empty__emoji">🏥</span>
              <Typography className="profile-health-empty__title">
                No health data yet
              </Typography>
              <Typography className="profile-health-empty__sub">
                Upload medical reports to generate your AI health summary
              </Typography>
            </div>
          )}

          <div
            className="profile-health-cta"
            onClick={() => navigate("/health-profile")}
          >
            <div className="profile-health-cta__left">
              <MonitorHeartIcon className="profile-health-cta__icon" />
              <div>
                <Typography className="profile-health-cta__title">
                  View Full Health Summary
                </Typography>
                <Typography className="profile-health-cta__sub">
                  AI-generated from your uploaded reports
                </Typography>
              </div>
            </div>
            <span className="profile-health-cta__arrow">→</span>
          </div>
        </div>
      </div>

      {/* ════ Snackbar ════ */}
      <Snackbar
        open={snack.open}
        autoHideDuration={2800}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snack.severity}
          className="profile-snack-alert"
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Profile;
