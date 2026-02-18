import { Colors, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { committeeService } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const FALLBACK_COMMITTEES = [
    { _id: '1', name: 'اللجنة العلمية', icon: 'flask', color: '#007AFF', membersCount: 12, description: 'مسؤولة عن النشاطات البحثية والأكاديمية' },
    { _id: '2', name: 'اللجنة الثقافية', icon: 'book', color: '#5856D6', membersCount: 8, description: 'تنظيم الندوات والمسابقات الأدبية' },
    { _id: '3', name: 'اللجنة الرياضية', icon: 'tennisball', color: '#FF9500', membersCount: 15, description: 'تنظيم الدورات والفعاليات الرياضية' },
    { _id: '4', name: 'اللجنة الفنية', icon: 'color-palette', color: '#FF2D55', membersCount: 6, description: 'مسؤولة عن الجوانب التصميمية والفنون' },
    { _id: '5', name: 'لجنة العلاقات العامة', icon: 'people', color: '#34C759', membersCount: 10, description: 'التواصل الخارجي وإدارة الفعاليات' },
    { _id: '6', name: 'لجنة التطوير الرقمي', icon: 'code-working', color: '#AF52DE', membersCount: 7, description: 'إدارة المنصات الإلكترونية والبرمجة' },
];

const ICON_MAP: Record<string, string> = {
    science: 'flask', cultural: 'book', sports: 'tennisball',
    art: 'color-palette', pr: 'people', tech: 'code-working',
};

export default function CommitteesScreen() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const [committees, setCommittees] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useFocusEffect(
        useCallback(() => {
            fetchCommittees();
        }, [])
    );

    const fetchCommittees = async () => {
        try {
            setLoading(true);
            const res = await committeeService.getAll();
            const data = res.data || [];
            setCommittees(data.length > 0 ? data : FALLBACK_COMMITTEES);
        } catch {
            setCommittees(FALLBACK_COMMITTEES);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const COLORS = ['#007AFF', '#5856D6', '#FF9500', '#FF2D55', '#34C759', '#AF52DE', '#FF3B30', '#00C7BE'];

    const renderCommittee = ({ item, index }: { item: any; index: number }) => {
        const color = item.color || COLORS[index % COLORS.length];
        const icon = item.icon || ICON_MAP[item.type] || 'briefcase';
        const count = item.membersCount ?? item.members?.length ?? 0;

        return (
            <TouchableOpacity
                style={[styles.card, { backgroundColor: theme.surface }]}
                activeOpacity={0.8}
            >
                <View style={[styles.iconBox, { backgroundColor: color + '18' }]}>
                    <Ionicons name={icon as any} size={28} color={color} />
                </View>

                <View style={styles.info}>
                    <Text style={[styles.name, { color: theme.onSurface, fontFamily: Typography.bold }]}>
                        {item.name}
                    </Text>
                    {item.description ? (
                        <Text style={[styles.desc, { color: theme.onSurfaceVariant, fontFamily: Typography.regular }]} numberOfLines={1}>
                            {item.description}
                        </Text>
                    ) : null}

                    <View style={styles.statsRow}>
                        <View style={[styles.countBadge, { backgroundColor: color + '15' }]}>
                            <Ionicons name="people" size={12} color={color} />
                            <Text style={[styles.countText, { color, fontFamily: Typography.bold }]}>
                                {count} عضو
                            </Text>
                        </View>
                        <Ionicons name="chevron-back" size={16} color={theme.onSurfaceVariant} style={{ opacity: 0.3 }} />
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
            <View style={styles.header}>
                <Text style={[styles.headerSub, { color: theme.onSurfaceVariant, fontFamily: Typography.regular }]}>
                    الهيكلية التنظيمية لنظام النخبة
                </Text>
                <Text style={[styles.headerTitle, { color: theme.onSurface, fontFamily: Typography.bold }]}>
                    اللجان
                </Text>
            </View>

            {loading ? (
                <View style={styles.loadingCenter}>
                    <ActivityIndicator size="large" color={theme.primary} />
                </View>
            ) : (
                <FlatList
                    data={committees}
                    renderItem={renderCommittee}
                    keyExtractor={(item, i) => item._id || i.toString()}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchCommittees(); }} tintColor={theme.primary} />
                    }
                    ListHeaderComponent={() => (
                        <LinearGradient
                            colors={[theme.primary, theme.secondary]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.heroCard}
                        >
                            <Ionicons name="briefcase" size={36} color="#fff" style={{ marginBottom: 12, opacity: 0.9 }} />
                            <Text style={[styles.heroTitle, { fontFamily: Typography.bold }]}>نظام اللجان المركزية</Text>
                            <Text style={[styles.heroText, { fontFamily: Typography.regular }]}>
                                نوزع المهام لضمان أعلى مستويات الدقة في التنفيذ الهندسي والأكاديمي.
                            </Text>
                            <View style={styles.heroStat}>
                                <Text style={styles.heroStatNum}>{committees.length}</Text>
                                <Text style={styles.heroStatLabel}>لجنة نشطة</Text>
                            </View>
                        </LinearGradient>
                    )}
                    ListEmptyComponent={
                        <View style={styles.emptyBox}>
                            <Ionicons name="briefcase-outline" size={60} color={theme.onSurfaceVariant} style={{ opacity: 0.3 }} />
                            <Text style={[styles.emptyText, { color: theme.onSurfaceVariant, fontFamily: Typography.bold }]}>
                                لا توجد لجان حالياً
                            </Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    loadingCenter: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: {
        paddingHorizontal: 24,
        paddingTop: 10,
        paddingBottom: 20,
        alignItems: 'flex-end',
    },
    headerTitle: { fontSize: 34, letterSpacing: -0.5 },
    headerSub: { fontSize: 13, opacity: 0.6, marginBottom: 2 },
    listContent: { paddingHorizontal: 20, paddingBottom: 100 },
    heroCard: {
        borderRadius: 28,
        padding: 24,
        marginBottom: 20,
        alignItems: 'flex-end',
        elevation: 6,
        shadowColor: '#728156',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
    },
    heroTitle: { color: '#fff', fontSize: 20, marginBottom: 8, textAlign: 'right' },
    heroText: { color: 'rgba(255,255,255,0.8)', fontSize: 13, lineHeight: 20, textAlign: 'right', marginBottom: 16 },
    heroStat: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 8,
    },
    heroStatNum: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    heroStatLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 13 },
    card: {
        flexDirection: 'row-reverse',
        borderRadius: 22,
        padding: 16,
        marginBottom: 12,
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    iconBox: {
        width: 60,
        height: 60,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 16,
    },
    info: { flex: 1, alignItems: 'flex-end' },
    name: { fontSize: 17, marginBottom: 4 },
    desc: { fontSize: 12, opacity: 0.55, marginBottom: 10 },
    statsRow: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
    },
    countBadge: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
        gap: 5,
    },
    countText: { fontSize: 11 },
    emptyBox: { alignItems: 'center', paddingVertical: 60, gap: 12 },
    emptyText: { fontSize: 16, opacity: 0.5 },
});
