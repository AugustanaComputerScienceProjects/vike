import {useActionSheet} from '@expo/react-native-action-sheet';
import {AntDesign, FontAwesome} from '@expo/vector-icons';
import Icon from '@expo/vector-icons/Feather';
import {BottomSheetModal, BottomSheetView} from '@gorhom/bottom-sheet';
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';
import {Image} from 'expo-image';
import React, {useCallback, useMemo} from 'react';
import {Alert, Pressable, StyleSheet, Text, View} from 'react-native';
import {Divider} from 'react-native-elements';
import QRCode from 'react-native-qrcode-svg';
import {COLORS, SIZES} from '../../constants/theme';
import {STATUS} from '../home/utils';

// export const STATUS = {
//   GOING: 'GOING',
//   CHECKED_IN: 'CHECKED_IN',
//   INVITED: 'INVITED',
//   NOT_GOING: 'NOT_GOING',
// };

const EventDetails = ({event}) => (
  <View style={styles.boxView}>
    <View style={styles.item}>
      <View style={styles.metaInfo}>
        <Image source={{uri: event?.image}} style={styles.coverImage} />
        <Text numberOfLines={2} ellipsizeMode="tail">
          {event?.name}
        </Text>
      </View>
      <Divider />
      <View style={styles.detailsRow}>
        <Icon
          name="clock"
          size={16}
          color={COLORS.gray}
          style={styles.detailIcon}
        />
        <Text>{event.startDate}</Text>
      </View>
      <View style={styles.detailsRow}>
        <Icon
          name="map-pin"
          size={16}
          color={COLORS.gray}
          style={styles.detailIcon}
        />
        <Text>{`${event?.location} `}</Text>
      </View>
    </View>
  </View>
);

export const currentUser = auth().currentUser;

const generateUniqueTicketId = (userHandle, eventId) => {
  const timestamp = Date.now().toString();
  return `${userHandle}-${eventId}-${timestamp}`;
};

const Registration = ({event}) => {
  const bottomSheetModalRef = React.useRef(null);
  const snapPoints = useMemo(() => ['50%', '98%'], []);

  const checkRegistrationStatus = () => {
    if (!currentUser) return null;
    const userHandle = currentUser.email.split('@')[0];
    const guestData = event.guests[userHandle];
    return guestData?.status;
  };

  const status = event.guests ? checkRegistrationStatus() : null;

  const {showActionSheetWithOptions} = useActionSheet();

  const handleRegister = async status => {
    if (!currentUser) return;

    const eventRef = database().ref(`/current-events/${event.id}`);
    const userHandle = currentUser.email.split('@')[0];
    const ticketId = generateUniqueTicketId(userHandle, event.id);

    const updatedEvent = {
      ...event,
      guests: {
        ...event.guests,
        [userHandle]: {
          ticketId,
          status,
        },
      },
    };

    await eventRef.update(updatedEvent);
    bottomSheetModalRef.current?.dismiss();
    Alert.alert(
      status === STATUS.GOING
        ? 'Registration successful!'
        : 'You have opted out of the event.',
    );
  };

  const handleRegisterClick = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  const handleConfirmRegister = () => {
    handleRegister(STATUS.GOING);
  };

  const handleOptOut = () => {
    handleRegister(STATUS.NOT_GOING);
  };

  const renderRegistrationButton = () => {
    if (status == STATUS.GOING) {
      return (
        <View style={styles.registeredContainer}>
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
            <AntDesign name="qrcode" size={32} color="white" />
            <View style={{flexDirection: 'column', gap: 8}}>
              <Text style={styles.registeredText}>You're going!</Text>
              <Pressable
                style={styles.viewTicketButton}
                onPress={() => bottomSheetModalRef.current?.present()}>
                <Text style={styles.viewTicketText}>View Ticket</Text>
              </Pressable>
            </View>
          </View>
          <Pressable
            style={styles.optOutButton}
            onPress={() => {
              showActionSheetWithOptions(
                {
                  options: ['Change to Not Going', 'Cancel'],
                  cancelButtonIndex: 1,
                  cancelButtonTintColor: 'red',
                },
                buttonIndex => {
                  if (buttonIndex === 0) {
                    handleOptOut();
                  }
                },
              );
            }}>
            <Icon name="more-vertical" size={24} color={COLORS.gray} />
          </Pressable>
        </View>
      );
    } else if (status == STATUS.NOT_GOING) {
      return (
        <View style={styles.registeredContainer}>
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
            <FontAwesome name="ticket" size={28} color="#E72929" />
            <View style={{flexDirection: 'column', gap: 8}}>
              <Text style={styles.registeredText}>You're Not Going!</Text>
            </View>
          </View>
          <Pressable
            style={styles.optOutButton}
            onPress={() => {
              showActionSheetWithOptions(
                {
                  options: ['Register', 'Cancel'],
                  cancelButtonIndex: 1,
                },
                buttonIndex => {
                  if (buttonIndex === 0) {
                    handleRegisterClick();
                  }
                },
              );
            }}>
            <Icon name="more-vertical" size={24} color={COLORS.gray} />
          </Pressable>
        </View>
      );
    } else {
      return (
        <Pressable onPress={handleRegisterClick} style={styles.registerButton}>
          <Text style={styles.registerButtonText}>Register</Text>
        </Pressable>
      );
    }
  };

  return (
    <>
      <View style={styles.container}>{renderRegistrationButton()}</View>
      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={1}
        snapPoints={snapPoints}
        enablePanDownToClose={true}>
        <BottomSheetView style={styles.contentContainer}>
          {status == STATUS.GOING && event.guests ? (
            <>
              <View
                style={{
                  flex: 1,
                  alignItems: 'center',
                  gap: 8,
                  flexDirection: 'center',
                }}>
                <View
                  style={{
                    marginBottom: 90,
                    gap: 8,
                  }}>
                  <Text style={styles.modalTitle}>My Ticket</Text>
                  <Text>{`${event?.name}`}</Text>
                </View>
                <QRCode
                  size={250}
                  value={
                    event.guests[currentUser?.email.split('@')[0]].ticketId
                  }
                />
                <View
                  style={{
                    marginTop: 40,
                    paddingHorizontal: 40,
                    gap: 8,
                  }}>
                  <Text style={styles.modalTitle}>
                    Show this ticket to the organizer when you check in at the
                    event
                  </Text>
                </View>
              </View>
            </>
          ) : (
            <View style={{flex: 1, justifyContent: 'space-between'}}>
              <View style={{flex: 1, maxHeight: 210}}>
                <Text style={styles.modalTitle}>Registration</Text>
                <EventDetails event={event} />
              </View>
              <View>
                <Pressable
                  style={styles.confirmRegisterButton}
                  onPress={handleConfirmRegister}>
                  <Text style={styles.confirmRegisterButtonText}>Register</Text>
                </Pressable>
              </View>
            </View>
          )}
        </BottomSheetView>
      </BottomSheetModal>
    </>
  );
};

const styles = StyleSheet.create({
  boxView: {
    backgroundColor: 'rgba(0,0,0,.1)',
    borderRadius: 20,
    flex: 1,
    margin: 16,
    padding: 16,
  },
  confirmRegisterButton: {
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 15,
    bottom: 18,
    height: 53,
    justifyContent: 'center',
    marginHorizontal: 30,
  },
  confirmRegisterButtonText: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: 'bold',
  },
  container: {
    backgroundColor: 'transparent',
    bottom: 0,
    height: 90,
    justifyContent: 'center',
    position: 'absolute',
    width: SIZES.width,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  coverImage: {
    borderRadius: 8,
    height: 69,
    width: 69,
  },
  detailIcon: {
    marginTop: 2,
  },
  detailsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  item: {
    flex: 1,
    gap: 8,
  },
  metaInfo: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    width: '100%',
  },
  modalTitle: {
    textAlign: 'center',
  },
  optOutButton: {
    paddingHorizontal: 10,
  },
  registerButton: {
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 15,
    height: 53,
    justifyContent: 'center',
    marginHorizontal: 30,
  },
  registerButtonText: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: 'bold',
  },
  registeredContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,.8)',
    borderRadius: 25,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    padding: 12,
  },
  registeredText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  viewTicketButton: {},
  viewTicketText: {
    color: COLORS.lightGray,
  },
});

export default Registration;
