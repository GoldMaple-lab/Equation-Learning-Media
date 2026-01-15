// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// --- เอาค่าจาก Firebase Console มาแปะตรงนี้ ---
const firebaseConfig = {
  apiKey: "AIzaSyCOx4LI3xLTzBOlt3FwHVvE6wQl9wLWexI",
  authDomain: "equation-learning-media.firebaseapp.com",
  projectId: "equation-learning-media",
  storageBucket: "equation-learning-media.firebasestorage.app",
  messagingSenderId: "244796891599",
  appId: "1:244796891599:web:1982a079ae5c8a7af0f2ba",
  measurementId: "G-EFEVRP1MJB"
};
// ------------------------------------------

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);