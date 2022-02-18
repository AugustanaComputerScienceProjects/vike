/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/self-closing-comp */
//TODO:
//[x] Build the header section
//[x] Build the search section
//[x] Build FEATURED section
//[x] Build FOR YOU section

import moment from 'moment';
import {Avatar, Input, Text} from 'native-base';
import React, {useEffect, useState} from 'react';
import {
  FlatList,
  ImageBackground,
  SafeAreaView,
  StyleSheet,
  View,
  Image,
} from 'react-native';
import {TouchableWithoutFeedback} from 'react-native-gesture-handler';
import styled from 'styled-components/native';
import {Icon} from '../components/icons';
import {COLORS, dummyData, images, SIZES} from '../constants';
import database from '@react-native-firebase/database';
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

const Featured = ({navigation}) => {
  const [events, setEvents] = useState<Event[]>();

  const [query, setQuery] = useState('');
  const [searchData, setSearchData] = useState([]);
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

  // const contains = ({name}: Event, query: string) => {
  //   console.log(name, query);
  //   if (name.includes(query)) {
  //     return true;
  //   }

  //   return false;
  // };

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
          <ImageBackground
            source={{uri: item.image}}
            resizeMode="cover"
            borderRadius={SIZES.radius}
            style={{
              width: SIZES.width / 2 + 70,
              height: SIZES.width / 2 + 70,
              justifyContent: 'space-between',
            }}>
            <View
              style={{
                alignItems: 'flex-end',
                marginHorizontal: 15,
                marginVertical: 15,
              }}>
              <DateBox>
                <Text color={COLORS.black} opacity="0.5" letterSpacing={2}>
                  {moment(item.startDate).format('MMM').toUpperCase()}
                </Text>
                <Text fontSize="md" fontWeight="bold" color={COLORS.black}>
                  {moment(item.startDate).format('DD').toUpperCase()}
                </Text>
              </DateBox>
            </View>

            <View
              style={{
                marginLeft: 20,
                marginBottom: 25,
              }}>
              <Text color="white" fontSize="sm" opacity={0.5}>
                {item.tags}
              </Text>
              <Text fontSize="lg" color="white" fontWeight={'bold'}>
                {item.name}
              </Text>
            </View>
          </ImageBackground>
        </View>
      </TouchableWithoutFeedback>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Section */}
      {!isSearching && query === '' && (
        <SectionHeader>
          <View>
            <Text color="white" opacity={0.5}>
              DECEMBER 21 0:10PM
            </Text>
            <Text fontSize={'3xl'} fontWeight={'bold'} color="white">
              Explore events
            </Text>
          </View>
          <Avatar source={images.avatar} />
        </SectionHeader>
      )}
      {/* Search Section */}
      <SectionSearch>
        <SearchView>
          {/* <Icon color="white" size={18} name="search" /> */}
          <Input
            clearButtonMode="while-editing"
            value={query}
            onChangeText={queryText => handleSearch(queryText)}
            placeholder="Search"
            placeholderTextColor={COLORS.gray1}
            color={COLORS.white}
            width={'100%'}
            variant="unstyled"
            borderRadius="10"
            py="1"
            px="2"
            fontSize="14"
            onFocus={() => setIsSearching(true)}
            onBlur={() => setIsSearching(false)}
            returnKeyType="search"
            borderWidth="0"
            InputLeftElement={<Icon color="white" size={18} name="search" />}
          />
          {/* <Icon color="white" size={18} name="filter" /> */}
        </SearchView>
      </SectionSearch>

      {query !== '' && (
        <View>
          <FlatList
            data={searchData}
            keyExtractor={item => item.id}
            renderItem={({item}) => (
              <TouchableWithoutFeedback
                onPress={() => {
                  navigation.navigate('EventDetail', {event: item});
                }}>
                <View style={styles.listItem}>
                  <Image source={{uri: item.image}} style={styles.coverImage} />
                  <View style={styles.metaInfo}>
                    <Text style={styles.title}>{`${item.name}`}</Text>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            )}
          />
        </View>
      )}

      {/* FEATURED */}
      {!isSearching && query === '' && (
        <>
          <SectionTitle>
            <Text color="white" fontSize={'md'} fontWeight={'bold'}>
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
        </>
      )}
    </SafeAreaView>
  );
};

const SectionSearch = styled.View`
  margin: 4px ${SIZES.padding};
  height: 50px;
  background-color: ${COLORS.input};
  border-radius: 15px;
`;

const SectionHeader = styled.View`
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
    backgroundColor: COLORS.black,
  },
  title: {
    fontSize: 18,
    width: 200,
    padding: 10,
    color: '#fff',
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

export default Featured;
