// src/screens/VerseLibraryScreen.js
import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useTracker } from '../theme/TrackerContext';
import { FontSizes } from '../theme/colors';
import { KrishnaVersesBackground } from "../components/SpiritualBackground";
import ShlokaCard from '../components/ShlokaCard';

let gitaData = null;
try { gitaData = require('../data/gitaDatabase.json'); } catch (e) {}

const CHAPTERS = [
  { number: 1, name: 'Arjuna Vishada Yoga', nameHindi: 'अर्जुन विषाद योग', verses: 47, theme: "Arjuna's Dilemma" },
  { number: 2, name: 'Sankhya Yoga', nameHindi: 'सांख्य योग', verses: 72, theme: 'Yoga of Knowledge' },
  { number: 3, name: 'Karma Yoga', nameHindi: 'कर्म योग', verses: 43, theme: 'Yoga of Action' },
  { number: 4, name: 'Jnana Karma Sanyasa Yoga', nameHindi: 'ज्ञान कर्म संन्यास योग', verses: 42, theme: 'Renunciation through Knowledge' },
  { number: 5, name: 'Karma Sanyasa Yoga', nameHindi: 'कर्म संन्यास योग', verses: 29, theme: 'Yoga of Renunciation' },
  { number: 6, name: 'Dhyana Yoga', nameHindi: 'ध्यान योग', verses: 47, theme: 'Yoga of Meditation' },
  { number: 7, name: 'Jnana Vijnana Yoga', nameHindi: 'ज्ञान विज्ञान योग', verses: 30, theme: 'Knowledge and Wisdom' },
  { number: 8, name: 'Aksara Brahma Yoga', nameHindi: 'अक्षर ब्रह्म योग', verses: 28, theme: 'Imperishable Brahman' },
  { number: 9, name: 'Raja Vidya Yoga', nameHindi: 'राज विद्या योग', verses: 34, theme: 'Confidential Knowledge' },
  { number: 10, name: 'Vibhuti Yoga', nameHindi: 'विभूति योग', verses: 42, theme: 'Opulence of the Absolute' },
  { number: 11, name: 'Vishwarupa Darshana Yoga', nameHindi: 'विश्वरूप दर्शन योग', verses: 55, theme: 'Universal Form' },
  { number: 12, name: 'Bhakti Yoga', nameHindi: 'भक्ति योग', verses: 20, theme: 'Yoga of Devotion' },
  { number: 13, name: 'Kshetra Vibhaga Yoga', nameHindi: 'क्षेत्र विभाग योग', verses: 35, theme: 'Nature and Enjoyer' },
  { number: 14, name: 'Gunatraya Vibhaga Yoga', nameHindi: 'गुणत्रय विभाग योग', verses: 27, theme: 'Three Modes of Nature' },
  { number: 15, name: 'Purushottama Yoga', nameHindi: 'पुरुषोत्तम योग', verses: 20, theme: 'Supreme Person' },
  { number: 16, name: 'Daivasura Vibhaga Yoga', nameHindi: 'दैवासुर विभाग योग', verses: 24, theme: 'Divine and Demonic' },
  { number: 17, name: 'Shraddhatraya Yoga', nameHindi: 'श्रद्धात्रय योग', verses: 28, theme: 'Three Divisions of Faith' },
  { number: 18, name: 'Moksha Sanyasa Yoga', nameHindi: 'मोक्ष संन्यास योग', verses: 78, theme: 'Yoga of Liberation' },
];

function getAllVerses() {
  if (!gitaData) return [];
  const all = [];
  Object.keys(gitaData.verses).forEach((ch) => gitaData.verses[ch].forEach((v) => all.push(v)));
  return all;
}

const QUICK_TAGS = [
  { label: 'Karma', query: 'karma' }, { label: 'Dharma', query: 'dharma' },
  { label: 'Atma', query: 'soul' }, { label: 'Peace', query: 'peace' },
  { label: 'Devotion', query: 'devotion' }, { label: 'Mind', query: 'mind' },
  { label: 'Yoga', query: 'yoga' }, { label: 'Death', query: 'death' },
];

export default function VerseLibraryScreen() {
  const { colors: C } = useTheme();
  const { markVerseRead, isVerseRead, getChapterProgress, totalRead, totalPercent } = useTracker();
  const [refreshing, setRefreshing] = React.useState(false);
  const onRefresh = () => { setRefreshing(true); setTimeout(() => setRefreshing(false), 800); };
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [selectedVerse, setSelectedVerse] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const chapters = gitaData ? gitaData.chapters : CHAPTERS;
  const allVerses = useMemo(() => getAllVerses(), []);
  const getChapterVerses = (num) => (gitaData && gitaData.verses[num]) ? gitaData.verses[num] : [];

  const isSearching = searchQuery.trim().length >= 2;
  const searchResults = useMemo(() => {
    if (!isSearching) return [];
    const q = searchQuery.trim().toLowerCase();
    return allVerses.filter((v) =>
      (v.sanskrit && v.sanskrit.toLowerCase().includes(q)) ||
      (v.english && v.english.toLowerCase().includes(q)) ||
      (v.hindi && v.hindi.toLowerCase().includes(q)) ||
      (v.transliteration && v.transliteration.toLowerCase().includes(q)) ||
      (v.chapter + '.' + v.verse).includes(q)
    ).slice(0, 30);
  }, [searchQuery, allVerses]);

  // When verse modal opens, mark as read
  const openVerse = (v) => {
    setSelectedVerse(v);
    markVerseRead(v.chapter, v.verse);
  };

  return (
    <LinearGradient colors={C.gradientWarm} style={{ flex: 1 }}>
      <KrishnaVersesBackground />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 60 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.primary} colors={[C.primary]} />}>

        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: FontSizes.xxxl, fontWeight: '700', color: C.textPrimary }}>Verse Library</Text>
          <Text style={{ fontSize: FontSizes.lg, color: C.primary, marginTop: 4 }}>{'श्लोक संग्रह'}</Text>
        </View>

        {/* Overall Progress */}
        <View style={{ backgroundColor: C.bgCard, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: C.border, ...C.shadowLight }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <MaterialCommunityIcons name="book-open-page-variant" size={16} color={C.peacockBlue} />
              <Text style={{ fontSize: FontSizes.sm, fontWeight: '600', color: C.textPrimary }}>Overall Progress</Text>
            </View>
            <Text style={{ fontSize: FontSizes.sm, fontWeight: '700', color: C.peacockBlue }}>{totalRead}/700 ({totalPercent}%)</Text>
          </View>
          <View style={{ height: 6, backgroundColor: C.bgSecondary, borderRadius: 3, overflow: 'hidden' }}>
            <View style={{ height: '100%', width: totalPercent + '%', backgroundColor: C.peacockBlue, borderRadius: 3 }} />
          </View>
        </View>

        {/* Search */}
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: C.bgCard, borderRadius: 16, paddingHorizontal: 16, marginBottom: 12, borderWidth: 1.5, borderColor: isSearchFocused ? C.primary : C.border, ...C.shadowLight }}>
          <MaterialCommunityIcons name="magnify" size={20} color={isSearchFocused ? C.primary : C.textMuted} />
          <TextInput
            style={{ flex: 1, fontSize: FontSizes.md, color: C.textPrimary, paddingVertical: 14, paddingHorizontal: 12, outlineStyle: 'none', outlineWidth: 0 }}
            placeholder="Search verses, shlokas, topics..."
            placeholderTextColor={C.textMuted}
            value={searchQuery} onChangeText={setSearchQuery}
            onFocus={() => setIsSearchFocused(true)} onBlur={() => setIsSearchFocused(false)}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}><MaterialCommunityIcons name="close-circle" size={18} color={C.textMuted} /></TouchableOpacity>
          )}
        </View>

        {!isSearching && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            {QUICK_TAGS.map((t) => (
              <TouchableOpacity key={t.label} style={{ paddingHorizontal: 14, paddingVertical: 7, backgroundColor: C.primarySoft, borderRadius: 999, borderWidth: 1, borderColor: C.borderGold }}
                onPress={() => setSearchQuery(t.query)} activeOpacity={0.7}>
                <Text style={{ fontSize: FontSizes.sm, fontWeight: '600', color: C.primary }}>{t.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {isSearching ? (
          <View style={{ marginBottom: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <MaterialCommunityIcons name="magnify" size={16} color={C.primary} />
              <Text style={{ fontSize: FontSizes.sm, fontWeight: '600', color: C.textMuted }}>{searchResults.length} results for "{searchQuery.trim()}"</Text>
            </View>
            {searchResults.length > 0 ? searchResults.map((v) => (
              <TouchableOpacity key={v.id} onPress={() => openVerse(v)}
                style={{ backgroundColor: C.bgCard, borderRadius: 16, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: C.border, ...C.shadowLight }} activeOpacity={0.7}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <View style={{ paddingHorizontal: 10, paddingVertical: 4, backgroundColor: C.primarySoft, borderRadius: 999, borderWidth: 1, borderColor: C.borderGold }}>
                    <Text style={{ fontSize: FontSizes.xs, fontWeight: '800', color: C.primary }}>{v.chapter}.{v.verse}</Text>
                  </View>
                  {isVerseRead(v.chapter, v.verse) && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                      <MaterialCommunityIcons name="check-circle" size={12} color={C.success} />
                      <Text style={{ fontSize: 10, color: C.success }}>Read</Text>
                    </View>
                  )}
                </View>
                <Text style={{ fontSize: FontSizes.md, color: C.textSanskrit, lineHeight: 24, marginBottom: 6 }} numberOfLines={2}>{v.sanskrit}</Text>
                <Text style={{ fontSize: FontSizes.sm, color: C.textMuted, lineHeight: 20 }} numberOfLines={2}>{v.english}</Text>
              </TouchableOpacity>
            )) : (
              <View style={{ backgroundColor: C.bgCard, borderRadius: 16, padding: 32, alignItems: 'center', gap: 12, borderWidth: 1, borderColor: C.border }}>
                <MaterialCommunityIcons name="text-search" size={32} color={C.textMuted} />
                <Text style={{ fontSize: FontSizes.md, fontWeight: '600', color: C.textPrimary }}>No verses found</Text>
                <Text style={{ fontSize: FontSizes.sm, color: C.textMuted, textAlign: 'center' }}>Try "karma", "peace", "soul" or verse number like "2.47"</Text>
              </View>
            )}
          </View>
        ) : (
          <>
            {chapters.map((ch) => {
              const verses = getChapterVerses(ch.number);
              const isOpen = selectedChapter === ch.number;
              const progress = getChapterProgress(ch.number, ch.verses);

              return (
                <View key={ch.number}>
                  <TouchableOpacity
                    style={[{ backgroundColor: C.bgCard, borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 8, borderWidth: 1, borderColor: C.border, gap: 12, ...C.shadowLight },
                      isOpen && { borderColor: C.primary, borderBottomLeftRadius: 0, borderBottomRightRadius: 0, marginBottom: 0 }]}
                    onPress={() => setSelectedChapter(isOpen ? null : ch.number)} activeOpacity={0.7}>
                    <View style={[{ width: 44, height: 44, borderRadius: 22, backgroundColor: C.primarySoft, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: C.borderGold },
                      isOpen && { backgroundColor: C.primary }]}>
                      <Text style={[{ fontSize: FontSizes.md, fontWeight: '700', color: C.primary }, isOpen && { color: C.textOnPrimary }]}>{ch.number}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: FontSizes.md, fontWeight: '600', color: C.textPrimary }}>{ch.name}</Text>
                      <Text style={{ fontSize: FontSizes.sm, color: C.textSecondary }}>{ch.nameHindi}</Text>
                      {/* Chapter progress bar */}
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 }}>
                        <View style={{ flex: 1, height: 3, backgroundColor: C.bgSecondary, borderRadius: 2, overflow: 'hidden' }}>
                          <View style={{ height: '100%', width: progress.percent + '%', backgroundColor: progress.percent === 100 ? C.success : C.peacockBlue, borderRadius: 2 }} />
                        </View>
                        <Text style={{ fontSize: 10, color: C.textMuted, fontWeight: '600', minWidth: 32 }}>{progress.read}/{progress.total}</Text>
                      </View>
                    </View>
                    <MaterialCommunityIcons name={isOpen ? 'chevron-down' : 'chevron-right'} size={20} color={isOpen ? C.primary : C.textMuted} />
                  </TouchableOpacity>

                  {isOpen && (
                    <View style={{ backgroundColor: C.bgSecondary, borderBottomLeftRadius: 16, borderBottomRightRadius: 16, padding: 8, marginBottom: 8, borderWidth: 1, borderTopWidth: 0, borderColor: C.primary, maxHeight: 400 }}>
                      <ScrollView nestedScrollEnabled>
                        {verses.length > 0 ? verses.map((v) => {
                          const read = isVerseRead(v.chapter, v.verse);
                          return (
                            <TouchableOpacity key={v.id} onPress={() => openVerse(v)}
                              style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: C.bgCard, borderRadius: 12, padding: 12, marginBottom: 6, borderWidth: 1, borderColor: read ? C.success + '30' : C.borderLight }}>
                              <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: read ? C.success + '15' : C.primarySoft, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: read ? C.success + '30' : C.borderGold }}>
                                  {read ? (
                                    <MaterialCommunityIcons name="check" size={14} color={C.success} />
                                  ) : (
                                    <Text style={{ fontSize: FontSizes.xs, fontWeight: '700', color: C.primary }}>{v.verse}</Text>
                                  )}
                                </View>
                                <View style={{ flex: 1 }}>
                                  <Text style={{ fontSize: FontSizes.sm, color: C.textSanskrit, lineHeight: 20 }} numberOfLines={2}>{v.sanskrit}</Text>
                                  <Text style={{ fontSize: FontSizes.xs, color: C.textMuted, marginTop: 2 }} numberOfLines={1}>{v.english}</Text>
                                </View>
                              </View>
                              <MaterialCommunityIcons name="chevron-right" size={16} color={C.textMuted} />
                            </TouchableOpacity>
                          );
                        }) : (
                          <View style={{ padding: 24, alignItems: 'center', gap: 8 }}>
                            <MaterialCommunityIcons name="download-outline" size={24} color={C.textMuted} />
                            <Text style={{ fontSize: FontSizes.md, color: C.textMuted, fontWeight: '500' }}>Run fetchVerses.js to load</Text>
                          </View>
                        )}
                      </ScrollView>
                    </View>
                  )}
                </View>
              );
            })}
          </>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>

      <Modal visible={selectedVerse !== null} animationType="slide" transparent onRequestClose={() => setSelectedVerse(null)}>
        <View style={{ flex: 1, backgroundColor: C.bgOverlay, justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: C.bgPrimary, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '85%' }}>
            <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: C.border, alignSelf: 'center', marginBottom: 12 }} />
            <TouchableOpacity style={{ alignSelf: 'flex-end', padding: 8, marginBottom: 8 }} onPress={() => setSelectedVerse(null)}>
              <MaterialCommunityIcons name="close" size={20} color={C.textMuted} />
            </TouchableOpacity>
            {selectedVerse && <ScrollView showsVerticalScrollIndicator={false}><ShlokaCard verse={selectedVerse} /></ScrollView>}
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}