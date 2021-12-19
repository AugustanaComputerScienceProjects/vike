import React from 'react';
import {View} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Featured, Schedule, Tickets, Mine} from '../screens';
import {Icon, Text} from 'native-base';
import Feather from 'react-native-vector-icons/Feather';

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
      tabBarOptions={{
        style: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 0,
          backgroundColor: '#121212',
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
          tabBarIcon: ({focused}) => (
            <TabIcon focused={focused} icon={'compass'} />
          ),
          tabBarLabel: ({focused}) => (
            <TabLabel focused={focused} text="Featured" />
          ),
        }}
      />
      <Tab.Screen
        name="Schedule"
        component={Schedule}
        options={{
          tabBarIcon: ({focused}) => (
            <TabIcon focused={focused} icon={'calendar'} />
          ),
          tabBarLabel: ({focused}) => (
            <TabLabel focused={focused} text="Schedule" />
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
            <TabLabel focused={focused} text="Mine" />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default Tabs;
