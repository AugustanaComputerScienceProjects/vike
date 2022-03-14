import {useNavigation} from '@react-navigation/native';
import {Text} from 'native-base';
import React from 'react';
import {
  FlatList,
  Keyboard,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import styled from 'styled-components/native';
import {COLORS, SIZES} from '../../constants';
import {Event} from '../../screens/home';

interface Iprops {
  data: Event[];
  setIsSearching: (isSearching: boolean) => void;
  setQuery: (query: string) => void;
}

const FeaturedList = ({data, setQuery, setIsSearching}: Iprops) => {
  const navigation = useNavigation();
  return (
    <Wrapper>
      <SectionTitle>
        <Text color={COLORS.text} fontSize={'xl'} fontWeight={'bold'}>
          All Events
        </Text>
      </SectionTitle>
      <View
        style={
          {
            // flex: 1,
            // width: '100%',
            // marginTop: metrics.extraLargeSize * 1.5,
            // marginBottom: metrics.extraLargeSize * 4,
          }
        }>
        <FlatList
          scrollEnabled={false}
          data={data}
          keyExtractor={item => item.id}
          renderItem={({item}: {item: Event}) => (
            <TouchableWithoutFeedback
              onPress={() => {
                navigation.navigate('EventDetail', {event: item});
                Keyboard.dismiss();
                setIsSearching(false);
                setQuery('');
              }}>
              <View style={styles.listItem}>
                <FastImage
                  source={{uri: item.image}}
                  style={styles.coverImage}
                />
                <View style={styles.metaInfo}>
                  <Text color={COLORS.text}>{`${item.startDate} `}</Text>
                  <Text style={styles.title}>{`${item.name}`}</Text>
                  <Text color={COLORS.text}>{`${item.location} `}</Text>
                </View>
              </View>
            </TouchableWithoutFeedback>
          )}
        />
      </View>
    </Wrapper>
  );
};

const Wrapper = styled(View)`
  width: 100%;
  height: 100%;
  flex: 1;
`;

const SectionTitle = styled.View`
  margin: 20px ${SIZES.padding} 0;
`;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  coverImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  listItem: {
    // marginTop: 10,
    paddingVertical: 15,
    paddingHorizontal: 20,
    // backgroundColor: '#fff',
    flexDirection: 'row',
  },
  metaInfo: {
    paddingLeft: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
});

export default FeaturedList;
