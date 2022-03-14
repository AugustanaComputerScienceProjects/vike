import React from 'react';
import {SafeAreaView, StyleSheet} from 'react-native';
import {WebView} from 'react-native-webview';

const Feedback = () => {
  return (
    <SafeAreaView style={styles.container}>
      <WebView
        source={{
          uri: 'https://docs.google.com/forms/d/e/1FAIpQLSdocTSgoMnv3p05XmMuvsrGdd8eRyYpTHSvWYK4uPVEbeXogw/viewform?usp=pp_url&entry.1651531131=1.1',
        }}
      />
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
