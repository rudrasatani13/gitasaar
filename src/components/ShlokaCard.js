// src/components/ShlokaCard.js
import React, { useRef, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useBookmarks } from '../theme/BookmarkContext';
import { useTracker } from '../theme/TrackerContext';
import { FontSizes } from '../theme/colors';
import ShareCardModal from './ShareCardModal';
import AudioPlayer from './AudioPlayer';
import GlassCard from './GlassCard';

export default function ShlokaCard({ verse, animate }) {
  const { colors: C, isDark } = useTheme();
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const { markVerseRead } = useTracker();
  const [showShare, setShowShare] = useState(false);

  const fadeIn = useRef(new Animated.Value(animate ? 0 : 1)).current;
  const slideUp = useRef(new Animated.Value(animate ? 24 : 0)).current;
  const bookmarkScale = useRef(new Animated.Value(1)).current;

  const verseId = verse.chapter + '.' + verse.verse;
  const bookmarked = isBookmarked(verseId);

  useEffect(() => {
    if (animate) {
      Animated.parallel([
        Animated.timing(fadeIn, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.spring(slideUp, { toValue: 0, friction: 8, tension: 55, useNativeDriver: true }),
      ]).start();
    }
    if (verse.chapter && verse.verseNumber) {
      markVerseRead(verse.chapter, verse.verseNumber);
    }
  }, [verse.chapter, verse.verseNumber]);

  const handleBookmark = () => {
    Animated.sequence([
      Animated.spring(bookmarkScale, { toValue: 1.45, friction: 3, useNativeDriver: true }),
      Animated.spring(bookmarkScale, { toValue: 1, friction: 5, useNativeDriver: true }),
    ]).start();
    toggleBookmark(verse);
  };

  return (
    <Animated.View style={{ opacity: fadeIn, transform: [{ translateY: slideUp }], marginBottom: 20 }}>
      <GlassCard noPadding style={{ borderRadius: 24, overflow: 'hidden' }} intensity={55}>

        {/* Gradient top accent */}
        <LinearGradient
          colors={C.gradientTemple}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={{ height: 5 }}
        />

        <View style={{ padding: 20 }}>

          {/* Chapter badge + theme */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <LinearGradient
              colors={['rgba(224,168,80,0.18)', 'rgba(224,168,80,0.07)']}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, borderWidth: 1, borderColor: C.glassBorderGold }}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            >
              <MaterialCommunityIcons name="book-open-page-variant" size={13} color={C.primary} />
              <Text style={{ fontSize: FontSizes.xs, fontWeight: '800', color: C.primary, letterSpacing: 0.8 }}>
                CHAPTER {verse.chapter} • VERSE {verse.verse}
              </Text>
            </LinearGradient>
            {verse.theme && (
              <Text style={{ fontSize: 11, color: C.textMuted, fontStyle: 'italic', fontWeight: '500', maxWidth: 110, textAlign: 'right' }} numberOfLines={1}>
                {verse.theme}
              </Text>
            )}
          </View>

          {/* Sanskrit text — rich warm bubble */}
          <View style={{ borderRadius: 18, overflow: 'hidden', marginBottom: 14 }}>
            <LinearGradient
              colors={['rgba(224,168,80,0.12)', 'rgba(5,5,20,0.85)']}
              style={{ padding: 20, alignItems: 'center', borderWidth: 1, borderColor: C.glassBorderGold, borderRadius: 18 }}
            >
              {/* Om watermark */}
              <Text style={{ position: 'absolute', fontSize: 80, color: C.primary, opacity: 0.05, fontWeight: '900' }}>ॐ</Text>
              <Text style={{
                fontSize: FontSizes.lg,
                color: '#FCD34D',
                lineHeight: 34,
                textAlign: 'center',
                fontWeight: '600',
                letterSpacing: 0.5,
              }}>
                {verse.sanskrit}
              </Text>
            </LinearGradient>
          </View>

          {/* Transliteration */}
          {verse.transliteration && (
            <Text style={{
              fontSize: 13,
              color: C.textMuted,
              fontStyle: 'italic',
              textAlign: 'center',
              marginBottom: 18,
              lineHeight: 20,
              paddingHorizontal: 8,
              letterSpacing: 0.2,
            }}>
              {verse.transliteration}
            </Text>
          )}

          {/* Gold divider with diamond */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <View style={{ flex: 1, height: 1, backgroundColor: C.glassBorderGold, opacity: 0.5 }} />
            <MaterialCommunityIcons name="rhombus" size={10} color={C.primary} />
            <View style={{ flex: 1, height: 1, backgroundColor: C.glassBorderGold, opacity: 0.5 }} />
          </View>

          {/* Translations */}
          <View style={{ gap: 12 }}>
            {verse.hindi && (
              <View style={{ backgroundColor: C.glassBg, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: C.glassBorder }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 8 }}>
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: C.primary }} />
                  <Text style={{ fontSize: 10, fontWeight: '800', color: C.primary, letterSpacing: 1 }}>हिंदी</Text>
                </View>
                <Text style={{ fontSize: FontSizes.sm, color: C.textSecondary, lineHeight: 22 }}>
                  {verse.hindi}
                </Text>
              </View>
            )}
            {verse.english && (
              <View style={{ backgroundColor: C.glassBg, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: C.glassBorder }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 8 }}>
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: C.peacockBlue }} />
                  <Text style={{ fontSize: 10, fontWeight: '800', color: C.peacockBlue, letterSpacing: 1 }}>ENGLISH</Text>
                </View>
                <Text style={{ fontSize: FontSizes.sm, color: C.textMuted, lineHeight: 22 }}>
                  {verse.english}
                </Text>
              </View>
            )}
          </View>

          {/* Audio Player */}
          <View style={{ marginTop: 18, marginBottom: 4 }}>
            <AudioPlayer
              sanskrit={verse.sanskrit}
              transliteration={verse.transliteration}
              hindi={verse.hindi}
              english={verse.english}
            />
          </View>

          {/* Actions */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 18, paddingTop: 14, borderTopWidth: 1, borderTopColor: C.glassBorder }}>
            <TouchableOpacity onPress={() => setShowShare(true)} activeOpacity={0.8}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 999, backgroundColor: C.glassBg, borderWidth: 1, borderColor: C.glassBorder }}>
              <MaterialCommunityIcons name="share-variant-outline" size={15} color={C.primary} />
              <Text style={{ fontSize: FontSizes.xs, fontWeight: '700', color: C.primary }}>Share</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleBookmark} activeOpacity={0.7}>
              <Animated.View style={{
                flexDirection: 'row', alignItems: 'center', gap: 6,
                paddingHorizontal: 18, paddingVertical: 10, borderRadius: 999,
                backgroundColor: bookmarked ? (isDark ? 'rgba(224,168,80,0.18)' : 'rgba(194,136,64,0.12)') : C.glassBg,
                borderWidth: 1.5,
                borderColor: bookmarked ? C.primary : C.glassBorder,
                transform: [{ scale: bookmarkScale }],
              }}>
                <MaterialCommunityIcons
                  name={bookmarked ? 'bookmark' : 'bookmark-outline'}
                  size={15}
                  color={bookmarked ? C.primary : C.textMuted}
                />
                <Text style={{ fontSize: FontSizes.xs, fontWeight: '700', color: bookmarked ? C.primary : C.textMuted }}>
                  {bookmarked ? 'Saved ✓' : 'Save'}
                </Text>
              </Animated.View>
            </TouchableOpacity>
          </View>
        </View>
      </GlassCard>

      {/* Share Modal */}
      {showShare && (
        <ShareCardModal visible={showShare} onClose={() => setShowShare(false)} verse={verse} />
      )}
    </Animated.View>
  );
}