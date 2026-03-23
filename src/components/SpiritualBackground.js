// src/components/SpiritualBackground.js
import React, { useRef, useEffect } from 'react';
import { View, Image, Animated, Dimensions, Platform } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

const { width } = Dimensions.get('window');

// Load all images
const GODS = {};
try { GODS.krishna = require('../../assets/images/gods/krishna-bg.png'); } catch(e) {}
try { GODS.shiva = require('../../assets/images/gods/shiva-bg.png'); } catch(e) {}
try { GODS.hanuman = require('../../assets/images/gods/hanuman-bg.png'); } catch(e) {}
try { GODS.ganesh = require('../../assets/images/gods/ganesh-bg.png'); } catch(e) {}
try { GODS.om = require('../../assets/images/gods/om-bg.png'); } catch(e) {}
try { GODS.lotus = require('../../assets/images/gods/lotus-bg.png'); } catch(e) {}

// Blend mode style - makes black pixels transparent
const blendStyle = Platform.OS === 'web' ? { mixBlendMode: 'screen' } : {};

// Reusable god background component
function GodBackground({ source, size, opacity, bottom, right, left }) {
  const fadeIn = useRef(new Animated.Value(0)).current;
  const { isDark } = useTheme();

  useEffect(() => {
    Animated.timing(fadeIn, { toValue: 1, duration: 1500, useNativeDriver: true }).start();
  }, []);

  if (!source) return null; if (isDark) return null;

  // Slightly higher opacity in dark mode since blend mode works better
  const finalOpacity = isDark ? opacity * 1.4 : opacity;

  return (
    <Animated.View style={{
      position: 'absolute',
      bottom: bottom ?? 60,
      right: right ?? -20,
      left: left,
      width: size,
      height: size,
      opacity: Animated.multiply(fadeIn, new Animated.Value(finalOpacity)),
    }}>
      <Image
        source={source}
        style={[{ width: '100%', height: '100%' }, blendStyle]}
        resizeMode="contain"
      />
    </Animated.View>
  );
}

// ====== CHAT SCREEN - Om ======
export function ChatBackground() {
  return <GodBackground source={GODS.om} size={width * 0.6} opacity={0.07} bottom={80} right={-20} />;
}

// ====== HOME SCREEN - Lotus (full corner) ======
export function LotusHomeBackground() {
  return <GodBackground source={GODS.lotus} size={width * 0.85} opacity={0.08} bottom={0} left={0} right={undefined} />;
}

// ====== VERSES SCREEN - Krishna ======
export function KrishnaVersesBackground() {
  return <GodBackground source={GODS.krishna} size={width * 0.55} opacity={0.07} bottom={60} right={-10} />;
}

// ====== JOURNAL SCREEN - Shiva ======
export function ShivaJournalBackground() {
  return <GodBackground source={GODS.shiva} size={width * 0.5} opacity={0.08} bottom={60} right={-10} />;
}

// ====== SETTINGS SCREEN - Ganesh ======
export function GaneshSettingsBackground() {
  return <GodBackground source={GODS.ganesh} size={width * 0.55} opacity={0.08} bottom={80} right={-20} />;
}

// ====== QUIZ SCREEN - Hanuman ======
export function HanumanQuizBackground() {
  return <GodBackground source={GODS.hanuman} size={width * 0.45} opacity={0.08} bottom={40} right={-10} />;
}

// Disabled - not needed since each screen has its own god
export function ResponseImage() { return null; }