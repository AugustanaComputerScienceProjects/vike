import {Text} from 'native-base';
import React from 'react';
import {View, StyleSheet} from 'react-native';

const Schedule = ({params}) => {
  return (
    <View style={styles.container}>
      <Text style={{color: '#fff', fontSize: 30}}>Schedule</Text>
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

export default Schedule;
