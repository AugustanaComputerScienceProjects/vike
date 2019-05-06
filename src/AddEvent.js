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
import { ImagePicker } from 'react-file-picker'
import { View, Image } from 'react-native';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Typography from '@material-ui/core/Typography';
import defaultImage from './default.jpg';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';

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

    componentWillUnmount() {
        this.listeners.forEach(function(listener) {
            listener.off();
        });
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
            self.pushEvent(self, '/pending-events/' + self.state.uid, "Event Requested");
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
            startDate: month + '-' + day + '-' + self.state.date.getFullYear() + " " + hours + ":" + minutes,
            duration: parseInt(self.state.duration),
            location: self.state.location,
            organization: self.state.organization,
            imgid: self.state.picId,
            description: self.state.description,
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

    downloadQR(key, name) {
        QRCode.toDataURL('https://osl-events-app.firebaseapp.com/event?id=' + key + '&name=' + name.replaceAll(" ", "+"), function (err, url) {
            console.log(url)
            var link = document.createElement('a');
            link.href = url;
            link.download = name + '-QR Code.jpg';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);    
        });
    }

    submitAction = event => {
        // Check inputs
        if (this.state.name != '' && this.state.location != '' && this.state.organization != '' && this.state.duration != '') {
            this.saveImage('Images', this.state.image64);
        } else {
            alert("Required fields are not filled in.");
        }
    };

    toggleChecked = () => {
        this.setState({qrChecked: !this.state.qrChecked});
    }

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
            picId: 'default',
            uploading: false,
            message: 'Event Added',
            image64: defaultImage,
        });
    }

    displayMessage(self, message) {
        self.handleClose();
        self.setState({ message: message });
        self.handleOpen();
    }

    checkRole(user, role) {
        let self = this;
        firebase.database.ref(role).once('value').then(function(snapshot) {
            if (snapshot.hasChild(user.email.replace('.', ','))) {
                if (role === 'admin') {
                    self.setState({ adminSignedIn: true, submitBtnText: "Add Event", uid: user.uid, email: user.email, qrChecked: true, qrDisabled: false });
                } else if (role === 'leaders') {
                    self.setState({ leaderSignedIn: true, submitBtnText: "Request Event", uid: user.uid, email: user.email });
                }
            }
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

    componentWillMount() {
        this.readTags();
        this.readGroups();
        firebase.auth.onAuthStateChanged((user) => {
          if (user) {
              this.checkRole(user, 'admin');
              this.checkRole(user, 'leaders');
          } else {
            this.setState({ adminSignedIn: false });  
          }
        });
    }

    render() {
        const { classes } = this.props;
        const child = [];
        
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
                        <ImagePicker
                            extensions={['jpg', 'jpeg', 'png']}
                            dims={{minWidth: 100, maxWidth: 10000, minHeight: 100, maxHeight: 10000}}
                            onChange={base64 => this.setState({ image64: base64 })}
                            maxSize={10}
                            onError={errMsg => this.displayMessage(this, errMsg)} >
                            <Button variant="contained"
                                disabled={this.state.uploading}>
                                Select Image    
                            </Button>
                            </ImagePicker>
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

const ParentComponent = props => (
    <div>
      <Grid container id="children-pane" direction="row" spacing={8}>
        {props.children}
      </Grid>
    </div>
);
  
const ChildComponent = props => <Grid item><Card style={{minHeight: 400, maxHeight: 400, minWidth: 300, maxWidth: 300}}>
    <CardHeader title={props.name} subheader={props.date}></CardHeader>
    <CardMedia style = {{ height: 0, paddingTop: '56.25%'}} image={props.image} title={props.name}/><CardContent>
    <Typography component="p">{props.location}<br/>{props.organization}<br/>{props.tags}<br/>{props.description}</Typography></CardContent></Card></Grid>;