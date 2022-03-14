import {useNavigation} from '@react-navigation/native';
import moment from 'moment';
import {
  AspectRatio,
  Box,
  Center,
  Stack,
  Heading,
  Text,
  HStack,
  View,
} from 'native-base';
import React from 'react';
import FastImage from 'react-native-fast-image';
import {TouchableWithoutFeedback} from 'react-native-gesture-handler';
import styled from 'styled-components/native';
import {SIZES, COLORS} from '../constants';
import {Event} from '../screens/home';

interface Iprops {
  item: Event;
  index: number;
  length: number;
}

const Card = ({item, index, length}: Iprops) => {
  const navigation = useNavigation();
  return (
    <TouchableWithoutFeedback
      onPress={() => {
        navigation.navigate('EventDetail', {event: item});
      }}>
      <Box
        alignItems="center"
        style={{
          marginLeft: index === 0 ? 30 : 20,
          marginRight: index === length - 1 ? 30 : 0,
        }}>
        <Box
          // maxW="80"
          rounded="3xl"
          overflow="hidden"
          borderColor="coolGray.200"
          _dark={{
            borderColor: 'coolGray.600',
            backgroundColor: 'gray.700',
          }}
          _web={{
            shadow: 2,
            borderWidth: 0,
          }}
          _light={{
            backgroundColor: 'gray.50',
          }}>
          <Box>
            <AspectRatio
              w={SIZES.width / 2 + 70}
              height={SIZES.width / 2 + 100}
              ratio={1 / 1}>
              <FastImage
                resizeMode="cover"
                source={{
                  uri: item.image,
                }}>
                <View
                  style={{
                    alignItems: 'flex-end',
                    marginHorizontal: 15,
                    marginVertical: 15,
                  }}>
                  <DateBox>
                    <Text color={COLORS.text} opacity="0.5" letterSpacing={2}>
                      {moment(item.startDate).format('MMM').toUpperCase()}
                    </Text>
                    <Text fontSize="md" fontWeight="bold" color={COLORS.text}>
                      {moment(item.startDate).format('DD').toUpperCase()}
                    </Text>
                  </DateBox>
                </View>
              </FastImage>
            </AspectRatio>
          </Box>
          <Stack p="4" space={2}>
            <Stack space={2}>
              <Text
                fontSize="xs"
                _light={{
                  color: 'orange.500',
                }}
                _dark={{
                  color: 'orange.400',
                }}
                fontWeight="600"
                ml="-1">
                {moment(item.startDate).format('ddd, MMM DD · h:mm')}
              </Text>
              <Heading size="md" ml="-1">
                {item.name}
              </Heading>
            </Stack>
            <Text fontWeight="400" ml="-1">
              {item.location}
            </Text>
          </Stack>
        </Box>
      </Box>
    </TouchableWithoutFeedback>
  );
};

const DateBox = styled.View`
  width: 60px;
  height: 60px;
  border-radius: 15px;
  background-color: ${COLORS.white};
  justify-content: center;
  align-items: center;
`;

export default Card;
