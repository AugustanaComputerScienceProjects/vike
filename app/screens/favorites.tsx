import {Text} from 'native-base';
import React from 'react';
import {View, StyleSheet, SafeAreaView} from 'react-native';
import styled from 'styled-components/native';
import {SIZES} from '../constants';

const Favorites = ({props}) => {
  return (
    <SafeAreaView style={styles.container}>
      <SectionHeader>
        <View>
          {/* <Text color="white" opacity={0.5}>
              DECEMBER 21 0:10PM
            </Text> */}
          <Text fontSize={'3xl'} fontWeight={'bold'} color="white">
            Favorites
          </Text>
        </View>
        {/* <Avatar source={images.avatar} /> */}
      </SectionHeader>
    </SafeAreaView>
  );
};

const SectionHeader = styled.View`
  padding: 16px ${SIZES.padding};
  justify-content: space-between;
  align-items: center;
  flex-direction: row;
`;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    // justifyContent: 'center',
    // alignItems: 'center',
  },
});

export default Favorites;
