import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import instance from "../api/axios";
import {
  Box,
  Typography,
  IconButton,
  Chip,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogActions,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import DownloadIcon from "@mui/icons-material/Download";
import ShareIcon from "@mui/icons-material/Share";
import BoltIcon from "@mui/icons-material/Bolt";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import "./ReportDetails.css";

// ─── Reusable MetaItem ───────────────────────────────────────────────
const MetaItem = ({ label, value }) => (
  <Box>
    <Typography className="rd-meta-label">{label}</Typography>
    <Typography className="rd-meta-value">{value || "—"}</Typography>
  </Box>
);

// ─── Helpers ─────────────────────────────────────────────────────────
const formatDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "—";

const formatSize = (b) =>
  !b
    ? "—"
    : b < 1048576
      ? `${(b / 1024).toFixed(1)} KB`
      : `${(b / 1048576).toFixed(2)} MB`;

const aiStatusStyle = {
  pending: { bg: "#fff8e6", color: "#d4820a" },
  processing: { bg: "#dce9ff", color: "#3e7df5" },
  completed: { bg: "#d5eab3", color: "#3a7d11" },
  failed: { bg: "#fff0f0", color: "#d94f4f" },
};

const getNormalizedAiSummary = (rawSummary) => {
  if (!rawSummary) return { plainSummary: [], testTable: [] };

  if (typeof rawSummary === "string") {
    return {
      plainSummary: [rawSummary],
      testTable: [],
    };
  }

  const testTable = Array.isArray(rawSummary.testTable)
    ? rawSummary.testTable
    : [];

  const plainSummaryRaw =
    rawSummary.plainSummary || rawSummary.summary || rawSummary.simpleSummary;

  const plainSummary = Array.isArray(plainSummaryRaw)
    ? plainSummaryRaw.filter(Boolean)
    : plainSummaryRaw
      ? [String(plainSummaryRaw)]
      : [];

  return {
    plainSummary,
    testTable,
  };
};

const getStatusClassName = (status) => {
  const safeStatus = String(status || "Unknown").toLowerCase();
  if (safeStatus === "high" || safeStatus === "critical") {
    return "rd-status-high";
  }
  if (safeStatus === "low") {
    return "rd-status-low";
  }
  if (safeStatus === "normal") {
    return "rd-status-normal";
  }
  return "rd-status-unknown";
};

const POLL_INTERVAL_MS = 3000; // poll every 3 seconds
const POLL_MAX_ATTEMPTS = 60; // give up after 3 minutes (60 × 3s)

// ─── Main Component ───────────────────────────────────────────────────
function ReportDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Refs so polling callbacks always see the latest values without stale closures
  const pollingRef = useRef(null);
  const pollAttemptsRef = useRef(0);

  // ─── Stop polling helper ─────────────────────────────────────────
  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    pollAttemptsRef.current = 0;
  }, []);

  // ─── Start polling ai-status ─────────────────────────────────────
  const startPolling = useCallback(() => {
    stopPolling(); // clear any existing poll first
    pollAttemptsRef.current = 0;

    pollingRef.current = setInterval(async () => {
      pollAttemptsRef.current += 1;

      // Safety: stop after max attempts
      if (pollAttemptsRef.current > POLL_MAX_ATTEMPTS) {
        stopPolling();
        setAiLoading(false);
        setReport((prev) => ({
          ...prev,
          aiStatus: "failed",
          aiError: "Analysis timed out. Please try again.",
        }));
        return;
      }

      try {
        const res = await instance.get(`/report/${id}/ai-status`);
        const { aiStatus, aiSummary, aiError } = res.data;

        if (aiStatus === "completed") {
          stopPolling();
          setAiLoading(false);
          setReport((prev) => ({
            ...prev,
            aiStatus: "completed",
            aiSummary,
            aiError: null,
          }));
        } else if (aiStatus === "failed") {
          stopPolling();
          setAiLoading(false);
          setReport((prev) => ({
            ...prev,
            aiStatus: "failed",
            aiError: aiError || "Analysis failed. Please retry.",
          }));
        }
        // if still "pending" or "processing" — keep polling
      } catch (err) {
        console.error("[Poll] ai-status error:", err.message);
        // Don't stop polling on network hiccup — Gemini can take time
      }
    }, POLL_INTERVAL_MS);
  }, [id, stopPolling]);

  // ─── Cleanup polling on unmount ───────────────────────────────────
  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  // ─── Fetch report on mount ────────────────────────────────────────
  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await instance.get(`/report/${id}`);
        const fetchedReport = res.data.report;
        setReport(fetchedReport);

        // If AI was already processing when the user opens the page, auto-start polling
        if (
          fetchedReport.aiStatus === "pending" ||
          fetchedReport.aiStatus === "processing"
        ) {
          setAiLoading(true);
          startPolling();
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [id, startPolling]);

  // ─── Trigger AI + start polling ───────────────────────────────────
  const handleGenerateSummary = async () => {
    try {
      setAiLoading(true);
      // Fire the trigger — backend returns immediately, AI runs in background
      await instance.post(`/report/${id}/regenerate-summary`);
      // Now poll until done — aiLoading stays true the whole time
      startPolling();
    } catch (err) {
      setAiLoading(false);
      setReport((prev) => ({
        ...prev,
        aiStatus: "failed",
        aiError: err.response?.data?.message || "Failed to start analysis.",
      }));
    }
  };

  // ─── Delete ───────────────────────────────────────────────────────
  const handleDelete = async () => {
    try {
      setDeleting(true);
      await instance.delete(`/report/${id}`);
      navigate("/reports", { replace: true });
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  // ─── Download ─────────────────────────────────────────────────────
  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = report.fileUrl;
    a.download = report.fileName;
    a.target = "_blank";
    a.click();
  };

  // ─── Share ────────────────────────────────────────────────────────
  const handleShare = async () => {
    if (navigator.share)
      await navigator.share({ title: report.reportType, url: report.fileUrl });
    else {
      await navigator.clipboard.writeText(report.fileUrl);
      alert("Link copied!");
    }
  };

  // ─── Loading State ────────────────────────────────────────────────
  if (loading)
    return (
      <Box className="rd-page">
        <Skeleton
          variant="rounded"
          height={52}
          sx={{ borderRadius: 3, mb: 2 }}
        />
        <Skeleton
          variant="rounded"
          height={260}
          sx={{ borderRadius: 3, mb: 2 }}
        />
        <Skeleton
          variant="rounded"
          height={180}
          sx={{ borderRadius: 3, mb: 2 }}
        />
        <Skeleton variant="rounded" height={140} sx={{ borderRadius: 3 }} />
      </Box>
    );

  if (!report)
    return (
      <Box className="rd-page rd-not-found">
        <Typography color="#7a8799">Report not found.</Typography>
      </Box>
    );

  const normalizedAiSummary = getNormalizedAiSummary(report.aiSummary);
  const tableRows = normalizedAiSummary.testTable.filter(
    (row) => row && (row.testName || row.value || row.status || row.unit),
  );
  const statusStyle = aiStatusStyle[report.aiStatus] || aiStatusStyle.pending;

  return (
    <Box className="rd-page">
      {/* ── Header ── */}
      <Box className="rd-header">
        <IconButton className="rd-icon-btn" onClick={() => navigate(-1)}>
          <ArrowBackIosNewIcon fontSize="small" />
        </IconButton>
        <Typography className="rd-header-title">Report Details</Typography>
        <IconButton
          className="rd-icon-btn rd-delete-icon-btn"
          onClick={() => setDeleteOpen(true)}
        >
          <DeleteOutlineIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* ── All Cards ── */}
      <Stack spacing={2} sx={{ px: 2 }} className="rd-content-stack">
        {/* ── File Preview ── */}
        <Box
          className="rd-card rd-preview-card"
          onClick={() => window.open(report.fileUrl, "_blank")}
          sx={{ cursor: "pointer" }}
        >
          {report.fileType === "pdf" ? (
            <iframe
              className="rd-pdf-iframe"
              src={`${report.fileUrl}#toolbar=0`}
              title={report.fileName}
            />
          ) : (
            <Box
              component="img"
              src={report.fileUrl}
              alt={report.fileName}
              className="rd-img-preview"
            />
          )}
          <Chip
            label={report.fileType?.toUpperCase()}
            size="small"
            className="rd-file-badge"
          />
        </Box>

        {/* ── Metadata Card ── */}
        <Box className="rd-card">
          <Stack direction="row" alignItems="center" spacing={1.5} mb={2}>
            <Box className="rd-type-icon">
              <ArticleOutlinedIcon />
            </Box>
            <Box>
              <Typography className="rd-report-type">
                {report.reportType}
              </Typography>
              <Typography className="rd-clinic-name">
                {report.doctorClinicName}
              </Typography>
            </Box>
          </Stack>

          <Box className="rd-divider" />

          <Box className="rd-meta-grid">
            <MetaItem
              label="Report Date"
              value={formatDate(report.reportDate)}
            />
            <MetaItem label="Uploaded By" value={report.uploadedBy} />
            <MetaItem label="File Name" value={report.fileName} />
            <MetaItem label="File Size" value={formatSize(report.fileSize)} />
          </Box>

          {report.tags?.length > 0 && (
            <Stack direction="row" flexWrap="wrap" gap={1} mt={2}>
              {report.tags.map((tag, i) => (
                <Chip
                  key={i}
                  label={tag}
                  size="small"
                  className="rd-tag-chip"
                />
              ))}
            </Stack>
          )}
        </Box>

        {/* ── AI Summary Card ── */}
        <Box className="rd-card rd-ai-card">
          <Stack direction="row" alignItems="center" spacing={1.5} mb={2}>
            <Box className="rd-ai-icon">
              <AutoAwesomeIcon fontSize="small" />
            </Box>
            <Box>
              <Typography className="rd-ai-title">AI Health Summary</Typography>
              <Typography className="rd-ai-sub">
                Powered by DelhiMed AI
              </Typography>
            </Box>
            <Chip
              label={aiLoading ? "analysing..." : report.aiStatus}
              size="small"
              className="rd-ai-status-chip"
              sx={{
                ml: "auto !important",
                bgcolor: aiLoading ? "#dce9ff" : statusStyle.bg,
                color: aiLoading ? "#3e7df5" : statusStyle.color,
              }}
            />
          </Stack>

          {/* ── Completed: show summary + test table ── */}
          {report.aiStatus === "completed" && report.aiSummary && !aiLoading ? (
            <Box className="rd-ai-complete-wrap">
              {tableRows.length > 0 ? (
                <>
                  <Typography className="rd-ai-section-title">
                    Key Lab Findings
                  </Typography>
                  <TableContainer className="rd-test-table-wrap">
                    <Table size="small" className="rd-test-table">
                      <TableHead>
                        <TableRow>
                          <TableCell className="rd-th">Test</TableCell>
                          <TableCell className="rd-th">Value</TableCell>
                          <TableCell className="rd-th">Range</TableCell>
                          <TableCell className="rd-th">Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {tableRows.map((row, idx) => {
                          const status = row.status || "Unknown";
                          return (
                            <TableRow key={`${row.testName || "test"}-${idx}`}>
                              <TableCell className="rd-td rd-td-test">
                                {row.testName || "-"}
                              </TableCell>
                              <TableCell className="rd-td">
                                {row.value ?? "-"}
                                {row.unit ? ` ${row.unit}` : ""}
                              </TableCell>
                              <TableCell className="rd-td">
                                {row.referenceRange || "-"}
                              </TableCell>
                              <TableCell className="rd-td">
                                <Chip
                                  size="small"
                                  label={status}
                                  className={`rd-status-chip ${getStatusClassName(status)}`}
                                />
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              ) : (
                <Typography
                  className="rd-ai-pending-text"
                  sx={{ mb: "0 !important" }}
                >
                  No lab value table was detected in this report.
                </Typography>
              )}

              {normalizedAiSummary.plainSummary.length > 0 && (
                <>
                  <Typography className="rd-ai-section-title">
                    Plain Summary
                  </Typography>
                  <Box className="rd-ai-summary-text">
                    {normalizedAiSummary.plainSummary.map((point, idx) => (
                      <Typography key={`${point}-${idx}`} className="rd-ai-summary-point">
                        {point}
                      </Typography>
                    ))}
                  </Box>
                </>
              )}
            </Box>
          ) : /* ── AI is running: show spinner ── */
          aiLoading ? (
            <Box className="rd-ai-loading-state">
              <CircularProgress size={28} sx={{ color: "#3e7df5" }} />
              <Typography className="rd-ai-pending-text">
                Analysing your report… This may take up to a minute.
              </Typography>
            </Box>
          ) : /* ── Failed: show error + retry ── */
          report.aiStatus === "failed" ? (
            <Box>
              <Typography className="rd-ai-pending-text">
                {report.aiError || "Summary generation failed."}
              </Typography>
              <Button
                onClick={handleGenerateSummary}
                disabled={aiLoading}
                className="rd-retry-btn"
              >
                Retry
              </Button>
            </Box>
          ) : (
            /* ── Pending/not started: show generate button ── */
            <Box>
              <Typography className="rd-ai-pending-text">
                No summary yet. Let AI analyse this report and extract key
                health insights.
              </Typography>
              <Button
                fullWidth
                onClick={handleGenerateSummary}
                disabled={aiLoading}
                startIcon={<BoltIcon fontSize="small" />}
                className="rd-generate-btn"
              >
                Generate Summary
              </Button>
            </Box>
          )}
        </Box>

        {/* ── Action Buttons ── */}
        <Box className="rd-actions">
          <Button
            fullWidth
            onClick={handleDownload}
            startIcon={<DownloadIcon />}
            className="rd-download-btn"
          >
            Download
          </Button>
          <Button
            fullWidth
            onClick={handleShare}
            startIcon={<ShareIcon />}
            className="rd-share-btn"
          >
            Share
          </Button>
        </Box>
      </Stack>

      {/* ── Delete Confirm Dialog ── */}
      <Dialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        PaperProps={{ className: "rd-dialog-paper" }}
      >
        <DialogContent sx={{ textAlign: "center", pt: 3 }}>
          <Typography fontSize={40} mb={1}>
            🗑️
          </Typography>
          <Typography className="rd-modal-title">Delete Report?</Typography>
          <Typography className="rd-modal-sub">
            This action cannot be undone. The file will be permanently removed
            from your Medical Vault.
          </Typography>
        </DialogContent>
        <DialogActions className="rd-dialog-actions">
          <Button
            fullWidth
            onClick={() => setDeleteOpen(false)}
            className="rd-modal-cancel"
          >
            Cancel
          </Button>
          <Button
            fullWidth
            onClick={handleDelete}
            disabled={deleting}
            className="rd-modal-confirm"
          >
            {deleting ? (
              <CircularProgress size={18} sx={{ color: "#fff" }} />
            ) : (
              "Delete"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ReportDetails;
