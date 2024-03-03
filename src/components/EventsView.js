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
import React, { Component } from "react";
import { FilePicker } from "react-file-picker";
import Resizer from "react-image-file-resizer";
import firebase from "../config";
import DispatchGroup from "./DispatchGroup";

//Component for showing events and managing events on the
//  Current Events and Pending Events pages

var QRCode = require("qrcode");

const uuidv4 = require("uuid/v4");

export class EventsView extends Component {
  group = new DispatchGroup();
  token = null;

  state = {
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
  };

  listeners = [];
  off = null;

  // Handles opening of the pop up for editing an event
  handleBeginEdit = () => {
    this.handleClose();
    this.setState({ editing: true });
    this.token = this.group.enter();
  };

  handleBeginRequest = () => {
    this.handleClose();
    this.setState({ requesting: true });
    this.token = this.group.enter();
  };

  // TODO: Change this to run differently depending on whether
  //          we are in Current or Pending Events - resolved
  // Handles the deleting/rejecting of an event from Firebase
  handleDelete = () => {
    this.setState({ editing: false });
    let event = this.state.popUpEvent;
    firebase.database
      .ref(this.props.eventType)
      .child(event["key"])
      .remove();
    var firebaseStorageRef = firebase.storage.ref("Images");
    if (event["imgid"] !== "default") {
      firebaseStorageRef.child(event["imgid"] + ".jpg").delete();
    }
    this.setState({ openDelete: false });
    this.group.leave(this.token);
  };

  // Removes a given value from the given array
  arrayRemove(arr, value) {
    return arr.filter(function(ele) {
      return ele !== value;
    });
  }

  // Handles closing of the confirm pop up for deleting/rejecting an event
  handleDeleteClose = () => {
    this.setState({ openDelete: false });
  };

  // Handles opening of the confirm pop up for deleting/rejecting an event
  handleDeleteOpen = () => {
    this.setState({ openDelete: true });
  };

  // Handles saving of edits once the save changes button is clicked
  handleSaveEdit = () => {
    this.setState({ editing: false });
    let event = this.state.popUpEvent;
    let self = this;
    if (this.state.image64 !== this.state.image64Old) {
      this.setState({ uploading: true });
      self.displayMessage(self, "Uploading Image...");
      var firebaseStorageRef = firebase.storage.ref("Images");
      const id = uuidv4();
      const imageRef = firebaseStorageRef.child(id + ".jpg");
      const oldId = event["imgid"];
      this.handleEventChange("imgid", id);

      const i = this.state.image64.indexOf("base64,");
      const buffer = Buffer.from(this.state.image64.slice(i + 7), "base64");
      const file = new File([buffer], id);

      imageRef
        .put(file)
        .then(function() {
          return imageRef.getDownloadURL();
        })
        .then(function(url) {
          let images = self.state.urls;
          images[self.state.index] = url;
          self.setState({ urls: images });
          //TODO: add conditional to run submitAction or pushEvent
          //depending on the page running it - resolved
          if (self.props.eventType === "/current-events") {
            self.pushEvent(self, event, self.props.eventType, "Event Updated");
            console.log("event pushed");
          } else {
            self.submitAction(self, event);
            console.log("Action Submitted");
          }
          if (oldId !== "default") {
            firebaseStorageRef.child(oldId + ".jpg").delete();
          }
        })
        .catch(function(error) {
          console.log(error);
          self.displayMessage(self, "Error Uploading Image");
        });
    } else {
      if (self.props.eventType === "/current-events") {
        self.pushEvent(self, event, self.props.eventType, "Event Updated");
      } else {
        self.submitAction(self, event);
      }
    }
  };

  // Handles closing of the edit event pop up
  handleCloseEdit = () => {
    let revertEvents = this.state.events;
    revertEvents[this.state.index] = this.state.oldEvent;
    this.setState({ editing: false, events: revertEvents });
    this.group.leave(this.token);
  };

  handleCloseRequest = () => {
    this.setState({ requesting: false });
  };

  // Pushes the given event to the given reference in Firebase database
  pushEvent(self, event, ref, message) {
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
        tags: this.state.tags.toString(),
        email: event["email"],
      });
    self.setState({ uploading: false });
    self.displayMessage(self, message);
    this.group.leave(this.token);
  }

  // Displays a message to the user using the Snackbar
  displayMessage(self, message) {
    self.handleClose();
    self.setState({ message: message });
    self.handleOpen();
  }

  // Handles opening of the Snackbar
  handleOpen = () => {
    this.setState({ open: true });
  };

  // Handles closing of the Snackbar
  handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    this.setState({ open: false });
  };

  // Reads all of the current events from Firebase
  readEvents() {
    let self = this;
    let reference = firebase.database
      .ref(this.props.eventType)
      .orderByChild("name");
    this.listeners.push(reference);
    let eventType = this.props.eventType;
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
        self.getImage(
          self,
          index,
          listEvents,
          listURLS,
          snapshot.numChildren()
        );
      });
      if (snapshot.numChildren() === 0) {
        self.group.notify(function() {
          self.setState({
            events: [],
            originalEvents: [],
            urls: [],
            originalURLS: [],
          });
          if (self.state.isInitial) {
            self.setState({
              hidden: "hidden",
              message: "No Events Found",
              open: true,
            });
          }
        });
      }
      self.setState({ isInitial: false });
    });
  }

  readLeaderEvents() {
    let self = this;
    let reference = firebase.database
      .ref(this.props.eventType)
      .orderByChild("name");
    this.listeners.push(reference);
    let eventType = this.props.eventType;
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
        if (self.state.groups.includes(event["organization"])) {
          listEvents.push(event);
          index = index + 1;
        }
      });

      if (listEvents.length === 0) {
        self.group.notify(function() {
          self.setState({
            events: [],
            originalEvents: [],
            urls: [],
            originalURLS: [],
          });
          if (self.state.isInitial) {
            self.setState({
              hidden: "hidden",
              message: "No Events Found",
              open: true,
            });
          }
        });
      } else {
        // for loop counting up i
        for (let i = 0; i < listEvents.length; i++) {
          self.getImage(self, i, listEvents, listURLS, listEvents.length);
        }
      }
      self.setState({ isInitial: false });
    });
  }

  // Retrieves a single image from Firebase storage
  getImage(self, index, listEvents, listURLS, endLength) {
    firebase.storage
      .ref("Images")
      .child(listEvents[index].imgid + ".jpg")
      .getDownloadURL()
      .then((url) => {
        listURLS[index] = url;
        if (endLength === listURLS.length) {
          self.group.notify(function() {
            self.setState({
              events: listEvents,
              originalEvents: listEvents,
              urls: listURLS,
              originalURLS: listURLS,
              hidden: "hidden",
            });
            self.filterEvents(self.state.searchText, listEvents, listURLS);
          });
        }
      })
      .catch((error) => {
        // Handle any errors
      });
  }

  // Handle changing of the image file
  handleImageFileChanged = (theFile) => {
    Resizer.imageFileResizer(
      theFile,
      300,
      300,
      "JPEG",
      95,
      0,
      (uri) => {
        this.setState({ image64: uri });
      },
      "base64"
    );
  };

  // Reads the tags from the Firebase database
  readTags() {
    let self = this;
    let ref = firebase.database.ref("/tags");
    this.listeners.push(ref);
    ref.on("value", function(snapshot) {
      let tagsList = [];
      snapshot.forEach(function(child) {
        tagsList.push(child.val());
      });
      self.setState({ databaseTags: tagsList });
    });
  }

  // Reads the groups from the Firebase database
  readAllGroups() {
    let self = this;
    let ref = firebase.database.ref("/groups");
    this.listeners.push(ref);
    ref.on("value", function(snapshot) {
      let groupsList = [];
      snapshot.forEach(function(child) {
        let decodedGroup = self.decodeGroup(child.val());
        groupsList.push(decodedGroup);
      });
      self.setState({ groups: groupsList });
      console.log(groupsList);
    });
  }

  //Read the groups a leader can post and edit for
  readLeaderGroups() {
    let self = this;
    let email = firebase.auth.currentUser.email;
    let ref = firebase.database
      .ref("/leaders")
      .child(email.replace(".", ","))
      .child("groups");
    ref.on("value", function(snapshot) {
      let myGroups = [];
      snapshot.forEach(function(child) {
        let decodedGroup = self.decodeGroup(child.key);
        myGroups.push(decodedGroup);
      });
      self.setState({ groups: myGroups });
    });
  }

  // Action called when clicking an event to edit it
  editAction(event, i) {
    console.log("Editing: " + event["name"]);
    let tags = event["tags"].split(",");
    if (tags[0] === "") {
      tags = [];
    }
    let self = this;
    let date = this.getFormattedDate(event);
    let oldEvent = Object.assign({}, event);
    if (!self.state.groups.includes(event["organization"])) {
      self.state.groups.push(event["organization"]);
    }
    let eventTags = event["tags"].split(",");
    eventTags.forEach(function(tag) {
      if (!self.state.databaseTags.includes(tag) && tag !== "") {
        self.state.databaseTags.push(tag);
      }
    });
    self.setState({
      oldEvent: oldEvent,
      popUpEvent: event,
      tags: tags,
      date: date,
      index: i,
      image64: self.state.urls[i],
      image64Old: self.state.urls[i],
    });
    self.handleBeginEdit();
  }

  // Handles changing of the name field in the edit pop up
  handleNameChange = (e) => {
    this.handleEventChange("name", e.target.value);
  };

  // Handles changing of the date picker/time picker in the edit pop up
  handleDateChange = (e) => {
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

    this.handleEventChange("startDate", startDate);
    this.setState({ date: date });
  };

  // Handles changing of the duration field in the edit pop up
  handleDurationChange = (e) => {
    this.handleEventChange("duration", e.target.value);
  };

  // Handles changing of the location field in the edit pop up
  handleLocationChange = (e) => {
    this.handleEventChange("location", e.target.value);
  };

  // Handles changing of the organization choice in the edit pop up
  handleOrganizationChange = (e) => {
    this.handleEventChange("organization", e.target.value);
  };

  // Handles changing of the tag choices in the edit pop up
  handleTagChange = (e) => {
    this.handleEventChange("tags", e.target.value.toString());
    this.setState({ tags: e.target.value });
  };

  //Handles changing of the web link field in the edit pop up
  handleWebLinkChange = (e) => {
    this.handleEventChange("webLink", e.target.value);
  };

  // Handles changing of the description field in the edit pop up
  handleDescriptionChange = (e) => {
    this.handleEventChange("description", e.target.value);
  };

  // Handles changing of a single element in the edit pop up
  handleEventChange(key, value) {
    let newEvents = this.state.events;
    let event = newEvents[this.state.index];
    event[key] = value;
    newEvents[this.state.index] = event;
    this.setState({ events: newEvents });
  }

  // Handles changing text of the search bar
  handleSearchChange = (e) => {
    this.setState({ searchText: e.target.value });
    this.filterEvents(
      e.target.value,
      this.state.originalEvents,
      this.state.originalURLS
    );
  };

  // Handles clearing of the search field (when clicking the x button)
  handleClear = () => {
    this.setState({ searchText: "" });
    this.filterEvents("", this.state.originalEvents, this.state.originalURLS);
  };

  // Handles toggling of the sort menu
  handleSortOpenClose = () => {
    console.log("sorting");
    if (this.state.sortMenu === "block") {
      this.setState({ sortMenu: "none" });
    } else {
      this.setState({ sortMenu: "block" });
    }
  };

  // Handles changing of the different sorting options
  handleSort = (e) => {
    this.setState({ sortBy: e.target.value });
    this.sort(
      this.state.events,
      this.state.urls,
      e.target.value,
      this.state.isAscending
    );
  };

  // Handles the sorting of the different sorting options
  sort(events, urls, sortBy, isAscending) {
    if (sortBy === "date") {
      this.sortArrays(events, urls, "startDate", isAscending);
    } else if (sortBy === "title") {
      this.sortArrays(events, urls, "name", isAscending);
    } else if (sortBy === "organization") {
      this.sortArrays(events, urls, "organization", isAscending);
    }
  }

  // Sorts the event and image arrays
  sortArrays(events, urls, attribute, ascending) {
    var list = [];
    for (var j = 0; j < events.length; j++) {
      list.push({ event: events[j], url: urls[j] });
    }
    if (ascending) {
      list.sort(function(a, b) {
        return ("" + a.event[attribute]).localeCompare(b.event[attribute]);
      });
    } else {
      list.sort(function(a, b) {
        return ("" + b.event[attribute]).localeCompare(a.event[attribute]);
      });
    }
    for (var k = 0; k < list.length; k++) {
      events[k] = list[k].event;
      urls[k] = list[k].url;
    }
  }

  // Filters events with the given text and original events/images
  filterEvents(text, originalEvents, oldURLS) {
    var index = 0;
    let filtered = [];
    let urls = [];
    originalEvents.forEach(function(event) {
      if (
        event["name"].toLowerCase().includes(text.toLowerCase()) ||
        event["location"].toLowerCase().includes(text.toLowerCase()) ||
        event["organization"].toLowerCase().includes(text.toLowerCase()) ||
        event["tags"].toLowerCase().includes(text.toLowerCase())
      ) {
        filtered.push(event);
        urls.push(oldURLS[index]);
      }
      index = index + 1;
    });
    this.sort(filtered, urls, this.state.sortBy, this.state.isAscending);
    this.setState({ events: filtered, urls: urls });
  }

  // Handles toggling of the ascending option
  handleToggle = (name) => (event) => {
    this.setState({ [name]: event.target.checked });
    this.sort(
      this.state.events,
      this.state.urls,
      this.state.sortBy,
      event.target.checked
    );
  };

  // Returns a formmatted date from the given event
  getFormattedDate(event) {
    console.log(event["startDate"]);
    let arr = event["startDate"].split(" ");
    let arr2 = arr[0].split("-");
    let arr3 = arr[1].split(":");
    let date = new Date(
      arr2[0] +
        "-" +
        arr2[1] +
        "-" +
        arr2[2] +
        "T" +
        arr3[0] +
        ":" +
        arr3[1] +
        "-05:00"
    );
    return date;
  }

  // Gets a formatted AM/PM time string with the given hours and minutes
  timeString(hours, minutes) {
    if (hours === 0) {
      return hours + 12 + ":" + minutes + " AM";
    } else if (hours < 12) {
      return hours + ":" + minutes + " AM";
    } else if (hours === 12) {
      return hours + ":" + minutes + " PM";
    } else {
      return hours - 12 + ":" + minutes + " PM";
    }
  }

  //Component did mount - read tags, groups, and all events from the database
  componentDidMount() {
    this.readTags();
    this.off = firebase.auth.onAuthStateChanged((user) => {
      if (user) {
        console.log("Check Role Admin");
        this.checkRole(user, "admin");
        console.log("Check Role Leader");
        this.checkRole(user, "leaders");
        console.log("Finished Checking Roels");
      } else {
        this.setState({ adminSignedIn: false });
      }
    });
  }

  // Component will unmount - turn off all Firebase listeners
  componentWillUnmount() {
    this.off();
    this.listeners.forEach(function(listener) {
      listener.off();
    });
  }

  addRafflePopUp() {
    if (this.props.eventType === "/current-events") {
      return (
        <div>
          <Dialog onClose={this.handleRaffleClose} open={this.state.raffleOpen}>
            <DialogTitle onClose={this.handleRaffleClose}>
              {this.state.raffleTitle}
            </DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                label="How many winners?"
                margin="normal"
                value={this.state.numWinners}
                type="number"
                onChange={this.numWinnersChange}
              />
            </DialogContent>
            <DialogActions>
              <Button variant="outlined" onClick={() => this.runRaffle(this)}>
                Run Raffle
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog
            onClose={this.handleWinnersClose}
            open={this.state.winnersOpen}
          >
            <DialogTitle onClose={this.handleWinnersClose}>
              Congratulations to{" "}
            </DialogTitle>
            <DialogContent>
              <Typography>{this.state.winnerString}</Typography>
            </DialogContent>
          </Dialog>
        </div>
      );
    }
  }

  //Raffle Stuff
  // Handles opening of the raffle pop up
  raffleOnclick(event, index) {
    if (event.hasOwnProperty("users")) {
      this.handleClose();
      let users = event["users"];
      let length = Object.keys(users).length;
      if (length > 1) {
        this.setState({
          raffleEvent: event,
          raffleOpen: true,
          numWinners: 1,
          raffleTitle: "Raffle - " + length + " Attendees",
        });
      } else {
        this.setState({
          raffleEvent: event,
          raffleOpen: true,
          numWinners: 1,
          raffleTitle: "Raffle - " + length + " Attendee",
        });
      }
      this.token = this.group.enter();
    } else {
      let self = this;
      this.displayMessage(self, "No users checked into the event.");
    }
  }

  // Runs a raffle on the given event
  async runRaffle(self) {
    let numUsers = Object.keys(self.state.raffleEvent["users"]).length;
    if (self.state.numWinners > 0 && self.state.numWinners <= numUsers) {
      let winners = [];
      for (let i = 0; i < self.state.numWinners; i++) {
        let index = Math.floor(Math.random() * numUsers);
        let user = Object.keys(self.state.raffleEvent["users"])[index];
        if (!winners.includes(user)) {
          winners.push(user);
        } else {
          i = i - 1;
        }
      }
      await self.setState({ winners: winners });
      self.handleRaffleClose();
      self.displayWinners();
    } else if (self.state.numWinners <= 0) {
      self.displayMessage(
        self,
        "The number of winners must be greater than 0."
      );
    } else {
      self.displayMessage(
        self,
        "The number of winners is higher than the number of checked in users."
      );
    }
  }

  // Handles closing of the raffle pop up
  handleRaffleClose = () => {
    this.setState({ raffleOpen: false });
    this.group.leave(this.token);
  };

  attendeesClose = () => {
    this.setState({ attendeesOpen: false });
  };

  // Handles changing of the number of winners in the raffle pop up
  numWinnersChange = (e) => {
    this.setState({ numWinners: e.target.value });
  };

  // Handles opening of the winners pop up
  handleOpenWinners = () => {
    this.setState({ winnersOpen: true });
  };

  // Handles closing of the winners pop up
  handleWinnersClose = () => {
    this.setState({ winnersOpen: false });
  };

  // Displays the winners after running the raffle
  async displayWinners() {
    let self = this;
    let s = "";
    for (let i = 0; i < self.state.winners.length - 1; i++) {
      s = s + self.state.winners[i] + "\n";
    }
    s += self.state.winners[self.state.winners.length - 1];
    let winnerString = s.split("\n").map((item, i) => {
      return <p key={i}>{item}</p>;
    });
    console.log(self.state.winners);
    await self.setState({ winnerString: "" });
    await self.setState({ winnerString: winnerString });
    await this.setState({ winnersOpen: true });
  }

  // Downloads a QR code with the given event
  downloadQR = (event) => {
    QRCode.toDataURL(
      "https://osl-events-app.firebaseapp.com/event?id=" +
        event["key"] +
        "&name=" +
        event["name"].replaceAll(" ", "+"),
      function(err, url) {
        var link = document.createElement("a");
        link.href = url;
        link.download = event["name"] + "-QR Code.png";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    );
  };

  viewAttendees = (event) => {
    this.setState({ attendeesOpen: true });
    let self = this;
    let ref = firebase.database.ref("/current-events");
    this.listeners.push(ref);
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
              self.setState({
                attendeesList: usersList,
                testThing: "Done",
              });
            }
          });
        }
      });
    });
  };

  // Moves an event from Pending Events to Current Events in Firebase
  moveEvent(ref) {
    firebase.database.ref(ref).remove();
    this.setState({ openDelete: false });
    this.group.leave(this.token);
  }

  // Action for clicking the accept event/save changes button (handleSaveEdit called first)
  submitAction(self, event) {
    if (self.state.adminSignedIn) {
      self.pushEvent(
        self,
        event,
        "/current-events",
        "Event Moved to Current Events"
      );
      self.moveEvent("/pending-events/" + self.state.popUpEvent["key"]);
    } else if (self.state.leaderSignedIn) {
      self.pushEvent(self, event, self.props.eventType, "Event Updated");
    }
  }

  // Checks the role of the current user
  checkRole(user, role) {
    let self = this;
    firebase.database
      .ref(role)
      .once("value")
      .then(function(snapshot) {
        if (snapshot.hasChild(user.email.replace(".", ","))) {
          console.log("Snapshot: " + snapshot);
          if (role === "admin") {
            self.setState({ adminSignedIn: true, uid: user.uid });
            self.readAllGroups();
            if (self.props.eventType === "/current-events") {
              self.readEvents();
            } else {
              self.setState({
                confirmButton: "Accept Event",
                cancelButton: "Reject Event",
                popUpText: "reject",
              });
              self.readEvents();
            }
          } else if (role === "leaders" && !self.state.adminSignedIn) {
            self.setState({ leaderSignedIn: true, uid: user.uid });
            self.readLeaderGroups();
            //TODO: Change this from reading all pending events to checking
            //the group of each pending event and making sure the leader can access
            //those pending events
            self.readLeaderEvents();
          }
        }
      });
  }

  decodeGroup = (codedGroup) => {
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

  //render the EventsView for the Current Events and Pending Events pages
  render() {
    const children = [];

    // Build all of the events
    for (var i = 0; i < this.state.events.length; i += 1) {
      let event = this.state.events[i];
      let index = i;
      let date = this.getFormattedDate(event);
      console.log("event", event, "date", date);

      var month = 1 + date.getMonth();
      month = month.length > 1 ? month : "0" + month;
      var day = date.getDate().toString();
      day = day.length > 1 ? day : "0" + day;
      var hours = date.getHours();
      var minutes = date.getMinutes().toString();
      minutes = minutes.length > 1 ? minutes : "0" + minutes;
      let startDate =
        date.getFullYear() +
        "-" +
        month +
        "-" +
        day +
        " " +
        this.timeString(hours, minutes);
      date.setMilliseconds(date.getMilliseconds() + event["duration"] * 60000);
      hours = date.getHours();
      minutes = date.getMinutes().toString();
      minutes = minutes.length > 1 ? minutes : "0" + minutes;
      let fullDate = startDate + "-" + this.timeString(hours, minutes);
      if (this.props.eventType === "/current-events") {
        if (this.state.adminSignedIn) {
          children.push(
            <CurrentChildComponent
              key={i}
              name={event["name"]}
              date={fullDate}
              location={"Location: " + event["location"]}
              organization={"Group: " + event["organization"]}
              description={"Description: " + event["description"]}
              tags={"Tags: " + event["tags"]}
              image={this.state.urls[index]}
              webLink={"Web Link: " + event["webLink"]}
              editAction={() => this.editAction(event, index)}
              raffleOnclick={() => this.raffleOnclick(event, index)}
              downloadQR={() => this.downloadQR(event)}
              viewAttendees={() => this.viewAttendees(event)}
            />
          );
        } else {
          children.push(
            <CurrentChildComponent
              key={i}
              name={event["name"]}
              date={fullDate}
              location={"Location: " + event["location"]}
              organization={"Group: " + event["organization"]}
              description={"Description: " + event["description"]}
              tags={"Tags: " + event["tags"]}
              image={this.state.urls[index]}
              webLink={"Web Link: " + event["webLink"]}
              editAction={() => this.editAction(event, index)}
              raffleOnclick={() => this.raffleOnclick(event, index)}
              downloadQR={() => this.downloadQR(event)}
              viewAttendees={() => this.viewAttendees(event)}
            />
          );
        }
      } else {
        children.push(
          <PendingChildComponent
            key={i}
            name={event["name"]}
            date={fullDate}
            location={"Location: " + event["location"]}
            organization={"Group: " + event["organization"]}
            description={"Description: " + event["description"]}
            tags={"Tags: " + event["tags"]}
            image={this.state.urls[index]}
            editAction={() => this.editAction(event, index)}
            email={event["status"]}
            webLink={"Web Link: " + event["webLink"]}
          />
        );
      }
    }

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
            style={{ visibility: this.state.hidden }}
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
                value={this.state.searchText}
                onChange={this.handleSearchChange}
              />
              <IconButton onClick={this.handleClear}>
                <CloseIcon />
              </IconButton>
              <Divider style={{ width: 1, height: 28, margin: 4 }} />
              <IconButton onClick={this.handleSortOpenClose}>
                <SortIcon />
              </IconButton>
            </Paper>
          </div>
        </div>
        <div
          style={{
            textAlign: "center",
            marginBottom: 20,
            display: this.state.sortMenu,
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
                      checked={this.state.isAscending}
                      onChange={this.handleToggle("isAscending")}
                      value="isAscending"
                      color="primary"
                    />
                  }
                  label="Ascending"
                />
                <RadioGroup
                  aria-label="gender"
                  name="gender2"
                  value={this.state.sortBy}
                  onChange={this.handleSort}
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
        {this.addRafflePopUp()}

        <Dialog onClose={this.attendeesClose} open={this.state.attendeesOpen}>
          <DialogTitle onClose={this.attendeesClose}>Attendees</DialogTitle>
          <DialogContent>{this.state.attendeesList}</DialogContent>
        </Dialog>

        <ParentComponent>{children}</ParentComponent>
        <Dialog
          onClose={this.handleCloseEdit}
          aria-labelledby="customized-dialog-title"
          open={this.state.editing}
        >
          <DialogTitle
            id="customized-dialog-title"
            onClose={this.handleCloseEdit}
          >
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
                    value={this.state.popUpEvent["name"]}
                    onChange={this.handleNameChange}
                  />
                </Grid>
                <Grid item>
                  <LocalizationProvider dateAdapter={AdapterMoment}>
                    <DateTimePicker
                      renderInput={(props) => <TextField {...props} />}
                      label="Start Date/Time"
                      value={this.state.date}
                      onChange={this.handleDateChange}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item>
                  <TextField
                    id="event-dur"
                    label="Duration (minutes)"
                    margin="normal"
                    value={this.state.popUpEvent["duration"]}
                    type="number"
                    onChange={this.handleDurationChange}
                  />
                </Grid>
                <Grid item>
                  <TextField
                    id="event-org"
                    label="Location"
                    margin="normal"
                    value={this.state.popUpEvent["location"]}
                    onChange={this.handleLocationChange}
                  />
                </Grid>
                <Grid item>
                  <FormControl margin="normal">
                    <InputLabel>Group</InputLabel>
                    <Select
                      displayEmpty
                      value={this.state.popUpEvent["organization"]}
                      style={{ minWidth: 200, maxWidth: 200 }}
                      onChange={this.handleOrganizationChange}
                      variant="outlined"
                    >
                      {this.state.groups.map((group) => (
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
                      value={this.state.tags}
                      style={{ minWidth: 200, maxWidth: 200 }}
                      onChange={(e) => this.setState({ tags: e.target.value })}
                      variant="outlined"
                    >
                      <MenuItem disabled value="">
                        <em>Select Tags</em>
                      </MenuItem>
                      {this.state.databaseTags.map((tag) => (
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
                    value={this.state.popUpEvent["webLink"]}
                    onChange={this.handleWebLinkChange}
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
                    value={this.state.popUpEvent["description"]}
                    onChange={this.handleDescriptionChange}
                  />
                </Grid>
                <Grid item>
                  <FilePicker
                    extensions={["jpg", "jpeg", "png"]}
                    onChange={this.handleImageFileChanged}
                    onError={(errMsg) => this.displayMessage(this, errMsg)}
                  >
                    <Button variant="contained" disabled={this.state.uploading}>
                      Select Image
                    </Button>
                  </FilePicker>
                </Grid>
                <Grid item>
                  <img
                    style={{ width: 192, height: 108 }}
                    src={this.state.image64}
                  />
                </Grid>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions style={{ justifyContent: "center" }}>
            {/* <MuiThemeProvider theme={redTheme}> */}
            <Button
              variant="contained"
              onClick={this.handleDeleteOpen}
              color="primary"
            >
              {this.state.cancelButton}
              <DeleteIcon />
            </Button>
            {/* </MuiThemeProvider> */}
            <Button
              variant="contained"
              onClick={this.handleSaveEdit}
              color="primary"
            >
              {this.state.confirmButton}
              <SaveIcon />
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          onClose={this.handleCloseRequest}
          aria-labelledby="Request"
          open={this.state.requesting}
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
          open={this.state.openDelete}
          onClose={this.handleDeleteClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">
            {"Are you sure you want to " + this.state.popUpText + " the event?"}
          </DialogTitle>
          <DialogActions>
            <Button onClick={this.handleDeleteClose} color="primary">
              Cancel
            </Button>
            {/* <MuiThemeProvider theme={redTheme}> */}
            <Button onClick={this.handleDelete} color="primary" autoFocus>
              Confirm
            </Button>
            {/* </MuiThemeProvider> */}
          </DialogActions>
        </Dialog>
        <Snackbar
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
          open={this.state.open}
          autoHideDuration={6000}
          onClose={this.handleClose}
          ContentProps={{
            "aria-describedby": "message-id",
          }}
          message={this.state.message}
          action={[
            <Button
              key="close"
              aria-label="Close"
              color="inherit"
              onClick={this.handleClose}
            >
              {" "}
              X
            </Button>,
          ]}
        />
      </div>
    );
  }
}

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
