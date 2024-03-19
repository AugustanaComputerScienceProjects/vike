import { useEffect, useState } from "react";
import firebase from "../../config";

// Reads all of the current events from Firebase and updates state
const readEvents = async () => {
  const eventType = "/current-events";
  const reference = firebase.database.ref(eventType).orderByChild("name");

  const snapshot = await reference.once("value");
  const events = [];

  const promises = [];

  snapshot.forEach((childSnapshot) => {
    const event = childSnapshot.val();
    event.key = childSnapshot.key;
    const promise = getImage(event.imgid).then((url) => {
      event.imageUrl = url;
      events.push(event);
    });
    promises.push(promise);
  });
  await Promise.all(promises);

  return events;
};

// Retrieves a single image from Firebase storage
const getImage = async (imageId) => {
  try {
    const url = await firebase.storage
      .ref("Images")
      .child(imageId + ".jpg")
      .getDownloadURL();
    return url;
  } catch (error) {
    console.error("Error retrieving image:", error);
    return null;
  }
};

const useEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      const events = await readEvents();
      setEvents(events);
      setLoading(false);
    };

    fetchEvents();
  }, []);

  const refreshEvents = async () => {
    setLoading(true);
    const events = await readEvents();
    setEvents(events);
    setLoading(false);
  };

  return { events, loading, refreshEvents };
};

export default useEvents;
