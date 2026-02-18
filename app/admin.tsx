import { Colors, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { activityService, adminService, announcementService, taskService } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Modal,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Tab = 'members' | 'activities' | 'tasks' | 'announcements';

export default function AdminPanelScreen() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    const [activeTab, setActiveTab] = useState<Tab>('members');
    const [members, setMembers] = useState<any[]>([]);
    const [activities, setActivities] = useState<any[]>([]);
    const [tasks, setTasks] = useState<any[]>([]);
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Form state
    const [form, setForm] = useState<any>({});
    const [formImage, setFormImage] = useState<string | null>(null);

    useEffect(() => { checkAndLoad(); }, []);

    const checkAndLoad = async () => {
        const userData = await AsyncStorage.getItem('userData');
        if (!userData) { router.replace('/login'); return; }
        const parsed = JSON.parse(userData);
        if (parsed.role !== 'admin') {
            Alert.alert('غير مصرح', 'يجب أن تكون مديراً', [{ text: 'حسناً', onPress: () => router.back() }]);
            return;
        }
        setIsAdmin(true);
        fetchAll();
    };

    const fetchAll = async () => {
        try {
            setLoading(true);
            const [mRes, aRes, tRes, annRes] = await Promise.all([
                adminService.getAllMembers().catch(() => ({ data: [] })),
                activityService.getAll().catch(() => ({ data: [] })),
                taskService.getAll().catch(() => ({ data: [] })),
                announcementService.getAll().catch(() => ({ data: [] })),
            ]);
            setMembers(mRes.data || []);
            setActivities(aRes.data || []);
            setTasks(tRes.data || []);
            setAnnouncements(annRes.data || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // ── Member Actions ──────────────────────────────────────────────────────
    const handleRoleChange = (member: any) => {
        const newRole = member.role === 'admin' ? 'member' : 'admin';
        Alert.alert('تغيير الصلاحية', `تغيير صلاحية ${member.name} إلى ${newRole === 'admin' ? 'مدير' : 'عضو'}؟`, [
            { text: 'إلغاء', style: 'cancel' },
            {
                text: 'تأكيد', onPress: async () => {
                    try {
                        await adminService.updateMemberRole(member.uid, newRole);
                        fetchAll();
                    } catch { Alert.alert('خطأ', 'فشل في تغيير الصلاحية'); }
                }
            }
        ]);
    };

    const handleDeleteMember = (member: any) => {
        Alert.alert('حذف العضو', `هل تريد حذف ${member.name}؟`, [
            { text: 'إلغاء', style: 'cancel' },
            {
                text: 'حذف', style: 'destructive', onPress: async () => {
                    try {
                        await adminService.deleteMember(member.uid);
                        fetchAll();
                    } catch { Alert.alert('خطأ', 'فشل في حذف العضو'); }
                }
            }
        ]);
    };

    // ── Publish Actions ─────────────────────────────────────────────────────
    const openModal = () => { setForm({}); setFormImage(null); setShowModal(true); };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [16, 9],
            quality: 0.8,
        });
        if (!result.canceled) setFormImage(result.assets[0].uri);
    };

    const handlePublish = async () => {
        if (!form.title?.trim()) { Alert.alert('تنبيه', 'العنوان مطلوب'); return; }
        setSubmitting(true);
        try {
            const payload = { ...form, image: formImage };
            if (activeTab === 'activities') await activityService.create(payload);
            else if (activeTab === 'tasks') await taskService.create(payload);
            else if (activeTab === 'announcements') await announcementService.create(payload);
            setShowModal(false);
            fetchAll();
            Alert.alert('✅ تم النشر', 'تم نشر المحتوى بنجاح');
        } catch {
            Alert.alert('خطأ', 'فشل في النشر');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteItem = (id: string, service: any, name: string) => {
        Alert.alert('حذف', `حذف "${name}"؟`, [
            { text: 'إلغاء', style: 'cancel' },
            { text: 'حذف', style: 'destructive', onPress: async () => { await service.delete(id).catch(() => { }); fetchAll(); } }
        ]);
    };

    const TABS: { key: Tab; label: string; icon: string; count: number }[] = [
        { key: 'members', label: 'الأعضاء', icon: 'people', count: members.length },
        { key: 'activities', label: 'الفعاليات', icon: 'calendar', count: activities.length },
        { key: 'tasks', label: 'المهام', icon: 'list-circle', count: tasks.length },
        { key: 'announcements', label: 'الإعلانات', icon: 'megaphone', count: announcements.length },
    ];

    if (!isAdmin && !loading) return null;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
            {/* Header */}
            <LinearGradient colors={[theme.primary, theme.secondary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="chevron-forward" size={24} color="#fff" />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={[styles.headerTitle, { fontFamily: Typography.bold }]}>لوحة الإدارة</Text>
                    <Text style={styles.headerSub}>نظام النخبة</Text>
                </View>
                <View style={styles.adminBadge}>
                    <Ionicons name="shield-checkmark" size={22} color="#fff" />
                </View>
            </LinearGradient>

            {/* Tab Bar */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}
                style={[styles.tabBar, { backgroundColor: theme.surface }]}
                contentContainerStyle={styles.tabBarContent}>
                {TABS.map((tab) => (
                    <TouchableOpacity
                        key={tab.key}
                        style={[styles.tab, activeTab === tab.key && { backgroundColor: theme.primary + '18' }]}
                        onPress={() => setActiveTab(tab.key)}
                    >
                        <Ionicons name={tab.icon as any} size={17} color={activeTab === tab.key ? theme.primary : theme.onSurfaceVariant} />
                        <Text style={[styles.tabLabel, { color: activeTab === tab.key ? theme.primary : theme.onSurfaceVariant, fontFamily: Typography.bold }]}>
                            {tab.label}
                        </Text>
                        <View style={[styles.tabCount, { backgroundColor: activeTab === tab.key ? theme.primary : theme.surfaceVariant }]}>
                            <Text style={[styles.tabCountText, { color: activeTab === tab.key ? '#fff' : theme.onSurfaceVariant }]}>{tab.count}</Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Content */}
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={styles.content}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchAll(); }} tintColor={theme.primary} />}
            >
                {loading ? (
                    <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 60 }} />
                ) : (
                    <>
                        {/* ── MEMBERS ── */}
                        {activeTab === 'members' && (
                            members.length === 0 ? (
                                <View style={styles.emptyBox}>
                                    <Ionicons name="people-outline" size={50} color={theme.onSurfaceVariant} style={{ opacity: 0.3 }} />
                                    <Text style={[styles.emptyText, { color: theme.onSurfaceVariant }]}>لا يوجد أعضاء</Text>
                                </View>
                            ) : members.map((m: any) => (
                                <View key={m.uid || m._id} style={[styles.card, { backgroundColor: theme.surface }]}>
                                    <View style={styles.cardActions}>
                                        <TouchableOpacity onPress={() => handleDeleteMember(m)} style={[styles.actionBtn, { backgroundColor: '#FF3B3015' }]}>
                                            <Ionicons name="trash" size={15} color="#FF3B30" />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => handleRoleChange(m)} style={[styles.actionBtn, { backgroundColor: m.role === 'admin' ? '#FF950015' : theme.primary + '15' }]}>
                                            <Ionicons name={m.role === 'admin' ? 'arrow-down' : 'arrow-up'} size={15} color={m.role === 'admin' ? '#FF9500' : theme.primary} />
                                        </TouchableOpacity>
                                    </View>
                                    <View style={styles.memberInfo}>
                                        <Text style={[styles.memberName, { color: theme.onSurface, fontFamily: Typography.bold }]}>{m.name}</Text>
                                        <Text style={[styles.memberEmail, { color: theme.onSurfaceVariant }]}>{m.email}</Text>
                                    </View>
                                    <View style={styles.memberAvatarWrap}>
                                        {m.photoURL ? (
                                            <Image source={{ uri: m.photoURL }} style={styles.memberAvatar} />
                                        ) : (
                                            <View style={[styles.memberAvatarPlaceholder, { backgroundColor: theme.primary + '20' }]}>
                                                <Text style={{ color: theme.primary, fontWeight: 'bold', fontSize: 18 }}>{m.name?.[0]}</Text>
                                            </View>
                                        )}
                                        <View style={[styles.roleBadge, { backgroundColor: m.role === 'admin' ? '#FF9500' : theme.primary }]}>
                                            <Text style={styles.roleBadgeText}>{m.role === 'admin' ? 'مدير' : 'عضو'}</Text>
                                        </View>
                                    </View>
                                </View>
                            ))
                        )}

                        {/* ── ACTIVITIES ── */}
                        {activeTab === 'activities' && (
                            <>
                                <TouchableOpacity style={[styles.publishBtn, { backgroundColor: theme.primary }]} onPress={openModal}>
                                    <Ionicons name="add-circle" size={20} color="#fff" />
                                    <Text style={[styles.publishBtnText, { fontFamily: Typography.bold }]}>نشر فعالية جديدة</Text>
                                </TouchableOpacity>
                                {activities.map((item: any) => (
                                    <View key={item._id} style={[styles.card, { backgroundColor: theme.surface }]}>
                                        <TouchableOpacity onPress={() => handleDeleteItem(item._id, activityService, item.title)} style={[styles.actionBtn, { backgroundColor: '#FF3B3015' }]}>
                                            <Ionicons name="trash" size={15} color="#FF3B30" />
                                        </TouchableOpacity>
                                        {item.image ? <Image source={{ uri: item.image }} style={styles.itemThumb} /> : (
                                            <View style={[styles.itemThumb, { backgroundColor: theme.primary + '15', justifyContent: 'center', alignItems: 'center' }]}>
                                                <Ionicons name="calendar" size={22} color={theme.primary} />
                                            </View>
                                        )}
                                        <View style={styles.itemInfo}>
                                            <Text style={[styles.itemTitle, { color: theme.onSurface, fontFamily: Typography.bold }]} numberOfLines={1}>{item.title}</Text>
                                            <Text style={[styles.itemMeta, { color: theme.onSurfaceVariant }]}>{item.date || 'غير محدد'}</Text>
                                        </View>
                                    </View>
                                ))}
                            </>
                        )}

                        {/* ── TASKS ── */}
                        {activeTab === 'tasks' && (
                            <>
                                <TouchableOpacity style={[styles.publishBtn, { backgroundColor: '#34C759' }]} onPress={openModal}>
                                    <Ionicons name="add-circle" size={20} color="#fff" />
                                    <Text style={[styles.publishBtnText, { fontFamily: Typography.bold }]}>إضافة مهمة جديدة</Text>
                                </TouchableOpacity>
                                {tasks.map((item: any) => (
                                    <View key={item._id} style={[styles.card, { backgroundColor: theme.surface }]}>
                                        <TouchableOpacity onPress={() => handleDeleteItem(item._id, taskService, item.title)} style={[styles.actionBtn, { backgroundColor: '#FF3B3015' }]}>
                                            <Ionicons name="trash" size={15} color="#FF3B30" />
                                        </TouchableOpacity>
                                        <View style={[styles.priorityDot, { backgroundColor: item.priority === 'عالية' ? '#FF3B30' : item.priority === 'متوسطة' ? '#FF9500' : '#34C759' }]} />
                                        <View style={styles.itemInfo}>
                                            <Text style={[styles.itemTitle, { color: theme.onSurface, fontFamily: Typography.bold }]} numberOfLines={1}>{item.title}</Text>
                                            <Text style={[styles.itemMeta, { color: theme.onSurfaceVariant }]}>{item.status} • {item.priority}</Text>
                                        </View>
                                    </View>
                                ))}
                            </>
                        )}

                        {/* ── ANNOUNCEMENTS ── */}
                        {activeTab === 'announcements' && (
                            <>
                                <TouchableOpacity style={[styles.publishBtn, { backgroundColor: '#007AFF' }]} onPress={openModal}>
                                    <Ionicons name="add-circle" size={20} color="#fff" />
                                    <Text style={[styles.publishBtnText, { fontFamily: Typography.bold }]}>نشر إعلان جديد</Text>
                                </TouchableOpacity>
                                {announcements.map((item: any) => (
                                    <View key={item._id} style={[styles.card, { backgroundColor: theme.surface }]}>
                                        <TouchableOpacity onPress={() => handleDeleteItem(item._id, announcementService, item.title)} style={[styles.actionBtn, { backgroundColor: '#FF3B3015' }]}>
                                            <Ionicons name="trash" size={15} color="#FF3B30" />
                                        </TouchableOpacity>
                                        <View style={[styles.annDot, { backgroundColor: '#007AFF' }]} />
                                        <View style={styles.itemInfo}>
                                            <Text style={[styles.itemTitle, { color: theme.onSurface, fontFamily: Typography.bold }]} numberOfLines={1}>{item.title}</Text>
                                            <Text style={[styles.itemMeta, { color: theme.onSurfaceVariant }]} numberOfLines={1}>{item.description}</Text>
                                        </View>
                                    </View>
                                ))}
                            </>
                        )}
                    </>
                )}
                <View style={{ height: 100 }} />
            </ScrollView>

            {/* ── PUBLISH MODAL ── */}
            <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowModal(false)}>
                <SafeAreaView style={[styles.modal, { backgroundColor: theme.background }]} edges={['top']}>
                    <View style={[styles.modalHeader, { borderBottomColor: theme.surfaceVariant }]}>
                        <TouchableOpacity onPress={handlePublish} disabled={submitting}>
                            {submitting ? <ActivityIndicator color={theme.primary} /> : (
                                <Text style={[styles.modalPublish, { color: theme.primary, fontFamily: Typography.bold }]}>نشر</Text>
                            )}
                        </TouchableOpacity>
                        <Text style={[styles.modalTitle, { color: theme.onSurface, fontFamily: Typography.bold }]}>
                            {activeTab === 'activities' ? 'فعالية جديدة' : activeTab === 'tasks' ? 'مهمة جديدة' : 'إعلان جديد'}
                        </Text>
                        <TouchableOpacity onPress={() => setShowModal(false)}>
                            <Ionicons name="close" size={24} color={theme.onSurface} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
                        {/* Image Picker */}
                        {activeTab === 'activities' && (
                            <TouchableOpacity style={[styles.imagePicker, { backgroundColor: theme.surface, borderColor: theme.surfaceVariant }]} onPress={pickImage}>
                                {formImage ? (
                                    <Image source={{ uri: formImage }} style={styles.pickedImage} />
                                ) : (
                                    <>
                                        <Ionicons name="image-outline" size={36} color={theme.onSurfaceVariant} />
                                        <Text style={[styles.imagePickerText, { color: theme.onSurfaceVariant }]}>اضغط لإضافة صورة</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        )}

                        <TextInput
                            style={[styles.input, { backgroundColor: theme.surface, color: theme.onSurface, borderColor: theme.surfaceVariant, fontFamily: Typography.bold }]}
                            placeholder="العنوان *"
                            placeholderTextColor={theme.onSurfaceVariant}
                            value={form.title || ''}
                            onChangeText={(v) => setForm({ ...form, title: v })}
                            textAlign="right"
                        />

                        <TextInput
                            style={[styles.input, styles.inputMulti, { backgroundColor: theme.surface, color: theme.onSurface, borderColor: theme.surfaceVariant, fontFamily: Typography.regular }]}
                            placeholder="الوصف أو التفاصيل"
                            placeholderTextColor={theme.onSurfaceVariant}
                            value={form.description || ''}
                            onChangeText={(v) => setForm({ ...form, description: v })}
                            multiline
                            numberOfLines={4}
                            textAlign="right"
                            textAlignVertical="top"
                        />

                        {activeTab === 'activities' && (
                            <>
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.surface, color: theme.onSurface, borderColor: theme.surfaceVariant, fontFamily: Typography.regular }]}
                                    placeholder="التاريخ (مثال: 20 مارس 2025)"
                                    placeholderTextColor={theme.onSurfaceVariant}
                                    value={form.date || ''}
                                    onChangeText={(v) => setForm({ ...form, date: v })}
                                    textAlign="right"
                                />
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.surface, color: theme.onSurface, borderColor: theme.surfaceVariant, fontFamily: Typography.regular }]}
                                    placeholder="الموقع"
                                    placeholderTextColor={theme.onSurfaceVariant}
                                    value={form.location || ''}
                                    onChangeText={(v) => setForm({ ...form, location: v })}
                                    textAlign="right"
                                />
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.surface, color: theme.onSurface, borderColor: theme.surfaceVariant, fontFamily: Typography.regular }]}
                                    placeholder="الحد الأقصى للمشتركين (اختياري)"
                                    placeholderTextColor={theme.onSurfaceVariant}
                                    value={form.maxAttendees?.toString() || ''}
                                    onChangeText={(v) => setForm({ ...form, maxAttendees: parseInt(v) || undefined })}
                                    textAlign="right"
                                    keyboardType="numeric"
                                />
                            </>
                        )}

                        {activeTab === 'tasks' && (
                            <>
                                <Text style={[styles.fieldLabel, { color: theme.onSurfaceVariant, fontFamily: Typography.bold }]}>الأولوية</Text>
                                <View style={styles.priorityRow}>
                                    {['عالية', 'متوسطة', 'منخفضة'].map((p) => (
                                        <TouchableOpacity
                                            key={p}
                                            style={[styles.priorityOption, { backgroundColor: form.priority === p ? theme.primary : theme.surface, borderColor: theme.surfaceVariant }]}
                                            onPress={() => setForm({ ...form, priority: p })}
                                        >
                                            <Text style={{ color: form.priority === p ? '#fff' : theme.onSurface, fontFamily: Typography.bold, fontSize: 13 }}>{p}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.surface, color: theme.onSurface, borderColor: theme.surfaceVariant, fontFamily: Typography.regular }]}
                                    placeholder="الموعد النهائي"
                                    placeholderTextColor={theme.onSurfaceVariant}
                                    value={form.deadline || ''}
                                    onChangeText={(v) => setForm({ ...form, deadline: v })}
                                    textAlign="right"
                                />
                            </>
                        )}

                        {activeTab === 'announcements' && (
                            <View style={styles.toggleRow}>
                                <TouchableOpacity
                                    style={[styles.toggleBtn, { backgroundColor: form.important ? '#FF3B30' : theme.surface, borderColor: theme.surfaceVariant }]}
                                    onPress={() => setForm({ ...form, important: !form.important })}
                                >
                                    <Ionicons name="alert-circle" size={16} color={form.important ? '#fff' : theme.onSurfaceVariant} />
                                    <Text style={{ color: form.important ? '#fff' : theme.onSurface, fontFamily: Typography.bold, fontSize: 13 }}>إعلان هام</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </ScrollView>
                </SafeAreaView>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row-reverse', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, gap: 12 },
    backBtn: { padding: 4 },
    headerCenter: { flex: 1, alignItems: 'center' },
    headerTitle: { color: '#fff', fontSize: 20 },
    headerSub: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 2 },
    adminBadge: { padding: 4 },

    tabBar: { maxHeight: 58 },
    tabBarContent: { paddingHorizontal: 16, gap: 8, alignItems: 'center', flexDirection: 'row-reverse' },
    tab: { flexDirection: 'row-reverse', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, gap: 6 },
    tabLabel: { fontSize: 13 },
    tabCount: { minWidth: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 4 },
    tabCountText: { fontSize: 10, fontWeight: 'bold' },

    content: { padding: 16, gap: 12 },
    publishBtn: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', padding: 14, borderRadius: 20, gap: 8, marginBottom: 4 },
    publishBtnText: { color: '#fff', fontSize: 15 },

    card: {
        flexDirection: 'row-reverse', alignItems: 'center', padding: 14, borderRadius: 22, gap: 12,
        elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8,
    },
    cardActions: { flexDirection: 'column', gap: 8 },
    actionBtn: { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    memberAvatarWrap: { position: 'relative' },
    memberAvatar: { width: 56, height: 56, borderRadius: 18 },
    memberAvatarPlaceholder: { width: 56, height: 56, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
    roleBadge: { position: 'absolute', bottom: -4, right: -4, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
    roleBadgeText: { color: '#fff', fontSize: 9, fontWeight: 'bold' },
    memberInfo: { flex: 1, alignItems: 'flex-end' },
    memberName: { fontSize: 16, marginBottom: 3 },
    memberEmail: { fontSize: 12, opacity: 0.6 },

    itemThumb: { width: 54, height: 54, borderRadius: 14 },
    itemInfo: { flex: 1, alignItems: 'flex-end' },
    itemTitle: { fontSize: 15, marginBottom: 3 },
    itemMeta: { fontSize: 11, opacity: 0.5 },
    priorityDot: { width: 10, height: 10, borderRadius: 5 },
    annDot: { width: 10, height: 10, borderRadius: 5 },

    emptyBox: { alignItems: 'center', paddingVertical: 60, gap: 12 },
    emptyText: { fontSize: 15, opacity: 0.5 },

    modal: { flex: 1 },
    modalHeader: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1 },
    modalTitle: { fontSize: 18 },
    modalPublish: { fontSize: 16 },
    modalContent: { padding: 20 },
    imagePicker: { height: 160, borderRadius: 20, borderWidth: 1.5, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', marginBottom: 16, overflow: 'hidden', gap: 8 },
    pickedImage: { width: '100%', height: '100%' },
    imagePickerText: { fontSize: 13 },
    input: { borderWidth: 1, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 13, fontSize: 15, marginBottom: 12 },
    inputMulti: { height: 110, paddingTop: 13 },
    fieldLabel: { fontSize: 13, marginBottom: 8, textAlign: 'right' },
    priorityRow: { flexDirection: 'row-reverse', gap: 10, marginBottom: 12 },
    priorityOption: { flex: 1, paddingVertical: 10, borderRadius: 14, alignItems: 'center', borderWidth: 1 },
    toggleRow: { flexDirection: 'row-reverse', marginBottom: 12 },
    toggleBtn: { flexDirection: 'row-reverse', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14, gap: 8, borderWidth: 1 },
});
