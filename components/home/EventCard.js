import {Link, useRouter} from 'expo-router';
import React from 'react';
import {Dimensions, Image, StyleSheet, Text, View} from 'react-native';
import {COLORS} from '../../constants/theme';
const windowWidth = Dimensions.get('window').width;

import {parseDate} from './utils';

const EventCard = ({event}) => {
  const router = useRouter();

  const {formattedDate, formattedTime} = parseDate(event.startDate);

  const handlePress = () => {
    router.push({
      pathname: '/event/[id]',
      params: {id: event.id, event: event},
    });
  };

  return (
    <Link
      href={{
        pathname: '/event/[id]',
        params: {id: event.id, event: event},
      }}>
      <View style={styles.listItem}>
        <Image source={{uri: event.image}} style={styles.coverImage} />
        <View style={styles.metaInfo}>
          <Text style={styles.title}>{`${event.name}`}</Text>
          <Text style={{color: 'chocolate'}}>{formattedDate}</Text>

          <Text style={{color: COLORS.black}}>{formattedTime}</Text>

          <Text style={styles.location}>{`${event.location} `}</Text>
        </View>
      </View>
    </Link>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 12,
  },
  coverImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  listItem: {
    maxWidth: windowWidth - 100,
    paddingVertical: 15,
    paddingLeft: 10,
    flexDirection: 'row',
  },
  metaInfo: {
    paddingLeft: 20,
  },
  location: {
    fontSize: 14,
    color: COLORS.gray,
  },
});

export default EventCard;
