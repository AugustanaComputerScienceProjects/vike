import {Text} from 'native-base';
import React from 'react';
import {StyleSheet, View} from 'react-native';

const Mine = ({params}) => {
  return (
    <View style={styles.container}>
      <Text>Mine</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Mine;
