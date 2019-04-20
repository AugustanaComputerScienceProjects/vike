import React, { Component, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import NavDrawer from './NavDrawer';
import Events from './AddEvent';
import CurrentEvents from './CurrentEvents';
import PastEvents from './PastEvents';
import Tags from './Tags';




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
                 <NavDrawer navChanged={this.onNavChanged} />

                 <div style={{ paddingLeft: "160px" }}>
                 {this.mainDisplay()}

                   </div>  
                
             </div>

    );
     }
}




export default App;
