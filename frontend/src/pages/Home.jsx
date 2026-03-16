import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import DoctorCard from "../components/DoctorCard";
import instance from "../api/axios";
import Box from "@mui/material/Box";
import "./Home.css";
import MedicationBox from "../components/MedicationBox";

function Home() {
  const [doctors, setDoctors] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (doctors.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = (prev + 1) % doctors.length;
        scrollRef.current?.scrollTo({
          left: next * scrollRef.current.offsetWidth,
          behavior: "smooth",
        });
        return next;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [doctors]);

  const fetchDoctors = async () => {
    try {
      const res = await instance.get("/doctor/allDoctors");
      setDoctors(res.data.allDoctors);
    } catch (err) {
      setError("Failed to load doctors. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-root">
      <Navbar />
      <div className="home-content">
        <div className="home-hero">
          <h1 className="home-hero-heading">
            Find the Perfect Doctor for{" "}
            <span className="home-hero-blue">Your Needs</span>
          </h1>
        </div>

        {error && <p className="home-error">{error}</p>}

        {loading ? (
          <p className="home-loading">Loading...</p>
        ) : (
          <>
            <Box ref={scrollRef} className="home-doctors-row">
              {doctors.map((doctor) => (
                <Box key={doctor._id} className="home-doctor-item">
                  <DoctorCard
                    doctor={doctor}
                    onBook={() => navigate(`/booking/${doctor._id}`)}
                  />
                </Box>
              ))}
            </Box>

            <div className="home-dots">
              {doctors.map((_, i) => (
                <span
                  key={i}
                  className={`home-dot ${i === currentIndex ? "home-dot-active" : ""}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
      <MedicationBox />
    </div>
  );
}

export default Home;
