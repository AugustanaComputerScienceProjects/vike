import React, { Component, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';




class App extends Component {

    

     render() {
         return (
             <div className='fullPage' style={{ backgroundColor: 'blue' }}>
                 <Grid
                     container
                     direction="row"
                     justify="center"
                     alignItems="center"
                 >
                     <Grid item xs={1}>
                         <Paper> Pick a time:
                             
                             </Paper>
                      
                     </Grid>
                     <Grid item xs={1}>
                         <Paper>
                         <TextField
                             type="time"
                             variant="filled"
                             color='white'
                             backgroundColor='white'
                             />
                         </Paper>
                     </Grid>

                         <Grid item xs={1}>
                             <Paper>
                         <TextField
                             type="Date"
                             variant="filled"
                             color='white'
                             backgroundColor='white'
                             />
                         </Paper>
                     </Grid>

                 </Grid>


                
             </div>

    );
     }
}




export default App;
