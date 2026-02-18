import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.welcomeText, { color: theme.onSurfaceVariant }]}>أهلاً بك 👋</Text>
            <Text style={[styles.appName, { color: theme.onSurface }]}>Elite Engineering</Text>
          </View>
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: theme.elevation.level2 }]}
            onPress={() => router.push('/announcements' as any)}
          >
            <Ionicons name="notifications-outline" size={24} color={theme.onSurfaceVariant} />
            <View style={[styles.badge, { backgroundColor: theme.error }]} />
          </TouchableOpacity>
        </View>

        {/* Action Buttons - M3 Style */}
        <View style={styles.actionContainer}>
          <TouchableOpacity style={[styles.actionCard, { backgroundColor: theme.primaryContainer }]}>
            <Ionicons name="person-add-outline" size={32} color={theme.onPrimaryContainer} />
            <Text style={[styles.actionText, { color: theme.onPrimaryContainer }]}>انضم لللجنة</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionCard, { backgroundColor: theme.secondaryContainer }]}>
            <Ionicons name="calendar-outline" size={32} color={theme.onSecondaryContainer} />
            <Text style={[styles.actionText, { color: theme.onSecondaryContainer }]}>سجل الآن</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Announcements */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.onSurface }]}>إعلانات حديثة</Text>
          <TouchableOpacity onPress={() => router.push('/announcements' as any)}>
            <Text style={[styles.seeAll, { color: theme.primary }]}>عرض الكل</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {[1, 2, 3].map((i) => (
            <View key={i} style={[styles.announcementCard, { backgroundColor: theme.surfaceVariant }]}>
              <View style={[styles.categoryTag, { backgroundColor: theme.primaryContainer }]}>
                <Text style={[styles.categoryText, { color: theme.onPrimaryContainer }]}>إعلان عام</Text>
              </View>
              <Text style={[styles.announcementTitle, { color: theme.onSurface }]}>فتح باب التسجيل للأنشطة الصيفية</Text>
              <Text style={[styles.announcementDate, { color: theme.onSurfaceVariant }]}>منذ ساعتين</Text>
            </View>
          ))}
        </ScrollView>

        {/* Upcoming Events */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.onSurface }]}>فعاليات قادمة</Text>
          <TouchableOpacity onPress={() => router.push('/activities' as any)}>
            <Text style={[styles.seeAll, { color: theme.primary }]}>عرض الكل</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.eventsList}>
          {[1, 2].map((i) => (
            <TouchableOpacity key={i} style={[styles.eventCard, { backgroundColor: theme.surface }]}>
              <Image
                source={{ uri: `https://picsum.photos/seed/${i + 10}/400/200` }}
                style={styles.eventImage}
              />
              <View style={styles.eventInfo}>
                <Text style={[styles.eventTitle, { color: theme.onSurface }]}>ندوة الابتكار الهندسي 2024</Text>
                <View style={styles.eventDetails}>
                  <View style={styles.detailRow}>
                    <Ionicons name="location-outline" size={16} color={theme.primary} />
                    <Text style={[styles.detailText, { color: theme.onSurfaceVariant }]}>قاعة المؤتمرات الكبرى</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="time-outline" size={16} color={theme.primary} />
                    <Text style={[styles.detailText, { color: theme.onSurfaceVariant }]}>10:00 صباحاً</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Media Access */}
        <TouchableOpacity
          style={[styles.archiveBanner, { backgroundColor: theme.tertiaryContainer }]}
          onPress={() => router.push('/archive' as any)}
        >
          <View>
            <Text style={[styles.archiveTitle, { color: theme.onTertiaryContainer }]}>أرشيف الأنشطة</Text>
            <Text style={[styles.archiveSubtitle, { color: theme.onTertiaryContainer }]}>شاهد صور وتقارير الفعاليات السابقة</Text>
          </View>
          <Ionicons name="images-outline" size={40} color={theme.onTertiaryContainer} />
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>
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
  welcomeText: {
    fontSize: 14,
    fontFamily: 'System',
    textAlign: 'right',
  },
  appName: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'right',
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: 12,
    right: 14,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#FFF',
  },
  actionContainer: {
    flexDirection: 'row-reverse',
    padding: 24,
    gap: 16,
  },
  actionCard: {
    flex: 1,
    height: 120,
    borderRadius: 28, // M3 Large radius
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'right',
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
  },
  horizontalScroll: {
    paddingRight: 24,
    marginBottom: 24,
  },
  announcementCard: {
    width: 280,
    padding: 24,
    borderRadius: 24,
    marginLeft: 16,
  },
  categoryTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  announcementTitle: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
    textAlign: 'right',
    marginBottom: 12,
  },
  announcementDate: {
    fontSize: 12,
    textAlign: 'right',
  },
  eventsList: {
    paddingHorizontal: 24,
    gap: 16,
  },
  eventCard: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  eventImage: {
    width: '100%',
    height: 160,
  },
  eventInfo: {
    padding: 16,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'right',
    marginBottom: 10,
  },
  eventDetails: {
    flexDirection: 'row-reverse',
    gap: 16,
  },
  detailRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 13,
  },
  archiveBanner: {
    margin: 24,
    padding: 24,
    borderRadius: 28,
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  archiveTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'right',
  },
  archiveSubtitle: {
    fontSize: 13,
    textAlign: 'right',
    marginTop: 4,
    opacity: 0.8,
  },
});
