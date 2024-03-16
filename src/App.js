import React, { useState } from "react";
import { Route, BrowserRouter as Router } from "react-router-dom";
import "./App.css";
import ManageEvent from "./components/events/ManageEvent";
import Event from "./routes/Event";
import AddEventView from "./views/AddEventView";
import CurrentEvents from "./views/CurrentEvents";
import Home from "./views/Home";
import NavBar from "./views/NavBar";
import PastEvents from "./views/PastEvents";
import PendingEvents from "./views/PendingEvents";
import Tags from "./views/Tags";
import Users from "./views/Users";

// Main application file that manages all the different views

const App = () => {
  const [selected, setSelected] = useState("Home");

  // Checks which display should be visible
  const mainDisplay = () => {
    if (selected === "Home") {
      return Home;
    }

    if (selected === "Add Event") {
      return AddEventView;
    }

    if (selected === "Pending Events") {
      return PendingEvents;
    }

    if (selected === "Current Events") {
      return CurrentEvents;
    }

    if (selected === "Past Events") {
      return PastEvents;
    }

    if (selected === "Groups/Tags") {
      return Tags;
    }

    if (selected === "Users") {
      return Users;
    }
  };

  // Called when a different page is selected, set the state to that page
  const onNavChanged = (page) => {
    setSelected(page);
  };

  // Render the page
  return (
    <div className="fullPage">
      <div style={{ width: "100%", position: "absolute" }}>
        <div style={{ height: "10%" }}>
          <NavBar navChanged={onNavChanged}></NavBar>
        </div>
        <div
          style={{
            paddingLeft: 20,
            paddingRight: 20,
            paddingTop: 20,
            marginBottom: 20,
          }}
        >
          <Router>
            <Route path="/" exact component={mainDisplay()} />
            <Route path="/event" component={Event} />
            <Route path="/manage/:eventId" component={ManageEvent} />
          </Router>
        </div>
      </div>
    </div>
  );
};

export default App;
