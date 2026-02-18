import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Alert, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const MEMBERS_DATA = [
    {
        id: '1',
        name: 'أحمد محمود',
        role: 'رئيس اللجنة',
        committee: 'اللجنة العلمية',
        participation: 95,
        avatar: 'https://i.pravatar.cc/150?u=1',
    },
    {
        id: '2',
        name: 'سارة خالد',
        role: 'نائب الرئيس',
        committee: 'اللجنة الثقافية',
        participation: 88,
        avatar: 'https://i.pravatar.cc/150?u=2',
    },
    {
        id: '3',
        name: 'محمد علي',
        role: 'عضو فعال',
        committee: 'لجنة التنظيم',
        participation: 72,
        avatar: 'https://i.pravatar.cc/150?u=3',
    },
];

export default function MembersScreen() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    const handleDelete = (name: string) => {
        Alert.alert('حذف عضو', `هل أنت متأكد من حذف ${name}؟`, [
            { text: 'إلغاء', style: 'cancel' },
            { text: 'حذف', style: 'destructive' },
        ]);
    };

    const renderMember = ({ item }: { item: typeof MEMBERS_DATA[0] }) => (
        <View style={[styles.memberCard, { backgroundColor: theme.surface }]}>
            <View style={styles.memberInfo}>
                <Image source={{ uri: item.avatar }} style={styles.avatar} />
                <View style={styles.textContainer}>
                    <Text style={[styles.memberName, { color: theme.onSurface }]}>{item.name}</Text>
                    <Text style={[styles.memberRole, { color: theme.primary }]}>{item.role}</Text>
                    <Text style={[styles.memberCommittee, { color: theme.onSurfaceVariant }]}>{item.committee}</Text>
                </View>
            </View>

            <View style={styles.statsContainer}>
                <View style={styles.participationWrapper}>
                    <Text style={[styles.statLabel, { color: theme.onSurfaceVariant }]}>المشاركة</Text>
                    <View style={[styles.progressBar, { backgroundColor: theme.surfaceVariant }]}>
                        <View
                            style={[
                                styles.progressFill,
                                { width: `${item.participation}%`, backgroundColor: theme.primary }
                            ]}
                        />
                    </View>
                    <Text style={[styles.statValue, { color: theme.primary }]}>{item.participation}%</Text>
                </View>

                <View style={styles.actions}>
                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.secondaryContainer }]}>
                        <Ionicons name="create-outline" size={20} color={theme.onSecondaryContainer} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: theme.errorContainer }]}
                        onPress={() => handleDelete(item.name)}
                    >
                        <Ionicons name="trash-outline" size={20} color={theme.onErrorContainer} />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: theme.onSurface }]}>أعضاء اللجنة</Text>
                <TouchableOpacity style={[styles.addButton, { backgroundColor: theme.primaryContainer }]}>
                    <Ionicons name="add" size={24} color={theme.onPrimaryContainer} />
                    <Text style={[styles.addButtonText, { color: theme.onPrimaryContainer }]}>إضافة عضو</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={MEMBERS_DATA}
                renderItem={renderMember}
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
        fontSize: 24,
        fontWeight: '700',
        textAlign: 'right',
    },
    addButton: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 16,
        gap: 8,
    },
    addButtonText: {
        fontWeight: '600',
        fontSize: 14,
    },
    listContent: {
        padding: 24,
        gap: 16,
        paddingBottom: 100,
    },
    memberCard: {
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    memberInfo: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        marginBottom: 20,
    },
    avatar: {
        width: 64,
        height: 64,
        borderRadius: 32,
        marginLeft: 16,
    },
    textContainer: {
        flex: 1,
    },
    memberName: {
        fontSize: 18,
        fontWeight: '700',
        textAlign: 'right',
    },
    memberRole: {
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'right',
        marginTop: 2,
    },
    memberCommittee: {
        fontSize: 13,
        textAlign: 'right',
        marginTop: 2,
    },
    statsContainer: {
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
        paddingTop: 16,
    },
    participationWrapper: {
        flex: 1,
        flexDirection: 'row-reverse',
        alignItems: 'center',
        gap: 12,
    },
    statLabel: {
        fontSize: 12,
    },
    progressBar: {
        flex: 1,
        height: 8,
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 4,
    },
    statValue: {
        fontSize: 13,
        fontWeight: '700',
        minWidth: 40,
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
    },
    actionBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
