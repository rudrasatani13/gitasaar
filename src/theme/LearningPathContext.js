// src/theme/LearningPathContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LearningPathContext = createContext();

// Personalized Learning Paths based on life challenges
export const LEARNING_PATHS = {
  stress_anxiety: {
    id: 'stress_anxiety',
    name: 'Overcoming Stress & Anxiety',
    description: 'Find peace in challenging times through Gita wisdom',
    icon: 'head-heart-outline',
    color: '#14918E',
    duration: '14 days',
    verses: [
      { chapter: 2, verse: 47 }, // Karma Yoga - Do your duty
      { chapter: 2, verse: 48 }, // Equanimity
      { chapter: 6, verse: 35 }, // Controlling the mind
      { chapter: 12, verse: 13 }, // Freedom from anxiety
      { chapter: 18, verse: 66 }, // Surrender and let go
    ],
    practices: ['Daily meditation 10 mins', 'Breathing exercises', 'Evening gratitude journal'],
  },
  purpose_meaning: {
    id: 'purpose_meaning',
    name: 'Finding Life Purpose',
    description: 'Discover your dharma and life\'s meaning',
    icon: 'compass',
    color: '#C28840',
    duration: '21 days',
    verses: [
      { chapter: 3, verse: 35 }, // Own dharma
      { chapter: 18, verse: 45 }, // Perfection through duty
      { chapter: 2, verse: 31 }, // Doing your duty
      { chapter: 4, verse: 18 }, // Action in inaction
    ],
    practices: ['Self-reflection journaling', 'Ask Krishna guidance', 'Weekly life review'],
  },
  relationships: {
    id: 'relationships',
    name: 'Healthy Relationships',
    description: 'Love, compassion, and letting go',
    icon: 'heart-multiple',
    color: '#C95A6A',
    duration: '14 days',
    verses: [
      { chapter: 12, verse: 13 }, // Non-hatred
      { chapter: 16, verse: 1 }, // Divine qualities
      { chapter: 13, verse: 10 }, // Detachment from family
      { chapter: 9, verse: 27 }, // Offering everything
    ],
    practices: ['Loving-kindness meditation', 'Forgiveness practice', 'Gratitude for loved ones'],
  },
  career_success: {
    id: 'career_success',
    name: 'Career & Success',
    description: 'Excel in your work without attachment',
    icon: 'briefcase-outline',
    color: '#D4962A',
    duration: '21 days',
    verses: [
      { chapter: 2, verse: 47 }, // Focus on action not result
      { chapter: 18, verse: 45 }, // Perfection in own work
      { chapter: 3, verse: 8 }, // Perform prescribed duties
      { chapter: 5, verse: 10 }, // Work without attachment
    ],
    practices: ['Morning affirmations', 'Focus meditation', 'End-of-day reflection'],
  },
  self_growth: {
    id: 'self_growth',
    name: 'Personal Growth & Discipline',
    description: 'Build habits and strengthen willpower',
    icon: 'arm-flex-outline',
    color: '#7B1830',
    duration: '30 days',
    verses: [
      { chapter: 6, verse: 5 }, // Elevate yourself
      { chapter: 16, verse: 1 }, // Divine qualities
      { chapter: 17, verse: 14 }, // Austerity of body
      { chapter: 6, verse: 35 }, // Mastering the mind
    ],
    practices: ['Daily discipline tracking', 'Cold showers', 'Early morning routine'],
  },
  spiritual_journey: {
    id: 'spiritual_journey',
    name: 'Deep Spiritual Journey',
    description: 'For seekers wanting complete immersion',
    icon: 'brightness-7',
    color: '#E0A850',
    duration: '108 days',
    verses: [
      { chapter: 9, verse: 22 }, // Divine protection
      { chapter: 7, verse: 14 }, // Crossing maya
      { chapter: 18, verse: 65 }, // Think of me always
      { chapter: 10, verse: 8 }, // I am the source
      { chapter: 11, verse: 54 }, // Devotion leads to me
    ],
    practices: ['108 Om chanting', 'Gita reading daily', 'Temple/altar time', 'Meditation 30 mins'],
  },
};

// Verse Explanations - Scholarly commentary (Premium feature)
export const VERSE_EXPLANATIONS_SAMPLE = {
  '2_47': {
    chapter: 2,
    verse: 47,
    commentary: {
      swami_prabhupada: 'You have a right to perform your prescribed duties, but you are not entitled to the fruits of your actions. Never consider yourself to be the cause of the results of your activities, nor be attached to inaction.',
      modern_interpretation: 'This verse teaches the fundamental principle of Karma Yoga: focus on the quality of your work and effort, not the outcome. In modern terms, this means doing your best at your job/tasks without being obsessed with promotions, recognition, or results. Your duty is to give 100% - the results are not in your control.',
      practical_application: '1. At work: Focus on excellence, not accolades\n2. In relationships: Give love freely without expecting return\n3. In learning: Study to gain knowledge, not just for grades\n4. In fitness: Work out for health, not just appearance',
      related_concepts: ['Detachment', 'Present moment focus', 'Reducing anxiety', 'Flow state'],
    },
  },
  '18_66': {
    chapter: 18,
    verse: 66,
    commentary: {
      swami_prabhupada: 'Abandon all varieties of dharmas and simply surrender unto Me alone. I shall liberate you from all sinful reactions; do not fear.',
      modern_interpretation: 'The ultimate teaching of the Gita: complete surrender to the divine. When overwhelmed by life\'s complexity, simply trust the universe/God. Let go of control and fear. This is not passive - it\'s active faith.',
      practical_application: '1. In crisis: After doing your best, surrender the outcome\n2. In grief: Trust the bigger picture you can\'t see\n3. In worry: Replace "what if" with "even if"\n4. Daily: Morning prayer of surrender',
      related_concepts: ['Faith', 'Trust', 'Letting go', 'Divine grace', 'Bhakti'],
    },
  },
};

export function LearningPathProvider({ children }) {
  const [currentPath, setCurrentPath] = useState(null);
  const [pathProgress, setPathProgress] = useState({});
  const [completedPaths, setCompletedPaths] = useState([]);

  useEffect(() => {
    loadPathData().catch(e => console.log('Learning path load error:', e));
  }, []);

  const loadPathData = async () => {
    try {
      const stored = await AsyncStorage.getItem('@learning_path');
      if (stored) {
        const data = JSON.parse(stored);
        setCurrentPath(data.currentPath || null);
        setPathProgress(data.progress || {});
        setCompletedPaths(data.completed || []);
      }
    } catch (e) {
      console.log('Error loading learning path:', e);
    }
  };

  const savePathData = async (path, progress, completed) => {
    try {
      await AsyncStorage.setItem('@learning_path', JSON.stringify({
        currentPath: path,
        progress,
        completed,
      }));
    } catch (e) {
      console.log('Error saving learning path:', e);
    }
  };

  const startPath = async (pathId) => {
    const path = LEARNING_PATHS[pathId];
    if (!path) return;

    const initialProgress = {
      pathId,
      startedAt: new Date().toISOString(),
      currentDay: 1,
      versesCompleted: [],
      practicesCompleted: [],
    };

    setCurrentPath(pathId);
    setPathProgress({ ...pathProgress, [pathId]: initialProgress });
    await savePathData(pathId, { ...pathProgress, [pathId]: initialProgress }, completedPaths);
  };

  const markVerseComplete = async (pathId, verseRef) => {
    const progress = pathProgress[pathId];
    if (!progress) return;

    const updated = {
      ...progress,
      versesCompleted: [...progress.versesCompleted, verseRef],
    };

    setPathProgress({ ...pathProgress, [pathId]: updated });
    await savePathData(currentPath, { ...pathProgress, [pathId]: updated }, completedPaths);
  };

  const completePath = async (pathId) => {
    const updated = [...completedPaths, pathId];
    setCompletedPaths(updated);
    setCurrentPath(null);
    await savePathData(null, pathProgress, updated);
  };

  const value = {
    currentPath,
    pathProgress,
    completedPaths,
    startPath,
    markVerseComplete,
    completePath,
  };

  return <LearningPathContext.Provider value={value}>{children}</LearningPathContext.Provider>;
}

export function useLearningPath() {
  return useContext(LearningPathContext);
}
