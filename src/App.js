import React from "react";
import { Route } from "react-router-dom";
import "./App.css";
import Event from "./routes/Event";
import AddEventView from "./views/AddEventView";
import CheckInPage from "./views/CheckIn";
import CurrentEvents from "./views/CurrentEvents";
import Home from "./views/Home";
import ManageEvent from "./views/ManageEvent";
import NavBar from "./views/NavBar";
import PastEvents from "./views/PastEvents";
import PendingEvents from "./views/PendingEvents";
import Tags from "./views/Tags";
import Users from "./views/Users";

// Main application file that manages all the different views

const App = () => {
  const onNavChanged = () => {};
  return (
    <div className="fullPage">
      <div style={{ width: "100%", position: "absolute" }}>
        <div style={{ height: "10%" }}>
          <NavBar navChanged={onNavChanged} />
        </div>
        <div
          style={{
            paddingLeft: 20,
            paddingRight: 20,
            paddingTop: 20,
            marginBottom: 20,
          }}
        >
          <Route exact path="/" component={Home} />
          <Route path="/add-event" component={AddEventView} />
          <Route path="/pending-events" component={PendingEvents} />
          <Route path="/events" component={CurrentEvents} />
          <Route path="/past-events" component={PastEvents} />
          <Route path="/event" component={Event} />
          <Route path="/manage/:eventId" component={ManageEvent} />
          <Route path="/check-in/:eventId" component={CheckInPage} />
          <Route path="/tags" component={Tags} />
          <Route path="/users" component={Users} />
        </div>
      </div>
    </div>
  );
};

export default App;
