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

const redTheme = createMuiTheme({ palette: { primary: red } })

class Users extends Component {

    group = new DispatchGroup();

    state = {
        admins: [],
        leaders: [],
        email: '',
        adding: false,
        ref: '',
        type: '',
        deleting: false,
        hidden: "visible"
    }

    listeners = [];

    handleEmailChange = (event) => {
        this.setState({ email: event.target.value });
    }

    removeAction = (ref, user) => {
        this.setState({ email: user, ref: ref});
        this.handleDeleteOpen();
    }

    deleteUser = () => {
        firebase.database.ref(this.state.ref + this.state.email.replace(".", ",")).remove();
        this.handleDeleteClose();
    }

    handleClose = () => {
        this.setState({ adding: false });
    }

    handleOpen = () => {
        this.setState({ adding: true });
    }

    handleDeleteClose = () => {
        this.setState({ deleting: false });
    }

    handleDeleteOpen = () => {
        this.setState({ deleting: true });
    }

    addAction = (ref, type) => {
        this.setState({ email: '', ref: ref, type: type });
        this.handleOpen();
    }

    handleSave = () => {
        firebase.database.ref(this.state.ref + this.state.email.replace('.', ',')).set(true);
        this.handleClose();
    }

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

    componentWillMount() {
        this.readAdministrators();
        this.readLeaders();
        let self = this;
        this.group.notify(function() {
            self.setState({ hidden: "hidden" });
        });
    }

    componentWillUnmount() {
        this.listeners.forEach(function(listener) {
            listener.off();
        });
    }

    render() {
        const adminChildren = [];
        const leaderChildren = [];

        for (var i = 0; i < this.state.admins.length; i += 1) {
            let index = i;
            adminChildren.push(<ChildComponent key={index} email={this.state.admins[index]} removeAction={() => this.removeAction("/admin/", this.state.admins[index])}></ChildComponent>)
        }
        
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
          <DialogContent>
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

const ParentComponent = props => (
    <div style={{width: 1000}}>
      <Grid container id="children-pane" direction="column" spacing={16}>
      <Grid item container><Typography variant="h5">{props.title}</Typography><Button style={{marginLeft: 10}} onClick={props.addAction} color="primary" variant="outlined"><AddIcon/>Add</Button></Grid>
        {props.children}
      </Grid>
    </div>
);
  
const ChildComponent = props => <Grid item container><Typography component="p" style={{marginTop: 7}}>{props.email}</Typography><MuiThemeProvider theme={redTheme}><Button color="primary" onClick={props.removeAction}><CloseIcon/></Button></MuiThemeProvider></Grid>;

export default Users;