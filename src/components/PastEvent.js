import { Button, Grid } from '@material-ui/core';
import Typography from '@mui/material/Typography';
import React, { Component } from 'react';
import XLSX from 'xlsx';

//an individual past event, containing the information that each cell contains
class PastEvent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      parentEvent: this.props.parentEvent,
      buttonDisabled: false,
    };
    this.downloadXLDoc = this.downloadXLDoc.bind(this);
    this.checkStuList = this.checkStuList.bind(this);
  }
  checkStuList() {
    if (this.state.parentEvent.getStuList() == null) {
      this.setState({ buttonDisabled: true });
    }
  }

  componentDidMount() {
    this.checkStuList();
  }

  //Uses XLSX - npm to run
  //Downloads an XL doc onto the local machine
  downloadXLDoc() {
    var workbook = XLSX.utils.book_new();
    var users = Object.keys(this.state.parentEvent.getStuList());

    // eslint-disable-next-line no-array-constructor
    var usersSheet = new Array();

    users.forEach(function(userName) {
      usersSheet.push(JSON.parse('{"name":"' + userName + '"}'));
    });

    console.log(usersSheet);

    usersSheet = XLSX.utils.json_to_sheet(usersSheet);
    XLSX.utils.book_append_sheet(workbook, usersSheet, 'Attendee List');

    XLSX.writeFile(
      workbook,
      this.state.parentEvent.getTitle() + 'Attendees.xlsx'
    );
  }

  render() {
    return (
      <div className='fullPage' style={{ width: '400px' }}>
        <Grid container direction='column' style={{ margin: '10px' }}>
          <Typography variant='h6'>
            {this.state.parentEvent.getTitle()} :{' '}
            {this.state.parentEvent.getDate()}
          </Typography>

          <Grid
            container
            item
            // direction='column'
            direction='row'
            justify='space-between'
            alignItems='flex-start'
          >
            <Grid item>
              <Typography variant='subtitle1'>
                Total Attendence : {this.state.parentEvent.getAttend()}
              </Typography>
            </Grid>
          </Grid>
        </Grid>
        <Button
          onClick={this.downloadXLDoc}
          disabled={this.state.buttonDisabled}
        >
          Download XL Doc
        </Button>
      </div>
    );
  }
}

export default PastEvent;
