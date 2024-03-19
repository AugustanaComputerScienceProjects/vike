import {
  Box,
  Button,
  Container,
  Grid,
  Snackbar,
  Typography,
} from "@mui/material";
import moment from "moment";
import React, { useState } from "react";
import defaultImage from "../../assets/default.jpg";
import firebase from "../../config";
import AddEventForm from "./AddEventForm";
import ImageUpload from "./ImageUpload";
import useRoleData from "./useRoleData";
import {
  addHours,
  handleImageFileChanged,
  roundToNearestHalfHour,
} from "./utils";

const AddEvent = () => {
  const [formData, setFormData] = useState({
    name: "",
    startDate: roundToNearestHalfHour(new Date()),
    endDate: addHours(roundToNearestHalfHour(new Date()), 1),
    location: "",
    organization: "",
    imgid: "default",
    description: "",
    webLink: "",
    tags: [],
    email: "",
  });
  const [image64, setImage64] = useState(defaultImage);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const { adminSignedIn, leaderSignedIn, databaseTags, groups } = useRoleData();

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleDateChange = (field, date) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [field]: date ? date.toISOString() : null,
    }));
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    handleImageFileChanged(file, (uri) => setImage64(uri));
  };

  const handleImageDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    handleImageFileChanged(file, (uri) => setImage64(uri));
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSnackbar(false);
  };

  const displayMessage = (message) => {
    setMessage(message);
    setOpenSnackbar(true);
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
    const startDate = moment(formData.startDate);
    const endDate = moment(formData.endDate);
    const duration = endDate.diff(startDate, "minutes");

    const eventData = {
      ...formData,
      startDate: startDate.format("YYYY-MM-DD HH:mm"),
      duration: duration,
      imgid: id,
      email: firebase.auth.currentUser.email,
      tags: formData.tags.toString(),
    };
    console.log(eventData);

    firebase.database
      .ref("/current-events")
      .push(eventData)
      .then(() => {
        setUploading(false);
        displayMessage("Event Added");
        resetForm();
      })
      .catch((error) => {
        console.log(error);
        displayMessage("Error Adding Event");
      });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      formData.name !== "" &&
      formData.location !== "" &&
      formData.organization !== ""
    ) {
      saveImage("Images", image64);
    } else {
      displayMessage("Required fields are not filled in.");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      startDate: roundToNearestHalfHour(new Date()),
      endDate: addHours(roundToNearestHalfHour(new Date()), 1),
      location: "",
      organization: "",
      imgid: "default",
      description: "",
      webLink: "",
      tags: [],
      email: "",
    });
    setImage64(defaultImage);
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Add Event
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <ImageUpload
                image64={image64}
                onImageUpload={handleImageUpload}
                onImageDrop={handleImageDrop}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <AddEventForm
                formData={formData}
                groups={groups}
                databaseTags={databaseTags}
                handleInputChange={handleInputChange}
                handleDateChange={handleDateChange}
                setFormData={setFormData}
              />
              <Grid mt={1}>
                <Button
                  onClick={handleSubmit}
                  variant="contained"
                  color="primary"
                  disabled={uploading}
                >
                  {adminSignedIn || leaderSignedIn
                    ? "Add Event"
                    : "Request Event"}
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </form>

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

export default AddEvent;
