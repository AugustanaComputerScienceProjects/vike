import React from 'react';
import {Dimensions, FlatList, StyleSheet, Text, View} from 'react-native';
import {COLORS} from '../../constants/theme';
import EventCard from './EventCard';
import { format } from 'date-fns';

const windowWidth = Dimensions.get('window').width;

const groupEventByDate = (events) => {
  const groupedEvents = {};
  events.forEach(event => { 
    const date = format(new Date(event.startDate), 'MMM dd eeeeeeee')
    if (!groupedEvents[date]) {
      groupedEvents[date] = [];
    }
    groupedEvents[date].push(event);
  });
  return groupedEvents;
}

const AllEventsList = ({data}) => {
  if (!data){
    return null;
  }
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
          // marginHorizontal: 10,
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
            const [month, day, dayOfWeek] = date.split(' ');
            // return <EventCard event={item} />;
            return (
              <View>
                {/* <Text style={styles.dateText}>{date}</Text> */}
                <Text style={styles.dateText}>
                  <Text style={{fontWeight: '500', color: COLORS.text}}>{month} {day} </Text> 
                  /
                  <Text> {dayOfWeek}</Text>
                </Text>
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
    fontWeight: '500',
    color: COLORS.gray,
    marginTop: 10,
    marginLeft: 10,
  },
});

export default AllEventsList;
