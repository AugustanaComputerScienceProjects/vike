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
    var provider = new firebase.auth.GoogleAuthProvider();
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
