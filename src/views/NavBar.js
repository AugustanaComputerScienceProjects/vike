import HomeIcon from "@mui/icons-material/Home";
import MenuIcon from "@mui/icons-material/Menu";
import AppBar from "@mui/material/AppBar";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import NavDrawer from "../components/NavDrawer";
import firebase from "../config";

const NavBar = (props) => {
  const [drawerOpened, setDrawerOpened] = useState(false);
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState("");
  const [title, setTitle] = useState("Augustana Events");
  const [icon, setIcon] = useState(<MenuIcon />);
  const history = useHistory();

  const toggleDrawer = (booleanValue) => () => {
    setDrawerOpened(booleanValue);
  };

  const signInOrOut = () => {
    if (!user) {
      firebase.signIn();
    } else {
      firebase.signOut().then(() => {
        alert("You've signed out.");
        history.push("/");
        window.location.reload();
      });
    }
  };

  const checkRole = (user) => {
    const roles = ["admin", "leaders"];
    roles.forEach((role) => {
      firebase.database
        .ref(role)
        .once("value")
        .then(function(snapshot) {
          if (snapshot.hasChild(user.email.replace(".", ","))) {
            setUserRole(role.charAt(0).toUpperCase() + role.slice(1)); // Capitalize the first letter
          }
        });
    });
  };

  const checkReload = () => {
    if (window.location.href.includes("event?")) {
      setIcon(<HomeIcon />);
      setTitle("Augustana Events - Check In");
    } else {
      setIcon(<MenuIcon />);
    }
  };

  useEffect(() => {
    checkReload();
    firebase.auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        checkRole(user);
      } else {
        setUser(null);
        setUserRole("");
      }
    });
  }, []);

  return (
    <div className="App">
      <AppBar position="static" open={drawerOpened}>
        <Toolbar variant="dense">
          <IconButton
            color="inherit"
            aria-label="Menu"
            onClick={toggleDrawer(true)}
          >
            {icon}
          </IconButton>
          <Typography variant="h6" color="inherit" sx={{ flexGrow: 1 }}>
            {title}
          </Typography>
          <Typography variant="h7" color="inherit">
            {user ? `${user.email} (${userRole})` : ""}
          </Typography>
          <Button color="inherit" onClick={signInOrOut} style={{ width: 100 }}>
            {user ? "Sign Out" : "Sign In"}
          </Button>
        </Toolbar>
      </AppBar>

      <NavDrawer drawerOpened={drawerOpened} toggleDrawer={toggleDrawer} />
    </div>
  );
};

export default NavBar;
