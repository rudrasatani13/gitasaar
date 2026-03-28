// src/screens/VerseReminderScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, Platform, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { FontSizes } from '../theme/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

let Notifications = null;
try { Notifications = require('expo-notifications'); } catch (e) {}

const REMINDER_KEY = '@gitasaar_reminders';

const PRESET_TIMES = [
  { label: 'Morning Prayer', time: '06:00', icon: 'weather-sunset-up', desc: 'Start your day with Gita' },
  { label: 'Afternoon Break', time: '13:00', icon: 'white-balance-sunny', desc: 'Midday spiritual pause' },
  { label: 'Evening Aarti', time: '18:30', icon: 'weather-sunset-down', desc: 'Wind down with wisdom' },
  { label: 'Night Reflection', time: '21:00', icon: 'moon-waning-crescent', desc: 'End your day peacefully' },
];

const VERSE_PREVIEWS = [
  'कर्मण्येवाधिकारस्ते मा फलेषु कदाचन — Gita 2.47',
  'योगस्थः कुरु कर्माणि सङ्गं त्यक्त्वा धनञ्जय — Gita 2.48',
  'नैनं छिन्दन्ति शस्त्राणि नैनं दहति पावकः — Gita 2.23',
  'वासांसि जीर्णानि यथा विहाय — Gita 2.22',
  'सर्वधर्मान्परित्यज्य मामेकं शरणं व्रज — Gita 18.66',
  'यदा यदा हि धर्मस्य ग्लानिर्भवति भारत — Gita 4.7',
];

async function requestPermissions() {
  if (!Notifications) return false;
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch (e) { return false; }
}

async function scheduleReminder(hour, minute, label) {
  if (!Notifications) return null;
  try {
    const randomVerse = VERSE_PREVIEWS[Math.floor(Math.random() * VERSE_PREVIEWS.length)];
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: '🙏 ' + label,
        body: randomVerse,
        sound: true,
      },
      trigger: {
        hour,
        minute,
        repeats: true,
      },
    });
    return id;
  } catch (e) { return null; }
}

async function cancelReminder(notifId) {
  if (!Notifications || !notifId) return;
  try { await Notifications.cancelScheduledNotificationAsync(notifId); } catch (e) {}
}

export default function VerseReminderScreen({ navigation }) {
  const { colors: C } = useTheme();
  const [reminders, setReminders] = useState({});
  const [permGranted, setPermGranted] = useState(false);

  useEffect(() => {
    loadReminders();
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    if (!Notifications) return;
    try {
      const { status } = await Notifications.getPermissionsAsync();
      setPermGranted(status === 'granted');
    } catch (e) {}
  };

  const loadReminders = async () => {
    try {
      const data = await AsyncStorage.getItem(REMINDER_KEY);
      if (data) setReminders(JSON.parse(data));
    } catch (e) {}
  };

  const saveReminders = async (updated) => {
    try { await AsyncStorage.setItem(REMINDER_KEY, JSON.stringify(updated)); } catch (e) {}
  };

  const toggleReminder = async (preset) => {
    const key = preset.time;
    const current = reminders[key];

    if (current?.enabled) {
      // Disable
      await cancelReminder(current.notifId);
      const updated = { ...reminders, [key]: { ...current, enabled: false, notifId: null } };
      setReminders(updated);
      saveReminders(updated);
    } else {
      // Enable
      const granted = await requestPermissions();
      if (!granted) {
        setPermGranted(false);
        Alert.alert('Notifications', 'Please enable notifications in your device settings to receive verse reminders.');
        return;
      }
      setPermGranted(true);
      const [h, m] = preset.time.split(':').map(Number);
      const notifId = await scheduleReminder(h, m, preset.label);
      const updated = { ...reminders, [key]: { enabled: true, notifId, label: preset.label, time: preset.time } };
      setReminders(updated);
      saveReminders(updated);
    }
  };

  const activeCount = Object.values(reminders).filter(r => r.enabled).length;

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
              <Text style={{ fontSize: FontSizes.lg, fontWeight: '700', color: C.textPrimary }}>Verse Reminders</Text>
              <Text style={{ fontSize: FontSizes.xs, color: C.textMuted }}>{activeCount} active reminder{activeCount !== 1 ? 's' : ''}</Text>
            </View>
          </View>
        </View>

        {/* Info card */}
        <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
          <View style={{ backgroundColor: C.primarySoft, borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: C.borderGold }}>
            <MaterialCommunityIcons name="bell-ring-outline" size={24} color={C.primary} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: FontSizes.sm, fontWeight: '600', color: C.textPrimary }}>Daily Verse Notifications</Text>
              <Text style={{ fontSize: FontSizes.xs, color: C.textMuted, marginTop: 2 }}>Get a beautiful shloka at your chosen times</Text>
            </View>
          </View>
        </View>

        {/* Permission warning */}
        {!permGranted && Platform.OS !== 'web' && (
          <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
            <View style={{ backgroundColor: 'rgba(245,158,11,0.10)', borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: 'rgba(245,158,11,0.25)' }}>
              <MaterialCommunityIcons name="alert-circle-outline" size={18} color="#F59E0B" />
              <Text style={{ fontSize: FontSizes.xs, color: '#FCD34D', flex: 1 }}>Notification permission needed. Enable it to receive verse reminders.</Text>
            </View>
          </View>
        )}

        {/* Reminder Presets */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <Text style={{ fontSize: FontSizes.xs, fontWeight: '700', color: C.primary, letterSpacing: 1.5, marginBottom: 12 }}>CHOOSE YOUR TIMES</Text>
          {PRESET_TIMES.map((preset) => {
            const isEnabled = reminders[preset.time]?.enabled || false;
            return (
              <TouchableOpacity key={preset.time} onPress={() => toggleReminder(preset)} activeOpacity={0.85}
                style={{
                  flexDirection: 'row', alignItems: 'center', gap: 14,
                  backgroundColor: C.bgCard, borderRadius: 16, padding: 18, marginBottom: 10,
                  borderWidth: 1.5, borderColor: isEnabled ? C.primary + '40' : C.border,
                }}>
                <View style={{
                  width: 46, height: 46, borderRadius: 23,
                  backgroundColor: isEnabled ? C.primarySoft : C.bgSecondary,
                  justifyContent: 'center', alignItems: 'center',
                  borderWidth: 1, borderColor: isEnabled ? C.borderGold : C.border,
                }}>
                  <MaterialCommunityIcons name={preset.icon} size={22} color={isEnabled ? C.primary : C.textMuted} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: FontSizes.md, fontWeight: '700', color: C.textPrimary }}>{preset.label}</Text>
                  <Text style={{ fontSize: FontSizes.xs, color: C.textMuted, marginTop: 2 }}>{preset.desc}</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: FontSizes.md, fontWeight: '700', color: isEnabled ? C.primary : C.textMuted }}>{preset.time}</Text>
                  <Switch
                    value={isEnabled}
                    onValueChange={() => toggleReminder(preset)}
                    trackColor={{ false: C.border, true: C.primary + '40' }}
                    thumbColor={isEnabled ? C.primary : C.textMuted}
                    style={{ marginTop: 4, transform: [{ scale: 0.8 }] }}
                  />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Preview */}
        <View style={{ paddingHorizontal: 20, marginBottom: 30 }}>
          <Text style={{ fontSize: FontSizes.xs, fontWeight: '700', color: C.primary, letterSpacing: 1.5, marginBottom: 12 }}>NOTIFICATION PREVIEW</Text>
          <View style={{ backgroundColor: C.bgCard, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: C.border }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <View style={{ width: 28, height: 28, borderRadius: 6, backgroundColor: C.primarySoft, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: 14 }}>{'\u0950'}</Text>
              </View>
              <View>
                <Text style={{ fontSize: FontSizes.sm, fontWeight: '700', color: C.textPrimary }}>GitaSaar</Text>
                <Text style={{ fontSize: 10, color: C.textMuted }}>now</Text>
              </View>
            </View>
            <Text style={{ fontSize: FontSizes.sm, fontWeight: '600', color: C.textPrimary, marginBottom: 4 }}>🙏 Morning Prayer</Text>
            <Text style={{ fontSize: FontSizes.sm, color: C.textSecondary, lineHeight: 20 }}>कर्मण्येवाधिकारस्ते मा फलेषु कदाचन — Gita 2.47</Text>
          </View>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </LinearGradient>
  );
}