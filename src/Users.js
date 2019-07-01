import React, { Component, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Drawer from '@material-ui/core/Drawer';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import Typography from '@material-ui/core/Typography';
import firebase from './config';
import { Button } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import AddIcon from '@material-ui/icons/Add';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { red, blue } from '@material-ui/core/colors';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';
import DispatchGroup from './DispatchGroup';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from 'react-select';
import { SingleSelect } from 'react-select-material-ui';

// File for the Users page

const redTheme = createMuiTheme({ palette: { primary: red } })

class Users extends Component {

    group = new DispatchGroup();

    state = {
        admins: [],
        leaders: [],
        email: '',
        organization: '',
        groups: [],
        adding: false,
        ref: '',
        type: '',
        deleting: false,
        hidden: "visible",
        disabled: false
    }

    listeners = [];

    // Handles the changing of the email in the add admin/leader screen
    handleEmailChange = (event) => {
        this.setState({ email: event.target.value });
    }

    // Action for removing a given user - opens the confirm option
    removeAction = (ref, user) => {
        this.setState({ email: user, ref: ref});
        this.handleDeleteOpen();
    }

    // Deletes the user from the database once they hit the confirm button
    deleteUser = () => {
        firebase.database.ref(this.state.ref + this.state.email.replace(".", ",")).remove();
        this.handleDeleteClose();
    }

    // Handles closing of the add user pop up
    handleClose = () => {
        this.setState({ adding: false });
    }

    // Handles opening of the add user pop up
    handleOpen = () => {
        this.setState({ adding: true });
    }

    // Handles closing of the confirm pop up for deleting a user
    handleDeleteClose = () => {
        this.setState({ deleting: false });
    }

    // Handles opening of the confrim pop up for deleting a user
    handleDeleteOpen = () => {
        this.setState({ deleting: true });
    }

    // Handles opening of the add user screen
    addAction = (ref, type) => {
        this.setState({ email: '', ref: ref, type: type });
        if (type === "Administrator") {
            this.setState({disabled: true});
        } else {
            this.setState({disabled: false})
        }
        
        this.handleOpen();
    }

    // Handles adding of the user once the add user button is clicked
    handleSave = () => {
        if (this.state.ref === '/leaders/') {
            firebase.database.ref(this.state.ref + this.state.email.replace('.', ',')).child('Groups').push(this.state.organization);
        } else {
            firebase.database.ref(this.state.ref + this.state.email.replace('.', ',')).set(true);
        }
        this.handleClose();
    }



    // Reads the current administrators from the database
    readAdministrators() {
        let token = this.group.enter();
        let self = this;
        let ref = firebase.database.ref('/admin');
        this.listeners.push(ref);
        ref.on('value', function(snapshot) {
            let admins = [];
            snapshot.forEach(function(child) {
                admins.push(child.key.replace(",", "."));
            });
            self.setState({ admins: admins });
            self.group.leave(token);
        });
    }

    // Reads the current leaders from the database
    readLeaders() {
        let token = this.group.enter();
        let self = this;
        let ref = firebase.database.ref('/leaders');
        this.listeners.push(ref);
        ref.on('value', function(snapshot) {
            let leaders = [];
            snapshot.forEach(function(child) {
                leaders.push(child.key.replace(",", "."));
            });
            self.setState({ leaders: leaders });
            self.group.leave(token);
        });
    }

    // Reads the groups from Firebase and sets the groups list
    readGroups() {
        let self = this;
        let ref = firebase.database.ref('/groups').orderByValue();
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

    // Component will mount - read the administrators and leaders, then hide the progress indicator
    componentWillMount() {
        this.readAdministrators();
        this.readLeaders();
        this.readGroups();
        let self = this;
        this.group.notify(function() {
            self.setState({ hidden: "hidden" });
        });
    }

    // Compone will unmount - turn off the Firebase listeners
    componentWillUnmount() {
        this.listeners.forEach(function(listener) {
            listener.off();
        });
    }

    //Gives the group selector if the adding a leader
    //Otherwise, leaves it blank
    addGroupSelect() {
        if (this.state.type === "Leader") {
            return (
                <Grid item>
                        <FormControl margin="normal" disabled={this.state.disabled}>
                        <InputLabel>Group</InputLabel>
                        <div style={{width: 500}}>
                        <Select
                            value={this.state.organization}
                            onChange={e => this.setState({ organization: e.target.value })}
                            options={this.state.groups.map(group => {return {value: group, label: group}})} /> 
                        </div> 
                        
                    </FormControl>  
                </Grid>
            );
        }
    }

    // Render the page
    render() {
        const adminChildren = [];
        const leaderChildren = [];

        // Build the administrator components to display
        for (var i = 0; i < this.state.admins.length; i += 1) {
            let index = i;
            adminChildren.push(<ChildComponent key={index} email={this.state.admins[index]} removeAction={() => this.removeAction("/admin/", this.state.admins[index])}></ChildComponent>)
        }
        
        // Build the leader components to display
        for (var i = 0; i < this.state.leaders.length; i += 1) {
            let index = i;
            leaderChildren.push(<ChildComponent key={index} email={this.state.leaders[index]} removeAction={() => this.removeAction("/leaders/", this.state.leaders[index])}></ChildComponent>)
        }

        return (
            <div>
            <div style={{position: "fixed", top: "50%", left: "50%", margintop: "-50px", marginleft: "-50px", width: "100px", height: "100px"}}>
                <CircularProgress disableShrink style={{visibility: this.state.hidden}}></CircularProgress>
            </div>
            <Grid container>
            <Grid item container direction="row">
            <Grid item style={{width: "50%"}}>
            <Paper style={{padding: 20, marginRight: 20}}>
            <ParentComponent title={"Administrators:"} addAction={() => this.addAction("/admin/", "Administrator")}>
                {adminChildren}
            </ParentComponent>
            </Paper>
            </Grid>
            <Grid item style={{width: "50%"}}>
            <Paper style={{padding: 20}}>
            <ParentComponent title={"Leaders:"} addAction={() => this.addAction("/leaders/", "Leader")}>
                {leaderChildren}
            </ParentComponent>
            </Paper>
            </Grid>
            </Grid>
            </Grid>
            <Dialog onClose={this.handleClose}
                    aria-labelledby="customized-dialog-title"
                    open={this.state.adding}>
      <DialogTitle id="customized-dialog-title" onClose={this.handleCloseEdit}>
            Add {this.state.type}
          </DialogTitle>
          <DialogContent style={{height: 425}}>
                <Grid container>
                    <Grid item container direction="column" spacing={0}>
                        <Grid item>
                            <TextField
                                    autoFocus={true}
                                    style={{width: 300}}
                                    label="Email"
                                    id="email"
                                    margin="normal"
                                    value={this.state.email}
                                    onChange={this.handleEmailChange} />                 
                        </Grid>
                        {this.addGroupSelect()}
                    </Grid>
                </Grid>
          </DialogContent>
          <DialogActions style={{justifyContent: 'center'}}>
          <Button variant="contained" onClick={this.handleSave} color="primary">
              Add User
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={this.state.deleting}
          onClose={this.handleDeleteClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">{"Are you sure you want to remove this user?"}</DialogTitle>
          <DialogContent>
              <label>{this.state.email}</label>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleDeleteClose} color="primary">
              Cancel
            </Button>
            <MuiThemeProvider theme={redTheme}>
            <Button onClick={this.deleteUser} color="primary" autoFocus>
              Confirm
            </Button>
            </MuiThemeProvider>
          </DialogActions>
        </Dialog>
            </div>
        );
    }
}

// Parent component for a user to be displayed
const ParentComponent = props => (
    <div style={{width: 1000}}>
      <Grid container id="children-pane" direction="column" spacing={16}>
      <Grid item container><Typography variant="h5">{props.title}</Typography><Button style={{marginLeft: 10}} onClick={props.addAction} color="primary" variant="outlined"><AddIcon/>Add</Button></Grid>
        {props.children}
      </Grid>
    </div>
);
  
// Child component for a user to be displayed
const ChildComponent = props => <Grid item container><Typography component="p" style={{marginTop: 7}}>{props.email}</Typography><MuiThemeProvider theme={redTheme}><Button color="primary" onClick={props.removeAction}><CloseIcon/></Button></MuiThemeProvider></Grid>;

export default Users;