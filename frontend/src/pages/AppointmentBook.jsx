import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import instance from "../api/axios";
import "./AppointmentBook.css";
import timeUtils from "../components/TimeUtils";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ClockIcon,
  CalendarIcon,
} from "../components/TimeIcon";

// ─────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────
const DAYS_PER_PAGE = 7;
const MAX_DAYS_AHEAD = 7; // How many calendar days ahead to look

/**
 * ACTIVE_DAYS — controls which weekdays are bookable.
 * 0 = Sunday, 1 = Monday, ..., 6 = Saturday
 *
 * To change working days later, just update this array.
 * e.g. Mon–Fri only:  [1, 2, 3, 4, 5]
 *      Mon–Sat:       [1, 2, 3, 4, 5, 6]  ← current (no Sundays)
 *      All week:      [0, 1, 2, 3, 4, 5, 6]
 */
const ACTIVE_DAYS = [1, 2, 3, 4, 5, 6]; // Mon–Sat, Sundays excluded

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const { generateTimeSlots } = timeUtils;

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

/**
 * Returns all active (bookable) days within the next MAX_DAYS_AHEAD
 * calendar days, filtered by ACTIVE_DAYS.
 *
 * @param {number[]} activeDays - array of weekday numbers (0–6) that are bookable
 * @returns {Array<{ date: Date, isoDate: string, day: number, month: string, year: number, weekday: string }>}
 */
function getAllActiveDates(activeDays) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const result = [];
  for (let i = 0; i < MAX_DAYS_AHEAD; i++) {
    const cursor = new Date(today);
    cursor.setDate(today.getDate() + i);

    if (activeDays.includes(cursor.getDay())) {
      result.push({
        date: new Date(cursor), // real Date object — safe for comparisons
        isoDate: cursor.toISOString().split("T")[0],
        day: cursor.getDate(),
        month: MONTH_LABELS[cursor.getMonth()],
        year: cursor.getFullYear(),
        weekday: WEEKDAY_LABELS[cursor.getDay()],
      });
    }
  }
  return result;
}

/**
 * Returns true if a slot (24hr "HH:MM") has already passed today.
 * Always returns false for future dates.
 */
function isSlotInPast(slotValue, selectedDateIso) {
  const now = new Date();
  const todayIso = now.toISOString().split("T")[0];
  if (selectedDateIso !== todayIso) return false;

  const [h, m] = slotValue.split(":").map(Number);
  const slotMinutes = h * 60 + m;
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  return slotMinutes <= nowMinutes;
}

// ─────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────

/**
 * SlotSelection
 *
 * Props:
 *   activeDays?: number[]  — override ACTIVE_DAYS for this instance.
 *                            Useful if different doctor profiles have
 *                            different working days. Defaults to the
 *                            module-level ACTIVE_DAYS constant above.
 */
export default function SlotSelection({ activeDays = ACTIVE_DAYS }) {
  const { doctorId } = useParams();
  const navigate = useNavigate();

  // ── Doctor info ───────────────────────────────────────────
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ── Date navigation ───────────────────────────────────────
  // allActiveDates: full flat list of bookable days (no Sundays, within MAX_DAYS_AHEAD)
  const allActiveDates = useMemo(
    () => getAllActiveDates(activeDays),
    [activeDays],
  );

  // windowOffset = index into allActiveDates where the current page starts
  const [windowOffset, setWindowOffset] = useState(0);

  // The slice of allActiveDates currently visible
  const dateWindow = useMemo(
    () => allActiveDates.slice(windowOffset, windowOffset + DAYS_PER_PAGE),
    [allActiveDates, windowOffset],
  );

  const [selectedDateIndex, setSelectedDateIndex] = useState(0); // index within dateWindow
  const [selectedDate, setSelectedDate] = useState(null);

  // ── Time slots ────────────────────────────────────────────
  const [allSlots, setAllSlots] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedTime, setSelectedTime] = useState("");

  // ── Booking ───────────────────────────────────────────────
  const [isBooking, setIsBooking] = useState(false);
  const [bookingError, setBookingError] = useState("");

  // ─────────────────────────────────────────────────────────
  // EFFECTS
  // ─────────────────────────────────────────────────────────

  // Fetch doctor details
  useEffect(() => {
    if (!doctorId) return;
    const fetchDoctor = async () => {
      try {
        setLoading(true);
        const res = await instance.get(`/doctor/${doctorId}`);
        const data = res.data.details || res.data;
        setDoctor(data);
      } catch (err) {
        console.error(err);
        setError("Could not load doctor details.");
      } finally {
        setLoading(false);
      }
    };
    fetchDoctor();
  }, [doctorId]);

  // Generate time slots whenever doctor data arrives
  useEffect(() => {
    if (!doctor) return;
    const slots = generateTimeSlots(doctor.startTime || "09:00 AM");
    setAllSlots(slots);
  }, [doctor]);

  // Auto-select first date of the new window when offset changes
  useEffect(() => {
    if (dateWindow.length === 0) return;
    setSelectedDateIndex(0);
    setSelectedDate(dateWindow[0]);
    setSelectedTime("");
  }, [dateWindow]); // intentionally only on offset change

  // Seed selected date on first load (once dateWindow is ready)
  useEffect(() => {
    if (selectedDate === null && dateWindow.length > 0) {
      setSelectedDate(dateWindow[0]);
    }
  }, [dateWindow, selectedDate]);

  // Fetch already-booked slots for the selected date
  useEffect(() => {
    if (!selectedDate || !doctorId) return;
    const fetchBooked = async () => {
      setSlotsLoading(true);
      try {
        const res = await instance.get(
          `/appointment/booked-slots?doctorId=${doctorId}&date=${selectedDate.isoDate}`,
        );
        setBookedSlots(res.data.bookedSlots || []);
      } catch (err) {
        console.error("Could not fetch booked slots", err);
        setBookedSlots([]); // fail open — show all as available
      } finally {
        setSlotsLoading(false);
      }
    };
    fetchBooked();
    setSelectedTime("");
  }, [selectedDate, doctorId]);

  // ─────────────────────────────────────────────────────────
  // HANDLERS
  // ─────────────────────────────────────────────────────────

  const handlePrevWeek = () => {
    setWindowOffset((prev) => Math.max(0, prev - DAYS_PER_PAGE));
  };

  const handleNextWeek = () => {
    setWindowOffset((prev) =>
      Math.min(allActiveDates.length - DAYS_PER_PAGE, prev + DAYS_PER_PAGE),
    );
  };

  const handleSelectDate = (index) => {
    setSelectedDateIndex(index);
    setSelectedDate(dateWindow[index]);
    setSelectedTime("");
  };

  const handleProceed = async () => {
    if (!selectedTime || !selectedDate) return;
    setIsBooking(true);
    setBookingError("");
    try {
      const payload = {
        doctorId,
        date: selectedDate.isoDate, // "YYYY-MM-DD"
        slotTime: selectedTime, // "HH:MM" 24-hr
      };

      const res = await instance.post("/appointment/book", payload);

      navigate("/payment", {
        state: {
          appointmentDetails: res.data,
          doctorName: doctor?.name,
          dateDisplay: `${selectedDate.day} ${selectedDate.month} ${selectedDate.year}`,
          timeDisplay:
            allSlots.find((s) => s.value === selectedTime)?.display ||
            selectedTime,
          fees: doctor?.fees,
        },
      });
    } catch (err) {
      console.error("Booking failed:", err);
      setBookingError(
        err?.response?.data?.message || "Booking failed. Please try again.",
      );
    } finally {
      setIsBooking(false);
    }
  };

  // ─────────────────────────────────────────────────────────
  // DERIVED STATE
  // ─────────────────────────────────────────────────────────

  const isSlotBooked = (slotValue) => bookedSlots.includes(slotValue);

  // Safe past-date check — uses the real Date object, not a string comparison
  const isPastDate =
    selectedDate?.date instanceof Date &&
    selectedDate.date < new Date(new Date().setHours(0, 0, 0, 0));

  const canGoPrev = windowOffset > 0;
  const canGoNext = windowOffset + DAYS_PER_PAGE < allActiveDates.length;

  // Memoised so the find() doesn't re-run on every keystroke / re-render
  const selectedSlotDisplay = useMemo(
    () =>
      allSlots.find((s) => s.value === selectedTime)?.display || selectedTime,
    [allSlots, selectedTime],
  );

  // ─────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────

  if (loading) return <div className="loading">Loading doctor details…</div>;
  if (error)
    return (
      <div className="error">
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );

  return (
    <div className="premium-slot-container">
      {/* ── Doctor Header Card ── */}
      <div className="doctor-header-card">
        <button className="premium-back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>

        <div className="doctor-profile-top">
          <div className="profile-text">
            <h2 className="doctor-premium-name">{doctor?.name}</h2>
            <p className="doctor-speciality">{doctor?.speciality}</p>
            <p className="session-price">₹{doctor?.fees} / Session</p>
          </div>
          <div className="premium-avatar-frame">
            <img
              src={
                doctor?.image ||
                "https://raw.githubusercontent.com/Ashwinvalento/cartoon-avatar/master/lib/images/male/45.png"
              }
              alt={doctor?.name}
              className="premium-avatar"
              onError={(e) => {
                e.target.src =
                  "https://raw.githubusercontent.com/Ashwinvalento/cartoon-avatar/master/lib/images/male/45.png";
              }}
            />
          </div>
        </div>

        <div className="vitals-grid">
          <div className="vital-card">
            <p className="vital-value">
              {doctor?.experience ? `${doctor.experience}y+` : "—"}
            </p>
            <p className="vital-label">Experience</p>
          </div>
          <div className="vital-card">
            <p className="vital-value">
              {doctor?.totalPatients ? `${doctor.totalPatients}+` : "—"}
            </p>
            <p className="vital-label">Patients</p>
          </div>
          <div className="vital-card">
            <p className="vital-value">
              {doctor?.totalReviews ? `${doctor.totalReviews}+` : "—"}
            </p>
            <p className="vital-label">Reviews</p>
          </div>
          <div className="vital-card rating-card">
            <div className="rating-value-group">
              <p className="vital-value">{doctor?.rating ?? "—"}</p>
              <span className="premium-star">⭐</span>
            </div>
            <p className="vital-label">Rating</p>
          </div>
        </div>
      </div>

      {/* ── Booking Panel ── */}
      <div className="booking-control-panel">
        {/* ── DATE SECTION ── */}
        <div className="premium-section date-section">
          <div className="section-header">
            <CalendarIcon />
            <label className="premium-section-label">Choose a date</label>
          </div>

          {/* Month + Year context */}
          <p className="month-context">
            {dateWindow[0]?.month} {dateWindow[0]?.year}
            {dateWindow[0]?.month !== dateWindow[dateWindow.length - 1]?.month
              ? ` – ${dateWindow[dateWindow.length - 1]?.month} ${dateWindow[dateWindow.length - 1]?.year}`
              : ""}
          </p>

          {/* Date picker row with prev / next */}
          <div className="date-nav-row">
            <button
              className={`week-nav-btn ${!canGoPrev ? "disabled" : ""}`}
              onClick={handlePrevWeek}
              disabled={!canGoPrev}
              aria-label="Previous week"
            >
              <ArrowLeftIcon />
            </button>

            <div className="date-picker-horizontal">
              {dateWindow.map((item, index) => {
                const isToday =
                  item.isoDate === new Date().toISOString().split("T")[0];
                return (
                  <button
                    key={item.isoDate}
                    className={`date-item
                      ${selectedDateIndex === index ? "selected" : ""}
                      ${isToday ? "today" : ""}
                    `}
                    onClick={() => handleSelectDate(index)}
                  >
                    <p className="date-mon-text">{item.weekday}</p>
                    <p className="date-day-num">{item.day}</p>
                    {isToday && <span className="today-dot" />}
                  </button>
                );
              })}
            </div>

            <button
              className={`week-nav-btn ${!canGoNext ? "disabled" : ""}`}
              onClick={handleNextWeek}
              disabled={!canGoNext}
              aria-label="Next week"
            >
              <ArrowRightIcon />
            </button>
          </div>
        </div>

        {/* ── TIME SECTION ── */}
        <div className="premium-section time-section">
          <div className="section-header">
            <ClockIcon />
            <label className="premium-section-label">
              Choose a time
              <span className="slot-range-hint">
                {doctor?.startTime
                  ? `${doctor.startTime} – 8:00 PM`
                  : "9:00 AM – 8:00 PM"}
              </span>
            </label>
          </div>

          {slotsLoading ? (
            <div className="slots-loading">Checking availability…</div>
          ) : isPastDate ? (
            <div className="slots-unavailable">
              This date has already passed. Please select a future date.
            </div>
          ) : allSlots.length === 0 ? (
            <div className="slots-unavailable">
              No slots available for this doctor.
            </div>
          ) : (
            <div className="premium-time-grid">
              {allSlots.map((slot) => {
                const booked = isSlotBooked(slot.value);
                // FIX: grey out slots that have already passed today
                const past = isSlotInPast(slot.value, selectedDate?.isoDate);
                const unavailable = booked || past;

                return (
                  <button
                    key={slot.value}
                    disabled={unavailable}
                    className={`time-slot-item
                      ${selectedTime === slot.value ? "selected" : ""}
                      ${booked ? "booked" : ""}
                      ${past && !booked ? "past" : ""}
                    `}
                    onClick={() => !unavailable && setSelectedTime(slot.value)}
                    title={
                      booked
                        ? "Already booked"
                        : past
                          ? "This time has passed"
                          : slot.display
                    }
                  >
                    {slot.display}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Booking Error ── */}
        {bookingError && (
          <div className="booking-error-msg">{bookingError}</div>
        )}

        {/* ── CTA Button ── */}
        <button
          className="premium-book-btn"
          disabled={!selectedTime || isBooking || isPastDate}
          onClick={handleProceed}
        >
          {isBooking
            ? "Booking…"
            : selectedTime
              ? `Book Appointment — ${selectedSlotDisplay}`
              : "Select a time slot"}
        </button>
      </div>
    </div>
  );
}
