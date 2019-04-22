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
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Typography from '@material-ui/core/Typography';
import defaultImage from './default.jpg';

var QRCode = require('qrcode');

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
        image64: defaultImage,
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
        if (this.state.image64 != defaultImage) {
            this.setState({ uploading: true });
            self.displayMessage(self, "Uploading Image...");
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
        QRCode.toDataURL('I am a pony!', function (err, url) {
            console.log(url)
        })
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
            message: 'Event Added',
            image64: defaultImage,
        });
    }

    displayMessage(self, message) {
        self.handleClose();
        self.setState({ message: message });
        self.handleOpen();
    }

    componentDidMount() {
        let self = this;
        QRCode.toDataURL('Event URL', function (err, url) {
            console.log(url)
            self.setState({ qr64: url });
        })
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
        organization={'Organization: ' + this.state.organization} description={'Description: ' + this.state.description} tags={'Tags: ' + this.state.tags} image={this.state.image64} />);
        
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
                    </Grid>
                    <div style={{marginTop: 50, marginLeft: 50}}>
                    <label style={{fontSize: 18}}>Preview:</label>
                    <ParentComponent style={{marginLeft: 50, width: 300, height: 400}}>
                        {child}
                    </ParentComponent>
                    <div style={{marginTop: 20}}><Image style={{width: 200, height: 200}} source={{uri: this.state.qr64}}></Image></div>
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
    <div className="card calculator">
      <Grid container id="children-pane" direction="row" spacing={8}>
        {props.children}
      </Grid>
    </div>
);
  
const ChildComponent = props => <Grid item><Card style={{minHeight: 400, maxHeight: 400, minWidth: 300, maxWidth: 300}}>
    <CardHeader title={props.name} subheader={props.date}></CardHeader>
    <CardMedia style = {{ height: 0, paddingTop: '56.25%'}} image={props.image} title={props.name}/><CardContent>
    <Typography component="p">{props.location}<br/>{props.organization}<br/>{props.tags}<br/>{props.description}</Typography></CardContent></Card></Grid>;