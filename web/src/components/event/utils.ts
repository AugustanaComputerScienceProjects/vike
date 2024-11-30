import Resizer from "react-image-file-resizer";

export const roundToNearestHalfHour = (date: Date) => {
  const roundedMinutes = Math.round(date.getMinutes() / 30) * 30;
  return new Date(date.setMinutes(roundedMinutes, 0, 0));
};

export const addHours = (date: Date, hours: number) => {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
};

export const handleImageFileChanged = (theFile: File, onFinish: (uri: string) => void) => {
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

export const generateUniqueTicketId = (userHandle: string, eventId: string) => {
  const timestamp = Date.now().toString();
  return `${userHandle}-${eventId}-${timestamp}`;
};
