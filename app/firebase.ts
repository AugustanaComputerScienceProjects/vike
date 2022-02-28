import storage from '@react-native-firebase/storage';
import {FirebaseDatabaseTypes} from '@react-native-firebase/database';
import database from '@react-native-firebase/database';
import auth from '@react-native-firebase/auth';

export type DataSnapshot = FirebaseDatabaseTypes.DataSnapshot;
export const currentEventsRef = database().ref('/current-events');
export const currentUser = auth().currentUser;

export const getStorageImgURL = async (imageName: string) => {
  const imgURL = await storage()
    .ref('Images/' + imageName + '.jpg')
    .getDownloadURL();
  return imgURL;
};
