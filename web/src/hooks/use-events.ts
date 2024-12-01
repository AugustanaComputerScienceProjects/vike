import firebase from "@/firebase/config";
import { useEffect, useState } from "react";

interface Event {
  key: string;
  description: string;
  duration?: string;
  endDate?: string;
  email: string;
  imgid: string;
  location: string;
  name: string;
  organization: string;
  startDate: string;
  tags: string[];
  imageUrl?: string;
  guests?: string[] | Record<string, boolean>;
}

// Normalize event data to handle different formats and missing fields
const normalizeEvent = (event: any): Event | null => {
  try {
    // Required fields - if any of these are missing, the event is invalid
    if (!event.name || !event.startDate) {
      console.warn('Event missing required fields:', event);
      return null;
    }

    // Validate and normalize date
    const startDate = new Date(event.startDate);
    if (isNaN(startDate.getTime())) {
      console.warn('Invalid startDate:', event.startDate);
      return null;
    }

    // Calculate endDate from either endDate field or duration
    let endDate: string | undefined;
    if (event.endDate) {
      const endDateTime = new Date(event.endDate);
      if (!isNaN(endDateTime.getTime())) {
        endDate = endDateTime.toISOString();
      }
    } else if (event.duration) {
      // If duration is provided (in minutes), calculate endDate
      const durationMs = parseInt(event.duration) * 60 * 1000;
      const endDateTime = new Date(startDate.getTime() + durationMs);
      endDate = endDateTime.toISOString();
    }

    return {
      key: event.key,
      name: event.name,
      description: event.description || '',
      email: event.email || '',
      imgid: event.imgid || 'default',
      location: event.location || '',
      organization: event.organization || '',
      startDate: startDate.toISOString(),
      endDate,
      duration: event.duration,
      tags: Array.isArray(event.tags) ? event.tags : [],
      guests: event.guests || {},
      imageUrl: event.imageUrl,
    };
  } catch (error) {
    console.error('Error normalizing event:', error, event);
    return null;
  }
};

const readEvents = async (
  eventType: 'current-events' | 'past-events', 
  userEmail: string,
  filterByUser: boolean = false
) => {
  const reference = firebase.database.ref(`/${eventType}`).orderByChild("startDate");
  const snapshot = await reference.once("value");
  const events: Event[] = [];
  const promises = [];

  snapshot.forEach((childSnapshot) => {
    const rawEvent = childSnapshot.val();
    rawEvent.key = childSnapshot.key;
    
    const normalizedEvent = normalizeEvent(rawEvent);
    if (!normalizedEvent) return; // Skip invalid events

    // For past events, check if user is creator or participant
    // For upcoming events, include all events
    const isCreator = normalizedEvent.email === userEmail;
    const isParticipant = normalizedEvent.guests && (
      Array.isArray(normalizedEvent.guests) 
        ? normalizedEvent.guests.includes(userEmail)
        : Object.prototype.hasOwnProperty.call(normalizedEvent.guests, userEmail)
    );
    
    if (!filterByUser || isCreator || isParticipant) {
      const promise = getImage(normalizedEvent.imgid).then((url) => {
        normalizedEvent.imageUrl = url;
        events.push(normalizedEvent);
      });
      promises.push(promise);
    }
  });
  
  await Promise.all(promises);
  
  // Sort events by date
  return events.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
};

// Retrieves a single image from Firebase storage
const getImage = async (imageId: string) => {
  if (!imageId || imageId === "default" || imageId === "default.jpg") {
    return null;
  }

  try {
    const url = await firebase.storage
      .ref("Images")
      .child(imageId.endsWith('.jpg') ? imageId : `${imageId}.jpg`)
      .getDownloadURL();
    return url;
  } catch (error) {
    console.error("Error retrieving image:", error);
    return null;
  }
};

const useEvents = (userEmail: string) => {
  const [currentEvents, setCurrentEvents] = useState<Event[]>([]);
  const [pastEvents, setPastEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      const [current, past] = await Promise.all([
        readEvents('current-events', userEmail, false), // Show all upcoming events
        readEvents('past-events', userEmail, true)      // Filter past events by user
      ]);
      setCurrentEvents(current);
      setPastEvents(past);
      setLoading(false);
    };

    fetchEvents(); // Remove userEmail check since we want to show all upcoming events
  }, [userEmail]);

  const refreshEvents = async () => {
    setLoading(true);
    const [current, past] = await Promise.all([
      readEvents('current-events', userEmail, false), // Show all upcoming events
      readEvents('past-events', userEmail, true)      // Filter past events by user
    ]);
    setCurrentEvents(current);
    setPastEvents(past);
    setLoading(false);
  };

  return { currentEvents, pastEvents, loading, refreshEvents };
};

export default useEvents;
