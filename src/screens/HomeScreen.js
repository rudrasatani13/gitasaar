// src/screens/HomeScreen.js
import React, { useRef, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Animated, Dimensions, Image, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import GlassCard from '../components/GlassCard';
import { useTheme } from '../theme/ThemeContext';
import { useBookmarks } from '../theme/BookmarkContext';
import { useTracker } from '../theme/TrackerContext';
import { useProfile } from '../theme/ProfileContext';
import { useTranslation } from '../theme/useTranslation';
import { FontSizes } from '../theme/colors';
import { LotusHomeBackground } from "../components/SpiritualBackground";
import ShlokaCard from '../components/ShlokaCard';
import { sampleVerses, reflectionPrompts } from '../data/sampleVerses';

const { width } = Dimensions.get('window');

function getGreeting(tr) {
  const h = new Date().getHours();
  if (h < 12) return { text: tr('goodMorning'), icon: 'white-balance-sunny' };
  if (h < 17) return { text: tr('goodAfternoon'), icon: 'weather-sunny' };
  return { text: tr('goodEvening'), icon: 'weather-night' };
}

let allGitaVerses = null;
try { const db = require("../data/gitaDatabase.json"); allGitaVerses = []; Object.keys(db.verses).forEach(ch => db.verses[ch].forEach(v => allGitaVerses.push(v))); } catch(e) {}

function getDailyVerse() {
  const d = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  const pool = allGitaVerses && allGitaVerses.length > 0 ? allGitaVerses : sampleVerses; return pool[d % pool.length];
}

function FadeSlide({ delay, children }) {
  const o = useRef(new Animated.Value(0)).current;
  const y = useRef(new Animated.Value(28)).current;
  useEffect(() => {
    Animated.sequence([Animated.delay(delay), Animated.parallel([
      Animated.timing(o, { toValue: 1, duration: 450, useNativeDriver: true }),
      Animated.spring(y, { toValue: 0, friction: 8, tension: 60, useNativeDriver: true }),
    ])]).start();
  }, []);
  return <Animated.View style={{ opacity: o, transform: [{ translateY: y }] }}>{children}</Animated.View>;
}

function PressableCard({ children, onPress, style }) {
  const scale = useRef(new Animated.Value(1)).current;
  const onIn = () => Animated.spring(scale, { toValue: 0.97, friction: 8, useNativeDriver: true }).start();
  const onOut = () => Animated.spring(scale, { toValue: 1, friction: 5, useNativeDriver: true }).start();
  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <TouchableOpacity onPress={onPress} onPressIn={onIn} onPressOut={onOut} activeOpacity={0.95}>
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function HomeScreen({ navigation }) {
  const { colors: C, isDark } = useTheme();
  const { bookmarkCount } = useBookmarks();
  const { streak, totalRead, totalPercent, getStreakWeek } = useTracker();
  const { displayName, profilePhoto } = useProfile();
  const { tr } = useTranslation();
  const g = getGreeting(tr);
  const verse = getDailyVerse();
  const prompt = reflectionPrompts[new Date().getDay() % reflectionPrompts.length];
  const streakWeek = getStreakWeek();
  const [refreshing, setRefreshing] = React.useState(false);
  const onRefresh = () => { setRefreshing(true); setTimeout(() => setRefreshing(false), 1000); };
  const userName = displayName || 'User';

  const TOPICS = [
    { label: 'Inner Peace', icon: 'meditation', bg: C.peacockBlue, q: 'How to find inner peace?' },
    { label: 'Career', icon: 'briefcase-outline', bg: C.primary, q: 'I feel confused about my career' },
    { label: 'Love', icon: 'heart-outline', bg: C.lotusRose, q: 'What does Gita say about love?' },
    { label: 'Anxiety', icon: 'head-heart-outline', bg: C.saffron, q: 'How to overcome anxiety?' },
    { label: 'Devotion', icon: 'hands-pray', bg: C.maroon, q: 'How to develop devotion?' },
    { label: 'Strength', icon: 'arm-flex-outline', bg: C.primaryDark, q: 'I need strength and courage' },
  ];

  const renderAvatar = () => {
    if (profilePhoto && !profilePhoto.startsWith('avatar_')) {
      return <Image source={{ uri: profilePhoto }} style={{ width: 44, height: 44, borderRadius: 22 }} />;
    }
    if (profilePhoto && profilePhoto.startsWith('avatar_')) {
      return <MaterialCommunityIcons name={profilePhoto.replace('avatar_', '')} size={22} color={C.primary} />;
    }
    return <Text style={{ fontSize: 18, fontWeight: '700', color: C.primary }}>{userName[0].toUpperCase()}</Text>;
  };

  return (
    <LinearGradient colors={C.gradientWarm} style={{ flex: 1 }}>
      <LotusHomeBackground />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 56, paddingBottom: 120 }} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.primary} colors={[C.primary]} />}>

        {/* Header with profile */}
        <FadeSlide delay={0}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <TouchableOpacity onPress={() => navigation.navigate('Settings')} activeOpacity={0.8}>
                <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: C.glassBg, borderWidth: 1.5, borderColor: C.glassBorderGold, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
                  {renderAvatar()}
                </View>
              </TouchableOpacity>
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <MaterialCommunityIcons name={g.icon} size={14} color={C.turmeric} />
                  <Text style={{ fontSize: FontSizes.sm, color: C.textMuted }}>{g.text}</Text>
                </View>
                <Text style={{ fontSize: FontSizes.xl, fontWeight: '800', color: C.textPrimary, marginTop: 2 }}>{userName}</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity onPress={() => navigation.navigate('Bookmarks')} activeOpacity={0.8}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: C.glassBg, borderWidth: 1, borderColor: C.glassBorder }}>
                  <MaterialCommunityIcons name="bookmark-multiple" size={14} color={C.saffron} />
                  <Text style={{ fontSize: FontSizes.xs, fontWeight: '700', color: C.saffron }}>{bookmarkCount}</Text>
                </View>
              </TouchableOpacity>
              <LinearGradient colors={['#E8793A', '#DBA04E']} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999 }}>
                <MaterialCommunityIcons name="fire" size={14} color="#FFF" />
                <Text style={{ fontSize: FontSizes.xs, fontWeight: '800', color: '#FFF' }}>{streak.count}</Text>
              </LinearGradient>
            </View>
          </View>
        </FadeSlide>

        {/* Streak + Progress */}
        <FadeSlide delay={50}>
          <GlassCard style={{ marginBottom: 16 }} intensity={55}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 }}>
              {streakWeek.map((day, i) => (
                <View key={i} style={{ alignItems: 'center', gap: 8 }}>
                  <Text style={{ fontSize: FontSizes.xs, color: day.isToday ? C.primary : C.textMuted, fontWeight: day.isToday ? '700' : '400' }}>{day.label}</Text>
                  <View style={{
                    width: 30, height: 30, borderRadius: 15,
                    backgroundColor: day.active ? C.saffron + '20' : C.glassBg,
                    borderWidth: day.isToday ? 1.5 : 1,
                    borderColor: day.isToday ? C.primary : C.glassBorder,
                    justifyContent: 'center', alignItems: 'center',
                  }}>
                    {day.active ? <MaterialCommunityIcons name="check" size={13} color={C.saffron} /> : <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: C.textMuted + '40' }} />}
                  </View>
                </View>
              ))}
            </View>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1, backgroundColor: C.glassBg, borderRadius: 12, padding: 12, alignItems: 'center', gap: 2, borderWidth: 1, borderColor: C.glassBorder }}>
                <Text style={{ fontSize: FontSizes.xl, fontWeight: '800', color: C.saffron }}>{streak.count}</Text>
                <Text style={{ fontSize: FontSizes.xs, color: C.textMuted }}>{tr('dayStreak')}</Text>
              </View>
              <View style={{ flex: 2, backgroundColor: C.glassBg, borderRadius: 12, padding: 12, justifyContent: 'center', borderWidth: 1, borderColor: C.glassBorder }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                  <Text style={{ fontSize: FontSizes.xs, fontWeight: '600', color: C.textSecondary }}>{tr('readingProgress')}</Text>
                  <Text style={{ fontSize: FontSizes.xs, fontWeight: '700', color: C.peacockBlue }}>{totalRead}/700</Text>
                </View>
                <View style={{ height: 5, backgroundColor: C.glassBorder, borderRadius: 3, overflow: 'hidden' }}>
                  <View style={{ height: '100%', width: totalPercent + '%', backgroundColor: C.peacockBlue, borderRadius: 3 }} />
                </View>
              </View>
            </View>
          </GlassCard>
        </FadeSlide>

        {/* Chat CTA */}
        <FadeSlide delay={100}>
          <PressableCard onPress={() => navigation.navigate('Chat')}>
            <LinearGradient colors={C.gradientGold} style={{ borderRadius: 24, padding: 24, marginBottom: 16, overflow: 'hidden' }} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <View style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.08)' }} />
              <View style={{ position: 'absolute', bottom: -30, left: -30, width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.05)' }} />
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.20)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)', justifyContent: 'center', alignItems: 'center' }}>
                  <MaterialCommunityIcons name="om" size={26} color="#FFF9F0" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: FontSizes.xl, fontWeight: '800', color: '#FFF9F0' }}>{tr('askKrishna')}</Text>
                  <Text style={{ fontSize: FontSizes.xs, color: 'rgba(255,249,240,0.7)', marginTop: 2 }}>{tr('personalizedGuidance')}</Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 14, paddingVertical: 13 }}>
                <Text style={{ fontSize: FontSizes.md, fontWeight: '700', color: '#9E6B2C' }}>{tr('startConversation')}</Text>
                <MaterialCommunityIcons name="arrow-right" size={16} color="#9E6B2C" />
              </View>
            </LinearGradient>
          </PressableCard>
        </FadeSlide>

        {/* Quick Actions */}
        <FadeSlide delay={140}>
          <View style={{ flexDirection: "row", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
            <TouchableOpacity onPress={() => navigation.navigate("Quiz")} activeOpacity={0.8} style={{ width: 155 }}>
              <GlassCard noPadding style={{ borderRadius: 16, padding: 14 }} intensity={40}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: C.saffronSoft, justifyContent: "center", alignItems: "center" }}>
                    <MaterialCommunityIcons name="head-question-outline" size={18} color={C.saffron} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: FontSizes.sm, fontWeight: "700", color: C.textPrimary }} numberOfLines={1}>Daily Quiz</Text>
                    <Text style={{ fontSize: FontSizes.xs, color: C.textMuted }} numberOfLines={1}>Test your knowledge</Text>
                  </View>
                </View>
              </GlassCard>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate("ChatHistory")} activeOpacity={0.8} style={{ flex: 1 }}>
              <GlassCard noPadding style={{ borderRadius: 16, padding: 14 }} intensity={40}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: C.peacockBlue + '14', justifyContent: "center", alignItems: "center" }}>
                    <MaterialCommunityIcons name="chat-outline" size={18} color={C.peacockBlue} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: FontSizes.sm, fontWeight: "700", color: C.textPrimary }} numberOfLines={1}>Chat History</Text>
                    <Text style={{ fontSize: FontSizes.xs, color: C.textMuted }} numberOfLines={1}>Past conversations</Text>
                  </View>
                </View>
              </GlassCard>
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: "row", gap: 10, marginBottom: 16 }}>
            <TouchableOpacity onPress={() => navigation.navigate("Streak")} activeOpacity={0.8} style={{ flex: 1 }}>
              <GlassCard noPadding style={{ borderRadius: 16, padding: 14 }} intensity={40}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: "#E8793A14", justifyContent: "center", alignItems: "center" }}>
                    <MaterialCommunityIcons name="fire" size={18} color="#E8793A" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: FontSizes.sm, fontWeight: "700", color: C.textPrimary }} numberOfLines={1}>My Journey</Text>
                    <Text style={{ fontSize: FontSizes.xs, color: C.textMuted }} numberOfLines={1}>Streaks & badges</Text>
                  </View>
                </View>
              </GlassCard>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate("MoodTracker")} activeOpacity={0.8} style={{ flex: 1 }}>
              <GlassCard noPadding style={{ borderRadius: 16, padding: 14 }} intensity={40}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: "#14918E14", justifyContent: "center", alignItems: "center" }}>
                    <MaterialCommunityIcons name="emoticon-happy-outline" size={18} color="#14918E" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: FontSizes.sm, fontWeight: "700", color: C.textPrimary }} numberOfLines={1}>Mood Tracker</Text>
                    <Text style={{ fontSize: FontSizes.xs, color: C.textMuted }} numberOfLines={1}>How are you today?</Text>
                  </View>
                </View>
              </GlassCard>
            </TouchableOpacity>
          </View>
        </FadeSlide>

        {/* Topics Grid */}
        <FadeSlide delay={150}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: C.textMuted }} />
            <Text style={{ fontSize: FontSizes.xs, fontWeight: '800', color: C.primary, letterSpacing: 2 }}>{tr('exploreTopics')}</Text>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {TOPICS.map((t) => (
              <PressableCard key={t.label} onPress={() => navigation.navigate('Chat')} style={{ width: (width - 40 - 20) / 3 }}>
                <GlassCard noPadding style={{ borderRadius: 16, paddingVertical: 16, alignItems: 'center' }} intensity={35}>
                  <View style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: t.bg + '18', justifyContent: 'center', alignItems: 'center', marginBottom: 8, borderWidth: 1, borderColor: t.bg + '30' }}>
                    <MaterialCommunityIcons name={t.icon} size={20} color={t.bg} />
                  </View>
                  <Text style={{ fontSize: FontSizes.xs, fontWeight: '600', color: C.textSecondary }}>{t.label}</Text>
                </GlassCard>
              </PressableCard>
            ))}
          </View>
        </FadeSlide>

        {/* Daily Shloka */}
        <FadeSlide delay={200}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 24, marginBottom: 16 }}>
            <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: C.textMuted }} />
            <Text style={{ fontSize: FontSizes.xs, fontWeight: '800', color: C.primary, letterSpacing: 2 }}>{tr('shlokaOfDay')}</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate("VerseOfDay")} activeOpacity={0.9}>
            <ShlokaCard verse={verse} animate />
          </TouchableOpacity>
        </FadeSlide>

        {/* Reflection */}
        <FadeSlide delay={250}>
          <PressableCard onPress={() => navigation.navigate('Journal')} style={{ marginTop: 22 }}>
            <GlassCard noPadding intensity={45}>
              <LinearGradient colors={[C.peacockBlue + '12', C.peacockBlue + '04']} style={{ padding: 20, borderRadius: 20 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: C.peacockBlue + '18', justifyContent: 'center', alignItems: 'center' }}>
                    <MaterialCommunityIcons name="thought-bubble-outline" size={16} color={C.peacockBlue} />
                  </View>
                  <Text style={{ fontSize: FontSizes.xs, fontWeight: '800', color: C.peacockBlue, letterSpacing: 1.5 }}>{tr('todayReflection')}</Text>
                </View>
                <Text style={{ fontSize: FontSizes.lg, fontWeight: '600', color: C.textPrimary, lineHeight: 28, marginBottom: 16 }}>{prompt}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', backgroundColor: C.peacockBlue, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 18 }}>
                  <MaterialCommunityIcons name="pencil-outline" size={14} color="#FFF9F0" />
                  <Text style={{ fontSize: FontSizes.sm, fontWeight: '700', color: '#FFF9F0' }}>{tr('writeInJournal')}</Text>
                </View>
              </LinearGradient>
            </GlassCard>
          </PressableCard>
        </FadeSlide>

        {/* Stats */}
        <FadeSlide delay={300}>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 24 }}>
            {[
              { icon: 'fire', num: String(streak.count), label: tr('dayStreak'), color: C.saffron },
              { icon: 'book-open-page-variant', num: String(totalRead), label: tr('versesRead'), color: C.peacockBlue },
              { icon: 'bookmark-multiple', num: String(bookmarkCount), label: tr('saved'), color: C.primary },
            ].map((s) => (
              <GlassCard key={s.label} noPadding style={{ flex: 1, paddingVertical: 14, alignItems: 'center', gap: 3 }} intensity={35}>
                <MaterialCommunityIcons name={s.icon} size={18} color={s.color} />
                <Text style={{ fontSize: FontSizes.xxl, fontWeight: '800', color: C.textPrimary }}>{s.num}</Text>
                <Text style={{ fontSize: FontSizes.xs, color: C.textMuted, fontWeight: '500' }}>{s.label}</Text>
              </GlassCard>
            ))}
          </View>
        </FadeSlide>

        <View style={{ height: 30 }} />
      </ScrollView>
    </LinearGradient>
  );
}