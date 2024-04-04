import {useActionSheet} from '@expo/react-native-action-sheet';
import Icon from '@expo/vector-icons/Feather';
import auth from '@react-native-firebase/auth';
import {router} from 'expo-router';
import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Avatar} from 'react-native-elements';
import {ScrollView, TouchableOpacity} from 'react-native-gesture-handler';
import {SafeAreaView} from 'react-native-safe-area-context';
import {COLORS} from '../../../constants/theme';

const getInitials = fullName => {
  const allNames = fullName.trim().split(' ');
  return allNames.map(name => name.charAt(0).toUpperCase()).join('');
};

export default function Profile() {
  const {showActionSheetWithOptions} = useActionSheet();
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

  const onLogout = () => {
    const options = ['Log out', 'Cancel'];
    const destructiveButtonIndex = 0;
    const cancelButtonIndex = 1;

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
        destructiveButtonIndex,
      },
      buttonIndex => {
        if (buttonIndex === destructiveButtonIndex) {
          auth()
            .signOut()
            .then(() => console.log('User signed out!'));
        }
      },
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scroll}>
        <View style={styles.headerContainer}>
          <View style={styles.userRow}>
            <Avatar
              overlayContainerStyle={{backgroundColor: COLORS.gray1}}
              size="small"
              activeOpacity={0.7}
              rounded
              title={getInitials(auth().currentUser?.displayName)}
              source={{uri: 'data:image/png'}}
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
            {settingsOptions.map(({title, icon, href}) => (
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

        <TouchableOpacity onPress={onLogout}>
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
    backgroundColor: COLORS.background,
    flex: 1,
    flexGrow: 1,
  },
  headerContainer: {
    marginBottom: 10,
    marginTop: 45,
  },
  menuItem: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 14,
    marginTop: 14,
  },
  scroll: {
    flexGrow: 1,
    marginBottom: 100,
    paddingHorizontal: 24,
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
