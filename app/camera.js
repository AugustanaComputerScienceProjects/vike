import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';

import {BarCodeScanner} from 'expo-barcode-scanner';
import * as React from 'react';
import {useCallback, useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';

export const currentEventsRef = database().ref('/current-events');
export const currentUser = auth().currentUser;

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
              alert(
                'Success: You have successfully checked into ' +
                  snapshot.val().name +
                  ' as ' +
                  userID +
                  '.',
              );
            })
            .catch(error => console.error(error));
        } else {
          alert('Error: Sorry, this event is in the past or no longer exists!');
        }
      });
    } else {
      alert('Error: This is not a QR code for an Augustana Event.');
    }
  }, []);

  return (
    <View style={styles.container}>
      <BarCodeScanner
        style={StyleSheet.absoluteFillObject}
        onBarCodeScanned={scanned ? undefined : onBarCodeScanned}
      />
      {scanned && (
        <Button title={'Tap to Scan Again'} onPress={() => setScanned(false)} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default CameraScanner;
