import React from "react";
import ReactDOM from "react-dom";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import Drawer from "@material-ui/core/Drawer";
import NavDrawer from "./NavDrawer";
import firebase from "./config";
import Grid from "@material-ui/core/Grid";

class NavBar extends React.Component {
  constructor(props) {
    super(props);
    this.onNavChanged = this.onNavChanged.bind(this);
    this.state = {
      drawerOpened: false,
      selected: "Add Event",
      btnText: "Sign In",
      signedIn: false,
      title: "Augustana Events - Home",
      userText: ""
    };
  }

  toggleDrawer = booleanValue => () => {
    this.setState({
      drawerOpened: booleanValue
    });
  };

  onNavChanged(page) {
    this.props.navChanged(page);
    this.setState({ title: "Augustana Events - " + page})
  }

  signInAction = () => {
    if (!this.state.signedIn) {
      firebase.signIn();
    } else {
      this.onNavChanged("Home");
      this.setState({ adminSignedIn: false, leaderSignedIn: false });
      firebase.signOut();
    }
  }

  checkRole(user, role) {
    let self = this;
    firebase.database.ref(role).once('value').then(function(snapshot) {
        if (snapshot.hasChild(user.email.replace('.', ','))) {
            if (role === 'admin') {
                self.setState({ adminSignedIn: true, userText: user.email + " (Admin)" });
            } else if (role === 'leaders') {
                self.setState({ leaderSignedIn: true, userText: user.email + " (Leader)" });
            }
        }
      });
}

  componentWillMount() {
    firebase.auth.onAuthStateChanged((user) => {
      if (user) {
        this.checkRole(user, 'admin');
        this.checkRole(user, 'leaders');
        this.setState({ btnText: "Sign Out", signedIn: true });
        if (!this.state.adminSignedIn && !this.state.leaderSignedIn) {
          this.setState({ userText: user.email + " (No Access)" });
        }
      } else {
        this.setState({ btnText: "Sign In", signedIn: false, userText: "" });  
      }
    });
  }

  render() {
    return (
      <div className="App">
        <AppBar position="static">
          <Toolbar variant="dense">
            <IconButton
              color="inherit"
              aria-label="Menu"
              onClick={this.toggleDrawer(true)}
            >
              <MenuIcon />
            </IconButton>
            <Grid
      justify="space-between" // Add it here :)
      container 
      spacing={24}>
      <Grid item><Typography variant="h6" color="inherit">
              {this.state.title}
            </Typography></Grid>
      <Grid item style={{marginRight: 10, marginTop: 5}}>
        <Typography variant="h7" color="inherit">
          {this.state.userText}
        </Typography>
      </Grid>
    </Grid>
    <Button color="inherit" onClick={this.signInAction} style={{width: 100}}>{this.state.btnText}</Button>
            
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