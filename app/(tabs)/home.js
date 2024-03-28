import auth from '@react-native-firebase/auth';
import React from 'react';
import {FlatList, ScrollView, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {groupEventByDate} from '../../components/home/AllEventsList';
import EventCard from '../../components/home/EventCard';
import {STATUS} from '../../components/home/utils';
import {COLORS} from '../../constants/theme';
import {useEventStore} from '../../context/store';

export default function Home() {
  const currentUser = auth().currentUser;
  const currentUserEmail = currentUser ? currentUser.email : null;
  const userHandle = currentUserEmail.split('@')[0];
  const events = useEventStore(state => state.events);
  const filteredEvents = events.filter(event => {
    const listGuestData = event.guests;
    if (listGuestData) {
      return (
        listGuestData[userHandle] &&
        listGuestData[userHandle].status === STATUS.GOING
      );
    }
    return false;
  });

  const groupedEvents = groupEventByDate(filteredEvents);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{
          padding: 20,
        }}>
        <Text style={styles.heading}>Your Events</Text>
        <FlatList
          scrollEnabled={false}
          data={Object.entries(groupedEvents)}
          keyExtractor={item => item[0]}
          contentContainerStyle={styles.listContainer}
          renderItem={({item}) => {
            const [date, events] = item;
            const [month, day, dayOfWeek] = date.split(' ');
            const dayEvents = filteredEvents.filter(event =>
              events.includes(event),
            );
            return (
              <View>
                <Text style={styles.dateText}>
                  <Text style={{fontWeight: '500', color: COLORS.text}}>
                    {month} {day}{' '}
                  </Text>
                  /<Text> {dayOfWeek}</Text>
                </Text>
                {filteredEvents.length > 0 ? (
                  dayEvents.map(event => (
                    <EventCard key={event.id} event={event} />
                  ))
                ) : (
                  <Text>No events found.</Text>
                )}
              </View>
            );
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    flex: 1,
  },
  dateText: {
    color: COLORS.gray,
    fontSize: 18,
    fontWeight: '500',
    marginLeft: 10,
    marginTop: 10,
  },
  heading: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  listContainer: {
    paddingBottom: 80,
  },
});
