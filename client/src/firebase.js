// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_TOKEN,
  authDomain: "mern-blog-4e543.firebaseapp.com",
  projectId: "mern-blog-4e543",
  storageBucket: "mern-blog-4e543.appspot.com",
  messagingSenderId: "892451602248",
  appId: "1:892451602248:web:5fad8b3637bbf275557d7d"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

