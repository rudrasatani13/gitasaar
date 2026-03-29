// src/components/GlassCard.js
import React from 'react';
import { View, Platform, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../theme/ThemeContext';

/**
 * GlassCard — Enhanced Glassmorphism card matching iOS/modern design standards.
 * Uses BlurView on native iOS/Android, backdropFilter on web.
 * Updated to match reference frosted glass aesthetic.
 *
 * Props:
 *  intensity   — blur intensity (default 80 for strong frosted effect)
 *  noPadding   — remove default padding
 *  style       — additional styles
 *  noBlur      — skip blur (for performance-sensitive areas)
 *  variant     — 'default' | 'strong' | 'subtle'
 */
export default function GlassCard({
  children,
  style,
  noPadding = false,
  intensity = 80,
  noBlur = false,
  variant = 'default',
}) {
  const { colors: C, isDark } = useTheme();

  // Enhanced blur intensities based on variant
  const blurIntensity = variant === 'strong' ? 100 : variant === 'subtle' ? 60 : intensity;
  
  // Stronger borders for better definition
  const borderColor = isDark 
    ? (variant === 'strong' ? C.glassBorderGold : C.glassBorder)
    : (variant === 'strong' ? C.borderGoldStrong : C.border);

  const containerStyle = [
    styles.base,
    {
      borderRadius: 20,
      borderWidth: variant === 'strong' ? 1.5 : 1,
      borderColor,
      padding: noPadding ? 0 : 18,
      overflow: 'hidden',
    },
    variant === 'strong' ? C.shadowGold : C.shadowLight,
    style,
  ];

  // Enhanced background opacity for better frosted effect
  const enhancedGlassBg = isDark
    ? (variant === 'strong' ? 'rgba(224, 168, 80, 0.12)' : 'rgba(10, 10, 10, 0.75)')
    : (variant === 'strong' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.80)');

  // Web: use backdropFilter CSS with enhanced blur
  if (Platform.OS === 'web') {
    return (
      <View
        style={[
          containerStyle,
          {
            backgroundColor: enhancedGlassBg,
            backdropFilter: `blur(${blurIntensity}px) saturate(180%)`,
            WebkitBackdropFilter: `blur(${blurIntensity}px) saturate(180%)`,
          },
        ]}
      >
        {/* Top shimmer line - more prominent */}
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 1,
            backgroundColor: C.glassHighlight,
            opacity: 0.6,
          }}
        />
        {children}
      </View>
    );
  }

  // iOS & Android: Enhanced BlurView
  if (!noBlur) {
    return (
      <BlurView
        intensity={blurIntensity}
        tint={isDark ? 'dark' : 'light'}
        style={[containerStyle, { backgroundColor: 'transparent' }]}
      >
        {/* Enhanced translucent overlay for stronger frosted effect */}
        <View
          style={[
            StyleSheet.absoluteFillObject,
            { 
              backgroundColor: enhancedGlassBg, 
              borderRadius: 20,
            },
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
            opacity: 0.5,
          }}
        />
        {children}
      </BlurView>
    );
  }

  // Fallback: solid card with subtle transparency
  return (
    <View style={[containerStyle, {
      backgroundColor: enhancedGlassBg,
    }]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    position: 'relative',
  },
});