import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import firebase from "../config";

// File for the navigation drawer (the menu that pops out when clicking the left menu button in the app bar)

const NavDrawer = (props) => {
  const [adminSignedIn, setAdminSignedIn] = useState(false);
  const [leaderSignedIn, setLeaderSignedIn] = useState(false);

  // Checks the role of the current user
  const checkRole = (user, role) => {
    firebase.database
      .ref(role)
      .once("value")
      .then(function(snapshot) {
        if (snapshot.hasChild(user.email.replace(".", ","))) {
          if (role === "admin") {
            setAdminSignedIn(true);
          } else if (role === "leaders") {
            setLeaderSignedIn(true);
          }
        }
      });
  };

  // Component will mount - initiate the Firebase auth listener
  useEffect(() => {
    firebase.auth.onAuthStateChanged((user) => {
      if (user) {
        checkRole(user, "admin");
        checkRole(user, "leaders");
      } else {
        setAdminSignedIn(false);
        setLeaderSignedIn(false);
      }
    });
  }, []);

  // Render the drawer
  return (
    <Drawer
      anchor="left"
      onClose={props.toggleDrawer(false)}
      open={props.drawerOpened}
    >
      <div
        onClick={props.toggleDrawer(false)}
        onKeyDown={props.toggleDrawer(false)}
      >
        <List>
          <ListItemButton component={Link} to="/" name="Home">
            Home
          </ListItemButton>
          <ListItemButton
            component={Link}
            to="/add-event"
            name="Add Event"
            disabled={!adminSignedIn && !leaderSignedIn}
          >
            Add Event
          </ListItemButton>
          <ListItemButton
            component={Link}
            to="/pending-events"
            name="Pending Events"
            disabled={!adminSignedIn && !leaderSignedIn}
          >
            Pending Events
          </ListItemButton>
          <ListItemButton
            component={Link}
            to="/events"
            name="Current Events"
            disabled={!adminSignedIn && !leaderSignedIn}
          >
            Current Events
          </ListItemButton>
          <ListItemButton
            component={Link}
            to="/past-events"
            name="Past Events"
            disabled={!adminSignedIn}
          >
            Past Events
          </ListItemButton>
          <ListItemButton
            component={Link}
            to="/tags"
            name="Groups/Tags"
            disabled={!adminSignedIn && !leaderSignedIn}
          >
            Groups/Tags
          </ListItemButton>
          <ListItemButton
            component={Link}
            to="/users"
            name="Users"
            disabled={!adminSignedIn}
          >
            Users
          </ListItemButton>
        </List>
      </div>
    </Drawer>
  );
};

export default NavDrawer;
