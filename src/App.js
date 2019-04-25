import React, { Component, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import NavDrawer from './NavDrawer';
import Events from './AddEvent';
import CurrentEvents from './CurrentEvents';
import PastEvents from './PastEvents';
import Tags from './Tags';
import NavBar from "./ButtonAppBar";


class App extends Component {

    constructor(props) {
        super(props);
        this.state = { selected: "Add Event" }
        
        this.onNavChanged = this.onNavChanged.bind(this);
        this.mainDisplay = this.mainDisplay.bind(this);

    }

    mainDisplay() {
        if (this.state.selected == "Add Event") {
            return (
                <Events />
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
    }
    onNavChanged(page) {
        this.setState({selected : page})
    }

     render() {
         return (
             <div className='fullPage'>
             <div style={{width: "100%"}}>
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
