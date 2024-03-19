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
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EventCard;
