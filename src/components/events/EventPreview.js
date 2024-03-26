import { Box, Button, Typography } from "@mui/material";
import { format } from "date-fns";
import firebase from "../../config";
import { STATUS } from "./EventCard";
import { generateUniqueTicketId } from "./utils";

const EventGuestActions = ({
  eventStartDate,
  currentUserHandle,
  event,
  status,
}) => {
  const handleRegister = async () => {
    const ticketId = generateUniqueTicketId(currentUserHandle, event.key);
    const eventRef = firebase.database.ref(`/current-events/${event.key}`);

    const updatedEvent = {
      ...event,
      guests: {
        ...event.guests,
        [currentUserHandle]: {
          ticketId,
          status: STATUS.GOING,
        },
      },
    };

    await eventRef.update(updatedEvent);
    alert("Registration successful!");
  };

  const handleAddToCalendar = () => {
    const startTime = new Date(event.startDate)
      .toISOString()
      .replace(/-|:|\.\d\d\d/g, "");
    const endTime = new Date(event.endDate)
      .toISOString()
      .replace(/-|:|\.\d\d\d/g, "");
    const title = encodeURIComponent(event.name);
    const details = encodeURIComponent(
      event.description || "No details provided."
    );
    const location = encodeURIComponent(
      event.location || "No location provided."
    );

    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startTime}/${endTime}&details=${details}&location=${location}`;

    window.open(googleCalendarUrl, "_blank");
  };

  const handleSeeTicket = () => {
    const ticketInfo = event.guests[currentUserHandle];
    if (ticketInfo && ticketInfo.ticketId) {
      alert(`Your ticket ID is: ${ticketInfo.ticketId}`);
    } else {
      alert("No ticket found.");
    }
  };

  const handleCancelRegistration = async () => {
    const eventRef = firebase.database.ref(
      `/current-events/${event.key}/guests/${currentUserHandle}`
    );

    try {
      await eventRef.update({ status: STATUS.NOT_GOING });
      alert("Registration cancelled successfully.");
    } catch (error) {
      console.error("Error cancelling registration: ", error);
      alert("Failed to cancel registration.");
    }
  };

  if (status === STATUS.GOING || status === STATUS.CHECKED_IN) {
    return (
      <Box>
        <h2>You're In!</h2>
        <p>
          Event starts on{" "}
          {format(new Date(eventStartDate), "MMM d, yyyy h:mm a")}
        </p>
        <Box sx={{ gap: 2, display: "flex", flexDirection: "flex-start" }}>
          <Button
            variant="contained"
            size="small"
            onClick={handleAddToCalendar}
          >
            Add to Calendar
          </Button>
          <Button variant="contained" size="small" onClick={handleSeeTicket}>
            See Ticket
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={handleCancelRegistration}
          >
            Cancel Registration
          </Button>
        </Box>
      </Box>
    );
  } else if (status === STATUS.NOT_GOING) {
    return (
      <Box>
        <h2>You're Not Going.</h2>
        <p>Changed your mind? You can register again.</p>
        <Button variant="contained" size="small" onClick={handleRegister}>
          Register Again
        </Button>
      </Box>
    );
  } else {
    return (
      <Button variant="contained" size="small" onClick={handleRegister}>
        Register
      </Button>
    );
  }
};

const EventPreview = ({ event }) => {
  const currentUserHandle = firebase.auth.currentUser.email.split("@")[0];

  const eventGuest = event.guests
    ? Object.entries(event.guests).find(
        ([userHandle, _]) => userHandle === currentUserHandle
      )
    : [];

  return (
    <>
      <Box
        sx={{
          py: 2,
          px: 3,
        }}
      >
        <Typography variant="h6" component="div">
          {event.name}
        </Typography>
      </Box>
      <Box
        sx={{
          pb: 2,
          px: 3,
        }}
      >
        {event.imageUrl && (
          <Box
            component="img"
            src={event.imageUrl}
            alt={event.name}
            sx={{ width: "100%", marginBottom: "16px" }}
          />
        )}
        <Typography variant="subtitle1" gutterBottom>
          Organization: {event.organization}
        </Typography>
        <Typography variant="body1" gutterBottom>
          Date and Time:{" "}
          {format(new Date(event.startDate), "MMM d, yyyy h:mm a")}
        </Typography>
        <Typography variant="body1" gutterBottom>
          Location: {event.location}
        </Typography>
        <EventGuestActions
          eventStartDate={event.startDate}
          currentUserHandle={currentUserHandle}
          event={event}
          status={eventGuest?.[1]?.status}
        />
      </Box>
    </>
  );
};

export default EventPreview;
