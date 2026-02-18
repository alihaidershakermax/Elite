import { Colors, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { chatService, Message } from '@/services/chat';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    FlatList,
    Image,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ChatRoomScreen() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const params = useLocalSearchParams();
    const roomId = params.roomId as string;
    const roomName = params.roomName as string;

    const [messages, setMessages] = useState<Message[]>([]);
    const [messageText, setMessageText] = useState('');
    const [userId, setUserId] = useState('');
    const [userName, setUserName] = useState('');
    const [userAvatar, setUserAvatar] = useState('');
    const [typingUsers, setTypingUsers] = useState<string[]>([]);
    const flatListRef = useRef<FlatList>(null);
    const typingTimeoutRef = useRef<any>();

    useEffect(() => {
        if (roomId) {
            loadUserAndMessages();
        }
    }, [roomId]);

    const loadUserAndMessages = async () => {
        const userData = await AsyncStorage.getItem('userData');
        if (userData) {
            const parsed = JSON.parse(userData);
            setUserId(parsed.uid);
            setUserName(parsed.name);
            setUserAvatar(parsed.photoURL || '');
        }

        if (!roomId) return;

        // Subscribe to messages
        const unsubMessages = chatService.subscribeToMessages(roomId, (messagesData) => {
            setMessages(messagesData);
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        });

        // Subscribe to typing
        const unsubTyping = chatService.subscribeToTyping(roomId, (users) => {
            const currentUserId = userId;
            if (currentUserId) {
                setTypingUsers(users.filter(id => id !== currentUserId));
            }
        });

        return () => {
            unsubMessages();
            unsubTyping();
        };
    };

    const handleSend = async () => {
        if (!messageText.trim()) return;

        try {
            await chatService.sendMessage(roomId, {
                text: messageText.trim(),
                senderId: userId,
                senderName: userName,
                senderAvatar: userAvatar,
                type: 'text',
            });

            setMessageText('');
            await chatService.updateTyping(roomId, userId, false);
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const handleTyping = (text: string) => {
        setMessageText(text);

        // Clear previous timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Update typing status
        if (text.trim()) {
            chatService.updateTyping(roomId, userId, true);

            // Auto-clear typing after 3 seconds
            typingTimeoutRef.current = setTimeout(() => {
                chatService.updateTyping(roomId, userId, false);
            }, 3000);
        } else {
            chatService.updateTyping(roomId, userId, false);
        }
    };

    const formatTime = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' });
    };

    const renderMessage = ({ item, index }: { item: Message; index: number }) => {
        const isMyMessage = item.senderId === userId;
        const showAvatar = !isMyMessage && (index === 0 || messages[index - 1].senderId !== item.senderId);
        const showName = !isMyMessage && showAvatar;

        return (
            <View style={[styles.messageContainer, isMyMessage && styles.myMessageContainer]}>
                {!isMyMessage && (
                    <View style={styles.avatarContainer}>
                        {showAvatar ? (
                            item.senderAvatar ? (
                                <Image source={{ uri: item.senderAvatar }} style={styles.avatar} />
                            ) : (
                                <View style={[styles.avatarPlaceholder, { backgroundColor: theme.primaryContainer }]}>
                                    <Text style={[styles.avatarText, { color: theme.onPrimaryContainer }]}>
                                        {item.senderName[0]}
                                    </Text>
                                </View>
                            )
                        ) : (
                            <View style={{ width: 36 }} />
                        )}
                    </View>
                )}

                <View style={[
                    styles.messageBubble,
                    isMyMessage ? { backgroundColor: theme.primary } : { backgroundColor: theme.surface }
                ]}>
                    {showName && (
                        <Text style={[styles.senderName, { color: theme.primary, fontFamily: Typography.bold }]}>
                            {item.senderName}
                        </Text>
                    )}
                    
                    {item.deleted ? (
                        <Text style={[styles.messageText, { 
                            color: isMyMessage ? 'rgba(255,255,255,0.6)' : theme.onSurfaceVariant,
                            fontStyle: 'italic'
                        }]}>
                            {item.text}
                        </Text>
                    ) : (
                        <Text style={[styles.messageText, { 
                            color: isMyMessage ? '#fff' : theme.onSurface,
                            fontFamily: Typography.regular 
                        }]}>
                            {item.text}
                        </Text>
                    )}

                    <View style={styles.messageFooter}>
                        <Text style={[styles.messageTime, { 
                            color: isMyMessage ? 'rgba(255,255,255,0.7)' : theme.onSurfaceVariant 
                        }]}>
                            {formatTime(item.timestamp)}
                        </Text>
                        {item.edited && (
                            <Text style={[styles.editedLabel, { 
                                color: isMyMessage ? 'rgba(255,255,255,0.7)' : theme.onSurfaceVariant 
                            }]}>
                                معدلة
                            </Text>
                        )}
                    </View>
                </View>
            </View>
        );
    };

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
                    <Text style={[styles.headerTitle, { fontFamily: Typography.bold }]}>{roomName}</Text>
                    {typingUsers.length > 0 && (
                        <Text style={styles.typingText}>يكتب...</Text>
                    )}
                </View>
                <TouchableOpacity style={styles.moreBtn}>
                    <Ionicons name="ellipsis-vertical" size={24} color="#fff" />
                </TouchableOpacity>
            </LinearGradient>

            {/* Messages */}
            <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderMessage}
                keyExtractor={(item) => item.id || ''}
                contentContainerStyle={styles.messagesList}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            />

            {/* Input */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <View style={[styles.inputContainer, { backgroundColor: theme.surface, borderTopColor: theme.surfaceVariant }]}>
                    <TouchableOpacity style={styles.sendBtn} onPress={handleSend} disabled={!messageText.trim()}>
                        <LinearGradient
                            colors={messageText.trim() ? [theme.primary, theme.secondary] : ['#ccc', '#aaa']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.sendBtnGradient}
                        >
                            <Ionicons name="send" size={20} color="#fff" />
                        </LinearGradient>
                    </TouchableOpacity>

                    <TextInput
                        style={[styles.input, { color: theme.onSurface, backgroundColor: theme.background }]}
                        value={messageText}
                        onChangeText={handleTyping}
                        placeholder="اكتب رسالة..."
                        placeholderTextColor={theme.onSurfaceVariant}
                        textAlign="right"
                        multiline
                        maxLength={1000}
                    />

                    <TouchableOpacity style={styles.attachBtn}>
                        <Ionicons name="add-circle" size={28} color={theme.primary} />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 12,
    },
    backBtn: { padding: 4 },
    moreBtn: { padding: 4 },
    headerCenter: { flex: 1, alignItems: 'center' },
    headerTitle: { color: '#fff', fontSize: 18 },
    typingText: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 2 },
    messagesList: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 8,
    },
    messageContainer: {
        flexDirection: 'row-reverse',
        alignItems: 'flex-end',
        gap: 8,
        maxWidth: '80%',
    },
    myMessageContainer: {
        alignSelf: 'flex-end',
    },
    avatarContainer: {
        width: 36,
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
    },
    avatarPlaceholder: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    messageBubble: {
        padding: 12,
        borderRadius: 18,
        maxWidth: '100%',
    },
    senderName: {
        fontSize: 13,
        marginBottom: 4,
    },
    messageText: {
        fontSize: 15,
        lineHeight: 20,
    },
    messageFooter: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        gap: 6,
        marginTop: 4,
    },
    messageTime: {
        fontSize: 11,
    },
    editedLabel: {
        fontSize: 10,
    },
    inputContainer: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        gap: 8,
        borderTopWidth: StyleSheet.hairlineWidth,
    },
    input: {
        flex: 1,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        fontSize: 15,
        maxHeight: 100,
    },
    attachBtn: {
        padding: 4,
    },
    sendBtn: {
        padding: 4,
    },
    sendBtnGradient: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
