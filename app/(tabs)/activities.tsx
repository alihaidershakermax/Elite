import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ACTIVITIES_DATA = [
    {
        id: '1',
        title: 'ملتقى التوظيف الهندسي',
        description: 'يوم مفتوح للتواصل مع كبرى الشركات الهندسية وتوفير فرص عمل وتدريب للطلاب والخريجين.',
        date: '25 مايو 2024',
        committee: 'لجنة العلاقات العامة',
        image: 'https://picsum.photos/seed/act1/400/200',
    },
    {
        id: '2',
        title: 'ورشة عمل الروبوتات',
        description: 'تعلم أساسيات بناء وبرمجة الروبوتات باستخدام Arduino و Raspberry Pi.',
        date: '10 يونيو 2024',
        committee: 'اللجنة العلمية',
        image: 'https://picsum.photos/seed/act2/400/200',
    },
    {
        id: '3',
        title: 'دوري كرة القدم للهندسة',
        description: 'البطولة السنوية لكرة القدم بين الأقسام الأكاديمية المختلفة في الكلية.',
        date: '15 يونيو 2024',
        committee: 'اللجنة الرياضية',
        image: 'https://picsum.photos/seed/act3/400/200',
    },
];

export default function ActivitiesScreen() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const [searchQuery, setSearchQuery] = useState('');

    const renderActivity = ({ item }: { item: typeof ACTIVITIES_DATA[0] }) => (
        <View style={[styles.card, { backgroundColor: theme.surfaceVariant }]}>
            <Image source={{ uri: item.image }} style={styles.image} />
            <View style={styles.content}>
                <View style={styles.row}>
                    <View style={[styles.tag, { backgroundColor: theme.primaryContainer }]}>
                        <Text style={[styles.tagText, { color: theme.onPrimaryContainer }]}>{item.committee}</Text>
                    </View>
                    <Text style={[styles.dateText, { color: theme.onSurfaceVariant }]}>{item.date}</Text>
                </View>
                <Text style={[styles.title, { color: theme.onSurface }]}>{item.title}</Text>
                <Text style={[styles.description, { color: theme.onSurfaceVariant }]} numberOfLines={2}>
                    {item.description}
                </Text>
                <TouchableOpacity style={[styles.registerButton, { backgroundColor: theme.primary }]}>
                    <Text style={[styles.buttonText, { color: theme.onPrimary }]}>سجل الآن</Text>
                    <Ionicons name="chevron-back" size={18} color={theme.onPrimary} />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: theme.onSurface }]}>قائمة الأنشطة</Text>
                <View style={[styles.searchContainer, { backgroundColor: theme.elevation.level2 }]}>
                    <Ionicons name="search-outline" size={20} color={theme.onSurfaceVariant} />
                    <TextInput
                        placeholder="بحث عن نشاط..."
                        placeholderTextColor={theme.onSurfaceVariant}
                        style={[styles.searchInput, { color: theme.onSurface }]}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        textAlign="right"
                    />
                </View>
            </View>

            <FlatList
                data={ACTIVITIES_DATA}
                renderItem={renderActivity}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
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
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
        textAlign: 'right',
        marginBottom: 20,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        borderRadius: 28, // M3 Search bar radius
        height: 56,
    },
    searchInput: {
        flex: 1,
        marginRight: 12,
        fontSize: 16,
    },
    listContent: {
        padding: 24,
        paddingTop: 0,
        gap: 20,
        paddingBottom: 100,
    },
    card: {
        borderRadius: 24, // M3 Card radius
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: 180,
    },
    content: {
        padding: 20,
    },
    row: {
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    tag: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    tagText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    dateText: {
        fontSize: 12,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'right',
        marginBottom: 10,
    },
    description: {
        fontSize: 14,
        textAlign: 'right',
        lineHeight: 20,
        marginBottom: 20,
    },
    registerButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 12,
        borderRadius: 16,
        gap: 8,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});
