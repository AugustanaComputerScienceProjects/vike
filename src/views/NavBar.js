import HomeIcon from '@mui/icons-material/Home';
import MenuIcon from '@mui/icons-material/Menu';
import AppBar from '@mui/material/AppBar';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import React, { useEffect, useState } from 'react';
import NavDrawer from '../components/NavDrawer';
import firebase from '../config';

const NavBar = (props) => {
  const [drawerOpened, setDrawerOpened] = useState(false);
  const [btnText, setBtnText] = useState('Sign In');
  const [signedIn, setSignedIn] = useState(false);
  const [title, setTitle] = useState('Augustana Events - Home');
  const [userText, setUserText] = useState('');
  const [icon, setIcon] = useState(<MenuIcon />);
  const [isNotHome, setIsNotHome] = useState(<MenuIcon />);

  const [adminSignedIn, setAdminSignedIn] = useState(false);
  const [leaderSignedIn, setLeaderSignedIn] = useState(false);

  // Toggles opening/closing the drawer (NavDrawer)
  const toggleDrawer = (booleanValue) => () => {
    if (isNotHome) {
      window.history.pushState('object or string', 'Title', '/');
      window.location.reload();
    } else {
      setDrawerOpened(booleanValue);
    }
  };

  // When clicking on a page to navigate to, changes the title of the app bar
  const onNavChanged = (page) => {
    props.navChanged(page);
    setTitle('Augustana Events - ' + page);
  };

  // Action for signing the user in and signing the user out
  const signInAction = () => {
    if (!signedIn) {
      firebase.signIn();
    } else {
      onNavChanged('Home');
      setAdminSignedIn(false);
      setLeaderSignedIn(false);
      firebase.signOut();
    }
  };

  // Checks the role of the current user and displays their email and role in the right side of the app bar
  const checkRole = (user, role) => {
    firebase.database
      .ref(role)
      .once('value')
      .then(function(snapshot) {
        if (snapshot.hasChild(user.email.replace('.', ','))) {
          if (role === 'admin') {
            setAdminSignedIn(true);
            setUserText(user.email + ' (Admin)');
          } else if (role === 'leaders' && !adminSignedIn) {
            setAdminSignedIn(true);
            setUserText(user.email + ' (Leader)');
          }
        }
      });
  };

  // Checks if the current page is an event page, if so, changes the left icon of the app bar to take to home
  const checkReload = () => {
    if (window.location.href.includes('event?')) {
      setIcon(<HomeIcon />);
      setIsNotHome(true);
      setTitle('Augustana Events - Check In');
    } else {
      setIcon(<MenuIcon />);
      setIsNotHome(false);
    }
  };
  // Component Will Mount, check which icon is needed and listen to Firebase auth
  useEffect(() => {
    checkReload();
    firebase.auth.onAuthStateChanged((user) => {
      if (user) {
        checkRole(user, 'admin');
        checkRole(user, 'leaders');
        setBtnText('Sign Out');
        setSignedIn(true);

        if (!adminSignedIn && !leaderSignedIn) {
          setUserText(user.email + ' (Student)');
        }
      } else {
        setBtnText('Sign In');
        setSignedIn(false);
        setUserText('');
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminSignedIn, leaderSignedIn]);

  // Render the app bar
  return (
    <div className='App'>
      <AppBar position='static' open={drawerOpened}>
        <Toolbar variant='dense'>
          <IconButton
            color='inherit'
            aria-label='Menu'
            onClick={toggleDrawer(true)}
          >
            {icon}
          </IconButton>
          {/* <IconButton
              color='inherit'
              aria-label='Menu'
              onClick={toggleDrawer(true)}
            >
              {icon}
            </IconButton> */}
          <Typography variant='h6' color='inherit' sx={{ flexGrow: 1 }}>
            {title}
          </Typography>
          <Typography variant='h7' color='inherit'>
            {userText}
          </Typography>
          <Button color='inherit' onClick={signInAction} style={{ width: 100 }}>
            {btnText}
          </Button>
        </Toolbar>
      </AppBar>

      <NavDrawer
        drawerOpened={drawerOpened}
        toggleDrawer={toggleDrawer}
        navChanged={onNavChanged}
      />
    </div>
  );
};

export default NavBar;
