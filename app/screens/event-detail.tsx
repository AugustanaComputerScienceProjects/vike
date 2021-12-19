import React from 'react';
import {Text, View, StyleSheet} from 'react-native';

const EventDetail = ({navigation, route}) => {
  return (
    <View style={styles.container}>
      <Text style={{color: '#fff', fontSize: 30}}>EventDetail</Text>
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

export default EventDetail;
