import {ActionSheetProvider} from '@expo/react-native-action-sheet';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {Slot} from 'expo-router';
import {SafeAreaProvider} from 'react-native-safe-area-context';

import {Inter_900Black, useFonts} from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import {useCallback} from 'react';

SplashScreen.preventAutoHideAsync();

// For Android
GoogleSignin.configure({
  webClientId:
    '559059413195-lrs55dujb4j5jkoc3tjoemjpasdhntj3.apps.googleusercontent.com',
  hostedDomain: 'augustana.edu',
});

export default function Layout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_900Black,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }
  return (
    <SafeAreaProvider onLayout={onLayoutRootView}>
      <ActionSheetProvider>
        <Slot />
      </ActionSheetProvider>
    </SafeAreaProvider>
  );
}
