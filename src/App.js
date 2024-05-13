import * as Sentry from "@sentry/react";
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
import AddCalendarView from "./components/calendars/AddCalendarView";
import CalendarsView from "./components/calendars/CalendarView";
import ManageCalendar from "./components/calendars/ManageCalendar";


const SentryRoute = Sentry.withSentryRouting(Route);

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
          <SentryRoute exact path="/" component={Home} />
          <SentryRoute path="/add-event" component={AddEventView} />
          <SentryRoute path="/pending-events" component={PendingEvents} />
          <SentryRoute path="/events" component={CurrentEvents} />
          <SentryRoute path="/past-events" component={PastEvents} />
          <SentryRoute path="/event" component={Event} />
          <SentryRoute path="/manage/:eventId" component={ManageEvent} />
          <SentryRoute path="/check-in/:eventId" component={CheckInPage} />
          <SentryRoute path="/tags" component={Tags} />
          <SentryRoute path="/users" component={Users} />
          <SentryRoute path="/calendars" component={AddCalendarView} />
          <SentryRoute path="/calendar-view" component={CalendarsView}/>
          <SentryRoute path="/calendar-manage/:calendarId" component={ManageCalendar}/>
        </div>
      </div>
    </div>
  );
};

export default App;
