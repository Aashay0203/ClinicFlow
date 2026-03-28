import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Typography, IconButton } from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import instance from "../../api/axios";
import CriticalChips from "../../components/HealthProfile/CriticalChips";
import LabValuesTable from "../../components/HealthProfile/LabValuesTable";
import MedicalHistorySection from "../../components/HealthProfile/MedicalHistorySection";
import LifestyleSection from "../../components/HealthProfile/LifestyleSection";
import InsightsCard from "../../components/HealthProfile/InsightsCard";
import "./HealthProfile.css";

export default function HealthProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await instance.get("/healthProfile");
        setProfile(res.data?.profile || null);
      } catch (err) {
        const status = err?.response?.status;
        if (status === 404) {
          setProfile(null);
        } else {
          setError("Could not load health profile right now.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const ai = profile?.aiExtracted || {};
  const user = profile?.userProvided || {};

  const mergedAllergies = useMemo(() => {
    const aiAllergies = ai.detectedAllergies || [];
    const userAllergies = user.allergies || [];
    return [...new Set([...aiAllergies, ...userAllergies])];
  }, [ai.detectedAllergies, user.allergies]);

  const labCount = useMemo(() => {
    const labValues = ai.labValues || {};
    return Object.values(labValues).filter(
      (item) =>
        item?.value !== null && item?.value !== undefined && item?.value !== "",
    ).length;
  }, [ai.labValues]);

  const activeFlagsCount = useMemo(() => {
    const flags = ai.specialFlags || {};
    return Object.values(flags).filter(Boolean).length;
  }, [ai.specialFlags]);

  if (loading) {
    return (
      <Box className="hp-root hp-center">
        <Typography className="hp-muted">Loading health profile...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="hp-root hp-center">
        <Typography className="hp-error">{error}</Typography>
      </Box>
    );
  }

  if (!profile) {
    return (
      <Box className="hp-root hp-empty-state">
        <Typography className="hp-title">Health Profile</Typography>
        <Typography className="hp-muted">
          No profile found. Complete setup once to generate your health summary.
        </Typography>
        <Button
          variant="contained"
          className="hp-cta"
          onClick={() => navigate("/health-profile/setup")}
        >
          Start Setup
        </Button>
      </Box>
    );
  }

  return (
    <Box className="hp-root">
      <Box className="hp-shell">
        <Box className="hp-top-nav">
          <IconButton className="hp-back-btn" onClick={() => navigate(-1)}>
            <ArrowBackIosNewIcon fontSize="small" />
          </IconButton>
          <IconButton className="hp-home-btn" onClick={() => navigate("/home")}>
            <HomeOutlinedIcon fontSize="small" />
          </IconButton>
        </Box>

        <Box className="hp-header">
          <Box>
            <Typography className="hp-kicker">DelhiMed Health Vault</Typography>
            <Typography className="hp-title">Health Profile</Typography>
            <Typography className="hp-subtitle">
              Unified timeline of your reports, vitals, and AI guidance.
            </Typography>
          </Box>
          <Button
            className="hp-link-btn"
            onClick={() => navigate("/health-profile/setup")}
          >
            Edit
          </Button>
        </Box>

        <Box className="hp-hero-metrics">
          <Box className="hp-metric-pill hp-metric-pill--1">
            <Typography className="hp-metric-label">Allergies</Typography>
            <Typography className="hp-metric-value">
              {mergedAllergies.length}
            </Typography>
          </Box>
          <Box className="hp-metric-pill hp-metric-pill--2">
            <Typography className="hp-metric-label">Lab Markers</Typography>
            <Typography className="hp-metric-value">{labCount}</Typography>
          </Box>
          <Box className="hp-metric-pill hp-metric-pill--3">
            <Typography className="hp-metric-label">Critical Flags</Typography>
            <Typography className="hp-metric-value">
              {activeFlagsCount}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box className="hp-section hp-section--1">
        <Typography className="hp-section-title">Critical</Typography>
        <CriticalChips bloodGroup={ai.bloodGroup} allergies={mergedAllergies} />
      </Box>

      <Box className="hp-section hp-section--2">
        <Typography className="hp-section-title">Lab Values</Typography>
        <LabValuesTable labValues={ai.labValues} />
      </Box>

      <Box className="hp-section hp-section--3">
        <Typography className="hp-section-title">Medical History</Typography>
        <MedicalHistorySection
          conditions={user.conditions}
          pastEvents={user.pastEvents}
          medications={user.medications}
        />
      </Box>

      <Box className="hp-section hp-section--4">
        <Typography className="hp-section-title">Lifestyle</Typography>
        <LifestyleSection
          lifestyle={user.lifestyle}
          familyHistory={user.familyHistory}
          currentSymptoms={user.currentSymptoms}
        />
      </Box>

      <Box className="hp-section hp-section--1 hp-bottom-space">
        <Typography className="hp-section-title">AI Insights</Typography>
        <InsightsCard
          insights={ai.personalizedInsights || []}
          specialFlags={ai.specialFlags || {}}
          trends={ai.trends || {}}
        />
      </Box>
    </Box>
  );
}
