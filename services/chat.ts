import { realtimeDb } from '@/constants/FirebaseConfig';
import { onValue, push, ref, set, update } from 'firebase/database';

export interface Message {
    id?: string;
    text: string;
    senderId: string;
    senderName: string;
    senderAvatar?: string;
    timestamp: number;
    type: 'text' | 'image' | 'file';
    imageUrl?: string;
    fileUrl?: string;
    fileName?: string;
    replyTo?: string;
    edited?: boolean;
    deleted?: boolean;
}

export interface ChatRoom {
    id?: string;
    name: string;
    description?: string;
    avatar?: string;
    type: 'group' | 'private';
    members: string[];
    admins: string[];
    lastMessage?: string;
    lastMessageTime?: number;
    createdAt: number;
    createdBy: string;
}

export const chatService = {
    // Subscribe to all chat rooms
    subscribeToRooms: (callback: (rooms: ChatRoom[]) => void) => {
        const roomsRef = ref(realtimeDb, 'chatRooms');
        return onValue(roomsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const roomsArray = Object.keys(data).map(key => ({
                    id: key,
                    ...data[key]
                })).sort((a, b) => (b.lastMessageTime || 0) - (a.lastMessageTime || 0));
                callback(roomsArray);
            } else {
                callback([]);
            }
        });
    },

    // Subscribe to messages in a room
    subscribeToMessages: (roomId: string, callback: (messages: Message[]) => void) => {
        const messagesRef = ref(realtimeDb, `messages/${roomId}`);
        return onValue(messagesRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const messagesArray = Object.keys(data).map(key => ({
                    id: key,
                    ...data[key]
                })).sort((a, b) => a.timestamp - b.timestamp);
                callback(messagesArray);
            } else {
                callback([]);
            }
        });
    },

    // Create a new chat room
    createRoom: async (room: Omit<ChatRoom, 'id' | 'createdAt'>) => {
        const roomsRef = ref(realtimeDb, 'chatRooms');
        const newRoomRef = push(roomsRef);
        await set(newRoomRef, {
            ...room,
            createdAt: Date.now()
        });
        return newRoomRef.key;
    },

    // Send a message
    sendMessage: async (roomId: string, message: Omit<Message, 'id' | 'timestamp'>) => {
        const messagesRef = ref(realtimeDb, `messages/${roomId}`);
        const newMessageRef = push(messagesRef);
        
        const messageData = {
            ...message,
            timestamp: Date.now()
        };

        await set(newMessageRef, messageData);

        // Update room's last message
        const roomRef = ref(realtimeDb, `chatRooms/${roomId}`);
        await update(roomRef, {
            lastMessage: message.text,
            lastMessageTime: Date.now()
        });

        return newMessageRef.key;
    },

    // Edit message
    editMessage: async (roomId: string, messageId: string, newText: string) => {
        const messageRef = ref(realtimeDb, `messages/${roomId}/${messageId}`);
        await update(messageRef, {
            text: newText,
            edited: true
        });
    },

    // Delete message
    deleteMessage: async (roomId: string, messageId: string) => {
        const messageRef = ref(realtimeDb, `messages/${roomId}/${messageId}`);
        await update(messageRef, {
            deleted: true,
            text: 'تم حذف هذه الرسالة'
        });
    },

    // Add member to room
    addMember: async (roomId: string, userId: string) => {
        const roomRef = ref(realtimeDb, `chatRooms/${roomId}/members`);
        const membersRef = ref(realtimeDb, `chatRooms/${roomId}/members`);
        // Get current members and add new one
        const updates: any = {};
        updates[`chatRooms/${roomId}/members/${userId}`] = true;
        await update(ref(realtimeDb), updates);
    },

    // Remove member from room
    removeMember: async (roomId: string, userId: string) => {
        const memberRef = ref(realtimeDb, `chatRooms/${roomId}/members/${userId}`);
        await set(memberRef, null);
    },

    // Update typing status
    updateTyping: async (roomId: string, userId: string, isTyping: boolean) => {
        const typingRef = ref(realtimeDb, `typing/${roomId}/${userId}`);
        if (isTyping) {
            await set(typingRef, {
                timestamp: Date.now()
            });
        } else {
            await set(typingRef, null);
        }
    },

    // Subscribe to typing status
    subscribeToTyping: (roomId: string, callback: (typingUsers: string[]) => void) => {
        const typingRef = ref(realtimeDb, `typing/${roomId}`);
        return onValue(typingRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const now = Date.now();
                const typingUsers = Object.keys(data).filter(userId => {
                    return (now - data[userId].timestamp) < 3000; // 3 seconds timeout
                });
                callback(typingUsers);
            } else {
                callback([]);
            }
        });
    }
};
