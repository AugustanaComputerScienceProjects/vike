import Firebase from 'firebase';
import 'firebase/storage';
let config = {
    apiKey: "AIzaSyBFTh3ZprCrzReAlVDeGcNN8WzijuDU6DI",
    authDomain: "osl-events-app.firebaseapp.com",
    databaseURL: "https://osl-events-app.firebaseio.com",
    projectId: "osl-events-app",
    storageBucket: "osl-events-app.appspot.com",
    messagingSenderId: "559059413195"
};
let app = Firebase.initializeApp(config);  
const db = app.database(); 
const storage = Firebase.storage();
export {
    db, storage, Firebase as default
}
