import { Typography, Switch } from "@mui/material";
import "./Step1Conditions.css";

const CONDITIONS = [
  {
    key: "diabetes",
    label: "Diabetes",
    desc: "Type 1, Type 2, or Pre-diabetic",
  },
  {
    key: "hypertension",
    label: "High Blood Pressure",
    desc: "Hypertension or on BP medication",
  },
  {
    key: "thyroid",
    label: "Thyroid Disorder",
    desc: "Hypothyroid or Hyperthyroid",
  },
];

export default function Step1Conditions({ data, onChange }) {
  const toggle = (key) => {
    onChange({ ...data, [key]: !data[key] });
  };

  return (
    <div className="step1-root">
      <Typography className="hps-step-desc">
        Select any conditions you have been diagnosed with.
      </Typography>

      <div className="hps-card">
        {CONDITIONS.map(({ key, label, desc }) => (
          <div className="hps-check-row" key={key}>
            <div className="step1-label-group">
              <Typography className="hps-check-label">{label}</Typography>
              <Typography className="step1-check-desc">{desc}</Typography>
            </div>
            <Switch
              checked={!!data[key]}
              onChange={() => toggle(key)}
              color="primary"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
