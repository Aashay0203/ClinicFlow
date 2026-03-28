import { Box, Chip, Typography } from "@mui/material";

export default function CriticalChips({ bloodGroup, allergies = [] }) {
  const uniqueAllergies = [...new Set(allergies.filter(Boolean))];

  if (!bloodGroup && uniqueAllergies.length === 0) {
    return (
      <Typography className="hp-empty-inline">
        No blood group or allergy data available.
      </Typography>
    );
  }

  return (
    <Box className="hp-critical-wrap">
      {bloodGroup ? (
        <Chip
          className="hp-chip hp-chip-blood"
          label={`Blood Group: ${bloodGroup}`}
        />
      ) : null}

      {uniqueAllergies.map((item) => (
        <Chip key={item} className="hp-chip hp-chip-allergy" label={item} />
      ))}
    </Box>
  );
}
