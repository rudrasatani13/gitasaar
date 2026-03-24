// src/components/ShlokaCard.js
import React, { useRef, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useBookmarks } from '../theme/BookmarkContext';
import { useTracker } from '../theme/TrackerContext';
import { FontSizes } from '../theme/colors';
import ShareCardModal from './ShareCardModal';
import AudioPlayer from './AudioPlayer'; // ✨ NAYA: AudioPlayer import kiya

export default function ShlokaCard({ verse, animate }) {
  const { colors: C } = useTheme();
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const { markVerseRead } = useTracker();
  const [showShare, setShowShare] = useState(false);

  const fadeIn = useRef(new Animated.Value(animate ? 0 : 1)).current;
  const slideUp = useRef(new Animated.Value(animate ? 20 : 0)).current;
  const bookmarkScale = useRef(new Animated.Value(1)).current;

  const verseId = verse.chapter + '.' + verse.verse;
  const bookmarked = isBookmarked(verseId);

  useEffect(() => {
    if (animate) {
      Animated.parallel([
        Animated.timing(fadeIn, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.spring(slideUp, { toValue: 0, friction: 8, useNativeDriver: true }),
      ]).start();
    }
    // Mark verse as read when opened
    if (verse.chapter && verse.verseNumber) {
      markVerseRead(verse.chapter, verse.verseNumber);
    }
  }, [verse.chapter, verse.verseNumber]);

  const handleBookmark = () => {
    Animated.sequence([
      Animated.spring(bookmarkScale, { toValue: 1.4, friction: 3, useNativeDriver: true }),
      Animated.spring(bookmarkScale, { toValue: 1, friction: 5, useNativeDriver: true })
    ]).start();
    toggleBookmark(verse);
  };

  return (
    <Animated.View style={{ opacity: fadeIn, transform: [{ translateY: slideUp }], marginBottom: 16 }}>
      <View style={{ backgroundColor: C.bgCardElevated, borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: C.border, ...C.shadow }}>
        {/* Top Accent Line */}
        <View style={{ height: 4, backgroundColor: C.primary }} />

        <View style={{ padding: 20 }}>
          {/* Header: Chapter & Theme */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.primarySoft, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: C.borderGold }}>
              <MaterialCommunityIcons name="book-open-page-variant" size={14} color={C.primary} />
              <Text style={{ fontSize: FontSizes.xs, fontWeight: '800', color: C.primary, letterSpacing: 0.5 }}>
                CHAPTER {verse.chapter} • VERSE {verse.verse}
              </Text>
            </View>
            {verse.theme && (
              <Text style={{ fontSize: FontSizes.xs, color: C.textMuted, fontStyle: 'italic', fontWeight: '500' }}>
                {verse.theme}
              </Text>
            )}
          </View>

          {/* Sanskrit Text */}
          <View style={{ backgroundColor: C.bgSecondary, borderRadius: 12, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: C.borderLight }}>
            <Text style={{ fontSize: FontSizes.lg, color: C.textSanskrit, lineHeight: 32, textAlign: 'center', fontWeight: '500' }}>
              {verse.sanskrit}
            </Text>
          </View>

          {/* Transliteration */}
          {verse.transliteration && (
            <Text style={{ fontSize: FontSizes.sm, color: C.textMuted, fontStyle: 'italic', textAlign: 'center', marginBottom: 16, lineHeight: 22, paddingHorizontal: 10 }}>
              {verse.transliteration}
            </Text>
          )}

          {/* Divider */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <View style={{ flex: 1, height: 1, backgroundColor: C.divider }} />
            <View style={{ width: 6, height: 6, backgroundColor: C.primary, opacity: 0.4, transform: [{ rotate: '45deg' }] }} />
            <View style={{ flex: 1, height: 1, backgroundColor: C.divider }} />
          </View>

          {/* Translations */}
          <View style={{ gap: 10 }}>
            {verse.hindi && (
              <Text style={{ fontSize: FontSizes.md, color: C.textSecondary, lineHeight: 24, textAlign: 'justify' }}>
                <Text style={{ fontWeight: '700', color: C.textPrimary }}>हिंदी: </Text>
                {verse.hindi}
              </Text>
            )}
            {verse.english && (
              <Text style={{ fontSize: FontSizes.md, color: C.textMuted, lineHeight: 24, textAlign: 'justify' }}>
                <Text style={{ fontWeight: '700', color: C.textSecondary }}>English: </Text>
                {verse.english}
              </Text>
            )}
          </View>

          {/* ✨ NAYA: AUDIO PLAYER INTEGRATION ✨ */}
          <View style={{ marginTop: 20, marginBottom: 4 }}>
            <AudioPlayer 
              sanskrit={verse.sanskrit}
              transliteration={verse.transliteration}
              hindi={verse.hindi}
              english={verse.english}
            />
          </View>

          {/* Actions */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: C.borderLight }}>
            <TouchableOpacity onPress={() => setShowShare(true)}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999, backgroundColor: C.bgSecondary, borderWidth: 1, borderColor: C.border }}>
              <MaterialCommunityIcons name="share-variant-outline" size={14} color={C.primary} />
              <Text style={{ fontSize: FontSizes.xs, fontWeight: '600', color: C.primary }}>Share</Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={handleBookmark} activeOpacity={0.7}>
              <Animated.View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999, backgroundColor: bookmarked ? C.saffronSoft : C.bgSecondary, borderWidth: 1, borderColor: bookmarked ? C.primary : C.border, transform: [{ scale: bookmarkScale }] }}>
                <MaterialCommunityIcons name={bookmarked ? 'bookmark' : 'bookmark-outline'} size={16} color={bookmarked ? C.primary : C.textMuted} />
                <Text style={{ fontSize: FontSizes.xs, fontWeight: '600', color: bookmarked ? C.primary : C.textMuted }}>
                  {bookmarked ? 'Saved' : 'Save'}
                </Text>
              </Animated.View>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Share Modal */}
      {showShare && (
        <ShareCardModal 
          visible={showShare} 
          onClose={() => setShowShare(false)} 
          verse={verse} 
        />
      )}
    </Animated.View>
  );
}