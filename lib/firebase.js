// // Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// // import { getAnalytics } from "firebase/analytics";
// import {
//   getAuth,
//   GoogleAuthProvider,
//   signInWithPopup,
//   signOut,
//   FacebookAuthProvider,
//   TwitterAuthProvider
// } from "firebase/auth";


// import { getFirestore } from "firebase/firestore";
// import { getStorage } from "firebase/storage";
// // import app from "./firebaseConfig"; // Import your Firebase app initialization

// const firebaseConfig = {
//   apiKey: "AIzaSyBydtF4Svl298aovL_eWVKkYPdFMyMH35A",
//   authDomain: "voxify-3a1c8.firebaseapp.com",
//   projectId: "voxify-3a1c8",
//   storageBucket: "voxify-3a1c8.firebasestorage.app",
//   messagingSenderId: "403584687698",
//   appId: "1:187762557281:android:6cdbd2f9e4f96b55b38520",
//   measurementId: "G-5560J5H43R",
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// // const analytics = getAnalytics(app);
// const auth = getAuth(app);
// const db = getFirestore(app);
// const storage = getStorage(app);

// export { db, auth, storage, GoogleAuthProvider, signInWithPopup, signOut,FacebookAuthProvider, TwitterAuthProvider };


import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBydtF4Svl298aovL_eWVKkYPdFMyMH35A",
  authDomain: "voxify-3a1c8.firebaseapp.com",
  projectId: "voxify-3a1c8",
  storageBucket: "voxify-3a1c8.firebasestorage.app",
  messagingSenderId: "403584687698",
  appId: "1:187762557281:android:6cdbd2f9e4f96b55b38520",
  measurementId: "G-5560J5H43R",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
