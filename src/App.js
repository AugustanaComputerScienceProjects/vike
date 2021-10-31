import React, { Component } from 'react';
import './App.css';
import Home from './Home';
import Events from './AddEvent';
import PendingEvents from './PendingEvents';
import CurrentEvents from './CurrentEvents';
import PastEvents from './PastEvents';
import Tags from './Tags';
import Users from './Users';
import NavBar from './ButtonAppBar';
import Event from './Event';
import { BrowserRouter as Router, Route } from 'react-router-dom';

// Main application file that manages all the different views

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { selected: 'Home' };

    this.onNavChanged = this.onNavChanged.bind(this);
    this.mainDisplay = this.mainDisplay.bind(this);
  }

  // Checks which display should be visible
  mainDisplay() {
    if (this.state.selected === 'Home') {
      return Home;
    }

    if (this.state.selected === 'Add Event') {
      return Events;
    }

    if (this.state.selected === 'Pending Events') {
      return PendingEvents;
    }

    if (this.state.selected === 'Current Events') {
      return CurrentEvents;
    }

    if (this.state.selected === 'Past Events') {
      return PastEvents;
    }

    if (this.state.selected === 'Groups/Tags') {
      return Tags;
    }

    if (this.state.selected === 'Users') {
      return Users;
    }
  }

  // Called when a different page is selected, set the state to that page
  onNavChanged(page) {
    this.setState({ selected: page });
  }

  // Render the page
  render() {
    return (
      <div className='fullPage'>
        <div
          style={{ width: '100%', position: 'absolute', overflow: 'hidden' }}
        >
          <div style={{ height: '10%' }}>
            <NavBar navChanged={this.onNavChanged}></NavBar>
          </div>
          <div
            style={{
              paddingLeft: 20,
              paddingRight: 20,
              paddingTop: 20,
              marginBottom: 20,
            }}
          >
            <Router>
              <Route path='/' exact component={this.mainDisplay()} />
              <Route path='/event' component={Event} />
            </Router>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
