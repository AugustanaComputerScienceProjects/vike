import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import React, { Component } from 'react';
import DispatchGroup from '../components/DispatchGroup.js';
import firebase from '../config.js';

class Groups extends Component{
    group = new DispatchGroup();

    state = {
        groups: [],
        key: '',
        name: '',
        contact: '',
        adding: false,
        ref: '',
        type: '',
        deleting: false,
        hidden: 'visible',
        // adminSignedIn: false,
        // leaderSignedIn: false,
    };

    listeners = [];

    // Handles changing of the group field in the add pop up
    handleGroupChange = (event) => {
        this.setState({ name: event.target.value });
    };

    // Handles changing of the contact email field in the add pop up
    handleContactChange = (event) => {
        this.setState({ contact: event.target.value });
    };

    // Action for removing a given group - opens the confirm option
    removeAction = (ref, key, name, contact) => {
        this.setState({ key: key, name: name, contact: contact, ref: ref });
        this.handleDeleteOpen();
    }

    // Delete the group from Firebase once the confirm option is selected
    deleteData = () => {
        firebase.database.ref(this.state.ref + '/' + this.state.key).remove();
        this.handleDeleteClose();
    }

    // ✅ Handle the closing of the add group pop up
    handleAddClose = () => {
        this.setState({ adding: false });
    }

    // ✅ Handle the opening of the add group pop up
    addAction = () => {
        this.setState({ adding: true });
    }

    // ✅ Handle the closing of the confirm delete pop up
    handleDeleteClose = () => {
        this.setState({ deleting: false });
    }

    // ✅ Handle the opening of the confirm delete pop up
    handleDeleteOpen = () => {
        this.setState({ deleting: true });
    }

    // Action for adding the group to Firebase once the Add button is clicked
    handleSave = () => {
        firebase.database.ref('/groups').push().set({
            name: this.state.name,
            contact: this.state.contact,
        });
        this.handleAddClose();
    }

    // Handles the Firebase snapshot for the groups

    // handleGroups = (snapshot) => {
    //     const groups = [];
    //     snapshot.forEach((childSnapshot) => {
    //         const key = childSnapshot.key;
    //         const name = childSnapshot.val();
    //         groups.push({ key, ...name });
    //     });
    //     this.setState({ groups });
    // }

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
        });
    }

    // Component will mount - initiate the Firebase listeners
    componentWillMount() {
        this.readGroups();
        // this.setState({ hidden: 'hidden' });
        let self = this;
        this.group.notify(function() {
        self.setState({ hidden: 'hidden' });
        });
    }

    // ✅ Component will unmount - remove all Firebase listeners
    componentWillUnmount() {
        this.listeners.forEach(function(listener) {
            listener.off();
        });
    }

    // Inserting the groups page into the Firebase database
    insertGroupsWidget(groupsChildren) {
        return (
            <Grid item style={{ width: '50%' }}>
                <Paper style={{ padding: 20, marginRight: 20 }}>
                    <ParentComponent
                    title="Groups"
                    addAction={() => this.addAction('/groups/', 'group')}
                    >
                    {groupsChildren}
                    </ParentComponent>
                </Paper>
            </Grid>
        )
    }

    
    // Render the groups page
    render() {
        const groupsChildren = [];

        // Build the components for groups
        for (var i = 0; i < this.state.groups.length; i++) {
            let key = this.state.groups[i][0];
            let name = this.state.groups[i][1].name;
            let contact = this.state.groups[i][1].contact;
            groupsChildren.push(
                <ChildComponent 
                    key={key} 
                    name={name} 
                    contact={contact}
                    removeAction={() => this.removeAction('/groups/', key, name, contact)}
                ></ChildComponent>
            );
        }

        return (
            <div>
                <CircularProgress style={{ visibility: this.state.hidden }} />
                <Grid container spacing={3}>
                    <Grid item container direction={'row'}>
                        {this.insertGroupsWidget(groupsChildren)}
                    </Grid>
                </Grid>
                <Dialog open={this.state.adding} onClose={this.handleAddClose} aria-labelledby='customized-dialog-title'>
                    <DialogTitle id='customized-dialog-title'>Add</DialogTitle>
                    <DialogContent>
                        <Grid container>
                            <Grid item container direction='column' spacing={0}>
                                <Grid item>
                                    <TextField
                                        autoFocus
                                        margin="dense"
                                        id="name"
                                        label="Group"
                                        type="text"
                                        fullWidth
                                        onChange={this.handleGroupChange}
                                    />
                                    <TextField
                                        margin="dense"
                                        id="contact"
                                        label="Contact Email"
                                        type="email"
                                        fullWidth
                                        onChange={this.handleContactChange}
                                    />
                                </Grid>
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        {/* <Button onClick={this.handleAddClose} color="primary" startIcon={<CloseIcon />}>Cancel</Button> */}
                        <Button onClick={this.handleSave} color="primary" variant='contained'>Add</Button>
                    </DialogActions>
                </Dialog>
                <Dialog open={this.state.deleting} onClose={this.handleDeleteClose} aria-labelledby='alert-dialog-title' aria-describedby='alert-dialog-description'>
                    <DialogTitle id='alert-dialog-title'>Confirm Delete</DialogTitle>
                    <DialogContent>
                        <Typography>Are you sure you want to delete {this.state.name}?</Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleDeleteClose} color="primary">Cancel</Button>
                        <Button onClick={this.deleteData} color="primary">Confirm</Button>
                    </DialogActions>
                </Dialog>
            </div>
        );
    }
}

// Parent component for the groups page to be rendered
const ParentComponent = (props) => {
    // return (
    //     <Paper>
    //         <Typography variant="h4" align="center">{props.children}</Typography>
    //     </Paper>
    // );
    return (
        <div style={{ width: 1000 }}>
          <Grid container id='children-pane' direction='column' spacing={1}>
            <Grid item container>
              <Typography variant='h5'>{props.title}</Typography>
              <Button
                style={{ marginLeft: 10 }}
                onClick={props.addAction}
                color='primary'
                variant='outlined'
              >
                <AddIcon />
                Add
              </Button>
            </Grid>
            {props.children}
          </Grid>
        </div>
    );
}

const ChildComponent = (props) => {
    return (
        <Grid item container>
            <Typography component='p' style={{ marginTop: 7 }}><b>{props.name}</b></Typography>
            {props.contact && <Typography component='p' style={{ marginTop: 7 }}>{props.contact}</Typography>}
            <Button color='primary' onClick={props.removeAction}>
                <CloseIcon />
            </Button>
        </Grid>
    );
}

export default Groups;