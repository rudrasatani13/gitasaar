// src/components/AudioPlayer.js
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { usePremium } from '../theme/PremiumContext';
import { useTheme } from '../theme/ThemeContext';
import { FontSizes } from '../theme/colors';
import { tapLight } from '../utils/haptics';

const ELEVEN_API_KEY = process.env.EXPO_PUBLIC_ELEVEN_KEY || 'sk_6826fd83d8b5cae619e901a50f6bae2b9071137dc11a3007';
const VOICE_ID = 'S5P5Y6sMPfFCbxqUJ3F4'; // "Adam" - deep calm male voice
const MODEL_ID = 'eleven_multilingual_v2'; // Supports Hindi/Sanskrit

async function generateSpeech(text) {
  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVEN_API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg',
      },
      body: JSON.stringify({
        text: text,
        model_id: MODEL_ID,
        voice_settings: {
          stability: 0.6,
          similarity_boost: 0.75,
          style: 0.3,
        },
      }),
    });

    if (!response.ok) {
      console.log('ElevenLabs error:', response.status, await response.text());
      return null;
    }

    const blob = await response.blob();
    return blob;
  } catch (e) {
    console.log('ElevenLabs fetch error:', e);
    return null;
  }
}

// Web audio player
function playBlobWeb(blob) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audio.onended = () => { URL.revokeObjectURL(url); resolve(); };
    audio.onerror = () => { URL.revokeObjectURL(url); resolve(); };
    audio.play().catch(() => resolve());
    
    // Return stop function
    playBlobWeb._current = audio;
  });
}

function stopWebAudio() {
  if (playBlobWeb._current) {
    playBlobWeb._current.pause();
    playBlobWeb._current = null;
  }
}

// Native audio player using expo-av
async function playBlobNative(blob) {
  try {
    const { Audio } = require('expo-av');
    const reader = new FileReader();
    const base64 = await new Promise((resolve) => {
      reader.onloadend = () => resolve(reader.result.split(',')[1]);
      reader.readAsDataURL(blob);
    });
    
    const { sound } = await Audio.Sound.createAsync(
      { uri: `data:audio/mpeg;base64,${base64}` },
      { shouldPlay: true }
    );
    
    return new Promise((resolve) => {
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          sound.unloadAsync();
          resolve();
        }
      });
      playBlobNative._current = sound;
    });
  } catch (e) {
    console.log('Native audio error:', e);
  }
}

function stopNativeAudio() {
  if (playBlobNative._current) {
    playBlobNative._current.stopAsync().catch(() => {});
    playBlobNative._current = null;
  }
}

export default function AudioPlayer({ sanskrit, transliteration, hindi, english }) {
  const { colors: C } = useTheme();
  const { canUseAudio, isPremium } = usePremium();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPart, setCurrentPart] = useState('');
  const waveAnims = [
    useRef(new Animated.Value(0.3)).current,
    useRef(new Animated.Value(0.3)).current,
    useRef(new Animated.Value(0.3)).current,
    useRef(new Animated.Value(0.3)).current,
    useRef(new Animated.Value(0.3)).current,
  ];
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

  const playPart = async (text, label) => {
    if (stoppedRef.current) return;
    setCurrentPart(label);
    const blob = await generateSpeech(text);
    if (!blob || stoppedRef.current) return;
    
    if (Platform.OS === 'web') {
      await playBlobWeb(blob);
    } else {
      await playBlobNative(blob);
    }
    
    // Small pause between parts
    if (!stoppedRef.current) {
      await new Promise(r => setTimeout(r, 400));
    }
  };

  const playAll = async () => {
    if (!isPremium) { if (typeof window !== 'undefined') window.alert('Audio recitation is a Premium feature. Upgrade to unlock!'); return; }
    if (isPlaying || isLoading) { stop(); return; }

    tapLight();
    stoppedRef.current = false;
    setIsLoading(true);

    const parts = [];
    if (transliteration) parts.push({ text: transliteration, label: 'Shloka' });
    if (hindi) parts.push({ text: hindi, label: 'Meaning' });
    if (english) parts.push({ text: english, label: 'English' });

    if (parts.length === 0) return;

    // Generate first part, then start playing
    setIsLoading(true);
    setIsPlaying(true);
    setIsLoading(false);

    for (const part of parts) {
      if (stoppedRef.current) break;
      await playPart(part.text, part.label);
    }

    if (!stoppedRef.current) {
      setIsPlaying(false);
      setCurrentPart('');
    }
  };

  const playSingle = async (text, label) => {
    if (isPlaying || isLoading) { stop(); return; }

    tapLight();
    stoppedRef.current = false;
    setIsPlaying(true);
    setCurrentPart(label);

    const blob = await generateSpeech(text);
    if (blob && !stoppedRef.current) {
      if (Platform.OS === 'web') await playBlobWeb(blob);
      else await playBlobNative(blob);
    }

    if (!stoppedRef.current) {
      setIsPlaying(false);
      setCurrentPart('');
    }
  };

  return (
    <View style={{ backgroundColor: C.bgCard, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: C.border, ...C.shadowLight }}>
      {/* Main controls */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <TouchableOpacity onPress={playAll} activeOpacity={0.8}
          style={{
            width: 42, height: 42, borderRadius: 21,
            backgroundColor: isPlaying ? '#E53935' + '15' : C.primarySoft,
            borderWidth: 1.5, borderColor: isPlaying ? '#E53935' : C.borderGold,
            justifyContent: 'center', alignItems: 'center',
          }}>
          {isLoading ? (
            <MaterialCommunityIcons name="loading" size={20} color={C.primary} />
          ) : (
            <MaterialCommunityIcons
              name={isPlaying ? 'stop' : 'play'}
              size={20}
              color={isPlaying ? '#E53935' : C.primary}
            />
          )}
        </TouchableOpacity>

        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 8 }}>
          {isPlaying ? (
            <>
              {waveAnims.map((anim, i) => (
                <Animated.View key={i} style={{
                  width: 3, borderRadius: 2, backgroundColor: C.primary,
                  height: 20, opacity: anim, transform: [{ scaleY: anim }],
                }} />
              ))}
              <Text style={{ fontSize: FontSizes.xs, color: C.primary, fontWeight: '600', marginLeft: 8 }}>
                {currentPart || 'Playing...'}
              </Text>
            </>
          ) : isLoading ? (
            <Text style={{ fontSize: FontSizes.xs, color: C.textMuted }}>Loading voice...</Text>
          ) : (
            <Text style={{ fontSize: FontSizes.xs, color: C.textMuted }}>Listen to this shloka</Text>
          )}
        </View>
      </View>

      {/* Individual part buttons */}
      <View style={{ flexDirection: 'row', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
        {transliteration && (
          <TouchableOpacity onPress={() => playSingle(transliteration, 'Shloka')}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: currentPart === 'Shloka' ? C.primary + '15' : C.bgSecondary, borderWidth: 1, borderColor: currentPart === 'Shloka' ? C.primary : C.border }}>
            <MaterialCommunityIcons name="volume-high" size={12} color={currentPart === 'Shloka' ? C.primary : C.textMuted} />
            <Text style={{ fontSize: 10, fontWeight: '600', color: currentPart === 'Shloka' ? C.primary : C.textMuted }}>Shloka</Text>
          </TouchableOpacity>
        )}
        {hindi && (
          <TouchableOpacity onPress={() => playSingle(hindi, 'Meaning')}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: currentPart === 'Meaning' ? C.primary + '15' : C.bgSecondary, borderWidth: 1, borderColor: currentPart === 'Meaning' ? C.primary : C.border }}>
            <MaterialCommunityIcons name="volume-high" size={12} color={currentPart === 'Meaning' ? C.primary : C.textMuted} />
            <Text style={{ fontSize: 10, fontWeight: '600', color: currentPart === 'Meaning' ? C.primary : C.textMuted }}>Meaning</Text>
          </TouchableOpacity>
        )}
        {english && (
          <TouchableOpacity onPress={() => playSingle(english, 'English')}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: currentPart === 'English' ? C.primary + '15' : C.bgSecondary, borderWidth: 1, borderColor: currentPart === 'English' ? C.primary : C.border }}>
            <MaterialCommunityIcons name="volume-high" size={12} color={currentPart === 'English' ? C.primary : C.textMuted} />
            <Text style={{ fontSize: 10, fontWeight: '600', color: currentPart === 'English' ? C.primary : C.textMuted }}>English</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}