import { Colors, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.onSurfaceVariant,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.elevation.level2,
          borderTopWidth: 0,
          height: 80,
          paddingBottom: 14,
          paddingTop: 8,
          elevation: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.06,
          shadowRadius: 12,
        },
        tabBarLabelStyle: {
          fontFamily: Typography.bold,
          fontSize: 11,
          marginTop: 2,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'الرئيسية',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons size={focused ? 26 : 24} name={focused ? 'home' : 'home-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="activities"
        options={{
          title: 'الأنشطة',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons size={focused ? 26 : 24} name={focused ? 'calendar' : 'calendar-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: 'المهام',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons size={focused ? 26 : 24} name={focused ? 'list-circle' : 'list-circle-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="committees"
        options={{
          title: 'اللجان',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons size={focused ? 26 : 24} name={focused ? 'briefcase' : 'briefcase-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'حسابي',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons size={focused ? 26 : 24} name={focused ? 'person-circle' : 'person-circle-outline'} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
