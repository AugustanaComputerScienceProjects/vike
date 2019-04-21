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
import { db, storage, Firebase } from './config';
import Snackbar from '@material-ui/core/Snackbar';  
import { ImagePicker } from 'react-file-picker'
import { View, Image } from 'react-native';

const uuidv4 = require('uuid/v4');

const testTags = [
    'comedy',
    'movie',
    'food',
    'raffle',
    'caps',
    'performance',
];

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
        image64: null,
    };

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
        if (this.state.image64 != null) {
            this.setState({ uploading: true });
            self.displayMessage(self, "Uploading Image");
            var firebaseStorageRef = storage.ref(ref);
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
                self.pushEvent(self);
            }).catch(function(error){
                console.log(error);
                self.displayMessage(self, "Error Uploading Image");
            });
        } else {
            self.pushEvent(self);
        }
    }

    // Push event to Firebase
    pushEvent(self) {
        // Adding leading 0s
        var month = (1 + self.state.date.getMonth()).toString();
        month = month.length > 1 ? month : '0' + month;
        var day = self.state.date.getDate().toString();
        day = day.length > 1 ? day : '0' + day;
        var hours = self.state.date.getHours().toString();
        hours = hours.length > 1 ? hours : '0' + hours;
        var minutes = self.state.date.getMinutes().toString();
        minutes = minutes.length > 1 ? minutes : '0' + minutes;
        db.ref('/current-events').push({
            name: self.state.name,
            startDate: month + '-' + day + '-' + self.state.date.getFullYear() + " " + hours + ":" + minutes,
            duration: self.state.duration,
            location: self.state.location,
            organization: self.state.organization,
            imgid: self.state.picId,
            description: self.state.description,
            tags: self.state.tags.toString(),
        });
        self.resetState(self);
        self.setState({ uploading: false });
        self.displayMessage(self, "Event Added");
    }

    submitAction = event => {
        // Check inputs
        if (this.state.name != '' && this.state.location != '' && this.state.organization != '' && this.state.duration != '') {
            this.saveImage('Images', this.state.image64);
        } else {
            alert("Required fields are not filled in.");
        }
    };

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
            message: '',
            image64: null,
        });
    }

    displayMessage(self, message) {
        self.handleClose();
        self.setState({ message: message });
        self.handleOpen();
    }

    render() {
        return (
            <div>
                <MuiPickersUtilsProvider utils={MomentUtils}>
                <Grid container>
                    <Grid item container direction="column" spacing={8}>
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
                            <TextField
                                id="event-org"
                                label="Organization"
                                margin="normal"
                                value={this.state.organization}
                                onChange={e => this.setState({ organization: e.target.value })}
                                />
                        </Grid>
                        <Grid item container direction="row">
                            <FormControl className="selects">
                                <InputLabel htmlFor="select-multiple">Tags</InputLabel>
                                <Select
                                    multiple
                                    displayEmpty
                                    input={<Input id="select-multiple"/>}
                                    value={this.state.tags}
                                    onChange={e => this.setState({ tags: e.target.value })}
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
                            <Paper style={{marginLeft: '20px'}}>QR Code</Paper>
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
                        <Grid item container direction="row" spacing={16}>
                        <Grid item>
                        <ImagePicker
                            extensions={['jpg', 'jpeg', 'png']}
                            dims={{minWidth: 100, maxWidth: 10000, minHeight: 100, maxHeight: 10000}}
                            onChange={base64 => this.setState({ image64: base64 })}
                            maxSize={10}
                            onError={errMsg => this.displayMessage(this, errMsg)} >
                            <Button variant="contained"
                                className="get-image"
                                disabled={this.state.uploading}>
                                Select Image    
                            </Button>
                            </ImagePicker>
                            <Button variant="contained"
                                color="primary"
                                className="create-event"
                                disabled={this.state.uploading}
                                onClick={this.submitAction}>
                                Add Event    
                            </Button>
                        </Grid>
                        <Image
                            style={{width: 200, height: 200}}
                            source={{uri: this.state.image64}}
                            />
                        </Grid>
                    </Grid>
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
        );
    }
}

export default AddEvent;