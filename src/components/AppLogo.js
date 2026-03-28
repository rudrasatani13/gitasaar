// src/components/AppLogo.js
import React from 'react';
import { Image } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

const logoSource = require('../../assets/images/logo.png');

export default function AppLogo({ size = 60, style }) {
  const { colors: C } = useTheme();
  // Always use gold tint — space theme is always dark
  return (
    <Image
      source={logoSource}
      style={[{ width: size, height: size, tintColor: C.primary }, style]}
      resizeMode="contain"
    />
  );
}