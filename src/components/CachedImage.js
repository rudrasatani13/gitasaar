// src/components/CachedImage.js
import React from 'react';
import { Image as RNImage } from 'react-native';

let ExpoImage = null;
try { ExpoImage = require('expo-image').Image; } catch (e) {}

export default function CachedImage({ source, style, resizeMode = 'cover', ...props }) {
  // Use expo-image if available (better caching, faster loading)
  if (ExpoImage) {
    return (
      <ExpoImage
        source={source}
        style={style}
        contentFit={resizeMode}
        cachePolicy="memory-disk"
        transition={200}
        {...props}
      />
    );
  }

  // Fallback to regular Image
  return <RNImage source={source} style={style} resizeMode={resizeMode} {...props} />;
}