// src/theme/JournalContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../utils/firebase';
import { autoSync, onSyncComplete } from '../utils/userDataSync';

const JournalContext = createContext();
const JOURNAL_KEY = '@gitasaar_journal';

export function JournalProvider({ children }) {
  const [entries, setEntries] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => { 
    loadEntries(); 
    
    // Naya data login ke baad aaye toh state update karo
    const unsubSync = onSyncComplete(() => {
      loadEntries();
    });

    // Logout par state clear kar do
    const unsubAuth = auth.onAuthStateChanged((user) => {
      if (!user) setEntries([]);
    });

    return () => { unsubSync(); unsubAuth(); };
  }, []);

  const loadEntries = async () => {
    try {
      const data = await AsyncStorage.getItem(JOURNAL_KEY);
      if (data) setEntries(JSON.parse(data));
      else setEntries([]);
    } catch (e) {}
    setLoaded(true);
  };

  const saveToStorage = async (updated) => {
    try { 
      await AsyncStorage.setItem(JOURNAL_KEY, JSON.stringify(updated)); 
      const uid = auth.currentUser?.uid;
      if (uid) autoSync(uid); // Cloud par bhejo
    } catch (e) {}
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