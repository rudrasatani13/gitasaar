// src/components/GlassInput.js
import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../theme/ThemeContext';
import { FontSizes } from '../theme/colors';

/**
 * GlassInput — Glassmorphism-styled text input.
 * Drop-in replacement for the plain View+TextInput pattern used throughout the app.
 *
 * Props mirror TextInput, plus:
 *  leftIcon    — JSX element shown on the left
 *  rightIcon   — JSX element shown on the right
 *  focused     — controlled "focused" state for border glow
 *  intensity   — blur intensity (default 40)
 */
export default function GlassInput({
  leftIcon,
  rightIcon,
  style,
  inputStyle,
  intensity = 40,
  ...textInputProps
}) {
  const { colors: C, isDark } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const borderColor = isFocused ? C.glassBorderGold : C.glassBorder;
  const shadowStyle = isFocused ? C.glassShadow : C.shadowLight;

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
      {/* Translucent overlay */}
      <View
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: C.glassInputBg,
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
            backgroundColor: C.glassInputBg,
            backdropFilter: `blur(${intensity}px)`,
            WebkitBackdropFilter: `blur(${intensity}px)`,
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
