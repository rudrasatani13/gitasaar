// src/components/VoiceInput.js
import React, { useState, useRef, useEffect } from 'react';
import { View, TouchableOpacity, Animated, Platform, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { tapMedium } from '../utils/haptics';

export default function VoiceInput({ onResult, onAutoSend, disabled }) {
  const { colors: C } = useTheme();
  const [isListening, setIsListening] = useState(false);
  const ring1 = useRef(new Animated.Value(0)).current;
  const ring2 = useRef(new Animated.Value(0)).current;
  const ring3 = useRef(new Animated.Value(0)).current;
  const iconScale = useRef(new Animated.Value(1)).current;
  const recognitionRef = useRef(null);
  const supportedRef = useRef(false);

  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SR) {
        supportedRef.current = true;
        const recognition = new SR();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'hi-IN';

        recognition.onresult = (event) => {
          const text = event.results[0][0].transcript;
          if (text) {
            if (onResult) onResult(text);
            // Auto-send after small delay
            setTimeout(() => { if (onAutoSend) onAutoSend(text); }, 400);
          }
          setIsListening(false);
        };
        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);
        recognitionRef.current = recognition;
      }
    }
  }, [onResult, onAutoSend]);

  // Ripple rings animation when listening
  useEffect(() => {
    if (isListening) {
      const animateRing = (ring, delay) => {
        return Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.parallel([
              Animated.timing(ring, { toValue: 1, duration: 1200, useNativeDriver: true }),
            ]),
            Animated.timing(ring, { toValue: 0, duration: 0, useNativeDriver: true }),
          ])
        );
      };

      const a1 = animateRing(ring1, 0);
      const a2 = animateRing(ring2, 400);
      const a3 = animateRing(ring3, 800);
      a1.start(); a2.start(); a3.start();

      // Icon gentle pulse
      Animated.loop(
        Animated.sequence([
          Animated.timing(iconScale, { toValue: 1.15, duration: 500, useNativeDriver: true }),
          Animated.timing(iconScale, { toValue: 0.95, duration: 500, useNativeDriver: true }),
        ])
      ).start();

      return () => { a1.stop(); a2.stop(); a3.stop(); };
    } else {
      ring1.setValue(0); ring2.setValue(0); ring3.setValue(0);
      iconScale.stopAnimation();
      iconScale.setValue(1);
    }
  }, [isListening]);

  const toggleListening = () => {
    tapMedium();

    if (!supportedRef.current) {
      Alert.alert('Voice Input', 'Voice input is only available on web browsers. On the app, please type your message.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (e) {
        setIsListening(false);
      }
    }
  };

  const makeRingStyle = (anim) => ({
    position: 'absolute',
    width: 44, height: 44, borderRadius: 22,
    borderWidth: 2, borderColor: '#E53935',
    opacity: anim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0] }),
    transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.8] }) }],
  });

  return (
    <View style={{ width: 44, height: 44, justifyContent: 'center', alignItems: 'center' }}>
      {/* Ripple rings - only visible when listening */}
      {isListening && (
        <>
          <Animated.View style={makeRingStyle(ring1)} />
          <Animated.View style={makeRingStyle(ring2)} />
          <Animated.View style={makeRingStyle(ring3)} />
        </>
      )}

      <Animated.View style={{ transform: [{ scale: iconScale }] }}>
        <TouchableOpacity onPress={toggleListening} disabled={disabled} activeOpacity={0.7}
          style={{
            width: 44, height: 44, borderRadius: 22,
            backgroundColor: isListening ? '#E53935' + '20' : C.primarySoft,
            borderWidth: 1.5, borderColor: isListening ? '#E53935' : C.borderGold,
            justifyContent: 'center', alignItems: 'center',
          }}>
          <MaterialCommunityIcons
            name={isListening ? 'microphone' : 'microphone-outline'}
            size={20}
            color={isListening ? '#E53935' : C.primary}
          />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}