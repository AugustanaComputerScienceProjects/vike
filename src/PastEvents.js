import React, { Component, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Drawer from '@material-ui/core/Drawer';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import Typography from '@material-ui/core/Typography';
import PastEvent from './PastEvent';
import PastEventObj from './PastEventObj';
import { MuiPickersUtilsProvider, TimePicker, DatePicker } from 'material-ui-pickers';




class PastEvents extends Component {

    constructor(props) {
        super(props);
        this.state = {
            sortDate1: "2017-05-24",
            sortDate2: "2017-05-24",
            displayedEvents: [new PastEventObj("title1", "2017-05-24", 1, 2, 3, 4, 5), new PastEventObj("title2", "2017-05-24", 1, 2, 3, 4, 5), new PastEventObj("title3", "2017-05-24", 1, 2, 3, 4, 5)]
        }
        this.handleDate1Change = this.handleDate1Change.bind(this);
        this.handleDate2Change = this.handleDate2Change.bind(this);
    }
    //TODO hook up do firebase and alter display based on dates

    handleDate1Change = event => {
        this.setState({ sortDate1: event.target.value });
    };

    handleDate2Change = event => {
        this.setState({ sortDate2: event.target.value });
    };

    render() {
        return (
            <div style={{ width: "100vw" }}>


                <Grid container direction="column" justify="center" alignItems="center" >

                    <Grid container direction="row" justify="center" alignItems="flex-start" >
                        <Grid item>

                            <TextField type="date" defaultValue={this.state.sortDate1} onChange={this.handleDate1Change}>  </TextField>
                         </Grid>
                  

                        <Grid item>

                            <Typography variant="subtitle1" style={{ padding: "3px" }}>
                                To
                        </Typography>

                        </Grid>

                        <Grid item>
                            <TextField type="date" defaultValue={this.state.sortDate2} onChange={this.handleDate2Change}>

                            </TextField>
                        </Grid>
                    </Grid>


                    {this.state.displayedEvents.map(e => (
                        <PastEvent parentEvent={e} />
                    ))}

                </Grid>

               
            </div>


        );
    }
}

export default PastEvents;