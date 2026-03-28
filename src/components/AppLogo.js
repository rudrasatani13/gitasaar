// src/components/AppLogo.js
import React from 'react';
import { Image } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

const logoSource = require('../../assets/images/logo.png');

export default function AppLogo({ size = 60, style }) {
  const { isDark, colors: C } = useTheme();
  // Dark mode → gold tint | Light mode → original black (looks great on parchment)
  const tintStyle = isDark ? { tintColor: C.primary } : {};
  return (
    <Image
      source={logoSource}
      style={[{ width: size, height: size }, tintStyle, style]}
      resizeMode="contain"
    />
  );
}