import {useToast} from 'native-base';
import * as React from 'react';
import {useRef} from 'react';

import {StyleSheet, Text, View} from 'react-native';
import {useCameraDevices} from 'react-native-vision-camera';
import {Camera} from 'react-native-vision-camera';
import {useScanBarcodes, BarcodeFormat} from 'vision-camera-code-scanner';
import {currentEventsRef, currentUser, DataSnapshot} from '../firebase';

function CameraScanner() {
  const [hasPermission, setHasPermission] = React.useState(false);
  const devices = useCameraDevices();
  const device = devices.back;
  const toast = useToast();
  const didLoad = useRef<boolean>(false);

  const [frameProcessor, barcodes] = useScanBarcodes([
    BarcodeFormat.ALL_FORMATS,
  ]);

  React.useEffect(() => {
    (async () => {
      const status = await Camera.requestCameraPermission();
      setHasPermission(status === 'authorized');
    })();
  }, []);

  React.useEffect(() => {
    if (barcodes.length !== 0 && !didLoad.current) {
      checkIn(barcodes[0].displayValue);
      didLoad.current = true;
    }
  }, [barcodes]);

  const checkIn = (decodedURL: String) => {
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
        if (snapshot.val().name !== '') {
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
  };

  return (
    device != null &&
    hasPermission && (
      <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
        <Camera
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={true}
          frameProcessor={frameProcessor}
          frameProcessorFps={5}
        />
        {/* {barcodes.map((barcode, idx) => (
          <Text key={idx} style={styles.barcodeTextURL}>
            {barcode.displayValue}
          </Text>
        ))} */}
      </View>
    )
  );
}

const styles = StyleSheet.create({
  barcodeTextURL: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
  },
});

export default CameraScanner;
