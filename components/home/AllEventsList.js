import React from 'react';
import {FlatList, StyleSheet, Text, View} from 'react-native';
import {COLORS} from '../../constants/theme';
import EventCard from './EventCard';
import {groupEventByDate} from './utils';

const AllEventsList = ({data}) => {
  const groupedEvents = groupEventByDate(data);

  return (
    <View
      style={{
        height: '100%',
        width: '100%',
        flex: 1,
      }}>
      <View
        style={{
          marginTop: 20,
        }}>
        <Text
          style={{
            fontSize: 24,
            fontWeight: 'bold',
            color: COLORS.text,
          }}>
          All Events
        </Text>
      </View>
      <View>
        <FlatList
          scrollEnabled={false}
          data={Object.entries(groupedEvents)}
          keyExtractor={item => item[0]}
          renderItem={({item}) => {
            const [date, events] = item;
            const [month, day, dayOfWeek] = date.split(' ');
            return (
              <View>
                <Text style={styles.dateText}>
                  <Text style={{fontWeight: '500', color: COLORS.text}}>
                    {month} {day}{' '}
                  </Text>
                  /<Text> {dayOfWeek}</Text>
                </Text>
                {events.map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
              </View>
            );
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  dateText: {
    color: COLORS.gray,
    fontSize: 18,
    fontWeight: '500',
    marginLeft: 10,
    marginTop: 10,
  },
});

export default AllEventsList;
