import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Dialog,
  Grid,
  Typography,
} from "@mui/material";
import { format } from "date-fns";
import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import EventPreview from "./EventPreview";

export const EVENT_STATUS = {
  GOING: "GOING",
  CHECKED_IN: "CHECKED_IN",
  INVITED: "INVITED",
  NOT_GOING: "NOT_GOING",
};

export const toTitleCase = (str) => {
  return str.replace(/_/g, " ").replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};

const EventCard = ({ event }) => {
  const history = useHistory();
  const [openPreview, setOpenPreview] = useState(false);

  const navigateTo = (path) => {
    history.push(path);
  };

  const togglePreview = () => {
    setOpenPreview(!openPreview);
  };

  return (
    <>
      <Card sx={{ mt: 2, mb: 2 }} onClick={togglePreview}>
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
                <Typography variant="body2" color="text.secondary">
                  {event.location || "Location Missing"}
                </Typography>
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
          <Button
            size="small"
            color="primary"
            onClick={() => navigateTo(`/check-in/${event.key}`)}
          >
            Check In
          </Button>
          <Button
            size="small"
            onClick={() => navigateTo(`/manage/${event.key}`)}
          >
            Manage
          </Button>
        </Box>
      </Card>

      <Dialog open={openPreview} onClose={togglePreview}>
        <EventPreview event={event} />
      </Dialog>
    </>
  );
};

export default EventCard;
