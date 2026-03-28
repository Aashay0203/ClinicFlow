import { Box, Typography } from "@mui/material";

function toLabel(key) {
  return key.replace(/([A-Z])/g, " $1").replace(/^./, (m) => m.toUpperCase());
}

export default function InsightsCard({
  insights = [],
  specialFlags = {},
  trends = {},
}) {
  const activeFlags = Object.entries(specialFlags)
    .filter(([, value]) => Boolean(value))
    .map(([key]) => toLabel(key));

  const trendItems = Object.entries(trends)
    .filter(([, value]) => Boolean(value))
    .map(([key, value]) => `${toLabel(key)}: ${value}`);

  if (
    insights.length === 0 &&
    activeFlags.length === 0 &&
    trendItems.length === 0
  ) {
    return (
      <Typography className="hp-empty-inline">
        AI insights will appear once enough report data is available.
      </Typography>
    );
  }

  return (
    <Box className="hp-insights-card">
      {activeFlags.length > 0 ? (
        <Box className="hp-insights-block">
          <Typography className="hp-insights-title">Special Flags</Typography>
          {activeFlags.map((item) => (
            <Typography key={item} className="hp-insights-item">
              • {item}
            </Typography>
          ))}
        </Box>
      ) : null}

      {trendItems.length > 0 ? (
        <Box className="hp-insights-block">
          <Typography className="hp-insights-title">Trends</Typography>
          {trendItems.map((item) => (
            <Typography key={item} className="hp-insights-item">
              • {item}
            </Typography>
          ))}
        </Box>
      ) : null}

      {insights.length > 0 ? (
        <Box className="hp-insights-block">
          <Typography className="hp-insights-title">
            Personalized Insights
          </Typography>
          {insights.map((item) => (
            <Typography key={item} className="hp-insights-item">
              • {item}
            </Typography>
          ))}
        </Box>
      ) : null}
    </Box>
  );
}
