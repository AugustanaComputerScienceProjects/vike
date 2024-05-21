import {format} from 'date-fns';

export const groupEventByDate = events => {
  events.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
  const groupedEvents = {};
  events.forEach(event => {
    const date = format(new Date(event.startDate), 'MMM dd eeeeeeee');
    if (!groupedEvents[date]) {
      groupedEvents[date] = [];
    }
    groupedEvents[date].push(event);
  });
  return groupedEvents;
};

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

export const STATUS = {
  GOING: 'GOING',
  CHECKED_IN: 'CHECKED_IN',
  INVITED: 'INVITED',
  NOT_GOING: 'NOT_GOING',
};
