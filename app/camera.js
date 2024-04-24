import {BarCodeScanner} from 'expo-barcode-scanner';
import * as React from 'react';
import {useCallback, useEffect, useState} from 'react';
import {Alert, StyleSheet, Text, View} from 'react-native';
import {authInstance, db} from '../services/firebase';

export const currentEventsRef = db.ref('/current-events');
export const currentUser = authInstance.currentUser;

const CameraScanner = () => {
  const [hasPermission, setHasPermission] = useState(false);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const {status} = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getBarCodeScannerPermissions();
  }, []);

  const onBarCodeScanned = useCallback(({data}) => {
    setScanned(true);
    if (data.includes('?') && data.includes('osl-events-app.firebaseapp.com')) {
      let startIndex = data.indexOf('?');
      let endIndex = data.indexOf('&');
      let eventID = data.substring(startIndex + 4, endIndex);

      const userID = currentUser?.email?.substring(
        0,
        currentUser.email.indexOf('@'),
      );

      const eventRef = currentEventsRef.child(eventID);
      eventRef.on('value', snapshot => {
        if (snapshot.val().name !== '' && userID) {
          eventRef
            .child('users')
            .child(userID)
            .set(true)
            .then(() => {
              Alert.alert(
                'Check-In Successful!',
                'You have successfully checked into ' +
                  snapshot.val().name +
                  ' as ' +
                  userID +
                  '.',
              );
            })
            .catch(error => console.error(error));
        } else {
          Alert.alert(
            'Error: Sorry, this event is in the past or no longer exists!',
          );
        }
      });
    } else {
      Alert.alert('Error: This is not a QR code for an Augustana Event.');
    }
  }, []);

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      <BarCodeScanner
        style={StyleSheet.absoluteFillObject}
        onBarCodeScanned={scanned ? undefined : onBarCodeScanned}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
});

export default CameraScanner;
