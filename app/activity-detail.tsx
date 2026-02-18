import { Colors, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { activityService } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function ActivityDetailScreen() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const { id } = useLocalSearchParams<{ id: string }>();

    const [activity, setActivity] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [registering, setRegistering] = useState(false);
    const [isRegistered, setIsRegistered] = useState(false);
    const [userId, setUserId] = useState('');

    const videoSource = activity?.video;
    const player = useVideoPlayer(videoSource, player => {
        player.loop = false;
        player.play();
    });

    useEffect(() => {
        loadActivity();
        loadUser();
    }, [id]);

    const loadUser = async () => {
        const userData = await AsyncStorage.getItem('userData');
        if (userData) {
            const parsed = JSON.parse(userData);
            setUserId(parsed.uid || parsed._id || '');
        }
    };

    const loadActivity = async () => {
        try {
            setLoading(true);
            // Try to get single activity, fallback to list
            const res = await activityService.getAll();
            const all = res.data || [];
            const found = all.find((a: any) => a._id === id || a.id === id);
            if (found) {
                setActivity(found);
                // Check if user already registered
                const userData = await AsyncStorage.getItem('userData');
                if (userData) {
                    const parsed = JSON.parse(userData);
                    const uid = parsed.uid || parsed._id || '';
                    const attendees = found.attendees || [];
                    setIsRegistered(attendees.some((a: any) => a === uid || a._id === uid || a.uid === uid));
                }
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async () => {
        if (isRegistered) {
            Alert.alert('تنبيه', 'أنت مسجل بالفعل في هذه الفعالية');
            return;
        }
        Alert.alert(
            'تأكيد التسجيل',
            `هل تريد التسجيل في "${activity?.title}"؟`,
            [
                { text: 'إلغاء', style: 'cancel' },
                {
                    text: 'تسجيل', onPress: async () => {
                        try {
                            setRegistering(true);
                            // Call register endpoint
                            await activityService.register(id!);
                            setIsRegistered(true);
                            Alert.alert('✅ تم التسجيل', 'تم تسجيلك في الفعالية بنجاح!');
                        } catch {
                            Alert.alert('خطأ', 'فشل في التسجيل، يرجى المحاولة مجدداً');
                        } finally {
                            setRegistering(false);
                        }
                    }
                }
            ]
        );
    };

    if (loading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    if (!activity) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
                <TouchableOpacity onPress={() => router.back()} style={styles.floatingBack}>
                    <Ionicons name="chevron-forward" size={22} color={theme.onSurface} />
                </TouchableOpacity>
                <View style={styles.notFound}>
                    <Ionicons name="calendar-outline" size={60} color={theme.onSurfaceVariant} style={{ opacity: 0.3 }} />
                    <Text style={[styles.notFoundText, { color: theme.onSurfaceVariant, fontFamily: Typography.bold }]}>
                        لم يتم العثور على الفعالية
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    const attendeeCount = activity.attendees?.length || 0;
    const maxAttendees = activity.maxAttendees || null;
    const isFull = maxAttendees && attendeeCount >= maxAttendees;

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
                {/* Hero Image / Video */}
                <View style={styles.heroContainer}>
                    {activity.video ? (
                        <VideoView
                            player={player}
                            style={styles.heroImage}
                            contentFit="cover"
                            allowsFullscreen
                            allowsPictureInPicture
                        />
                    ) : activity.image ? (
                        <Image source={{ uri: activity.image }} style={styles.heroImage} resizeMode="cover" />
                    ) : (
                        <LinearGradient colors={[theme.primary, theme.secondary]} style={styles.heroImage}>
                            <Ionicons name="calendar" size={80} color="rgba(255,255,255,0.4)" />
                        </LinearGradient>
                    )}
                    {/* Gradient overlay */}
                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.6)']}
                        style={styles.heroOverlay}
                    />
                    {/* Back button */}
                    <SafeAreaView edges={['top']} style={styles.heroTop}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.heroBack}>
                            <Ionicons name="chevron-forward" size={22} color="#fff" />
                        </TouchableOpacity>
                    </SafeAreaView>
                </View>

                {/* Content */}
                <View style={[styles.contentCard, { backgroundColor: theme.background }]}>
                    {/* Title */}
                    <Text style={[styles.title, { color: theme.onSurface, fontFamily: Typography.bold }]}>
                        {activity.title}
                    </Text>

                    {/* Meta Pills */}
                    <View style={styles.metaRow}>
                        {activity.date && (
                            <View style={[styles.metaPill, { backgroundColor: theme.primary + '15' }]}>
                                <Ionicons name="calendar-outline" size={14} color={theme.primary} />
                                <Text style={[styles.metaText, { color: theme.primary, fontFamily: Typography.bold }]}>
                                    {activity.date}
                                </Text>
                            </View>
                        )}
                        {activity.location && (
                            <View style={[styles.metaPill, { backgroundColor: '#FF9500' + '15' }]}>
                                <Ionicons name="location-outline" size={14} color="#FF9500" />
                                <Text style={[styles.metaText, { color: '#FF9500', fontFamily: Typography.bold }]}>
                                    {activity.location}
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Attendees Counter */}
                    <View style={[styles.attendeesBox, { backgroundColor: theme.surface }]}>
                        <View style={styles.attendeesLeft}>
                            {maxAttendees && (
                                <View style={styles.progressBar}>
                                    <View style={[styles.progressFill, {
                                        backgroundColor: isFull ? '#FF3B30' : theme.primary,
                                        width: `${Math.min((attendeeCount / maxAttendees) * 100, 100)}%` as any,
                                    }]} />
                                </View>
                            )}
                            <Text style={[styles.attendeesLabel, { color: theme.onSurfaceVariant }]}>
                                {maxAttendees ? `${attendeeCount} / ${maxAttendees} مشترك` : `${attendeeCount} مشترك`}
                            </Text>
                        </View>
                        <View style={styles.attendeesRight}>
                            <View style={[styles.attendeesIconBox, { backgroundColor: theme.primary + '15' }]}>
                                <Ionicons name="people" size={22} color={theme.primary} />
                            </View>
                            <Text style={[styles.attendeesCount, { color: theme.onSurface, fontFamily: Typography.bold }]}>
                                المشتركون
                            </Text>
                        </View>
                    </View>

                    {/* Description */}
                    {activity.description && (
                        <View style={styles.descSection}>
                            <Text style={[styles.sectionTitle, { color: theme.onSurface, fontFamily: Typography.bold }]}>
                                تفاصيل الفعالية
                            </Text>
                            <Text style={[styles.description, { color: theme.onSurfaceVariant, fontFamily: Typography.regular }]}>
                                {activity.description}
                            </Text>
                        </View>
                    )}

                    {/* Status Badge */}
                    {isRegistered && (
                        <View style={[styles.registeredBadge, { backgroundColor: '#34C75915' }]}>
                            <Ionicons name="checkmark-circle" size={20} color="#34C759" />
                            <Text style={[styles.registeredText, { color: '#34C759', fontFamily: Typography.bold }]}>
                                أنت مسجل في هذه الفعالية
                            </Text>
                        </View>
                    )}

                    {isFull && !isRegistered && (
                        <View style={[styles.registeredBadge, { backgroundColor: '#FF3B3015' }]}>
                            <Ionicons name="close-circle" size={20} color="#FF3B30" />
                            <Text style={[styles.registeredText, { color: '#FF3B30', fontFamily: Typography.bold }]}>
                                اكتمل عدد المشتركين
                            </Text>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Register Button */}
            <View style={[styles.bottomBar, { backgroundColor: theme.background }]}>
                <TouchableOpacity
                    style={[
                        styles.registerBtn,
                        {
                            backgroundColor: isRegistered ? '#34C759' : isFull ? '#FF3B30' : theme.primary,
                            opacity: (isFull && !isRegistered) ? 0.6 : 1,
                        }
                    ]}
                    onPress={handleRegister}
                    disabled={registering || (!!isFull && !isRegistered)}
                    activeOpacity={0.85}
                >
                    {registering ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <Ionicons
                                name={isRegistered ? 'checkmark-circle' : isFull ? 'close-circle' : 'person-add'}
                                size={22}
                                color="#fff"
                            />
                            <Text style={[styles.registerBtnText, { fontFamily: Typography.bold }]}>
                                {isRegistered ? 'مسجل بالفعل ✓' : isFull ? 'اكتمل التسجيل' : 'سجّل الآن'}
                            </Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    notFound: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
    notFoundText: { fontSize: 16, opacity: 0.5 },
    floatingBack: { position: 'absolute', top: 60, right: 20, zIndex: 10 },

    heroContainer: { position: 'relative', height: 300 },
    heroImage: { width: '100%', height: 300, justifyContent: 'center', alignItems: 'center' },
    heroOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 120 },
    heroTop: { position: 'absolute', top: 0, left: 0, right: 0 },
    heroBack: {
        margin: 16, width: 42, height: 42, borderRadius: 14,
        backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', alignItems: 'center',
    },

    contentCard: { borderTopLeftRadius: 32, borderTopRightRadius: 32, marginTop: -24, padding: 24, paddingTop: 28 },

    title: { fontSize: 24, lineHeight: 34, textAlign: 'right', marginBottom: 16 },

    metaRow: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
    metaPill: { flexDirection: 'row-reverse', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 14, gap: 6 },
    metaText: { fontSize: 13 },

    attendeesBox: {
        flexDirection: 'row-reverse', alignItems: 'center', padding: 16, borderRadius: 20, marginBottom: 20, gap: 16,
        elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8,
    },
    attendeesRight: { alignItems: 'center', gap: 6 },
    attendeesIconBox: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    attendeesCount: { fontSize: 13 },
    attendeesLeft: { flex: 1, alignItems: 'flex-end', gap: 8 },
    progressBar: { width: '100%', height: 6, backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: 3, overflow: 'hidden' },
    progressFill: { height: '100%', borderRadius: 3 },
    attendeesLabel: { fontSize: 12, opacity: 0.7 },

    descSection: { marginBottom: 20 },
    sectionTitle: { fontSize: 18, marginBottom: 10, textAlign: 'right' },
    description: { fontSize: 15, lineHeight: 26, textAlign: 'right', opacity: 0.8 },

    registeredBadge: { flexDirection: 'row-reverse', alignItems: 'center', padding: 14, borderRadius: 16, gap: 10, marginBottom: 10 },
    registeredText: { fontSize: 14 },

    bottomBar: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        paddingHorizontal: 24, paddingBottom: 34, paddingTop: 12,
    },
    registerBtn: {
        flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center',
        paddingVertical: 18, borderRadius: 22, gap: 10,
        elevation: 6, shadowColor: '#728156', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10,
    },
    registerBtnText: { color: '#fff', fontSize: 18 },
});
