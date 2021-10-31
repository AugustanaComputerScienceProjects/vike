import fire from 'firebase';
import app from 'firebase/app';
import 'firebase/database';
import 'firebase/storage';
import 'firebase/auth';

// Config file for Firebase

// Config to initialize Firebase
let config = {
  apiKey: 'AIzaSyBFTh3ZprCrzReAlVDeGcNN8WzijuDU6DI',
  authDomain: 'osl-events-app.firebaseapp.com',
  databaseURL: 'https://osl-events-app.firebaseio.com',
  projectId: 'osl-events-app',
  storageBucket: 'osl-events-app.appspot.com',
  messagingSenderId: '559059413195',
};

class Firebase {
  constructor() {
    let app = fire.initializeApp(config);
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
      .then(function(result) {
        // var token = result.credential.accessToken;
        var user = result.user;
        this.adminSignedIn = true;
        console.log(user.email);
      })
      .catch(function(error) {
        var errorCode = error.code;
        var errorMessage = error.message;
        var email = error.email;
        var credential = error.credential;
        console.log('Error Signing in...');
        console.log(errorCode);
        console.log(errorMessage);
        console.log(email);
        console.log(credential);
      });
  };

  // Signs out the current user
  signOut = () => this.auth.signOut();
}

const firebase = new Firebase();

export default firebase;
