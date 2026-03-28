import { Typography, Chip } from "@mui/material";
import "./Step5Symptoms.css";

const SYMPTOM_OPTIONS = [
  "Fatigue",
  "Hair Loss",
  "Breathlessness",
  "Chest Pain",
  "Frequent Urination",
  "Excessive Thirst",
  "Weight Loss",
  "Weight Gain",
  "Headaches",
  "Joint Pain",
  "Back Pain",
  "Blurred Vision",
  "Nausea",
  "Swelling in legs",
  "Poor Sleep",
  "Anxiety",
  "Low Mood",
  "Brain Fog",
  "Irregular Heartbeat",
];

export default function Step5Symptoms({ data, onChange }) {
  const toggle = (symptom) => {
    if (data.includes(symptom)) {
      onChange(data.filter((s) => s !== symptom));
    } else {
      onChange([...data, symptom]);
    }
  };

  return (
    <div className="step5-root">
      <Typography className="hps-step-desc">
        Select any symptoms you are currently experiencing.
      </Typography>

      <div className="hps-card">
        <Typography className="hps-card-title">Current Symptoms</Typography>
        <div className="hps-chips-list">
          {SYMPTOM_OPTIONS.map((symptom) => (
            <Chip
              key={symptom}
              label={symptom}
              onClick={() => toggle(symptom)}
              className={`hps-symptom-chip ${data.includes(symptom) ? "hps-symptom-chip--selected" : ""}`}
            />
          ))}
        </div>
      </div>

      {data.length > 0 && (
        <div className="step5-selected-note">
          <Typography className="step5-selected-text">
            {data.length} symptom{data.length > 1 ? "s" : ""} selected
          </Typography>
        </div>
      )}
    </div>
  );
}
