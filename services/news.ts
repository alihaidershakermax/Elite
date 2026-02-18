import { realtimeDb } from '@/constants/FirebaseConfig';
import { onValue, push, ref, remove, set } from 'firebase/database';

export interface NewsItem {
    id?: string;
    title: string;
    content: string;
    author: string;
    timestamp: number;
    important?: boolean;
}

export const newsService = {
    // Subscribe to news updates
    subscribeToNews: (callback: (news: NewsItem[]) => void) => {
        const newsRef = ref(realtimeDb, 'news');
        return onValue(newsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const newsArray = Object.keys(data).map(key => ({
                    id: key,
                    ...data[key]
                })).sort((a, b) => b.timestamp - a.timestamp);
                callback(newsArray);
            } else {
                callback([]);
            }
        });
    },

    // Add news
    addNews: async (news: Omit<NewsItem, 'id' | 'timestamp'>) => {
        const newsRef = ref(realtimeDb, 'news');
        const newNewsRef = push(newsRef);
        await set(newNewsRef, {
            ...news,
            timestamp: Date.now()
        });
        return newNewsRef.key;
    },

    // Delete news
    deleteNews: async (newsId: string) => {
        const newsRef = ref(realtimeDb, `news/${newsId}`);
        await remove(newsRef);
    },

    // Update news
    updateNews: async (newsId: string, updates: Partial<NewsItem>) => {
        const newsRef = ref(realtimeDb, `news/${newsId}`);
        await set(newsRef, updates);
    }
};
