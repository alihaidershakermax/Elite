import { Colors, Typography } from '@/constants/theme'; // Nudge

import { useColorScheme } from '@/hooks/use-color-scheme';
import { activityService, announcementService, taskService } from '@/services/api';
import { notificationService, presenceService } from '@/services/firebase';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Image,
    Platform,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    const [userName, setUserName] = useState('');
    const [userRole, setUserRole] = useState('');
    const [avatar, setAvatar] = useState('https://i.pravatar.cc/150?u=me');
    const [activities, setActivities] = useState<any[]>([]);
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [tasks, setTasks] = useState<any[]>([]);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [onlineCount, setOnlineCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [userId, setUserId] = useState('');

    // Animated values for cards
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    useFocusEffect(
        useCallback(() => {
            loadAll();
            presenceService.setOnline();
            return () => { presenceService.setOffline(); };
        }, [])
    );

    useEffect(() => {
        // Subscribe to Firebase notifications
        const unsub = notificationService.subscribeToNotifications((notifs) => {
            setNotifications(notifs);
            // Count unread
            if (userId) {
                const unread = notifs.filter((n: any) => !n.readBy?.[userId]).length;
                setUnreadCount(unread);
            }
        });

        // Subscribe to online presence
        const unsubPresence = presenceService.subscribeToOnlineUsers((users) => {
            setOnlineCount(users.length);
        });

        return () => { unsub(); unsubPresence(); };
    }, [userId]);

    const loadAll = async () => {
        try {
            setLoading(true);
            const userData = await AsyncStorage.getItem('userData');
            if (userData) {
                const parsed = JSON.parse(userData);
                setUserName(parsed.name || 'مستخدم');
                setUserRole(parsed.role === 'admin' ? 'مدير النظام' : 'عضو نشط');
                setUserId(parsed.uid || '');
                if (parsed.photoURL) setAvatar(parsed.photoURL);
            }

            const [actRes, annRes, taskRes] = await Promise.all([
                activityService.getAll().catch(() => ({ data: [] })),
                announcementService.getAll().catch(() => ({ data: [] })),
                taskService.getAll().catch(() => ({ data: [] })),
            ]);

            setActivities(actRes.data || []);
            setAnnouncements(annRes.data || []);
            setTasks(taskRes.data || []);

            // Animate in
            Animated.parallel([
                Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
                Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
            ]).start();
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const pendingTasks = tasks.filter((t: any) => t.status !== 'مكتملة' && t.status !== 'completed').length;

    const SectionHeader = ({ title, onPress, label = 'الكل' }: any) => (
        <View style={styles.sectionRow}>
            {onPress && (
                <TouchableOpacity onPress={onPress}>
                    <Text style={[styles.seeAll, { color: theme.primary, fontFamily: Typography.bold }]}>{label}</Text>
                </TouchableOpacity>
            )}
            <Text style={[styles.sectionTitle, { color: theme.onSurface, fontFamily: Typography.bold }]}>{title}</Text>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scroll}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadAll(); }} tintColor={theme.primary} />
                }
            >
                {/* ── TOP BAR ── */}
                <View style={styles.topBar}>
                    <View style={styles.topActions}>
                        {/* Notifications Bell */}
                        <TouchableOpacity
                            style={[styles.iconBtn, { backgroundColor: theme.surface }]}
                            onPress={() => router.push('/notifications' as any)}
                        >
                            <Ionicons name="notifications-outline" size={22} color={theme.onSurface} />
                            {unreadCount > 0 && (
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                                </View>
                            )}
                        </TouchableOpacity>

                        {/* Chat Button */}
                        <TouchableOpacity
                            style={[styles.iconBtn, { backgroundColor: theme.surface }]}
                            onPress={() => router.push('/chat' as any)}
                        >
                            <Ionicons name="chatbubbles-outline" size={22} color={theme.onSurface} />
                            {onlineCount > 0 && (
                                <View style={[styles.badge, { backgroundColor: '#34C759' }]}>
                                    <Text style={styles.badgeText}>{onlineCount}</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* User Info */}
                    <View style={styles.userInfo}>
                        <View style={styles.userText}>
                            <Text style={[styles.helloText, { color: theme.onSurfaceVariant, fontFamily: Typography.regular }]}>
                                أهلاً وسهلاً،
                            </Text>
                            <Text style={[styles.nameText, { color: theme.onSurface, fontFamily: Typography.bold }]}>
                                {userName}
                            </Text>
                        </View>
                        <TouchableOpacity onPress={() => router.push('/(tabs)/profile')} style={styles.avatarWrap}>
                            <Image source={{ uri: avatar }} style={styles.avatar} />
                            <View style={[styles.onlineDot, { backgroundColor: '#34C759' }]} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* ── ANIMATED STATS BANNER ── */}
                <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                    <LinearGradient
                        colors={[theme.primary, theme.secondary]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.statsBanner}
                    >
                        <View style={styles.statItem}>
                            <Text style={styles.statNum}>{activities.length}</Text>
                            <Text style={styles.statLabel}>فعالية</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statNum}>{announcements.length}</Text>
                            <Text style={styles.statLabel}>إعلان</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statNum}>{pendingTasks}</Text>
                            <Text style={styles.statLabel}>مهمة معلقة</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statNum}>{onlineCount}</Text>
                            <Text style={styles.statLabel}>متصل الآن</Text>
                        </View>
                    </LinearGradient>
                </Animated.View>

                {/* ── QUICK ACTIONS ── */}
                <View style={styles.section}>
                    <SectionHeader title="الوصول السريع" />
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickScroll}>
                        {[
                            { icon: 'calendar', label: 'الفعاليات', color: '#FF9500', route: '/(tabs)/activities' },
                            { icon: 'megaphone', label: 'الإعلانات', color: '#007AFF', route: '/announcements' },
                            { icon: 'list-circle', label: 'المهام', color: '#34C759', route: '/(tabs)/tasks' },
                            { icon: 'chatbubbles', label: 'المحادثة', color: '#5856D6', route: '/chat' },
                            { icon: 'business', label: 'اللجان', color: '#AF52DE', route: '/(tabs)/committees' },
                            { icon: 'images', label: 'الأرشيف', color: '#FF2D55', route: '/archive' },
                        ].map((item) => (
                            <TouchableOpacity
                                key={item.label}
                                style={[styles.quickCard, { backgroundColor: theme.surface }]}
                                onPress={() => router.push(item.route as any)}
                                activeOpacity={0.75}
                            >
                                <View style={[styles.quickIcon, { backgroundColor: item.color + '18' }]}>
                                    <Ionicons name={item.icon as any} size={26} color={item.color} />
                                </View>
                                <Text style={[styles.quickLabel, { color: theme.onSurface, fontFamily: Typography.bold }]}>
                                    {item.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* ── ADMIN PANEL BUTTON (admin only) ── */}
                {userRole === 'admin' && (
                    <View style={[styles.section, { marginTop: 20 }]}>
                        <TouchableOpacity
                            onPress={() => router.push('/admin-panel' as any)}
                            activeOpacity={0.88}
                            style={styles.adminBtnOuter}
                        >
                            <LinearGradient
                                colors={['#1a1a2e', '#16213e', '#0f3460']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.adminBtnGrad}
                            >
                                {/* Decorative circles */}
                                <View style={styles.adminCircle1} />
                                <View style={styles.adminCircle2} />

                                {/* Left arrow */}
                                <View style={styles.adminArrow}>
                                    <Ionicons name="chevron-back" size={20} color="rgba(255,255,255,0.5)" />
                                </View>

                                {/* Content */}
                                <View style={styles.adminBtnContent}>
                                    <View style={styles.adminBtnTextGroup}>
                                        <Text style={styles.adminBtnTitle}>لوحة الإدارة</Text>
                                        <Text style={styles.adminBtnSub}>إدارة الأعضاء • المحتوى • الإعلانات</Text>
                                    </View>
                                    <View style={styles.adminBtnIcon}>
                                        <Ionicons name="shield-checkmark" size={28} color="#fff" />
                                    </View>
                                </View>

                                {/* Bottom tag */}
                                <View style={styles.adminBtnTag}>
                                    <View style={styles.adminTagDot} />
                                    <Text style={styles.adminTagText}>صلاحية المدير</Text>
                                </View>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                )}

                {/* ── FIREBASE NOTIFICATIONS ── */}
                {notifications.length > 0 && (
                    <View style={styles.section}>
                        <SectionHeader title="آخر الإشعارات" onPress={() => router.push('/notifications' as any)} label="الكل" />
                        <View style={styles.cardList}>
                            {notifications.slice(0, 3).map((notif: any) => {
                                const isUnread = !notif.readBy?.[userId];
                                return (
                                    <TouchableOpacity
                                        key={notif.id}
                                        style={[styles.notifCard, { backgroundColor: theme.surface, borderLeftColor: isUnread ? theme.primary : 'transparent', borderLeftWidth: isUnread ? 3 : 0 }]}
                                        onPress={() => notificationService.markAsRead(notif.id)}
                                    >
                                        <View style={[styles.notifIcon, { backgroundColor: theme.primary + '15' }]}>
                                            <Ionicons name={notif.type === 'activity' ? 'calendar' : notif.type === 'task' ? 'list' : 'megaphone'} size={18} color={theme.primary} />
                                        </View>
                                        <View style={styles.notifContent}>
                                            <Text style={[styles.notifTitle, { color: theme.onSurface, fontFamily: Typography.bold }]} numberOfLines={1}>
                                                {notif.title}
                                            </Text>
                                            <Text style={[styles.notifBody, { color: theme.onSurfaceVariant }]} numberOfLines={1}>
                                                {notif.body}
                                            </Text>
                                        </View>
                                        {isUnread && <View style={[styles.unreadDot, { backgroundColor: theme.primary }]} />}
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>
                )}

                {/* ── LATEST ACTIVITIES ── */}
                <View style={styles.section}>
                    <SectionHeader title="آخر الفعاليات" onPress={() => router.push('/(tabs)/activities')} />
                    {activities.length === 0 ? (
                        <View style={[styles.emptyBox, { backgroundColor: theme.surfaceVariant + '40' }]}>
                            <Ionicons name="calendar-outline" size={28} color={theme.onSurfaceVariant} />
                            <Text style={[styles.emptyText, { color: theme.onSurfaceVariant }]}>لا توجد فعاليات حالياً</Text>
                        </View>
                    ) : (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
                            {activities.slice(0, 5).map((item: any, i: number) => (
                                <TouchableOpacity
                                    key={item._id || i}
                                    style={[styles.actCardHorizontal, { backgroundColor: theme.surface }]}
                                    onPress={() => router.push({ pathname: '/activity-detail', params: { id: item._id || item.id } } as any)}
                                    activeOpacity={0.8}
                                >
                                    {item.video ? (
                                        <View style={styles.actImgHorizontal}>
                                            <Image source={{ uri: item.video }} style={styles.actImgHorizontal} resizeMode="cover" />
                                            <View style={styles.videoBadge}>
                                                <Ionicons name="play-circle" size={40} color="rgba(255,255,255,0.9)" />
                                            </View>
                                        </View>
                                    ) : item.image ? (
                                        <Image source={{ uri: item.image }} style={styles.actImgHorizontal} resizeMode="cover" />
                                    ) : (
                                        <View style={[styles.actImgHorizontalPlaceholder, { backgroundColor: theme.primary + '20' }]}>
                                            <Ionicons name="calendar" size={32} color={theme.primary} />
                                        </View>
                                    )}
                                    <View style={styles.actInfoHorizontal}>
                                        <Text style={[styles.actTitleHorizontal, { color: theme.onSurface, fontFamily: Typography.bold }]} numberOfLines={2}>
                                            {item.title}
                                        </Text>
                                        {item.description && (
                                            <Text style={[styles.actDescHorizontal, { color: theme.onSurfaceVariant, fontFamily: Typography.regular }]} numberOfLines={2}>
                                                {item.description}
                                            </Text>
                                        )}
                                        <View style={[styles.actDateBadgeHorizontal, { backgroundColor: theme.primaryContainer }]}>
                                            <Ionicons name="time-outline" size={12} color={theme.onPrimaryContainer} />
                                            <Text style={[styles.actDateTextHorizontal, { color: theme.onPrimaryContainer, fontFamily: Typography.bold }]}>
                                                {item.date || 'قريباً'}
                                            </Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    )}
                </View>

                {/* ── ANNOUNCEMENTS ── */}
                <View style={styles.section}>
                    <SectionHeader title="إعلانات هامة" onPress={() => router.push('/announcements')} label="المزيد" />
                    {announcements.length === 0 ? (
                        <View style={[styles.emptyBox, { backgroundColor: theme.surfaceVariant + '40' }]}>
                            <Ionicons name="megaphone-outline" size={28} color={theme.onSurfaceVariant} />
                            <Text style={[styles.emptyText, { color: theme.onSurfaceVariant }]}>لا توجد إعلانات جديدة</Text>
                        </View>
                    ) : (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
                            {announcements.slice(0, 5).map((item: any, i: number) => (
                                <TouchableOpacity
                                    key={item._id || i}
                                    style={[styles.annCardHorizontal, { backgroundColor: theme.surface }]}
                                    activeOpacity={0.8}
                                >
                                    <View style={[styles.annIconHorizontal, { backgroundColor: '#007AFF15' }]}>
                                        <Ionicons name="megaphone" size={24} color="#007AFF" />
                                    </View>
                                    <Text style={[styles.annTitleHorizontal, { color: theme.onSurface, fontFamily: Typography.bold }]} numberOfLines={2}>
                                        {item.title}
                                    </Text>
                                    {item.description && (
                                        <Text style={[styles.annDescHorizontal, { color: theme.onSurfaceVariant, fontFamily: Typography.regular }]} numberOfLines={3}>
                                            {item.description}
                                        </Text>
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    )}
                </View>

                {/* ── LATEST NEWS ── */}
                <View style={styles.section}>
                    <SectionHeader title="آخر الأخبار" onPress={() => router.push('/news' as any)} label="المزيد" />
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.newsScroll}>
                        {announcements.slice(0, 5).map((item: any, i: number) => (
                            <TouchableOpacity
                                key={item._id || i}
                                style={[styles.newsCard, { backgroundColor: theme.surface }]}
                                activeOpacity={0.8}
                            >
                                <View style={[styles.newsIcon, { backgroundColor: '#007AFF15' }]}>
                                    <Ionicons name="newspaper" size={24} color="#007AFF" />
                                </View>
                                <Text style={[styles.newsTitle, { color: theme.onSurface, fontFamily: Typography.bold }]} numberOfLines={2}>
                                    {item.title}
                                </Text>
                                <Text style={[styles.newsDate, { color: theme.onSurfaceVariant, fontFamily: Typography.regular }]}>
                                    {item.date || 'اليوم'}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* ── PENDING TASKS ── */}
                {tasks.length > 0 && (
                    <View style={styles.section}>
                        <SectionHeader title="المهام المعلقة" onPress={() => router.push('/(tabs)/tasks')} label="تفاصيل" />
                        <View style={styles.cardList}>
                            {tasks.filter((t: any) => t.status !== 'مكتملة').slice(0, 3).map((item: any, i: number) => (
                                <TouchableOpacity
                                    key={item._id || i}
                                    style={[styles.taskCard, { backgroundColor: theme.surface }]}
                                    onPress={() => router.push('/(tabs)/tasks')}
                                >
                                    <View style={[styles.taskPriorityBar, { backgroundColor: item.priority === 'عالية' ? '#FF3B30' : item.priority === 'متوسطة' ? '#FF9500' : '#34C759' }]} />
                                    <View style={styles.taskInfo}>
                                        <Text style={[styles.taskTitle, { color: theme.onSurface, fontFamily: Typography.bold }]} numberOfLines={1}>
                                            {item.title}
                                        </Text>
                                        <Text style={[styles.taskStatus, { color: theme.onSurfaceVariant }]}>{item.status || 'قيد التنفيذ'}</Text>
                                    </View>
                                    <View style={[styles.taskPriorityBadge, { backgroundColor: item.priority === 'عالية' ? '#FF3B3015' : '#FF950015' }]}>
                                        <Text style={{ color: item.priority === 'عالية' ? '#FF3B30' : '#FF9500', fontSize: 10, fontWeight: 'bold' }}>
                                            {item.priority || 'عادية'}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}

                <View style={{ height: 110 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scroll: { paddingBottom: 20 },

    topBar: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 16 },
    topActions: { flexDirection: 'row-reverse', gap: 10, marginBottom: 16 },
    iconBtn: {
        width: 44, height: 44, borderRadius: 14,
        justifyContent: 'center', alignItems: 'center',
        elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6,
    },
    badge: {
        position: 'absolute', top: -4, right: -4,
        backgroundColor: '#FF3B30', borderRadius: 8,
        minWidth: 16, height: 16, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 3,
    },
    badgeText: { color: '#fff', fontSize: 9, fontWeight: 'bold' },
    userInfo: { flexDirection: 'row-reverse', alignItems: 'center', gap: 14 },
    userText: { flex: 1, alignItems: 'flex-end' },
    helloText: { fontSize: 13, opacity: 0.7 },
    nameText: { fontSize: 22, marginTop: 1 },
    avatarWrap: { position: 'relative' },
    avatar: { width: 60, height: 60, borderRadius: 20, borderWidth: 2.5, borderColor: '#fff' },
    onlineDot: { position: 'absolute', bottom: 2, right: 2, width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: '#fff' },

    statsBanner: {
        marginHorizontal: 20, borderRadius: 28,
        paddingVertical: 20, paddingHorizontal: 8,
        flexDirection: 'row-reverse', justifyContent: 'space-around', alignItems: 'center',
        elevation: 8, shadowColor: '#728156', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12,
    },
    statItem: { alignItems: 'center', flex: 1 },
    statNum: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
    statLabel: { color: 'rgba(255,255,255,0.75)', fontSize: 10, marginTop: 3 },
    statDivider: { width: 1, height: 28, backgroundColor: 'rgba(255,255,255,0.25)' },

    section: { marginTop: 28, paddingHorizontal: 20 },
    sectionRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    sectionTitle: { fontSize: 20, letterSpacing: 0.3 },
    seeAll: { fontSize: 14 },

    quickScroll: { paddingRight: 20, gap: 12 },
    quickCard: {
        width: 110,
        paddingVertical: 20, paddingHorizontal: 12,
        borderRadius: 20, alignItems: 'center',
        elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 8,
    },
    quickIcon: { width: 52, height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
    quickLabel: { fontSize: 11, textAlign: 'center', lineHeight: 16 },

    cardList: {
        gap: 0,
        backgroundColor: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
        // Platform specific shadow/elevation
        ...(Platform.OS === 'ios' ? {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 3,
        } : {
            elevation: 1,
        }),
    },

    notifCard: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        padding: 16,
        borderRadius: 0,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(0,0,0,0.08)',
        gap: 12,
    },
    notifIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    notifContent: { flex: 1, alignItems: 'flex-end' },
    notifTitle: { fontSize: 15, marginBottom: 3, lineHeight: 20 },
    notifBody: { fontSize: 13, opacity: 0.65, lineHeight: 18 },
    unreadDot: { width: 9, height: 9, borderRadius: 5 },

    actCardLarge: {
        borderRadius: 0,
        overflow: 'hidden',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(0,0,0,0.08)',
    },
    actImgLarge: { width: '100%', height: 200 },
    actImgLargePlaceholder: { width: '100%', height: 200, justifyContent: 'center', alignItems: 'center' },
    actInfoLarge: { padding: 16, alignItems: 'flex-end' },
    actTitleLarge: { fontSize: 17, marginBottom: 8, lineHeight: 24, textAlign: 'right' },
    actDescLarge: { fontSize: 14, marginBottom: 12, lineHeight: 20, textAlign: 'right', opacity: 0.7 },
    actMetaLarge: { flexDirection: 'row-reverse', gap: 10, width: '100%', flexWrap: 'wrap' },
    actDateBadge: { flexDirection: 'row-reverse', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, gap: 5 },
    actDateText: { fontSize: 12 },
    actLocationBadge: { flexDirection: 'row-reverse', alignItems: 'center', gap: 5, flex: 1 },
    actLocationText: { fontSize: 12, flex: 1 },

    annCard: {
        flexDirection: 'row-reverse',
        alignItems: 'flex-start',
        padding: 16,
        borderRadius: 0,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(0,0,0,0.08)',
        gap: 12,
    },
    annIcon: { width: 42, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    annInfo: { flex: 1, alignItems: 'flex-end' },
    annTitle: { fontSize: 16, marginBottom: 4, lineHeight: 22 },
    annDesc: { fontSize: 14, lineHeight: 20, opacity: 0.65, textAlign: 'right' },

    taskCard: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        borderRadius: 0,
        overflow: 'hidden',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(0,0,0,0.08)',
    },
    taskPriorityBar: { width: 4, alignSelf: 'stretch' },
    taskInfo: { flex: 1, padding: 16, alignItems: 'flex-end' },
    taskTitle: { fontSize: 16, marginBottom: 3, lineHeight: 22 },
    taskStatus: { fontSize: 13, opacity: 0.55 },
    taskPriorityBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, marginRight: 12 },

    emptyBox: { borderRadius: 20, padding: 32, alignItems: 'center', gap: 10, marginBottom: 12 },
    emptyText: { fontSize: 15, opacity: 0.6, lineHeight: 22 },

    horizontalScroll: { paddingRight: 20, gap: 12 },

    // Activities Horizontal
    actCardHorizontal: {
        width: 280,
        borderRadius: 20,
        overflow: 'hidden',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    actImgHorizontal: { width: '100%', height: 160 },
    actImgHorizontalPlaceholder: { width: '100%', height: 160, justifyContent: 'center', alignItems: 'center' },
    videoBadge: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.2)'
    },
    actInfoHorizontal: { padding: 14, alignItems: 'flex-end' },
    actTitleHorizontal: { fontSize: 16, marginBottom: 6, lineHeight: 22, textAlign: 'right' },
    actDescHorizontal: { fontSize: 13, marginBottom: 10, lineHeight: 19, textAlign: 'right', opacity: 0.7 },
    actDateBadgeHorizontal: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 10,
        gap: 5,
        alignSelf: 'flex-end',
    },
    actDateTextHorizontal: { fontSize: 11 },

    // Announcements Horizontal
    annCardHorizontal: {
        width: 220,
        padding: 16,
        borderRadius: 18,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
    },
    annIconHorizontal: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    annTitleHorizontal: {
        fontSize: 15,
        marginBottom: 6,
        lineHeight: 21,
        textAlign: 'right',
    },
    annDescHorizontal: {
        fontSize: 13,
        lineHeight: 19,
        opacity: 0.65,
        textAlign: 'right',
    },

    newsScroll: { paddingRight: 20, gap: 12 },
    newsCard: {
        width: 180,
        padding: 16,
        borderRadius: 20,
        elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 8,
    },
    newsIcon: {
        width: 48, height: 48, borderRadius: 14,
        justifyContent: 'center', alignItems: 'center',
        marginBottom: 12,
    },
    newsTitle: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 8,
        textAlign: 'right',
        minHeight: 40,
    },
    newsDate: {
        fontSize: 11,
        opacity: 0.6,
    },

    // ── Admin Panel Button ──
    adminBtnOuter: {
        borderRadius: 28,
        overflow: 'hidden',
        elevation: 10,
        shadowColor: '#0f3460',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.45,
        shadowRadius: 16,
    },
    adminBtnGrad: {
        borderRadius: 28,
        padding: 24,
        overflow: 'hidden',
        position: 'relative',
    },
    adminCircle1: {
        position: 'absolute', width: 160, height: 160, borderRadius: 80,
        backgroundColor: 'rgba(255,255,255,0.04)',
        top: -50, left: -40,
    },
    adminCircle2: {
        position: 'absolute', width: 100, height: 100, borderRadius: 50,
        backgroundColor: 'rgba(255,255,255,0.06)',
        bottom: -30, right: 60,
    },
    adminArrow: {
        position: 'absolute', right: 20, top: '50%',
        width: 32, height: 32, borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.08)',
        justifyContent: 'center', alignItems: 'center',
    },
    adminBtnContent: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        gap: 16,
        marginBottom: 16,
    },
    adminBtnIcon: {
        width: 58, height: 58, borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.12)',
        justifyContent: 'center', alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
    },
    adminBtnTextGroup: { flex: 1, alignItems: 'flex-end' },
    adminBtnTitle: {
        color: '#fff',
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 5,
        letterSpacing: 0.3,
    },
    adminBtnSub: {
        color: 'rgba(255,255,255,0.55)',
        fontSize: 12,
        textAlign: 'right',
    },
    adminBtnTag: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        gap: 6,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
        paddingTop: 14,
    },
    adminTagDot: {
        width: 7, height: 7, borderRadius: 4,
        backgroundColor: '#34C759',
    },
    adminTagText: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 11,
        letterSpacing: 0.5,
    },
});
