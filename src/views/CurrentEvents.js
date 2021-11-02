import React, { Component } from 'react';

import { EventsView } from '../components/EventsView';

// File for managing the Current Events page

class CurrentEvents extends Component {
  // Render the Current Events page
  render() {
    return <EventsView eventType={'/current-events'} />;
  }
}

export default CurrentEvents;
