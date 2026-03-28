// src/screens/MeditationScreen.js
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated, Dimensions, Platform, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { FontSizes } from '../theme/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { tapLight, notifySuccess } from '../utils/haptics';

const { width } = Dimensions.get('window');
const CIRCLE_SIZE = width * 0.6;

const PRESETS = [
  { label: '2 min', seconds: 120, icon: 'leaf' },
  { label: '5 min', seconds: 300, icon: 'meditation' },
  { label: '10 min', seconds: 600, icon: 'yoga' },
  { label: '15 min', seconds: 900, icon: 'flower-tulip-outline' },
  { label: '20 min', seconds: 1200, icon: 'om' },
];

// Om chanting sound using Web Audio API
let omAudioCtx = null;
let omInterval = null;

function startOmChant() {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return;
  try {
    omAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    const playOm = () => {
      if (!omAudioCtx) return;
      const now = omAudioCtx.currentTime;
      
      // Base drone - tanpura-like
      const osc1 = omAudioCtx.createOscillator();
      const gain1 = omAudioCtx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(136.1, now); // Om frequency (C#)
      gain1.gain.setValueAtTime(0, now);
      gain1.gain.linearRampToValueAtTime(0.12, now + 2);
      gain1.gain.setValueAtTime(0.12, now + 5);
      gain1.gain.linearRampToValueAtTime(0, now + 8);
      osc1.connect(gain1);
      gain1.connect(omAudioCtx.destination);
      osc1.start(now);
      osc1.stop(now + 8);

      // Harmonic overtone
      const osc2 = omAudioCtx.createOscillator();
      const gain2 = omAudioCtx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(272.2, now); // Octave
      gain2.gain.setValueAtTime(0, now);
      gain2.gain.linearRampToValueAtTime(0.06, now + 2.5);
      gain2.gain.setValueAtTime(0.06, now + 4.5);
      gain2.gain.linearRampToValueAtTime(0, now + 7.5);
      osc2.connect(gain2);
      gain2.connect(omAudioCtx.destination);
      osc2.start(now);
      osc2.stop(now + 8);

      // Higher harmonic
      const osc3 = omAudioCtx.createOscillator();
      const gain3 = omAudioCtx.createGain();
      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(408.3, now); // Fifth
      gain3.gain.setValueAtTime(0, now);
      gain3.gain.linearRampToValueAtTime(0.03, now + 3);
      gain3.gain.setValueAtTime(0.03, now + 4);
      gain3.gain.linearRampToValueAtTime(0, now + 7);
      osc3.connect(gain3);
      gain3.connect(omAudioCtx.destination);
      osc3.start(now);
      osc3.stop(now + 8);
    };

    playOm();
    omInterval = setInterval(playOm, 8500); // Repeat every 8.5s
  } catch (e) { console.log('Audio error:', e); }
}

function stopOmChant() {
  if (omInterval) { clearInterval(omInterval); omInterval = null; }
  if (omAudioCtx) { omAudioCtx.close().catch(() => {}); omAudioCtx = null; }
}

function playBell() {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    // Singing bowl sound
    [528, 396, 639].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(i === 0 ? 0.2 : 0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.1);
      osc.stop(ctx.currentTime + 4);
    });
  } catch (e) {}
}

export default function MeditationScreen({ navigation }) {
  const { colors: C, isDark } = useTheme();
  const [duration, setDuration] = useState(300);
  const [timeLeft, setTimeLeft] = useState(300);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [totalSessions, setTotalSessions] = useState(0);
  const [omEnabled, setOmEnabled] = useState(true);

  const breatheScale = useRef(new Animated.Value(0.85)).current;
  const breatheOpacity = useRef(new Animated.Value(0.2)).current;
  const ring1 = useRef(new Animated.Value(0.8)).current;
  const ring2 = useRef(new Animated.Value(0.75)).current;
  const ring3 = useRef(new Animated.Value(0.7)).current;
  const glowPulse = useRef(new Animated.Value(0.05)).current;
  const omScale = useRef(new Animated.Value(1)).current;
  const completeScale = useRef(new Animated.Value(0.5)).current;
  const intervalRef = useRef(null);
  const breatheRef = useRef(null);

  useEffect(() => {
    (async () => {
      const s = await AsyncStorage.getItem('@gitasaar_med_sessions');
      if (s) setTotalSessions(parseInt(s));
    })();
    return () => { stopOmChant(); if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  useEffect(() => {
    if (isRunning) {
      breatheRef.current = Animated.loop(
        Animated.sequence([
          // Inhale
          Animated.parallel([
            Animated.timing(breatheScale, { toValue: 1.12, duration: 4000, useNativeDriver: true }),
            Animated.timing(breatheOpacity, { toValue: 0.5, duration: 4000, useNativeDriver: true }),
            Animated.timing(ring1, { toValue: 1.05, duration: 4000, useNativeDriver: true }),
            Animated.timing(ring2, { toValue: 0.95, duration: 4200, useNativeDriver: true }),
            Animated.timing(ring3, { toValue: 0.88, duration: 4400, useNativeDriver: true }),
            Animated.timing(glowPulse, { toValue: 0.2, duration: 4000, useNativeDriver: true }),
            Animated.timing(omScale, { toValue: 1.08, duration: 4000, useNativeDriver: true }),
          ]),
          Animated.delay(2000),
          // Exhale
          Animated.parallel([
            Animated.timing(breatheScale, { toValue: 0.85, duration: 6000, useNativeDriver: true }),
            Animated.timing(breatheOpacity, { toValue: 0.2, duration: 6000, useNativeDriver: true }),
            Animated.timing(ring1, { toValue: 0.8, duration: 6000, useNativeDriver: true }),
            Animated.timing(ring2, { toValue: 0.75, duration: 6200, useNativeDriver: true }),
            Animated.timing(ring3, { toValue: 0.7, duration: 6400, useNativeDriver: true }),
            Animated.timing(glowPulse, { toValue: 0.05, duration: 6000, useNativeDriver: true }),
            Animated.timing(omScale, { toValue: 1, duration: 6000, useNativeDriver: true }),
          ]),
          Animated.delay(1000),
        ])
      );
      breatheRef.current.start();
    } else {
      if (breatheRef.current) breatheRef.current.stop();
      [breatheScale, ring1, ring2, ring3].forEach(a => a.setValue(0.85));
      breatheOpacity.setValue(0.2);
      glowPulse.setValue(0.05);
      omScale.setValue(1);
    }
  }, [isRunning]);

  const start = () => {
    tapLight(); playBell();
    if (omEnabled) setTimeout(startOmChant, 2000);
    setIsRunning(true); setIsComplete(false); setTimeLeft(duration);
    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          stopOmChant(); setIsRunning(false); setIsComplete(true);
          playBell(); notifySuccess();
          completeScale.setValue(0.5);
          Animated.spring(completeScale, { toValue: 1, friction: 5, useNativeDriver: true }).start();
          const n = totalSessions + 1; setTotalSessions(n);
          AsyncStorage.setItem('@gitasaar_med_sessions', String(n));
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stop = () => {
    tapLight(); clearInterval(intervalRef.current); stopOmChant();
    setIsRunning(false); setTimeLeft(duration);
  };

  const selectDuration = (secs) => { if (isRunning) return; tapLight(); setDuration(secs); setTimeLeft(secs); setIsComplete(false); };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeStr = `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
  const elapsed = duration - timeLeft;
  const cyclePos = elapsed % 13;
  const breatheText = !isRunning ? '' : cyclePos < 4 ? 'Breathe In' : cyclePos < 6 ? 'Hold' : cyclePos < 12 ? 'Breathe Out' : '';

  const bgColors = ['#000005', '#050510', '#000005'];

  if (isComplete) {
    return (
      <LinearGradient colors={bgColors} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <Animated.View style={{ alignItems: 'center', transform: [{ scale: completeScale }] }}>
          <View style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: C.primarySoft, borderWidth: 2, borderColor: C.borderGoldStrong, justifyContent: 'center', alignItems: 'center', marginBottom: 24 }}>
            <MaterialCommunityIcons name="check-decagram" size={44} color={C.primary} />
          </View>
          <Text style={{ fontSize: 40, color: C.primary, marginBottom: 8 }}>{'\u0950'}</Text>
          <Text style={{ fontSize: FontSizes.xxxl, fontWeight: '800', color: C.textPrimary, marginBottom: 6 }}>Namaste</Text>
          <Text style={{ fontSize: FontSizes.lg, color: C.textSecondary, textAlign: 'center', marginBottom: 4 }}>Your meditation is complete</Text>
          <Text style={{ fontSize: FontSizes.md, color: C.primary, fontWeight: '600', marginBottom: 4 }}>{Math.floor(duration / 60)} minutes of peace</Text>
          <Text style={{ fontSize: FontSizes.sm, color: C.textMuted, marginBottom: 30 }}>Total sessions: {totalSessions}</Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity onPress={() => navigation.goBack()}
              style={{ paddingHorizontal: 28, paddingVertical: 14, borderRadius: 16, backgroundColor: C.bgCard, borderWidth: 1, borderColor: C.border }}>
              <Text style={{ fontSize: FontSizes.md, fontWeight: '600', color: C.textPrimary }}>Done</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setIsComplete(false); setTimeLeft(duration); }}>
              <LinearGradient colors={C.gradientGold} style={{ paddingHorizontal: 28, paddingVertical: 14, borderRadius: 16 }}>
                <Text style={{ fontSize: FontSizes.md, fontWeight: '700', color: C.textOnPrimary }}>Again</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={bgColors} style={{ flex: 1 }}>
      {/* Header */}
      <View style={{ paddingTop: 56, paddingBottom: 10, paddingHorizontal: 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <TouchableOpacity onPress={() => { stop(); navigation.goBack(); }}
              style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: C.primarySoft, justifyContent: 'center', alignItems: 'center' }}>
              <MaterialCommunityIcons name="arrow-left" size={20} color={C.primary} />
            </TouchableOpacity>
            <View>
              <Text style={{ fontSize: FontSizes.lg, fontWeight: '700', color: C.textPrimary }}>Meditation</Text>
              <Text style={{ fontSize: FontSizes.xs, color: C.textMuted }}>{totalSessions} sessions</Text>
            </View>
          </View>
          {/* Om sound toggle */}
          <TouchableOpacity onPress={() => setOmEnabled(!omEnabled)}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, backgroundColor: omEnabled ? C.primarySoft : C.bgCard, borderWidth: 1, borderColor: omEnabled ? C.primary : C.border }}>
            <MaterialCommunityIcons name={omEnabled ? 'volume-high' : 'volume-off'} size={14} color={omEnabled ? C.primary : C.textMuted} />
            <Text style={{ fontSize: FontSizes.xs, fontWeight: '600', color: omEnabled ? C.primary : C.textMuted }}>Om</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        {/* Meditation circle */}
        <View style={{ width: CIRCLE_SIZE + 80, height: CIRCLE_SIZE + 80, justifyContent: 'center', alignItems: 'center', marginBottom: 24 }}>
          {/* Outer glow */}
          <Animated.View style={{ position: 'absolute', width: CIRCLE_SIZE + 60, height: CIRCLE_SIZE + 60, borderRadius: (CIRCLE_SIZE + 60) / 2, backgroundColor: C.primary, opacity: glowPulse }} />

          {/* Ring 3 - outermost */}
          <Animated.View style={{ position: 'absolute', width: CIRCLE_SIZE + 40, height: CIRCLE_SIZE + 40, borderRadius: (CIRCLE_SIZE + 40) / 2, borderWidth: 1, borderColor: C.borderGold, opacity: 0.2, transform: [{ scale: ring3 }] }} />

          {/* Ring 2 */}
          <Animated.View style={{ position: 'absolute', width: CIRCLE_SIZE + 20, height: CIRCLE_SIZE + 20, borderRadius: (CIRCLE_SIZE + 20) / 2, borderWidth: 1, borderColor: C.borderGold, opacity: 0.3, transform: [{ scale: ring2 }] }} />

          {/* Ring 1 */}
          <Animated.View style={{ position: 'absolute', width: CIRCLE_SIZE, height: CIRCLE_SIZE, borderRadius: CIRCLE_SIZE / 2, borderWidth: 1.5, borderColor: C.borderGoldStrong, opacity: 0.4, transform: [{ scale: ring1 }] }} />

          {/* Main breathing circle */}
          <Animated.View style={{
            width: CIRCLE_SIZE - 20, height: CIRCLE_SIZE - 20,
            borderRadius: (CIRCLE_SIZE - 20) / 2,
            backgroundColor: C.primarySoft, borderWidth: 1.5, borderColor: C.borderGoldStrong,
            justifyContent: 'center', alignItems: 'center',
            opacity: breatheOpacity, transform: [{ scale: breatheScale }],
          }} />

          {/* Center content */}
          <View style={{ position: 'absolute', alignItems: 'center' }}>
            <Animated.Text style={{ fontSize: 42, color: C.primary, opacity: 0.6, marginBottom: 4, transform: [{ scale: omScale }] }}>{'\u0950'}</Animated.Text>
            <Text style={{ fontSize: 44, fontWeight: '200', color: C.textPrimary, letterSpacing: 4 }}>{timeStr}</Text>
            {isRunning && breatheText ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: breatheText === 'Hold' ? C.saffron : C.primary }} />
                <Text style={{ fontSize: FontSizes.md, color: C.primary, fontWeight: '500' }}>{breatheText}</Text>
              </View>
            ) : !isRunning ? (
              <Text style={{ fontSize: FontSizes.sm, color: C.textMuted, marginTop: 10 }}>Choose duration & start</Text>
            ) : null}
          </View>
        </View>

        {/* Duration presets */}
        {!isRunning && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 50, marginBottom: 28 }}>
            <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 20 }}>
              {PRESETS.map((p) => (
                <TouchableOpacity key={p.seconds} onPress={() => selectDuration(p.seconds)}
                  style={{
                    flexDirection: 'row', alignItems: 'center', gap: 6,
                    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999,
                    backgroundColor: duration === p.seconds ? C.primarySoft : C.bgCard,
                    borderWidth: 1.5, borderColor: duration === p.seconds ? C.primary : C.border,
                  }}>
                  <MaterialCommunityIcons name={p.icon} size={14} color={duration === p.seconds ? C.primary : C.textMuted} />
                  <Text style={{ fontSize: FontSizes.sm, fontWeight: '700', color: duration === p.seconds ? C.primary : C.textMuted }}>{p.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        )}

        {/* Start/Stop */}
        <TouchableOpacity onPress={isRunning ? stop : start} activeOpacity={0.85}>
          <LinearGradient colors={isRunning ? ['#E53935', '#C62828'] : C.gradientGold}
            style={{ width: 76, height: 76, borderRadius: 38, justifyContent: 'center', alignItems: 'center', ...C.shadowGold }}>
            <MaterialCommunityIcons name={isRunning ? 'stop' : 'play'} size={34} color={isRunning ? '#FFF' : C.textOnPrimary} />
          </LinearGradient>
        </TouchableOpacity>

        {/* Bottom info */}
        {isRunning && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 20 }}>
            <MaterialCommunityIcons name={omEnabled ? 'music-note' : 'music-note-off'} size={14} color={C.textMuted} />
            <Text style={{ fontSize: FontSizes.xs, color: C.textMuted }}>{omEnabled ? 'Om chanting active' : 'Silent mode'}</Text>
          </View>
        )}
      </View>
    </LinearGradient>
  );
}