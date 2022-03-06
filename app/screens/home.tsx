/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/self-closing-comp */

import database from '@react-native-firebase/database';
import moment from 'moment';
import {Input, Text} from 'native-base';
import React, {useEffect, useState} from 'react';
import {FlatList, Keyboard, SafeAreaView, StyleSheet, View} from 'react-native';
import FastImage from 'react-native-fast-image';
import {
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native-gesture-handler';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {FadeIn} from 'react-native-reanimated';
import styled from 'styled-components/native';
import {Icon} from '../components/icons';
import {COLORS, dummyData, metrics, SIZES} from '../constants';
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

  const _renderItem = ({item}: any, index: number) => {
    return (
      <TouchableWithoutFeedback
        onPress={() => {
          navigation.navigate('EventDetail', {event: item});
        }}>
        <View
          style={{
            marginLeft: index === 0 ? 30 : 20,
            marginRight: index === dummyData.Events.length - 1 ? 30 : 0,
          }}>
          <FastImage
            source={{uri: item.image}}
            resizeMode="cover"
            style={{
              borderRadius: 25,
              width: SIZES.width / 2 + 70,
              height: SIZES.width / 2 + 100,
              justifyContent: 'space-between',
            }}>
            <View
              style={{
                alignItems: 'flex-end',
                marginHorizontal: 15,
                marginVertical: 15,
              }}>
              <DateBox>
                <Text color={COLORS.text} opacity="0.5" letterSpacing={2}>
                  {moment(item.startDate).format('MMM').toUpperCase()}
                </Text>
                <Text fontSize="md" fontWeight="bold" color={COLORS.text}>
                  {moment(item.startDate).format('DD').toUpperCase()}
                </Text>
              </DateBox>
            </View>
            <LinearGradient
              colors={['transparent', '#000']}
              start={{x: 0, y: 0.5}}
              end={{x: 0, y: 1}}
              style={{
                // width: '100%',
                // height: 300,
                // justifyContent: 'flex-end',
                // flex: 1,
                paddingLeft: 15,
                paddingRight: 15,
                borderRadius: 5,
              }}>
              <View
                style={{
                  marginLeft: 10,
                  marginBottom: 25,
                }}>
                <Text color={COLORS.white} fontSize="sm" opacity={0.7}>
                  {item.tags}
                </Text>
                <Text fontSize="lg" color={COLORS.white} fontWeight={'bold'}>
                  {item.name}
                </Text>
              </View>
            </LinearGradient>
          </FastImage>
        </View>
      </TouchableWithoutFeedback>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* <ScrollView showsVerticalScrollIndicator={false}> */}
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
        <View>
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
        </View>
      )}

      {/* FEATURED */}
      {!isSearching && query === '' && (
        <Animated.View entering={FadeIn.duration(300)}>
          <SectionTitle>
            <Text color={COLORS.text} fontSize={'md'} fontWeight={'bold'}>
              FEATURED
            </Text>
          </SectionTitle>
          <View>
            <FlatList
              horizontal
              contentContainerStyle={{}}
              keyExtractor={item => 'event_' + item.id}
              data={events}
              showsHorizontalScrollIndicator={false}
              renderItem={_renderItem}></FlatList>
          </View>
          <View
            style={{
              // flex: 1,
              // width: '100%',
              marginTop: metrics.extraLargeSize * 1.5,
              marginBottom: metrics.extraLargeSize * 4,
            }}>
            <FlatList
              scrollEnabled={false}
              data={events}
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
          </View>
        </Animated.View>
      )}
      {/* </ScrollView> */}
    </SafeAreaView>
  );
};

const SectionSearch = styled.View`
  height: 50px;
  border-radius: 15px;
`;

export const SectionHeader = styled.View`
  padding: 16px ${SIZES.padding};
  justify-content: space-between;
  align-items: center;
  flex-direction: row;
`;

const SearchView = styled.View`
  justify-content: space-between;
  flex-direction: row;
  align-items: center;
  margin-left: 15px
  margin-right: 18px;
  height: 100%;
`;

const SectionTitle = styled.View`
  margin: 20px ${SIZES.padding};
`;

const DateBox = styled.View`
  width: 60px;
  height: 60px;
  border-radius: 15px;
  background-color: ${COLORS.white};
  justify-content: center;
  align-items: center;
`;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    width: '100%',
    height: '100%',
  },
  metaInfo: {
    paddingLeft: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  coverImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  listItem: {
    marginTop: 10,
    paddingVertical: 20,
    paddingHorizontal: 20,
    // backgroundColor: '#fff',
    flexDirection: 'row',
  },
});

export default Home;
