import { Colors, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { notificationService } from '@/services/firebase';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const TYPE_CONFIG: Record<string, { icon: string; color: string; label: string }> = {
    activity: { icon: 'calendar', color: '#FF9500', label: 'فعالية' },
    announcement: { icon: 'megaphone', color: '#007AFF', label: 'إعلان' },
    task: { icon: 'list-circle', color: '#34C759', label: 'مهمة' },
    general: { icon: 'notifications', color: '#5856D6', label: 'عام' },
};

export default function NotificationsScreen() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const [notifications, setNotifications] = useState<any[]>([]);
    const [userId, setUserId] = useState('');

    useEffect(() => {
        AsyncStorage.getItem('userData').then((d) => {
            if (d) setUserId(JSON.parse(d).uid || '');
        });
        const unsub = notificationService.subscribeToNotifications(setNotifications);
        return unsub;
    }, []);

    const markAll = async () => {
        for (const n of notifications) {
            if (!n.readBy?.[userId]) await notificationService.markAsRead(n.id);
        }
    };

    const renderNotif = ({ item }: any) => {
        const isUnread = !item.readBy?.[userId];
        const cfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.general;
        return (
            <TouchableOpacity
                style={[styles.card, { backgroundColor: theme.surface, borderRightColor: isUnread ? cfg.color : 'transparent', borderRightWidth: 4 }]}
                onPress={() => notificationService.markAsRead(item.id)}
                activeOpacity={0.8}
            >
                <View style={[styles.iconBox, { backgroundColor: cfg.color + '18' }]}>
                    <Ionicons name={cfg.icon as any} size={22} color={cfg.color} />
                </View>
                <View style={styles.content}>
                    <View style={styles.topRow}>
                        <View style={[styles.typePill, { backgroundColor: cfg.color + '18' }]}>
                            <Text style={[styles.typeText, { color: cfg.color }]}>{cfg.label}</Text>
                        </View>
                        {isUnread && <View style={[styles.unreadDot, { backgroundColor: cfg.color }]} />}
                    </View>
                    <Text style={[styles.title, { color: theme.onSurface, fontFamily: Typography.bold }]} numberOfLines={1}>
                        {item.title}
                    </Text>
                    <Text style={[styles.body, { color: theme.onSurfaceVariant }]} numberOfLines={2}>
                        {item.body}
                    </Text>
                    <Text style={[styles.meta, { color: theme.onSurfaceVariant }]}>
                        {item.createdBy} • {item.timestamp ? new Date(item.timestamp).toLocaleDateString('ar-SA') : ''}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={markAll}>
                    <Text style={[styles.markAll, { color: theme.primary, fontFamily: Typography.bold }]}>قراءة الكل</Text>
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.onSurface, fontFamily: Typography.bold }]}>الإشعارات</Text>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="chevron-forward" size={24} color={theme.onSurface} />
                </TouchableOpacity>
            </View>

            <FlatList
                data={notifications}
                renderItem={renderNotif}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Ionicons name="notifications-off-outline" size={60} color={theme.onSurfaceVariant} style={{ opacity: 0.3 }} />
                        <Text style={[styles.emptyText, { color: theme.onSurfaceVariant, fontFamily: Typography.bold }]}>
                            لا توجد إشعارات
                        </Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingVertical: 14, paddingBottom: 10,
    },
    headerTitle: { fontSize: 22 },
    markAll: { fontSize: 13 },
    list: { padding: 20, gap: 12, paddingBottom: 100 },
    card: {
        flexDirection: 'row-reverse', padding: 14, borderRadius: 20, gap: 14,
        elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8,
    },
    iconBox: { width: 46, height: 46, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    content: { flex: 1, alignItems: 'flex-end' },
    topRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8, marginBottom: 4 },
    typePill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
    typeText: { fontSize: 10, fontWeight: 'bold' },
    unreadDot: { width: 7, height: 7, borderRadius: 4 },
    title: { fontSize: 15, marginBottom: 3 },
    body: { fontSize: 12, lineHeight: 18, opacity: 0.7, textAlign: 'right', marginBottom: 6 },
    meta: { fontSize: 10, opacity: 0.4 },
    empty: { alignItems: 'center', paddingVertical: 80, gap: 12 },
    emptyText: { fontSize: 16, opacity: 0.5 },
});
