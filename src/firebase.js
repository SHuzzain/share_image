import { initializeApp } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  signOut as logOut,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { useEffect, useState } from "react";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { onDisconnect, getDatabase, ref } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCxGctgQv7nvHcDekFbJSYN4IgbW-haKZw",
  authDomain: "sharemeimages.firebaseapp.com",
  projectId: "sharemeimages",
  storageBucket: "sharemeimages.appspot.com",
  messagingSenderId: "204931771997",
  appId: "1:204931771997:web:543b220762cae6853667b4",
  databaseURL: 'https://sharemeimages-default-rtdb.firebaseio.com'
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const storage = getStorage(app);
export const db = getFirestore(app);
export const realtimeDb = getDatabase(app)

export const signUp = async (email, password) => {
  const res = await createUserWithEmailAndPassword(auth, email, password);
  return res;
};

export const signIn = async (email, password) => {
  await signInWithEmailAndPassword(auth, email, password);
};

export const signOut = async () => {
  await logOut(auth);
};


export const AuthStatusChange = () => {
  const [currentUser, setCurrentUser] = useState();

  useEffect(() => {
    const unSub = onAuthStateChanged(auth, (cAuth) => setCurrentUser(cAuth));
    return unSub;
  }, []);

  return currentUser;
};
