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
import React from 'react';
import {StatusBar, StyleSheet} from 'react-native';
import Tabs from './navigation/tabs';
import EventDetail from './screens/event-detail';
import theme from './theme';

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <NativeBaseProvider theme={theme}>
        <StatusBar barStyle="light-content"></StatusBar>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}
          initialRouteName="Featured">
          <Stack.Screen name="Featured" component={Tabs} />
          <Stack.Screen name="EventDetail" component={EventDetail} />
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
