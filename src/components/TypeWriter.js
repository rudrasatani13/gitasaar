// src/components/TypeWriter.js
import React, { useState, useEffect, useRef } from 'react';
import { Text, Animated } from 'react-native';

export default function TypeWriter({ text, style, speed = 30, onComplete }) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  const indexRef = useRef(0);
  const cursorOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!text) return;
    setDisplayed('');
    setDone(false);
    indexRef.current = 0;

    // Cursor blink
    const blink = Animated.loop(
      Animated.sequence([
        Animated.timing(cursorOpacity, { toValue: 0, duration: 400, useNativeDriver: true }),
        Animated.timing(cursorOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      ])
    );
    blink.start();

    // Type character by character
    const interval = setInterval(() => {
      if (indexRef.current < text.length) {
        // Add multiple chars at once for speed (2-3 chars per tick)
        const charsToAdd = Math.min(3, text.length - indexRef.current);
        indexRef.current += charsToAdd;
        setDisplayed(text.substring(0, indexRef.current));
      } else {
        clearInterval(interval);
        setDone(true);
        blink.stop();
        cursorOpacity.setValue(0);
        if (onComplete) onComplete();
      }
    }, speed);

    return () => {
      clearInterval(interval);
      blink.stop();
    };
  }, [text]);

  return (
    <Text style={style}>
      {displayed}
      {!done && (
        <Animated.Text style={[style, { opacity: cursorOpacity, color: style?.color || '#C28840' }]}>|</Animated.Text>
      )}
    </Text>
  );
}