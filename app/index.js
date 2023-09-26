import {ActionSheetProvider} from '@expo/react-native-action-sheet';
import auth from '@react-native-firebase/auth';
import {
  Stack,
  useRootNavigationState,
  useRouter,
  useSegments,
} from 'expo-router';

import React, {useEffect, useState} from 'react';
import {StyleSheet} from 'react-native';

export default function Index() {
  const navigationState = useRootNavigationState();
  const segments = useSegments();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState();

  useEffect(() => {
    if (!navigationState?.key) return;
    auth().onAuthStateChanged(userState => {
      setUser(userState);

      if (loading) {
        setLoading(false);
      }
    });

    if (!user) {
      router.replace('/auth');
    } else {
      router.replace('/(tabs)/home');
    }
  }, [segments, navigationState?.key]);

  return (
    <ActionSheetProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{headerShown: false}} />
        <Stack.Screen name="modal" options={{presentation: 'modal'}} />
      </Stack>
    </ActionSheetProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
