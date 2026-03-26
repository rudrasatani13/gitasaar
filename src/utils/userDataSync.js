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
const CORE_KEYS = [
  '@gitasaar_streak',
  '@gitasaar_progress',
  '@gitasaar_read_dates',
  '@gitasaar_bm_folders',
  '@gitasaar_moods',
  '@gitasaar_premium',
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
    // A. Pehle Core Data save karo
    const coreData = { _lastSync: new Date().toISOString(), _version: 2 };
    for (const key of CORE_KEYS) {
      const value = await AsyncStorage.getItem(key);
      if (value !== null) coreData[key] = value;
    }
    const coreRef = firestore.doc(firestore.db, 'userData', uid);
    await firestore.setDoc(coreRef, coreData, { merge: true });

    // B. Ab Heavy Data ko alag alag documents (sub-collections) mein save karo
    for (const key of HEAVY_KEYS) {
      const value = await AsyncStorage.getItem(key);
      if (value !== null) {
        // Path banega: userData/{uid}/heavyData/{key_name}
        const heavyRef = firestore.doc(firestore.db, 'userData', uid, 'heavyData', key);
        await firestore.setDoc(heavyRef, { data: value, updatedAt: new Date().toISOString() }, { merge: true });
      }
    }
    return true;
  } catch (e) {
    console.log('Backup error:', e.message);
    return false;
  }
}

// ============ RESTORE FROM FIRESTORE ============
export async function restoreFromCloud(uid) {
  currentUid = uid;
  if (!firestore || !uid) { notifySync(); return false; }
  try {
    // A. Core Data Restore karo
    const coreRef = firestore.doc(firestore.db, 'userData', uid);
    const coreSnap = await firestore.getDoc(coreRef);
    
    if (coreSnap.exists()) {
      const data = coreSnap.data();
      for (const key of CORE_KEYS) {
        if (data[key] !== undefined && data[key] !== null) {
          await AsyncStorage.setItem(key, data[key]);
        }
      }
    }

    // B. Heavy Data Restore karo
    for (const key of HEAVY_KEYS) {
      const heavyRef = firestore.doc(firestore.db, 'userData', uid, 'heavyData', key);
      const heavySnap = await firestore.getDoc(heavyRef);
      if (heavySnap.exists()) {
        const heavyData = heavySnap.data();
        if (heavyData.data) {
          await AsyncStorage.setItem(key, heavyData.data);
        }
      }
    }

    notifySync(); // Data restore hone ke baad app ko update karo
    return true;
  } catch (e) {
    console.log('Restore error:', e.message);
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
  const uidToBackup = currentUid;
  currentUid = null;
  await clearLocalData(); // Clear immediately — don't block logout on cloud backup
  if (uidToBackup) {
    backupToCloud(uidToBackup).catch(() => {}); // Backup in background (issue 4)
  }
}