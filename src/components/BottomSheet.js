// src/components/BottomSheet.js
import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated, Dimensions, PanResponder, TouchableWithoutFeedback, Platform } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

const { height: SCREEN_H } = Dimensions.get('window');

export default function BottomSheet({ visible, onClose, title, subtitle, maxHeight = 0.85, children }) {
  const { colors: C } = useTheme();
  const translateY = useRef(new Animated.Value(SCREEN_H)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const sheetHeight = SCREEN_H * maxHeight;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, { toValue: 0, friction: 8, tension: 65, useNativeDriver: true }),
        Animated.timing(backdropOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, { toValue: SCREEN_H, duration: 200, useNativeDriver: true }),
        Animated.timing(backdropOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  const dismiss = () => {
    Animated.parallel([
      Animated.timing(translateY, { toValue: SCREEN_H, duration: 250, useNativeDriver: true }),
      Animated.timing(backdropOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => onClose());
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => g.dy > 5,
      onPanResponderMove: (_, g) => {
        if (g.dy > 0) translateY.setValue(g.dy);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy > 80 || g.vy > 0.5) {
          dismiss();
        } else {
          Animated.spring(translateY, { toValue: 0, friction: 8, useNativeDriver: true }).start();
        }
      },
    })
  ).current;

  if (!visible) return null;

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999 }}>
      {/* Backdrop */}
      <TouchableWithoutFeedback onPress={dismiss}>
        <Animated.View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: C.bgOverlay, opacity: backdropOpacity }} />
      </TouchableWithoutFeedback>

      {/* Sheet */}
      <Animated.View style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        maxHeight: sheetHeight,
        backgroundColor: C.bgPrimary,
        borderTopLeftRadius: 24, borderTopRightRadius: 24,
        transform: [{ translateY }],
        ...C.shadowStrong,
      }}>
        {/* Drag handle */}
        <View {...panResponder.panHandlers} style={{ alignItems: 'center', paddingTop: 12, paddingBottom: 8 }}>
          <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: C.border }} />
        </View>

        {/* Header */}
        {title && (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: C.borderLight }}>
            <View>
              <Text style={{ fontSize: 17, fontWeight: '700', color: C.textPrimary }}>{title}</Text>
              {subtitle && <Text style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>{subtitle}</Text>}
            </View>
            <TouchableOpacity onPress={dismiss} style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: C.bgSecondary, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ fontSize: 16, color: C.textMuted }}>✕</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Content */}
        <View style={{ flex: 1 }}>
          {children}
        </View>

        {/* Safe area bottom */}
        <View style={{ height: Platform.OS === 'ios' ? 34 : 12 }} />
      </Animated.View>
    </View>
  );
}