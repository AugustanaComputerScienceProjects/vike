import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import {
    Box,
    Button,
    Container,
    Dialog,
    DialogContent,
    Divider,
    Grid,
    Tab,
    Tabs,
    Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
// import defaultImage from "../assets/default.jpg";
import { format } from "date-fns";
import firebase from "../../config";
import AddEvent from "../events/AddEvent";
import EventCard from "../events/EventCard";
import { groupEventsByDate } from "../events/utils";
import Search from "./Search";

const ManageCalendar = () => {
    const { calendarId } = useParams();
    const [calendar, setCalendar] = useState(null);
    const [tabValue, setTabValue] = useState(0);
    const [isAddEventFormOpen, setIsAddEventFormOpen] = useState(false);
    const [isSearchEventFormOpen, setIsSearchEventFormOpen] = useState(false);
    const [eventsCalendar, setEventsCalendar] = useState([]);

    const fetchCalendarData = async (calendarId) => {
        const calendarRef = firebase.database.ref(`/calendars/${calendarId}`);
        const snapshot = await calendarRef.once("value");
        return snapshot.val();
    };

    useEffect(() => {
        const fetchCalendar = async () => {
            const calendar = await fetchCalendarData(calendarId);
            setCalendar({
                ...calendar,
                key: calendar.key,
            });

            const eventsRef = firebase.database.ref(
                `/calendars/${calendarId}/eventsCalendar`
            );
            const eventsSnapshot = await eventsRef.once("value");
            const events = eventsSnapshot.val();
            const eventsArray = Object.entries(events || {}).map(
                ([id, data]) => ({
                    id,
                    key: id,
                    ...data,
                })
            );
            setEventsCalendar(eventsArray);
        };
        fetchCalendar();
    }, [calendarId]);

    const renderEventSection = (date, eventsCalendar) => {
        const eventDate = new Date(date);
        eventDate.setMinutes(
            eventDate.getMinutes() + eventDate.getTimezoneOffset()
        );
        return (
            <Grid container spacing={2} key={date} sx={{ mt: 2 }}>
                <Grid item xs={3}>
                    <Typography variant="h6">
                        {format(eventDate, "MMM d")}
                    </Typography>
                    <Typography variant="body1">
                        {format(eventDate, "EEEE")}
                    </Typography>
                </Grid>
                <Grid item xs={9}>
                    {eventsCalendar.map((event) => (
                        // <EventCard key={event.key} event={event} />
                        <Box key={event.key}>
                            <EventCard event={event} />
                            <Button
                                variant="contained"
                                color="error"
                                onClick={() => handleDeleteClick(event)}
                            >
                                Remove
                            </Button>
                        </Box>
                    ))}
                </Grid>
            </Grid>
        );
    };

    const handleDeleteClick = async (e) => {
        const updatedEvents = eventsCalendar.filter(
            (event) => event.id !== e.id
        );
        setEventsCalendar(updatedEvents);
        const eventsRef = firebase.database.ref(
            `/calendars/${calendarId}/eventsCalendar`
        );
        await eventsRef.set(
            Object.fromEntries(updatedEvents.map((event) => [event.id, event]))
        );
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleAddEventClick = () => {
        setIsAddEventFormOpen(true);
    };

    const handleAddEventFormClose = () => {
        setIsAddEventFormOpen(false);
        refreshEventsCalendar();
    };

    const handleSearchEventClick = () => {
        setIsSearchEventFormOpen(true);
    };

    const handleSearchEventFormClose = () => {
        setIsSearchEventFormOpen(false);
        refreshEventsCalendar();
    };

    if (!calendar) {
        return <Typography variant="body1">Loading...</Typography>;
    }

    const refreshEventsCalendar = async () => {
        const eventsRef = firebase.database.ref(
            `/calendars/${calendarId}/eventsCalendar`
        );
        const eventsSnapshot = await eventsRef.once("value");
        const events = eventsSnapshot.val();
        const eventsArray = Object.entries(events || {}).map(([id, data]) => ({
            id,
            ...data,
        }));
        setEventsCalendar(eventsArray);
    };

    return (
        <Container maxWidth="md">
            <Typography variant="h3" align="center">
                Manage Calendar
            </Typography>
            <Typography variant="h4" align="center">
                {calendar.name}
            </Typography>
            <Tabs value={tabValue} onChange={handleTabChange}>
                <Tab label="Events" />
                <Tab label="Subscribers" />
                <Tab label="Admins" />
                <Tab label="Settings" />
            </Tabs>
            <Divider />
            <Box sx={{ mt: 4 }}>
                {tabValue === 0 && (
                    <Container
                        style={{ display: "flex", flexDirection: "column" }}
                    >
                        <Box
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                            }}
                        >
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<AddIcon />}
                                onClick={handleAddEventClick}
                            >
                                Add New Event
                            </Button>
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<SearchIcon />}
                                onClick={handleSearchEventClick}
                            >
                                Search Available Events
                            </Button>
                        </Box>
                        {Object.entries(groupEventsByDate(eventsCalendar))
                            .sort((a, b) => new Date(a[0]) - new Date(b[0]))
                            .map(([date, eventsCalendar]) =>
                                renderEventSection(date, eventsCalendar)
                            )}
                    </Container>
                )}
                {tabValue === 1 && (
                    <Typography variant="h5">Subscribers</Typography>
                )}
                {tabValue === 2 && <Typography variant="h5">Admins</Typography>}
                {tabValue === 3 && (
                    <Typography variant="h5">Settings</Typography>
                )}
            </Box>
            <Dialog
                open={isAddEventFormOpen}
                onClose={handleAddEventFormClose}
                fullWidth
                maxWidth="md"
            >
                <DialogContent>
                    <AddEvent />
                </DialogContent>
            </Dialog>
            <Dialog
                open={isSearchEventFormOpen}
                onClose={handleSearchEventFormClose}
                fullWidth
                maxWidth="md"
            >
                <DialogContent>
                    <Search />
                </DialogContent>
            </Dialog>
        </Container>
    );
};

export default ManageCalendar;
