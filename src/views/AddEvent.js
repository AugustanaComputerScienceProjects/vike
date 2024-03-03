import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import CardMedia from "@mui/material/CardMedia";
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import Grid from "@mui/material/Grid";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import OutlinedInput from "@mui/material/OutlinedInput";
import Select from "@mui/material/Select";
import Snackbar from "@mui/material/Snackbar";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { FilePicker } from "react-file-picker";
import Resizer from "react-image-file-resizer";
import defaultImage from "../assets/default.jpg";
import firebase from "../config";

// File for the Add Event Screen

var QRCode = require("qrcode");

const uuidv4 = require("uuid/v4");
const listeners = [];

// Parent component for the preview
const ParentComponent = (props) => (
  <div>
    <Grid container id="children-pane" direction="row" spacing={8}>
      {props.children}
    </Grid>
  </div>
);

// Child component for the preview
const ChildComponent = (props) => (
  <Grid item>
    <Card style={{ minHeight: 400, minWidth: 300 }}>
      <CardHeader title={props.title} subheader={props.date}></CardHeader>
      <CardMedia
        style={{ height: 0, paddingTop: "56.25%" }}
        image={props.image}
        title={props.title}
      />
      <CardContent>
        <Typography component="p">
          {props.location}
          <br />
          {props.organization}
          <br />
          {props.tags}
          <br />
          {props.description}
        </Typography>
      </CardContent>
    </Card>
  </Grid>
);

const AddEvent = () => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(new Date());
  const [duration, setDuration] = useState("");
  const [email, setEmail] = useState();
  const [location, setLocation] = useState("");
  const [organization, setOrganization] = useState("");
  const [description, setDescription] = useState("");
  const [webLink, setWebLink] = useState("");
  const [tags, setTags] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("EventAdded");
  const [image64, setImage64] = useState(defaultImage);
  const [submitBtnText, setSubmitBtnText] = useState("Request Event");
  // eslint-disable-next-line no-unused-vars
  const [uid, setUid] = useState("");
  const [qrChecked, setQrChecked] = useState(false);
  const [qrDisabled, setQrDisabled] = useState(true);
  const [databaseTags, setDatabaseTags] = useState([]);
  const [groups, setGroups] = useState([]);
  const [leaderSignedIn, setLeaderSignedIn] = useState();
  const [adminSignedIn, setAdminSignedIn] = useState();

  useEffect(() => {
    // Component will mount - read tags, groups, auth listener
    readTags();
    firebase.auth.onAuthStateChanged((user) => {
      if (user) {
        checkRole(user, "admin");
        checkRole(user, "leaders");
      } else {
        setAdminSignedIn(false);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle opening of the Snackbar
  const handleOpen = () => {
    setOpen(true);
  };

  // Handle closing of the Snackbar
  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  };

  // Handle changing of the event for the date/time pickers
  const handleDateChange = (event) => {
    setDate(new Date(event));
  };

  // Save image to Firebase
  const saveImage = (ref, image, imageName, onSuccess, onError) => {
    if (image64 !== defaultImage) {
      setUploading(true);
      displayMessage("Uploading Image...");
      var firebaseStorageRef = firebase.storage.ref(ref);
      const id = uuidv4();
      const imageRef = firebaseStorageRef.child(id + ".jpg");

      const i = image.indexOf("base64,");
      const buffer = Buffer.from(image.slice(i + 7), "base64");
      const file = new File([buffer], id);

      imageRef
        .put(file)
        .then(function() {
          return imageRef.getDownloadURL();
        })
        .then(function(url) {
          console.log(url);
          submitEvent(id);
        })
        .catch(function(error) {
          console.log(error);
          displayMessage("Error Uploading Image");
        });
    } else {
      submitEvent();
    }
  };

  // Check authorization and add to Firebase
  const submitEvent = (id = "default") => {
    pushEvent("/current-events", "Event Added", id);
  };

  // Push event to Firebase
  const pushEvent = (ref, message, id) => {
    firebase.database
      .ref(ref)
      .push({
        name: title,
        startDate: moment(date).format("YYYY-MM-DD HH:mm"),
        duration: parseInt(duration),
        location: location,
        organization: organization,
        imgid: id,
        description: description,
        webLink: webLink,
        tags: tags.toString(),
        email: email,
      })
      .then((snap) => {
        if (qrChecked) {
          downloadQR(snap.key, title);
        }
      });
    resetState();
    setUploading(false);
    displayMessage(message);
  };

  // Download the QR code as a jpg
  const downloadQR = (key, name) => {
    QRCode.toDataURL(
      "https://osl-events-app.firebaseapp.com/event?id=" +
        key +
        "&name=" +
        name.replaceAll(" ", "+"),
      function(err, url) {
        // console.log(url);
        var link = document.createElement("a");
        link.href = url;
        link.download = name + "-QR Code.png";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    );
  };

  // Add event button action
  const submitAction = (event) => {
    // Check inputs
    if (
      title !== "" &&
      location !== "" &&
      organization !== "" &&
      duration !== ""
    ) {
      saveImage("Images", image64);
    } else {
      alert("Required fields are not filled in.");
    }
  };

  // Handle changing of the image file
  const handleImageFileChanged = (theFile) => {
    //https://www.npmjs.com/package/react-image-file-resizer
    Resizer.imageFileResizer(
      theFile,
      2160,
      1080,
      "JPEG",
      100, // compression quality
      0, // no rotation
      (uri) => {
        setImage64(uri);
      },
      "base64"
    );
  };

  // Toggle checking of the "Downlod QR Code" Checkbox
  const toggleChecked = () => {
    setQrChecked(!qrChecked);
  };

  // Resets the state after adding/requesting an event
  const resetState = (self) => {
    setOpen(false);
    setTitle("");
    setDate(new Date());
    setDuration("");
    setLocation("");
    setOrganization("");
    setTags([]);
    setDescription("");
    setWebLink("");
    setUploading(false);
    setMessage("Event Added");
    setImage64(defaultImage);
  };

  // Display a message using the Snackbar
  const displayMessage = (message) => {
    handleClose();
    setMessage(message);
    handleOpen();
  };

  // Checks what role the current user signed in has
  const checkRole = (user, role) => {
    firebase.database
      .ref(role)
      .once("value")
      .then(function(snapshot) {
        if (snapshot.hasChild(user.email.replace(".", ","))) {
          if (role === "admin") {
            setAdminSignedIn(true);
            setSubmitBtnText("Add Event");
            setUid(user.uid);
            setEmail(user.email);
            setQrChecked(true);
            setQrDisabled(false);

            readAllGroups();
          } else if (role === "leaders" && !adminSignedIn) {
            setLeaderSignedIn(true);
            setSubmitBtnText("Add Event");
            setUid(user.uid);
            setEmail(user.email);

            readLeaderGroups();
          }
        }
      });
  };

  // Reads the tags from Firebase and sets the tags list
  const readTags = () => {
    let ref = firebase.database.ref("/tags");
    listeners.push(ref);
    ref.on("value", function(snapshot) {
      let tagsList = [];
      snapshot.forEach(function(child) {
        tagsList.push(child.val());
      });
      setDatabaseTags(tagsList);
      // console.log(tagsList);
    });
  };

  // Reads the groups from Firebase and sets the groups list
  const readAllGroups = () => {
    let ref = firebase.database.ref("/groups");
    listeners.push(ref);
    ref.on("value", function(snapshot) {
      let groupsList = [];
      snapshot.forEach(function(child) {
        let decodedGroup = decodeGroup(child);
        groupsList.push(decodedGroup.val());
      });
      setGroups(groupsList);
      // console.log('Groups List: ' + groupsList);
    });
  };

  const readLeaderGroups = () => {
    let email = firebase.auth.currentUser.email;
    let ref = firebase.database
      .ref("/leaders")
      .child(email.replace(".", ","))
      .child("groups");
    ref.on("value", function(snapshot) {
      let myGroups = [];
      snapshot.forEach(function(child) {
        let decodedGroup = decodeGroup(child.key);
        myGroups.push(decodedGroup);
      });
      setGroups(myGroups);
    });
  };

  const decodeGroup = (codedGroup) => {
    let group = codedGroup;
    if (typeof group === "string" || group instanceof String) {
      while (group.includes("*%&")) {
        group = group.replace("*%&", ".");
      }
      while (group.includes("@%*")) {
        group = group.replace("@%*", "$");
      }
      while (group.includes("*<=")) {
        group = group.replace("*<=", "[");
      }
      while (group.includes("<@+")) {
        group = group.replace("<@+", "]");
      }
      while (group.includes("!*>")) {
        group = group.replace("!*>", "#");
      }
      while (group.includes("!<^")) {
        group = group.replace("!<^", "/");
      }
    }
    return group;
  };

  const child = [];

  // Format Date - display preview
  var month = (1 + date.getMonth()).toString();
  month = month.length > 1 ? month : "0" + month;
  var day = date.getDate().toString();
  day = day.length > 1 ? day : "0" + day;
  var hours = date.getHours().toString();
  hours = hours.length > 1 ? hours : "0" + hours;
  var minutes = date.getMinutes().toString();
  minutes = minutes.length > 1 ? minutes : "0" + minutes;
  let startDate =
    month + "-" + day + "-" + date.getFullYear() + " " + hours + ":" + minutes;
  let endDate = new Date(date);
  endDate.setMilliseconds(date.getMilliseconds() + duration * 60000);

  hours = endDate.getHours().toString();
  hours = hours.length > 1 ? hours : "0" + hours;
  minutes = endDate.getMinutes().toString();
  minutes = minutes.length > 1 ? minutes : "0" + minutes;
  let fullDate = startDate + "-" + hours + ":" + minutes;

  child.push(
    <ChildComponent
      key={0}
      title={title}
      date={fullDate}
      location={"Location: " + location}
      organization={"Group: " + organization}
      description={"Description: " + description}
      tags={"Tags: " + tags}
      image={image64}
    />
  );

  return (
    <Container maxWidth="md">
      {/* <MuiPickersUtilsProvider utils={MomentUtils}> */}
      <Grid
        container
        spacing={4}
        // alignItems='center'
      >
        <Grid
          item
          md={7}
          // container
          // spacing={1}
          // style={{ width: 200 }}
        >
          <Grid item>
            <label style={{ fontSize: 20 }}>Add Event</label>
          </Grid>
          <Grid item>
            <TextField
              fullWidth
              label="Event Title"
              id="event-title"
              margin="normal"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </Grid>
          <Grid item>
            <LocalizationProvider dateAdapter={AdapterMoment}>
              <DateTimePicker
                renderInput={(props) => <TextField {...props} />}
                label="Start Date/Time"
                value={date}
                onChange={handleDateChange}
              />
            </LocalizationProvider>
            {/* <DateTimePicker
                label='Start Date/Time'
                variant='outlined'
                inputVariant='outlined'
                value={date}
                showTodayButton
                disablePast
                onChange={handleDateChange}
              /> */}
            {/* </Grid> */}
            {/* <Grid item> */}
            <TextField
              style={{ marginLeft: 10 }}
              // fullWidth
              id="event-dur"
              label="Duration (minutes)"
              // margin='normal'
              value={duration}
              type="number"
              onChange={(e) => setDuration(e.target.value)}
            />
          </Grid>
          <Grid item>
            <TextField
              fullWidth
              id="event-org"
              label="Location"
              margin="normal"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </Grid>
          <Grid>
            <FormControl>
              <InputLabel>Group</InputLabel>
              <Select
                displayEmpty
                value={organization}
                style={{ minWidth: 200, maxWidth: 200 }}
                onChange={(e) => setOrganization(e.target.value)}
                // variant='outlined'
              >
                {groups.map((group) => (
                  <MenuItem key={group} value={group}>
                    {group}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {/* </Grid> */}
            {/* <Grid item> */}
            <FormControl style={{ marginLeft: 10 }}>
              <InputLabel htmlFor="select-multiple">Tags</InputLabel>
              <Select
                multiple
                displayEmpty
                input={<OutlinedInput id="select-multiple-chip" label="Chip" />}
                value={tags}
                style={{ minWidth: 200 }}
                onChange={(e) => setTags(e.target.value)}
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} />
                    ))}
                  </Box>
                )}
              >
                <MenuItem disabled value="">
                  <em>Select Tags</em>
                </MenuItem>
                {databaseTags.map((tag) => (
                  <MenuItem key={tag} value={tag}>
                    {tag}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item>
            <TextField
              fullWidth
              id="event-link"
              label="Web Link (Optional)"
              margin="normal"
              value={webLink}
              onChange={(e) => setWebLink(e.target.value)}
            />
          </Grid>
          <Grid item>
            <TextField
              fullWidth
              id="event-desc"
              label="Description"
              multiline
              rows="5"
              margin="normal"
              variant="outlined"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Grid>
          <Grid item>
            <FilePicker
              extensions={["jpg", "jpeg", "png"]}
              onChange={handleImageFileChanged}
              onError={(errMsg) => displayMessage(this, errMsg)}
            >
              <Button variant="contained" disabled={uploading}>
                Select Image
              </Button>
            </FilePicker>
          </Grid>
          <Grid item style={{ marginTop: 10 }}>
            <Button
              variant="contained"
              color="primary"
              disabled={uploading}
              onClick={submitAction}
            >
              {submitBtnText}
            </Button>
          </Grid>
        </Grid>
        <Grid
          md={5}
          item
          // style={{ marginTop: 50, marginLeft: 150 }}
        >
          <label style={{ fontSize: 18 }}>Preview:</label>
          <ParentComponent style={{ marginLeft: 50, width: 300, height: 400 }}>
            {child}
          </ParentComponent>
          <FormControlLabel
            control={
              <Checkbox
                checked={qrChecked}
                onChange={toggleChecked}
                disabled={qrDisabled}
                value="qrChecked"
                color="primary"
              />
            }
            label="Download QR Code"
          />
        </Grid>
      </Grid>
      <Snackbar
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        open={open}
        autoHideDuration={6000}
        onClose={handleClose}
        ContentProps={{
          "aria-describedby": "message-id",
        }}
        message={message}
        action={[
          <Button
            key="close"
            aria-label="Close"
            color="inherit"
            onClick={handleClose}
          >
            {" "}
            X
          </Button>,
        ]}
      />
    </Container>
  );
};

export default AddEvent;
