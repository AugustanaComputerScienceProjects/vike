import React from 'react';
import {Text, View} from 'react-native';

import {ScrollView} from 'react-native';

import {COLORS} from '../../constants/theme';
import Card from '../Card';

const FeaturedList = ({data}) => {
  return (
    <View
      style={{
        width: '100%',
        height: '100%',
        flex: 1,
        marginBottom: 15,
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
      <ScrollView
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        style={{minHeight: 300}}
        contentContainerStyle={{
          gap: 8,
        }}>
        {data.map((item, index) => (
          <Card key={index} item={item} index={index} length={data?.length} />
        ))}
      </ScrollView>
    </View>
  );
};

export default FeaturedList;
