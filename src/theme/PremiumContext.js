// src/theme/PremiumContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../utils/firebase';
import { onSyncComplete, autoSync } from '../utils/userDataSync';

const PremiumContext = createContext();
const PREMIUM_KEY = '@gitasaar_premium';
const USAGE_KEY = '@gitasaar_daily_usage';

// 🛑 NAYI SMART FREE TIER LIMITS 🛑
const FREE_LIMITS = {
  chatMessages: 5,        // Din mein 5 baar AI se baat
  audioRecitations: 3,    // Din mein 3 shloka audio sunna
  quizPlays: 1,           // Din mein 1 quiz
  exportJournal: true,    // Sabke liye free (Trust building)
  bookmarkFolders: 4,     // 4 default folders free
  adFree: false,          // Free users ko aage chal ke ads dikhayenge
};

const FREE_TEMPLATES = ['saffron', 'minimal'];

export function PremiumProvider({ children }) {
  const [isPremium, setIsPremium] = useState(false);
  const [planType, setPlanType] = useState(null); // 'monthly' | 'yearly'
  const [expiryDate, setExpiryDate] = useState(null);
  const [usage, setUsage] = useState({ chatMessages: 0, audioRecitations: 0, quizPlays: 0, date: '' });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    load();

    // Jab doosre device se cloud data aaye, toh limits update karo
    const unsubSync = onSyncComplete(() => {
      load();
    });

    // Logout par state clear karo (Taaki doosre user ka data mix na ho)
    const unsubAuth = auth.onAuthStateChanged((user) => {
      if (!user) {
        setIsPremium(false);
        setPlanType(null);
        setExpiryDate(null);
        setUsage({ chatMessages: 0, audioRecitations: 0, quizPlays: 0, date: '' });
      }
    });

    return () => { unsubSync(); unsubAuth(); };
  }, []);

  const getTodayDate = () => new Date().toDateString(); // Gives "Mon Mar 24 2026"

  const load = async () => {
    try {
      const [premData, usageData] = await Promise.all([
        AsyncStorage.getItem(PREMIUM_KEY),
        AsyncStorage.getItem(USAGE_KEY),
      ]);

      // 1. Check Premium Status
      if (premData) {
        const p = JSON.parse(premData);
        if (p.expiryDate && new Date(p.expiryDate) > new Date()) {
          setIsPremium(true);
          setPlanType(p.planType);
          setExpiryDate(p.expiryDate);
        } else {
          setIsPremium(false);
          await AsyncStorage.removeItem(PREMIUM_KEY);
        }
      } else {
        setIsPremium(false);
      }

      // 2. Check Daily Usage
      const today = getTodayDate();
      if (usageData) {
        const u = JSON.parse(usageData);
        if (u.date === today) {
          // Same day - keep usage (Purana data rakhlo)
          // Ensure audioRecitations exists for older users upgrading to this version
          setUsage({
            chatMessages: u.chatMessages || 0,
            audioRecitations: u.audioRecitations || 0,
            quizPlays: u.quizPlays || 0,
            date: u.date
          });
        } else {
          // New day (Raat ke 12 baj gaye) - Reset kar do sab 0 pe
          const fresh = { chatMessages: 0, audioRecitations: 0, quizPlays: 0, date: today };
          setUsage(fresh);
          await AsyncStorage.setItem(USAGE_KEY, JSON.stringify(fresh));
        }
      } else {
        // Pheli baar app kholi hai
        const fresh = { chatMessages: 0, audioRecitations: 0, quizPlays: 0, date: today };
        setUsage(fresh);
        await AsyncStorage.setItem(USAGE_KEY, JSON.stringify(fresh));
      }
    } catch (e) {}
    setLoaded(true);
  };

  const saveUsage = async (updated) => {
    try { 
      await AsyncStorage.setItem(USAGE_KEY, JSON.stringify(updated)); 
      // Auto-Sync to Firebase (5 sec debounce ke sath taaki crash na ho)
      if (auth.currentUser) autoSync(auth.currentUser.uid); 
    } catch (e) {}
  };

  // ==========================================
  // --- FEATURE CHECKERS (Use these in app) ---
  // ==========================================

  // 1. Chat Messages (Runs when user clicks SEND)
  const useChatMessage = () => {
    if (isPremium) return true;
    if (usage.chatMessages >= FREE_LIMITS.chatMessages) return false;
    
    const updated = { ...usage, chatMessages: usage.chatMessages + 1, date: getTodayDate() };
    setUsage(updated);
    saveUsage(updated);
    return true;
  };

  // 2. Audio Recitation (Runs when user clicks PLAY)
  const useAudioPlay = () => {
    if (isPremium) return true;
    if (usage.audioRecitations >= FREE_LIMITS.audioRecitations) return false;
    
    const updated = { ...usage, audioRecitations: usage.audioRecitations + 1, date: getTodayDate() };
    setUsage(updated);
    saveUsage(updated);
    return true;
  };

  // 3. Quiz Plays (Runs when user clicks START QUIZ)
  const useQuizPlay = () => {
    if (isPremium) return true;
    if (usage.quizPlays >= FREE_LIMITS.quizPlays) return false;
    
    const updated = { ...usage, quizPlays: usage.quizPlays + 1, date: getTodayDate() };
    setUsage(updated);
    saveUsage(updated);
    return true;
  };

  // 4. Share Templates
  const isTemplateAvailable = (templateId) => {
    if (isPremium) return true;
    return FREE_TEMPLATES.includes(templateId);
  };

  // 5. Bookmark Folders
  const canAddFolder = (currentFolderCount) => {
    if (isPremium) return true;
    return currentFolderCount < FREE_LIMITS.bookmarkFolders;
  };

  // Static Feature access flags (Direct checks for UI rendering)
  const canExportJournal = isPremium || FREE_LIMITS.exportJournal;
  const isAdFree = isPremium || FREE_LIMITS.adFree;

  // Remaining counters for UI (Kitne bache hain dikhane ke liye)
  const chatRemaining = isPremium ? 'Unlimited' : Math.max(0, FREE_LIMITS.chatMessages - usage.chatMessages);
  const audioRemaining = isPremium ? 'Unlimited' : Math.max(0, FREE_LIMITS.audioRecitations - usage.audioRecitations);
  const quizRemaining = isPremium ? 'Unlimited' : Math.max(0, FREE_LIMITS.quizPlays - usage.quizPlays);

  // ==========================================
  // --- SUBSCRIPTION MANAGEMENT ---
  // ==========================================

  const activatePremium = async (plan) => {
    const expiry = new Date();
    if (plan === 'monthly') expiry.setMonth(expiry.getMonth() + 1);
    else if (plan === 'yearly') expiry.setFullYear(expiry.getFullYear() + 1);

    const premData = { isPremium: true, planType: plan, expiryDate: expiry.toISOString() };
    setIsPremium(true);
    setPlanType(plan);
    setExpiryDate(expiry.toISOString());
    
    await AsyncStorage.setItem(PREMIUM_KEY, JSON.stringify(premData));
    if (auth.currentUser) autoSync(auth.currentUser.uid); // Turant cloud sync
  };

  const cancelPremium = async () => {
    setIsPremium(false);
    setPlanType(null);
    setExpiryDate(null);
    await AsyncStorage.removeItem(PREMIUM_KEY);
    if (auth.currentUser) autoSync(auth.currentUser.uid);
  };

  return (
    <PremiumContext.Provider value={{
      isPremium, planType, expiryDate, usage, loaded,
      FREE_LIMITS, FREE_TEMPLATES,
      useChatMessage, useAudioPlay, useQuizPlay, isTemplateAvailable, canAddFolder,
      canExportJournal, isAdFree,
      chatRemaining, audioRemaining, quizRemaining,
      activatePremium, cancelPremium,
    }}>
      {children}
    </PremiumContext.Provider>
  );
}

export function usePremium() {
  return useContext(PremiumContext);
}