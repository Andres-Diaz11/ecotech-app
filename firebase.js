

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDoLDP--iffDggyNBeqfYzRY_a9QZO88eI",
  authDomain: "ecotechinventory.firebaseapp.com",
  projectId: "ecotechinventory",
  storageBucket: "ecotechinventory.firebasestorage.app",
  messagingSenderId: "194623344656",
  appId: "1:194623344656:web:265e9636caf51f21a8fa95"
};

const app = initializeApp(firebaseConfig);

// 🔥 VOLVEMOS A ESTO (estable)
export const auth = getAuth(app);

export const db = getFirestore(app);