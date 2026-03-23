// src/components/AnimatedPressable.js
import React, { useRef } from 'react';
import { Animated, TouchableOpacity } from 'react-native';

export default function AnimatedPressable({ children, onPress, style, scaleValue = 0.97, disabled = false }) {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(scale, { toValue: scaleValue, friction: 8, tension: 100, useNativeDriver: true }).start();
  };

  const onPressOut = () => {
    Animated.spring(scale, { toValue: 1, friction: 5, tension: 40, useNativeDriver: true }).start();
  };

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={0.95}
        disabled={disabled}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
}