/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/self-closing-comp */
//TODO:
//[x] Build the header section
//[x] Build the search section
//[x] Build FEATURED section
//[] Build FOR YOU section

import moment from 'moment';
import {Avatar, Input, Text} from 'native-base';
import React from 'react';
import {
  FlatList,
  ImageBackground,
  SafeAreaView,
  StyleSheet,
  View,
} from 'react-native';
import {TouchableWithoutFeedback} from 'react-native-gesture-handler';
import styled from 'styled-components/native';
import {Icon} from '../components/icons';
import {COLORS, dummyData, images, SIZES} from '../constants';

const Featured = ({navigation}) => {
  const _renderItem = ({item}, index) => {
    return (
      <TouchableWithoutFeedback
        onPress={() => {
          navigation.navigate('EventDetail', {event: item});
        }}>
        <View
          style={{
            marginLeft: index === 0 ? 30 : 20,
            marginRight: index === dummyData.Events.length - 1 ? 30 : 0,
          }}>
          <ImageBackground
            source={item.image}
            resizeMode="cover"
            borderRadius={SIZES.radius}
            style={{
              width: SIZES.width / 2 + 70,
              height: SIZES.width / 2 + 70,
              justifyContent: 'space-between',
            }}>
            <View
              style={{
                alignItems: 'flex-end',
                marginHorizontal: 15,
                marginVertical: 15,
              }}>
              <DateBox>
                <Text color={COLORS.black} opacity="0.5" letterSpacing={2}>
                  {moment(item.startingTime).format('MMM').toUpperCase()}
                </Text>
                <Text fontSize="md" fontWeight="bold" color={COLORS.black}>
                  {moment(item.startingTime).format('DD').toUpperCase()}
                </Text>
              </DateBox>
            </View>

            <View
              style={{
                marginLeft: 20,
                marginBottom: 25,
              }}>
              <Text color="white" fontSize="sm" opacity={0.5}>
                {item.type}
              </Text>
              <Text fontSize="lg" color="white" fontWeight={'bold'}>
                {item.title}
              </Text>
            </View>
          </ImageBackground>
        </View>
      </TouchableWithoutFeedback>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Section */}
      <SectionHeader>
        <View>
          <Text color="white" opacity={0.5}>
            DECEMBER 21 0:10PM
          </Text>
          <Text fontSize={'3xl'} fontWeight={'bold'} color="white">
            Explore events
          </Text>
        </View>
        <Avatar source={images.avatar} />
      </SectionHeader>
      {/* Search Section */}
      <SectionSearch>
        <SearchView>
          <Icon color="white" size={18} name="search" />
          <Input
            placeholder="Search"
            placeholderTextColor={COLORS.gray1}
            color={COLORS.white}
            width={'85%'}
            variant="unstyled"
          />
          <Icon color="white" size={18} name="filter" />
        </SearchView>
      </SectionSearch>

      {/* FEATURED */}
      <SectionTitle>
        <Text color="white" fontSize={'md'} fontWeight={'bold'}>
          FEATURED
        </Text>
      </SectionTitle>
      <View>
        <FlatList
          horizontal
          contentContainerStyle={{}}
          keyExtractor={item => 'event_' + item.id}
          data={dummyData.Events}
          showsHorizontalScrollIndicator={false}
          renderItem={_renderItem}></FlatList>
      </View>
    </SafeAreaView>
  );
};

const SectionSearch = styled.View`
  margin: 4px ${SIZES.padding};
  height: 50px;
  background-color: ${COLORS.input};
  border-radius: 15px;
`;

const SectionHeader = styled.View`
  padding: 16px ${SIZES.padding};
  justify-content: space-between;
  align-items: center;
  flex-direction: row;
`;

const SearchView = styled.View`
  justify-content: space-between;
  flex-direction: row;
  align-items: center;
  margin-left: 15px
  margin-right: 18px;
  height: 100%;
`;

const SectionTitle = styled.View`
  margin: 20px ${SIZES.padding};
`;

const DateBox = styled.View`
  width: 60px;
  height: 60px;
  border-radius: 15;
  background-color: ${COLORS.white};
  justify-content: center;
  align-items: center;
`;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
});

export default Featured;
