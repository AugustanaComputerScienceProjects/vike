import React, { Component, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Drawer from '@material-ui/core/Drawer';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';

class NavDrawer extends Component {

    constructor(props) {
        super(props);
        this.eventClicked = this.eventClicked.bind(this);
        this.pastClicked = this.pastClicked.bind(this);
        this.tagsClicked = this.tagsClicked.bind(this);


    }

    eventClicked() {
        this.props.navChanged("Events");
    }

    pastClicked() {
        this.props.navChanged("Past Events");
    }

    tagsClicked() {
        this.props.navChanged("Tags");
    }


    render() {
        return (
            <Drawer
                className="navDrawer"
                variant="permanent"
                anchor="left">
                <MenuList>
                    <MenuItem name="Events" onClick={this.eventClicked}>Events</MenuItem>
                    <MenuItem name="PastEvents" onClick={this.pastClicked}>Past Events</MenuItem>
                    <MenuItem name="Tags" onClick={this.tagsClicked}>Tags/Groups</MenuItem>

                </MenuList>
            </Drawer>


            );
    }
}

export default NavDrawer;