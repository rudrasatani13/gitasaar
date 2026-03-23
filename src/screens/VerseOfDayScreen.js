// src/screens/VerseOfDayScreen.js
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useBookmarks } from '../theme/BookmarkContext';
import { useTracker } from '../theme/TrackerContext';
import { FontSizes } from '../theme/colors';
import AudioPlayer from '../components/AudioPlayer';
import ShareCardModal from '../components/ShareCardModal';

const { width } = Dimensions.get('window');

function getDailyVerse() {
  let allVerses = null;
  try {
    const db = require('../data/gitaDatabase.json');
    allVerses = [];
    Object.keys(db.verses).forEach(ch => db.verses[ch].forEach(v => allVerses.push(v)));
  } catch (e) {}

  if (!allVerses || allVerses.length === 0) {
    const { sampleVerses } = require('../data/sampleVerses');
    allVerses = sampleVerses;
  }

  const d = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  return allVerses[d % allVerses.length];
}

export default function VerseOfDayScreen({ navigation }) {
  const { colors: C } = useTheme();
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const { markVerseRead } = useTracker();
  const [verse] = useState(getDailyVerse());
  const [showShare, setShowShare] = useState(false);

  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(30)).current;
  const scaleOm = useRef(new Animated.Value(0.5)).current;

  const verseId = verse.chapter + '.' + verse.verse;
  const bookmarked = isBookmarked(verseId);

  useEffect(() => {
    markVerseRead(verseId);
    Animated.sequence([
      Animated.parallel([
        Animated.spring(scaleOm, { toValue: 1, friction: 6, useNativeDriver: true }),
        Animated.timing(fadeIn, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
      Animated.spring(slideUp, { toValue: 0, friction: 8, useNativeDriver: true }),
    ]).start();
  }, []);

  const todayStr = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <LinearGradient colors={C.gradientWarm} style={{ flex: 1 }}>
      {/* Header */}
      <View style={{ paddingTop: 56, paddingBottom: 12, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: C.border }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: C.primarySoft, justifyContent: 'center', alignItems: 'center' }}>
              <MaterialCommunityIcons name="arrow-left" size={20} color={C.primary} />
            </TouchableOpacity>
            <View>
              <Text style={{ fontSize: FontSizes.lg, fontWeight: '700', color: C.textPrimary }}>Verse of the Day</Text>
              <Text style={{ fontSize: FontSizes.xs, color: C.textMuted }}>{todayStr}</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity onPress={() => toggleBookmark(verse)} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: bookmarked ? C.saffron + '15' : C.primarySoft, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: bookmarked ? C.saffron : C.borderGold }}>
              <MaterialCommunityIcons name={bookmarked ? 'bookmark' : 'bookmark-outline'} size={18} color={bookmarked ? C.saffron : C.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowShare(true)} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: C.primarySoft, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: C.borderGold }}>
              <MaterialCommunityIcons name="share-variant-outline" size={18} color={C.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
        {/* Om + Chapter badge */}
        <Animated.View style={{ alignItems: 'center', marginBottom: 24, transform: [{ scale: scaleOm }] }}>
          <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: C.primarySoft, borderWidth: 2, borderColor: C.borderGoldStrong, justifyContent: 'center', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ fontSize: 28, color: C.primary }}>{'\u0950'}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: C.primarySoft, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: C.borderGold }}>
            <MaterialCommunityIcons name="book-open-variant" size={13} color={C.primary} />
            <Text style={{ fontSize: FontSizes.sm, fontWeight: '800', color: C.primary, letterSpacing: 0.5 }}>Chapter {verse.chapter}, Verse {verse.verse}</Text>
          </View>
        </Animated.View>

        <Animated.View style={{ opacity: fadeIn, transform: [{ translateY: slideUp }] }}>
          {/* Sanskrit Card */}
          <View style={{ backgroundColor: C.bgCard, borderRadius: 20, overflow: 'hidden', marginBottom: 16, borderWidth: 1, borderColor: C.border, ...C.shadow }}>
            <View style={{ height: 3, backgroundColor: C.primary }} />
            <View style={{ padding: 22 }}>
              <View style={{ position: 'absolute', top: 8, left: 8, width: 14, height: 14, borderTopWidth: 1.5, borderLeftWidth: 1.5, borderColor: C.borderGold, borderTopLeftRadius: 4, opacity: 0.3 }} />
              <View style={{ position: 'absolute', bottom: 8, right: 8, width: 14, height: 14, borderBottomWidth: 1.5, borderRightWidth: 1.5, borderColor: C.borderGold, borderBottomRightRadius: 4, opacity: 0.3 }} />

              <View style={{ backgroundColor: C.bgSecondary, borderRadius: 12, padding: 18, flexDirection: 'row' }}>
                <View style={{ width: 3, backgroundColor: C.primary, borderRadius: 2, marginRight: 14, opacity: 0.7 }} />
                <Text style={{ flex: 1, fontSize: FontSizes.lg, color: C.textSanskrit, lineHeight: 30, textAlign: 'center' }}>{verse.sanskrit}</Text>
              </View>

              {verse.transliteration && (
                <Text style={{ fontSize: FontSizes.sm, color: C.textMuted, fontStyle: 'italic', textAlign: 'center', marginTop: 14, lineHeight: 22 }}>{verse.transliteration}</Text>
              )}
            </View>
          </View>

          {/* Ornament divider */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16, paddingHorizontal: 40 }}>
            <View style={{ flex: 1, height: 1, backgroundColor: C.divider }} />
            <View style={{ width: 6, height: 6, backgroundColor: C.primary, opacity: 0.3, transform: [{ rotate: '45deg' }] }} />
            <View style={{ flex: 1, height: 1, backgroundColor: C.divider }} />
          </View>

          {/* Meaning */}
          {verse.hindi && (
            <View style={{ backgroundColor: C.bgCard, borderRadius: 16, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: C.border }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: C.primarySoft, justifyContent: 'center', alignItems: 'center' }}>
                  <MaterialCommunityIcons name="translate" size={13} color={C.primary} />
                </View>
                <Text style={{ fontSize: FontSizes.xs, fontWeight: '800', color: C.primary, letterSpacing: 0.5 }}>MEANING</Text>
              </View>
              <Text style={{ fontSize: FontSizes.md, color: C.textSecondary, lineHeight: 24 }}>{verse.hindi}</Text>
            </View>
          )}

          {/* English */}
          <View style={{ backgroundColor: C.bgCard, borderRadius: 16, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: C.border }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: C.peacockBlue + '12', justifyContent: 'center', alignItems: 'center' }}>
                <MaterialCommunityIcons name="format-quote-open" size={13} color={C.peacockBlue} />
              </View>
              <Text style={{ fontSize: FontSizes.xs, fontWeight: '800', color: C.peacockBlue, letterSpacing: 0.5 }}>ENGLISH TRANSLATION</Text>
            </View>
            <Text style={{ fontSize: FontSizes.md, color: C.textSecondary, lineHeight: 24, fontStyle: 'italic' }}>"{verse.english}"</Text>
          </View>

          {/* Audio Player */}
          <View style={{ marginBottom: 14 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: C.saffronSoft, justifyContent: 'center', alignItems: 'center' }}>
                <MaterialCommunityIcons name="headphones" size={13} color={C.saffron} />
              </View>
              <Text style={{ fontSize: FontSizes.xs, fontWeight: '800', color: C.saffron, letterSpacing: 0.5 }}>LISTEN</Text>
            </View>
            <AudioPlayer
              sanskrit={verse.sanskrit}
              transliteration={verse.transliteration}
              hindi={verse.hindi}
              english={verse.english}
            />
          </View>

          {/* Theme badge */}
          {verse.theme && (
            <View style={{ alignItems: 'center', marginTop: 8, marginBottom: 20 }}>
              <View style={{ backgroundColor: C.bgSecondary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: C.border }}>
                <Text style={{ fontSize: FontSizes.xs, color: C.textMuted, fontStyle: 'italic' }}>{verse.theme}</Text>
              </View>
            </View>
          )}
        </Animated.View>

        <View style={{ height: 30 }} />
      </ScrollView>

      <ShareCardModal visible={showShare} verse={verse} onClose={() => setShowShare(false)} />
    </LinearGradient>
  );
}