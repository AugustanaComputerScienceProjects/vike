import {Text} from 'native-base';
import React from 'react';
import {FlatList, View} from 'react-native';
import styled from 'styled-components/native';
import {COLORS, metrics, SIZES} from '../../constants';
import {Event} from '../../screens/home';
import Card from '../card';

interface Iprops {
  data: Event[];
}

const FeaturedList = ({data}: Iprops) => {
  const _renderItem = ({item}: any, index: number) => {
    return <Card item={item} index={index} length={data?.length} />;
  };
  return (
    <Wrapper>
      <SectionTitle>
        <Text color={COLORS.text} fontSize={'xl'} fontWeight={'bold'}>
          Featured
        </Text>
      </SectionTitle>
      <View
        style={{
          // flex: 1,
          // width: '100%',
          marginTop: metrics.extraLargeSize * 1.5,
          // marginBottom: metrics.extraLargeSize * 4,
        }}>
        <FlatList
          horizontal
          contentContainerStyle={{}}
          keyExtractor={item => 'event_' + item.id}
          data={data}
          showsHorizontalScrollIndicator={false}
          renderItem={_renderItem}
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

export default FeaturedList;
