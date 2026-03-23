// src/theme/JournalContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const JournalContext = createContext();
const JOURNAL_KEY = '@gitasaar_journal';

export function JournalProvider({ children }) {
  const [entries, setEntries] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => { loadEntries(); }, []);

  const loadEntries = async () => {
    try {
      const data = await AsyncStorage.getItem(JOURNAL_KEY);
      if (data) setEntries(JSON.parse(data));
    } catch (e) {}
    setLoaded(true);
  };

  const saveToStorage = async (updated) => {
    try { await AsyncStorage.setItem(JOURNAL_KEY, JSON.stringify(updated)); } catch (e) {}
  };

  const addEntry = (text, mood) => {
    const entry = { id: Date.now().toString(), text, mood, date: new Date().toISOString() };
    const updated = [entry, ...entries];
    setEntries(updated);
    saveToStorage(updated);
    return entry;
  };

  const updateEntry = (id, text, mood) => {
    const updated = entries.map((e) => {
      if (e.id === id) return { ...e, text, mood, editedAt: new Date().toISOString() };
      return e;
    });
    setEntries(updated);
    saveToStorage(updated);
  };

  const deleteEntry = (id) => {
    const updated = entries.filter((e) => e.id !== id);
    setEntries(updated);
    saveToStorage(updated);
  };

  const entryCount = entries.length;

  return (
    <JournalContext.Provider value={{ entries, addEntry, updateEntry, deleteEntry, entryCount, loaded }}>
      {children}
    </JournalContext.Provider>
  );
}

export function useJournal() {
  return useContext(JournalContext);
}