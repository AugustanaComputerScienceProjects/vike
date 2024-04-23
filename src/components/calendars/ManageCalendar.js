import {
    Autocomplete,
    Box,
    Button,
    Chip,
    Container,
    Divider,
    FormControl,
    Grid,
    List,
    ListItem,
    ListItemText,
    Snackbar,
    Tab,
    Tabs,
    TextField,
    Typography,
} from "@mui/material";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import moment from "moment";
import { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
// import defaultImage from "../assets/default.jpg";
import { toTitleCase } from "../calendars/CalendarCard";
import ImageUpload from "../events/ImageUpload";
import useRoleData from "../events/useRoleData";
import { handleImageFileChanged } from "../events/utils";
import firebase from "../../config";
import e from "cors";

const ManageCalendar = () => {
    const { calendarId } = useParams();
    const [calendar, setCalendar] = useState(null);
    const [message, setMessage] = useState("");
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [tabValue, setTabValue] = useState(0);
    const [profile64, setProfile64] = useState(null);
    const [currImage, setCurrImage] = useState(null);
    const { databaseTags, groups } = useRoleData();
    const history = useHistory();

    useEffect(() => {
        const fetchCalendar = async () => {
            // const calendarRef = firebase.database.ref(`calendars/${calendarId}`);
            // calendarRef.on("value", (snapshot) => {
            //     const calendar = snapshot.val();
            //     setCalendar(calendar);
            //     setProfile64(calendar.profileUrl);
            // });

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
            setCurrImage(profileUrl);
        }
        // const profileRef = firebase.storage.ref(`Profiles/${calendarId.profileId}.png`);


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
            <Box sx={{ mt: 4}}>
                {tabValue === 0 && (
                    <Typography variant="h5">Events</Typography>
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
        </Container>
            
    )
}

export default ManageCalendar;

