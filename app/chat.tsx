import { Colors, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ChatRoom, chatService } from '@/services/chat';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ChatScreen() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const [rooms, setRooms] = useState<ChatRoom[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [roomName, setRoomName] = useState('');
    const [roomDescription, setRoomDescription] = useState('');
    const [userId, setUserId] = useState('');
    const [userName, setUserName] = useState('');

    useEffect(() => {
        loadUserAndRooms();
    }, []);

    const loadUserAndRooms = async () => {
        const userData = await AsyncStorage.getItem('userData');
        if (userData) {
            const parsed = JSON.parse(userData);
            setUserId(parsed.uid);
            setUserName(parsed.name);
        }

        const unsubscribe = chatService.subscribeToRooms((roomsData) => {
            setRooms(roomsData);
            setLoading(false);
        });

        return () => unsubscribe();
    };

    const handleCreateRoom = async () => {
        if (!roomName.trim()) {
            Alert.alert('خطأ', 'يرجى إدخال اسم المحادثة');
            return;
        }

        try {
            await chatService.createRoom({
                name: roomName,
                description: roomDescription,
                type: 'group',
                members: [userId],
                admins: [userId],
                createdBy: userId,
            });

            setShowCreateModal(false);
            setRoomName('');
            setRoomDescription('');
            Alert.alert('نجاح', 'تم إنشاء المحادثة بنجاح');
        } catch (error) {
            Alert.alert('خطأ', 'فشل في إنشاء المحادثة');
        }
    };

    const formatTime = (timestamp?: number) => {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));

        if (hours < 1) {
            const minutes = Math.floor(diff / (1000 * 60));
            return minutes < 1 ? 'الآن' : `${minutes} د`;
        } else if (hours < 24) {
            return `${hours} س`;
        } else {
            const days = Math.floor(hours / 24);
            return `${days} ي`;
        }
    };

    const renderRoom = ({ item }: { item: ChatRoom }) => (
        <TouchableOpacity
            style={[styles.roomCard, { backgroundColor: theme.surface }]}
            onPress={() => router.push({ pathname: '/chat-room', params: { roomId: item.id, roomName: item.name } } as any)}
            activeOpacity={0.7}
        >
            <View style={styles.roomContent}>
                <View style={styles.roomInfo}>
                    <View style={styles.roomHeader}>
                        <Text style={[styles.roomName, { color: theme.onSurface, fontFamily: Typography.bold }]} numberOfLines={1}>
                            {item.name}
                        </Text>
                        {item.lastMessageTime && (
                            <Text style={[styles.roomTime, { color: theme.onSurfaceVariant }]}>
                                {formatTime(item.lastMessageTime)}
                            </Text>
                        )}
                    </View>
                    <Text style={[styles.roomLastMessage, { color: theme.onSurfaceVariant }]} numberOfLines={1}>
                        {item.lastMessage || 'لا توجد رسائل'}
                    </Text>
                    {item.description && (
                        <Text style={[styles.roomDescription, { color: theme.onSurfaceVariant }]} numberOfLines={1}>
                            {item.description}
                        </Text>
                    )}
                </View>
                <View style={[styles.roomAvatar, { backgroundColor: theme.primaryContainer }]}>
                    {item.avatar ? (
                        <Image source={{ uri: item.avatar }} style={styles.avatarImage} />
                    ) : (
                        <Ionicons name="chatbubbles" size={28} color={theme.onPrimaryContainer} />
                    )}
                </View>
            </View>
            <View style={[styles.roomDivider, { backgroundColor: theme.surfaceVariant }]} />
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
            {/* Header */}
            <LinearGradient
                colors={[theme.primary, theme.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="chevron-forward" size={24} color="#fff" />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={[styles.headerTitle, { fontFamily: Typography.bold }]}>المحادثات</Text>
                    <Text style={styles.headerSubtitle}>{rooms.length} محادثة</Text>
                </View>
                <TouchableOpacity onPress={() => setShowCreateModal(true)} style={styles.createBtn}>
                    <Ionicons name="add-circle" size={28} color="#fff" />
                </TouchableOpacity>
            </LinearGradient>

            {/* Rooms List */}
            <FlatList
                data={rooms}
                renderItem={renderRoom}
                keyExtractor={(item) => item.id || ''}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="chatbubbles-outline" size={64} color={theme.onSurfaceVariant} style={{ opacity: 0.3 }} />
                        <Text style={[styles.emptyText, { color: theme.onSurfaceVariant, fontFamily: Typography.bold }]}>
                            لا توجد محادثات
                        </Text>
                        <Text style={[styles.emptySubtext, { color: theme.onSurfaceVariant, fontFamily: Typography.regular }]}>
                            اضغط + لإنشاء محادثة جديدة
                        </Text>
                    </View>
                }
            />

            {/* Create Room Modal */}
            <Modal visible={showCreateModal} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
                        <View style={styles.modalHeader}>
                            <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                                <Text style={[styles.modalCancel, { color: theme.primary, fontFamily: Typography.regular }]}>
                                    إلغاء
                                </Text>
                            </TouchableOpacity>
                            <Text style={[styles.modalTitle, { color: theme.onSurface, fontFamily: Typography.bold }]}>
                                محادثة جديدة
                            </Text>
                            <TouchableOpacity onPress={handleCreateRoom}>
                                <Text style={[styles.modalSave, { color: theme.primary, fontFamily: Typography.bold }]}>
                                    إنشاء
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalBody}>
                            <View style={[styles.inputGroup, { backgroundColor: theme.background }]}>
                                <TextInput
                                    style={[styles.input, { color: theme.onSurface, fontFamily: Typography.regular }]}
                                    value={roomName}
                                    onChangeText={setRoomName}
                                    placeholder="اسم المحادثة"
                                    placeholderTextColor={theme.onSurfaceVariant}
                                    textAlign="right"
                                />
                            </View>

                            <View style={[styles.inputGroup, { backgroundColor: theme.background }]}>
                                <TextInput
                                    style={[styles.input, styles.textArea, { color: theme.onSurface, fontFamily: Typography.regular }]}
                                    value={roomDescription}
                                    onChangeText={setRoomDescription}
                                    placeholder="الوصف (اختياري)"
                                    placeholderTextColor={theme.onSurfaceVariant}
                                    textAlign="right"
                                    multiline
                                    numberOfLines={3}
                                />
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        gap: 12,
    },
    backBtn: { padding: 4 },
    createBtn: { padding: 4 },
    headerCenter: { flex: 1, alignItems: 'center' },
    headerTitle: { color: '#fff', fontSize: 20 },
    headerSubtitle: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 2 },
    listContent: { paddingBottom: 20 },
    roomCard: {
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    roomContent: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        gap: 12,
    },
    roomAvatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarImage: {
        width: 56,
        height: 56,
        borderRadius: 28,
    },
    roomInfo: {
        flex: 1,
        alignItems: 'flex-end',
    },
    roomHeader: {
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 4,
    },
    roomName: {
        fontSize: 16,
        flex: 1,
    },
    roomTime: {
        fontSize: 12,
        opacity: 0.6,
        marginLeft: 8,
    },
    roomLastMessage: {
        fontSize: 14,
        opacity: 0.7,
        marginBottom: 2,
    },
    roomDescription: {
        fontSize: 12,
        opacity: 0.5,
    },
    roomDivider: {
        height: StyleSheet.hairlineWidth,
        marginTop: 12,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 100,
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
        maxHeight: '70%',
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
        height: 80,
        textAlignVertical: 'top',
    },
});
