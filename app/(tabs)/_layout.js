import Icon from '@expo/vector-icons/Feather';
import {Tabs} from 'expo-router';
import React from 'react';
import {View} from 'react-native';
import {COLORS} from '../../constants/theme';
import {useAuth} from '../../context/useAuth';

const TabIcon = ({focused, icon}) => {
  return (
    <View style={{alignItems: 'center', justifyContent: 'center'}}>
      <Icon name={icon} color={focused ? '#FB8500' : '#878787'} size={25} />
    </View>
  );
};
export default function TabLayout() {
  const {user, initialized} = useAuth();
  return (
    <Tabs
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
        },
      }}>
      <Tabs.Screen
        redirect={!user}
        name="home"
        options={{
          tabBarIcon: ({focused}) => (
            <TabIcon focused={focused} icon={'compass'} />
          ),
        }}
      />
      <Tabs.Screen
        redirect={!user}
        name="(profile)"
        options={{
          title: 'Profile',
          tabBarIcon: ({focused}) => (
            <TabIcon focused={focused} icon={'user'} />
          ),
        }}
      />
    </Tabs>
  );
}
