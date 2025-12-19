import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBK-JgJ1ltXKvGftg9kZiMgoS1GtmVNqJU",
  authDomain: "gen-lang-client-0974619677.firebaseapp.com",
  projectId: "gen-lang-client-0974619677",
  storageBucket: "gen-lang-client-0974619677.firebasestorage.app",
  messagingSenderId: "294547944964",
  appId: "1:294547944964:web:dbc3736d1e3090ef0de751",
  measurementId: "G-9B1SJW4JTX"
};

// 1. Initialize App FIRST
const app = initializeApp(firebaseConfig);

// 2. Initialize Services SECOND
export const db = getFirestore(app);
export const auth = getAuth(app);