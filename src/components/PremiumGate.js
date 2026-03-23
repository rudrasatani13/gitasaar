// src/components/PremiumGate.js
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import { FontSizes } from '../theme/colors';

// Inline banner - shows in chat/quiz when limit hit
export function PremiumBanner({ title, subtitle, icon }) {
  const { colors: C } = useTheme();
  const navigation = useNavigation();

  return (
    <TouchableOpacity onPress={() => navigation.navigate('Premium')} activeOpacity={0.85}>
      <LinearGradient colors={C.gradientGold} style={{ borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 8 }}>
        <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' }}>
          <MaterialCommunityIcons name={icon || 'crown'} size={20} color={C.textOnPrimary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: FontSizes.sm, fontWeight: '700', color: C.textOnPrimary }}>{title || 'Upgrade to Premium'}</Text>
          <Text style={{ fontSize: FontSizes.xs, color: 'rgba(255,249,240,0.75)', marginTop: 2 }}>{subtitle || 'Unlock unlimited access'}</Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={18} color={C.textOnPrimary} />
      </LinearGradient>
    </TouchableOpacity>
  );
}

// Lock badge - shows on locked features
export function PremiumLock({ size = 16 }) {
  const { colors: C } = useTheme();
  return (
    <View style={{ width: size + 6, height: size + 6, borderRadius: (size + 6) / 2, backgroundColor: C.primary, justifyContent: 'center', alignItems: 'center' }}>
      <MaterialCommunityIcons name="lock" size={size - 2} color={C.textOnPrimary} />
    </View>
  );
}

// Premium badge - shows next to premium features
export function PremiumBadge() {
  const { colors: C } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: C.primary + '15', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, borderWidth: 1, borderColor: C.primary + '30' }}>
      <MaterialCommunityIcons name="crown" size={10} color={C.primary} />
      <Text style={{ fontSize: 9, fontWeight: '800', color: C.primary, letterSpacing: 0.5 }}>PRO</Text>
    </View>
  );
}

// Usage counter - shows remaining free uses
export function UsageCounter({ remaining, total, label }) {
  const { colors: C } = useTheme();
  const isLow = remaining <= 2;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, backgroundColor: isLow ? '#FFF0F0' : C.bgSecondary, borderWidth: 1, borderColor: isLow ? '#FFD0D0' : C.border }}>
      <MaterialCommunityIcons name={isLow ? 'alert-circle' : 'lightning-bolt'} size={12} color={isLow ? '#D63B2F' : C.primary} />
      <Text style={{ fontSize: 10, fontWeight: '700', color: isLow ? '#D63B2F' : C.textMuted }}>{remaining}/{total} {label}</Text>
    </View>
  );
}

export default PremiumBanner;