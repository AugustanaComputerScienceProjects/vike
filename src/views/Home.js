import Grid from '@material-ui/core/Grid';
import React, { Component } from 'react';
import { Image } from 'react-native';

import defaultImage from '../default.jpg';

// File for the home page

class Home extends Component {
  // Render the page
  render() {
    return (
      <div style={{ textAlign: 'center', paddingTop: 40 }}>
        <div style={{ display: 'inline-block' }}>
          <Grid container>
            <Grid item container direction='column' spacing={40}>
              <Grid item>
                <label style={{ fontSize: 40 }}>
                  Welcome to the Augustana Events App
                </label>
              </Grid>
              <Image
                style={{ height: 0, paddingTop: '56.25%' }}
                source={{ uri: defaultImage }}
              ></Image>
              <Grid item>
                <label style={{ fontSize: 20 }}>
                  Please sign in in order to use the app's features
                </label>
              </Grid>
              <Grid item style={{ paddingTop: 0, paddingBottom: 0 }}>
                <a href='https://osl-events-app.firebaseapp.com/privacy_policy.html'>
                  Privacy Policy
                </a>
              </Grid>
              <Grid item>
                <label style={{ fontSize: 20 }}>Created by:</label>
              </Grid>
              <Grid item>
                <label style={{ fontSize: 20 }}>
                  Kyle Workman, Jared Haeme, Brandon Thompson, Jack Cannell,
                  Brent Pierce, Paige Oucheriah
                </label>
              </Grid>
            </Grid>
          </Grid>
        </div>
      </div>
    );
  }
}

export default Home;
