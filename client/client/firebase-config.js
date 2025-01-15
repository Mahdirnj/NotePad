// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBxz0xX36wbydgdnN2j-QV7atCo_J2EUQ0",
    authDomain: "my-notes-project-4455a.firebaseapp.com",
    projectId: "my-notes-project-4455a",
    storageBucket: "my-notes-project-4455a.firebasestorage.app",
    messagingSenderId: "345038341310",
    appId: "1:345038341310:web:f59fae90b5ee17903b8aef",
    measurementId: "G-MBZZZ1S5DE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db, signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut };

