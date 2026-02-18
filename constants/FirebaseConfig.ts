import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getFirestore } from 'firebase/firestore';

// 🔐 آليات التمويه والتشفير لبيانات الربط
const _u = (s: string) => {
    return s.split('').reverse().join('').replace(/_x_/g, '.');
};

const _m = (s: string) => {
    try {
        return atob(s);
    } catch {
        return s;
    }
};

// تمويه البيانات الأساسية ليصعب قراءتها عند عكس الهندسة (Reverse Engineering)
const _k = "S1RBckpYUGZPT0ZoaVVOM2xNUFpmM3R6QUFTYVpJQU=="; // Masked Key
const _d = "moc_x_paserif_x_e8139-tpmorpnosj"; // Masked Domain
const _p = "e8139-tpmorpnosj"; // Masked ID

const firebaseConfig = {
    apiKey: _m(_u(_k)),
    authDomain: _u(_d),
    databaseURL: `https://${_u(_p)}-default-rtdb.firebaseio.com`,
    projectId: _u(_p),
    storageBucket: `${_u(_p)}.firebasestorage.app`,
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
