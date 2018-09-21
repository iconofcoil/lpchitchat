import firebase from 'firebase'
const config = { /* COPY THE ACTUAL CONFIG FROM FIREBASE CONSOLE */
  apiKey: "AIzaSyDlzu3c-GMgnHDT9r8iwTxzrYW-Q_0HDdU",
  authDomain: "lpchitchat-119ad.firebaseapp.com",
  databaseURL: "https://lpchitchat-119ad.firebaseio.com",
  projectId: "lpchitchat-119ad",
  storageBucket: "lpchitchat-119ad.appspot.com",
  messagingSenderId: "205822276506"
};
firebase.initializeApp(config);
export const provider = new firebase.auth.GoogleAuthProvider();
export const auth = firebase.auth();
export default firebase;