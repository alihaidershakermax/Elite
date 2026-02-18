import { Colors, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { adminService, committeeService } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, Platform, RefreshControl, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CommitteesScreen() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const [committees, setCommittees] = useState<any[]>([]);
    const [members, setMembers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showMembersModal, setShowMembersModal] = useState(false);
    const [selectedCommittee, setSelectedCommittee] = useState<any>(null);
    const [newCommitteeName, setNewCommitteeName] = useState('');
    const [newCommitteeDescription, setNewCommitteeDescription] = useState('');

    useEffect(() => {
        checkAdminAndFetch();
    }, []);

    const checkAdminAndFetch = async () => {
        const userData = await AsyncStorage.getItem('userData');
        if (userData) {
            const parsed = JSON.parse(userData);
            if (parsed.role === 'admin') {
                setIsAdmin(true);
                fetchData();
            } else {
                Alert.alert('غير مصرح', 'يجب أن تكون مديراً للوصول لهذه الصفحة', [
                    { text: 'حسناً', onPress: () => router.back() }
                ]);
            }
        } else {
            router.replace('/login');
        }
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            const [committeesRes, membersRes] = await Promise.all([
                committeeService.getAll(),
                adminService.getAllMembers()
            ]);
            setCommittees(committeesRes.data || []);
            setMembers(membersRes.data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    const handleCreateCommittee = async () => {
        if (!newCommitteeName.trim()) {
            Alert.alert('خطأ', 'يرجى إدخال اسم اللجنة');
            return;
        }

        try {
            await committeeService.create({
                name: newCommitteeName,
                description: newCommitteeDescription,
            });
            Alert.alert('نجاح', 'تم إنشاء اللجنة بنجاح');
            setShowAddModal(false);
            setNewCommitteeName('');
            setNewCommitteeDescription('');
            fetchData();
        } catch (error) {
            Alert.alert('خطأ', 'فشل في إنشاء اللجنة');
        }
    };

    const handleDeleteCommittee = (committee: any) => {
        Alert.alert(
            'حذف اللجنة',
            `هل أنت متأكد من حذف لجنة ${committee.name}؟`,
            [
                { text: 'إلغاء', style: 'cancel' },
                {
                    text: 'حذف',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await committeeService.delete(committee.id);
                            Alert.alert('نجاح', 'تم حذف اللجنة');
                            fetchData();
                        } catch (error) {
                            Alert.alert('خطأ', 'فشل في حذف اللجنة');
                        }
                    }
                }
            ]
        );
    };

    const handleAddMember = async (memberId: string) => {
        if (!selectedCommittee) return;

        try {
            await committeeService.addMember(selectedCommittee.id, memberId);
            Alert.alert('نجاح', 'تم إضافة العضو للجنة');
            fetchData();
        } catch (error) {
            Alert.alert('خطأ', 'فشل في إضافة العضو');
        }
    };

    const handleRemoveMember = async (memberId: string) => {
        if (!selectedCommittee) return;

        Alert.alert(
            'إزالة العضو',
            'هل تريد إزالة هذا العضو من اللجنة؟',
            [
                { text: 'إلغاء', style: 'cancel' },
                {
                    text: 'إزالة',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await committeeService.removeMember(selectedCommittee.id, memberId);
                            Alert.alert('نجاح', 'تم إزالة العضو من اللجنة');
                            fetchData();
                        } catch (error) {
                            Alert.alert('خطأ', 'فشل في إزالة العضو');
                        }
                    }
                }
            ]
        );
    };

    const renderCommittee = ({ item }: { item: any }) => {
        const memberCount = item.members?.length || 0;

        return (
            <TouchableOpacity
                style={[styles.committeeCard, { backgroundColor: theme.surface }]}
                onPress={() => {
                    setSelectedCommittee(item);
                    setShowMembersModal(true);
                }}
                activeOpacity={0.7}
            >
                <View style={styles.committeeHeader}>
                    <View style={styles.committeeInfo}>
                        <Text style={[styles.committeeName, { color: theme.onSurface, fontFamily: Typography.bold }]}>
                            {item.name}
                        </Text>
                        {item.description && (
                            <Text style={[styles.committeeDescription, { color: theme.onSurfaceVariant, fontFamily: Typography.regular }]} numberOfLines={2}>
                                {item.description}
                            </Text>
                        )}
                        <View style={styles.committeeMeta}>
                            <View style={[styles.memberCount, { backgroundColor: theme.primaryContainer }]}>
                                <Ionicons name="people" size={14} color={theme.onPrimaryContainer} />
                                <Text style={[styles.memberCountText, { color: theme.onPrimaryContainer, fontFamily: Typography.bold }]}>
                                    {memberCount} عضو
                                </Text>
                            </View>
                        </View>
                    </View>
                    <TouchableOpacity
                        style={[styles.deleteButton, { backgroundColor: theme.errorContainer }]}
                        onPress={() => handleDeleteCommittee(item)}
                    >
                        <Ionicons name="trash" size={18} color={theme.onErrorContainer} />
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        );
    };

    const renderMemberInModal = ({ item }: { item: any }) => {
        const isInCommittee = selectedCommittee?.members?.includes(item.uid);

        return (
            <TouchableOpacity
                style={[styles.memberModalCard, { backgroundColor: theme.surface }]}
                onPress={() => isInCommittee ? handleRemoveMember(item.uid) : handleAddMember(item.uid)}
                activeOpacity={0.7}
            >
                <View style={[styles.memberStatus, { backgroundColor: isInCommittee ? '#34C759' : theme.surfaceVariant }]}>
                    <Ionicons name={isInCommittee ? 'checkmark' : 'add'} size={16} color={isInCommittee ? '#FFF' : theme.onSurfaceVariant} />
                </View>
                <View style={styles.memberModalInfo}>
                    <Text style={[styles.memberModalName, { color: theme.onSurface, fontFamily: Typography.bold }]}>
                        {item.name || 'مستخدم'}
                    </Text>
                    <Text style={[styles.memberModalEmail, { color: theme.onSurfaceVariant, fontFamily: Typography.regular }]}>
                        {item.email}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    if (loading && !refreshing) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="chevron-forward" size={28} color={theme.primary} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: theme.onSurface, fontFamily: Typography.bold }]}>
                        إدارة اللجان
                    </Text>
                    <View style={{ width: 28 }} />
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.primary} />
                </View>
            </SafeAreaView>
        );
    }

    if (!isAdmin) return null;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="chevron-forward" size={28} color={theme.primary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.onSurface, fontFamily: Typography.bold }]}>
                    إدارة اللجان
                </Text>
                <TouchableOpacity onPress={() => setShowAddModal(true)} style={styles.addButton}>
                    <Ionicons name="add" size={28} color={theme.primary} />
                </TouchableOpacity>
            </View>

            <FlatList
                data={committees}
                renderItem={renderCommittee}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="people-outline" size={64} color={theme.onSurfaceVariant} style={{ opacity: 0.3 }} />
                        <Text style={[styles.emptyText, { color: theme.onSurfaceVariant, fontFamily: Typography.bold }]}>
                            لا توجد لجان
                        </Text>
                        <Text style={[styles.emptySubtext, { color: theme.onSurfaceVariant, fontFamily: Typography.regular }]}>
                            اضغط + لإنشاء لجنة جديدة
                        </Text>
                    </View>
                }
            />

            {/* Add Committee Modal */}
            <Modal visible={showAddModal} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
                        <View style={styles.modalHeader}>
                            <TouchableOpacity onPress={() => setShowAddModal(false)}>
                                <Text style={[styles.modalCancel, { color: theme.primary, fontFamily: Typography.regular }]}>
                                    إلغاء
                                </Text>
                            </TouchableOpacity>
                            <Text style={[styles.modalTitle, { color: theme.onSurface, fontFamily: Typography.bold }]}>
                                لجنة جديدة
                            </Text>
                            <TouchableOpacity onPress={handleCreateCommittee}>
                                <Text style={[styles.modalSave, { color: theme.primary, fontFamily: Typography.bold }]}>
                                    حفظ
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalBody}>
                            <View style={[styles.inputGroup, { backgroundColor: theme.background }]}>
                                <TextInput
                                    style={[styles.input, { color: theme.onSurface, fontFamily: Typography.regular }]}
                                    value={newCommitteeName}
                                    onChangeText={setNewCommitteeName}
                                    placeholder="اسم اللجنة"
                                    placeholderTextColor={theme.onSurfaceVariant}
                                    textAlign="right"
                                />
                            </View>

                            <View style={[styles.inputGroup, { backgroundColor: theme.background }]}>
                                <TextInput
                                    style={[styles.input, styles.textArea, { color: theme.onSurface, fontFamily: Typography.regular }]}
                                    value={newCommitteeDescription}
                                    onChangeText={setNewCommitteeDescription}
                                    placeholder="الوصف (اختياري)"
                                    placeholderTextColor={theme.onSurfaceVariant}
                                    textAlign="right"
                                    multiline
                                    numberOfLines={4}
                                />
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Members Modal */}
            <Modal visible={showMembersModal} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
                        <View style={styles.modalHeader}>
                            <TouchableOpacity onPress={() => setShowMembersModal(false)}>
                                <Text style={[styles.modalCancel, { color: theme.primary, fontFamily: Typography.regular }]}>
                                    إغلاق
                                </Text>
                            </TouchableOpacity>
                            <Text style={[styles.modalTitle, { color: theme.onSurface, fontFamily: Typography.bold }]}>
                                {selectedCommittee?.name}
                            </Text>
                            <View style={{ width: 50 }} />
                        </View>

                        <FlatList
                            data={members}
                            renderItem={renderMemberInModal}
                            keyExtractor={(item) => item.uid}
                            contentContainerStyle={styles.modalList}
                            showsVerticalScrollIndicator={false}
                        />
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    backButton: { padding: 4 },
    addButton: { padding: 4 },
    headerTitle: { fontSize: 17, letterSpacing: -0.4 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listContent: { padding: 16, gap: 12, paddingBottom: 100 },
    committeeCard: {
        borderRadius: 10,
        padding: 16,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 3,
            },
            android: { elevation: 2 },
        }),
    },
    committeeHeader: {
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    committeeInfo: { flex: 1, marginLeft: 12 },
    committeeName: { fontSize: 17, letterSpacing: -0.4, marginBottom: 6 },
    committeeDescription: { fontSize: 15, opacity: 0.7, marginBottom: 10, lineHeight: 20 },
    committeeMeta: { flexDirection: 'row-reverse', gap: 8 },
    memberCount: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
        gap: 4,
    },
    memberCountText: { fontSize: 13 },
    deleteButton: {
        width: 36,
        height: 36,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80,
    },
    emptyText: { fontSize: 20, marginTop: 16, marginBottom: 8 },
    emptySubtext: { fontSize: 15, opacity: 0.6 },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    modalTitle: { fontSize: 17, letterSpacing: -0.4 },
    modalCancel: { fontSize: 17 },
    modalSave: { fontSize: 17 },
    modalBody: { padding: 16, gap: 12 },
    inputGroup: {
        borderRadius: 10,
        overflow: 'hidden',
    },
    input: {
        padding: 16,
        fontSize: 17,
        letterSpacing: -0.4,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    modalList: { padding: 16, gap: 8 },
    memberModalCard: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        padding: 12,
        borderRadius: 10,
        gap: 12,
    },
    memberStatus: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    memberModalInfo: { flex: 1, alignItems: 'flex-end' },
    memberModalName: { fontSize: 17, letterSpacing: -0.4, marginBottom: 2 },
    memberModalEmail: { fontSize: 15, opacity: 0.7 },
});
