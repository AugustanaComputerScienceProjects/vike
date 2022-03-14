import moment from 'moment';
import {useToast} from 'native-base';
import React from 'react';
import {ActionSheetIOS, Alert} from 'react-native';
import RNCalendarEvents from 'react-native-calendar-events';
import {TouchableOpacity} from 'react-native-gesture-handler';
import Share from 'react-native-share';
import {Icon} from '../../components/icons';
import {COLORS} from '../../constants';
import {Event} from '../../screens/home';

interface IProps {
  event: Event;
}

const EventShare = ({event}: IProps) => {
  const toast = useToast();

  const addToCalendar = async () => {
    let auth = false;
    await RNCalendarEvents.requestPermissions().then(
      result => {
        console.log('Auth requested', result);
      },
      error => {
        console.error(error);
      },
    );

    await RNCalendarEvents.checkPermissions().then(
      result => {
        console.log('Auth check', result);
        if (result) {
          auth = true;
        }
      },
      error => {
        console.error(error);
      },
    );
    if (auth) {
      const calendars = await RNCalendarEvents.findCalendars();
      const primaryCalendar = calendars.find(
        calendar => calendar.isPrimary === true,
      );
      const title = 'Add to Calendar?';
      const message = `"${event.name}" will be added to the ${primaryCalendar?.title} calendar on your phone.`;
      const buttons = [
        {
          text: 'Save Event',
          onPress: () => {
            RNCalendarEvents.saveEvent(event.name, {
              startDate: moment(event?.startDate).toISOString(),
              endDate: moment(event?.startDate)
                .add(event?.duration, 'minutes')
                .toISOString(),
              location: event?.location,
            })
              .then(async () => {
                toast.show({
                  title: 'Event added!',
                  status: 'success',
                  description: `This event has been added to ${primaryCalendar?.title} calendar`,
                });
              })
              .catch(error => console.log(error));
          },
        },
        //TODO: Change user's calendar of the event
        // {
        //   text: 'Change Calendar',
        //   onPress: () => this.setState({userSelection: 'Option B'}),
        // },
        {text: 'Cancel', type: 'cancel', style: 'destructive'},
      ];
      Alert.alert(title, message, buttons);
    }
  };

  const onSharePress = () =>
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: ['Share this event', 'Add to calendar', 'Cancel'],
        cancelButtonIndex: 2,
      },
      buttonIndex => {
        if (buttonIndex === 0) {
          // cancel action
          onShare();
        } else if (buttonIndex === 1) {
          // add to calendar
          addToCalendar();
        }
      },
    );

  const onShare = async () => {
    console.log('share');
    try {
      const result = await Share.open({
        title: event?.name,
        // message:
        //   'Please install this app and stay safe , AppLink :https://play.google.com/store/apps/details?id=nic.goi.aarogyasetu&hl=en',
        url: 'https://play.google.com/store/apps/details?id=nic.goi.aarogyasetu&hl=en',
      });
      console.log(result.message);
    } catch (error: any) {
      console.log(error.message);
    }
  };
  return (
    <TouchableOpacity
      style={{
        width: 40,
        height: 40,
        backgroundColor: COLORS.white,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 100,
      }}
      onPress={onSharePress}>
      <Icon name="share" size={18} color={COLORS.black} style={{}} />
    </TouchableOpacity>
  );
};

export default EventShare;
