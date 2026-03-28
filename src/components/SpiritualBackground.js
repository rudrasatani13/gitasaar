// src/components/SpiritualBackground.js
// DARK MODE: Pure black + twinkling gold/white starfield
// LIGHT MODE: returns null (warm parchment bg handles itself)
import React, { useRef, useEffect } from 'react';
import { View, Animated, Dimensions } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

const { width: W, height: H } = Dimensions.get('window');

function makeStars(count) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * W,
    y: Math.random() * H,
    size: Math.random() * 2.4 + 0.4,
    baseOpacity: Math.random() * 0.60 + 0.20,
    // 70% white, 20% warm gold, 10% starlight ivory
    color: i % 5 === 0 ? '#FCD34D'   // warm gold star
         : i % 7 === 0 ? '#FFF8DC'   // starlight ivory
         : '#FFFFFF',                  // pure white star
    group: i % 5,
  }));
}
const ALL_STARS = makeStars(90);

// Very subtle gold glow blobs — barely visible on pure black
const GOLD_BLOBS = [
  { top: -60,   right: -80, size: 300, color: '#E0A850', opacity: 0.030 },
  { bottom: -90, left: -60, size: 260, color: '#C28840', opacity: 0.025 },
  { top: '35%', right: -50, size: 180, color: '#F5C842', opacity: 0.020 },
];

function GoldBlobs() {
  return (
    <>
      {GOLD_BLOBS.map((b, i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            ...(b.top !== undefined ? { top: b.top } : {}),
            ...(b.bottom !== undefined ? { bottom: b.bottom } : {}),
            ...(b.left !== undefined ? { left: b.left } : {}),
            ...(b.right !== undefined ? { right: b.right } : {}),
            width: b.size,
            height: b.size,
            borderRadius: b.size / 2,
            backgroundColor: b.color,
            opacity: b.opacity,
          }}
        />
      ))}
    </>
  );
}

function StarGroup({ stars, anim }) {
  return (
    <>
      {stars.map((s) => (
        <Animated.View
          key={s.id}
          style={{
            position: 'absolute',
            left: s.x,
            top: s.y,
            width: s.size,
            height: s.size,
            borderRadius: s.size / 2,
            backgroundColor: s.color,
            opacity: Animated.multiply(anim, s.baseOpacity),
          }}
        />
      ))}
    </>
  );
}

export function StarfieldBackground() {
  const { isDark } = useTheme();

  const a0 = useRef(new Animated.Value(0.45)).current;
  const a1 = useRef(new Animated.Value(0.70)).current;
  const a2 = useRef(new Animated.Value(0.30)).current;
  const a3 = useRef(new Animated.Value(0.60)).current;
  const a4 = useRef(new Animated.Value(0.50)).current;
  const anims = [a0, a1, a2, a3, a4];

  useEffect(() => {
    if (!isDark) return;
    const configs = [
      { dur: 2000, delay: 0,    min: 0.15, max: 1.0 },
      { dur: 1600, delay: 350,  min: 0.25, max: 0.95 },
      { dur: 2600, delay: 700,  min: 0.10, max: 1.0 },
      { dur: 1900, delay: 200,  min: 0.35, max: 1.0 },
      { dur: 3100, delay: 550,  min: 0.20, max: 0.85 },
    ];
    const loops = anims.map((anim, i) => {
      const { dur, delay, min, max } = configs[i];
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, { toValue: max, duration: dur, useNativeDriver: true }),
          Animated.timing(anim, { toValue: min, duration: dur * 0.85, useNativeDriver: true }),
        ])
      );
    });
    loops.forEach(l => l.start());
    return () => loops.forEach(l => l.stop());
  }, [isDark]);

  if (!isDark) return null;

  return (
    <View
      pointerEvents="none"
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden' }}
    >
      <GoldBlobs />
      {anims.map((anim, i) => (
        <StarGroup
          key={i}
          anim={anim}
          stars={ALL_STARS.filter(s => s.group === i)}
        />
      ))}
    </View>
  );
}

export function ChatBackground()           { return <StarfieldBackground />; }
export function LotusHomeBackground()      { return <StarfieldBackground />; }
export function KrishnaVersesBackground()  { return <StarfieldBackground />; }
export function ShivaJournalBackground()   { return <StarfieldBackground />; }
export function GaneshSettingsBackground() { return <StarfieldBackground />; }
export function HanumanQuizBackground()    { return <StarfieldBackground />; }
export function ResponseImage()            { return null; }