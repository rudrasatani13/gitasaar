// src/theme/TrackerContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TrackerContext = createContext();

const STREAK_KEY = '@gitasaar_streak';
const PROGRESS_KEY = '@gitasaar_progress';

function getToday() {
  return new Date().toISOString().split('T')[0]; // "2026-03-21"
}

function getYesterday() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

export function TrackerProvider({ children }) {
  const [streak, setStreak] = useState({ count: 0, lastDate: '', bestStreak: 0 });
  const [readDates, setReadDates] = useState([]);
  const [readVerses, setReadVerses] = useState({}); // { "2_47": true, "3_35": true }
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const streakData = await AsyncStorage.getItem(STREAK_KEY);
      const progressData = await AsyncStorage.getItem(PROGRESS_KEY);

      let s = streakData ? JSON.parse(streakData) : { count: 0, lastDate: '', bestStreak: 0 };
      const p = progressData ? JSON.parse(progressData) : {};

      // Update streak on app open
      const today = getToday();
      const yesterday = getYesterday();

      if (s.lastDate === today) {
        // Already opened today, no change
      } else if (s.lastDate === yesterday) {
        // Consecutive day! Increase streak
        s.count += 1;
        s.lastDate = today;
        if (s.count > s.bestStreak) s.bestStreak = s.count;
        await AsyncStorage.setItem(STREAK_KEY, JSON.stringify(s));
      } else {
        // Streak broken or first time
        s.count = 1;
        s.lastDate = today;
        if (s.count > s.bestStreak) s.bestStreak = s.count;
        await AsyncStorage.setItem(STREAK_KEY, JSON.stringify(s));
      }

      setStreak(s);
      setReadVerses(p);
    } catch (e) {
      console.log('Tracker load error:', e);
    }
    const datesData = await AsyncStorage.getItem('@gitasaar_read_dates');
      if (datesData) setReadDates(JSON.parse(datesData));
      setLoaded(true);
  };

  // Mark a verse as read
  const markVerseRead = async (chapter, verse) => {
    const key = chapter + '_' + verse;
    if (readVerses[key]) return; // Already read

    const updated = { ...readVerses, [key]: true };
    setReadVerses(updated);
    try {
      await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(updated));
      // Track read dates for calendar
      const today = new Date().toISOString().split('T')[0];
      const datesData = await AsyncStorage.getItem('@gitasaar_read_dates');
      let dates = datesData ? JSON.parse(datesData) : [];
      if (!dates.includes(today)) {
        dates = [today, ...dates].slice(0, 365);
        await AsyncStorage.setItem('@gitasaar_read_dates', JSON.stringify(dates));
        setReadDates(dates);
      }
    } catch (e) {}
  };

  // Check if verse is read
  const isVerseRead = (chapter, verse) => {
    return !!readVerses[chapter + '_' + verse];
  };

  // Get chapter progress
  const getChapterProgress = (chapterNum, totalVerses) => {
    let count = 0;
    Object.keys(readVerses).forEach((key) => {
      if (key.startsWith(chapterNum + '_')) count++;
    });
    return { read: count, total: totalVerses, percent: totalVerses > 0 ? Math.round((count / totalVerses) * 100) : 0 };
  };

  // Total stats
  const totalRead = Object.keys(readVerses).length;
  const totalPercent = Math.round((totalRead / 700) * 100);

  // Get streak week (last 7 days with activity)
  const getStreakWeek = () => {
    const days = [];
    const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0=Sun
    // Start from Sunday of current week
    const sunday = new Date(today);
    sunday.setDate(today.getDate() - dayOfWeek);
    for (let i = 0; i < 7; i++) {
      const d = new Date(sunday);
      d.setDate(sunday.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const isActive = readDates.includes(dateStr) || dateStr === streak.lastDate;
      days.push({
        label: dayNames[i],
        date: dateStr,
        active: isActive,
        isToday: dateStr === today.toISOString().split('T')[0],
      });
    }
    return days;
  };

  return (
    <TrackerContext.Provider value={{
      streak, totalRead, totalPercent, readVerses, readDates,
      markVerseRead, isVerseRead, getChapterProgress, getStreakWeek, loaded,
    }}>
      {children}
    </TrackerContext.Provider>
  );
}

export function useTracker() {
  return useContext(TrackerContext);
}