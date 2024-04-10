import {Dimensions} from 'react-native';
const {width, height} = Dimensions.get('window');

export const COLORS = {
  default: '#FFFFFF',
  primary: '#FB8500',
  white: '#FFFFFF',
  black: '#000000',
  tabBar: '#121212',
  input: '#1D1D1D',
  text: '#000',
  blue: '#4096FE',
  gray: '#8e8e93',
  gray1: '#AEAEB2',
  gray2: '#C7C7CC',
  gray3: '#D1D1D6',
  gray4: '#E5E5EA',
  gray5: '#F2F2F7',
  grayBorder: '#D8D9E0',
  lightGray: '#dedede',
  background: '#F9F9FB',
  transparentWhite: 'rgba(255, 255, 255, 0.2)',
  transparentBlack: 'rgba(0, 0, 0, 0.4)',
  linear: ['#8ECAE6', '#023047'],
};
export const SIZES = {
  // global sizes
  base: 8,
  font: 14,
  radius: 20,
  small: 24,
  padding: '30px',
  big: 32,

  // font sizes
  large: '40px',
  h1: '30px',
  h2: '24px',
  h3: '20px',
  h4: '16px',
  h5: '14px',
  h6: '13px',
  body1: '30px',
  body2: '22px',
  body3: '16px',
  body4: '14px',
  body5: '13px',
  body6: '12px',

  // app dimensions
  width,
  height,
};
// export const FONTS = {
//   large: {
//     fontFamily: CUSTOMFONT_REGULAR,
//     fontSize: SIZES.large,
//     lineHeight: '40px',
//   },
//   small: {
//     fontFamily: CUSTOMFONT_REGULAR,
//     fontSize: SIZES.small,
//     lineHeight: '22px',
//   },
//   h1: {fontFamily: CUSTOMFONT_BOLD, fontSize: SIZES.h1, lineHeight: '36px'},
//   h2: {fontFamily: CUSTOMFONT_BOLD, fontSize: SIZES.h2, lineHeight: '30px'},
//   h3: {fontFamily: CUSTOMFONT_BOLD, fontSize: SIZES.h3, lineHeight: '22px'},
//   h4: {fontFamily: CUSTOMFONT_BOLD, fontSize: SIZES.h4, lineHeight: '22px'},
//   h5: {fontFamily: CUSTOMFONT_BOLD, fontSize: SIZES.h5, lineHeight: '22px'},
//   h6: {fontFamily: CUSTOMFONT_BOLD, fontSize: SIZES.h6, lineHeight: '22px'},
//   body1: {
//     fontFamily: CUSTOMFONT_REGULAR,
//     fontSize: SIZES.body1,
//     lineHeight: '36px',
//   },
//   body2: {
//     fontFamily: CUSTOMFONT_REGULAR,
//     fontSize: SIZES.body2,
//     lineHeight: '30px',
//   },
//   body3: {
//     fontFamily: CUSTOMFONT_REGULAR,
//     fontSize: SIZES.body3,
//     lineHeight: '25px',
//   },
//   body4: {
//     fontFamily: CUSTOMFONT_REGULAR,
//     fontSize: SIZES.body4,
//     lineHeight: '22px',
//   },
//   body5: {
//     fontFamily: CUSTOMFONT_REGULAR,
//     fontSize: SIZES.body5,
//     lineHeight: '22px',
//   },
//   body6: {
//     fontFamily: CUSTOMFONT_REGULAR,
//     fontSize: SIZES.body6,
//     lineHeight: '22px',
//   },
// };

const appTheme = {COLORS, SIZES};

export default appTheme;
