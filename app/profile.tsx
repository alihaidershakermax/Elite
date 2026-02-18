import { Colors, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { activityService, taskService } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState<any>(null);
    const [stats, setStats] = useState({ tasks: 0, activities: 0 });

    useFocusEffect(
        useCallback(() => {
            loadProfile();
        }, [])
    );

    const loadProfile = async () => {
        try {
            setLoading(true);
            const data = await AsyncStorage.getItem('userData');
            if (data) {
                const parsed = JSON.parse(data);
                setUserData(parsed);
            }

            // Fetch statistics
            try {
                const [taskRes, actRes] = await Promise.all([
                    taskService.getAll(),
                    activityService.getAll()
                ]);

                setStats({
                    tasks: taskRes.data ? taskRes.data.length : 0,
                    activities: actRes.data ? actRes.data.length : 0
                });
            } catch (statsError) {
                console.error('Stats error:', statsError);
                // لا نوقف التطبيق إذا فشل تحميل الإحصائيات
            }
        } catch (error) {
            console.error('Load profile error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await AsyncStorage.clear(); // Clear all data (or just userData/userToken)
        router.replace('/login');
    };

    if (loading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header / Cover */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: theme.surfaceVariant }]}>
                        <Ionicons name="arrow-back" size={24} color={theme.onSurface} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: theme.onSurface, fontFamily: Typography.bold }]}>حسابي</Text>
                    <View style={{ width: 44 }} />
                </View>

                {/* Profile Card */}
                <Animated.View entering={FadeInDown.duration(600)} style={styles.profileCardContainer}>
                    <View style={[styles.profileCard, { backgroundColor: theme.surfaceVariant }]}>
                        <View style={styles.avatarContainer}>
                            <Image
                                source={{ uri: userData?.photoURL || 'https://i.pravatar.cc/150?u=me' }}
                                style={[styles.avatar, { borderColor: theme.background }]}
                            />
                            <View style={[styles.statusBadge, { backgroundColor: '#4CAF50', borderColor: theme.surfaceVariant }]} />
                        </View>

                        <Text style={[styles.userName, { color: theme.onSurface, fontFamily: Typography.bold }]}>
                            {userData?.name || 'مستخدم جديد'}
                        </Text>
                        <Text style={[styles.userEmail, { color: theme.onSurfaceVariant, fontFamily: Typography.regular }]}>
                            {userData?.email || 'user@example.com'}
                        </Text>

                        <View style={[styles.roleChip, { backgroundColor: theme.primaryContainer }]}>
                            <Text style={[styles.roleText, { color: theme.onPrimaryContainer, fontFamily: Typography.regular }]}>
                                {userData?.role || 'عضو'}
                            </Text>
                        </View>

                        {/* Stats Row */}
                        <View style={styles.statsRow}>
                            <View style={styles.statItem}>
                                <Text style={[styles.statValue, { color: theme.primary, fontFamily: Typography.bold }]}>{stats.tasks}</Text>
                                <Text style={[styles.statLabel, { color: theme.onSurfaceVariant, fontFamily: Typography.regular }]}>مهمة</Text>
                            </View>
                            <View style={[styles.statDivider, { backgroundColor: theme.outline + '40' }]} />
                            <View style={styles.statItem}>
                                <Text style={[styles.statValue, { color: theme.primary, fontFamily: Typography.bold }]}>{stats.activities}</Text>
                                <Text style={[styles.statLabel, { color: theme.onSurfaceVariant, fontFamily: Typography.regular }]}>نشاط</Text>
                            </View>
                            <View style={[styles.statDivider, { backgroundColor: theme.outline + '40' }]} />
                            <View style={styles.statItem}>
                                <Text style={[styles.statValue, { color: theme.primary, fontFamily: Typography.bold }]}>85%</Text>
                                <Text style={[styles.statLabel, { color: theme.onSurfaceVariant, fontFamily: Typography.regular }]}>إنجاز</Text>
                            </View>
                        </View>
                    </View>
                </Animated.View>

                {/* Menu Options */}
                <View style={styles.menuContainer}>
                    <TouchableOpacity
                        style={[styles.menuItem, { backgroundColor: theme.surfaceVariant }]}
                        onPress={() => router.push('/edit-profile')}
                    >
                        <View style={[styles.iconBox, { backgroundColor: theme.primaryContainer }]}>
                            <Ionicons name="person-outline" size={22} color={theme.onPrimaryContainer} />
                        </View>
                        <Text style={[styles.menuText, { color: theme.onSurface, fontFamily: Typography.regular }]}>تعديل البيانات</Text>
                        <Ionicons name="chevron-back" size={20} color={theme.onSurfaceVariant} />
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.menuItem, { backgroundColor: theme.surfaceVariant }]}>
                        <View style={[styles.iconBox, { backgroundColor: theme.secondaryContainer }]}>
                            <Ionicons name="notifications-outline" size={22} color={theme.onSecondaryContainer} />
                        </View>
                        <Text style={[styles.menuText, { color: theme.onSurface, fontFamily: Typography.regular }]}>الإشعارات</Text>
                        <Ionicons name="chevron-back" size={20} color={theme.onSurfaceVariant} />
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.menuItem, { backgroundColor: theme.surfaceVariant }]}>
                        <View style={[styles.iconBox, { backgroundColor: theme.tertiaryContainer }]}>
                            <Ionicons name="settings-outline" size={22} color={theme.onTertiaryContainer} />
                        </View>
                        <Text style={[styles.menuText, { color: theme.onSurface, fontFamily: Typography.regular }]}>الإعدادات العامة</Text>
                        <Ionicons name="chevron-back" size={20} color={theme.onSurfaceVariant} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.menuItem, { backgroundColor: theme.surfaceVariant }]}
                        onPress={() => router.push('/about')}
                    >
                        <View style={[styles.iconBox, { backgroundColor: theme.surface }]}>
                            <Ionicons name="information-circle-outline" size={22} color={theme.primary} />
                        </View>
                        <Text style={[styles.menuText, { color: theme.onSurface, fontFamily: Typography.regular }]}>حول التطبيق</Text>
                        <Ionicons name="chevron-back" size={20} color={theme.onSurfaceVariant} />
                    </TouchableOpacity>

                    {/* Admin Access if needed */}
                    {userData?.role === 'admin' && (
                        <TouchableOpacity
                            style={[styles.menuItem, { backgroundColor: theme.surfaceVariant }]}
                            onPress={() => router.push('/admin')}
                        >
                            <View style={[styles.iconBox, { backgroundColor: '#ffebee' }]}>
                                <Ionicons name="shield-checkmark-outline" size={22} color="#d32f2f" />
                            </View>
                            <Text style={[styles.menuText, { color: theme.onSurface, fontFamily: Typography.regular }]}>لوحة الإدارة</Text>
                            <Ionicons name="chevron-back" size={20} color={theme.onSurfaceVariant} />
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        style={[styles.menuItem, { backgroundColor: theme.errorContainer, marginTop: 20 }]}
                        onPress={handleLogout}
                    >
                        <View style={[styles.iconBox, { backgroundColor: theme.onErrorContainer }]}>
                            <Ionicons name="log-out-outline" size={22} color={theme.errorContainer} />
                        </View>
                        <Text style={[styles.menuText, { color: theme.onErrorContainer, fontFamily: Typography.bold }]}>تسجيل الخروج</Text>
                    </TouchableOpacity>
                </View>



                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { padding: 20, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between' },
    backBtn: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 18 },
    profileCardContainer: { paddingHorizontal: 20, marginBottom: 20 },
    profileCard: { borderRadius: 24, padding: 20, alignItems: 'center' },
    avatarContainer: { position: 'relative', marginBottom: 12 },
    avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 4 },
    statusBadge: { position: 'absolute', bottom: 5, right: 5, width: 20, height: 20, borderRadius: 10, borderWidth: 3 },
    userName: { fontSize: 22, marginBottom: 4 },
    userEmail: { fontSize: 14, marginBottom: 12 },
    roleChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginBottom: 20 },
    roleText: { fontSize: 12 },
    statsRow: { flexDirection: 'row-reverse', width: '100%', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: 'rgba(150,150,150,0.1)', paddingTop: 20 },
    statItem: { alignItems: 'center', flex: 1 },
    statValue: { fontSize: 18, marginBottom: 4 },
    statLabel: { fontSize: 12 },
    statDivider: { width: 1, height: '80%' },
    menuContainer: { paddingHorizontal: 20, gap: 12 },
    menuItem: { flexDirection: 'row-reverse', alignItems: 'center', padding: 16, borderRadius: 18, gap: 12 },
    iconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    menuText: { flex: 1, textAlign: 'right', fontSize: 15 },
    devSection: { paddingHorizontal: 24, marginTop: 24 },
    devSectionTitle: { fontSize: 16, marginBottom: 12, textAlign: 'right' },
    devCard: { flexDirection: 'row-reverse', alignItems: 'center', padding: 16, borderRadius: 20, gap: 16 },
    devAvatar: { width: 50, height: 50, borderRadius: 25 },
    devInfo: { flex: 1, alignItems: 'flex-start' },
    devName: { fontSize: 16, textAlign: 'right' },
    devRole: { fontSize: 12, textAlign: 'right' },
});
