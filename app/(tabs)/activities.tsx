import { Colors, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { activityService } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Dimensions, FlatList, Image, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function ActivitiesScreen() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const [activities, setActivities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useFocusEffect(
        useCallback(() => {
            fetchActivities();
        }, [])
    );

    const fetchActivities = async () => {
        try {
            setLoading(true);
            const response = await activityService.getAll();
            setActivities(response.data || []);
        } catch (e) {
            console.log(e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchActivities();
    };

    const renderActivity = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={[styles.activityCard, { backgroundColor: theme.surface }]}
            activeOpacity={0.8}
            onPress={() => router.push({ pathname: '/activity-detail', params: { id: item._id || item.id } } as any)}
        >
            <View style={styles.cardHeader}>
                <View style={[styles.typeBadge, { backgroundColor: theme.primary + '15' }]}>
                    <Text style={[styles.typeText, { color: theme.primary, fontFamily: Typography.bold }]}>نشاط جامعي</Text>
                </View>
                <Ionicons name="ellipsis-horizontal" size={20} color={theme.onSurfaceVariant} />
            </View>

            {item.image && (
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: item.image }}
                        style={styles.activityImage}
                        resizeMode="cover"
                    />
                    <BlurView intensity={20} tint="dark" style={styles.imageBlur}>
                        <View style={styles.timeBadge}>
                            <Ionicons name="time-outline" size={12} color="#fff" />
                            <Text style={styles.timeText}>{item.date || 'قريباً'}</Text>
                        </View>
                    </BlurView>
                </View>
            )}

            <View style={styles.activityContent}>
                <Text style={[styles.activityTitle, { color: theme.onSurface, fontFamily: Typography.bold }]}>
                    {item.title}
                </Text>

                {item.description && (
                    <Text style={[styles.activityDescription, { color: theme.onSurfaceVariant, fontFamily: Typography.regular }]} numberOfLines={3}>
                        {item.description}
                    </Text>
                )}

                <View style={[styles.divider, { backgroundColor: theme.outline + '20' }]} />

                <View style={styles.activityMeta}>
                    <View style={styles.metaItem}>
                        <View style={[styles.metaIcon, { backgroundColor: '#FF950015' }]}>
                            <Ionicons name="location" size={14} color="#FF9500" />
                        </View>
                        <Text style={[styles.metaText, { color: theme.onSurfaceVariant, fontFamily: Typography.regular }]} numberOfLines={1}>
                            {item.location || 'غير محدد'}
                        </Text>
                    </View>

                    <View style={styles.metaItem}>
                        <View style={[styles.metaIcon, { backgroundColor: '#007AFF15' }]}>
                            <Ionicons name="people" size={14} color="#007AFF" />
                        </View>
                        <Text style={[styles.metaText, { color: theme.onSurfaceVariant, fontFamily: Typography.regular }]}>
                            عام للجميع
                        </Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <LinearGradient
                colors={[theme.primary + '20', 'transparent']}
                style={styles.emptyIconCircle}
            >
                <Ionicons name="calendar-clear-outline" size={60} color={theme.primary} />
            </LinearGradient>
            <Text style={[styles.emptyText, { color: theme.onSurface, fontFamily: Typography.bold }]}>
                هدوء تام..
            </Text>
            <Text style={[styles.emptySubtext, { color: theme.onSurfaceVariant, fontFamily: Typography.regular }]}>
                لا توجد نشاطات مجدولة في الوقت الحالي، تفقدنا لاحقاً!
            </Text>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
            <View style={styles.header}>
                <Text style={[styles.headerSubtitle, { color: theme.onSurfaceVariant, fontFamily: Typography.regular }]}>اكتشف آخر الفعاليات</Text>
                <Text style={[styles.headerTitle, { color: theme.onSurface, fontFamily: Typography.bold }]}>النشاطات</Text>
            </View>

            <FlatList
                data={activities}
                renderItem={renderActivity}
                keyExtractor={(item, index) => item.id || index.toString()}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={renderEmpty}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={theme.primary}
                    />
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 20,
        alignItems: 'flex-end',
    },
    headerSubtitle: {
        fontSize: 13,
        opacity: 0.6,
        marginBottom: 2,
    },
    headerTitle: {
        fontSize: 34,
        letterSpacing: -0.5,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 100,
        gap: 20,
    },
    activityCard: {
        borderRadius: 24,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
    },
    cardHeader: {
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    typeBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
    },
    typeText: {
        fontSize: 10,
    },
    imageContainer: {
        height: 240,
        width: '100%',
        position: 'relative',
    },
    activityImage: {
        width: '100%',
        height: '100%',
    },
    imageBlur: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        height: 50,
        justifyContent: 'center',
        paddingHorizontal: 16,
    },
    timeBadge: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        gap: 6,
    },
    timeText: {
        fontSize: 12,
        color: '#fff',
        fontFamily: 'CairoBold',
    },
    activityContent: {
        padding: 16,
        alignItems: 'flex-end',
    },
    activityTitle: {
        fontSize: 20,
        marginBottom: 8,
        lineHeight: 28,
        textAlign: 'right',
    },
    activityDescription: {
        fontSize: 14,
        lineHeight: 22,
        marginBottom: 16,
        textAlign: 'right',
        opacity: 0.8,
    },
    divider: {
        width: '100%',
        height: 1,
        marginBottom: 16,
    },
    activityMeta: {
        flexDirection: 'row-reverse',
        gap: 20,
        width: '100%',
    },
    metaItem: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        gap: 8,
        flex: 1,
    },
    metaIcon: {
        width: 32,
        height: 32,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    metaText: {
        fontSize: 13,
        flex: 1,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 100,
        paddingHorizontal: 40,
    },
    emptyIconCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    emptyText: {
        fontSize: 22,
        marginBottom: 10,
    },
    emptySubtext: {
        fontSize: 15,
        opacity: 0.6,
        textAlign: 'center',
        lineHeight: 22,
    },
});
