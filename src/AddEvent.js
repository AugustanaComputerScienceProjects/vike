import React, { Component, useState } from 'react';
import './App.css';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import {MuiPickersUtilsProvider, TimePicker, DatePicker} from 'material-ui-pickers';
import MomentUtils from '@date-io/moment';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import firebase from './config';
import Snackbar from '@material-ui/core/Snackbar';  
import { FilePicker } from 'react-file-picker'
//import { View, Image } from 'react-native';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Typography from '@material-ui/core/Typography';
import defaultImage from './default.jpg';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Resizer from 'react-image-file-resizer';

// File for the Add Event Screen

var QRCode = require('qrcode');

const uuidv4 = require('uuid/v4');

class AddEvent extends Component {
    state = {
        open: false,
        name: '',
        date: new Date(),
        duration: '',
        location: '',
        organization: '',
        tags: [],
        description: '',
        webLink: '',
        picId: 'default',
        uploading: false,
        message: 'Event Added',
        image64: defaultImage,
        submitBtnText: "Request Event",
        uid: "",
        qrChecked: false,
        qrDisabled: true,
        databaseTags: [],
        groups: [],
    };

    listeners = [];

    // Component will unmount, turn of the Firebase listeners
    componentWillUnmount() {
        this.listeners.forEach(function(listener) {
            listener.off();
        });
    }

    // Handle opening of the Snackbar
    handleOpen = () => {
        this.setState({ open: true });
    };
    
    // Handle closing of the Snackbar
    handleClose = (event, reason) => {
        if (reason === 'clickaway') {
          return;
        }
        this.setState({ open: false });
    };
    
    // Handle changing of the event for the date/time pickers
    handleDateChange = event => {
        this.setState({ date: new Date(event) });
    };

    // Save image to Firebase
    saveImage(ref, image, imageName, onSuccess, onError) {
        let self = this;
        if (this.state.image64 != defaultImage) {
            this.setState({ uploading: true });
            self.displayMessage(self, "Uploading Image...");
            var firebaseStorageRef = firebase.storage.ref(ref);
            const id = uuidv4();
            const imageRef = firebaseStorageRef.child(id + ".jpg");
            this.setState({ picId: id }); 

            const i = image.indexOf('base64,');
            const buffer = Buffer.from(image.slice(i + 7), 'base64');
            const file = new File([buffer], id);

            imageRef.put(file).then(function(){
                return imageRef.getDownloadURL();
            }).then(function(url){
                console.log(url);
                self.submitEvent(self);
            }).catch(function(error){
                console.log(error);
                self.displayMessage(self, "Error Uploading Image");
            });
        } else {
            self.submitEvent(self);
        }
    }

    // Check authorization and add to Firebase 
    submitEvent(self) {
        if (self.state.adminSignedIn) {
            self.pushEvent(self, '/current-events', "Event Added");
        } else if (self.state.leaderSignedIn) {
            self.pushEvent(self, '/pending-events/', "Event Requested");
        }
    }

    // Push event to Firebase
    pushEvent(self, ref, message) {
        let name = self.state.name;
        // Adding leading 0s
        var month = (1 + self.state.date.getMonth()).toString();
        month = month.length > 1 ? month : '0' + month;
        var day = self.state.date.getDate().toString();
        day = day.length > 1 ? day : '0' + day;
        var hours = self.state.date.getHours().toString();
        hours = hours.length > 1 ? hours : '0' + hours;
        var minutes = self.state.date.getMinutes().toString();
        minutes = minutes.length > 1 ? minutes : '0' + minutes;
        var newRef = firebase.database.ref(ref).push({
            name: name,
            startDate: self.state.date.getFullYear() + '-' + month + '-' + day + " " + hours + ":" + minutes,
            duration: parseInt(self.state.duration),
            location: self.state.location,
            organization: self.state.organization,
            imgid: self.state.picId,
            description: self.state.description,
            webLink: self.state.webLink,
            tags: self.state.tags.toString(),
            email: self.state.email
        }).then((snap) => {
            if (this.state.qrChecked) {
                self.downloadQR(snap.key, name);
            }
        });
        self.resetState(self);
        self.setState({ uploading: false });
        self.displayMessage(self, message);
    }

    // Download the QR code as a jpg
    downloadQR(key, name) {
        QRCode.toDataURL('https://osl-events-app.firebaseapp.com/event?id=' + key + '&name=' + name.replaceAll(" ", "+"), function (err, url) {
            console.log(url)
            var link = document.createElement('a');
            link.href = url;
            link.download = name + '-QR Code.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);    
        });
    }

    // Add event button action
    submitAction = event => {
        // Check inputs
        if (this.state.name != '' && this.state.location != '' && this.state.organization != '' && this.state.duration != '') {
            this.saveImage('Images', this.state.image64);
        } else {
            alert("Required fields are not filled in.");
        }
    };

    // Handle changing of the image file
    handleImageFileChanged = theFile => {
        //https://www.npmjs.com/package/react-image-file-resizer
        Resizer.imageFileResizer(
            theFile,
            300,
            300,
            'JPEG',
            95, // compression quality
            0, // no rotation
            uri => {
                this.setState({ image64: uri })
            },
            'base64'
        );
    }

    // Toggle checking of the "Downlod QR Code" Checkbox
    toggleChecked = () => {
        this.setState({qrChecked: !this.state.qrChecked});
    }

    // Resets the state after adding/requesting an event
    resetState(self) {
        self.setState({
            open: false,
            name: '',
            date: new Date(),
            duration: '',
            location: '',
            organization: '',
            tags: [],
            description: '',
            webLink: '',
            picId: 'default',
            uploading: false,
            message: 'Event Added',
            image64: defaultImage,
        });
    }

    // Display a message using the Snackbar
    displayMessage(self, message) {
        self.handleClose();
        self.setState({ message: message });
        self.handleOpen();
    }

    // Checks what role the current user signed in has
    checkRole(user, role) {
        let self = this;
        firebase.database.ref(role).once('value').then(function(snapshot) {
            if (snapshot.hasChild(user.email.replace('.', ','))) {
                if (role === 'admin') {
                    self.setState({ adminSignedIn: true, submitBtnText: "Add Event", uid: user.uid, email: user.email, qrChecked: true, qrDisabled: false });
                    self.readAllGroups();
                } else if (role === 'leaders' && !self.state.adminSignedIn) {
                    self.setState({ leaderSignedIn: true, submitBtnText: "Request Event", uid: user.uid, email: user.email });
                    self.readLeaderGroups();
                }
            }
          });
    }

    // Reads the tags from Firebase and sets the tags list
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

      // Reads the groups from Firebase and sets the groups list
      readAllGroups() {
        let self = this;
        let ref = firebase.database.ref('/groups');
        this.listeners.push(ref);
        ref.on('value', function(snapshot) {
          let groupsList = [];
          snapshot.forEach(function(child) {
            groupsList.push(child.val());
          });
          self.setState({ groups: groupsList });
          console.log('Groups List: ' + groupsList);
        });
      }

      readLeaderGroups() {
        let self = this;
        let email = firebase.auth.currentUser.email;
        let ref = firebase.database.ref('/leaders').child(email.replace('.', ',')).child('groups');
        ref.on('value', function(snapshot) {
            let myGroups = [];
            snapshot.forEach(function(child) {
                myGroups.push(child.key);
            });
            self.setState({groups: myGroups});
        });
      }

    // Component will mount - read tags, groups, auth listener
    componentWillMount() {
        this.readTags();
        firebase.auth.onAuthStateChanged((user) => {
          if (user) {
              this.checkRole(user, 'admin');
              this.checkRole(user, 'leaders');
          } else {
            this.setState({ adminSignedIn: false });  
          }
        });
    }

    // Render the page
    render() {
        const { classes } = this.props;
        const child = [];
        
        // Format Date - display preview
        let date = new Date(this.state.date);
        var month = (1 + date.getMonth()).toString();
        month = month.length > 1 ? month : '0' + month;
        var day = date.getDate().toString();
        day = day.length > 1 ? day : '0' + day;
        var hours = date.getHours().toString();
        hours = hours.length > 1 ? hours : '0' + hours;
        var minutes = date.getMinutes().toString();
        minutes = minutes.length > 1 ? minutes : '0' + minutes;
        let startDate = month + '-' + day + '-' + date.getFullYear() + " " + hours + ":" + minutes;
        date.setMilliseconds(date.getMilliseconds() + (this.state.duration * 60000));
        hours = date.getHours().toString();
        hours = hours.length > 1 ? hours : '0' + hours;
        minutes = date.getMinutes().toString();
        minutes = minutes.length > 1 ? minutes : '0' + minutes;
        let fullDate = startDate + "-" + hours + ":" + minutes;
        child.push(<ChildComponent key={0} name={this.state.name} date={fullDate} location={'Location: ' + this.state.location} 
        organization={'Group: ' + this.state.organization} description={'Description: ' + this.state.description} tags={'Tags: ' + this.state.tags} image={this.state.image64} />);
        
        return (
            <div style={{textAlign: "center"}}>
            <div style={{display: "inline-block"}}>
                <MuiPickersUtilsProvider utils={MomentUtils}>
                <Grid container>
                    <Grid item container direction="column" spacing={8} style={{width: 200}}>
                        <Grid item><label style={{fontSize: 20}}>Add Event</label></Grid>
                        <Grid item>
                            <TextField
                                    label="Event Title"
                                    id="event-name"
                                    margin="normal"
                                    value={this.state.name}
                                    onChange={e => this.setState({ name: e.target.value })} />                 
                        </Grid>
                        <Grid item>
                            <DatePicker
                                margin="normal"
                                label="Start Date"
                                value={this.state.date}
                                onChange={this.handleDateChange}
                                />
                        </Grid>
                        <Grid item>
                            <TimePicker
                                margin="normal"
                                label="Start Time"
                                value={this.state.date}
                                onChange={this.handleDateChange}
                                />
                        </Grid>
                        <Grid item>
                            <TextField
                                id="event-dur"
                                label="Duration (minutes)"
                                margin="normal"
                                value={this.state.duration}
                                type="number"
                                onChange={e => this.setState({ duration: e.target.value })}
                                />
                        </Grid>
                        <Grid item>
                            <TextField
                                id="event-org"
                                label="Location"
                                margin="normal"
                                value={this.state.location}
                                onChange={e => this.setState({ location: e.target.value })}
                                />
                        </Grid>
                        <Grid item>
                            <FormControl margin="normal">
                                <InputLabel>Group</InputLabel>
                                <Select
                                    displayEmpty
                                    value={this.state.organization}
                                    style={{minWidth: 200, maxWidth: 200}}
                                    onChange={e => this.setState({ organization: e.target.value })}
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
                                id="event-link"
                                label="Web Link (Optional)"
                                margin="normal"
                                value={this.state.webLink}
                                onChange={e => this.setState({ webLink: e.target.value })}
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
                                value={this.state.description}
                                onChange={e => this.setState({ description: e.target.value })}
                                />
                        </Grid>
                        <Grid item>
                        <FilePicker
                            extensions={['jpg', 'jpeg', 'png']}
                            onChange={this.handleImageFileChanged}
                            onError={errMsg => this.displayMessage(this, errMsg)} >
                            <Button variant="contained"
                                disabled={this.state.uploading}>
                                Select Image    
                            </Button>
                            </FilePicker>
                        </Grid>
                        <Grid item>
                        <Button variant="contained"
                                color="primary"
                                disabled={this.state.uploading}
                                onClick={this.submitAction}>
                                {this.state.submitBtnText}    
                            </Button>
                        </Grid>
                    </Grid>
                    <div style={{marginTop: 50, marginLeft: 50}}>
                    <label style={{fontSize: 18}}>Preview:</label>
                    <ParentComponent style={{marginLeft: 50, width: 300, height: 400}}>
                        {child}
                    </ParentComponent>
                    <FormControlLabel
                    control={
                        <Checkbox
                            checked={this.state.qrChecked}
                            onChange={this.toggleChecked}
                            disabled={this.state.qrDisabled}
                            value="qrChecked"
                            color="primary"/>
                        }
                        label="Download QR Code" />
                    </div>
                </Grid>
                </MuiPickersUtilsProvider>
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
            </div>
        );
    }
}

export default AddEvent;

// Parent component for the preview
const ParentComponent = props => (
    <div>
      <Grid container id="children-pane" direction="row" spacing={8}>
        {props.children}
      </Grid>
    </div>
);
  
// Child component for the preview
const ChildComponent = props => <Grid item><Card style={{minHeight: 400, maxHeight: 400, minWidth: 300, maxWidth: 300}}>
    <CardHeader title={props.name} subheader={props.date}></CardHeader>
    <CardMedia style = {{ height: 0, paddingTop: '56.25%'}} image={props.image} title={props.name}/><CardContent>
    <Typography component="p">{props.location}<br/>{props.organization}<br/>{props.tags}<br/>{props.description}</Typography></CardContent></Card></Grid>;