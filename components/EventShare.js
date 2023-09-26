import {useActionSheet} from '@expo/react-native-action-sheet';
import Icon from '@expo/vector-icons/Feather';
import {addMinutes} from 'date-fns';
import * as Calendar from 'expo-calendar';
import React, {useState} from 'react';
import {Alert, TouchableOpacity} from 'react-native';
import {COLORS} from '../constants/theme';

const EventShare = ({event}) => {
  const [calendarAuth, setCalendarAuth] = useState(false);
  const {showActionSheetWithOptions} = useActionSheet();

  const addToCalendar = async () => {
    try {
      const {status} = await Calendar.requestCalendarPermissionsAsync();
      if (status === 'granted') {
        setCalendarAuth(true);
        const calendars = await Calendar.getCalendarsAsync();
        const primaryCalendar = calendars.find(calendar => calendar.isPrimary);
        const startDate = new Date(event.startDate);
        const endDate = addMinutes(startDate, event.duration);

        const details = {
          title: event.name,
          startDate,
          endDate,
          timeZone: 'GMT', // You may need to adjust this based on your needs
          location: event.location,
        };

        const eventId = await Calendar.createEventAsync(
          primaryCalendar.id,
          details,
        );

        if (eventId) {
          Alert.alert(
            'Event added',
            `The event has been added to your calendar.`,
          );
        } else {
          Alert.alert(
            'Error',
            `There was an error adding the event to your calendar.`,
          );
        }
      } else {
        Alert.alert(
          'Calendar permission required',
          'Please grant calendar permission to add the event.',
        );
      }
    } catch (error) {
      console.error(error);
      Alert.alert(
        'Error',
        'An error occurred while adding the event to your calendar.',
      );
    }
  };

  const onSharePress = () => {
    const options = ['Add to Calendar', 'Cancel'];
    const cancelButtonIndex = 1;
    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
      },
      selectedIndex => {
        if (selectedIndex === 0) {
          addToCalendar();
        }
      },
    );
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
      <Icon name="share" size={18} color={COLORS.black} />
    </TouchableOpacity>
  );
};

export default EventShare;
