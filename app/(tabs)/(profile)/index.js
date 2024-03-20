import Icon from '@expo/vector-icons/Feather';
import auth from '@react-native-firebase/auth';
import {router} from 'expo-router';
import React from 'react';
import {ActionSheetIOS, StyleSheet, Text, View} from 'react-native';
import {Avatar} from 'react-native-elements';
import {ScrollView, TouchableOpacity} from 'react-native-gesture-handler';
import {SafeAreaView} from 'react-native-safe-area-context';
import {COLORS} from '../../../constants/theme';

const getInitials = fullName => {
  const allNames = fullName.trim().split(' ');
  return allNames.map(name => name.charAt(0).toUpperCase()).join('');
};

export default function Profile() {
  const settingsOptions = [
    {
      title: 'About Vike',
      href: '/about',
      icon: 'info',
    },
    {
      title: 'Give us feedback',
      href: '/feedback',
      icon: 'edit-2',
    },
    // {
    //   title: 'Share Vike',
    //   icon: 'share',
    //   subTitle: null,
    //   onPress: () => {},
    // },
  ];
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scroll}>
        <View style={styles.headerContainer}>
          <View style={styles.userRow}>
            <Avatar
              overlayContainerStyle={{backgroundColor: 'grey'}}
              size="small"
              activeOpacity={0.7}
              rounded
              title={getInitials(auth().currentUser?.displayName)}
            />
            <View style={styles.userNameRow}>
              <Text style={styles.userNameText}>
                {auth().currentUser?.displayName}
              </Text>
            </View>
          </View>
        </View>

        <View>
          <Text
            style={{
              marginBottom: 4,
              fontSize: 17,
              fontWeight: 'bold',
            }}>
            Settings
          </Text>
          <View>
            {settingsOptions.map(({title, icon, subTitle, href}) => (
              <TouchableOpacity
                key={title}
                onPress={() => router.navigate(href)} // Assuming you have access to the navigation prop
                style={{flex: 1}}>
                <View style={styles.menuItem}>
                  <Icon color={COLORS.text} size={18} name={icon} />
                  <View style={{marginLeft: 16}}>
                    <Text style={{fontSize: 17}}>{title}</Text>
                  </View>
                  <Icon
                    color={COLORS.text}
                    size={18}
                    name="chevron-right"
                    style={{marginLeft: 'auto'}}
                  />
                </View>

                <View style={{height: 0.5, backgroundColor: COLORS.gray}} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          onPress={() => {
            ActionSheetIOS.showActionSheetWithOptions(
              {
                options: ['Log out', 'Cancel'],
                cancelButtonIndex: 1,
                cancelButtonTintColor: 'red',
              },
              buttonIndex => {
                if (buttonIndex === 0) {
                  auth()
                    .signOut()
                    .then(() => console.log('User signed out!'));
                }
              },
            );
          }}>
          <View style={{marginTop: 48, paddingBottom: 10}}>
            <Text
              style={{
                fontSize: 14,
                textDecorationLine: 'underline',
              }}>
              Log out
            </Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    flexGrow: 1,
  },
  headerContainer: {
    marginBottom: 10,
    marginTop: 45,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    marginBottom: 100,
  },
  menuItem: {
    flexDirection: 'row',
    marginTop: 14,
    marginBottom: 14,
    alignItems: 'center',
  },
  userNameRow: {
    marginBottom: 10,
  },
  userNameText: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 30,
  },
  userRow: {
    marginBottom: 12,
  },
});
