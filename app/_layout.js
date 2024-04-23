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
import {
  Stack,
  useGlobalSearchParams,
  useNavigationContainerRef,
} from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import {PostHogProvider} from 'posthog-react-native';
import React, {useCallback} from 'react';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {AuthProvider} from '../context/useAuth';

import analytics from '@react-native-firebase/analytics';
import {usePathname} from 'expo-router';
import {useEffect} from 'react';

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
  const pathname = usePathname();
  const params = useGlobalSearchParams();

  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_700Bold,
  });

  useEffect(() => {
    const logScreenView = async () => {
      try {
        await analytics().logScreenView({
          screen_name: pathname,
          params,
        });
      } catch (err) {
        console.error(err);
      }
    };
    logScreenView();
  }, [pathname]);

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
      <PostHogProvider
        apiKey="phc_W3FxRXQ1O8hnlxWve0bHjKMnyGx3WPVH4EHFR0vl5I3"
        options={{
          host: 'https://us.i.posthog.com',
        }}
        autocapture={{
          captureTouches: true, // If you don't want to capture touch events set this to false
          captureLifecycleEvents: true, // If you don't want to capture the Lifecycle Events (e.g. Application Opened) set this to false
          captureScreens: true, // If you don't want to capture screen events set this to false
          ignoreLabels: [], // Any labels here will be ignored from the stack in touch events

          navigation: {
            // By default only the Screen name is tracked but it is possible to track the
            // params or modify the name by intercepting theautocapture like so
            routeToName: (name, params) => {
              if (params.id) return `${name}/${params.id}`;
              return name;
            },
            routeToParams: (name, params) => {
              if (name === 'SensitiveScreen') return undefined;
              return params;
            },
          },
        }}>
        <AuthProvider>
          <GestureHandlerRootView style={{flex: 1}}>
            <ActionSheetProvider>
              <BottomSheetModalProvider>
                <Stack screenOptions={{headerShown: false}}>
                  <Stack.Screen
                    name="camera"
                    options={{presentation: 'modal'}}
                  />
                </Stack>
              </BottomSheetModalProvider>
            </ActionSheetProvider>
          </GestureHandlerRootView>
        </AuthProvider>
      </PostHogProvider>
    </SafeAreaProvider>
  );
};
export default Sentry.wrap(Layout);
