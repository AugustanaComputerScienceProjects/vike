import {Text} from 'native-base';
import React from 'react';
import {StyleSheet, View} from 'react-native';
import {ScrollView, TouchableOpacity} from 'react-native-gesture-handler';
import auth from '@react-native-firebase/auth';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Avatar} from 'native-base';
import {SIZES, COLORS} from '../constants';

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

const Mine = ({params}) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.scroll}>
        <View style={styles.headerContainer}>
          <View style={styles.userRow}>
            <Avatar size="xl" mb="4" style={styles.userImage}>
              {getInitials(auth().currentUser?.displayName)}
            </Avatar>
            {/* <Image source={{uri: avatar}} /> */}
            <View style={styles.userNameRow}>
              <Text style={styles.userNameText}>
                {auth().currentUser?.displayName}
              </Text>
            </View>
            {/* <View style={styles.userBioRow}>
              <Text style={styles.userBioText}>{bio}</Text>
            </View> */}
          </View>
        </View>

        <TouchableOpacity
          color={COLORS.text}
          onPress={() => {
            auth()
              .signOut()
              .then(() => console.log('User signed out!'));
          }}>
          <Text color={COLORS.text} fontWeight={'bold'}>
            Sign Out
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    flexGrow: 1,
    alignItems: 'center',
  },
  cardContainer: {
    flex: 1,
  },
  headerContainer: {
    alignItems: 'center',
    // backgroundColor: '#FFF',
    marginBottom: 10,
    marginTop: 45,
  },
  indicatorTab: {
    backgroundColor: 'transparent',
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'space-between',
    flexDirection: 'column',
    marginBottom: 100,
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
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  userRow: {
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'center',
    marginBottom: 12,
  },
});

export default Mine;
