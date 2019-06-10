import React, { Component, useState } from 'react';
import './App.css';
import { EventsView } from './EventsView';

// File for managing the Current Events page

class CurrentEvents extends Component {

    // Render the Current Events page
    render() {
        const { classes } = this.props;
        const children = [];

        return (
            
            <EventsView eventType={'/current-events'}  /> 
        );
    }
}

export default CurrentEvents;