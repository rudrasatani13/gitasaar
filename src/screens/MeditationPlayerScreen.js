// src/screens/MeditationPlayerScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import GlassCard from '../components/GlassCard';
import { useTheme } from '../theme/ThemeContext';
import { useMeditation } from '../theme/MeditationContext';
import { FontSizes } from '../theme/colors';
import { StarfieldBackground } from '../components/SpiritualBackground';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

export default function MeditationPlayerScreen({ navigation, route }) {
  const { colors: C } = useTheme();
  const meditation = route?.params?.meditation;
  const { addSession } = useMeditation();
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const totalSeconds = meditation.duration * 60;

  useEffect(() => {
    let interval;
    if (isPlaying && elapsed < totalSeconds) {
      interval = setInterval(() => {
        setElapsed(prev => {
          if (prev + 1 >= totalSeconds) {
            setIsPlaying(false);
            handleComplete();
            return totalSeconds;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, elapsed]);

  const handleComplete = async () => {
    await addSession(meditation.id, meditation.duration, 'guided');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = (elapsed / totalSeconds) * 100;

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
            <Text style={{ fontSize: FontSizes.xxl, fontWeight: '800', color: C.textPrimary }}>{meditation.title}</Text>
            <Text style={{ fontSize: FontSizes.sm, color: C.textMuted, marginTop: 2 }}>{meditation.category} · {meditation.duration} min</Text>
          </View>
        </View>
      </View>

      {/* Main Player */}
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 }}>
        <View style={{ width: width - 100, height: width - 100, justifyContent: 'center', alignItems: 'center' }}>
          {/* Progress Circle */}
          <View style={{ width: '100%', height: '100%', borderRadius: (width - 100) / 2, backgroundColor: C.primarySoft, justifyContent: 'center', alignItems: 'center', borderWidth: 8, borderColor: C.primary, opacity: 0.3 + (progress / 100) * 0.7 }}>
            <Text style={{ fontSize: 64, fontWeight: '800', color: C.textPrimary, marginBottom: 8 }}>{formatTime(elapsed)}</Text>
            <Text style={{ fontSize: FontSizes.md, color: C.textMuted }}>{formatTime(totalSeconds - elapsed)} left</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={{ width: width - 80, marginTop: 40 }}>
          <View style={{ height: 6, backgroundColor: C.glassBg, borderRadius: 3, overflow: 'hidden' }}>
            <View style={{ height: '100%', width: `${progress}%`, backgroundColor: C.primary, borderRadius: 3 }} />
          </View>
        </View>
      </View>

      {/* Controls */}
      <View style={{ paddingHorizontal: 16, paddingBottom: 100 }}>
        <GlassCard noPadding style={{ padding: 20 }}>
          <Text style={{ fontSize: FontSizes.sm, color: C.textSecondary, lineHeight: 22, marginBottom: 20, textAlign: 'center' }}>{meditation.description}</Text>
          
          <View style={{ flexDirection: 'row', gap: 12, justifyContent: 'center' }}>
            <TouchableOpacity onPress={() => { setElapsed(0); setIsPlaying(false); }} activeOpacity={0.8} style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: C.glassBg, borderWidth: 1, borderColor: C.glassBorder, justifyContent: 'center', alignItems: 'center' }}>
              <MaterialCommunityIcons name="refresh" size={24} color={C.textSecondary} />
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => setIsPlaying(!isPlaying)} activeOpacity={0.8}>
              <LinearGradient colors={[C.peacockBlue, C.primary]} style={{ width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center' }}>
                <MaterialCommunityIcons name={isPlaying ? 'pause' : 'play'} size={32} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setElapsed(Math.min(elapsed + 60, totalSeconds))} activeOpacity={0.8} style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: C.glassBg, borderWidth: 1, borderColor: C.glassBorder, justifyContent: 'center', alignItems: 'center' }}>
              <MaterialCommunityIcons name="fast-forward" size={24} color={C.textSecondary} />
            </TouchableOpacity>
          </View>
        </GlassCard>
      </View>
    </LinearGradient>
  );
}
