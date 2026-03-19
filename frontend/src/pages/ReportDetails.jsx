import React, { useEffect, useState } from "react";
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
  completed: { bg: "#d5eab3", color: "#3a7d11" },
  failed: { bg: "#fff0f0", color: "#d94f4f" },
};

// ─── Main Component ───────────────────────────────────────────────────
function ReportDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await instance.get(`/reports/${id}`);
        setReport(res.data.report);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [id]);

  const handleGenerateSummary = async () => {
    try {
      setAiLoading(true);
      const res = await instance.post(`/reports/${id}/ai-summary`);
      setReport((p) => ({
        ...p,
        aiSummary: res.data.aiSummary,
        aiStatus: "completed",
      }));
    } catch (err) {
      setReport((p) => ({
        ...p,
        aiStatus: "failed",
        aiError: err.response?.data?.message || "Failed",
      }));
    } finally {
      setAiLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await instance.delete(`/reports/${id}`);
      navigate("/reports", { replace: true });
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = report.fileUrl;
    a.download = report.fileName;
    a.target = "_blank";
    a.click();
  };

  const handleShare = async () => {
    if (navigator.share)
      await navigator.share({ title: report.reportType, url: report.fileUrl });
    else {
      await navigator.clipboard.writeText(report.fileUrl);
      alert("Link copied!");
    }
  };

  // ─── Loading State ───
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
              label={report.aiStatus}
              size="small"
              className="rd-ai-status-chip"
              sx={{
                ml: "auto !important",
                bgcolor: statusStyle.bg,
                color: statusStyle.color,
              }}
            />
          </Stack>

          {report.aiStatus === "completed" && report.aiSummary ? (
            <Typography className="rd-ai-summary-text">
              {report.aiSummary}
            </Typography>
          ) : report.aiStatus === "failed" ? (
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
            <Box>
              <Typography className="rd-ai-pending-text">
                No summary yet. Let AI analyse this report and extract key
                health insights.
              </Typography>
              <Button
                fullWidth
                onClick={handleGenerateSummary}
                disabled={aiLoading}
                startIcon={
                  aiLoading ? (
                    <CircularProgress size={16} sx={{ color: "#fff" }} />
                  ) : (
                    <BoltIcon fontSize="small" />
                  )
                }
                className="rd-generate-btn"
              >
                {aiLoading ? "Analysing…" : "Generate Summary"}
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
