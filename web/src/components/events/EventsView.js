/* eslint-disable jsx-a11y/alt-text */
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import SearchIcon from "@mui/icons-material/Search";
import SortIcon from "@mui/icons-material/Sort";
import { CardActionArea, CardActions, ListItem } from "@mui/material";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormLabel from "@mui/material/FormLabel";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Input from "@mui/material/Input";
import InputBase from "@mui/material/InputBase";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import Select from "@mui/material/Select";
import Snackbar from "@mui/material/Snackbar";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import React, { useEffect, useRef } from "react";
import { FilePicker } from "react-file-picker";
import Resizer from "react-image-file-resizer";
import firebase from "../../config";
import DispatchGroup from "../DispatchGroup";

//Component for showing events and managing events on the
//  Current Events and Pending Events pages

var QRCode = require("qrcode");

const uuidv4 = require("uuid/v4");

const EventsView = (props) => {
  const [state, setState] = React.useState({
    events: [],
    groups: [],
    originalEvents: [],
    editing: false,
    requesting: false,
    open: false,
    popUpEvent: [],
    oldEvent: [],
    tags: [],
    date: new Date(),
    uploading: false,
    image64: null,
    image64Old: null,
    urls: [],
    index: -1,
    hidden: "visible",
    openDelete: false,
    sortMenu: "none",
    isInitial: true,
    searchText: "",
    sortBy: "date",
    isAscending: true,
    databaseTags: [],
    raffleOpen: false,
    numWinners: 1,
    raffleEvent: "",
    winners: [],
    winnersOpen: false,
    winnerString: "abcd",
    confirmButton: "Save Changes",
    cancelButton: "Delete Event",
    popUpText: "delete",
    adminSignedIn: false,
    attendeesList: [],
    attendeesOpen: false,
    testThing: "Fail",
  });

  const group = useRef(new DispatchGroup()).current;
  const token = useRef(null);

  // Handles opening of the pop up for editing an event
  const handleBeginEdit = () => {
    handleClose();
    setState((prevState) => ({ ...prevState, editing: true }));
    token.current = group.enter();
  };

  // Handles the deleting/rejecting of an event from Firebase
  const handleDelete = () => {
    setState((prevState) => ({ ...prevState, editing: false }));
    let event = state.popUpEvent;
    firebase.database
      .ref(props.eventType)
      .child(event["key"])
      .remove();
    var firebaseStorageRef = firebase.storage.ref("Images");
    if (event["imgid"] !== "default") {
      firebaseStorageRef.child(event["imgid"] + ".jpg").delete();
    }
    setState((prevState) => ({ ...prevState, openDelete: false }));
    group.leave(token.current);
  };

  // Handles closing of the confirm pop up for deleting/rejecting an event
  const handleDeleteClose = () => {
    setState((prevState) => ({ ...prevState, openDelete: false }));
  };

  // Handles opening of the confirm pop up for deleting/rejecting an event
  const handleDeleteOpen = () => {
    setState((prevState) => ({ ...prevState, openDelete: true }));
  };

  // Handles saving of edits once the save changes button is clicked
  const handleSaveEdit = () => {
    setState((prevState) => ({ ...prevState, editing: false }));
    let event = state.popUpEvent;
    if (state.image64 !== state.image64Old) {
      setState((prevState) => ({ ...prevState, uploading: true }));
      displayMessage("Uploading Image...");
      var firebaseStorageRef = firebase.storage.ref("Images");
      const id = uuidv4();
      const imageRef = firebaseStorageRef.child(id + ".jpg");
      const oldId = event["imgid"];
      handleEventChange("imgid", id);

      const i = state.image64.indexOf("base64,");
      const buffer = Buffer.from(state.image64.slice(i + 7), "base64");
      const file = new File([buffer], id);

      imageRef
        .put(file)
        .then(function() {
          return imageRef.getDownloadURL();
        })
        .then(function(url) {
          let images = state.urls;
          images[state.index] = url;
          setState((prevState) => ({ ...prevState, urls: images }));
          if (props.eventType === "/current-events") {
            pushEvent(event, props.eventType, "Event Updated");
            console.log("event pushed");
          } else {
            submitAction(event);
            console.log("Action Submitted");
          }
          if (oldId !== "default") {
            firebaseStorageRef.child(oldId + ".jpg").delete();
          }
        })
        .catch(function(error) {
          console.log(error);
          displayMessage("Error Uploading Image");
        });
    } else {
      if (props.eventType === "/current-events") {
        pushEvent(event, props.eventType, "Event Updated");
      } else {
        submitAction(event);
      }
    }
  };

  // Handles closing of the edit event pop up
  const handleCloseEdit = () => {
    let revertEvents = state.events;
    revertEvents[state.index] = state.oldEvent;
    setState({ ...state, editing: false, events: revertEvents });
    group.leave(token.current);
  };

  const handleCloseRequest = () => {
    setState({ ...state, requesting: false });
  };

  // Pushes the given event to the given reference in Firebase database
  const pushEvent = (event, ref, message) => {
    firebase.database
      .ref(ref)
      .child(event["key"])
      .set({
        name: event["name"],
        startDate: event["startDate"],
        duration: parseInt(event["duration"]),
        location: event["location"],
        organization: event["organization"],
        imgid: event["imgid"],
        description: event["description"],
        webLink: event["webLink"],
        tags: state.tags.toString(),
        email: event["email"],
      });
    setState({ ...state, uploading: false });
    displayMessage(message);
    group.leave(token.current);
  };

  // Displays a message to the user using the Snackbar
  const displayMessage = (message) => {
    handleClose();
    setState({ ...state, message: message });
    handleOpen();
  };

  // Handles opening of the Snackbar
  const handleOpen = () => {
    setState({ ...state, open: true });
  };

  // Handles closing of the Snackbar
  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setState({ ...state, open: false });
  };

  // Reads all of the current events from Firebase
  const readEvents = () => {
    let reference = firebase.database.ref(props.eventType).orderByChild("name");
    let eventType = props.eventType;
    reference.on("value", function(snapshot) {
      let listEvents = [];
      let listURLS = [];
      let index = -1;
      snapshot.forEach(function(childSnapshot) {
        let event = childSnapshot.val();
        event["key"] = childSnapshot.key;
        if (eventType === "/pending-events") {
          event["status"] = "Requester: " + event["email"];
        }
        listEvents.push(event);
        index = index + 1;
        getImage(index, listEvents, listURLS, snapshot.numChildren());
      });
      if (snapshot.numChildren() === 0) {
        group.notify(function() {
          setState({
            ...state,
            events: [],
            originalEvents: [],
            urls: [],
            originalURLS: [],
          });
          if (state.isInitial) {
            setState({
              ...state,
              hidden: "hidden",
              message: "No Events Found",
              open: true,
            });
          }
        });
      }
      setState({ ...state, isInitial: false });
    });
  };

  const readLeaderEvents = () => {
    let reference = firebase.database.ref(props.eventType).orderByChild("name");
    let eventType = props.eventType;
    reference.on("value", function(snapshot) {
      let listEvents = [];
      let listURLS = [];
      let index = -1;
      snapshot.forEach(function(childSnapshot) {
        let event = childSnapshot.val();

        event["key"] = childSnapshot.key;
        if (eventType === "/pending-events") {
          event["status"] = "Requester: " + event["email"];
        }
        console.log("state.groups", state.groups);
        if (state.groups.includes(event["organization"])) {
          listEvents.push(event);
          index = index + 1;
        }
      });

      if (listEvents.length === 0) {
        group.notify(function() {
          setState({
            ...state,
            events: [],
            originalEvents: [],
            urls: [],
            originalURLS: [],
          });
          if (state.isInitial) {
            setState({
              ...state,
              hidden: "hidden",
              message: "No Events Found",
              open: true,
            });
          }
        });
      } else {
        // for loop counting up i
        for (let i = 0; i < listEvents.length; i++) {
          getImage(i, listEvents, listURLS, listEvents.length);
        }
      }
      setState({ ...state, isInitial: false });
    });
  };

  // Retrieves a single image from Firebase storage
  const getImage = (index, listEvents, listURLS, endLength) => {
    firebase.storage
      .ref("Images")
      .child(listEvents[index].imgid + ".jpg")
      .getDownloadURL()
      .then((url) => {
        listURLS[index] = url;
        if (endLength === listURLS.length) {
          group.notify(function() {
            setState({
              ...state,
              events: listEvents,
              originalEvents: listEvents,
              urls: listURLS,
              originalURLS: listURLS,
              hidden: "hidden",
            });
            filterEvents(state.searchText, listEvents, listURLS);
          });
        }
      })
      .catch((error) => {
        // Handle any errors
      });
  };

  // Handle changing of the image file
  const handleImageFileChanged = (theFile) => {
    Resizer.imageFileResizer(
      theFile,
      300,
      300,
      "JPEG",
      95,
      0,
      (uri) => {
        setState({ ...state, image64: uri });
      },
      "base64"
    );
  };

  // Reads the tags from the Firebase database
  const readTags = () => {
    let ref = firebase.database.ref("/tags");
    ref.on("value", function(snapshot) {
      let tagsList = [];
      snapshot.forEach(function(child) {
        tagsList.push(child.val());
      });
      setState({ ...state, databaseTags: tagsList });
    });
  };

  // Reads the groups from the Firebase database
  const readAllGroups = () => {
    let ref = firebase.database.ref("/groups");
    ref.on("value", function(snapshot) {
      let groupsList = [];
      snapshot.forEach(function(child) {
        let decodedGroup = decodeGroup(child.val());
        groupsList.push(decodedGroup);
      });
      setState({ ...state, groups: groupsList });
      console.log(groupsList);
    });
  };

  //Read the groups a leader can post and edit for
  const readLeaderGroups = async () => {
    console.log("read leader groups");
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
      console.log("myGroups", myGroups);
      setState((prevState) => ({ ...prevState, groups: myGroups }));
      return myGroups;
    });
  };

  // Action called when clicking an event to edit it
  const editAction = (event, i) => {
    console.log("Editing: " + event["name"]);
    let tags = event["tags"].split(",");
    if (tags[0] === "") {
      tags = [];
    }
    let date = getFormattedDate(event);
    let oldEvent = Object.assign({}, event);
    if (!state.groups.includes(event["organization"])) {
      state.groups.push(event["organization"]);
    }
    let eventTags = event["tags"].split(",");
    eventTags.forEach(function(tag) {
      if (!state.databaseTags.includes(tag) && tag !== "") {
        state.databaseTags.push(tag);
      }
    });
    setState({
      ...state,
      oldEvent: oldEvent,
      popUpEvent: event,
      tags: tags,
      date: date,
      index: i,
      image64: state.urls[i],
      image64Old: state.urls[i],
    });
    handleBeginEdit();
  };

  // Handles changing of the name field in the edit pop up
  const handleNameChange = (e) => {
    handleEventChange("name", e.target.value);
  };

  // Handles changing of the date picker/time picker in the edit pop up
  const handleDateChange = (e) => {
    // Parse the date string in the desired timezone
    let date = new Date(e);
    let options = {
      timeZone: "America/Chicago",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    };
    let formatter = new Intl.DateTimeFormat("en-US", options);
    let startDate = formatter.format(date);

    handleEventChange("startDate", startDate);
    setState({ ...state, date: date });
  };

  const handleDurationChange = (e) => {
    handleEventChange("duration", e.target.value);
  };

  const handleLocationChange = (e) => {
    handleEventChange("location", e.target.value);
  };

  const handleOrganizationChange = (e) => {
    handleEventChange("organization", e.target.value);
  };

  const handleWebLinkChange = (e) => {
    handleEventChange("webLink", e.target.value);
  };

  const handleDescriptionChange = (e) => {
    handleEventChange("description", e.target.value);
  };

  const handleEventChange = (key, value) => {
    setState((prevState) => {
      const newEvents = [...prevState.events];
      const event = { ...newEvents[prevState.index], [key]: value };
      newEvents[prevState.index] = event;
      return { ...prevState, events: newEvents };
    });
  };

  const handleSearchChange = (e) => {
    setState({ ...state, searchText: e.target.value });
    filterEvents(e.target.value, state.originalEvents, state.originalURLS);
  };

  const handleClear = () => {
    setState({ ...state, searchText: "" });
    filterEvents("", state.originalEvents, state.originalURLS);
  };

  const handleSortOpenClose = () => {
    setState((prevState) => ({
      ...prevState,
      sortMenu: prevState.sortMenu === "block" ? "none" : "block",
    }));
  };

  const handleSort = (e) => {
    setState({ ...state, sortBy: e.target.value });
    sort(state.events, state.urls, e.target.value, state.isAscending);
  };

  const sort = (events, urls, sortBy, isAscending) => {
    if (sortBy === "date") {
      sortArrays(events, urls, "startDate", isAscending);
    } else if (sortBy === "title") {
      sortArrays(events, urls, "name", isAscending);
    } else if (sortBy === "organization") {
      sortArrays(events, urls, "organization", isAscending);
    }
  };

  const sortArrays = (events, urls, attribute, ascending) => {
    const list = events.map((event, index) => ({ event, url: urls[index] }));
    list.sort((a, b) => {
      const comparison = ("" + a.event[attribute]).localeCompare(
        b.event[attribute]
      );
      return ascending ? comparison : -comparison;
    });
    const sortedEvents = list.map((item) => item.event);
    const sortedUrls = list.map((item) => item.url);
    setState((prevState) => ({
      ...prevState,
      events: sortedEvents,
      urls: sortedUrls,
    }));
  };

  const filterEvents = (text, originalEvents, oldURLS) => {
    const filtered = [];
    const urls = [];
    originalEvents.forEach((event, index) => {
      if (
        event["name"].toLowerCase().includes(text.toLowerCase()) ||
        event["location"].toLowerCase().includes(text.toLowerCase()) ||
        event["organization"].toLowerCase().includes(text.toLowerCase()) ||
        event["tags"].toLowerCase().includes(text.toLowerCase())
      ) {
        filtered.push(event);
        urls.push(oldURLS[index]);
      }
    });
    sort(filtered, urls, state.sortBy, state.isAscending);
    setState({ ...state, events: filtered, urls: urls });
  };

  const handleToggle = (name) => (event) => {
    setState({ ...state, [name]: event.target.checked });
    sort(state.events, state.urls, state.sortBy, event.target.checked);
  };

  const getFormattedDate = (event) => {
    console.log(event["startDate"]);
    const arr = event["startDate"].split(" ");
    const arr2 = arr[0].split("-");
    const arr3 = arr[1].split(":");
    const date = new Date(
      `${arr2[0]}-${arr2[1]}-${arr2[2]}T${arr3[0]}:${arr3[1]}-05:00`
    );
    return date;
  };

  // Gets a formatted AM/PM time string with the given hours and minutes
  const timeString = (hours, minutes) => {
    if (hours === 0) {
      return `${hours + 12}:${minutes} AM`;
    } else if (hours < 12) {
      return `${hours}:${minutes} AM`;
    } else if (hours === 12) {
      return `${hours}:${minutes} PM`;
    } else {
      return `${hours - 12}:${minutes} PM`;
    }
  };

  //Component did mount - read tags, groups, and all events from the database
  useEffect(() => {
    readTags();
    const off = firebase.auth.onAuthStateChanged((user) => {
      if (user) {
        console.log("Check Role Admin");
        checkRole(user, "admin");
        console.log("Check Role Leader");
        checkRole(user, "leaders");
        console.log("Finished Checking Roles");
      } else {
        setState({ adminSignedIn: false });
      }
    });
    return () => {
      off();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addRafflePopUp = () => {
    if (props.eventType === "/current-events") {
      return (
        <div>
          <Dialog onClose={handleRaffleClose} open={state.raffleOpen}>
            <DialogTitle onClose={handleRaffleClose}>
              {state.raffleTitle}
            </DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                label="How many winners?"
                margin="normal"
                value={state.numWinners}
                type="number"
                onChange={numWinnersChange}
              />
            </DialogContent>
            <DialogActions>
              <Button variant="outlined" onClick={() => runRaffle()}>
                Run Raffle
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog onClose={handleWinnersClose} open={state.winnersOpen}>
            <DialogTitle onClose={handleWinnersClose}>
              Congratulations to{" "}
            </DialogTitle>
            <DialogContent>
              <Typography>{state.winnerString}</Typography>
            </DialogContent>
          </Dialog>
        </div>
      );
    }
  };

  //Raffle Stuff
  // Handles opening of the raffle pop up
  const raffleOnclick = (event, index) => {
    if (event.hasOwnProperty("users")) {
      handleClose();
      let users = event["users"];
      let length = Object.keys(users).length;
      if (length > 1) {
        setState((prevState) => ({
          ...prevState,
          raffleEvent: event,
          raffleOpen: true,
          numWinners: 1,
          raffleTitle: `Raffle - ${length} Attendees`,
        }));
      } else {
        setState((prevState) => ({
          ...prevState,
          raffleEvent: event,
          raffleOpen: true,
          numWinners: 1,
          raffleTitle: `Raffle - ${length} Attendee`,
        }));
      }
      token.current = group.enter();
    } else {
      displayMessage("No users checked into the event.");
    }
  };

  // Runs a raffle on the given event
  const runRaffle = async () => {
    let numUsers = Object.keys(state.raffleEvent["users"]).length;
    if (state.numWinners > 0 && state.numWinners <= numUsers) {
      let winners = [];
      for (let i = 0; i < state.numWinners; i++) {
        let index = Math.floor(Math.random() * numUsers);
        let user = Object.keys(state.raffleEvent["users"])[index];
        if (!winners.includes(user)) {
          winners.push(user);
        } else {
          i = i - 1;
        }
      }
      await setState({ winners: winners });
      handleRaffleClose();
      displayWinners();
    } else if (state.numWinners <= 0) {
      displayMessage("The number of winners must be greater than 0.");
    } else {
      displayMessage(
        "The number of winners is higher than the number of checked in users."
      );
    }
  };

  // Handles closing of the raffle pop up
  const handleRaffleClose = () => {
    setState({ raffleOpen: false });
    group.leave(token);
  };

  const attendeesClose = () => {
    setState({ attendeesOpen: false });
  };

  // Handles changing of the number of winners in the raffle pop up
  const numWinnersChange = (e) => {
    setState({ numWinners: e.target.value });
  };

  // Handles closing of the winners pop up
  const handleWinnersClose = () => {
    setState({ winnersOpen: false });
  };

  // Displays the winners after running the raffle
  const displayWinners = async () => {
    let s = "";
    for (let i = 0; i < state.winners.length - 1; i++) {
      s = s + state.winners[i] + "\n";
    }
    s += state.winners[state.winners.length - 1];
    let winnerString = s.split("\n").map((item, i) => {
      return <p key={i}>{item}</p>;
    });
    console.log(state.winners);
    await setState({ winnerString: "" });
    await setState({ winnerString: winnerString });
    await setState({ winnersOpen: true });
  };

  // Downloads a QR code with the given event
  const downloadQR = (event) => {
    QRCode.toDataURL(
      `https://osl-events-app.firebaseapp.com/event?id=${
        event["key"]
      }&name=${event["name"].replaceAll(" ", "+")}`,
      function(err, url) {
        var link = document.createElement("a");
        link.href = url;
        link.download = `${event["name"]}-QR Code.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    );
  };

  const viewAttendees = (event) => {
    setState({ attendeesOpen: true });
    let ref = firebase.database.ref("/current-events");
    ref.on("value", function(snapshot) {
      let usersList = [];
      snapshot.forEach(function(child) {
        console.log(child.key);
        console.log(child.child("name").val());
        if (child.child("name").val() === event["name"]) {
          child.forEach(function(attribute) {
            if (attribute.key === "users") {
              attribute.forEach(function(user) {
                console.log(attribute.key);
                console.log(user.key);
                usersList.push(<ListItem>{user.key}</ListItem>);
              });
              setState((prevState) => ({
                ...prevState,
                attendeesList: usersList,
                testThing: "Done",
              }));
            }
          });
        }
      });
    });
  };

  // Moves an event from Pending Events to Current Events in Firebase
  const moveEvent = (ref) => {
    firebase.database.ref(ref).remove();
    setState({ openDelete: false });
    group.leave(token);
  };

  // Action for clicking the accept event/save changes button (handleSaveEdit called first)
  const submitAction = (event) => {
    if (state.adminSignedIn) {
      pushEvent(event, "/current-events", "Event Moved to Current Events");
      moveEvent("/pending-events/" + state.popUpEvent["key"]);
    } else if (state.leaderSignedIn) {
      pushEvent(event, props.eventType, "Event Updated");
    }
  };

  // Checks the role of the current user
  const checkRole = (user, role) => {
    firebase.database
      .ref(role)
      .once("value")
      .then(async (snapshot) => {
        if (snapshot.hasChild(user.email.replace(".", ","))) {
          console.log("Snapshot: " + snapshot);
          if (role === "admin") {
            setState((prevState) => ({
              ...prevState,
              adminSignedIn: true,
              uid: user.uid,
              userRole: role,
            }));
            readAllGroups();
            if (props.eventType === "/current-events") {
              // readEvents();
            } else {
              setState((prevState) => ({
                ...prevState,
                confirmButton: "Accept Event",
                cancelButton: "Reject Event",
                popUpText: "reject",
              }));
            }
          } else if (role === "leaders" && !state.adminSignedIn) {
            setState((prevState) => ({
              ...prevState,
              leaderSignedIn: true,
              uid: user.uid,
              userRole: role,
            }));
            readLeaderGroups();
          }
          return role;
        }
      });
  };

  useEffect(() => {
    if (!state.userRole) return;
    console.log("state.groups", state.groups);
    console.log("state.userRole", state.userRole);

    if (state.userRole === "leaders " && state.groups) {
      readLeaderEvents();
    } else if (state.userRole === "admin") {
      readEvents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.userRole, state.groups]);

  const decodeGroup = (codedGroup) => {
    let group = codedGroup;
    if (typeof group === "string" || group instanceof String) {
      group = group.replace(/\*%&/g, ".");
      group = group.replace(/@%\*/g, "$");
      group = group.replace(/\*<=/g, "[");
      group = group.replace(/<@\+/g, "]");
      group = group.replace(/!\*>/g, "#");
      group = group.replace(/!<\^/g, "/");
    }
    return group;
  };

  // Parent Component for a single event
  const ParentComponent = (props) => (
    <div>
      <Grid container id="children-pane" direction="row" spacing={8}>
        {props.children}
      </Grid>
    </div>
  );

  //Child Component for a single event
  const CurrentChildComponent = (props) => (
    <Grid item>
      <Card style={{ minWidth: 350, maxWidth: 350, height: "auto" }}>
        <CardActionArea onClick={props.editAction}>
          <CardHeader title={props.name} subheader={props.date}></CardHeader>
          {/*<CardMedia style = {{ height: 0, paddingTop: '56.25%'}} image={props.image} title={props.name}/><CardContent>*/}
          <CardContent style={{ paddingTop: "0" }}>
            <img src={props.image} style={{ height: 100 }}></img>
            <Typography component="p">
              {props.location}
              <br />
              {props.organization}
              <br />
              {props.tags}
              <br />
              {props.description}
              <br />
              {props.webLink}
              <br />
              {props.email}
            </Typography>
          </CardContent>
        </CardActionArea>
        <CardActions>
          {/*Write if statement for adding these two buttons */}
          <Button variant="outlined" onClick={props.downloadQR}>
            Download QR
          </Button>
          <Button variant="outlined" onClick={props.raffleOnclick}>
            Raffle
          </Button>
          <Button variant="outlined" onClick={props.viewAttendees}>
            Attendees
          </Button>
        </CardActions>
      </Card>
    </Grid>
  );

  const PendingChildComponent = (props) => (
    <Grid item>
      <Card style={{ minWidth: 350, maxWidth: 350, height: "auto" }}>
        <CardActionArea onClick={props.editAction}>
          <CardHeader title={props.name} subheader={props.date}></CardHeader>
          {/*<CardMedia style = {{ height: 0, paddingTop: '56.25%'}} image={props.image} title={props.name}/><CardContent>*/}
          <CardContent style={{ paddingTop: "0" }}>
            <img src={props.image} style={{ height: 100 }}></img>
            <Typography component="p">
              {props.location}
              <br />
              {props.organization}
              <br />
              {props.tags}
              <br />
              {props.description}
              <br />
              {props.email}
              <br />
              {props.webLink}
            </Typography>
          </CardContent>
        </CardActionArea>
        <CardActions>
          {/*Write if statement for adding these two buttons */}
        </CardActions>
      </Card>
    </Grid>
  );

  //render the EventsView for the Current Events and Pending Events pages
  const children = state.events.map((event, index) => {
    const date = getFormattedDate(event);
    console.log("event", event, "date", date);

    let month = 1 + date.getMonth();
    month = month.toString().padStart(2, "0");
    let day = date
      .getDate()
      .toString()
      .padStart(2, "0");
    let hours = date.getHours();
    let minutes = date
      .getMinutes()
      .toString()
      .padStart(2, "0");
    const startDate = `${date.getFullYear()}-${month}-${day} ${timeString(
      hours,
      minutes
    )}`;
    date.setMilliseconds(date.getMilliseconds() + event["duration"] * 60000);
    hours = date.getHours();
    minutes = date
      .getMinutes()
      .toString()
      .padStart(2, "0");
    const fullDate = `${startDate}-${timeString(hours, minutes)}`;

    if (props.eventType === "/current-events") {
      return (
        <CurrentChildComponent
          key={index}
          name={event["name"]}
          date={fullDate}
          location={`Location: ${event["location"]}`}
          organization={`Group: ${event["organization"]}`}
          description={`Description: ${event["description"]}`}
          tags={`Tags: ${event["tags"]}`}
          image={state.urls[index]}
          webLink={`Web Link: ${event["webLink"]}`}
          editAction={() => editAction(event, index)}
          raffleOnclick={() => raffleOnclick(event, index)}
          downloadQR={() => downloadQR(event)}
          viewAttendees={() => viewAttendees(event)}
        />
      );
    } else {
      return (
        <PendingChildComponent
          key={index}
          name={event["name"]}
          date={fullDate}
          location={`Location: ${event["location"]}`}
          organization={`Group: ${event["organization"]}`}
          description={`Description: ${event["description"]}`}
          tags={`Tags: ${event["tags"]}`}
          image={state.urls[index]}
          editAction={() => editAction(event, index)}
          email={event["status"]}
          webLink={`Web Link: ${event["webLink"]}`}
        />
      );
    }
  });

  return (
    <div>
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          margintop: "-50px",
          marginleft: "-50px",
          width: "100px",
          height: "100px",
        }}
      >
        <CircularProgress
          disableShrink
          style={{ visibility: state.hidden }}
        ></CircularProgress>
      </div>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div style={{ position: "relative", display: "inline-block" }}>
          <Paper
            style={{
              padding: "2px 4px",
              display: "flex",
              alignItems: "center",
              width: 400,
            }}
            elevation={1}
          >
            <SearchIcon style={{ padding: 10 }} />
            <InputBase
              style={{ width: 300 }}
              placeholder="Search Events"
              value={state.searchText}
              onChange={handleSearchChange}
            />
            <IconButton onClick={handleClear}>
              <CloseIcon />
            </IconButton>
            <Divider style={{ width: 1, height: 28, margin: 4 }} />
            <IconButton onClick={handleSortOpenClose}>
              <SortIcon />
            </IconButton>
          </Paper>
        </div>
      </div>
      <div
        style={{
          textAlign: "center",
          marginBottom: 20,
          display: state.sortMenu,
        }}
      >
        <div style={{ position: "relative", display: "inline-block" }}>
          <Paper
            style={{
              padding: "2px 4px",
              display: "flex",
              alignItems: "center",
              width: 400,
            }}
            elevation={1}
          >
            <FormControl component="fieldset" style={{ paddingLeft: 10 }}>
              <FormLabel component="legend" style={{ paddingTop: 10 }}>
                Sort By:
              </FormLabel>
              <FormControlLabel
                control={
                  <Switch
                    checked={state.isAscending}
                    onChange={handleToggle("isAscending")}
                    value="isAscending"
                    color="primary"
                  />
                }
                label="Ascending"
              />
              <RadioGroup
                aria-label="gender"
                name="gender2"
                value={state.sortBy}
                onChange={handleSort}
              >
                <FormControlLabel
                  value="date"
                  control={<Radio color="primary" />}
                  label="Date"
                  labelPlacement="end"
                />
                <FormControlLabel
                  value="title"
                  control={<Radio color="primary" />}
                  label="Title"
                  labelPlacement="end"
                />
                <FormControlLabel
                  value="organization"
                  control={<Radio color="primary" />}
                  label="Group"
                  labelPlacement="end"
                />
              </RadioGroup>
            </FormControl>
          </Paper>
        </div>
      </div>
      {addRafflePopUp()}

      <Dialog onClose={attendeesClose} open={state.attendeesOpen}>
        <DialogTitle onClose={attendeesClose}>Attendees</DialogTitle>
        <DialogContent>{state.attendeesList}</DialogContent>
      </Dialog>

      <ParentComponent>{children}</ParentComponent>
      <Dialog
        onClose={handleCloseEdit}
        aria-labelledby="customized-dialog-title"
        open={state.editing}
      >
        <DialogTitle id="customized-dialog-title" onClose={handleCloseEdit}>
          Edit Event
        </DialogTitle>
        <DialogContent>
          <Grid container>
            <Grid item container direction="column" spacing={0}>
              <Grid item>
                <TextField
                  label="Event Title"
                  id="event-name"
                  margin="normal"
                  value={state.popUpEvent["name"]}
                  onChange={handleNameChange}
                />
              </Grid>
              <Grid item>
                <LocalizationProvider dateAdapter={AdapterMoment}>
                  <DateTimePicker
                    renderInput={(props) => <TextField {...props} />}
                    label="Start Date/Time"
                    value={state.date}
                    onChange={handleDateChange}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item>
                <TextField
                  id="event-dur"
                  label="Duration (minutes)"
                  margin="normal"
                  value={state.popUpEvent["duration"]}
                  type="number"
                  onChange={handleDurationChange}
                />
              </Grid>
              <Grid item>
                <TextField
                  id="event-org"
                  label="Location"
                  margin="normal"
                  value={state.popUpEvent["location"]}
                  onChange={handleLocationChange}
                />
              </Grid>
              <Grid item>
                <FormControl margin="normal">
                  <InputLabel>Group</InputLabel>
                  <Select
                    displayEmpty
                    value={state.popUpEvent["organization"]}
                    style={{ minWidth: 200, maxWidth: 200 }}
                    onChange={handleOrganizationChange}
                    variant="outlined"
                  >
                    {state.groups.map((group) => (
                      <MenuItem key={group} value={group}>
                        {group}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item>
                <FormControl margin="normal">
                  <InputLabel htmlFor="select-multiple">Tags</InputLabel>
                  <Select
                    multiple
                    displayEmpty
                    input={<Input id="select-multiple" />}
                    value={state.tags}
                    style={{ minWidth: 200, maxWidth: 200 }}
                    onChange={(e) =>
                      setState({ ...state, tags: e.target.value })
                    }
                    variant="outlined"
                  >
                    <MenuItem disabled value="">
                      <em>Select Tags</em>
                    </MenuItem>
                    {state.databaseTags.map((tag) => (
                      <MenuItem key={tag} value={tag}>
                        {tag}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item>
                <TextField
                  id="event-link"
                  label="Web Link (Optional)"
                  margin="normal"
                  value={state.popUpEvent["webLink"]}
                  onChange={handleWebLinkChange}
                />
              </Grid>
              <Grid item>
                <TextField
                  id="event-desc"
                  label="Description"
                  multiline
                  rows="5"
                  margin="normal"
                  variant="outlined"
                  value={state.popUpEvent["description"]}
                  onChange={handleDescriptionChange}
                />
              </Grid>
              <Grid item>
                <FilePicker
                  extensions={["jpg", "jpeg", "png"]}
                  onChange={handleImageFileChanged}
                  onError={(errMsg) => displayMessage(errMsg)}
                >
                  <Button variant="contained" disabled={state.uploading}>
                    Select Image
                  </Button>
                </FilePicker>
              </Grid>
              <Grid item>
                <img style={{ width: 192, height: 108 }} src={state.image64} />
              </Grid>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions style={{ justifyContent: "center" }}>
          <Button
            variant="contained"
            onClick={handleDeleteOpen}
            color="primary"
          >
            {state.cancelButton}
            <DeleteIcon />
          </Button>
          <Button variant="contained" onClick={handleSaveEdit} color="primary">
            {state.confirmButton}
            <SaveIcon />
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        onClose={handleCloseRequest}
        aria-labelledby="Request"
        open={state.requesting}
      >
        <Card style={{ minWidth: 150, minHeight: 125 }}>
          <div
            style={{
              fontSize: 25,
              justifyContent: "center",
              padding: 20,
            }}
          >
            If you would like to make a change to your event, please email
            osleventsapp@augustana.edu with the change you would like for
            approval.
          </div>
        </Card>
      </Dialog>
      <Dialog
        open={state.openDelete}
        onClose={handleDeleteClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Are you sure you want to " + state.popUpText + " the event?"}
        </DialogTitle>
        <DialogActions>
          <Button onClick={handleDeleteClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDelete} color="primary" autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        open={state.open}
        autoHideDuration={6000}
        onClose={handleClose}
        ContentProps={{
          "aria-describedby": "message-id",
        }}
        message={state.message}
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
    </div>
  );
};

export default EventsView;
