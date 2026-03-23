// src/components/MurliIcon.js
import React from 'react';
import { View } from 'react-native';

export default function MurliIcon({ size = 24, color = '#C28840' }) {
  const s = size;
  const light = color + '40';

  return (
    <View style={{ width: s, height: s, justifyContent: 'center', alignItems: 'center' }}>
      {/* Main flute body - diagonal */}
      <View style={{ 
        width: s * 0.85, height: s * 0.18, 
        backgroundColor: color, borderRadius: s * 0.09,
        transform: [{ rotate: '-30deg' }],
      }} />
      
      {/* Flute mouthpiece - thinner end */}
      <View style={{ 
        position: 'absolute',
        top: s * 0.18, left: s * 0.02,
        width: s * 0.22, height: s * 0.12, 
        backgroundColor: color, borderRadius: s * 0.06,
        transform: [{ rotate: '-30deg' }],
        opacity: 0.7,
      }} />

      {/* Hole 1 */}
      <View style={{ 
        position: 'absolute', 
        top: s * 0.34, left: s * 0.32,
        width: s * 0.08, height: s * 0.08, 
        borderRadius: s * 0.04, backgroundColor: light,
      }} />
      
      {/* Hole 2 */}
      <View style={{ 
        position: 'absolute', 
        top: s * 0.40, left: s * 0.46,
        width: s * 0.08, height: s * 0.08, 
        borderRadius: s * 0.04, backgroundColor: light,
      }} />
      
      {/* Hole 3 */}
      <View style={{ 
        position: 'absolute', 
        top: s * 0.46, left: s * 0.60,
        width: s * 0.08, height: s * 0.08, 
        borderRadius: s * 0.04, backgroundColor: light,
      }} />

      {/* Ribbon / tassel hanging */}
      <View style={{ 
        position: 'absolute', 
        top: s * 0.28, left: s * 0.38,
        width: s * 0.04, height: s * 0.35, 
        backgroundColor: color, borderRadius: s * 0.02,
        transform: [{ rotate: '10deg' }],
        opacity: 0.5,
      }} />
      <View style={{ 
        position: 'absolute', 
        bottom: s * 0.12, left: s * 0.36,
        width: s * 0.1, height: s * 0.1, 
        borderRadius: s * 0.05, backgroundColor: color,
        opacity: 0.4,
      }} />
    </View>
  );
}