import React, { Component, useState } from 'react';
import './App.css';
import { FilePicker } from 'react-file-picker';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import FormLabel from '@material-ui/core/FormLabel';
import CSVReader from "react-csv-reader";
import firebase from './config';

class DemographicsUpload extends Component {

    state = {
        demographicsFile: null,
        test: 'test'
    }

    handleFileChanged = data => {
        console.log(data);
        console.log(data[0]);
        this.setState({demographicsFile: data});
        console.log(this.state.demographicsFile.length);
    }

    uploadDemographics = () => {
        let demographicsCSVData = this.state.demographicsFile;
        if (demographicsCSVData === null) {
            alert('Please select a file to upload.');
        } else {
            let columnNames = demographicsCSVData[0]; // first row has column names
            firebase.database.ref('/demographics').remove();
            firebase.database.ref('/id-to-email').remove();
            for (let row = 1; row < demographicsCSVData.length; row++) {
                if (demographicsCSVData[row].length > 1) { // avoid final blank row (if any)
                    let idNum = demographicsCSVData[row][0];
                    let email = demographicsCSVData[row][1];
                    firebase.database.ref('/id-to-email').child(idNum).set(email);

                    for (let column = 0; column < columnNames.length; column++) {
                        if (column !== 1) {
                            firebase.database.ref('/demographics').child(email).child(columnNames[column]).set(demographicsCSVData[row][column]);
                        }
                    }
                }
            }
            this.setState({demographicsFile: null});
            window.open('/success', '_self');
        }
    }

    render() {
        return (
            <div style={{display:'flex', justifyContent:'center'}}>
                <Grid>
                <DialogTitle>Choose a file to upload.</DialogTitle>
                <CSVReader
                    onFileLoaded={this.handleFileChanged}
                    inputId="something"
                    inputStyle={{color: 'purple'}} />
                <Button onClick={this.uploadDemographics}>
                    Submit
                </Button>
                </Grid>
            </div>
        );
    }
}

export default DemographicsUpload;