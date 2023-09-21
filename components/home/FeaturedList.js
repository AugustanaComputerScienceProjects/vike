import {Image} from 'expo-image';
import React from 'react';
import {
  Dimensions,
  FlatList,
  Keyboard,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import {COLORS} from '../../constants/theme';

const windowWidth = Dimensions.get('window').width;

const FeaturedList = ({data, setQuery, setIsSearching}) => {
  return (
    <View
      style={{
        width: '100%',
        height: '100%',
        flex: 1,
      }}>
      <View
        style={{
          margin: '20px 30px 0',
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
            </TouchableWithoutFeedback>
          )}
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

export default FeaturedList;
