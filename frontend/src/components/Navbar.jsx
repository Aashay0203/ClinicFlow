import React from "react";
import IconButton from "@mui/material/IconButton";
import NotificationsIcon from "@mui/icons-material/Notifications";
import Box from "@mui/material/Box";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import Avatar from "@mui/material/Avatar";
import "./Navbar.css";

function Navbar() {
  return (
    <Box className="navbar-root">
      <ListItem>
        <ListItemAvatar>
          <Avatar src="/your-photo.jpg" />
        </ListItemAvatar>
        <ListItemText primary="Hi Smith 👋" secondary="New Delhi, India" />
      </ListItem>
      <IconButton className="navbar-notif-btn">
        <NotificationsIcon />
      </IconButton>
    </Box>
  );
}

export default Navbar;
