import database from '@react-native-firebase/database';
import storage from '@react-native-firebase/storage';
import React, {useEffect, useState} from 'react';
import {FlatList, ScrollView, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import SearchBar from '../../components/common/SearchBar';
import AllEventsList from '../../components/home/AllEventsList';
import EventCard from '../../components/home/EventCard';
import FeaturedList from '../../components/home/FeaturedList';
import {COLORS} from '../../constants/theme';

export const getStorageImgURL = async imageName => {
  const imgURL = await storage()
    .ref('Images/' + imageName + '.jpg')
    .getDownloadURL();
  return imgURL;
};

export default function Discover() {
  const [events, setEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredEvents, setFilteredEvents] = useState([]);

  useEffect(() => {
    if (searchQuery === '') {
      setFilteredEvents(events);
    } else {
      const filtered = events.filter(event =>
        event.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
      setFilteredEvents(filtered);
    }
  }, [searchQuery, events]);

  const handleSearch = query => {
    setSearchQuery(query);
  };

  const handleCloseSearch = () => {
    setSearchQuery('');
  };

  useEffect(() => {
    const eventsRef = database().ref('/current-events');
    const fetchEvents = eventsRef.on('value', async snapshot => {
      const unresolved = Object.entries(snapshot.val() || {}).map(
        async childSnapShot => {
          const [key, value] = childSnapShot;

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
    });

    return () => eventsRef.off('value', fetchEvents);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{
          padding: 20,
        }}>
        <Text style={styles.heading}>Explore Events</Text>

        <SearchBar onSearch={handleSearch} onClose={handleCloseSearch} />

        {searchQuery === '' ? (
          <>
            <FeaturedList data={events?.slice(0, 5)} />
            <AllEventsList data={events || []} />
          </>
        ) : (
          <FlatList
            scrollEnabled={false}
            data={filteredEvents}
            keyExtractor={item => item.id}
            renderItem={({item}) => <EventCard event={item} />}
            contentContainerStyle={styles.listContainer}
          />
        )}
        <View style={{flex: 1, height: 100}} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    flex: 1,
  },
  heading: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  listContainer: {
    paddingBottom: 16,
  },
});
