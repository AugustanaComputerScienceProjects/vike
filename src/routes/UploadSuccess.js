import React from 'react';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Grid';

const UploadSuccess = () => (
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Grid direction='column'>
          <Grid>
            <DialogTitle style={{ display: 'flex', justifyContent: 'center' }}>
              <label style={{ fontSize: 40 }}>Upload Successful</label>
            </DialogTitle>
          </Grid>
          <Grid>
            <label
              style={{ fontSize: 25, disply: 'flex', justifyContent: 'center' }}
            >
              You have successfully uploaded to Firebase.
            </label>
          </Grid>
        </Grid>
      </div>
    );


export default UploadSuccess;
