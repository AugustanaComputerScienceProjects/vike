import {
    Box,
    Button,
    Container,
    Divider,
    Tab,
    Tabs,
    Typography,
    Dialog,
    DialogContent,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from '@mui/icons-material/Search';
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
// import defaultImage from "../assets/default.jpg";
import firebase from "../../config";
import useEvents from "../events/useEvents";
import AddEvent from "../events/AddEvent";
import Search from "../events/Search";

const ManageCalendar = () => {
    const { calendarId } = useParams();
    const [calendar, setCalendar] = useState(null);
    const [message, setMessage] = useState("");
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [tabValue, setTabValue] = useState(0);
    const [profile64, setProfile64] = useState(null);
    const [isAddEventFormOpen, setIsAddEventFormOpen] = useState(false);
    const [isSearchEventFormOpen, setIsSearchEventFormOpen] = useState(false);
    const { refreshEvents } = useEvents();

    useEffect(() => {
        const fetchCalendar = async () => {
            const calendarRef = firebase.database.ref(`calendars/${calendarId}`);
            const snapshot = await calendarRef.once("value");
            const calendar = snapshot.val();
            setCalendar({
                ...calendar,
                key: snapshot.key,
            });
            const profileUrl = await firebase.storage
                .ref("Profiles")
                .child(`${calendar.profileId}.png`)
                .getDownloadURL();
            setProfile64(profileUrl);
        }


        fetchCalendar();
    }, [calendarId]);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    }

    const displayMessage = (message) => {
        setMessage(message);
        setOpenSnackbar(true);
    };

    const handleSnackbarClose = (event, reason) => {
        if (reason === "clickaway") {
          return;
        }
        setOpenSnackbar(false);
    };

    if (!calendar) {
        // fetchCalendar();
        return <Typography variant="body1">Loading...</Typography>;
    }

    const handleAddEventClick = () => {
        setIsAddEventFormOpen(true);
    };

    const handleAddEventFormClose = () => {
        setIsAddEventFormOpen(false);
        refreshEvents();
    };
    
    const handleSearchEventClick = () => {
        setIsSearchEventFormOpen(true);
    }
    
    const handleSearchEventFormClose = () => {
        setIsSearchEventFormOpen(false);
        refreshEvents();
    }

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
                    <div style={{ display: "flex" }}>
                        {/* <Typography variant="h5">Events</Typography> */}
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<SearchIcon />}
                            onClick={handleSearchEventClick}
                        >
                            Search Available Events
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<AddIcon />}
                            // onClick={() => history.push(`/calendars/${calendarId}/events/add`)}
                            onClick={handleAddEventClick}
                        >
                            Add Event
                        </Button>
                    </div>
                )}
                {tabValue === 1 && (
                    <Typography variant="h5">Subscribers</Typography>
                )}
                {tabValue === 2 && (
                    <Typography variant="h5">Admins</Typography>
                )}
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
    )
}

export default ManageCalendar;

