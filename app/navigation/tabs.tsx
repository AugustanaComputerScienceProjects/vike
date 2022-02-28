import React from 'react';
import {View} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Featured, Favorites, Tickets, Mine} from '../screens';
import {Icon, Text} from 'native-base';
import Feather from 'react-native-vector-icons/Feather';
import {COLORS} from '../constants';

const Tab = createBottomTabNavigator();

const TabIcon = ({focused, icon}) => {
  return (
    <View style={{alignItems: 'center', justifyContent: 'center'}}>
      <Icon
        as={Feather}
        name={icon}
        color={focused ? '#fff' : '#878787'}
        size={18}
        // _dark={{
        //   color: 'warmGray.50',
        // }}
      />
      {/* <McIcon
        size={focused ? 24 : 32}
        source={icon}
        resizeMode="contain"
        style={{
          tintColor: focused ? '#fff' : '#878787',
        }}
      /> */}
    </View>
  );
};
const TabLabel = ({focused, text}) => {
  return focused ? (
    <Text
      color="white"
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

const Tabs = ({params}) => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 0,
          backgroundColor: COLORS.tabBar,
          opacity: 0.9,
          borderTopColor: 'transparent',
          height: 111,
          borderRadius: 20,
        },
      }}>
      <Tab.Screen
        name="Featured"
        component={Featured}
        options={{
          tabBarIcon: ({focused}) => {
            return <TabIcon focused={focused} icon={'compass'} />;
          },
          tabBarLabel: ({focused}) => (
            <TabLabel focused={focused} text="Featured" />
          ),
        }}
      />
      <Tab.Screen
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
      />
      <Tab.Screen
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
      />
      <Tab.Screen
        name="Mine"
        component={Mine}
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

export default Tabs;
