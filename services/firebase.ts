// Firebase Configuration & Services
// Place your Firebase config here

import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app';
import { getDatabase, limitToLast, off, onValue, orderByChild, push, query, ref, serverTimestamp, set, update } from 'firebase/database';

// ⚠️ Replace with your actual Firebase config from Firebase Console
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT-default-rtdb.firebaseio.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID",
};

let app: any;
let database: any;

try {
    app = initializeApp(firebaseConfig);
    database = getDatabase(app);
} catch (e) {
    console.warn('Firebase init failed – check your config in services/firebase.ts');
}

export { database, limitToLast, off, onValue, orderByChild, push, query, ref, serverTimestamp, set, update };

// ─── Chat Service ───────────────────────────────────────────────────────────

export const chatService = {
    /**
     * Send a message to the global chat room
     */
    sendMessage: async (text: string) => {
        if (!database) return;
        const userData = await AsyncStorage.getItem('userData');
        if (!userData) return;
        const user = JSON.parse(userData);

        const messagesRef = ref(database, 'chat/messages');
        await push(messagesRef, {
            text,
            senderId: user.uid,
            senderName: user.name || 'مستخدم',
            senderAvatar: user.photoURL || '',
            timestamp: serverTimestamp(),
        });
    },

    /**
     * Subscribe to new messages (returns unsubscribe function)
     */
    subscribeToMessages: (callback: (messages: any[]) => void) => {
        if (!database) return () => { };
        const messagesRef = query(
            ref(database, 'chat/messages'),
            orderByChild('timestamp'),
            limitToLast(50)
        );
        onValue(messagesRef, (snapshot) => {
            const data = snapshot.val();
            if (!data) { callback([]); return; }
            const msgs = Object.entries(data).map(([id, val]: any) => ({ id, ...val }));
            callback(msgs);
        });
        return () => off(messagesRef);
    },
};

// ─── Notifications Service ───────────────────────────────────────────────────

export const notificationService = {
    /**
     * Push a notification to all users (admin only)
     */
    pushNotification: async (title: string, body: string, type: 'activity' | 'announcement' | 'task' | 'general' = 'general') => {
        if (!database) return;
        const userData = await AsyncStorage.getItem('userData');
        if (!userData) return;
        const user = JSON.parse(userData);

        const notifRef = ref(database, 'notifications');
        await push(notifRef, {
            title,
            body,
            type,
            createdBy: user.name || 'الإدارة',
            timestamp: serverTimestamp(),
            readBy: {},
        });
    },

    /**
     * Subscribe to notifications
     */
    subscribeToNotifications: (callback: (notifs: any[]) => void) => {
        if (!database) return () => { };
        const notifRef = query(
            ref(database, 'notifications'),
            orderByChild('timestamp'),
            limitToLast(20)
        );
        onValue(notifRef, (snapshot) => {
            const data = snapshot.val();
            if (!data) { callback([]); return; }
            const notifs = Object.entries(data)
                .map(([id, val]: any) => ({ id, ...val }))
                .reverse();
            callback(notifs);
        });
        return () => off(notifRef);
    },

    /**
     * Mark notification as read
     */
    markAsRead: async (notifId: string) => {
        if (!database) return;
        const userData = await AsyncStorage.getItem('userData');
        if (!userData) return;
        const user = JSON.parse(userData);
        const readRef = ref(database, `notifications/${notifId}/readBy/${user.uid}`);
        await set(readRef, true);
    },
};

// ─── Online Presence ─────────────────────────────────────────────────────────

export const presenceService = {
    setOnline: async () => {
        if (!database) return;
        const userData = await AsyncStorage.getItem('userData');
        if (!userData) return;
        const user = JSON.parse(userData);
        const presenceRef = ref(database, `presence/${user.uid}`);
        await set(presenceRef, {
            online: true,
            name: user.name,
            avatar: user.photoURL || '',
            lastSeen: serverTimestamp(),
        });
    },

    setOffline: async () => {
        if (!database) return;
        const userData = await AsyncStorage.getItem('userData');
        if (!userData) return;
        const user = JSON.parse(userData);
        const presenceRef = ref(database, `presence/${user.uid}`);
        await update(presenceRef, { online: false, lastSeen: serverTimestamp() });
    },

    subscribeToOnlineUsers: (callback: (users: any[]) => void) => {
        if (!database) return () => { };
        const presenceRef = ref(database, 'presence');
        onValue(presenceRef, (snapshot) => {
            const data = snapshot.val();
            if (!data) { callback([]); return; }
            const online = Object.entries(data)
                .filter(([, v]: any) => v.online)
                .map(([id, v]: any) => ({ id, ...v }));
            callback(online);
        });
        return () => off(presenceRef);
    },
};
