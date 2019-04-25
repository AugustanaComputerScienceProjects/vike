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
import MomentUtils from '@date-io/moment';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';




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

                    <MuiPickersUtilsProvider utils={MomentUtils}>
                        <Grid container direction="row" justify="center" alignItems="flex-start" >
                            <Grid item>

                                <DatePicker
                                    margin="normal"
                                    label="Start Date"
                                    value={this.state.sortDate1}
                                    onChange={this.handleDate1Change}
                                />                         </Grid>


                            <Grid item>

                                <Typography variant="subtitle1" style={{ padding: "30px" }}>
                                    To
                        </Typography>

                            </Grid>

                            <Grid item>
                            <DatePicker
                                    margin="normal"
                                    label="Start Date"
                                    value={this.state.sortDate2}
                                    onChange={this.handleDate2Change}
                                />      
                            </Grid>
                        </Grid>

                    </MuiPickersUtilsProvider>

                    {this.state.displayedEvents.map(e => (
                        <Card style={{margin : "10px", padding : "4px"}}>
                        <PastEvent parentEvent={e} />

                        </Card>
                    ))}

                </Grid>


            </div>


        );
    }
}

export default PastEvents;