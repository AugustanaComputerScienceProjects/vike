import React from 'react';
import {ImageStyle} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// export const GithubIcon = () => <Icon name="github" fill="red" />
export interface IconStyle {
  size?: number;
  style?: ImageStyle;
  fill?: string;
  color?: string;
}

type IProps = {
  color?: string;
  name: string;
  size?: number;
};

export const Icon = ({color, name, size}: IProps) => (
  <Feather color={color} name={name} size={size} />
);

export const EmailIcon = (props: IconStyle) => (
  <Feather {...props} name="mail" />
);
export const UserIcon = (props: IconStyle) => (
  <Feather {...props} name="user" />
);
export const LockIcon = (props: IconStyle) => (
  <Feather {...props} name="lock" />
);
export const EyeIcon = (props: IconStyle) => <Feather {...props} name="eye" />;

export const HomeIcon = (props: IconStyle) => (
  <Feather {...props} name="home" />
);
export const CalendarIcon = (props: IconStyle) => (
  <Feather {...props} name="calendar" />
);
export const ClosetIcon = (props: IconStyle) => (
  <MaterialCommunityIcons {...props} name="wardrobe-outline" />
);
export const ProfileIcon = (props: IconStyle) => (
  <Feather {...props} name="user" />
);
export const CheckIcon = (props: IconStyle) => (
  <Feather {...props} name="check" />
);
export const PlusIcon = (props: IconStyle) => (
  <Feather {...props} name="plus" />
);
export const XIcon = (props: IconStyle) => <Feather {...props} name="x" />;
export const HeartIcon = (props: IconStyle) => (
  <Feather {...props} name="heart" />
);
export const SearchIcon = (props: IconStyle) => (
  <Feather {...props} name="search" />
);
export const ArrowUpIcon = (props: IconStyle) => (
  <Feather {...props} name="arrow-up" />
);
export const ArrowDownIcon = (props: IconStyle) => (
  <Feather {...props} name="arrow-down" />
);

// export const PlusIcon = (props: IconStyle) => <Feather {...props} name="plus" />
// export const HomeOutlineIcon = (style: ImageStyle) => <Icon {...style} name="home-outline" />

// export const CalendarOutlineIcon = (style: ImageStyle) => (
//   <Icon {...style} name="calendar-outline" />
// )

// export const PersonOutlineIcon = (style: ImageStyle) => <Icon {...style} name="person-outline" />

// export const FunnelOutlineIcon = (style: ImageStyle) => <Icon {...style} name="funnel-outline" />

// export const PlusOutlineIcon = (style: ImageStyle): any => <Icon {...style} name="plus-outline" />
// export const GridOutlineIcon = (style: ImageStyle): any => <Icon {...style} name="grid-outline" />

// export const ArrowIosBackIcon = (style: ImageStyle) => <Icon {...style} name="arrow-ios-back" />
