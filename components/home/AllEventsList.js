import React from 'react';
import {Dimensions, FlatList, StyleSheet, Text, View} from 'react-native';
import {COLORS} from '../../constants/theme';
import EventCard from './EventCard';

const windowWidth = Dimensions.get('window').width;

const AllEventsList = ({data}) => {
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
          data={data}
          keyExtractor={item => item.id}
          renderItem={({item}) => {
            return <EventCard event={item} />;
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
});

export default AllEventsList;
