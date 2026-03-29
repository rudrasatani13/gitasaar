// src/theme/BadgeContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BadgeContext = createContext();

// Badge & Milestone Definitions
export const BADGES = {
  // Reading Milestones
  first_verse: { id: 'first_verse', name: 'First Steps', icon: 'leaf', description: 'Read your first verse', color: '#2E7D50', requirement: 1 },
  verse_10: { id: 'verse_10', name: 'Explorer', icon: 'compass', description: 'Read 10 verses', color: '#14918E', requirement: 10 },
  verse_50: { id: 'verse_50', name: 'Seeker', icon: 'book-open-variant', description: 'Read 50 verses', color: '#E8793A', requirement: 50 },
  verse_100: { id: 'verse_100', name: 'Scholar', icon: 'school', description: 'Read 100 verses', color: '#C28840', requirement: 100 },
  verse_250: { id: 'verse_250', name: 'Devoted Reader', icon: 'book-multiple', description: 'Read 250 verses', color: '#A02530', requirement: 250 },
  verse_500: { id: 'verse_500', name: 'Master', icon: 'trophy', description: 'Read 500 verses', color: '#D4AF37', requirement: 500 },
  verse_700: { id: 'verse_700', name: 'Enlightened', icon: 'brightness-7', description: 'Read all 700 verses!', color: '#F5C842', requirement: 700 },
  
  // Chapter Completions
  chapter_1: { id: 'chapter_1', name: 'First Chapter', icon: 'numeric-1-circle', description: 'Completed Chapter 1', color: '#0E6B6B', requirement: 'chapter_1' },
  chapter_5: { id: 'chapter_5', name: 'Karma Yogi', icon: 'meditation', description: 'Completed 5 chapters', color: '#D4962A', requirement: 'chapters_5' },
  chapter_10: { id: 'chapter_10', name: 'Halfway Hero', icon: 'star-half-full', description: 'Completed 10 chapters', color: '#E8793A', requirement: 'chapters_10' },
  all_chapters: { id: 'all_chapters', name: 'Complete Journey', icon: 'star-circle', description: 'Completed all 18 chapters', color: '#F5C842', requirement: 'chapters_18' },
  
  // Streak Badges
  streak_7: { id: 'streak_7', name: 'Week Warrior', icon: 'fire', description: '7-day reading streak', color: '#E8793A', requirement: 'streak_7' },
  streak_30: { id: 'streak_30', name: 'Month Master', icon: 'fire', description: '30-day reading streak', color: '#D63B2F', requirement: 'streak_30' },
  streak_100: { id: 'streak_100', name: 'Unstoppable', icon: 'fire', description: '100-day reading streak', color: '#A02530', requirement: 'streak_100' },
  
  // Engagement Badges
  chat_10: { id: 'chat_10', name: 'Curious Mind', icon: 'chat', description: '10 AI conversations', color: '#1565C0', requirement: 'chats_10' },
  journal_7: { id: 'journal_7', name: 'Reflective Soul', icon: 'notebook', description: '7 journal entries', color: '#7B1830', requirement: 'journals_7' },
  meditation_5: { id: 'meditation_5', name: 'Inner Peace', icon: 'meditation', description: '5 meditation sessions', color: '#14918E', requirement: 'meditations_5' },
  quiz_10: { id: 'quiz_10', name: 'Knowledge Seeker', icon: 'head-lightbulb', description: 'Completed 10 quizzes', color: '#D4962A', requirement: 'quiz_10' },
};

export const MILESTONES = [
  { verses: 50, title: 'Getting Started', reward: 'Unlocked: Progress Statistics' },
  { verses: 100, title: 'Building Foundation', reward: 'Unlocked: Advanced Analytics' },
  { verses: 250, title: 'Deep Dive', reward: 'Unlocked: Verse Explanations' },
  { verses: 500, title: 'Nearly There', reward: 'Unlocked: Premium Share Cards' },
  { verses: 700, title: 'Complete Mastery', reward: 'Unlocked: Enlightened Certificate' },
];

export function BadgeProvider({ children }) {
  const [unlockedBadges, setUnlockedBadges] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [newBadges, setNewBadges] = useState([]); // For showing notifications

  useEffect(() => {
    loadBadges().catch(e => console.log('Badge load error:', e));
  }, []);

  const loadBadges = async () => {
    try {
      const stored = await AsyncStorage.getItem('@badges');
      if (stored) {
        const data = JSON.parse(stored);
        setUnlockedBadges(data.unlocked || []);
        setMilestones(data.milestones || []);
      }
    } catch (e) {
      console.log('Error loading badges:', e);
    }
  };

  const saveBadges = async (badges, miles) => {
    try {
      await AsyncStorage.setItem('@badges', JSON.stringify({ unlocked: badges, milestones: miles }));
    } catch (e) {
      console.log('Error saving badges:', e);
    }
  };

  const checkAndUnlockBadges = async (stats) => {
    const { versesRead = 0, chaptersCompleted = 0, streakCount = 0, chatCount = 0, journalCount = 0, meditationCount = 0, quizCount = 0 } = stats;
    const newlyUnlocked = [];

    // Check each badge
    Object.values(BADGES).forEach(badge => {
      if (unlockedBadges.includes(badge.id)) return; // Already unlocked

      let shouldUnlock = false;

      if (typeof badge.requirement === 'number') {
        // Verse count badges
        shouldUnlock = versesRead >= badge.requirement;
      } else if (badge.requirement.startsWith('chapter_')) {
        const reqNum = parseInt(badge.requirement.split('_')[1]);
        shouldUnlock = chaptersCompleted >= reqNum;
      } else if (badge.requirement.startsWith('chapters_')) {
        const reqNum = parseInt(badge.requirement.split('_')[1]);
        shouldUnlock = chaptersCompleted >= reqNum;
      } else if (badge.requirement.startsWith('streak_')) {
        const reqNum = parseInt(badge.requirement.split('_')[1]);
        shouldUnlock = streakCount >= reqNum;
      } else if (badge.requirement.startsWith('chats_')) {
        const reqNum = parseInt(badge.requirement.split('_')[1]);
        shouldUnlock = chatCount >= reqNum;
      } else if (badge.requirement.startsWith('journals_')) {
        const reqNum = parseInt(badge.requirement.split('_')[1]);
        shouldUnlock = journalCount >= reqNum;
      } else if (badge.requirement.startsWith('meditations_')) {
        const reqNum = parseInt(badge.requirement.split('_')[1]);
        shouldUnlock = meditationCount >= reqNum;
      } else if (badge.requirement.startsWith('quiz_')) {
        const reqNum = parseInt(badge.requirement.split('_')[1]);
        shouldUnlock = quizCount >= reqNum;
      }

      if (shouldUnlock) {
        newlyUnlocked.push(badge.id);
      }
    });

    // Check milestones
    const newMilestones = [];
    MILESTONES.forEach(m => {
      if (!milestones.includes(m.verses) && versesRead >= m.verses) {
        newMilestones.push(m.verses);
      }
    });

    if (newlyUnlocked.length > 0 || newMilestones.length > 0) {
      const updatedBadges = [...unlockedBadges, ...newlyUnlocked];
      const updatedMilestones = [...milestones, ...newMilestones];
      setUnlockedBadges(updatedBadges);
      setMilestones(updatedMilestones);
      setNewBadges(newlyUnlocked);
      await saveBadges(updatedBadges, updatedMilestones);
      
      return { badges: newlyUnlocked, milestones: newMilestones };
    }

    return { badges: [], milestones: [] };
  };

  const clearNewBadges = () => setNewBadges([]);

  const value = {
    unlockedBadges,
    milestones,
    newBadges,
    checkAndUnlockBadges,
    clearNewBadges,
    badgeCount: unlockedBadges.length,
    totalBadges: Object.keys(BADGES).length,
  };

  return <BadgeContext.Provider value={value}>{children}</BadgeContext.Provider>;
}

export function useBadges() {
  return useContext(BadgeContext);
}
