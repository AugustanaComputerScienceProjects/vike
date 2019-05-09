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
            sortDate2: "2017-05-22",
            displayedEvents: [],
            events : [],
        }
        this.handleDate1Change = this.handleDate1Change.bind(this);
        this.handleDate2Change = this.handleDate2Change.bind(this);
        this.readPastEvents = this.readPastEvents.bind(this);
        this.createDisplayEvents = this.createDisplayEvents.bind(this);
        
        
    }

    componentDidMount(){
        this.readPastEvents();
    }

    componentWillUnmount() {
        this.listener.off();
    }

        listener = null;


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

                let arr = webEvent["startDate"].split(' ');
                let arr2 = arr[0].split('-');
                let arr3 = arr[1].split(':');
                let date = arr2[2] + '-' + arr2[0] + '-' + arr2[1]


                let event = new PastEventObj(webEvent["name"],date,len,webEvent["users"])
                listEvents.push(event);

                

                


            });
            self.setState({displayedEvents : listEvents});
            self.setState({events : listEvents});
            self.setState({sortDate1 : listEvents[0].getDate()})
            self.setState({sortDate2 : listEvents[listEvents.length-1].getDate()})

        });
        
    }

    async createDisplayEvents(d1,d2){
      
        console.log(d2)

        let startInd = this.state.events.length;
        let endInd = -2;

        var moment = require('moment');

        for(let i = 0; i < this.state.events.length; i++){
            let date = (this.state.events[i].getDate());
            if(moment(date).isSameOrAfter(d1)){
                startInd = i;
                //console.log(date);
                //console.log(this.state.sortDate1);
                //console.log(i);
                 i = this.state.events.length;
            }
           
        }
        for(let i = startInd; i < this.state.events.length; i++){
            let date = new Date(this.state.events[i].getDate());
            if(moment(date).isAfter(d2)){
                endInd = i
                i = this.state.events.length;
            }
        }

        if(endInd == -2){
            endInd = this.state.events.length
        }

        let displayedEvents = []

        console.log(endInd)
        for(let i = startInd; i < endInd; i++){
     //       console.log(this.state.events[i]);
            displayedEvents.push(this.state.events[i])
        }
        //console.log(displayedEvents);

        //console.log(startInd);
        //console.log(endInd);

        //let displayedEvents = [];
        //for( let i = 0; i < this.state.events.length; i++){
            //let event = this.state.events[i]
           // console.log(event.getDate() + " "+ d1 + moment(event.getDate()).isSameOrAfter(d1));
            //if(moment(event.getDate()).isSameOrAfter(d1)){
            //    displayedEvents.push(event);
                
            //}

           
        //}
        //console.log(displayedEvents);
        await this.setState({displayedEvents : []});
        await this.setState({displayedEvents : displayedEvents});


    }


    handleDate1Change = e => {
        let date = new Date(e);
        var month = (1 + date.getMonth()).toString();
        month = month.length > 1 ? month : '0' + month;
        var day = date.getDate().toString();
        day = day.length > 1 ? day : '0' + day;

        let sortDate1 = date.getFullYear()+ '-' + month + '-' + day;

        this.setState({ sortDate1: sortDate1 });
        this.createDisplayEvents(sortDate1, this.state.sortDate2);
    };

    handleDate2Change = e => {
        let date = new Date(e);
        var month = (1 + date.getMonth()).toString();
        month = month.length > 1 ? month : '0' + month;
        var day = date.getDate().toString();
        day = day.length > 1 ? day : '0' + day;

        let sortDate2 = date.getFullYear()+ '-' + month + '-' + day;

        this.setState({ sortDate2: sortDate2 });
        this.createDisplayEvents(this.state.sortDate1, sortDate2);
    };

    render() {
        const children = [];
        this.state.displayedEvents.forEach(function(event) {
            //console.log(event);
            children.push(<Card style={{margin : "10px", padding : "4px"}}><PastEvent parentEvent={event}/></Card>)
            //console.log(children)
        })

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
                                    label="End Date"
                                    value={this.state.sortDate2}
                                    onChange={this.handleDate2Change}
                                />      
                            </Grid>
                        </Grid>

                    </MuiPickersUtilsProvider>

                    {children}

                </Grid>
                
            </div>


        );
    }
}

export default PastEvents;