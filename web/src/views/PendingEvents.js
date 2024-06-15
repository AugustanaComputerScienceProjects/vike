import React, { Component } from "react";

import EventsView from "../components/events/EventsView";
import firebase from "../config";

// File for managing the Pending Events page

class PendingEvents extends Component {
  //DIFFERENCE7
  // Reads a given user's (reference) pending events from Firebase
  readPendingEvents(ref) {
    let self = this;
    let reference = firebase.database.ref(ref).orderByChild("name");
    this.listeners.push(reference);
    reference.on("value", function(snapshot) {
      let listEvents = [];
      let listURLS = [];
      let index = -1;
      snapshot.forEach(function(child) {
        let event = child.val();
        if (event["email"] !== "Deleted by user") {
          event["status"] = "Status: Pending";
          event["key"] = child.key;
          listEvents.push(event);
          index = index + 1;
          self.getImage(
            self,
            index,
            snapshot,
            listEvents,
            listURLS,
            snapshot.numChildren()
          );
        }
      });
      if (snapshot.numChildren() === 0) {
        self.group.notify(function() {
          self.setState({ events: [], urls: [] });
          if (self.state.isInitial) {
            self.setState({
              hidden: "hidden",
              message: "No Events Found",
              open: true,
            });
          }
        });
      }
      self.setState({ isInitial: false });
    });
  }

  // Render the Pending Events page
  render() {
    return <EventsView eventType={"/pending-events"} />;
  }
}
export default PendingEvents;
