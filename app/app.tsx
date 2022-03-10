import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {NavigationContainer} from '@react-navigation/native';
import {
  CardStyleInterpolators,
  createStackNavigator,
} from '@react-navigation/stack';
import {NativeBaseProvider} from 'native-base';
import React, {useEffect, useState} from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import CameraScanner from './components/camera-scanner';
import SplashScreen from './components/splash-screen';
import Root from './navigation/tabs';
import Auth from './screens/auth';
import EventDetail from './screens/event-detail';
import theme from './theme';

GoogleSignin.configure({
  webClientId:
    '559059413195-p4j61vpcbdgreua073t4st0vbb3vg343.apps.googleusercontent.com',
  hostedDomain: 'augustana.edu',
});

const Stack = createStackNavigator();

const App = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);

  useEffect(() => {
    auth().onAuthStateChanged(userState => {
      setUser(userState);

      if (loading) {
        setLoading(false);
      }
    });
  }, [loading]);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <NativeBaseProvider theme={theme}>
          {/* <StatusBar barStyle="light-content"></StatusBar> */}
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
            }}
            initialRouteName="Featured">
            {user ? (
              <>
                <Stack.Group>
                  <Stack.Screen name="Root" component={Root} />
                  <Stack.Screen name="EventDetail" component={EventDetail} />
                </Stack.Group>
                <Stack.Group
                  screenOptions={{
                    presentation: 'modal',
                    cardStyleInterpolator:
                      CardStyleInterpolators.forVerticalIOS,
                  }}>
                  <Stack.Screen
                    name="CameraScanner"
                    component={CameraScanner}
                  />
                </Stack.Group>
              </>
            ) : (
              <>
                <Stack.Screen name="Auth" component={Auth} />
              </>
            )}
          </Stack.Navigator>
        </NativeBaseProvider>
        <SplashScreen />
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default App;
