import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';
import storage from '@react-native-firebase/storage';

export const getStorageImgURL = async imageName => {
  const imgURL = await storage()
    .ref('Images/' + imageName + '.jpg')
    .getDownloadURL();
  return imgURL;
};

export const db = database();
export const authInstance = auth();
