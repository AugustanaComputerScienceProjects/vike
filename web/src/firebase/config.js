import firebase from "firebase/compat/app";

import "firebase/compat/auth";
import "firebase/compat/database";
import "firebase/compat/storage";

// Config file for Firebase

// Config to initialize Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
};

class Firebase {
  constructor() {
    let app = firebase.initializeApp(firebaseConfig);
    this.database = app.database();
    this.storage = app.storage();
    this.auth = app.auth();
    this.adminSignedIn = false;
  }

  // Signs in the user via Google through a pop-up
  signIn = () => {
    var provider = new app.auth.GoogleAuthProvider();
    this.auth
      .signInWithPopup(provider)
      .then((result) => {
        // var token = result.credential.accessToken;
        var user = result.user;
        this.adminSignedIn = true;
        console.log(user.email);
      })
      .catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
        var email = error.email;
        var credential = error.credential;
        console.log("Error Signing in...");
        console.log(errorCode);
        console.log(errorMessage);
        console.log(email);
        console.log(credential);
      });
  };

  // Signs out the current user
  signOut = () => this.auth.signOut();
}

const firebaseApp = new Firebase();

export default firebaseApp;
