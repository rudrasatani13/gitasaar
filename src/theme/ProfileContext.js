// src/theme/ProfileContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { auth } from '../utils/firebase';

const ProfileContext = createContext();
const PROFILE_KEY = '@gitasaar_profile';
const PHOTO_KEY = '@gitasaar_photo';

// Firestore instance
let db = null;
try { db = getFirestore(); } catch (e) { console.log('Firestore init error:', e); }

export function ProfileProvider({ children }) {
  const [profile, setProfile] = useState({ name: '', photo: null, language: 'english' });
  const [photoBase64, setPhotoBase64] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => { loadProfile(); }, []);

  const getUid = () => auth.currentUser?.uid || null;

  // Load from Firestore first, then AsyncStorage fallback
  const loadProfile = async () => {
    try {
      let p = { name: '', photo: null, language: 'english' };

      // Try Firestore first (cross-device sync)
      const uid = getUid();
      if (uid && db) {
        try {
          const snap = await getDoc(doc(db, 'users', uid));
          if (snap.exists()) {
            const fireData = snap.data();
            p = { ...p, ...fireData };
            // Save to local AsyncStorage too
            await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(p));
          }
        } catch (e) {
          console.log('Firestore load error:', e);
        }
      }

      // Fallback to AsyncStorage
      if (!p.name) {
        const localData = await AsyncStorage.getItem(PROFILE_KEY);
        if (localData) {
          const localParsed = JSON.parse(localData);
          p = { ...p, ...localParsed };
        }
      }

      // Load photo from local storage (photos stay device-specific, too large for Firestore)
      const photoData = await AsyncStorage.getItem(PHOTO_KEY);
      if (photoData) setPhotoBase64(photoData);

      setProfile(p);
    } catch (e) {
      console.log('Profile load error:', e);
    }
    setLoaded(true);
  };

  // Convert image URI to base64 (device-local only)
  const uriToBase64 = async (uri) => {
    try {
      if (Platform.OS === 'web') {
        const response = await fetch(uri);
        const blob = await response.blob();
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });
      }
      try {
        const FileSystem = require('expo-file-system');
        const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
        return 'data:image/jpeg;base64,' + base64;
      } catch (e) {
        const response = await fetch(uri);
        const blob = await response.blob();
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });
      }
    } catch (e) { return null; }
  };

  const updateProfile = async (updates) => {
    let finalUpdates = { ...updates };

    // Handle photo (device-local only, not synced to Firestore)
    if (updates.photo !== undefined) {
      if (updates.photo === null) {
        setPhotoBase64(null);
        try { await AsyncStorage.removeItem(PHOTO_KEY); } catch (e) {}
        finalUpdates.photo = null;
      } else if (updates.photo.startsWith('avatar_')) {
        setPhotoBase64(null);
        try { await AsyncStorage.removeItem(PHOTO_KEY); } catch (e) {}
        finalUpdates.photo = updates.photo;
      } else if (updates.photo.startsWith('data:image')) {
        setPhotoBase64(updates.photo);
        try { await AsyncStorage.setItem(PHOTO_KEY, updates.photo); } catch (e) {}
        finalUpdates.photo = 'base64_saved';
      } else {
        const base64 = await uriToBase64(updates.photo);
        if (base64) {
          setPhotoBase64(base64);
          try { await AsyncStorage.setItem(PHOTO_KEY, base64); } catch (e) {}
          finalUpdates.photo = 'base64_saved';
        }
      }
    }

    const updated = { ...profile, ...finalUpdates };
    setProfile(updated);

    // Save to AsyncStorage
    try { await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(updated)); } catch (e) {}

    // Sync to Firestore (name, language, birthdate, referral - NOT photo)
    const uid = getUid();
    if (uid && db) {
      try {
        const syncData = {
          name: updated.name || '',
          language: updated.language || 'english',
          birthdate: updated.birthdate || '',
          referral: updated.referral || '',
          setupComplete: updated.setupComplete || false,
          updatedAt: new Date().toISOString(),
        };
        await setDoc(doc(db, 'users', uid), syncData, { merge: true });
      } catch (e) {
        console.log('Firestore sync error:', e);
      }
    }
  };

  const displayName = profile.name || null;

  const getPhotoSource = () => {
    if (photoBase64) return photoBase64;
    if (profile.photo && profile.photo.startsWith('avatar_')) return profile.photo;
    return null;
  };

  const profilePhoto = getPhotoSource();

  return (
    <ProfileContext.Provider value={{ profile, displayName, profilePhoto, updateProfile, loaded }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  return useContext(ProfileContext);
}