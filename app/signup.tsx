import { Colors, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { authService, storageService } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

const SignupScreen = () => {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [image, setImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const handleSignup = async () => {
        if (!name || !email || !password) {
            Alert.alert('تنبيه', 'يرجى ملء جميع الحقول');
            return;
        }

        try {
            setLoading(true);
            let photoURL = '';

            // 1. Upload image to Telegram Cloud via API if selected
            if (image) {
                try {
                    setUploadingImage(true);
                    const filename = image.split('/').pop() || 'profile_signup.jpg';
                    const response = await storageService.uploadFile({
                        uri: image,
                        name: filename,
                        type: 'image/jpeg',
                    });
                    photoURL = response.data.url;
                } catch (e) {
                    console.error("Image upload failed", e);
                } finally {
                    setUploadingImage(false);
                }
            }

            // 2. Register user on Server
            await authService.signup({ name, email, password, photoURL });

            Alert.alert('تم إنشاء الحساب', 'تم التسجيل بنجاح وتخزين بياناتك سحابياً. يمكنك الآن الدخول.', [
                { text: 'تسجيل الدخول', onPress: () => router.replace('/login') }
            ]);
        } catch (error: any) {
            Alert.alert('خطأ', error.response?.data?.error || 'فشل في إنشاء الحساب');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            <View style={[StyleSheet.absoluteFill, { backgroundColor: '#0A0501' }]} />
            <LinearGradient
                colors={['#728156', 'transparent']}
                style={[styles.bgGradient, { top: -height * 0.3, right: -width * 0.3, opacity: 0.4 }]}
            />

            <SafeAreaView style={{ flex: 1 }}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1 }}
                >
                    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                            <Ionicons name="arrow-forward" size={24} color="#fff" />
                        </TouchableOpacity>

                        <Animated.View entering={FadeInDown.duration(800)} style={styles.header}>
                            <Text style={[styles.title, { color: '#fff', fontFamily: Typography.bold }]}>عضوية النخبة</Text>
                            <Text style={[styles.subtitle, { color: 'rgba(255,255,255,0.6)', fontFamily: Typography.regular }]}>سجل الآن للحصول على صلاحيات الإدارة الكاملة</Text>
                        </Animated.View>

                        <Animated.View entering={FadeInUp.delay(200).duration(1000)} style={styles.glassCard}>
                            <BlurView intensity={30} tint="dark" style={styles.blurContainer}>
                                <View style={styles.form}>

                                    {/* Avatar Picker with Liquid Style */}
                                    <View style={styles.avatarSection}>
                                        <TouchableOpacity onPress={pickImage} style={styles.avatarWrapper}>
                                            <Image
                                                source={{ uri: image || 'https://i.pravatar.cc/150?u=me' }}
                                                style={styles.avatar}
                                            />
                                            <View style={[styles.editIcon, { backgroundColor: theme.primary }]}>
                                                <Ionicons name="camera" size={16} color="#fff" />
                                            </View>
                                        </TouchableOpacity>
                                        {uploadingImage && <Text style={styles.uploadText}>جاري تجهيز الصورة سحابياً...</Text>}
                                    </View>

                                    <View style={styles.inputGroup}>
                                        <Text style={[styles.inputLabel, { fontFamily: Typography.bold }]}>الاسم الكامل</Text>
                                        <View style={styles.inputWrapper}>
                                            <TextInput
                                                placeholder="الاسم الثلاثي..."
                                                placeholderTextColor="rgba(255,255,255,0.3)"
                                                style={[styles.input, { fontFamily: Typography.regular, color: '#fff' }]}
                                                value={name}
                                                onChangeText={setName}
                                                textAlign="right"
                                            />
                                            <Ionicons name="person-outline" size={20} color="rgba(255,255,255,0.5)" />
                                        </View>
                                    </View>

                                    <View style={styles.inputGroup}>
                                        <Text style={[styles.inputLabel, { fontFamily: Typography.bold }]}>البريد الأكاديمي</Text>
                                        <View style={styles.inputWrapper}>
                                            <TextInput
                                                placeholder="example@univ.edu.iq"
                                                placeholderTextColor="rgba(255,255,255,0.3)"
                                                style={[styles.input, { fontFamily: Typography.regular, color: '#fff' }]}
                                                value={email}
                                                onChangeText={setEmail}
                                                keyboardType="email-address"
                                                textAlign="right"
                                            />
                                            <Ionicons name="mail-outline" size={20} color="rgba(255,255,255,0.5)" />
                                        </View>
                                    </View>

                                    <View style={styles.inputGroup}>
                                        <Text style={[styles.inputLabel, { fontFamily: Typography.bold }]}>كلمة المرور</Text>
                                        <View style={styles.inputWrapper}>
                                            <TextInput
                                                placeholder="••••••••"
                                                placeholderTextColor="rgba(255,255,255,0.3)"
                                                style={[styles.input, { fontFamily: Typography.regular, color: '#fff' }]}
                                                value={password}
                                                onChangeText={setPassword}
                                                secureTextEntry
                                                textAlign="right"
                                            />
                                            <Ionicons name="lock-closed-outline" size={20} color="rgba(255,255,255,0.5)" />
                                        </View>
                                    </View>

                                    <TouchableOpacity
                                        style={[styles.signupBtn, { backgroundColor: theme.primary }]}
                                        onPress={handleSignup}
                                        disabled={loading}
                                        activeOpacity={0.8}
                                    >
                                        {loading ? (
                                            <ActivityIndicator color="#fff" />
                                        ) : (
                                            <>
                                                <Text style={[styles.signupBtnText, { fontFamily: Typography.bold }]}>تأكيد التسجيل السحابي</Text>
                                                <Ionicons name="shield-checkmark" size={20} color="#fff" />
                                            </>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </BlurView>
                        </Animated.View>

                        <View style={styles.footer}>
                            <Text style={[styles.footerText, { color: 'rgba(255,255,255,0.5)', fontFamily: Typography.regular }]}>
                                بمجرد التسجيل، أنت توافق على شروط "نظام النخبة"
                            </Text>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
};

export default SignupScreen;

const styles = StyleSheet.create({
    container: { flex: 1 },
    bgGradient: {
        position: 'absolute',
        width: width * 1.5,
        height: width * 1.5,
        borderRadius: width * 0.75,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 40,
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    header: {
        marginBottom: 30,
        alignItems: 'flex-end',
    },
    title: {
        fontSize: 32,
        textAlign: 'right',
    },
    subtitle: {
        fontSize: 14,
        marginTop: 5,
        textAlign: 'right',
    },
    glassCard: {
        borderRadius: 32,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        elevation: 10,
    },
    blurContainer: {
        padding: 24,
    },
    form: { gap: 20 },
    avatarSection: {
        alignItems: 'center',
        marginBottom: 10,
    },
    avatarWrapper: {
        position: 'relative',
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    editIcon: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#111',
    },
    uploadText: {
        fontSize: 10,
        color: '#fff',
        marginTop: 8,
        opacity: 0.7,
    },
    inputGroup: { gap: 8 },
    inputLabel: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        textAlign: 'right',
        marginRight: 4,
    },
    inputWrapper: {
        height: 56,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    input: {
        flex: 1,
        height: '100%',
        fontSize: 16,
        marginRight: 12,
    },
    signupBtn: {
        height: 60,
        borderRadius: 18,
        flexDirection: 'row-reverse',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
        marginTop: 10,
        elevation: 4,
    },
    signupBtnText: {
        fontSize: 17,
        color: '#fff',
    },
    footer: {
        marginTop: 30,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 11,
        textAlign: 'center',
    },
});
