import {
  Box,
  Button,
  Container,
  Grid,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import firebase from "../../config";
import ImageUpload from "./ImageUpload";

const ManageEvent = () => {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  console.log("eventId", eventId);

  useEffect(() => {
    const fetchEvent = async () => {
      const eventRef = firebase.database.ref(`/current-events/${eventId}`);
      const snapshot = await eventRef.once("value");
      console.log(snapshot.val());
      setEvent(snapshot.val());
    };

    fetchEvent();
  }, [eventId]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEvent((prevEvent) => ({
      ...prevEvent,
      [name]: value,
    }));
  };
  const handleDateChange = (field, date) => {
    setEvent((prevEvent) => ({
      ...prevEvent,
      [field]: date ? date.toISOString() : null,
    }));
  };

  const handleImageUpload = (image64) => {
    setEvent((prevEvent) => ({
      ...prevEvent,
      imageUrl: image64,
    }));
  };

  const handleUpdateEvent = async () => {
    const eventRef = firebase.database().ref(`/current-events/${eventId}`);
    await eventRef.update(event);
    // Show success message or redirect to events page
  };

  if (!event) {
    return <Typography variant="body1">Loading...</Typography>;
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          {event.name}
        </Typography>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Overview" />
          <Tab label="Guests" />
        </Tabs>
        <Box sx={{ mt: 4 }}>
          {tabValue === 0 && (
            <Grid container spacing={4}>
              <Grid item xs={12} sm={6}>
                <ImageUpload
                  image64={event.imageUrl}
                  onImageUpload={handleImageUpload}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Event Name"
                  fullWidth
                  required
                  value={event.name}
                  onChange={handleInputChange}
                  name="name"
                />
                <LocalizationProvider dateAdapter={AdapterMoment}>
                  <DateTimePicker
                    label="Start Date"
                    value={event.startDate}
                    onChange={(date) => handleDateChange("startDate", date)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        margin="dense"
                        fullWidth
                        required
                      />
                    )}
                  />
                  <DateTimePicker
                    label="End Date"
                    value={event.endDate}
                    onChange={(date) => handleDateChange("endDate", date)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        margin="dense"
                        fullWidth
                        required
                      />
                    )}
                  />
                </LocalizationProvider>
                <TextField
                  margin="dense"
                  name="location"
                  label="Location"
                  fullWidth
                  required
                  value={event.location}
                  onChange={handleInputChange}
                />
                {/* <FormControl margin="dense" fullWidth>
                  <Autocomplete
                    margin="dense"
                    fullWidth
                    options={event.groups}
                    getOptionLabel={(option) => option}
                    value={event.organization}
                    onChange={(event, newValue) => {
                      setEvent((prevEvent) => ({
                        ...prevEvent,
                        organization: newValue,
                      }));
                    }}
                    renderInput={(params) => (
                      <TextField {...params} label="Organization" required />
                    )}
                  />
                </FormControl>
                <FormControl margin="dense" fullWidth>
                  <Autocomplete
                    multiple
                    margin="dense"
                    fullWidth
                    options={event.tags}
                    getOptionLabel={(option) => option}
                    value={event.tags}
                    onChange={(event, newValue) => {
                      setEvent((prevEvent) => ({
                        ...prevEvent,
                        tags: newValue,
                      }));
                    }}
                    renderInput={(params) => (
                      <TextField {...params} label="Tags" />
                    )}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip
                          key={option}
                          label={option}
                          {...getTagProps({ index })}
                        />
                      ))
                    }
                  />
                </FormControl> */}
                <TextField
                  margin="dense"
                  name="webLink"
                  label="Web Link"
                  fullWidth
                  value={event.webLink}
                  onChange={handleInputChange}
                />
                <TextField
                  margin="dense"
                  name="description"
                  label="Description"
                  fullWidth
                  multiline
                  rows={4}
                  value={event.description}
                  onChange={handleInputChange}
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleUpdateEvent}
                >
                  Update Event
                </Button>
              </Grid>
            </Grid>
          )}
          {tabValue === 1 && (
            <Typography variant="body1">
              Guests management coming soon!
            </Typography>
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default ManageEvent;
