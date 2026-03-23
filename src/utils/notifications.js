// src/utils/notifications.js
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { sampleVerses } from '../data/sampleVerses';

const NOTIF_KEY = '@gitasaar_notif_settings';

let Notifications = null;
let Device = null;

// Lazy load — prevents crash on web
async function loadModules() {
  try {
    Notifications = require('expo-notifications');
    Device = require('expo-device');
    return true;
  } catch (e) {
    return false;
  }
}

function getRandomVerse() {
  return sampleVerses[Math.floor(Math.random() * sampleVerses.length)];
}

export async function requestNotificationPermission() {
  const loaded = await loadModules();
  if (!loaded || !Notifications) return false;

  // Web doesn't support expo-notifications well
  if (Platform.OS === 'web') return false;

  try {
    if (Device && !Device.isDevice) return false;

    const { status: existing } = await Notifications.getPermissionsAsync();
    let finalStatus = existing;

    if (existing !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') return false;

    // Set notification handler
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('daily-shloka', {
        name: 'Daily Shloka',
        importance: 4, // HIGH
        sound: 'default',
      });
    }

    return true;
  } catch (e) {
    console.log('Permission error:', e);
    return false;
  }
}

export async function scheduleDailyShloka(hour = 6, minute = 0) {
  // Save settings regardless of platform
  await AsyncStorage.setItem(NOTIF_KEY, JSON.stringify({
    enabled: true, hour, minute, lastScheduled: new Date().toISOString(),
  }));

  // Only schedule actual notifications on native
  if (Platform.OS === 'web') return true;

  try {
    const loaded = await loadModules();
    if (!loaded || !Notifications) return true; // Save settings but skip scheduling

    await Notifications.cancelAllScheduledNotificationsAsync();

    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) return true; // Settings saved, permission pending

    const verse = getRandomVerse();

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '\u0950 GitaSaar — Daily Shloka',
        body: 'Gita ' + verse.chapter + '.' + verse.verse + ': ' + verse.english.substring(0, 100),
        data: { type: 'daily_shloka', chapter: verse.chapter, verse: verse.verse },
        sound: 'default',
      },
      trigger: { hour, minute, repeats: true },
    });

    return true;
  } catch (e) {
    console.log('Schedule error:', e);
    return true; // Don't fail — settings are saved
  }
}

export async function cancelDailyShloka() {
  await AsyncStorage.setItem(NOTIF_KEY, JSON.stringify({ enabled: false }));

  if (Platform.OS === 'web') return true;

  try {
    const loaded = await loadModules();
    if (loaded && Notifications) {
      await Notifications.cancelAllScheduledNotificationsAsync();
    }
  } catch (e) {}
  return true;
}

export async function getNotifSettings() {
  try {
    const data = await AsyncStorage.getItem(NOTIF_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {}
  return { enabled: false, hour: 6, minute: 0 };
}

export async function sendTestNotification() {
  if (Platform.OS === 'web') {
    // Use browser Notification API as fallback
    try {
      if ('Notification' in window) {
        const perm = await window.Notification.requestPermission();
        if (perm === 'granted') {
          const verse = getRandomVerse();
          new window.Notification('\u0950 GitaSaar — Test', {
            body: 'Gita ' + verse.chapter + '.' + verse.verse + ': ' + verse.english.substring(0, 80),
          });
          return true;
        }
      }
    } catch (e) {}
    return false;
  }

  try {
    const loaded = await loadModules();
    if (!loaded || !Notifications) return false;

    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) return false;

    const verse = getRandomVerse();
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '\u0950 GitaSaar — Test Notification',
        body: 'Gita ' + verse.chapter + '.' + verse.verse + ': ' + verse.english.substring(0, 120),
        data: { type: 'test' },
        sound: 'default',
      },
      trigger: null,
    });
    return true;
  } catch (e) {
    return false;
  }
}