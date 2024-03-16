import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Grid,
  Typography,
} from "@mui/material";
import { format } from "date-fns";
import React from "react";
import { useHistory } from "react-router-dom";

const EventCard = ({ event }) => {
  const history = useHistory();

  const handleManageClick = () => {
    history.push(`/manage/${event.key}`);
  };
  return (
    <Card sx={{ mt: 2, mb: 2 }}>
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
  );
};

export default EventCard;
