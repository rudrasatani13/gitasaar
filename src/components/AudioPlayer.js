// src/components/AudioPlayer.js
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated, Platform, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../utils/firebase';
import { usePremium } from '../theme/PremiumContext';
import { useTheme } from '../theme/ThemeContext';
import { FontSizes } from '../theme/colors';
import { tapLight } from '../utils/haptics';
import { useNavigation } from '@react-navigation/native';
import GlassCard from './GlassCard';

const generateSpeechAudio = httpsCallable(functions, 'generateSpeechAudio', { timeout: 28000 });

const hashString = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString();
};

const cleanText = (text) => {
  if (!text) return text;
  // Remove verse references like ||1-1||, 1.1, [1.1], etc.
  return text
    .replace(/\|\|[\d\-\.]+\|\|/g, '')  // Remove ||1-1||
    .replace(/\b\d+\.\d+\b/g, '')        // Remove 1.1
    .replace(/\[\d+\.\d+\]/g, '')        // Remove [1.1]
    .replace(/\s+/g, ' ')                // Clean up extra spaces
    .trim();
};

let Speech = null;
try { Speech = require('expo-speech'); } catch (e) {}

async function generateSpeech(text, label) {
  const isNative = Platform.OS !== 'web';
  let fileUri = null;

  // Step 1: Check local cache (native only) — isolated so a cache miss never triggers fallback
  if (isNative) {
    try {
      const fileName = `audio_${label}_${hashString(text)}.mp3`;
      fileUri = FileSystem.cacheDirectory + fileName;
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (fileInfo.exists) return { uri: fileUri, isLocal: true };
    } catch (e) {
      console.warn('[AUDIO] Cache check failed:', e?.message);
      fileUri = null; // skip caching this round
    }
  }

  // Step 2: Call Cloud Function — isolated so we see the exact error if it fails
  let audioBase64;
  try {
    const result = await generateSpeechAudio({ text });
    audioBase64 = result.data?.audioBase64;
  } catch (e) {
    console.warn('[AUDIO] Cloud function error — code:', e?.code, '| message:', e?.message, '| details:', e?.details);
    return { fallback: true, text };
  }

  if (!audioBase64) {
    console.warn('[AUDIO] Cloud function returned empty audioBase64');
    return { fallback: true, text };
  }

  // Step 3a: Native — write to cache and return file URI
  if (isNative) {
    if (fileUri) {
      try {
        await FileSystem.writeAsStringAsync(fileUri, audioBase64, { encoding: FileSystem.EncodingType.Base64 });
        return { uri: fileUri, isLocal: true };
      } catch (e) {
        console.warn('[AUDIO] FileSystem write failed:', e?.message, '— playing from base64 directly');
      }
    }
    // FileSystem write failed or no fileUri — return base64 directly so audio still plays
    return { base64: audioBase64, isLocal: false };
  }

  // Step 3b: Web — convert base64 to blob
  const byteChars = atob(audioBase64);
  const byteArray = new Uint8Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) byteArray[i] = byteChars.charCodeAt(i);
  const blob = new Blob([byteArray], { type: 'audio/mpeg' });
  return { blob, isLocal: false };
}

// Fallback: use device TTS when ElevenLabs fails
function playFallbackTTS(text) {
  return new Promise((resolve) => {
    if (Speech && Platform.OS !== 'web') {
      Speech.speak(text, {
        language: 'hi-IN',
        onDone: resolve,
        onError: resolve,
        onStopped: resolve,
      });
    } else if (Platform.OS === 'web' && typeof speechSynthesis !== 'undefined') {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'hi-IN';
      utterance.onend = resolve;
      utterance.onerror = resolve;
      speechSynthesis.speak(utterance);
    } else {
      resolve();
    }
  });
}

function playBlobWeb(blob) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audio.onended = () => { URL.revokeObjectURL(url); resolve(); };
    audio.onerror = () => { URL.revokeObjectURL(url); resolve(); };
    audio.play().catch(() => resolve());
    playBlobWeb._current = audio;
  });
}

function stopWebAudio() {
  if (playBlobWeb._current) {
    playBlobWeb._current.pause();
    playBlobWeb._current = null;
  }
}

async function playNative(source) {
  try {
    const { Audio } = require('expo-av');

    // Required on Android — without this, audio plays silently through earpiece or not at all
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });

    // Support both file URI and raw base64 (FileSystem write fallback)
    let audioSource;
    if (source.uri) {
      audioSource = { uri: source.uri };
    } else if (source.base64) {
      audioSource = { uri: `data:audio/mpeg;base64,${source.base64}` };
    } else {
      return;
    }

    const { sound } = await Audio.Sound.createAsync(audioSource, { shouldPlay: true });
    return new Promise((resolve) => {
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          sound.unloadAsync();
          resolve();
        }
      });
      playNative._current = sound;
    });
  } catch (e) {
    console.warn('[AUDIO] playNative error:', e?.message);
  }
}

function stopNativeAudio() {
  if (playNative._current) {
    playNative._current.stopAsync().catch(() => {});
    playNative._current = null;
  }
}

export default function AudioPlayer({ sanskrit, transliteration, hindi, english }) {
  const { colors: C } = useTheme();
  const { useAudioPlay, isPremium, audioRemaining } = usePremium();
  const navigation = useNavigation();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPart, setCurrentPart] = useState('');
  const waveAnims = [ useRef(new Animated.Value(0.3)).current, useRef(new Animated.Value(0.3)).current, useRef(new Animated.Value(0.3)).current, useRef(new Animated.Value(0.3)).current, useRef(new Animated.Value(0.3)).current ];
  const stoppedRef = useRef(false);

  useEffect(() => {
    if (isPlaying) {
      waveAnims.forEach((anim, i) => {
        Animated.loop(
          Animated.sequence([
            Animated.delay(i * 100),
            Animated.timing(anim, { toValue: 1, duration: 300, useNativeDriver: true }),
            Animated.timing(anim, { toValue: 0.3, duration: 300, useNativeDriver: true }),
            Animated.delay(200),
          ])
        ).start();
      });
    } else {
      waveAnims.forEach(a => { a.stopAnimation(); a.setValue(0.3); });
    }
  }, [isPlaying]);

  const stop = () => {
    stoppedRef.current = true;
    if (Platform.OS === 'web') stopWebAudio();
    else stopNativeAudio();
    setIsPlaying(false);
    setIsLoading(false);
    setCurrentPart('');
  };

  const handlePaywall = () => {
    Alert.alert("Limit Reached", "You've used all free audio recitations for today.", [
      { text: "Cancel", style: "cancel" },
      { text: "Upgrade to Premium", onPress: () => navigation.navigate('Premium') }
    ]);
  };

  const playPart = async (text, label) => {
    if (stoppedRef.current) return;
    setCurrentPart(label);
    const cleanedText = cleanText(text);
    const source = await generateSpeech(cleanedText, label);
    if (!source || stoppedRef.current) return;

    if (source.fallback) {
      // ElevenLabs failed — use device TTS as fallback
      await playFallbackTTS(source.text);
    } else if (Platform.OS === 'web') {
      await playBlobWeb(source.blob);
    } else {
      await playNative(source);
    }

    if (!stoppedRef.current) await new Promise(r => setTimeout(r, 400));
  };

  const playAll = async () => {
    if (isPlaying || isLoading) { stop(); return; }

    const canPlay = useAudioPlay();
    if (!canPlay) { handlePaywall(); return; }

    tapLight();
    stoppedRef.current = false;
    setIsLoading(true);

    const parts = [];
    if (transliteration) parts.push({ text: transliteration, label: 'Shloka' });
    if (hindi) parts.push({ text: hindi, label: 'Meaning' });
    if (english) parts.push({ text: english, label: 'English' });

    if (parts.length === 0) { setIsLoading(false); return; }

    setIsPlaying(true);
    setIsLoading(false);

    try {
      for (const part of parts) {
        if (stoppedRef.current) break;
        await playPart(part.text, part.label);
      }
    } catch (e) {
      console.warn('AudioPlayer playAll error:', e);
    } finally {
      if (!stoppedRef.current) {
        setIsPlaying(false);
        setCurrentPart('');
      }
    }
  };

  const playSingle = async (text, label) => {
    if (isPlaying || isLoading) { stop(); return; }

    const canPlay = useAudioPlay();
    if (!canPlay) { handlePaywall(); return; }

    tapLight();
    stoppedRef.current = false;
    setIsPlaying(true);
    setCurrentPart(label);

    try {
      const cleanedText = cleanText(text);
      const source = await generateSpeech(cleanedText, label);
      if (source && !stoppedRef.current) {
        if (source.fallback) {
          await playFallbackTTS(source.text);
        } else if (Platform.OS === 'web') {
          if (source.blob) await playBlobWeb(source.blob);
        } else {
          await playNative(source);
        }
      }
    } catch (e) {
      console.warn('AudioPlayer playSingle error:', e);
    } finally {
      if (!stoppedRef.current) {
        setIsPlaying(false);
        setCurrentPart('');
      }
    }
  };

  return (
    <GlassCard noPadding style={{ borderRadius: 16, padding: 14 }} intensity={40}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <TouchableOpacity onPress={playAll} activeOpacity={0.8} style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: isPlaying ? '#E53935' + '18' : C.glassBg, borderWidth: 1.5, borderColor: isPlaying ? '#E53935' : C.glassBorderGold, justifyContent: 'center', alignItems: 'center' }}>
          {isLoading ? <MaterialCommunityIcons name="loading" size={20} color={C.primary} /> : <MaterialCommunityIcons name={isPlaying ? 'stop' : 'play'} size={20} color={isPlaying ? '#E53935' : C.primary} />}
        </TouchableOpacity>

        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 8 }}>
          {isPlaying ? (
            <>
              {waveAnims.map((anim, i) => <Animated.View key={i} style={{ width: 3, borderRadius: 2, backgroundColor: C.primary, height: 20, opacity: anim, transform: [{ scaleY: anim }] }} />)}
              <Text style={{ fontSize: FontSizes.xs, color: C.primary, fontWeight: '600', marginLeft: 8 }}>{currentPart || 'Playing...'}</Text>
            </>
          ) : isLoading ? (
            <Text style={{ fontSize: FontSizes.xs, color: C.textMuted }}>Loading voice...</Text>
          ) : (
            <View>
              <Text style={{ fontSize: FontSizes.xs, color: C.textMuted }}>Listen to this shloka</Text>
              {!isPremium && <Text style={{ fontSize: 9, color: C.primary, marginTop: 2 }}>{audioRemaining} plays left today</Text>}
            </View>
          )}
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
        {transliteration && (
          <TouchableOpacity onPress={() => playSingle(transliteration, 'Shloka')} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: currentPart === 'Shloka' ? C.primary + '18' : C.glassBg, borderWidth: 1, borderColor: currentPart === 'Shloka' ? C.glassBorderGold : C.glassBorder }}>
            <MaterialCommunityIcons name="volume-high" size={12} color={currentPart === 'Shloka' ? C.primary : C.textMuted} />
            <Text style={{ fontSize: 10, fontWeight: '600', color: currentPart === 'Shloka' ? C.primary : C.textMuted }}>Shloka</Text>
          </TouchableOpacity>
        )}
        {hindi && (
          <TouchableOpacity onPress={() => playSingle(hindi, 'Meaning')} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: currentPart === 'Meaning' ? C.primary + '18' : C.glassBg, borderWidth: 1, borderColor: currentPart === 'Meaning' ? C.glassBorderGold : C.glassBorder }}>
            <MaterialCommunityIcons name="volume-high" size={12} color={currentPart === 'Meaning' ? C.primary : C.textMuted} />
            <Text style={{ fontSize: 10, fontWeight: '600', color: currentPart === 'Meaning' ? C.primary : C.textMuted }}>Meaning</Text>
          </TouchableOpacity>
        )}
        {english && (
          <TouchableOpacity onPress={() => playSingle(english, 'English')} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: currentPart === 'English' ? C.primary + '18' : C.glassBg, borderWidth: 1, borderColor: currentPart === 'English' ? C.glassBorderGold : C.glassBorder }}>
            <MaterialCommunityIcons name="volume-high" size={12} color={currentPart === 'English' ? C.primary : C.textMuted} />
            <Text style={{ fontSize: 10, fontWeight: '600', color: currentPart === 'English' ? C.primary : C.textMuted }}>English</Text>
          </TouchableOpacity>
        )}
      </View>
    </GlassCard>
  );
}