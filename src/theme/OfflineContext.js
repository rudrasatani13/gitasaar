// src/theme/OfflineContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { View, Text, Animated, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const OfflineContext = createContext();

let NetInfo = null;
try { NetInfo = require('@react-native-community/netinfo'); } catch (e) {}

export function OfflineProvider({ children }) {
  const [isOnline, setIsOnline] = useState(true);
  const bannerY = React.useRef(new Animated.Value(-60)).current;

  useEffect(() => {
    // Web: use navigator.onLine
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const update = () => setIsOnline(navigator.onLine);
      window.addEventListener('online', update);
      window.addEventListener('offline', update);
      setIsOnline(navigator.onLine);
      return () => {
        window.removeEventListener('online', update);
        window.removeEventListener('offline', update);
      };
    }

    // Native: use NetInfo
    if (NetInfo && NetInfo.addEventListener) {
      const unsubscribe = NetInfo.addEventListener(state => {
        setIsOnline(state.isConnected);
      });
      return unsubscribe;
    }
  }, []);

  // Animate banner
  useEffect(() => {
    Animated.spring(bannerY, {
      toValue: isOnline ? -60 : 0,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, [isOnline]);

  return (
    <OfflineContext.Provider value={{ isOnline }}>
      {children}
      {/* Offline Banner */}
      <Animated.View style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        transform: [{ translateY: bannerY }],
        zIndex: 9999,
      }}>
        <View style={{
          backgroundColor: '#D63B2F', paddingTop: Platform.OS === 'ios' ? 50 : 30,
          paddingBottom: 10, paddingHorizontal: 20,
          flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          <MaterialCommunityIcons name="wifi-off" size={16} color="#FFF" />
          <Text style={{ fontSize: 13, fontWeight: '600', color: '#FFF' }}>
            You're offline — Verses & Journal still work!
          </Text>
        </View>
      </Animated.View>
    </OfflineContext.Provider>
  );
}

export function useOffline() {
  return useContext(OfflineContext);
}