import React from 'react';
import {SafeAreaView, StyleSheet} from 'react-native';
import {COLORS} from '../../constants';
import {Center, Text} from 'native-base';

const About = ({props}) => {
  return (
    <SafeAreaView style={styles.container}>
      <Center fontSize={18}>
        <Text fontSize={18}>Vike App - from OSL</Text>
      </Center>
      <Text fontSize={18}>
        {`
To provide an easy way to find and check in for the upcoming events on Augustana campus.

Developed by: Hung Tran
Designed by: Viet (Ethan) Bui
Advised by: Dr. Stonedahl
`}
      </Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 8,
    flex: 1,
    backgroundColor: COLORS.background,
    // justifyContent: 'center',
    // alignItems: 'center',
  },
});

export default About;
