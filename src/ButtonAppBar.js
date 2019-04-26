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

class NavBar extends React.Component {
  constructor(props) {
    super(props);
    this.onNavChanged = this.onNavChanged.bind(this);
    this.state = {
      drawerOpened: false,
      selected: "Add Event",
      btnText: "Sign In",
      signedIn: false
    };
  }

  toggleDrawer = booleanValue => () => {
    this.setState({
      drawerOpened: booleanValue
    });
  };

  onNavChanged(page) {
    this.props.navChanged(page);
  }

  signInAction = () => {
    if (!this.state.signedIn) {
      firebase.signIn();
    } else {
      firebase.signOut();
    }
  }

  componentWillMount() {
    firebase.auth.onAuthStateChanged((user) => {
      if (user) {
        this.setState({ btnText: "Sign Out", signedIn: true });
      } else {
        this.setState({ btnText: "Sign In", signedIn: false });  
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
            <Typography variant="h6" color="inherit">
              Augustana Events
            </Typography>
            <Button color="inherit" style={{marginLeft: "auto"}} onClick={this.signInAction}>{this.state.btnText}</Button>
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