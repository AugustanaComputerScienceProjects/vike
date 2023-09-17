import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {Stack} from 'expo-router';

// For Android
GoogleSignin.configure({
  webClientId:
    '559059413195-lrs55dujb4j5jkoc3tjoemjpasdhntj3.apps.googleusercontent.com',
  hostedDomain: 'augustana.edu',
});

export default function Layout() {
  return <Stack screenOptions={{headerShown: false}} />;
}
