import React from 'react';
import {Dimensions, StyleSheet, Text, View} from 'react-native';
import Carousel from 'react-native-reanimated-carousel';

import {COLORS} from '../../constants/theme';
import Card from '../Card';

const windowWidth = Dimensions.get('window').width;

const FeaturedList = ({data}) => {
  return (
    <View
      style={{
        width: '100%',
        height: '100%',
        flex: 1,
      }}>
      <View
        style={{
          marginVertical: 15,
          marginLeft: 20,
        }}>
        <Text
          style={{
            fontSize: 24,
            fontWeight: 'bold',
            color: COLORS.text,
          }}>
          Feature Events
        </Text>
      </View>
      <View>
        <Carousel
          loop={false}
          style={{width: '100%'}}
          width={windowWidth}
          height={420}
          data={data}
          scrollAnimationDuration={500}
          onSnapToItem={index => console.log('current index:', index)}
          renderItem={({item}, index) => {
            return <Card item={item} index={index} length={data?.length} />;
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
});

export default FeaturedList;
