import {Text} from 'native-base';
import React from 'react';
import {View, StyleSheet} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {SectionHeader} from './home';
import {COLORS} from '../constants';

const Tickets = ({params}) => {
  return (
    <SafeAreaView style={styles.container}>
      <SectionHeader>
        <View>
          <Text fontSize={'3xl'} fontWeight={'bold'} color={COLORS.text}>
            Tickets
          </Text>
        </View>
      </SectionHeader>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});

export default Tickets;
