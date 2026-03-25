import React, { useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Box, Typography, Button, Snackbar, Alert } from "@mui/material";
import { Download, IosShare, CheckCircle } from "@mui/icons-material";
import html2canvas from "html2canvas";
import "./PatientIdCard.css";

const PatientIDCard = ({
  name,
  patientId,
  phone,
  bloodGroup,
  abhaId,
  profilePicture,
}) => {
  const cardRef = useRef(null);
  const [snack, setSnack] = useState({
    open: false,
    msg: "",
    severity: "success",
  });
  const [downloading, setDownloading] = useState(false);

  const qrValue = `DELHIMED|ID:${patientId || "N/A"}|NAME:${name || ""}|PH:${phone || ""}|BG:${bloodGroup || "NA"}`;

  const formatPhone = (ph) => {
    if (ph === null || ph === undefined || ph === "") return "—";
    const raw =
      typeof ph === "string" || typeof ph === "number" ? String(ph) : "";
    if (!raw) return "—";
    const digits = raw.replace(/\D/g, "");
    if (digits.length === 10) return `${digits.slice(0, 5)} ${digits.slice(5)}`;
    if (digits.length === 12)
      return `+${digits.slice(0, 2)} ${digits.slice(2, 7)} ${digits.slice(7)}`;
    return raw;
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        useCORS: true,
        allowTaint: false,
        scale: 3,
        backgroundColor: null,
        logging: false,
        imageTimeout: 8000,
      });
      const link = document.createElement("a");
      link.download = `DelhiMed-${patientId || "card"}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      setSnack({
        open: true,
        msg: "Card saved to your device!",
        severity: "success",
      });
    } catch {
      setSnack({
        open: true,
        msg: "Download failed. Try again.",
        severity: "error",
      });
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    const shareText = `My DelhiMed Patient Card\nName: ${name}\nPatient ID: ${patientId}\nPhone: ${phone}${bloodGroup ? `\nBlood Group: ${bloodGroup}` : ""}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: "My DelhiMed Patient Card",
          text: shareText,
        });
      } else {
        await navigator.clipboard.writeText(shareText);
        setSnack({
          open: true,
          msg: "Details copied to clipboard!",
          severity: "success",
        });
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        setSnack({
          open: true,
          msg: "Could not share. Try downloading instead.",
          severity: "error",
        });
      }
    }
  };

  return (
    <Box className="pid-wrapper">
      {/* ── Card — entire box captured by html2canvas on download ── */}
      <Box ref={cardRef} className="pid-card">
        {/* Decorative background circles */}
        <Box className="pid-deco pid-deco--tl" />
        <Box className="pid-deco pid-deco--br" />
        <Box className="pid-deco pid-deco--mid" />

        {/* Header */}
        <Box className="pid-header">
          <Box className="pid-brand">
            <Box className="pid-logo-badge">+</Box>
            <Typography className="pid-logo-text">DelhiMed</Typography>
          </Box>
          <Typography className="pid-year-label">
            PATIENT CARD · {new Date().getFullYear()}
          </Typography>
        </Box>

        {/* Body */}
        <Box className="pid-body">
          {/* Left: avatar + patient details */}
          <Box className="pid-left">
            {profilePicture ? (
              <img
                src={profilePicture}
                crossOrigin="anonymous"
                className="pid-avatar-img"
                alt={name}
              />
            ) : (
              <Box className="pid-avatar-fallback">
                <Typography className="pid-avatar-initial">
                  {name?.charAt(0)?.toUpperCase() || "?"}
                </Typography>
              </Box>
            )}

            <Box className="pid-info">
              <Typography className="pid-name">{name}</Typography>
              <Typography className="pid-id-label">ID: {patientId}</Typography>
              <Box className="pid-meta-row">
                {bloodGroup && (
                  <Box className="pid-badge pid-badge--blood">
                    <span>🩸</span>
                    <Typography className="pid-badge-text">
                      {bloodGroup}
                    </Typography>
                  </Box>
                )}
                <Typography className="pid-phone">
                  {formatPhone(phone)}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Right: QR code */}
          <Box className="pid-qr-box">
            <QRCodeCanvas
              value={qrValue}
              size={78}
              bgColor="#ffffff"
              fgColor="#1a4fa8"
              level="M"
              style={{ display: "block", borderRadius: "4px" }}
            />
            <Typography className="pid-qr-label">Scan to verify</Typography>
          </Box>
        </Box>

        {/* Footer */}
        <Box className="pid-footer">
          {abhaId ? (
            <Box className="pid-abha-row">
              <CheckCircle className="pid-abha-icon" />
              <Typography className="pid-abha-text">ABHA: {abhaId}</Typography>
            </Box>
          ) : (
            <Typography className="pid-abha-text pid-abha-unlinked">
              ABHA not linked
            </Typography>
          )}
          <Typography className="pid-tagline">
            Your Health, Our Priority
          </Typography>
        </Box>
      </Box>

      {/* ── Action Buttons ── */}
      <Box className="pid-actions">
        <Button
          className={`pid-btn pid-btn--outline${downloading ? " pid-btn--downloading" : ""}`}
          onClick={handleDownload}
          disabled={downloading}
          startIcon={<Download />}
          variant="outlined"
          disableElevation
        >
          {downloading ? "Saving…" : "Download"}
        </Button>

        <Button
          className="pid-btn pid-btn--filled"
          onClick={handleShare}
          startIcon={<IosShare />}
          variant="contained"
          disableElevation
        >
          Share
        </Button>
      </Box>

      {/* ── Feedback snackbar ── */}
      <Snackbar
        open={snack.open}
        autoHideDuration={2800}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          className="pid-snack-alert"
          severity={snack.severity}
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PatientIDCard;
