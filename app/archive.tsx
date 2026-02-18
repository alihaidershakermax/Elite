import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 64) / 2;

const ARCHIVE_DATA = [
    { id: '1', title: 'فعالية الابتكار 2023', type: 'صور', count: 45, image: 'https://picsum.photos/seed/arc1/400/400' },
    { id: '2', title: 'تقرير النصف سنوي', type: 'تقارير', count: 12, image: 'https://picsum.photos/seed/arc2/400/400' },
    { id: '3', title: 'ورشة الذكاء الاصطناعي', type: 'صور', count: 28, image: 'https://picsum.photos/seed/arc3/400/400' },
    { id: '4', title: 'حملة التشجير 2024', type: 'صور', count: 15, image: 'https://picsum.photos/seed/arc4/400/400' },
    { id: '5', title: 'دليل ميثاق اللجنة', type: 'تقارير', count: 1, image: 'https://picsum.photos/seed/arc5/400/400' },
    { id: '6', title: 'المسابقة البرمجية', type: 'صور', count: 62, image: 'https://picsum.photos/seed/arc6/400/400' },
];

export default function ArchiveScreen() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const [activeTab, setActiveTab] = useState('الكل');

    const renderItem = ({ item }: { item: typeof ARCHIVE_DATA[0] }) => (
        <TouchableOpacity style={[styles.gridItem, { backgroundColor: theme.surfaceVariant }]}>
            <Image source={{ uri: item.image }} style={styles.gridImage} />
            <View style={styles.itemOverlay}>
                <View style={[styles.countBadge, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
                    <Text style={styles.countText}>{item.count}</Text>
                    <Ionicons name={item.type === 'صور' ? 'image' : 'document-text'} size={12} color="#FFF" />
                </View>
            </View>
            <View style={styles.itemInfo}>
                <Text style={[styles.itemTitle, { color: theme.onSurface }]} numberOfLines={1}>{item.title}</Text>
                <Text style={[styles.itemType, { color: theme.onSurfaceVariant }]}>{item.type}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: theme.surfaceVariant }]}>
                    <Ionicons name="chevron-forward" size={24} color={theme.onSurfaceVariant} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.onSurface }]}>الأرشيف والوسائط</Text>
                <View style={{ width: 48 }} />
            </View>

            <View style={styles.tabsContainer}>
                {['الكل', 'صور', 'تقارير'].map((tab) => (
                    <TouchableOpacity
                        key={tab}
                        onPress={() => setActiveTab(tab)}
                        style={[
                            styles.tab,
                            {
                                backgroundColor: activeTab === tab ? theme.primaryContainer : 'transparent',
                                borderColor: theme.outline
                            }
                        ]}
                    >
                        <Text style={[styles.tabText, { color: activeTab === tab ? theme.onPrimaryContainer : theme.onSurfaceVariant }]}>{tab}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <FlatList
                data={activeTab === 'الكل' ? ARCHIVE_DATA : ARCHIVE_DATA.filter(i => i.type === activeTab)}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                numColumns={2}
                contentContainerStyle={styles.gridContent}
                columnWrapperStyle={styles.gridRow}
                showsVerticalScrollIndicator={false}
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
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '700',
    },
    backBtn: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tabsContainer: {
        flexDirection: 'row-reverse',
        paddingHorizontal: 24,
        marginBottom: 20,
        gap: 12,
    },
    tab: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 28,
        borderWidth: 1,
    },
    tabText: {
        fontWeight: '600',
        fontSize: 14,
    },
    gridContent: {
        padding: 24,
        paddingTop: 0,
        paddingBottom: 40,
    },
    gridRow: {
        justifyContent: 'space-between',
        marginBottom: 20,
        flexDirection: 'row-reverse',
    },
    gridItem: {
        width: COLUMN_WIDTH,
        borderRadius: 24, // M3 Medium radius
        overflow: 'hidden',
    },
    gridImage: {
        width: '100%',
        height: 150,
    },
    itemOverlay: {
        ...StyleSheet.absoluteFillObject,
        height: 150,
        backgroundColor: 'rgba(0,0,0,0.05)',
    },
    countBadge: {
        position: 'absolute',
        top: 10,
        right: 10,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    countText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: '700',
    },
    itemInfo: {
        padding: 16,
    },
    itemTitle: {
        fontSize: 14,
        fontWeight: '700',
        textAlign: 'right',
        marginBottom: 4,
    },
    itemType: {
        fontSize: 12,
        textAlign: 'right',
    },
});
