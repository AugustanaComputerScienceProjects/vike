import React from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import {COLORS} from '../../../constants/theme';

const About = () => {
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

Developed by: Hung Tran, Stephanie Nhi Le

Formerly developed by: Kyle Workman, Jared Haeme, Brandon Thompson, Jack Cannell, Brent Pierce, Paige Oucheriah

Advised by: Dr. Stonedahl

Logo designed by: Viet (Ethan) Bui
`}
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    flex: 1,
  },
  content: {
    margin: 24,
  },
  description: {
    fontSize: 18,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    height: 100,
    width: 100,
  },
  titleText: {
    fontSize: 18,
    marginBottom: 20,
  },
});

export default About;
