import Icon from '@expo/vector-icons/Feather';
import database from '@react-native-firebase/database';
import {addMinutes, format} from 'date-fns';
import {router, useLocalSearchParams} from 'expo-router';
import React, {useEffect, useRef, useState} from 'react';
import {
  Animated,
  Dimensions,
  Image,
  Linking,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, {
  Marker,
  PROVIDER_DEFAULT,
  PROVIDER_GOOGLE,
} from 'react-native-maps';
import RenderHtml from 'react-native-render-html';
import {getStorageImgURL} from '../(tabs)/discover';
import EventShare from '../../components/EventShare';
import Registration from '../../components/event/Registration';
import {COLORS, SIZES} from '../../constants/theme';

const {width, height} = Dimensions.get('window');

const HEADER_HEIGHT =
  SIZES.height < 700 ? SIZES.height * 0.3 : SIZES.height * 0.4;

export default function Event() {
  const {id} = useLocalSearchParams();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [event, setEvent] = useState(null);
  const [isImageFullscreen, setImageFullscreen] = useState(false);

  useEffect(() => {
    const eventRef = database().ref(`/current-events/${id}`);
    const onValueChange = eventRef.on('value', async snapshot => {
      const data = snapshot.val();
      const imgURL = await getStorageImgURL(data.imgid);
      if (data) {
        setEvent({
          id,
          image: imgURL,
          ...data,
        });
      }
    });

    return () => eventRef.off('value', onValueChange);
  }, [id]);

  return event ? (
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
        <Pressable onPress={() => setImageFullscreen(true)}>
          <Image
            resizeMode="cover"
            source={{uri: event.image}}
            style={{
              width: '100%',
              height: HEADER_HEIGHT,
            }}
          />
        </Pressable>
        <Modal
          animationType="slide"
          transparent={false}
          visible={isImageFullscreen}
          onRequestClose={() => setImageFullscreen(false)}>
          <View style={{flex: 1, backgroundColor: COLORS.black}}>
            <Pressable
              style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}
              onPress={() => setImageFullscreen(false)}>
              <Image
                resizeMode="contain"
                source={{uri: event.image}}
                style={{
                  width,
                  height: height * 1.5,
                }}
              />
            </Pressable>
          </View>
        </Modal>
        <View style={styles.infoContent}>
          <View style={{flex: 1}}>
            <Text
              style={{color: COLORS.black, fontWeight: 'bold', fontSize: 25}}>
              {event.name}
            </Text>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 8,
              }}>
              <Icon
                name="clock"
                size={14}
                color={COLORS.primary}
                marginRight={5}
              />
              <Text
                style={{
                  color: COLORS.orange,
                  fontSize: 14,
                  opacity: 0.7,
                  marginLeft: 4,
                }}>
                {format(new Date(event.startDate), 'EEE MMM d')}
                {', '}
                {format(new Date(event.startDate), 'h:mm a')} {' - '}
                {format(
                  addMinutes(new Date(event.startDate), event.duration),
                  'h:mm a',
                )}
              </Text>
            </View>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 8,
              }}>
              <Icon
                name="map"
                size={14}
                color={COLORS.primary}
                marginRight={5}
              />
              <Text
                style={{
                  color: COLORS.black,
                  fontSize: 16,
                  opacity: 0.7,
                  marginLeft: 4,
                  flex: 1,
                }}>
                {event.location}
              </Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 8,
              }}>
              <Icon
                name="user"
                size={20}
                color={COLORS.primary}
                marginRight={5}
              />
              <Text
                style={{
                  color: COLORS.black,
                  fontSize: 16,
                  opacity: 0.7,
                  marginLeft: 4,
                }}>
                Hosted by {event.organization}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.buttonSection}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: 'bold',
              color: COLORS.gray,
            }}>
            About
          </Text>
        </View>
        {event.description ? (
          <View style={styles.descriptionSection}>
            <RenderHtml
              contentWidth={width}
              source={{html: event.description}}
            />
          </View>
        ) : null}
        {event.webLink ? (
          <>
            <View style={styles.buttonSection}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: 'bold',
                  color: COLORS.gray,
                }}>
                Web Link
              </Text>
            </View>
            <View style={styles.descriptionSection}>
              <Text
                style={{
                  fontSize: 16,
                  color: COLORS.primary,
                  paddingBottom: 18,
                }}
                onPress={() => event.webLink && Linking.openURL(event.webLink)}>
                {event.webLink}
              </Text>
            </View>
          </>
        ) : null}
        {/* Location Section */}
        <View>
          <View style={styles.buttonSection}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: 'bold',
                color: COLORS.gray,
              }}>
              Location
            </Text>
          </View>
          <Text
            style={{
              fontSize: 14,
              marginHorizontal: 30,
              color: COLORS.text,
            }}>
            {event.location}
          </Text>
          <View style={{height: 250, marginHorizontal: 30}}>
            <MapView
              provider={
                Platform.OS == 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT
              }
              style={{
                height: 250,
                borderRadius: 30,
                marginTop: 20,
              }}
              minZoomLevel={15}
              onPress={() => {
                let lat = event.latitude || 41.503;
                let lng = event.longitude || -90.5504;
                const scheme = Platform.select({
                  ios: 'maps:0,0?q=',
                  android: 'geo:0,0?q=',
                });
                const latLng = `${lat},${lng}`;
                const label = event.location;
                const url = Platform.select({
                  ios: `${scheme}${label}@${latLng}`,
                  android: `${scheme}${latLng}(${label})`,
                });
                if (url) {
                  Linking.openURL(url);
                }
              }}
              initialRegion={{
                latitude: event.latitude || 41.503,
                longitude: event.longitude || -90.5504,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              zoomEnabled={false}
              scrollEnabled={false}>
              {event.latitude && event.longitude && (
                <Marker
                  coordinate={{
                    latitude: event.latitude || 41.503,
                    longitude: event.longitude || -90.5504,
                  }}
                  title={event.location}
                />
              )}
            </MapView>
          </View>
          <View style={{paddingBottom: 100}}></View>
        </View>
      </Animated.ScrollView>
      <View
        style={{
          position: 'absolute',
          top: 10,
          left: 0,
          right: 0,
          height: 50,
          justifyContent: 'space-between',
          flexDirection: 'row',
          alignItems: 'center',
          marginTop: 20,
          paddingLeft: 20,
          paddingRight: 20,
        }}>
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
            router.back();
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
          }}>
          <EventShare event={event} />
        </View>
      </View>
      <Registration event={event} />
    </View>
  ) : null;
}

const styles = StyleSheet.create({
  buttonSection: {
    borderBottomColor: COLORS.grayBorder,
    borderBottomWidth: 1,
    display: 'flex',
    flexDirection: 'column',
    marginBottom: 10,
    marginHorizontal: 30,
    marginTop: 20,
    paddingBottom: 8,
  },
  container: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    flex: 1,
    flexGrow: 1,
    justifyContent: 'center',
  },
  descriptionSection: {
    marginHorizontal: 30,
    marginVertical: 0,
  },
  infoContent: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    marginHorizontal: 25,
    marginTop: 20,
  },
});
