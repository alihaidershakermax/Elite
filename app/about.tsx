import { Colors, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AboutScreen() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    const InfoCard = ({ icon, title, description, color }: any) => (
        <Animated.View entering={FadeInDown} style={[styles.infoCard, { backgroundColor: theme.surfaceVariant }]}>
            <View style={[styles.iconContainer, { backgroundColor: color || theme.primaryContainer }]}>
                <Ionicons name={icon} size={28} color={theme.onPrimaryContainer} />
            </View>
            <View style={styles.infoContent}>
                <Text style={[styles.infoTitle, { color: theme.onSurface, fontFamily: Typography.bold }]}>{title}</Text>
                <Text style={[styles.infoDescription, { color: theme.onSurfaceVariant, fontFamily: Typography.regular }]}>{description}</Text>
            </View>
        </Animated.View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: theme.surfaceVariant }]}>
                    <Ionicons name="chevron-forward" size={24} color={theme.onSurface} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.onSurface, fontFamily: Typography.bold }]}>حول التطبيق</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* App Logo & Info */}
                <Animated.View entering={FadeInDown} style={styles.logoSection}>
                    <View style={[styles.logoContainer, { backgroundColor: theme.primaryContainer }]}>
                        <Ionicons name="shield-checkmark" size={60} color={theme.primary} />
                    </View>
                    <Text style={[styles.appName, { color: theme.onSurface, fontFamily: Typography.bold }]}>Elite</Text>
                    <Text style={[styles.appTagline, { color: theme.onSurfaceVariant, fontFamily: Typography.regular }]}>نظام إدارة النخبة الهندسية</Text>
                    <View style={[styles.versionBadge, { backgroundColor: theme.primaryContainer }]}>
                        <Text style={[styles.versionText, { color: theme.onPrimaryContainer, fontFamily: Typography.bold }]}>الإصدار 1.5.0</Text>
                    </View>
                </Animated.View>

                {/* Features */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.onSurface, fontFamily: Typography.bold }]}>المميزات</Text>
                    
                    <InfoCard
                        icon="checkmark-circle"
                        title="إدارة المهام"
                        description="تنظيم ومتابعة المهام بكفاءة عالية"
                        color="#4CAF50"
                    />
                    
                    <InfoCard
                        icon="people"
                        title="إدارة الأعضاء"
                        description="متابعة أعضاء الفريق ونشاطاتهم"
                        color="#2196F3"
                    />
                    
                    <InfoCard
                        icon="notifications"
                        title="الإشعارات الفورية"
                        description="تنبيهات لحظية لجميع التحديثات المهمة"
                        color="#FF9800"
                    />
                    
                    <InfoCard
                        icon="shield-checkmark"
                        title="أمان عالي"
                        description="حماية بياناتك بأحدث تقنيات التشفير"
                        color="#9C27B0"
                    />
                </View>

                {/* About */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.onSurface, fontFamily: Typography.bold }]}>عن التطبيق</Text>
                    <View style={[styles.aboutCard, { backgroundColor: theme.surfaceVariant }]}>
                        <Text style={[styles.aboutText, { color: theme.onSurfaceVariant, fontFamily: Typography.regular }]}>
                            Elite هو نظام إدارة متكامل مصمم خصيصاً للنخبة الهندسية في جامعة العين العراقية - كلية الهندسة. 
                            يوفر التطبيق أدوات احترافية لإدارة الفعاليات، المهام، اللجان، والتواصل بين الأعضاء بكفاءة عالية.
                        </Text>
                    </View>
                </View>

                {/* Developer Info */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.onSurface, fontFamily: Typography.bold }]}>المطور</Text>
                    <View style={[styles.developerCard, { backgroundColor: theme.surfaceVariant }]}>
                        <Image 
                            source={{ uri: 'https://b.top4top.io/p_3701eehy71.jpg' }} 
                            style={styles.developerImage}
                        />
                        <View style={styles.developerInfo}>
                            <Text style={[styles.developerName, { color: theme.onSurface, fontFamily: Typography.bold }]}>
                                علي الأكبر حيدر شاكر
                            </Text>
                            <Text style={[styles.developerTitle, { color: theme.onSurfaceVariant, fontFamily: Typography.regular }]}>
                                مطور تطبيقات الموبايل
                            </Text>
                            <View style={styles.developerBadges}>
                                <View style={[styles.devBadge, { backgroundColor: '#007AFF15' }]}>
                                    <Ionicons name="code-slash" size={14} color="#007AFF" />
                                    <Text style={[styles.devBadgeText, { color: '#007AFF', fontFamily: Typography.bold }]}>Full Stack</Text>
                                </View>
                                <View style={[styles.devBadge, { backgroundColor: '#34C75915' }]}>
                                    <Ionicons name="phone-portrait" size={14} color="#34C759" />
                                    <Text style={[styles.devBadgeText, { color: '#34C759', fontFamily: Typography.bold }]}>React Native</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Technologies */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.onSurface, fontFamily: Typography.bold }]}>التقنيات المستخدمة</Text>
                    <View style={[styles.techCard, { backgroundColor: theme.surfaceVariant }]}>
                        <View style={styles.techRow}>
                            <View style={styles.techItem}>
                                <Ionicons name="logo-react" size={24} color="#61DAFB" />
                                <Text style={[styles.techText, { color: theme.onSurfaceVariant, fontFamily: Typography.regular }]}>React Native</Text>
                            </View>
                            <View style={styles.techItem}>
                                <Ionicons name="logo-firebase" size={24} color="#FFCA28" />
                                <Text style={[styles.techText, { color: theme.onSurfaceVariant, fontFamily: Typography.regular }]}>Firebase</Text>
                            </View>
                        </View>
                        <View style={styles.techRow}>
                            <View style={styles.techItem}>
                                <Ionicons name="logo-nodejs" size={24} color="#68A063" />
                                <Text style={[styles.techText, { color: theme.onSurfaceVariant, fontFamily: Typography.regular }]}>Node.js</Text>
                            </View>
                            <View style={styles.techItem}>
                                <Ionicons name="code-slash" size={24} color={theme.primary} />
                                <Text style={[styles.techText, { color: theme.onSurfaceVariant, fontFamily: Typography.regular }]}>TypeScript</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Legal */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.onSurface, fontFamily: Typography.bold }]}>الشروط والأحكام</Text>
                    <View style={[styles.legalCard, { backgroundColor: theme.surfaceVariant }]}>
                        <Text style={[styles.legalText, { color: theme.onSurfaceVariant, fontFamily: Typography.regular }]}>
                            هذا التطبيق مخصص لأعضاء لجنة النخبة الهندسية فقط. جميع البيانات محمية ومشفرة. 
                            يُمنع مشاركة معلومات الحساب مع أطراف خارجية.
                        </Text>
                    </View>
                </View>

                {/* Copyright */}
                <View style={styles.footer}>
                    <Text style={[styles.copyright, { color: theme.onSurfaceVariant, fontFamily: Typography.regular }]}>
                        © 2026 Elite - النخبة الهندسية
                    </Text>
                    <Text style={[styles.university, { color: theme.onSurfaceVariant, fontFamily: Typography.regular }]}>
                        جامعة العين العراقية • كلية الهندسة
                    </Text>
                    <Text style={[styles.madeWith, { color: theme.onSurfaceVariant, fontFamily: Typography.regular }]}>
                        صُنع بـ ❤️ في العراق
                    </Text>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { padding: 20, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between' },
    backBtn: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 20 },
    logoSection: { alignItems: 'center', padding: 30, paddingTop: 20 },
    logoContainer: { width: 120, height: 120, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    appName: { fontSize: 32, marginBottom: 8 },
    appTagline: { fontSize: 16, marginBottom: 16, textAlign: 'center' },
    versionBadge: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
    versionText: { fontSize: 14 },
    section: { paddingHorizontal: 20, marginBottom: 24 },
    sectionTitle: { fontSize: 18, marginBottom: 16, textAlign: 'right' },
    infoCard: { flexDirection: 'row-reverse', padding: 16, borderRadius: 16, marginBottom: 12, alignItems: 'center' },
    iconContainer: { width: 56, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginLeft: 16 },
    infoContent: { flex: 1, alignItems: 'flex-end' },
    infoTitle: { fontSize: 16, marginBottom: 4 },
    infoDescription: { fontSize: 13, textAlign: 'right' },
    aboutCard: { padding: 20, borderRadius: 16 },
    aboutText: { fontSize: 15, lineHeight: 24, textAlign: 'right' },
    techCard: { padding: 20, borderRadius: 16 },
    techRow: { flexDirection: 'row-reverse', justifyContent: 'space-around', marginBottom: 16 },
    techItem: { alignItems: 'center', gap: 8 },
    techText: { fontSize: 12 },
    legalCard: { padding: 20, borderRadius: 16 },
    legalText: { fontSize: 13, lineHeight: 22, textAlign: 'right' },
    developerCard: { 
        padding: 20, 
        borderRadius: 20, 
        flexDirection: 'row-reverse', 
        alignItems: 'center',
        gap: 16,
    },
    developerImage: { 
        width: 80, 
        height: 80, 
        borderRadius: 20,
        borderWidth: 3,
        borderColor: '#4F6630',
    },
    developerInfo: { 
        flex: 1, 
        alignItems: 'flex-end',
    },
    developerName: { 
        fontSize: 18, 
        marginBottom: 4,
    },
    developerTitle: { 
        fontSize: 14, 
        marginBottom: 12,
        opacity: 0.8,
    },
    developerBadges: {
        flexDirection: 'row-reverse',
        gap: 8,
    },
    devBadge: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 10,
        gap: 4,
    },
    devBadgeText: {
        fontSize: 11,
    },
    footer: { alignItems: 'center', paddingVertical: 20 },
    copyright: { fontSize: 12, marginBottom: 6 },
    university: { fontSize: 11, marginBottom: 6, opacity: 0.7 },
    madeWith: { fontSize: 12 },
});
