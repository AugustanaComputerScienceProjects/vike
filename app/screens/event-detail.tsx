/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/self-closing-comp */

import moment from 'moment';
import {Text} from 'native-base';
import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import {TouchableOpacity} from 'react-native-gesture-handler';
import LinearGradient from 'react-native-linear-gradient';
import MapView from 'react-native-maps';
import styled from 'styled-components/native';
import EventShare from '../components/event-detail/event-share';
import {Icon} from '../components/icons';
import {COLORS, dummyData, SIZES} from '../constants';
import {Event} from './home';

interface IProps {
  params: any;
  route: any;
}

const EventDetail = ({navigation, route}: IProps) => {
  const [selectedEvent, setSelectedEvent] = useState<Event>();

  useEffect(() => {
    let {event} = route.params;
    setSelectedEvent(event);
  }, [route.params]);

  return selectedEvent ? (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
        }}
        style={{width: '100%'}}>
        <FastImage
          resizeMode="cover"
          source={{uri: selectedEvent?.image}}
          style={{
            width: '100%',
            height:
              SIZES.height < 700 ? SIZES.height * 0.4 : SIZES.height * 0.5,
          }}>
          <View style={{flex: 1}}>
            <SectionImageHeader>
              <TouchableOpacity
                onPress={() => {
                  navigation.goBack();
                }}
                style={{
                  width: 56,
                  height: 40,
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: 10,
                }}>
                <Icon name="arrow-left" size={18} color={COLORS.white}></Icon>
              </TouchableOpacity>

              <View
                style={{
                  width: 96,
                  height: 40,
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexDirection: 'row',
                  borderRadius: 10,
                }}>
                <TouchableOpacity>
                  <Icon
                    name="heart"
                    size={18}
                    color={COLORS.white}
                    style={{
                      marginLeft: 16,
                      // tinyColor: COLORS.white,
                    }}></Icon>
                </TouchableOpacity>
                <EventShare event={selectedEvent} />
              </View>
            </SectionImageHeader>

            {/* Image Footer */}

            <SectionImageFooter>
              <LinearGradient
                colors={['transparent', '#000']}
                // start={{x: 0, y: 1}}
                // end={{x: 0, y: 1}}
                style={{
                  width: '100%',
                  height: 200,
                  justifyContent: 'flex-end',
                }}>
                <FooterContentView>
                  <View>
                    <Text
                      color={COLORS.white}
                      fontSize={'md'}
                      style={{opacity: 0.5, letterSpacing: 2}}>
                      {selectedEvent?.tags}
                    </Text>
                    <Text
                      // numberOfLines={0}
                      // style={{flex: 1, textAlign: 'left'}}
                      style={styles.title}
                      color={COLORS.white}
                      fontWeight={'bold'}
                      fontSize={'2xl'}>
                      {selectedEvent?.name}
                    </Text>

                    <Text
                      color={COLORS.white}
                      fontSize={'md'}
                      style={{opacity: 0.5, letterSpacing: 2}}>
                      STARTING{' '}
                      {moment(selectedEvent?.startDate).format('hh:mm A')}
                    </Text>
                  </View>
                  <LinearGradient
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 0}}
                    colors={COLORS.linear}
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: 15,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    <Text color={COLORS.white} style={{letterSpacing: 1}}>
                      {moment(selectedEvent?.startDate)
                        .format('MMM')
                        .toUpperCase()}
                    </Text>
                    <Text
                      color={COLORS.white}
                      fontSize="md"
                      fontWeight="bold"
                      style={{letterSpacing: 1}}>
                      {moment(selectedEvent?.startDate)
                        .format('DD')
                        .toUpperCase()}
                    </Text>
                  </LinearGradient>
                </FooterContentView>
              </LinearGradient>
            </SectionImageFooter>
          </View>
        </FastImage>

        {/* Button Group Section */}

        <ButtonSection>
          {/* <TouchableOpacity
            style={{
              width: 76,
              height: 32,
              borderRadius: 10,
              marginRight: 16,
              backgroundColor: COLORS.white,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Text fontSize={'sm'} style={{letterSpacing: 1}}>
              ABOUT
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              width: 124,
              height: 32,
              borderRadius: 10,
              backgroundColor: COLORS.white,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Text
              fontSize={'sm'}
              color={COLORS.text}
              style={{opacity: 0.5, letterSpacing: 1}}>
              PARTICIPANTS
            </Text>
          </TouchableOpacity> */}
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
              initialRegion={dummyData.Region}
              customMapStyle={dummyData.MapStyle}></MapView>
          </View>
          <View style={{paddingBottom: 150}}></View>
        </LocationSection>

        {/*  */}
        {/* <Text>This is a ScrollView example FOOTER.</Text> */}
      </ScrollView>

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
          style={{marginHorizontal: 30}}
          onPress={() => navigation.navigate('CameraScanner')}>
          <LinearGradient
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            colors={COLORS.linear}
            style={{
              // width: 173,
              height: 53,
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: 15,
            }}>
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
          </LinearGradient>
        </TouchableOpacity>
        {/* </View> */}
      </BottomBarSection>
    </View>
  ) : (
    <ActivityIndicator />
  );
};

const SectionImageHeader = styled.View`
  justify-content: space-between;
  flex-direction: row;
  margin-top: ${Platform.OS == 'ios' ? '40px' : '20px'};
  margin-left: 30px;
  margin-right: 30px;
`;

const SectionImageFooter = styled.View`
  flex: 1;
  justify-content: flex-end;
`;

const FooterContentView = styled.View`
  justify-content: space-between;
  flex-direction: row;
  align-items: center;
  padding-bottom: 20px;
  margin: 0px 30px;
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
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default EventDetail;
