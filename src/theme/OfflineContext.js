// src/theme/OfflineContext.js
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Animated, Text, Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const OfflineContext = createContext();

export function OfflineProvider({ children }) {
  const [isOffline, setIsOffline] = useState(false);
  
  // Banner ko animate (slide up/down) karne ke liye
  const slideAnim = useRef(new Animated.Value(-150)).current;

  useEffect(() => {
    // Ye function lagataar net check karta rahega
    const unsubscribe = NetInfo.addEventListener(state => {
      const offline = state.isConnected === false;
      setIsOffline(offline);

      // Animation trigger karo
      Animated.spring(slideAnim, {
        toValue: offline ? 0 : -150, // 0 = Screen par dikhao, -150 = Upar chupa do
        useNativeDriver: true,
        friction: 8,
        tension: 40,
      }).start();
    });

    return () => unsubscribe();
  }, []);

  return (
    <OfflineContext.Provider value={{ isOffline }}>
      {children}
      
      {/* GLOBAL OFFLINE BANNER */}
      <Animated.View
        style={{
          position: 'absolute',
          top: Platform.OS === 'ios' ? 50 : 40,
          alignSelf: 'center',
          backgroundColor: '#2C2C2E', // Premium Dark Gray background
          paddingVertical: 10,
          paddingHorizontal: 20,
          borderRadius: 20,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          transform: [{ translateY: slideAnim }],
          zIndex: 9999, // Hamesha sabse upar rahega
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 5,
          elevation: 8,
        }}
      >
        <MaterialCommunityIcons name="wifi-off" size={18} color="#FF6B6B" />
        <Text style={{ color: '#FFF', fontSize: 13, fontWeight: '600', letterSpacing: 0.5 }}>
          You are offline. Saved verses available.
        </Text>
      </Animated.View>
    </OfflineContext.Provider>
  );
}

export function useOffline() {
  return useContext(OfflineContext);
}