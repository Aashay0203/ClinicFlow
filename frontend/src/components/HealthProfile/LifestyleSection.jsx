import { Box, Typography } from "@mui/material";

function toLabel(key) {
  return key.replace(/([A-Z])/g, " $1").replace(/^./, (m) => m.toUpperCase());
}

export default function LifestyleSection({
  lifestyle = {},
  familyHistory = {},
  currentSymptoms = [],
}) {
  const lifestyleItems = Object.entries(lifestyle)
    .filter(([, value]) => value !== null && value !== undefined)
    .map(([key, value]) => `${toLabel(key)}: ${String(value)}`);

  const familyItems = Object.entries(familyHistory).flatMap(([key, value]) => {
    if (Array.isArray(value)) {
      return value.map((item) => `${item} (Family ${toLabel(key)})`);
    }
    if (value === true) {
      return [`Family ${toLabel(key)}`];
    }
    return [];
  });

  const symptomItems = currentSymptoms
    .filter(Boolean)
    .map((item) => `Symptom: ${item}`);

  const allItems = [...lifestyleItems, ...familyItems, ...symptomItems];

  if (allItems.length === 0) {
    return (
      <Typography className="hp-empty-inline">
        No lifestyle or symptom details available.
      </Typography>
    );
  }

  return (
    <Box className="hp-bullet-list">
      {allItems.map((item) => (
        <Typography key={item} className="hp-bullet-item">
          • {item}
        </Typography>
      ))}
    </Box>
  );
}
