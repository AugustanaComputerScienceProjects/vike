export const parseDate = dateString => {
  const date = new Date(dateString);
  const formattedDate = date.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  const formattedTime = date.toLocaleString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return {formattedDate, formattedTime};
};
