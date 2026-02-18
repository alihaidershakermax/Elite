import { Colors, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { Dimensions, Image, StyleSheet, Text, View } from 'react-native';
import Animated, {
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withSequence,
    withTiming
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

const CustomSplashScreen = () => {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    const logoScale = useSharedValue(0.3);
    const logoOpacity = useSharedValue(0);
    const textOpacity = useSharedValue(0);
    const glowOpacity = useSharedValue(0);
    const bgOpacity = useSharedValue(0);
    const liquidValue = useSharedValue(0);

    useEffect(() => {
        bgOpacity.value = withTiming(1, { duration: 2000 });

        logoScale.value = withTiming(1, { duration: 2500 });
        logoOpacity.value = withTiming(1, { duration: 2500 });

        glowOpacity.value = withDelay(1500, withRepeat(
            withSequence(
                withTiming(0.8, { duration: 3000 }),
                withTiming(0.3, { duration: 3000 })
            ),
            -1,
            true
        ));

        liquidValue.value = withRepeat(
            withTiming(1, { duration: 8000 }),
            -1,
            true
        );

        textOpacity.value = withDelay(2500, withTiming(1, { duration: 1500 }));
    }, []);

    const logoStyle = useAnimatedStyle(() => ({
        transform: [
            { scale: logoScale.value },
            { rotate: `${interpolate(logoScale.value, [0.3, 1], [45, 0])}deg` }
        ],
        opacity: logoOpacity.value,
    }));

    const glowStyle = useAnimatedStyle(() => ({
        opacity: glowOpacity.value,
        transform: [{ scale: interpolate(glowOpacity.value, [0.3, 0.8], [1, 1.2]) }],
    }));

    const textStyle = useAnimatedStyle(() => ({
        opacity: textOpacity.value,
        transform: [{ translateY: interpolate(textOpacity.value, [0, 1], [40, 0]) }],
    }));

    const liquidStyle1 = useAnimatedStyle(() => ({
        transform: [
            { translateX: interpolate(liquidValue.value, [0, 1], [-50, 50]) },
            { translateY: interpolate(liquidValue.value, [0, 1], [-30, 30]) }
        ],
    }));

    const liquidStyle2 = useAnimatedStyle(() => ({
        transform: [
            { translateX: interpolate(liquidValue.value, [0, 1], [50, -50]) },
            { translateY: interpolate(liquidValue.value, [0, 1], [30, -30]) }
        ],
    }));

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            {/* Deep Cinematic Background */}
            <View style={[StyleSheet.absoluteFill, { backgroundColor: '#020501' }]} />

            {/* Liquid Background elements (iOS Style) */}
            <Animated.View style={[styles.liquidOrb, liquidStyle1, { backgroundColor: theme.primary, top: '10%', left: '-10%', opacity: 0.15 }]} />
            <Animated.View style={[styles.liquidOrb, liquidStyle2, { backgroundColor: theme.primary, bottom: '15%', right: '-10%', opacity: 0.12 }]} />
            <View style={[styles.liquidOrb, { backgroundColor: '#fff', width: width, height: width, top: '40%', right: '-40%', opacity: 0.03 }]} />

            <View style={styles.content}>
                {/* Glass Glow Layer */}
                <Animated.View style={[styles.logoGlow, { borderColor: theme.primary }, glowStyle]} />

                {/* Liquid Glass Container */}
                <Animated.View style={[styles.logoContainer, logoStyle, { borderColor: 'rgba(255,255,255,0.15)' }]}>
                    <View style={styles.glassEffect}>
                        <View style={styles.circularMask}>
                            <Image
                                source={require('@/assets/images/logo.png')}
                                style={styles.logo}
                                resizeMode="cover"
                            />
                        </View>
                    </View>
                </Animated.View>

                {/* Typography with Glass Shadow */}
                <Animated.View style={[styles.textContainer, textStyle]}>
                    <Text style={[styles.title, { color: '#fff', fontFamily: Typography.bold }]}>ELITE</Text>
                    <View style={[styles.divider, { backgroundColor: theme.primary }]} />
                    <Text style={[styles.subtitle, { color: 'rgba(255,255,255,0.5)', fontFamily: Typography.regular }]}>
                        MANAGEMENT SYSTEM
                    </Text>
                </Animated.View>
            </View>

            {/* Premium Footer */}
            <Animated.View style={[styles.bottomContainer, textStyle]}>
                <View style={[styles.iosBadge, { backgroundColor: 'rgba(255,255,255,0.05)' }]}>
                    <Text style={[styles.credits, { color: 'rgba(255,255,255,0.3)', fontFamily: Typography.regular }]}>
                        AL-AYEN IRAQI UNIVERSITY • COLLEGE OF ENGINEERING
                    </Text>
                </View>
            </Animated.View>
        </View>
    );
};

export default CustomSplashScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
    },
    liquidOrb: {
        position: 'absolute',
        width: width * 1.5,
        height: width * 1.5,
        borderRadius: width * 0.75,
    },
    content: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoContainer: {
        width: 170,
        height: 170,
        borderRadius: 85,
        padding: 4,
        borderWidth: 1.5,
        backgroundColor: 'rgba(255,255,255,0.03)',
        zIndex: 2,
    },
    glassEffect: {
        flex: 1,
        borderRadius: 81,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    circularMask: {
        width: '100%',
        height: '100%',
        backgroundColor: '#fff',
    },
    logoGlow: {
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 100,
        borderWidth: 2,
        zIndex: 1,
    },
    logo: {
        width: '100%',
        height: '100%',
    },
    textContainer: {
        marginTop: 60,
        alignItems: 'center',
    },
    title: {
        fontSize: 52,
        letterSpacing: 14,
        textAlign: 'center',
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 4 },
        textShadowRadius: 10,
    },
    divider: {
        width: 80,
        height: 2,
        marginVertical: 18,
        borderRadius: 1,
    },
    subtitle: {
        fontSize: 11,
        letterSpacing: 8,
        textAlign: 'center',
    },
    bottomContainer: {
        position: 'absolute',
        bottom: 70,
        alignItems: 'center',
    },
    iosBadge: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    credits: {
        fontSize: 9,
        letterSpacing: 2,
    },
});
