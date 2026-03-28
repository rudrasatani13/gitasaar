// src/components/GlassCard.js
import React from 'react';
import { View, Platform, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../theme/ThemeContext';

/**
 * GlassCard — Glassmorphism card for the entire app.
 * Uses BlurView on native iOS/Android, backdropFilter on web.
 *
 * Props:
 *  intensity   — blur intensity (default 50)
 *  noPadding   — remove default padding
 *  style       — additional styles
 *  noBlur      — skip blur (for performance-sensitive areas)
 */
export default function GlassCard({
  children,
  style,
  noPadding = false,
  intensity = 50,
  noBlur = false,
}) {
  const { colors: C, isDark } = useTheme();

  const borderColor = C.glassBorder;

  const containerStyle = [
    styles.base,
    {
      borderRadius: 20,
      borderWidth: 1,
      borderColor,
      padding: noPadding ? 0 : 18,
      overflow: 'hidden',
    },
    C.shadowLight,
    style,
  ];

  // Web: use backdropFilter CSS
  if (Platform.OS === 'web') {
    return (
      <View
        style={[
          containerStyle,
          {
            backgroundColor: C.glassBg,
            backdropFilter: `blur(${intensity}px)`,
            WebkitBackdropFilter: `blur(${intensity}px)`,
          },
        ]}
      >
        {/* Top shimmer line */}
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 1,
            backgroundColor: C.glassHighlight,
          }}
        />
        {children}
      </View>
    );
  }

  // iOS only: BlurView with tint — Android BlurView renders grey/white regardless of theme
  if (!noBlur && Platform.OS === 'ios') {
    return (
      <BlurView
        intensity={intensity}
        tint={isDark ? 'dark' : 'light'}
        style={[containerStyle, { backgroundColor: 'transparent' }]}
      >
        {/* Translucent overlay for color tinting */}
        <View
          style={[
            StyleSheet.absoluteFillObject,
            { backgroundColor: C.glassBg, borderRadius: 20 },
          ]}
        />
        {/* Top shimmer highlight */}
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 1,
            backgroundColor: C.glassHighlight,
          }}
        />
        {children}
      </BlurView>
    );
  }

  // Android + noBlur: warm translucent background matching the app theme
  return (
    <View style={[containerStyle, { backgroundColor: isDark ? C.glassBg : C.glassBgStrong }]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    position: 'relative',
  },
});