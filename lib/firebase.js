import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
 apiKey: "AIzaSyAcAsjKWjSPKgHUXpPU5qCP5mJo6H1O6wg",
  authDomain: "qtime-aziz.firebaseapp.com",
  projectId: "qtime-aziz",
  storageBucket: "qtime-aziz.firebasestorage.app",
  messagingSenderId: "662149895386",
  appId: "1:662149895386:web:66f625d18df6aee8bc41e3"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);