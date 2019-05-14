import React, { Component, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Drawer from '@material-ui/core/Drawer';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import firebase from './config.js'
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { red, blue } from '@material-ui/core/colors';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import CloseIcon from '@material-ui/icons/Close';
import AddIcon from '@material-ui/icons/Add';
import CircularProgress from '@material-ui/core/CircularProgress';
import DispatchGroup from './DispatchGroup';

// File for manging the Groups/Tags screen

const redTheme = createMuiTheme({ palette: { primary: red } })

class Tags extends Component {
  
  group = new DispatchGroup();

  state = {
    tags: [],
    groups: [],
    key: "",
    data: "",
    adding: false,
    ref: '',
    type: '',
    deleting: false,
    hidden: "visible"
  }

  listeners = [];

  // Component will mount - read the tags and groups and then hide the progress indicator
  componentWillMount() {
    this.readTags();
    this.readGroups();
    let self = this;
    this.group.notify(function() {
      self.setState({ hidden: "hidden" });
    });
  }

  // Component will unmount - turn off the Firebase listeners
  componentWillUnmount() {
    this.listeners.forEach(function(listener) {
        listener.off();
    });
}

  // Read the tags from Firebase
  readTags() {
    let token = this.group.enter();
    let self = this;
    let ref = firebase.database.ref('/tags');
    this.listeners.push(ref);
    ref.on('value', function(snapshot) {
      let tagsList = [];
      snapshot.forEach(function(child) {
        tagsList.push([child.key, child.val()]);
      });
      self.setState({ tags: tagsList });
      self.group.leave(token);
      console.log(tagsList);
    })
  }

  // Read the groups from Firebase
  readGroups() {
    let token = this.group.enter();
    let self = this;
    let ref = firebase.database.ref('/groups');
    this.listeners.push(ref);
    ref.on('value', function(snapshot) {
      let groupsList = [];
      snapshot.forEach(function(child) {
        groupsList.push([child.key, child.val()]);
      });
      self.setState({ groups: groupsList });
      self.group.leave(token);
      console.log(groupsList);
    })
  }

  // Action for opening the confirm pop up when deleting a tag/group
  removeAction = (ref, data, key, type) => {
    this.setState({ key: key, data: data, ref: ref, type: type});
    this.handleDeleteOpen();
}

// Handles closing of the confirm delete pop up
handleDeleteClose = () => {
  this.setState({ deleting: false });
}

// Handles opening of the confirm delete pop up
handleDeleteOpen = () => {
  this.setState({ deleting: true });
}

// Action for opening the add group/tag pop up
addAction = (ref, type) => {
  this.setState({ data: '', ref: ref, type: type });
  this.handleOpen();
}

// Handles closing of the add group/tag pop up
handleClose = () => {
  this.setState({ adding: false });
}

// Handles opening of the add group/tag pop up
handleOpen = () => {
  this.setState({ adding: true });
}

// Action for adding the group/tag to Firebase once the Add button is clicked
handleSave = () => {
  firebase.database.ref(this.state.ref).push().set(this.state.data);
  this.handleClose();
}

// Handles changing of the group/tag field in the add pop up
handleChange = (event) => {
  this.setState({ data: event.target.value });
}

// Deletes the tag/group from Firebase once the confirm button is clicked
deleteData = () => {
  firebase.database.ref(this.state.ref + "/" + this.state.key).remove();
  this.handleDeleteClose();
}

    // Render the Groups/Tags page
    render() {
        const tagsChildren = [];
        const groupsChildren = [];

        // Build the components for tags
        for (var i = 0; i < this.state.tags.length; i += 1) {
          let index = i;
          let tag = this.state.tags[index];
          tagsChildren.push(<ChildComponent key={index} data={tag[1]} removeAction={() => this.removeAction("/tags/", tag[1], tag[0], "tag")}></ChildComponent>)
      }
      
      // Build the components for groups
      for (var i = 0; i < this.state.groups.length; i += 1) {
          let index = i;
          let group = this.state.groups[index];
          groupsChildren.push(<ChildComponent key={index} data={group[1]} removeAction={() => this.removeAction("/groups/", group[1], group[0], "group")}></ChildComponent>)
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
            <ParentComponent title={"Groups:"} addAction={() => this.addAction("/groups/", "Group")}>
                {groupsChildren}
            </ParentComponent>
            </Paper>
            </Grid>
            <Grid item style={{width: "50%"}}>
            <Paper style={{padding: 20}}>
            <ParentComponent title={"Tags:"} addAction={() => this.addAction("/tags/", "Tag")}>
                {tagsChildren}
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
                                    label={this.state.type}
                                    id="data"
                                    margin="normal"
                                    value={this.state.data}
                                    onChange={this.handleChange} />                        
                        </Grid>
                    </Grid>
                </Grid>
          </DialogContent>
          <DialogActions style={{justifyContent: 'center'}}>
          <Button variant="contained" onClick={this.handleSave} color="primary">
              Add
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          open={this.state.deleting}
          onClose={this.handleDeleteClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">{"Are you sure you want to remove this " + this.state.type + "?"}</DialogTitle>
          <DialogContent>
              <label>{this.state.data}</label>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleDeleteClose} color="primary">
              Cancel
            </Button>
            <MuiThemeProvider theme={redTheme}>
            <Button onClick={this.deleteData} color="primary" autoFocus>
              Confirm
            </Button>
            </MuiThemeProvider>
          </DialogActions>
        </Dialog>
            </div>
        );
    }
}

// Parent component for displaying a single group/tag
const ParentComponent = props => (
  <div style={{width: 1000}}>
    <Grid container id="children-pane" direction="column" spacing={16}>
    <Grid item container><Typography variant="h5">{props.title}</Typography><Button style={{marginLeft: 10}} onClick={props.addAction} color="primary" variant="outlined"><AddIcon/>Add</Button></Grid>
      {props.children}
    </Grid>
  </div>
);

// Child component for displaying a single group/tag
const ChildComponent = props => <Grid item container><Typography component="p" style={{marginTop: 7}}>{props.data}</Typography><MuiThemeProvider theme={redTheme}><Button color="primary" onClick={props.removeAction}><CloseIcon/></Button></MuiThemeProvider></Grid>;

export default Tags;
