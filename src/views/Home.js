import Grid from '@mui/material/Grid';
import React from 'react';
import defaultImage from '../assets/default.jpg';

// HOME PAGE

const Home = () => {
  return (
    <div style={{ textAlign: 'center', paddingTop: 30 }}>
      <div style={{ display: 'inline-block' }}>
        <Grid container>
          <Grid item container direction='column' spacing={2}>
            <Grid item style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 40 }}>
                Welcome to the Augustana Events App
              </label>
            </Grid>
            <img
              style={{ margin: '0 auto' }}
              src={defaultImage}
              alt='default'
            />
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
                Kyle Workman, Jared Haeme, Brandon Thompson, Jack Cannell, Brent
                Pierce, Paige Oucheriah
              </label>
            </Grid>
          </Grid>
        </Grid>
      </div>
    </div>
  );
};

export default Home;
