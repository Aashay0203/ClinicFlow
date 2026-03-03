import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import instance from "../api/axios";
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
      // Adjust this endpoint based on your backend routes
      const res = await instance.get("/doctor/allDoctors");
      setDoctors(res.data.doctors || res.data); // Adjust based on your API response structure
    } catch (err) {
      setError("Failed to load doctors. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Filter doctors based on search input (name or speciality)
  const filteredDoctors = doctors.filter(
    (doc) =>
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.speciality.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="list-container">
      <div className="list-header">
        <h2>Find a Doctor</h2>
        <p>Select a specialist to book your appointment</p>

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
              <div key={doctor._id} className="doctor-card">
                <div className="doc-avatar">👨‍⚕️</div>
                <div className="doc-info">
                  <h3 className="doc-name">Dr. {doctor.name}</h3>
                  <p className="doc-speciality">{doctor.speciality}</p>
                  <div className="doc-details">
                    <span>⏱ {doctor.avgConsultTime} min consult</span>
                    <span>₹{doctor.fees}</span>
                  </div>
                </div>
                <button
                  className="book-btn"
                  onClick={() => navigate(`/booking/${doctor._id}`)}
                >
                  Book Appointment
                </button>
              </div>
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
