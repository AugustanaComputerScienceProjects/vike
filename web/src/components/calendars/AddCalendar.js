import {
    Button,
    Container,
    Grid,
    Typography,
    Snackbar,
} from "@mui/material";
import React, { useState } from "react";
import vikeLogo from "../../assets/vike.png";
import firebase from "../../config";
import AddCalendarForm from "./AddCalendarForm";
import ImageUpload from "../events/ImageUpload";
import useRoleData from "../events/useRoleData";
import {
    handleImageFileChanged,
} from "../events/utils";

const AddCalendar = () => {
    const [formData, setFormData] = useState({
        name: "",
        organization: "",
        description: "",
        profileId: "vike",
        email: "",
        admins: [],
        subscribers: [],
        events: [],
    })
    const [profile64, setProfile64] = useState(vikeLogo);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState("");
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const { groups } = useRoleData();

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

    const handleProfileUpload = (event) => {
        const file = event.target.files[0];
        handleImageFileChanged(file, (uri) => setProfile64(uri));
    };

    const handleProfileDrop = (event) => {
        event.preventDefault();
        const file = event.dataTransfer.files[0];
        handleImageFileChanged(file, (uri) => setProfile64(uri));
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

    const submitCalendar = (id = "vike") => {
        const calendarData = {
            ...formData,
            profileId: id,
            email: firebase.auth.currentUser.email,
        }
        console.log(calendarData);

        firebase.database.ref('/calendars').push(calendarData).then(() => {
            setUploading(false);
            displayMessage("Calendar added successfully");
            resetForm();
        }).catch((error) => {
            console.error(error);
            displayMessage("Failed to add calendar");
        })
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        console.log('formData', formData)
        console.log('Profile64', profile64)
        if (
            formData.name !== "" &&
            formData.organization !== ""
        ) {
            saveImage("Profiles", profile64);
        } else {
            displayMessage("Please fill in all required fields");
        }
    };

    const saveImage = (ref, image) => {
        if (image !== vikeLogo) {
          setUploading(true);
          displayMessage("Uploading Image...");
          const firebaseStorageRef = firebase.storage.ref(ref);
          const id = Date.now().toString();
          const imageRef = firebaseStorageRef.child(id + ".png");
    
          const i = image.indexOf("base64,");
          const buffer = Buffer.from(image.slice(i + 7), "base64");
          const file = new File([buffer], id);
    
          imageRef
            .put(file)
            .then(() => {
              return imageRef.getDownloadURL();
            })
            .then((url) => {
              submitCalendar(id);
            })
            .catch((error) => {
              console.log(error);
              displayMessage("Error Uploading Image");
            });
        } else {
            submitCalendar();
        }
      };

    const resetForm = () => {
        setFormData({
            name: "",
            organization: "",
            description: "",
            profileId: "vike",
            email: "",
        });
        setProfile64(vikeLogo);
    };

    return (
        <Container>
            <Typography variant="h4" align="center" gutterBottom>
                Create Calendar
            </Typography>
            <form onSubmit={handleSubmit}>
                <Grid container spacing={2} style={{ display: 'flex', justifyContent: 'center', paddingTop: '10px'}}>
                    <Grid item xs={2} style={{ width: '100%', height: '100%', borderRadius: '10%', overflow: 'hidden'}}>
                        <ImageUpload
                            image64={profile64}
                            onImageUpload={handleProfileUpload}
                            onImageDrop={handleProfileDrop}
                            style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <AddCalendarForm
                            formData={formData}
                            groups={groups}
                            handleInputChange={handleInputChange}
                            handleDateChange={handleDateChange}
                            setFormData={setFormData}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Button
                            onClick={handleSubmit}
                            variant="contained"
                            color="primary"
                            disabled={uploading}
                        >
                            Create Calendar
                        </Button>
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
        </Container>
    )
}

export default AddCalendar;