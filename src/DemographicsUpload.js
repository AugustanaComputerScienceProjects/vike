import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import Grid from '@material-ui/core/Grid';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import React, { Component } from 'react';
import CSVReader from 'react-csv-reader';
import './App.css';
import firebase from './config';

class DemographicsUpload extends Component {
  state = {
    demographicsFile: null,
    test: 'test',
    btnText: 'Sign In',
    signedIn: false,
    mainTitle: 'Demographics Upload',
  };

  handleFileChanged = (data) => {
    console.log(data);
    console.log(data[0]);
    this.setState({ demographicsFile: data });
    console.log(this.state.demographicsFile.length);
  };

  uploadDemographics = () => {
    let demographicsCSVData = this.state.demographicsFile;
    if (demographicsCSVData === null) {
      alert('Please select a file to upload.');
    } else {
      // let columnNames = demographicsCSVData[0]; // first row has column names
      firebase.database.ref('/demographics').remove();
      firebase.database.ref('/id-to-email').remove();
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
      this.setState({ demographicsFile: null });
      alert(
        'Please leave this window open for 5 minutes to allow the file to finish uploading.'
      );
    }
  };

  signInAction = () => {
    if (!this.state.signedIn) {
      firebase.signIn();
    } else {
      this.setState({ adminSignedIn: false, leaderSignedIn: false });
      firebase.signOut();
    }
  };

  componentWillMount() {
    firebase.auth.onAuthStateChanged((user) => {
      if (user) {
        this.setState({ btnText: 'Sign Out', signedIn: true });
        if (!this.state.adminSignedIn && !this.state.leaderSignedIn) {
          this.setState({ userText: user.email + ' (Student)' });
        }
      } else {
        this.setState({ btnText: 'Sign In', signedIn: false, userText: '' });
      }
    });
  }

  render() {
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
                  {this.state.mainTitle}
                </Typography>
              </Grid>
              <Grid item style={{ marginRight: 10, marginTop: 5 }}>
                <Typography variant='h7' color='inherit'>
                  {this.state.userText}
                </Typography>
              </Grid>
            </Grid>
            <Button
              color='inherit'
              onClick={this.signInAction}
              style={{ width: 100 }}
            >
              {this.state.btnText}
            </Button>
          </Toolbar>
        </AppBar>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Grid style={{ alignItems: 'center' }}>
            <DialogTitle>Choose a file to upload.</DialogTitle>
            <DialogActions style={{ justifyContent: 'center' }}>
              <CSVReader
                onFileLoaded={this.handleFileChanged}
                inputId='something'
                inputStyle={{ color: 'purple' }}
                style={{ margin: 'auto' }}
              />
            </DialogActions>
            <DialogActions style={{ justifyContent: 'center' }}>
              <Button
                variant='contained'
                onClick={this.uploadDemographics}
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
  }
}

export default DemographicsUpload;
