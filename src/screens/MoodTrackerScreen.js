// src/screens/MoodTrackerScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { FontSizes } from '../theme/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MOODS = [
  { id: 'great', emoji: '😊', label: 'Great', color: '#2E7D50' },
  { id: 'good', emoji: '🙂', label: 'Good', color: '#14918E' },
  { id: 'okay', emoji: '😐', label: 'Okay', color: '#C28840' },
  { id: 'low', emoji: '😔', label: 'Low', color: '#E8793A' },
  { id: 'stressed', emoji: '😰', label: 'Stressed', color: '#D63B2F' },
];

const MOOD_KEY = '@gitasaar_moods';

export default function MoodTrackerScreen({ navigation }) {
  const { colors: C } = useTheme();
  const [selectedMood, setSelectedMood] = useState(null);
  const [note, setNote] = useState('');
  const [todayLogged, setTodayLogged] = useState(false);
  const [history, setHistory] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadHistory(); }, []);

  const loadHistory = async () => {
    try {
      const data = await AsyncStorage.getItem(MOOD_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        setHistory(parsed);
        const today = new Date().toDateString();
        const todayEntry = parsed.find(e => e.date === today);
        if (todayEntry) {
          setTodayLogged(true);
          setSelectedMood(todayEntry.mood);
        }
      }
    } catch (e) {}
  };

  const saveMood = async () => {
    if (!selectedMood) return;
    setSaving(true);
    const entry = {
      date: new Date().toDateString(),
      dateISO: new Date().toISOString(),
      mood: selectedMood,
      note: note.trim(),
    };
    const updated = [entry, ...history.filter(e => e.date !== new Date().toDateString())].slice(0, 90); // Keep 90 days
    setHistory(updated);
    setTodayLogged(true);
    try { await AsyncStorage.setItem(MOOD_KEY, JSON.stringify(updated)); } catch (e) {}
    setSaving(false);
  };

  // Mood stats for last 7 days
  const last7 = history.slice(0, 7);
  const moodCounts = {};
  MOODS.forEach(m => moodCounts[m.id] = 0);
  last7.forEach(e => { if (moodCounts[e.mood] !== undefined) moodCounts[e.mood]++; });

  // Most common mood
  const topMood = MOODS.reduce((a, b) => moodCounts[a.id] >= moodCounts[b.id] ? a : b);

  return (
    <LinearGradient colors={C.gradientWarm} style={{ flex: 1 }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ paddingTop: 56, paddingHorizontal: 20, paddingBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: C.primarySoft, justifyContent: 'center', alignItems: 'center' }}>
              <MaterialCommunityIcons name="arrow-left" size={20} color={C.primary} />
            </TouchableOpacity>
            <View>
              <Text style={{ fontSize: FontSizes.lg, fontWeight: '700', color: C.textPrimary }}>Mood Tracker</Text>
              <Text style={{ fontSize: FontSizes.xs, color: C.textMuted }}>{history.length} entries logged</Text>
            </View>
          </View>
        </View>

        {/* Today's Mood */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <View style={{ backgroundColor: C.bgCard, borderRadius: 20, padding: 24, borderWidth: 1, borderColor: C.border, alignItems: 'center' }}>
            <Text style={{ fontSize: FontSizes.md, fontWeight: '700', color: C.textPrimary, marginBottom: 4 }}>
              {todayLogged ? "Today's Mood" : 'How are you feeling today?'}
            </Text>
            <Text style={{ fontSize: FontSizes.xs, color: C.textMuted, marginBottom: 18 }}>
              {new Date().toLocaleDateString('en', { weekday: 'long', day: 'numeric', month: 'long' })}
            </Text>

            {/* Mood options */}
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 18 }}>
              {MOODS.map((m) => (
                <TouchableOpacity key={m.id} onPress={() => { if (!todayLogged) setSelectedMood(m.id); }}
                  style={{
                    alignItems: 'center', padding: 10, borderRadius: 16, width: 58,
                    backgroundColor: selectedMood === m.id ? m.color + '15' : C.bgSecondary,
                    borderWidth: 2, borderColor: selectedMood === m.id ? m.color : 'transparent',
                    opacity: todayLogged && selectedMood !== m.id ? 0.3 : 1,
                  }}>
                  <Text style={{ fontSize: 28 }}>{m.emoji}</Text>
                  <Text style={{ fontSize: 9, fontWeight: '600', color: selectedMood === m.id ? m.color : C.textMuted, marginTop: 4 }}>{m.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Note */}
            {!todayLogged && selectedMood && (
              <TextInput
                style={{ width: '100%', backgroundColor: C.bgInput, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, fontSize: FontSizes.sm, color: C.textPrimary, borderWidth: 1, borderColor: C.border, marginBottom: 14, textAlignVertical: 'top', minHeight: 60, outlineStyle: 'none' }}
                placeholder="What's on your mind? (optional)"
                placeholderTextColor={C.textMuted}
                value={note} onChangeText={setNote}
                multiline numberOfLines={3}
              />
            )}

            {/* Save button */}
            {!todayLogged && selectedMood && (
              <TouchableOpacity onPress={saveMood} disabled={saving} activeOpacity={0.85} style={{ width: '100%' }}>
                <LinearGradient colors={C.gradientGold} style={{ borderRadius: 14, paddingVertical: 14, alignItems: 'center' }}>
                  <Text style={{ fontSize: FontSizes.md, fontWeight: '700', color: C.textOnPrimary }}>
                    {saving ? 'Saving...' : 'Log Mood'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            )}

            {todayLogged && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.primarySoft, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999 }}>
                <MaterialCommunityIcons name="check-circle" size={16} color={C.primary} />
                <Text style={{ fontSize: FontSizes.sm, fontWeight: '600', color: C.primary }}>Logged for today</Text>
              </View>
            )}
          </View>
        </View>

        {/* Weekly Overview */}
        {history.length > 0 && (
          <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
            <Text style={{ fontSize: FontSizes.xs, fontWeight: '700', color: C.primary, letterSpacing: 1.5, marginBottom: 12 }}>LAST 7 DAYS</Text>
            <View style={{ backgroundColor: C.bgCard, borderRadius: 20, padding: 16, borderWidth: 1, borderColor: C.border }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 14 }}>
                {last7.reverse().map((entry, i) => {
                  const mood = MOODS.find(m => m.id === entry.mood);
                  const dayLabel = new Date(entry.dateISO).toLocaleDateString('en', { weekday: 'short' });
                  return (
                    <View key={i} style={{ alignItems: 'center' }}>
                      <Text style={{ fontSize: 22 }}>{mood?.emoji || '❓'}</Text>
                      <Text style={{ fontSize: 9, color: C.textMuted, marginTop: 4 }}>{dayLabel}</Text>
                    </View>
                  );
                })}
              </View>
              {last7.length > 0 && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: C.borderLight }}>
                  <Text style={{ fontSize: 18 }}>{topMood.emoji}</Text>
                  <Text style={{ fontSize: FontSizes.sm, color: C.textSecondary }}>
                    Most common mood: <Text style={{ fontWeight: '700', color: topMood.color }}>{topMood.label}</Text>
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* History */}
        <View style={{ paddingHorizontal: 20, marginBottom: 30 }}>
          <Text style={{ fontSize: FontSizes.xs, fontWeight: '700', color: C.primary, letterSpacing: 1.5, marginBottom: 12 }}>MOOD HISTORY</Text>
          {history.length === 0 ? (
            <View style={{ backgroundColor: C.bgCard, borderRadius: 16, padding: 32, alignItems: 'center', borderWidth: 1, borderColor: C.border }}>
              <Text style={{ fontSize: 32, marginBottom: 8 }}>🧘</Text>
              <Text style={{ fontSize: FontSizes.md, fontWeight: '600', color: C.textPrimary }}>No entries yet</Text>
              <Text style={{ fontSize: FontSizes.sm, color: C.textMuted, marginTop: 4 }}>Log your first mood above</Text>
            </View>
          ) : (
            history.slice(0, 30).map((entry, i) => {
              const mood = MOODS.find(m => m.id === entry.mood);
              const dateStr = new Date(entry.dateISO).toLocaleDateString('en', { day: 'numeric', month: 'short', weekday: 'short' });
              return (
                <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.bgCard, borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: C.border }}>
                  <Text style={{ fontSize: 24 }}>{mood?.emoji || '❓'}</Text>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={{ fontSize: FontSizes.sm, fontWeight: '600', color: mood?.color || C.textPrimary }}>{mood?.label || 'Unknown'}</Text>
                      <Text style={{ fontSize: FontSizes.xs, color: C.textMuted }}>{dateStr}</Text>
                    </View>
                    {entry.note ? <Text style={{ fontSize: FontSizes.xs, color: C.textMuted, marginTop: 3 }} numberOfLines={2}>{entry.note}</Text> : null}
                  </View>
                </View>
              );
            })
          )}
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </LinearGradient>
  );
}