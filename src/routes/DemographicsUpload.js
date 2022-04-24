import AppBar from '@mui/material/AppBar';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Grid';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import React, { useEffect } from 'react';
import CSVReader from 'react-csv-reader';

import firebase from '../config';

const DemographicsUpload = () => {
  const [demographicsFile, setDemographicsFile] = React.useState(null);
  const [signedIn, setSignedIn] = React.useState(false);
  const [adminSignedIn, setAdminSignedIn] = React.useState(false);
  const [leaderSignedIn, setLeaderSignedIn] = React.useState(false);
  const [userText, setUserText] = React.useState('');

  useEffect(() => {
    firebase.auth.onAuthStateChanged((user) => {
      if (user) {
        setSignedIn(true);
        if (!adminSignedIn && !leaderSignedIn) {
          setUserText(user.email + ' (Student)');
        }
      } else {
        setUserText('');
        setSignedIn(false);
      }
    });
  }, [adminSignedIn, leaderSignedIn]);

  const handleFileChanged = (data) => {
    setDemographicsFile(data);
  };

  const uploadDemographics = () => {
    let demographicsCSVData = demographicsFile;
    if (demographicsCSVData === null) {
      alert('Please select a file to upload.');
    } else {
      // let columnNames = demographicsCSVData[0]; // first row has column names
      // firebase.database.ref('/demographics').remove();
      // firebase.database.ref('/id-to-email').remove();
      for (let row = 1; row < demographicsCSVData.length; row++) {
        console.log(demographicsCSVData[row][0]);
        if (demographicsCSVData[row].length > 1) {
          // avoid final blank row (if any)
          let person = {
            ID: demographicsCSVData[row][0],
            LastName: demographicsCSVData[row][2],
            Pref_FirstName: demographicsCSVData[row][3],
            PersonType: demographicsCSVData[row][4],
            Class: demographicsCSVData[row][5],
            Transfer: demographicsCSVData[row][6],
            ResidenceHall: demographicsCSVData[row][7],
            Gender: demographicsCSVData[row][8],
            Race: demographicsCSVData[row][9],
            Race_Desc: demographicsCSVData[row][10],
            International: demographicsCSVData[row][11],
          };
          let idNum = demographicsCSVData[row][0];
          let email = demographicsCSVData[row][1];
          firebase.database
            .ref('/id-to-email')
            .child(idNum)
            .set(email);
          firebase.database
            .ref('/demographics')
            .child(email)
            .set(person);
        }
      }
      setDemographicsFile(null);
      alert(
        'Please leave window open for 5 minutes to allow the file to finish uploading.'
      );
    }
  };

  const signInAction = () => {
    if (!signedIn) {
      firebase.signIn();
    } else {
      setAdminSignedIn(false);
      setLeaderSignedIn(false);
      firebase.signOut();
    }
  };

  return (
    <div>
      <AppBar position='static'>
        <Toolbar variant='dense'>
          <Grid
            justify='space-between' // Add it here :)
            container
            spacing={24}
          >
            <Grid item>
              <Typography variant='h6' color='inherit'>
                Demographics Upload
              </Typography>
            </Grid>
            <Grid item style={{ marginRight: 10, marginTop: 5 }}>
              <Typography variant='h7' color='inherit'>
                {userText}
              </Typography>
            </Grid>
          </Grid>
          <Button color='inherit' onClick={signInAction} style={{ width: 100 }}>
            {signedIn ? 'Sign Out' : 'Sign In'}
          </Button>
        </Toolbar>
      </AppBar>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Grid style={{ alignItems: 'center' }}>
          <DialogTitle>Choose a file to upload.</DialogTitle>
          <DialogActions style={{ justifyContent: 'center' }}>
            <CSVReader
              onFileLoaded={handleFileChanged}
              inputId='something'
              inputStyle={{ color: 'purple' }}
              style={{ margin: 'auto' }}
            />
          </DialogActions>
          <DialogActions style={{ justifyContent: 'center' }}>
            <Button
              variant='contained'
              onClick={uploadDemographics}
              style={{ backgroundColor: 'blue' }}
              color='primary'
            >
              Submit
            </Button>
          </DialogActions>
        </Grid>
      </div>
    </div>
  );
};

export default DemographicsUpload;
