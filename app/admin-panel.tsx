import { Colors, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
    activityService,
    adminService,
    announcementService,
    storageService,
    taskService,
} from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
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

const { width } = Dimensions.get('window');

type Tab = 'members' | 'activities' | 'tasks' | 'announcements';
type ModalMode = 'create' | 'edit';

// ─── Swipeable Delete Row ────────────────────────────────────────────────────
function SwipeRow({ children, onDelete }: { children: React.ReactNode; onDelete: () => void }) {
    const translateX = useRef(new Animated.Value(0)).current;
    const [swiped, setSwiped] = useState(false);

    const toggle = () => {
        Animated.spring(translateX, {
            toValue: swiped ? 0 : -72,
            useNativeDriver: true,
            tension: 80,
            friction: 10,
        }).start();
        setSwiped(!swiped);
    };

    return (
        <View style={{ overflow: 'hidden' }}>
            {/* Delete bg */}
            <View style={sr.deleteBg}>
                <TouchableOpacity style={sr.deleteBtn} onPress={onDelete}>
                    <Ionicons name="trash" size={20} color="#fff" />
                    <Text style={sr.deleteTxt}>حذف</Text>
                </TouchableOpacity>
            </View>
            <Animated.View style={{ transform: [{ translateX }] }}>
                <TouchableOpacity activeOpacity={0.9} onLongPress={toggle} onPress={() => swiped && toggle()}>
                    {children}
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
}

const sr = StyleSheet.create({
    deleteBg: { position: 'absolute', right: 0, top: 0, bottom: 0, width: 72, backgroundColor: '#FF3B30', justifyContent: 'center', alignItems: 'center' },
    deleteBtn: { alignItems: 'center', gap: 3 },
    deleteTxt: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
});

// ─── Main Component ──────────────────────────────────────────────────────────
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

    // Modal
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState<ModalMode>('create');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [uploadingMedia, setUploadingMedia] = useState(false);

    // Form
    const [form, setForm] = useState<any>({});
    const [mediaUri, setMediaUri] = useState<string | null>(null);
    const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);

    // Tab indicator animation
    const tabAnim = useRef(new Animated.Value(0)).current;

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
        } catch (e) { console.error(e); }
        finally { setLoading(false); setRefreshing(false); }
    };

    const switchTab = (tab: Tab, idx: number) => {
        setActiveTab(tab);
        Animated.spring(tabAnim, { toValue: idx, useNativeDriver: true, tension: 80, friction: 12 }).start();
    };

    // ── Media Picker ──────────────────────────────────────────────────────────
    const pickMedia = async (type: 'image' | 'video') => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: type === 'image' ? ['images'] : ['videos'],
            allowsEditing: type === 'image',
            aspect: [16, 9],
            quality: 0.8,
            videoMaxDuration: 60,
        });
        if (result.canceled) return;
        const asset = result.assets[0];
        try {
            setUploadingMedia(true);
            const ext = asset.uri.split('.').pop() || (type === 'image' ? 'jpg' : 'mp4');
            const uploaded = await storageService.uploadFile({
                uri: asset.uri,
                name: `upload_${Date.now()}.${ext}`,
                type: type === 'image' ? 'image/jpeg' : 'video/mp4',
            });
            setMediaUri(uploaded.data.url);
            setMediaType(type);
        } catch {
            Alert.alert('خطأ', 'فشل في رفع الملف');
        } finally {
            setUploadingMedia(false);
        }
    };

    // ── Open Modal ────────────────────────────────────────────────────────────
    const openCreate = () => {
        setModalMode('create');
        setEditingId(null);
        setForm({});
        setMediaUri(null);
        setMediaType(null);
        setShowModal(true);
    };

    const openEdit = (item: any) => {
        setModalMode('edit');
        setEditingId(item._id || item.id);
        setForm({ ...item });
        setMediaUri(item.image || item.video || null);
        setMediaType(item.video ? 'video' : item.image ? 'image' : null);
        setShowModal(true);
    };

    // ── Submit ────────────────────────────────────────────────────────────────
    const handleSubmit = async () => {
        if (!form.title?.trim()) { Alert.alert('تنبيه', 'العنوان مطلوب'); return; }
        setSubmitting(true);
        try {
            const payload: any = { ...form };
            if (mediaType === 'image') payload.image = mediaUri;
            if (mediaType === 'video') payload.video = mediaUri;

            if (activeTab === 'activities') {
                modalMode === 'create'
                    ? await activityService.create(payload)
                    : await activityService.update(editingId!, payload);
            } else if (activeTab === 'tasks') {
                modalMode === 'create'
                    ? await taskService.create(payload)
                    : await taskService.update(editingId!, payload);
            } else if (activeTab === 'announcements') {
                modalMode === 'create'
                    ? await announcementService.create(payload)
                    : await announcementService.update(editingId!, payload);
            }
            setShowModal(false);
            fetchAll();
            Alert.alert('✅ تم', modalMode === 'create' ? 'تم الإنشاء بنجاح' : 'تم التحديث بنجاح');
        } catch { Alert.alert('خطأ', 'فشلت العملية'); }
        finally { setSubmitting(false); }
    };

    // ── Delete ────────────────────────────────────────────────────────────────
    const confirmDelete = (id: string, service: any, name: string) => {
        Alert.alert('تأكيد الحذف', `حذف "${name}" نهائياً؟`, [
            { text: 'إلغاء', style: 'cancel' },
            { text: 'حذف', style: 'destructive', onPress: async () => { await service.delete(id).catch(() => { }); fetchAll(); } }
        ]);
    };

    // ── Role Change ───────────────────────────────────────────────────────────
    const handleRoleChange = (m: any) => {
        const newRole = m.role === 'admin' ? 'member' : 'admin';
        Alert.alert('تغيير الصلاحية', `تغيير ${m.name} إلى ${newRole === 'admin' ? 'مدير' : 'عضو'}؟`, [
            { text: 'إلغاء', style: 'cancel' },
            { text: 'تأكيد', onPress: async () => { await adminService.updateMemberRole(m.uid, newRole).catch(() => { }); fetchAll(); } }
        ]);
    };

    const TABS: { key: Tab; label: string; icon: string }[] = [
        { key: 'members', label: 'الأعضاء', icon: 'people' },
        { key: 'activities', label: 'الفعاليات', icon: 'calendar' },
        { key: 'tasks', label: 'المهام', icon: 'checkmark-circle' },
        { key: 'announcements', label: 'الإعلانات', icon: 'megaphone' },
    ];

    const tabW = (width - 32) / 4;

    if (!isAdmin && !loading) return null;

    return (
        <SafeAreaView style={[s.root, { backgroundColor: theme.background }]} edges={['top']}>

            {/* ── HEADER ── */}
            <LinearGradient colors={['#0d1b2a', '#0f3460']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.header}>
                <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
                    <Ionicons name="chevron-forward" size={22} color="rgba(255,255,255,0.8)" />
                </TouchableOpacity>
                <View style={s.headerMid}>
                    <Text style={s.headerTitle}>لوحة الإدارة</Text>
                    <Text style={s.headerSub}>نظام النخبة • Elite</Text>
                </View>
                <View style={s.headerBadge}>
                    <Ionicons name="shield-checkmark" size={20} color="#34C759" />
                </View>
            </LinearGradient>

            {/* ── STATS ROW ── */}
            <View style={[s.statsRow, { backgroundColor: theme.surface }]}>
                {[
                    { n: members.length, l: 'عضو', c: '#007AFF' },
                    { n: activities.length, l: 'فعالية', c: '#FF9500' },
                    { n: tasks.length, l: 'مهمة', c: '#34C759' },
                    { n: announcements.length, l: 'إعلان', c: '#AF52DE' },
                ].map((s2, i) => (
                    <View key={i} style={s.statItem}>
                        <Text style={[s.statNum, { color: s2.c }]}>{s2.n}</Text>
                        <Text style={[s.statLbl, { color: theme.onSurfaceVariant }]}>{s2.l}</Text>
                    </View>
                ))}
            </View>

            {/* ── TAB BAR ── */}
            <View style={[s.tabBar, { backgroundColor: theme.surface }]}>
                <Animated.View style={[s.tabIndicator, {
                    width: tabW - 8,
                    backgroundColor: theme.primary + '20',
                    transform: [{ translateX: tabAnim.interpolate({ inputRange: [0, 1, 2, 3], outputRange: [width - 32 - tabW + 4, width - 32 - tabW * 2 + 4, width - 32 - tabW * 3 + 4, 4] }) }]
                }]} />
                {TABS.map((tab, idx) => {
                    const active = activeTab === tab.key;
                    return (
                        <TouchableOpacity key={tab.key} style={s.tabBtn} onPress={() => switchTab(tab.key, idx)}>
                            <Ionicons name={tab.icon as any} size={18} color={active ? theme.primary : theme.onSurfaceVariant} />
                            <Text style={[s.tabLabel, { color: active ? theme.primary : theme.onSurfaceVariant, fontFamily: Typography.bold }]}>
                                {tab.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* ── CONTENT ── */}
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={s.scroll}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchAll(); }} tintColor={theme.primary} />}
            >
                {loading ? (
                    <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 80 }} />
                ) : (
                    <>
                        {/* ── MEMBERS ── */}
                        {activeTab === 'members' && (
                            members.length === 0
                                ? <EmptyState icon="people-outline" text="لا يوجد أعضاء" />
                                : members.map((m: any) => (
                                    <SwipeRow key={m.uid || m._id} onDelete={() => confirmDelete(m.uid, adminService, m.name)}>
                                        <View style={[s.memberCard, { backgroundColor: theme.surface }]}>
                                            {/* Avatar */}
                                            {m.photoURL
                                                ? <Image source={{ uri: m.photoURL }} style={s.memberAvatar} />
                                                : <View style={[s.memberAvatarPh, { backgroundColor: theme.primary + '20' }]}>
                                                    <Text style={[s.memberInitial, { color: theme.primary }]}>{m.name?.[0]}</Text>
                                                </View>
                                            }
                                            {/* Info */}
                                            <View style={s.memberInfo}>
                                                <Text style={[s.memberName, { color: theme.onSurface, fontFamily: Typography.bold }]}>{m.name}</Text>
                                                <Text style={[s.memberEmail, { color: theme.onSurfaceVariant }]}>{m.email}</Text>
                                            </View>
                                            {/* Role badge + toggle */}
                                            <TouchableOpacity onPress={() => handleRoleChange(m)} style={[s.roleBadge, { backgroundColor: m.role === 'admin' ? '#FF950020' : theme.primary + '20' }]}>
                                                <Ionicons name={m.role === 'admin' ? 'star' : 'person'} size={12} color={m.role === 'admin' ? '#FF9500' : theme.primary} />
                                                <Text style={[s.roleText, { color: m.role === 'admin' ? '#FF9500' : theme.primary, fontFamily: Typography.bold }]}>
                                                    {m.role === 'admin' ? 'مدير' : 'عضو'}
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    </SwipeRow>
                                ))
                        )}

                        {/* ── ACTIVITIES ── */}
                        {activeTab === 'activities' && (
                            activities.length === 0
                                ? <EmptyState icon="calendar-outline" text="لا توجد فعاليات" />
                                : activities.map((item: any) => (
                                    <SwipeRow key={item._id} onDelete={() => confirmDelete(item._id, activityService, item.title)}>
                                        <View style={[s.contentCard, { backgroundColor: theme.surface }]}>
                                            {/* Thumbnail */}
                                            {item.image || item.video
                                                ? <Image source={{ uri: item.image || item.video }} style={s.thumb} />
                                                : <View style={[s.thumbPh, { backgroundColor: theme.primary + '15' }]}>
                                                    <Ionicons name="calendar" size={22} color={theme.primary} />
                                                </View>
                                            }
                                            {item.video && <View style={s.videoTag}><Ionicons name="play-circle" size={14} color="#fff" /></View>}
                                            <View style={s.cardInfo}>
                                                <Text style={[s.cardTitle, { color: theme.onSurface, fontFamily: Typography.bold }]} numberOfLines={1}>{item.title}</Text>
                                                <Text style={[s.cardMeta, { color: theme.onSurfaceVariant }]}>{item.date || 'غير محدد'} {item.location ? `• ${item.location}` : ''}</Text>
                                            </View>
                                            <TouchableOpacity onPress={() => openEdit(item)} style={[s.editBtn, { backgroundColor: theme.primary + '15' }]}>
                                                <Ionicons name="pencil" size={16} color={theme.primary} />
                                            </TouchableOpacity>
                                        </View>
                                    </SwipeRow>
                                ))
                        )}

                        {/* ── TASKS ── */}
                        {activeTab === 'tasks' && (
                            tasks.length === 0
                                ? <EmptyState icon="checkmark-circle-outline" text="لا توجد مهام" />
                                : tasks.map((item: any) => (
                                    <SwipeRow key={item._id} onDelete={() => confirmDelete(item._id, taskService, item.title)}>
                                        <View style={[s.contentCard, { backgroundColor: theme.surface }]}>
                                            <View style={[s.priorityBar, { backgroundColor: item.priority === 'عالية' ? '#FF3B30' : item.priority === 'متوسطة' ? '#FF9500' : '#34C759' }]} />
                                            <View style={s.cardInfo}>
                                                <Text style={[s.cardTitle, { color: theme.onSurface, fontFamily: Typography.bold }]} numberOfLines={1}>{item.title}</Text>
                                                <View style={s.taskMeta}>
                                                    <View style={[s.statusPill, { backgroundColor: item.status === 'مكتملة' ? '#34C75920' : '#FF950020' }]}>
                                                        <Text style={{ color: item.status === 'مكتملة' ? '#34C759' : '#FF9500', fontSize: 10, fontWeight: 'bold' }}>{item.status || 'قيد التنفيذ'}</Text>
                                                    </View>
                                                    <Text style={[s.cardMeta, { color: theme.onSurfaceVariant }]}>{item.priority || 'عادية'}</Text>
                                                </View>
                                            </View>
                                            <TouchableOpacity onPress={() => openEdit(item)} style={[s.editBtn, { backgroundColor: theme.primary + '15' }]}>
                                                <Ionicons name="pencil" size={16} color={theme.primary} />
                                            </TouchableOpacity>
                                        </View>
                                    </SwipeRow>
                                ))
                        )}

                        {/* ── ANNOUNCEMENTS ── */}
                        {activeTab === 'announcements' && (
                            announcements.length === 0
                                ? <EmptyState icon="megaphone-outline" text="لا توجد إعلانات" />
                                : announcements.map((item: any) => (
                                    <SwipeRow key={item._id} onDelete={() => confirmDelete(item._id, announcementService, item.title)}>
                                        <View style={[s.contentCard, { backgroundColor: theme.surface }]}>
                                            <View style={[s.annDot, { backgroundColor: item.important ? '#FF3B30' : '#007AFF' }]} />
                                            <View style={s.cardInfo}>
                                                <Text style={[s.cardTitle, { color: theme.onSurface, fontFamily: Typography.bold }]} numberOfLines={1}>{item.title}</Text>
                                                <Text style={[s.cardMeta, { color: theme.onSurfaceVariant }]} numberOfLines={1}>{item.description}</Text>
                                            </View>
                                            {item.important && (
                                                <View style={s.importantTag}>
                                                    <Ionicons name="alert-circle" size={14} color="#FF3B30" />
                                                </View>
                                            )}
                                            <TouchableOpacity onPress={() => openEdit(item)} style={[s.editBtn, { backgroundColor: theme.primary + '15' }]}>
                                                <Ionicons name="pencil" size={16} color={theme.primary} />
                                            </TouchableOpacity>
                                        </View>
                                    </SwipeRow>
                                ))
                        )}
                    </>
                )}
                <View style={{ height: 120 }} />
            </ScrollView>

            {/* ── FAB (Add Button) ── */}
            {activeTab !== 'members' && (
                <TouchableOpacity style={[s.fab, { backgroundColor: theme.primary }]} onPress={openCreate} activeOpacity={0.85}>
                    <Ionicons name="add" size={28} color="#fff" />
                </TouchableOpacity>
            )}

            {/* ── MODAL ── */}
            <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowModal(false)}>
                <SafeAreaView style={[s.modal, { backgroundColor: theme.background }]} edges={['top']}>
                    {/* Modal Header */}
                    <View style={[s.modalHeader, { borderBottomColor: theme.surfaceVariant }]}>
                        <TouchableOpacity onPress={handleSubmit} disabled={submitting} style={s.modalAction}>
                            {submitting
                                ? <ActivityIndicator color={theme.primary} size="small" />
                                : <Text style={[s.modalSave, { color: theme.primary, fontFamily: Typography.bold }]}>
                                    {modalMode === 'create' ? 'نشر' : 'حفظ'}
                                </Text>
                            }
                        </TouchableOpacity>
                        <Text style={[s.modalTitle, { color: theme.onSurface, fontFamily: Typography.bold }]}>
                            {modalMode === 'create' ? 'إنشاء جديد' : 'تعديل'}
                        </Text>
                        <TouchableOpacity onPress={() => setShowModal(false)} style={s.modalAction}>
                            <Ionicons name="close-circle" size={26} color={theme.onSurfaceVariant} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={s.modalScroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

                        {/* ── MEDIA SECTION (activities only) ── */}
                        {activeTab === 'activities' && (
                            <View style={s.mediaSection}>
                                {/* Preview */}
                                {mediaUri ? (
                                    <View style={s.mediaPreview}>
                                        <Image source={{ uri: mediaUri }} style={s.mediaImg} resizeMode="cover" />
                                        {mediaType === 'video' && (
                                            <View style={s.videoOverlay}>
                                                <Ionicons name="play-circle" size={48} color="rgba(255,255,255,0.9)" />
                                                <Text style={s.videoLabel}>فيديو مرفوع</Text>
                                            </View>
                                        )}
                                        <TouchableOpacity style={s.mediaRemove} onPress={() => { setMediaUri(null); setMediaType(null); }}>
                                            <Ionicons name="close-circle" size={28} color="#FF3B30" />
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <View style={[s.mediaPlaceholder, { borderColor: theme.surfaceVariant }]}>
                                        {uploadingMedia
                                            ? <ActivityIndicator color={theme.primary} size="large" />
                                            : <>
                                                <Ionicons name="cloud-upload-outline" size={40} color={theme.onSurfaceVariant} />
                                                <Text style={[s.mediaPlaceholderTxt, { color: theme.onSurfaceVariant }]}>أضف صورة أو فيديو</Text>
                                            </>
                                        }
                                    </View>
                                )}

                                {/* Media buttons */}
                                {!uploadingMedia && (
                                    <View style={s.mediaBtns}>
                                        <TouchableOpacity style={[s.mediaBtn, { backgroundColor: theme.primary + '15', borderColor: theme.primary + '30' }]} onPress={() => pickMedia('image')}>
                                            <Ionicons name="image" size={18} color={theme.primary} />
                                            <Text style={[s.mediaBtnTxt, { color: theme.primary, fontFamily: Typography.bold }]}>صورة</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={[s.mediaBtn, { backgroundColor: '#FF2D5515', borderColor: '#FF2D5530' }]} onPress={() => pickMedia('video')}>
                                            <Ionicons name="videocam" size={18} color="#FF2D55" />
                                            <Text style={[s.mediaBtnTxt, { color: '#FF2D55', fontFamily: Typography.bold }]}>فيديو</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        )}

                        {/* ── FORM FIELDS ── */}
                        <View style={s.formSection}>
                            <Field label="العنوان *" value={form.title || ''} onChange={(v: string) => setForm({ ...form, title: v })} theme={theme} />
                            <Field label="الوصف / التفاصيل" value={form.description || ''} onChange={(v: string) => setForm({ ...form, description: v })} theme={theme} multiline />

                            {activeTab === 'activities' && (
                                <>
                                    <Field label="التاريخ" value={form.date || ''} onChange={(v: string) => setForm({ ...form, date: v })} theme={theme} placeholder="مثال: 20 مارس 2025" />
                                    <Field label="الموقع" value={form.location || ''} onChange={(v: string) => setForm({ ...form, location: v })} theme={theme} placeholder="مثال: قاعة المؤتمرات" />
                                    <Field label="الحد الأقصى للمشتركين" value={form.maxAttendees?.toString() || ''} onChange={(v: string) => setForm({ ...form, maxAttendees: parseInt(v) || undefined })} theme={theme} keyboardType="numeric" />
                                </>
                            )}

                            {activeTab === 'tasks' && (
                                <>
                                    <Text style={[s.fieldLabel, { color: theme.onSurfaceVariant, fontFamily: Typography.bold }]}>الأولوية</Text>
                                    <View style={s.segmentRow}>
                                        {['عالية', 'متوسطة', 'منخفضة'].map(p => (
                                            <TouchableOpacity
                                                key={p}
                                                style={[s.segment, {
                                                    backgroundColor: form.priority === p ? theme.primary : theme.surface,
                                                    borderColor: form.priority === p ? theme.primary : theme.surfaceVariant,
                                                }]}
                                                onPress={() => setForm({ ...form, priority: p })}
                                            >
                                                <Text style={{ color: form.priority === p ? '#fff' : theme.onSurface, fontFamily: Typography.bold, fontSize: 13 }}>{p}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                    <Text style={[s.fieldLabel, { color: theme.onSurfaceVariant, fontFamily: Typography.bold }]}>الحالة</Text>
                                    <View style={s.segmentRow}>
                                        {['قيد التنفيذ', 'معلقة', 'مكتملة'].map(st => (
                                            <TouchableOpacity
                                                key={st}
                                                style={[s.segment, {
                                                    backgroundColor: form.status === st ? '#34C759' : theme.surface,
                                                    borderColor: form.status === st ? '#34C759' : theme.surfaceVariant,
                                                }]}
                                                onPress={() => setForm({ ...form, status: st })}
                                            >
                                                <Text style={{ color: form.status === st ? '#fff' : theme.onSurface, fontFamily: Typography.bold, fontSize: 12 }}>{st}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                    <Field label="الموعد النهائي" value={form.deadline || ''} onChange={(v: string) => setForm({ ...form, deadline: v })} theme={theme} />
                                </>
                            )}

                            {activeTab === 'announcements' && (
                                <>
                                    <Field label="النوع" value={form.type || ''} onChange={(v: string) => setForm({ ...form, type: v })} theme={theme} placeholder="مثال: عام، تنبيه، عاجل" />
                                    <TouchableOpacity
                                        style={[s.toggleRow, {
                                            backgroundColor: form.important ? '#FF3B3012' : theme.surface,
                                            borderColor: form.important ? '#FF3B30' : theme.surfaceVariant,
                                        }]}
                                        onPress={() => setForm({ ...form, important: !form.important })}
                                    >
                                        <View style={[s.toggleCheck, { backgroundColor: form.important ? '#FF3B30' : theme.surfaceVariant }]}>
                                            {form.important && <Ionicons name="checkmark" size={14} color="#fff" />}
                                        </View>
                                        <Text style={{ color: form.important ? '#FF3B30' : theme.onSurface, fontFamily: Typography.bold, fontSize: 15 }}>
                                            تحديد كإعلان هام
                                        </Text>
                                        <Ionicons name="alert-circle" size={20} color={form.important ? '#FF3B30' : theme.onSurfaceVariant} />
                                    </TouchableOpacity>
                                </>
                            )}
                        </View>
                    </ScrollView>
                </SafeAreaView>
            </Modal>
        </SafeAreaView>
    );
}

// ─── Field Component ─────────────────────────────────────────────────────────
function Field({ label, value, onChange, theme, multiline, placeholder, keyboardType }: any) {
    return (
        <View style={f.wrap}>
            <Text style={[f.label, { color: theme.onSurfaceVariant }]}>{label}</Text>
            <TextInput
                style={[f.input, multiline && f.inputMulti, { backgroundColor: theme.surface, color: theme.onSurface, borderColor: theme.surfaceVariant }]}
                value={value}
                onChangeText={onChange}
                placeholder={placeholder || label}
                placeholderTextColor={theme.onSurfaceVariant + '80'}
                multiline={multiline}
                numberOfLines={multiline ? 4 : 1}
                textAlign="right"
                textAlignVertical={multiline ? 'top' : 'center'}
                keyboardType={keyboardType || 'default'}
            />
        </View>
    );
}

const f = StyleSheet.create({
    wrap: { marginBottom: 14 },
    label: { fontSize: 12, fontWeight: 'bold', marginBottom: 7, textAlign: 'right', letterSpacing: 0.3 },
    input: { borderWidth: 1, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 13, fontSize: 15 },
    inputMulti: { height: 110, paddingTop: 13 },
});

// ─── Empty State ─────────────────────────────────────────────────────────────
function EmptyState({ icon, text }: { icon: string; text: string }) {
    return (
        <View style={e.wrap}>
            <Ionicons name={icon as any} size={56} color="#ccc" />
            <Text style={e.text}>{text}</Text>
        </View>
    );
}
const e = StyleSheet.create({
    wrap: { alignItems: 'center', paddingVertical: 80, gap: 14 },
    text: { fontSize: 15, color: '#aaa' },
});

// ─── Styles ──────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
    root: { flex: 1 },

    // Header
    header: { flexDirection: 'row-reverse', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 18, gap: 12 },
    backBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.08)', justifyContent: 'center', alignItems: 'center' },
    headerMid: { flex: 1, alignItems: 'center' },
    headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', letterSpacing: 0.3 },
    headerSub: { color: 'rgba(255,255,255,0.45)', fontSize: 11, marginTop: 3 },
    headerBadge: { width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(52,199,89,0.15)', justifyContent: 'center', alignItems: 'center' },

    // Stats
    statsRow: { flexDirection: 'row-reverse', paddingVertical: 14, paddingHorizontal: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(0,0,0,0.06)' },
    statItem: { flex: 1, alignItems: 'center', gap: 3 },
    statNum: { fontSize: 22, fontWeight: 'bold' },
    statLbl: { fontSize: 10 },

    // Tabs
    tabBar: { flexDirection: 'row-reverse', paddingHorizontal: 16, paddingVertical: 8, position: 'relative' },
    tabIndicator: { position: 'absolute', height: 40, top: 8, borderRadius: 12 },
    tabBtn: { flex: 1, alignItems: 'center', paddingVertical: 8, gap: 3 },
    tabLabel: { fontSize: 10 },

    scroll: { paddingTop: 8 },

    // Member card
    memberCard: { flexDirection: 'row-reverse', alignItems: 'center', padding: 14, gap: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(0,0,0,0.05)' },
    memberAvatar: { width: 50, height: 50, borderRadius: 16 },
    memberAvatarPh: { width: 50, height: 50, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
    memberInitial: { fontSize: 20, fontWeight: 'bold' },
    memberInfo: { flex: 1, alignItems: 'flex-end' },
    memberName: { fontSize: 15, marginBottom: 3 },
    memberEmail: { fontSize: 12, opacity: 0.55 },
    roleBadge: { flexDirection: 'row-reverse', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, gap: 5 },
    roleText: { fontSize: 12 },

    // Content card
    contentCard: { flexDirection: 'row-reverse', alignItems: 'center', padding: 14, gap: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(0,0,0,0.05)', position: 'relative' },
    thumb: { width: 52, height: 52, borderRadius: 14 },
    thumbPh: { width: 52, height: 52, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    videoTag: { position: 'absolute', right: 14, bottom: 14, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 8, padding: 3 },
    cardInfo: { flex: 1, alignItems: 'flex-end' },
    cardTitle: { fontSize: 15, marginBottom: 4 },
    cardMeta: { fontSize: 12, opacity: 0.55 },
    editBtn: { width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    priorityBar: { width: 4, alignSelf: 'stretch', borderRadius: 2 },
    taskMeta: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8 },
    statusPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
    annDot: { width: 10, height: 10, borderRadius: 5 },
    importantTag: { marginRight: 4 },

    // FAB
    fab: { position: 'absolute', bottom: 32, left: 24, width: 60, height: 60, borderRadius: 20, justifyContent: 'center', alignItems: 'center', elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 12 },

    // Modal
    modal: { flex: 1 },
    modalHeader: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1 },
    modalAction: { width: 60, alignItems: 'center' },
    modalTitle: { fontSize: 18 },
    modalSave: { fontSize: 17 },
    modalScroll: { flex: 1 },

    // Media
    mediaSection: { padding: 20, paddingBottom: 0 },
    mediaPreview: { height: 200, borderRadius: 20, overflow: 'hidden', position: 'relative', marginBottom: 12 },
    mediaImg: { width: '100%', height: '100%' },
    videoOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', gap: 8 },
    videoLabel: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
    mediaRemove: { position: 'absolute', top: 10, left: 10 },
    mediaPlaceholder: { height: 160, borderRadius: 20, borderWidth: 1.5, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', gap: 10, marginBottom: 12 },
    mediaPlaceholderTxt: { fontSize: 13 },
    mediaBtns: { flexDirection: 'row-reverse', gap: 12, marginBottom: 4 },
    mediaBtn: { flex: 1, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 16, gap: 8, borderWidth: 1 },
    mediaBtnTxt: { fontSize: 14 },

    // Form
    formSection: { padding: 20 },
    fieldLabel: { fontSize: 13, marginBottom: 8, textAlign: 'right', letterSpacing: 0.3 },
    segmentRow: { flexDirection: 'row-reverse', gap: 10, marginBottom: 16 },
    segment: { flex: 1, paddingVertical: 10, borderRadius: 14, alignItems: 'center', borderWidth: 1 },
    toggleRow: { flexDirection: 'row-reverse', alignItems: 'center', padding: 14, borderRadius: 16, gap: 12, borderWidth: 1, marginBottom: 12 },
    toggleCheck: { width: 22, height: 22, borderRadius: 7, justifyContent: 'center', alignItems: 'center' },
});
