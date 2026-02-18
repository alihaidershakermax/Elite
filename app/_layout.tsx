import { useColorScheme } from '@/hooks/use-color-scheme';
import { Cairo_400Regular, Cairo_700Bold, useFonts } from '@expo-google-fonts/cairo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import CustomSplashScreen from './splash';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [isReady, setIsReady] = useState(false);

  const [fontsLoaded, fontError] = useFonts({
    CairoRegular: Cairo_400Regular,
    CairoBold: Cairo_700Bold,
  });

  useEffect(() => {
    async function prepare() {
      try {
        const token = await AsyncStorage.getItem('userToken');

        // Wait for fonts to load (or fail)
        if (fontsLoaded || fontError) {
          // A short delay to show the liquid glass animation
          setTimeout(async () => {
            if (token) {
              router.replace('/(tabs)');
            } else {
              router.replace('/login');
            }
            setIsReady(true);
            await SplashScreen.hideAsync().catch(() => { });
          }, 3000);
        }
      } catch (e) {
        console.warn(e);
        setIsReady(true);
        await SplashScreen.hideAsync().catch(() => { });
      }
    }

    prepare();
  }, [fontsLoaded, fontError]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <View style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="login" />
          <Stack.Screen name="signup" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="admin-panel" />
          <Stack.Screen name="edit-profile" />
          <Stack.Screen name="announcements" />
          <Stack.Screen name="archive" />
          <Stack.Screen name="about" />
          <Stack.Screen name="chat" options={{ presentation: 'card' }} />
          <Stack.Screen name="notifications" options={{ presentation: 'card' }} />
          <Stack.Screen name="admin" />
          <Stack.Screen name="activity-detail" />
          <Stack.Screen name="announcement-detail" />
        </Stack>

        {!isReady && (
          <View style={StyleSheet.absoluteFill}>
            <CustomSplashScreen />
          </View>
        )}
      </View>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
