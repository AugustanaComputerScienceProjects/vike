import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import HomeIcon from '@material-ui/icons/Home';
import MenuIcon from '@material-ui/icons/Menu';
import React from 'react';
import firebase from '../config';
import NavDrawer from '../components/NavDrawer';

// File for managing the top app bar

class NavBar extends React.Component {
  constructor(props) {
    super(props);
    this.onNavChanged = this.onNavChanged.bind(this);
    this.state = {
      drawerOpened: false,
      selected: 'Add Event',
      btnText: 'Sign In',
      signedIn: false,
      title: 'Augustana Events - Home',
      userText: '',
      icon: <MenuIcon />,
    };
  }

  // Toggles opening/closing the drawer (NavDrawer)
  toggleDrawer = (booleanValue) => () => {
    if (this.state.isNotHome) {
      window.history.pushState('object or string', 'Title', '/');
      window.location.reload();
    } else {
      this.setState({
        drawerOpened: booleanValue,
      });
    }
  };

  // When clicking on a page to navigate to, changes the title of the app bar
  onNavChanged(page) {
    this.props.navChanged(page);
    this.setState({ title: 'Augustana Events - ' + page });
  }

  // Action for signing the user in and signing the user out
  signInAction = () => {
    if (!this.state.signedIn) {
      firebase.signIn();
    } else {
      this.onNavChanged('Home');
      this.setState({ adminSignedIn: false, leaderSignedIn: false });
      firebase.signOut();
    }
  };

  // Checks the role of the current user and displays their email and role in the right side of the app bar
  checkRole(user, role) {
    let self = this;
    firebase.database
      .ref(role)
      .once('value')
      .then(function(snapshot) {
        if (snapshot.hasChild(user.email.replace('.', ','))) {
          if (role === 'admin') {
            self.setState({
              adminSignedIn: true,
              userText: user.email + ' (Admin)',
            });
          } else if (role === 'leaders' && !self.state.adminSignedIn) {
            self.setState({
              leaderSignedIn: true,
              userText: user.email + ' (Leader)',
            });
          }
        }
      });
  }

  // Checks if the current page is an event page, if so, changes the left icon of the app bar to take to home
  checkReload() {
    if (window.location.href.includes('event?')) {
      this.setState({
        icon: <HomeIcon />,
        isNotHome: true,
        title: 'Augustana Events - Check In',
      });
    } else {
      this.setState({ icon: <MenuIcon />, isNotHome: false });
    }
  }
  // Component Will Mount, check which icon is needed and listen to Firebase auth
  componentWillMount() {
    this.checkReload();
    firebase.auth.onAuthStateChanged((user) => {
      if (user) {
        this.checkRole(user, 'admin');
        this.checkRole(user, 'leaders');
        this.setState({ btnText: 'Sign Out', signedIn: true });
        if (!this.state.adminSignedIn && !this.state.leaderSignedIn) {
          this.setState({ userText: user.email + ' (Student)' });
        }
      } else {
        this.setState({ btnText: 'Sign In', signedIn: false, userText: '' });
      }
    });
  }

  // Render the app bar
  render() {
    return (
      <div className='App'>
        <AppBar position='static'>
          <Toolbar variant='dense'>
            <IconButton
              color='inherit'
              aria-label='Menu'
              onClick={this.toggleDrawer(true)}
            >
              {this.state.icon}
            </IconButton>
            <Grid
              justify='space-between' // Add it here :)
              container
              spacing={24}
            >
              <Grid item>
                <Typography variant='h6' color='inherit'>
                  {this.state.title}
                </Typography>
              </Grid>
              <Grid item style={{ marginRight: 10, marginTop: 5 }}>
                <Typography variant='h7' color='inherit'>
                  {this.state.userText}
                </Typography>
              </Grid>
            </Grid>
            <Button
              color='inherit'
              onClick={this.signInAction}
              style={{ width: 100 }}
            >
              {this.state.btnText}
            </Button>
          </Toolbar>
        </AppBar>

        <NavDrawer
          drawerOpened={this.state.drawerOpened}
          toggleDrawer={this.toggleDrawer}
          navChanged={this.onNavChanged}
        />
      </div>
    );
  }
}

export default NavBar;
