// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB_qqZ2MfXzIwIxnJ914bw8U6Fm8awyz3g",
  authDomain: "finalexamdb-373dc.firebaseapp.com",
  databaseURL: "https://finalexamdb-373dc-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "finalexamdb-373dc",
  storageBucket: "finalexamdb-373dc.firebasestorage.app",
  messagingSenderId: "237363763085",
  appId: "1:237363763085:web:ec51bd25cc0ad46e354fc4",
  measurementId: "G-S3KLF9SB2K"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);