import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { DataGrid } from '@mui/x-data-grid';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import React, { useEffect, useState } from 'react';
import XLSX from 'xlsx';
import PastEventObj from '../components/PastEventObj';
import firebase from '../config';

//The main runner of the past event page, contains many past events

const PepsicoCheckInLists = () => {
  const [sortDate1, setSortDate1] = useState('2017-05-24');
  const [sortDate2, setSortDate2] = useState('2017-05-22');
  const [eventsInRange, setEventsInRange] = useState([]);
  const [sortModel, setSortModel] = useState([
    {
      field: 'date',
      sort: 'desc',
    },
  ]);

  const [filteredEvents, setFilteredEvents] = useState([]);
  const [events, setEvents] = useState([]);
  const [hidden, setHidden] = useState('visible');
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    readPastEvents();
  }, []);

  const readPastEvents = () => {
    firebase.database
      .ref('/past-pepsico')
      .orderByChild('startDate')
      .on('value', (snapshot) => {
        let listEvents = [];
        snapshot.forEach((childSnapshot) => {
          let webEvent = childSnapshot.val();
          // console.log(childSnapshot.key);

          let len = 0;

          if (webEvent.hasOwnProperty('users')) {
            //    webEvent["users"].forEach(function(user){
            //      len++
            // })
            let users = webEvent['users'];
            len = Object.keys(users).length;
          }

          let arr = webEvent['startDate'].split(' ');
          let arr2 = arr[0].split('-');
          // let arr3 = arr[1].split(':');
          let date = arr2[0] + '-' + arr2[1] + '-' + arr2[2];

          let event = new PastEventObj(
            childSnapshot.key,
            webEvent['name'],
            date,
            len,
            webEvent['users']
          );
          listEvents.push(event);
        });
        setEvents(listEvents);
        setEventsInRange(listEvents);
        setFilteredEvents(listEvents);
        setSortDate1(listEvents[0].getDate());
        setSortDate2(listEvents[listEvents.length - 1].getDate());
        setHidden('hidden');
      });
  };

  const createDisplayEvents = async (d1, d2) => {
    let startInd = events.length;
    let endInd = -2;

    var moment = require('moment');

    for (let i = 0; i < events.length; i++) {
      let date = events[i].getDate();
      if (moment(date).isSameOrAfter(d1)) {
        startInd = i;
        i = events.length;
      }
    }
    for (let i = startInd; i < events.length; i++) {
      let date = new Date(events[i].getDate());
      if (moment(date).isAfter(d2)) {
        endInd = i;
        i = events.length;
      }
    }

    //if no end was found
    if (endInd === -2) {
      endInd = events.length;
    }

    let displayedEvents = [];

    for (let i = startInd; i < endInd; i++) {
      displayedEvents.push(events[i]);
    }

    //this was done to prevent a display bug (threading issues)
    await setEventsInRange([]);
    await setEventsInRange(displayedEvents);
    filterEvents(searchText, displayedEvents);
  };

  //changes the date for the first date picker (and updates the display)
  const handleDate1Change = (e) => {
    let date = new Date(e);
    var month = (1 + date.getMonth()).toString();
    month = month.length > 1 ? month : '0' + month;
    var day = date.getDate().toString();
    day = day.length > 1 ? day : '0' + day;

    let date1 = date.getFullYear() + '-' + month + '-' + day;

    setSortDate1(date1);
    createDisplayEvents(sortDate1, sortDate2);
  };

  //changes the date for the second date picker (and updates the display)
  const handleDate2Change = (e) => {
    let date = new Date(e);
    var month = (1 + date.getMonth()).toString();
    month = month.length > 1 ? month : '0' + month;
    var day = date.getDate().toString();
    day = day.length > 1 ? day : '0' + day;

    let date2 = date.getFullYear() + '-' + month + '-' + day;

    setSortDate2(date2);
    createDisplayEvents(sortDate1, sortDate2);
  };

  //handles the search bar changing
  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
    filterEvents(e.target.value, eventsInRange);
  };

  //clears the search bar
  const handleClear = () => {
    setSearchText('');

    filterEvents('', eventsInRange);
  };

  //filters the display based on search results
  const filterEvents = async (text, originalEvents) => {
    var index = 0;
    let filtered = [];
    originalEvents.forEach((event) => {
      if (event['title'].toLowerCase().includes(text.toLowerCase())) {
        filtered.push(event);
      }
      index = index + 1;
    });

    await setFilteredEvents([]);
    await setFilteredEvents(filtered);
  };

  //Uses XLSX - npm to run
  //Downloads an XL doc onto the local machine
  const downloadXLDoc = (title, studentList) => {
    if (studentList) {
      let workbook = XLSX.utils.book_new();
      let users = Object.keys(studentList);

      // eslint-disable-next-line no-array-constructor
      let usersSheet = new Array();

      users.forEach((userName) => {
        usersSheet.push(JSON.parse('{"name":"' + userName + '"}'));
      });

      usersSheet = XLSX.utils.json_to_sheet(usersSheet);
      XLSX.utils.book_append_sheet(workbook, usersSheet, 'Attendee List');

      XLSX.writeFile(workbook, title + 'Attendees.xlsx');
    }
  };

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
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <Paper
            style={{
              padding: '2px 4px',
              display: 'flex',
              alignItems: 'center',
              width: 400,
            }}
            elevation={1}
          >
            <SearchIcon style={{ padding: 10 }} />
            <InputBase
              style={{ width: 300 }}
              placeholder='Search Events'
              value={searchText}
              onChange={handleSearchChange}
            />
            <IconButton onClick={handleClear}>
              <CloseIcon />
            </IconButton>
          </Paper>
        </div>
      </div>

      <Grid
        container
        direction='row'
        justifyContent='center'
        alignContent='center'
      >
        <LocalizationProvider dateAdapter={AdapterMoment}>
          <Grid
            container
            direction='row'
            justifyContent='center'
            alignItems='flex-start'
          >
            <Grid item>
              <DatePicker
                margin='normal'
                label='Start Date'
                value={sortDate1}
                onChange={handleDate1Change}
                renderInput={(params) => <TextField {...params} />}
              />
            </Grid>

            <Grid item>
              <Typography variant='subtitle1' style={{ padding: '30px' }}>
                To
              </Typography>
            </Grid>

            <Grid item>
              <DatePicker
                margin='normal'
                label='End Date'
                value={sortDate2}
                onChange={handleDate2Change}
                renderInput={(params) => <TextField {...params} />}
              />
            </Grid>
          </Grid>
        </LocalizationProvider>
        <div style={{ display: 'flex', height: '80vh', width: '100vw' }}>
          <div style={{ flexGrow: 1 }}>
            <DataGrid
              sortModel={sortModel}
              onSortModelChange={(model) => setSortModel(model)}
              rows={filteredEvents}
              columns={[
                { field: 'title', headerName: 'Title', minWidth: 150, flex: 1 },
                {
                  field: 'date',
                  headerName: 'Date',
                  minWidth: 30,
                  flex: 1,
                },
                {
                  field: 'numAttend',
                  headerName: 'Total Attendance',
                  minWidth: 150,
                },
                {
                  field: 'action',
                  headerName: 'Action',
                  sortable: false,
                  flex: 1,
                  renderCell: (params) => {
                    let buttonDisabled = false;
                    if (params.getValue(params.id, 'stuList') == null)
                      buttonDisabled = true;
                    return (
                      <Button
                        onClick={() =>
                          downloadXLDoc(
                            params.getValue(params.id, 'title'),
                            params.getValue(params.id, 'stuList')
                          )
                        }
                        disabled={buttonDisabled}
                      >
                        Download XL Doc
                      </Button>
                    );
                  },
                },
              ]}
              checkboxSelection
            />
          </div>
        </div>
      </Grid>
    </div>
  );
};

export default PepsicoCheckInLists;
