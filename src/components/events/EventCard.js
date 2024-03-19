import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  Typography,
} from "@mui/material";
import { format } from "date-fns";
import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import firebase from "../../config";

export const STATUS = {
  GOING: "GOING",
  CHECKED_IN: "CHECKED_IN",
  INVITED: "INVITED",
  NOT_GOING: "NOT_GOING",
};

export const toTitleCase = (str) => {
  return str.replace(/\w\S*/g, function(txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};

const generateUniqueTicketId = () => {
  const timestamp = Date.now().toString();
  const randomChars = Math.random()
    .toString(36)
    .substring(2, 7);
  return `${timestamp}-${randomChars}`;
};

const EventCard = ({ event }) => {
  const history = useHistory();
  const [openPreview, setOpenPreview] = useState(false);

  const handleManageClick = () => {
    history.push(`/manage/${event.key}`);
  };
  const handlePreviewOpen = () => {
    setOpenPreview(true);
  };

  const handlePreviewClose = () => {
    setOpenPreview(false);
  };
  const handleRegister = async () => {
    const eventRef = firebase.database.ref(`/current-events/${event.key}`);

    const ticketId = generateUniqueTicketId();
    const userId = firebase.auth.currentUser.email.split("@")[0];

    const updatedEvent = {
      ...event,
      guests: {
        ...event.guests,
        [userId]: {
          ticketId,
          status: STATUS.GOING,
        },
      },
    };
    console.log("updatedEvent", updatedEvent);

    await eventRef.update(updatedEvent);
    alert("Registration successful!");
  };

  return (
    <>
      <Card sx={{ mt: 2, mb: 2 }} onClick={handlePreviewOpen}>
        <CardActionArea>
          <Grid container spacing={2} key={event.startDate}>
            <Grid item xs={7} md={9}>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  {format(new Date(event.startDate), "h:mm a")}
                </Typography>
                <Typography variant="h6" component="div">
                  {event.name}
                </Typography>
                {event.location ? (
                  <Typography variant="body2" color="text.secondary">
                    {event.location}
                  </Typography>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Location Missing
                  </Typography>
                )}
                {/* <Typography variant="body2" color="text.secondary">
                {event.guests ? `${event.guests} guests` : "No guests"}
              </Typography> */}
              </CardContent>
            </Grid>
            <Grid item xs={5} md={3}>
              <Box my={1} mr={1}>
                {event.imageUrl && (
                  <CardMedia
                    sx={{ borderRadius: 2 }}
                    component="img"
                    height="140"
                    image={event.imageUrl}
                    alt={event.name}
                  />
                )}
              </Box>
            </Grid>
          </Grid>
        </CardActionArea>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            px: 2,
            py: 1,
          }}
        >
          <Button size="small" color="primary">
            Check In
          </Button>
          <Button size="small" onClick={handleManageClick}>
            Manage
          </Button>
        </Box>
      </Card>

      <Dialog open={openPreview} onClose={handlePreviewClose}>
        <DialogTitle>{event.name}</DialogTitle>
        <DialogContent>
          {event.imageUrl && (
            <img
              src={event.imageUrl}
              alt={event.name}
              style={{ width: "100%", marginBottom: "16px" }}
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
          <Button variant="contained" size="small" onClick={handleRegister}>
            Register
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EventCard;
