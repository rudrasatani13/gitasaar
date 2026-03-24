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
  { number: 7, name: 'Jnana Vijnana Yoga', nameHindi: 'ज्ञान विज्ञान योग', verses: 30, theme: 'Knowledge of the Ultimate Truth' },
  { number: 8, name: 'Akshara Brahma Yoga', nameHindi: 'अक्षर ब्रह्म योग', verses: 28, theme: 'Attaining the Supreme' },
  { number: 9, name: 'Raja Vidya Raja Guhya Yoga', nameHindi: 'राज विद्या राज गुह्य योग', verses: 34, theme: 'The King of Knowledge' },
  { number: 10, name: 'Vibhuti Yoga', nameHindi: 'विभूति योग', verses: 42, theme: 'Divine Glories' },
  { number: 11, name: 'Vishwaroopa Darshana Yoga', nameHindi: 'विश्वरूप दर्शन योग', verses: 55, theme: 'Vision of the Universal Form' },
  { number: 12, name: 'Bhakti Yoga', nameHindi: 'भक्ति योग', verses: 20, theme: 'Path of Devotion' },
  { number: 13, name: 'Kshetra Kshetrajna Vibhaga Yoga', nameHindi: 'क्षेत्र क्षेत्रज्ञ विभाग योग', verses: 35, theme: 'Nature, the Enjoyer, and Consciousness' },
  { number: 14, name: 'Gunatraya Vibhaga Yoga', nameHindi: 'गुणत्रय विभाग योग', verses: 27, theme: 'The Three Modes of Material Nature' },
  { number: 15, name: 'Purushottama Yoga', nameHindi: 'पुरुषोत्तम योग', verses: 20, theme: 'The Supreme Divine Personality' },
  { number: 16, name: 'Daivasura Sampad Vibhaga Yoga', nameHindi: 'दैवासुर सम्पद् विभाग योग', verses: 24, theme: 'Divine and Demoniac Natures' },
  { number: 17, name: 'Shraddhatraya Vibhaga Yoga', nameHindi: 'श्रद्धात्रय विभाग योग', verses: 28, theme: 'The Three Divisions of Faith' },
  { number: 18, name: 'Moksha Sanyasa Yoga', nameHindi: 'मोक्ष संन्यास योग', verses: 78, theme: 'Final Revelations of Ultimate Truth' },
];

const SEARCH_SUGGESTIONS = [
  { label: 'Karma Yoga', query: 'karma', icon: 'hand-heart' },
  { label: 'Bhakti', query: 'bhakti', icon: 'heart' },
  { label: 'Meditation', query: 'meditation', icon: 'meditation' },
  { label: 'Knowledge', query: 'knowledge', icon: 'book-open-variant' },
  { label: 'Devotion', query: 'devotion', icon: 'flower' },
  { label: 'Renunciation', query: 'renunciation', icon: 'leaf' },
];

export default function VerseLibraryScreen({ navigation }) {
  const { colors: C } = useTheme();
  const { progress } = useTracker();
  const [expandedChapter, setExpandedChapter] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVerse, setSelectedVerse] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const filteredChapters = useMemo(() => {
    if (!searchQuery.trim()) return CHAPTERS;
    const query = searchQuery.toLowerCase();
    return CHAPTERS.filter(ch =>
      ch.name.toLowerCase().includes(query) ||
      ch.nameHindi.includes(query) ||
      ch.theme.toLowerCase().includes(query) ||
      ch.number.toString() === query
    );
  }, [searchQuery]);

  // Calculate overall progress
  const overallProgress = useMemo(() => {
    const totalVerses = CHAPTERS.reduce((sum, ch) => sum + ch.verses, 0);
    let completedVerses = 0;
    CHAPTERS.forEach(ch => {
      completedVerses += (progress?.[ch.number]?.length || 0);
    });
    return { completed: completedVerses, total: totalVerses, percentage: Math.round((completedVerses / totalVerses) * 100) };
  }, [progress]);

  const handleVerseClick = (chNum, vNum) => {
    if (gitaData && gitaData[chNum] && gitaData[chNum][vNum]) {
      const verseData = gitaData[chNum][vNum];
      setSelectedVerse({
        chapter: chNum,
        verse: vNum,
        verseNumber: parseInt(vNum),
        ...verseData
      });
    }
  };

  return (
    <LinearGradient colors={C.gradientWarm} style={{ flex: 1 }}>
      <KrishnaVersesBackground />
      
      {/* Header */}
      <View style={{ paddingTop: 50, paddingBottom: 15, paddingHorizontal: 20, backgroundColor: C.bgCard, borderBottomWidth: 1, borderBottomColor: C.borderLight, ...C.shadowLight, zIndex: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: C.bgSecondary, justifyContent: 'center', alignItems: 'center' }}>
              <MaterialCommunityIcons name="arrow-left" size={24} color={C.textPrimary} />
            </TouchableOpacity>
            <View>
              <Text style={{ fontSize: FontSizes.xl, fontWeight: '800', color: C.textPrimary, letterSpacing: 0.5 }}>Bhagavad Gita</Text>
              <Text style={{ fontSize: FontSizes.xs, color: C.textMuted, fontWeight: '600' }}>All 700 Verses</Text>
            </View>
          </View>
          <View style={{ width: 45, height: 45, borderRadius: 22.5, backgroundColor: C.primarySoft, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: C.borderGold }}>
            <MaterialCommunityIcons name="book-open-page-variant" size={22} color={C.primary} />
          </View>
        </View>

        {/* Overall Progress Bar */}
        <View style={{ backgroundColor: C.bgSecondary, borderRadius: 12, padding: 12, marginBottom: 15, borderWidth: 1, borderColor: C.borderLight }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <Text style={{ fontSize: FontSizes.sm, fontWeight: '700', color: C.textPrimary }}>Overall Progress</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={{ fontSize: FontSizes.lg, fontWeight: '800', color: C.primary }}>{overallProgress.percentage}%</Text>
              <Text style={{ fontSize: FontSizes.xs, color: C.textMuted, fontWeight: '600' }}>({overallProgress.completed}/{overallProgress.total})</Text>
            </View>
          </View>
          <View style={{ height: 8, backgroundColor: C.bgPrimary, borderRadius: 4, overflow: 'hidden' }}>
            <View style={{ width: `${overallProgress.percentage}%`, height: '100%', backgroundColor: C.primary, borderRadius: 4 }} />
          </View>
        </View>

        {/* Search Bar */}
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: C.bgInput, borderRadius: 16, paddingHorizontal: 16, height: 50, borderWidth: 1, borderColor: C.border }}>
          <MaterialCommunityIcons name="magnify" size={22} color={C.textMuted} />
          <TextInput
            style={{ flex: 1, marginLeft: 10, fontSize: FontSizes.md, color: C.textPrimary, height: '100%', outlineStyle: 'none' }}
            placeholder="Search chapters or themes..."
            placeholderTextColor={C.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialCommunityIcons name="close-circle" size={20} color={C.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Search Suggestions - Show on Focus */}
        {showSuggestions && searchQuery.length === 0 && (
          <View style={{ marginTop: 12, backgroundColor: C.bgCard, borderRadius: 12, padding: 8, borderWidth: 1, borderColor: C.borderLight }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingBottom: 8 }}>
              <Text style={{ fontSize: FontSizes.xs, color: C.textMuted, fontWeight: '600' }}>Popular Searches</Text>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {SEARCH_SUGGESTIONS.map((suggestion) => (
                <TouchableOpacity
                  key={suggestion.query}
                  onPress={() => setSearchQuery(suggestion.query)}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: C.bgSecondary, borderRadius: 20, borderWidth: 1, borderColor: C.border }}
                >
                  <MaterialCommunityIcons name={suggestion.icon} size={14} color={C.primary} />
                  <Text style={{ fontSize: FontSizes.xs, color: C.textPrimary, fontWeight: '600' }}>{suggestion.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>

      {/* Chapters List */}
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.primary} />}
      >
        {filteredChapters.map((ch) => {
          const isExpanded = expandedChapter === ch.number;
          const completedCount = progress?.[ch.number]?.length || 0;
          const progressPct = (completedCount / ch.verses) * 100;
          
          return (
            <View key={ch.number} style={{ marginBottom: 12, backgroundColor: C.bgCard, borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: isExpanded ? C.primary : C.borderLight, ...C.shadowLight }}>
              <TouchableOpacity 
                onPress={() => setExpandedChapter(isExpanded ? null : ch.number)}
                style={{ padding: 16, flexDirection: 'row', alignItems: 'center' }}
                activeOpacity={0.7}
              >
                <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: isExpanded ? C.primary : C.bgSecondary, justifyContent: 'center', alignItems: 'center', marginRight: 16 }}>
                  <Text style={{ fontSize: FontSizes.lg, fontWeight: 'bold', color: isExpanded ? C.textOnPrimary : C.textPrimary }}>{ch.number}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: FontSizes.md, fontWeight: '700', color: C.textPrimary, marginBottom: 2 }}>{ch.name}</Text>
                  <Text style={{ fontSize: FontSizes.xs, color: C.textMuted, fontStyle: 'italic', marginBottom: 6 }}>{ch.theme}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <View style={{ flex: 1, height: 4, backgroundColor: C.bgSecondary, borderRadius: 2, overflow: 'hidden' }}>
                      <View style={{ width: `${progressPct}%`, height: '100%', backgroundColor: C.success }} />
                    </View>
                    <Text style={{ fontSize: 10, color: C.textMuted, fontWeight: '600' }}>{completedCount}/{ch.verses}</Text>
                  </View>
                </View>
                <MaterialCommunityIcons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={24} color={C.textMuted} />
              </TouchableOpacity>

              {isExpanded && (
                <View style={{ backgroundColor: C.bgPrimary, borderTopWidth: 1, borderTopColor: C.borderLight, padding: 8 }}>
                  {gitaData && gitaData[ch.number] ? (
                    Array.from({ length: ch.verses }, (_, i) => i + 1).map((num) => {
                      const vNum = num.toString();
                      const verseData = gitaData[ch.number][vNum];
                      if (!verseData) return null;

                      const isRead = progress?.[ch.number]?.includes(num);

                      return (
                        <TouchableOpacity
                          key={vNum}
                          onPress={() => handleVerseClick(ch.number, vNum)}
                          style={{
                            marginBottom: 8,
                            backgroundColor: C.bgCard,
                            borderRadius: 16,
                            padding: 14,
                            borderWidth: 1,
                            borderColor: isRead ? C.success + '30' : C.borderLight,
                            flexDirection: 'row',
                            gap: 12,
                            alignItems: 'flex-start',
                            ...C.shadowLight
                          }}
                          activeOpacity={0.7}
                        >
                          {/* Verse Number Badge */}
                          <View style={{
                            minWidth: 42,
                            height: 42,
                            borderRadius: 12,
                            backgroundColor: isRead ? C.success + '15' : C.primarySoft,
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderWidth: 1.5,
                            borderColor: isRead ? C.success : C.borderGold
                          }}>
                            <Text style={{ fontSize: FontSizes.md, fontWeight: '800', color: isRead ? C.success : C.primary }}>{vNum}</Text>
                          </View>

                          {/* Verse Content */}
                          <View style={{ flex: 1, gap: 6 }}>
                            {/* Sanskrit Text */}
                            <Text
                              style={{
                                fontSize: FontSizes.md,
                                color: C.textSanskrit,
                                lineHeight: 22,
                                fontWeight: '500'
                              }}
                              numberOfLines={2}
                            >
                              {verseData.sanskrit.replace(/\n/g, ' ')}
                            </Text>

                            {/* Translation Preview */}
                            <Text
                              style={{
                                fontSize: FontSizes.sm,
                                color: C.textMuted,
                                lineHeight: 20,
                                fontStyle: 'italic'
                              }}
                              numberOfLines={2}
                            >
                              {verseData.hindi || verseData.english}
                            </Text>
                          </View>

                          {/* Status Icon */}
                          <View style={{ alignSelf: 'center' }}>
                            {isRead ? (
                              <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: C.success + '20', justifyContent: 'center', alignItems: 'center' }}>
                                <MaterialCommunityIcons name="check" size={16} color={C.success} />
                              </View>
                            ) : (
                              <MaterialCommunityIcons name="chevron-right" size={20} color={C.textMuted} />
                            )}
                          </View>
                        </TouchableOpacity>
                      );
                    })
                  ) : (
                    <View style={{ padding: 20, alignItems: 'center' }}>
                      <Text style={{ color: C.textMuted }}>Shlokas loading error. Run fetchVerses.js</Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          );
        })}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Full Verse & Audio Modal */}
      <Modal visible={selectedVerse !== null} animationType="slide" transparent onRequestClose={() => setSelectedVerse(null)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: C.bgPrimary, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '85%' }}>
            <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: C.border, alignSelf: 'center', marginBottom: 12 }} />
            <TouchableOpacity style={{ alignSelf: 'flex-end', padding: 8, marginBottom: 4 }} onPress={() => setSelectedVerse(null)}>
              <MaterialCommunityIcons name="close-circle" size={28} color={C.textMuted} />
            </TouchableOpacity>
            
            {selectedVerse && (
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                {/* Yahan Audio Player apne aap aa jayega ShlokaCard ke andar se */}
                <ShlokaCard verse={selectedVerse} animate={false} />
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}