import {extendTheme} from 'native-base';

const config = {
  useSystemColorMode: false,
  initialColorMode: 'light',
};

const colors = {
  primary: {
    50: '#CFD9E7',
    100: '#B0CCF0',
    200: '#89ABD8',
    300: '#6089BF',
    400: '#3C72B7',
    500: '#215FB0',
  },
  secondary: {
    100: '#FFF3C9',
    200: '#FFE99D',
    300: '#FFDB5E',
    400: '#FFCF2C',
    500: '#FDC400',
  },
};

export default extendTheme({config, colors});
