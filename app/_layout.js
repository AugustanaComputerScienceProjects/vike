import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import {ActionSheetProvider} from '@expo/react-native-action-sheet';
import {BottomSheetModalProvider} from '@gorhom/bottom-sheet';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import * as Sentry from '@sentry/react-native';
import {Stack, useNavigationContainerRef} from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, {useCallback} from 'react';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {AuthProvider} from '../context/useAuth';

const routingInstrumentation = new Sentry.ReactNavigationInstrumentation();

Sentry.init({
  dsn: 'https://9ed9d86dee1fd3e4ddd425b331cfb747@o4506978302820352.ingest.us.sentry.io/4506978304196608',
  integrations: [
    new Sentry.ReactNativeTracing({
      routingInstrumentation,
    }),
  ],
});

SplashScreen.preventAutoHideAsync();

// For Android
GoogleSignin.configure({
  webClientId:
    '559059413195-lrs55dujb4j5jkoc3tjoemjpasdhntj3.apps.googleusercontent.com',
  hostedDomain: 'augustana.edu',
});

const Layout = () => {
  const ref = useNavigationContainerRef();

  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_700Bold,
  });

  React.useEffect(() => {
    if (ref) {
      routingInstrumentation.registerNavigationContainer(ref);
    }
  }, [ref]);

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
};
export default Sentry.wrap(Layout);
