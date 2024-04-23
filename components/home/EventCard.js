import {Link} from 'expo-router';
import React from 'react';
import {Dimensions, Image, StyleSheet, Text, View} from 'react-native';
import {COLORS} from '../../constants/theme';
const windowWidth = Dimensions.get('window').width;

import analytics from '@react-native-firebase/analytics';
import {usePostHog} from 'posthog-react-native';
import {parseDate} from './utils';

const EventCard = ({event}) => {
  const {formattedDate, formattedTime} = parseDate(event.startDate);
  const posthog = usePostHog();

  return (
    <Link
      href={{
        pathname: '/event/[id]',
        params: {id: event.id, event: event},
      }}
      onPress={async () => {
        console.log(`event ${event.name} clicked`);
        posthog.capture(`Event ${event.name} clicked`);
        await analytics().logEvent('event_clicked', {
          id: event.id,
          name: event.name,
        });
      }}>
      <View style={styles.listItem}>
        <Image source={{uri: event.image}} style={styles.coverImage} />
        <View style={styles.metaInfo}>
          <Text style={styles.title}>{`${event.name}`}</Text>
          <Text style={{color: 'chocolate'}}>{formattedDate}</Text>

          <Text style={{color: COLORS.black}}>{formattedTime}</Text>

          <Text
            style={styles.location}
            numberOfLines={1}>{`${event.location} `}</Text>
        </View>
      </View>
    </Link>
  );
};

const styles = StyleSheet.create({
  coverImage: {
    borderRadius: 8,
    height: 100,
    width: 100,
  },
  listItem: {
    flexDirection: 'row',
    maxWidth: windowWidth,
    paddingHorizontal: 10,
    paddingVertical: 15,
  },
  location: {
    color: COLORS.gray,
    fontSize: 14,
  },
  metaInfo: {
    backgroundColor: COLORS.background,
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default EventCard;
