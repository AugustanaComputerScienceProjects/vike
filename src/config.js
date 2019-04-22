import fire from 'firebase';
import app from 'firebase/app';
import 'firebase/database';
import 'firebase/storage';
import 'firebase/auth';
let config = {
    apiKey: "AIzaSyBFTh3ZprCrzReAlVDeGcNN8WzijuDU6DI",
    authDomain: "osl-events-app.firebaseapp.com",
    databaseURL: "https://osl-events-app.firebaseio.com",
    projectId: "osl-events-app",
    storageBucket: "osl-events-app.appspot.com",
    messagingSenderId: "559059413195"
};

class Firebase {
    constructor() {
      let app = fire.initializeApp(config);
      this.database = app.database();
      this.storage = app.storage();
      this.auth = app.auth();
      this.signedIn = false;
    }

    signIn = () => {
        var provider = new app.auth.GoogleAuthProvider();
        this.auth.signInWithPopup(provider).then(function(result) {
            // This gives you a Google Access Token. You can use it to access the Google API.
            var token = result.credential.accessToken;
            // The signed-in user info.
            var user = result.user;
            // ...
            this.signedIn = true;
          }).catch(function(error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            // The email of the user's account used.
            var email = error.email;
            // The firebase.auth.AuthCredential type that was used.
            var credential = error.credential;
            // ...
          });
    }

    doSignOut = () => this.auth.signOut();
}

const firebase = new Firebase();

export default firebase;
