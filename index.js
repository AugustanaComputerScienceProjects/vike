/**
 * @format
 */
import 'react-native-reanimated';

import {AppRegistry} from 'react-native';
import App from './app/app';
import {name as appName} from './app.json';

import {LogBox} from 'react-native';

LogBox.ignoreLogs(['NativeBase:']);

AppRegistry.registerComponent(appName, () => App);
