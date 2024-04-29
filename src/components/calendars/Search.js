import React, { useEffect, useState } from 'react';
import { TextField, List, ListItem, ListItemText } from '@material-ui/core';
import { Container } from '@mui/material';
import firebase from "../../config";
import { useParams } from "react-router-dom";
import EventsView from '../events/EventsViewNew';

const Search = () => {
    const { calendarId } = useParams();
    const [searchTerm, setSearchTerm] = useState('');
    const [calendar, setCalendar] = useState([]);
    const [events, setEvents] = useState([]); 
 
    useEffect(() => {
        const fetchCalendars = async () => {
            const calendarRef = firebase.database.ref(`/calendars/${calendarId}`);  
            const snapshot = await calendarRef.once("value");
            const fetchCalendar = snapshot.val();
            if (fetchCalendar) setCalendar(fetchCalendar);

            if (fetchCalendar.events)
                setEvents(
                    Object.entries(fetchCalendar.events).map(([eventId, eventData]) => ({ id: eventId, ...eventData }))
                );    
        }
        fetchCalendars();
    }, [calendarId]);

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    }; 

    const filteredEvents = events
  ? events.filter((event) =>
      event.name && event.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  : [];
 

    return (
        <Container >
            <TextField
                label="Search Events"
                variant="outlined"
                value={searchTerm}
                onChange={handleSearchChange}
                fullWidth
                margin='normal'
            />
            <List>
                {filteredEvents.map((event) => (
                    <ListItem key={event.id}>
                        <ListItemText primary={event.name} />
                        {/* <EventsView event={event} /> */}
                    </ListItem>
                ))}
            </List>
        </Container>
    );
};

export default Search;