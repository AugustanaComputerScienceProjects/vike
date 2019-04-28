import React, { Component, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import NavDrawer from './NavDrawer';
import Home from './Home';
import Events from './AddEvent';
import PendingEvents from './PendingEvents';
import CurrentEvents from './CurrentEvents';
import PastEvents from './PastEvents';
import Tags from './Tags';
import Users from './Users';
import NavBar from "./ButtonAppBar";

class App extends Component {

    constructor(props) {
        super(props);
        this.state = { selected: "Home" }
        
        this.onNavChanged = this.onNavChanged.bind(this);
        this.mainDisplay = this.mainDisplay.bind(this);

    }

    mainDisplay() {
        if (this.state.selected == "Home") {
            return (
                <Home />
            );
        }

        if (this.state.selected == "Add Event") {
            return (
                <Events />
            );
        }

        if (this.state.selected == "Pending Events") {
            return  (
                <PendingEvents />
            );
        }

        if (this.state.selected == "Current Events") {
            return  (
                <CurrentEvents />
            );
        }

        if (this.state.selected == "Past Events") {
            return (
                <PastEvents />
            );
        }

        if (this.state.selected == "Tags") {
            return (
                <Tags/>
            );
        }

        if (this.state.selected == "Users") {
            return (
                <Users/>
            );
        }
    }
    onNavChanged(page) {
        this.setState({selected : page})
    }

     render() {
         return (
             <div className='fullPage'>
             <div style={{width: "100%", position: "fixed"}}>
                <div style={{height: "10%"}}>
                <NavBar navChanged={this.onNavChanged}></NavBar>
                </div>
                <div style={{ paddingLeft: 20, paddingRight: 20, paddingTop: 20 }}>
                {this.mainDisplay()}
                </div>
            </div>     
            </div>
    );
     }
}




export default App;
