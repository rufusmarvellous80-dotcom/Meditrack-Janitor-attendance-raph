// Firebase client initialization (config you provided)
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBUldDoEEjByUVqsu8tbOR128GGLTrgE1Q",
  authDomain: "med-attendance-2025.firebaseapp.com",
  databaseURL: "https://med-attendance-2025-default-rtdb.firebaseio.com",
  projectId: "med-attendance-2025",
  storageBucket: "med-attendance-2025.firebasestorage.app",
  messagingSenderId: "1044593504616",
  appId: "1:1044593504616:web:b11e2126f577a76bdca6dd"
};

const app = initializeApp(firebaseConfig);

export const db = getDatabase(app);
export const auth = getAuth(app);
export default app;