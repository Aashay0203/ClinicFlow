import { useState } from "react";
import { Typography, TextField, IconButton, Chip } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import "./Step6MedsAllergies.css";

function AddableList({
  title,
  subtitle,
  placeholder,
  items,
  onAdd,
  onRemove,
  chipColor,
}) {
  const [input, setInput] = useState("");

  const handleAdd = () => {
    const val = input.trim();
    if (!val) return;
    onAdd(val);
    setInput("");
  };

  return (
    <div className="hps-card">
      <Typography className="hps-card-title">{title}</Typography>
      {subtitle && (
        <Typography className="step6-subtitle">{subtitle}</Typography>
      )}
      <div className="hps-add-row">
        <TextField
          className="hps-add-input"
          fullWidth
          size="small"
          placeholder={placeholder}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        />
        <IconButton className="hps-add-btn" onClick={handleAdd}>
          <AddIcon />
        </IconButton>
      </div>
      {items.length > 0 && (
        <div className="hps-chips-list">
          {items.map((item, i) => (
            <Chip
              key={i}
              label={item}
              onDelete={() => onRemove(i)}
              className={`hps-chip ${chipColor === "red" ? "step6-chip--red" : ""}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Step6MedsAllergies({
  medications,
  allergies,
  onMedsChange,
  onAllergiesChange,
}) {
  return (
    <div className="step6-root">
      <Typography className="hps-step-desc">
        Add any medications you currently take and known allergies. AI also
        extracts these from your reports — this is just your personal input.
      </Typography>

      <AddableList
        title="Current Medications"
        placeholder="e.g. Metformin 500mg"
        items={medications}
        onAdd={(val) => onMedsChange([...medications, val])}
        onRemove={(i) =>
          onMedsChange(medications.filter((_, idx) => idx !== i))
        }
      />

      <AddableList
        title="Known Allergies"
        subtitle="Drug, food, or environmental allergies"
        placeholder="e.g. Penicillin, Peanuts, Dust"
        items={allergies}
        onAdd={(val) => onAllergiesChange([...allergies, val])}
        onRemove={(i) =>
          onAllergiesChange(allergies.filter((_, idx) => idx !== i))
        }
        chipColor="red"
      />
    </div>
  );
}
