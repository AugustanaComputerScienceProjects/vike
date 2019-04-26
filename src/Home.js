import React, { Component, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Drawer from '@material-ui/core/Drawer';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import defaultImage from './default.jpg';
import { View, Image } from 'react-native';

class Home extends Component {



    render() {
        return (
            <div style={{textAlign: "center", paddingTop: 40}}>
            <div style={{display: "inline-block"}}>
                <Grid container>
                <Grid item container direction="column" spacing={40}>
                    <Grid item><label style={{fontSize: 40}}>Welcome to the Augustana Events App</label></Grid>
                    <Image style={{ height: 0, paddingTop: '56.25%' }} source={{uri: defaultImage}}></Image>
                    <Grid item><label style={{fontSize: 20}}>Please sign in in order to use the app's features</label></Grid>
                    <Grid item><label style={{fontSize: 20}}>Created by:</label></Grid>
                    <Grid item><label style={{fontSize: 20}}>Kyle Workman, Jared Haeme, Brandon Thompson, Jack Cannell, Brent Pierce, Paige Oucheriah</label></Grid>
                </Grid>
                </Grid>
            </div>
            </div>
        );
    }
}

export default Home;