import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

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

export const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
export const database = getDatabase(app);
export const storage = getStorage(app);
export const firestore = getFirestore(app);
