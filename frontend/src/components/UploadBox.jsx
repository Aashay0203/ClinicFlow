import React from "react";
import { Box, Typography, Button } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import "./UploadBox.css";

function UploadBox({ onUploadClick }) {
  return (
    <Box className="empty-state-container">
      <Box className="illustration-box">
        <Typography className="illustration-emoji">📋</Typography>
      </Box>

      <Typography variant="h6" className="empty-state-heading">
        All your medical records in one place
      </Typography>

      <Box className="benefits-list">
        <Box className="benefit-item">
          <CheckCircleOutlineIcon className="benefit-icon" />
          <Typography variant="body2" className="benefit-text">
            Never lose your medical records
          </Typography>
        </Box>

        <Box className="benefit-item">
          <CheckCircleOutlineIcon className="benefit-icon" />
          <Typography variant="body2" className="benefit-text">
            Share your medical records with doctors
          </Typography>
        </Box>

        <Box className="benefit-item">
          <CheckCircleOutlineIcon className="benefit-icon" />
          <Typography variant="body2" className="benefit-text">
            Access prescriptions, reports and more, on the go
          </Typography>
        </Box>
      </Box>

      <Button
        fullWidth
        variant="contained"
        size="large"
        onClick={onUploadClick}
        className="add-record-button"
      >
        Add More Medical record
      </Button>
    </Box>
  );
}

export default UploadBox;
