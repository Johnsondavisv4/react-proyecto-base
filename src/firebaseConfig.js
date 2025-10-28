// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDFH40JbeCQ6KNRr8QQeJLWEw_9gkhTnTc",
  authDomain: "node-a209a.firebaseapp.com",
  projectId: "node-a209a",
  storageBucket: "node-a209a.firebasestorage.app",
  messagingSenderId: "699965350753",
  appId: "1:699965350753:web:f7a017bf7fd41ac219db20"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
export default db;