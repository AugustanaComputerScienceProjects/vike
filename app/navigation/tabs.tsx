import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createStackNavigator} from '@react-navigation/stack';
import {Icon, Text} from 'native-base';
import React from 'react';
import {View} from 'react-native';
import {TouchableWithoutFeedback} from 'react-native-gesture-handler';
import Feather from 'react-native-vector-icons/Feather';
import CameraScanner from '../components/camera-scanner';
import {Icon as IconComponent} from '../components/icons';
import {COLORS} from '../constants';
import {Home, Profile} from '../screens';
import About from '../screens/profile/about';
import Feedback from '../screens/profile/feedback';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

interface TabIconProps {
  focused: boolean;
  icon: string;
}

interface TabLabelProps {
  focused: boolean;
  text: string;
}

interface RootProps {
  navigation: any;
}

const PlaceholderComponent = () => <View />;

const TabIcon = ({focused, icon}: TabIconProps) => {
  return (
    <View style={{alignItems: 'center', justifyContent: 'center'}}>
      <Icon
        as={Feather}
        name={icon}
        color={focused ? '#FB8500' : '#878787'}
        size={25}
        // _dark={{
        //   color: 'warmGray.50',
        // }}
      />
    </View>
  );
};
const TabLabel = ({focused, text}: TabLabelProps) => {
  return focused ? (
    <Text
      color={COLORS.text}
      fontSize="md"
      style={{
        marginTop: -25,
        paddingBottom: 10,
      }}>
      {text}
    </Text>
  ) : (
    <View />
  );
};

const Tabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarShowLabel: false,
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 0,
          backgroundColor: COLORS.background,
          // opacity: 0.9,
          // borderTopColor: 'transparent',
          height: 83,
          // borderRadius: 20,
        },
      }}>
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          tabBarIcon: ({focused}) => {
            return <TabIcon focused={focused} icon={'compass'} />;
          },
          tabBarLabel: ({focused}) => (
            <TabLabel focused={focused} text="Home" />
          ),
        }}
      />
      <Tab.Screen
        name="Camera"
        component={PlaceholderComponent}
        listeners={({navigation}) => ({
          tabPress: e => {
            e.preventDefault();
            navigation.navigate('CameraScanner');
          },
        })}
        options={{
          tabBarIcon: ({focused}) => (
            <TabIcon focused={focused} icon={'camera'} />
          ),
        }}
      />
      {/* <Tab.Screen
        name="Favorites"
        component={Favorites}
        options={{
          tabBarIcon: ({focused}) => (
            <TabIcon focused={focused} icon={'heart'} />
          ),
          tabBarLabel: ({focused}) => (
            <TabLabel focused={focused} text="Favorites" />
          ),
        }}
      /> */}
      {/* <Tab.Screen
        name="Tickets"
        component={Tickets}
        options={{
          tabBarIcon: ({focused}) => (
            <TabIcon focused={focused} icon={'feather'} />
          ),
          tabBarLabel: ({focused}) => (
            <TabLabel focused={focused} text="Tickets" />
          ),
        }}
      /> */}
      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{
          tabBarIcon: ({focused}) => (
            <TabIcon focused={focused} icon={'user'} />
          ),
          tabBarLabel: ({focused}) => (
            <TabLabel focused={focused} text="Profile" />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const Root = ({navigation}: RootProps) => (
  <Stack.Navigator
    initialRouteName="Profile"
    screenOptions={{
      headerTitleStyle: {
        fontWeight: 'bold',
      },
      headerLeft: () => (
        <TouchableWithoutFeedback
          onPress={() => navigation.goBack()}
          style={{marginLeft: 10}}>
          <IconComponent
            color={COLORS.text}
            size={30}
            name="chevron-left"
            style={{marginLeft: 'auto', width: 60}}
          />
        </TouchableWithoutFeedback>
      ),
    }}>
    <Stack.Screen
      name="Tabs"
      component={Tabs}
      options={{
        headerShown: false,
      }}
    />
    <Stack.Screen name="About" component={About} />
    <Stack.Screen name="Feedback" component={Feedback} />
  </Stack.Navigator>
);

export default Root;
