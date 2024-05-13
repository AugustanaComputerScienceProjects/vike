import { useEffect, useState } from "react";
import firebase from "../../config"; 

const decodeGroup = (codedGroup) => {
  let group = codedGroup;
  if (typeof group === "string" || group instanceof String) {
    group = group.replace(/\*%&/g, ".");
    group = group.replace(/@%\*/g, "$");
    group = group.replace(/\*<=/g, "[");
    group = group.replace(/<@\+/g, "]");
    group = group.replace(/!\*>/g, "#");
    group = group.replace(/!<\^/g, "/");
  }
  return group;
};

const useRoleData = () => { 
  const [adminSignedIn, setAdminSignedIn] = useState(false);
  const [leaderSignedIn, setLeaderSignedIn] = useState(false);
  const [databaseTags, setDatabaseTags] = useState([]);
  const [groups, setGroups] = useState([]);
  const [calendars, setCalendars] = useState([]);

  useEffect(() => {
    readTags();
    firebase.auth.onAuthStateChanged((user) => {
      if (user) {
        checkRole(user, "admin");
        checkRole(user, "leaders");
      } else {
        setAdminSignedIn(false);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkRole = (user, role) => {
    firebase.database
      .ref(role)
      .once("value")
      .then((snapshot) => {
        if (snapshot.hasChild(user.email.replace(".", ","))) {
          if (role === "admin") {
            setAdminSignedIn(true);
            readAllGroups();
            readAllCalendars();
          } else if (role === "leaders" && !adminSignedIn) {
            setLeaderSignedIn(true);
            readLeaderGroups();
          }
        }
      });
  };

  const readLeaderGroups = () => {
    let email = firebase.auth.currentUser.email;
    let ref = firebase.database
      .ref("/leaders")
      .child(email.replace(".", ","))
      .child("groups");
    ref.on("value", (snapshot) => {
      let myGroups = [];
      snapshot.forEach((child) => {
        let decodedGroup = decodeGroup(child.key);
        myGroups.push(decodedGroup);
      });
      setGroups(myGroups);
    });
  };

  const readAllCalendars = async () => {
    let calendarRef = firebase.database.ref("/calendars").orderByChild("name");
    const snapshot = await calendarRef.once("value"); 
    const calendarList = [];

    snapshot.forEach((childSnapshot) => {
      const calendar = childSnapshot.val();
      calendar.key = childSnapshot.key;
      calendarList.push(calendar.name);
    });
    setCalendars(calendarList);
  };

  const readTags = () => {
    let ref = firebase.database.ref("/tags");
    ref.on("value", (snapshot) => {
      let tagsList = [];
      snapshot.forEach((child) => {
        tagsList.push(child.val());
      });
      setDatabaseTags(tagsList);
    });
  };

  const readAllGroups = () => {
    let ref = firebase.database.ref("/groups");
    ref.on("value", (snapshot) => {
      let groupsList = [];
      snapshot.forEach((child) => {
        let decodedGroup = decodeGroup(child.val());
        groupsList.push(decodedGroup);
      });
      setGroups(groupsList);
    });
  };


  return { adminSignedIn, leaderSignedIn, databaseTags, groups, calendars };
};

export default useRoleData;
