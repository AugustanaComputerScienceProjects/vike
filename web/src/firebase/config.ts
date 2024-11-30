import { GoogleAuthProvider } from "firebase/auth";
import firebase from "firebase/compat/app";

import "firebase/compat/auth";
import "firebase/compat/database";
import "firebase/compat/storage";

// Config file for Firebase

// Config to initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAIS1uFiAJTVABCxu_QnjGKw6-3nh5L0lU",
  authDomain: "osl-events-app.firebaseapp.com",
  databaseURL: "https://osl-events-app.firebaseio.com", 
  projectId: "osl-events-app",
  storageBucket: "osl-events-app.appspot.com",
  messagingSenderId: "559059413195",
  appId: "1:559059413195:web:0d1a1c031a71c497b8934e",
  measurementId: "G-VMZ9SHGQWY"
};

// Initialize Firebase app
const app = firebase.initializeApp(firebaseConfig);

// Initialize services
const database = app.database();
const storage = app.storage();
const auth = app.auth();

let adminSignedIn = false;

// Signs in the user via Google through a pop-up
const signIn = async (): Promise<void> => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await auth.signInWithPopup(provider);
    const user = result.user;
    adminSignedIn = true;
    console.log(user?.email);
  } catch (error: any) {
    console.log("Error Signing in...");
    console.log(error.code);
    console.log(error.message);
    console.log(error.email);
    console.log(error.credential);
  }
};

// Signs out the current user
const signOut = async (): Promise<void> => {
  await auth.signOut();
};

const firebaseApp = {
  database,
  storage,
  auth,
  signIn,
  signOut,
  get adminSignedIn() {
    return adminSignedIn;
  },
  set adminSignedIn(value: boolean) {
    adminSignedIn = value;
  }
};

export default firebaseApp;
