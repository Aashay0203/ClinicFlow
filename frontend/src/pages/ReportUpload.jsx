import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useContext } from "react";
import instance from "../api/axios";
import {
  Box,
  Typography,
  IconButton,
  TextField,
  Button,
  MenuItem,
  Container,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import "./ReportUpload.css";

function ReportUpload() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(AuthContext);

  // Get file from navigation state (if coming from UploadOptionsSheet)
  const preSelectedFile = location.state?.file;

  const [selectedFile, setSelectedFile] = useState(preSelectedFile || null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    reportType: "",
    doctorClinicName: "",
    reportDate: "",
    uploadedBy: "Me",
    tags: "",
  });

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = [
        "application/pdf",
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
      ];
      if (!allowedTypes.includes(file.type)) {
        alert("Invalid file type. Please upload PDF or image files only.");
        return;
      }

      // Validate file size (10 MB)
      if (file.size > 10 * 1024 * 1024) {
        alert("File size must be less than 10 MB");
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      alert("Please select a file");
      return;
    }

    try {
      setUploading(true);

      // Create FormData
      const uploadData = new FormData();
      uploadData.append("file", selectedFile);
      uploadData.append("reportType", formData.reportType);
      uploadData.append("doctorClinicName", formData.doctorClinicName);
      uploadData.append("reportDate", formData.reportDate);
      uploadData.append("uploadedBy", formData.uploadedBy);
      uploadData.append(
        "tags",
        JSON.stringify(
          formData.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag),
        ),
      );

      const response = await instance.post("/reports/upload", uploadData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Report uploaded successfully!");
      navigate("/reports");
    } catch (error) {
      console.error("Upload failed:", error);
      alert(error.response?.data?.message || "Failed to upload report");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Container maxWidth="sm" className="report-upload-page">
      {/* Header */}
      <Box className="upload-header">
        <IconButton
          onClick={() => navigate(-1)}
          sx={{
            bgcolor: "#f5f5f5",
            "&:hover": { bgcolor: "#e0e0e0" },
          }}
        >
          <ChevronLeftIcon />
        </IconButton>
        <Typography variant="h6" fontWeight={600}>
          Upload Report
        </Typography>
        <Box sx={{ width: 40 }} /> {/* Spacer for centering */}
      </Box>

      {/* Upload Form */}
      <Box component="form" onSubmit={handleSubmit} className="upload-form">
        {/* File Selection */}
        <Box className="file-upload-section">
          <input
            type="file"
            id="file-upload-input"
            accept=".pdf,.jpg,.jpeg,.png,.webp"
            onChange={handleFileSelect}
            style={{ display: "none" }}
          />
          <label htmlFor="file-upload-input">
            <Box className="file-upload-area">
              {selectedFile ? (
                <Box className="file-selected">
                  <Typography fontSize="48px">
                    {selectedFile.type === "application/pdf" ? "📄" : "🖼️"}
                  </Typography>
                  <Typography fontWeight={600} mt={1}>
                    {selectedFile.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </Typography>
                </Box>
              ) : (
                <Box className="file-not-selected">
                  <Typography fontSize="48px">📤</Typography>
                  <Typography fontWeight={600} mt={1}>
                    Click to select file
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    PDF or images (max 10 MB)
                  </Typography>
                </Box>
              )}
            </Box>
          </label>
        </Box>

        {/* Form Fields */}
        <TextField
          fullWidth
          label="Report Type"
          name="reportType"
          value={formData.reportType}
          onChange={handleInputChange}
          placeholder="e.g., Blood Test, X-Ray, MRI"
          sx={{ mb: 2 }}
        />

        <TextField
          fullWidth
          label="Doctor/Clinic Name"
          name="doctorClinicName"
          value={formData.doctorClinicName}
          onChange={handleInputChange}
          placeholder="e.g., Dr. Sharma, Apollo Hospital"
          sx={{ mb: 2 }}
        />

        <TextField
          fullWidth
          label="Report Date"
          name="reportDate"
          type="date"
          value={formData.reportDate}
          onChange={handleInputChange}
          InputLabelProps={{ shrink: true }}
          sx={{ mb: 2 }}
        />

        <TextField
          fullWidth
          select
          label="Uploaded By"
          name="uploadedBy"
          value={formData.uploadedBy}
          onChange={handleInputChange}
          sx={{ mb: 2 }}
        >
          <MenuItem value="Me">Me</MenuItem>
          <MenuItem value="Doctor">Doctor</MenuItem>
          <MenuItem value="Lab">Lab</MenuItem>
        </TextField>

        <TextField
          fullWidth
          label="Tags (comma-separated)"
          name="tags"
          value={formData.tags}
          onChange={handleInputChange}
          placeholder="e.g., urgent, diabetes, follow-up"
          sx={{ mb: 3 }}
        />

        {/* Submit Button */}
        <Button
          fullWidth
          type="submit"
          variant="contained"
          size="large"
          disabled={uploading || !selectedFile}
          sx={{
            bgcolor: "#3e7df5",
            color: "#fff",
            borderRadius: "12px",
            py: 1.5,
            textTransform: "none",
            fontWeight: 600,
            fontSize: "16px",
            "&:hover": { bgcolor: "#2d62d4" },
            "&:disabled": { bgcolor: "#ccc" },
          }}
        >
          {uploading ? "Uploading..." : "Upload Report"}
        </Button>
      </Box>
    </Container>
  );
}

export default ReportUpload;
