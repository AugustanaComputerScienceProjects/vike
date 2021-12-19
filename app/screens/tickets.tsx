import {Text} from 'native-base';
import React from 'react';
import {View, StyleSheet} from 'react-native';

const Tickets = ({params}) => {
  return (
    <View style={styles.container}>
      <Text style={{color: '#fff', fontSize: 30}}>Tickets</Text>
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

export default Tickets;
