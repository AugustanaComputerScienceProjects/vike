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
import CloseIcon from '@material-ui/icons/Close';
import SortIcon from '@material-ui/icons/Sort';
import IconButton from '@material-ui/core/IconButton';
import SaveButton from '@material-ui/icons/SaveAlt'
import Divider from '@material-ui/core/Divider';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormLabel from '@material-ui/core/FormLabel';
import Switch from '@material-ui/core/Switch';
import DispatchGroup from './DispatchGroup';
var QRCode = require('qrcode');

const uuidv4 = require('uuid/v4');
const redTheme = createMuiTheme({ palette: { primary: red } });

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

    group = new DispatchGroup();
    token = null;

    state = {
        events: [],
        originalEvents: [],
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
        qrCode: null,
        index: -1,
        hidden: "visible",
        openDelete: false,
        sortMenu: "none",
        isInitial: true,
        searchText: '',
        sortBy: "date",
        isAscending: true,
        databaseTags: [],
        groups: [],
    }
    listeners = [];

    handleBeginEdit = () => {
        this.handleClose();
        this.setState({ editing: true });
        this.token = this.group.enter();
    };

    handleDelete = () => {
        this.setState({ editing: false });
        let event = this.state.popUpEvent;
        firebase.database.ref('/current-events').child(event["key"]).remove();
        var firebaseStorageRef = firebase.storage.ref("Images");
        if (event["imgid"] != "default") {
            firebaseStorageRef.child(event["imgid"] + ".jpg").delete();
        }
        this.setState({ openDelete: false });
        this.group.leave(this.token);
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
        this.group.leave(this.token);
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
            tags: self.state.tags.toString(),
            email: event["email"],
        });
        self.setState({ uploading: false });
        self.displayMessage(self, "Event Updated");
        this.group.leave(this.token);
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

    handleImageChange = base64 => {
        let split = base64.split(",");
        if (split.length > 0) {
            if (split[1].charAt(0) != "U") {
                this.setState({ image64: base64 })
            } else {
                this.displayMessage(this, "Can not use JPEG 2000 Images.");
            }   
        }
    }

    readCurrentEvents() {
        let self = this;
        let reference = firebase.database.ref('/current-events').orderByChild('name')
        this.listeners.push(reference);
        reference.on('value', function(snapshot) {
            let listEvents = [];
            let listURLS = [];
            let index = -1;
            snapshot.forEach(function(childSnapshot) {
                let event = childSnapshot.val();
                event["key"] = childSnapshot.key;
                listEvents.push(event);
                index = index + 1;
                self.getImage(self, index, snapshot, childSnapshot, listEvents, listURLS);
            });
            if (snapshot.numChildren() === 0) {
                self.group.notify(function() {
                    self.setState({ events: [], originalEvents: [], urls: [], originalURLS: [] });
                    if (self.state.isInitial) {
                        self.setState({ hidden: "hidden", message: "No Events Found", open: true});
                    }
                });
            }
            self.setState({ isInitial: false });
        });
    }

    getImage(self, index, snapshot, childSnapshot, listEvents, listURLS) {
        firebase.storage.ref('Images').child(childSnapshot.child('imgid').val() + '.jpg').getDownloadURL().then((url) => {    
            listURLS[index] = url;
            if (snapshot.numChildren() == listURLS.length) {
                self.group.notify(function() {
                    self.setState({ events: listEvents, originalEvents: listEvents, urls: listURLS, originalURLS: listURLS, hidden: "hidden" });
                    self.filterEvents(self.state.searchText, listEvents, listURLS);
                });
            }
          }).catch((error) => {
            // Handle any errors
          });
    }

    readTags() {
        let self = this;
        let ref = firebase.database.ref('/tags');
        this.listeners.push(ref);
        ref.on('value', function(snapshot) {
          let tagsList = [];
          snapshot.forEach(function(child) {
            tagsList.push(child.val());
          });
          self.setState({ databaseTags: tagsList});
          console.log(tagsList);
        })
      }

      readGroups() {
        let self = this;
        let ref = firebase.database.ref('/groups');
        this.listeners.push(ref);
        ref.on('value', function(snapshot) {
          let groupsList = [];
          snapshot.forEach(function(child) {
            groupsList.push(child.val());
          });
          self.setState({ groups: groupsList });
          console.log(groupsList);
        })
      }

    componentDidMount() {
        this.readTags();
        this.readGroups();
        this.readCurrentEvents();
    }

    componentWillUnmount() {
        this.listeners.forEach(function(listener) {
            listener.off();
        });
    }

    editAction(event, i) { 
        console.log('Editing: ' + event["name"]);
        let tags = event["tags"].split(',');
        if (tags[0] == '') {
            tags = []
        }
        let self = this;
        let date = this.getFormattedDate(event);
        let oldEvent = Object.assign({}, event);
        QRCode.toDataURL('https://osl-events-app.firebaseapp.com/event?id=' + event["key"] + '&name=' + event["name"].replaceAll(" ", "+"), function (err, url) {
            console.log(url)
            if (!self.state.groups.includes(event["organization"])) {
                self.state.groups.push(event["organization"]);
            }
            let eventTags = event["tags"].split(',');
            eventTags.forEach(function(tag) {
                if (!self.state.databaseTags.includes(tag) && tag != "") {
                    self.state.databaseTags.push(tag);
                }
            })
            self.setState({ oldEvent: oldEvent, popUpEvent: event, tags: tags, date: date, index: i, image64: self.state.urls[i], image64Old: self.state.urls[i], qrCode: url });
            self.handleBeginEdit();
        })
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
        this.setState({searchText: e.target.value});
        this.filterEvents(e.target.value, this.state.originalEvents, this.state.originalURLS);
    };

    handleClear = () => {
        this.setState({searchText: ""});
        this.filterEvents("", this.state.originalEvents, this.state.originalURLS);
    }

    handleSortOpenClose = () => {
        console.log("sorting");
        if (this.state.sortMenu === "block") {
            this.setState({sortMenu: "none"});
        } else {
            this.setState({sortMenu: "block"});
        }
    }

    handleSort = e => {
        this.setState({sortBy: e.target.value});
        this.sort(this.state.events, this.state.urls, e.target.value, this.state.isAscending);
    }

    sort(events, urls, sortBy, isAscending) {
        if (sortBy === "date") {
            this.sortArrays(events, urls, "startDate", isAscending);
        } else if (sortBy === "title") {
            this.sortArrays(events, urls, "name", isAscending);
        } else if (sortBy === "organization") {
            this.sortArrays(events, urls, "organization", isAscending);
        } 
    }

    sortArrays(events, urls, attribute, ascending) {
        var list = [];
        for (var j = 0; j < events.length; j++) {
            list.push({'event': events[j], 'url': urls[j]});
        }
        if (ascending) {
            list.sort(function(a, b) {
                return ('' + a.event[attribute]).localeCompare(b.event[attribute]);
            });
        } else {
            list.sort(function(a, b) {
                return ('' + b.event[attribute]).localeCompare(a.event[attribute]);
            });
        }
        for (var k = 0; k < list.length; k++) {
            events[k] = list[k].event;
            urls[k] = list[k].url;
        }
    }

    filterEvents(text, originalEvents, oldURLS) {
        var index = 0;
        let filtered = [];
        let urls = [];
        originalEvents.forEach(function(event) {
            if (event["name"].toLowerCase().includes(text.toLowerCase()) || event["location"].toLowerCase().includes(text.toLowerCase()) || 
            event["organization"].toLowerCase().includes(text.toLowerCase()) || event["tags"].toLowerCase().includes(text.toLowerCase())) {
                filtered.push(event);
                urls.push(oldURLS[index]);
            }
            index = index + 1;
        });
        this.sort(filtered, urls, this.state.sortBy, this.state.isAscending);
        this.setState({ events: filtered, urls: urls });
    }

    handleToggle = name => event => {
        this.setState({ [name]: event.target.checked });
        this.sort(this.state.events, this.state.urls, this.state.sortBy, event.target.checked);
    };

    downloadQR = () => {
        var link = document.createElement('a');
        link.href = this.state.qrCode;
        link.download = this.state.popUpEvent["name"] + '-QR Code.jpg';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);    
    }

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
            organization={'Group: ' + event["organization"]} description={'Description: ' + event["description"]} tags={'Tags: ' + event["tags"]} image={this.state.urls[index]}
            editAction={() => this.editAction(event, index)} />);
        };

        return (
            <div>
                <div style={{position: "fixed", top: "50%", left: "50%", margintop: "-50px", marginleft: "-50px", width: "100px", height: "100px"}}>
                <CircularProgress style={{visibility: this.state.hidden}}></CircularProgress>
            </div>
            <div style={{textAlign: "center", marginBottom: 20}}>
            <div style={{position: 'relative', display: "inline-block"}}>
            <Paper style={{padding: '2px 4px', display: "flex", alignItems: "center", width: 400}} elevation={1}>
            <SearchIcon style={{padding: 10}}/>
            <InputBase
                style={{width: 300}}
                placeholder="Search Events"   
                value={this.state.searchText}
                onChange={this.handleSearchChange} />
            <IconButton onClick={this.handleClear}><CloseIcon/></IconButton>
            <Divider style={{width: 1, height: 28, margin: 4}} />
            <IconButton onClick={this.handleSortOpenClose}><SortIcon/></IconButton>
            </Paper>
            </div>
            </div>
            <div style={{textAlign: "center", marginBottom: 20, display: this.state.sortMenu}}>
            <div style={{position: 'relative', display: "inline-block"}}>
            <Paper style={{padding: '2px 4px', display: "flex", alignItems: "center", width: 400}} elevation={1}>
            <FormControl component="fieldset" style={{paddingLeft: 10}}>
          <FormLabel component="legend" style={{paddingTop: 10}}>Sort By:</FormLabel>
          <FormControlLabel
          control={
            <Switch
              checked={this.state.isAscending}
              onChange={this.handleToggle('isAscending')}
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
                            <FormControl margin="normal">
                                <InputLabel>Group</InputLabel>
                                <Select
                                    displayEmpty
                                    value={this.state.popUpEvent["organization"]}
                                    style={{minWidth: 200, maxWidth: 200}}
                                    onChange={this.handleOrganizationChange}
                                    variant='outlined'
                                    >
                                    {this.state.groups.map(group => (
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
                                    input={<Input id="select-multiple"/>}
                                    value={this.state.tags}
                                    style={{minWidth: 200, maxWidth: 200}}
                                    onChange={e => this.setState({ tags: e.target.value })}
                                    variant='outlined'
                                    >
                                    <MenuItem disabled value="">
                                        <em>Select Tags</em>
                                    </MenuItem>
                                    {this.state.databaseTags.map(tag => (
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
                            onChange={this.handleImageChange}
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
                        <Grid item>
                        <Image
                            style={{width: 200, height: 200}}
                            source={{uri: this.state.qrCode}}
                            />
                        <Button variant="contained" onClick={this.downloadQR}><SaveButton/>Download QR</Button>
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