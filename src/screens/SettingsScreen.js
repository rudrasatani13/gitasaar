import AppLogo from "../components/AppLogo";
// src/screens/SettingsScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, Alert, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GlassCard from '../components/GlassCard';
import { useTheme } from '../theme/ThemeContext';
import { useProfile } from '../theme/ProfileContext';
import { useTranslation } from '../theme/useTranslation';
import { FontSizes } from '../theme/colors';
import { auth } from '../utils/firebase';
import { Share, Linking } from 'react-native';
import { tapLight, tapHeavy } from '../utils/haptics';
import { clearMemory, loadMemory } from '../utils/conversationMemory';

import { GaneshSettingsBackground } from "../components/SpiritualBackground";
import { scheduleDailyShloka, cancelDailyShloka, getNotifSettings, sendTestNotification } from '../utils/notifications';

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = [0, 15, 30, 45];

function formatTimeDisplay(h, m) {
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hr = h === 0 ? 12 : h > 12 ? h - 12 : h;
  const min = m < 10 ? '0' + m : m;
  return hr + ':' + min + ' ' + ampm;
}

function SettingRow({ icon, label, sublabel, right, onPress, isLast, C }) {
  return (
    <TouchableOpacity
      style={[{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14 }, !isLast && { borderBottomWidth: 1, borderBottomColor: C.borderLight }]}
      onPress={onPress} activeOpacity={onPress ? 0.7 : 1} disabled={!onPress}
    >
      <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: C.primarySoft, justifyContent: 'center', alignItems: 'center' }}>
        <MaterialCommunityIcons name={icon} size={20} color={C.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: FontSizes.md, fontWeight: '600', color: C.textPrimary }}>{label}</Text>
        {sublabel && <Text style={{ fontSize: FontSizes.sm, color: C.textMuted, marginTop: 1 }}>{sublabel}</Text>}
      </View>
      {right}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const navigation = useNavigation();
  const { isDark, toggleTheme, colors: C } = useTheme();
  const { displayName, profilePhoto, profile } = useProfile();
  const { tr } = useTranslation();

  const [notifEnabled, setNotifEnabled] = useState(false);
  const [notifHour, setNotifHour] = useState(6);
  const [notifMinute, setNotifMinute] = useState(0);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tempHour, setTempHour] = useState(6);
  const [tempMinute, setTempMinute] = useState(0);
  const [isTogglingNotif, setIsTogglingNotif] = useState(false);
  const [timeSaved, setTimeSaved] = useState(false);
  const [memoryVisits, setMemoryVisits] = useState(0);

  const user = auth.currentUser;
  const userEmail = user ? user.email : 'Guest';
  const userName = displayName || (userEmail ? userEmail.split('@')[0] : '');
  const langId = profile.language || 'hinglish';
  const langLabel = langId.charAt(0).toUpperCase() + langId.slice(1);

  useEffect(() => {
    (async () => {
      const settings = await getNotifSettings();
      setNotifEnabled(settings.enabled || false);
      setNotifHour(settings.hour || 6);
      setNotifMinute(settings.minute || 0);
      // Load memory visit count
      const mem = await loadMemory();
      setMemoryVisits(mem?.visitCount || 0);
    })();
  }, []);

  const handleNotifToggle = useCallback(async (value) => {
    if (isTogglingNotif) return;
    setIsTogglingNotif(true);
    setNotifEnabled(value);
    try {
      if (value) await scheduleDailyShloka(notifHour, notifMinute);
      else { await cancelDailyShloka(); setShowTimePicker(false); }
    } catch (e) {}
    setIsTogglingNotif(false);
  }, [notifHour, notifMinute, isTogglingNotif]);

  const handleTimeSave = async () => {
    setNotifHour(tempHour); setNotifMinute(tempMinute); setShowTimePicker(false);
    setTimeSaved(true); setTimeout(() => setTimeSaved(false), 2000);
    if (notifEnabled) await scheduleDailyShloka(tempHour, tempMinute);
  };

  // NUCLEAR LOGOUT - works on web + native
  const handleRate = () => { tapLight(); Linking.openURL("https://play.google.com/store/apps/details?id=com.gitasaar.app").catch(() => {}); };
  const handleShare = async () => { tapLight(); try { await Share.share({ message: "GitaSaar - AI Spiritual Companion\nBhagavad Gita ki wisdom ab aapki ungliyon pe!\nDownload: https://play.google.com/store/apps/details?id=com.gitasaar.app", title: "GitaSaar" }); } catch(e) {} };
  const handleLogout = async () => {
    try {
      console.log('Logging out...');
      console.log('Current user:', auth.currentUser?.email);
      
      await auth.signOut();
      console.log('SignOut called, user now:', auth.currentUser);
      // Force reload on web if auth state doesn't update
      if (typeof window !== 'undefined' && window.location) {
        setTimeout(() => window.location.reload(), 500);
      }
    } catch (e) {
      console.log('Logout error:', e);
      // Nuclear fallback - force reload
      if (typeof window !== 'undefined' && window.location) {
        window.location.reload();
      }
    }
  };

  const renderAvatar = (size) => {
    if (profilePhoto && !profilePhoto.startsWith('avatar_')) {
      return <Image source={{ uri: profilePhoto }} style={{ width: size, height: size, borderRadius: size / 2 }} />;
    }
    if (profilePhoto && profilePhoto.startsWith('avatar_')) {
      return <MaterialCommunityIcons name={profilePhoto.replace('avatar_', '')} size={size * 0.55} color={C.primary} />;
    }
    return <MaterialCommunityIcons name="account-circle-outline" size={size * 0.55} color={C.primary} />;
  };

  return (
    <LinearGradient colors={C.gradientWarm} style={{ flex: 1 }}>
      <GaneshSettingsBackground />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 60, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: FontSizes.xxxl, fontWeight: '700', color: C.textPrimary }}>{tr('settings')}</Text>
        </View>

        {/* Profile */}
        <TouchableOpacity onPress={() => navigation.navigate('ProfileEdit')} activeOpacity={0.8}>
          <GlassCard style={{ marginBottom: 20, flexDirection: 'row', alignItems: 'center', gap: 12 }} intensity={45}>
            <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: C.glassBg, borderWidth: 1.5, borderColor: C.glassBorderGold, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
              {renderAvatar(56)}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: FontSizes.lg, fontWeight: '700', color: C.textPrimary, textTransform: 'capitalize' }}>{userName}</Text>
              <Text style={{ fontSize: FontSizes.xs, color: C.textMuted, marginTop: 2 }}>{userEmail}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
                <View style={{ backgroundColor: C.glassBg, borderWidth: 1, borderColor: C.glassBorderGold, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 }}>
                  <Text style={{ fontSize: FontSizes.xs, fontWeight: '600', color: C.primary }}>Free Plan</Text>
                </View>
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={{ fontSize: FontSizes.xs, color: C.primary, fontWeight: '500' }}>Edit</Text>
              <MaterialCommunityIcons name="chevron-right" size={18} color={C.primary} />
            </View>
          </GlassCard>
        </TouchableOpacity>

        {/* Premium */}
        <TouchableOpacity activeOpacity={0.85} onPress={() => navigation.navigate("Premium")}>
          <LinearGradient colors={C.gradientTemple} style={{ borderRadius: 16, padding: 20, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24 }} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' }}>
              <MaterialCommunityIcons name="star-four-points" size={24} color={C.turmeric} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: FontSizes.lg, fontWeight: '700', color: '#FFF9F0' }}>GitaSaar Premium</Text>
              <Text style={{ fontSize: FontSizes.sm, color: 'rgba(255,251,242,0.8)', marginTop: 2 }}>Unlimited chats, no ads</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: FontSizes.xl, fontWeight: '700', color: '#FFF9F0' }}>{'₹149'}</Text>
              <Text style={{ fontSize: FontSizes.xs, color: 'rgba(255,251,242,0.7)' }}>/mo</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Preferences */}
        <Text style={{ fontSize: FontSizes.xs, fontWeight: '700', color: C.primary, letterSpacing: 1.5, marginBottom: 12 }}>{tr('preferences')}</Text>
        <GlassCard noPadding style={{ marginBottom: 12, borderRadius: 16 }} intensity={40}>
          <SettingRow C={C} icon="translate" label={tr('language')} sublabel={langLabel}
            onPress={() => navigation.navigate('Language')}
            right={<MaterialCommunityIcons name="chevron-right" size={18} color={C.textMuted} />} />
          <SettingRow C={C} icon="bell-ring-outline" label={tr('dailyShloka')}
            sublabel={notifEnabled ? formatTimeDisplay(notifHour, notifMinute) : 'Off'}
            onPress={notifEnabled ? () => { setTempHour(notifHour); setTempMinute(notifMinute); setShowTimePicker(true); } : undefined}
            right={<Switch value={notifEnabled} onValueChange={handleNotifToggle}
              trackColor={{ false: C.border, true: C.primarySoft }} thumbColor={notifEnabled ? C.primary : C.textMuted} />} />
          <SettingRow C={C} icon={isDark ? 'weather-night' : 'white-balance-sunny'} label={tr('darkMode')} sublabel={isDark ? 'Space Mode' : 'Light Mode'}
            right={<Switch value={isDark} onValueChange={toggleTheme}
              trackColor={{ false: C.border, true: C.primarySoft }} thumbColor={isDark ? C.primary : C.textMuted} />} isLast />
        </GlassCard>

        {/* Time Picker */}
        {showTimePicker && (
          <GlassCard style={{ marginBottom: 12 }} intensity={45}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <Text style={{ fontSize: FontSizes.md, fontWeight: '700', color: C.textPrimary }}>Set Time</Text>
              <TouchableOpacity onPress={() => setShowTimePicker(false)}><MaterialCommunityIcons name="close" size={18} color={C.textMuted} /></TouchableOpacity>
            </View>
            <Text style={{ fontSize: FontSizes.xs, fontWeight: '700', color: C.primary, letterSpacing: 1, marginBottom: 8 }}>HOUR</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                {HOURS.map((h) => (
                  <TouchableOpacity key={h} onPress={() => setTempHour(h)}
                    style={{ width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center', backgroundColor: tempHour === h ? C.primary : C.bgSecondary, borderWidth: 1, borderColor: tempHour === h ? C.primary : C.border }}>
                    <Text style={{ fontSize: FontSizes.sm, fontWeight: '700', color: tempHour === h ? C.textOnPrimary : C.textSecondary }}>{h < 10 ? '0' + h : h}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
            <Text style={{ fontSize: FontSizes.xs, fontWeight: '700', color: C.primary, letterSpacing: 1, marginBottom: 8 }}>MINUTE</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
              {MINUTES.map((m) => (
                <TouchableOpacity key={m} onPress={() => setTempMinute(m)}
                  style={{ flex: 1, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center', backgroundColor: tempMinute === m ? C.primary : C.bgSecondary, borderWidth: 1, borderColor: tempMinute === m ? C.primary : C.border }}>
                  <Text style={{ fontSize: FontSizes.md, fontWeight: '700', color: tempMinute === m ? C.textOnPrimary : C.textSecondary }}>:{m < 10 ? '0' + m : m}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={{ backgroundColor: C.bgSecondary, borderRadius: 12, padding: 12, marginBottom: 12, alignItems: 'center' }}>
              <Text style={{ fontSize: FontSizes.xxl, fontWeight: '800', color: C.primary }}>{formatTimeDisplay(tempHour, tempMinute)}</Text>
            </View>
            <TouchableOpacity onPress={handleTimeSave} style={{ backgroundColor: C.primary, borderRadius: 12, paddingVertical: 14, alignItems: 'center' }}>
              <Text style={{ fontSize: FontSizes.md, fontWeight: '700', color: C.textOnPrimary }}>Save Time</Text>
            </TouchableOpacity>
          </GlassCard>
        )}
        {timeSaved && !showTimePicker && (
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: 'rgba(16,185,129,0.12)', borderRadius: 12, paddingVertical: 10, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(16,185,129,0.25)' }}>
            <MaterialCommunityIcons name="check-circle" size={16} color="#10B981" />
            <Text style={{ fontSize: FontSizes.sm, fontWeight: '600', color: '#10B981' }}>Time saved!</Text>
          </View>
        )}

        {/* About */}
        <Text style={{ fontSize: FontSizes.xs, fontWeight: '700', color: C.primary, letterSpacing: 1.5, marginBottom: 12, marginTop: 12 }}>{tr('about')}</Text>
        <GlassCard noPadding style={{ marginBottom: 24, borderRadius: 16 }} intensity={40}>
          <SettingRow C={C} icon="star-outline" label="Rate GitaSaar" sublabel="Share your experience" onPress={handleRate} />
          <SettingRow C={C} icon="bell-ring-outline" label="Verse Reminders" sublabel="Daily shloka notifications" onPress={() => navigation.navigate("VerseReminder")}
          />
          <SettingRow C={C} icon="account-group-outline" label="Community" sublabel="Share & read reflections" onPress={() => navigation.navigate("Community")}
          />
          <SettingRow C={C} icon="brain" label="Krishna's Memory"
            sublabel={memoryVisits > 1 ? `Active · ${memoryVisits} visits remembered` : 'Not started yet'}
            onPress={() => {
              if (memoryVisits < 1) return;
              Alert.alert(
                'Clear Memory',
                'This will erase all of Krishna\'s memory about you — visit count, topics discussed, and personalized greetings. Are you sure?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Clear Memory',
                    style: 'destructive',
                    onPress: async () => {
                      await clearMemory();
                      setMemoryVisits(0);
                      tapHeavy();
                    },
                  },
                ]
              );
            }}
            right={
              memoryVisits > 1 ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: C.primarySoft, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999, borderWidth: 1, borderColor: C.borderGold }}>
                  <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: C.primary }} />
                  <Text style={{ fontSize: 10, fontWeight: '700', color: C.primary }}>Active</Text>
                </View>
              ) : (
                <MaterialCommunityIcons name="chevron-right" size={18} color={C.textMuted} />
              )
            }
          />
          <SettingRow C={C} icon="information-outline" label="About GitaSaar" sublabel="Version, mission &amp; credits" onPress={() => navigation.navigate("About")}
            right={<MaterialCommunityIcons name="chevron-right" size={18} color={C.textMuted} />} />
          <SettingRow C={C} icon="share-variant-outline" label="Share GitaSaar" sublabel="Spread the wisdom" onPress={handleShare} right={<MaterialCommunityIcons name="chevron-right" size={18} color={C.textMuted} />} />
          <SettingRow C={C} icon="shield-check-outline" label="Privacy Policy"
            onPress={() => navigation.navigate('PrivacyPolicy')}
            right={<MaterialCommunityIcons name="chevron-right" size={18} color={C.textMuted} />} />
          <SettingRow C={C} icon="information-outline" label="Version"
            right={<Text style={{ fontSize: FontSizes.sm, color: C.textMuted }}>2.0.0</Text>} isLast />
        </GlassCard>

        {/* Logout */}
        <TouchableOpacity onPress={handleLogout} activeOpacity={0.8}>
          <GlassCard noPadding style={{ marginBottom: 24, borderRadius: 16, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }} intensity={35}>
            <MaterialCommunityIcons name="logout" size={20} color={C.vermillion} />
            <Text style={{ fontSize: FontSizes.md, fontWeight: '700', color: C.vermillion }}>{tr('logout')}</Text>
          </GlassCard>
        </TouchableOpacity>

        <View style={{ alignItems: 'center', paddingVertical: 24, gap: 4 }}>
          <AppLogo size={36} />
          <Text style={{ fontSize: FontSizes.md, fontWeight: '500', color: C.textSecondary }}>{'GitaSaar — गीता सार'}</Text>
          <Text style={{ fontSize: FontSizes.sm, color: C.textMuted }}>{tr('madeWithDevotion')}</Text>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </LinearGradient>
  );
}