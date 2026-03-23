// src/components/AnimatedTabIcon.js
import React, { useRef, useEffect } from 'react';
import { Animated, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const ICONS = {
  Home: { active: 'om', inactive: 'om' },
  Journal: { active: 'book-edit', inactive: 'book-edit-outline' },
  Verses: { active: 'book-open-page-variant', inactive: 'book-open-page-variant-outline' },
  Chat: { active: 'chat', inactive: 'chat-outline' },
  Settings: { active: 'cog', inactive: 'cog-outline' },
};

export default function AnimatedTabIcon({ name, focused, color, size = 22 }) {
  const scale = useRef(new Animated.Value(focused ? 1.12 : 1)).current;

  useEffect(() => {
    Animated.timing(scale, { toValue: focused ? 1.12 : 1, duration: 200, useNativeDriver: true }).start();
  }, [focused]);

  const iconSet = ICONS[name] || { active: 'circle', inactive: 'circle-outline' };
  const iconName = focused ? iconSet.active : iconSet.inactive;

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <MaterialCommunityIcons name={iconName} size={size} color={color} />
    </Animated.View>
  );
}
