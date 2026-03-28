// src/theme/ProfileContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { auth } from '../utils/firebase';
import { onSyncComplete } from '../utils/userDataSync';

const ProfileContext = createContext();
const PROFILE_KEY = '@gitasaar_profile';
const PHOTO_KEY = '@gitasaar_photo';

let db = null;
try { db = getFirestore(); } catch (e) { }

export function ProfileProvider({ children }) {
  const [profile, setProfile] = useState({ name: '', photo: null, language: 'english' });
  const [localPhotoUri, setLocalPhotoUri] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => { 
    loadProfile(); 
    
    const unsubSync = onSyncComplete(() => {
      loadProfile();
    });

    const unsubAuth = auth.onAuthStateChanged((user) => {
      console.log('[AUTH DEBUG] ProfileContext onAuthStateChanged — uid:', user?.uid ?? 'null');
      if (!user) {
        setProfile({ name: '', photo: null, language: 'english' });
        setLocalPhotoUri(null);
      }
    });

    return () => { unsubSync(); unsubAuth(); };
  }, []);

  const getUid = () => auth.currentUser?.uid || null;

  const loadProfile = async () => {
    try {
      let p = { name: '', photo: null, language: 'english' };
      const uid = getUid();

      // 1. FAST LOAD: Pehle local storage se load karo taaki user wait na kare
      const localData = await AsyncStorage.getItem(PROFILE_KEY);
      if (localData) p = { ...p, ...JSON.parse(localData) };
      
      const photoData = await AsyncStorage.getItem(PHOTO_KEY);
      if (photoData) setLocalPhotoUri(photoData);

      // 2. CLOUD SYNC: Firestore se naya data laao (Cross-Device Login Fix)
      if (uid && db) {
        try {
          const snap = await getDoc(doc(db, 'users', uid));
          if (snap.exists()) {
            const fireData = snap.data();
            p = { ...p, ...fireData };
            await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(p));

            // Agar cloud pe internet wala URL hai, toh usko local mein save kar lo
            if (fireData.photo && fireData.photo.startsWith('http')) {
               setLocalPhotoUri(fireData.photo);
               await AsyncStorage.setItem(PHOTO_KEY, fireData.photo);
            } else if (fireData.photo && fireData.photo.startsWith('avatar_')) {
               setLocalPhotoUri(null);
               await AsyncStorage.removeItem(PHOTO_KEY);
            }
          }
        } catch (e) {}
      }

      setProfile(p);
    } catch (e) {}
    setLoaded(true);
  };

  const updateProfile = async (updates) => {
    let finalUpdates = { ...updates };
    const uid = getUid();

    if (updates.photo !== undefined) {
      if (updates.photo === null || updates.photo === '__remove__') {
        // Photo Remove karni hai
        setLocalPhotoUri(null);
        try { await AsyncStorage.removeItem(PHOTO_KEY); } catch (e) {}
        finalUpdates.photo = null;

        // Firebase Storage se bhi delete kardo memory bachane ke liye
        if (uid) {
           try {
              const storage = getStorage(auth.app);
              const fileRef = ref(storage, `profile_pictures/${uid}`);
              await deleteObject(fileRef);
           } catch(e) {}
        }
      } else if (updates.photo.startsWith('avatar_')) {
        // Avatar select kiya hai
        setLocalPhotoUri(null);
        try { await AsyncStorage.removeItem(PHOTO_KEY); } catch (e) {}
        finalUpdates.photo = updates.photo;
      } else if (updates.photo.startsWith('http')) {
        // Pehle se hi web URL hai (No upload needed)
        setLocalPhotoUri(updates.photo);
        try { await AsyncStorage.setItem(PHOTO_KEY, updates.photo); } catch (e) {}
        finalUpdates.photo = updates.photo;
      } else {
        // ACTUAL FIX: Gallery se nayi photo aayi hai -> Firebase Storage pe upload karo!
        if (uid) {
           try {
             // A. Image ko 'Blob' mein convert karo (React Native method)
             const blob = await new Promise((resolve, reject) => {
               const xhr = new XMLHttpRequest();
               xhr.onload = function() { resolve(xhr.response); };
               xhr.onerror = function(e) { reject(new TypeError('Network request failed')); };
               xhr.responseType = 'blob';
               xhr.open('GET', updates.photo, true);
               xhr.send(null);
             });

             // B. Firebase Storage pe upload karo
             const storage = getStorage(auth.app);
             const fileRef = ref(storage, `profile_pictures/${uid}`);
             await uploadBytes(fileRef, blob);
             blob.close && blob.close(); // RAM clear karo

             // C. Download URL nikal lo
             const downloadUrl = await getDownloadURL(fileRef);

             // D. URL ko app mein save kar do
             setLocalPhotoUri(downloadUrl);
             try { await AsyncStorage.setItem(PHOTO_KEY, downloadUrl); } catch (e) {}
             finalUpdates.photo = downloadUrl;
             
           } catch (err) {
             console.log("Firebase Upload Error:", err);
             // Agar upload fail ho jaye (no internet), toh offline fallback de do
             setLocalPhotoUri(updates.photo);
             try { await AsyncStorage.setItem(PHOTO_KEY, updates.photo); } catch (e) {}
             finalUpdates.photo = updates.photo;
           }
        }
      }
    }

    const updated = { ...profile, ...finalUpdates };
    setProfile(updated);

    try { await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(updated)); } catch (e) {}

    // Firestore Document update karo (Isme ab humesha URL jayega, lamba base64 nahi)
    if (uid && db) {
      try {
        const syncData = {
          name: updated.name || '',
          photo: updated.photo || null,
          language: updated.language || 'english',
          birthdate: updated.birthdate || '',
          referral: updated.referral || '',
          setupComplete: updated.setupComplete || false,
          updatedAt: new Date().toISOString(),
        };
        await setDoc(doc(db, 'users', uid), syncData, { merge: true });
      } catch (e) {}
    }
  };

  const displayName = profile.name || null;

  const getPhotoSource = () => {
    if (localPhotoUri) return localPhotoUri;
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