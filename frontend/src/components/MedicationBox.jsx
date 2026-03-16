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

  const fetchMed = async () => {
    try {
      const res = await instance.get("/medication/");
      setMeds(res.data.medication);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
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
            <span className={`med-badge ${med.taken ? "taken" : "pending"}`}>
              {med.taken ? "Taken" : "Pending"}
            </span>
          </ListItem>
        ))}
      </List>
    </div>
  );
}

export default MedicationBox;
