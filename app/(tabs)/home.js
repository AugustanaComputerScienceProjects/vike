import Icon from '@expo/vector-icons/Feather';
import database from '@react-native-firebase/database';
import storage from '@react-native-firebase/storage';
import {Image} from 'expo-image';
import {useEffect, useState} from 'react';
import {
  FlatList,
  Keyboard,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native-gesture-handler';

import AllEventsList from '../../components/home/AllEventsList';
import {COLORS} from '../../constants/theme';

export const getStorageImgURL = async imageName => {
  const imgURL = await storage()
    .ref('Images/' + imageName + '.jpg')
    .getDownloadURL();
  return imgURL;
};

const ScrollViewComponent = props => {
  return (
    <FlatList
      {...props}
      data={[]}
      keyExtractor={(e, i) => 'dom' + i.toString()}
      ListEmptyComponent={null}
      renderItem={null}
      ListHeaderComponent={() => <>{props.children}</>}
    />
  );
};

export default function Home() {
  const [events, setEvents] = useState();

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
          console.log('snapshot.val()', snapshot.val());
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

          setEvents(resolved);
        });
    };
    fetchEvents();
  }, []);
  return (
    <SafeAreaView style={styles.container}>
      <ScrollViewComponent showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        {!isSearching && query === '' && (
          <View
            style={{
              padding: '16px 30px',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexDirection: 'row',
            }}>
            <View>
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: 'bold',
                  color: '#000',
                }}>
                Explore events
              </Text>
            </View>
          </View>
        )}
        {/* Search Section */}
        <View
          style={{
            height: 50,
            borderRadius: 15,
            backgroundColor: '#fff',
          }}>
          <View
            style={{
              backgroundColor: '#fff',
              justifyContent: 'center',
              flexDirection: 'row',
              alignItems: 'center',
              marginLeft: 15,
              marginRight: 18,
              height: '100%',
            }}>
            {/* <Icon color={COLORS.text} size={18} name="search" /> */}
            <View style={styles.inputContainer}>
              <Icon style={styles.iconStyle} name="search" />
              <TextInput
                style={styles.inputStyle}
                clearButtonMode="while-editing"
                value={query}
                onChangeText={queryText => handleSearch(queryText)}
                placeholder="Search"
                placeholderTextColor={COLORS.gray1}
                onFocus={() => setIsSearching(true)}
                onBlur={() => setIsSearching(false)}
                returnKeyType="search"
                enablesReturnKeyAutomatically
              />
            </View>
            {isSearching && (
              <TouchableOpacity
                onPress={() => {
                  Keyboard.dismiss();
                  setIsSearching(false);
                  setQuery('');
                }}>
                <Text
                  style={{
                    color: COLORS.text,
                  }}>
                  Cancel
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {query !== '' && (
          <FlatList
            scrollEnabled={false}
            data={searchData}
            keyExtractor={item => item.id}
            renderItem={({item}) => (
              <TouchableWithoutFeedback
                onPress={() => {
                  // navigation.navigate('EventDetail', {event: item});
                  Keyboard.dismiss();
                  setIsSearching(false);
                  setQuery('');
                }}>
                <View style={styles.listItem}>
                  <Image source={{uri: item.image}} style={styles.coverImage} />
                  <View style={styles.metaInfo}>
                    {/* <Text
                      styles={{
                        color: COLORS.text,
                      }}>{`${moment(item.startDate).format(
                      'MMMM D (dddd)',
                    )} `}</Text> */}
                    <Text style={styles.title}>{`${item.name}`}</Text>

                    <Text
                      styles={{
                        color: COLORS.text,
                      }}>{`${item.location} `}</Text>
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
            {/* {events && events.length > 0 && <FeaturedList data={events} />} */}
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
      </ScrollViewComponent>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray5,
    borderRadius: 10,
    paddingVertical: 4,
    width: '100%', // you can adjust this dynamically using a style prop
    // paddingHorizontal: SIZES.padding,  // Uncomment if needed
  },
  inputStyle: {
    flex: 1,
    color: COLORS.input,
    fontSize: 14,
    paddingLeft: 4, // This gives some space after the icon
  },
  iconStyle: {
    marginLeft: 4,
    color: COLORS.text,
    fontSize: 18,
  },
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
