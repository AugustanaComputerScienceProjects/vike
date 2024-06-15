import {FontAwesome} from '@expo/vector-icons';

import React, {useEffect, useState} from 'react';
import {FlatList, ScrollView, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import EventCard from '../../components/home/EventCard';
import {STATUS, groupEventByDate} from '../../components/home/utils';
import {COLORS} from '../../constants/theme';
import {authInstance, db, getStorageImgURL} from '../../services/firebase';

export default function Home() {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const userHandle = authInstance.currentUser?.email?.split('@')[0];

  useEffect(() => {
    setIsLoading(true);
    const eventsRef = db.ref('/current-events');
    const listener = eventsRef.on('value', async snapshot => {
      if (snapshot.exists()) {
        const unresolved = Object.entries(snapshot.val()).map(
          async ([key, value]) => {
            const imgURL = await getStorageImgURL(value.imgid);
            return {
              id: key,
              image: imgURL,
              ...value,
            };
          },
        );
        const resolved = await Promise.all(unresolved);
        setEvents(resolved);
      } else {
        setEvents([]);
      }
      setIsLoading(false);
    });

    return () => eventsRef.off('value', listener);
  }, []);

  const filteredEvents = events.filter(event => {
    const listGuestData = event.guests;
    return listGuestData && listGuestData[userHandle]?.status === STATUS.GOING;
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
        {!isLoading && filteredEvents.length === 0 ? (
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 16}}>
            <View
              style={{
                flex: 1,
                alignItems: 'center',
                backgroundColor: COLORS.backgroundLight,
                borderRadius: 10,
                padding: 20,
              }}>
              <FontAwesome name="ticket" size={42} color={COLORS.grayPrimary} />
            </View>
            <View style={{flex: 3}}>
              <Text style={{fontSize: 18, fontWeight: 'bold', lineHeight: 35}}>
                No upcoming events
              </Text>
              <Text>Events you are going will show up here.</Text>
            </View>
          </View>
        ) : (
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
                  {dayEvents.map(event => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </View>
              );
            }}
          />
        )}
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
