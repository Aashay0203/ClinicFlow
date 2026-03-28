import { Typography, Button } from "@mui/material";
import "./Step3Lifestyle.css";

const SMOKING_OPTIONS = ["Never", "Former", "Current"];
const ALCOHOL_OPTIONS = ["Never", "Occasionally", "Regularly"];

function OptionGroup({ options, selected, onSelect }) {
  return (
    <div className="hps-option-group">
      {options.map((opt) => (
        <Button
          key={opt}
          className={`hps-option-btn ${selected === opt ? "hps-option-btn--selected" : ""}`}
          onClick={() => onSelect(selected === opt ? null : opt)}
        >
          {opt}
        </Button>
      ))}
    </div>
  );
}

export default function Step3Lifestyle({ data, onChange }) {
  return (
    <div className="step3-root">
      <Typography className="hps-step-desc">
        This helps doctors assess risk factors. All information is confidential.
      </Typography>

      <div className="hps-card">
        <Typography className="hps-card-title">Smoking</Typography>
        <OptionGroup
          options={SMOKING_OPTIONS}
          selected={data.smoking}
          onSelect={(val) => onChange({ ...data, smoking: val })}
        />
      </div>

      <div className="hps-card">
        <Typography className="hps-card-title">Alcohol</Typography>
        <OptionGroup
          options={ALCOHOL_OPTIONS}
          selected={data.alcohol}
          onSelect={(val) => onChange({ ...data, alcohol: val })}
        />
      </div>
    </div>
  );
}
