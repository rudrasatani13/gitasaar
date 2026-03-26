import { RefreshControl } from "react-native";
// src/screens/JournalScreen.js
import React, { useState, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  KeyboardAvoidingView, Platform, Alert, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import GlassCard from '../components/GlassCard';
import { usePremium } from '../theme/PremiumContext';
import { sanitizeInput } from '../utils/security';
import { useTheme } from '../theme/ThemeContext';
import { useJournal } from '../theme/JournalContext';
import { useTranslation } from '../theme/useTranslation';
import { FontSizes } from '../theme/colors';
import { ShivaJournalBackground } from "../components/SpiritualBackground";
import { reflectionPrompts } from '../data/sampleVerses';

const MOODS = [
  { id: 'grateful', icon: 'hands-pray', label: 'Grateful', color: '#2E7D50' },
  { id: 'peaceful', icon: 'meditation', label: 'Peaceful', color: '#14918E' },
  { id: 'hopeful', icon: 'white-balance-sunny', label: 'Hopeful', color: '#D4962A' },
  { id: 'confused', icon: 'head-question-outline', label: 'Confused', color: '#C28840' },
  { id: 'anxious', icon: 'head-heart-outline', label: 'Anxious', color: '#C95A6A' },
  { id: 'sad', icon: 'emoticon-sad-outline', label: 'Sad', color: '#7B1830' },
];

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
function formatTime(iso) {
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}
function getWordCount(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export default function JournalScreen() {
  const { colors: C } = useTheme();
  const { isPremium, canExportJournal } = usePremium();
  const { entries, addEntry, updateEntry, deleteEntry, entryCount } = useJournal();
  const { tr } = useTranslation();

  const [isWriting, setIsWriting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [text, setText] = useState('');
  const [selectedMood, setSelectedMood] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMood, setFilterMood] = useState(null);

  const todayPrompt = reflectionPrompts[new Date().getDay() % reflectionPrompts.length];
  const getMoodData = (id) => MOODS.find((m) => m.id === id);

  // Total words written
  const totalWords = entries.reduce((acc, e) => acc + getWordCount(e.text), 0);

  // Filtered entries
  const filtered = entries.filter((e) => {
    if (filterMood && e.mood !== filterMood) return false;
    if (searchQuery.trim().length >= 2 && !e.text.toLowerCase().includes(searchQuery.trim().toLowerCase())) return false;
    return true;
  });

  const startNew = () => {
    setEditingId(null);
    setText('');
    setSelectedMood(null);
    setIsWriting(true);
  };

  const startEdit = (entry) => {
    setEditingId(entry.id);
    setText(entry.text);
    setSelectedMood(entry.mood);
    setIsWriting(true);
  };

  const handleSave = () => {
    if (!text.trim()) return;
    if (editingId) {
      updateEntry(editingId, text.trim(), selectedMood);
    } else {
      addEntry(text.trim(), selectedMood);
    }
    setText('');
    setSelectedMood(null);
    setEditingId(null);
    setIsWriting(false);
  };

  const handleCancel = () => {
    setText('');
    setSelectedMood(null);
    setEditingId(null);
    setIsWriting(false);
  };

  const handleDelete = (id) => {
    Alert.alert(
      'Delete Entry',
      'Kya aap ye entry delete karna chahte hain?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteEntry(id) },
      ]
    );
  };

  return (
    <LinearGradient colors={C.gradientWarm} style={{ flex: 1 }}>
      <ShivaJournalBackground />
      {/* Header */}
      <View style={{ paddingTop: 56, paddingBottom: 12, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: C.glassBorder }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View>
            <Text style={{ fontSize: FontSizes.xxl, fontWeight: '700', color: C.textPrimary }}>Journal</Text>
            <Text style={{ fontSize: FontSizes.sm, color: C.primary }}>{'आत्म चिंतन'}</Text>
          </View>
          {!isWriting && (
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity onPress={() => {
                if (!isPremium) { Alert.alert('Premium Feature', 'Export as PDF is a Premium feature. Upgrade to unlock!'); return; }
                Alert.alert('Coming Soon', 'PDF export coming soon!');
              }}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: C.glassBg, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 999, borderWidth: 1, borderColor: C.glassBorder }}>
                <MaterialCommunityIcons name="file-export-outline" size={14} color={C.primary} />
                <Text style={{ fontSize: FontSizes.xs, fontWeight: '600', color: C.primary }}>PDF</Text>
                {!isPremium && <MaterialCommunityIcons name="lock" size={10} color={C.primary} />}
              </TouchableOpacity>
              <TouchableOpacity onPress={startNew}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999 }}>
                <MaterialCommunityIcons name="pencil-plus-outline" size={16} color={C.textOnPrimary} />
                <Text style={{ fontSize: FontSizes.sm, fontWeight: '700', color: C.textOnPrimary }}>New</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" >

          {/* Stats Row */}
          {!isWriting && (
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
              <GlassCard noPadding style={{ flex: 1, borderRadius: 14, paddingVertical: 14, alignItems: 'center', gap: 2 }} intensity={35}>
                <MaterialCommunityIcons name="notebook-outline" size={18} color={C.primary} />
                <Text style={{ fontSize: FontSizes.xl, fontWeight: '800', color: C.textPrimary }}>{entryCount}</Text>
                <Text style={{ fontSize: 10, color: C.textMuted }}>Entries</Text>
              </GlassCard>
              <GlassCard noPadding style={{ flex: 1, borderRadius: 14, paddingVertical: 14, alignItems: 'center', gap: 2 }} intensity={35}>
                <MaterialCommunityIcons name="text-box-outline" size={18} color={C.peacockBlue} />
                <Text style={{ fontSize: FontSizes.xl, fontWeight: '800', color: C.textPrimary }}>{totalWords}</Text>
                <Text style={{ fontSize: 10, color: C.textMuted }}>Words</Text>
              </GlassCard>
              <GlassCard noPadding style={{ flex: 1, borderRadius: 14, paddingVertical: 14, alignItems: 'center', gap: 2 }} intensity={35}>
                <MaterialCommunityIcons name="emoticon-outline" size={18} color={C.saffron} />
                <Text style={{ fontSize: FontSizes.xl, fontWeight: '800', color: C.textPrimary }}>{MOODS.length}</Text>
                <Text style={{ fontSize: 10, color: C.textMuted }}>Moods</Text>
              </GlassCard>
            </View>
          )}

          {/* Writing Mode */}
          {isWriting && (
            <GlassCard noPadding style={{ borderRadius: 20, padding: 20, marginBottom: 20 }} intensity={45}>
              <Text style={{ fontSize: FontSizes.md, fontWeight: '700', color: C.textPrimary, marginBottom: 12 }}>
                {editingId ? 'Edit Entry' : 'New Entry'}
              </Text>

              {/* Prompt */}
              {!editingId && (
                <View style={{ backgroundColor: C.glassBg, borderRadius: 12, padding: 14, marginBottom: 16, borderLeftWidth: 3, borderLeftColor: C.peacockBlue, borderWidth: 1, borderColor: C.glassBorder }}>
                  <Text style={{ fontSize: FontSizes.xs, fontWeight: '700', color: C.peacockBlue, letterSpacing: 1, marginBottom: 4 }}>REFLECTION PROMPT</Text>
                  <Text style={{ fontSize: FontSizes.md, color: C.textPrimary, lineHeight: 22 }}>{todayPrompt}</Text>
                </View>
              )}

              {/* Mood */}
              <Text style={{ fontSize: FontSizes.xs, fontWeight: '700', color: C.primary, letterSpacing: 1, marginBottom: 10 }}>HOW ARE YOU FEELING?</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                {MOODS.map((m) => (
                  <TouchableOpacity key={m.id} onPress={() => setSelectedMood(selectedMood === m.id ? null : m.id)}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999,
                      backgroundColor: selectedMood === m.id ? m.color + '18' : C.glassBg,
                      borderWidth: 1.5, borderColor: selectedMood === m.id ? m.color + '50' : C.glassBorder,
                    }} activeOpacity={0.7}>
                    <MaterialCommunityIcons name={m.icon} size={16} color={selectedMood === m.id ? m.color : C.textMuted} />
                    <Text style={{ fontSize: FontSizes.sm, fontWeight: '600', color: selectedMood === m.id ? m.color : C.textMuted }}>{m.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Text Input */}
              <TextInput
                style={{ fontSize: FontSizes.md, color: C.textPrimary, lineHeight: 24,
                  backgroundColor: C.glassInputBg, borderRadius: 16, padding: 16,
                  borderWidth: 1, borderColor: C.glassBorder, minHeight: 160, textAlignVertical: 'top',
                }}
                placeholder="Apne thoughts, feelings, gratitude likh do..."
                placeholderTextColor={C.textMuted}
                value={text} onChangeText={setText} multiline autoFocus
              />

              <Text style={{ fontSize: FontSizes.xs, color: C.textMuted, marginTop: 6, textAlign: 'right' }}>{getWordCount(text)} words</Text>

              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
                <TouchableOpacity onPress={handleCancel}
                  style={{ paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, backgroundColor: C.glassBg, borderWidth: 1, borderColor: C.glassBorder }}>
                  <Text style={{ fontSize: FontSizes.sm, fontWeight: '600', color: C.textMuted }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSave} disabled={!text.trim()}
                  style={{ paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, backgroundColor: text.trim() ? C.primary : C.glassBorder }}>
                  <Text style={{ fontSize: FontSizes.sm, fontWeight: '700', color: text.trim() ? C.textOnPrimary : C.textMuted }}>
                    {editingId ? 'Update' : 'Save Entry'}
                  </Text>
                </TouchableOpacity>
              </View>
            </GlassCard>
          )}

          {/* Search + Filter */}
          {!isWriting && entries.length > 0 && (
            <>
              {/* Search */}
              <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: C.glassInputBg, borderRadius: 14, paddingHorizontal: 14, marginBottom: 10, borderWidth: 1, borderColor: C.glassBorder }}>
                <MaterialCommunityIcons name="magnify" size={18} color={C.textMuted} />
                <TextInput
                  style={{ flex: 1, fontSize: FontSizes.md, color: C.textPrimary, paddingVertical: 12, paddingHorizontal: 10 }}
                  placeholder="Search entries..." placeholderTextColor={C.textMuted}
                  value={searchQuery} onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <MaterialCommunityIcons name="close-circle" size={16} color={C.textMuted} />
                  </TouchableOpacity>
                )}
              </View>

              {/* Mood Filter */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  <TouchableOpacity onPress={() => setFilterMood(null)}
                    style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: !filterMood ? C.glassBg : 'transparent', borderWidth: 1, borderColor: !filterMood ? C.glassBorderGold : C.glassBorder }}>
                    <Text style={{ fontSize: FontSizes.xs, fontWeight: '600', color: !filterMood ? C.primary : C.textMuted }}>All</Text>
                  </TouchableOpacity>
                  {MOODS.map((m) => (
                    <TouchableOpacity key={m.id} onPress={() => setFilterMood(filterMood === m.id ? null : m.id)}
                      style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: filterMood === m.id ? m.color + '18' : 'transparent', borderWidth: 1, borderColor: filterMood === m.id ? m.color + '40' : C.glassBorder }}>
                      <MaterialCommunityIcons name={m.icon} size={12} color={filterMood === m.id ? m.color : C.textMuted} />
                      <Text style={{ fontSize: FontSizes.xs, fontWeight: '600', color: filterMood === m.id ? m.color : C.textMuted }}>{m.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </>
          )}

          {/* Empty State */}
          {entries.length === 0 && !isWriting && (
            <View style={{ alignItems: 'center', paddingVertical: 50 }}>
              <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: C.primarySoft, justifyContent: 'center', alignItems: 'center', marginBottom: 20, borderWidth: 1.5, borderColor: C.borderGold }}>
                <MaterialCommunityIcons name="notebook-outline" size={36} color={C.primary} />
              </View>
              <Text style={{ fontSize: FontSizes.xl, fontWeight: '700', color: C.textPrimary, marginBottom: 8 }}>Your spiritual journal</Text>
              <Text style={{ fontSize: FontSizes.md, color: C.textMuted, textAlign: 'center', lineHeight: 22, paddingHorizontal: 20 }}>
                Apne daily reflections, thoughts, aur spiritual experiences yahan likh ke rakhein.
              </Text>
              <TouchableOpacity onPress={startNew}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 24, backgroundColor: C.primary, borderRadius: 12, paddingHorizontal: 20, paddingVertical: 14 }} activeOpacity={0.8}>
                <MaterialCommunityIcons name="pencil-outline" size={18} color={C.textOnPrimary} />
                <Text style={{ fontSize: FontSizes.md, fontWeight: '700', color: C.textOnPrimary }}>Start Writing</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Entries List */}
          {!isWriting && filtered.length > 0 && (
            <>
              <Text style={{ fontSize: FontSizes.xs, fontWeight: '700', color: C.primary, letterSpacing: 1.5, marginBottom: 12 }}>
                {filterMood || searchQuery ? filtered.length + ' RESULTS' : 'YOUR ENTRIES'}
              </Text>
              {filtered.map((entry) => {
                const mood = getMoodData(entry.mood);
                return (
                  <GlassCard key={entry.id} noPadding style={{ borderRadius: 16, padding: 18, marginBottom: 12 }} intensity={40}>
                    {/* Header */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                        <Text style={{ fontSize: FontSizes.xs, color: C.textMuted, fontWeight: '500' }}>
                          {formatDate(entry.date)} at {formatTime(entry.date)}
                        </Text>
                        {mood && (
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: mood.color + '12', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 }}>
                            <MaterialCommunityIcons name={mood.icon} size={12} color={mood.color} />
                            <Text style={{ fontSize: 10, fontWeight: '600', color: mood.color }}>{mood.label}</Text>
                          </View>
                        )}
                      </View>
                      <View style={{ flexDirection: 'row', gap: 8 }}>
                        <TouchableOpacity onPress={() => startEdit(entry)} style={{ padding: 4 }}>
                          <MaterialCommunityIcons name="pencil-outline" size={16} color={C.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDelete(entry.id)} style={{ padding: 4 }}>
                          <MaterialCommunityIcons name="trash-can-outline" size={16} color={C.vermillion} />
                        </TouchableOpacity>
                      </View>
                    </View>
                    <Text style={{ fontSize: FontSizes.md, color: C.textPrimary, lineHeight: 24 }}>{entry.text}</Text>
                    <Text style={{ fontSize: 10, color: C.textMuted, marginTop: 8 }}>{getWordCount(entry.text)} words</Text>
                  </GlassCard>
                );
              })}
            </>
          )}

          {/* No results */}
          {!isWriting && entries.length > 0 && filtered.length === 0 && (
            <View style={{ alignItems: 'center', paddingVertical: 40 }}>
              <MaterialCommunityIcons name="text-search" size={32} color={C.textMuted} />
              <Text style={{ fontSize: FontSizes.md, color: C.textMuted, marginTop: 8 }}>No matching entries found</Text>
            </View>
          )}

          <View style={{ height: 120 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}