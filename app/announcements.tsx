import { Colors, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { announcementService } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AnnouncementsScreen() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        try {
            setLoading(true);
            const response = await announcementService.getAll();
            setAnnouncements(response.data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const renderAnnouncement = ({ item, index }: { item: any, index: number }) => (
        <Animated.View entering={FadeInUp.delay(index * 100)}>
            <TouchableOpacity
                style={[styles.card, { backgroundColor: theme.surfaceVariant }]}
                onPress={() => router.push({ pathname: '/announcement-detail', params: { id: item._id || item.id } } as any)}
                activeOpacity={0.8}
            >
                <View style={styles.cardHeader}>
                    <View style={[styles.typeBadge, { backgroundColor: item.type === 'عام' ? theme.secondaryContainer : theme.primaryContainer }]}>
                        <Text style={[styles.typeText, { color: item.type === 'عام' ? theme.onSecondaryContainer : theme.onPrimaryContainer, fontFamily: Typography.bold }]}>{item.type}</Text>
                    </View>
                    {item.important && (
                        <View style={styles.importantRow}>
                            <Text style={[styles.importantText, { color: theme.error, fontFamily: Typography.bold }]}>هام</Text>
                            <Ionicons name="alert-circle" size={14} color={theme.error} />
                        </View>
                    )}
                </View>
                <Text style={[styles.title, { color: theme.onSurface, fontFamily: Typography.bold }]}>{item.title}</Text>
                <Text style={[styles.content, { color: theme.onSurfaceVariant, fontFamily: Typography.regular }]}>{item.content}</Text>
                <View style={styles.footer}>
                    <Text style={[styles.date, { color: theme.onSurfaceVariant, fontFamily: Typography.regular }]}>{item.date}</Text>
                    <Ionicons name="time-outline" size={12} color={theme.onSurfaceVariant} />
                </View>
            </TouchableOpacity>
        </Animated.View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: theme.elevation.level2 }]}>
                    <Ionicons name="chevron-forward" size={24} color={theme.onSurface} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.onSurface, fontFamily: Typography.bold }]}>الإعلانات والهام</Text>
                <View style={{ width: 44 }} />
            </View>

            {loading && !refreshing ? (
                <ActivityIndicator size="small" color={theme.primary} style={{ marginTop: 40 }} />
            ) : (
                <FlatList
                    data={announcements}
                    renderItem={renderAnnouncement}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchAnnouncements(); }} tintColor={theme.primary} />}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: 24,
        paddingBottom: 16,
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: 24,
        paddingTop: 0,
        gap: 12,
        paddingBottom: 100,
    },
    card: {
        borderRadius: 20,
        padding: 16,
    },
    cardHeader: {
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    typeBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    typeText: {
        fontSize: 10,
    },
    importantRow: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        gap: 4,
    },
    importantText: {
        fontSize: 11,
    },
    title: {
        fontSize: 16,
        textAlign: 'right',
        marginBottom: 6,
    },
    content: {
        fontSize: 13,
        lineHeight: 20,
        textAlign: 'right',
        marginBottom: 14,
    },
    footer: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        gap: 6,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.04)',
        paddingTop: 12,
    },
    date: {
        fontSize: 11,
    },
});
