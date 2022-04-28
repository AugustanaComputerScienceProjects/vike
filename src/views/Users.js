import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import React, { useEffect, useState } from 'react';
import CSVReader from 'react-csv-reader';
import Select from 'react-select';
import DispatchGroup from '../components/DispatchGroup';
import firebase from '../config';

// File for the Users page

const Users = (props) => {
  const group = new DispatchGroup();
  const [admins, setAdmins] = useState([]);
  // const [leaders, setLeaders] = useState([]);
  const [email, setEmail] = useState('');
  const [organization, setOrganization] = useState('');
  const [groups, setGroups] = useState([]);
  const [adding, setAdding] = useState(false);
  const [ref, setRef] = useState('');
  const [type, setType] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [hidden, setHidden] = useState('visible');
  const [disabled, setDisabled] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [demographicsFile, setDemographicsFile] = useState(null);
  const [groupLeaders, setGroupLeaders] = useState(new Map());
  const [groupLeaderRemoved, setGroupLeaderRemoved] = useState('');

  // Handles the changing of the email in the add admin/leader screen
  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  // Action for removing a given user - opens the confirm option
  const removeAction = (ref, user, name) => {
    setEmail(user);
    setRef(ref);
    setGroupLeaderRemoved(name);
    handleDeleteOpen();
  };

  // Deletes the user from the database once they hit the confirm button
  const deleteUser = () => {
    let user = email.replace('.', ',');
    if (ref === '/leaders/') {
      console.log('Leader group: ' + groupLeaderRemoved);
      firebase.database
        .ref('/groups-to-leaders/' + groupLeaderRemoved + '/leaders/' + user)
        .remove();
      firebase.database
        .ref('/leaders/' + user + '/groups/' + groupLeaderRemoved)
        .remove();
    } else {
      firebase.database.ref(ref + user).remove();
    }
    handleDeleteClose();
  };

  // Handles closing of the add user pop up
  const handleClose = () => {
    setAdding(false);
  };

  // Handles opening of the add user pop up
  const handleOpen = () => {
    setAdding(true);
  };

  // Handles closing of the confirm pop up for deleting a user
  const handleDeleteClose = () => {
    setDeleting(false);
  };

  // Handles opening of the confrim pop up for deleting a user
  const handleDeleteOpen = () => {
    setDeleting(true);
  };

  const handleCloseUpload = () => {
    setUploading(false);
  };

  // Handles opening of the add user screen
  const addAction = (ref, type) => {
    setEmail('');
    setRef(ref);
    setType(type);
    if (type === 'Administrator') {
      setDisabled(true);
    } else {
      setDisabled(false);
    }

    handleOpen();
  };

  const uploadAction = () => {
    setUploading(true);
  };

  const uploadLeaders = () => {
    let leadersCSVData = demographicsFile;
    if (leadersCSVData === null) {
      alert('Please select a file to upload.');
    } else {
      let columnNames = leadersCSVData[0]; // first row has column names
      firebase.database.ref('/leaders').remove();
      firebase.database.ref('/groups-to-leaders').remove();
      firebase.database.ref('/groups').remove();
      for (let row = 1; row < leadersCSVData.length; row++) {
        let group = leadersCSVData[row][0];
        console.log(group);
        firebase.database.ref('/groups').push(group);
        console.log(group);
        if (leadersCSVData[row][1] !== '') {
          for (let column = 1; column < columnNames.length; column++) {
            if (leadersCSVData[row][column] === '') {
              break;
            }
            console.log(group + ': ' + leadersCSVData[row][column]);
            console.log([row][1]);
            firebase.database
              .ref('/groups-to-leaders')
              .child(group)
              .child('leaders')
              .child(leadersCSVData[row][column].replace('.', ','))
              .set(true);
            firebase.database
              .ref('/leaders')
              .child(leadersCSVData[row][column].replace('.', ','))
              .child('groups')
              .child(group)
              .set(true);
          }
        } else {
          if (group === '') {
            break;
          }
          firebase.database
            .ref('/groups-to-leaders')
            .child(group)
            .child('leaders')
            .child('None')
            .set(true);
        }
      }
      setDemographicsFile(null);
      setUploading(false);
    }
  };

  // Handles adding of the user once the add user button is clicked
  const handleSave = () => {
    if ((organization === '' && ref === '/leaders/') || email === '') {
      alert('Please fill out all fields.');
    } else {
      if (ref === '/leaders/') {
        firebase.database
          .ref('/groups-to-leaders')
          .child(organization)
          .child('leaders')
          .child('None')
          .remove();
        firebase.database
          .ref(ref + email.replace('.', ','))
          .child('groups')
          .child(organization)
          .set(true);
        firebase.database
          .ref('/groups-to-leaders/' + organization)
          .child('leaders')
          .child(email.replace('.', ','))
          .set(true);
        setOrganization('');
      } else {
        firebase.database.ref(ref + email.replace('.', ',')).set(true);
      }
      handleClose();
    }
  };

  // Reads the current administrators from the database
  const readAdministrators = () => {
    let token = group.enter();
    let ref = firebase.database.ref('/admin');
    ref.on('value', (snapshot) => {
      console.log('reading admin');
      let admins = [];
      snapshot.forEach((child) => {
        admins.push(child.key.replace(',', '.'));
      });

      setAdmins(admins);
      group.leave(token);
    });
  };

  // Reads the current leaders from the database
  const readLeaders = () => {
    let token = group.enter();
    let ref = firebase.database.ref('/leaders');
    ref.on('value', (snapshot) => {
      let leaders = [];
      snapshot.forEach((child) => {
        leaders.push(child.key.replace(',', '.'));
      });
      group.leave(token);
    });
  };

  // Reads the groups from Firebase and sets the groups list
  const readGroups = () => {
    let ref = firebase.database.ref('/groups').orderByValue();
    ref.on('value', (snapshot) => {
      let groupsList = [];
      snapshot.forEach((child) => {
        groupsList.push(child.val());
      });
      setGroups(groupsList);
      console.log(groupsList);
    });
  };

  const readGroupsWithLeaders = () => {
    let ref = firebase.database.ref('/groups-to-leaders');
    ref.on('value', (snapshot) => {
      if (!snapshot.exists()) {
        setGroupLeaders(new Map());
      }
      let groups = new Map();
      snapshot.forEach((child) => {
        let leaders = [];
        child.child('leaders').forEach((leader) => {
          leaders.push(leader.key.replace(',', '.'));
        });
        groups.set(child.key, leaders);
        setGroupLeaders(groups);
      });
      console.log('Map: ' + groupLeaders);
    });
  };

  useEffect(() => {
    readAdministrators();
    readLeaders();
    readGroups();
    readGroupsWithLeaders();
    group.notify(() => {
      setHidden('hidden');
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //Gives the group selector if the adding a leader
  //Otherwise, leaves it blank
  const addGroupSelect = () => {
    if (type === 'Leader') {
      const { selectedOption } = organization;
      return (
        <Grid item style={{ height: 425 }}>
          <FormControl margin='normal' disabled={disabled}>
            <div style={{ width: 500 }}>
              <Select
                label='Select Group'
                value={selectedOption}
                onChange={(e) => setOrganization(e.value)}
                options={groups.map((group) => {
                  return { value: group, label: group };
                })}
              />
            </div>
          </FormControl>
        </Grid>
      );
    }
  };

  const handleFileChanged = (data) => {
    console.log(data);
    console.log(demographicsFile.length);
    setDemographicsFile(data);
  };

  const adminChildren = [];
  const leaderChildren = [];

  // Build the administrator components to display
  for (var i = 0; i < admins.length; i += 1) {
    let index = i;
    adminChildren.push(
      <ChildComponent
        key={index}
        email={admins[index]}
        removeAction={() => removeAction('/admin/', admins[index], '')}
      ></ChildComponent>
    );
  }

  // Build the leader components to display
  let index = 0;
  if (groupLeaders.size > 0) {
    for (var [name, value] of groupLeaders.entries()) {
      leaderChildren.push(
        <GroupTitleComponent group={name}></GroupTitleComponent>
      );
      for (var j = 0; j < value.length; j += 1) {
        let email = value[j];
        let org = name;
        leaderChildren.push(
          <ChildComponent
            key={index}
            email={email}
            removeAction={() => removeAction('/leaders/', email, org)}
          ></ChildComponent>
        );
        index++;
      }
    }
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
          <Grid item style={{ width: '50%' }}>
            <Paper style={{ padding: 20, marginRight: 20 }}>
              <AdminParentComponent
                title={'Administrators:'}
                addAction={() => addAction('/admin/', 'Administrator')}
              >
                {adminChildren}
              </AdminParentComponent>
            </Paper>
          </Grid>
          <Grid item style={{ width: '50%' }}>
            <Paper style={{ padding: 20 }}>
              <LeaderParentComponent
                title={'Leaders:'}
                addAction={() => addAction('/leaders/', 'Leader')}
                upload={() => uploadAction()}
              >
                {leaderChildren}
              </LeaderParentComponent>
            </Paper>
          </Grid>
        </Grid>
      </Grid>
      <Dialog
        onClose={handleClose}
        aria-labelledby='customized-dialog-title'
        open={adding}
      >
        <DialogTitle
          id='customized-dialog-title'
          // onClose={handleCloseEdit}
        >
          Add {type}
        </DialogTitle>
        <DialogContent>
          <Grid container>
            <Grid item container direction='column' spacing={0}>
              <Grid item>
                <TextField
                  autoFocus={true}
                  style={{ width: 300 }}
                  label='Email'
                  id='email'
                  margin='normal'
                  value={email}
                  onChange={handleEmailChange}
                />
              </Grid>
              {addGroupSelect()}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions style={{ justifyContent: 'center' }}>
          <Button variant='contained' onClick={handleSave} color='primary'>
            Add User
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        onClose={handleCloseUpload}
        aria-labelledby='customized-dialog-title'
        open={uploading}
      >
        <DialogTitle id='customized-dialog-title'>Upload Leaders</DialogTitle>
        <DialogContent>
          <DialogContentText>
            <h3>Make sure you are uploading a .csv file.</h3>
            <p>
              <strong>How to make a .csv file from Excel</strong>
            </p>
            <ol>
              <li>
                Start Excel and open the spreadsheet you would like to upload.
              </li>
              <li>
                At the top of your screen, click on "File", then "Save As".
              </li>
              <li>
                Click on the dropdown box for "File Format:" (should say "Excel
                Workbook .xlsx).
              </li>
              <li>Select "CSV UTF-8 (Comma delimited) (.csv)</li>
              <li>Save the file to a location you can later find it.</li>
            </ol>
          </DialogContentText>
          <DialogActions>
            <CSVReader
              onFileLoaded={handleFileChanged}
              inputId='something'
              inputStyle={{ color: 'purple' }}
              style={{ margin: 'auto' }}
            />
            <Button
              variant='contained'
              onClick={uploadLeaders}
              style={{ backgroundColor: 'blue' }}
              color='primary'
            >
              Submit
            </Button>
          </DialogActions>
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleting}
        onClose={handleDeleteClose}
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
      >
        <DialogTitle id='alert-dialog-title'>
          {'Are you sure you want to remove this user?'}
        </DialogTitle>
        <DialogContent>
          <label>{email}</label>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteClose} color='primary'>
            Cancel
          </Button>
          <Button onClick={deleteUser} color='primary' autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

// Parent component for a user to be displayed
const AdminParentComponent = (props) => (
  <div style={{ width: 1000 }}>
    <Grid container id='children-pane' direction='column' spacing={2}>
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

const LeaderParentComponent = (props) => (
  <div style={{ width: 1000 }}>
    <Grid container id='children-pane' direction='column' spacing={2}>
      <Grid item container>
        <Typography variant='h5'>{props.title}</Typography>
        <Button
          style={{ marginLeft: 10 }}
          onClick={props.addAction}
          color='primary'
          variant='outlined'
        >
          <AddIcon />
          Add Single Leader
        </Button>
        <Button
          style={{ marginLeft: 10 }}
          onClick={props.upload}
          color='primary'
          variant='outlined'
        >
          <AddIcon />
          Upload Leaders
        </Button>
      </Grid>
      {props.children}
    </Grid>
  </div>
);

// Child component for a user to be displayed
const ChildComponent = (props) => (
  <Grid item container>
    <Typography component='p' style={{ marginTop: 5, marginLeft: 10 }}>
      {props.email}
    </Typography>
    <Button color='primary' onClick={props.removeAction}>
      <CloseIcon />
    </Button>
  </Grid>
);

const GroupTitleComponent = (props) => (
  <Typography component='p' style={{ fontWeight: 'bold' }}>
    {props.group}
  </Typography>
);

export default Users;
