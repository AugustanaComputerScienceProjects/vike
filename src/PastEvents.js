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

import firebase from './config';




class PastEvents extends Component {

    constructor(props) {
        super(props);
        this.state = {
            sortDate1: "2017-05-24",
            sortDate2: "2017-05-24",
            displayedEvents: [],
            events : [],
        }
        this.handleDate1Change = this.handleDate1Change.bind(this);
        this.handleDate2Change = this.handleDate2Change.bind(this);
        this.readPastEvents = this.readPastEvents.bind(this);
        
        
    }

    componentDidMount(){
        this.readPastEvents();
    }

        listener = null;

    //TODO hook up do firebase and alter display based on dates

    readPastEvents() {
        let self = this;
        this.listener = firebase.database.ref('/past-events').orderByChild('startDate');
        this.listener.on('value', function(snapshot) {
            let listEvents = [];
            snapshot.forEach(function(childSnapshot) {
                let webEvent = childSnapshot.val();

                let len = 0;

                if(webEvent.hasOwnProperty("users")){
                //    webEvent["users"].forEach(function(user){
                  //      len++
                   // })
                   let users = webEvent["users"]
                   len = Object.keys(users).length;
                }


                let event = new PastEventObj(webEvent["name"],"2017-05-24",len,0,0,0,0)
                self.setState(state =>{
                    const displayedEvents = state.displayedEvents.concat(event);

                    return {
                        displayedEvents,
                    }
                })

                if(listEvents.length==snapshot.numChildren()){
                    self.setState({ events: listEvents});
                }


            });
        });
    }


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