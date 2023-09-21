import Icon from '@expo/vector-icons/Feather';
import auth from '@react-native-firebase/auth';
import {Link} from 'expo-router';
import {ActionSheetIOS, StyleSheet, Text, View} from 'react-native';
import {ScrollView, TouchableOpacity} from 'react-native-gesture-handler';
import {SafeAreaView} from 'react-native-safe-area-context';
import {COLORS} from '../../constants/theme';

export default function Profile() {
  const settingsOptions = [
    {
      title: 'About Vike',
      href: '/about',
      icon: 'info',
      subTitle: null,
    },
    {
      title: 'Give us feedback',
      href: '/feedback',
      icon: 'edit-2',
      subTitle: null,
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
            {/* <Avatar size="md" mb="4" style={styles.userImage}>
              {getInitials(auth().currentUser?.displayName)}
            </Avatar> */}
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
            {settingsOptions.map(({title, icon, subTitle, href}) => (
              <Link key={title} href={href}>
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
              </Link>
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
}

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
