import storage from '@react-native-firebase/storage';
import {FirebaseDatabaseTypes} from '@react-native-firebase/database';

export type DataSnapshot = FirebaseDatabaseTypes.DataSnapshot;

export const getStorageImgURL = async (imageName: string) => {
  const imgURL = await storage()
    .ref('Images/' + imageName + '.jpg')
    .getDownloadURL();
  return imgURL;
};
