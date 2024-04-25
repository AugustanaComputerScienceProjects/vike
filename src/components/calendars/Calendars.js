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
                console.log(calendar);
                <h2>{calendar.name}</h2>
                console.log(calendar.name);
                </div>
            ))}
            </div>
        );
    }
}

export default Calendars;