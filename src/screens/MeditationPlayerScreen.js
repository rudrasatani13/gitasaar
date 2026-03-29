// src/screens/MeditationPlayerScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import GlassCard from '../components/GlassCard';
import AudioSettingsModal from '../components/AudioSettingsModal';
import { useTheme } from '../theme/ThemeContext';
import { useMeditation } from '../theme/MeditationContext';
import { FontSizes } from '../theme/colors';
import { StarfieldBackground } from '../components/SpiritualBackground';
import * as Haptics from 'expo-haptics';
import { getAudioManager, speakGuidance, stopSpeaking } from '../utils/meditationAudio';

const { width } = Dimensions.get('window');

export default function MeditationPlayerScreen({ navigation, route }) {
  const { colors: C } = useTheme();
  const meditation = route?.params?.meditation;
  const { addSession } = useMeditation();
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [audioManager] = useState(() => getAudioManager());
  const [selectedAmbient, setSelectedAmbient] = useState('rain');
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [showAudioModal, setShowAudioModal] = useState(false);
  
  const totalSeconds = meditation.duration * 60;

  // Initialize audio
  useEffect(() => {
    audioManager.initialize();
    return () => {
      audioManager.stopAll();
      stopSpeaking();
    };
  }, []);

  // Timer logic
  useEffect(() => {
    let interval;
    if (isPlaying && elapsed < totalSeconds) {
      interval = setInterval(() => {
        setElapsed(prev => {
          if (prev + 1 >= totalSeconds) {
            handleComplete();
            return totalSeconds;
          }
          
          // Voice guidance at intervals
          const newElapsed = prev + 1;
          if (newElapsed % 60 === 0 && !isMuted) { // Every minute
            speakGuidance('Breathe deeply and stay present');
          }
          
          return newElapsed;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, elapsed, isMuted]);

  const handlePlay = async () => {
    if (!isPlaying) {
      setIsPlaying(true);
      if (!isMuted) {
        await audioManager.playEffect('bell_start');
        await audioManager.playBackground(selectedAmbient);
        speakGuidance('Begin your meditation. Close your eyes and breathe naturally.');
      }
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const handlePause = async () => {
    setIsPlaying(false);
    if (!isMuted) {
      await audioManager.pauseBackground();
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleComplete = async () => {
    setIsPlaying(false);
    if (!isMuted) {
      await audioManager.playEffect('bell_end');
      await audioManager.stopAll();
      speakGuidance('Your meditation is complete. Take a moment before opening your eyes.');
    }
    await addSession(meditation.id, meditation.duration, 'guided');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleReset = async () => {
    setElapsed(0);
    setIsPlaying(false);
    await audioManager.stopAll();
    stopSpeaking();
  };

  const toggleMute = async () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    if (newMuted) {
      await audioManager.stopAll();
      stopSpeaking();
    } else if (isPlaying) {
      await audioManager.playBackground(selectedAmbient);
    }
  };

  const changeAmbient = async (ambientId) => {
    setSelectedAmbient(ambientId);
    if (isPlaying && !isMuted) {
      await audioManager.changeAmbient(ambientId);
    }
  };

  const adjustVolume = async (newVolume) => {
    setVolume(newVolume);
    await audioManager.setVolume(newVolume);
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
      <View style={{ paddingHorizontal: 16, paddingTop: 56, paddingBottom: 16 }}>
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

      {/* Main Player - Timer Circle Centered */}
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40, paddingVertical: 20 }}>
        <View style={{ width: width - 120, height: width - 120, justifyContent: 'center', alignItems: 'center' }}>
          {/* Progress Circle */}
          <View style={{ width: '100%', height: '100%', borderRadius: (width - 120) / 2, backgroundColor: C.primarySoft, justifyContent: 'center', alignItems: 'center', borderWidth: 8, borderColor: C.primary, opacity: 0.3 + (progress / 100) * 0.7 }}>
            <Text style={{ fontSize: 56, fontWeight: '800', color: C.textPrimary, marginBottom: 8 }}>{formatTime(elapsed)}</Text>
            <Text style={{ fontSize: FontSizes.md, color: C.textMuted }}>{formatTime(totalSeconds - elapsed)} left</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={{ width: width - 80, marginTop: 32 }}>
          <View style={{ height: 6, backgroundColor: C.glassBg, borderRadius: 3, overflow: 'hidden' }}>
            <View style={{ height: '100%', width: `${progress}%`, backgroundColor: C.primary, borderRadius: 3 }} />
          </View>
        </View>
      </View>

      {/* Controls */}
      <View style={{ paddingHorizontal: 16, paddingBottom: 40 }}>
        <GlassCard noPadding style={{ padding: 20 }}>
          <Text style={{ fontSize: FontSizes.sm, color: C.textSecondary, lineHeight: 22, marginBottom: 20, textAlign: 'center' }}>{meditation.description}</Text>
          
          {/* Playback Controls */}
          <View style={{ flexDirection: 'row', gap: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 24 }}>
            <TouchableOpacity onPress={handleReset} activeOpacity={0.8} style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: C.glassBg, borderWidth: 1, borderColor: C.glassBorder, justifyContent: 'center', alignItems: 'center' }}>
              <MaterialCommunityIcons name="refresh" size={24} color={C.textSecondary} />
            </TouchableOpacity>
            
            <TouchableOpacity onPress={isPlaying ? handlePause : handlePlay} activeOpacity={0.8}>
              <LinearGradient colors={[C.peacockBlue, C.primary]} style={{ width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center' }}>
                <MaterialCommunityIcons name={isPlaying ? 'pause' : 'play'} size={32} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setElapsed(Math.min(elapsed + 60, totalSeconds))} activeOpacity={0.8} style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: C.glassBg, borderWidth: 1, borderColor: C.glassBorder, justifyContent: 'center', alignItems: 'center' }}>
              <MaterialCommunityIcons name="fast-forward" size={24} color={C.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Music Settings Button - Moved Down with Better Spacing */}
          <TouchableOpacity 
            onPress={() => {
              setShowAudioModal(true);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }} 
            activeOpacity={0.8}
            style={{ marginTop: 8 }}
          >
            <View style={{ 
              flexDirection: 'row', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: 8, 
              paddingVertical: 16,
              paddingHorizontal: 20,
              backgroundColor: C.glassBg,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: C.glassBorder,
            }}>
              <MaterialCommunityIcons name="music-circle" size={22} color={C.primary} />
              <Text style={{ fontSize: FontSizes.md, fontWeight: '700', color: C.primary }}>Music Settings</Text>
              <View style={{ 
                paddingHorizontal: 10, 
                paddingVertical: 4, 
                borderRadius: 8, 
                backgroundColor: isMuted ? C.glassBg : C.primarySoft 
              }}>
                <Text style={{ 
                  fontSize: FontSizes.xs, 
                  fontWeight: '700', 
                  color: isMuted ? C.textMuted : C.primary 
                }}>{isMuted ? 'OFF' : 'ON'}</Text>
              </View>
            </View>
          </TouchableOpacity>
        </GlassCard>
      </View>

      {/* Audio Settings Modal */}
      <AudioSettingsModal
        visible={showAudioModal}
        onClose={() => setShowAudioModal(false)}
        isMuted={isMuted}
        toggleMute={toggleMute}
        selectedAmbient={selectedAmbient}
        changeAmbient={changeAmbient}
        volume={volume}
        setVolume={setVolume}
        adjustVolume={adjustVolume}
      />
    </LinearGradient>
  );
}
