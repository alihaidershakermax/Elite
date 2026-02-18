import { Colors, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, FlatList, Image, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function ArchiveScreen() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const [refreshing, setRefreshing] = useState(false);

    // Mock archived items
    const archiveItems = [
        { id: '1', title: 'فعالية التخرج 2023', date: 'يونيو 2023', type: 'فعالية', image: 'https://picsum.photos/seed/arch1/400/200' },
        { id: '2', title: 'دورة هندسة الذكاء الاصطناعي', date: 'ديسمبر 2022', type: 'دورة', image: 'https://picsum.photos/seed/arch2/400/200' },
        { id: '3', title: 'تكريم المبدعين السنوي', date: 'مارس 2023', type: 'تكريم', image: 'https://picsum.photos/seed/arch3/400/200' },
        { id: '4', title: 'مسابقة الابتكار الهندسي', date: 'نوفمبر 2022', type: 'مسابقة', image: 'https://picsum.photos/seed/arch4/400/200' },
    ];

    const onRefresh = () => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 1500);
    };

    const renderItem = ({ item, index }: { item: any, index: number }) => (
        <Animated.View entering={FadeInUp.delay(index * 100)} style={[styles.card, { backgroundColor: theme.surfaceVariant }]}>
            <Image source={{ uri: item.image }} style={styles.image} />
            <View style={styles.cardOverlay}>
                <View style={[styles.typeBadge, { backgroundColor: theme.primaryContainer }]}>
                    <Text style={[styles.typeText, { color: theme.onPrimaryContainer, fontFamily: Typography.bold }]}>{item.type}</Text>
                </View>
                <Text style={[styles.title, { fontFamily: Typography.bold }]}>{item.title}</Text>
                <View style={styles.dateRow}>
                    <Ionicons name="calendar-outline" size={14} color="#EEE" />
                    <Text style={[styles.dateText, { fontFamily: Typography.regular }]}>{item.date}</Text>
                </View>
            </View>
        </Animated.View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: theme.elevation.level2 }]}>
                    <Ionicons name="chevron-forward" size={24} color={theme.onSurface} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.onSurface, fontFamily: Typography.bold }]}>الأرشيف الهندسي</Text>
            </View>

            <FlatList
                data={archiveItems}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
                numColumns={2}
                columnWrapperStyle={styles.columnWrapper}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: 24,
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: 16,
    },
    headerTitle: {
        fontSize: 20,
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: 24,
        paddingTop: 0,
        paddingBottom: 100,
    },
    columnWrapper: {
        justifyContent: 'space-between',
        gap: 12,
        marginBottom: 12,
    },
    card: {
        width: (width - 60) / 2,
        height: 180,
        borderRadius: 24,
        overflow: 'hidden',
        backgroundColor: '#000',
    },
    image: {
        width: '100%',
        height: '100%',
        opacity: 0.6,
    },
    cardOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 12,
    },
    typeBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
        marginBottom: 6,
    },
    typeText: {
        fontSize: 9,
    },
    title: {
        color: '#FFF',
        fontSize: 14,
        textAlign: 'right',
    },
    dateRow: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        gap: 4,
        marginTop: 4,
    },
    dateText: {
        color: '#EEE',
        fontSize: 10,
    },
});
