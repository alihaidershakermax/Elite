import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const TASKS_DATA = [
    {
        id: '1',
        title: 'تصميم بوستر الفعالية',
        assignee: 'أحمد محمود',
        status: 'قيد التنفيذ',
        deadline: '20 مايو',
        priority: 'عالية',
    },
    {
        id: '2',
        title: 'حجز قاعة المؤتمرات',
        assignee: 'سارة خالد',
        status: 'مكتملة',
        deadline: '15 مايو',
        priority: 'متوسطة',
    },
    {
        id: '3',
        title: 'التواصل مع المتحدثين',
        assignee: 'محمد علي',
        status: 'لم تبدأ',
        deadline: '22 مايو',
        priority: 'عالية',
    },
];

const STATUS_FILTERS = ['الكل', 'قيد التنفيذ', 'مكتملة', 'لم تبدأ'];

export default function TasksScreen() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const [activeFilter, setActiveFilter] = useState('الكل');

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'مكتملة': return '#4CAF50';
            case 'قيد التنفيذ': return '#FF9800';
            case 'لم تبدأ': return '#9E9E9E';
            default: return theme.primary;
        }
    };

    const renderTask = ({ item }: { item: typeof TASKS_DATA[0] }) => (
        <View style={[styles.taskCard, { backgroundColor: theme.surfaceVariant }]}>
            <View style={styles.taskHeader}>
                <View style={[styles.priorityTag, { backgroundColor: item.priority === 'عالية' ? theme.errorContainer : theme.secondaryContainer }]}>
                    <Text style={[styles.priorityText, { color: item.priority === 'عالية' ? theme.onErrorContainer : theme.onSecondaryContainer }]}>{item.priority}</Text>
                </View>
                <Text style={[styles.taskTitle, { color: theme.onSurface }]}>{item.title}</Text>
            </View>

            <View style={styles.taskBody}>
                <View style={styles.infoRow}>
                    <Ionicons name="person-circle-outline" size={18} color={theme.primary} />
                    <Text style={[styles.infoText, { color: theme.onSurfaceVariant }]}>المسؤول: {item.assignee}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Ionicons name="calendar-outline" size={18} color={theme.primary} />
                    <Text style={[styles.infoText, { color: theme.onSurfaceVariant }]}>الموعد النهائى: {item.deadline}</Text>
                </View>
            </View>

            <View style={styles.taskFooter}>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                    <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
                    <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
                </View>
                <TouchableOpacity>
                    <Ionicons name="ellipsis-horizontal" size={20} color={theme.onSurfaceVariant} />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: theme.onSurface }]}>المهام والمسؤوليات</Text>
                <TouchableOpacity style={[styles.addButton, { backgroundColor: theme.primaryContainer }]}>
                    <Ionicons name="add" size={28} color={theme.onPrimaryContainer} />
                </TouchableOpacity>
            </View>

            <View style={styles.filterContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll} style={{ transform: [{ scaleX: -1 }] }}>
                    {STATUS_FILTERS.map((filter) => (
                        <TouchableOpacity
                            key={filter}
                            onPress={() => setActiveFilter(filter)}
                            style={[
                                styles.filterTab,
                                {
                                    backgroundColor: activeFilter === filter ? theme.primaryContainer : theme.surface,
                                    transform: [{ scaleX: -1 }]
                                }
                            ]}
                        >
                            <Text style={[
                                styles.filterText,
                                { color: activeFilter === filter ? theme.onPrimaryContainer : theme.onSurfaceVariant }
                            ]}>
                                {filter}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <FlatList
                data={TASKS_DATA}
                renderItem={renderTask}
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
        width: 56, // M3 FAB size
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    filterContainer: {
        marginBottom: 12,
    },
    filterScroll: {
        paddingHorizontal: 24,
        gap: 8,
    },
    filterTab: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 28, // M3 chips
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    filterText: {
        fontWeight: '600',
        fontSize: 14,
    },
    listContent: {
        padding: 24,
        gap: 16,
        paddingBottom: 100,
    },
    taskCard: {
        borderRadius: 24,
        padding: 20,
    },
    taskHeader: {
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    taskTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: '700',
        textAlign: 'right',
        marginLeft: 12,
    },
    priorityTag: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    priorityText: {
        fontSize: 11,
        fontWeight: '700',
    },
    taskBody: {
        gap: 12,
        marginBottom: 20,
    },
    infoRow: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        gap: 10,
    },
    infoText: {
        fontSize: 14,
    },
    taskFooter: {
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
        paddingTop: 16,
    },
    statusBadge: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        gap: 8,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '700',
    },
});
