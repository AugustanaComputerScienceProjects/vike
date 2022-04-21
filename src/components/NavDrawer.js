import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import React, { useEffect, useState } from 'react';
import firebase from '../config';

// File for the navigation drawer (the menu that pops out when clicking the left menu button in the app bar)

const NavDrawer = (props) => {
  const [adminSignedIn, setAdminSignedIn] = useState(false);
  const [leaderSignedIn, setLeaderSignedIn] = useState(false);

  // Actions for when each menu item is clicked
  const homeClicked = () => {
    props.navChanged('Home');
  };

  const eventClicked = () => {
    props.navChanged('Add Event');
  };

  const pendingClicked = () => {
    props.navChanged('Pending Events');
  };

  const currentClicked = () => {
    props.navChanged('Current Events');
  };

  const pastClicked = () => {
    props.navChanged('Past Events');
  };

  const tagsClicked = () => {
    props.navChanged('Groups/Tags');
  };

  const usersClicked = () => {
    props.navChanged('Users');
  };

  // Checks the role of the current user
  const checkRole = (user, role) => {
    firebase.database
      .ref(role)
      .once('value')
      .then(function(snapshot) {
        if (snapshot.hasChild(user.email.replace('.', ','))) {
          if (role === 'admin') {
            setAdminSignedIn(true);
          } else if (role === 'leaders') {
            setLeaderSignedIn(true);
          }
        }
      });
  };

  // Component will mount - initiate the Firebase auth listener
  useEffect(() => {
    firebase.auth.onAuthStateChanged((user) => {
      if (user) {
        checkRole(user, 'admin');
        checkRole(user, 'leaders');
      } else {
        setAdminSignedIn(false);
        setLeaderSignedIn(false);
      }
    });
  }, []);

  // Render the drawer
  return (
    <Drawer
      anchor='left'
      onClose={props.toggleDrawer(false)}
      open={props.drawerOpened}
    >
      <div
        onClick={props.toggleDrawer(false)}
        onKeyDown={props.toggleDrawer(false)}
      >
        <List>
          <ListItemButton name='Home' onClick={homeClicked}>
            Home
          </ListItemButton>
          <ListItemButton
            name='Add Event'
            onClick={eventClicked}
            disabled={!adminSignedIn && !leaderSignedIn}
          >
            Add Event
          </ListItemButton>
          <ListItemButton
            name='Pending Events'
            onClick={pendingClicked}
            disabled={!adminSignedIn && !leaderSignedIn}
          >
            Pending Events
          </ListItemButton>
          <ListItemButton
            name='Current Events'
            onClick={currentClicked}
            disabled={!adminSignedIn && !leaderSignedIn}
          >
            Current Events
          </ListItemButton>
          <ListItemButton
            name='Past Events'
            onClick={pastClicked}
            disabled={!adminSignedIn}
          >
            Past Events
          </ListItemButton>
          <ListItemButton
            name='Groups/Tags'
            onClick={tagsClicked}
            disabled={!adminSignedIn && !leaderSignedIn}
          >
            Groups/Tags
          </ListItemButton>
          <ListItemButton
            name='Users'
            onClick={usersClicked}
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
