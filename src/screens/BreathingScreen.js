// src/screens/BreathingScreen.js
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import GlassCard from '../components/GlassCard';
import { useTheme } from '../theme/ThemeContext';
import { PRANAYAMA_EXERCISES } from '../theme/MeditationContext';
import { FontSizes } from '../theme/colors';
import { StarfieldBackground } from '../components/SpiritualBackground';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

export default function BreathingScreen({ navigation, route }) {
  const { colors: C } = useTheme();
  const exercise = route?.params?.exercise || PRANAYAMA_EXERCISES[0];
  
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState('inhale'); // inhale, hold, exhale, pause
  const [countdown, setCountdown] = useState(4);
  const [totalSeconds, setTotalSeconds] = useState(0);
  
  const scaleAnim = useRef(new Animated.Value(0.6)).current;
  const opacityAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    let interval;
    if (isActive) {
      interval = setInterval(() => {
        setTotalSeconds(prev => prev + 1);
        setCountdown(prev => {
          if (prev <= 1) {
            // Move to next phase
            if (Array.isArray(exercise.pattern)) {
              const [inhale, hold1, exhale, hold2] = exercise.pattern;
              if (phase === 'inhale') {
                setPhase(hold1 > 0 ? 'hold' : 'exhale');
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                return hold1 > 0 ? hold1 : exhale;
              } else if (phase === 'hold') {
                setPhase('exhale');
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                return exhale;
              } else if (phase === 'exhale') {
                setPhase(hold2 > 0 ? 'pause' : 'inhale');
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                return hold2 > 0 ? hold2 : inhale;
              } else {
                setPhase('inhale');
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                return inhale;
              }
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, phase]);

  useEffect(() => {
    // Animate circle based on phase
    if (phase === 'inhale') {
      Animated.parallel([
        Animated.timing(scaleAnim, { toValue: 1, duration: countdown * 1000, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 1, duration: countdown * 1000, useNativeDriver: true }),
      ]).start();
    } else if (phase === 'exhale') {
      Animated.parallel([
        Animated.timing(scaleAnim, { toValue: 0.6, duration: countdown * 1000, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 0.3, duration: countdown * 1000, useNativeDriver: true }),
      ]).start();
    }
  }, [phase, countdown]);

  const handleStart = () => {
    setIsActive(true);
    setTotalSeconds(0);
    if (Array.isArray(exercise.pattern)) {
      setCountdown(exercise.pattern[0]);
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  };

  const handlePause = () => {
    setIsActive(false);
  };

  const handleReset = () => {
    setIsActive(false);
    setPhase('inhale');
    setTotalSeconds(0);
    if (Array.isArray(exercise.pattern)) {
      setCountdown(exercise.pattern[0]);
    }
    scaleAnim.setValue(0.6);
    opacityAnim.setValue(0.3);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPhaseColor = () => {
    if (phase === 'inhale') return '#14918E';
    if (phase === 'exhale') return '#E8793A';
    return C.primary;
  };

  const getPhaseText = () => {
    if (phase === 'inhale') return 'Breathe In';
    if (phase === 'exhale') return 'Breathe Out';
    if (phase === 'hold') return 'Hold';
    return 'Pause';
  };

  return (
    <LinearGradient colors={C.gradientWarm} style={{ flex: 1 }}>
      <StarfieldBackground />

      {/* Header */}
      <View style={{ paddingHorizontal: 16, paddingTop: 56, paddingBottom: 24 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 12 }}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={C.textPrimary} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: FontSizes.xxl, fontWeight: '800', color: C.textPrimary }}>{exercise.name}</Text>
            <Text style={{ fontSize: FontSizes.sm, color: C.textMuted, marginTop: 2 }}>{exercise.benefit}</Text>
          </View>
        </View>
      </View>

      {/* Breathing Circle */}
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 }}>
        <View style={{ position: 'relative', width: width - 120, height: width - 120, justifyContent: 'center', alignItems: 'center' }}>
          {/* Animated Circle */}
          <Animated.View
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              borderRadius: (width - 120) / 2,
              backgroundColor: getPhaseColor(),
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }],
            }}
          />
          
          {/* Center Content */}
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 72, fontWeight: '800', color: '#FFFFFF', marginBottom: 8 }}>{countdown}</Text>
            <Text style={{ fontSize: FontSizes.xl, fontWeight: '700', color: '#FFFFFF', marginBottom: 16 }}>{getPhaseText()}</Text>
            <Text style={{ fontSize: FontSizes.md, color: 'rgba(255,255,255,0.8)' }}>{formatTime(totalSeconds)}</Text>
          </View>
        </View>
      </View>

      {/* Controls */}
      <View style={{ paddingHorizontal: 16, paddingBottom: 100 }}>
        <GlassCard noPadding style={{ padding: 20 }}>
          <Text style={{ fontSize: FontSizes.md, fontWeight: '700', color: C.textPrimary, marginBottom: 8 }}>About This Exercise</Text>
          <Text style={{ fontSize: FontSizes.sm, color: C.textSecondary, lineHeight: 22, marginBottom: 16 }}>{exercise.description}</Text>
          
          <View style={{ flexDirection: 'row', gap: 12 }}>
            {!isActive ? (
              <TouchableOpacity onPress={handleStart} activeOpacity={0.8} style={{ flex: 1 }}>
                <LinearGradient colors={[C.peacockBlue, C.primary]} style={{ paddingVertical: 16, borderRadius: 16, alignItems: 'center' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <MaterialCommunityIcons name="play" size={20} color="#FFFFFF" />
                    <Text style={{ fontSize: FontSizes.md, fontWeight: '700', color: '#FFFFFF' }}>Start</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity onPress={handlePause} activeOpacity={0.8} style={{ flex: 1 }}>
                  <View style={{ paddingVertical: 16, borderRadius: 16, alignItems: 'center', backgroundColor: C.glassBg, borderWidth: 1.5, borderColor: C.primary }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <MaterialCommunityIcons name="pause" size={20} color={C.primary} />
                      <Text style={{ fontSize: FontSizes.md, fontWeight: '700', color: C.primary }}>Pause</Text>
                    </View>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleReset} activeOpacity={0.8} style={{ width: 56 }}>
                  <View style={{ paddingVertical: 16, borderRadius: 16, alignItems: 'center', backgroundColor: C.glassBg, borderWidth: 1, borderColor: C.glassBorder }}>
                    <MaterialCommunityIcons name="refresh" size={20} color={C.textSecondary} />
                  </View>
                </TouchableOpacity>
              </>
            )}
          </View>
        </GlassCard>
      </View>
    </LinearGradient>
  );
}
