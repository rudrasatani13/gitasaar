// src/theme/PremiumContext.js
// Premium status is read exclusively from Firestore (written only by Cloud Functions).
// AsyncStorage is used for daily usage counters AND offline premium cache fallback.

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../utils/firebase';
import { onSyncComplete } from '../utils/userDataSync';

const PremiumContext = createContext();
const USAGE_KEY = '@gitasaar_daily_usage';
const PREMIUM_CACHE_KEY = '@gitasaar_premium_cache'; // Offline fallback cache

const FREE_LIMITS = {
  chatMessages:     5,
  audioRecitations: 3,
  quizPlays:        1,
  exportJournal:    true,
  bookmarkFolders:  4,
  adFree:           false,
};

const FREE_TEMPLATES = ['saffron', 'cosmos'];

export function PremiumProvider({ children }) {
  const [isPremium,  setIsPremium]  = useState(false);
  const [planType,   setPlanType]   = useState(null);
  const [expiryDate, setExpiryDate] = useState(null);
  const [usage,      setUsage]      = useState({ chatMessages: 0, audioRecitations: 0, quizPlays: 0, date: '' });
  const [loaded,     setLoaded]     = useState(false);

  const unsubFirestoreRef = useRef(null);

  const getTodayDate = () => new Date().toISOString().slice(0, 10);

  // ─── Load cached premium status for offline support ────────────────────────
  const loadCachedPremium = async () => {
    try {
      const cached = await AsyncStorage.getItem(PREMIUM_CACHE_KEY);
      if (cached) {
        const data = JSON.parse(cached);
        // Check if cached premium is still valid (not expired)
        if (data.isPremium && data.expiryDate && new Date(data.expiryDate) > new Date()) {
          setIsPremium(true);
          setPlanType(data.planType);
          setExpiryDate(data.expiryDate);
          return true;
        }
      }
    } catch (e) {
      console.log('Error loading cached premium:', e);
    }
    return false;
  };

  // ─── Save premium status to cache for offline fallback ─────────────────────
  const cachePremiumStatus = async (isActive, plan, expiry) => {
    try {
      const cacheData = {
        isPremium: isActive,
        planType: plan,
        expiryDate: expiry,
        cachedAt: new Date().toISOString(),
      };
      await AsyncStorage.setItem(PREMIUM_CACHE_KEY, JSON.stringify(cacheData));
    } catch (e) {
      console.log('Error caching premium status:', e);
    }
  };

  // ─── Daily usage — AsyncStorage only (not security-sensitive) ─────────────
  const loadUsage = async () => {
    try {
      const raw   = await AsyncStorage.getItem(USAGE_KEY);
      const today = getTodayDate();
      if (raw) {
        const u = JSON.parse(raw);
        if (u.date === today) {
          const clamp = (v, max) => Math.min(Math.max(Number.isInteger(v) ? v : 0, 0), max);
          setUsage({
            chatMessages:     clamp(u.chatMessages,     FREE_LIMITS.chatMessages),
            audioRecitations: clamp(u.audioRecitations, FREE_LIMITS.audioRecitations),
            quizPlays:        clamp(u.quizPlays,        FREE_LIMITS.quizPlays),
            date: today,
          });
          return;
        }
      }
      const fresh = { chatMessages: 0, audioRecitations: 0, quizPlays: 0, date: today };
      setUsage(fresh);
      await AsyncStorage.setItem(USAGE_KEY, JSON.stringify(fresh));
    } catch (e) {
      console.error('PremiumContext loadUsage error:', e);
    }
  };

  const saveUsage = async (updated) => {
    try {
      await AsyncStorage.setItem(USAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('PremiumContext saveUsage error:', e);
    }
  };

  // ─── Firestore real-time listener — single source of truth for premium ────
  const subscribeToFirestore = (uid) => {
    if (unsubFirestoreRef.current) {
      unsubFirestoreRef.current();
      unsubFirestoreRef.current = null;
    }

    if (!uid) {
      setIsPremium(false);
      setPlanType(null);
      setExpiryDate(null);
      setLoaded(true);
      return;
    }

    // First, load cached premium for immediate offline access
    loadCachedPremium().then((hadCache) => {
      if (hadCache) {
        console.log('[Premium] Loaded from cache for offline support');
      }
    });

    unsubFirestoreRef.current = onSnapshot(
      doc(db, 'users', uid),
      (snapshot) => {
        if (snapshot.exists()) {
          const data     = snapshot.data();
          const isActive = data.isPremium === true &&
                           data.expiryDate &&
                           new Date(data.expiryDate) > new Date();
          setIsPremium(isActive);
          setPlanType(isActive ? data.planType  : null);
          setExpiryDate(isActive ? data.expiryDate : null);
          
          // Cache the premium status for offline fallback
          cachePremiumStatus(isActive, data.planType, data.expiryDate);
        } else {
          setIsPremium(false);
          setPlanType(null);
          setExpiryDate(null);
          // Clear cache when user has no premium
          cachePremiumStatus(false, null, null);
        }
        setLoaded(true);
      },
      (error) => {
        // On Firestore error (offline/network), fall back to cached premium
        console.error('Firestore premium listener error:', error);
        console.log('[Premium] Falling back to cached status due to network error');
        loadCachedPremium().then((hadCache) => {
          if (!hadCache) {
            // No cache available - default to non-premium
            setIsPremium(false);
          }
          setLoaded(true);
        });
      }
    );
  };

  useEffect(() => {
    loadUsage();

    // Re-read usage from AsyncStorage after cloud restore completes (fixes race condition)
    const unsubSync = onSyncComplete(() => loadUsage());

    const unsubAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        subscribeToFirestore(user.uid);
        loadUsage();
      } else {
        subscribeToFirestore(null);
        const fresh = { chatMessages: 0, audioRecitations: 0, quizPlays: 0, date: getTodayDate() };
        setUsage(fresh);
      }
    });

    return () => {
      unsubSync();
      unsubAuth();
      if (unsubFirestoreRef.current) unsubFirestoreRef.current();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Feature checkers ─────────────────────────────────────────────────────

  const useChatMessage = () => {
    if (isPremium) return true;
    if (usage.chatMessages >= FREE_LIMITS.chatMessages) return false;
    const updated = { ...usage, chatMessages: usage.chatMessages + 1, date: getTodayDate() };
    setUsage(updated);
    saveUsage(updated);
    return true;
  };

  const useAudioPlay = () => {
    if (isPremium) return true;
    if (usage.audioRecitations >= FREE_LIMITS.audioRecitations) return false;
    const updated = { ...usage, audioRecitations: usage.audioRecitations + 1, date: getTodayDate() };
    setUsage(updated);
    saveUsage(updated);
    return true;
  };

  const useQuizPlay = () => {
    if (isPremium) return true;
    if (usage.quizPlays >= FREE_LIMITS.quizPlays) return false;
    const updated = { ...usage, quizPlays: usage.quizPlays + 1, date: getTodayDate() };
    setUsage(updated);
    saveUsage(updated);
    return true;
  };

  const refundChatMessage = () => {
    if (isPremium) return;
    const updated = { ...usage, chatMessages: Math.max(0, usage.chatMessages - 1) };
    setUsage(updated);
    AsyncStorage.setItem(USAGE_KEY, JSON.stringify(updated)).catch(() => {});
  };

  const isTemplateAvailable = (templateId) => isPremium || FREE_TEMPLATES.includes(templateId);
  const canAddFolder         = (count)       => isPremium || count < FREE_LIMITS.bookmarkFolders;

  const canExportJournal = isPremium || FREE_LIMITS.exportJournal;
  const isAdFree         = isPremium || FREE_LIMITS.adFree;

  const chatRemaining  = isPremium ? 'Unlimited' : Math.max(0, FREE_LIMITS.chatMessages     - usage.chatMessages);
  const audioRemaining = isPremium ? 'Unlimited' : Math.max(0, FREE_LIMITS.audioRecitations - usage.audioRecitations);
  const quizRemaining  = isPremium ? 'Unlimited' : Math.max(0, FREE_LIMITS.quizPlays        - usage.quizPlays);

  const cancelPremium = () => {
    // Razorpay/Stripe subscriptions must be cancelled via the payment gateway dashboard.
    // This only clears local state — Firestore will restore it on next launch.
    // Show info instead of silently resetting.
    Alert.alert(
      'Cancel Subscription',
      'To cancel your subscription, please visit Razorpay/Play Store subscription settings, or contact support at support@gitasaar.app.\n\nYour premium access will continue until the current period ends.',
      [{ text: 'OK' }]
    );
  };

  return (
    <PremiumContext.Provider value={{
      isPremium, planType, expiryDate, usage, loaded,
      FREE_LIMITS, FREE_TEMPLATES,
      useChatMessage, useAudioPlay, useQuizPlay, refundChatMessage,
      isTemplateAvailable, canAddFolder,
      canExportJournal, isAdFree,
      chatRemaining, audioRemaining, quizRemaining,
      cancelPremium,
    }}>
      {children}
    </PremiumContext.Provider>
  );
}

export function usePremium() {
  return useContext(PremiumContext);
}
