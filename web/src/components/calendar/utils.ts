import { Event } from "@/firebase/types";
import { format } from "date-fns";
import Resizer from "react-image-file-resizer";

export const roundToNearestHalfHour = (date: Date): Date => {
  const roundedMinutes = Math.round(date.getMinutes() / 30) * 30;
  return new Date(date.setMinutes(roundedMinutes, 0, 0));
};

export const addHours = (date: Date, hours: number): Date => {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
};

export const handleImageFileChanged = (
  theFile: File,
  onFinish: (uri: string) => void
): void => {
  Resizer.imageFileResizer(
    theFile,
    2160,
    1080,
    "JPEG",
    100,
    0,
    (uri: string) => {
      onFinish(uri);
    },
    "base64"
  );
};

export const generateUniqueTicketId = (
  userHandle: string,
  eventId: string
): string => {
  const timestamp = Date.now().toString();
  return `${userHandle}-${eventId}-${timestamp}`;
};

export const EVENT_STATUS = {
  GOING: "GOING",
  CHECKED_IN: "CHECKED_IN",
  INVITED: "INVITED",
  NOT_GOING: "NOT_GOING",
};

export const CALENDAR_STATUS = {
  SUBSCRIBED: "SUBSCRIBED",
  NOT_SUBSCRIBED: "NOT_SUBSCRIBED",
};

export const groupEventsByDate = (events: Event[]): Record<string, Event[]> => {
  const groupedEvents: Record<string, Event[]> = {};
  events.forEach((event) => {
    const eventDate = new Date(event.startDate);
    const dateKey = format(eventDate, "yyyy-MM-dd");
    if (!groupedEvents[dateKey]) {
      groupedEvents[dateKey] = [];
    }
    groupedEvents[dateKey].push(event);
  });
  return groupedEvents;
};
