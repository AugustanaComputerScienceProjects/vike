import firebase from "@/firebase/config";
import { useEffect, useState } from "react";

const useCalendarEvents = (calendarId) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    try {
      const eventsRef = firebase.database.ref(
        `/calendars/${calendarId}/eventsCalendar`
      );
      const snapshot = await eventsRef.once("value");
      const eventsData = snapshot.val();

      if (eventsData) {
        const eventsArray = Object.entries(eventsData).map(([id, data]) => ({
          id,
          ...data,
        }));
        setEvents(eventsArray);
      } else {
        setEvents([]);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (calendarId) {
      fetchEvents();
    }
  }, [calendarId]);

  return { events, loading, refreshEvents: fetchEvents };
};

export default useCalendarEvents; 