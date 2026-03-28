import {
  Box,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

const FIELD_LABELS = {
  hemoglobin: "Hemoglobin",
  wbc: "WBC",
  platelets: "Platelets",
  bloodSugar: "Blood Sugar",
  creatinine: "Creatinine",
  urea: "Urea",
  sodium: "Sodium",
  potassium: "Potassium",
  sgpt: "SGPT",
  sgot: "SGOT",
  bilirubin: "Bilirubin",
  cholesterol: "Cholesterol",
};

const STATUS_CLASS = {
  High: "hp-status-high",
  Low: "hp-status-low",
  Normal: "hp-status-normal",
  Critical: "hp-status-critical",
  Unknown: "hp-status-unknown",
};

export default function LabValuesTable({ labValues = {} }) {
  const rows = Object.entries(FIELD_LABELS)
    .map(([key, label]) => ({
      key,
      label,
      ...(labValues[key] || {}),
    }))
    .filter(
      (item) =>
        item.value !== null && item.value !== undefined && item.value !== "",
    );

  if (rows.length === 0) {
    return (
      <Typography className="hp-empty-inline">
        No lab values extracted from reports yet.
      </Typography>
    );
  }

  return (
    <TableContainer className="hp-table-wrap">
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell className="hp-th">Test</TableCell>
            <TableCell className="hp-th">Value</TableCell>
            <TableCell className="hp-th">Range</TableCell>
            <TableCell className="hp-th">Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => {
            const status = row.status || "Unknown";
            return (
              <TableRow key={row.key}>
                <TableCell className="hp-td">{row.label}</TableCell>
                <TableCell className="hp-td">
                  {row.value}
                  {row.unit ? ` ${row.unit}` : ""}
                </TableCell>
                <TableCell className="hp-td">
                  {row.referenceRange || "-"}
                </TableCell>
                <TableCell className="hp-td">
                  <Chip
                    size="small"
                    className={`hp-chip hp-status-chip ${STATUS_CLASS[status] || STATUS_CLASS.Unknown}`}
                    label={status}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
