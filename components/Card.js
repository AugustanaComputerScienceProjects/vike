import {format} from 'date-fns';
import {Link} from 'expo-router';
import React from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';
import {COLORS, SIZES} from '../constants/theme';
const blurhash =
  '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

const Card = ({item, index, length}) => {
  return (
    <Link
      href={{
        pathname: '/event/[id]',
        params: {id: item.id, event: item},
      }}
      style={{
        marginLeft: index === 0 ? 30 : 20,
        marginRight: index === length - 1 ? 30 : 0,
      }}>
      <View style={styles.card}>
        <View style={styles.imageContainer}>
          <Image source={{uri: item.image}} style={styles.image} />
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
          <Text style={styles.nameText}>{item.name}</Text>
          <Text style={styles.locationText}>{item.location}</Text>
        </View>
      </View>
    </Link>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 300,
    borderRadius: 30,
    overflow: 'hidden',
    backgroundColor: '#F5F5F5',
    borderColor: '#CCCCCC',
    borderWidth: 1,
  },
  imageContainer: {
    height: SIZES.width / 2 + 100,
  },
  overlayTextContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    justifyContent: 'flex-end',
  },
  image: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 15,
  },
  dateBox: {
    width: 60,
    height: 60,
    borderRadius: 15,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  monthText: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.darkGray,
  },
  dayText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  details: {
    padding: 16,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.secondary,
    marginBottom: 5,
  },
  nameText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 3,
  },
  locationText: {
    fontSize: 14,
    color: COLORS.gray,
  },
});

export default Card;
