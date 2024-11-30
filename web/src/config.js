import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

// Config to initialize Firebase
const config = {
  apiKey: "AIzaSyBFTh3ZprCrzReAlVDeGcNN8WzijuDU6DI",
  authDomain: "osl-events-app.firebaseapp.com",
  databaseURL: "https://osl-events-app.firebaseio.com",
  projectId: "osl-events-app",
  storageBucket: "osl-events-app.appspot.com",
  messagingSenderId: "559059413195",
};

class Firebase {
  constructor() {
    const app = initializeApp(config);
    this.database = getDatabase(app);
    this.storage = getStorage(app);
    this.auth = getAuth(app);
    this.adminSignedIn = false;
  }

  // Signs in the user via Google through a pop-up
  signIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(this.auth, provider);
      const user = result.user;
      this.adminSignedIn = true;
      console.log(user.email);
    } catch (error) {
      console.log("Error Signing in...");
      console.log(error.code);
      console.log(error.message);
      console.log(error.email);
      console.log(error.credential);
    }
  };

  // Signs out the current user
  signOut = () => this.auth.signOut();
}

const firebase = new Firebase();

export default firebase;
