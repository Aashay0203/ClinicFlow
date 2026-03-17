import IconButton from "@mui/material/IconButton";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import Box from "@mui/material/Box";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import Avatar from "@mui/material/Avatar";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import "./Navbar.css";

function Navbar({ onAvatarClick }) {
  const { user } = useContext(AuthContext);

  const getInitials = (name = "") =>
    name
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";

  return (
    <Box className="navbar-root">
      <ListItem className="navbar-user-section">
        <ListItemAvatar>
          <Avatar className="navbar-avatar" onClick={onAvatarClick}>
            {getInitials(user?.name)}
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={`Hi ${user?.name?.split(" ")[0] || "there"} 👋`}
          secondary="New Delhi, India"
          primaryTypographyProps={{ className: "navbar-primary-text" }}
          secondaryTypographyProps={{ className: "navbar-secondary-text" }}
        />
      </ListItem>

      <IconButton className="navbar-icon-btn">
        <NotificationsNoneOutlinedIcon className="navbar-icon" />
      </IconButton>
    </Box>
  );
}

export default Navbar;
