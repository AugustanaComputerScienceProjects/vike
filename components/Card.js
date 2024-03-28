import {format} from 'date-fns';
import {Link} from 'expo-router';
import React from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';
import {COLORS, SIZES} from '../constants/theme';

const Card = ({item}) => {
  return (
    <Link
      href={{
        pathname: '/event/[id]',
        params: {id: item.id, event: item},
      }}>
      <View style={styles.card}>
        <View style={styles.imageContainer}>
          <Image
            source={{uri: item.image}}
            style={styles.image}
            contentFit="contain"
          />
          <View style={styles.overlayTextContainer}>
            <View style={styles.dateContainer}>
              <View style={styles.dateBox}>
                <Text style={styles.monthText}>
                  {format(new Date(item.startDate), 'LLL').toUpperCase()}
                </Text>
                <Text style={styles.dayText}>
                  {format(new Date(item.startDate), 'dd').toUpperCase()}
                </Text>
              </View>
            </View>
          </View>
        </View>
        <View style={styles.details}>
          <Text style={styles.dateText}>
            {format(new Date(item.startDate), 'eee, MMM dd · h:mm a')}
          </Text>
          <Text style={styles.nameText} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.locationText} numberOfLines={1}>{item.location}</Text>
        </View>
      </View>
    </Link>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#F5F5F5',
    borderColor: '#CCCCCC',
    borderRadius: 30,
    borderWidth: 1,
    overflow: 'hidden',
    width: 300,
  },
  dateBox: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 15,
    elevation: 3,
    height: 60,
    justifyContent: 'center',
    width: 60,
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 15,
  },
  dateText: {
    color: COLORS.secondary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
  },
  dayText: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  details: {
    padding: 16,
  },
  image: {
    flex: 1,
    width: '100%',
  },
  imageContainer: {
    height: SIZES.width / 2 + 100,
  },
  locationText: {
    color: COLORS.gray,
    fontSize: 14,
  },
  monthText: {
    color: COLORS.darkGray,
    fontSize: 11,
    fontWeight: '500',
  },
  nameText: {
    color: COLORS.dark,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  overlayTextContainer: {
    bottom: 0,
    justifyContent: 'flex-end',
    position: 'absolute',
    width: '100%',
  },
});

export default Card;
