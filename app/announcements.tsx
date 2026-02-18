import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ANNOUNCEMENTS_DATA = [
    {
        id: '1',
        title: 'تأجيل موعد الاجتماع الأسبوعي',
        content: 'تم تأجيل اجتماع اللجنة العلمية ليوم الثلاثاء القادم الساعة 1:00 ظهراً في قاعة السيمينار.',
        date: 'منذ ساعة',
        type: 'خاص بالأعضاء',
        important: true,
    },
    {
        id: '2',
        title: 'فتح باب التطوع في الأنشطة الشتوية',
        content: 'يمكنكم الآن ملء استمارة التطوع من خلال قسم الملف الشخصي، الأولوية لطلاب السنة الأولى والثانية.',
        date: 'منذ 3 ساعات',
        type: 'عام',
        important: false,
    },
    {
        id: '3',
        title: 'توزيع شهادات ملتقى التوظيف',
        content: 'يرجى من جميع المتطوعين الحضور لمكتب النشاط لستلام شهادات التقدير الخاصة بالملتقى الأخير.',
        date: 'أمس',
        type: 'خاص بالأعضاء',
        important: false,
    },
];

export default function AnnouncementsScreen() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    const renderAnnouncement = ({ item }: { item: typeof ANNOUNCEMENTS_DATA[0] }) => (
        <TouchableOpacity style={[styles.card, { backgroundColor: theme.surfaceVariant }]}>
            <View style={styles.cardHeader}>
                <View style={[styles.typeBadge, { backgroundColor: item.type === 'عام' ? theme.secondaryContainer : theme.primaryContainer }]}>
                    <Text style={[styles.typeText, { color: item.type === 'عام' ? theme.onSecondaryContainer : theme.onPrimaryContainer }]}>{item.type}</Text>
                </View>
                {item.important && (
                    <View style={styles.importantRow}>
                        <Text style={[styles.importantText, { color: theme.error }]}>هام</Text>
                        <Ionicons name="alert-circle" size={16} color={theme.error} />
                    </View>
                )}
            </View>
            <Text style={[styles.title, { color: theme.onSurface }]}>{item.title}</Text>
            <Text style={[styles.content, { color: theme.onSurfaceVariant }]}>{item.content}</Text>
            <View style={styles.footer}>
                <Text style={[styles.date, { color: theme.onSurfaceVariant }]}>{item.date}</Text>
                <Ionicons name="time-outline" size={14} color={theme.onSurfaceVariant} />
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: theme.surfaceVariant }]}>
                    <Ionicons name="chevron-forward" size={24} color={theme.onSurfaceVariant} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.onSurface }]}>الإعلانات</Text>
                <View style={{ width: 48 }} />
            </View>

            <FlatList
                data={ANNOUNCEMENTS_DATA}
                renderItem={renderAnnouncement}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: 24,
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '700',
    },
    backBtn: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: 24,
        gap: 16,
    },
    card: {
        borderRadius: 24,
        padding: 24,
    },
    cardHeader: {
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    typeBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    typeText: {
        fontSize: 12,
        fontWeight: '700',
    },
    importantRow: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        gap: 6,
    },
    importantText: {
        fontSize: 12,
        fontWeight: '700',
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        textAlign: 'right',
        marginBottom: 8,
    },
    content: {
        fontSize: 14,
        lineHeight: 22,
        textAlign: 'right',
        marginBottom: 16,
    },
    footer: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        gap: 6,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
        paddingTop: 16,
    },
    date: {
        fontSize: 12,
    },
});
