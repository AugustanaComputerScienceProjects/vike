import React from 'react';
import {Dimensions, FlatList, StyleSheet, Text, View} from 'react-native';
import {COLORS} from '../../constants/theme';
import EventCard from './EventCard';
import { parseDate } from './utils';
import { format } from 'date-fns';

const windowWidth = Dimensions.get('window').width;

const groupEventByDate = (events) => {
  const groupedEvents = {};
  events.forEach(event => { 
    const date = format(new Date(event.startDate), 'MMM dd / eeeeeeee')
    if (!groupedEvents[date]) {
      groupedEvents[date] = [];
    }
    groupedEvents[date].push(event);
  });
  return groupedEvents;
}

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
          marginHorizontal: 20,
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
          // data={data}
          data={Object.entries(groupedEvents)}
          // keyExtractor={item => item.id}
          keyExtractor={(item) => item[0]}
          renderItem={({item}) => {
            const [date, events] = item;
            // return <EventCard event={item} />;
            return (
              <View>
                <Text style={styles.dateText}>{date}</Text>
                {events.map((event) => (
                  <EventCard key={event.id} event={event}/>
                ))}
              </View>
            )
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  dateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 10,
    marginLeft: 20,
  },
});

export default AllEventsList;
