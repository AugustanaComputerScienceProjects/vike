import React, { Component, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import NavDrawer from './NavDrawer';
import Events from './Events';
import PastEvents from './PastEvents';
import Tags from './Tags';
import { Grid } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';




class PastEvent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            parentEvent : props.parentEvent,
           
          
        }

    }


    render() {
        return (
            <div className='fullPage' style={{ width: "300px"}}>

                <Grid container direction="column" style={{margin : "10px"}}>

                    <Typography variant="subtitle1">
                        {this.state.parentEvent.getTitle()} - {this.state.parentEvent.getDate()}
                    </Typography>

                    <Grid container item direction="column" direction="row"
                        justify="space-between"
                        alignItems="flex-start">

                        <Grid item>
                        
                        <Typography variant="subtitle2">
                                    Total Attendence : {this.state.parentEvent.getAttend()}
                                </Typography>
                        
                        </Grid>

                        <Grid item>
                        <Typography varient="subtitle1">
                                        Number Freshman : {this.state.parentEvent.getFresh()}
                                    </Typography>
                        
                        </Grid>
    
    
    
                    </Grid>


                    <Grid container item direction="column" direction="row"
                        justify="space-between"
                        alignItems="flex-start">

                        <Grid item>
                        <Typography varient="subtitle1">
                                    Number Sophmores : {this.state.parentEvent.getSoph()}
                                </Typography>
                        
                        </Grid>

                        <Grid item>
                        <Typography varient="subtitle1">
                                    Number Juniors : {this.state.parentEvent.getJun()}
                                </Typography>
                        
                        </Grid>
    
    
    
                    </Grid>

                    <Grid container item direction="column" direction="row"
                        justify="space-between"
                        alignItems="flex-start">

                        <Grid item>
                        <Typography varient="subtitle1">
                                    Number Seniors : {this.state.parentEvent.getSen()}
                                </Typography>
                        
                        </Grid>

    
    
    
                    </Grid>


                </Grid>






            </div>

        );
    }
}




export default PastEvent;
