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
import React, { useEffect } from 'react';
import DispatchGroup from '../components/DispatchGroup';
import firebase from '../config.js';

// File for manging the Groups/Tags screen

const Tags = () => {
  const group = new DispatchGroup();
  const [tags, setTags] = React.useState([]);
  const [groups, setGroups] = React.useState([]);
  const [key, setKey] = React.useState('');
  const [data, setData] = React.useState('');
  const [adding, setAdding] = React.useState(false);
  const [ref, setRef] = React.useState(null);
  const [type, setType] = React.useState('');
  const [deleting, setDeleting] = React.useState(false);
  const [adminSignedIn, setAdminSignedIn] = React.useState(false);
  // eslint-disable-next-line no-unused-vars
  const [leaderSignedIn, setLeaderSignedIn] = React.useState(false);
  const [hidden, setHidden] = React.useState(false);

  useEffect(() => {
    readTags();
    readGroups();
    group.notify(() => {
      setHidden('hidden');
    });
    firebase.auth.onAuthStateChanged((user) => {
      if (user) {
        checkRole(user, 'leader');
        checkRole(user, 'admin');
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const readTags = () => {
    let token = group.enter();
    let ref = firebase.database.ref('/tags');
    ref.on('value', (snapshot) => {
      let tagsList = [];
      snapshot.forEach((child) => {
        tagsList.push([child.key, child.val()]);
      });
      setTags(tagsList);
      group.leave(token);
      console.log(tagsList);
    });
  };

  // Read the groups from Firebase
  const readGroups = () => {
    let token = group.enter();
    let ref = firebase.database.ref('/groups');
    ref.on('value', (snapshot) => {
      let groupsList = [];
      snapshot.forEach((child) => {
        groupsList.push([child.key, child.val()]);
      });
      setGroups(groupsList);
      group.leave(token);
      console.log(groupsList);
    });
  };

  // Action for opening the confirm pop up when deleting a tag/group
  const removeAction = (ref, data, key, type) => {
    setKey(key);
    setData(data);
    setRef(ref);
    setType(type);
    handleDeleteOpen();
  };

  // Handles closing of the confirm delete pop up
  const handleDeleteClose = () => {
    setDeleting(false);
  };

  // Handles opening of the confirm delete pop up
  const handleDeleteOpen = () => {
    setDeleting(true);
  };

  // Action for opening the add group/tag pop up
  const addAction = (ref, type) => {
    setData('');
    setRef(ref);
    setType(type);
    handleOpen();
  };

  // Handles closing of the add group/tag pop up
  const handleClose = () => {
    setAdding(false);
  };

  // Handles opening of the add group/tag pop up
  const handleOpen = () => {
    setAdding(true);
  };

  // Action for adding the group/tag to Firebase once the Add button is clicked
  const handleSave = () => {
    firebase.database
      .ref(ref)
      .push()
      .set(data);
    handleClose();
  };

  // Handles changing of the group/tag field in the add pop up
  const handleChange = (event) => {
    setData(event.target.value);
  };

  // Deletes the tag/group from Firebase once the confirm button is clicked
  const deleteData = () => {
    firebase.database.ref(ref + '/' + key).remove();
    handleDeleteClose();
  };

  const checkRole = (user, role) => {
    firebase.database
      .ref(role)
      .once('value')
      .then((snapshot) => {
        if (snapshot.hasChild(user.email.replace('.', ','))) {
          console.log('Snapshot: ' + snapshot);
          if (role === 'admin') {
            setAdminSignedIn(true);
          } else if (role === 'leaders' && !adminSignedIn) {
            setLeaderSignedIn(true);
          }
        }
      });
  };

  const insertGroupsWidget = (groupsChildren) => {
    if (adminSignedIn) {
      return (
        <Grid item style={{ width: '50%' }}>
          <Paper style={{ padding: 20, marginRight: 20 }}>
            <ParentComponent
              title={'Groups:'}
              addAction={() => addAction('/groups/', 'Group')}
            >
              {groupsChildren}
            </ParentComponent>
          </Paper>
        </Grid>
      );
    }
  };

  const tagsChildren = [];
  const groupsChildren = [];

  // Build the components for tags
  for (var i = 0; i < tags.length; i += 1) {
    let index = i;
    let tag = tags[index];
    tagsChildren.push(
      <ChildComponent
        key={index}
        data={tag[1]}
        removeAction={() => removeAction('/tags/', tag[1], tag[0], 'tag')}
      ></ChildComponent>
    );
  }

  // Build the components for groups
  for (var j = 0; j < groups.length; j += 1) {
    let index = j;
    let group = groups[index];
    groupsChildren.push(
      <ChildComponent
        key={index}
        data={group[1]}
        removeAction={() =>
          removeAction('/groups/', group[1], group[0], 'group')
        }
      ></ChildComponent>
    );
  }

  return (
    <div>
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          margintop: '-50px',
          marginleft: '-50px',
          width: '100px',
          height: '100px',
        }}
      >
        <CircularProgress
          disableShrink
          style={{ visibility: hidden }}
        ></CircularProgress>
      </div>
      <Grid container>
        <Grid item container direction='row'>
          {insertGroupsWidget(groupsChildren)}
          <Grid item style={{ width: '50%' }}>
            <Paper style={{ padding: 20 }}>
              <ParentComponent
                title={'Tags:'}
                addAction={() => addAction('/tags/', 'Tag')}
              >
                {tagsChildren}
              </ParentComponent>
            </Paper>
          </Grid>
        </Grid>
      </Grid>
      <Dialog
        onClose={handleClose}
        aria-labelledby='customized-dialog-title'
        open={adding}
      >
        <DialogTitle id='customized-dialog-title'>Add {type}</DialogTitle>
        <DialogContent>
          <Grid container>
            <Grid item container direction='column' spacing={0}>
              <Grid item>
                <TextField
                  autoFocus={true}
                  style={{ width: 300 }}
                  label={type}
                  id='data'
                  margin='normal'
                  value={data}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions style={{ justifyContent: 'center' }}>
          <Button variant='contained' onClick={handleSave} color='primary'>
            Add
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={deleting}
        onClose={handleDeleteClose}
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
      >
        <DialogTitle id='alert-dialog-title'>
          {'Are you sure you want to remove ' + type + '?'}
        </DialogTitle>
        <DialogContent>
          <label>{data}</label>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteClose} color='primary'>
            Cancel
          </Button>
          <Button onClick={deleteData} color='primary' autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};
// Parent component for displaying a single group/tag
const ParentComponent = (props) => (
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

// Child component for displaying a single group/tag
const ChildComponent = (props) => (
  <Grid item container>
    <Typography component='p' style={{ marginTop: 7 }}>
      {props.data}
    </Typography>
    <Button color='primary' onClick={props.removeAction}>
      <CloseIcon />
    </Button>
  </Grid>
);

export default Tags;
