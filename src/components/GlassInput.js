// src/components/GlassInput.js
import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../theme/ThemeContext';
import { FontSizes } from '../theme/colors';

/**
 * GlassInput — Enhanced Glassmorphism-styled text input.
 * Drop-in replacement for the plain View+TextInput pattern used throughout the app.
 * Updated with stronger frosted glass effect.
 *
 * Props mirror TextInput, plus:
 *  leftIcon    — JSX element shown on the left
 *  rightIcon   — JSX element shown on the right
 *  focused     — controlled "focused" state for border glow
 *  intensity   — blur intensity (default 70 for enhanced frosted effect)
 */
export default function GlassInput({
  leftIcon,
  rightIcon,
  style,
  inputStyle,
  intensity = 70,
  ...textInputProps
}) {
  const { colors: C, isDark } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const borderColor = isFocused ? C.glassBorderGold : (isDark ? C.glassBorder : C.border);
  const shadowStyle = isFocused ? C.glassShadow : C.shadowLight;

  // Enhanced background for better frosted effect
  const enhancedInputBg = isDark
    ? 'rgba(10, 10, 10, 0.80)'
    : 'rgba(255, 255, 255, 0.85)';

  const inner = (
    <>
      {/* Shimmer top line */}
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
      {/* Enhanced translucent overlay */}
      <View
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: enhancedInputBg,
          borderRadius: 16,
        }}
      />
      {/* Content row */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 }}>
        {leftIcon && <View style={{ marginRight: 10 }}>{leftIcon}</View>}
        <TextInput
          style={[
            {
              flex: 1,
              fontSize: FontSizes.md,
              color: C.textPrimary,
              paddingVertical: 15,
            },
            inputStyle,
          ]}
          placeholderTextColor={C.textMuted}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...textInputProps}
        />
        {rightIcon && <View style={{ marginLeft: 10 }}>{rightIcon}</View>}
      </View>
    </>
  );

  const containerStyle = [
    {
      borderRadius: 16,
      borderWidth: isFocused ? 1.5 : 1,
      borderColor,
      overflow: 'hidden',
      marginBottom: 12,
      position: 'relative',
    },
    style,
  ];

  if (Platform.OS === 'web') {
    return (
      <View
        style={[
          containerStyle,
          {
            backgroundColor: enhancedInputBg,
            backdropFilter: `blur(${intensity}px) saturate(180%)`,
            WebkitBackdropFilter: `blur(${intensity}px) saturate(180%)`,
          },
        ]}
      >
        {inner}
      </View>
    );
  }

  return (
    <BlurView
      intensity={intensity}
      tint={isDark ? 'dark' : 'light'}
      style={[containerStyle, { backgroundColor: 'transparent' }]}
    >
      {inner}
    </BlurView>
  );
}
