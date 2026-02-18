import { Colors, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { taskService } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TasksScreen() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const [tasks, setTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useFocusEffect(
        useCallback(() => {
            fetchTasks();
        }, [])
    );

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const response = await taskService.getAll();
            setTasks(response.data || []);
        } catch (e) {
            console.log(e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchTasks();
    };

    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'completed':
            case 'مكتملة': return { color: '#34C759', icon: 'checkmark-circle', text: 'مكتملة' };
            case 'pending':
            case 'قيد التنفيذ': return { color: '#FF9500', icon: 'time', text: 'قيد التنفيذ' };
            default: return { color: theme.primary, icon: 'flash', text: 'مهمة جديدة' };
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high':
            case 'عالية': return '#FF3B30';
            case 'medium':
            case 'متوسطة': return '#FF9500';
            default: return '#34C759';
        }
    };

    const renderTask = ({ item }: { item: any }) => {
        const status = getStatusInfo(item.status);
        const priorityColor = getPriorityColor(item.priority);

        return (
            <TouchableOpacity
                style={[styles.taskCard, { backgroundColor: theme.surface }]}
                activeOpacity={0.8}
            >
                <View style={styles.cardIndicator}>
                    <View style={[styles.priorityBar, { backgroundColor: priorityColor }]} />
                </View>

                <View style={styles.taskContent}>
                    <View style={styles.taskHeader}>
                        <View style={[styles.statusBadge, { backgroundColor: status.color + '10' }]}>
                            <Ionicons name={status.icon as any} size={12} color={status.color} />
                            <Text style={[styles.statusText, { color: status.color, fontFamily: Typography.bold }]}>
                                {status.text}
                            </Text>
                        </View>
                        <Text style={[styles.dateText, { color: theme.onSurfaceVariant, fontFamily: Typography.regular }]}>
                            {item.deadline || 'اليوم'}
                        </Text>
                    </View>

                    <Text style={[styles.taskTitle, { color: theme.onSurface, fontFamily: Typography.bold }]} numberOfLines={2}>
                        {item.title}
                    </Text>

                    {item.description && (
                        <Text style={[styles.taskDescription, { color: theme.onSurfaceVariant, fontFamily: Typography.regular }]} numberOfLines={2}>
                            {item.description}
                        </Text>
                    )}

                    <View style={styles.taskFooter}>
                        <View style={styles.assigneeList}>
                            <View style={[styles.assigneeCircle, { backgroundColor: theme.primary + '20' }]}>
                                <Ionicons name="person" size={12} color={theme.primary} />
                            </View>
                            <Text style={[styles.assigneeText, { color: theme.onSurfaceVariant, fontFamily: Typography.regular }]}>
                                مكلف لـ: أنت
                            </Text>
                        </View>
                        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.surfaceVariant }]}>
                            <Ionicons name="chevron-back" size={16} color={theme.onSurface} />
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <View style={[styles.emptyIconBox, { backgroundColor: theme.primary + '10' }]}>
                <Ionicons name="document-text-outline" size={50} color={theme.primary} />
            </View>
            <Text style={[styles.emptyText, { color: theme.onSurface, fontFamily: Typography.bold }]}>
                قائمة المهام فارغة
            </Text>
            <Text style={[styles.emptySubtext, { color: theme.onSurfaceVariant, fontFamily: Typography.regular }]}>
                أنجزت جميع مهامك؟ عمل رائع! سيتم إخطارك عند تكليفك بمهام جديدة.
            </Text>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
            <View style={styles.header}>
                <View style={[styles.statBadge, { backgroundColor: theme.primaryContainer }]}>
                    <Text style={[styles.statText, { color: theme.onPrimaryContainer, fontFamily: Typography.bold }]}>
                        {tasks.length} مهام
                    </Text>
                </View>
                <Text style={[styles.headerTitle, { color: theme.onSurface, fontFamily: Typography.bold }]}>المهام</Text>
            </View>

            <FlatList
                data={tasks}
                renderItem={renderTask}
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
        paddingHorizontal: 24,
        paddingTop: 10,
        paddingBottom: 20,
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 34,
        letterSpacing: -0.5,
    },
    statBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    statText: {
        fontSize: 12,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 100,
        gap: 16,
    },
    taskCard: {
        borderRadius: 24,
        flexDirection: 'row-reverse',
        overflow: 'hidden',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
    cardIndicator: {
        width: 6,
    },
    priorityBar: {
        flex: 1,
    },
    taskContent: {
        flex: 1,
        padding: 20,
        alignItems: 'flex-end',
    },
    taskHeader: {
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        marginBottom: 12,
    },
    statusBadge: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        gap: 6,
    },
    statusText: {
        fontSize: 11,
    },
    dateText: {
        fontSize: 11,
        opacity: 0.5,
    },
    taskTitle: {
        fontSize: 18,
        lineHeight: 24,
        marginBottom: 6,
        textAlign: 'right',
    },
    taskDescription: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 18,
        textAlign: 'right',
        opacity: 0.7,
    },
    taskFooter: {
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        marginTop: 'auto',
    },
    assigneeList: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        gap: 8,
    },
    assigneeCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#fff',
    },
    assigneeText: {
        fontSize: 12,
        opacity: 0.6,
    },
    actionBtn: {
        width: 32,
        height: 32,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 100,
        paddingHorizontal: 40,
    },
    emptyIconBox: {
        width: 100,
        height: 100,
        borderRadius: 30,
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
