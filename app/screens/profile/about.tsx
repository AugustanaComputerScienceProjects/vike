import React from 'react';
import {SafeAreaView, StyleSheet, View, Image} from 'react-native';
import {COLORS} from '../../constants';
import {Center, Text} from 'native-base';
import FastImage from 'react-native-fast-image';

const About = ({props}) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={{margin: 24}}>
        <Center fontSize={18}>
          <Text fontSize={18}>Vike App - from OSL</Text>
          <Image
            style={{marginTop: 20, marginBottom: 5, width: 100, height: 100}}
            source={require('../../assets/vike.png')}
          />
        </Center>
        <Text fontSize={18}>
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
    // justifyContent: 'center',
    // alignItems: 'center',
  },
});

export default About;
