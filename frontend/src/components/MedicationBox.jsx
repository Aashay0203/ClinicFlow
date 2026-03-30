import { useEffect, useState } from "react";
import instance from "../api/axios";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import Avatar from "@mui/material/Avatar";
import "./MedicationBox.css";

function MedicationBox() {
  const [meds, setMeds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMed();
  }, []);

  useEffect(() => {
    fetchMed();

    // Calculate ms remaining until midnight IST
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istNow = new Date(now.getTime() + istOffset);

    const midnight = new Date(istNow);
    midnight.setUTCHours(18, 30, 0, 0); // 18:30 UTC = 12:00 AM IST next day

    // If midnight already passed today, set for next midnight
    if (istNow >= midnight) {
      midnight.setUTCDate(midnight.getUTCDate() + 1);
    }

    const msUntilMidnight = midnight.getTime() - now.getTime();

    // Reset all meds to pending at midnight IST
    const timer = setTimeout(async () => {
      try {
        await instance.patch("/medications/reset-daily");
        setMeds((prev) => prev.map((med) => ({ ...med, taken: false })));
      } catch (err) {
        console.log(err);
      }
    }, msUntilMidnight);

    return () => clearTimeout(timer);
  }, []);

  const fetchMed = async () => {
    try {
      const res = await instance.get("/medications/");
      setMeds(res.data.medication);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleTaken = async (id, currentStatus) => {
    try {
      // Optimistic update — change UI instantly before API responds
      setMeds((prev) =>
        prev.map((med) =>
          med._id === id ? { ...med, taken: !currentStatus } : med,
        ),
      );
      await instance.patch(`/medications/${id}`, { taken: !currentStatus });
    } catch (err) {
      // Revert if API fails
      setMeds((prev) =>
        prev.map((med) =>
          med._id === id ? { ...med, taken: currentStatus } : med,
        ),
      );
      console.log(err);
    }
  };

  if (loading) return <p>Loading medications...</p>;

  return (
    <div className="med-box">
      <div className="med-box-header">
        <h3 className="med-box-title">Medication Schedule</h3>
      </div>
      <List>
        {meds.map((med) => (
          <ListItem key={med._id} className="med-item">
            <ListItemAvatar>
              <Avatar className="med-avatar">💊</Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={`${med.name} — ${med.dosage}`}
              secondary={med.time}
            />
            <button
              className={`med-badge ${med.taken ? "taken" : "pending"}`}
              onClick={() => toggleTaken(med._id, med.taken)}
            >
              {med.taken ? "✓ Taken" : "Pending"}
            </button>
          </ListItem>
        ))}
      </List>
    </div>
  );
}

export default MedicationBox;
