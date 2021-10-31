import React, { Component } from 'react';
import './App.css';
import { EventsView } from './EventsView';

// File for managing the Current Events page

class CurrentEvents extends Component {
  // Render the Current Events page
  render() {
    return <EventsView eventType={'/current-events'} />;
  }
}

export default CurrentEvents;
