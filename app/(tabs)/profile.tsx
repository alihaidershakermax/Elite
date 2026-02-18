import { Colors, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { activityService, adminService, announcementService, storageService, userService } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Image, Linking, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const [isNotificationsEnabled, setNotificationsEnabled] = useState(true);
    const [userName, setUserName] = useState('');
    const [userRole, setUserRole] = useState('');
    const [avatar, setAvatar] = useState('https://i.pravatar.cc/150?u=me');
    const [isAdmin, setIsAdmin] = useState(false);
    const [loadingImage, setLoadingImage] = useState(false);
    const [loading, setLoading] = useState(true);
    const [adminStats, setAdminStats] = useState({ members: 0, activities: 0, announcements: 0 });

    useFocusEffect(
        useCallback(() => {
            loadSettings();
        }, [])
    );

    const loadSettings = async () => {
        try {
            setLoading(true);
            const savedNotify = await AsyncStorage.getItem('notificationsEnabled');
            if (savedNotify !== null) setNotificationsEnabled(savedNotify === 'true');

            const userData = await AsyncStorage.getItem('userData');
            if (userData) {
                const parsed = JSON.parse(userData);
                setUserName(parsed.name || 'مستخدم');
                setUserRole(parsed.role === 'admin' ? 'مدير النظام' : parsed.role || 'عضو');
                setIsAdmin(parsed.role === 'admin');
                if (parsed.photoURL) setAvatar(parsed.photoURL);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
        // Load admin stats in background
        if (isAdmin) {
            try {
                const [mRes, aRes, annRes] = await Promise.all([
                    adminService.getAllMembers().catch(() => ({ data: [] })),
                    activityService.getAll().catch(() => ({ data: [] })),
                    announcementService.getAll().catch(() => ({ data: [] })),
                ]);
                setAdminStats({
                    members: (mRes.data || []).length,
                    activities: (aRes.data || []).length,
                    announcements: (annRes.data || []).length,
                });
            } catch { }
        }
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            try {
                setLoadingImage(true);
                const localUri = result.assets[0].uri;

                // 1. Upload to Telegram Cloud via API
                const filename = localUri.split('/').pop() || 'profile.jpg';
                const uploadResponse = await storageService.uploadFile({
                    uri: localUri,
                    name: filename,
                    type: 'image/jpeg',
                });

                const photoURL = uploadResponse.data.url;

                // 2. Update local state
                setAvatar(photoURL);

                // 3. Update Server & AsyncStorage
                const userData = await AsyncStorage.getItem('userData');
                if (userData) {
                    const parsed = JSON.parse(userData);
                    parsed.photoURL = photoURL;

                    await userService.updateProfile(parsed.uid, { photoURL });
                    await AsyncStorage.setItem('userData', JSON.stringify(parsed));
                }

                Alert.alert('نجاح', 'تم تحديث الصورة الشخصية وتخزينها سحابياً');
            } catch (error) {
                console.error(error);
                Alert.alert('خطأ', 'فشل في رفع الصورة إلى سحابة تليجرام');
            } finally {
                setLoadingImage(false);
            }
        }
    };

    const toggleNotifications = async (value: boolean) => {
        setNotificationsEnabled(value);
        await AsyncStorage.setItem('notificationsEnabled', value.toString());
    };

    const handleLogout = () => {
        Alert.alert('تسجيل الخروج', 'هل أنت متأكد من رغبتك في تسجيل الخروج؟', [
            { text: 'إلغاء', style: 'cancel' },
            {
                text: 'خروج',
                style: 'destructive',
                onPress: async () => {
                    await AsyncStorage.multiRemove(['userToken', 'userData']);
                    router.replace('/login');
                }
            },
        ]);
    };

    if (loading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    const ProfileRow = ({ icon, title, value, color, onPress, isSwitch, last }: any) => (
        <TouchableOpacity
            style={[styles.row, last && { borderBottomWidth: 0 }]}
            onPress={onPress}
            disabled={!onPress || isSwitch}
            activeOpacity={0.7}
        >
            <View style={styles.rowLeft}>
                {isSwitch ? (
                    <Switch
                        value={isNotificationsEnabled}
                        onValueChange={toggleNotifications}
                        trackColor={{ false: theme.surfaceVariant, true: theme.primary }}
                        thumbColor="#FFF"
                        ios_backgroundColor={theme.surfaceVariant}
                    />
                ) : (
                    onPress && <Ionicons name="chevron-back" size={18} color={theme.onSurfaceVariant} opacity={0.5} />
                )}
                {value && <Text style={[styles.rowValue, { color: theme.onSurfaceVariant, fontFamily: Typography.regular }]}>{value}</Text>}
            </View>
            <View style={styles.rowRight}>
                <Text style={[styles.rowTitle, { color: theme.onSurface, fontFamily: Typography.regular }]}>{title}</Text>
                <View style={[styles.iconBox, { backgroundColor: color + '15' }]}>
                    <Ionicons name={icon} size={20} color={color} />
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
            <ScrollView showsVerticalScrollIndicator={false}>

                {/* Header with Liquid Glass Feel */}
                <LinearGradient
                    colors={[theme.primary, theme.primary + 'CC']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.headerGradient}
                >
                    <View style={styles.headerContent}>
                        <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
                            <Image source={{ uri: avatar }} style={styles.avatar} />
                            {loadingImage && (
                                <View style={styles.avatarLoading}>
                                    <ActivityIndicator color="#FFF" />
                                </View>
                            )}
                            <View style={[styles.editBtn, { backgroundColor: theme.surface }]}>
                                <Ionicons name="camera" size={14} color={theme.primary} />
                            </View>
                        </TouchableOpacity>

                        <Text style={[styles.userName, { fontFamily: Typography.bold }]}>{userName}</Text>
                        <View style={styles.roleBadge}>
                            <Text style={[styles.userRole, { fontFamily: Typography.regular }]}>{userRole}</Text>
                        </View>
                    </View>
                </LinearGradient>

                <View style={styles.content}>
                    {isAdmin && (
                        <View style={[styles.section, { marginBottom: 28 }]}>
                            <Text style={[styles.sectionTitle, { color: theme.onSurfaceVariant, fontFamily: Typography.bold }]}>الإدارة</Text>
                            <TouchableOpacity
                                onPress={() => router.push('/admin-panel' as any)}
                                activeOpacity={0.87}
                                style={styles.adminCard}
                            >
                                <LinearGradient
                                    colors={['#0d1b2a', '#1b2838', '#0f3460']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.adminCardGrad}
                                >
                                    {/* Decorative blobs */}
                                    <View style={styles.blob1} />
                                    <View style={styles.blob2} />

                                    {/* Top row: icon + title */}
                                    <View style={styles.adminCardTop}>
                                        <View style={styles.adminCardTitles}>
                                            <Text style={styles.adminCardTitle}>لوحة الإدارة</Text>
                                            <Text style={styles.adminCardSub}>تحكم كامل بالنظام</Text>
                                        </View>
                                        <View style={styles.adminShieldWrap}>
                                            <View style={styles.adminShieldRing} />
                                            <Ionicons name="shield-checkmark" size={30} color="#fff" />
                                        </View>
                                    </View>

                                    {/* Stats row */}
                                    <View style={styles.adminStatsRow}>
                                        <View style={styles.adminStat}>
                                            <Text style={styles.adminStatNum}>{adminStats.members}</Text>
                                            <Text style={styles.adminStatLabel}>عضو</Text>
                                        </View>
                                        <View style={styles.adminStatDiv} />
                                        <View style={styles.adminStat}>
                                            <Text style={styles.adminStatNum}>{adminStats.activities}</Text>
                                            <Text style={styles.adminStatLabel}>فعالية</Text>
                                        </View>
                                        <View style={styles.adminStatDiv} />
                                        <View style={styles.adminStat}>
                                            <Text style={styles.adminStatNum}>{adminStats.announcements}</Text>
                                            <Text style={styles.adminStatLabel}>إعلان</Text>
                                        </View>
                                    </View>

                                    {/* Bottom bar */}
                                    <View style={styles.adminCardBottom}>
                                        <Ionicons name="chevron-back" size={16} color="rgba(255,255,255,0.4)" />
                                        <View style={styles.adminLiveRow}>
                                            <Text style={styles.adminLiveText}>النظام نشط</Text>
                                            <View style={styles.adminLiveDot} />
                                        </View>
                                    </View>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    )}

                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: theme.onSurfaceVariant, fontFamily: Typography.bold }]}>الحساب</Text>
                        <View style={[styles.card, { backgroundColor: theme.surface }]}>
                            <ProfileRow
                                icon="person"
                                title="تعديل البروفايل"
                                color={theme.primary}
                                onPress={() => router.push('/edit-profile')}
                            />
                            <ProfileRow
                                icon="notifications"
                                title="تنبيهات النظام"
                                color="#FF9500"
                                isSwitch
                                last
                            />
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: theme.onSurfaceVariant, fontFamily: Typography.bold }]}>عام</Text>
                        <View style={[styles.card, { backgroundColor: theme.surface }]}>
                            <ProfileRow
                                icon="information-circle"
                                title="حول Elite"
                                color="#007AFF"
                                onPress={() => router.push('/about')}
                            />
                            <ProfileRow
                                icon="chatbubble-ellipses"
                                title="الدعم الفني"
                                color="#0088cc"
                                onPress={() => Linking.openURL('https://t.me/dextermorgenk')}
                            />
                            <ProfileRow
                                icon="lock-closed"
                                title="الأمان والخصوصية"
                                color="#34C759"
                                onPress={() => Alert.alert('الأمان', 'نظام التشفير نشط والبيانات محمية')}
                                last
                            />
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.logoutBtn, { backgroundColor: theme.surface }]}
                        onPress={handleLogout}
                    >
                        <Text style={[styles.logoutText, { color: '#FF3B30', fontFamily: Typography.bold }]}>تسجيل الخروج</Text>
                        <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
                    </TouchableOpacity>

                    <View style={styles.footer}>
                        <Text style={[styles.versionText, { color: theme.onSurfaceVariant, fontFamily: Typography.regular }]}>Elite Management System v1.5.0</Text>
                        <Text style={[styles.footerCredits, { color: theme.onSurfaceVariant, fontFamily: Typography.regular }]}>جامعة العين العراقية • كلية الهندسة</Text>
                    </View>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    headerGradient: {
        paddingTop: 30,
        paddingBottom: 40,
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
    },
    headerContent: {
        alignItems: 'center',
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 16,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    avatar: {
        width: 110,
        height: 110,
        borderRadius: 55,
        borderWidth: 4,
        borderColor: '#fff',
    },
    avatarLoading: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 55,
        justifyContent: 'center',
        alignItems: 'center',
    },
    editBtn: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    userName: {
        fontSize: 26,
        color: '#fff',
        marginBottom: 6,
        textAlign: 'center',
    },
    roleBadge: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 16,
        paddingVertical: 4,
        borderRadius: 20,
    },
    userRole: {
        fontSize: 14,
        color: '#fff',
        opacity: 0.9,
    },
    content: {
        paddingTop: 25,
        paddingHorizontal: 20,
    },
    section: {
        marginBottom: 25,
    },
    sectionTitle: {
        fontSize: 14,
        marginBottom: 12,
        marginRight: 10,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    card: {
        borderRadius: 24,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
    row: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.03)',
    },
    rowRight: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        gap: 15,
    },
    rowLeft: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        gap: 10,
    },
    rowTitle: {
        fontSize: 16,
    },
    rowValue: {
        fontSize: 14,
        opacity: 0.6,
    },
    iconBox: {
        width: 38,
        height: 38,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoutBtn: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 20,
        gap: 10,
        marginBottom: 30,
        elevation: 2,
        shadowColor: '#FF3B30',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
    },
    logoutText: {
        fontSize: 17,
    },
    footer: {
        alignItems: 'center',
        paddingBottom: 20,
    },
    versionText: {
        fontSize: 11,
        opacity: 0.4,
    },
    footerCredits: {
        fontSize: 10,
        opacity: 0.3,
        marginTop: 4,
    },

    // ── Premium Admin Card ──
    adminCard: {
        borderRadius: 26,
        overflow: 'hidden',
        elevation: 14,
        shadowColor: '#0f3460',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
    },
    adminCardGrad: {
        padding: 22,
        borderRadius: 26,
        overflow: 'hidden',
        position: 'relative',
    },
    blob1: {
        position: 'absolute', width: 200, height: 200, borderRadius: 100,
        backgroundColor: 'rgba(100,149,237,0.07)',
        top: -70, left: -60,
    },
    blob2: {
        position: 'absolute', width: 130, height: 130, borderRadius: 65,
        backgroundColor: 'rgba(255,255,255,0.04)',
        bottom: -40, right: 20,
    },
    adminCardTop: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 22,
    },
    adminCardTitles: { alignItems: 'flex-end' },
    adminCardTitle: {
        color: '#fff',
        fontSize: 22,
        fontWeight: 'bold',
        letterSpacing: 0.4,
        marginBottom: 5,
    },
    adminCardSub: {
        color: 'rgba(255,255,255,0.45)',
        fontSize: 12,
    },
    adminShieldWrap: {
        width: 62, height: 62, borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.08)',
        justifyContent: 'center', alignItems: 'center',
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.12)',
        position: 'relative',
    },
    adminShieldRing: {
        position: 'absolute',
        width: 78, height: 78, borderRadius: 26,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.07)',
    },
    adminStatsRow: {
        flexDirection: 'row-reverse',
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderRadius: 16,
        paddingVertical: 14,
        paddingHorizontal: 8,
        marginBottom: 18,
    },
    adminStat: { flex: 1, alignItems: 'center', gap: 4 },
    adminStatNum: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
    adminStatLabel: { color: 'rgba(255,255,255,0.45)', fontSize: 11 },
    adminStatDiv: { width: 1, backgroundColor: 'rgba(255,255,255,0.1)', alignSelf: 'stretch' },
    adminCardBottom: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.08)',
        paddingTop: 14,
    },
    adminLiveRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 7 },
    adminLiveDot: {
        width: 8, height: 8, borderRadius: 4,
        backgroundColor: '#34C759',
    },
    adminLiveText: {
        color: 'rgba(255,255,255,0.45)',
        fontSize: 12,
    },
});
