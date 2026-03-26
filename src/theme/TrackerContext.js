// src/theme/TrackerContext.js
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../utils/firebase';
import { autoSync, onSyncComplete } from '../utils/userDataSync';

const TrackerContext = createContext();

const STREAK_KEY = '@gitasaar_streak';
const PROGRESS_KEY = '@gitasaar_progress';

function getToday() { return new Date().toISOString().split('T')[0]; }
function getYesterday() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

export function TrackerProvider({ children }) {
  const [streak, setStreak] = useState({ count: 0, lastDate: '', bestStreak: 0 });
  const [readDates, setReadDates] = useState([]);
  const [readVerses, setReadVerses] = useState({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadData();

    const unsubSync = onSyncComplete(() => {
      loadData();
    });

    const unsubAuth = auth.onAuthStateChanged((user) => {
      if (!user) {
        setStreak({ count: 0, lastDate: '', bestStreak: 0 });
        setReadDates([]);
        setReadVerses({});
      }
    });

    return () => { unsubSync(); unsubAuth(); };
  }, []);

  const loadData = async () => {
    try {
      const streakData = await AsyncStorage.getItem(STREAK_KEY);
      const progressData = await AsyncStorage.getItem(PROGRESS_KEY);

      let s = streakData ? JSON.parse(streakData) : { count: 0, lastDate: '', bestStreak: 0 };
      const p = progressData ? JSON.parse(progressData) : {};

      const today = getToday();
      const yesterday = getYesterday();

      if (s.lastDate === today) {
        // already opened today
      } else if (s.lastDate === yesterday) {
        s.count += 1;
        s.lastDate = today;
        if (s.count > s.bestStreak) s.bestStreak = s.count;
        await AsyncStorage.setItem(STREAK_KEY, JSON.stringify(s));
      } else {
        s.count = 1;
        s.lastDate = today;
        if (s.count > s.bestStreak) s.bestStreak = s.count;
        await AsyncStorage.setItem(STREAK_KEY, JSON.stringify(s));
      }

      setStreak(s);
      setReadVerses(p);
    } catch (e) { }

    try {
      const datesData = await AsyncStorage.getItem('@gitasaar_read_dates');
      if (datesData) setReadDates(JSON.parse(datesData));
      else setReadDates([]);
    } catch (e) {}

    setLoaded(true);
  };

  const markVerseRead = async (chapter, verse) => {
    const key = chapter + '_' + verse;
    if (readVerses[key]) return;

    const updated = { ...readVerses, [key]: true };
    setReadVerses(updated);
    try {
      await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(updated));
      const today = new Date().toISOString().split('T')[0];
      const datesData = await AsyncStorage.getItem('@gitasaar_read_dates');
      let dates = datesData ? JSON.parse(datesData) : [];
      if (!dates.includes(today)) {
        dates = [today, ...dates].slice(0, 365);
        await AsyncStorage.setItem('@gitasaar_read_dates', JSON.stringify(dates));
        setReadDates(dates);
      }
      const uid = auth.currentUser?.uid;
      if (uid) autoSync(uid);
    } catch (e) {}
  };

  const isVerseRead = (chapter, verse) => !!readVerses[chapter + '_' + verse];

  const getChapterProgress = (chapterNum, totalVerses) => {
    let count = 0;
    Object.keys(readVerses).forEach((key) => { if (key.startsWith(chapterNum + '_')) count++; });
    return { read: count, total: totalVerses, percent: totalVerses > 0 ? Math.round((count / totalVerses) * 100) : 0 };
  };

  // Generate progress object for VerseLibraryScreen — memoized to avoid recomputing on every render
  const progress = useMemo(() => {
    const p = {};
    Object.keys(readVerses).forEach((key) => {
      const [chapter, verse] = key.split('_');
      if (!p[chapter]) p[chapter] = [];
      p[chapter].push(parseInt(verse));
    });
    return p;
  }, [readVerses]);

  const totalRead = useMemo(() => Object.keys(readVerses).length, [readVerses]);
  const totalPercent = useMemo(() => Math.round((totalRead / 700) * 100), [totalRead]);

  const streakWeek = useMemo(() => {
    const days = [];
    const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const today = new Date();
    const dayOfWeek = today.getDay();
    const sunday = new Date(today);
    sunday.setDate(today.getDate() - dayOfWeek);
    const todayStr = today.toISOString().split('T')[0];
    for (let i = 0; i < 7; i++) {
      const d = new Date(sunday);
      d.setDate(sunday.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const isActive = readDates.includes(dateStr) || dateStr === streak.lastDate;
      days.push({ label: dayNames[i], date: dateStr, active: isActive, isToday: dateStr === todayStr });
    }
    return days;
  }, [readDates, streak.lastDate]);

  const getStreakWeek = () => streakWeek;

  return (
    <TrackerContext.Provider value={{
      streak, totalRead, totalPercent, readVerses, readDates, progress,
      markVerseRead, isVerseRead, getChapterProgress, getStreakWeek, loaded,
    }}>
      {children}
    </TrackerContext.Provider>
  );
}

export function useTracker() {
  return useContext(TrackerContext);
}