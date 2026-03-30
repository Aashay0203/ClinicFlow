import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IconButton } from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import instance from "../api/axios";
import DoctorCard from "../components/DoctorCard"; // <-- ADD THIS IMPORT
import "./DoctorList.css";

export default function DoctorList() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const res = await instance.get("/doctors/allDoctors");
      setDoctors(res.data.allDoctors);
    } catch (err) {
      setError("Failed to load doctors. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const filteredDoctors = doctors.filter(
    (doc) =>
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.speciality.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="list-container">
      <div className="list-top-nav">
        <IconButton className="list-back-btn" onClick={() => navigate(-1)}>
          <ArrowBackIosNewIcon fontSize="small" />
        </IconButton>
        <IconButton className="list-home-btn" onClick={() => navigate("/home")}>
          <HomeOutlinedIcon fontSize="small" />
        </IconButton>
      </div>

      <div className="list-header">
        <input
          type="text"
          className="search-bar"
          placeholder="Search by name or speciality..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <div className="loading-state">Loading available doctors...</div>
      ) : (
        <div className="doctor-grid">
          {filteredDoctors.length > 0 ? (
            filteredDoctors.map((doctor) => (
              // Use the new DoctorCard component here!
              <DoctorCard
                key={doctor._id}
                doctor={doctor}
                onBook={() => navigate(`/booking/${doctor._id}`)}
              />
            ))
          ) : (
            <div className="no-results">
              No doctors found matching your search.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
