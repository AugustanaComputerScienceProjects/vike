export const roundToNearestHalfHour = (date) => {
  const roundedMinutes = Math.round(date.getMinutes() / 30) * 30;
  return new Date(date.setMinutes(roundedMinutes, 0, 0));
};

export const addHours = (date, hours) => {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
};
