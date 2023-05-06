import {useToast} from 'native-base';
import * as React from 'react';
import {useRef, useState, useEffect, useCallback} from 'react';
import {AppState, AppStateStatus, StyleSheet, View} from 'react-native';
import {
  Camera,
  CameraRuntimeError,
  useCameraDevices,
} from 'react-native-vision-camera';
import {BarcodeFormat, useScanBarcodes} from 'vision-camera-code-scanner';
import {currentEventsRef, currentUser, DataSnapshot} from '../firebase';
import {useIsFocused} from '@react-navigation/native';

export const useIsAppForeground = (): boolean => {
  const [isForeground, setIsForeground] = useState(true);

  useEffect(() => {
    const onChange = (state: AppStateStatus): void => {
      setIsForeground(state === 'active');
    };
    const listener = AppState.addEventListener('change', onChange);
    return () => listener.remove();
  }, [setIsForeground]);

  return isForeground;
};

const CameraScanner = () => {
  const [hasPermission, setHasPermission] = React.useState(false);
  const devices = useCameraDevices();
  const device = devices.back;
  const isFocused = useIsFocused();
  const isAppForeground = useIsAppForeground();

  const toast = useToast();
  const didLoad = useRef<boolean>(false);

  const [frameProcessor, barcodes] = useScanBarcodes([BarcodeFormat.QR_CODE], {
    checkInverted: true,
  });

  useEffect(() => {
    (async () => {
      const status = await Camera.requestCameraPermission();
      setHasPermission(status === 'authorized');
    })();
  }, []);
  const checkIn = useCallback(
    (decodedURL: String) => {
      if (
        decodedURL.includes('?') &&
        decodedURL.includes('osl-events-app.firebaseapp.com')
      ) {
        let startIndex = decodedURL.indexOf('?');
        let endIndex = decodedURL.indexOf('&');
        let eventID = decodedURL.substring(startIndex + 4, endIndex);

        const userID = currentUser?.email?.substring(
          0,
          currentUser.email.indexOf('@'),
        );

        const eventRef = currentEventsRef.child(eventID);
        eventRef.on('value', (snapshot: DataSnapshot) => {
          if (snapshot.val().name !== '' && userID) {
            eventRef
              .child('users')
              .child(userID)
              .set(true)
              .then(() => {
                toast.show({
                  title: 'Success',
                  status: 'success',
                  description:
                    'You have successfully checked into ' +
                    snapshot.val().name +
                    ' as ' +
                    userID +
                    '.',
                });
              })
              .catch(error => console.error(error));
          } else {
            toast.show({
              title: 'Something went wrong',
              status: 'error',
              description:
                'Sorry, this event is in the past or no longer exists!',
            });
          }
        });
      } else {
        toast.show({
          title: 'Something went wrong',
          status: 'error',
          description: 'This is not a QR code for an Augustana Event.',
        });
      }
    },
    [toast],
  );

  useEffect(() => {
    if (!barcodes.length && barcodes[0].displayValue && !didLoad.current) {
      checkIn(barcodes[0].displayValue);
      didLoad.current = true;
    }
  }, [barcodes, checkIn]);

  const onError = useCallback((error: CameraRuntimeError) => {
    console.error(error);
  }, []);

  return device != null && hasPermission ? (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={isFocused && isAppForeground}
        frameProcessor={frameProcessor}
        frameProcessorFps={5}
        onError={onError}
      />
    </View>
  ) : null;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  barcodeTextURL: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
  },
});

export default CameraScanner;
