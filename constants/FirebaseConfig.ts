import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyAZtfQ0239lM_C4zWOCdcqNUhOFAPkx-Tk",
    authDomain: "jsonprompt-9318e.firebaseapp.com",
    databaseURL: "https://jsonprompt-9318e-default-rtdb.firebaseio.com",
    projectId: "jsonprompt-9318e",
    storageBucket: "jsonprompt-9318e.firebasestorage.app",
    messagingSenderId: "830604243096",
    appId: "1:830604243096:web:e3ea4e45dc84fbd339e0ed",
    measurementId: "G-5RR7Y21LS5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const realtimeDb = getDatabase(app);

export default app;
