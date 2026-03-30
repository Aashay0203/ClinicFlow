import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import instance from "../api/axios";
import "./PatientDetails.css";
import { IconButton, Typography } from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";

// ── Lab key → readable label ─────────────────
const LAB_LABELS = {
  hemoglobin: "Hemoglobin",
  wbc: "WBC",
  platelets: "Platelets",
  bloodSugar: "Blood Sugar",
  creatinine: "Creatinine",
  urea: "Urea",
  sodium: "Sodium",
  potassium: "Potassium",
  sgpt: "SGPT",
  sgot: "SGOT",
  bilirubin: "Bilirubin",
  cholesterol: "Cholesterol",
};

// ── Reusable sub-section ──────────────────────
function ProfileSection({ label, children }) {
  return (
    <div className="pd-section">
      <p className="pd-sub-label">{label}</p>
      {children}
    </div>
  );
}

export default function PatientDetail() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [appointment] = useState(location.state?.appointment || null);
  const [healthProfile, setHealthProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    const patientId = appointment?.patientId?._id;
    if (!patientId) {
      setProfileLoading(false);
      return;
    }

    const fetchHealthProfile = async () => {
      try {
        setProfileLoading(true);
        const res = await instance.get(`/doctors/patient-profile/${patientId}`);
        setHealthProfile(res.data.profile);
      } catch (err) {
        // No profile is a valid state — not an error
        setHealthProfile(null);
      } finally {
        setProfileLoading(false);
      }
    };

    fetchHealthProfile();
  }, [appointment]);

  // Guard: if page refreshed state is gone
  if (!appointment) {
    return (
      <div className="pd-page">
        <div className="pd-header">
          <IconButton className="pd-back-btn" onClick={() => navigate(-1)}>
            <ArrowBackIosNewIcon fontSize="small" />
          </IconButton>
          <Typography className="pd-header-title">Patient Details</Typography>
          <div className="pd-header-spacer" />
        </div>
        <div className="pd-not-found">
          <p>Appointment data not available. Please go back and try again.</p>
        </div>
      </div>
    );
  }

  const patient = appointment.patientId || {};
  const ai = healthProfile?.aiExtracted;
  const userProvided = healthProfile?.userProvided;

  // Merge allergies from both sources, deduplicate
  const allAllergies = [
    ...(ai?.detectedAllergies || []),
    ...(userProvided?.allergies || []),
  ].filter((v, i, arr) => arr.indexOf(v) === i);

  // Lab values that have actual data
  const labEntries = ai?.labValues
    ? Object.entries(ai.labValues).filter(([, val]) => val != null)
    : [];

  // Active special flags
  const activeFlags = ai?.specialFlags
    ? Object.entries(ai.specialFlags)
        .filter(([, val]) => val === true)
        .map(([key]) => key)
    : [];

  const flagLabels = {
    anemia: "🔴 Anemia",
    infection: "🟡 Infection",
    kidneyIssue: "🔴 Kidney Issue",
    liverIssue: "🔴 Liver Issue",
    diabetesRisk: "🟡 Diabetes Risk",
  };

  return (
    <div className="pd-page">
      {/* Header */}
      <div className="pd-header">
        <IconButton className="pd-back-btn" onClick={() => navigate(-1)}>
          <ArrowBackIosNewIcon fontSize="small" />
        </IconButton>
        <Typography className="pd-header-title">Patient Details</Typography>
        <div className="pd-header-spacer" />
      </div>

      <div className="pd-content">
        {/* Patient Identity Card */}
        <div className="pd-card pd-identity-card">
          <div className="pd-avatar">
            {patient.name?.[0]?.toUpperCase() || "P"}
          </div>
          <div className="pd-identity-info">
            <h2 className="pd-patient-name">{patient.name || "Patient"}</h2>
            <p className="pd-patient-contact">
              {patient.phone || patient.email || "—"}
            </p>
          </div>
          <div className="pd-token-badge">
            <span className="pd-token-label">Token</span>
            <span className="pd-token-value">
              #{appointment.appointmentNumber}
            </span>
          </div>
        </div>

        {/* Appointment Meta */}
        <div className="pd-card pd-meta-card">
          <div className="pd-meta-row">
            <span className="pd-meta-key">Slot Time</span>
            <span className="pd-meta-val">{appointment.slotTime}</span>
          </div>
          <div className="pd-meta-divider" />
          <div className="pd-meta-row">
            <span className="pd-meta-key">Status</span>
            <span className="pd-meta-val pd-capitalize">
              {appointment.status}
            </span>
          </div>
          <div className="pd-meta-divider" />
          <div className="pd-meta-row">
            <span className="pd-meta-key">Payment</span>
            <span
              className={
                appointment.paymentStatus === "paid"
                  ? "pd-payment-badge pd-paid"
                  : "pd-payment-badge pd-pending"
              }
            >
              {appointment.paymentStatus}
            </span>
          </div>
        </div>

        {/* Health Profile Section */}
        {profileLoading ? (
          <div className="pd-card pd-loading-card">
            <p className="pd-loading-text">Loading health profile…</p>
          </div>
        ) : !healthProfile ? (
          <div className="pd-card pd-no-profile-card">
            <PersonOutlineIcon className="pd-no-profile-icon" />
            <p className="pd-no-profile-text">
              No health profile found for this patient.
            </p>
          </div>
        ) : (
          <>
            {/* Critical Info — blood group + allergies */}
            {(ai?.bloodGroup || allAllergies.length > 0) && (
              <div className="pd-card pd-critical-card">
                <h3 className="pd-card-title pd-title-critical">
                  ⚠️ Critical Info
                </h3>
                <div className="pd-chips-wrap">
                  {ai?.bloodGroup && (
                    <span className="pd-chip pd-chip-blood">
                      🩸 {ai.bloodGroup}
                    </span>
                  )}
                  {allAllergies.map((a, i) => (
                    <span key={i} className="pd-chip pd-chip-allergy">
                      ⚠️ {a}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* AI Extracted */}
            {ai && (
              <div className="pd-card pd-ai-card">
                <div className="pd-ai-header">
                  <div className="pd-ai-icon-wrap">
                    <AutoAwesomeIcon className="pd-ai-icon" />
                  </div>
                  <div>
                    <h3 className="pd-card-title pd-card-title-inline">
                      AI Analysis
                    </h3>
                    <p className="pd-ai-sub">Extracted from uploaded reports</p>
                  </div>
                </div>

                {/* Special Flags */}
                {activeFlags.length > 0 && (
                  <ProfileSection label="Flags">
                    <div className="pd-chips-wrap">
                      {activeFlags.map((f) => (
                        <span key={f} className="pd-chip pd-chip-flag">
                          {flagLabels[f] || f}
                        </span>
                      ))}
                    </div>
                  </ProfileSection>
                )}

                {/* Lab Values */}
                {labEntries.length > 0 && (
                  <ProfileSection label="Lab Values">
                    <div className="pd-lab-grid">
                      {labEntries.map(([key, val]) => {
                        // Safely extract the value to display whether `val` is an object or a primitive
                        const displayVal =
                          typeof val === "object" && val !== null
                            ? `${val.value || ""} ${val.unit || ""}`.trim()
                            : val;

                        return (
                          <div key={key} className="pd-lab-item">
                            <span className="pd-lab-key">
                              {LAB_LABELS[key] || key}
                            </span>
                            <span className="pd-lab-val">{displayVal}</span>
                          </div>
                        );
                      })}
                    </div>
                  </ProfileSection>
                )}

                {/* Medications (AI) */}
                {ai.currentMedications?.length > 0 && (
                  <ProfileSection label="Current Medications">
                    <ul className="pd-bullet-list">
                      {ai.currentMedications.map((m, i) => (
                        <li key={i}>{m}</li>
                      ))}
                    </ul>
                  </ProfileSection>
                )}

                {/* Insights */}
                {ai.personalizedInsights?.length > 0 && (
                  <ProfileSection label="Insights">
                    <ul className="pd-bullet-list">
                      {ai.personalizedInsights.map((ins, i) => (
                        <li key={i}>{ins}</li>
                      ))}
                    </ul>
                  </ProfileSection>
                )}
              </div>
            )}

            {/* User Provided History */}
            {userProvided && (
              <div className="pd-card">
                <h3 className="pd-card-title">Patient History</h3>

                {/* Known Conditions */}
                {userProvided.conditions &&
                  Object.values(userProvided.conditions).some(Boolean) && (
                    <ProfileSection label="Known Conditions">
                      <div className="pd-chips-wrap">
                        {userProvided.conditions.diabetes && (
                          <span className="pd-chip pd-chip-cond">Diabetes</span>
                        )}
                        {userProvided.conditions.hypertension && (
                          <span className="pd-chip pd-chip-cond">
                            Hypertension
                          </span>
                        )}
                        {userProvided.conditions.thyroid && (
                          <span className="pd-chip pd-chip-cond">Thyroid</span>
                        )}
                      </div>
                    </ProfileSection>
                  )}

                {/* Current Symptoms */}
                {userProvided.currentSymptoms?.length > 0 && (
                  <ProfileSection label="Current Symptoms">
                    <div className="pd-chips-wrap">
                      {userProvided.currentSymptoms.map((s, i) => (
                        <span key={i} className="pd-chip pd-chip-symptom">
                          {s}
                        </span>
                      ))}
                    </div>
                  </ProfileSection>
                )}

                {/* Medications (user) */}
                {userProvided.medications?.length > 0 && (
                  <ProfileSection label="Medications">
                    <ul className="pd-bullet-list">
                      {userProvided.medications.map((m, i) => (
                        <li key={i}>{m}</li>
                      ))}
                    </ul>
                  </ProfileSection>
                )}

                {/* Past Surgeries */}
                {userProvided.pastEvents?.surgeries?.length > 0 && (
                  <ProfileSection label="Past Surgeries">
                    <ul className="pd-bullet-list">
                      {userProvided.pastEvents.surgeries.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </ProfileSection>
                )}

                {/* Past Injuries */}
                {userProvided.pastEvents?.injuries?.length > 0 && (
                  <ProfileSection label="Past Injuries">
                    <ul className="pd-bullet-list">
                      {userProvided.pastEvents.injuries.map((inj, i) => (
                        <li key={i}>{inj}</li>
                      ))}
                    </ul>
                  </ProfileSection>
                )}

                {/* Family History */}
                {userProvided.familyHistory &&
                  (userProvided.familyHistory.diabetes ||
                    userProvided.familyHistory.heartDisease ||
                    userProvided.familyHistory.cancer ||
                    userProvided.familyHistory.geneticConditions?.length >
                      0) && (
                    <ProfileSection label="Family History">
                      <div className="pd-chips-wrap">
                        {userProvided.familyHistory.diabetes && (
                          <span className="pd-chip pd-chip-family">
                            Diabetes
                          </span>
                        )}
                        {userProvided.familyHistory.heartDisease && (
                          <span className="pd-chip pd-chip-family">
                            Heart Disease
                          </span>
                        )}
                        {userProvided.familyHistory.cancer && (
                          <span className="pd-chip pd-chip-family">Cancer</span>
                        )}
                        {userProvided.familyHistory.geneticConditions?.map(
                          (g, i) => (
                            <span key={i} className="pd-chip pd-chip-family">
                              {g}
                            </span>
                          ),
                        )}
                      </div>
                    </ProfileSection>
                  )}

                {/* Lifestyle */}
                {userProvided.lifestyle &&
                  (userProvided.lifestyle.smoking ||
                    userProvided.lifestyle.alcohol) && (
                    <ProfileSection label="Lifestyle">
                      <div className="pd-chips-wrap">
                        {userProvided.lifestyle.smoking && (
                          <span className="pd-chip pd-chip-lifestyle">
                            🚬 Smoking
                          </span>
                        )}
                        {userProvided.lifestyle.alcohol && (
                          <span className="pd-chip pd-chip-lifestyle">
                            🍺 Alcohol
                          </span>
                        )}
                      </div>
                    </ProfileSection>
                  )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
