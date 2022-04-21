import {useNavigation} from '@react-navigation/native';
import moment from 'moment';
import {Box, Text} from 'native-base';
import React from 'react';
import {
  Dimensions,
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
import {parseDate} from '../../utils/moment';

interface Iprops {
  data: Event[];
  setIsSearching: (isSearching: boolean) => void;
  setQuery: (query: string) => void;
}

const windowWidth = Dimensions.get('window').width;

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
              <Box maxW={windowWidth - 100} style={styles.listItem}>
                <FastImage
                  source={{uri: item.image}}
                  style={styles.coverImage}
                />
                <View style={styles.metaInfo}>
                  <Text style={styles.title}>{`${item.name}`}</Text>
                  <Text color={COLORS.text}>{`${parseDate(
                    item.startDate,
                  )} `}</Text>

                  <Text color={COLORS.text}>at {`${item.location} `}</Text>
                </View>
              </Box>
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
