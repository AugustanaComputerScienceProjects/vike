import {Text} from 'native-base';
import React from 'react';
import {View, StyleSheet} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {SectionHeader} from './featured';

const Tickets = ({params}) => {
  return (
    <SafeAreaView style={styles.container}>
      <SectionHeader>
        <View>
          {/* <Text color="white" opacity={0.5}>
              DECEMBER 21 0:10PM
            </Text> */}
          <Text fontSize={'3xl'} fontWeight={'bold'} color="white">
            Tickets
          </Text>
        </View>
        {/* <Avatar source={images.avatar} /> */}
      </SectionHeader>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
});

export default Tickets;
