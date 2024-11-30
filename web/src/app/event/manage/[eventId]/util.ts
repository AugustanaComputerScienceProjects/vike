import { format } from "date-fns";

export const toTitleCase = (str) => {
  if (!str) return "";
  return str.replace(/_/g, " ").replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};

export const formatDate = (date) => {
  if (!date) return "";
  return format(new Date(date), "PPpp");
};

export const formatDuration = (minutes) => {
  if (!minutes) return "";
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours === 0) {
    return `${remainingMinutes} minutes`;
  } else if (remainingMinutes === 0) {
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  } else {
    return `${hours} hour${hours > 1 ? 's' : ''} ${remainingMinutes} minutes`;
  }
};

export const generateGoogleCalendarUrl = (event) => {
  if (!event) return "";
  
  const startTime = new Date(event.startDate)
    .toISOString()
    .replace(/-|:|\.\d\d\d/g, "");
  const endTime = new Date(event.endDate)
    .toISOString()
    .replace(/-|:|\.\d\d\d/g, "");
  
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.name || "",
    dates: `${startTime}/${endTime}`,
    details: event.description || "",
    location: event.location || "",
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};
