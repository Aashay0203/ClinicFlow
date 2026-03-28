import { useState } from "react";
import { Typography, Switch, TextField, IconButton, Chip } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import "./Step4FamilyHistory.css";

const CONDITIONS = [
  { key: "diabetes", label: "Diabetes" },
  { key: "heartDisease", label: "Heart Disease" },
  { key: "cancer", label: "Cancer" },
];

export default function Step4FamilyHistory({ data, onChange }) {
  const [genInput, setGenInput] = useState("");

  const toggleCondition = (key) => {
    onChange({ ...data, [key]: !data[key] });
  };

  const addGenetic = () => {
    const val = genInput.trim();
    if (!val) return;
    onChange({
      ...data,
      geneticConditions: [...(data.geneticConditions || []), val],
    });
    setGenInput("");
  };

  const removeGenetic = (idx) => {
    onChange({
      ...data,
      geneticConditions: data.geneticConditions.filter((_, i) => i !== idx),
    });
  };

  return (
    <div className="step4-root">
      <Typography className="hps-step-desc">
        Family history helps identify genetic risk factors for certain
        conditions.
      </Typography>

      <div className="hps-card">
        <Typography className="hps-card-title">Conditions in Family</Typography>
        {CONDITIONS.map(({ key, label }) => (
          <div className="hps-check-row" key={key}>
            <Typography className="hps-check-label">{label}</Typography>
            <Switch
              checked={!!data[key]}
              onChange={() => toggleCondition(key)}
              color="primary"
            />
          </div>
        ))}
      </div>

      <div className="hps-card">
        <Typography className="hps-card-title">
          Other Genetic / Hereditary Conditions
        </Typography>
        <div className="hps-add-row">
          <TextField
            className="hps-add-input"
            fullWidth
            size="small"
            placeholder="e.g. Thalassemia, Haemophilia"
            value={genInput}
            onChange={(e) => setGenInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addGenetic()}
          />
          <IconButton className="hps-add-btn" onClick={addGenetic}>
            <AddIcon />
          </IconButton>
        </div>
        {(data.geneticConditions || []).length > 0 && (
          <div className="hps-chips-list">
            {data.geneticConditions.map((item, i) => (
              <Chip
                key={i}
                label={item}
                onDelete={() => removeGenetic(i)}
                className="hps-chip"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
