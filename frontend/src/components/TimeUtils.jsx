/** Convert "09:00 AM" / "14:30" → total minutes from midnight */
function parseTimeToMinutes(timeStr) {
  if (!timeStr) return 9 * 60; // default 9 AM

  // Handle "HH:MM AM/PM"
  const ampmMatch = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (ampmMatch) {
    let [, h, m, period] = ampmMatch;
    h = parseInt(h, 10);
    m = parseInt(m, 10);
    if (period.toUpperCase() === "PM" && h !== 12) h += 12;
    if (period.toUpperCase() === "AM" && h === 12) h = 0;
    return h * 60 + m;
  }

  // Handle "HH:MM" 24-hr
  const plainMatch = timeStr.match(/^(\d{1,2}):(\d{2})$/);
  if (plainMatch) {
    return parseInt(plainMatch[1], 10) * 60 + parseInt(plainMatch[2], 10);
  }

  return 9 * 60;
}

/** Format minutes-from-midnight → "09:00 AM" */
function formatMinutesToDisplay(totalMins) {
  const h24 = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  const period = h24 >= 12 ? "PM" : "AM";
  let h12 = h24 % 12;
  if (h12 === 0) h12 = 12;
  return `${String(h12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${period}`;
}

/** Format minutes → "HH:MM" 24-hr for API payload */
function formatMinutesTo24hr(totalMins) {
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Generate slots every 30 min from startTime → 20:00 (8 PM) */
function generateTimeSlots(startTimeStr) {
  const startMins = parseTimeToMinutes(startTimeStr);
  const endMins = 20 * 60; // 8 PM fixed
  const slots = [];

  for (let t = startMins; t < endMins; t += 30) {
    slots.push({
      display: formatMinutesToDisplay(t),
      value: formatMinutesTo24hr(t),
    });
  }
  return slots;
}

/** Build a window of `count` days starting from `offset` days after today */
function buildDateWindow(startOffset, count = 7) {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = [
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
  const result = [];
  const base = new Date();
  base.setHours(0, 0, 0, 0);

  for (let i = 0; i < count; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + startOffset + i);
    result.push({
      date: d,
      day: d.getDate(),
      weekday: days[d.getDay()],
      month: months[d.getMonth()],
      year: d.getFullYear(),
      isoDate: d.toISOString().split("T")[0], // "YYYY-MM-DD"
    });
  }
  return result;
}

export default {
  parseTimeToMinutes,
  formatMinutesToDisplay,
  formatMinutesTo24hr,
  generateTimeSlots,
  buildDateWindow,
};
