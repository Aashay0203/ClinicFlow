import { useState } from "react";
import { Typography, TextField, IconButton, Chip } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import "./Step2PastEvents.css";

function AddableList({ title, placeholder, items, onAdd, onRemove }) {
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
              className="hps-chip"
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Step2PastEvents({ data, onChange }) {
  const update = (key, val) => onChange({ ...data, [key]: val });

  const addItem = (key, val) => update(key, [...(data[key] || []), val]);
  const removeItem = (key, idx) =>
    update(
      key,
      data[key].filter((_, i) => i !== idx),
    );

  return (
    <div className="step2-root">
      <Typography className="hps-step-desc">
        Share any past medical events so doctors have a complete picture.
      </Typography>

      <AddableList
        title="Past Surgeries"
        placeholder="e.g. Appendectomy in 2019"
        items={data.surgeries || []}
        onAdd={(val) => addItem("surgeries", val)}
        onRemove={(i) => removeItem("surgeries", i)}
      />
      <AddableList
        title="Past Injuries"
        placeholder="e.g. Fractured wrist in 2021"
        items={data.injuries || []}
        onAdd={(val) => addItem("injuries", val)}
        onRemove={(i) => removeItem("injuries", i)}
      />
      <AddableList
        title="Major Illnesses"
        placeholder="e.g. Typhoid, Dengue, TB"
        items={data.majorIllness || []}
        onAdd={(val) => addItem("majorIllness", val)}
        onRemove={(i) => removeItem("majorIllness", i)}
      />
    </div>
  );
}
