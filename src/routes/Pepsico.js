import AppBar from '@mui/material/AppBar';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Snackbar from '@mui/material/Snackbar';
import TextField from '@mui/material/TextField';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import React, { useEffect } from 'react';
import firebase from '../config';

const Pepsico = () => {
  const [studentIdentifier, setStudentIdentifier] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [btnText, setBtnText] = React.useState('Sign In');
  const [signedIn, setSignedIn] = React.useState(false);
  const [userText, setUserText] = React.useState('');
  const [open, setOpen] = React.useState(false);
  const [adminSignedIn, setAdminSignedIn] = React.useState(false);
  const [leaderSignedIn, setLeaderSignIn] = React.useState(false);
  let idNumTextField = React.useRef(null);

  useEffect(() => {
    firebase.auth.onAuthStateChanged((user) => {
      if (user) {
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
  }, [adminSignedIn, leaderSignedIn]);

  const entryChange = (e) => {
    setStudentIdentifier(e.target.value);
  };

  const onSubmit = (e) => {
    let idNum = studentIdentifier;
    if (idNum[0] === ';' && idNum.length === 16) {
      idNum = idNum.slice(3, 10);
      checkIdEntered(idNum);
    } else if (!isNaN(idNum[0])) {
      while (idNum.length < 7) {
        idNum = '0' + idNum;
      }
      checkIdEntered(idNum);
    } else {
      checkUserIdEntered(idNum);
    }
    setStudentIdentifier('');
    idNumTextField.focus();
  };

  const checkIdEntered = (idNum) => {
    console.log('SID: ' + idNum);
    let reference = firebase.database.ref('/id-to-email');
    let demoReference = firebase.database.ref('/demographics');
    demoReference.remove();
    reference.once('value').then(function(snapshot) {
      if (snapshot.hasChild(idNum)) {
        let email = snapshot.child(idNum).val();
        checkedIn(email, snapshot);
      } else {
        failedCheckIn();
      }
    });
  };

  const checkUserIdEntered = (userId) => {
    console.log('User ID: ' + userId);
    let reference = firebase.database.ref('/demographics');
    reference.once('value').then(function(snapshot) {
      if (snapshot.hasChild(userId)) {
        checkedIn(userId, snapshot);
      } else {
        failedCheckIn();
      }
    });
  };

  const checkedIn = (userId, snapshot) => {
    let currentDate = new Date();
    let checkInTime = currentDate.toLocaleTimeString();
    console.log(checkInTime);
    setMessage(userId + ' has checked in.');
    setOpen(true);
    firebase.database
      .ref('/pepsico')
      .once('value')
      .then(function(snapshot) {
        snapshot.forEach(function(child) {
          let eventKey = child.key;
          firebase.database
            .ref('/pepsico')
            .child(eventKey)
            .child('users')
            .child(userId)
            .child(checkInTime)
            .set(true);
        });
      });
  };

  const failedCheckIn = () => {
    displayMessage('Not a student/faculty.');
    setOpen(true);
  };

  const keyPress = (e) => {
    if (e.keyCode === 13) {
      onSubmit(e);
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  const displayMessage = (message) => {
    handleClose();
    setMessage(message);
    setOpen(true);
  };

  // Action for signing the user in and signing the user out
  const signInAction = () => {
    if (!signedIn) {
      firebase.signIn();
    } else {
      setAdminSignedIn(false);
      setLeaderSignIn(false);
      firebase.signOut();
    }
  };
  return (
    <div className='App'>
      <AppBar position='static'>
        <Toolbar variant='dense'>
          <Grid justifyContent='space-between' container spacing={24}>
            <Grid item>
              <Typography variant='h6' color='inherit'>
                Pepsico Check-In
              </Typography>
            </Grid>
            <Grid item style={{ marginRight: 10, marginTop: 5 }}>
              <Typography variant='h7' color='inherit'>
                {userText}
              </Typography>
            </Grid>
          </Grid>
          <Button color='inherit' onClick={signInAction} style={{ width: 100 }}>
            {btnText}
          </Button>
        </Toolbar>
      </AppBar>
      <div style={{ marginTop: 50, display: 'flex', justifyContent: 'center' }}>
        <Card
          style={{
            minWidth: 500,
            maxWidth: 500,
            minHeight: 125,
            maxHeight: 125,
          }}
        >
          <Grid
            container
            spacing={0}
            direction='column'
            alignItems='center'
            justify='center'
          >
            <Grid item>
              <TextField
                autoFocus
                margin='normal'
                label='Swipe card or enter student id'
                inputRef={(input) => (idNumTextField = input)}
                value={studentIdentifier}
                onChange={entryChange}
                onKeyDown={keyPress}
                style={{ minWidth: 250 }}
              />
            </Grid>
            <Button variant='contained' onClick={onSubmit}>
              Submit
            </Button>
          </Grid>
        </Card>
        {/*
                <Dialog onClose={confirmation}
                        aria-labelledby="customized-dialog-title"
                        open={confirmation}>
                    <DialogTitle id="customized-dialog-title">
                        {title}
                    </DialogTitle>
                    <DialogContent>
                        {message}
                    </DialogContent>
                    <DialogActions style={{justifyContent: 'center'}}>
                        <Button variant="contained" onClick={handleClose} color="primary">
                            OK
                        </Button>
                    </DialogActions>
                </Dialog>
                */}
        <Snackbar
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          open={open}
          autoHideDuration={6000}
          onClose={handleClose}
          ContentProps={{
            'aria-describedby': 'message-id',
          }}
          message={message}
          action={[
            <Button
              key='close'
              aria-label='Close'
              color='inherit'
              onClick={handleClose}
            >
              {' '}
              X
            </Button>,
          ]}
        />
      </div>
    </div>
  );
};

export default Pepsico;
