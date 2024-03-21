import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import {ActionSheetProvider} from '@expo/react-native-action-sheet';
import {BottomSheetModalProvider} from '@gorhom/bottom-sheet';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {Stack} from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, {useCallback} from 'react';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {AuthProvider} from '../context/useAuth';

SplashScreen.preventAutoHideAsync();

// For Android
GoogleSignin.configure({
  webClientId:
    '559059413195-lrs55dujb4j5jkoc3tjoemjpasdhntj3.apps.googleusercontent.com',
  hostedDomain: 'augustana.edu',
});

export default function Layout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_700Bold,
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
    <SafeAreaProvider
      onLayout={onLayoutRootView}
      style={{
        fontFamily: 'Inter_400Regular',
      }}>
      <AuthProvider>
        <GestureHandlerRootView style={{flex: 1}}>
          <ActionSheetProvider>
            <BottomSheetModalProvider>
              <Stack screenOptions={{headerShown: false}}>
                <Stack.Screen name="camera" options={{presentation: 'modal'}} />
              </Stack>
            </BottomSheetModalProvider>
          </ActionSheetProvider>
        </GestureHandlerRootView>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
