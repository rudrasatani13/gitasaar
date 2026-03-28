// src/components/SpiritualBackground.js
// SERENE OCEAN THEME — twinkling starfield + ocean glow blobs
import React, { useRef, useEffect } from 'react';
import { View, Animated, Dimensions } from 'react-native';

const { width: W, height: H } = Dimensions.get('window');

function makeStars(count) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * W,
    y: Math.random() * H,
    size: Math.random() * 2.2 + 0.4,
    baseOpacity: Math.random() * 0.55 + 0.25,
    // tint: ~20% of stars get a subtle cyan tint
    color: i % 5 === 0 ? '#A5F3FC' : i % 7 === 0 ? '#BAE6FD' : '#FFFFFF',
    group: i % 5,
  }));
}
const ALL_STARS = makeStars(90);

// Ocean glow blobs — deep blues, teals, cyan
const OCEAN_BLOBS = [
  { top: -70,   right: -90, size: 320, color: '#0EA5E9', opacity: 0.065 }, // sky blue
  { bottom: -100, left: -70, size: 280, color: '#0D9488', opacity: 0.060 }, // teal
  { top: '30%', right: -60, size: 210, color: '#22D3EE', opacity: 0.045 }, // bright cyan
  { top: '62%', left: -50,  size: 190, color: '#1D4ED8', opacity: 0.040 }, // deep ocean blue
  { top: '12%', left: '32%', size: 150, color: '#E0A850', opacity: 0.020 }, // gold shimmer
];

function OceanBlobs() {
  return (
    <>
      {OCEAN_BLOBS.map((b, i) => (
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
  const anims = [
    useRef(new Animated.Value(0.45)).current,
    useRef(new Animated.Value(0.70)).current,
    useRef(new Animated.Value(0.30)).current,
    useRef(new Animated.Value(0.60)).current,
    useRef(new Animated.Value(0.50)).current,
  ];

  useEffect(() => {
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
  }, []);

  return (
    <View
      pointerEvents="none"
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden' }}
    >
      <OceanBlobs />
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