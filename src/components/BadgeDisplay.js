// src/components/BadgeDisplay.js
import React from 'react';
import { View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import GlassCard from './GlassCard';
import { FontSizes } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';

export default function BadgeDisplay({ badge, unlocked = false, size = 'medium' }) {
  const { colors: C } = useTheme();

  const iconSize = size === 'small' ? 24 : size === 'large' ? 40 : 32;
  const badgeSize = size === 'small' ? 56 : size === 'large' ? 80 : 68;

  return (
    <GlassCard noPadding variant={unlocked ? 'strong' : 'default'} style={{ padding: 14, alignItems: 'center', opacity: unlocked ? 1 : 0.5 }}>
      <View style={{
        width: badgeSize,
        height: badgeSize,
        borderRadius: badgeSize / 2,
        backgroundColor: unlocked ? (badge.color + '20') : C.glassBg,
        borderWidth: 2,
        borderColor: unlocked ? badge.color : C.glassBorder,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
      }}>
        <MaterialCommunityIcons name={badge.icon} size={iconSize} color={unlocked ? badge.color : C.textMuted} />
      </View>
      <Text style={{ fontSize: size === 'small' ? FontSizes.xs : FontSizes.sm, fontWeight: '700', color: unlocked ? C.textPrimary : C.textMuted, textAlign: 'center', marginBottom: 4 }}>{badge.name}</Text>
      <Text style={{ fontSize: FontSizes.xs - 2, color: C.textMuted, textAlign: 'center' }} numberOfLines={2}>{badge.description}</Text>
    </GlassCard>
  );
}
