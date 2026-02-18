import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    const ProfileOption = ({ icon, title, subtitle, onPress, color }: any) => (
        <TouchableOpacity
            style={[styles.optionCard, { backgroundColor: theme.elevation.level1 }]}
            onPress={onPress}
        >
            <Ionicons name="chevron-back" size={20} color={theme.onSurfaceVariant} />
            <View style={styles.optionTextContainer}>
                <Text style={[styles.optionTitle, { color: theme.onSurface }]}>{title}</Text>
                {subtitle && <Text style={[styles.optionSubtitle, { color: theme.onSurfaceVariant }]}>{subtitle}</Text>}
            </View>
            <View style={[styles.optionIconContainer, { backgroundColor: (color || theme.primaryContainer) }]}>
                <Ionicons name={icon} size={22} color={color ? '#FFF' : theme.onPrimaryContainer} />
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <Text style={[styles.headerTitle, { color: theme.onSurface }]}>الملف الشخصي</Text>
                    <TouchableOpacity style={[styles.editBtn, { backgroundColor: theme.surfaceVariant }]}>
                        <Ionicons name="create-outline" size={20} color={theme.onSurfaceVariant} />
                    </TouchableOpacity>
                </View>

                <View style={styles.profileInfo}>
                    <View style={styles.avatarWrapper}>
                        <Image
                            source={{ uri: 'https://i.pravatar.cc/150?u=me' }}
                            style={[styles.avatar, { borderColor: theme.primary }]}
                        />
                        <View style={[styles.onlineBadge, { backgroundColor: '#4CAF50', borderColor: theme.background }]} />
                    </View>
                    <Text style={[styles.userName, { color: theme.onSurface }]}>علي حيدر شاكر</Text>
                    <Text style={[styles.userRole, { color: theme.onSurfaceVariant }]}>طالب - هندسة حاسبات</Text>

                    <View style={[styles.statsRow, { backgroundColor: theme.surfaceVariant }]}>
                        <View style={styles.statItem}>
                            <Text style={[styles.statValue, { color: theme.primary }]}>12</Text>
                            <Text style={[styles.statLabel, { color: theme.onSurfaceVariant }]}>نشاط</Text>
                        </View>
                        <View style={[styles.statDivider, { backgroundColor: theme.outline }]} />
                        <View style={styles.statItem}>
                            <Text style={[styles.statValue, { color: theme.primary }]}>8</Text>
                            <Text style={[styles.statLabel, { color: theme.onSurfaceVariant }]}>مهام</Text>
                        </View>
                        <View style={[styles.statDivider, { backgroundColor: theme.outline }]} />
                        <View style={styles.statItem}>
                            <Text style={[styles.statValue, { color: theme.primary }]}>92%</Text>
                            <Text style={[styles.statLabel, { color: theme.onSurfaceVariant }]}>حضور</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.onSurface }]}>طلب الانضمام</Text>
                    <TouchableOpacity
                        style={[styles.applyCard, { backgroundColor: theme.tertiaryContainer }]}
                        onPress={() => alert('تم إرسال طلب الانضمام')}
                    >
                        <View style={styles.applyTextContainer}>
                            <Text style={[styles.applyTitle, { color: theme.onTertiaryContainer }]}>انضم لفريق الإدارة</Text>
                            <Text style={[styles.applySubtitle, { color: theme.onTertiaryContainer }]}>ساعدنا في تنظيم الفعاليات وبناء المجتمع الهندسي</Text>
                        </View>
                        <Ionicons name="paper-plane-outline" size={32} color={theme.onTertiaryContainer} />
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.onSurface }]}>الإعدادات</Text>
                    <ProfileOption
                        icon="notifications-outline"
                        title="الإشعارات"
                        subtitle="تنبيهات الأنشطة والمهام الجديدة"
                    />
                    <ProfileOption
                        icon="archive-outline"
                        title="أرشيفي الخاص"
                        subtitle="الشهادات والمشاركات السابقة"
                    />
                    <ProfileOption
                        icon="shield-checkmark-outline"
                        title="الخصوصية والأمان"
                    />
                    <ProfileOption
                        icon="log-out-outline"
                        title="تسجيل الخروج"
                        color={theme.error}
                    />
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>
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
        fontSize: 24,
        fontWeight: '700',
        textAlign: 'right',
    },
    editBtn: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileInfo: {
        alignItems: 'center',
        padding: 24,
    },
    avatarWrapper: {
        position: 'relative',
        marginBottom: 16,
    },
    avatar: {
        width: 110,
        height: 110,
        borderRadius: 55,
        borderWidth: 4,
    },
    onlineBadge: {
        position: 'absolute',
        bottom: 6,
        right: 8,
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 3,
    },
    userName: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 4,
    },
    userRole: {
        fontSize: 14,
        marginBottom: 24,
    },
    statsRow: {
        flexDirection: 'row-reverse',
        justifyContent: 'space-around',
        width: '100%',
        padding: 20,
        borderRadius: 24,
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 18,
        fontWeight: '700',
    },
    statLabel: {
        fontSize: 12,
        marginTop: 2,
    },
    statDivider: {
        width: 1,
        height: '60%',
        alignSelf: 'center',
        opacity: 0.2,
    },
    section: {
        padding: 24,
        paddingTop: 0,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        textAlign: 'right',
        marginBottom: 16,
        marginTop: 8,
    },
    applyCard: {
        padding: 24,
        borderRadius: 28,
        flexDirection: 'row-reverse',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    applyTextContainer: {
        flex: 1,
        marginRight: 16,
    },
    applyTitle: {
        fontSize: 18,
        fontWeight: '700',
        textAlign: 'right',
    },
    applySubtitle: {
        fontSize: 13,
        textAlign: 'right',
        marginTop: 4,
        opacity: 0.9,
    },
    optionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 20,
        marginBottom: 12,
    },
    optionIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 16,
    },
    optionTextContainer: {
        flex: 1,
        alignItems: 'flex-end',
        marginRight: 4,
    },
    optionTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    optionSubtitle: {
        fontSize: 12,
        marginTop: 2,
    },
});
