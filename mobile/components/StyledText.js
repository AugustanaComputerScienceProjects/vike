import {Text} from 'react-native';

export function MonoText(props) {
  return <Text {...props} style={[props.style]} />;
}
