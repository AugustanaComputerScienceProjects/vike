/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/self-closing-comp */

import database from '@react-native-firebase/database';
import {Input, Text} from 'native-base';
import React, {useEffect, useState} from 'react';
import {FlatList, Keyboard, SafeAreaView, StyleSheet, View} from 'react-native';
import FastImage from 'react-native-fast-image';
import {
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native-gesture-handler';
import Animated, {FadeIn} from 'react-native-reanimated';
import styled from 'styled-components/native';
import AllEventsList from '../components/home/all-events-list';
import FeaturedList from '../components/home/featured-list';
import {Icon} from '../components/icons';
import ScrollView from '../components/scroll-view';
import {COLORS, metrics, SIZES} from '../constants';
import {DataSnapshot, getStorageImgURL} from '../firebase';

export interface Event {
  id: string;
  name: string;
  description: string;
  startDate: string;
  duration: number;
  location: string;
  email: string;
  image: string;
  organization?: string;
  tags?: string;
  webLink?: string;
}
type Entries<T> = {
  [K in keyof T]: [K, T[K]];
}[keyof T][];

function entries<T>(obj: T): Entries<T> {
  return Object.entries(obj) as any;
}
interface IProps {
  navigation: any;
}

const Home = ({navigation}: IProps) => {
  const [events, setEvents] = useState<Event[]>();

  const [query, setQuery] = useState('');
  const [searchData, setSearchData] = useState<Event[] | null>([]);
  const [isSearching, setIsSearching] = useState(false);
  // console.log(searchData);

  const handleSearch = (text: string) => {
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
        .on('value', async (snapshot: DataSnapshot) => {
          const unresolved = entries(snapshot.val()).map(
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
    };
    fetchEvents();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        {!isSearching && query === '' && (
          <Animated.View entering={FadeIn.duration(500)}>
            <SectionHeader>
              <View>
                {/* <Text color={COLORS.text} opacity={0.5}>
              DECEMBER 21 0:10PM
            </Text> */}
                <Text fontSize={'3xl'} fontWeight={'bold'} color={COLORS.text}>
                  Explore events
                </Text>
              </View>
              {/* <Avatar source={images.avatar} /> */}
            </SectionHeader>
          </Animated.View>
        )}
        {/* Search Section */}
        <SectionSearch>
          <SearchView>
            {/* <Icon color={COLORS.text} size={18} name="search" /> */}
            <Input
              // style={{
              //   backgroundColor: COLORS.gray5,
              // }}
              clearButtonMode="while-editing"
              value={query}
              onChangeText={queryText => handleSearch(queryText)}
              placeholder="Search"
              placeholderTextColor={COLORS.gray1}
              backgroundColor={COLORS.gray5}
              color={COLORS.input}
              width={!isSearching ? '100%' : '85%'}
              variant="unstyled"
              borderRadius="10"
              py={4}
              enablesReturnKeyAutomatically
              // px={SIZES.padding}
              fontSize="14"
              onFocus={() => setIsSearching(true)}
              onBlur={() => setIsSearching(false)}
              returnKeyType="search"
              InputLeftElement={
                <Icon ml={4} color={COLORS.text} size={18} name="search" />
              }
            />
            {isSearching && (
              <TouchableOpacity
                onPress={() => {
                  Keyboard.dismiss();
                  setIsSearching(false);
                  setQuery('');
                }}>
                <Text color={COLORS.text}>Cancel</Text>
              </TouchableOpacity>
            )}
            {/* <Icon color={COLORS.text} size={18} name="filter" /> */}
          </SearchView>
        </SectionSearch>

        {query !== '' && (
          <FlatList
            scrollEnabled={false}
            data={searchData}
            keyExtractor={item => item.id}
            renderItem={({item}: {item: Event}) => (
              <TouchableWithoutFeedback
                onPress={() => {
                  navigation.navigate('EventDetail', {event: item});
                  Keyboard.dismiss();
                  setIsSearching(false);
                  setQuery('');
                }}>
                <View style={styles.listItem}>
                  <FastImage
                    source={{uri: item.image}}
                    style={styles.coverImage}
                  />
                  <View style={styles.metaInfo}>
                    <Text color={COLORS.text}>{`${item.startDate} `}</Text>
                    <Text style={styles.title}>{`${item.name}`}</Text>
                    <Text color={COLORS.text}>{`${item.location} `}</Text>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            )}
          />
        )}

        {/* FEATURED */}
        {!isSearching && query === '' && (
          // <Animated.View entering={FadeIn.duration(300)}>
          <>
            {events && events.length > 0 && <FeaturedList data={events} />}
            {events && events.length > 0 && (
              <AllEventsList
                data={events}
                setQuery={setQuery}
                setIsSearching={setIsSearching}
              />
            )}
          </>
          // </Animated.View>
        )}
        <View style={{flex: 1, height: 100}} />
      </ScrollView>
    </SafeAreaView>
  );
};

const SectionSearch = styled.View`
  height: 50px;
  border-radius: 15px;
  background-color: ${COLORS.white};
`;

export const SectionHeader = styled.View`
  padding: 16px ${SIZES.padding};
  justify-content: space-between;
  align-items: center;
  flex-direction: row;
`;

const SearchView = styled.View`
  background-color: ${COLORS.white};
  justify-content: space-between;
  flex-direction: row;
  align-items: center;
  margin-left: 15px
  margin-right: 18px;
  height: 100%;
`;

const SectionTitle = styled.View`
  margin: 20px ${SIZES.padding} 0;
`;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    width: '100%',
    height: '100%',
  },
  coverImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  listItem: {
    // marginTop: 10,
    paddingVertical: 15,
    paddingHorizontal: 20,
    // backgroundColor: '#fff',
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

export default Home;
