// src/components/AudioPlayer.js
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated, Platform, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import { usePremium } from '../theme/PremiumContext';
import { useTheme } from '../theme/ThemeContext';
import { FontSizes } from '../theme/colors';
import { tapLight } from '../utils/haptics';
import { useNavigation } from '@react-navigation/native';

const ELEVEN_API_KEY = process.env.EXPO_PUBLIC_ELEVEN_KEY;
const VOICE_ID = 'S5P5Y6sMPfFCbxqUJ3F4'; 
const MODEL_ID = 'eleven_multilingual_v2'; 

const hashString = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString();
};

async function generateSpeech(text, label) {
  try {
    if (!ELEVEN_API_KEY) throw new Error("ElevenLabs API Key is missing");

    const isNative = Platform.OS !== 'web';
    let fileUri = null;

    if (isNative) {
      const fileName = `audio_${label}_${hashString(text)}.mp3`;
      fileUri = FileSystem.cacheDirectory + fileName;
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (fileInfo.exists) return { uri: fileUri, isLocal: true };
    }

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
      method: 'POST',
      headers: { 'xi-api-key': ELEVEN_API_KEY, 'Content-Type': 'application/json', 'Accept': 'audio/mpeg' },
      body: JSON.stringify({ text: text, model_id: MODEL_ID, voice_settings: { stability: 0.6, similarity_boost: 0.75, style: 0.3 } }),
    });

    if (!response.ok) return null;
    const blob = await response.blob();

    if (isNative && fileUri) {
      const reader = new FileReader();
      const base64 = await new Promise((resolve) => {
        reader.onloadend = () => resolve(reader.result.split(',')[1]);
        reader.readAsDataURL(blob);
      });
      await FileSystem.writeAsStringAsync(fileUri, base64, { encoding: FileSystem.EncodingType.Base64 });
      return { uri: fileUri, isLocal: true };
    }
    return { blob, isLocal: false };
  } catch (e) {
    return null;
  }
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
    let uri = source.uri;

    if (!source.isLocal && source.blob) {
      const reader = new FileReader();
      const base64 = await new Promise((resolve) => {
        reader.onloadend = () => resolve(reader.result.split(',')[1]);
        reader.readAsDataURL(source.blob);
      });
      uri = `data:audio/mpeg;base64,${base64}`;
    }

    const { sound } = await Audio.Sound.createAsync({ uri }, { shouldPlay: true });
    return new Promise((resolve) => {
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          sound.unloadAsync();
          resolve();
        }
      });
      playNative._current = sound;
    });
  } catch (e) { }
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
    const source = await generateSpeech(text, label);
    if (!source || stoppedRef.current) return;
    
    if (Platform.OS === 'web') await playBlobWeb(source.blob);
    else await playNative(source);
    
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

    if (parts.length === 0) return;

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

    const canPlay = useAudioPlay();
    if (!canPlay) { handlePaywall(); return; }

    tapLight();
    stoppedRef.current = false;
    setIsPlaying(true);
    setCurrentPart(label);

    const source = await generateSpeech(text, label);
    if (source && !stoppedRef.current) {
      if (Platform.OS === 'web') await playBlobWeb(source.blob);
      else await playNative(source);
    }

    if (!stoppedRef.current) {
      setIsPlaying(false);
      setCurrentPart('');
    }
  };

  return (
    <View style={{ backgroundColor: C.bgCard, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: C.border }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <TouchableOpacity onPress={playAll} activeOpacity={0.8} style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: isPlaying ? '#E53935' + '15' : C.primarySoft, borderWidth: 1.5, borderColor: isPlaying ? '#E53935' : C.borderGold, justifyContent: 'center', alignItems: 'center' }}>
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
          <TouchableOpacity onPress={() => playSingle(transliteration, 'Shloka')} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: currentPart === 'Shloka' ? C.primary + '15' : C.bgSecondary, borderWidth: 1, borderColor: currentPart === 'Shloka' ? C.primary : C.border }}>
            <MaterialCommunityIcons name="volume-high" size={12} color={currentPart === 'Shloka' ? C.primary : C.textMuted} />
            <Text style={{ fontSize: 10, fontWeight: '600', color: currentPart === 'Shloka' ? C.primary : C.textMuted }}>Shloka</Text>
          </TouchableOpacity>
        )}
        {hindi && (
          <TouchableOpacity onPress={() => playSingle(hindi, 'Meaning')} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: currentPart === 'Meaning' ? C.primary + '15' : C.bgSecondary, borderWidth: 1, borderColor: currentPart === 'Meaning' ? C.primary : C.border }}>
            <MaterialCommunityIcons name="volume-high" size={12} color={currentPart === 'Meaning' ? C.primary : C.textMuted} />
            <Text style={{ fontSize: 10, fontWeight: '600', color: currentPart === 'Meaning' ? C.primary : C.textMuted }}>Meaning</Text>
          </TouchableOpacity>
        )}
        {english && (
          <TouchableOpacity onPress={() => playSingle(english, 'English')} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: currentPart === 'English' ? C.primary + '15' : C.bgSecondary, borderWidth: 1, borderColor: currentPart === 'English' ? C.primary : C.border }}>
            <MaterialCommunityIcons name="volume-high" size={12} color={currentPart === 'English' ? C.primary : C.textMuted} />
            <Text style={{ fontSize: 10, fontWeight: '600', color: currentPart === 'English' ? C.primary : C.textMuted }}>English</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}