// src/theme/ReadingGoalContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ReadingGoalContext = createContext();
const GOAL_KEY = '@gitasaar_reading_goal';

export function ReadingGoalProvider({ children }) {
  const [goal, setGoal] = useState({ dailyTarget: 5, todayRead: 0, lastDate: '', totalDays: 0, longestStreak: 0 });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const data = await AsyncStorage.getItem(GOAL_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        const today = new Date().toDateString();
        // Reset todayRead if new day
        if (parsed.lastDate !== today) {
          // Check if yesterday was completed
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          if (parsed.lastDate === yesterday.toDateString() && parsed.todayRead >= parsed.dailyTarget) {
            parsed.totalDays = (parsed.totalDays || 0) + 1;
          }
          parsed.todayRead = 0;
          parsed.lastDate = today;
        }
        setGoal(parsed);
      }
    } catch (e) {}
    setLoaded(true);
  };

  const save = async (updated) => {
    try { await AsyncStorage.setItem(GOAL_KEY, JSON.stringify(updated)); } catch (e) {}
  };

  const setDailyTarget = (target) => {
    const updated = { ...goal, dailyTarget: target };
    setGoal(updated);
    save(updated);
  };

  const incrementRead = () => {
    const today = new Date().toDateString();
    const updated = {
      ...goal,
      todayRead: goal.todayRead + 1,
      lastDate: today,
    };
    // Check if goal just completed
    if (updated.todayRead >= updated.dailyTarget && goal.todayRead < goal.dailyTarget) {
      updated.totalDays = (updated.totalDays || 0) + 1;
    }
    setGoal(updated);
    save(updated);
  };

  const progress = goal.dailyTarget > 0 ? Math.min(goal.todayRead / goal.dailyTarget, 1) : 0;
  const isGoalMet = goal.todayRead >= goal.dailyTarget;

  return (
    <ReadingGoalContext.Provider value={{ goal, setDailyTarget, incrementRead, progress, isGoalMet, loaded }}>
      {children}
    </ReadingGoalContext.Provider>
  );
}

export function useReadingGoal() {
  return useContext(ReadingGoalContext);
}