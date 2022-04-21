/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/self-closing-comp */

import moment from 'moment';
import {Box, Text} from 'native-base';
import React, {useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Animated,
  Linking,
  Platform,
  PlatformOSType,
  StyleSheet,
  View,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import {TouchableOpacity} from 'react-native-gesture-handler';
import MapView, {Marker} from 'react-native-maps';
import styled from 'styled-components/native';
import EventShare from '../components/event-detail/event-share';
import {Icon} from '../components/icons';
import {COLORS, dummyData, SIZES} from '../constants';
import {Event} from './home';

interface IProps {
  params: any;
  route: any;
}

const AnimatedFastImage = Animated.createAnimatedComponent(FastImage);
const HEADER_HEIGHT =
  SIZES.height < 700 ? SIZES.height * 0.3 : SIZES.height * 0.4;

const EventDetail = ({navigation, route}: IProps) => {
  const [selectedEvent, setSelectedEvent] = useState<Event>();
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let {event} = route.params;
    setSelectedEvent(event);
  }, [route.params]);

  return selectedEvent ? (
    <View style={styles.container}>
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
        }}
        onScroll={Animated.event(
          [
            {
              nativeEvent: {
                contentOffset: {
                  y: scrollY,
                },
              },
            },
          ],
          {useNativeDriver: true},
        )}
        style={{width: '100%'}}>
        <AnimatedFastImage
          resizeMode="cover"
          source={{uri: selectedEvent?.image}}
          style={{
            width: '100%',
            height: HEADER_HEIGHT,
          }}
        />

        <InfoContentView>
          <View style={{flex: 1}}>
            <Text color={COLORS.black} fontWeight={'bold'} fontSize={'2xl'}>
              {selectedEvent?.name}
            </Text>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 8,
              }}>
              <Icon name="clock" size={18} color={COLORS.primary} />
              <Text
                color={COLORS.black}
                // fontWeight={'bold'}
                fontSize={'sm'}
                style={{opacity: 0.7, marginLeft: 4}}>
                {moment(selectedEvent.startDate).format('MMMM D (dddd)')}{' '}
                {`${moment(selectedEvent?.startDate).format('LT')} - ${moment(
                  selectedEvent?.startDate,
                )
                  .add(selectedEvent.duration, 'minute')
                  .format('LT')}`}
              </Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 4,
              }}>
              <Icon name="map" size={18} color={COLORS.primary} />
              <Text
                color={COLORS.text}
                fontSize={'sm'}
                style={{opacity: 0.7, marginLeft: 4}}>
                {selectedEvent?.location}
              </Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 4,
              }}>
              <Icon name="user" size={18} color={COLORS.primary} />
              <Text
                color={COLORS.text}
                fontSize={'sm'}
                style={{opacity: 0.7, marginLeft: 4}}>
                Hosted by {selectedEvent?.organization}
              </Text>
            </View>
          </View>
          {/* <View
            style={{
              width: 60,
              height: 60,
              borderRadius: 15,
              backgroundColor: COLORS.primary,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Text color={COLORS.gray5} style={{letterSpacing: 1}}>
              {moment(selectedEvent?.startDate).format('MMMM').toUpperCase()}
            </Text>
            <Text
              color={COLORS.white}
              fontSize="md"
              fontWeight="bold"
              style={{letterSpacing: 1}}>
              {moment(selectedEvent?.startDate).format('DD').toUpperCase()}
            </Text>
          </View> */}
        </InfoContentView>

        <ButtonSection>
          <Text color={COLORS.text} fontSize={'xl'} fontWeight="bold">
            About
          </Text>
        </ButtonSection>

        {/* Description */}

        <DescriptionSection>
          <Text color={COLORS.text} fontSize={'sm'}>
            {selectedEvent?.description}
          </Text>
        </DescriptionSection>

        {selectedEvent?.webLink ? (
          <>
            <ButtonSection>
              <Text color={COLORS.text} fontSize={'xl'} fontWeight="bold">
                Web Link
              </Text>
            </ButtonSection>
            <DescriptionSection>
              <Text
                color={COLORS.blue}
                fontSize={'sm'}
                onPress={() => Linking.openURL(selectedEvent?.webLink)}>
                {selectedEvent?.webLink}
              </Text>
            </DescriptionSection>
          </>
        ) : null}

        {/* Location Section */}

        <LocationSection>
          <Text color={COLORS.text} fontSize={'xl'} fontWeight="bold">
            Location
          </Text>
          <Text color={COLORS.text} fontSize={'sm'}>
            {selectedEvent?.location}
          </Text>
          <View style={{height: 250}}>
            <MapView
              // provider={PROVIDER_GOOGLE}
              style={{
                height: 250,
                borderRadius: 30,
                marginTop: 20,
              }}
              minZoomLevel={15}
              onPress={e => {
                let lat = 41.503;
                let lng = -90.5504;
                const scheme = Platform.select({
                  ios: 'maps:0,0?q=',
                  android: 'geo:0,0?q=',
                });
                const latLng: string = `${lat},${lng}`;
                const label: string = selectedEvent.location;
                const url: string = Platform.select({
                  ios: `${scheme}${label}@${latLng}`,
                  android: `${scheme}${latLng}(${label})`,
                });

                Linking.openURL(url);
                console.log(e.nativeEvent);
              }}
              initialRegion={dummyData.Region}
              customMapStyle={dummyData.MapStyle}
              zoomEnabled={false}
              scrollEnabled={false}>
              <Marker
                coordinate={{latitude: 41.503, longitude: -90.5504}}
                title={selectedEvent.location}
              />
            </MapView>
          </View>
          <View style={{paddingBottom: 150}}></View>
        </LocationSection>
        <View>
          <Text color="black">{selectedEvent.tags}</Text>
        </View>
      </Animated.ScrollView>

      <BottomBarSection
        style={{
          shadowColor: '#000',
          shadowOffset: {width: 1, height: 3},
          shadowOpacity: 0.2,
        }}>
        {/* <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            marginHorizontal: 30,
          }}> */}
        {/* <View></View> */}
        <TouchableOpacity
          style={{
            marginHorizontal: 30,
            height: 53,
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 15,
            backgroundColor: COLORS.primary,
          }}
          onPress={() => navigation.navigate('CameraScanner')}>
          <View
            style={
              {
                // flexDirection: 'row',
                // justifyContent: 'center',
                // alignItems: 'center',
              }
            }>
            <Text color={COLORS.white} fontSize="lg" fontWeight="bold">
              Check In
            </Text>
          </View>
        </TouchableOpacity>
        {/* </View> */}
      </BottomBarSection>
      <SectionImageHeader>
        <Animated.View
          style={{
            position: 'absolute',
            top: -100,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: COLORS.white,
            borderBottomColor: COLORS.gray3,
            borderBottomWidth: 1,

            opacity: scrollY.interpolate({
              inputRange: [HEADER_HEIGHT - 100, HEADER_HEIGHT - 70],
              outputRange: [0, 1],
            }),
          }}
        />
        <TouchableOpacity
          onPress={() => {
            navigation.goBack();
          }}
          style={{
            width: 40,
            height: 40,
            backgroundColor: COLORS.white,
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 100,
          }}>
          <Icon name="arrow-left" size={18} color={COLORS.black}></Icon>
        </TouchableOpacity>

        <View
          style={{
            justifyContent: 'space-between',
            alignItems: 'center',
            flexDirection: 'row',
            // borderRadius: 10,
          }}>
          {/* <Animated.View>
            style=
            {{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: COLORS.white,
              opacity: scrollY.interpolate({
                inputRange: [0, HEADER_SCROLL_DISTANCE],
              }),
            }}
          </Animated.View> */}
          {/* <TouchableOpacity
            style={{
              width: 40,
              height: 40,
              backgroundColor: COLORS.white,
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: 100,
              marginRight: 8,
            }}>
            <Icon
              name="heart"
              size={18}
              color={COLORS.black}
              style={
                {
                  // marginLeft: 16,
                  // tinyColor: COLORS.white,
                }
              }
            />
          </TouchableOpacity> */}
          <EventShare event={selectedEvent} />
        </View>
      </SectionImageHeader>
    </View>
  ) : (
    <ActivityIndicator />
  );
};

const SectionImageHeader = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  justify-content: space-between;
  flex-direction: row;
  align-items: center;
  margin-top: ${Platform.OS === 'ios' ? '40px' : '20px'};
  padding-left: 20px;
  padding-right: 20px;
`;

const SectionImageFooter = styled.View`
  flex: 1;
  justify-content: flex-end;
`;

const InfoContentView = styled.View`
  justify-content: space-between;
  flex-direction: row;
  align-items: flex-start;
  margin: 20px 30px 10px;
`;

const ButtonSection = styled.View`
  margin: 15px 30px;
  flex-direction: row;
`;

const DescriptionSection = styled.View`
  margin: 0 30px;
`;

const LocationSection = styled.View`
  margin: 25px 30px;
`;

const BottomBarSection = styled.View`
  height: 111px;
  width: ${SIZES.width + 'px'};
  border-radius: ${SIZES.radius + 'px'};
  background-color: 'transparent';
  position: absolute;
  bottom: 0px;
  justify-content: center;
`;

const styles = StyleSheet.create({
  // title: {flexWrap: 'wrap'},
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default EventDetail;
