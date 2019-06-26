import React, { Component, useState } from 'react';
import './App.css';
import Card from '@material-ui/core/Card';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import firebase from './config';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { FormHelperText } from '@material-ui/core';

class Pepsico extends Component {

    state = {
        studentIdentifier: '',
        confirmation: false,
        title: "",
        message: ""
    }

    entryChange = e => {
        this.setState({studentIdentifier: e.target.value});
    }

    onSubmit = e => {
        let idNum = this.state.studentIdentifier;
        if (idNum[0] === ';' && idNum.length === 16) {
            idNum = idNum.slice(3, 10);
            this.checkIdEntered(idNum);
        } else if (!isNaN(idNum[0])) {
            while (idNum.length < 7) {
                idNum = '0' + idNum;
            }
            this.checkIdEntered(idNum);
        } else {
            this.checkUserIdEntered(idNum);
        }
        this.setState({studentIdentifier: ""});
        this.idNumTextField.focus();
    }

    checkIdEntered = idNum => {
        console.log("SID: " + idNum);
        let reference = firebase.database.ref('/idToEmail');
        let demoReference = firebase.database.ref('/demographics');
        let self = this;
        reference.once('value').then(function(snapshot) {
            if (snapshot.hasChild(idNum)) {
                self.setState({title: 'Checked In'});
                let email = snapshot.child(idNum).val();
                demoReference.once('value').then(function(snapshot) {
                    self.checkedIn(email, snapshot);
                });
            } else {
                self.failedCheckIn();
            }
        });
    }

    checkUserIdEntered = userId => {
        console.log("User ID: " + userId);
        let reference = firebase.database.ref('/demographics');
        let self = this;
        reference.once('value').then(function(snapshot) {
            if (snapshot.hasChild(userId)) {
                self.checkedIn(userId, snapshot);
            } else {
                self.failedCheckIn();
            }
        });
    }

    checkedIn = (userId, snapshot) => {
        this.setState({title: 'Checked In'});
        let firstName = snapshot.child(userId).child('Pref_FirstName').val();
        let lastName = snapshot.child(userId).child('LastName').val()
        this.setState({message: firstName + ' ' + lastName +  ' has checked in.'});
        this.setState({confirmation: true});
        firebase.database.ref('/Pepsico').once('value').then(function(snapshot) {
            snapshot.forEach(function(child) {
                let eventKey = child.key;
                firebase.database.ref('/Pepsico').child(eventKey).child('users').child(userId).set(true);
            });
        }); 
    }

    failedCheckIn = () => {
        this.setState({title: 'Check In Failed'});
        this.setState({message: 'Not a student.'});
        this.setState({confirmation: true});
    }

    keyPress = e => {
        if (e.keyCode === 13) {
            this.onSubmit(e);
        }
    }

    handleClose = () => {
        this.setState({confirmation: false});
    }

    render() {
        return (
            <div style={{display: 'flex', justifyContent: 'center'}}>
                <Card style={{minWidth: 500, maxWidth: 500, minHeight: 125, maxHeight: 125}}>
                    <Grid 
                        container
                        spacing={0}
                        direction="column"
                        alignItems="center"
                        justify="center">    
                        <Grid item>
                            <TextField 
                                autoFocus
                                margin="normal"
                                label="Swipe card or enter student id"
                                inputRef={input => (this.idNumTextField = input)}
                                value={this.state.studentIdentifier}
                                onChange={this.entryChange}
                                onKeyDown={this.keyPress}
                                style={{minWidth: 250}} />
                        </Grid>
                        <Button variant='outlined'
                                onClick={this.onSubmit}>Submit</Button>
                    </Grid>
                </Card>
                <Dialog onClose={this.confirmation}
                        aria-labelledby="customized-dialog-title"
                        open={this.state.confirmation}>
                    <DialogTitle id="customized-dialog-title">
                        {this.state.title}
                    </DialogTitle>
                    <DialogContent>
                        {this.state.message}
                    </DialogContent>
                    <DialogActions style={{justifyContent: 'center'}}>
                        <Button variant="contained" onClick={this.handleClose} color="primary">
                            OK
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        );
    }
}

export default Pepsico;