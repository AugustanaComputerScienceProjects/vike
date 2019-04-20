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
import IconButton from '@material-ui/core/IconButton';
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
        open: false,
        popUpEvent: [],
        tags: [],
        date: new Date()
    }

    handleOpen = () => {
        this.setState({ open: true });
    };
    
    handleClose = () => {
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
                    listEvents.push(childSnapshot.val());
                    listURLS.push(url);
                    if (snapshot.numChildren() == index) {
                        self.setState({ events: listEvents, urls: listURLS });
                        console.log(listEvents);
                        console.log(listURLS);
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

    editAction(event) {
        console.log('Editing: ' + event["name"]);
        this.setState({ popUpEvent: event, tags: event["tags"].split(','), date: new Date(event["startDate"])});
        this.handleOpen();
    }

    handleDelete() {

    }

    render() {
        const { classes } = this.props;
        const children = [];

        for (var i = 0; i < this.state.events.length; i += 1) {
            let event = this.state.events[i];
            children.push(<ChildComponent key={i} name={event["name"]} date={event["startDate"] + " " + event["duration"]} location={'Location: ' + event["location"]} 
            organization={'Organization: ' + event["organization"]} description={'Description: ' + event["description"]} tags={'Tags: ' + event["tags"]} image={this.state.urls[i]}
            editAction={() => this.editAction(event)} />);
        };

        return (
            <div>
                <ParentComponent>
                    {children}
                </ParentComponent>
                <Dialog
          onClose={this.handleClose}
          aria-labelledby="customized-dialog-title"
          open={this.state.open}
        >
          <DialogTitle id="customized-dialog-title" onClose={this.handleClose}>
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
                                    value={this.state.popUpEvent["name"]} />                        
                        </Grid>
                        <Grid item>
                            <DatePicker
                                margin="normal"
                                label="Start Date"
                                value={this.state.date}
                                />
                        </Grid>
                        <Grid item>
                            <TimePicker
                                margin="normal"
                                label="Start Time"
                                value={this.state.date}
                                />
                        </Grid>
                        <Grid item>
                            <TextField
                                id="event-dur"
                                label="Duration (minutes)"
                                margin="normal"
                                value={this.state.popUpEvent["duration"]}
                                type="number"
                                />
                        </Grid>
                        <Grid item>
                            <TextField
                                id="event-org"
                                label="Location"
                                margin="normal"
                                value={this.state.popUpEvent["location"]}
                                />
                        </Grid>
                        <Grid item>
                            <TextField
                                id="event-org"
                                label="Organization"
                                margin="normal"
                                value={this.state.popUpEvent["organization"]}
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
                                />
                        </Grid>
                        <Grid item>
                        <ImagePicker
                            extensions={['jpg', 'jpeg', 'png']}
                            dims={{minWidth: 100, maxWidth: 10000, minHeight: 100, maxHeight: 10000}}
                            maxSize={10}
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
          <DialogActions>
          <Button onClick={this.handleDelete} color="primary">
              Delete Event
            </Button>
            <Button onClick={this.handleClose} color="primary">
              Save changes
            </Button>
          </DialogActions>
        </Dialog>
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