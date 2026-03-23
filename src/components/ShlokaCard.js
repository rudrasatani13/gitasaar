// src/components/ShlokaCard.js
import React, { useRef, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useBookmarks } from '../theme/BookmarkContext';
import { FontSizes } from '../theme/colors';
import ShareCardModal from './ShareCardModal';

export default function ShlokaCard({ verse, animate }) {
  const { colors: C } = useTheme();
  const { isBookmarked, toggleBookmark } = useBookmarks();
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
  }, []);

  const handleBookmark = () => {
    Animated.sequence([
      Animated.spring(bookmarkScale, { toValue: 1.4, friction: 3, useNativeDriver: true }),
      Animated.spring(bookmarkScale, { toValue: 1, friction: 5, useNativeDriver: true }),
    ]).start();
    toggleBookmark(verse);
  };

  return (
    <Animated.View style={{ opacity: fadeIn, transform: [{ translateY: slideUp }] }}>
      <View style={{ borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: C.border, ...C.shadow }}>
        {/* Top accent gradient bar */}
        <View style={{ height: 4, flexDirection: 'row' }}>
          <View style={{ flex: 1, backgroundColor: C.primary, opacity: 0.6 }} />
          <View style={{ flex: 2, backgroundColor: C.primary }} />
          <View style={{ flex: 1, backgroundColor: C.primary, opacity: 0.6 }} />
        </View>

        <View style={{ backgroundColor: C.bgCardElevated, padding: 22 }}>
          {/* Corner ornaments */}
          <View style={{ position: 'absolute', top: 10, left: 10, width: 16, height: 16, borderTopWidth: 1.5, borderLeftWidth: 1.5, borderColor: C.borderGold, borderTopLeftRadius: 4, opacity: 0.3 }} />
          <View style={{ position: 'absolute', top: 10, right: 10, width: 16, height: 16, borderTopWidth: 1.5, borderRightWidth: 1.5, borderColor: C.borderGold, borderTopRightRadius: 4, opacity: 0.3 }} />
          <View style={{ position: 'absolute', bottom: 10, left: 10, width: 16, height: 16, borderBottomWidth: 1.5, borderLeftWidth: 1.5, borderColor: C.borderGold, borderBottomLeftRadius: 4, opacity: 0.3 }} />
          <View style={{ position: 'absolute', bottom: 10, right: 10, width: 16, height: 16, borderBottomWidth: 1.5, borderRightWidth: 1.5, borderColor: C.borderGold, borderBottomRightRadius: 4, opacity: 0.3 }} />

          {/* Header row */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: C.primarySoft, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: C.borderGold }}>
                <MaterialCommunityIcons name="book-open-variant" size={12} color={C.primary} />
                <Text style={{ fontSize: FontSizes.xs, fontWeight: '800', color: C.primary, letterSpacing: 0.5 }}>{verse.chapter}.{verse.verse}</Text>
              </View>
              {verse.theme && (
                <View style={{ backgroundColor: C.bgSecondary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 }}>
                  <Text style={{ fontSize: 10, color: C.textMuted, fontStyle: 'italic' }}>{verse.theme}</Text>
                </View>
              )}
            </View>
            <Animated.View style={{ transform: [{ scale: bookmarkScale }] }}>
              <TouchableOpacity onPress={handleBookmark} activeOpacity={0.7}
                style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: bookmarked ? C.saffron + '15' : C.bgSecondary, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: bookmarked ? C.saffron + '30' : C.border }}>
                <MaterialCommunityIcons name={bookmarked ? 'bookmark' : 'bookmark-outline'} size={16} color={bookmarked ? C.saffron : C.textMuted} />
              </TouchableOpacity>
            </Animated.View>
          </View>

          {/* Sanskrit box with gold sidebar */}
          <View style={{ backgroundColor: C.bgSecondary, borderRadius: 14, overflow: 'hidden', marginBottom: 14 }}>
            <View style={{ flexDirection: 'row' }}>
              <View style={{ width: 4, backgroundColor: C.primary, opacity: 0.6 }} />
              <View style={{ flex: 1, padding: 16 }}>
                <Text style={{ fontSize: FontSizes.md, color: C.textSanskrit, lineHeight: 28, textAlign: 'center' }}>{verse.sanskrit}</Text>
              </View>
            </View>
          </View>

          {/* Transliteration */}
          {verse.transliteration ? (
            <Text style={{ fontSize: FontSizes.sm, color: C.textMuted, fontStyle: 'italic', textAlign: 'center', marginBottom: 14, lineHeight: 22, paddingHorizontal: 8 }}>{verse.transliteration}</Text>
          ) : null}

          {/* Diamond divider */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14, paddingHorizontal: 20 }}>
            <View style={{ flex: 1, height: 1, backgroundColor: C.divider }} />
            <View style={{ width: 6, height: 6, backgroundColor: C.primary, opacity: 0.3, transform: [{ rotate: '45deg' }] }} />
            <View style={{ flex: 1, height: 1, backgroundColor: C.divider }} />
          </View>

          {/* Hindi meaning */}
          {verse.hindi ? (
            <Text style={{ fontSize: FontSizes.sm, color: C.textSecondary, lineHeight: 23, marginBottom: 10, paddingHorizontal: 4 }}>{verse.hindi}</Text>
          ) : null}

          {/* English */}
          {verse.english ? (
            <View style={{ backgroundColor: C.bgSecondary, borderRadius: 12, padding: 14, marginBottom: 14, borderLeftWidth: 3, borderLeftColor: C.peacockBlue + '40' }}>
              <Text style={{ fontSize: FontSizes.sm, color: C.textMuted, lineHeight: 22, fontStyle: 'italic' }}>"{verse.english}"</Text>
            </View>
          ) : null}

          {/* Action buttons */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 10, marginTop: 4 }}>
            <TouchableOpacity onPress={() => setShowShare(true)}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999, backgroundColor: C.bgSecondary, borderWidth: 1, borderColor: C.border }}>
              <MaterialCommunityIcons name="card-multiple-outline" size={14} color={C.primary} />
              <Text style={{ fontSize: FontSizes.xs, fontWeight: '600', color: C.primary }}>Card</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999, backgroundColor: C.bgSecondary, borderWidth: 1, borderColor: C.border }}>
              <MaterialCommunityIcons name="share-variant-outline" size={14} color={C.primary} />
              <Text style={{ fontSize: FontSizes.xs, fontWeight: '600', color: C.primary }}>Share</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleBookmark}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999, backgroundColor: bookmarked ? C.saffron + '10' : C.bgSecondary, borderWidth: 1, borderColor: bookmarked ? C.saffron + '25' : C.border }}>
              <MaterialCommunityIcons name={bookmarked ? 'bookmark' : 'bookmark-plus-outline'} size={14} color={bookmarked ? C.saffron : C.primary} />
              <Text style={{ fontSize: FontSizes.xs, fontWeight: '600', color: bookmarked ? C.saffron : C.primary }}>{bookmarked ? 'Saved' : 'Save'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ShareCardModal visible={showShare} verse={verse} onClose={() => setShowShare(false)} />
    </Animated.View>
  );
}