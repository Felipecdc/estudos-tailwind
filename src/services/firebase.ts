
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDe2EqhcqgeJZYkk21YF40TbuWBoAx4xcQ",
  authDomain: "webcarros-7281f.firebaseapp.com",
  projectId: "webcarros-7281f",
  storageBucket: "webcarros-7281f.appspot.com",
  messagingSenderId: "765393459354",
  appId: "1:765393459354:web:cc65bf391b3c0effec2723"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { db, auth, storage }