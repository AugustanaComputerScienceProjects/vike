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
import Typography from '@material-ui/core/Typography';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import { db, storage, Firebase } from './config';
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
        tags: [],
        date: new Date(),
        uploading: false,
        image64: null,
        urls: [],
        index: -1
    }

    handleBeginEdit = () => {
        this.setState({ editing: true });
    };

    handleDelete = () => {
        this.setState({ editing: false });
        let event = this.state.popUpEvent;
        db.ref('/current-events').child(event["key"]).remove();
        var firebaseStorageRef = storage.ref("Images");
        if (event["imgid"] != "default") {
            firebaseStorageRef.child(event["imgid"] + ".jpg").delete();
        }
        let newEvents = this.arrayRemove(this.state.events, this.state.popUpEvent);
        this.setState({events: newEvents});
        let newURLs = this.arrayRemove(this.state.urls, this.state.urls[this.state.index]);
        this.setState({urls: newURLs});
    }
    
    arrayRemove(arr, value) {
        return arr.filter(function(ele){
            return ele != value;
        });
     }
     

    handleStopEdit = () => {
        this.setState({ editing: false });
        let event = this.state.popUpEvent;
        let self = this;
        if (this.state.image64 != null) {
            this.setState({ uploading: true });
            self.displayMessage(self, "Uploading Image");
            var firebaseStorageRef = storage.ref("Images");
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

    pushEvent(self, event) {
        db.ref('/current-events').child(event["key"]).set({
            name: event["name"],
            startDate: event["startDate"],
            duration: event["duration"],
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
        db.ref('/current-events').once('value').then(function(snapshot) {
            let index = 0;
            snapshot.forEach(function(childSnapshot) {
                storage.ref('Images').child(childSnapshot.child('imgid').val() + '.jpg').getDownloadURL().then((url) => {
                    index = index + 1;
                    let event = childSnapshot.val();
                    event["key"] = childSnapshot.key;
                    listEvents.push(event);
                    listURLS.push(url);
                    if (snapshot.numChildren() == index) {
                        self.setState({ events: listEvents, urls: listURLS });
                    }
                  }).catch((error) => {
                    // Handle any errors
                  })
            });
        });
    }

    componentDidMount() {
        this.readCurrentEvents();
    }

    editAction(event, i) { 
        console.log('Editing: ' + event["name"]);
        let tags = event["tags"].split(',');
        if (tags[0] == '') {
            tags = []
        }
        this.setState({ popUpEvent: event, tags: tags, date: new Date(event["startDate"]), index: i, image64: null });
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
        this.setState({date: startDate});
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
        let event = this.state.popUpEvent;
        event[key] = value;
        this.setState({popUpEvent: event});
    }

    render() {
        const { classes } = this.props;
        const children = [];

        for (var i = 0; i < this.state.events.length; i += 1) {
            let event = this.state.events[i];
            let index = i;
            let date = new Date(event["startDate"]);
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
            organization={'Organization: ' + event["organization"]} description={'Description: ' + event["description"]} tags={'Tags: ' + event["tags"]} image={this.state.urls[i]}
            editAction={() => this.editAction(event, index)} />);
        };

        return (
            <div>
                <ParentComponent>
                    {children}
                </ParentComponent>
                <Dialog
          onClose={this.handleStopEdit}
          aria-labelledby="customized-dialog-title"
          open={this.state.editing}
        >
          <DialogTitle id="customized-dialog-title" onClose={this.handleStopEdit}>
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
                            <FormControl className="selects">
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
                            <Button variant="contained"
                                className="get-image">
                                Select Image    
                            </Button>
                            </ImagePicker>
                        </Grid>
                    </Grid>
                </Grid>
                </MuiPickersUtilsProvider>
          </DialogContent>
          <DialogActions style={{justifyContent: 'center'}}>
          <MuiThemeProvider theme={redTheme}>
          <Button variant="contained" onClick={this.handleDelete} color="primary">
              Delete Event
              <DeleteIcon/>
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
    <div className="card calculator">
      <Grid container id="children-pane" direction="row" spacing={8}>
        {props.children}
      </Grid>
    </div>
);
  
const ChildComponent = props => <Grid item><Card style={{maxWidth: 400}}><CardActionArea onClick={props.editAction}>
    <CardHeader title={props.name} subheader={props.date}></CardHeader>
    <CardMedia style = {{ height: 0, paddingTop: '56.25%'}} image={props.image} title={props.name}/><CardContent>
    <Typography component="p">{props.location}<br/>{props.organization}<br/>{props.description}<br/>{props.tags}</Typography></CardContent></CardActionArea></Card></Grid>;

export default CurrentEvents;