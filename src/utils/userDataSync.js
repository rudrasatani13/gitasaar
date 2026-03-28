// src/utils/userDataSync.js
import AsyncStorage from '@react-native-async-storage/async-storage';

let firestore = null;
try {
  const { getFirestore, doc, setDoc, getDoc } = require('firebase/firestore');
  const { getApps } = require('firebase/app');
  const app = getApps()[0];
  if (app) firestore = { db: getFirestore(app), doc, setDoc, getDoc };
} catch (e) {}

// 1. CORE KEYS (Chhota data jo jaldi load hona chahiye)
// NOTE: @gitasaar_premium is intentionally excluded — premium status is read exclusively
// from Firestore users/{uid} via Cloud Functions, not from client-side sync.
const CORE_KEYS = [
  '@gitasaar_streak',
  '@gitasaar_progress',
  '@gitasaar_read_dates',
  '@gitasaar_bm_folders',
  '@gitasaar_moods',
  '@gitasaar_daily_usage',
  '@gitasaar_med_sessions',
  '@gitasaar_reading_goal',
  '@gitasaar_reminders',
  '@gitasaar_setup_done',
  '@gitasaar_onboarded',
  'profileData',
];

// 2. HEAVY KEYS (Bada data jisko alag files mein save karenge)
const HEAVY_KEYS = [
  '@gitasaar_journal',
  '@gitasaar_bookmarks_v2',
  '@gitasaar_chat_history'
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
    const syncTs = new Date().toISOString();

    // A. Pehle Core Data save karo
    const coreData = { _lastSync: syncTs, _version: 2 };
    const backedUpKeys = [];
    for (const key of CORE_KEYS) {
      const value = await AsyncStorage.getItem(key);
      if (value !== null) { coreData[key] = value; backedUpKeys.push(key); }
    }
    const coreRef = firestore.doc(firestore.db, 'userData', uid);
    await firestore.setDoc(coreRef, coreData, { merge: true });

    // Write local sync markers so mergeIfNewer won't overwrite newer local data on next restore
    await AsyncStorage.multiSet(backedUpKeys.map(k => [k + '_syncTs', syncTs]));

    // B. Ab Heavy Data ko alag alag documents (sub-collections) mein save karo
    for (const key of HEAVY_KEYS) {
      const value = await AsyncStorage.getItem(key);
      if (value !== null) {
        // Path banega: userData/{uid}/heavyData/{key_name}
        const heavyRef = firestore.doc(firestore.db, 'userData', uid, 'heavyData', key);
        await firestore.setDoc(heavyRef, { data: value, updatedAt: syncTs }, { merge: true });
        await AsyncStorage.setItem(key + '_syncTs', syncTs);
      }
    }
    return true;
  } catch (e) {
    console.log('Backup error:', e.message);
    return false;
  }
}

// ============ RESTORE FROM FIRESTORE ============
// Helper: only overwrite local data if cloud version is newer
async function mergeIfNewer(key, cloudValue, cloudTimestamp) {
  if (cloudValue === undefined || cloudValue === null) return;

  // Daily usage: never let cloud overwrite today's local usage — prevents limit exploit on re-login
  if (key === '@gitasaar_daily_usage') {
    try {
      const localRaw = await AsyncStorage.getItem(key);
      if (localRaw) {
        const localData = JSON.parse(localRaw);
        const today = new Date().toISOString().slice(0, 10);
        if (localData.date === today) return;
      }
    } catch {}
  }

  try {
    const localRaw = await AsyncStorage.getItem(key);
    if (!localRaw) {
      // No local data — accept cloud
      await AsyncStorage.setItem(key, cloudValue);
      return;
    }
    // Try to compare timestamps embedded in JSON data
    try {
      const localData = JSON.parse(localRaw);
      const cloudData = JSON.parse(cloudValue);
      const localTime = localData._lastModified || localData.updatedAt || 0;
      const cloudTime = cloudData._lastModified || cloudData.updatedAt || cloudTimestamp || 0;
      if (new Date(cloudTime) > new Date(localTime)) {
        await AsyncStorage.setItem(key, cloudValue);
      }
      // else: local is newer or same, keep local
    } catch {
      // Not JSON or no timestamps — use cloud timestamp vs local sync marker
      if (cloudTimestamp) {
        const localSyncMarker = await AsyncStorage.getItem(key + '_syncTs');
        if (!localSyncMarker || new Date(cloudTimestamp) > new Date(localSyncMarker)) {
          await AsyncStorage.setItem(key, cloudValue);
        }
      } else {
        // No timestamp info — fallback to cloud (first-time sync)
        await AsyncStorage.setItem(key, cloudValue);
      }
    }
  } catch {
    // On any error, accept cloud data as fallback
    await AsyncStorage.setItem(key, cloudValue);
  }
}

export async function restoreFromCloud(uid) {
  currentUid = uid;
  if (!firestore || !uid) { notifySync(); return false; }
  try {
    // A. Core Data Restore karo
    const coreRef = firestore.doc(firestore.db, 'userData', uid);
    const coreSnap = await firestore.getDoc(coreRef);

    if (coreSnap.exists()) {
      const data = coreSnap.data();
      const cloudSyncTime = data._lastSync || null;
      for (const key of CORE_KEYS) {
        await mergeIfNewer(key, data[key], cloudSyncTime);
      }
    }

    // B. Heavy Data Restore karo
    for (const key of HEAVY_KEYS) {
      const heavyRef = firestore.doc(firestore.db, 'userData', uid, 'heavyData', key);
      const heavySnap = await firestore.getDoc(heavyRef);
      if (heavySnap.exists()) {
        const heavyData = heavySnap.data();
        if (heavyData.data) {
          await mergeIfNewer(key, heavyData.data, heavyData.updatedAt);
        }
      }
    }

    // Sync setupComplete from users/{uid} → @gitasaar_setup_done (single source of truth)
    const userRef = firestore.doc(firestore.db, 'users', uid);
    const userSnap = await firestore.getDoc(userRef);
    if (userSnap.exists() && userSnap.data().setupComplete === true) {
      await AsyncStorage.setItem('@gitasaar_setup_done', 'true');
    }

    notifySync(); // Data restore hone ke baad app ko update karo
    return true;
  } catch (e) {
    console.error('Restore error:', e.message);
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
  } catch (e) {
    console.error('clearLocalData error:', e);
    return false;
  }
}

// ============ AUTO SYNC ============
let lastSyncTime = 0;
const SYNC_INTERVAL = 60 * 1000; // 60 Seconds cooldown

export async function autoSync(uid) {
  if (!uid) return;
  const now = Date.now();
  if (now - lastSyncTime < SYNC_INTERVAL) return;
  lastSyncTime = now;
  await backupToCloud(uid);
}

// ============ ON LOGOUT FLOW ============
export async function onUserLogout() {
  const uidToBackup = currentUid;
  currentUid = null;
  await clearLocalData(); // Clear immediately — don't block logout on cloud backup
  if (uidToBackup) {
    backupToCloud(uidToBackup).catch(() => {}); // Backup in background (issue 4)
  }
}