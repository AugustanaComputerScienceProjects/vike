import firebase from "@/firebase/config";
import { useEffect, useState } from "react";

const useCalendar = (calendarId) => {
  const [calendar, setCalendar] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCalendar = async () => {
      try {
        const calendarRef = firebase.database.ref(`/calendars/${calendarId}`);
        const snapshot = await calendarRef.once("value");
        const calendarData = snapshot.val();
        
        if (calendarData) {
          // Get profile image if exists
          if (calendarData.profileId && calendarData.profileId !== "vike") {
            try {
              const url = await firebase.storage
                .ref("Profiles")
                .child(calendarData.profileId + ".png")
                .getDownloadURL();
              calendarData.profileUrl = url;
            } catch (error) {
              console.error("Error loading profile image:", error);
            }
          }
          
          setCalendar({
            ...calendarData,
            key: calendarId,
          });
        }
      } catch (error) {
        console.error("Error fetching calendar:", error);
      } finally {
        setLoading(false);
      }
    };

    if (calendarId) {
      fetchCalendar();
    }
  }, [calendarId]);

  return { calendar, loading };
};

export default useCalendar; 