import { Colors, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { authService } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

const LoginScreen = () => {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('تنبيه', 'يرجى إدخال البريد الإلكتروني وكلمة المرور');
            return;
        }

        try {
            setLoading(true);
            const response = await authService.login({ email, password });

            if (response.data.token) {
                await AsyncStorage.setItem('userToken', response.data.token);
                await AsyncStorage.setItem('userData', JSON.stringify(response.data.user));
                router.replace('/(tabs)');
            }
        } catch (error: any) {
            console.error(error);
            Alert.alert('خطأ', error.response?.data?.error || 'فشل تسجيل الدخول');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            {/* Cinematic Background (Liquid Glass Style) */}
            <View style={[StyleSheet.absoluteFill, { backgroundColor: '#050A02' }]} />
            <LinearGradient
                colors={['#728156', 'transparent']}
                style={[styles.bgGradient, { top: -height * 0.2, left: -width * 0.2 }]}
            />
            <LinearGradient
                colors={['transparent', '#728156']}
                style={[styles.bgGradient, { bottom: -height * 0.2, right: -width * 0.2, opacity: 0.3 }]}
            />

            <SafeAreaView style={{ flex: 1 }}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1 }}
                >
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        <Animated.View entering={FadeInDown.duration(1000)} style={styles.header}>
                            <View style={styles.logoGlowContainer}>
                                <View style={styles.logoOuterRing}>
                                    <View style={styles.circularLogoWrapper}>
                                        <Image
                                            source={require('@/assets/images/logo.png')}
                                            style={styles.logo}
                                            resizeMode="cover"
                                        />
                                    </View>
                                </View>
                            </View>
                            <Text style={[styles.welcomeText, { fontFamily: Typography.bold }]}>ELITE</Text>
                            <Text style={[styles.subtitle, { fontFamily: Typography.regular }]}>منصة النشر الرقمي المتكاملة</Text>
                        </Animated.View>

                        <Animated.View entering={FadeInUp.delay(300).duration(1000)} style={styles.glassCard}>
                            <BlurView intensity={30} tint="dark" style={styles.blurContainer}>
                                <View style={styles.form}>
                                    <View style={styles.inputGroup}>
                                        <Text style={[styles.inputLabel, { fontFamily: Typography.bold }]}>البريد الإلكتروني</Text>
                                        <View style={[styles.inputWrapper, { backgroundColor: 'rgba(255,255,255,0.05)' }]}>
                                            <TextInput
                                                placeholder="example@univ.edu.iq"
                                                placeholderTextColor="rgba(255,255,255,0.3)"
                                                style={[styles.input, { fontFamily: Typography.regular, color: '#fff' }]}
                                                value={email}
                                                onChangeText={setEmail}
                                                keyboardType="email-address"
                                                autoCapitalize="none"
                                                textAlign="right"
                                            />
                                            <Ionicons name="mail-outline" size={20} color="rgba(255,255,255,0.5)" />
                                        </View>
                                    </View>

                                    <View style={styles.inputGroup}>
                                        <Text style={[styles.inputLabel, { fontFamily: Typography.bold }]}>كلمة المرور</Text>
                                        <View style={[styles.inputWrapper, { backgroundColor: 'rgba(255,255,255,0.05)' }]}>
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

                                    <TouchableOpacity style={styles.forgotBtn}>
                                        <Text style={[styles.forgotText, { color: theme.primary, fontFamily: Typography.regular }]}>تواصل معنا للانضمام للمنصة</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.loginBtn, { backgroundColor: theme.primary }]}
                                        onPress={handleLogin}
                                        disabled={loading}
                                        activeOpacity={0.8}
                                    >
                                        {loading ? (
                                            <ActivityIndicator color="#fff" />
                                        ) : (
                                            <>
                                                <Text style={[styles.loginBtnText, { fontFamily: Typography.bold }]}>تسجيل الدخول للنظام</Text>
                                                <Ionicons name="arrow-back" size={20} color="#fff" />
                                            </>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </BlurView>
                        </Animated.View>

                        <TouchableOpacity
                            style={styles.signupLink}
                            onPress={() => router.push('/signup')}
                        >
                            <Text style={[styles.signupText, { color: 'rgba(255,255,255,0.6)', fontFamily: Typography.regular }]}>ليس لديك حساب؟ </Text>
                            <Text style={[styles.signupTextBold, { color: theme.primary, fontFamily: Typography.bold }]}>سجل الآن</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
};

export default LoginScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    bgGradient: {
        position: 'absolute',
        width: width * 1.5,
        height: width * 1.5,
        borderRadius: width * 0.75,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 40,
        paddingBottom: 40,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoGlowContainer: {
        width: 140,
        height: 140,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    logoOuterRing: {
        width: 130,
        height: 130,
        borderRadius: 65,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        backgroundColor: 'rgba(255,255,255,0.03)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    circularLogoWrapper: {
        width: 110,
        height: 110,
        borderRadius: 55,
        overflow: 'hidden',
        backgroundColor: '#fff',
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    logo: {
        width: '100%',
        height: '100%',
    },
    welcomeText: {
        fontSize: 42,
        color: '#fff',
        letterSpacing: 10,
    },
    subtitle: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.6)',
        marginTop: 5,
        letterSpacing: 2,
    },
    glassCard: {
        borderRadius: 32,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
    },
    blurContainer: {
        padding: 24,
    },
    form: {
        gap: 20,
    },
    inputGroup: {
        gap: 8,
    },
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
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    input: {
        flex: 1,
        height: '100%',
        fontSize: 16,
        marginRight: 12,
    },
    forgotBtn: {
        alignItems: 'flex-end',
    },
    forgotText: {
        fontSize: 13,
    },
    loginBtn: {
        height: 60,
        borderRadius: 18,
        flexDirection: 'row-reverse',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
        marginTop: 10,
        elevation: 4,
    },
    loginBtnText: {
        fontSize: 17,
        color: '#fff',
    },
    signupLink: {
        flexDirection: 'row-reverse',
        justifyContent: 'center',
        marginTop: 30,
    },
    signupText: {
        fontSize: 14,
    },
    signupTextBold: {
        fontSize: 14,
    },
});
