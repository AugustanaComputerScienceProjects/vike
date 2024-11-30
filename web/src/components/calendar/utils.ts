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
  file: File | null,
  onSuccess: (uri: string) => void,
  onError?: (error: Error) => void
) => {
  if (!file) {
    onError?.(new Error("No file selected"));
    return;
  }

  // Validate file type
  if (!file.type.startsWith('image/')) {
    onError?.(new Error("Please upload an image file"));
    return;
  }

  // Validate file size (e.g., 5MB max)
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (file.size > maxSize) {
    onError?.(new Error("File size too large. Maximum size is 5MB"));
    return;
  }

  try {
    Resizer.imageFileResizer(
      file,
      800, // max width
      800, // max height
      "JPEG",
      80, // quality
      0, // rotation
      (uri) => {
        onSuccess(uri as string);
      },
      "base64",
      400, // min width
      400, // min height
    );
  } catch (error) {
    console.error("Error resizing image:", error);
    onError?.(error instanceof Error ? error : new Error("Failed to process image"));
  }
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
