import Icon from '@expo/vector-icons/Feather';
import {Link, Tabs} from 'expo-router';
import {Pressable, Text, View} from 'react-native';
import {COLORS} from '../../constants/theme';

const TabIcon = ({focused, icon}) => {
  return (
    <View style={{alignItems: 'center', justifyContent: 'center'}}>
      <Icon name={icon} color={focused ? '#FB8500' : '#878787'} size={25} />
    </View>
  );
};
const TabLabel = ({focused, text}) => {
  return focused ? (
    <Text
      color={COLORS.text}
      style={{
        fontSize: 12,
        paddingBottom: 10,
      }}>
      {text}
    </Text>
  ) : (
    <View />
  );
};
export default function TabLayout() {
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
          // opacity: 0.9,
          // borderTopColor: 'transparent',
          // height: 60,
          // borderRadius: 20,
        },
      }}>
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({focused}) => (
            <TabIcon focused={focused} icon={'compass'} />
          ),
          headerRight: () => (
            <Link href="/modal" asChild>
              <Pressable>
                {({pressed}) => (
                  <Icon
                    name="info-circle"
                    size={25}
                    style={{marginRight: 15, opacity: pressed ? 0.5 : 1}}
                  />
                )}
              </Pressable>
            </Link>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
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
