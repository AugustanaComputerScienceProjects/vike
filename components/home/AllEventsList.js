import {useNavigation} from '@react-navigation/native';
import {Image} from 'expo-image';
import {Link} from 'expo-router';
import React from 'react';
import {Dimensions, FlatList, StyleSheet, Text, View} from 'react-native';
import {COLORS} from '../../constants/theme';
// import {parseDate} from '../../utils/moment';

const windowWidth = Dimensions.get('window').width;

const AllEventsList = ({data, setQuery, setIsSearching}) => {
  const navigation = useNavigation();
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
          marginHorizontal: 30,
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
            console.log('item', item);
            return (
              <Link
                href={{
                  pathname: '/event/[id]',
                  params: {id: item.id, event: item},
                }}>
                <View style={styles.listItem}>
                  <Image source={{uri: item.image}} style={styles.coverImage} />
                  <View style={styles.metaInfo}>
                    <Text style={styles.title}>{`${item.name}`}</Text>
                    {/* <Text
                    style={{
                      color: COLORS.text,
                    }}>{`${parseDate(item.startDate)} `}</Text> */}

                    <Text
                      style={{
                        color: COLORS.text,
                      }}>
                      at {`${item.location} `}
                    </Text>
                  </View>
                </View>
              </Link>
            );
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
  coverImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  listItem: {
    maxWidth: windowWidth - 100,
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

export default AllEventsList;
