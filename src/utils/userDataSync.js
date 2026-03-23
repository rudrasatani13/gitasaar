// src/utils/userDataSync.js
// Syncs all local data to Firestore per-user (UID based)
import AsyncStorage from '@react-native-async-storage/async-storage';

let firestore = null;
try {
  const { getFirestore, doc, setDoc, getDoc } = require('firebase/firestore');
  const { getApps } = require('firebase/app');
  const app = getApps()[0];
  if (app) firestore = { db: getFirestore(app), doc, setDoc, getDoc };
} catch (e) {}

// All keys to sync
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
    console.log('Backup done:', Object.keys(data).length, 'keys');
    return true;
  } catch (e) {
    console.log('Backup error:', e.message);
    return false;
  }
}

// ============ RESTORE FROM FIRESTORE ============
export async function restoreFromCloud(uid) {
  if (!firestore || !uid) return false;
  try {
    const ref = firestore.doc(firestore.db, 'userData', uid);
    const snap = await firestore.getDoc(ref);
    
    if (!snap.exists()) {
      console.log('No cloud data found for user');
      return false;
    }

    const data = snap.data();
    let restored = 0;

    for (const key of SYNC_KEYS) {
      if (data[key] !== undefined && data[key] !== null) {
        await AsyncStorage.setItem(key, data[key]);
        restored++;
      }
    }

    console.log('Restored:', restored, 'keys from cloud');
    return true;
  } catch (e) {
    console.log('Restore error:', e.message);
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
    return true;
  } catch (e) { return false; }
}

// ============ AUTO SYNC ============
// Call this periodically or on important actions
let lastSyncTime = 0;
const SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutes

export async function autoSync(uid) {
  if (!uid) return;
  const now = Date.now();
  if (now - lastSyncTime < SYNC_INTERVAL) return; // Too soon
  lastSyncTime = now;
  await backupToCloud(uid);
}

// ============ ON LOGIN FLOW ============
export async function onUserLogin(uid, isNewUser) {
  if (isNewUser) {
    // New user - start fresh, no restore needed
    await clearLocalData();
    return 'fresh';
  } else {
    // Returning user - try restore from cloud
    const restored = await restoreFromCloud(uid);
    return restored ? 'restored' : 'fresh';
  }
}

// ============ ON LOGOUT FLOW ============
export async function onUserLogout(uid) {
  // Backup current data before clearing
  if (uid) await backupToCloud(uid);
  await clearLocalData();
}