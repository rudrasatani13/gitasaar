// src/components/AppLogo.js
import React from 'react';
import { Image, Platform } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

const logoSource = require('../../assets/images/logo.png');

export default function AppLogo({ size = 60, style }) {
  const { isDark, colors: C } = useTheme();

  // Dark mode: tintColor makes black logo turn gold
  // Light mode: black logo looks great on cream bg
  const tint = isDark ? { tintColor: C.primary } : {};

  return (
    <Image
      source={logoSource}
      style={[{ width: size, height: size }, tint, style]}
      resizeMode="contain"
    />
  );
}