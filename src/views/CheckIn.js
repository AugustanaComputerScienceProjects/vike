import {
  Box,
  Button,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
  Snackbar,
  TextField,
} from "@mui/material";
import { Scanner } from "@yudiel/react-qr-scanner";
import { format } from "date-fns";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { EVENT_STATUS, toTitleCase } from "../components/events/EventCard";
import firebase from "../config";

const CheckInPage = () => {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [guests, setGuests] = useState([]);
  const [selectedGuest, setSelectedGuest] = useState({});
  const [openDialog, setOpenDialog] = useState(false);
  const [openQRScanner, setOpenQRScanner] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  useEffect(() => {
    const fetchEvent = async () => {
      const eventRef = firebase.database.ref(`/current-events/${eventId}`);
      const snapshot = await eventRef.once("value");
      const fetchedEvent = snapshot.val();
      if (fetchedEvent) setEvent(fetchedEvent);

      if (fetchedEvent.guests)
        setGuests(
          Object.entries(fetchedEvent.guests).map(([userHandle, guestData]) => ({
            userHandle,
            ...guestData,
          }))
        );
    };

    fetchEvent();
  }, [eventId]);

  const handleGuestClick = (guest) => {
    setSelectedGuest(guest);
    setOpenDialog(true);
  };

  const handleManualCheckIn = async () => {
    if (selectedGuest.userHandle) {
      const newStatus =
        selectedGuest.status === EVENT_STATUS.CHECKED_IN
          ? EVENT_STATUS.GOING
          : EVENT_STATUS.CHECKED_IN;
      await firebase.database
        .ref(`/current-events/${eventId}/guests/${selectedGuest.userHandle}/status`)
        .set(newStatus);
      
      // Update guest status locally instead of refetching
      setGuests((prevGuests) =>
        prevGuests.map((guest) =>
          guest.userHandle === selectedGuest.userHandle
            ? { ...guest, status: newStatus }
            : guest
        )
      );
      
      setOpenDialog(false);
      setSnackbarMessage(
        `Status for ${selectedGuest.userHandle} updated successfully.`
      );
      setSnackbarOpen(true);
    }
  };

  const handleQRScan = async (result) => {
    if (result) {
      const ticketUserHandle = result.split("-")[0];
      const guest = guests.find(({ userHandle }) => userHandle === ticketUserHandle);
      if (guest) {
        if (guest.userHandle) {
          await firebase.database
            .ref(`/current-events/${eventId}/guests/${guest.userHandle}/status`)
            .set(EVENT_STATUS.CHECKED_IN);
          
          // Update guest status locally without refetching
          setGuests((prevGuests) =>
            prevGuests.map((g) =>
              g.userHandle === guest.userHandle
                ? { ...g, status: EVENT_STATUS.CHECKED_IN }
                : g
            )
          );
          
          setSnackbarMessage(`Checked in ${guest.userHandle} successfully!`);
          setSnackbarOpen(true);
        }
      }
    }
  };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const filteredGuests = guests.filter(({ userHandle }) =>
    userHandle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const extractTimestamp = (ticketId) => {
    const parts = ticketId.split("-");
    if (parts && parts.length > 0) {
      const timestamp = parts[parts.length - 1];
      if (timestamp) {
        return parseInt(timestamp, 10);
      }
    }
    return null;
  };

  const registrationDate = selectedGuest.ticketId
    ? extractTimestamp(selectedGuest.ticketId)
    : null;
  const formattedRegistrationDate = registrationDate
    ? format(new Date(registrationDate), "MMM d, yyyy h:mm a")
    : "";

  return (
    <Container>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box>
          <h2>{event?.name}</h2>
          <p>{event?.startDate}</p>
        </Box>
        <Button
          variant="contained"
          sx={{ height: "100%" }}
          onClick={() => setOpenQRScanner(true)}
        >
          Scan QR Code
        </Button>
      </Box>
      <TextField
        label="Search Guests"
        value={searchQuery}
        onChange={handleSearch}
        fullWidth
        margin="normal"
      />
      <List>
        {filteredGuests.map(({ userHandle, status, ticketId }) => (
          <ListItem
            key={userHandle}
            button
            onClick={() => handleGuestClick({ userHandle, status, ticketId })}
            secondaryAction={
              <Chip
                label={toTitleCase(status)}
                color="success"
                variant="outlined"
              />
            }
          >
            <ListItemText primary={userHandle} />
          </ListItem>
        ))}
      </List>
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>{selectedGuest.userHandle}</DialogTitle>
        <DialogContent>
          <p>Registration Date: {formattedRegistrationDate}</p>
          <p>
            Status: {selectedGuest.status ? toTitleCase(selectedGuest.status) : ""}
          </p>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleManualCheckIn} variant="contained">
            {selectedGuest.status === EVENT_STATUS.CHECKED_IN
              ? "Undo Check In"
              : "Check In"}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        fullWidth
        maxWidth="md"
        open={openQRScanner}
        onClose={() => setOpenQRScanner(false)}
      >
        <DialogTitle>Scan QR Code</DialogTitle>
        <DialogContent>
        <Scanner
  onResult={handleQRScan}
  onError={(error) => console.log(error?.message)}
  style={{ width: '100%', height: '100%' }}
  options={{
    delayBetweenScanSuccess: 200,
    delayBetweenScanAttempts: 200,
    facingMode: "environment",
    autoFocusMode: true, 
    flashMode: "torch",  // Enable flash
  }}
/>


        </DialogContent>
      </Dialog>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </Container>
  );
};

export default CheckInPage;
