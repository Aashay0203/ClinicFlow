import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  LinearProgress,
  IconButton,
  Button,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { AuthContext } from "../../context/AuthContext";
import instance from "../../api/axios";
import Step1Conditions from "./steps/Step1Conditions";
import Step2PastEvents from "./steps/Step2PastEvents";
import Step3Lifestyle from "./steps/Step3Lifestyle";
import Step4FamilyHistory from "./steps/Step4FamilyHistory";
import Step5Symptoms from "./steps/Step5Symptoms";
import Step6MedsAllergies from "./steps/Step6MedsAllergies";
import "./HealthProfileSetup.css";

const STEPS = [
  { label: "Health Conditions" },
  { label: "Past Medical Events" },
  { label: "Lifestyle" },
  { label: "Family History" },
  { label: "Current Symptoms" },
  { label: "Medications & Allergies" },
];

const initialFormData = {
  conditions: { diabetes: false, hypertension: false, thyroid: false },
  pastEvents: { surgeries: [], injuries: [], majorIllness: [] },
  lifestyle: { smoking: null, alcohol: null },
  familyHistory: {
    diabetes: false,
    heartDisease: false,
    cancer: false,
    geneticConditions: [],
  },
  currentSymptoms: [],
  medications: [],
  allergies: [],
};

export default function HealthProfileSetup() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [prefilling, setPrefilling] = useState(true);

  // Pre-fill with existing data if user already filled the form before
  useEffect(() => {
    const fetchExisting = async (req, res) => {
      try {
        const res = await instance.get("/healthProfile");
        if (res.data.profile?.userProvided) {
          const u = res.data.profile.userProvided;
          setFormData({
            conditions: u.conditions || initialFormData.conditions,
            pastEvents: u.pastEvents || initialFormData.pastEvents,
            lifestyle: u.lifestyle || initialFormData.lifestyle,
            familyHistory: u.familyHistory || initialFormData.familyHistory,
            currentSymptoms: u.currentSymptoms || [],
            medications: u.medications || [],
            allergies: u.allergies || [],
          });
        }
      } catch (err) {
        setError("Failed to get user Health Profile.");
        res
          .status(500)
          .json({ success: false, message: "Error in Fetch Health Profile" });
        // No existing profile — use defaults
      } finally {
        setPrefilling(false);
      }
    };
    fetchExisting();
  }, []);

  const updateStep = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) setCurrentStep((s) => s + 1);
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
    else navigate(-1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      await instance.put("/healthProfile/userData", formData);
      navigate("/health-profile");
    } catch (err) {
      setError("Failed to save. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const progress = ((currentStep + 1) / STEPS.length) * 100;
  const isLastStep = currentStep === STEPS.length - 1;

  if (prefilling) return null;

  const stepProps = (key) => ({
    data: formData[key],
    onChange: (val) => updateStep(key, val),
  });

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <Step1Conditions {...stepProps("conditions")} />;
      case 1:
        return <Step2PastEvents {...stepProps("pastEvents")} />;
      case 2:
        return <Step3Lifestyle {...stepProps("lifestyle")} />;
      case 3:
        return <Step4FamilyHistory {...stepProps("familyHistory")} />;
      case 4:
        return (
          <Step5Symptoms
            data={formData.currentSymptoms}
            onChange={(val) => updateStep("currentSymptoms", val)}
          />
        );
      case 5:
        return (
          <Step6MedsAllergies
            medications={formData.medications}
            allergies={formData.allergies}
            onMedsChange={(val) => updateStep("medications", val)}
            onAllergiesChange={(val) => updateStep("allergies", val)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Box className="hps-root">
      {/* Header */}
      <Box className="hps-header">
        <IconButton className="hps-back-btn" onClick={handleBack}>
          <ArrowBackIcon />
        </IconButton>
        <Box className="hps-header-text">
          <Typography className="hps-step-label">
            Step {currentStep + 1} of {STEPS.length}
          </Typography>
          <Typography className="hps-step-title">
            {STEPS[currentStep].label}
          </Typography>
        </Box>
        <Button
          className="hps-skip-btn"
          onClick={() => navigate("/health-profile")}
        >
          Skip
        </Button>
      </Box>

      {/* Progress Bar */}
      <LinearProgress
        variant="determinate"
        value={progress}
        className="hps-progress"
      />

      {/* Step Content */}
      <Box className="hps-content">{renderStep()}</Box>

      {/* Error */}
      {error && <Typography className="hps-error">{error}</Typography>}

      {/* Footer Buttons */}
      <Box className="hps-footer">
        {currentStep > 0 && (
          <Button
            className="hps-btn-back"
            onClick={handleBack}
            disabled={loading}
          >
            Back
          </Button>
        )}
        <Button
          className="hps-btn-next"
          onClick={isLastStep ? handleSubmit : handleNext}
          disabled={loading}
        >
          {loading ? "Saving..." : isLastStep ? "Save Profile" : "Next"}
        </Button>
      </Box>
    </Box>
  );
}
