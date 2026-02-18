import { Colors, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { announcementService } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AnnouncementDetailScreen() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const { id } = useLocalSearchParams<{ id: string }>();

    const [item, setItem] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        load();
    }, [id]);

    const load = async () => {
        try {
            const res = await announcementService.getAll();
            const all = res.data || [];
            const found = all.find((a: any) => a._id === id || a.id === id);
            setItem(found || null);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={[styles.center, { backgroundColor: theme.background }]}>
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    if (!item) {
        return (
            <SafeAreaView style={[styles.center, { backgroundColor: theme.background }]} edges={['top']}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: theme.surface }]}>
                    <Ionicons name="chevron-forward" size={22} color={theme.onSurface} />
                </TouchableOpacity>
                <Ionicons name="megaphone-outline" size={60} color={theme.onSurfaceVariant} style={{ opacity: 0.3 }} />
                <Text style={[styles.notFoundText, { color: theme.onSurfaceVariant, fontFamily: Typography.bold }]}>
                    لم يتم العثور على الإعلان
                </Text>
            </SafeAreaView>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
                {/* Hero */}
                <LinearGradient
                    colors={item.important ? ['#FF3B30', '#FF6B35'] : [theme.primary, theme.secondary]}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                    style={styles.hero}
                >
                    <SafeAreaView edges={['top']} style={styles.heroTop}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.heroBack}>
                            <Ionicons name="chevron-forward" size={22} color="#fff" />
                        </TouchableOpacity>
                    </SafeAreaView>
                    <View style={styles.heroContent}>
                        <View style={styles.heroIcon}>
                            <Ionicons name={item.important ? 'alert-circle' : 'megaphone'} size={40} color="rgba(255,255,255,0.9)" />
                        </View>
                        {item.important && (
                            <View style={styles.importantBadge}>
                                <Text style={styles.importantBadgeText}>إعلان هام</Text>
                            </View>
                        )}
                    </View>
                </LinearGradient>

                {/* Content */}
                <View style={[styles.contentCard, { backgroundColor: theme.background }]}>
                    {/* Type + Date */}
                    <View style={styles.metaRow}>
                        {item.type && (
                            <View style={[styles.typePill, { backgroundColor: theme.primary + '15' }]}>
                                <Text style={[styles.typeText, { color: theme.primary, fontFamily: Typography.bold }]}>{item.type}</Text>
                            </View>
                        )}
                        {item.date && (
                            <View style={[styles.datePill, { backgroundColor: theme.surfaceVariant }]}>
                                <Ionicons name="time-outline" size={12} color={theme.onSurfaceVariant} />
                                <Text style={[styles.dateText, { color: theme.onSurfaceVariant }]}>{item.date}</Text>
                            </View>
                        )}
                    </View>

                    {/* Title */}
                    <Text style={[styles.title, { color: theme.onSurface, fontFamily: Typography.bold }]}>
                        {item.title}
                    </Text>

                    {/* Divider */}
                    <View style={[styles.divider, { backgroundColor: theme.surfaceVariant }]} />

                    {/* Body */}
                    <Text style={[styles.body, { color: theme.onSurfaceVariant, fontFamily: Typography.regular }]}>
                        {item.content || item.description || 'لا يوجد محتوى إضافي'}
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
    notFoundText: { fontSize: 16, opacity: 0.5 },
    backBtn: { position: 'absolute', top: 60, right: 20, width: 42, height: 42, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },

    hero: { height: 240, justifyContent: 'space-between' },
    heroTop: { paddingHorizontal: 16 },
    heroBack: { width: 42, height: 42, borderRadius: 14, backgroundColor: 'rgba(0,0,0,0.25)', justifyContent: 'center', alignItems: 'center', marginTop: 8 },
    heroContent: { alignItems: 'center', paddingBottom: 30, gap: 12 },
    heroIcon: { width: 80, height: 80, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
    importantBadge: { backgroundColor: 'rgba(255,255,255,0.25)', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
    importantBadgeText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },

    contentCard: { borderTopLeftRadius: 32, borderTopRightRadius: 32, marginTop: -24, padding: 24, paddingTop: 28 },
    metaRow: { flexDirection: 'row-reverse', gap: 10, marginBottom: 16 },
    typePill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
    typeText: { fontSize: 12 },
    datePill: { flexDirection: 'row-reverse', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, gap: 5 },
    dateText: { fontSize: 11 },
    title: { fontSize: 22, lineHeight: 32, textAlign: 'right', marginBottom: 16 },
    divider: { height: 1, marginBottom: 16 },
    body: { fontSize: 16, lineHeight: 28, textAlign: 'right' },
});
