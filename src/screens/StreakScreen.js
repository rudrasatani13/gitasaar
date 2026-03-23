// src/screens/StreakScreen.js
import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useTracker } from '../theme/TrackerContext';
import { FontSizes } from '../theme/colors';

const { width } = Dimensions.get('window');
const CELL = Math.floor((width - 60) / 7);

const BADGES = [
  { id: 'first_verse', title: 'First Step', desc: 'Read your first verse', icon: 'shoe-print', color: '#C28840', need: 1, type: 'verses' },
  { id: 'ten_verses', title: 'Curious Mind', desc: 'Read 10 verses', icon: 'lightbulb-on-outline', color: '#14918E', need: 10, type: 'verses' },
  { id: 'fifty_verses', title: 'Knowledge Seeker', desc: 'Read 50 verses', icon: 'book-open-variant', color: '#E8793A', need: 50, type: 'verses' },
  { id: 'hundred_verses', title: 'Devoted Reader', desc: 'Read 100 verses', icon: 'star-four-points', color: '#7B1830', need: 100, type: 'verses' },
  { id: 'all_verses', title: 'Gita Master', desc: 'Read all 700 verses', icon: 'crown', color: '#DBA04E', need: 700, type: 'verses' },
  { id: 'streak_3', title: 'Getting Started', desc: '3 day streak', icon: 'fire', color: '#E8793A', need: 3, type: 'streak' },
  { id: 'streak_7', title: 'One Week Strong', desc: '7 day streak', icon: 'fire', color: '#D4573B', need: 7, type: 'streak' },
  { id: 'streak_30', title: 'Monthly Devotion', desc: '30 day streak', icon: 'fire', color: '#C62828', need: 30, type: 'streak' },
  { id: 'streak_100', title: 'Unstoppable', desc: '100 day streak', icon: 'lightning-bolt', color: '#DBA04E', need: 100, type: 'streak' },
  { id: 'chapter_1', title: 'Chapter Complete', desc: 'Finish any chapter', icon: 'check-decagram', color: '#2E7D50', need: 1, type: 'chapters' },
  { id: 'all_chapters', title: 'All 18 Chapters', desc: 'Complete every chapter', icon: 'trophy', color: '#DBA04E', need: 18, type: 'chapters' },
];

function getMonthDays(year, month) {
  const days = [];
  const firstDay = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  // Pad beginning
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= totalDays; d++) days.push(d);
  return days;
}

export default function StreakScreen({ navigation }) {
  const { colors: C } = useTheme();
  const { streak: streakObj, totalRead, totalPercent, getChapterProgress, readDates } = useTracker();
  const streak = streakObj?.count || 0;
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [calYear, setCalYear] = useState(new Date().getFullYear());

  const days = useMemo(() => getMonthDays(calYear, calMonth), [calYear, calMonth]);
  const monthName = new Date(calYear, calMonth).toLocaleDateString('en', { month: 'long', year: 'numeric' });

  // Count completed chapters
  const completedChapters = useMemo(() => {
    const chapterVerses = [0,47,72,43,42,29,47,30,28,34,42,55,20,35,27,20,24,28,78];
    let count = 0;
    for (let i = 1; i <= 18; i++) {
      const p = getChapterProgress(i, chapterVerses[i] || 20);
      if (p.percent === 100) count++;
    }
    return count;
  }, [totalRead]);

  // Check badge earned
  const isBadgeEarned = (badge) => {
    if (badge.type === 'verses') return totalRead >= badge.need;
    if (badge.type === 'streak') return streak >= badge.need;
    if (badge.type === 'chapters') return completedChapters >= badge.need;
    return false;
  };

  const earnedCount = BADGES.filter(b => isBadgeEarned(b)).length;

  // Check if date has reading activity
  const isActiveDay = (day) => {
    if (!day || !readDates) return false;
    const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return readDates.includes(dateStr);
  };

  const isToday = (day) => {
    const t = new Date();
    return day === t.getDate() && calMonth === t.getMonth() && calYear === t.getFullYear();
  };

  const prevMonth = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); }
    else setCalMonth(calMonth - 1);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); }
    else setCalMonth(calMonth + 1);
  };

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
              <Text style={{ fontSize: FontSizes.lg, fontWeight: '700', color: C.textPrimary }}>Your Journey</Text>
              <Text style={{ fontSize: FontSizes.xs, color: C.textMuted }}>{earnedCount}/{BADGES.length} badges earned</Text>
            </View>
          </View>
        </View>

        {/* Streak Stats */}
        <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 20, marginBottom: 20 }}>
          <View style={{ flex: 1, backgroundColor: C.bgCard, borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: C.border }}>
            <MaterialCommunityIcons name="fire" size={24} color="#E8793A" />
            <Text style={{ fontSize: FontSizes.xxl, fontWeight: '800', color: C.textPrimary, marginTop: 4 }}>{streak}</Text>
            <Text style={{ fontSize: 10, color: C.textMuted }}>Day Streak</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: C.bgCard, borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: C.border }}>
            <MaterialCommunityIcons name="book-open-variant" size={24} color={C.primary} />
            <Text style={{ fontSize: FontSizes.xxl, fontWeight: '800', color: C.textPrimary, marginTop: 4 }}>{totalRead}</Text>
            <Text style={{ fontSize: 10, color: C.textMuted }}>Verses Read</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: C.bgCard, borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: C.border }}>
            <MaterialCommunityIcons name="percent-outline" size={24} color={C.peacockBlue} />
            <Text style={{ fontSize: FontSizes.xxl, fontWeight: '800', color: C.textPrimary, marginTop: 4 }}>{totalPercent}%</Text>
            <Text style={{ fontSize: 10, color: C.textMuted }}>Complete</Text>
          </View>
        </View>

        {/* Reading Calendar */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <Text style={{ fontSize: FontSizes.xs, fontWeight: '700', color: C.primary, letterSpacing: 1.5, marginBottom: 12 }}>READING CALENDAR</Text>
          <View style={{ backgroundColor: C.bgCard, borderRadius: 20, padding: 16, borderWidth: 1, borderColor: C.border }}>
            {/* Month nav */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <TouchableOpacity onPress={prevMonth} style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: C.bgSecondary, justifyContent: 'center', alignItems: 'center' }}>
                <MaterialCommunityIcons name="chevron-left" size={18} color={C.textMuted} />
              </TouchableOpacity>
              <Text style={{ fontSize: FontSizes.md, fontWeight: '700', color: C.textPrimary }}>{monthName}</Text>
              <TouchableOpacity onPress={nextMonth} style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: C.bgSecondary, justifyContent: 'center', alignItems: 'center' }}>
                <MaterialCommunityIcons name="chevron-right" size={18} color={C.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Day headers */}
            <View style={{ flexDirection: 'row', marginBottom: 8 }}>
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                <View key={i} style={{ width: CELL, alignItems: 'center' }}>
                  <Text style={{ fontSize: 10, fontWeight: '600', color: C.textMuted }}>{d}</Text>
                </View>
              ))}
            </View>

            {/* Days grid */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {days.map((day, i) => {
                const active = isActiveDay(day);
                const today = isToday(day);
                return (
                  <View key={i} style={{ width: CELL, height: CELL, justifyContent: 'center', alignItems: 'center' }}>
                    {day ? (
                      <View style={{
                        width: CELL - 6, height: CELL - 6, borderRadius: (CELL - 6) / 2,
                        justifyContent: 'center', alignItems: 'center',
                        backgroundColor: active ? C.primary : today ? C.primarySoft : 'transparent',
                        borderWidth: today && !active ? 1.5 : 0, borderColor: C.primary,
                      }}>
                        <Text style={{
                          fontSize: 12, fontWeight: active || today ? '700' : '400',
                          color: active ? C.textOnPrimary : today ? C.primary : C.textSecondary,
                        }}>{day}</Text>
                      </View>
                    ) : null}
                  </View>
                );
              })}
            </View>

            {/* Legend */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: C.primary }} />
                <Text style={{ fontSize: 10, color: C.textMuted }}>Read</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <View style={{ width: 10, height: 10, borderRadius: 5, borderWidth: 1.5, borderColor: C.primary }} />
                <Text style={{ fontSize: 10, color: C.textMuted }}>Today</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Badges */}
        <View style={{ paddingHorizontal: 20, marginBottom: 30 }}>
          <Text style={{ fontSize: FontSizes.xs, fontWeight: '700', color: C.primary, letterSpacing: 1.5, marginBottom: 12 }}>BADGES & ACHIEVEMENTS</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {BADGES.map((b) => {
              const earned = isBadgeEarned(b);
              return (
                <View key={b.id} style={{
                  width: (width - 50) / 2, backgroundColor: C.bgCard, borderRadius: 16, padding: 16,
                  borderWidth: 1.5, borderColor: earned ? b.color + '40' : C.border,
                  opacity: earned ? 1 : 0.5,
                }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <View style={{
                      width: 40, height: 40, borderRadius: 20,
                      backgroundColor: earned ? b.color + '15' : C.bgSecondary,
                      justifyContent: 'center', alignItems: 'center',
                      borderWidth: 1.5, borderColor: earned ? b.color + '30' : C.border,
                    }}>
                      <MaterialCommunityIcons name={b.icon} size={20} color={earned ? b.color : C.textMuted} />
                    </View>
                    {earned && <MaterialCommunityIcons name="check-circle" size={16} color={b.color} />}
                  </View>
                  <Text style={{ fontSize: FontSizes.sm, fontWeight: '700', color: earned ? C.textPrimary : C.textMuted }}>{b.title}</Text>
                  <Text style={{ fontSize: 10, color: C.textMuted, marginTop: 2 }}>{b.desc}</Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </LinearGradient>
  );
}