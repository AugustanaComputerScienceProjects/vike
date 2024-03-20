import React from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import {COLORS} from '../../../constants/theme';

const About = ({props}) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.titleText}>Vike App - from OSL</Text>
          <Image
            style={styles.logo}
            source={require('../../../assets/vike.png')}
          />
        </View>
        <Text style={styles.description}>
          {`
To provide an easy way to find and check in for the upcoming events on Augustana campus.

Developed by: Hung Tran
Designed by: Viet (Ethan) Bui
Advised by: Dr. Stonedahl
`}
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    margin: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  titleText: {
    fontSize: 18,
    marginBottom: 20,
  },
  logo: {
    width: 100,
    height: 100,
  },
  description: {
    fontSize: 18,
  },
});

export default About;
