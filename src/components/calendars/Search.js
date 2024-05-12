import React, { useEffect, useState } from 'react';
import { TextField, List, ListItem, Button } from '@material-ui/core';
import { Box, Container } from '@mui/material';
import firebase from "../../config";
import { useParams } from "react-router-dom"; 

const Search = () => {
    const { calendarId } = useParams();
    const [searchTerm, setSearchTerm] = useState(''); 
    const [eventsCalendar, setEventsCalendar] = useState([]); 
    const [addedEvents, setAddedEvents] = useState({});

    // Search for events that haven't been added to any calendar 
    useEffect(() => {
        const fetchEvents = async () => {
            const eventsRef = firebase.database.ref('/current-events');
            const snapshot = await eventsRef.once('value');
            const events = snapshot.val();
            const eventsArray = Object.entries(events || {}).map(([id, data]) => ({ id, ...data }));
            const calendarRef = firebase.database.ref(`/calendars/${calendarId}`);  
            const calendarSnapshot = await calendarRef.once("value");
            const fetchCalendar = calendarSnapshot.val();
            if (fetchCalendar && fetchCalendar.eventsCalendar) {
                const filteredEventsArray = eventsArray.filter(event => !fetchCalendar.eventsCalendar[event.id]);
                setEventsCalendar(filteredEventsArray);
            }
        }
        fetchEvents();
    }, [calendarId]);

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    }; 

    const filteredEvents = eventsCalendar
  ? eventsCalendar.filter((event) =>
      event.name && event.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  : []; 

const handleAddClick = async (selectedEvent) => {
    const calendarRef = firebase.database.ref(`/calendars/${calendarId}`);
    const snapshot = await calendarRef.once("value");
    const fetchedCalendar = snapshot.val();
    if (fetchedCalendar && fetchedCalendar.eventsCalendar) {
            const eventsCalendar = fetchedCalendar.eventsCalendar;
            eventsCalendar[selectedEvent.id] = selectedEvent;
            calendarRef.update({ eventsCalendar });
    }
    setAddedEvents(prevState => ({ ...prevState, [selectedEvent.id]: true }));
}

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
                    <ListItem 
                        key={event.id} 
                        style={{ display: "flex", justifyContent: "space-between" }}
                    >
                        <Box style={{ margin: -10}}>
                            <h3 style={{ marginBottom: 5 }}>{event?.name}</h3>
                            <p>{event?.startDate}</p>
                        </Box> 
                        <Button
                            variant="contained"
                            sx={{
                                height: "100%",
                            }}
                            color={addedEvents[event.id] ? "default" : "primary"}
                            onClick={() => handleAddClick(event)}
                            >
                            {addedEvents[event.id] ? "Added" : "Add"}
                        </Button>
                    </ListItem>
                ))}
            </List> 
        </Container>
    );
};

export default Search;