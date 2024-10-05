// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, serverTimestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

//import { collection, doc, setDoc, getDocs } from "firebase/firestore";

const firebaseConfig = {};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(firebaseApp);

// Initialize Auth
const auth = getAuth(firebaseApp);

// Export the timestamp
const timestamp = serverTimestamp();
const storage = getStorage(firebaseApp);

export { storage, db, auth, timestamp };
export default firebaseApp;
