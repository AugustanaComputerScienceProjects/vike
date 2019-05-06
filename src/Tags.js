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

class Tags extends Component {
  state = {
    tagsList: [],
    keys: [],
    newTag: "",
  }

  componentDidMount() {
    this.readTagsList();
  }

  readTagsList() {
    let self = this;
    let ref = firebase.database.ref('tags');
    ref.on('value', function(snapshot) {
      let tagsList = [];
      let keys = [];
      snapshot.forEach(function(child) {
        tagsList.push(child.val());
        keys.push(child.key);
      });
      self.setState({ tagsList: tagsList});
      self.setState({ keys: keys})
      console.log(tagsList);
    })

  }

  handleNewTagChange = e => {
    this.setState({ newTag: e.target.value})
  }

  handleTagAdd = e => {
    let added = this.state.tagsList.concat(this.state.newTag)
    this.setState({tagsList: added})

    let ref = firebase.database.ref('tags');
    ref.push(this.state.newTag);
    this.setState({newTag: ""});
  }

  handleTagRemove(index) {
    let copy = [...this.state.tagsList];
    if (index !== -1) {
      copy.splice(index,1);
      this.setState({tagsList: copy})
    }

    let ref = firebase.database.ref('tags');
    ref.child(this.state.keys[index]).remove();
  }


    render() {

        const tagsChildren = [];

        for (var i = 0; i < this.state.tagsList.length; i+=1) {
          let index = i;
          tagsChildren.push(
            <Grid item>
            <Paper style={{padding: '5px', display: 'flex', width: '200px'}}>
            <Grid item container direction="row" spacing={16}>
                <Grid item>
                <Typography style={{margin: 6}}>{this.state.tagsList[index]}</Typography>
                </Grid>
                <Grid item>
                <IconButton style={{marginLeft: 60}} onClick={(e) => this.handleTagRemove(index)}><DeleteIcon /></IconButton>
                </Grid>
            </Grid>
          </Paper>
          </Grid>)
        }

        return (

            <div style={{textAlign: 'center'}}>
              <div style={{display: 'inline-block'}}>
                <Grid container direction = "column">
                  <Grid item container direction = "row">
                    <Grid item>
                      <TextField
                          label = "New Tag"
                          id = "new-tag"
                          margin="normal"
                          style={{width: '110px'}}
                          value={this.state.newTag}
                          onChange={this.handleNewTagChange} />
                    </Grid>
                    <Grid item>
                      <Button style={{marginTop: '30px', marginLeft: '10px'}} variant="contained" onClick={this.handleTagAdd}>
                        Add Tag
                      </Button>
                    </Grid>
                </Grid>
                {tagsChildren}
                </Grid>
              </div>
            </div>

        );
    }
}

export default Tags;
