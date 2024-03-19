import {
  Autocomplete,
  Box,
  Button,
  Chip,
  Container,
  FormControl,
  Grid,
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
import defaultImage from "../../assets/default.jpg";
import firebase from "../../config";
import ImageUpload from "./ImageUpload";
import useRoleData from "./useRoleData";
import { handleImageFileChanged } from "./utils";

const ManageEvent = () => {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [image64, setImage64] = useState(null);
  const [currImage, setCurrImage] = useState(null);

  const { databaseTags, groups } = useRoleData();

  const history = useHistory();

  useEffect(() => {
    const fetchEvent = async () => {
      const eventRef = firebase.database.ref(`/current-events/${eventId}`);
      const snapshot = await eventRef.once("value");
      const fetchedEvent = snapshot.val();
      setEvent({
        ...fetchedEvent,
        tags: fetchedEvent.tags.split(","),
      });

      // Get the existing image
      const imageUrl = await firebase.storage
        .ref("Images")
        .child(fetchedEvent.imgid + ".jpg")
        .getDownloadURL();
      setImage64(imageUrl);
      setCurrImage(imageUrl);
    };

    fetchEvent();
  }, [eventId]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    handleImageFileChanged(file, (uri) => setImage64(uri));
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

  const handleCancelEvent = async () => {
    if (
      window.confirm(
        "Cancel and permanently delete this event. This operation cannot be undone. Are you sure you want to cancel this event?"
      )
    ) {
      const eventRef = firebase.database.ref(`/current-events/${eventId}`);
      await eventRef.remove();
      alert("Event canceled successfully!");
      history.push("/events");
    }
  };
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

  const saveImage = (ref, image, imageName) => {
    if (image !== defaultImage) {
      setUploading(true);
      displayMessage("Uploading Image...");
      const firebaseStorageRef = firebase.storage.ref(ref);
      const id = Date.now().toString();
      const imageRef = firebaseStorageRef.child(id + ".jpg");

      const i = image.indexOf("base64,");
      const buffer = Buffer.from(image.slice(i + 7), "base64");
      const file = new File([buffer], id);

      imageRef
        .put(file)
        .then(() => {
          return imageRef.getDownloadURL();
        })
        .then((url) => {
          submitEvent(id);
        })
        .catch((error) => {
          console.log(error);
          displayMessage("Error Uploading Image");
        });
    } else {
      submitEvent();
    }
  };

  const submitEvent = (id = "default") => {
    const startDate = moment(event.startDate);
    const endDate = moment(event.endDate);
    const duration = endDate.diff(startDate, "minutes");

    const eventData = {
      ...event,
      startDate: startDate.format("YYYY-MM-DD HH:mm"),
      duration: duration,
      imgid: id,
      email: firebase.auth.currentUser.email,
      tags: event.tags.toString(),
    };

    firebase.database
      .ref(`/current-events/${eventId}`)
      .update(eventData)
      .then(() => {
        setUploading(false);
        displayMessage("Event Updated");
      })
      .catch((error) => {
        console.log(error);
        displayMessage("Error Updating Event");
      });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      event.name !== "" &&
      event.location !== "" &&
      event.organization !== ""
    ) {
      if (image64 !== currImage) {
        saveImage("Images", image64);
      } else {
        submitEvent(event.imgid);
      }
    } else {
      displayMessage("Required fields are not filled in.");
    }
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
                  image64={image64}
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
                <FormControl margin="dense" fullWidth>
                  <Autocomplete
                    margin="dense"
                    fullWidth
                    options={groups}
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
                {databaseTags.length > 0 && (
                  <FormControl margin="dense" fullWidth>
                    <Autocomplete
                      multiple
                      margin="dense"
                      fullWidth
                      options={databaseTags}
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
                  </FormControl>
                )}
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
                  value={event.description}
                  onChange={handleInputChange}
                />
                <Box display="flex" justifyContent={"space-between"}>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={handleCancelEvent}
                  >
                    Cancel Event
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSubmit}
                    disabled={uploading}
                  >
                    Update Event
                  </Button>
                </Box>
              </Grid>
            </Grid>
          )}
          {tabValue === 1 && (
            <Typography variant="body1">
              Guests management coming soon!
            </Typography>
          )}
        </Box>

        <Snackbar
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
          open={openSnackbar}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
          message={message}
          action={[
            <Button
              key="close"
              aria-label="Close"
              color="inherit"
              onClick={handleSnackbarClose}
            >
              X
            </Button>,
          ]}
        />
      </Box>
    </Container>
  );
};

export default ManageEvent;
