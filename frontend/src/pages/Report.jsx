import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import instance from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import {
  IconButton,
  Avatar,
  Tabs,
  Tab,
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Fab,
  Card,
  CardContent,
  Chip,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import UploadOptionsSheet from "../components/UploadOptionSheet.jsx";
import UploadBox from "../components/UploadBox.jsx";
import "./Report.css";

function Report() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [showUploadOptions, setShowUploadOptions] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  // Fetch reports on component mount
  useEffect(() => {
    fetchReport();
  }, []);

  // Fetch reports from backend
  const fetchReport = async () => {
    try {
      setLoading(true);
      const response = await instance.get("/reports");
      setReports(response.data.reports || []);
    } catch (err) {
      console.error("Failed to fetch reports:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  // Filter reports based on tab and search query
  const getFilteredReports = () => {
    let filtered = reports;

    // Filter by tab
    if (selectedTab === 1) {
      filtered = filtered.filter((r) => r.uploadedBy === "Doctor");
    } else if (selectedTab === 2) {
      filtered = filtered.filter((r) => r.uploadedBy === "Me");
    } else if (selectedTab === 3) {
      filtered = filtered.filter((r) => r.uploadedBy === "Lab");
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (r) =>
          r.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.reportType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.doctorClinicName?.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    return filtered;
  };

  // Handle file selection from upload sheet
  const handleFileSelect = (file) => {
    console.log("Selected file:", file);
    navigate("/reports/upload", { state: { file } });
  };

  const filteredReports = getFilteredReports();

  // Card background colors (cycle through them)
  const cardColors = ["#D5EAB3", "#DCE9FF", "#FFE6F0", "#FFF4E6"];

  const handleOptionSelect = (type) => {
    if (type === "files") {
      navigate("/reports/upload");
    } else if (type === "gallery") {
      // trigger file input with image/* accept
      navigate("/reports/upload", { state: { accept: "image/*" } });
    } else if (type === "camera") {
      // trigger camera (mobile only)
      navigate("/reports/upload", {
        state: { accept: "image/*", capture: "camera" },
      });
    }
  };

  return (
    <div className="report-page">
      {/* Header/Navbar */}
      <div className="navbar">
        <IconButton
          sx={{
            backgroundColor: "#f5f5f5",
            "&:hover": { backgroundColor: "#e0e0e0" },
          }}
          onClick={() => navigate(-1)}
        >
          <ChevronLeftIcon />
        </IconButton>

        <h4>Medical Records</h4>

        <Avatar
          src={user?.profileImage}
          alt={user?.name}
          sx={{
            width: 40,
            height: 40,
            bgcolor: "#3e7df5",
          }}
        >
          {user?.name?.charAt(0).toUpperCase()}
        </Avatar>
      </div>

      {/* Tabs Section */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", px: 2 }}>
        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 500,
              fontSize: "15px",
              minWidth: "auto",
              px: 2,
            },
            "& .Mui-selected": {
              color: "#3e7df5",
            },
            "& .MuiTabs-indicator": {
              backgroundColor: "#3e7df5",
            },
          }}
        >
          <Tab label="All" />
          <Tab label="Added by Doctor" />
          <Tab label="Added by You" />
          <Tab label="Lab Reports" />
        </Tabs>
      </Box>

      {/* Content Section */}
      <Box sx={{ p: 2 }}>
        {loading ? (
          <div className="loading-state">
            <Typography>Loading reports...</Typography>
          </div>
        ) : (
          /* Reports List - SHOW WHEN REPORTS EXIST */
          <>
            {/* Search Bar + FAB */}
            <Box sx={{ display: "flex", gap: 1, mb: 2, alignItems: "center" }}>
              <TextField
                fullWidth
                placeholder="Search records..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: "#7a8799" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                    bgcolor: "#fff",
                    "& fieldset": { borderColor: "#e0e0e0" },
                  },
                }}
              />
              <Fab
                color="primary"
                size="medium"
                onClick={() => setShowUploadOptions(true)}
                sx={{
                  bgcolor: "#3e7df5",
                  "&:hover": { bgcolor: "#2d62d4" },
                }}
              >
                <AddIcon />
              </Fab>
            </Box>

            {/* Report Cards */}
            <div className="reports-container">
              {filteredReports.map((report, index) => (
                <Card
                  key={report._id}
                  className="report-card"
                  sx={{
                    bgcolor: cardColors[index % cardColors.length],
                    mb: 2,
                  }}
                  onClick={() => {
                    navigate(`/reports/${report._id}`);
                  }}
                >
                  <CardContent
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      py: 2,
                    }}
                  >
                    <Box className="report-icon-container">
                      <DescriptionOutlinedIcon
                        sx={{ fontSize: 28, color: "#3e7df5" }}
                      />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body1" fontWeight={600}>
                        {report.reportType || report.fileName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {report.doctorClinicName || "No clinic"} •{" "}
                        {new Date(report.uploadedAt).toLocaleDateString(
                          "en-IN",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          },
                        )}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
        {!searchQuery && (
          <UploadBox onUploadClick={() => setShowUploadOptions(true)} />
        )}
      </Box>

      {/* Upload Options Bottom Sheet */}
      <UploadOptionsSheet
        open={showUploadOptions}
        onClose={() => setShowUploadOptions(false)}
        onSelect={handleOptionSelect} // ← Change IonSelect to onSelect
      />
    </div>
  );
}

export default Report;
