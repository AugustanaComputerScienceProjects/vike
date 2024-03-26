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
import { STATUS, toTitleCase } from "../components/events/EventCard";
import firebase from "../config";

const CheckInPage = () => {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [guests, setGuests] = useState([]);
  const [selectedGuest, setSelectedGuest] = useState(null);
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

      if (fetchedEvent.guests) setGuests(Object.entries(fetchedEvent.guests));
    };

    fetchEvent();
  }, [eventId]);

  const handleGuestClick = (guest) => {
    setSelectedGuest(guest);
    setOpenDialog(true);
  };

  const handleManualCheckIn = async () => {
    const [userHandle, guestData] = selectedGuest;
    if (userHandle) {
      const newStatus =
        guestData.status === STATUS.CHECKED_IN
          ? STATUS.GOING
          : STATUS.CHECKED_IN;
      await firebase.database
        .ref(`/current-events/${eventId}/guests/${userHandle}/status`)
        .set(newStatus);
      setOpenDialog(false);
      // Refresh the guest list
      const eventRef = firebase.database.ref(`/current-events/${eventId}`);
      const snapshot = await eventRef.once("value");
      const fetchedEvent = snapshot.val();
      if (fetchedEvent && fetchedEvent.guests) {
        setGuests(Object.entries(fetchedEvent.guests));
      }
      setSnackbarMessage(`Status for ${userHandle} updated successfully.`);
      setSnackbarOpen(true);
    }
  };

  const handleQRScan = async (result) => {
    console.log("result", result);
    if (result) {
      const [ticketUserHandle, _] = result.split("-");
      console.log("ticketUserHandle", ticketUserHandle);
      const guest = guests.find(([userHandle, guestData]) => {
        console.log(userHandle, selectedGuest);
        return userHandle === ticketUserHandle;
      });
      if (guest) {
        const [userHandle] = guest;
        if (userHandle) {
          await firebase.database
            .ref(`/current-events/${eventId}/guests/${userHandle}/status`)
            .set(STATUS.CHECKED_IN);
          // Refresh the guest list
          const eventRef = firebase.database.ref(`/current-events/${eventId}`);
          const snapshot = await eventRef.once("value");
          const fetchedEvent = snapshot.val();
          if (fetchedEvent) {
            setGuests(Object.entries(fetchedEvent.guests));
          }
          // Show snackbar message for successful check-in
          setSnackbarMessage(`Checked in ${userHandle} successfully!`);
          setSnackbarOpen(true);
        }
      }
    }
  };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const filteredGuests = guests.filter(([userHandle]) =>
    userHandle.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          sx={{
            height: "100%",
          }}
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
        {filteredGuests.map(([userHandle, guestData]) => (
          <ListItem
            key={userHandle}
            button
            onClick={() => handleGuestClick([userHandle, guestData])}
            secondaryAction={
              <Chip
                label={toTitleCase(guestData.status)}
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
        <DialogTitle>{selectedGuest?.[0]}</DialogTitle>
        <DialogContent>
          <p>
            Registration Date:{" "}
            {selectedGuest && selectedGuest?.[1].ticketId
              ? format(
                  new Date(
                    parseInt(selectedGuest?.[1].ticketId?.split("-")[3])
                  ),
                  "MMM d, yyyy h:mm a"
                )
              : ""}
          </p>
          <p>
            Status:{" "}
            {selectedGuest && selectedGuest?.[1].status
              ? toTitleCase(selectedGuest?.[1].status)
              : ""}
          </p>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleManualCheckIn} variant="contained">
            {selectedGuest?.[1].status === STATUS.CHECKED_IN
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
