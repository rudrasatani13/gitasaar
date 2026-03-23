import AppLogo from "../components/AppLogo";
// src/screens/SplashScreen.js
import React, { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeContext';
import { FontSizes } from '../theme/colors';

export default function SplashScreen({ navigation }) {
  const { colors: C } = useTheme();
  const omScale = useRef(new Animated.Value(0.3)).current;
  const omOpacity = useRef(new Animated.Value(0)).current;
  const ringRotate = useRef(new Animated.Value(0)).current;
  const ringOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textY = useRef(new Animated.Value(20)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const glowPulse = useRef(new Animated.Value(0.15)).current;
  const bottomOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(ringRotate, { toValue: 1, duration: 12000, useNativeDriver: true })
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, { toValue: 0.4, duration: 1500, useNativeDriver: true }),
        Animated.timing(glowPulse, { toValue: 0.15, duration: 1500, useNativeDriver: true }),
      ])
    ).start();

    Animated.sequence([
      Animated.delay(300),
      Animated.timing(ringOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.parallel([
        Animated.spring(omScale, { toValue: 1, friction: 6, tension: 40, useNativeDriver: true }),
        Animated.timing(omOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]),
      Animated.delay(300),
      Animated.parallel([
        Animated.timing(textOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.spring(textY, { toValue: 0, friction: 8, useNativeDriver: true }),
      ]),
      Animated.timing(subtitleOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(bottomOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(() => navigation.replace('Auth'), 3200);
    return () => clearTimeout(timer);
  }, []);

  const spin = ringRotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <LinearGradient colors={C.gradientWarm} style={{ flex: 1, width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
      <View style={{ position: 'absolute', top: -80, right: -80, width: 250, height: 250, borderRadius: 125, backgroundColor: C.primary, opacity: 0.03 }} />
      <View style={{ position: 'absolute', bottom: -100, left: -100, width: 300, height: 300, borderRadius: 150, backgroundColor: C.primary, opacity: 0.02 }} />

      {/* Main column - everything stacked vertically */}
      <View style={{ alignItems: 'center' }}>
        {/* Om + Ring box */}
        <View style={{ width: 160, height: 160, justifyContent: 'center', alignItems: 'center', marginBottom: 44 }}>
          <Animated.View style={{ position: 'absolute', width: 140, height: 140, borderRadius: 70, backgroundColor: C.primary, opacity: glowPulse }} />
          <Animated.View style={{ position: 'absolute', width: 160, height: 160, opacity: ringOpacity, transform: [{ rotate: spin }] }}>
            <View style={{ width: 160, height: 160, borderRadius: 80, borderWidth: 1.5, borderColor: C.borderGoldStrong, borderStyle: 'dashed' }} />
            <View style={{ position: 'absolute', top: -4, left: 76, width: 8, height: 8, borderRadius: 4, backgroundColor: C.primary }} />
            <View style={{ position: 'absolute', bottom: -4, left: 76, width: 8, height: 8, borderRadius: 4, backgroundColor: C.primary }} />
            <View style={{ position: 'absolute', left: -4, top: 76, width: 8, height: 8, borderRadius: 4, backgroundColor: C.primary }} />
            <View style={{ position: 'absolute', right: -4, top: 76, width: 8, height: 8, borderRadius: 4, backgroundColor: C.primary }} />
          </Animated.View>
          <Animated.View style={{ opacity: omOpacity, transform: [{ scale: omScale }] }}><AppLogo size={100} /></Animated.View>
        </View>

        {/* Title - BELOW ring with 44px gap */}
        <Animated.View style={{ alignItems: 'center', opacity: textOpacity, transform: [{ translateY: textY }] }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: C.primary, letterSpacing: 6, marginBottom: 8 }}>GITASAAR</Text>
          <Text style={{ fontSize: FontSizes.xxl, color: C.primary, fontWeight: '300' }}>{'गीता सार'}</Text>
        </Animated.View>

        {/* Subtitle */}
        <Animated.View style={{ alignItems: 'center', marginTop: 16, opacity: subtitleOpacity }}>
          <Text style={{ fontSize: FontSizes.sm, color: C.textMuted, letterSpacing: 1 }}>Your AI Spiritual Companion</Text>
        </Animated.View>
      </View>

      {/* Bottom ornament */}
      <Animated.View style={{ position: 'absolute', bottom: 50, alignItems: 'center', opacity: bottomOpacity }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ width: 30, height: 1, backgroundColor: C.primary, opacity: 0.3 }} />
          <View style={{ width: 6, height: 6, backgroundColor: C.primary, opacity: 0.4, transform: [{ rotate: '45deg' }] }} />
          <View style={{ width: 30, height: 1, backgroundColor: C.primary, opacity: 0.3 }} />
        </View>
      </Animated.View>
    </LinearGradient>
  );
}