// src/utils/userDataSync.js
import AsyncStorage from '@react-native-async-storage/async-storage';

let firestore = null;
try {
  const { getFirestore, doc, setDoc, getDoc } = require('firebase/firestore');
  const { getApps } = require('firebase/app');
  const app = getApps()[0];
  if (app) firestore = { db: getFirestore(app), doc, setDoc, getDoc };
} catch (e) {}

const SYNC_KEYS = [
  '@gitasaar_streak',
  '@gitasaar_progress',
  '@gitasaar_read_dates',
  '@gitasaar_bookmarks_v2',
  '@gitasaar_bm_folders',
  '@gitasaar_journal',
  '@gitasaar_moods',
  '@gitasaar_chat_history',
  '@gitasaar_premium',
  '@gitasaar_daily_usage',
  '@gitasaar_med_sessions',
  '@gitasaar_reading_goal',
  '@gitasaar_reminders',
  '@gitasaar_setup_done',
  '@gitasaar_onboarded',
  'profileData',
];

// Event Emitter Contexts ko update karne ke liye
const syncListeners = new Set();
export const onSyncComplete = (callback) => {
  syncListeners.add(callback);
  return () => syncListeners.delete(callback);
};
const notifySync = () => syncListeners.forEach(cb => cb());

let currentUid = null;

// ============ BACKUP TO FIRESTORE ============
export async function backupToCloud(uid) {
  if (!firestore || !uid) return false;
  try {
    const data = {};
    for (const key of SYNC_KEYS) {
      const value = await AsyncStorage.getItem(key);
      if (value !== null) data[key] = value;
    }
    data._lastSync = new Date().toISOString();
    data._version = 1;

    const ref = firestore.doc(firestore.db, 'userData', uid);
    await firestore.setDoc(ref, data, { merge: true });
    return true;
  } catch (e) {
    return false;
  }
}

// ============ RESTORE FROM FIRESTORE ============
export async function restoreFromCloud(uid) {
  currentUid = uid;
  if (!firestore || !uid) { notifySync(); return false; }
  try {
    const ref = firestore.doc(firestore.db, 'userData', uid);
    const snap = await firestore.getDoc(ref);
    
    if (snap.exists()) {
      const data = snap.data();
      for (const key of SYNC_KEYS) {
        if (data[key] !== undefined && data[key] !== null) {
          await AsyncStorage.setItem(key, data[key]);
        }
      }
    }
    notifySync(); // Data restore hone ke baad app ko update karo
    return true;
  } catch (e) {
    notifySync();
    return false;
  }
}

// ============ CLEAR LOCAL DATA ============
export async function clearLocalData() {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const userKeys = keys.filter(k =>
      k.startsWith('@gitasaar_') ||
      k === 'profileData' ||
      k === 'chatHistory'
    );
    if (userKeys.length > 0) await AsyncStorage.multiRemove(userKeys);
    notifySync(); // Clear hone ke baad screens update karo
    return true;
  } catch (e) { return false; }
}

// ============ AUTO SYNC ============
let lastSyncTime = 0;
const SYNC_INTERVAL = 5 * 1000; // 5 Seconds cooldown

export async function autoSync(uid) {
  if (!uid) return;
  const now = Date.now();
  if (now - lastSyncTime < SYNC_INTERVAL) return;
  lastSyncTime = now;
  await backupToCloud(uid);
}

// ============ ON LOGOUT FLOW ============
export async function onUserLogout() {
  if (currentUid) {
    await backupToCloud(currentUid); // Logout se pehle last data save karo
  }
  await clearLocalData();
  currentUid = null;
}