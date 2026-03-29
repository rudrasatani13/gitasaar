// src/theme/MeditationContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MeditationContext = createContext();

// Meditation Library - Guided Sessions
export const MEDITATION_LIBRARY = {
  beginner: [
    { id: 'breath_5', title: 'Mindful Breathing', duration: 5, isPremium: false, category: 'Breathing', description: 'Simple breath awareness for beginners', narrator: 'AI Guide', voice: 'calm' },
    { id: 'body_scan_10', title: 'Body Scan Relaxation', duration: 10, isPremium: true, category: 'Relaxation', description: 'Guided body awareness meditation', narrator: 'AI Guide', voice: 'soothing' },
    { id: 'gratitude_5', title: 'Gratitude Practice', duration: 5, isPremium: false, category: 'Gratitude', description: 'Cultivate thankfulness and joy', narrator: 'AI Guide', voice: 'warm' },
  ],
  intermediate: [
    { id: 'loving_kindness_15', title: 'Loving-Kindness (Metta)', duration: 15, isPremium: true, category: 'Heart', description: 'Develop compassion for self and others', narrator: 'AI Guide', voice: 'gentle' },
    { id: 'chakra_20', title: 'Chakra Balancing', duration: 20, isPremium: true, category: 'Energy', description: 'Align and energize your chakras', narrator: 'AI Guide', voice: 'mystical' },
    { id: 'mindfulness_15', title: 'Present Moment Awareness', duration: 15, isPremium: true, category: 'Mindfulness', description: 'Anchor yourself in the now', narrator: 'AI Guide', voice: 'clear' },
    { id: 'stress_relief_12', title: 'Stress Release', duration: 12, isPremium: true, category: 'Stress', description: 'Let go of tension and worry', narrator: 'AI Guide', voice: 'soothing' },
  ],
  advanced: [
    { id: 'vipassana_30', title: 'Vipassana Insight', duration: 30, isPremium: true, category: 'Insight', description: 'Deep insight meditation practice', narrator: 'AI Guide', voice: 'profound' },
    { id: 'yoga_nidra_45', title: 'Yoga Nidra (Yogic Sleep)', duration: 45, isPremium: true, category: 'Deep Rest', description: 'Systematic relaxation and rejuvenation', narrator: 'AI Guide', voice: 'hypnotic' },
    { id: 'om_meditation_20', title: 'Om Chanting Meditation', duration: 20, isPremium: true, category: 'Mantra', description: 'Sacred sound meditation', narrator: 'AI Guide', voice: 'resonant' },
    { id: 'silent_sitting_60', title: 'Silent Sitting', duration: 60, isPremium: true, category: 'Silence', description: 'Extended silent meditation', narrator: 'Timer Only', voice: 'none' },
  ],
  sleep: [
    { id: 'sleep_rain_20', title: 'Sleep with Rain Sounds', duration: 20, isPremium: true, category: 'Sleep', description: 'Drift off with gentle rain', narrator: 'Nature Sounds', voice: 'ambient' },
    { id: 'sleep_story_30', title: 'Spiritual Sleep Story', duration: 30, isPremium: true, category: 'Sleep', description: 'Krishna\'s garden visualization', narrator: 'AI Guide', voice: 'whisper' },
    { id: 'sleep_yoga_nidra_25', title: 'Sleep Yoga Nidra', duration: 25, isPremium: true, category: 'Sleep', description: 'Fall asleep deeply', narrator: 'AI Guide', voice: 'soft' },
  ],
  focus: [
    { id: 'focus_pomodoro_25', title: 'Focus Session (25 min)', duration: 25, isPremium: true, category: 'Focus', description: 'Pomodoro-style focus meditation', narrator: 'AI Guide', voice: 'focused' },
    { id: 'concentration_15', title: 'Concentration Builder', duration: 15, isPremium: true, category: 'Focus', description: 'Strengthen your attention', narrator: 'AI Guide', voice: 'clear' },
    { id: 'work_break_7', title: 'Quick Work Break', duration: 7, isPremium: false, category: 'Break', description: 'Refresh during busy day', narrator: 'AI Guide', voice: 'energizing' },
  ],
};

// Breathing Exercises (Pranayama)
export const PRANAYAMA_EXERCISES = [
  { id: 'box_breathing', name: 'Box Breathing', duration: 5, isPremium: false, description: 'Equal inhale, hold, exhale, hold (4-4-4-4)', pattern: [4, 4, 4, 4], benefit: 'Calm mind, reduce stress' },
  { id: 'anulom_vilom', name: 'Anulom Vilom', duration: 10, isPremium: true, description: 'Alternate nostril breathing', pattern: 'alternate', benefit: 'Balance energy, mental clarity' },
  { id: 'bhastrika', name: 'Bhastrika (Bellows Breath)', duration: 5, isPremium: true, description: 'Rapid forceful breathing', pattern: 'rapid', benefit: 'Energize body, boost metabolism' },
  { id: 'ujjayi', name: 'Ujjayi (Ocean Breath)', duration: 8, isPremium: true, description: 'Oceanic throat breathing', pattern: [5, 0, 7, 0], benefit: 'Focus, calming, warming' },
  { id: '478_breathing', name: '4-7-8 Breathing', duration: 10, isPremium: false, description: 'Inhale 4, hold 7, exhale 8', pattern: [4, 7, 8, 0], benefit: 'Fall asleep faster, anxiety relief' },
  { id: 'kapalabhati', name: 'Kapalabhati (Skull Shining)', duration: 5, isPremium: true, description: 'Forceful exhalations', pattern: 'skull_shining', benefit: 'Detox, clear mind, energize' },
];

export function MeditationProvider({ children }) {
  const [sessions, setSessions] = useState([]);
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [favoritesMed, setFavoritesMed] = useState([]);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const stored = await AsyncStorage.getItem('@meditation_sessions');
      if (stored) {
        const data = JSON.parse(stored);
        setSessions(data.sessions || []);
        setTotalMinutes(data.totalMinutes || 0);
        setFavoritesMed(data.favorites || []);
      }
    } catch (e) {
      console.log('Error loading meditation sessions:', e);
    }
  };

  const saveSessions = async (newSessions, minutes, favs) => {
    try {
      await AsyncStorage.setItem('@meditation_sessions', JSON.stringify({
        sessions: newSessions,
        totalMinutes: minutes,
        favorites: favs,
      }));
    } catch (e) {
      console.log('Error saving meditation sessions:', e);
    }
  };

  const addSession = async (meditationId, duration, type = 'guided') => {
    const newSession = {
      id: Date.now().toString(),
      meditationId,
      type,
      duration,
      completedAt: new Date().toISOString(),
    };
    const updatedSessions = [newSession, ...sessions];
    const updatedMinutes = totalMinutes + duration;
    setSessions(updatedSessions);
    setTotalMinutes(updatedMinutes);
    await saveSessions(updatedSessions, updatedMinutes, favoritesMed);
    return newSession;
  };

  const toggleFavorite = async (meditationId) => {
    const updated = favoritesMed.includes(meditationId)
      ? favoritesMed.filter(id => id !== meditationId)
      : [...favoritesMed, meditationId];
    setFavoritesMed(updated);
    await saveSessions(sessions, totalMinutes, updated);
  };

  const getRecentSessions = (count = 5) => {
    return sessions.slice(0, count);
  };

  const value = {
    sessions,
    totalMinutes,
    favoritesMed,
    sessionCount: sessions.length,
    addSession,
    toggleFavorite,
    getRecentSessions,
  };

  return <MeditationContext.Provider value={value}>{children}</MeditationContext.Provider>;
}

export function useMeditation() {
  return useContext(MeditationContext);
}
