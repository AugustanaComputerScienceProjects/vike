import auth from '@react-native-firebase/auth';
import {useNavigation} from '@react-navigation/native';
import {Avatar, Text} from 'native-base';
import React from 'react';
import {ActionSheetIOS, StyleSheet, View} from 'react-native';
import {ScrollView, TouchableOpacity} from 'react-native-gesture-handler';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Icon} from '../../components/icons';
import {COLORS} from '../../constants';

const getInitials = (fullName: string) => {
  const allNames = fullName.trim().split(' ');
  const initials = allNames.reduce((acc, curr, index) => {
    if (index === 0 || index === allNames.length - 1) {
      acc = `${acc}${curr.charAt(0).toUpperCase()}`;
    }
    return acc;
  }, '');
  return initials;
};

const Profile = () => {
  const navigation = useNavigation();

  const settingsOptions = [
    {
      title: 'About Vike',
      icon: 'info',
      subTitle: null,
      onPress: () => navigation.navigate('About'), //TODO: Add navigation types
    },
    {
      title: 'Give us feedback',
      icon: 'edit-2',
      subTitle: null,
      onPress: () => navigation.navigate('Feedback'),
    },
    // {
    //   title: 'Share Vike',
    //   icon: 'share',
    //   subTitle: null,
    //   onPress: () => {},
    // },
    // {
    //   title: 'Terms of Service',
    //   icon: 'file-text',
    //   subTitle: null,
    //   onPress: () => {},
    // },
    // {
    //   title: 'Privacy Policy',
    //   icon: 'file-text',
    //   subTitle: null,
    //   onPress: () => {},
    // },
  ];
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scroll}>
        <View style={styles.headerContainer}>
          <View style={styles.userRow}>
            <Avatar size="md" mb="4" style={styles.userImage}>
              {getInitials(auth().currentUser?.displayName)}
            </Avatar>
            {/* <Image source={{uri: avatar}} /> */}
            <View style={styles.userNameRow}>
              <Text style={styles.userNameText}>
                {auth().currentUser?.displayName}
              </Text>
            </View>
          </View>
        </View>

        <View>
          <Text color={COLORS.text} mb={4} fontSize={'xl'} fontWeight="bold">
            Settings
          </Text>
          <View>
            {settingsOptions.map(({title, icon, subTitle, onPress}) => (
              <TouchableOpacity key={title} onPress={onPress}>
                <View style={styles.menuItem}>
                  <Icon color={COLORS.text} size={18} name={icon} />
                  <View style={{marginLeft: 16}}>
                    <Text style={{fontSize: 17}}>{title}</Text>
                    {subTitle && (
                      <Text style={{fontSize: 14, opacity: 0.5}}>
                        {subTitle}
                      </Text>
                    )}
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
          color={COLORS.text}
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
            <Text color={COLORS.text} fontSize={14} underline>
              Log out
            </Text>
          </View>
          <View style={{height: 0.5, backgroundColor: COLORS.gray}} />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    flexGrow: 1,
    // alignItems: 'center',
  },
  cardContainer: {
    flex: 1,
  },
  headerContainer: {
    // alignItems: 'center',
    // backgroundColor: '#FFF',
    marginBottom: 10,
    marginTop: 45,
  },
  indicatorTab: {
    backgroundColor: 'transparent',
  },
  scroll: {
    flexGrow: 1,
    // justifyContent: 'space-between',
    // flexDirection: 'column',
    paddingHorizontal: 24,
    marginBottom: 100,
  },
  menuItem: {
    flexDirection: 'row',
    marginTop: 14,
    marginBottom: 14,
    alignItems: 'center',
  },
  sceneContainer: {
    marginTop: 10,
  },
  socialIcon: {
    marginLeft: 14,
    marginRight: 14,
  },
  socialRow: {
    flexDirection: 'row',
  },
  tabBar: {},
  tabContainer: {
    flex: 1,
    marginBottom: 12,
  },
  tabLabelNumber: {
    color: 'gray',
    fontSize: 12.5,
    textAlign: 'center',
  },
  tabLabelText: {
    color: COLORS.text,
    fontSize: 22.5,
    fontWeight: '600',
    textAlign: 'center',
  },
  userBioRow: {
    marginLeft: 40,
    marginRight: 40,
  },
  userBioText: {
    color: 'gray',
    fontSize: 13.5,
    textAlign: 'center',
  },
  userImage: {
    // borderRadius: 60,
    height: 120,
    marginBottom: 20,
    width: 120,
  },
  userNameRow: {
    marginBottom: 10,
  },
  userNameText: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 30,
    // textAlign: 'center',
  },
  userRow: {
    // alignItems: 'center',
    // flexDirection: 'column',
    // justifyContent: 'center',
    marginBottom: 12,
  },
});

export default Profile;
