import moment from 'moment';

// call this function, passing-in your date
export const parseDate = (myDate: string) => {
  // ensure the date is displayed with today and yesterday
  return moment(myDate).calendar(null, {
    // when the date is closer, specify custom values
    lastWeek: '[Last] dddd',
    lastDay: '[Yesterday]',
    sameDay: '[Today] [at] hh:mm A',
    nextDay: '[Tomorrow] [at] hh:mm A',
    nextWeek: 'dddd [at] hh:mm A',
    // when the date is further away, use from-now functionality
    sameElse: 'MMMM D (dddd) [at] hh:mm A',
  });
};
