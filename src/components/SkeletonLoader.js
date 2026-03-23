// src/components/SkeletonLoader.js
import React, { useRef, useEffect } from 'react';
import { View, Animated } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

function ShimmerBlock({ width, height, radius = 8, style }) {
  const { colors: C } = useTheme();
  const shimmer = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 0.7, duration: 800, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View style={[{
      width, height, borderRadius: radius,
      backgroundColor: C.border, opacity: shimmer,
    }, style]} />
  );
}

// Skeleton for a ShlokaCard
export function ShlokaCardSkeleton() {
  const { colors: C } = useTheme();
  return (
    <View style={{ backgroundColor: C.bgCard, borderRadius: 24, padding: 22, borderWidth: 1, borderColor: C.border }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
        <ShimmerBlock width={80} height={28} radius={14} />
        <ShimmerBlock width={60} height={24} radius={12} />
      </View>
      <View style={{ backgroundColor: C.bgSecondary, borderRadius: 12, padding: 16, marginBottom: 12 }}>
        <ShimmerBlock width="100%" height={20} style={{ marginBottom: 8 }} />
        <ShimmerBlock width="80%" height={20} />
      </View>
      <ShimmerBlock width="60%" height={14} style={{ alignSelf: 'center', marginBottom: 14 }} />
      <ShimmerBlock width="100%" height={16} style={{ marginBottom: 6 }} />
      <ShimmerBlock width="90%" height={16} />
    </View>
  );
}

// Skeleton for a chat message
export function ChatMessageSkeleton() {
  const { colors: C } = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
      <ShimmerBlock width={32} height={32} radius={16} />
      <View style={{ flex: 1 }}>
        <View style={{ backgroundColor: C.bgCard, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: C.borderLight }}>
          <ShimmerBlock width="90%" height={16} style={{ marginBottom: 8 }} />
          <ShimmerBlock width="70%" height={16} style={{ marginBottom: 8 }} />
          <ShimmerBlock width="50%" height={16} />
        </View>
      </View>
    </View>
  );
}

// Skeleton for home screen cards
export function HomeCardSkeleton() {
  const { colors: C } = useTheme();
  return (
    <View style={{ gap: 16 }}>
      {/* Streak skeleton */}
      <View style={{ backgroundColor: C.bgCard, borderRadius: 20, padding: 18, borderWidth: 1, borderColor: C.border }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 }}>
          {[1,2,3,4,5,6,7].map(i => <ShimmerBlock key={i} width={30} height={30} radius={15} />)}
        </View>
        <ShimmerBlock width="100%" height={40} radius={12} />
      </View>
      {/* CTA skeleton */}
      <ShimmerBlock width="100%" height={160} radius={24} />
      {/* Shloka skeleton */}
      <ShlokaCardSkeleton />
    </View>
  );
}

// Generic skeleton row
export function SkeletonRow({ count = 3 }) {
  return (
    <View style={{ flexDirection: 'row', gap: 8 }}>
      {Array.from({ length: count }).map((_, i) => (
        <ShimmerBlock key={i} width={80} height={32} radius={16} style={{ flex: 1 }} />
      ))}
    </View>
  );
}

export default ShimmerBlock;