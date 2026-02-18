import { Colors, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { storageService, userService } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function EditProfileScreen() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [photoURL, setPhotoURL] = useState('');
    const [uid, setUid] = useState('');
    const [image, setImage] = useState<string | null>(null);
    const [uploadingImage, setUploadingImage] = useState(false);

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        const userData = await AsyncStorage.getItem('userData');
        if (userData) {
            const parsed = JSON.parse(userData);
            setName(parsed.name || '');
            setEmail(parsed.email || '');
            setPhotoURL(parsed.photoURL || '');
            setUid(parsed.uid || '');
        }
    };

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const handleUpdate = async () => {
        if (!name || !email) {
            Alert.alert('خطأ', 'يرجى ملء الاسم والبريد الإلكتروني');
            return;
        }

        try {
            setLoading(true);
            let finalPhotoURL = photoURL;

            // 1. Upload to Telegram Cloud if new image selected
            if (image && (image.startsWith('file://') || image.startsWith('content://'))) {
                setUploadingImage(true);
                try {
                    const filename = image.split('/').pop() || 'profile_upload.jpg';
                    const response = await storageService.uploadFile({
                        uri: image,
                        name: filename,
                        type: 'image/jpeg',
                    });
                    finalPhotoURL = response.data.url;
                } catch (e) {
                    console.error("Upload failed", e);
                } finally {
                    setUploadingImage(false);
                }
            } else if (image) {
                finalPhotoURL = image;
            }

            const updates: any = { name, email, photoURL: finalPhotoURL };
            if (password) updates.password = password;

            // 2. Update Server
            await userService.updateProfile(uid, updates);

            // 3. Update Local Storage
            const userData = await AsyncStorage.getItem('userData');
            if (userData) {
                const parsed = JSON.parse(userData);
                parsed.name = name;
                parsed.email = email;
                parsed.photoURL = finalPhotoURL;
                await AsyncStorage.setItem('userData', JSON.stringify(parsed));
            }

            Alert.alert('تم التحديث', 'تم حفظ التعديلات وتزامنها سحابياً', [
                { text: 'حسناً', onPress: () => router.back() }
            ]);
        } catch (error) {
            console.error('Update error:', error);
            Alert.alert('خطأ', 'فشل في تحديث البيانات');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
            <StatusBar style="auto" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.headerBtn, { backgroundColor: theme.surfaceVariant }]}>
                    <Ionicons name="close" size={24} color={theme.onSurface} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.onSurface, fontFamily: Typography.bold }]}>تحديث المعلومات</Text>
                <TouchableOpacity onPress={handleUpdate} disabled={loading} style={[styles.headerBtn, { backgroundColor: theme.primaryContainer }]}>
                    {loading ? (
                        <ActivityIndicator size="small" color={theme.primary} />
                    ) : (
                        <Ionicons name="checkmark" size={24} color={theme.onPrimaryContainer} />
                    )}
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                    <View style={styles.avatarSection}>
                        <TouchableOpacity onPress={pickImage} style={styles.avatarWrapper}>
                            <Image
                                source={{ uri: image || photoURL || 'https://i.pravatar.cc/150?u=me' }}
                                style={styles.avatar}
                            />
                            <LinearGradient
                                colors={[theme.primary, theme.primary + 'AA']}
                                style={styles.editBadge}
                            >
                                <Ionicons name="camera" size={16} color="#fff" />
                            </LinearGradient>
                        </TouchableOpacity>
                        <Text style={[styles.avatarTip, { color: theme.onSurfaceVariant, fontFamily: Typography.regular }]}>انقر لتغيير الصورة الشخصية</Text>
                    </View>

                    <View style={styles.formSection}>
                        <View style={[styles.inputGroup, { backgroundColor: theme.surface }]}>
                            <View style={styles.inputRow}>
                                <Ionicons name="person-outline" size={20} color={theme.primary} />
                                <TextInput
                                    style={[styles.input, { color: theme.onSurface, fontFamily: Typography.regular }]}
                                    value={name}
                                    onChangeText={setName}
                                    placeholder="الاسم الكامل"
                                    placeholderTextColor={theme.onSurfaceVariant + '80'}
                                    textAlign="right"
                                />
                                <Text style={[styles.label, { color: theme.onSurfaceVariant, fontFamily: Typography.bold }]}>الاسم</Text>
                            </View>

                            <View style={[styles.separator, { backgroundColor: theme.surfaceVariant }]} />

                            <View style={styles.inputRow}>
                                <Ionicons name="mail-outline" size={20} color={theme.primary} />
                                <TextInput
                                    style={[styles.input, { color: theme.onSurface, fontFamily: Typography.regular }]}
                                    value={email}
                                    onChangeText={setEmail}
                                    placeholder="example@email.com"
                                    placeholderTextColor={theme.onSurfaceVariant + '80'}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    textAlign="right"
                                />
                                <Text style={[styles.label, { color: theme.onSurfaceVariant, fontFamily: Typography.bold }]}>البريد</Text>
                            </View>

                            <View style={[styles.separator, { backgroundColor: theme.surfaceVariant }]} />

                            <View style={styles.inputRow}>
                                <Ionicons name="lock-closed-outline" size={20} color={theme.primary} />
                                <TextInput
                                    style={[styles.input, { color: theme.onSurface, fontFamily: Typography.regular }]}
                                    value={password}
                                    onChangeText={setPassword}
                                    placeholder="كلمة مرور جديدة"
                                    placeholderTextColor={theme.onSurfaceVariant + '80'}
                                    secureTextEntry
                                    textAlign="right"
                                />
                                <Text style={[styles.label, { color: theme.onSurfaceVariant, fontFamily: Typography.bold }]}>السر</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.bottomTip}>
                        <Ionicons name="shield-checkmark" size={14} color={theme.primary} />
                        <Text style={[styles.tipText, { color: theme.onSurfaceVariant, fontFamily: Typography.regular }]}>
                            يتم تشفير وتزامن هذه المعلومات مع السحابة الخاصة بالنظام
                        </Text>
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    headerTitle: { fontSize: 18 },
    headerBtn: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: { paddingBottom: 40 },
    avatarSection: { alignItems: 'center', paddingTop: 30, paddingBottom: 20 },
    avatarWrapper: { position: 'relative' },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 4,
        borderColor: '#fff',
    },
    editBadge: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#fff',
    },
    avatarTip: { fontSize: 12, marginTop: 12, opacity: 0.6 },
    formSection: { paddingHorizontal: 20, marginTop: 10 },
    inputGroup: {
        borderRadius: 24,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        overflow: 'hidden',
    },
    inputRow: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
    },
    label: { fontSize: 13, width: 60, textAlign: 'right', marginLeft: 10 },
    input: { flex: 1, fontSize: 16, marginLeft: 10 },
    separator: { height: 1, marginHorizontal: 16 },
    bottomTip: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 30,
        paddingHorizontal: 40,
    },
    tipText: { fontSize: 11, textAlign: 'center', opacity: 0.5 },
});
