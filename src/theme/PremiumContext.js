// src/theme/PremiumContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { secureSet, secureGet } from '../utils/security';

const PremiumContext = createContext();
const PREMIUM_KEY = '@gitasaar_premium';
const USAGE_KEY = '@gitasaar_daily_usage';

// Free tier limits
const FREE_LIMITS = {
  chatMessages: 10,    // per day
  quizPlays: 1,         // per day
  shareTemplates: 2,    // saffron + minimal only
  bookmarkFolders: 1,   // only favorites
  audioRecitation: false,
  exportJournal: false,
  adFree: false,
};

const FREE_TEMPLATES = ['saffron', 'minimal'];

export function PremiumProvider({ children }) {
  const [isPremium, setIsPremium] = useState(false);
  const [planType, setPlanType] = useState(null); // 'monthly' | 'yearly'
  const [expiryDate, setExpiryDate] = useState(null);
  const [usage, setUsage] = useState({ chatMessages: 0, quizPlays: 0, date: '' });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const [premData, usageData] = await Promise.all([
        AsyncStorage.getItem(PREMIUM_KEY),
        AsyncStorage.getItem(USAGE_KEY),
      ]);

      if (premData) {
        const p = JSON.parse(premData);
        // Check if subscription expired
        if (p.expiryDate && new Date(p.expiryDate) > new Date()) {
          setIsPremium(true);
          setPlanType(p.planType);
          setExpiryDate(p.expiryDate);
        } else {
          setIsPremium(false);
          await AsyncStorage.removeItem(PREMIUM_KEY);
        }
      }

      if (usageData) {
        const u = JSON.parse(usageData);
        const today = new Date().toDateString();
        if (u.date === today) {
          // Same day - keep usage
          setUsage(u);
        } else {
          // New day - reset usage
          const fresh = { chatMessages: 0, quizPlays: 0, date: today };
          setUsage(fresh);
          await AsyncStorage.setItem(USAGE_KEY, JSON.stringify(fresh));
        }
      } else {
        const fresh = { chatMessages: 0, quizPlays: 0, date: new Date().toDateString() };
        setUsage(fresh);
      }
    } catch (e) {}
    setLoaded(true);
  };

  const saveUsage = async (updated) => {
    try { await AsyncStorage.setItem(USAGE_KEY, JSON.stringify(updated)); } catch (e) {}
  };

  // Track chat message usage
  const useChatMessage = () => {
    if (isPremium) return true;
    if (usage.chatMessages >= FREE_LIMITS.chatMessages) return false;
    const updated = { ...usage, chatMessages: usage.chatMessages + 1, date: new Date().toDateString() };
    setUsage(updated);
    saveUsage(updated);
    return true;
  };

  // Track quiz play usage
  const useQuizPlay = () => {
    if (isPremium) return true;
    if (usage.quizPlays >= FREE_LIMITS.quizPlays) return false;
    const updated = { ...usage, quizPlays: usage.quizPlays + 1, date: new Date().toDateString() };
    setUsage(updated);
    saveUsage(updated);
    return true;
  };

  // Check if template is available
  const isTemplateAvailable = (templateId) => {
    if (isPremium) return true;
    return FREE_TEMPLATES.includes(templateId);
  };

  // Check feature access
  const canUseAudio = isPremium;
  const canExportJournal = isPremium;
  const canUseAllFolders = isPremium;
  const isAdFree = isPremium;

  const chatRemaining = isPremium ? 999 : Math.max(0, FREE_LIMITS.chatMessages - usage.chatMessages);
  const quizRemaining = isPremium ? 999 : Math.max(0, FREE_LIMITS.quizPlays - usage.quizPlays);

  // Activate premium (called after successful payment)
  const activatePremium = async (plan) => {
    const expiry = new Date();
    if (plan === 'monthly') expiry.setMonth(expiry.getMonth() + 1);
    else if (plan === 'yearly') expiry.setFullYear(expiry.getFullYear() + 1);

    const premData = { isPremium: true, planType: plan, expiryDate: expiry.toISOString() };
    setIsPremium(true);
    setPlanType(plan);
    setExpiryDate(expiry.toISOString());
    await AsyncStorage.setItem(PREMIUM_KEY, JSON.stringify(premData));
    await secureSet('premium_backup', JSON.stringify(premData));
  };

  // Cancel premium
  const cancelPremium = async () => {
    setIsPremium(false);
    setPlanType(null);
    setExpiryDate(null);
    await AsyncStorage.removeItem(PREMIUM_KEY);
  };

  return (
    <PremiumContext.Provider value={{
      isPremium, planType, expiryDate, usage, loaded,
      FREE_LIMITS, FREE_TEMPLATES,
      useChatMessage, useQuizPlay, isTemplateAvailable,
      canUseAudio, canExportJournal, canUseAllFolders, isAdFree,
      chatRemaining, quizRemaining,
      activatePremium, cancelPremium,
    }}>
      {children}
    </PremiumContext.Provider>
  );
}

export function usePremium() {
  return useContext(PremiumContext);
}