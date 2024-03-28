import auth from '@react-native-firebase/auth';
import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import {Image} from 'expo-image';
import {useRouter} from 'expo-router';
import React from 'react';
import {Text, View} from 'react-native';
import {COLORS} from '../constants/theme';

export default function Auth() {
  const router = useRouter();

  const signIn = async () => {
    try {
      // Get the users ID token
      const {idToken} = await GoogleSignin.signIn();

      // Create a Google credential with the token
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);

      // Sign-in the user with the credential
      return auth()
        .signInWithCredential(googleCredential)
        .then(user => {
          router.replace('/(tabs)/discover');
        });
    } catch (error) {
      console.log('error', error.code, error.message);
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // user cancelled the login flow
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // operation (e.g. sign in) is in progress already
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        // play services not available or outdated
      } else {
        // some other error happened
      }
    }
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <Image
        style={{marginTop: 20, marginBottom: 20, width: 100, height: 100}}
        source={require('../assets/vike.png')}
      />
      <Text
        style={{
          fontFamily: 'Inter_700Bold',
          color: COLORS.white,
          fontSize: 32,
        }}>
        Augustana Vike App
      </Text>
      <GoogleSigninButton
        style={{width: 192, height: 48}}
        size={GoogleSigninButton.Size.Wide}
        color={GoogleSigninButton.Color.Dark}
        onPress={signIn}
        // disabled={this.state.isSigninInProgress}
      />
    </View>
  );
}
