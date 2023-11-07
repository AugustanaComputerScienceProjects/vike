import Icon from '@expo/vector-icons/Feather';
import {addMinutes, format} from 'date-fns';
import {Image} from 'expo-image';
import {Link, router, useLocalSearchParams} from 'expo-router';
import {useRef} from 'react';
import {Animated, Linking, StyleSheet, Text, View, ScrollView} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {SafeAreaView} from 'react-native-safe-area-context';
import EventShare from '../../components/EventShare';
import {COLORS, SIZES} from '../../constants/theme';
import {useEventStore} from '../../store';
import {LinearGradient} from 'expo-linear-gradient';

const HEADER_HEIGHT =
  SIZES.height < 700 ? SIZES.height * 0.3 : SIZES.height * 0.4;

export default function Event() {
  const {id} = useLocalSearchParams();
  const scrollY = useRef(new Animated.Value(0)).current;

  const getCurrentEvent = useEventStore(state => state.getCurrentEvent);
  const event = getCurrentEvent(id);

  return (
    <SafeAreaView style={styles.container}>
      <Animated.ScrollView>
        <Image
          contentFit="cover"
          source={{uri: event?.image}}
          style={{
            width: '100%',
            height: HEADER_HEIGHT,
          }}
        />
        <ScrollView style={styles.scrollableSection}>
          <View style={styles.infoContent}>
            <View style={{flex: 1}}>
              <Text
                style={{color: COLORS.black, fontWeight: 'bold', fontSize: 25}}>
                {event?.name}
              </Text>
              
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginTop: 8,
                }}>
                <Icon
                  name="clock"
                  size={20}
                  color={COLORS.primary}
                  marginRight={5}
                />
                <Text
                  style={{
                    color: COLORS.orange,
                    fontSize: 16, // replace 'sm' with the actual size in points
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
                    flex: 1,
                  }}>
                  {event?.location}
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
                  Hosted by {event?.organization}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.buttonSection}>
            <Text
              color={COLORS.text}
              style={{
                fontSize: 20,
                fontWeight: 'bold',
                color: COLORS.text,
              }}>
              About
            </Text>
          </View>
          <View style={styles.descriptionSection}>
            <Text
              color={COLORS.text}
              style={{
                fontSize: 16,
              }}>
              {event?.description}
            </Text>
          </View>
          {event?.webLink ? (
            <>
              <View style={styles.buttonSection}>
                <Text
                  color={COLORS.text}
                  style={{
                    fontSize: 20,
                    fontWeight: 'bold',
                    color: COLORS.text,
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
                  onPress={() =>
                    event?.webLink && Linking.openURL(event?.webLink)
                  }>
                  {event?.webLink}
                </Text>
              </View>
            </>
          ) : null}
        
        {/* Location Section */}
        {/* <View
          style={{
            marginVertical: 25,
            marginHorizontal: 30,
          }}>
          <Text
            color={COLORS.text}
            style={{
              fontSize: 20,
              fontWeight: 'bold',
              color: COLORS.text,
            }}>
            Location
          </Text>
          <Text
            style={{
              fontSize: 16,
              color: COLORS.text,
            }}>
            {event?.location}
          </Text>
          <View style={{height: 250}}>
            <MapView
            provider={PROVIDER_GOOGLE}
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
            initialRegion={dummyData.Region}
            customMapStyle={dummyData.MapStyle}
            zoomEnabled={false}
            scrollEnabled={false}>
            <Marker
              coordinate={{latitude: 41.503, longitude: -90.5504}}
              title={event.location}
            />
          </MapView>
          </View>
          <View style={{paddingBottom: 100}}></View>
        </View> */}
        
        {/* <LinearGradient
          colors={['rgba(255,255,255,0)', 'rgba(255,255,255,1)']}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: 50,
          }}
        /> */}

        </ScrollView>
        
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
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 30,
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
      </View>
      {/* <LinearGradient
          colors={['rgba(255,255,255,0)', 'rgba(255,134,255,1)']}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: 200,
          }}
        /> */}
        <LinearGradient
          colors={['rgba(255,255,255,0)', 'rgba(255,255,255,1)']}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 90,
            height: 30,
          }}
        />
      <View
        style={{
          height: 90,
          width: SIZES.width,
          // borderRadius: SIZES.radius,
          backgroundColor: 'transparent',
          position: 'absolute',
          bottom: 0,
          justifyContent: 'center',
          shadowColor: '#000',
          shadowOffset: {
            width: 1,
            height: 3,
          },
          shadowOpacity: 0.2,
        }}>
          
          

        <Link href="/camera" asChild>
          <TouchableOpacity
            style={{
              marginHorizontal: 30,
              height: 53,
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: 15,
              backgroundColor: COLORS.primary,
            }}>
            <View>
              <Text
                style={{
                  color: COLORS.white,
                  fontSize: 20,
                  fontWeight: 'bold',
                }}>
                Check In
              </Text>
            </View>
          </TouchableOpacity>
        </Link>
      </View>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    flexGrow: 1,
  },
  infoContent: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 20,
    marginBottom: 10,
    marginHorizontal: 30,
  },
  buttonSection: {
    marginTop: 20,
    marginBottom: 10,
    marginHorizontal: 30,
    flexDirection: 'row',
  },
  descriptionSection: {
    marginVertical: 0,
    marginHorizontal: 30,
  },
  cardContainer: {
    flex: 1,
  },
  headerContainer: {
    marginBottom: 10,
    marginTop: 45,
  },
  indicatorTab: {
    backgroundColor: 'transparent',
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    marginBottom: 100,
  },
  menuItem: {
    flexDirection: 'row',
    marginTop: 14,
    marginBottom: 14,
    alignItems: 'center',
  },
  sceneContainer: {
    marginTop: 10,
  },
  socialIcon: {
    marginLeft: 14,
    marginRight: 14,
  },
  socialRow: {
    flexDirection: 'row',
  },
  tabBar: {},
  tabContainer: {
    flex: 1,
    marginBottom: 12,
  },
  tabLabelNumber: {
    color: 'gray',
    fontSize: 12.5,
    textAlign: 'center',
  },
  tabLabelText: {
    color: COLORS.text,
    fontSize: 22.5,
    fontWeight: '600',
    textAlign: 'center',
  },
  userBioRow: {
    marginLeft: 40,
    marginRight: 40,
  },
  userBioText: {
    color: 'gray',
    fontSize: 13.5,
    textAlign: 'center',
  },
  userImage: {
    height: 120,
    marginBottom: 20,
    width: 120,
  },
  userNameRow: {
    marginBottom: 10,
  },
  userNameText: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 30,
  },
  userRow: {
    marginBottom: 12,
  },
  scrollableSection: {
    maxHeight: 420, // Adjust the height as needed
    marginBottom: 10,
  },
});
