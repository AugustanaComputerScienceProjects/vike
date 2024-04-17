// Set up the database for calendars 
/*
I'm sketching out the database, how the entities (event, user, calendar) connect with each other. 
I can understand calendar as a group of events, so naming it calendar instead of group or subscription seems more appropriate because it's not tightly tied to a group. 
For example, if I have a series of events in the welcome week, the calendar will be named "Welcome Week". 
The calendar will have its own id. 
An Event will have an optional field "calendar_id". 
A User will own one or more calendars. 
So, in the calendar, there will be a user_id as a foreign key.
*/

import React, { Component } from "react";
import firebase from "../../config";
import DispatchGroup from '../components/DispatchGroup';

class Calendars extends Component {
    group = new DispatchGroup();
    // constructor(props) {
    //     super(props);

        state = {
            calendars: [],
            events: [],
            users: [],
            key: '',
            data: '',
            description: '',
            duration: '',
            ref: '',
            deleting: false,
            adminSignedIn: false,
            leaderSignedIn: false,
            hidden: 'visible',
        };
    // }

     // Fetch calendars from the database
    fetchCalendars() {
        firebase.database.ref('/calendars').on('value', (snapshot) => {
        const calendarsData = snapshot.val();
        this.setState({ calendars: calendarsData });
        });
    }

    componentDidMount() {
        this.fetchCalendars();
    }

    render() {
        return (
            <div>
            {this.state.calendars.map((calendar, index) => (
                <div key={index}>
                {/* Display the calendar details */}
                console.log(calendar);
                <h2>{calendar.name}</h2>
                console.log(calendar.name);
                {/* ...other calendar details... */}
                </div>
            ))}
            </div>
        );
    }
}

export default Calendars;