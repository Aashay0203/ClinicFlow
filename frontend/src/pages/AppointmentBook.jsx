import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import instance from "../api/axios";
import "./SlotSelection.css";

export default function SlotSelection() {
  const { doctorId } = useParams(); // Gets the ID from /booking/:doctorId
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch Doctor Details when page loads
  useEffect(() => {
    const fetchDoctorDetails = async () => {
      try {
        const res = await instance.get(`/doctor/${doctorId}`);
        setDoctor(res.data.doctor || res.data);
      } catch (err) {
        console.error("Failed to fetch doctor details", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctorDetails();
  }, [doctorId]);

  // Mock function: When a date is picked, generate/fetch slots
  // LATER: Replace this with an actual API call to your backend
  const handleDateChange = (e) => {
    const date = e.target.value;
    setSelectedDate(date);
    setSelectedSlot(null); // Reset selected slot when date changes

    // MOCK DATA: Simulating available slots from a backend
    setAvailableSlots([
      { time: "09:00 AM", isBooked: false },
      { time: "09:30 AM", isBooked: true }, // Simulating a taken slot
      { time: "10:00 AM", isBooked: false },
      { time: "10:30 AM", isBooked: false },
      { time: "11:00 AM", isBooked: true },
      { time: "11:30 AM", isBooked: false },
    ]);
  };

  const handleProceed = () => {
    if (!selectedSlot) return;
    // Navigate to payment/confirmation page and pass the booking details
    navigate("/payment", {
      state: {
        doctorId,
        selectedDate,
        selectedSlot: selectedSlot.time,
        doctorName: doctor?.name,
      },
    });
  };

  if (loading) return <div className="loading">Loading schedule...</div>;

  return (
    <div className="slot-container">
      <div className="slot-card">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back to Doctors
        </button>

        <h2 className="slot-title">Book Appointment</h2>
        {doctor && <p className="slot-subtitle">with Dr. {doctor.name}</p>}

        {/* Date Picker */}
        <div className="section">
          <label className="section-label">Select Date</label>
          <input
            type="date"
            className="date-picker"
            value={selectedDate}
            onChange={handleDateChange}
            min={new Date().toISOString().split("T")[0]} // Prevent past dates
          />
        </div>

        {/* Time Slots Grid */}
        {selectedDate && (
          <div className="section">
            <label className="section-label">Available Slots</label>
            <div className="slots-grid">
              {availableSlots.map((slot, index) => (
                <button
                  key={index}
                  disabled={slot.isBooked}
                  className={`slot-btn ${slot.isBooked ? "booked" : ""} ${
                    selectedSlot?.time === slot.time ? "selected" : ""
                  }`}
                  onClick={() => setSelectedSlot(slot)}
                >
                  {slot.time}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        <button
          className="proceed-btn"
          disabled={!selectedSlot}
          onClick={handleProceed}
        >
          {selectedSlot
            ? `Proceed to Pay for ${selectedSlot.time}`
            : "Select a time slot"}
        </button>
      </div>
    </div>
  );
}
