// src/components/GlassCard.js
import React from 'react';
import { View, Platform } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export default function GlassCard({ children, style, borderGlow = false, noPadding = false }) {
  const { colors: C, isDark } = useTheme();

  const glassStyle = {
    backgroundColor: isDark ? 'rgba(30, 24, 20, 0.65)' : 'rgba(255, 255, 255, 0.55)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(224, 168, 80, 0.12)' : 'rgba(255, 255, 255, 0.8)',
    padding: noPadding ? 0 : 18,
    ...(Platform.OS === 'web' ? {
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
    } : {}),
    ...C.shadowLight,
    ...(borderGlow ? {
      borderColor: isDark ? 'rgba(224, 168, 80, 0.25)' : 'rgba(194, 136, 64, 0.25)',
      ...C.shadowGold,
    } : {}),
  };

  return (
    <View style={[glassStyle, style]}>
      {children}
    </View>
  );
}