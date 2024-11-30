import firebase from "@/firebase/config";
import { useEffect, useState } from "react";

const readCalendars = async () => {
  const reference = firebase.database.ref("/calendars").orderByChild("name");
  const snapshot = await reference.once("value");
  const calendars = [];
  const promises = [];

  snapshot.forEach((childSnapshot) => {
    const calendar = childSnapshot.val();
    calendar.key = childSnapshot.key;
    const promise = getImage(calendar.profileId).then((url) => {
      calendar.profileUrl = url;
      calendars.push(calendar);
    });
    promises.push(promise);
  });
  await Promise.all(promises);

  return calendars;
};

// Retrieves a single image from Firebase storage
const getImage = async (profileId) => {
  try {
    const url = await firebase.storage
      .ref("Profiles")
      .child(profileId + ".png")
      .getDownloadURL();
    return url;
  } catch (error) {
    console.error("Error retrieving profile:", error);
    return "default_profile";
  }
};

const useCalendars = () => {
  const [calendars, setCalendars] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCalendars = async () => {
      const calendars = await readCalendars();
      setCalendars(calendars);
      setLoading(false);
    };

    fetchCalendars();
  }, []);

  const refreshCalendars = async () => {
    setLoading(true);
    const calendars = await readCalendars();
    setCalendars(calendars);
    setLoading(false);
  };

  return { calendars, loading, refreshCalendars };
};

export default useCalendars;
