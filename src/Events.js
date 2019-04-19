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
import { db } from './config';
import Snackbar from '@material-ui/core/Snackbar';

const testTags = [
    'comedy',
    'movie',
    'food',
    'raffle',
    'caps',
    'performance',
];

class Events extends Component {
    state = {
        open: false,
        name: '',
        date: new Date(),
        duration: '',
        location: '',
        organization: '',
        tags: [],
        description: '',
    };

    handleClick = () => {
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

    submitAction = event => {
        // Check inputs
        if (this.state.name != '' && this.state.location != '' && this.state.organization != '' && this.state.duration != '') {

        // Adding leading 0s
        var month = (1 + this.state.date.getMonth()).toString();
        month = month.length > 1 ? month : '0' + month;
        var day = this.state.date.getDate().toString();
        day = day.length > 1 ? day : '0' + day;
        var hours = this.state.date.getHours().toString();
        hours = hours.length > 1 ? hours : '0' + hours;
        var minutes = this.state.date.getMinutes().toString();
        minutes = minutes.length > 1 ? minutes : '0' + minutes;

        // Push event to Firebase
        db.ref('/current-events').push({
            name: this.state.name,
            startDate: month + '-' + day + '-' + this.state.date.getFullYear() + " " + hours + ":" + minutes,
            duration: this.state.duration,
            location: this.state.location,
            organization: this.state.organization,
            imgid: '2000',
            description: this.state.description,
            tags: this.state.tags.toString(),
        });

        this.state.open = true;

        // Reset the state
        this.setState({
            name: '',
            date: new Date(),
            duration: '',
            location: '',
            organization: '',
            tags: [],
            description: '' });
        } else {
            alert("Required fields are not filled in.");
        }
    };

    render() {
        return (
            <div>
                <MuiPickersUtilsProvider utils={MomentUtils}>
                <Grid container spacing={24}>
                    <Grid item container direction="column" xs>
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
                                label="Date Picker"
                                value={this.state.date}
                                onChange={this.handleDateChange}
                                />
                        </Grid>
                        <Grid item>
                            <TimePicker
                                margin="normal"
                                label="Time Picker"
                                value={this.state.date}
                                onChange={this.handleDateChange}
                                />
                        </Grid>
                        <Grid item>
                            <TextField
                                id="event-dur"
                                label="Duration"
                                margin="normal"
                                value={this.state.duration}
                                onChange={e => this.setState({ duration: parseInt(e.target.value) })}
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
                        <Grid item>
                            <Button variant="contained"
                                className="create-event"
                                onClick={this.submitAction}>
                                Submit Event    
                            </Button>
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
                    message={<span id="message-id">Event Added</span>}
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

export default Events;