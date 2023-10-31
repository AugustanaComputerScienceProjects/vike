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
            console.log('item', item);
            const {formattedDate, formattedTime} = parseDate(item.startDate);
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

                    {/* <Text style={{ color: 'chocolate'}}>
                      {`${parseDate(item.startDate)} `}
                    </Text> */}

                    <Text style={{ color: 'chocolate' }}>
                      {formattedDate}
                    </Text>

                    <Text style={{ color: COLORS.black }}>
                      {formattedTime}
                    </Text>

                    <Text style={{ color: COLORS.text, }}>
                      {`${item.location} `}
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

// function parseDate(dateString) {
//   const date = new Date(dateString);
//   return date.toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
// }

function parseDate(dateString) {
  const date = new Date(dateString);
  const formattedDate = date.toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const formattedTime = date.toLocaleString('en-US', { hour: '2-digit', minute: '2-digit' });
  
  return { formattedDate, formattedTime };
}

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
    paddingLeft: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
});

export default AllEventsList;
