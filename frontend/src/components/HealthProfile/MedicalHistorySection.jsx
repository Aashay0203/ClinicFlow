import { Box, Typography } from "@mui/material";

function toLabel(key) {
  return key.replace(/([A-Z])/g, " $1").replace(/^./, (m) => m.toUpperCase());
}

export default function MedicalHistorySection({
  conditions = {},
  pastEvents = {},
  medications = [],
}) {
  const conditionList = Object.entries(conditions)
    .filter(([, value]) => Boolean(value))
    .map(([key]) => toLabel(key));

  const pastEventList = Object.entries(pastEvents).flatMap(([group, values]) =>
    (values || []).map((item) => `${item} (${toLabel(group)})`),
  );

  const allItems = [
    ...conditionList,
    ...pastEventList,
    ...medications.filter(Boolean),
  ];

  if (allItems.length === 0) {
    return (
      <Typography className="hp-empty-inline">
        No medical history provided yet.
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
