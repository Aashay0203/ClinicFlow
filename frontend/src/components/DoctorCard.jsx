import React from "react";
import "./DoctorCard.css";

// We pass 'doctor' and 'onBook' as props from the parent list
export default function DoctorCard({ doctor, onBook }) {
  return (
    <div className="premium-doc-card">
      {/* Top Section with Text and Absolute Image */}
      <div className="card-top-section">
        <div className="text-content">
          <div className="speciality-badge">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z"></path>
              <path d="M12 5.5v5"></path>
              <path d="M9.5 8h5"></path>
            </svg>
            {/* Dynamic Speciality */}
            <span>{doctor?.speciality || "Specialist"}</span>
          </div>
          {/* Dynamic Name */}
          <h2 className="doc-title">{doctor?.name}</h2>
        </div>

        {/* The Blue Blob and Image */}
        <div className="image-wrapper">
          <div className="blue-blob"></div>
          {/* You can add a default avatar here if the doctor doesn't have an image field in DB yet */}
          <img
            src="https://raw.githubusercontent.com/Ashwinvalento/cartoon-avatar/master/lib/images/male/45.png"
            alt={`${doctor?.name}`}
            className="doc-avatar"
          />
        </div>
      </div>

      {/* Bottom Frosted Glass Section */}
      <div className="card-glass-bottom">
        <div className="schedule-row">
          <div className="datetime-info">
            <div className="info-line">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#6b7280"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              {/* Using API data for Time */}
              <span>{doctor?.startTime || "9:00A.M"} A.M</span>
            </div>
            <div className="info-line">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#6b7280"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              {/* Using API data for Fees */}
              <span>Fees: ₹{doctor?.fees || "500"}</span>
            </div>
          </div>

          <button className="arrow-btn" onClick={onBook}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="7" y1="17" x2="17" y2="7"></line>
              <polyline points="7 7 17 7 17 17"></polyline>
            </svg>
          </button>
        </div>

        <div className="action-buttons">
          {/* Changed "Cancel" to "View Profile" since we are browsing doctors, not canceling an appointment yet */}
          <button className="btn-cancel">Profile</button>
          <button className="btn-book" onClick={onBook}>
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
}
