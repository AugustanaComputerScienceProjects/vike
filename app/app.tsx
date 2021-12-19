/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {NativeBaseProvider} from 'native-base';
import React, {useEffect, useState} from 'react';
import {StatusBar, StyleSheet} from 'react-native';
import Tabs from './navigation/tabs';
import EventDetail from './screens/event-detail';
import theme from './theme';
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import Auth from './screens/auth';

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
  }, []);

  return (
    <NavigationContainer>
      <NativeBaseProvider theme={theme}>
        <StatusBar barStyle="light-content"></StatusBar>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}
          initialRouteName="Featured">
          {user ? (
            <>
              <Stack.Screen name="Featured" component={Tabs} />
              <Stack.Screen name="EventDetail" component={EventDetail} />
            </>
          ) : (
            <>
              <Stack.Screen name="Auth" component={Auth} />
            </>
          )}
        </Stack.Navigator>
      </NativeBaseProvider>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
