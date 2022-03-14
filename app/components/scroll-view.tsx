import React from 'react';
import {FlatList} from 'react-native';
import {ScrollViewProps} from 'react-native';

interface IProps extends ScrollViewProps {}

export type Props = React.FC<IProps>;

const ScrollViewComponent: Props = props => {
  return (
    <FlatList
      {...props}
      data={[]}
      keyExtractor={(e, i) => 'dom' + i.toString()}
      ListEmptyComponent={null}
      renderItem={null}
      ListHeaderComponent={() => <>{props.children}</>}
    />
  );
};

export default ScrollViewComponent;
