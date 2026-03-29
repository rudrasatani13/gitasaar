// src/screens/MantraPlayerScreen.js
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import GlassCard from '../components/GlassCard';
import { useTheme } from '../theme/ThemeContext';
import { useMantras } from '../theme/MantraContext';
import { FontSizes } from '../theme/colors';
import { StarfieldBackground } from '../components/SpiritualBackground';
import * as Haptics from 'expo-haptics';

export default function MantraPlayerScreen({ navigation, route }) {
  const { colors: C } = useTheme();
  const mantra = route?.params?.mantra;
  const { addChantingSession } = useMantras();
  
  const [count, setCount] = useState(0);
  const [isChanting, setIsChanting] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [targetCount, setTargetCount] = useState(108); // Traditional mala count

  const handleChant = () => {
    if (!isChanting) {
      setIsChanting(true);
      setStartTime(Date.now());
    }
    setCount(prev => prev + 1);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (count + 1 >= targetCount) {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    const duration = Math.floor((Date.now() - startTime) / 1000 / 60); // minutes
    await addChantingSession(mantra.id, count + 1, duration);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setIsChanting(false);
  };

  const handleReset = () => {
    setCount(0);
    setIsChanting(false);
    setStartTime(null);
  };

  const progress = (count / targetCount) * 100;

  return (
    <LinearGradient colors={C.gradientWarm} style={{ flex: 1 }}>
      <StarfieldBackground />

      {/* Header */}
      <View style={{ paddingHorizontal: 16, paddingTop: 56, paddingBottom: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 12 }}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={C.textPrimary} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: FontSizes.xxl, fontWeight: '800', color: C.textPrimary }}>{mantra.name}</Text>
            <Text style={{ fontSize: FontSizes.sm, color: C.textMuted, marginTop: 2 }}>{mantra.category}</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        {/* Mantra Display */}
        <GlassCard variant="strong" style={{ marginBottom: 20, padding: 24 }}>
          <Text style={{ fontSize: FontSizes.xl, fontFamily: 'NotoSerifDevanagari_700Bold', color: C.textSanskrit, textAlign: 'center', lineHeight: 36, marginBottom: 16 }}>{mantra.sanskrit}</Text>
          <Text style={{ fontSize: FontSizes.sm, fontStyle: 'italic', color: C.textMuted, textAlign: 'center', lineHeight: 22 }}>{mantra.transliteration}</Text>
        </GlassCard>

        {/* Counter */}
        <GlassCard style={{ marginBottom: 20 }}>
          <View style={{ alignItems: 'center', marginBottom: 20 }}>
            <Text style={{ fontSize: 80, fontWeight: '800', color: C.primary }}>{count}</Text>
            <Text style={{ fontSize: FontSizes.md, color: C.textMuted }}>of {targetCount} chants</Text>
          </View>

          {/* Progress Bar */}
          <View style={{ height: 8, backgroundColor: C.glassBg, borderRadius: 4, overflow: 'hidden', marginBottom: 20 }}>
            <View style={{ height: '100%', width: `${progress}%`, backgroundColor: C.primary, borderRadius: 4 }} />
          </View>

          {/* Chant Button */}
          <TouchableOpacity onPress={handleChant} onPressIn={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)} activeOpacity={0.85}>
            <LinearGradient colors={[C.peacockBlue, C.primary]} style={{ paddingVertical: 24, borderRadius: 20, alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <MaterialCommunityIcons name="plus-circle" size={28} color="#FFFFFF" />
                <Text style={{ fontSize: FontSizes.xl, fontWeight: '800', color: '#FFFFFF' }}>Chant</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Target Selection */}
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 16, justifyContent: 'center' }}>
            {[27, 54, 108].map(num => (
              <TouchableOpacity key={num} onPress={() => setTargetCount(num)} activeOpacity={0.8}>
                <View style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, backgroundColor: targetCount === num ? C.primary : C.glassBg, borderWidth: 1, borderColor: targetCount === num ? C.primary : C.glassBorder }}>
                  <Text style={{ fontSize: FontSizes.sm, fontWeight: '700', color: targetCount === num ? '#FFFFFF' : C.textSecondary }}>{num}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {count > 0 && (
            <TouchableOpacity onPress={handleReset} activeOpacity={0.8} style={{ marginTop: 16 }}>
              <View style={{ paddingVertical: 12, borderRadius: 12, alignItems: 'center', backgroundColor: C.glassBg, borderWidth: 1, borderColor: C.glassBorder }}>
                <Text style={{ fontSize: FontSizes.md, fontWeight: '700', color: C.textSecondary }}>Reset Counter</Text>
              </View>
            </TouchableOpacity>
          )}
        </GlassCard>

        {/* Meaning & Benefits */}
        <GlassCard style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: FontSizes.md, fontWeight: '700', color: C.textPrimary, marginBottom: 8 }}>Meaning</Text>
          <Text style={{ fontSize: FontSizes.sm, color: C.textSecondary, lineHeight: 22, marginBottom: 16 }}>{mantra.meaning}</Text>

          <Text style={{ fontSize: FontSizes.md, fontWeight: '700', color: C.textPrimary, marginBottom: 8 }}>Benefits</Text>
          {mantra.benefits.map((benefit, idx) => (
            <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: C.primary }} />
              <Text style={{ fontSize: FontSizes.sm, color: C.textSecondary }}>{benefit}</Text>
            </View>
          ))}

          <View style={{ marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: C.glassBorder }}>
            <Text style={{ fontSize: FontSizes.xs, fontWeight: '600', color: C.textMuted }}>Best Time: {mantra.bestTime}</Text>
            <Text style={{ fontSize: FontSizes.xs, fontWeight: '600', color: C.textMuted, marginTop: 4 }}>Deity: {mantra.deity}</Text>
          </View>
        </GlassCard>
      </ScrollView>
    </LinearGradient>
  );
}
