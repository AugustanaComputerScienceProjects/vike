import React from 'react';
import {SafeAreaView, StyleSheet} from 'react-native';
import {WebView} from 'react-native-webview';

const Feedback = () => {
  return (
    <SafeAreaView style={styles.container}>
      <WebView source={{uri: 'https://reactnative.dev/'}} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // justifyContent: 'center',
    // alignItems: 'center',
  },
});

export default Feedback;
