import {Redirect, useRootNavigationState} from 'expo-router';

import React from 'react';
import {Text, View} from 'react-native';
import {useAuth} from '../context/useAuth';

export default function Index() {
  const navigationState = useRootNavigationState();

  const {user} = useAuth();
  if (!user) {
    console.log('redirecting to login');
    return <Redirect href="/auth" />;
  } else if (user) {
    console.log('redirect to home');
    return <Redirect href="/(tabs)/home" />;
  }

  return <View>{!navigationState?.key ? <Text>Loading...</Text> : <></>}</View>;
}
