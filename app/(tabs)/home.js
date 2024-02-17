import database from '@react-native-firebase/database';
import storage from '@react-native-firebase/storage';
import {Image} from 'expo-image';
import {useEffect, useState} from 'react';
import {FlatList, ScrollView, StyleSheet, Text, View} from 'react-native';
import Animated, {FadeIn} from 'react-native-reanimated';
import {SafeAreaView} from 'react-native-safe-area-context';

import {Link} from 'expo-router';
import React from 'react';
import {SearchBar} from 'react-native-elements';
import AllEventsList from '../../components/home/AllEventsList';
import FeaturedList from '../../components/home/FeaturedList';
import {COLORS} from '../../constants/theme';
import {useEventStore} from '../../context/store';

export const getStorageImgURL = async imageName => {
  const imgURL = await storage()
    .ref('Images/' + imageName + '.jpg')
    .getDownloadURL();
  return imgURL;
};

export default function Home() {
  const events = useEventStore(state => state.events);
  const updateEvents = useEventStore(state => state.updateEvents);

  const [query, setQuery] = useState('');
  const [searchData, setSearchData] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = text => {
    const formattedQuery = text.toLowerCase();
    const filteredData = events?.filter(event => {
      return event.name.toLowerCase().includes(formattedQuery);
    });
    setSearchData(filteredData);
    setQuery(text);
  };

  useEffect(() => {
    const fetchEvents = () => {
      return database()
        .ref('/current-events')
        .on('value', async snapshot => {
          const unresolved = Object.entries(snapshot.val()).map(
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
          updateEvents(resolved);
        });
    };
    fetchEvents();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{
          padding: 16,
        }}>
        {/* Header Section */}
        {!isSearching && query === '' && (
          <View>
            <View>
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: 'bold',
                  color: COLORS.text,
                  marginBottom: 16,
                }}>
                Explore events
              </Text>
            </View>
          </View>
        )}
        {/* Search Section */}
        <View>
          <SearchBar
            placeholder="Search"
            onChangeText={handleSearch}
            value={query}
            onFocus={() => setIsSearching(true)}
            onBlur={() => setIsSearching(false)}
            showCancel={false}
            onClear={() => setSearchData([])}
            containerStyle={{
              borderRadius: 15,
              backgroundColor: COLORS.background,
              borderWidth: 0,
              shadowColor: 'white',
              borderBottomColor: 'transparent',
              borderTopColor: 'transparent',
            }}
            lightTheme={true}
            inputContainerStyle={{
              backgroundColor: COLORS.gray5,
              borderRadius: 10,
              paddingVertical: 4,
              paddingHorizontal: 12,
            }}
            inputStyle={{
              color: COLORS.input,
            }}
          />
        </View>

        {query !== '' && (
          <FlatList
            scrollEnabled={false}
            data={searchData}
            keyExtractor={item => item.id}
            renderItem={({item}) => (
              <Link
                href={{
                  pathname: '/event/[id]',
                  params: {id: item.id, event: item},
                }}>
                <View style={styles.listItem}>
                  <Image source={{uri: item.image}} style={styles.coverImage} />
                  <View style={styles.metaInfo}>
                    <Text style={styles.title}>{`${item.name}`}</Text>

                    <Text
                      style={{
                        color: COLORS.text,
                      }}>{`${item.location} `}</Text>
                  </View>
                </View>
              </Link>
            )}
          />
        )}

        {/* FEATURED */}
        {!isSearching && query === '' && (
          <Animated.View entering={FadeIn.duration(300)}>
            {events && events.length > 0 && (
              <FeaturedList data={events.slice(0, 5)} />
            )}
            {events && events.length > 0 && <AllEventsList data={events} />}
          </Animated.View>
        )}
        <View style={{flex: 1, height: 100}} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  iconStyle: {
    marginLeft: 4,
    color: COLORS.text,
    fontSize: 18,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  coverImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  listItem: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
  },
  metaInfo: {
    paddingLeft: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
});
