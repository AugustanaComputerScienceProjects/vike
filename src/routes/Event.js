/* eslint-disable no-extend-native */
/* eslint-disable react/no-direct-mutation-state */
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import queryString from 'query-string';
import React, { Component } from 'react';

import firebase from '../config';

// File for managing the event check in page

class Event extends Component {
  state = { text: 'Checking In...', hidden: 'visible' };
  off = null;

  constructor(props) {
    super(props);
    this.values = queryString.parse(this.props.location.search);
    this.checkIn();
  }

  // Checks the user into the event
  checkIn() {
    let self = this;
    if (
      this.values.id !== null &&
      this.values.id !== '' &&
      this.values.name !== null &&
      this.values.name !== ''
    ) {
      this.off = firebase.auth.onAuthStateChanged((user) => {
        if (user) {
          let email = user.email.replace('@augustana.edu', '');
          firebase.database
            .ref('/current-events/' + this.values.id + '/users/' + email)
            .set(true, function(error) {
              if (error) {
                self.setState({
                  text:
                    "There was a problem checking you in.\n\nMake sure this isn't an old event link.",
                  hidden: 'hidden',
                });
              } else {
                self.setState({
                  text: 'Successfully checked in as ' + email + '.',
                  hidden: 'hidden',
                });
              }
            });
        } else {
          self.setState({
            text:
              'There was a problem checking you in.\n\nMake sure you are signed into the Augustana Events Web App using your Augustana email.',
            hidden: 'hidden',
          });
        }
      });
    } else {
      this.values.name = 'Error';
      this.state.text = 'Invalid QR link.';
      this.state.hidden = 'hidden';
    }
  }

  // Turn off auth listener when the component unmounts
  componentWillUnmount() {
    this.off();
  }

  // Render the event check in page
  render() {
    return (
      <div style={{ textAlign: 'center', paddingTop: 40 }}>
        <div style={{ display: 'inline-block' }}>
          <Grid container>
            <Grid item container direction='column' spacing={40}>
              <Grid item>
                <label style={{ fontSize: 40 }}>
                  {this.values.name.replaceAll('/+', ' ')}
                </label>
              </Grid>
              <Grid item>
                <label style={{ fontSize: 20 }}>
                  {this.state.text.split('\n').map((item, key) => {
                    return (
                      <span key={key}>
                        {item}
                        <br />
                      </span>
                    );
                  })}
                </label>
              </Grid>
              <Grid item>
                <CircularProgress
                  style={{ visibility: this.state.hidden }}
                ></CircularProgress>
              </Grid>
            </Grid>
          </Grid>
        </div>
      </div>
    );
  }
}

export default Event;

// Function for replacing all of the + signs in the name so that it is displayed with spaces instead
String.prototype.replaceAll = function(search, replacement) {
  var target = this;
  return target.replace(new RegExp(search, 'g'), replacement);
};
