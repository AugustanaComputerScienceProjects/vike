import React, { Component, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import TextField from '@material-ui/core/TextField';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Drawer from '@material-ui/core/Drawer';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import DeleteIcon from '@material-ui/icons/Delete';
import SaveIcon from '@material-ui/icons/Save';
import Typography from '@material-ui/core/Typography';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import firebase from './config';
import { CardActionArea } from '@material-ui/core';
import {MuiPickersUtilsProvider, TimePicker, DatePicker} from 'material-ui-pickers';
import MomentUtils from '@date-io/moment';
import FormControl from '@material-ui/core/FormControl';
import { ImagePicker } from 'react-file-picker'
import { View, Image } from 'react-native';
import Select from '@material-ui/core/Select';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import { red, blue } from '@material-ui/core/colors';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import Snackbar from '@material-ui/core/Snackbar'; 
import CircularProgress from '@material-ui/core/CircularProgress';
import SearchIcon from '@material-ui/icons/Search';
import InputBase from '@material-ui/core/InputBase';
import { fade } from '@material-ui/core/styles/colorManipulator';

const uuidv4 = require('uuid/v4');
const redTheme = createMuiTheme({ palette: { primary: red } })

const testTags = [
    'comedy',
    'movie',
    'food',
    'raffle',
    'caps',
    'performance',
];

function getModalStyle() {
    const top = 50
    const left = 50
  
    return {
      top: `${top}%`,
      left: `${left}%`,
      transform: `translate(-${top}%, -${left}%)`,
    };
  }
  
  const styles = theme => ({
    paper: {
      position: 'absolute',
      width: theme.spacing.unit * 50,
      backgroundColor: theme.palette.background.paper,
      boxShadow: theme.shadows[5],
      padding: theme.spacing.unit * 4,
      outline: 'none',
    },
  });

class CurrentEvents extends Component {

    state = {
        events: [],
        editing: false,
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
        isInitial: true
    }
    listener = null;

    handleBeginEdit = () => {
        this.handleClose();
        this.setState({ editing: true });
    };

    handleDelete = () => {
        this.setState({ editing: false });
        let event = this.state.popUpEvent;
        firebase.database.ref('/current-events').child(event["key"]).remove();
        var firebaseStorageRef = firebase.storage.ref("Images");
        if (event["imgid"] != "default") {
            firebaseStorageRef.child(event["imgid"] + ".jpg").delete();
        }
        let newEvents = this.arrayRemove(this.state.events, this.state.popUpEvent);
        this.state.urls.splice(this.state.index, 1);
        this.setState({ events: newEvents, openDelete: false });
    }
    
    arrayRemove(arr, value) {
        return arr.filter(function(ele){
            return ele != value;
        });
     }
     
    handleDeleteClose = () => {
        this.setState({ openDelete: false });
    }

    handleDeleteOpen = () => {
        this.setState({ openDelete: true });
    }

    handleSaveEdit = () => {
        this.setState({ editing: false });
        let event = this.state.popUpEvent;
        let self = this;
        if (this.state.image64 != this.state.image64Old) {
            this.setState({ uploading: true });
            self.displayMessage(self, "Uploading Image...");
            var firebaseStorageRef = firebase.storage.ref("Images");
            const id = uuidv4();
            const imageRef = firebaseStorageRef.child(id + ".jpg");
            const oldId = event["imgid"];
            this.handleEventChange("imgid", id);

            const i = this.state.image64.indexOf('base64,');
            const buffer = Buffer.from(this.state.image64.slice(i + 7), 'base64');
            const file = new File([buffer], id);

            imageRef.put(file).then(function(){
                return imageRef.getDownloadURL();
            }).then(function(url){
                let images = self.state.urls;
                images[self.state.index] = url;
                self.setState({urls: images});
                self.pushEvent(self, event);
                if (oldId != "default") {
                    firebaseStorageRef.child(oldId + ".jpg").delete();
                }
            }).catch(function(error){
                console.log(error);
                self.displayMessage(self, "Error Uploading Image");
            });
        } else {
            self.pushEvent(self, event);
        }
    };

    handleCloseEdit = () => {
        let revertEvents = this.state.events;
        revertEvents[this.state.index] = this.state.oldEvent;
        this.setState({ editing: false, events: revertEvents });
    }

    pushEvent(self, event) {
        firebase.database.ref('/current-events').child(event["key"]).set({
            name: event["name"],
            startDate: event["startDate"],
            duration: parseInt(event["duration"]),
            location: event["location"],
            organization: event["organization"],
            imgid: event["imgid"],
            description: event["description"],
            tags: event["tags"],
        });
        self.setState({ uploading: false });
        self.displayMessage(self, "Event Updated");
    }

    displayMessage(self, message) {
        self.handleClose();
        self.setState({ message: message });
        self.handleOpen();
    }

    handleOpen = () => {
        this.setState({ open: true });
    };
    
    handleClose = (event, reason) => {
        if (reason === 'clickaway') {
          return;
        }
        this.setState({ open: false });
    };

    readCurrentEvents() {
        let self = this;
        let listEvents = [];
        let listURLS = [];
        this.listener = firebase.database.ref('/current-events').orderByChild('name');
        this.listener.on('value', function(snapshot) {
            listEvents = [];
            listURLS = self.state.urls;
            let index = -1;
            snapshot.forEach(function(childSnapshot) {
                let event = childSnapshot.val();
                event["key"] = childSnapshot.key;
                listEvents.push(event);
                index = index + 1;
                self.getImage(self, index, snapshot, childSnapshot, listEvents, listURLS);
            });
            if (snapshot.numChildren() === 0 && self.state.isInitial) {
                self.setState({ hidden: "hidden", message: "No Events Found", open: true })
            }
            self.setState({ isInitial: false });
        });
    }

    getImage(self, index, snapshot, childSnapshot, listEvents, listURLS) {
        firebase.storage.ref('Images').child(childSnapshot.child('imgid').val() + '.jpg').getDownloadURL().then((url) => {    
            listURLS[index] = url;
            console.log(index);
            if (snapshot.numChildren() == listURLS.length) {
                self.setState({ events: listEvents, originalEvents: listEvents, urls: listURLS, originalURLS: listURLS, hidden: "hidden" });
            }
          }).catch((error) => {
            // Handle any errors
          });
    }

    componentDidMount() {
        this.readCurrentEvents();
    }

    componentWillUnmount() {
        this.listener.off();
    }

    editAction(event, i) { 
        console.log('Editing: ' + event["name"]);
        let tags = event["tags"].split(',');
        if (tags[0] == '') {
            tags = []
        }
        let date = this.getFormattedDate(event);
        let oldEvent = Object.assign({}, event);
        this.setState({ oldEvent: oldEvent, popUpEvent: event, tags: tags, date: date, index: i, image64: this.state.urls[i], image64Old: this.state.urls[i] });
        this.handleBeginEdit();
    }

    handleNameChange = e => {
        this.handleEventChange("name", e.target.value);
    };

    handleDateChange = e => {
        // Adding leading 0s
        let date = new Date(e);
        var month = (1 + date.getMonth()).toString();
        month = month.length > 1 ? month : '0' + month;
        var day = date.getDate().toString();
        day = day.length > 1 ? day : '0' + day;
        var hours = date.getHours().toString();
        hours = hours.length > 1 ? hours : '0' + hours;
        var minutes = date.getMinutes().toString();
        minutes = minutes.length > 1 ? minutes : '0' + minutes;
        let startDate = month + '-' + day + '-' + date.getFullYear() + " " + hours + ":" + minutes;
        this.handleEventChange("startDate", startDate);
        this.setState({date: date});
    };

    handleDurationChange = e => {
        this.handleEventChange("duration", e.target.value);
    };

    handleLocationChange = e => {
        this.handleEventChange("location", e.target.value);
    };

    handleOrganizationChange = e => {
        this.handleEventChange("organization", e.target.value);
    };

    handleTagChange = e => {
        this.handleEventChange("tags", e.target.value.toString());
        this.setState({ tags: e.target.value });
    };

    handleDescriptionChange = e => {
        this.handleEventChange("description", e.target.value);
    };

    handleEventChange(key, value) {
        let newEvents = this.state.events;
        let event = newEvents[this.state.index];
        event[key] = value;
        newEvents[this.state.index] = event;
        this.setState({events: newEvents});
    }

    handleSearchChange = e => {
        var index = 0;
        let filtered = [];
        let urls = [];
        let oldURLS = this.state.originalURLS;
        this.state.originalEvents.forEach(function(event) {
            if (event["name"].toLowerCase().includes(e.target.value.toLowerCase()) || event["location"].toLowerCase().includes(e.target.value.toLowerCase()) || 
            event["organization"].toLowerCase().includes(e.target.value.toLowerCase()) || event["tags"].toLowerCase().includes(e.target.value.toLowerCase())) {
                filtered.push(event);
                urls.push(oldURLS[index]);
            }
            index = index + 1;
        });
        this.setState({ events: filtered, urls: urls });
    };

    getFormattedDate(event) {
        let arr = event["startDate"].split(' ');
        let arr2 = arr[0].split('-');
        let arr3 = arr[1].split(':');
        let date = new Date(arr2[2] + '-' + arr2[0] + '-' + arr2[1] + 'T' + arr3[0] + ':' + arr3[1] + '-05:00');
        return date;
    }

    render() {
        const { classes } = this.props;
        const children = [];

        for (var i = 0; i < this.state.events.length; i += 1) {
            let event = this.state.events[i];
            let index = i;
            let date = this.getFormattedDate(event);
            var month = (1 + date.getMonth()).toString();
            month = month.length > 1 ? month : '0' + month;
            var day = date.getDate().toString();
            day = day.length > 1 ? day : '0' + day;
            var hours = date.getHours().toString();
            hours = hours.length > 1 ? hours : '0' + hours;
            var minutes = date.getMinutes().toString();
            minutes = minutes.length > 1 ? minutes : '0' + minutes;
            let startDate = month + '-' + day + '-' + date.getFullYear() + " " + hours + ":" + minutes;
            date.setMilliseconds(date.getMilliseconds() + (event["duration"] * 60000));
            hours = date.getHours().toString();
            hours = hours.length > 1 ? hours : '0' + hours;
            minutes = date.getMinutes().toString();
            minutes = minutes.length > 1 ? minutes : '0' + minutes;
            let fullDate = startDate + "-" + hours + ":" + minutes;
            children.push(<ChildComponent key={i} name={event["name"]} date={fullDate} location={'Location: ' + event["location"]} 
            organization={'Organization: ' + event["organization"]} description={'Description: ' + event["description"]} tags={'Tags: ' + event["tags"]} image={this.state.urls[index]}
            editAction={() => this.editAction(event, index)} />);
        };

        const styles = theme => ({
            search: {
              position: 'relative',
              borderRadius: theme.shape.borderRadius,
              backgroundColor: fade(theme.palette.common.white, 0.15),
              '&:hover': {
                backgroundColor: fade(theme.palette.common.white, 0.25),
              },
              marginLeft: 0,
              width: '100%',
              [theme.breakpoints.up('sm')]: {
                marginLeft: theme.spacing.unit,
                width: 'auto',
              },
            },
            searchIcon: {
              width: theme.spacing.unit * 9,
              height: '100%',
              position: 'absolute',
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            },
            inputRoot: {
              color: 'inherit',
              width: '100%',
            },
            inputInput: {
              paddingTop: theme.spacing.unit,
              paddingRight: theme.spacing.unit,
              paddingBottom: theme.spacing.unit,
              paddingLeft: theme.spacing.unit * 10,
              transition: theme.transitions.create('width'),
              width: '100%',
              [theme.breakpoints.up('sm')]: {
                width: 120,
                '&:focus': {
                  width: 200,
                },
              },
            },
          });

        return (
            <div>
                <div style={{position: "absolute", top: "50%", left: "50%", margintop: "-50px", marginleft: "-50px", width: "100px", height: "100px"}}>
                <CircularProgress style={{visibility: this.state.hidden}}></CircularProgress>
            </div>
            <div style={{marginBottom: 20}}>
            <SearchIcon />
            <InputBase
              placeholder="Search…"
              onChange={this.handleSearchChange}
            />
            </div>
                <ParentComponent>
                    {children}
                </ParentComponent>
                <Dialog
          onClose={this.handleCloseEdit}
          aria-labelledby="customized-dialog-title"
          open={this.state.editing}
        >
          <DialogTitle id="customized-dialog-title" onClose={this.handleCloseEdit}>
            Edit Event
          </DialogTitle>
          <DialogContent>
          <MuiPickersUtilsProvider utils={MomentUtils}>
                <Grid container>
                    <Grid item container direction="column" spacing={0}>
                        <Grid item>
                            <TextField
                                    label="Event Title"
                                    id="event-name"
                                    margin="normal"
                                    value={this.state.popUpEvent["name"]}
                                    onChange={this.handleNameChange} />                        
                        </Grid>
                        <Grid item>
                            <DatePicker
                                margin="normal"
                                label="Start Date"
                                value={this.state.date}
                                onChange={this.handleDateChange} />
                        </Grid>
                        <Grid item>
                            <TimePicker
                                margin="normal"
                                label="Start Time"
                                value={this.state.date}
                                onChange={this.handleDateChange} />
                        </Grid>
                        <Grid item>
                            <TextField
                                id="event-dur"
                                label="Duration (minutes)"
                                margin="normal"
                                value={this.state.popUpEvent["duration"]}
                                type="number"
                                onChange={this.handleDurationChange} />
                        </Grid>
                        <Grid item>
                            <TextField
                                id="event-org"
                                label="Location"
                                margin="normal"
                                value={this.state.popUpEvent["location"]}
                                onChange={this.handleLocationChange} />
                        </Grid>
                        <Grid item>
                            <TextField
                                id="event-org"
                                label="Organization"
                                margin="normal"
                                value={this.state.popUpEvent["organization"]}
                                onChange={this.handleOrganizationChange} />
                        </Grid>
                        <Grid item container direction="row">
                            <FormControl>
                                <InputLabel htmlFor="select-multiple">Tags</InputLabel>
                                <Select
                                    multiple
                                    displayEmpty
                                    input={<Input id="select-multiple"/>}
                                    value={this.state.tags}
                                    onChange={this.handleTagChange}
                                    variant='outlined'
                                    style={{minWidth: '150px',maxWidth: '150px'}}
                                    >
                                    <MenuItem disabled value="">
                                        <em>Select Tags</em>
                                    </MenuItem>
                                    {testTags.map(tag => (
                                        <MenuItem key={tag} value={tag}>
                                            {tag}
                                        </MenuItem>
                                    ))}    
                                </Select>
                            </FormControl>
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
                                onChange={this.handleDescriptionChange} />
                        </Grid>
                        <Grid item>
                        <ImagePicker
                            extensions={['jpg', 'jpeg', 'png']}
                            dims={{minWidth: 100, maxWidth: 10000, minHeight: 100, maxHeight: 10000}}
                            maxSize={10}
                            onChange={base64 => this.setState({ image64: base64 })}
                            onError={errMsg => this.displayMessage(this, errMsg)} >
                            <Button variant="contained">
                                Select Image    
                            </Button>
                            </ImagePicker>
                        </Grid>
                        <Grid item>
                        <Image
                            style={{width: 192, height: 108}}
                            source={{uri: this.state.image64}}
                            />
                        </Grid>
                    </Grid>
                </Grid>
                </MuiPickersUtilsProvider>
          </DialogContent>
          <DialogActions style={{justifyContent: 'center'}}>
          <MuiThemeProvider theme={redTheme}>
          <Button variant="contained" onClick={this.handleDeleteOpen} color="primary">
              Delete Event
              <DeleteIcon/>
            </Button>
            </MuiThemeProvider>
          <Button variant="contained" onClick={this.handleSaveEdit} color="primary">
              Save Changes
              <SaveIcon/>
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          open={this.state.openDelete}
          onClose={this.handleDeleteClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">{"Are you sure you want to delete the event?"}</DialogTitle>
          <DialogActions>
            <Button onClick={this.handleDeleteClose} color="primary">
              Cancel
            </Button>
            <MuiThemeProvider theme={redTheme}>
            <Button onClick={this.handleDelete} color="primary" autoFocus>
              Confirm
            </Button>
            </MuiThemeProvider>
          </DialogActions>
        </Dialog>
        <Snackbar
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                    open={this.state.open}
                    autoHideDuration={6000}
                    onClose={this.handleClose}
                    ContentProps={{
                        'aria-describedby': 'message-id',
                    }}
                    message={this.state.message}
                action={[
                    <Button
                        key="close"
                        aria-label="Close"
                        color="inherit"
                        onClick={this.handleClose}
                        > X
                    </Button>,
                ]}
                />
            </div> 
        );
    }
}

const ParentComponent = props => (
    <div>
      <Grid container id="children-pane" direction="row" spacing={8}>
        {props.children}
      </Grid>
    </div>
);
  
const ChildComponent = props => <Grid item><Card style={{minWidth: 350, maxWidth: 350, height: "auto"}}><CardActionArea onClick={props.editAction}>
    <CardHeader title={props.name} subheader={props.date}></CardHeader>
    <CardMedia style = {{ height: 0, paddingTop: '56.25%'}} image={props.image} title={props.name}/><CardContent>
    <Typography component="p">{props.location}<br/>{props.organization}<br/>{props.tags}<br/>{props.description}</Typography></CardContent></CardActionArea></Card></Grid>;

export default CurrentEvents;